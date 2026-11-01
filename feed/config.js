/**
 * Configuração Central da Distribuição Justa de Conteúdo ("Feed Mixer")
 * 
 * Regras e pesos por aba para montagem equitativa de páginas sem algoritmos viciosos.
 * Os pesos de cada aba devem somar exatamente 100.
 */

export const FEED_CATEGORIES = {
  NOVIDADES: 'novidades',
  VOZES_PLURAIS: 'vozes_plurais',
  DIVERSIDADE_TEMATICA: 'diversidade_tematica',
  NOVOS_INTEGRANTES: 'novos_integrantes',
  SORTEIO: 'sorteio'
};

// Ordem estrita de prioridade para desempate determinístico no método do maior resto
export const CATEGORY_PRIORITY = [
  FEED_CATEGORIES.NOVIDADES,
  FEED_CATEGORIES.VOZES_PLURAIS,
  FEED_CATEGORIES.DIVERSIDADE_TEMATICA,
  FEED_CATEGORIES.NOVOS_INTEGRANTES,
  FEED_CATEGORIES.SORTEIO
];

export const feedMixConfig = {
  videos_curtos: {
    pageSize: 20,
    maxPerCreator: 2,
    weights: {
      [FEED_CATEGORIES.NOVIDADES]: 25,
      [FEED_CATEGORIES.VOZES_PLURAIS]: 25,
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 20,
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 15,
      [FEED_CATEGORIES.SORTEIO]: 15
    },
    reachTiers: {
      pequeno: { min: 0, max: 1000 },
      medio: { min: 1001, max: 10000 },
      grande: { min: 10001, max: Infinity }
    },
    newCreatorMaxDays: 30,
    labels: {
      [FEED_CATEGORIES.NOVIDADES]: 'Chegou agora',
      [FEED_CATEGORIES.VOZES_PLURAIS]: 'Vozes diversas',
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 'Fora da bolha',
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 'Boas-vindas',
      [FEED_CATEGORIES.SORTEIO]: 'Surpresa'
    },
    descriptions: {
      [FEED_CATEGORIES.NOVIDADES]: 'Conteúdo recém-publicado na praça (25% da página).',
      [FEED_CATEGORIES.VOZES_PLURAIS]: 'Criadores de pequeno, médio e grande alcance equilibrados (25% da página).',
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 'Temas fora do seu histórico para furar a bolha de repetição (20% da página).',
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 'Criadores com conta recente nos últimos 30 dias (15% da página).',
      [FEED_CATEGORIES.SORTEIO]: 'Sorteio imparcial e uniforme entre todos os criadores elegíveis (15% da página).'
    }
  },

  saberes: {
    pageSize: 15,
    maxPerCreator: 2,
    weights: {
      [FEED_CATEGORIES.NOVIDADES]: 25,
      [FEED_CATEGORIES.VOZES_PLURAIS]: 25,
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 20,
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 15,
      [FEED_CATEGORIES.SORTEIO]: 15
    },
    reachTiers: {
      pequeno: { min: 0, max: 1000 },
      medio: { min: 1001, max: 10000 },
      grande: { min: 10001, max: Infinity }
    },
    newCreatorMaxDays: 30,
    labels: {
      [FEED_CATEGORIES.NOVIDADES]: 'Chegou agora',
      [FEED_CATEGORIES.VOZES_PLURAIS]: 'Vozes diversas',
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 'Fora da bolha',
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 'Boas-vindas',
      [FEED_CATEGORIES.SORTEIO]: 'Surpresa'
    }
  },

  videos_longos: {
    pageSize: 12,
    maxPerCreator: 2,
    weights: {
      [FEED_CATEGORIES.NOVIDADES]: 25,
      [FEED_CATEGORIES.VOZES_PLURAIS]: 25,
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 20,
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 15,
      [FEED_CATEGORIES.SORTEIO]: 15
    },
    reachTiers: {
      pequeno: { min: 0, max: 1000 },
      medio: { min: 1001, max: 10000 },
      grande: { min: 10001, max: Infinity }
    },
    newCreatorMaxDays: 30,
    labels: {
      [FEED_CATEGORIES.NOVIDADES]: 'Chegou agora',
      [FEED_CATEGORIES.VOZES_PLURAIS]: 'Vozes diversas',
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 'Fora da bolha',
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 'Boas-vindas',
      [FEED_CATEGORIES.SORTEIO]: 'Surpresa'
    }
  },

  musica: {
    pageSize: 16,
    maxPerCreator: 2,
    weights: {
      [FEED_CATEGORIES.NOVIDADES]: 25,
      [FEED_CATEGORIES.VOZES_PLURAIS]: 25,
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 20,
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 15,
      [FEED_CATEGORIES.SORTEIO]: 15
    },
    reachTiers: {
      pequeno: { min: 0, max: 1000 },
      medio: { min: 1001, max: 10000 },
      grande: { min: 10001, max: Infinity }
    },
    newCreatorMaxDays: 30,
    labels: {
      [FEED_CATEGORIES.NOVIDADES]: 'Chegou agora',
      [FEED_CATEGORIES.VOZES_PLURAIS]: 'Vozes diversas',
      [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 'Fora da bolha',
      [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 'Boas-vindas',
      [FEED_CATEGORIES.SORTEIO]: 'Surpresa'
    }
  }
};

/**
 * Validador de integridade dos pesos: garante soma 100 em todas as configurações
 */
export function validateConfig(config = feedMixConfig) {
  for (const [tabKey, tabConfig] of Object.entries(config)) {
    const totalWeight = Object.values(tabConfig.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(totalWeight - 100) > 0.001) {
      throw new Error(`Configuração inválida para aba "${tabKey}": pesos somam ${totalWeight}%, devem somar exatamente 100%.`);
    }
  }
  return true;
}

