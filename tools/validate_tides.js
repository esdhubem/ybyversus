/**
 * Validador de Arquivos JSON de Tábuas de Marés da Marinha do Brasil
 * Execução: node tools/validate_tides.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const maresDir = path.join(__dirname, '..', 'data', 'mares');

function validatePortoFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\nValidando: ${fileName}...`);

  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Erro de sintaxe JSON em ${fileName}:`, err.message);
    return false;
  }

  // Validação de campos obrigatórios
  const required = ['portoId', 'nomePorto', 'estado', 'lat', 'lon', 'fusoHorario', 'fonte', 'ano', 'dias'];
  for (const field of required) {
    if (data[field] === undefined) {
      console.error(`❌ Campo obrigatório ausente: '${field}'`);
      return false;
    }
  }

  if (typeof data.lat !== 'number' || typeof data.lon !== 'number') {
    console.error(`❌ Coordenadas lat/lon devem ser números.`);
    return false;
  }

  if (typeof data.dias !== 'object' || Object.keys(data.dias).length === 0) {
    console.error(`❌ Objeto 'dias' vazio ou inválido.`);
    return false;
  }

  // Valida cada dia e suas medições
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  let totalEntries = 0;
  for (const [dateStr, entries] of Object.entries(data.dias)) {
    if (!dateRegex.test(dateStr)) {
      console.error(`❌ Data '${dateStr}' fora do formato ISO YYYY-MM-DD.`);
      return false;
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      console.error(`❌ Dia '${dateStr}' deve conter array de medições.`);
      return false;
    }

    for (const item of entries) {
      if (!timeRegex.test(item.hora)) {
        console.error(`❌ Hora '${item.hora}' inválida no dia ${dateStr} (esperado HH:MM).`);
        return false;
      }

      if (typeof item.altura !== 'number' || isNaN(item.altura) || item.altura < -2 || item.altura > 15) {
        console.error(`❌ Altura '${item.altura}' inválida ou fora da faixa física.`);
        return false;
      }

      if (item.tipo !== 'preamar' && item.tipo !== 'baixa-mar') {
        console.error(`❌ Tipo de maré '${item.tipo}' inválido (esperado 'preamar' ou 'baixa-mar').`);
        return false;
      }
      totalEntries++;
    }
  }

  console.log(`✅ ${fileName} validado com sucesso! (${totalEntries} medições verificadas)`);
  return true;
}

if (!fs.existsSync(maresDir)) {
  console.error('Diretório data/mares não encontrado.');
  process.exit(1);
}

const files = fs.readdirSync(maresDir).filter(f => f.endsWith('.json'));
let allValid = true;

for (const file of files) {
  const ok = validatePortoFile(path.join(maresDir, file));
  if (!ok) allValid = false;
}

if (allValid) {
  console.log('\n🎉 TODOS OS ARQUIVOS DE MARÉS FORAM VALIDADOS COM SUCESSO!\n');
} else {
  console.error('\n❌ Existem erros nos arquivos de marés.\n');
  process.exit(1);
}

