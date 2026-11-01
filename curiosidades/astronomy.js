/**
 * Motor Astronômico Local do YBY versus
 * Cálculos 100% no navegador (sem chamadas a APIs externas).
 * Baseado em algoritmos de Jean Meeus e SunCalc (MIT).
 */

import { getSunTimes, getMoonIllumination, getMoonTimes } from './suncalc.js';

export function getMoonDetails(date = new Date()) {
  const illum = getMoonIllumination(date);
  const phase = illum.phase; // 0.0 a 1.0 (0: Nova, 0.25: Quarto Crescente, 0.5: Cheia, 0.75: Quarto Minguante)
  const fractionPercent = Math.round(illum.fraction * 100);

  let name = 'Lua Nova';
  let phaseKey = 'nova';
  let emoji = '🌑';

  if (phase >= 0.03 && phase < 0.22) {
    name = 'Lua Crescente';
    phaseKey = 'crescente_inicial';
    emoji = '🌒';
  } else if (phase >= 0.22 && phase <= 0.28) {
    name = 'Quarto Crescente';
    phaseKey = 'quarto_crescente';
    emoji = '🌓';
  } else if (phase > 0.28 && phase < 0.47) {
    name = 'Crescente Gibosa';
    phaseKey = 'crescente_gibosa';
    emoji = '🌔';
  } else if (phase >= 0.47 && phase <= 0.53) {
    name = 'Lua Cheia';
    phaseKey = 'cheia';
    emoji = '🌕';
  } else if (phase > 0.53 && phase < 0.72) {
    name = 'Minguante Gibosa';
    phaseKey = 'minguante_gibosa';
    emoji = '🌖';
  } else if (phase >= 0.72 && phase <= 0.78) {
    name = 'Quarto Minguante';
    phaseKey = 'quarto_minguante';
    emoji = '🌗';
  } else if (phase > 0.78 && phase < 0.97) {
    name = 'Lua Minguante';
    phaseKey = 'minguante_final';
    emoji = '🌘';
  }

  return {
    phase,
    fraction: illum.fraction,
    percentage: fractionPercent,
    name,
    phaseKey,
    emoji,
    angle: illum.angle
  };
}

/**
 * Calcula as próximas 4 fases principais da Lua a partir da data informada
 */
export function getNextMoonPhases(startDate = new Date()) {
  const phases = [];
  const targets = [
    { target: 0.0, name: 'Lua Nova', key: 'nova', emoji: '🌑' },
    { target: 0.25, name: 'Quarto Crescente', key: 'quarto_crescente', emoji: '🌓' },
    { target: 0.5, name: 'Lua Cheia', key: 'cheia', emoji: '🌕' },
    { target: 0.75, name: 'Quarto Minguante', key: 'quarto_minguante', emoji: '🌗' }
  ];

  // Busca nos próximos 35 dias com passo de 2 horas para encontrar os mínimos de distância
  let cursor = new Date(startDate.getTime());
  const maxSearchDays = 35;
  const stepMs = 2 * 60 * 60 * 1000;
  const endSearch = new Date(startDate.getTime() + maxSearchDays * 24 * 60 * 60 * 1000);

  let prevDiffs = targets.map(() => 999);
  let candidates = targets.map(() => null);

  while (cursor <= endSearch) {
    const p = getMoonIllumination(cursor).phase;

    targets.forEach((t, i) => {
      // Diferença circular
      let diff = Math.abs(p - t.target);
      if (diff > 0.5) diff = 1 - diff;

      if (diff < prevDiffs[i]) {
        prevDiffs[i] = diff;
        candidates[i] = new Date(cursor.getTime());
      }
    });

    cursor = new Date(cursor.getTime() + stepMs);
  }

  // Ordena cronologicamente
  const sorted = targets.map((t, idx) => ({
    name: t.name,
    key: t.key,
    emoji: t.emoji,
    date: candidates[idx]
  })).filter(item => item.date && item.date >= startDate)
    .sort((a, b) => a.date - b.date);

  return sorted.slice(0, 4);
}

/**
 * Nascer/Pôr do Sol, Meio-dia solar, Duração do Dia e Lua
 */
export function getCelestialEvents(date = new Date(), lat = -23.55, lon = -46.64) {
  const sunTimes = getSunTimes(date, lat, lon);
  const moonTimes = getMoonTimes(date, lat, lon);

  let dayLengthMs = 0;
  if (sunTimes.sunrise && sunTimes.sunset) {
    dayLengthMs = Math.max(0, sunTimes.sunset.getTime() - sunTimes.sunrise.getTime());
  }
  const dayHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
  const dayMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    solarNoon: sunTimes.solarNoon,
    dawn: sunTimes.dawn,
    dusk: sunTimes.dusk,
    dayLength: {
      hours: dayHours,
      minutes: dayMinutes,
      formatted: `${dayHours}h ${dayMinutes.toString().padStart(2, '0')}min`
    },
    moonrise: moonTimes.rise,
    moonset: moonTimes.set
  };
}

/**
 * Equinócios e Solstícios para o ano (Jean Meeus / Astronomical Algorithms)
 */
export function getSolsticesAndEquinoxes(year = new Date().getFullYear()) {
  const Y = (year - 2000) / 1000;

  // Dias Julianos aproximados (Jean Meeus, cap. 27)
  const JDeqMarch = 2451623.80984 + 365242.37404 * Y + 0.05169 * Y*Y - 0.00411 * Y*Y*Y - 0.00057 * Y*Y*Y*Y;
  const JDsolJune = 2451716.56767 + 365241.62603 * Y + 0.00325 * Y*Y + 0.00888 * Y*Y*Y - 0.00030 * Y*Y*Y*Y;
  const JDeqSept  = 2451810.21715 + 365242.01767 * Y - 0.11575 * Y*Y + 0.00337 * Y*Y*Y + 0.00078 * Y*Y*Y*Y;
  const JDsolDec  = 2451900.05952 + 365242.74049 * Y - 0.06223 * Y*Y - 0.00823 * Y*Y*Y + 0.00032 * Y*Y*Y*Y;

  function jdToDate(jd) {
    const J1970 = 2440588;
    return new Date((jd - J1970) * 86400000);
  }

  return [
    {
      name: 'Equinócio de Março',
      hemisphereSouth: 'Início do Outono',
      hemisphereNorth: 'Início da Primavera',
      date: jdToDate(JDeqMarch),
      icon: 'leaf'
    },
    {
      name: 'Solstício de Junho',
      hemisphereSouth: 'Início do Inverno (Dia mais curto do ano)',
      hemisphereNorth: 'Início do Verão (Dia mais longo)',
      date: jdToDate(JDsolJune),
      icon: 'snowflake'
    },
    {
      name: 'Equinócio de Setembro',
      hemisphereSouth: 'Início da Primavera',
      hemisphereNorth: 'Início do Outono',
      date: jdToDate(JDeqSept),
      icon: 'flower-2'
    },
    {
      name: 'Solstício de Dezembro',
      hemisphereSouth: 'Início do Verão (Dia mais longo do ano)',
      hemisphereNorth: 'Início do Inverno (Dia mais curto)',
      date: jdToDate(JDsolDec),
      icon: 'sun'
    }
  ];
}

