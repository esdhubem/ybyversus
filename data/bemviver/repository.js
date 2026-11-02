/**
 * YBY VersuS • Camada de Acesso a Dados (Repository Pattern)
 * Abstração de acesso aos dados de indicadores de Bem Viver.
 * Permite leitura dos snapshots locais em JSON e futura substituição transparente por API/banco de dados.
 */

export class IndicadoresRepository {
  constructor(options = {}) {
    this.dataSourceUrl = options.dataSourceUrl || './data/bemviver/indicadores.json';
    this._cachedData = null;
  }

  /**
   * Carrega os indicadores da fonte de dados (JSON local ou API remota)
   * @returns {Promise<Array>} Lista de indicadores
   */
  async getAll() {
    if (this._cachedData) {
      return this._cachedData;
    }

    try {
      const response = await fetch(this.dataSourceUrl);
      if (!response.ok) {
        throw new Error(`Falha HTTP ao carregar indicadores: ${response.status}`);
      }
      const data = await response.json();
      this._validateBasic(data);
      this._cachedData = data;
      return data;
    } catch (err) {
      console.error('[IndicadoresRepository] Erro ao carregar dados:', err);
      throw err;
    }
  }

  /**
   * Busca indicador por ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    const list = await this.getAll();
    return list.find(item => item.id === id) || null;
  }

  /**
   * Busca indicadores filtrados por bloco temático
   * @param {string} bloco 'economia' | 'distribuicao' | 'pessoas' | 'ambiente' | 'percepcao'
   * @returns {Promise<Array>}
   */
  async getByBloco(bloco) {
    const list = await this.getAll();
    if (!bloco || bloco === 'todos') return list;
    return list.filter(item => item.bloco === bloco);
  }

  /**
   * Retorna os indicadores com a série filtrada por intervalo de anos
   * @param {number} anoInicio 
   * @param {number} anoFim 
   * @param {boolean} normalizar Se true, define ano base = 100
   * @returns {Promise<Array>}
   */
  async getFilteredSeries(anoInicio, anoFim, normalizar = false) {
    const list = await this.getAll();

    return list.map(item => {
      // Filtra pares ano/valor pelo intervalo especificado
      let filteredSerie = item.serie.filter(pt => {
        const anoValido = (!anoInicio || pt.ano >= anoInicio) && (!anoFim || pt.ano <= anoFim);
        return anoValido && pt.valor !== null && !isNaN(pt.valor);
      });

      if (normalizar && filteredSerie.length > 0) {
        const baseValor = filteredSerie[0].valor;
        if (baseValor !== 0 && baseValor !== null) {
          filteredSerie = filteredSerie.map(pt => ({
            ano: pt.ano,
            valorOriginal: pt.valor,
            valor: Number(((pt.valor / baseValor) * 100).toFixed(2))
          }));
        }
      }

      return {
        ...item,
        serieFiltrada: filteredSerie
      };
    });
  }

  /**
   * Validação defensiva básica dos dados carregados
   */
  _validateBasic(data) {
    if (!Array.isArray(data)) {
      throw new Error('A fonte de indicadores deve ser um Array.');
    }
    data.forEach((item, idx) => {
      if (!item.id || !item.nome || !item.unidade || !item.oQueNaoMede || !item.fonteUrl) {
        throw new Error(`Indicador no índice ${idx} viola os campos obrigatórios mínimos.`);
      }
    });
  }
}

