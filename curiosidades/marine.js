/**
 * Módulo Mar & Marés (Fase 2)
 * - Ondas e ondulação via Open-Meteo Marine API (CC BY 4.0)
 * - Tábuas de Marés da Marinha do Brasil (DHN/CHM) em JSON local
 * - Gráfico de 24h e explicação de Sizígia/Quadratura
 * - Aviso obrigatório de segurança náutica e costeira
 */

import { roundCoord, getCachedData, setCachedData } from './storage.js';

export const PORTO_DATABASE = [
  { id: 'porto-do-rio-de-janeiro', name: 'Porto do Rio de Janeiro', uf: 'RJ', lat: -22.90, lon: -43.13 },
  { id: 'porto-de-santos', name: 'Porto de Santos', uf: 'SP', lat: -23.95, lon: -46.33 }
];

export function findNearestPort(lat, lon, maxDistanceKm = 120) {
  let closest = null;
  let minD = Infinity;

  for (const p of PORTO_DATABASE) {
    const d = calculateDistanceKm(lat, lon, p.lat, p.lon);
    if (d < minD && d <= maxDistanceKm) {
      minD = d;
      closest = { ...p, distanceKm: Math.round(d) };
    }
  }
  return closest;
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Consulta a Open-Meteo Marine API para ondas e ondulação
 */
export async function fetchMarineData(lat, lon) {
  const rLat = roundCoord(lat);
  const rLon = roundCoord(lon);
  const cacheKey = `marine_${rLat}_${rLon}`;

  const cached = getCachedData(cacheKey);
  if (cached && !cached.isExpired) {
    return cached.data;
  }

  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${rLat}&longitude=${rLon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,wave_direction,wave_period&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Localidade no interior do continente retorna 400 da API de marinha
      return { isCoast: false, error: 'interior' };
    }
    const data = await res.json();
    if (!data.current || data.current.wave_height === null) {
      return { isCoast: false, error: 'sem_dados_maritimos' };
    }

    const normalized = {
      isCoast: true,
      current: {
        waveHeight: data.current.wave_height !== null ? Math.round(data.current.wave_height * 10) / 10 : null,
        waveDirection: data.current.wave_direction,
        wavePeriod: data.current.wave_period !== null ? Math.round(data.current.wave_period) : null,
        swellHeight: data.current.swell_wave_height !== null ? Math.round(data.current.swell_wave_height * 10) / 10 : null,
        swellDirection: data.current.swell_wave_direction,
        swellPeriod: data.current.swell_wave_period !== null ? Math.round(data.current.swell_wave_period) : null
      },
      hourly: (data.hourly.time || []).slice(0, 12).map((timeStr, idx) => ({
        time: timeStr,
        height: data.hourly.wave_height[idx] !== null ? Math.round(data.hourly.wave_height[idx] * 10) / 10 : 0,
        direction: data.hourly.wave_direction[idx],
        period: data.hourly.wave_period[idx]
      }))
    };

    setCachedData(cacheKey, normalized, 45);
    return normalized;
  } catch (err) {
    console.warn('[YBY Marine] Erro ao buscar dados marítimos:', err);
    return { isCoast: false, error: 'falha_conexao' };
  }
}

/**
 * Carrega a tábua de marés oficial local por porto (/data/mares/<porto>.json)
 */
export async function fetchTideData(portoId, targetDate = new Date()) {
  if (!portoId) {
    return { hasData: false, message: 'dados ainda não disponíveis para este porto' };
  }

  const jsonUrl = `data/mares/${portoId}.json`;
  try {
    const res = await fetch(jsonUrl);
    if (!res.ok) {
      return { hasData: false, message: 'dados ainda não disponíveis para este porto' };
    }
    const portoData = await res.json();

    const dateStr = targetDate.toISOString().slice(0, 10);
    const dayEntries = portoData.dias ? portoData.dias[dateStr] : null;

    if (!dayEntries || dayEntries.length === 0) {
      return { 
        hasData: false, 
        portoNome: portoData.nomePorto,
        message: 'dados ainda não disponíveis para este porto' 
      };
    }

    return {
      hasData: true,
      portoId: portoData.portoId,
      nomePorto: portoData.nomePorto,
      estado: portoData.estado,
      fonte: portoData.fonte,
      dataConsulta: dateStr,
      medicoes: dayEntries
    };
  } catch (err) {
    console.warn('[YBY Tides] Erro ao carregar marés locais:', err);
    return { hasData: false, message: 'dados ainda não disponíveis para este porto' };
  }
}

/**
 * Renderiza gráfico vetorial de 24h da maré com curva suave e pontos de preamar/baixa-mar
 */
export function renderTideChartSvg(medicoes) {
  if (!medicoes || medicoes.length === 0) return '';

  // Converte medições para minutos do dia (0 a 1440)
  const points = medicoes.map(m => {
    const [hh, mm] = m.hora.split(':').map(Number);
    return {
      minutes: hh * 60 + mm,
      hora: m.hora,
      altura: m.altura,
      tipo: m.tipo
    };
  }).sort((a, b) => a.minutes - b.minutes);

  // Escala SVG: ViewBox 0 0 320 120
  const width = 320;
  const height = 120;
  const paddingX = 25;
  const paddingY = 20;

  const minAlt = Math.min(...points.map(p => p.altura)) - 0.2;
  const maxAlt = Math.max(...points.map(p => p.altura)) + 0.2;

  function toSvgX(min) {
    return paddingX + (min / 1440) * (width - 2 * paddingX);
  }

  function toSvgY(alt) {
    const norm = (alt - minAlt) / (maxAlt - minAlt || 1);
    return height - paddingY - norm * (height - 2 * paddingY);
  }

  // Gera linha interpolada cúbica simples
  let pathD = `M ${toSvgX(points[0].minutes)} ${toSvgY(points[0].altura)}`;
  for (let i = 1; i < points.length; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const x0 = toSvgX(pPrev.minutes);
    const y0 = toSvgY(pPrev.altura);
    const x1 = toSvgX(pCurr.minutes);
    const y1 = toSvgY(pCurr.altura);
    const cpX = (x0 + x1) / 2;
    pathD += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
  }

  // Pontos demarcados
  const dots = points.map(p => {
    const cx = toSvgX(p.minutes);
    const cy = toSvgY(p.altura);
    const isHigh = p.tipo === 'preamar';
    const color = isHigh ? '#E5C384' : '#1E9E64';
    const labelY = isHigh ? cy - 8 : cy + 14;

    return `
      <g>
        <circle cx="${cx}" cy="${cy}" r="4.5" fill="${color}" stroke="#06120C" stroke-width="2"/>
        <text x="${cx}" y="${labelY}" fill="#FFF6E5" font-size="8.5" font-weight="bold" text-anchor="middle">
          ${p.altura}m (${p.hora})
        </text>
      </g>
    `;
  }).join('');

  return `
    <div class="space-y-1">
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none rounded-xl bg-[#06120C] border border-[#163524] p-1" role="img" aria-label="Gráfico de marés de 24 horas">
        <!-- Linhas de grade e horas de referência -->
        <line x1="${toSvgX(0)}" y1="${height - paddingY}" x2="${toSvgX(1440)}" y2="${height - paddingY}" stroke="#163524" stroke-width="1"/>
        <line x1="${toSvgX(360)}" y1="10" x2="${toSvgX(360)}" y2="${height - paddingY}" stroke="#163524" stroke-dasharray="2 3"/>
        <line x1="${toSvgX(720)}" y1="10" x2="${toSvgX(720)}" y2="${height - paddingY}" stroke="#163524" stroke-dasharray="2 3"/>
        <line x1="${toSvgX(1080)}" y1="10" x2="${toSvgX(1080)}" y2="${height - paddingY}" stroke="#163524" stroke-dasharray="2 3"/>

        <!-- Textos de hora -->
        <text x="${toSvgX(0)}" y="${height - 5}" fill="#64748B" font-size="7.5">00h</text>
        <text x="${toSvgX(360)}" y="${height - 5}" fill="#64748B" font-size="7.5" text-anchor="middle">06h</text>
        <text x="${toSvgX(720)}" y="${height - 5}" fill="#64748B" font-size="7.5" text-anchor="middle">12h</text>
        <text x="${toSvgX(1080)}" y="${height - 5}" fill="#64748B" font-size="7.5" text-anchor="middle">18h</text>
        <text x="${toSvgX(1440)}" y="${height - 5}" fill="#64748B" font-size="7.5" text-anchor="end">24h</text>

        <!-- Curva da maré -->
        <path d="${pathD}" fill="none" stroke="#2DC47F" stroke-width="2.5" stroke-linecap="round"/>
        ${dots}
      </svg>

      <!-- Tabela Acessível para Leitores de Tela -->
      <table class="sr-only">
        <caption>Tabela de marés do dia com horários e alturas</caption>
        <thead><tr><th>Hora</th><th>Tipo</th><th>Altura (metros)</th></tr></thead>
        <tbody>
          ${points.map(p => `<tr><td>${p.hora}</td><td>${p.tipo}</td><td>${p.altura} m</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}
