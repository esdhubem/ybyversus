/**
 * Renderizador do Mini Atlas do Sistema Solar e Hora Lunar
 */

import { calculatePlanetAngles, PLANETS_DATA } from './solar_system.js';
import { getLunarTimeInfo } from './lunar_time.js';

let currentAtlasMode = 'tamanho'; // 'tamanho' | 'distancia'
let selectedPlanet = PLANETS_DATA[2]; // Padrão: Terra

export function renderSolarSystemSection() {
  const planets = calculatePlanetAngles(new Date());
  const lunarInfo = getLunarTimeInfo();

  return `
    <!-- 5. SEÇÃO: MINI ATLAS DO SISTEMA SOLAR (FASE 3) -->
    <section class="p-5 rounded-3xl bg-[#0B2016] border border-[#163524] space-y-4" id="atlas-solar-section">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base">🪐</span>
          <h2 class="text-sm font-bold text-[#FFF6E5]">Mini Atlas do Sistema Solar</h2>
        </div>
        
        <!-- Alternância de Escala: Tamanho Relativo vs Distância Relativa -->
        <div class="flex items-center bg-[#06120C] rounded-full p-0.5 border border-[#163524]">
          <button onclick="window.switchAtlasMode('tamanho')" id="btn-atlas-tamanho" class="px-2.5 py-1 rounded-full text-[10px] font-bold ${currentAtlasMode === 'tamanho' ? 'bg-[#1E9E64] text-white' : 'text-slate-400 hover:text-white'} tap-active">
            Tamanho
          </button>
          <button onclick="window.switchAtlasMode('distancia')" id="btn-atlas-distancia" class="px-2.5 py-1 rounded-full text-[10px] font-bold ${currentAtlasMode === 'distancia' ? 'bg-[#1E9E64] text-white' : 'text-slate-400 hover:text-white'} tap-active">
            Distância
          </button>
        </div>
      </div>

      <p class="text-[11px] text-slate-400 leading-tight">
        Posições orbitais calculadas hoje em tempo real. Toque em qualquer planeta para ver seus dados científicos:
      </p>

      <!-- Visualizador do Atlas em SVG 2D -->
      <div class="relative w-full aspect-square max-h-[340px] rounded-2xl bg-[#040D08] border border-[#163524] flex items-center justify-center overflow-hidden p-2">
        ${renderSolarMapSvg(planets, currentAtlasMode)}
      </div>

      <!-- Ficha Técnica do Planeta Selecionado -->
      <div id="planet-card" class="p-4 rounded-2xl bg-[#06120C] border border-amber-500/20 space-y-2 text-xs">
        ${renderPlanetDetails(selectedPlanet)}
      </div>

      <!-- 6. CARTÃO EDUCATIVO: HORA NA LUA (LTC) -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-[#0C2117] to-[#07160F] border border-amber-500/25 space-y-3">
        <div class="flex items-center justify-between pb-1 border-b border-[#163524]">
          <div class="flex items-center gap-1.5 font-bold text-[#E5C384] text-xs">
            <span>⏱️</span>
            <span>${lunarInfo.title}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#163524] text-[#A1C1B0]">Relatividade Geral</span>
        </div>

        <div class="text-[11.5px] text-slate-300 space-y-2 leading-relaxed">
          <p>${lunarInfo.scientificExplanation}</p>
          
          <div class="p-3 rounded-xl bg-[#06120C] border border-amber-500/20 text-[#FFF6E5]">
            <span class="text-[10px] uppercase font-bold text-[#E5C384] block mb-0.5">Dado Científico Verificado:</span>
            <p class="text-[11px] text-slate-200">${lunarInfo.verifiedNumber}</p>
            <p class="text-[10.5px] text-[#A1C1B0] pt-1 mt-1 border-t border-slate-700/60">
              Hoje, um relógio na Lua acumulou aproximadamente <strong>+${lunarInfo.driftToday} µs</strong> de avanço em relação a um relógio em solo terrestre.
            </p>
          </div>

          <p class="text-[11px] text-slate-400">${lunarInfo.whyItMatters}</p>
        </div>

        <!-- Fontes Oficiais Citadas -->
        <div class="pt-2 border-t border-[#163524] text-[9.5px] text-slate-500 space-y-0.5">
          <span class="font-bold text-slate-400 block">Fontes Verificadas:</span>
          ${lunarInfo.sources.map(s => `<div>• ${s}</div>`).join('')}
        </div>
      </div>

    </section>
  `;
}

function renderSolarMapSvg(planets, mode) {
  const size = 320;
  const cx = 160;
  const cy = 160;

  // No modo tamanho: raios de órbita uniformemente espaçados para ver os tamanhos
  // No modo distância: raios de órbita logarítmicos proporcionais à distância real
  const orbitRadii = mode === 'distancia'
    ? [22, 34, 48, 64, 88, 110, 130, 146] // Distâncias comprimidas para caber
    : [20, 36, 52, 68, 88, 108, 128, 146];

  // Tamanhos relativos (diâmetros visuais em px)
  const planetSizes = mode === 'tamanho'
    ? [3, 5, 5.5, 4, 11, 9.5, 7, 6.5] // Tamanho exagerado relativo
    : [3.5, 4, 4.5, 4, 6, 5.5, 5, 5];

  let svgContent = `
    <svg viewBox="0 0 ${size} ${size}" class="w-full h-full select-none" role="img" aria-label="Mapa orbital do Sistema Solar hoje">
      <!-- O Sol no Centro -->
      <circle cx="${cx}" cy="${cy}" r="11" fill="#FFF2D6" filter="drop-shadow(0 0 14px rgba(229,195,132,0.9))"/>
      <circle cx="${cx}" cy="${cy}" r="8" fill="#E5C384"/>
      <circle cx="${cx}" cy="${cy}" r="6" fill="#D4AF37"/>

      <!-- Órbitas Elípticas / Circulares -->
  `;

  planets.forEach((p, idx) => {
    const r = orbitRadii[idx];
    const isSelected = selectedPlanet && selectedPlanet.id === p.id;
    
    // Órbita
    svgContent += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${isSelected ? 'rgba(229, 195, 132, 0.45)' : 'rgba(22, 53, 36, 0.7)'}" stroke-width="${isSelected ? 1.5 : 1}" stroke-dasharray="${idx > 3 ? '3 3' : 'none'}"/>
    `;

    // Posição do Planeta calculada hoje
    const px = cx + r * Math.cos(p.angle);
    const py = cy + r * Math.sin(p.angle);
    const pRadius = planetSizes[idx];

    svgContent += `
      <g class="cursor-pointer tap-active group" onclick="window.selectPlanet('${p.id}')" tabindex="0" role="button" aria-label="Planeta ${p.name}">
        <!-- Anel de Foco/Seleção -->
        ${isSelected ? `<circle cx="${px}" cy="${py}" r="${pRadius + 4}" fill="none" stroke="#E5C384" stroke-width="1.5" stroke-dasharray="2 2"/>` : ''}
        <!-- Planeta -->
        <circle cx="${px}" cy="${py}" r="${pRadius}" fill="${p.color}" filter="drop-shadow(0 0 4px ${p.color})"/>
        <!-- Rótulo do Nome -->
        <text x="${px}" y="${py > cy ? py + pRadius + 8 : py - pRadius - 4}" fill="${isSelected ? '#FFF6E5' : '#94A3B8'}" font-size="7.5" font-weight="${isSelected ? 'bold' : 'normal'}" text-anchor="middle">
          ${p.name}
        </text>
      </g>
    `;
  });

  svgContent += `</svg>`;
  return svgContent;
}

export function renderPlanetDetails(planet) {
  if (!planet) return '';

  return `
    <div class="flex items-center justify-between pb-1.5 border-b border-[#163524]">
      <div class="flex items-center gap-2">
        <span class="w-3.5 h-3.5 rounded-full inline-block" style="background-color: ${planet.color};"></span>
        <h3 class="text-sm font-bold text-[#FFF6E5]">${planet.name}</h3>
      </div>
      <span class="text-[10px] text-[#E5C384] font-medium">${planet.distAU} UA do Sol</span>
    </div>

    <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
      <div>Diâmetro: <strong class="text-white">${planet.diameterKm.toLocaleString('pt-BR')} km</strong></div>
      <div>Luas conhecidas: <strong class="text-white">${planet.moons}</strong></div>
      <div>Duração do Ano: <strong class="text-white">${planet.orbitalPeriodDays} dias</strong></div>
      <div>Duração do Dia: <strong class="text-white">${Math.abs(planet.rotationHours)} h</strong></div>
    </div>

    <p class="text-[11px] text-slate-400 italic pt-1 border-t border-[#163524]/60">
      "${planet.curiosity}"
    </p>
  `;
}

// Manipuladores de Eventos do Atlas
window.switchAtlasMode = (mode) => {
  currentAtlasMode = mode;
  const container = document.getElementById('atlas-solar-section');
  if (container) {
    const planets = calculatePlanetAngles(new Date());
    const svgWrapper = container.querySelector('.aspect-square');
    if (svgWrapper) {
      svgWrapper.innerHTML = renderSolarMapSvg(planets, currentAtlasMode);
    }
    const btnTam = document.getElementById('btn-atlas-tamanho');
    const btnDist = document.getElementById('btn-atlas-distancia');
    if (btnTam && btnDist) {
      btnTam.className = `px-2.5 py-1 rounded-full text-[10px] font-bold ${mode === 'tamanho' ? 'bg-[#1E9E64] text-white' : 'text-slate-400 hover:text-white'} tap-active`;
      btnDist.className = `px-2.5 py-1 rounded-full text-[10px] font-bold ${mode === 'distancia' ? 'bg-[#1E9E64] text-white' : 'text-slate-400 hover:text-white'} tap-active`;
    }
  }
};

window.selectPlanet = (planetId) => {
  const p = PLANETS_DATA.find(item => item.id === planetId);
  if (p) {
    selectedPlanet = p;
    const card = document.getElementById('planet-card');
    if (card) {
      card.innerHTML = renderPlanetDetails(p);
    }
    const container = document.getElementById('atlas-solar-section');
    if (container) {
      const planets = calculatePlanetAngles(new Date());
      const svgWrapper = container.querySelector('.aspect-square');
      if (svgWrapper) {
        svgWrapper.innerHTML = renderSolarMapSvg(planets, currentAtlasMode);
      }
    }
  }
};

