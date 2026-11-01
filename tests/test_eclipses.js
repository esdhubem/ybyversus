import { ECLIPSES_CATALOG, getUpcomingEclipses } from '../curiosidades/eclipses.js';

console.log('--- TESTES: CATÁLOGO DE ECLIPSES ---');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

// 1. Catálogo não vazio
assert(Array.isArray(ECLIPSES_CATALOG) && ECLIPSES_CATALOG.length >= 6, 'Catálogo deve ter ao menos 6 eclipses catalogados');

// 2. Todos os eclipses possuem campos obrigatórios
ECLIPSES_CATALOG.forEach((ecl, i) => {
  const hasFields = ecl.id && ecl.tipo && ecl.titulo && ecl.dataIso && ecl.visibilidadeBrasil && ecl.visibilidadeLabel;
  assert(hasFields, `Eclipse #${i+1} (${ecl.titulo}) possui todos os campos obrigatórios`);
  
  const validDate = !isNaN(new Date(ecl.dataIso).getTime());
  assert(validDate, `Data ISO de #${ecl.id} é válida`);

  assert(['total', 'parcial', 'nao'].includes(ecl.visibilidadeBrasil), `Visibilidade de #${ecl.id} é 'total', 'parcial' ou 'nao'`);
});

// 3. getUpcomingEclipses limita corretamente
const upcoming = getUpcomingEclipses(4);
assert(upcoming.length === 4, 'getUpcomingEclipses(4) deve retornar 4 registros');

console.log(`\n========================================`);
console.log(`RESULTADO ECLIPSES: ${passed} passaram, ${failed} falharam.`);

if (failed > 0) process.exit(1);
