/**
 * Testes Unitários: Cálculos Astronômicos Locais
 * Validação com datas e eventos de referência astronômica conhecidos.
 */

import { getMoonDetails, getCelestialEvents, getSolsticesAndEquinoxes, getNextMoonPhases } from '../curiosidades/astronomy.js';

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

console.log('--- TESTES: FASES DA LUA EM DATAS CONHECIDAS ---');

// 1. Lua Cheia de 25 de Março de 2024
const fullMoonDate = new Date('2024-03-25T07:00:00Z');
const fullMoon = getMoonDetails(fullMoonDate);
assert(fullMoon.percentage >= 97, `Lua em 25/03/2024 deve ter iluminação >= 97% (Obtido: ${fullMoon.percentage}%, Fase: ${fullMoon.name})`);
assert(fullMoon.phaseKey === 'cheia', `Fase em 25/03/2024 deve ser cheia (Obtido: ${fullMoon.phaseKey})`);

// 2. Lua Nova de 8 de Abril de 2024
const newMoonDate = new Date('2024-04-08T18:20:00Z');
const newMoon = getMoonDetails(newMoonDate);
assert(newMoon.percentage <= 4, `Lua em 08/04/2024 deve ter iluminação <= 4% (Obtido: ${newMoon.percentage}%, Fase: ${newMoon.name})`);
assert(newMoon.phaseKey === 'nova', `Fase em 08/04/2024 deve ser nova (Obtido: ${newMoon.phaseKey})`);

console.log('\n--- TESTES: PRÓXIMAS 4 FASES ---');
const nextPhases = getNextMoonPhases(new Date('2024-01-01T00:00:00Z'));
assert(nextPhases.length === 4, `Deve retornar exatamente 4 próximas fases principais (Obtido: ${nextPhases.length})`);
assert(nextPhases[0].date instanceof Date, 'Datas das próximas fases devem ser instâncias válidas de Date');

console.log('\n--- TESTES: NASCER E PÔR DO SOL EM SÃO PAULO (-23.55, -46.64) ---');
const spDate = new Date('2024-06-21T12:00:00Z'); // Solstício de Inverno em SP
const spEvents = getCelestialEvents(spDate, -23.55, -46.64);
assert(spEvents.sunrise instanceof Date && !isNaN(spEvents.sunrise.getTime()), 'Nascer do sol em SP deve ser data válida');
assert(spEvents.sunset instanceof Date && !isNaN(spEvents.sunset.getTime()), 'Pôr do sol em SP deve ser data válida');
assert(spEvents.dayLength.hours >= 10 && spEvents.dayLength.hours <= 11, `Duração do dia no solstício de inverno em SP deve ser entre 10h e 11h (Obtido: ${spEvents.dayLength.formatted})`);

console.log('\n--- TESTES: EQUINÓCIOS E SOLSTÍCIOS DE 2026 ---');
const seasons2026 = getSolsticesAndEquinoxes(2026);
assert(seasons2026.length === 4, 'Deve retornar 4 eventos sazonais no ano');

// Março ~ 20/03
const marchEquinox = seasons2026[0];
assert(marchEquinox.date.getUTCMonth() === 2 && Math.abs(marchEquinox.date.getUTCDate() - 20) <= 1, `Equinócio de Março 2026 deve ser por volta de 20 de março (Obtido: ${marchEquinox.date.toISOString()})`);

// Junho ~ 21/06
const juneSolstice = seasons2026[1];
assert(juneSolstice.date.getUTCMonth() === 5 && Math.abs(juneSolstice.date.getUTCDate() - 21) <= 1, `Solstício de Junho 2026 deve ser por volta de 21 de junho (Obtido: ${juneSolstice.date.toISOString()})`);

console.log('\n--- TESTES: MINI ATLAS DO SISTEMA SOLAR ---');
const { calculatePlanetAngles, calculateEarthDistances, calculateMoonOrbit, PLANETS_DATA } = await import('../curiosidades/solar_system.js');

const planetsAngles = calculatePlanetAngles(new Date());
assert(planetsAngles.length === 8, `Deve calcular ângulos para os 8 planetas (Obtido: ${planetsAngles.length})`);

const earthDist = calculateEarthDistances(planetsAngles);
assert(earthDist.venus > 0.25 && earthDist.venus < 1.75, `Distância de Vênus à Terra deve estar entre 0.25 e 1.75 UA (Obtido: ${earthDist.venus} UA)`);
assert(earthDist.marte > 0.35 && earthDist.marte < 2.65, `Distância de Marte à Terra deve estar entre 0.35 e 2.65 UA (Obtido: ${earthDist.marte} UA)`);
assert(earthDist.jupiter > 3.9 && earthDist.jupiter < 6.5, `Distância de Júpiter à Terra deve estar entre 3.9 e 6.5 UA (Obtido: ${earthDist.jupiter} UA)`);

const moonOrbit = calculateMoonOrbit(new Date());
assert(moonOrbit.angle >= 0 && moonOrbit.angle <= 2 * Math.PI, `Ângulo da Lua deve estar no intervalo [0, 2π] (Obtido: ${moonOrbit.angle})`);
assert(moonOrbit.name === 'Lua' && moonOrbit.distKm === 384400, 'Lua possui parâmetros corretos');

console.log(`\n========================================`);
console.log(`RESULTADO FINAL: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) process.exit(1);

