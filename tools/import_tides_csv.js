/**
 * Utilitário de Importação: CSV da Tábua de Marés (Marinha do Brasil) -> JSON
 * Uso: node tools/import_tides_csv.js <caminho-arquivo.csv> <id-porto> <nome-porto> <uf> <lat> <lon>
 *
 * Exemplo de formato CSV esperado (separado por vírgula ou ponto-e-vírgula):
 * Data,Hora,Altura,Tipo
 * 2026-10-31,03:45,1.2,preamar
 * 2026-10-31,09:55,0.3,baixa-mar
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 6) {
  console.log(`
Uso: node tools/import_tides_csv.js <arquivo.csv> <id-porto> <nome-porto> <uf> <lat> <lon>
Exemplo:
node tools/import_tides_csv.js marinha_salvador.csv porto-de-salvador "Porto de Salvador" BA -12.97 -38.51
`);
  process.exit(0);
}

const [csvPath, portoId, nomePorto, estado, latStr, lonStr] = args;

if (!fs.existsSync(csvPath)) {
  console.error(`Arquivo CSV '${csvPath}' não encontrado.`);
  process.exit(1);
}

const rawCsv = fs.readFileSync(csvPath, 'utf8');
const lines = rawCsv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const dias = {};

// Processa linhas ignorando cabeçalho
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = line.includes(';') ? line.split(';') : line.split(',');
  if (parts.length < 4) continue;

  const [date, hora, alturaStr, tipoStr] = parts.map(p => p.trim());
  const altura = parseFloat(alturaStr.replace(',', '.'));
  const tipo = tipoStr.toLowerCase().includes('pre') ? 'preamar' : 'baixa-mar';

  if (!dias[date]) dias[date] = [];
  dias[date].push({ hora, altura, tipo });
}

const result = {
  portoId,
  nomePorto,
  estado,
  lat: parseFloat(latStr),
  lon: parseFloat(lonStr),
  fusoHorario: 'America/Sao_Paulo',
  horarioVerao: false,
  fonte: 'Marinha do Brasil - Centro de Hidrografia da Marinha (CHM/DHN)',
  ano: parseInt(Object.keys(dias)[0]?.split('-')[0]) || 2026,
  aviso: 'Dados de tábuas oficiais para fins exclusivamente educativos e informativos.',
  dias
};

const outPath = path.join('data', 'mares', `${portoId}.json`);
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.log(`✅ Sucesso! Arquivo gerado em: ${outPath} (${Object.keys(dias).length} dias importados)`);

