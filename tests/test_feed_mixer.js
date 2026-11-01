/**
 * Suíte de Testes Automatizados do Feed Mixer (Distribuição Justa)
 * 
 * Validações obrigatórias:
 * 1. Simulação de 1000 páginas com proporções por categoria;
 * 2. Teto máximo por criador (máximo 2 por página);
 * 3. Reprodutibilidade de semente (seed determinístico);
 * 4. Deduplicação e nenhum item repetido na mesma sessão;
 * 5. Escassez e categorias vazias;
 * 6. Exclusão estrita de itens denunciados, ocultos e bloqueados.
 */

import { FeedMixer, calculateQuotas } from '../feed/mixer.js';
import { feedMixConfig, FEED_CATEGORIES } from '../feed/config.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- TESTES UNITÁRIOS: FEED MIXER (DISTRIBUIÇÃO JUSTA) ---\n');

// 1. Teste do Método do Maior Resto (Quotas)
console.log('1. Testando Método do Maior Resto:');
const quotas20 = calculateQuotas(feedMixConfig.videos_curtos.weights, 20);
assert(quotas20[FEED_CATEGORIES.NOVIDADES] === 5, 'Novidades deve ter cota exata 5 (25%)');
assert(quotas20[FEED_CATEGORIES.VOZES_PLURAIS] === 5, 'Vozes Plurais deve ter cota exata 5 (25%)');
assert(quotas20[FEED_CATEGORIES.DIVERSIDADE_TEMATICA] === 4, 'Diversidade Temática deve ter cota exata 4 (20%)');
assert(quotas20[FEED_CATEGORIES.NOVOS_INTEGRANTES] === 3, 'Novos Integrantes deve ter cota exata 3 (15%)');
assert(quotas20[FEED_CATEGORIES.SORTEIO] === 3, 'Sorteio Justo deve ter cota exata 3 (15%)');

const totalQuotas = Object.values(quotas20).reduce((a, b) => a + b, 0);
assert(totalQuotas === 20, 'Soma das cotas calculadas deve ser exatamente igual a 20');

// Criação de um gerador de itens sintéticos para testes em larga escala
function createSyntheticPool(size = 500) {
  const pool = [];
  const themes = ['agrofloresta', 'musica', 'filosofia', 'artesanato', 'culinaria', 'tecnologia', 'saude', 'danca'];
  const now = Date.now();

  for (let i = 1; i <= size; i++) {
    const creatorIndex = (i % 80) + 1; // 80 criadores distintos
    const isNew = creatorIndex <= 20; // 20 criadores novos
    const followers = (creatorIndex % 3 === 0) ? 25000 : ((creatorIndex % 2 === 0) ? 3500 : 400);

    pool.push({
      id: `syn-${i}`,
      title: `Item Sintético ${i}`,
      theme: themes[i % themes.length],
      createdAt: new Date(now - i * 3600000).toISOString(),
      creator: {
        id: `creator-${creatorIndex}`,
        name: `Criador ${creatorIndex}`,
        followersCount: followers,
        createdAt: isNew ? new Date(now - 10 * 86400000).toISOString() : new Date('2024-01-01').toISOString()
      }
    });
  }
  return pool;
}

// 2. Teste de Reprodutibilidade com Sementes (Seed)
console.log('\n2. Testando Reprodutibilidade com Seed (Mulberry32):');
const testPool = createSyntheticPool(60);
const mixer = new FeedMixer('videos_curtos');

const runA = mixer.mixPage({ pool: testPool, seed: 42 });
const runB = mixer.mixPage({ pool: testPool, seed: 42 });
const runC = mixer.mixPage({ pool: testPool, seed: 9999 });

const idsA = runA.items.map(x => x.id).join(',');
const idsB = runB.items.map(x => x.id).join(',');
const idsC = runC.items.map(x => x.id).join(',');

assert(idsA === idsB, 'Mesma semente (42) deve produzir EXATAMENTE a mesma ordem de itens');
assert(idsA !== idsC, 'Sementes distintas (42 vs 9999) devem gerar ordens diferentes');

// 3. Teste de Teto por Criador (No máximo 2 itens por página)
console.log('\n3. Testando Teto por Criador (máx 2 por página):');
let maxCreatorExceeded = false;
for (let s = 1; s <= 50; s++) {
  const page = mixer.mixPage({ pool: testPool, seed: s });
  const counts = {};
  for (const item of page.items) {
    counts[item.creator.id] = (counts[item.creator.id] || 0) + 1;
    if (counts[item.creator.id] > 2) {
      maxCreatorExceeded = true;
      break;
    }
  }
}
assert(!maxCreatorExceeded, 'Nenhum criador excedeu o teto de 2 itens por página em 50 páginas testadas');

// 4. Teste de Deduplicação e Paginação na Mesma Sessão
console.log('\n4. Testando Deduplicação e Sessão:');
const seenSession = new Set();
const page1 = mixer.mixPage({ pool: testPool, seenSessionIds: seenSession, seed: 101 });
page1.items.forEach(it => seenSession.add(it.id));

const page2 = mixer.mixPage({ pool: testPool, seenSessionIds: seenSession, seed: 102 });
const intersection = page2.items.filter(it => seenSession.has(it.id));
assert(intersection.length === 0, 'Nenhum item da página 1 se repetiu na página 2 da mesma sessão');

// 5. Teste de Exclusão de Itens Ocultos, Denunciados e Bloqueados
console.log('\n5. Testando Filtros de Segurança e Privacidade:');
const excluded = new Set(['syn-1', 'syn-2', 'syn-3']);
const blocked = new Set(['creator-1']);

const safePage = mixer.mixPage({
  pool: testPool,
  excludedIds: excluded,
  blockedCreators: blocked,
  seed: 200
});

const foundExcluded = safePage.items.some(it => excluded.has(it.id));
const foundBlocked = safePage.items.some(it => blocked.has(it.creator.id));
assert(!foundExcluded, 'Itens denunciados/ocultos nunca aparecem na página retornada');
assert(!foundBlocked, 'Itens de criadores bloqueados nunca aparecem na página retornada');

// 6. Teste de Comportamento com Poucos Itens e Categorias Vazias
console.log('\n6. Testando Escassez e Categorias Vazias:');
const tinyPool = testPool.slice(0, 4); // Apenas 4 itens disponíveis
const tinyPage = mixer.mixPage({ pool: tinyPool, seed: 300 });
assert(tinyPage.items.length === 4, `Com 4 itens disponíveis, deve retornar exatamente 4 (Obtido: ${tinyPage.items.length})`);

// Pool sem nenhum criador novo (categoria vazia)
const poolNoNewCreators = testPool.map(it => ({
  ...it,
  creator: { ...it.creator, createdAt: '2023-01-01T00:00:00Z' }
}));
const scarcePage = mixer.mixPage({ pool: poolNoNewCreators, seed: 400 });
assert(scarcePage.items.length === 20, 'Mesmo sem criadores novos, redistribui e entrega página completa com 20 itens');
assert(scarcePage.quotasAchieved[FEED_CATEGORIES.NOVOS_INTEGRANTES] === 0, 'Cota de novos integrantes é 0 quando vazia');
assert(scarcePage.quotasAchieved[FEED_CATEGORIES.SORTEIO] >= 3, 'Vagas restantes são redistribuídas para outras categorias');

// 7. Simulação de 1.000 Páginas com Convergência Estatística das Proporções
console.log('\n7. Simulando 1.000 Páginas para Verificação Estatística de Proporções:');
const largePool = createSyntheticPool(800);
const totalQuotasSum = {
  [FEED_CATEGORIES.NOVIDADES]: 0,
  [FEED_CATEGORIES.VOZES_PLURAIS]: 0,
  [FEED_CATEGORIES.DIVERSIDADE_TEMATICA]: 0,
  [FEED_CATEGORIES.NOVOS_INTEGRANTES]: 0,
  [FEED_CATEGORIES.SORTEIO]: 0
};

const PAGES_COUNT = 1000;
let creatorCeilingBroken = false;

for (let p = 0; p < PAGES_COUNT; p++) {
  const pageResult = mixer.mixPage({
    pool: largePool,
    seed: p + 1000,
    referenceDate: new Date()
  });

  const pageCreatorCounts = {};
  for (const it of pageResult.items) {
    totalQuotasSum[it.categoria_distribuicao] = (totalQuotasSum[it.categoria_distribuicao] || 0) + 1;
    pageCreatorCounts[it.creator.id] = (pageCreatorCounts[it.creator.id] || 0) + 1;
    if (pageCreatorCounts[it.creator.id] > 2) {
      creatorCeilingBroken = true;
    }
  }
}

const totalItemsServed = PAGES_COUNT * 20; // 20.000 itens
const meanNovidades = totalQuotasSum[FEED_CATEGORIES.NOVIDADES] / PAGES_COUNT;
const meanVozes = totalQuotasSum[FEED_CATEGORIES.VOZES_PLURAIS] / PAGES_COUNT;
const meanDiversidade = totalQuotasSum[FEED_CATEGORIES.DIVERSIDADE_TEMATICA] / PAGES_COUNT;
const meanNovos = totalQuotasSum[FEED_CATEGORIES.NOVOS_INTEGRANTES] / PAGES_COUNT;
const meanSorteio = totalQuotasSum[FEED_CATEGORIES.SORTEIO] / PAGES_COUNT;

console.log(`Médias obtidas por página em 1.000 simulações:`);
console.log(`- Novidades: ${meanNovidades.toFixed(2)} (Alvo: 5.00)`);
console.log(`- Vozes Plurais: ${meanVozes.toFixed(2)} (Alvo: 5.00)`);
console.log(`- Diversidade Temática: ${meanDiversidade.toFixed(2)} (Alvo: 4.00)`);
console.log(`- Novos Integrantes: ${meanNovos.toFixed(2)} (Alvo: 3.00)`);
console.log(`- Sorteio Justo: ${meanSorteio.toFixed(2)} (Alvo: 3.00)`);

assert(Math.abs(meanNovidades - 5.0) < 0.1, `Média de Novidades (${meanNovidades}) converge para 5.0`);
assert(Math.abs(meanVozes - 5.0) < 0.1, `Média de Vozes Plurais (${meanVozes}) converge para 5.0`);
assert(Math.abs(meanDiversidade - 4.0) < 0.1, `Média de Diversidade Temática (${meanDiversidade}) converge para 4.0`);
assert(Math.abs(meanNovos - 3.0) < 0.1, `Média de Novos Integrantes (${meanNovos}) converge para 3.0`);
assert(Math.abs(meanSorteio - 3.0) < 0.1, `Média de Sorteio Justo (${meanSorteio}) converge para 3.0`);
assert(!creatorCeilingBroken, 'Em nenhuma das 1.000 páginas o teto de 2 itens por criador foi violado');

console.log(`\n========================================`);
console.log(`RESULTADO FINAL DOS TESTES: ${passed} passaram, ${failed} falharam.`);

if (failed > 0) process.exit(1);

