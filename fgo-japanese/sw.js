/* FGO 보이스 일본어 — 오프라인용 (영어앱 sw.js 방식 그대로, 알림 부분은 뺌)
   이 앱 폴더의 파일만 다룬다. Atlas Academy 음성·이미지 같은 다른 주소는 손대지 않는다. */
const CACHE = 'fgojp-v1';
const SHELL = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png',
               './js/store.js','./js/audio.js','./js/app.js',
               './data/characters.json','./data/servant_901100.json','./data/servant_300100.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  /* 저장해둔 옛 파일 말고 늘 새 파일을 받아옵니다 */
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
