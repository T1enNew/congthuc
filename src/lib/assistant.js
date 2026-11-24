/* Trợ lý pha chế: lời dặn cho AI, chọn dữ liệu gửi đi (tiết kiệm token) và trả lời offline. */
import { MENU, drinks, byId, catById, packOf, qtyOf, sizesOf, formulaLine, findDrinks, allIngNames } from "./recipes.js";
import { norm, uniq } from "./util.js";

export const RULES = `Bạn là "Trợ lý pha chế" của quán, giúp nhân viên (kể cả người mới) học và tra công thức đồ uống.
Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn; xưng "mình", gọi người hỏi là "bạn".
- Định lượng, dụng cụ, các bước, hạn dùng: CHỈ lấy từ phần CHI TIẾT trong DỮ LIỆU, không bịa số. Danh sách tóm tắt không có định lượng — nếu cần định lượng của món không có chi tiết, nhờ người dùng hỏi rõ tên món.
- Câu hỏi ngoài tài liệu (kỹ thuật chung, mẹo, giải thích): được trả lời bằng kiến thức chung nhưng nói rõ "tài liệu của quán không ghi, đây là kinh nghiệm chung".
- Khi nói về một món có trong dữ liệu, đặt thẻ [[mon:ID]] trên một dòng riêng ngay sau đoạn nói về món đó (trang sẽ hiện ảnh thật ở đó). Mỗi món tối đa 1 thẻ, tối đa 3 thẻ mỗi câu trả lời. Bán thành phẩm dùng [[btp:ID]]. ID phải đúng như trong dữ liệu.
- Nếu người dùng đang xem một món và hỏi chung chung ("món này", "size L"...), hiểu là hỏi về món đó.
- Định dạng Markdown đơn giản: **đậm**, gạch đầu dòng "- ", danh sách số "1. ", tiêu đề nhỏ "### ". Không dùng bảng, không dùng HTML.`;

export const SUGGESTIONS = [
  "Cà phê sữa đá size L cần những gì?",
  "Món nào dùng milk foam dừa?",
  "Latte nóng và cappuccino nóng khác nhau chỗ nào?",
  "Cách làm nền trà olong?",
  "Milk foam để được bao lâu?"
];

export function suggestionsFor(id) {
  const d = id && byId[id];
  if (!d) return SUGGESTIONS;
  const out = [];
  if (d.sizes && d.sizes.length > 1) out.push("Size M và size L khác nhau thế nào?");
  out.push("Các bước pha món này?", "Mẹo để nhớ nhanh công thức này?", "Món này dùng ly, nắp, ống gì?");
  if (d.ing.some((i) => i.p)) out.push("Cần chuẩn bị bán thành phẩm gì?");
  return out;
}

const tempText = (d) => (d.temp === "hot" ? "nóng" : d.temp === "blend" ? "đá xay" : "đá");

function drinkDetail(d) {
  const sz = d.sizes ? `size ${d.sizes.join("/")}` : "không chia size";
  const out = [`### ${d.name} [id: ${d.id}] — ${catById[d.cat].name} — ${tempText(d)} — ${sz}`];
  out.push("Thành phần: " + d.ing.map((i) => `${i.n}: ${typeof i.q === "object" ? Object.entries(i.q).map(([s, v]) => `${s} ${v}`).join(" / ") : i.q} ${i.u}${i.side ? " (phục vụ kèm)" : ""}`).join("; "));
  out.push("Dụng cụ/packaging: " + (Array.isArray(d.pack) ? d.pack.join(", ") : Object.entries(d.pack).map(([s, v]) => `${s}: ${v.join(", ")}`).join(" | ")));
  out.push("Các bước: " + d.steps.map((s, i) => `${i + 1}) ${s}`).join(" "));
  if (d.notes) out.push("Lưu ý: " + d.notes.join(" "));
  return out.join("\n");
}

function prepDetail(p) {
  return `### ${p.name} [id: ${p.id}] — ${p.group} — thành phẩm ${p.yield} — date ${p.shelf}\nNguyên liệu: ${p.ing.map((i) => `${i[0]} ${i[2]} ${i[1]}`).join("; ")}\nCác bước: ${p.steps.map((s, i) => `${i + 1}) ${s}`).join(" ")}${p.notes ? "\nLưu ý: " + p.notes.join(" ") : ""}`;
}

/* Chỉ gửi phần dữ liệu liên quan tới câu hỏi (khoảng 2–4 nghìn token thay vì cả cuốn cẩm nang). */
export function contextFor(question, ctxId) {
  const q = norm(question);
  const lines = [`NGUỒN: ${MENU.source}. Đơn vị giữ nguyên như tài liệu.`, "", "## DANH SÁCH MÓN (tóm tắt: tên [id] · nhóm · loại · size · dụng cụ · nguyên liệu)"];
  drinks.forEach((d) => lines.push(`- ${d.name} [${d.id}] · ${catById[d.cat].short} · ${tempText(d)} · ${d.sizes ? "size " + d.sizes.join("/") : "1 size"} · ${packOf(d, d.sizes ? d.sizes[d.sizes.length - 1] : null).join("/")} · ${d.ing.filter((i) => !i.side && i.k !== "decor").map((i) => i.n).join(", ")}`));
  const picked = uniq([ctxId, ...findDrinks(question).slice(0, 4).map((x) => x.d.id)].filter(Boolean));
  const ingHit = allIngNames.filter((n) => q.includes(norm(n))).sort((a, b) => b.length - a.length)[0];
  if (ingHit && /mon nao|nhung mon|cac mon|mon gi/.test(q)) drinks.filter((d) => d.ing.some((i) => i.n === ingHit)).slice(0, 8).forEach((d) => { if (!picked.includes(d.id)) picked.push(d.id); });
  if (picked.length) { lines.push("", "## CHI TIẾT CÔNG THỨC (định lượng chính xác)"); picked.forEach((id) => lines.push(drinkDetail(byId[id]))); }
  let preps = MENU.preps.filter((p) => q.includes(norm(p.name)) || picked.some((id) => byId[id].ing.some((i) => i.p === p.id)));
  if (!preps.length && /ban thanh pham|nen |milk foam|thach|pudding|bo xay|nuoc chanh|cold brew|tra sua|\bu\b/.test(q)) preps = MENU.preps;
  if (preps.length) { lines.push("", "## BÁN THÀNH PHẨM"); preps.forEach((p) => lines.push(prepDetail(p))); }
  lines.push("", "## BẢNG DATE NGUYÊN VẬT LIỆU (tên | tình trạng | date | nơi bảo quản)");
  MENU.shelf.forEach((r) => lines.push(r.join(" | ")));
  return lines.join("\n");
}

/* Trả lời không cần mạng: tìm món/nguyên liệu/bán thành phẩm trong câu hỏi và trả lời từ dữ liệu. */
export function offlineAnswer(question, ctxId) {
  const q = " " + norm(question) + " ";
  const size = /\b(size|ly|co)\s*l\b|\bl\b/.test(q) && !/\bm va (size )?l\b|\bm\b.*\bl\b/.test(q) ? "L" : /\b(size|ly|co)\s*m\b/.test(q) && !/\bl\b/.test(q) ? "M" : null;
  let scored = findDrinks(question);
  const preps = MENU.preps.filter((p) => q.includes(norm(p.name)) || q.includes(norm(p.name.replace(/^Nền /, ""))));
  const wantsShelf = /\b(date|han|bao lau|de duoc|bao quan|het han)\b/.test(q);
  const wantsWhich = /\b(mon nao|nhung mon|cac mon|mon gi)\b/.test(q);
  const wantsPrep = /ban thanh pham/.test(q);
  const ingHit = allIngNames.filter((n) => q.includes(norm(n))).sort((a, b) => b.length - a.length)[0];
  const catHit = MENU.categories.find((c) => q.includes(norm(c.short)) || q.includes(norm(c.name)));
  const out = [];

  if (wantsShelf) {
    const rows = MENU.shelf.filter((r) => norm(r[0]).split(" ").some((w) => w.length > 3 && q.includes(w)));
    if (rows.length || preps.length) {
      out.push("### Hạn dùng (date)");
      rows.forEach((r) => out.push(`- **${r[0]}** (${r[1].toLowerCase()}): **${r[2]}** — bảo quản ${r[3]}`));
      preps.forEach((p) => out.push(`- **${p.name}**: ${p.shelf} (tủ mát <5 độ)`));
      return out.join("\n");
    }
  }
  if (wantsPrep && !preps.length && ctxId && byId[ctxId]) {
    const ps = uniq(byId[ctxId].ing.filter((i) => i.p).map((i) => i.p));
    if (ps.length) { out.push(`**${byId[ctxId].name}** cần chuẩn bị:`); ps.forEach((id) => out.push(`[[btp:${id}]]`)); return out.join("\n"); }
    return `**${byId[ctxId].name}** không dùng bán thành phẩm nào trong cẩm nang.`;
  }
  if (preps.length && !scored.length) {
    preps.slice(0, 2).forEach((p) => {
      out.push(`### ${p.name} — ra ${p.yield}`);
      p.ing.forEach((i) => out.push(`- ${i[0]}: **${i[2]} ${i[1]}**`));
      p.steps.forEach((s, i) => out.push(`${i + 1}. ${s}`));
      out.push(`Date: **${p.shelf}**.`, `[[btp:${p.id}]]`, "");
    });
    return out.join("\n");
  }
  if ((wantsWhich || (!scored.length && !ctxId)) && ingHit) {
    const ds = drinks.filter((d) => d.ing.some((i) => i.n === ingHit));
    out.push(`Có **${ds.length} món** dùng **${ingHit}**:`);
    ds.forEach((d) => { const i = d.ing.find((x) => x.n === ingHit); out.push(`- **${d.name}**: ${typeof i.q === "object" ? Object.entries(i.q).map(([s, v]) => `${s} ${v}`).join(" / ") : i.q} ${i.u}`); });
    ds.slice(0, 3).forEach((d) => out.push(`[[mon:${d.id}]]`));
    return out.join("\n");
  }
  if (!scored.length && !ctxId && catHit) {
    const ds = drinks.filter((d) => d.cat === catHit.id);
    out.push(`Nhóm **${catHit.name}** có ${ds.length} món:`);
    ds.forEach((d) => out.push(`- **${d.name}** — ${packOf(d, d.sizes ? d.sizes[d.sizes.length - 1] : null).join(", ")}`));
    ds.slice(0, 2).forEach((d) => out.push(`[[mon:${d.id}]]`));
    return out.join("\n");
  }
  if (!scored.length && ctxId && byId[ctxId]) scored = [{ d: byId[ctxId], s: 99 }];
  if (scored.length) {
    const strong = scored.filter((x) => x.s >= 12);
    const top = (strong.length ? strong : scored.slice(0, 1)).slice(0, 3).map((x) => x.d);
    const onlyPack = /\b(ly|nap|ong|dung cu|packaging)\b/.test(q) && !/\b(buoc|cach|lam|pha)\b/.test(q);
    top.forEach((d) => {
      const sizes = size && d.sizes && d.sizes.includes(size) ? [size] : sizesOf(d);
      out.push(`### ${d.name}`);
      if (size && d.sizes && !d.sizes.includes(size)) out.push(`_Món này chỉ có size ${d.sizes.join("/")}._`);
      if (!d.sizes && size) out.push("_Tài liệu không chia size cho món này._");
      sizes.forEach((s) => {
        if (s) out.push(`**Size ${s}:**`);
        if (!onlyPack) d.ing.forEach((i) => out.push(`- ${i.n}: **${qtyOf(i, s)} ${i.u}**${i.side ? " (phục vụ kèm)" : ""}`));
        out.push(`- Dụng cụ: ${packOf(d, s).join(", ")}`);
      });
      if (!onlyPack) {
        out.push("**Các bước:**");
        d.steps.forEach((s, i) => out.push(`${i + 1}. ${s}`));
        (d.notes || []).forEach((n) => out.push(`> Lưu ý: ${n}`));
      }
      if (/meo|nho nhanh|de nho/.test(q)) out.push(`**Công thức rút gọn để nhẩm:** ${sizesOf(d).map((s) => (s ? `${s} → ` : "") + formulaLine(d, s)).join("  |  ")}`);
      out.push(`[[mon:${d.id}]]`, "");
    });
    return out.join("\n");
  }
  return ["Mình chưa tìm thấy món hay nguyên liệu nào khớp với câu hỏi trong cẩm nang.", "Bạn thử hỏi theo kiểu:", ...SUGGESTIONS.slice(0, 4).map((s) => `- ${s}`)].join("\n");
}
