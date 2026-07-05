const VERSION = '2.3.0';
const CACHE_NAME = 'cue-timer-v2-3-0';
const CORE_ASSETS = [
  './',
  './index.html',
  './cue_timer_v2_3.html',
  './manifest.webmanifest',
  './seimei_program_timer_icon_play_180.png',
  './seimei_program_timer_icon_play_192.png',
  './seimei_program_timer_icon_play_512.png',
  './beep.wav',
  './sounds/electronic/start.wav', './sounds/electronic/stop.wav', './sounds/electronic/reset.wav', './sounds/electronic/step.wav', './sounds/electronic/end.wav',
  './sounds/whistle/start.wav', './sounds/whistle/stop.wav', './sounds/whistle/reset.wav', './sounds/whistle/step.wav', './sounds/whistle/end.wav',
  './sounds/bell/start.wav', './sounds/bell/stop.wav', './sounds/bell/reset.wav', './sounds/bell/step.wav', './sounds/bell/end.wav',
  './sounds/chime/start.wav', './sounds/chime/stop.wav', './sounds/chime/reset.wav', './sounds/chime/step.wav', './sounds/chime/end.wav',
  './sounds/custom/start.wav', './sounds/custom/stop.wav', './sounds/custom/reset.wav', './sounds/custom/step.wav', './sounds/custom/end.wav'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS.map(url => new Request(url, {cache: 'reload'}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('seimei-program-timer-') || key.startsWith('cue-timer-'))
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if(event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))));
  }
});

async function networkFirst(request){
  const cache = await caches.open(CACHE_NAME);
  try{
    const response = await fetch(request, {cache:'no-store'});
    if(response && response.ok) cache.put(request, response.clone());
    return response;
  }catch(e){
    const cached = await caches.match(request);
    return cached || caches.match('./index.html');
  }
}

async function cacheFirst(request){
  const cached = await caches.match(request);
  if(cached) return cached;
  const response = await fetch(request);
  if(response && response.ok){
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const request = event.request;
  const url = new URL(request.url);
  if(url.origin !== location.origin) return;
  if(request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/cue_timer_v2_3.html')){
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});
