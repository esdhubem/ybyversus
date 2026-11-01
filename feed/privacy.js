/**
 * Módulo de Privacidade & Histórico Local do Feed Mixer
 * 
 * Todo o cálculo de diversidade temática é executado estritamente NO APARELHO.
 * Nenhum dado de histórico de navegação, temas ou criadores é enviado a servidores externos.
 */

const STORAGE_KEYS = {
  THEMES: 'yby_local_themes_v1',
  SEEN_SESSION: 'yby_seen_session_v1',
  FLAGGED: 'yby_flagged_items_v1',
  BLOCKED_CREATORS: 'yby_blocked_creators_v1',
  HIDDEN: 'yby_hidden_items_v1'
};

// Histórico em memória para fallback caso o localStorage esteja desabilitado
const memoryStore = {
  themes: new Set(),
  seenSession: new Set(),
  flagged: new Set(),
  blockedCreators: new Set(),
  hidden: new Set()
};

function isStorageAvailable() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

function loadSet(key) {
  if (!isStorageAvailable()) return new Set();
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function saveSet(key, set) {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch (e) {
    console.warn('[YBY Privacy] Falha ao persistir localmente:', e);
  }
}

export const LocalPrivacyStore = {
  /**
   * Obtém os temas vistos recentemente pelo usuário
   */
  getSeenThemes() {
    if (!isStorageAvailable()) return Array.from(memoryStore.themes);
    return Array.from(loadSet(STORAGE_KEYS.THEMES));
  },

  /**
   * Registra a visualização de um tema no aparelho
   */
  recordThemeSeen(theme) {
    if (!theme) return;
    const cleanTheme = String(theme).trim().toLowerCase();
    if (!isStorageAvailable()) {
      memoryStore.themes.add(cleanTheme);
      return;
    }
    const set = loadSet(STORAGE_KEYS.THEMES);
    set.add(cleanTheme);
    saveSet(STORAGE_KEYS.THEMES, set);
  },

  /**
   * Obtém os IDs de itens já vistos na sessão atual
   */
  getSeenInSession() {
    if (!isStorageAvailable()) return memoryStore.seenSession;
    return loadSet(STORAGE_KEYS.SEEN_SESSION);
  },

  /**
   * Marca itens como vistos na sessão atual para evitar repetição
   */
  markSeenInSession(itemIds) {
    const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
    if (!isStorageAvailable()) {
      ids.forEach(id => memoryStore.seenSession.add(String(id)));
      return;
    }
    const set = loadSet(STORAGE_KEYS.SEEN_SESSION);
    ids.forEach(id => set.add(String(id)));
    saveSet(STORAGE_KEYS.SEEN_SESSION, set);
  },

  /**
   * Limpa os itens vistos na sessão (ex: ao reiniciar o feed)
   */
  clearSessionSeen() {
    memoryStore.seenSession.clear();
    if (isStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEYS.SEEN_SESSION);
    }
  },

  /**
   * Itens ocultos, denunciados ou de criadores bloqueados
   */
  getExcludedIds() {
    const flagged = isStorageAvailable() ? loadSet(STORAGE_KEYS.FLAGGED) : memoryStore.flagged;
    const hidden = isStorageAvailable() ? loadSet(STORAGE_KEYS.HIDDEN) : memoryStore.hidden;
    return new Set([...flagged, ...hidden]);
  },

  getBlockedCreators() {
    return isStorageAvailable() ? loadSet(STORAGE_KEYS.BLOCKED_CREATORS) : memoryStore.blockedCreators;
  },

  hideItem(itemId) {
    if (!itemId) return;
    if (!isStorageAvailable()) {
      memoryStore.hidden.add(String(itemId));
      return;
    }
    const set = loadSet(STORAGE_KEYS.HIDDEN);
    set.add(String(itemId));
    saveSet(STORAGE_KEYS.HIDDEN, set);
  },

  flagItem(itemId) {
    if (!itemId) return;
    if (!isStorageAvailable()) {
      memoryStore.flagged.add(String(itemId));
      return;
    }
    const set = loadSet(STORAGE_KEYS.FLAGGED);
    set.add(String(itemId));
    saveSet(STORAGE_KEYS.FLAGGED, set);
  },

  blockCreator(creatorId) {
    if (!creatorId) return;
    if (!isStorageAvailable()) {
      memoryStore.blockedCreators.add(String(creatorId));
      return;
    }
    const set = loadSet(STORAGE_KEYS.BLOCKED_CREATORS);
    set.add(String(creatorId));
    saveSet(STORAGE_KEYS.BLOCKED_CREATORS, set);
  }
};
