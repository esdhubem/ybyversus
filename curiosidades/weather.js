/**
 * Cliente da API Open-Meteo (Weather & Geocoding)
 * Licença: CC BY 4.0 - Uso Gratuito e Aberto
 * https://open-meteo.com/
 */

import { roundCoord, getCachedData, setCachedData } from './storage.js';

// Mapeamento de Códigos WMO de Clima
export const WMO_CODES = {
  0: { label: 'Céu Limpo', icon: 'sun', emoji: '☀️' },
  1: { label: 'Predomínio de Sol', icon: 'sun-medium', emoji: '🌤️' },
  2: { label: 'Parcialmente Nublado', icon: 'cloud-sun', emoji: '⛅' },
  3: { label: 'Encoberto', icon: 'cloud', emoji: '☁️' },
  45: { label: 'Nevoeiro', icon: 'cloud-fog', emoji: '🌫️' },
  48: { label: 'Nevoeiro com Geada', icon: 'cloud-fog', emoji: '🌫️' },
  51: { label: 'Garoa Leve', icon: 'cloud-drizzle', emoji: '🌦️' },
  53: { label: 'Garoa Moderada', icon: 'cloud-drizzle', emoji: '🌦️' },
  55: { label: 'Garoa Densa', icon: 'cloud-drizzle', emoji: '🌧️' },
  61: { label: 'Chuva Fraca', icon: 'cloud-rain', emoji: '🌧️' },
  63: { label: 'Chuva Moderada', icon: 'cloud-rain', emoji: '🌧️' },
  65: { label: 'Chuva Forte', icon: 'cloud-rain', emoji: '🌧️' },
  71: { label: 'Neve Fraca', icon: 'snowflake', emoji: '🌨️' },
  77: { label: 'Granizo Leve', icon: 'cloud-hail', emoji: '🌨️' },
  80: { label: 'Pancadas de Chuva Fracas', icon: 'cloud-rain', emoji: '🌦️' },
  81: { label: 'Pancadas de Chuva', icon: 'cloud-rain', emoji: '🌧️' },
  82: { label: 'Pancadas de Chuva Violentas', icon: 'cloud-lightning', emoji: '⛈️' },
  95: { label: 'Tempestade Elétrica', icon: 'cloud-lightning', emoji: '⛈️' },
  96: { label: 'Tempestade com Granizo', icon: 'cloud-lightning', emoji: '⛈️' }
};

export function getWmoInfo(code) {
  return WMO_CODES[code] || { label: 'Instável', icon: 'cloud', emoji: '⛅' };
}

// Rosa dos Ventos: Graus -> Ponto Cardeal
export function degreesToCompass(deg) {
  const points = [
    { pt: 'N', name: 'Norte' },
    { pt: 'NNE', name: 'Norte-Nordeste' },
    { pt: 'NE', name: 'Nordeste' },
    { pt: 'ENE', name: 'Leste-Nordeste' },
    { pt: 'E', name: 'Leste' },
    { pt: 'ESE', name: 'Leste-Sudeste' },
    { pt: 'SE', name: 'Sudeste' },
    { pt: 'SSE', name: 'Sul-Sudeste' },
    { pt: 'S', name: 'Sul' },
    { pt: 'SSO', name: 'Sul-Sudoeste' },
    { pt: 'SO', name: 'Sudoeste' },
    { pt: 'OSO', name: 'Oeste-Sudoeste' },
    { pt: 'O', name: 'Oeste' },
    { pt: 'ONO', name: 'Oeste-Noroeste' },
    { pt: 'NO', name: 'Noroeste' },
    { pt: 'NNO', name: 'Norte-Noroeste' }
  ];
  const idx = Math.round(deg / 22.5) % 16;
  return points[idx];
}

// Conversor de velocidade do vento
export function convertWindSpeed(kmhValue, unit = 'kmh') {
  const val = Number(kmhValue) || 0;
  if (unit === 'kt') {
    return { value: Math.round((val / 1.852) * 10) / 10, unit: 'nós (kt)' };
  } else if (unit === 'ms') {
    return { value: Math.round((val / 3.6) * 10) / 10, unit: 'm/s' };
  }
  return { value: Math.round(val * 10) / 10, unit: 'km/h' };
}

// Classificação do Índice UV
export function getUvClassification(uv) {
  const val = Number(uv) || 0;
  if (val <= 2) return { text: 'Baixo', color: '#1E9E64', advice: 'Risco mínimo ao ar livre.' };
  if (val <= 5) return { text: 'Moderado', color: '#E5C384', advice: 'Use óculos e proteção básica nas horas de pico.' };
  if (val <= 7) return { text: 'Alto', color: '#E6953B', advice: 'Proteção solar essencial. Procure sombra.' };
  if (val <= 10) return { text: 'Muito Alto', color: '#D94343', advice: 'Evite exposição direta entre 10h e 16h.' };
  return { text: 'Extremo', color: '#A855F7', advice: 'Exposição perigosa. Fique em ambientes cobertos.' };
}

/**
 * Busca previsão de Clima e Vento com cache local de 45 minutos
 */
export async function fetchWeatherData(lat, lon, forceRefresh = false) {
  const rLat = roundCoord(lat);
  const rLon = roundCoord(lon);
  const cacheKey = `weather_${rLat}_${rLon}`;

  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached && !cached.isExpired) {
      return {
        ...cached.data,
        isFromCache: true,
        cachedAt: cached.formattedTime
      };
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${rLat}&longitude=${rLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const normalized = {
      lat: rLat,
      lon: rLon,
      current: {
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: Math.round(data.current.relative_humidity_2m),
        rainProb: Math.round(data.current.precipitation_probability || 0),
        wmo: getWmoInfo(data.current.weather_code),
        windSpeedKmh: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        compass: degreesToCompass(data.current.wind_direction_10m),
        uv: data.current.uv_index,
        uvClass: getUvClassification(data.current.uv_index)
      },
      hourly: (data.hourly.time || []).slice(0, 24).map((timeStr, idx) => ({
        time: timeStr,
        temp: Math.round(data.hourly.temperature_2m[idx]),
        rainProb: Math.round(data.hourly.precipitation_probability[idx] || 0),
        windSpeed: data.hourly.wind_speed_10m[idx],
        windDirection: data.hourly.wind_direction_10m[idx]
      })),
      daily: (data.daily.time || []).slice(0, 7).map((dateStr, idx) => ({
        date: dateStr,
        wmo: getWmoInfo(data.daily.weather_code[idx]),
        maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
        minTemp: Math.round(data.daily.temperature_2m_min[idx]),
        rainProb: Math.round(data.daily.precipitation_probability_max[idx] || 0),
        uvMax: data.daily.uv_index_max[idx]
      })),
      isFromCache: false,
      timestamp: Date.now()
    };

    setCachedData(cacheKey, normalized, 45);
    return normalized;

  } catch (err) {
    console.warn('[YBY Weather] Falha na rede, verificando cache de fallback:', err);
    const cached = getCachedData(cacheKey);
    if (cached) {
      return {
        ...cached.data,
        isFromCache: true,
        isOfflineFallback: true,
        cachedAt: cached.formattedTime
      };
    }
    throw err;
  }
}

/**
 * Busca cidades via Open-Meteo Geocoding
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=pt&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map(r => ({
      name: r.name,
      state: r.admin1 || '',
      country: r.country || 'Brasil',
      lat: roundCoord(r.latitude),
      lon: roundCoord(r.longitude)
    }));
  } catch (e) {
    console.warn('[YBY Geocoding] Erro ao pesquisar cidade:', e);
    return [];
  }
}
