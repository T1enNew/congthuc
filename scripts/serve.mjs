// Chạy web trên máy: node scripts/serve.mjs [cổng]   (hoặc: npm start)
// Không cần cài thêm gì ngoài Node.js. In ra cả địa chỉ để mở trên điện thoại cùng mạng Wi-Fi.
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const dirArg = args.includes("--dir") ? args[args.indexOf("--dir") + 1] : ".";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", dirArg);
const port = Number(args.find((a) => /^\d+$/.test(a)) || process.env.PORT || 5173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403); return res.end("403"); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); return res.end("Không tìm thấy: " + p); }
    res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
    res.end(buf);
  });
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") console.error(`Cổng ${port} đang bận. Thử: node scripts/serve.mjs ${port + 1}`);
  else console.error(e.message);
  process.exit(1);
});

server.listen(port, "0.0.0.0", () => {
  const all = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === "IPv4" && !i.internal).map((i) => i.address);
  // Ưu tiên mạng nhà/quán (192.168.x.x, 10.x.x.x); bỏ card ảo (WSL, VPN...) nếu có địa chỉ thật.
  const home = all.filter((a) => /^192\.168\./.test(a) || /^10\./.test(a));
  const lan = (home.length ? home : all).slice(0, 2);
  console.log("\n  Sổ tay pha chế đang chạy:\n");
  console.log(`  Trên máy này:   http://localhost:${port}`);
  lan.forEach((ip) => console.log(`  Trên điện thoại: http://${ip}:${port}   (cùng mạng Wi-Fi)`));
  console.log("\n  Nhấn Ctrl + C để dừng.\n");
});
