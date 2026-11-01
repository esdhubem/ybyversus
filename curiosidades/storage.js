/**
 * Armazenamento Local, Cache e Privacidade
 * - Não envia histórico de localização para nenhum servidor
 * - Arredonda coordenadas em 2 casas decimais (proteção de privacidade)
 * - Cache de 30 a 60 min com suporte offline
 * - Até 5 cidades favoritas no localStorage
 */

const STORAGE_KEYS = {
  FAVORITES: 'yby_curiosidades_favorites',
  LAST_LOCATION: 'yby_curiosidades_last_location',
  WIND_UNIT: 'yby_curiosidades_wind_unit',
  CACHE_PREFIX: 'yby_cache_'
};

export const CidadesPadrao = [
  { name: 'São Paulo', state: 'SP', country: 'Brasil', lat: -23.55, lon: -46.64, isCoast: false },
  { name: 'Rio de Janeiro', state: 'RJ', country: 'Brasil', lat: -22.91, lon: -43.17, isCoast: true, porto: 'rio-de-janeiro' },
  { name: 'Salvador', state: 'BA', country: 'Brasil', lat: -12.97, lon: -38.51, isCoast: true, porto: 'salvador' },
  { name: 'Florianópolis', state: 'SC', country: 'Brasil', lat: -27.59, lon: -48.55, isCoast: true, porto: 'florianopolis' },
  { name: 'Brasília', state: 'DF', country: 'Brasil', lat: -15.79, lon: -47.88, isCoast: false }
];

export function roundCoord(val) {
  return Math.round(Number(val) * 100) / 100;
}

export function getSavedFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return CidadesPadrao.slice(0, 3);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, 5) : CidadesPadrao.slice(0, 3);
  } catch (e) {
    return CidadesPadrao.slice(0, 3);
  }
}

export function saveFavorite(place) {
  try {
    const favorites = getSavedFavorites();
    const cleanPlace = {
      name: place.name,
      state: place.state || '',
      country: place.country || 'Brasil',
      lat: roundCoord(place.lat),
      lon: roundCoord(place.lon),
      isCoast: Boolean(place.isCoast),
      porto: place.porto || null
    };

    const existsIndex = favorites.findIndex(f => 
      Math.abs(f.lat - cleanPlace.lat) < 0.05 && Math.abs(f.lon - cleanPlace.lon) < 0.05
    );

    if (existsIndex >= 0) {
      favorites.splice(existsIndex, 1);
    }
    favorites.unshift(cleanPlace);

    // Limita estritamente em 5 favoritos
    const trimmed = favorites.slice(0, 5);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(trimmed));
    return trimmed;
  } catch (e) {
    console.warn('[YBY Storage] Falha ao salvar favorito:', e);
    return getSavedFavorites();
  }
}

export function removeFavorite(lat, lon) {
  try {
    const rLat = roundCoord(lat);
    const rLon = roundCoord(lon);
    const favorites = getSavedFavorites().filter(f => 
      !(Math.abs(f.lat - rLat) < 0.05 && Math.abs(f.lon - rLon) < 0.05)
    );
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return favorites;
  } catch (e) {
    return getSavedFavorites();
  }
}

export function getLastLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    if (!raw) return CidadesPadrao[0];
    return JSON.parse(raw);
  } catch (e) {
    return CidadesPadrao[0];
  }
}

export function setLastLocation(place) {
  try {
    const clean = {
      name: place.name,
      state: place.state || '',
      country: place.country || 'Brasil',
      lat: roundCoord(place.lat),
      lon: roundCoord(place.lon),
      isCoast: Boolean(place.isCoast),
      porto: place.porto || null
    };
    localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(clean));
  } catch (e) {}
}

export function getWindUnit() {
  try {
    return localStorage.getItem(STORAGE_KEYS.WIND_UNIT) || 'kmh'; // 'kmh' | 'kt' | 'ms'
  } catch (e) {
    return 'kmh';
  }
}

export function setWindUnit(unit) {
  try {
    localStorage.setItem(STORAGE_KEYS.WIND_UNIT, unit);
  } catch (e) {}
}

/**
 * Cache HTTP local no localStorage com validade e suporte offline
 * TTL padrão: 45 minutos (entre 30 e 60 min)
 */
export function getCachedData(key) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    const now = Date.now();
    const isExpired = now - entry.timestamp > (entry.ttlMs || 45 * 60 * 1000);

    return {
      data: entry.data,
      timestamp: entry.timestamp,
      isExpired,
      formattedTime: new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }).format(new Date(entry.timestamp))
    };
  } catch (e) {
    return null;
  }
}

export function setCachedData(key, data, ttlMinutes = 45) {
  try {
    const entry = {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMinutes * 60 * 1000
    };
    localStorage.setItem(STORAGE_KEYS.CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    console.warn('[YBY Cache] Armazenamento cheio ou desabilitado:', e);
  }
}

