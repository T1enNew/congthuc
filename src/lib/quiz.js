/* Sinh câu hỏi trắc nghiệm từ cẩm nang. Mỗi câu: { d, prep?, q, opts, answer, explain } */
import { MENU, drinks, byId, qtyOf, packOf, sizesOf, formulaLine, allIngNames } from "./recipes.js";
import { shuffle, pick, uniq } from "./util.js";

const numOf = (v) => parseFloat(String(v).replace(",", "."));

function qQuantity(d) {
  const ings = d.ing.filter((i) => !i.side && i.k !== "decor" && !isNaN(numOf(qtyOf(i, d.sizes ? d.sizes[0] : null))));
  if (!ings.length) return null;
  const ing = pick(ings);
  const size = d.sizes ? pick(d.sizes) : null;
  const right = qtyOf(ing, size), rv = numOf(right);
  const pool = uniq(drinks.flatMap((x) => x.ing.filter((i) => i.u === ing.u).flatMap((i) => (typeof i.q === "object" ? Object.values(i.q) : [i.q]))).map(String))
    .filter((v) => !isNaN(numOf(v)) && numOf(v) !== rv);
  const opts = shuffle(pool).slice(0, 3);
  const step = rv >= 100 ? 50 : rv >= 20 ? 10 : rv >= 5 ? 2 : 1;
  for (let k = 1; opts.length < 3; k++) { const c = String(rv + step * k * (k % 2 ? 1 : -1)); if (numOf(c) > 0 && !opts.includes(c)) opts.push(c); }
  return { d, q: `${d.name}${size ? ` (size ${size})` : ""} dùng bao nhiêu ${ing.n}?`, opts: shuffle([String(right), ...opts]).map((o) => `${o} ${ing.u}`), answer: `${right} ${ing.u}`, explain: `${d.name}${size ? ` size ${size}` : ""}: ${formulaLine(d, size)}.` };
}

function qWhichDrink(d) {
  const cands = d.ing.filter((i) => !i.side && i.k !== "decor" && !["Đá viên", "Đường nước", "Nước nóng", "Nước lọc"].includes(i.n));
  if (!cands.length) return null;
  const ing = pick(cands);
  const others = drinks.filter((x) => !x.ing.some((i) => i.n === ing.n));
  if (others.length < 3) return null;
  return { d, q: `Món nào có “${ing.n}” trong công thức?`, opts: shuffle([d, ...shuffle(others).slice(0, 3)]).map((x) => x.name), answer: d.name, explain: `${d.name} dùng ${ing.n} ${qtyOf(ing, d.sizes ? d.sizes[0] : null)} ${ing.u}.` };
}

function qPack(d) {
  const size = d.sizes ? pick(d.sizes) : null;
  const right = packOf(d, size).join(", ");
  const pool = uniq(drinks.flatMap((x) => sizesOf(x).map((s) => packOf(x, s).join(", ")))).filter((p) => p !== right);
  if (pool.length < 3) return null;
  return { d, q: `${d.name}${size ? ` (size ${size})` : ""} phục vụ bằng gì?`, opts: shuffle([right, ...shuffle(pool).slice(0, 3)]), answer: right, explain: `${d.name}: ${right}.` };
}

function qStep(d) {
  if (d.steps.length < 3) return null;
  const i = Math.floor(Math.random() * Math.min(d.steps.length - 1, 3));
  const right = d.steps[i];
  const pool = uniq(drinks.flatMap((x) => x.steps)).filter((s) => s !== right && !d.steps.includes(s) && !/Phục vụ|Chuẩn bị dụng cụ|Đậy nắp/.test(s));
  return { d, q: `Bước ${i + 1} khi pha ${d.name} là gì?`, opts: shuffle([right, ...shuffle(pool).slice(0, 3)]), answer: right, explain: d.steps.map((s, j) => `${j + 1}. ${s}`).join("  ") };
}

function qShelf() {
  const row = pick(MENU.shelf);
  const pool = uniq(MENU.shelf.map((r) => r[2])).filter((x) => x !== row[2]);
  return { d: null, q: `“${row[0]}” (${row[1].toLowerCase()}) để được bao lâu?`, opts: shuffle([row[2], ...shuffle(pool).slice(0, 3)]), answer: row[2], explain: `${row[0]}: ${row[2]}, bảo quản ${row[3]}.` };
}

function qPrep() {
  const p = pick(MENU.preps);
  const ing = pick(p.ing);
  const right = `${ing[2]} ${ing[1]}`;
  const pool = uniq(MENU.preps.flatMap((x) => x.ing.filter((i) => i[1] === ing[1]).map((i) => `${i[2]} ${i[1]}`))).filter((x) => x !== right);
  while (pool.length < 3) pool.push(`${ing[2] * (pool.length + 2)} ${ing[1]}`);
  return { d: null, prep: p.id, q: `Làm “${p.name}” (ra ${p.yield}) cần bao nhiêu ${ing[0]}?`, opts: shuffle([right, ...shuffle(pool).slice(0, 3)]), answer: right, explain: `${p.name}: ${p.ing.map((i) => `${i[0]} ${i[2]} ${i[1]}`).join(", ")}.` };
}

export function buildQuiz({ cat = "all", n = 10, focusId = null }) {
  const pool = focusId ? [byId[focusId]] : drinks.filter((d) => cat === "all" || d.cat === cat);
  const gens = focusId ? [qQuantity, qQuantity, qPack, qStep, qWhichDrink] : [qQuantity, qQuantity, qQuantity, qWhichDrink, qPack, qStep];
  const out = [];
  for (let guard = 0; out.length < n && guard < 300; guard++) {
    const q = !focusId && cat === "all" && Math.random() < 0.14 ? (Math.random() < 0.5 ? qShelf() : qPrep()) : pick(gens)(pick(pool));
    if (q && !out.some((x) => x.q === q.q && x.answer === q.answer)) out.push(q);
  }
  return out;
}

export { allIngNames };
