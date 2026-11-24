// Kiểm tra dữ liệu công thức & ảnh trước khi đưa lên web: npm test
// Thoát mã 1 nếu có lỗi — CI dùng để chặn bản hỏng. (Lỗi code React do "vite build" bắt.)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => path.join(root, p);
const load = (p) => import(pathToFileURL(rel(p)).href);
const errors = [], warns = [];
const err = (m) => errors.push(m), warn = (m) => warns.push(m);

const { MENU } = await load("src/data/menu.js");
const { PHOTOS } = await load("src/data/photos.js");
const { PALETTE } = await load("src/lib/palette.js");
const paletteKeys = new Set(Object.keys(PALETTE));

// 1) Worker (ES module) phải import được
try {
  const tmp = path.join(os.tmpdir(), `stpc-worker-${process.pid}.mjs`);
  fs.copyFileSync(rel("ai-proxy/worker.js"), tmp);
  const mod = await import(pathToFileURL(tmp).href);
  if (typeof mod.default?.fetch !== "function") err("ai-proxy/worker.js: thiếu export default { fetch }");
  fs.rmSync(tmp, { force: true });
} catch (e) { err(`ai-proxy/worker.js: ${e.message}`); }

// 2) Dữ liệu công thức
const cats = new Set(MENU.categories.map((c) => c.id));
const preps = new Set(MENU.preps.map((p) => p.id));
const ids = new Set();
for (const d of MENU.drinks) {
  const at = `Món "${d.name || d.id}"`;
  if (!/^[a-z0-9-]+$/.test(d.id || "")) err(`${at}: id "${d.id}" chỉ được dùng chữ thường, số, dấu gạch ngang`);
  if (ids.has(d.id)) err(`${at}: trùng id ${d.id}`); ids.add(d.id);
  if (!cats.has(d.cat)) err(`${at}: nhóm "${d.cat}" không tồn tại`);
  if (!["hot", "ice", "blend"].includes(d.temp)) err(`${at}: temp phải là hot/ice/blend`);
  if (!Array.isArray(d.ing) || !d.ing.length) err(`${at}: chưa có thành phần`);
  if (!Array.isArray(d.steps) || !d.steps.length) err(`${at}: chưa có các bước`);
  for (const i of d.ing || []) {
    if (d.sizes && (typeof i.q !== "object" || d.sizes.some((s) => i.q[s] === undefined))) err(`${at}: "${i.n}" phải có định lượng cho size ${d.sizes.join("/")}`);
    if (!d.sizes && typeof i.q === "object") err(`${at}: "${i.n}" ghi theo size nhưng món không có sizes`);
    if (i.p && !preps.has(i.p)) err(`${at}: "${i.n}" trỏ tới bán thành phẩm "${i.p}" không tồn tại`);
    if (i.k && !paletteKeys.has(i.k)) warn(`${at}: màu "${i.k}" của "${i.n}" chưa có trong src/lib/palette.js`);
  }
  if (d.sizes && !Array.isArray(d.pack)) for (const s of d.sizes) if (!d.pack?.[s]) err(`${at}: thiếu packaging cho size ${s}`);
  for (const [k] of d.cup?.layers || []) if (!paletteKeys.has(k)) warn(`${at}: lớp ly "${k}" chưa có trong src/lib/palette.js`);
  if (!(PHOTOS[d.id] || []).length) warn(`${at}: chưa có ảnh`);
}
for (const p of MENU.preps) if (!p.ing?.length || !p.steps?.length) err(`Bán thành phẩm "${p.name}": thiếu nguyên liệu hoặc các bước`);
for (const r of MENU.shelf) if (r.length !== 4) err(`Bảng date: dòng "${r[0]}" phải có đủ 4 cột`);
for (const id of Object.keys(PHOTOS)) if (!ids.has(id)) warn(`photos.js: "${id}" không khớp món nào`);

// 3) Ảnh khai báo phải có file thật trong public/images
for (const [id, list] of Object.entries(PHOTOS)) {
  for (const p of list) {
    for (const dir of ["full", "thumb"]) {
      const f = `public/images/drinks/${dir}/${p.f}`;
      if (!fs.existsSync(rel(f))) err(`Ảnh ${id}: thiếu file ${f}`);
      else if (fs.statSync(rel(f)).size > 450 * 1024) warn(`Ảnh ${f} nặng ${(fs.statSync(rel(f)).size / 1024) | 0} KB — nên nén nhỏ hơn cho điện thoại`);
    }
    if (p.src && !/^https:\/\//.test(p.src)) err(`Ảnh ${id}/${p.f}: link nguồn phải bắt đầu bằng https://`);
  }
}

// 4) manifest + icon
try {
  const man = JSON.parse(fs.readFileSync(rel("public/manifest.webmanifest"), "utf8"));
  for (const i of man.icons || []) if (!fs.existsSync(rel("public/" + i.src))) err(`manifest: thiếu icon ${i.src}`);
} catch (e) { err(`public/manifest.webmanifest: JSON lỗi — ${e.message}`); }

warns.forEach((w) => console.log("  ⚠ " + w));
errors.forEach((e) => console.log("  ✗ " + e));
const n = `${MENU.drinks.length} món, ${MENU.preps.length} bán thành phẩm, ${Object.values(PHOTOS).flat().length} ảnh`;
if (errors.length) { console.log(`\nKiểm tra THẤT BẠI: ${errors.length} lỗi, ${warns.length} cảnh báo.`); process.exit(1); }
console.log(`\nKiểm tra OK (${n}). ${warns.length} cảnh báo.`);
