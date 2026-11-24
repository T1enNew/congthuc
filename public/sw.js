/* Service worker: mở nhanh, dùng được khi mất mạng, cài lên màn hình chính.
   VERSION được đóng dấu tự động mỗi lần build (scripts/stamp-sw.mjs). */
const VERSION = "stpc-dev";
const PAGES = VERSION + "-pages";
const STATIC = "stpc-static"; // file đã có mã băm (assets/*) và ảnh: không đổi nội dung -> giữ lâu

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(["./", "./manifest.webmanifest"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.endsWith("-pages") && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const cacheFirst = (req, name) => caches.open(name).then(async (c) => {
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) c.put(req, res.clone());
  return res;
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Trang HTML: ưu tiên mạng để luôn mới; mất mạng thì dùng bản đã lưu.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(PAGES).then((c) => c.put("./", copy)); return res; })
        .catch(() => caches.match("./"))
    );
    return;
  }

  if (url.origin === location.origin && (url.pathname.includes("/assets/") || url.pathname.includes("/images/"))) {
    e.respondWith(cacheFirst(req, STATIC));
    return;
  }

  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(STATIC).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
