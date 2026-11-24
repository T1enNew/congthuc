// Gói web vào thư mục dist/ để đưa lên GitHub Pages: node scripts/build.mjs   (hoặc: npm run build)
// Đóng dấu phiên bản vào sw.js để điện thoại đã cài app tự nhận bản mới sau mỗi lần deploy.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const INCLUDE = ["index.html", "manifest.webmanifest", "sw.js", "assets", "images"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const item of INCLUDE) fs.cpSync(path.join(root, item), path.join(dist, item), { recursive: true });

const version = "stpc-" + ((process.env.GITHUB_SHA || "").slice(0, 7) || Date.now().toString(36));
const swPath = path.join(dist, "sw.js");
const sw = fs.readFileSync(swPath, "utf8").replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`);
fs.writeFileSync(swPath, sw);
fs.writeFileSync(path.join(dist, ".nojekyll"), "");

let files = 0, bytes = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { files++; bytes += fs.statSync(p).size; } } })(dist);
console.log(`Build xong: dist/ (${files} file, ${(bytes / 1048576).toFixed(1)} MB) — phiên bản ${version}`);
