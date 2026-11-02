/**
 * Renderizador do Mini Atlas do Sistema Solar e Hora Lunar
 */

import { calculatePlanetAngles, calculateEarthDistances, calculateMoonOrbit, PLANETS_DATA } from './solar_system.js';
import { getLunarTimeInfo } from './lunar_time.js';

let currentAtlasMode = 'tamanho'; // 'tamanho' | 'distancia'
let selectedPlanet = PLANETS_DATA[2]; // Padrão: Terra

// Lista determinística de micro-estrelas no plano de fundo para criar sensação cósmica
const BACKGROUND_STARS = [
  { x: 28, y: 35, r: 0.6, op: 0.4 },
  { x: 55, y: 72, r: 0.8, op: 0.6 },
  { x: 82, y: 25, r: 0.5, op: 0.3 },
  { x: 120, y: 48, r: 1.0, op: 0.7 },
  { x: 145, y: 18, r: 0.7, op: 0.5 },
  { x: 195, y: 32, r: 0.5, op: 0.4 },
  { x: 230, y: 60, r: 0.8, op: 0.6 },
  { x: 280, y: 40, r: 1.1, op: 0.8 },
  { x: 305, y: 85, r: 0.5, op: 0.3 },
  { x: 35, y: 130, r: 0.8, op: 0.5 },
  { x: 295, y: 145, r: 0.9, op: 0.6 },
  { x: 40, y: 195, r: 0.5, op: 0.4 },
  { x: 65, y: 245, r: 1.0, op: 0.7 },
  { x: 105, y: 290, r: 0.6, op: 0.4 },
  { x: 155, y: 305, r: 0.9, op: 0.6 },
  { x: 210, y: 285, r: 0.7, op: 0.5 },
  { x: 260, y: 265, r: 0.5, op: 0.4 },
  { x: 285, y: 220, r: 1.2, op: 0.8 },
  { x: 300, y: 295, r: 0.7, op: 0.5 },
  { x: 18, y: 280, r: 0.6, op: 0.4 },
  { x: 160, y: 15, r: 0.8, op: 0.6 },
  { x: 75, y: 160, r: 0.5, op: 0.3 },
  { x: 245, y: 165, r: 0.6, op: 0.4 }
];

export function renderSolarSystemSection() {
  const planets = calculatePlanetAngles(new Date());
  const moon = calculateMoonOrbit(new Date());
  const earthDistances = calculateEarthDistances(planets);
  const lunarInfo = getLunarTimeInfo();

  // Frase com distâncias em UA em tempo real (como na referência JPL/CosmoLapse)
  const distText = `Neste momento, Mercúrio está a <strong>${earthDistances.mercurio ?? 0.69} UA</strong> da Terra, Vênus a <strong>${earthDistances.venus ?? 0.28} UA</strong>, Marte a <strong>${earthDistances.marte ?? 1.44} UA</strong>, Júpiter a <strong>${earthDistances.jupiter ?? 5.51} UA</strong> e Saturno a <strong>${earthDistances.saturno ?? 8.54} UA</strong> de distância.`;

  return `
    <!-- 5. SEÇÃO: MINI ATLAS DO SISTEMA SOLAR (FASE 3) -->
    <section class="p-5 rounded-3xl bg-[#06152B] border border-[#132B4F] space-y-4" id="atlas-solar-section">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base">🪐</span>
          <div>
            <h2 class="text-sm font-bold text-[#FFF6E5]">Mini Atlas do Sistema Solar</h2>
            <div class="text-[10px] text-[#94B8DB]">Posições orbitais em tempo real (Equações de Kepler)</div>
          </div>
        </div>
        
        <!-- Alternância de Escala: Tamanho Relativo vs Distância Relativa -->
        <div class="flex items-center bg-[#040E1E] rounded-full p-0.5 border border-[#132B4F]">
          <button onclick="window.switchAtlasMode('tamanho')" id="btn-atlas-tamanho" class="px-2.5 py-1 rounded-full text-[10px] font-bold ${currentAtlasMode === 'tamanho' ? 'bg-[#1C4E8A] text-white' : 'text-slate-400 hover:text-white'} tap-active">
            Tamanho
          </button>
          <button onclick="window.switchAtlasMode('distancia')" id="btn-atlas-distancia" class="px-2.5 py-1 rounded-full text-[10px] font-bold ${currentAtlasMode === 'distancia' ? 'bg-[#1C4E8A] text-white' : 'text-slate-400 hover:text-white'} tap-active">
            Distância
          </button>
        </div>
      </div>

      <!-- Frase Educativa: Distâncias Reais em UA hoje -->
      <div class="p-3 rounded-2xl bg-[#040E1E]/90 border border-[#132B4F] text-[11px] leading-relaxed text-slate-300">
        <div class="flex items-center gap-1.5 text-[#E5C384] font-bold mb-1">
          <span class="text-xs">🛰️</span>
          <span>Distâncias da Terra Hoje (1 UA ≈ 149,6 milhões de km):</span>
        </div>
        <p class="text-slate-300" id="atlas-distances-text">
          ${distText}
        </p>
      </div>

      <p class="text-[11px] text-slate-400 leading-tight">
        Toque em qualquer planeta para ver sua ficha técnica astronômica com dados verificados:
      </p>

      <!-- Visualizador do Atlas em SVG 2D -->
      <div class="relative w-full aspect-square max-h-[350px] rounded-2xl bg-[#020718] border border-[#132B4F] flex items-center justify-center overflow-hidden p-2 shadow-inner">
        ${renderSolarMapSvg(planets, currentAtlasMode, moon)}
      </div>

      <!-- Ficha Técnica do Planeta Selecionado -->
      <div id="planet-card" class="p-4 rounded-2xl bg-[#040E1E] border border-amber-500/20 space-y-2 text-xs">
        ${renderPlanetDetails(selectedPlanet, earthDistances[selectedPlanet.id])}
      </div>

      <!-- 6. CARTÃO EDUCATIVO: HORA NA LUA (LTC) -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-[#071933] to-[#030C1A] border border-amber-500/25 space-y-3">
        <div class="flex items-center justify-between pb-1 border-b border-[#132B4F]">
          <div class="flex items-center gap-1.5 font-bold text-[#E5C384] text-xs">
            <span>⏱️</span>
            <span>${lunarInfo.title}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#132B4F] text-[#94B8DB]">Relatividade Geral</span>
        </div>

        <div class="text-[11.5px] text-slate-300 space-y-2 leading-relaxed">
          <p>${lunarInfo.scientificExplanation}</p>
          
          <div class="p-3 rounded-xl bg-[#040E1E] border border-amber-500/20 text-[#FFF6E5]">
            <span class="text-[10px] uppercase font-bold text-[#E5C384] block mb-0.5">Dado Científico Verificado:</span>
            <p class="text-[11px] text-slate-200">${lunarInfo.verifiedNumber}</p>
            <p class="text-[10.5px] text-[#94B8DB] pt-1 mt-1 border-t border-slate-700/60">
              Hoje, um relógio na Lua acumulou aproximadamente <strong>+${lunarInfo.driftToday} µs</strong> de avanço em relação a um relógio em solo terrestre.
            </p>
          </div>

          <p class="text-[11px] text-slate-400">${lunarInfo.whyItMatters}</p>
        </div>

        <!-- Fontes Oficiais Citadas -->
        <div class="pt-2 border-t border-[#132B4F] text-[9.5px] text-slate-500 space-y-0.5">
          <span class="font-bold text-slate-400 block">Fontes Verificadas:</span>
          ${lunarInfo.sources.map(s => `<div>• ${s}</div>`).join('')}
        </div>
      </div>

    </section>
  `;
}

function renderSolarMapSvg(planets, mode, moon) {
  const size = 330;
  const cx = 165;
  const cy = 165;

  // No modo tamanho: raios de órbita uniformemente espaçados para ver os tamanhos
  // No modo distância: raios de órbita logarítmicos proporcionais à distância real
  const orbitRadii = mode === 'distancia'
    ? [24, 38, 54, 72, 98, 120, 140, 154]
    : [22, 38, 55, 72, 94, 115, 136, 154];

  // Tamanhos relativos (diâmetros visuais em px)
  const planetSizes = mode === 'tamanho'
    ? [3.2, 5.2, 5.6, 4.2, 11.5, 10, 7.2, 6.8]
    : [3.5, 4.2, 4.8, 4.2, 6.5, 6, 5.2, 5.2];

  let svgContent = `
    <svg viewBox="0 0 ${size} ${size}" class="w-full h-full select-none" role="img" aria-label="Mapa orbital do Sistema Solar hoje">
      <defs>
        <!-- Gradiente do Sol -->
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="35%" stop-color="#FFF2D6"/>
          <stop offset="70%" stop-color="#E5C384"/>
          <stop offset="100%" stop-color="#C2943A" stop-opacity="0"/>
        </radialGradient>
        
        <!-- Gradiente dos Anéis de Saturno -->
        <linearGradient id="saturn-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D7BA88" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#AA8855" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#E7CA98" stop-opacity="0.9"/>
        </linearGradient>
      </defs>

      <!-- Micro-estrelas brilhantes no fundo espacial -->
      <g class="stars-background">
        ${BACKGROUND_STARS.map(st => `
          <circle cx="${st.x}" cy="${st.y}" r="${st.r}" fill="#FFFFFF" opacity="${st.op}"/>
        `).join('')}
      </g>

      <!-- Halo suave do Sol -->
      <circle cx="${cx}" cy="${cy}" r="22" fill="url(#sun-glow)" opacity="0.45"/>
      <circle cx="${cx}" cy="${cy}" r="12" fill="#FFF2D6" filter="drop-shadow(0 0 12px rgba(229,195,132,0.95))"/>
      <circle cx="${cx}" cy="${cy}" r="8" fill="#E5C384"/>
      <circle cx="${cx}" cy="${cy}" r="5.5" fill="#F4E0A8"/>
  `;

  planets.forEach((p, idx) => {
    const r = orbitRadii[idx];
    const isSelected = selectedPlanet && selectedPlanet.id === p.id;
    
    // Órbita
    svgContent += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${isSelected ? 'rgba(229, 195, 132, 0.55)' : 'rgba(22, 53, 36, 0.75)'}" stroke-width="${isSelected ? 1.6 : 1}" stroke-dasharray="${idx > 3 ? '3 3' : 'none'}"/>
    `;

    // Posição do Planeta calculada hoje
    const px = cx + r * Math.cos(p.angle);
    const py = cy + r * Math.sin(p.angle);
    const pRadius = planetSizes[idx];

    svgContent += `
      <g class="cursor-pointer tap-active group" onclick="window.selectPlanet('${p.id}')" tabindex="0" role="button" aria-label="Planeta ${p.name}">
        <!-- Anel de Foco/Seleção -->
        ${isSelected ? `<circle cx="${px}" cy="${py}" r="${pRadius + 5}" fill="none" stroke="#E5C384" stroke-width="1.5" stroke-dasharray="2 2"/>` : ''}
    `;

    // Se for Saturno: Desenha os anéis inclinados com detalhe artístico
    if (p.id === 'saturno') {
      const ringRx = pRadius * 2.3;
      const ringRy = pRadius * 0.85;
      svgContent += `
        <!-- Anel de Saturno (Trás/Base) -->
        <g transform="rotate(-26, ${px}, ${py})">
          <ellipse cx="${px}" cy="${py}" rx="${ringRx + 2}" ry="${ringRy + 1.2}" fill="none" stroke="#AA8855" stroke-width="1" opacity="0.6"/>
          <ellipse cx="${px}" cy="${py}" rx="${ringRx}" ry="${ringRy}" fill="none" stroke="url(#saturn-ring-grad)" stroke-width="2.5" opacity="0.85"/>
          <ellipse cx="${px}" cy="${py}" rx="${ringRx - 3}" ry="${ringRy - 1.2}" fill="none" stroke="#664422" stroke-width="0.8" opacity="0.7"/>
        </g>
        <!-- Corpo de Saturno -->
        <circle cx="${px}" cy="${py}" r="${pRadius}" fill="${p.color}" filter="drop-shadow(0 0 5px ${p.color})"/>
        <!-- Anel de Saturno (Frente) -->
        <g transform="rotate(-26, ${px}, ${py})">
          <path d="M ${px - ringRx} ${py} A ${ringRx} ${ringRy} 0 0 0 ${px + ringRx} ${py}" fill="none" stroke="url(#saturn-ring-grad)" stroke-width="2" opacity="0.9"/>
        </g>
      `;
    } else {
      // Outros planetas
      svgContent += `
        <circle cx="${px}" cy="${py}" r="${pRadius}" fill="${p.color}" filter="drop-shadow(0 0 4px ${p.color})"/>
      `;
    }

    // Se for a Terra: Desenha a órbita da Lua e a Lua ao redor
    if (p.id === 'terra') {
      const moonOrbitR = 12.5; // Raio visual da órbita lunar
      const moonAngle = moon ? moon.angle : 0;
      const mx = px + moonOrbitR * Math.cos(moonAngle);
      const my = py + moonOrbitR * Math.sin(moonAngle);

      svgContent += `
        <!-- Órbita da Lua -->
        <circle cx="${px}" cy="${py}" r="${moonOrbitR}" fill="none" stroke="rgba(226, 232, 240, 0.45)" stroke-width="0.8" stroke-dasharray="1.5 1.5"/>
        <!-- Lua -->
        <circle cx="${mx}" cy="${my}" r="1.7" fill="#E2E8F0" filter="drop-shadow(0 0 2px #FFFFFF)"/>
        <text x="${mx}" y="${my - 3}" fill="#CBD5E1" font-size="5" text-anchor="middle">Lua</text>
      `;
    }

    // Rótulo do Nome do Planeta
    svgContent += `
        <text x="${px}" y="${py > cy ? py + pRadius + 9 : py - pRadius - 4}" fill="${isSelected ? '#FFF6E5' : '#94A3B8'}" font-size="7.5" font-weight="${isSelected ? 'bold' : 'normal'}" text-anchor="middle">
          ${p.name}
        </text>
      </g>
    `;
  });

  svgContent += `</svg>`;
  return svgContent;
}

export function renderPlanetDetails(planet, distFromEarth) {
  if (!planet) return '';

  const distEarthText = distFromEarth 
    ? `<span class="text-[10px] text-[#2DC47F] font-bold block">${distFromEarth} UA da Terra hoje</span>`
    : (planet.id === 'terra' ? '<span class="text-[10px] text-[#2DC47F] font-bold block">Você está aqui 🌍</span>' : '');

  return `
    <div class="flex items-center justify-between pb-1.5 border-b border-[#132B4F]">
      <div class="flex items-center gap-2">
        <span class="w-3.5 h-3.5 rounded-full inline-block" style="background-color: ${planet.color};"></span>
        <h3 class="text-sm font-bold text-[#FFF6E5]">${planet.name}</h3>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-[#E5C384] font-medium block">${planet.distAU} UA do Sol</span>
        ${distEarthText}
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
      <div>Diâmetro: <strong class="text-white">${planet.diameterKm.toLocaleString('pt-BR')} km</strong></div>
      <div>Luas conhecidas: <strong class="text-white">${planet.moons}</strong></div>
      <div>Duração do Ano: <strong class="text-white">${planet.orbitalPeriodDays} dias</strong></div>
      <div>Duração do Dia: <strong class="text-white">${Math.abs(planet.rotationHours)} h</strong></div>
    </div>

    <p class="text-[11px] text-slate-400 italic pt-1 border-t border-[#132B4F]/60">
      "${planet.curiosity}"
    </p>
  `;
}

// Manipuladores de Eventos do Atlas (com proteção para ambientes Node de testes)
if (typeof window !== 'undefined') {
  window.switchAtlasMode = (mode) => {
    currentAtlasMode = mode;
    const container = document.getElementById('atlas-solar-section');
    if (container) {
      const planets = calculatePlanetAngles(new Date());
      const moon = calculateMoonOrbit(new Date());
      const svgWrapper = container.querySelector('.aspect-square');
      if (svgWrapper) {
        svgWrapper.innerHTML = renderSolarMapSvg(planets, currentAtlasMode, moon);
      }
      const btnTam = document.getElementById('btn-atlas-tamanho');
      const btnDist = document.getElementById('btn-atlas-distancia');
      if (btnTam && btnDist) {
        btnTam.className = `px-2.5 py-1 rounded-full text-[10px] font-bold ${mode === 'tamanho' ? 'bg-[#1C4E8A] text-white' : 'text-slate-400 hover:text-white'} tap-active`;
        btnDist.className = `px-2.5 py-1 rounded-full text-[10px] font-bold ${mode === 'distancia' ? 'bg-[#1C4E8A] text-white' : 'text-slate-400 hover:text-white'} tap-active`;
      }
    }
  };

  window.selectPlanet = (planetId) => {
    const p = PLANETS_DATA.find(item => item.id === planetId);
    if (p) {
      selectedPlanet = p;
      const planets = calculatePlanetAngles(new Date());
      const moon = calculateMoonOrbit(new Date());
      const earthDistances = calculateEarthDistances(planets);
      const card = document.getElementById('planet-card');
      if (card) {
        card.innerHTML = renderPlanetDetails(p, earthDistances[p.id]);
      }
      const container = document.getElementById('atlas-solar-section');
      if (container) {
        const svgWrapper = container.querySelector('.aspect-square');
        if (svgWrapper) {
          svgWrapper.innerHTML = renderSolarMapSvg(planets, currentAtlasMode, moon);
        }
      }
    }
  };
}

