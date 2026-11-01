# 🌌 Curiosidades: Céu, Mar e Tempo • YBY versus

Guia técnico, documentação das fontes científicas, limites de uso das APIs e instruções para manutenção de marés e corpos celestes.

---

## 1. Fontes de Dados e Licenças

| Módulo | Fonte Oficial | Licença / Termos | Tipo de Consulta |
| :--- | :--- | :--- | :--- |
| **Céu de Hoje & Fases da Lua** | Algoritmos de Jean Meeus e Vladimir Agafonkin (SunCalc) | **Licença MIT** | **100% Local no Navegador** (sem requisições externas) |
| **Solstícios e Equinócios** | *Astronomical Algorithms* (Jean Meeus) | Domínio público / Uso livre | **100% Local no Navegador** |
| **Clima, UV e Vento** | [Open-Meteo Weather API](https://open-meteo.com/) | **CC BY 4.0** | Gratuito, sem chave, uso não comercial |
| **Ondas e Ondulação (Swell)** | [Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api) | **CC BY 4.0** | Gratuito, sem chave, uso não comercial |
| **Busca de Cidades** | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | **CC BY 4.0** | Gratuito, sem chave |
| **Tábuas de Marés do Brasil** | Marinha do Brasil — Centro de Hidrografia da Marinha (CHM/DHN) | Dados Públicos Oficiais do Brasil | Arquivos JSON locais em `/data/mares/<porto>.json` |
| **Tempo Lunar Coordenado (LTC)** | NASA, NIST e White House OSTP (2024) | Informação Pública Oficial Científica | Conteúdo educativo verificado com fontes citadas |

---

## 2. Limites de Uso e Boas Práticas das APIs (Uso Justo)

* **Sem Polling Agressivo:** As chamadas para Open-Meteo Weather e Marine são cacheadas localmente no navegador (`localStorage`) por **45 minutos** (dentro da faixa de 30 a 60 min).
* **Fallback Offline:** Se o usuário estiver sem internet, o sistema carrega os últimos dados salvos informando: `Dados em cache de [horário]`.
* **Privacidade Absoluta:**
  * As coordenadas de latitude e longitude são **arredondadas para 2 casas decimais** antes de qualquer requisição.
  * O GPS só é ativado com clique deliberado do usuário em *"Usar minha localização atual"*.
  * Nenhum dado de geolocalização é armazenado em servidor externo.

---

## 3. Como Atualizar ou Adicionar um Novo Porto de Maré

As tábuas de marés da Marinha do Brasil não possuem API aberta pública contínua confirmada. Por isso, utilizamos arquivos JSON locais rigorosos em `data/mares/<porto-id>.json`.

### Passo a passo para adicionar um novo porto:

1. **Obter os dados oficiais:**
   Acesse a [Tábua de Marés Oficial da Marinha do Brasil (DHN/CHM)](https://www.marinha.mil.br/chm/tabuas-de-mare) e baixe a planilha ou texto oficial do porto desejado (ex.: Porto de Salvador).

2. **Formatar um arquivo CSV temporário (`meu_porto.csv`):**
   ```csv
   Data,Hora,Altura,Tipo
   2026-10-31,03:10,1.4,preamar
   2026-10-31,09:25,0.4,baixa-mar
   2026-10-31,15:35,1.5,preamar
   2026-10-31,21:50,0.5,baixa-mar
   ```

3. **Executar o script de importação automatizado:**
   ```bash
   node tools/import_tides_csv.js meu_porto.csv porto-de-salvador "Porto de Salvador" BA -12.97 -38.51
   ```

4. **Validar a integridade do JSON:**
   ```bash
   node tools/validate_tides.js
   ```

5. **Registrar no banco de portos:**
   No arquivo `curiosidades/marine.js`, adicione o porto ao array `PORTO_DATABASE`:
   ```javascript
   { id: 'porto-de-salvador', name: 'Porto de Salvador', uf: 'BA', lat: -12.97, lon: -38.51 }
   ```

> **Atenção:** Nunca invente valores de maré. Se o porto não tiver dados cadastrados para a data atual, o sistema exibirá automaticamente a mensagem oficial: `"dados ainda não disponíveis para este porto"`.

---

## 4. Testes Automatizados

Para rodar os testes unitários de cálculo astronômico (fases da Lua, equinócios, solstícios e eventos solares):
```bash
node tests/test_astronomy.js
```

Para validar a integridade de todos os arquivos de tábuas de maré:
```bash
node tools/validate_tides.js
```

---

## 5. Checklist de Qualidade, Acessibilidade e Segurança

- [x] **Acessibilidade WCAG AA:** Contraste mínimo 4.5:1, alvos de toque com no mínimo 44 px de altura/largura, anéis de foco visíveis (`focus-visible`).
- [x] **Sem Bloqueio de Zoom:** Viewport com zoom nativo liberado para pessoas com baixa visão.
- [x] **Leitores de Tela:** Gráficos de marés e previsões horárias acompanhados de tabelas textuais acessíveis (`<table class="sr-only">`).
- [x] **Privacidade:** Coordenadas com precisão reduzida (2 casas decimais), sem cookies, sem rastreadores, 100% estático.
- [x] **Aviso Fixo de Segurança:** Alerta visível na seção costeira orientando a consulta aos órgãos oficiais (Marinha do Brasil, Defesa Civil, INMET).
- [x] **Atribuição Visível:** Créditos a Open-Meteo (CC BY 4.0) e Marinha do Brasil (DHN/CHM) fixados no rodapé da página.
