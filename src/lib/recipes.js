/* Truy vấn dữ liệu công thức. */
import { MENU } from "../data/menu.js";
import { PHOTOS } from "../data/photos.js";
import { norm, uniq } from "./util.js";

export { MENU, PHOTOS };
export const drinks = MENU.drinks;
export const byId = Object.fromEntries(drinks.map((d) => [d.id, d]));
export const catById = Object.fromEntries(MENU.categories.map((c) => [c.id, c]));
export const prepById = Object.fromEntries(MENU.preps.map((p) => [p.id, p]));

export const sizesOf = (d) => d.sizes || [null];

export function qtyOf(ing, size) {
  if (ing.q && typeof ing.q === "object") return ing.q[size || Object.keys(ing.q)[0]];
  return ing.q;
}

export function packOf(d, size) {
  if (Array.isArray(d.pack)) return d.pack;
  return d.pack[size || Object.keys(d.pack)[0]] || [];
}

const shortName = (n) => n.replace(/\s*\(decor\)/, "").replace("An Viên coffee", "Cà phê").replace("Sữa thanh trùng", "Sữa tươi TT");

/* Công thức rút gọn để nhẩm: "Cà phê 60 · Sữa đặc 30 · Đá viên 150" */
export function formulaLine(d, size) {
  size = size || (d.sizes ? d.sizes[0] : null);
  return d.ing
    .filter((i) => !i.side && i.k !== "decor")
    .map((i) => `${shortName(i.n)} ${qtyOf(i, size)}${/^(ml|gram)$/.test(i.u) ? "" : " " + i.u}`)
    .join(" · ");
}

export const tempLabel = (d) => (d.temp === "hot" ? "Nóng" : d.temp === "blend" ? "Đá xay" : "Đá");
export const photosOf = (id) => PHOTOS[id] || [];
export const allIngNames = uniq(drinks.flatMap((d) => d.ing.filter((i) => i.k !== "decor" && !i.side).map((i) => i.n)));

/* Tìm món được nhắc tới trong câu hỏi; điểm cao = khớp nguyên tên/biệt danh. */
export function findDrinks(question) {
  const q = " " + norm(question) + " ";
  return drinks
    .map((d) => {
      let s = 0;
      [d.name, ...(d.aka || [])].forEach((n) => { const nn = norm(n); if (q.includes(" " + nn + " ") || q.includes(nn)) s = Math.max(s, nn.length + 10); });
      if (!s) {
        const words = norm(d.name).split(" ").filter((w) => w.length > 2);
        const hit = words.filter((w) => q.includes(" " + w + " ") || q.includes(" " + w)).length;
        if (hit >= Math.max(2, words.length - 1)) s = hit * 3;
      }
      return { d, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
}

export function matchDrink(d, q) {
  if (!q) return true;
  const hay = norm([d.name, ...(d.aka || []), ...d.ing.map((i) => i.n), catById[d.cat].name].join(" | "));
  return norm(q).split(" ").every((w) => hay.includes(w));
}
