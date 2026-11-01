/**
 * Interface do Feed Mixer & Rolagem Contínua
 * 
 * - Renderização de itens com badge e botão discreto "Por que estou vendo isso?"
 * - Modal contextual de transparência algorítmica
 * - Rolagem infinita com pré-carregamento para Vídeos Curtos
 */

import { FeedMixer } from './mixer.js';
import { fetchFeedPool } from './data.js';
import { LocalPrivacyStore } from './privacy.js';

let activeMixer = null;
let currentTab = 'videos_curtos';
let isLoadingNextPage = false;
let hasMoreItems = true;
let sessionSeed = Math.floor(Math.random() * 1000000) + 1;

export async function initFeedMixerUI(containerId = 'feed-container', tabName = 'videos_curtos') {
  currentTab = tabName;
  activeMixer = new FeedMixer(tabName);
  const container = document.getElementById(containerId);
  if (!container) return;

  // Carrega a primeira página
  await loadNextPage(container, true);

  // Configura observador de rolagem contínua para pré-carregamento
  setupInfiniteScroll(container);
}

export async function loadNextPage(container, isFirstPage = false) {
  if (isLoadingNextPage || !hasMoreItems) return;
  isLoadingNextPage = true;

  try {
    const pool = await fetchFeedPool(currentTab);
    const seenSessionIds = LocalPrivacyStore.getSeenInSession();
    const excludedIds = LocalPrivacyStore.getExcludedIds();
    const blockedCreators = LocalPrivacyStore.getBlockedCreators();
    const seenThemes = LocalPrivacyStore.getSeenThemes();

    const pageResult = activeMixer.mixPage({
      pool,
      seenSessionIds,
      excludedIds,
      blockedCreators,
      seenThemes,
      seed: sessionSeed++
    });

    if (pageResult.items.length === 0) {
      hasMoreItems = false;
      if (isFirstPage) {
        container.innerHTML = `
          <div class="text-center py-12 text-slate-400 space-y-2">
            <span class="text-2xl">🌱</span>
            <p class="text-xs">Nenhum conteúdo novo no momento. Todos os saberes desta sessão já foram apreciados!</p>
          </div>
        `;
      }
      return;
    }

    // Marca como vistos na sessão para garantir não repetição
    const newIds = pageResult.items.map(it => it.id);
    LocalPrivacyStore.markSeenInSession(newIds);

    // Registra os temas vistos no histórico local
    pageResult.items.forEach(it => {
      if (it.theme) LocalPrivacyStore.recordThemeSeen(it.theme);
    });

    const itemsHtml = pageResult.items.map(it => renderFeedItemCard(it)).join('');

    if (isFirstPage) {
      container.innerHTML = itemsHtml;
    } else {
      container.insertAdjacentHTML('beforeend', itemsHtml);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  } catch (error) {
    console.error('[Feed Mixer UI] Erro ao carregar página de feed:', error);
  } finally {
    isLoadingNextPage = false;
  }
}

function setupInfiniteScroll(container) {
  const scrollElement = container.closest('.app-screen-scroll') || window;

  const handleScroll = () => {
    let scrollBottom = 0;
    if (scrollElement === window) {
      scrollBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
    } else {
      scrollBottom = scrollElement.scrollHeight - (scrollElement.scrollTop + scrollElement.clientHeight);
    }

    // Pré-carrega quando faltar 350px para o final
    if (scrollBottom < 350 && !isLoadingNextPage && hasMoreItems) {
      loadNextPage(container, false);
    }
  };

  scrollElement.addEventListener('scroll', handleScroll, { passive: true });
}

export function renderFeedItemCard(item) {
  const creator = item.creator || { name: 'Criador Ancestral', handle: '@yby' };
  const badgeColor = {
    'Chegou agora': 'text-[#2DC47F] bg-emerald-500/10 border-emerald-500/30',
    'Vozes diversas': 'text-[#E5C384] bg-amber-500/10 border-amber-500/30',
    'Fora da bolha': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    'Boas-vindas': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    'Surpresa': 'text-amber-300 bg-amber-400/10 border-amber-400/30'
  }[item.motivo] || 'text-slate-300 bg-slate-700/20 border-slate-700/40';

  return `
    <article class="feed-item rounded-3xl bg-[#0B2016] border border-[#163524] overflow-hidden space-y-3 p-4 transition-all" data-item-id="${item.id}">
      <!-- Cabeçalho do Criador + Transparência -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <img src="${creator.avatar || 'assets/card-sol-ancestral.jpg'}" alt="${creator.name}" class="w-9 h-9 rounded-full object-cover border border-[#E5C384]/40" onerror="this.src='assets/card-sol-ancestral.jpg'">
          <div>
            <h4 class="text-xs font-bold text-[#FFF6E5]">${creator.name}</h4>
            <span class="text-[10.5px] text-slate-400 block">${creator.handle}</span>
          </div>
        </div>

        <!-- Botão Discreto: Por que estou vendo isso? -->
        <button onclick="window.showWhyAmISeeingThis('${encodeURIComponent(JSON.stringify({
          titulo: item.title,
          motivo: item.motivo,
          categoria: item.categoria_distribuicao,
          descricao: item.motivo_descricao
        }))}')" class="flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${badgeColor} hover:brightness-125 transition-all tap-active" title="Entenda a distribuição justa deste conteúdo">
          <i data-lucide="help-circle" class="w-3 h-3"></i>
          <span>${item.motivo}</span>
        </button>
      </div>

      <!-- Mídia / Thumbnail -->
      <div class="relative aspect-video rounded-2xl overflow-hidden bg-[#06120C] border border-[#163524]">
        <img src="${item.thumbnailUrl || 'assets/hero-forest.jpg'}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.src='assets/hero-forest.jpg'">
        <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-slate-200">
          ${item.duration ? `${item.duration}s` : 'Vídeo'}
        </div>
      </div>

      <!-- Título & Tag Temática -->
      <div class="space-y-1">
        <h3 class="text-xs font-bold text-[#FFF6E5] leading-snug">${item.title}</h3>
        <div class="flex items-center justify-between pt-1">
          <span class="text-[10px] text-[#A1C1B0] uppercase tracking-wider">#${item.theme || 'cultura'}</span>
          <button onclick="window.hideOrFlagFeedItem('${item.id}')" class="text-slate-500 hover:text-slate-300 p-1 text-[10px]" title="Ocultar item">
            <i data-lucide="eye-off" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

// Manipuladores Globais de Interface
if (typeof window !== 'undefined') {
  window.showWhyAmISeeingThis = (jsonString) => {
    try {
      const data = JSON.parse(decodeURIComponent(jsonString));
      const modal = document.getElementById('modal-why-seeing');
      if (!modal) {
        // Cria a modal dinamicamente se não existir no DOM
        const modalEl = document.createElement('div');
        modalEl.id = 'modal-why-seeing';
        modalEl.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4';
        modalEl.setAttribute('role', 'dialog');
        modalEl.setAttribute('aria-modal', 'true');
        modalEl.innerHTML = `
          <div class="bg-[#0A1C14] rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-amber-500/30 space-y-3 text-slate-200">
            <div class="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <div class="flex items-center gap-2">
                <span class="text-base">⚖️</span>
                <h3 class="font-bold text-xs text-[#FFF6E5]">Por que estou vendo isso?</h3>
              </div>
              <button onclick="document.getElementById('modal-why-seeing').classList.add('hidden')" class="text-slate-400 hover:text-white p-1">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
            
            <div class="space-y-2 text-xs">
              <p class="text-slate-300 leading-relaxed" id="modal-why-text"></p>
              <div class="p-2.5 rounded-xl bg-[#06120C] border border-amber-500/20 text-[11px] text-[#E5C384]">
                Este item ocupa uma cota garantida pelo <strong>YBY versus</strong>. Nenhuma empresa pagou para impulsionar este conteúdo e nenhum perfil de vício foi usado.
              </div>
            </div>

            <button onclick="document.getElementById('modal-why-seeing').classList.add('hidden')" class="w-full py-2.5 rounded-full bg-gradient-to-r from-[#D8AC52] to-[#9C7323] text-black text-xs font-bold tap-active transition-all">
              Compreendido
            </button>
          </div>
        `;
        document.body.appendChild(modalEl);
      }

      const modalRef = document.getElementById('modal-why-seeing');
      const textRef = document.getElementById('modal-why-text');
      if (textRef) {
        textRef.innerHTML = `
          Você está vendo <strong>"${data.titulo}"</strong> porque ele entrou na cota de 
          <span class="text-[#E5C384] font-bold">${data.motivo}</span>:<br>
          <span class="text-slate-400 mt-1 block">${data.descricao}</span>
        `;
      }
      modalRef.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.warn('Erro ao abrir modal de transparência:', e);
    }
  };

  window.hideOrFlagFeedItem = (itemId) => {
    LocalPrivacyStore.hideItem(itemId);
    const card = document.querySelector(`[data-item-id="${itemId}"]`);
    if (card) {
      card.style.opacity = '0.3';
      card.style.pointerEvents = 'none';
      setTimeout(() => card.remove(), 250);
    }
  };
}
