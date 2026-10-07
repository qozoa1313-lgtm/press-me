/* 오늘 딱 한 문장 — 오프라인 + 아침 알림 */
const CACHE = 'oneline-v3';
const SHELL = ['./','./index.html','./sentences.js','./manifest.json','./icon-192.png','./icon-512.png'];

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

/* 깃허브가 보낸 아침 알림 */
self.addEventListener('push', e => {
  let d = { title: '오늘 딱 한 문장', body: '오늘 카드 한 장 열어볼까요?' };
  try { if (e.data) d = Object.assign(d, e.data.json()); } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'daily',
    renotify: true,
    data: { url: d.url || './index.html' },
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
      for (const w of ws) if (w.url.includes('/english/')) return w.focus();
      return self.clients.openWindow(e.notification.data && e.notification.data.url || './index.html');
    })
  );
});
