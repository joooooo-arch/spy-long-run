// SPY Long Run 앱 — 설치(홈 화면)와 오프라인용. 화면 파일은 저장해 두고, status.json 은 항상 새로 받음 (안 되면 화면이 마지막 것을 씀).
const CACHE = "slr-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith("status.json")) return;          // 상태 파일은 그대로 인터넷에서
  // 화면 파일: 인터넷 먼저 (새 버전 반영) · 안 되면 저장해 둔 것
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
