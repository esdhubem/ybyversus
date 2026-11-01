/**
 * Motor de Distribuição Justa de Conteúdo ("Feed Mixer")
 * 
 * Implementação matemática e ética:
 * 1. Método do Maior Resto (Largest Remainder) com desempate determinístico;
 * 2. Elegibilidade estrita (exclusão de vistos, denunciados, ocultos e bloqueados);
 * 3. Preenchimento por ordem de escassez (categoria mais restrita primeiro);
 * 4. Teto máximo por criador (padrão 2 itens por página);
 * 5. Redistribuição proporcional de sobras;
 * 6. Embaralhamento determinístico Fisher-Yates com PRNG (Mulberry32).
 */

import { FEED_CATEGORIES, CATEGORY_PRIORITY, feedMixConfig } from './config.js';

/**
 * Gerador Pseudoaleatório Mulberry32 (rápido, determinístico e com distribuição uniforme)
 */
export function createPRNG(seed = 123456789) {
  let s = Math.abs(Math.floor(seed)) || 123456789;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Algoritmo Fisher-Yates com gerador pseudoaleatório parametrizado
 */
export function shuffleFisherYates(array, randomFn = Math.random) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calcula a cota exata por categoria pelo Método do Maior Resto (Largest Remainder Method)
 * com desempate determinístico pela lista CATEGORY_PRIORITY.
 */
export function calculateQuotas(weights, targetSize, categoriesOrder = CATEGORY_PRIORITY) {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalWeight <= 0) return {};

  const quotas = {};
  const remainders = [];
  let allocated = 0;

  for (const cat of categoriesOrder) {
    const w = weights[cat] || 0;
    const exact = (w * targetSize) / totalWeight;
    const integerPart = Math.floor(exact);
    const remainder = exact - integerPart;

    quotas[cat] = integerPart;
    allocated += integerPart;
    remainders.push({ cat, remainder });
  }

  let unallocated = targetSize - allocated;

  // Ordena por maior resto. Em caso de empate, mantém a prioridade determinística de CATEGORY_PRIORITY
  remainders.sort((a, b) => {
    if (Math.abs(b.remainder - a.remainder) > 0.000001) {
      return b.remainder - a.remainder;
    }
    return categoriesOrder.indexOf(a.cat) - categoriesOrder.indexOf(b.cat);
  });

  for (let i = 0; i < unallocated; i++) {
    const target = remainders[i % remainders.length];
    quotas[target.cat] = (quotas[target.cat] || 0) + 1;
  }

  return quotas;
}

/**
 * Classifica a faixa de alcance de um criador
 */
export function getCreatorTier(followersCount, tiersConfig) {
  const count = Number(followersCount) || 0;
  if (count <= tiersConfig.pequeno.max) return 'pequeno';
  if (count <= tiersConfig.medio.max) return 'medio';
  return 'grande';
}

/**
 * Verifica se um criador é novo (conta criada há menos de N dias)
 */
export function isNewCreator(creatorCreatedAt, maxDays = 30, referenceDate = new Date()) {
  if (!creatorCreatedAt) return false;
  const created = new Date(creatorCreatedAt).getTime();
  const ref = new Date(referenceDate).getTime();
  const diffDays = (ref - created) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= maxDays;
}

/**
 * FeedMixer: Cria uma página de feed balanceada e justa
 */
export class FeedMixer {
  constructor(tabName = 'videos_curtos', customConfig = null) {
    this.tabName = tabName;
    this.config = customConfig || feedMixConfig[tabName] || feedMixConfig.videos_curtos;
  }

  /**
   * Monta uma página do feed distribuída
   * 
   * @param {Object} params
   * @param {Array} params.pool - Conjunto total de itens disponíveis
   * @param {Array|Set} params.seenSessionIds - IDs de itens já exibidos na sessão
   * @param {Array|Set} params.excludedIds - IDs ocultos ou denunciados
   * @param {Array|Set} params.blockedCreators - Criadores bloqueados
   * @param {Array} params.seenThemes - Temas já vistos pelo usuário (para diversidade temática)
   * @param {number} params.seed - Semente para reproduzibilidade
   * @param {Date} params.referenceDate - Data base de cálculo
   */
  mixPage({
    pool = [],
    seenSessionIds = new Set(),
    excludedIds = new Set(),
    blockedCreators = new Set(),
    seenThemes = [],
    seed = Date.now(),
    referenceDate = new Date()
  } = {}) {
    const prng = createPRNG(seed);
    const seenSet = seenSessionIds instanceof Set ? seenSessionIds : new Set(seenSessionIds);
    const excludedSet = excludedIds instanceof Set ? excludedIds : new Set(excludedIds);
    const blockedSet = blockedCreators instanceof Set ? blockedCreators : new Set(blockedCreators);
    const seenThemesNormalized = new Set((seenThemes || []).map(t => String(t).trim().toLowerCase()));

    // 1. FILTRO DE ELEGIBILIDADE
    const eligiblePool = pool.filter(item => {
      if (!item || !item.id) return false;
      const strId = String(item.id);
      if (seenSet.has(strId)) return false;
      if (excludedSet.has(strId)) return false;
      if (item.creator && blockedSet.has(String(item.creator.id))) return false;
      return true;
    });

    if (eligiblePool.length === 0) {
      return {
        items: [],
        quotas: {},
        stats: { totalEligible: 0, requestedSize: this.config.pageSize }
      };
    }

    const pageSize = Math.min(this.config.pageSize, eligiblePool.length);
    const initialQuotas = calculateQuotas(this.config.weights, pageSize);

    // 2. AGRUPAMENTO POR CANDIDATOS DE CADA CATEGORIA
    const candidates = {
      [FEED_CATEGORIES.NOVIDADES]: [],
      [FEED_CATEGORIES.VOZES_PLURAIS]: [],
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: [],
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: [],
      [FEED_CATEGORIES.SORTEIO]: []
    };

    // Novidades: ordenados do mais recente para o mais antigo
    candidates[FEED_CATEGORIES.NOVIDADES] = [...eligiblePool].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.publishedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.publishedAt || 0).getTime();
      return dateB - dateA;
    });

    // Vozes Plurais: equilíbrio entre criadores pequeno, médio e grande
    const tiers = { pequeno: [], medio: [], grande: [] };
    eligiblePool.forEach(item => {
      const followers = item.creator ? item.creator.followersCount : 0;
      const tier = getCreatorTier(followers, this.config.reachTiers);
      tiers[tier].push(item);
    });

    // Embaralha cada faixa com o PRNG e intercala para equilíbrio
    const shuffledPequeno = shuffleFisherYates(tiers.pequeno, prng);
    const shuffledMedio = shuffleFisherYates(tiers.medio, prng);
    const shuffledGrande = shuffleFisherYates(tiers.grande, prng);
    const maxTierLen = Math.max(shuffledPequeno.length, shuffledMedio.length, shuffledGrande.length);
    for (let i = 0; i < maxTierLen; i++) {
      if (shuffledPequeno[i]) candidates[FEED_CATEGORIES.VOZES_PLURAIS].push(shuffledPequeno[i]);
      if (shuffledMedio[i]) candidates[FEED_CATEGORIES.VOZES_PLURAIS].push(shuffledMedio[i]);
      if (shuffledGrande[i]) candidates[FEED_CATEGORIES.VOZES_PLURAIS].push(shuffledGrande[i]);
    }

    // Diversidade Temática: itens com tema fora do histórico visto
    candidates[FEED_CATEGORIES.DIVERSIDADE_TEMATICA] = shuffleFisherYates(
      eligiblePool.filter(item => {
        const theme = item.theme || item.topic || item.category;
        if (!theme) return false;
        return !seenThemesNormalized.has(String(theme).trim().toLowerCase());
      }),
      prng
    );

    // Novos Integrantes: criadores com conta com menos de N dias
    candidates[FEED_CATEGORIES.NOVOS_INTEGRANTES] = shuffleFisherYates(
      eligiblePool.filter(item => {
        const creatorCreated = item.creator ? item.creator.createdAt : null;
        return isNewCreator(creatorCreated, this.config.newCreatorMaxDays, referenceDate);
      }),
      prng
    );

    // Sorteio Justo: todos os itens elegíveis uniformemente embaralhados
    candidates[FEED_CATEGORIES.SORTEIO] = shuffleFisherYates(eligiblePool, prng);

    // 3. ORDEM DE ESCASSEZ
    // Categorias com menos itens elegíveis são preenchidas primeiro para evitar repetições
    const categoryScarcity = Object.keys(candidates).sort((catA, catB) => {
      const countA = candidates[catA].length;
      const countB = candidates[catB].length;
      if (countA !== countB) return countA - countB;
      return CATEGORY_PRIORITY.indexOf(catA) - CATEGORY_PRIORITY.indexOf(catB);
    });

    // 4. PREENCHIMENTO RESPEITANDO TETO POR CRIADOR E VAGA ÚNICA
    const selectedItems = [];
    const usedItemIds = new Set();
    const creatorItemCount = new Map();
    const finalQuotasAchieved = {};
    const maxPerCreator = this.config.maxPerCreator || 2;

    let unfulfilledDeficit = 0;

    for (const cat of categoryScarcity) {
      const quota = initialQuotas[cat] || 0;
      let count = 0;

      for (const item of candidates[cat]) {
        if (count >= quota) break;
        if (usedItemIds.has(item.id)) continue;

        const creatorId = item.creator ? String(item.creator.id) : 'unknown';
        const currentCount = creatorItemCount.get(creatorId) || 0;

        if (currentCount < maxPerCreator) {
          usedItemIds.add(item.id);
          creatorItemCount.set(creatorId, currentCount + 1);
          selectedItems.push({
            ...item,
            motivo: this.config.labels[cat],
            categoria_distribuicao: cat,
            motivo_descricao: this.config.descriptions ? this.config.descriptions[cat] : ''
          });
          count++;
        }
      }

      finalQuotasAchieved[cat] = count;
      unfulfilledDeficit += (quota - count);
    }

    // 5. REDISTRIBUIÇÃO DE ESCASSEZ
    // Se alguma categoria não atingiu sua cota, preenchemos com os itens elegíveis restantes
    if (selectedItems.length < pageSize) {
      for (const item of candidates[FEED_CATEGORIES.SORTEIO]) {
        if (selectedItems.length >= pageSize) break;
        if (usedItemIds.has(item.id)) continue;

        const creatorId = item.creator ? String(item.creator.id) : 'unknown';
        const currentCount = creatorItemCount.get(creatorId) || 0;

        if (currentCount < maxPerCreator) {
          usedItemIds.add(item.id);
          creatorItemCount.set(creatorId, currentCount + 1);
          selectedItems.push({
            ...item,
            motivo: this.config.labels[FEED_CATEGORIES.SORTEIO],
            categoria_distribuicao: FEED_CATEGORIES.SORTEIO,
            motivo_descricao: this.config.descriptions ? this.config.descriptions[FEED_CATEGORIES.SORTEIO] : ''
          });
          finalQuotasAchieved[FEED_CATEGORIES.SORTEIO] = (finalQuotasAchieved[FEED_CATEGORIES.SORTEIO] || 0) + 1;
        }
      }
    }

    // 6. EMBARALHAMENTO FINAL COM FISHER-YATES
    // As categorias são intercaladas na página de forma pseudoaleatória para manter fluidez
    const finalShuffled = shuffleFisherYates(selectedItems, prng);

    return {
      items: finalShuffled,
      quotasRequested: initialQuotas,
      quotasAchieved: finalQuotasAchieved,
      stats: {
        totalEligible: eligiblePool.length,
        delivered: finalShuffled.length,
        pageSize
      }
    };
  }
}
