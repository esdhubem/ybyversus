/**
 * Camada de Abstração de Dados do Feed
 * 
 * Isola a fonte de dados (hoje JSON local estático de demonstração, amanhã API federada)
 * da lógica pura do Feed Mixer.
 */

let cachedSamplePool = null;

export async function fetchFeedPool(tabName = 'videos_curtos') {
  // Se for vídeos curtos, carrega a amostra estática oficial
  if (tabName === 'videos_curtos') {
    if (cachedSamplePool) return [...cachedSamplePool];

    try {
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        const response = await fetch('./data/feed_curtos_sample.json');
        if (response.ok) {
          cachedSamplePool = await response.json();
          return [...cachedSamplePool];
        }
      }
    } catch (e) {
      console.warn('[Feed Data] Falha ao carregar feed_curtos_sample.json via fetch:', e);
    }
  }

  // Fallback seguro em memória para demonstração e ambientes de teste
  return [
    {
      id: 'vc-fb-01',
      title: 'Cultivo Ancestral de Milho Crioulo',
      theme: 'agrofloresta',
      duration: 45,
      videoUrl: '',
      thumbnailUrl: 'assets/card-floresta-sagrada.jpg',
      createdAt: new Date().toISOString(),
      creator: {
        id: 'cr-tiago',
        name: 'Tiago Guajajara',
        handle: '@tiago.raiz',
        followersCount: 450,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    },
    {
      id: 'vc-fb-02',
      title: 'Cantos de Cura e Preservação',
      theme: 'musica_ancestral',
      duration: 55,
      videoUrl: '',
      thumbnailUrl: 'assets/card-sol-ancestral.jpg',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      creator: {
        id: 'cr-benvinda',
        name: 'Benvinda Pataxó',
        handle: '@benvinda.cantos',
        followersCount: 4200,
        createdAt: '2025-01-01T00:00:00Z'
      }
    }
  ];
}

