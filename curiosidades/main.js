/**
 * Orquestrador Principal da Página Curiosidades: Céu, Mar e Tempo
 */

import { getMoonDetails, getNextMoonPhases, getCelestialEvents, getSolsticesAndEquinoxes } from './astronomy.js';
import { fetchWeatherData, searchCities, convertWindSpeed } from './weather.js';
import { fetchMarineData, findNearestPort, fetchTideData, renderTideChartSvg } from './marine.js';
import { generateDailyCuriosity } from './curiosities.js';
import { renderMoonSvg, renderCompassSvg, renderHourlyForecast, renderDailyForecast, renderSkeleton } from './ui.js';
import { 
  roundCoord, 
  getLastLocation, 
  setLastLocation, 
  getSavedFavorites, 
  saveFavorite, 
  removeFavorite, 
  getWindUnit, 
  setWindUnit 
} from './storage.js';

let currentLocation = getLastLocation();
let currentWeatherData = null;
let currentWindUnit = getWindUnit();

export async function initCuriosidades() {
  renderLocationHeader();
  renderFavoritesBar();
  setupEventListeners();
  await loadDataForLocation(currentLocation);
}

function renderLocationHeader() {
  const nameEl = document.getElementById('location-name');
  const coordsEl = document.getElementById('location-coords');
  if (nameEl) {
    nameEl.textContent = `${currentLocation.name}${currentLocation.state ? ', ' + currentLocation.state : ''}`;
  }
  if (coordsEl) {
    coordsEl.textContent = `${currentLocation.lat}°, ${currentLocation.lon}° (Arredondado)`;
  }
}

function renderFavoritesBar() {
  const container = document.getElementById('favorites-chips');
  if (!container) return;

  const favs = getSavedFavorites();
  container.innerHTML = favs.map(f => {
    const isSelected = Math.abs(f.lat - currentLocation.lat) < 0.05 && Math.abs(f.lon - currentLocation.lon) < 0.05;
    return `
      <button onclick="window.selectCity(${f.lat}, ${f.lon}, '${f.name}', '${f.state || ''}')" 
        class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all tap-active flex items-center gap-1.5 border min-h-[38px] ${
          isSelected 
            ? 'bg-gradient-to-r from-[#D8AC52] to-[#9C7323] text-black border-amber-400 font-bold shadow-xs' 
            : 'bg-[#06120C] text-slate-300 hover:text-white border-[#163524]'
        }">
        <span>${f.name}</span>
      </button>
    `;
  }).join('');
}

export async function loadDataForLocation(location, forceRefresh = false) {
  currentLocation = location;
  setLastLocation(location);
  renderLocationHeader();
  renderFavoritesBar();

  const contentArea = document.getElementById('curiosidades-content');
  if (contentArea) {
    contentArea.innerHTML = renderSkeleton();
  }

  try {
    // 1. Cálculos Astronômicos Locais no Navegador
    const now = new Date();
    const moon = getMoonDetails(now);
    const celestial = getCelestialEvents(now, location.lat, location.lon);
    const nextPhases = getNextMoonPhases(now);
    const seasons = getSolsticesAndEquinoxes(now.getFullYear());

    // 2. Clima e Vento da Open-Meteo
    currentWeatherData = await fetchWeatherData(location.lat, location.lon, forceRefresh);

    // 3. Mar e Ondas (Open-Meteo Marine) e Tábuas de Marés da Marinha do Brasil
    const marineData = await fetchMarineData(location.lat, location.lon);
    const nearestPort = findNearestPort(location.lat, location.lon);
    const tideData = await fetchTideData(nearestPort ? nearestPort.id : null, now);

    // 4. Curiosidade do Dia
    const curiosities = generateDailyCuriosity(moon, celestial, currentWeatherData);

    renderFullView({
      moon,
      celestial,
      nextPhases,
      seasons,
      weather: currentWeatherData,
      marine: marineData,
      nearestPort,
      tide: tideData,
      curiosities,
      unit: currentWindUnit
    });

  } catch (err) {
    console.error('[YBY Curiosidades] Erro ao carregar dados:', err);
    if (contentArea) {
      contentArea.innerHTML = `
        <div class="p-6 rounded-3xl bg-[#0B2016] border border-red-500/30 text-center space-y-3">
          <p class="text-sm font-bold text-red-400">Não foi possível carregar os dados de clima.</p>
          <p class="text-xs text-slate-400">Verifique sua conexão à internet e tente novamente.</p>
          <button onclick="window.retryLoad()" class="px-5 py-2 rounded-full bg-gradient-to-r from-[#D8AC52] to-[#9C7323] text-black text-xs font-bold tap-active min-h-[44px]">
            Tentar novamente
          </button>
        </div>
      `;
    }
  }
}

function renderFullView({ moon, celestial, nextPhases, seasons, weather, marine, nearestPort, tide, curiosities, unit }) {
  const contentArea = document.getElementById('curiosidades-content');
  if (!contentArea) return;

  const current = weather.current;
  const windInfo = convertWindSpeed(current.windSpeedKmh, unit);

  // Status de Cache / Offline
  let cacheNotice = '';
  if (weather.isFromCache) {
    cacheNotice = `
      <div class="p-2.5 rounded-2xl bg-[#06120C] border border-amber-500/20 text-[11px] text-[#E5C384] flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span>🕒</span>
          <span>Dados em cache de <strong>${weather.cachedAt}</strong></span>
        </div>
        <button onclick="window.retryLoad(true)" class="underline hover:text-white tap-active text-[11px]">
          Atualizar agora
        </button>
      </div>
    `;
  }

  // Renderização da Seção Mar & Ondas
  let marineBlock = '';
  if (marine && marine.isCoast && marine.current) {
    marineBlock = `
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="p-3 rounded-2xl bg-[#06120C] border border-[#163524] space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Ondas (Superfície)</span>
          <div class="text-lg font-bold text-[#FFF6E5]">${marine.current.waveHeight !== null ? marine.current.waveHeight + ' m' : '—'}</div>
          <div class="text-[11px] text-slate-300">Período: <strong>${marine.current.wavePeriod || '—'}s</strong></div>
          <div class="text-[10px] text-[#A1C1B0]">Direção: ${marine.current.waveDirection || '—'}°</div>
        </div>

        <div class="p-3 rounded-2xl bg-[#06120C] border border-[#163524] space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Ondulação (Swell)</span>
          <div class="text-lg font-bold text-[#E5C384]">${marine.current.swellHeight !== null ? marine.current.swellHeight + ' m' : '—'}</div>
          <div class="text-[11px] text-slate-300">Período: <strong>${marine.current.swellPeriod || '—'}s</strong></div>
          <div class="text-[10px] text-[#A1C1B0]">Direção: ${marine.current.swellDirection || '—'}°</div>
        </div>
      </div>
    `;
  } else {
    marineBlock = `
      <div class="p-3 rounded-2xl bg-[#06120C] border border-[#163524] text-xs text-slate-400 text-center">
        <span>📍 Localidade sem dados marítimos diretos (região interiorana ou continental).</span>
      </div>
    `;
  }

  // Renderização da Seção Tábuas de Marés
  let tideBlock = '';
  if (tide && tide.hasData) {
    tideBlock = `
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs">
          <div>
            <strong class="text-[#FFF6E5] block">${tide.nomePorto} (${tide.estado})</strong>
            <span class="text-[10px] text-[#E5C384]">${tide.fonte}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#163524] text-[#A1C1B0]">Oficial DHN</span>
        </div>

        <!-- Gráfico de Maré 24h -->
        ${renderTideChartSvg(tide.medicoes)}

        <!-- Lista de Preamar e Baixa-mar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${tide.medicoes.map(m => `
            <div class="p-2 rounded-2xl bg-[#06120C] border border-[#163524] text-center">
              <span class="text-[10px] uppercase font-bold ${m.tipo === 'preamar' ? 'text-[#E5C384]' : 'text-[#1E9E64]'}">
                ${m.tipo === 'preamar' ? '⬆️ Preamar' : '⬇️ Baixa-mar'}
              </span>
              <div class="text-xs font-bold text-[#FFF6E5] mt-0.5">${m.altura} m</div>
              <div class="text-[10px] text-slate-400">${m.hora}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    tideBlock = `
      <div class="p-3.5 rounded-2xl bg-[#06120C] border border-[#163524] text-xs text-slate-400 text-center space-y-1">
        <p class="italic text-slate-300">"${tide ? tide.message : 'dados ainda não disponíveis para este porto'}"</p>
        <p class="text-[10.5px] text-slate-500">As tábuas oficiais são adicionadas gradualmente a partir dos dados abertos da Marinha do Brasil.</p>
      </div>
    `;
  }

  contentArea.innerHTML = `
    ${cacheNotice}

    <!-- 1. CARTÃO CURIOSIDADE DO DIA -->
    <section class="p-5 rounded-3xl bg-gradient-to-br from-[#0C2117] to-[#07160F] border border-amber-500/25 shadow-xl space-y-2 relative overflow-hidden">
      <div class="flex items-center justify-between pb-1 border-b border-[#163524]">
        <div class="flex items-center gap-1.5 text-xs font-bold text-[#E5C384]">
          <span>✨</span>
          <span>Curiosidade do Dia: Céu & Ritmos</span>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#163524] text-[#A1C1B0]">${curiosities[0].tag}</span>
      </div>
      <h3 class="text-sm font-bold text-[#FFF6E5]">${curiosities[0].title}</h3>
      <p class="text-xs text-slate-300 leading-relaxed">${curiosities[0].text}</p>
      ${curiosities[0].isTradition ? `
        <span class="inline-block mt-1 text-[10px] text-amber-400/90 italic font-semibold">
          ⚠️ ${curiosities[0].disclaimer}
        </span>
      ` : ''}
    </section>

    <!-- 2. SEÇÃO: CÉU DE HOJE (LUA & SOL) -->
    <section class="p-5 rounded-3xl bg-[#0B2016] border border-[#163524] space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base">🌙</span>
          <h2 class="text-sm font-bold text-[#FFF6E5]">Céu de Hoje: Lua & Sol</h2>
        </div>
        <span class="text-[10px] text-slate-400">Cálculo local no aparelho</span>
      </div>

      <!-- Fase da Lua Destaque -->
      <div class="p-4 rounded-2xl bg-[#06120C] border border-amber-500/20 flex items-center justify-between gap-4">
        <div class="space-y-1">
          <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Fase da Lua</span>
          <h3 class="text-lg font-bold text-[#E5C384]">${moon.name}</h3>
          <p class="text-xs text-slate-300">Iluminação: <strong class="text-white">${moon.percentage}%</strong></p>
          <p class="text-[11px] text-[#A1C1B0]">Ciclo Lunar: ${Math.round(moon.phase * 29.53)}º dia</p>
        </div>
        <div class="shrink-0 flex items-center justify-center">
          ${renderMoonSvg(moon)}
        </div>
      </div>

      <!-- Nascer e Pôr do Sol e da Lua -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="p-3 rounded-2xl bg-[#06120C] border border-[#163524] space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-[#E5C384]">
            <span>☀️</span>
            <span>Sol</span>
          </div>
          <div class="text-[11px] text-slate-300 space-y-0.5">
            <div>Nascer: <strong>${formatTime(celestial.sunrise)}</strong></div>
            <div>Zênite: <strong>${formatTime(celestial.solarNoon)}</strong></div>
            <div>Pôr: <strong>${formatTime(celestial.sunset)}</strong></div>
            <div class="text-[10px] text-[#A1C1B0] pt-1">Duração do dia: ${celestial.dayLength.formatted}</div>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-[#06120C] border border-[#163524] space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-[#E5C384]">
            <span>🌔</span>
            <span>Lua</span>
          </div>
          <div class="text-[11px] text-slate-300 space-y-0.5">
            <div>Nascer: <strong>${formatTime(celestial.moonrise)}</strong></div>
            <div>Pôr: <strong>${formatTime(celestial.moonset)}</strong></div>
            <div class="text-[10px] text-slate-400 pt-1">Ângulo: ${Math.round(moon.angle * 180 / Math.PI)}°</div>
          </div>
        </div>
      </div>

      <!-- Próximas 4 Fases Principais da Lua -->
      <div class="space-y-2 pt-2 border-t border-[#163524]">
        <h4 class="text-xs font-bold text-slate-300">Próximas Fases Lunares</h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${nextPhases.map(p => `
            <div class="p-2.5 rounded-2xl bg-[#06120C] border border-[#163524] text-center">
              <span class="text-lg">${p.emoji}</span>
              <div class="text-[11px] font-bold text-[#FFF6E5] mt-0.5">${p.name}</div>
              <div class="text-[10px] text-[#E5C384]">${formatDate(p.date)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Solstícios e Equinócios do Ano -->
      <div class="space-y-2 pt-2 border-t border-[#163524]">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-300">Estações: Solstícios e Equinócios (${new Date().getFullYear()})</h4>
          <span class="text-[10px] text-[#E5C384]">Hemisfério Sul</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${seasons.map(s => `
            <div class="p-2.5 rounded-2xl bg-[#06120C] border border-[#163524] flex items-center justify-between">
              <div>
                <span class="font-bold text-[#FFF6E5] block">${s.name}</span>
                <span class="text-[10px] text-[#A1C1B0]">${s.hemisphereSouth}</span>
              </div>
              <span class="text-[11px] font-semibold text-[#E5C384] text-right">${formatDateWithHour(s.date)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 3. SEÇÃO: CLIMA E VENTO -->
    <section class="p-5 rounded-3xl bg-[#0B2016] border border-[#163524] space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base">🌤️</span>
          <h2 class="text-sm font-bold text-[#FFF6E5]">Clima e Vento</h2>
        </div>
        <!-- Seletor de Unidade de Vento -->
        <div class="flex items-center bg-[#06120C] rounded-full p-0.5 border border-[#163524]">
          <button onclick="window.changeWindUnit('kmh')" class="px-2 py-0.5 rounded-full text-[10px] font-bold ${unit === 'kmh' ? 'bg-[#1E9E64] text-white' : 'text-slate-400 hover:text-white'}">km/h</button>
          <button onclick="window.changeWindUnit('kt')" class="px-2 py-0.5 rounded-full text-[10px] font-bold ${unit === 'kt' ? 'bg-[#1E9E64] text-white' : 'text-slate-400 hover:text-white'}">nós</button>
          <button onclick="window.changeWindUnit('ms')" class="px-2 py-0.5 rounded-full text-[10px] font-bold ${unit === 'ms' ? 'bg-[#1E9E64] text-white' : 'text-slate-400 hover:text-white'}">m/s</button>
        </div>
      </div>

      <!-- Resumo Principal do Clima Atual -->
      <div class="p-4 rounded-2xl bg-[#06120C] border border-amber-500/20 flex items-center justify-between">
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-[#FFF6E5]">${current.temp}°C</span>
            <span class="text-xs text-slate-400">Sensação: ${current.feelsLike}°C</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs font-semibold text-[#E5C384] mt-1">
            <span>${current.wmo.emoji}</span>
            <span>${current.wmo.label}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-300 mt-2">
            <span>💧 Umidade: <strong>${current.humidity}%</strong></span>
            <span>🌧️ Chuva: <strong>${current.rainProb}%</strong></span>
          </div>
        </div>

        <!-- Rosa dos Ventos com Agulha -->
        <div class="shrink-0 flex flex-col items-center">
          ${renderCompassSvg(current.windDirection, `${windInfo.value} ${windInfo.unit}`)}
          <span class="text-[10px] font-semibold text-[#A1C1B0] mt-1">${windInfo.value} ${windInfo.unit} (${current.compass.pt})</span>
        </div>
      </div>

      <!-- Índice UV com Barra Colorida -->
      <div class="p-3.5 rounded-2xl bg-[#06120C] border border-[#163524] space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-200">Índice Ultravioleta (UV)</span>
          <span class="font-bold px-2 py-0.5 rounded-full text-[10px] text-black" style="background-color: ${current.uvClass.color};">
            ${current.uv} • ${current.uvClass.text}
          </span>
        </div>
        <p class="text-[11px] text-slate-400">${current.uvClass.advice}</p>
      </div>

      <!-- Previsão Horária (Próximas 12h) -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-slate-300">Previsão Hora a Hora</h3>
        ${renderHourlyForecast(weather.hourly, unit)}
      </div>

      <!-- Tendência dos Próximos 7 Dias -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-slate-300">Próximos 7 Dias</h3>
        ${renderDailyForecast(weather.daily)}
      </div>
    </section>

    <!-- 4. SEÇÃO: MAR, ONDAS E MARÉS (FASE 2) -->
    <section class="p-5 rounded-3xl bg-[#0B2016] border border-[#163524] space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base">🌊</span>
          <h2 class="text-sm font-bold text-[#FFF6E5]">Mar, Ondas e Marés</h2>
        </div>
        <span class="text-[10px] text-[#A1C1B0]">Litoral Brasileiro</span>
      </div>

      <!-- AVISO FIXO OBRIGATÓRIO DE SEGURANÇA -->
      <div class="p-3.5 rounded-2xl bg-[#0F1D16] border border-amber-500/30 text-[11px] text-[#F3E2C4] leading-relaxed flex items-start gap-2.5 shadow-xs">
        <span class="text-base leading-none shrink-0 mt-0.5">⚠️</span>
        <p>
          <strong>Aviso de Segurança:</strong> Previsões para curiosidade e informação. Não use para navegação, pesca embarcada, banhos de mar ou decisões de segurança. Consulte os órgãos oficiais (Marinha do Brasil, Defesa Civil, INMET).
        </p>
      </div>

      <!-- Ondas e Ondulação -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-slate-300">Condições do Mar (Open-Meteo Marine)</h3>
        ${marineBlock}
      </div>

      <!-- Tábuas de Marés da Marinha -->
      <div class="space-y-2 pt-2 border-t border-[#163524]">
        <h3 class="text-xs font-bold text-slate-300">Tábua de Marés do Dia (Portos do Brasil)</h3>
        ${tideBlock}
      </div>

      <!-- Explicação Educativa: Marés de Sizígia e Quadratura -->
      <div class="p-4 rounded-2xl bg-[#06120C] border border-amber-500/20 space-y-2 text-xs text-slate-300 leading-relaxed">
        <div class="flex items-center gap-1.5 font-bold text-[#E5C384]">
          <span>🪐</span>
          <span>Por que a maré sobe mais na Lua Nova e Cheia?</span>
        </div>
        <p>
          <strong>Marés de Sizígia:</strong> Durante as fases de <em>Lua Nova</em> e <em>Lua Cheia</em>, a Terra, a Lua e o Sol encontram-se em alinhamento quase perfeito. Suas forças gravitacionais somam-se sobre as massas oceânicas, gerando marés de grande amplitude — com preamares (marés altas) mais elevadas e baixa-mares mais baixas.
        </p>
        <p class="pt-1 text-[11px] text-slate-400">
          <strong>Marés de Quadratura:</strong> Nos quartos <em>Crescente</em> e <em>Minguante</em>, o Sol e a Lua formam um ângulo reto de 90° em relação à Terra. Suas atrações gravitacionais atuam perpendicularmente e se atenuam, resultando em menor variação no nível do mar.
        </p>
      </div>
    </section>

    <!-- ATRIBUIÇÃO OFICIAL OBRIGATÓRIA NO RODAPÉ -->
    <footer class="pt-4 pb-8 text-center text-[11px] text-slate-400 space-y-1.5 border-t border-[#163524]">
      <p class="leading-relaxed">
        Dados de clima, vento e ondas: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" class="text-[#E5C384] hover:underline">Open-Meteo</a> (CC BY 4.0).
      </p>
      <p class="leading-relaxed">
        Marés: <span class="text-slate-300 font-medium">Marinha do Brasil (DHN/CHM)</span>.
      </p>
      <p class="text-[10px] text-slate-500 pt-1">
        YBY versus • Praça Pública Digital • Conhecimento Livre & Astronomia Soberana
      </p>
    </footer>
  `;

  // Recria os ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

    <!-- ATRIBUIÇÃO OFICIAL OBRIGATÓRIA NO RODAPÉ -->
    <footer class="pt-4 pb-8 text-center text-[11px] text-slate-400 space-y-1.5 border-t border-[#163524]">
      <p class="leading-relaxed">
        Dados de clima, vento e ondas: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" class="text-[#E5C384] hover:underline">Open-Meteo</a> (CC BY 4.0).
      </p>
      <p class="leading-relaxed">
        Marés: <span class="text-slate-300 font-medium">Marinha do Brasil (DHN/CHM)</span>.
      </p>
      <p class="text-[10px] text-slate-500 pt-1">
        YBY versus • Praça Pública Digital • Conhecimento Livre & Astronomia Soberana
      </p>
    </footer>
  `;

  // Recria os ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function formatDate(date) {
  if (!date || isNaN(date.getTime())) return '--/--';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

function formatDateWithHour(date) {
  if (!date || isNaN(date.getTime())) return '--/--';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatTime(date) {
  if (!date || isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function setupEventListeners() {
  // Expor funções globais no window para chamadas inline seguras
  window.selectCity = (lat, lon, name, state) => {
    loadDataForLocation({
      name,
      state,
      country: 'Brasil',
      lat: roundCoord(lat),
      lon: roundCoord(lon)
    });
  };

  window.retryLoad = (force = false) => {
    loadDataForLocation(currentLocation, force);
  };

  window.changeWindUnit = (unit) => {
    currentWindUnit = unit;
    setWindUnit(unit);
    if (currentWeatherData) {
      loadDataForLocation(currentLocation, false);
    }
  };

  window.toggleLocationModal = () => {
    const modal = document.getElementById('modal-location');
    if (modal) modal.classList.toggle('hidden');
  };

  window.saveCurrentAsFavorite = () => {
    saveFavorite(currentLocation);
    renderFavoritesBar();
    showToast(`${currentLocation.name} salvo nos favoritos!`);
  };

  window.useGpsLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada no seu navegador.');
      return;
    }

    showToast('Solicitando localização com precisão preservada...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = roundCoord(pos.coords.latitude);
        const lon = roundCoord(pos.coords.longitude);
        loadDataForLocation({
          name: 'Minha Localização',
          state: '',
          country: 'Brasil',
          lat,
          lon
        });
        window.toggleLocationModal();
        showToast('Localização atualizada com sucesso!');
      },
      (err) => {
        console.warn('Erro GPS:', err);
        showToast('Não foi possível obter a localização. Permissão recusada.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  window.searchCityInput = async (e) => {
    const query = e.target.value;
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (query.trim().length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    resultsContainer.innerHTML = '<div class="p-3 text-xs text-slate-400">Buscando cidades...</div>';
    const results = await searchCities(query);

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="p-3 text-xs text-slate-400">Nenhuma cidade encontrada.</div>';
      return;
    }

    resultsContainer.innerHTML = results.map(r => `
      <button onclick="window.selectFromSearch(${r.lat}, ${r.lon}, '${r.name.replace(/'/g, "\\'")}', '${r.state.replace(/'/g, "\\'")}')" 
        class="w-full text-left p-3 rounded-2xl bg-[#06120C] hover:bg-[#10261D] border border-[#163524] text-xs text-slate-200 flex items-center justify-between tap-active min-h-[44px]">
        <div>
          <strong class="text-[#FFF6E5]">${r.name}</strong>
          <span class="text-slate-400 text-[11px] block">${r.state ? r.state + ', ' : ''}${r.country}</span>
        </div>
        <span class="text-[10px] text-[#E5C384]">${r.lat}°, ${r.lon}°</span>
      </button>
    `).join('');
  };

  window.selectFromSearch = (lat, lon, name, state) => {
    loadDataForLocation({
      name,
      state,
      country: 'Brasil',
      lat: roundCoord(lat),
      lon: roundCoord(lon)
    });
    window.toggleLocationModal();
  };
}

function showToast(msg) {
  const toast = document.getElementById('app-toast');
  const text = document.getElementById('app-toast-text');
  if (toast && text) {
    text.innerText = msg;
    toast.classList.remove('hidden');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }
}
