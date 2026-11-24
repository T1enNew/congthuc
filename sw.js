/* Service worker: lưu sẵn khung app để mở nhanh và dùng được khi mất mạng.
   Đổi VERSION mỗi khi cập nhật code/dữ liệu để máy người dùng tải bản mới. */
const VERSION = "stpc-v1";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/style.css",
  "assets/js/config.js",
  "assets/js/data.js",
  "assets/js/photos.js",
  "assets/js/app.js",
  "images/icons/icon-192.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== VERSION + "-img").map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Ảnh món: cache-first (ảnh không đổi), tải dần khi xem.
  if (url.origin === location.origin && url.pathname.includes("/images/")) {
    e.respondWith(
      caches.open(VERSION + "-img").then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // Code & dữ liệu: ưu tiên mạng để luôn mới, mất mạng thì dùng bản đã lưu.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  // Google Fonts: stale-while-revalidate.
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.open(VERSION + "-img").then(async (c) => {
        const hit = await c.match(req);
        const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
