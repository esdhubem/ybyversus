// Service Worker - Ybyversus PWA • Praça Pública Digital
const CACHE_NAME = 'ybyversus-cache-v5.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './enciclowiki.html',
  './enciclowiki-mapa-mental.html',
  './bemviver-dashboard.html',
  './livraria.html',
  './trilhadesaberes.html',
  './tema-astronomia.html',
  './tema-genero.html',
  './tema-tecnologia.html',
  './tema-artes.html',
  './tema-filosofia.html',
  './tema-educacao.html',
  './tema-saberes.html',
  './tema-agro.html',
  './tema-etno.html',
  './tema-saude.html',
  './data/trilhas.json',
  './assets/artigos/pensamento-decolonial-thumb.png',
  './assets/vendor/chart.umd.min.js',
  './data/bemviver/indicadores.json',
  './data/bemviver/indicadores.schema.json',
  './data/bemviver/repository.js',
  './bemviver.html',
  './previsaotempoastros.html',
  './previsaotempoastrononia.html',
  './previsaotempoastronomia.html',
  './curiosidades.html',
  './termos_direitos_recados.html',
  './termos_fediverso_musica.html',
  './manifesto_temas_pesquisa.html',
  './MANIFESTO_TEMAS_PESQUISA.md',
  './feed/config.js',
  './feed/mixer.js',
  './feed/privacy.js',
  './feed/data.js',
  './feed/ui.js',
  './data/feed_curtos_sample.json',
  './curiosidades/main.js',
  './curiosidades/astronomy.js',
  './curiosidades/eclipses.js',
  './curiosidades/weather.js',
  './curiosidades/marine.js',
  './curiosidades/solar_system.js',
  './curiosidades/solar_system_ui.js',
  './curiosidades/lunar_time.js',
  './curiosidades/curiosities.js',
  './curiosidades/ui.js',
  './curiosidades/storage.js',
  './curiosidades/suncalc.js',
  './data/mares/porto-do-rio-de-janeiro.json',
  './data/mares/porto-de-santos.json',
  './manifest.json',
  './icons/icon.svg',
  './assets/logo-arara.png',
  './assets/arara-original.jpg',
  './assets/login-araras.jpg',
  './assets/card-floresta-sagrada.jpg',
  './assets/card-mestres-terra.jpg',
  './assets/card-portal-luz.jpg',
  './assets/card-sol-ancestral.jpg',
  './assets/dola-forest.jpg',
  './assets/hero-forest.jpg',
  './assets/cosmic-sky.jpg',
  './assets/logo-ybyversus.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Ybyversus SW] Pré-armazenando recursos fundamentais da Praça Digital');
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          fetch(new Request(url, { cache: 'reload' }))
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch((err) => console.warn('[Ybyversus SW] Falha ao pré-carregar:', url, err))
        )
      );
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Ybyversus SW] Limpando versão de cache obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação com estratégia Network-First com Fallback elegante para offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Não interceptar streamings de mídia de grande porte ou CDNs de terceiros com range
  if (
    event.request.headers.get('range') ||
    url.pathname.endsWith('.mp4') ||
    url.origin.includes('youtube.com') ||
    url.origin.includes('peertube')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
