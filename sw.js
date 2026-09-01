/* 눌러봐 서비스워커 — 앱과 소리 파일을 저장해 두어 오프라인에서도 열리게 한다 */
const CACHE = 'press-me-v1';
const SHELL = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './sfx/cat1.mp3','./sfx/cat2.mp3','./sfx/cat3.mp3','./sfx/cat4.mp3','./sfx/cat5.mp3',
  './sfx/dog1.mp3','./sfx/dog2.mp3','./sfx/dog3.mp3','./sfx/dog4.mp3','./sfx/dog5.mp3',
  './music/song1.mp3','./music/song2.mp3','./music/song3.mp3','./music/song4.mp3','./music/song5.mp3',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // 소리 파일은 캐시 우선(빨리 나와야 하므로), 나머지는 네트워크 우선
  const isAudio = /\.mp3$/.test(new URL(req.url).pathname);
  if (isAudio) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
    return;
  }
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
