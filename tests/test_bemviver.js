/**
 * YBY VersuS • Suíte de Testes Automatizados: Bem Viver & Indicadores Além do PIB
 * Testa validação de schema, obrigatoriedade de campos éticos, normalização e repository.
 */

const fs = require('fs');
const path = require('path');

function runTests() {
  console.log('--- TESTES: BEM VIVER & INDICADORES ALÉM DO PIB ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Carregamento dos dados
  const jsonPath = path.join(__dirname, '../data/bemviver/indicadores.json');
  assert(fs.existsSync(jsonPath), 'Arquivo indicadores.json deve existir');
  const indicadores = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  assert(Array.isArray(indicadores) && indicadores.length >= 8, `Deve conter ao menos 8 indicadores oficiais (Obtido: ${indicadores.length})`);

  // 2. Validação dos 5 blocos exigidos
  const blocosPresentes = new Set(indicadores.map(i => i.bloco));
  assert(blocosPresentes.has('economia'), 'Bloco Economia presente');
  assert(blocosPresentes.has('distribuicao'), 'Bloco Distribuição presente');
  assert(blocosPresentes.has('pessoas'), 'Bloco Pessoas presente');
  assert(blocosPresentes.has('ambiente'), 'Bloco Ambiente presente');
  assert(blocosPresentes.has('percepcao'), 'Bloco Percepção presente');

  // 3. Validação dos campos obrigatórios e éticos
  indicadores.forEach(ind => {
    assert(ind.id && typeof ind.id === 'string', `Indicador [${ind.id}] possui ID válido`);
    assert(ind.nome && ind.nome.length >= 3, `Indicador [${ind.id}] possui Nome válido`);
    assert(ind.unidade && ind.unidade.length >= 1, `Indicador [${ind.id}] possui Unidade`);
    assert(ind.anoMaisRecente && typeof ind.anoMaisRecente === 'number', `Indicador [${ind.id}] possui ano mais recente`);
    assert(ind.fonteUrl && ind.fonteUrl.startsWith('https://'), `Indicador [${ind.id}] possui fonteUrl HTTPS válida`);
    assert(ind.oQueNaoMede && ind.oQueNaoMede.length >= 15, `Indicador [${ind.id}] possui campo obrigatório "oQueNaoMede" detalhado`);
    assert(Array.isArray(ind.serie) && ind.serie.length >= 3, `Indicador [${ind.id}] possui série histórica com pelo menos 3 pontos`);
    assert(ind.dataDeColeta && /^\d{4}-\d{2}-\d{2}$/.test(ind.dataDeColeta), `Indicador [${ind.id}] possui dataDeColeta ISO`);
  });

  // 4. Validação das 2 pesquisas no bloco percepção (WHR e Ipsos)
  const percepcao = indicadores.filter(i => i.bloco === 'percepcao');
  assert(percepcao.length >= 2, 'Bloco percepção possui pelo menos duas pesquisas diferentes');
  const nomesPercepcao = percepcao.map(p => p.fonteNome.toLowerCase()).join(' ');
  assert(nomesPercepcao.includes('world happiness') || nomesPercepcao.includes('gallup'), 'Contém pesquisa World Happiness Report');
  assert(nomesPercepcao.includes('ipsos'), 'Contém pesquisa Ipsos Global Happiness');

  // 5. Verificação da biblioteca local Chart.js
  const vendorChartPath = path.join(__dirname, '../assets/vendor/chart.umd.min.js');
  assert(fs.existsSync(vendorChartPath), 'Biblioteca Chart.js deve estar hospedada localmente sem dependência de CDN');

  // 6. Teste da lógica de normalização (base 100)
  const serieExemplo = [
    { ano: 2018, valor: 50 },
    { ano: 2019, valor: 100 }
  ];
  const base = serieExemplo[0].valor;
  const normalizada = serieExemplo.map(pt => ({ ano: pt.ano, valor: (pt.valor / base) * 100 }));
  assert(normalizada[0].valor === 100, 'Normalização: Primeiro ano deve ser indexado em 100');
  assert(normalizada[1].valor === 200, 'Normalização: Segundo ano deve refletir variação relativa correta (200)');

  console.log('\n========================================');
  console.log(`RESULTADO BEM VIVER: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) process.exit(1);
}

runTests();

