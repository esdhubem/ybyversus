/**
 * Componentes de Interface & Acessibilidade
 * - WCAG AA, alvos ≥ 44px, foco visível, leitores de tela
 * - Renderização da Lua em SVG, Rosa dos Ventos e Gráficos Acessíveis
 */

import { convertWindSpeed } from './weather.js';

export function renderMoonSvg(moon) {
  const p = moon.phase; // 0.0 a 1.0
  const isWaxing = p < 0.5; // Crescente
  
  // No Hemisfério Sul, a Lua Crescente tem aspecto de 'C' (lado esquerdo iluminado)
  // e a Minguante tem aspecto de 'D' (lado direito iluminado)
  const r = 36;
  const cx = 48;
  const cy = 48;

  // Calculamos a largura da elipse de transição da sombra (-r a +r)
  // cos(2 * PI * p): varia de 1 (nova) -> 0 (quarto) -> -1 (cheia) -> 0 -> 1
  const k = Math.cos(2 * Math.PI * p);
  const rx = Math.abs(r * k);

  let pathData = '';

  if (p <= 0.02 || p >= 0.98) {
    // Nova: disco escuro
    pathData = '';
  } else if (p >= 0.48 && p <= 0.52) {
    // Cheia: círculo completo
    pathData = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  } else {
    // Crescente ou Minguante
    // Arco do semi-círculo iluminado + Arco elíptico da linha do terminador
    const sweep1 = isWaxing ? 0 : 1;
    const sweep2 = k > 0 ? (isWaxing ? 1 : 0) : (isWaxing ? 0 : 1);

    pathData = `
      M ${cx} ${cy - r}
      A ${r} ${r} 0 0 ${sweep1} ${cx} ${cy + r}
      A ${rx} ${r} 0 0 ${sweep2} ${cx} ${cy - r}
      Z
    `;
  }

  return `
    <svg viewBox="0 0 96 96" class="w-20 h-20 filter drop-shadow-[0_0_12px_rgba(229,195,132,0.4)]" aria-label="Fase atual da Lua: ${moon.name}, ${moon.percentage}% iluminada" role="img">
      <!-- Fundo do disco lunar não iluminado (cinza escuro texturizado) -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0A1610" stroke="rgba(229, 195, 132, 0.35)" stroke-width="1.5"/>
      <circle cx="${cx - 8}" cy="${cy - 6}" r="6" fill="#030A17" opacity="0.4"/>
      <circle cx="${cx + 12}" cy="${cy + 8}" r="8" fill="#030A17" opacity="0.3"/>
      <circle cx="${cx - 4}" cy="${cy + 14}" r="5" fill="#030A17" opacity="0.35"/>
      
      <!-- Porção Iluminada (dourado luminoso lunar) -->
      ${pathData ? `<path d="${pathData}" fill="#FFF4D4" filter="drop-shadow(0 0 6px rgba(255,244,212,0.6))"/>` : ''}
    </svg>
  `;
}

export function renderCompassSvg(degrees, speedStr) {
  const deg = Number(degrees) || 0;
  return `
    <div class="relative w-28 h-28 flex items-center justify-center select-none" role="img" aria-label="Rosa dos ventos indicando direção de ${deg} graus, velocidade ${speedStr}">
      <!-- Mostrador circular da Rosa dos Ventos -->
      <svg viewBox="0 0 120 120" class="w-full h-full">
        <!-- Anel externo -->
        <circle cx="60" cy="60" r="54" fill="#040E1E" stroke="#132B4F" stroke-width="2"/>
        <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(229, 195, 132, 0.2)" stroke-dasharray="2 3"/>

        <!-- Pontos Cardeais: N, L, S, O (Oeste em português do Brasil) -->
        <text x="60" y="18" fill="#E5C384" font-size="10" font-weight="bold" text-anchor="middle">N</text>
        <text x="104" y="63" fill="#94B8DB" font-size="9" font-weight="600" text-anchor="middle">L</text>
        <text x="60" y="110" fill="#94B8DB" font-size="9" font-weight="600" text-anchor="middle">S</text>
        <text x="16" y="63" fill="#94B8DB" font-size="9" font-weight="600" text-anchor="middle">O</text>

        <!-- Agulha giratória apontando na direção do vento -->
        <g transform="rotate(${deg} 60 60)">
          <!-- Ponta da agulha (dourada) -->
          <polygon points="60,20 66,60 60,54" fill="#E5C384" filter="drop-shadow(0 0 4px rgba(229,195,132,0.8))"/>
          <!-- Cauda da agulha (escura/esmeralda) -->
          <polygon points="60,100 66,60 60,66" fill="#1C4E8A"/>
          <!-- Lado oposto para efeito 3D -->
          <polygon points="60,20 54,60 60,54" fill="#FFF2D6"/>
          <polygon points="60,100 54,60 60,66" fill="#133560"/>
          <!-- Ponto central de fixação -->
          <circle cx="60" cy="60" r="4" fill="#E5C384" stroke="#020813" stroke-width="1.5"/>
        </g>
      </svg>
      <div class="absolute -bottom-5 text-center">
        <span class="text-[11px] font-bold text-[#E5C384]">${deg}°</span>
      </div>
    </div>
  `;
}

export function renderHourlyForecast(hourly, unit = 'kmh') {
  if (!hourly || hourly.length === 0) return '';

  const cards = hourly.slice(0, 12).map(h => {
    const d = new Date(h.time);
    const hourStr = d.getHours().toString().padStart(2, '0') + 'h';
    const wind = convertWindSpeed(h.windSpeed, unit);

    return `
      <div class="min-w-[68px] p-2 rounded-2xl bg-[#040E1E] border border-[#132B4F] flex flex-col items-center justify-between text-center shrink-0">
        <span class="text-[10px] text-slate-400 font-medium">${hourStr}</span>
        <span class="text-sm font-bold text-[#FFF6E5] my-1">${h.temp}°</span>
        <div class="flex items-center gap-0.5 text-[9.5px] text-cyan-400 font-semibold" title="Probabilidade de Chuva">
          <span>💧</span>
          <span>${h.rainProb}%</span>
        </div>
        <div class="text-[9px] text-[#94B8DB] mt-1 flex items-center gap-0.5" title="Vento: ${wind.value} ${wind.unit}">
          <span>💨</span>
          <span>${Math.round(wind.value)}</span>
        </div>
      </div>
    `;
  }).join('');

  // Tabela acessível alternativa para leitores de tela
  const srRows = hourly.slice(0, 12).map(h => {
    const d = new Date(h.time);
    const hStr = d.getHours() + ':00';
    return `<tr><td>${hStr}</td><td>${h.temp}°C</td><td>${h.rainProb}%</td><td>${h.windSpeed} km/h</td></tr>`;
  }).join('');

  return `
    <div>
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        ${cards}
      </div>
      <!-- Resumo Acessível para Leitores de Tela -->
      <table class="sr-only">
        <caption>Previsão do tempo hora a hora para as próximas 12 horas</caption>
        <thead><tr><th>Hora</th><th>Temperatura</th><th>Chuva</th><th>Vento</th></tr></thead>
        <tbody>${srRows}</tbody>
      </table>
    </div>
  `;
}

export function renderDailyForecast(daily) {
  if (!daily || daily.length === 0) return '';

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const rows = daily.map((d, idx) => {
    const dateObj = new Date(d.date + 'T12:00:00');
    const dayLabel = idx === 0 ? 'Hoje' : idx === 1 ? 'Amanhã' : weekDays[dateObj.getDay()];
    const dateFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(dateObj);

    return `
      <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#040E1E] border border-[#132B4F] text-xs">
        <div class="flex items-center gap-2 w-28">
          <span class="font-bold text-[#E5C384]">${dayLabel}</span>
          <span class="text-[10px] text-slate-400">${dateFormatted}</span>
        </div>

        <div class="flex items-center gap-1 text-[11px] text-slate-300 flex-1 justify-center">
          <span>${d.wmo.emoji}</span>
          <span class="truncate max-w-[110px] text-slate-300">${d.wmo.label}</span>
        </div>

        <div class="flex items-center gap-2 text-right">
          <span class="text-xs font-bold text-[#FFF6E5]">${d.maxTemp}°</span>
          <span class="text-xs text-slate-400">${d.minTemp}°</span>
          ${d.rainProb > 0 ? `<span class="text-[10px] text-cyan-400 font-semibold w-8 text-right">${d.rainProb}%</span>` : `<span class="text-[10px] text-slate-600 w-8 text-right">—</span>`}
        </div>
      </div>
    `;
  }).join('');

  return `<div class="space-y-1.5">${rows}</div>`;
}

export function renderSkeleton() {
  return `
    <div class="space-y-4 animate-pulse">
      <div class="p-4 rounded-3xl bg-[#06152B] border border-[#132B4F] h-48 flex items-center justify-center text-slate-500 text-xs">
        <span class="text-[#E5C384]">Sincronizando com as órbitas e a atmosfera...</span>
      </div>
      <div class="p-4 rounded-3xl bg-[#06152B] border border-[#132B4F] h-36"></div>
      <div class="p-4 rounded-3xl bg-[#06152B] border border-[#132B4F] h-48"></div>
    </div>
  `;
}

