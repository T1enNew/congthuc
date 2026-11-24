/* Sổ tay pha chế — ứng dụng học công thức (vanilla JS, không cần build). */
(function () {
  "use strict";

  const MENU = window.MENU;
  const PHOTOS = window.PHOTOS || {};
  const CONFIG = window.APP_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const view = $("#view");

  /* ───────── helpers ───────── */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, " ").trim();
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const uniq = (a) => Array.from(new Set(a));

  const store = {
    get(k, d) { try { const v = localStorage.getItem("stpc:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("stpc:" + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };

  const drinks = MENU.drinks;
  const byId = Object.fromEntries(drinks.map((d) => [d.id, d]));
  const catById = Object.fromEntries(MENU.categories.map((c) => [c.id, c]));
  const prepById = Object.fromEntries(MENU.preps.map((p) => [p.id, p]));

  let learned = new Set(store.get("learned", []));
  const saveLearned = () => store.set("learned", Array.from(learned));

  /* ───────── icons ───────── */
  const I = {
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h12v5a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V8Z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.8c-.6.8-.6 1.6 0 2.4M11.5 2.8c-.6.8-.6 1.6 0 2.4"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="15" rx="2.5"/><path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V17"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h9"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18.5 9.5l-4.7 1.9L12 16l-1.8-4.6L5.5 9.5l4.7-1.9L12 3Z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="2.6"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z"/></svg>',
    ice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 4v16M15 4v16"/></svg>',
    jar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10M8 3v3l-2 3v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9l-2-3V3"/><path d="M6 13h12"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    flip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M20 4v4h-4M4 20v-4h4"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
  };

  /* ───────── palette for the cup illustration ───────── */
  const PALETTE = {
    "coffee": ["#3b2216", "Cà phê"], "espresso": ["#4a2715", "Espresso"], "coldbrew": ["#43230f", "Cold brew"],
    "condensed": ["#efe0c2", "Sữa đặc"], "milk": ["#f6f1ea", "Sữa"], "cream": ["#f4e8d3", "Sữa cream"],
    "sugar": ["#e9c88f", "Đường"], "water": ["#dcebf2", "Nước"], "ice": ["#dff0f7", "Đá viên"], "powder": ["#efe9df", "Bột"],
    "cafe-sua": ["#a8724a", "Cà phê + sữa đặc (đánh bọt)"], "latte": ["#c79a72", "Sữa + espresso"], "americano": ["#5a3420", "Espresso + nước"],
    "tea-oolong": ["#cf8f3e", "Trà olong"], "tea-earl": ["#a25330", "Trà bá tước"], "milktea": ["#c9a17a", "Trà sữa bá tước"],
    "genmai-milk": ["#d8bd93", "Trà sữa gạo rang"], "oolong-milk": ["#c69b6d", "Trà sữa olong"],
    "matcha": ["#7aa140", "Matcha"], "matcha-milk": ["#b7d08b", "Sữa matcha"], "houjicha": ["#94532e", "Houjicha"],
    "choco": ["#5b311d", "Chocolate"], "choco-milk": ["#8c5a3b", "Sữa chocolate"], "genmai": ["#cdb07a", "Bột genmaicha"],
    "mango": ["#f3b02c", "Xoài"], "mango-cube": ["#f7b733", "Xoài tươi"], "strawberry": ["#e0475a", "Dâu"], "guava": ["#f08e8a", "Ổi"],
    "peach": ["#f6a57c", "Đào"], "lychee": ["#f3dadd", "Vải"], "melon": ["#c8e08b", "Dưa lưới"], "orange": ["#f49a2a", "Cam"],
    "apricot": ["#f2a33f", "Mơ"], "apricot-cherry": ["#b8323a", "Mứt mơ anh đào"], "cinnamon": ["#a0522d", "Syrup quế"],
    "lemon": ["#f2e27a", "Nước chanh"], "yuzu": ["#f4d24a", "Yuzu"],
    "berry-tea": ["#c14b3a", "Trà bá tước + dâu + ổi"], "peach-tea": ["#e48a45", "Trà olong + đào + mơ + cam"],
    "lychee-tea": ["#e9b98e", "Trà olong + vải hồng + dưa lưới"], "mango-tea": ["#eaa13a", "Trà olong + xoài"],
    "cherry-coldbrew": ["#5e2018", "Cold brew + mơ anh đào + quế"], "mango-coldbrew": ["#6b3a14", "Cold brew + xoài"],
    "guava-snow": ["#f6b6b1", "Tuyết ổi (xay mịn)"],
    "foam": ["#fffaf0", "Milk foam"], "foam-cheese": ["#fcefc6", "Milk foam cheese"], "foam-coconut": ["#fbf7ec", "Milk foam dừa"],
    "foam-chestnut": ["#e9d1b3", "Milk foam hạt dẻ"], "foam-yogurt": ["#fff4ec", "Foam yogurt"],
    "pearl": ["#2b1a14", "Trân châu"], "glass-pearl": ["#f4d3de", "Hạt thủy tinh"], "jelly-peach": ["#f7b48c", "Thạch đào"],
    "jelly-lychee": ["#f4ebe2", "Thạch vải"], "jelly-houjicha": ["#8b5636", "Thạch houjicha"], "redbean": ["#6e2b27", "Đậu đỏ"],
    "lotus-seed": ["#efe3c5", "Sen lon"], "avocado": ["#9fbd4f", "Bơ xay"], "almond-milk": ["#efe2cc", "Sữa hạnh nhân + cream"],
    "almond": ["#e7c89a", "Hạnh nhân lát"], "frappe-mocha": ["#7b4d33", "Mocha xay"], "frappe-genmai": ["#dbc59b", "Genmaicha xay"],
    "cereal": ["#d49a4a", "Ngũ cốc"], "yogurt": ["#fbf6f0", "Sữa chua"], "yogurt-mango": ["#f6c565", "Yogurt xoài (shake)"],
    "yogurt-berry": ["#f19fad", "Yogurt dâu (shake)"], "yogurt-yuzu": ["#f6dc86", "Yogurt yuzu (shake)"],
    "decor": ["#5d9b48", "Decor"], "dust-choco": ["#5b311d", "Bột chocolate"], "dust-genmai": ["#cdb07a", "Bột genmaicha"]
  };
  const PARTICLE = { "pearl": 1, "glass-pearl": 1, "jelly-peach": 1, "jelly-lychee": 1, "jelly-houjicha": 1, "redbean": 1, "lotus-seed": 1, "mango-cube": 1, "cereal": 1 };
  const colorOf = (k) => (PALETTE[k] || ["#ccc"])[0];

  let svgUid = 0;
  /* Draw a cut-away cup showing the layers (bottom → top). */
  function cupSVG(d, opts = {}) {
    const cup = d.cup || { type: "ice", layers: [] };
    const id = "c" + (++svgUid);
    const layers = cup.layers || [];
    const hot = cup.type === "hot";
    const small = cup.vessel === "tach-nho";
    let s = "";
    let geo;
    if (hot) {
      const w = small ? 74 : 104, h = small ? 62 : 92, cx = 76, bottom = 176;
      const top = bottom - h;
      geo = { top, bottom, xl: cx - w / 2, xr: cx + w / 2, bl: cx - w / 2 + 12, br: cx + w / 2 - 12, cx };
    } else {
      geo = { top: 46, bottom: 204, xl: 28, xr: 132, bl: 42, br: 118, cx: 80 };
    }
    const poly = `M${geo.xl},${geo.top} L${geo.xr},${geo.top} L${geo.br},${geo.bottom - 10} Q${geo.br - 2},${geo.bottom} ${geo.br - 12},${geo.bottom} L${geo.bl + 12},${geo.bottom} Q${geo.bl + 2},${geo.bottom} ${geo.bl},${geo.bottom - 10} Z`;
    const fillH = (geo.bottom - geo.top) * (hot ? 0.86 : 0.84);
    const total = layers.reduce((a, l) => a + l[1], 0) || 1;
    let y = geo.bottom;
    const rects = [];
    layers.forEach(([k, amt], i) => {
      const h = Math.max(hot ? 8 : 9, (amt / total) * fillH);
      rects.push({ k, y: y - h, h, i });
      y -= h;
    });
    const liquidTop = y;
    s += `<defs><clipPath id="${id}"><path d="${poly}"/></clipPath>`;
    s += `<linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".18" stop-color="#fff" stop-opacity=".28"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
    if (hot) {
      // saucer
      s += `<ellipse cx="${geo.cx}" cy="${geo.bottom + 4}" rx="${small ? 58 : 74}" ry="10" fill="#d2462a"/>`;
      s += `<ellipse cx="${geo.cx}" cy="${geo.bottom + 1}" rx="${small ? 44 : 56}" ry="6" fill="#e9684b"/>`;
      // handle
      const hy = geo.top + (geo.bottom - geo.top) * 0.25;
      s += `<path d="M${geo.xr - 4},${hy} C${geo.xr + 26},${hy - 4} ${geo.xr + 26},${hy + 40} ${geo.br - 2},${hy + 44}" fill="none" stroke="#d2462a" stroke-width="9" stroke-linecap="round"/>`;
      s += `<path d="${poly}" fill="#fbe2d8"/>`;
    } else {
      s += `<path d="${poly}" fill="rgba(220,236,244,.35)"/>`;
    }
    s += `<g clip-path="url(#${id})">`;
    rects.forEach((r, idx) => {
      if (PARTICLE[r.k]) {
        const bgK = (rects[idx + 1] && !PARTICLE[rects[idx + 1].k] ? rects[idx + 1].k : (rects[idx - 1] ? rects[idx - 1].k : "water"));
        s += `<rect x="0" y="${r.y}" width="200" height="${r.h + 1}" fill="${colorOf(bgK)}"/>`;
        const n = Math.max(6, Math.round(r.h / 4));
        for (let j = 0; j < n * 2; j++) {
          const px = geo.xl + 8 + ((j * 37) % (geo.xr - geo.xl - 16));
          const py = r.y + 4 + ((j * 13) % Math.max(4, r.h - 6));
          if (r.k === "mango-cube" || r.k.startsWith("jelly")) s += `<rect x="${px - 5}" y="${py - 4}" width="10" height="9" rx="2" fill="${colorOf(r.k)}" opacity=".95"/>`;
          else if (r.k === "cereal") s += `<ellipse cx="${px}" cy="${py}" rx="4" ry="2.6" fill="${colorOf(r.k)}"/>`;
          else s += `<circle cx="${px}" cy="${py}" r="${r.k === "pearl" ? 4.6 : 3.6}" fill="${colorOf(r.k)}"/>`;
        }
      } else {
        s += `<rect x="0" y="${r.y}" width="200" height="${r.h + 1}" fill="${colorOf(r.k)}"/>`;
        if (r.k.startsWith("foam")) s += `<rect x="0" y="${r.y}" width="200" height="3" fill="#fff" opacity=".6"/>`;
      }
    });
    if (cup.foamTop) s += `<rect x="0" y="${liquidTop - 1}" width="200" height="7" fill="${cup.foamTop === "coffee-foam" ? "#c99467" : "#d9a48a"}" opacity=".9"/>`;
    if (cup.slush) for (let j = 0; j < 40; j++) s += `<circle cx="${geo.xl + 6 + ((j * 29) % (geo.xr - geo.xl - 10))}" cy="${liquidTop + 6 + ((j * 17) % Math.max(10, geo.bottom - liquidTop - 12))}" r="1.6" fill="#fff" opacity=".55"/>`;
    if (cup.ice) {
      const cubes = [[0.22, 0.12], [0.6, 0.1], [0.38, 0.3], [0.7, 0.36], [0.18, 0.5], [0.52, 0.56], [0.3, 0.76], [0.66, 0.74]];
      const span = geo.bottom - liquidTop - 14;
      cubes.forEach(([fx, fy], j) => {
        const cx = geo.xl + 10 + fx * (geo.xr - geo.xl - 20), cy = liquidTop + 4 + fy * span;
        s += `<rect x="${cx - 10}" y="${cy - 9}" width="21" height="19" rx="5" transform="rotate(${(j * 23) % 40 - 18} ${cx} ${cy})" fill="#fff" fill-opacity=".38" stroke="#fff" stroke-opacity=".75" stroke-width="1.2"/>`;
      });
    }
    if (cup.dust) for (let j = 0; j < 26; j++) s += `<circle cx="${geo.xl + 10 + ((j * 31) % (geo.xr - geo.xl - 20))}" cy="${liquidTop + 1 + ((j * 7) % 6)}" r="1.4" fill="${cup.dust === "choco" ? "#5b311d" : "#b08a4f"}"/>`;
    if (cup.sprinkle) for (let j = 0; j < 9; j++) s += `<ellipse cx="${geo.xl + 14 + ((j * 23) % (geo.xr - geo.xl - 28))}" cy="${liquidTop + 3 + ((j * 5) % 7)}" rx="4.5" ry="2" fill="#e7c89a" stroke="#c9a06c" stroke-width=".6"/>`;
    s += `<rect x="0" y="0" width="200" height="220" fill="url(#${id}g)"/>`;
    s += `</g>`;
    // surface
    const surfW = (geo.xr - geo.xl) * (1 - (liquidTop - geo.top) / (geo.bottom - geo.top) * 0.25);
    if (hot && cup.top) {
      const topK = layers.length ? layers[layers.length - 1][0] : "coffee";
      const sc = cup.top === "crema" ? "#c58b55" : colorOf(topK);
      s += `<ellipse cx="${geo.cx}" cy="${liquidTop}" rx="${surfW / 2 - 4}" ry="6" fill="${sc}"/>`;
      if (cup.top.startsWith("art")) {
        const ac = cup.top === "art-matcha" ? "#7aa140" : cup.top === "art-choco" ? "#6b3c24" : "#b9824f";
        s += `<ellipse cx="${geo.cx}" cy="${liquidTop}" rx="${surfW / 2 - 4}" ry="6" fill="${ac}"/>`;
        s += `<path d="M${geo.cx - 12},${liquidTop} q12,-9 24,0 q-12,8 -24,0Z" fill="#fff8ee"/>`;
      }
    }
    if (cup.decor) {
      const dy = liquidTop - 2, ox = geo.cx - 18;
      if (cup.decor !== "mint") {
        s += `<circle cx="${ox}" cy="${dy}" r="11" fill="#f39a2a" stroke="#c96a12" stroke-width="1.5"/>`;
        for (let a = 0; a < 6; a++) { const t = (a * Math.PI) / 3; s += `<line x1="${ox}" y1="${dy}" x2="${ox + 9 * Math.cos(t)}" y2="${dy + 9 * Math.sin(t)}" stroke="#fbd39a" stroke-width="1.2"/>`; }
      }
      s += `<ellipse cx="${geo.cx + 12}" cy="${dy - 5}" rx="8" ry="4" transform="rotate(-30 ${geo.cx + 12} ${dy - 5})" fill="#4f9a3e"/>`;
      s += `<ellipse cx="${geo.cx + 22}" cy="${dy - 3}" rx="7" ry="3.6" transform="rotate(25 ${geo.cx + 22} ${dy - 3})" fill="#3f8a34"/>`;
    }
    // outline
    s += `<path d="${poly}" fill="none" stroke="${hot ? "#d2462a" : "var(--cup-line)"}" stroke-width="${hot ? 3 : 2}"/>`;
    if (!hot) {
      if (cup.lid === "dome") {
        s += `<path d="M${geo.xl - 4},${geo.top} Q${geo.cx},${geo.top - 52} ${geo.xr + 4},${geo.top}" fill="rgba(220,236,244,.25)" stroke="var(--cup-line)" stroke-width="2"/>`;
        s += `<rect x="${geo.xl - 6}" y="${geo.top - 3}" width="${geo.xr - geo.xl + 12}" height="7" rx="3" fill="var(--cup-line)"/>`;
      } else if (cup.lid === "flat") {
        s += `<rect x="${geo.xl - 6}" y="${geo.top - 7}" width="${geo.xr - geo.xl + 12}" height="9" rx="3" fill="var(--cup-line)"/>`;
      }
      if (cup.lid) s += `<path d="M${geo.cx + 14},${geo.bottom - 30} L${geo.cx + 30},${cup.lid === "dome" ? 2 : 14}" stroke="#d2462a" stroke-width="${/phi 12/.test(packOf(d).join(" ")) ? 9 : 6}" stroke-linecap="round"/>`;
    }
    const vb = hot ? `0 ${small ? 70 : 40} 175 ${small ? 125 : 155}` : "0 0 160 212";
    return `<svg class="${opts.cls || "cup-svg"}" viewBox="${vb}" role="img" aria-label="Hình ly minh hoạ ${esc(d.name)}">${s}</svg>`;
  }

  function cupLegend(d) {
    const cup = d.cup || {};
    const items = [];
    const layers = (cup.layers || []).slice().reverse();
    layers.forEach(([k]) => items.push(k));
    if (cup.ice) items.push("ice");
    if (cup.dust) items.unshift(cup.dust === "choco" ? "dust-choco" : "dust-genmai");
    if (cup.decor) items.unshift("decor");
    return '<ul class="legend">' + uniq(items).map((k, i) => {
      let label = (PALETTE[k] || [, k])[1];
      if (k === "decor") label = cup.decor === "mint" ? "Húng lũi (decor)" : "Cam sấy + húng lũi (decor)";
      return `<li><span class="sw" style="background:${colorOf(k)}"></span><span>${esc(label)}${i === 0 ? ' <span class="lg-top">← trên cùng</span>' : ""}</span></li>`;
    }).join("") + "</ul>";
  }

  /* ───────── quantities ───────── */
  const sizesOf = (d) => d.sizes || [null];
  function qtyOf(ing, size) {
    if (ing.q && typeof ing.q === "object") return ing.q[size || Object.keys(ing.q)[0]];
    return ing.q;
  }
  function packOf(d, size) {
    if (Array.isArray(d.pack)) return d.pack;
    return d.pack[size || Object.keys(d.pack)[0]] || [];
  }
  const shortName = (n) => n.replace(/\s*\(decor\)/, "").replace("An Viên coffee", "Cà phê").replace("Sữa thanh trùng", "Sữa tươi TT");
  function formulaLine(d, size) {
    size = size || (d.sizes ? d.sizes[0] : null);
    return d.ing.filter((i) => !i.side && i.k !== "decor").map((i) => `${shortName(i.n)} ${qtyOf(i, size)}${/^(ml|gram)$/.test(i.u) ? "" : " " + i.u}`).join(" · ");
  }
  const tempBadge = (d) => d.temp === "hot" ? '<span class="badge badge-hot">Nóng</span>' : d.temp === "blend" ? '<span class="badge badge-blend">Đá xay</span>' : '<span class="badge badge-ice">Đá</span>';
  const sizeBadge = (d) => d.sizes ? `<span class="badge badge-size">Size ${d.sizes.join("/")}</span>` : "";

  /* ───────── photos ───────── */
  const photosOf = (id) => PHOTOS[id] || [];
  function imgTag(p, { sizes = "50vw", cls = "", eager = false, alt = "" } = {}) {
    if (!p) return "";
    return `<img class="${cls}" src="images/drinks/thumb/${esc(p.f)}" srcset="images/drinks/thumb/${esc(p.f)} 480w, images/drinks/full/${esc(p.f)} 960w" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="${p.w || 960}" height="${p.h || 720}">`;
  }

  /* ───────── router ───────── */
  const TABS = [
    { id: "mon", label: "Món", icon: I.cup },
    { id: "hoc", label: "Học nhanh", icon: I.cards },
    { id: "kiem-tra", label: "Kiểm tra", icon: I.check },
    { id: "ban-thanh-pham", label: "Bán TP", icon: I.jar }
  ];
  function renderTabs(active) {
    $("#tabbar").innerHTML = `<div class="tabbar-inner">` + TABS.map((t) =>
      `<a class="tab" href="#${t.id}" ${t.id === active ? 'aria-current="page"' : ""}>${t.icon}<span>${t.label}</span></a>`).join("") + `</div>`;
  }

  let aiAbort = null;
  function route() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    let tab = "mon";
    if (h.startsWith("mon-") && byId[h.slice(4)]) { tab = "mon"; renderDetail(h.slice(4)); }
    else if (h === "hoc") { tab = "hoc"; renderLearn(); }
    else if (h === "kiem-tra") { tab = "kiem-tra"; renderQuiz(); }
    else if (h === "hoi-ai") { renderHome(); history.replaceState(null, "", "#mon"); setTimeout(() => openChat({}), 0); }
    else if (h === "ban-thanh-pham" || h.startsWith("btp-")) { tab = "ban-thanh-pham"; renderPreps(h.startsWith("btp-") ? h.slice(4) : null); }
    else if (h === "nguon-anh") { tab = ""; renderCredits(); }
    else { renderHome(); }
    renderTabs(tab);
    chatOnRoute();
    if (!h.startsWith("btp-")) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  function setTitle(t) { document.title = t ? `${t} · Sổ tay pha chế` : "Sổ tay pha chế"; }

  /* ───────── HOME ───────── */
  const homeState = Object.assign({ q: "", cat: "all", temp: "all", prog: "all" }, store.get("filter", {}));
  function progressRing(done, total) {
    const r = 22, c = 2 * Math.PI * r, f = total ? done / total : 0;
    return `<svg class="ring" viewBox="0 0 54 54"><circle class="ring-bg" cx="27" cy="27" r="${r}"/><circle class="ring-fg" cx="27" cy="27" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}"/><text x="27" y="32" text-anchor="middle">${Math.round(f * 100)}%</text></svg>`;
  }
  /* Một dòng món gọn: ảnh nhỏ · tên · nhãn · công thức rút gọn */
  function drinkRow(d) {
    const p = photosOf(d.id)[0];
    const temp = d.temp === "hot" ? "Nóng" : d.temp === "blend" ? "Đá xay" : "Đá";
    return `<a class="drink-row" href="#mon-${d.id}">
      <span class="dr-ph">${p ? `<img src="images/drinks/thumb/${esc(p.f)}" alt="" loading="lazy" decoding="async">` : cupSVG(d, { cls: "" })}</span>
      <span class="dr-main"><b>${esc(d.name)}</b><small><i class="tdot ${d.temp}"></i>${temp}${d.sizes ? ` · Size ${d.sizes.join("/")}` : ""}</small></span>
      ${learned.has(d.id) ? `<span class="dr-done" title="Đã thuộc" aria-label="Đã thuộc">${I.ok}</span>` : "<span></span>"}
      <span class="chev" aria-hidden="true">${I.next}</span>
    </a>`;
  }
  let openCats = new Set(store.get("openCats", []));
  function matchDrink(d, q) {
    if (!q) return true;
    const hay = norm([d.name, ...(d.aka || []), ...d.ing.map((i) => i.n), catById[d.cat].name].join(" | "));
    return norm(q).split(" ").every((w) => hay.includes(w));
  }
  function renderHome() {
    setTitle("");
    const hour = new Date().getHours();
    const hi = hour < 11 ? "Chào buổi sáng" : hour < 14 ? "Chào buổi trưa" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
    view.innerHTML = `
      <section class="section">
        <div class="hello"><span class="eyebrow">${hi}</span><h1>Hôm nay mình học món gì?</h1></div>
        <div class="search-row">
          <label class="search" for="q">${I.search}<input id="q" type="search" placeholder="Tìm món, nguyên liệu…" value="${esc(homeState.q)}" autocomplete="off" enterkeyhint="search"><button class="clear" type="button" aria-label="Xoá tìm kiếm" ${homeState.q ? "" : "hidden"}>${I.x}</button></label>
          <button class="filter-btn" id="filter-btn" type="button" aria-haspopup="dialog" aria-label="Bộ lọc">${I.filter}<span class="fcount" id="fcount" hidden></span></button>
        </div>
        <div class="active-filters" id="active-filters"></div>
        <div class="progress-card">${progressRing(learned.size, drinks.length)}
          <div><b>Đã thuộc ${learned.size}/${drinks.length} món</b><div class="muted small">Lật thẻ để ôn, làm bài kiểm tra để chắc tay.</div>
          <div class="actions"><a class="link-btn" href="#hoc">Ôn bằng thẻ →</a><a class="link-btn" href="#kiem-tra">Làm kiểm tra →</a></div></div></div>
      </section>
      <div id="list"></div>
      <div class="footer-note"><span>Công thức theo ${esc(MENU.source)}.</span></div>`;
    const input = $("#q"), clear = $(".search .clear");
    input.addEventListener("input", () => { homeState.q = input.value; clear.hidden = !input.value; renderList(); });
    clear.addEventListener("click", () => { homeState.q = ""; input.value = ""; clear.hidden = true; renderList(); input.focus(); });
    $("#filter-btn").addEventListener("click", openFilter);
    renderList();
  }

  /* ───────── Bộ lọc món (1 nút → bảng chọn) ───────── */
  const TEMP_OPTS = [["all", "Tất cả"], ["hot", "Nóng"], ["ice", "Đá"], ["blend", "Đá xay"]];
  const PROG_OPTS = [["all", "Tất cả"], ["todo", "Chưa thuộc"], ["done", "Đã thuộc"]];
  const filterCount = () => (homeState.cat !== "all") + (homeState.temp !== "all") + (homeState.prog !== "all");
  const passFilter = (d) => (homeState.cat === "all" || d.cat === homeState.cat) && (homeState.temp === "all" || d.temp === homeState.temp) &&
    (homeState.prog === "all" || (homeState.prog === "done") === learned.has(d.id));
  function drawFilterSummary() {
    const n = filterCount(), fc = $("#fcount"), box = $("#active-filters");
    if (!fc || !box) return;
    fc.hidden = !n; fc.textContent = n;
    $("#filter-btn").classList.toggle("on", n > 0);
    const parts = [];
    if (homeState.cat !== "all") parts.push(catById[homeState.cat].short);
    if (homeState.temp !== "all") parts.push(TEMP_OPTS.find((x) => x[0] === homeState.temp)[1]);
    if (homeState.prog !== "all") parts.push(PROG_OPTS.find((x) => x[0] === homeState.prog)[1]);
    box.innerHTML = n ? `<span>Đang lọc: <b>${parts.map(esc).join(" · ")}</b></span><button type="button" class="link-btn" id="clear-filter">Bỏ lọc</button>` : "";
    const c = $("#clear-filter");
    if (c) c.addEventListener("click", () => { homeState.cat = "all"; homeState.temp = "all"; homeState.prog = "all"; saveFilter(); renderList(); });
  }
  function saveFilter() { store.set("filter", { cat: homeState.cat, temp: homeState.temp, prog: homeState.prog }); }
  function openFilter() {
    const draft = { cat: homeState.cat, temp: homeState.temp, prog: homeState.prog };
    const wrap = document.createElement("div");
    wrap.className = "sheet-wrap";
    const opt = (name, val, label, cur) => `<button type="button" class="opt-chip" data-k="${name}" data-v="${val}" aria-pressed="${cur === val}">${esc(label)}</button>`;
    const count = () => drinks.filter((d) => (draft.cat === "all" || d.cat === draft.cat) && (draft.temp === "all" || d.temp === draft.temp) && (draft.prog === "all" || (draft.prog === "done") === learned.has(d.id))).length;
    const draw = () => {
      wrap.innerHTML = `<div class="sheet-backdrop" data-close></div>
        <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="f-title">
          <header class="sheet-head"><b id="f-title">Bộ lọc</b><button class="icon-btn" type="button" data-close aria-label="Đóng">${I.x}</button></header>
          <div class="sheet-body">
            <div class="f-group"><div class="eyebrow">Nhóm món</div><div class="opt-wrap">${opt("cat", "all", "Tất cả", draft.cat)}${MENU.categories.map((c) => opt("cat", c.id, c.short, draft.cat)).join("")}</div></div>
            <div class="f-group"><div class="eyebrow">Loại</div><div class="opt-wrap">${TEMP_OPTS.map(([v, l]) => opt("temp", v, l, draft.temp)).join("")}</div></div>
            <div class="f-group"><div class="eyebrow">Tiến độ học</div><div class="opt-wrap">${PROG_OPTS.map(([v, l]) => opt("prog", v, l, draft.prog)).join("")}</div></div>
          </div>
          <footer class="sheet-foot"><button class="btn btn-ghost" type="button" id="f-reset">Xoá lọc</button><button class="btn btn-primary" type="button" id="f-apply">Xem ${count()} món</button></footer>
        </section>`;
      $$("[data-close]", wrap).forEach((b) => b.addEventListener("click", close));
      $$(".opt-chip", wrap).forEach((b) => b.addEventListener("click", () => { draft[b.dataset.k] = b.dataset.v; draw(); }));
      $("#f-reset", wrap).addEventListener("click", () => { draft.cat = "all"; draft.temp = "all"; draft.prog = "all"; draw(); });
      $("#f-apply", wrap).addEventListener("click", () => { Object.assign(homeState, draft); saveFilter(); renderList(); close(); });
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    function close() { document.removeEventListener("keydown", onKey); document.body.classList.remove("chat-lock"); wrap.remove(); const fb = $("#filter-btn"); if (fb) fb.focus({ preventScroll: true }); }
    document.addEventListener("keydown", onKey);
    document.body.classList.add("chat-lock");
    document.body.appendChild(wrap);
    draw();
    $("#f-apply", wrap).focus({ preventScroll: true });
  }
  function renderList() {
    const list = $("#list");
    const q = homeState.q.trim();
    const cats = MENU.categories.filter((c) => homeState.cat === "all" || c.id === homeState.cat);
    const auto = !!q || filterCount() > 0; // đang tìm/lọc thì mở sẵn các nhóm có kết quả
    let html = "", n = 0;
    cats.forEach((c) => {
      const ds = drinks.filter((d) => d.cat === c.id && passFilter(d) && matchDrink(d, q));
      if (!ds.length) return;
      n += ds.length;
      const all = drinks.filter((d) => d.cat === c.id);
      const done = all.filter((d) => learned.has(d.id)).length;
      const cover = ds.map((d) => photosOf(d.id)[0]).find(Boolean);
      const title = c.name.length > 22 ? c.short : c.name;
      html += `<details class="cat-acc" data-cat="${c.id}" ${auto || openCats.has(c.id) ? "open" : ""}>
        <summary>
          <span class="cat-thumb">${cover ? `<img src="images/drinks/thumb/${esc(cover.f)}" alt="" loading="lazy" decoding="async">` : ""}</span>
          <span class="cat-main"><b>${esc(title)}</b><small>${ds.length} món${done ? ` · đã thuộc ${done}` : ""}</small></span>
          <span class="chev" aria-hidden="true">${I.next}</span>
        </summary>
        <div class="drink-rows">${ds.map(drinkRow).join("")}</div>
      </details>`;
    });
    if (!n) html = q
      ? `<div class="empty"><div>Không thấy món nào khớp “${esc(q)}”${filterCount() ? " trong bộ lọc đang chọn" : ""}.</div><button class="btn btn-primary" type="button" data-ask="${esc(q)}">${I.chat} Hỏi trợ lý AI</button></div>`
      : `<div class="empty"><div>Không có món nào với bộ lọc này.</div></div>`;
    list.innerHTML = html ? `<div class="menu-list">${html}</div>` : html;
    drawFilterSummary();
    if (!auto) $$("details.cat-acc", list).forEach((el) => el.addEventListener("toggle", () => {
      if (el.open) openCats.add(el.dataset.cat); else openCats.delete(el.dataset.cat);
      store.set("openCats", Array.from(openCats));
    }));
    const askBtn = $("[data-ask]", list);
    if (askBtn) askBtn.addEventListener("click", () => openChat({ drink: null, prefill: askBtn.dataset.ask }));
  }

  /* ───────── DETAIL ───────── */
  function gallery(d) {
    const ps = photosOf(d.id);
    if (!ps.length) return `<div class="gallery" style="aspect-ratio:4/3;display:grid;place-items:center;padding:16px">${cupSVG(d, { cls: "cup-svg" }).replace("<svg ", '<svg style="height:100%;width:auto" ')}</div>`;
    return `<div class="gallery">
      <div class="gallery-track" tabindex="0" aria-label="Ảnh ${esc(d.name)}">${ps.map((p, i) => `<figure><button type="button" data-lb="${i}" aria-label="Phóng to ảnh ${i + 1}">${imgTag(p, { sizes: "(min-width: 900px) 560px, 100vw", eager: i === 0, alt: `${d.name} — ảnh ${i + 1}` })}</button></figure>`).join("")}</div>
      ${ps.length > 1 ? `<div class="gallery-dots" aria-hidden="true">${ps.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>
      <button class="gallery-nav prev" type="button" aria-label="Ảnh trước">${I.back}</button><button class="gallery-nav next" type="button" aria-label="Ảnh sau">${I.next}</button>` : ""}
    </div>
    ${ps.length > 1 ? `<div class="thumbs">${ps.map((p, i) => `<button type="button" data-go="${i}" aria-label="Xem ảnh ${i + 1}" aria-current="${i === 0}"><img src="images/drinks/thumb/${esc(p.f)}" alt="" loading="lazy" decoding="async"></button>`).join("")}</div>` : ""}`;
  }
  function wireGallery(root, d) {
    const track = $(".gallery-track", root);
    if (!track) return;
    const dots = $$(".gallery-dots i", root), th = $$(".thumbs button", root);
    const go = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    let cur = 0;
    track.addEventListener("scroll", () => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i === cur) return; cur = i;
      dots.forEach((x, j) => x.classList.toggle("on", j === i));
      th.forEach((x, j) => x.setAttribute("aria-current", j === i));
    }, { passive: true });
    th.forEach((b) => b.addEventListener("click", () => go(+b.dataset.go)));
    const prev = $(".gallery-nav.prev", root), next = $(".gallery-nav.next", root);
    const n = photosOf(d.id).length;
    if (prev) prev.addEventListener("click", () => go((cur - 1 + n) % n));
    if (next) next.addEventListener("click", () => go((cur + 1) % n));
    $$("[data-lb]", root).forEach((b) => b.addEventListener("click", () => openLightbox(photosOf(d.id), +b.dataset.lb, d.name)));
  }

  function ingRows(d, size, both) {
    return d.ing.map((i) => {
      const link = i.p && prepById[i.p] ? `<a href="#btp-${i.p}">${esc(i.n)}</a>` : esc(i.n);
      let qty;
      if (both && d.sizes && d.sizes.length > 1 && typeof i.q === "object") {
        qty = `<div class="qty both num">${d.sizes.map((s) => `<em>${s}</em>${esc(i.q[s])}`).join(" · ")}<span>${esc(i.u)}</span></div>`;
      } else qty = `<div class="qty num">${esc(qtyOf(i, size))}<span>${esc(i.u)}</span></div>`;
      return `<li><span class="dot" style="background:${i.k ? colorOf(i.k) : "var(--surface-3)"}"></span><div class="name">${link}${i.side ? "<small>Phục vụ kèm</small>" : ""}${i.p && prepById[i.p] ? "<small>Bán thành phẩm — chạm để xem cách làm</small>" : ""}</div>${qty}</li>`;
    }).join("");
  }

  let detailSize = {};
  function renderDetail(id) {
    const d = byId[id];
    setTitle(d.name);
    const sizes = sizesOf(d);
    const size = detailSize[id] || sizes[0];
    const list = drinks;
    const idx = list.indexOf(d);
    const prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];
    const relatedPreps = uniq(d.ing.filter((i) => i.p && prepById[i.p]).map((i) => i.p));
    view.innerHTML = `
      <div class="back-row"><a href="#mon">${I.back} Tất cả món</a></div>
      <div class="detail">
        <div class="col-media">${gallery(d)}</div>
        <div class="col-info" style="display:flex;flex-direction:column;gap:18px;min-width:0">
          <div class="title-block"><span class="eyebrow">${esc(catById[d.cat].name)}</span><h1>${esc(d.name)}</h1>
            <div class="badges">${tempBadge(d)}${sizeBadge(d)}${learned.has(d.id) ? '<span class="badge badge-done">Đã thuộc</span>' : ""}</div></div>
          ${d.sizes && d.sizes.length > 1 ? `<div><div class="seg" role="group" aria-label="Chọn size">${d.sizes.map((s) => `<button type="button" data-size="${s}" aria-pressed="${s === size}">Size ${s}</button>`).join("")}</div></div>` : ""}
          <div class="card visual">${cupSVG(d)}<div><div class="eyebrow" style="margin-bottom:8px">Lớp trong ly</div>${cupLegend(d)}</div></div>
          <section class="section" style="margin-top:4px"><div class="section-head"><h2>Thành phần${size ? ` · size ${size}` : ""}</h2></div>
            <div class="panel" style="padding:4px 14px"><ul class="ing-list">${ingRows(d, size)}</ul></div></section>
          <section class="section"><div class="section-head"><h2>${d.temp === "hot" ? "Bộ ly tách" : "Packaging"}</h2></div><div class="pack">${packOf(d, size).map((x) => `<span>${esc(x)}</span>`).join("")}</div></section>
          <section class="section"><div class="section-head"><h2>Các bước</h2><span class="muted small">Chạm để đánh dấu</span></div>
            <ol class="steps">${d.steps.map((s) => `<li><button type="button" aria-pressed="false">${esc(s)}</button></li>`).join("")}</ol></section>
          ${(d.notes || []).map((n) => `<div class="note">${I.info}<div>${esc(n)}</div></div>`).join("")}
          ${relatedPreps.length ? `<section class="section"><div class="section-head"><h2>Bán thành phẩm cần có</h2></div><div class="related">${relatedPreps.map((p) => `<a href="#btp-${p}"><span>${esc(prepById[p].name)} <span class="muted small">· để ${esc(prepById[p].shelf)}</span></span>${I.next}</a>`).join("")}</div></section>` : ""}
          <div class="btn-row">
            <button class="btn ${learned.has(d.id) ? "btn-ghost" : "btn-good"}" type="button" id="toggle-learn">${I.ok} ${learned.has(d.id) ? "Bỏ đánh dấu đã thuộc" : "Đánh dấu đã thuộc"}</button>
            <button class="btn btn-primary" type="button" id="ask-this">${I.chat} Hỏi AI về món này</button>
          </div>
          <a class="btn btn-ghost btn-block" href="#kiem-tra" id="quiz-this">${I.check} Kiểm tra riêng món này</a>
        </div>
      </div>
      <nav class="pager" aria-label="Món khác"><a href="#mon-${prev.id}"><small>← Món trước</small><b>${esc(prev.name)}</b></a><a class="next" href="#mon-${next.id}"><small>Món sau →</small><b>${esc(next.name)}</b></a></nav>`;
    wireGallery(view, d);
    $$(".seg button").forEach((b) => b.addEventListener("click", () => { detailSize[id] = b.dataset.size; const y = window.scrollY; renderDetail(id); window.scrollTo(0, y); }));
    $$(".steps button").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true")));
    $("#toggle-learn").addEventListener("click", () => {
      if (learned.has(id)) learned.delete(id); else { learned.add(id); toast("Tuyệt! Đã thêm vào danh sách đã thuộc."); }
      saveLearned(); const y = window.scrollY; renderDetail(id); window.scrollTo(0, y);
    });
    $("#ask-this").addEventListener("click", () => openChat({ drink: id }));
    $("#quiz-this").addEventListener("click", () => { quizFocus = id; });
  }

  /* ───────── LIGHTBOX ───────── */
  function openLightbox(ps, i, name) {
    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Xem ảnh");
    const draw = () => {
      const p = ps[i];
      lb.innerHTML = `<div class="lb-img"><img src="images/drinks/full/${esc(p.f)}" alt="${esc(name)}"></div>
        <div class="lb-bar">${ps.length > 1 ? `<button class="icon-btn" data-d="-1" aria-label="Ảnh trước">${I.back}</button>` : ""}
        <div class="grow">${esc(p.title || name)}<br>Tác giả: ${esc(p.by || "không rõ")} · ${p.licUrl && /^https:\/\//.test(p.licUrl) ? `<a href="${esc(p.licUrl)}" target="_blank" rel="noopener">${esc(p.lic)}</a>` : esc(p.lic || "")} · <a href="${esc(p.src)}" target="_blank" rel="noopener">Xem gốc</a></div>
        ${ps.length > 1 ? `<button class="icon-btn" data-d="1" aria-label="Ảnh sau">${I.next}</button>` : ""}<button class="icon-btn" data-close aria-label="Đóng">${I.x}</button></div>`;
      $$("[data-d]", lb).forEach((b) => b.addEventListener("click", () => { i = (i + +b.dataset.d + ps.length) % ps.length; draw(); }));
      $("[data-close]", lb).addEventListener("click", close);
      $("[data-close]", lb).focus();
    };
    const onKey = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") { i = (i + 1) % ps.length; draw(); } if (e.key === "ArrowLeft") { i = (i - 1 + ps.length) % ps.length; draw(); } };
    function close() { document.removeEventListener("keydown", onKey); lb.remove(); }
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-img")) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(lb);
    draw();
  }

  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2400);
  }

  /* ───────── FLASHCARDS ───────── */
  const learnState = { cat: "all", deck: [], i: 0, flipped: false, onlyNew: false };
  function buildDeck() {
    let ds = drinks.filter((d) => learnState.cat === "all" || d.cat === learnState.cat);
    if (learnState.onlyNew) ds = ds.filter((d) => !learned.has(d.id));
    const fresh = shuffle(ds.filter((d) => !learned.has(d.id))), old = shuffle(ds.filter((d) => learned.has(d.id)));
    learnState.deck = fresh.concat(old); learnState.i = 0; learnState.flipped = false;
  }
  function renderLearn() {
    setTitle("Học nhanh");
    if (!learnState.deck.length) buildDeck();
    const st = learnState;
    const total = drinks.filter((d) => st.cat === "all" || d.cat === st.cat).length;
    const done = drinks.filter((d) => (st.cat === "all" || d.cat === st.cat) && learned.has(d.id)).length;
    const d = st.deck[st.i];
    view.innerHTML = `
      <div class="learn-top">
        <div class="hello"><span class="eyebrow">Thẻ ghi nhớ</span><h1>Nhìn món — nhớ công thức</h1></div>
        <div class="chips" role="toolbar" aria-label="Chọn nhóm">
          <button class="chip" data-cat="all" aria-pressed="${st.cat === "all"}">Tất cả</button>
          ${MENU.categories.map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${st.cat === c.id}">${esc(c.short)}</button>`).join("")}
        </div>
        <div class="flash-meta"><span>Đã thuộc <b class="num">${done}/${total}</b></span>
          <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="only-new" ${st.onlyNew ? "checked" : ""} style="width:20px;height:20px"> Chỉ món chưa thuộc</label></div>
        <div class="bar"><i style="width:${total ? (done / total) * 100 : 0}%"></i></div>
      </div>
      ${d ? `
      <div class="flash-wrap">
        <button class="flash ${st.flipped ? "flipped" : ""}" type="button" id="flash" aria-label="Chạm để lật thẻ">
          <div class="face front">
            <div class="ph">${photosOf(d.id)[0] ? imgTag(photosOf(d.id)[0], { sizes: "(min-width: 700px) 640px, 100vw", alt: d.name, eager: true }) : ""}</div>
            <div class="cap"><div style="display:flex;gap:6px">${tempBadge(d)}${sizeBadge(d)}</div><h2>${esc(d.name)}</h2>
            <span class="hint">${I.flip} Tự nhẩm công thức, rồi chạm để lật thẻ</span></div>
          </div>
          <div class="face back">
            <h3>${esc(d.name)}</h3>
            <div class="mini">${cupSVG(d)}<ul class="ing-list" style="font-size:14.5px">${ingRows(d, d.sizes ? d.sizes[0] : null, true)}</ul></div>
            <div><div class="eyebrow" style="margin-bottom:6px">Các bước</div><ol>${d.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
            <div class="muted small">${packOf(d, d.sizes ? d.sizes[d.sizes.length - 1] : null).map(esc).join(" · ")}</div>
          </div>
        </button>
      </div>
      <div class="flash-meta" style="margin-top:10px"><span>Thẻ <b class="num">${st.i + 1}/${st.deck.length}</b></span><a class="link-btn" href="#mon-${d.id}">Xem chi tiết món →</a></div>
      <div class="flash-actions">
        <button class="btn btn-ghost" type="button" id="again">Chưa nhớ</button>
        <button class="btn btn-good" type="button" id="got">${I.ok} Nhớ rồi</button>
      </div>` : `
      <div class="empty panel" style="margin-top:16px"><div style="font-size:40px">🎉</div><b>Bạn đã thuộc hết các món trong nhóm này!</b>
        <div class="btn-row" style="width:100%"><button class="btn btn-ghost" type="button" id="restart">Ôn lại từ đầu</button><a class="btn btn-primary" href="#kiem-tra">Làm bài kiểm tra</a></div></div>`}`;
    $$(".chip[data-cat]").forEach((b) => b.addEventListener("click", () => { st.cat = b.dataset.cat; buildDeck(); renderLearn(); }));
    $("#only-new").addEventListener("change", (e) => { st.onlyNew = e.target.checked; buildDeck(); renderLearn(); });
    const fl = $("#flash");
    if (fl) {
      fl.addEventListener("click", () => { st.flipped = !st.flipped; fl.classList.toggle("flipped", st.flipped); });
      let sx = null;
      fl.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
      fl.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 70 && st.flipped) (dx > 0 ? got : again)(); }, { passive: true });
    }
    const advance = () => { st.i++; st.flipped = false; if (st.i >= st.deck.length) { buildDeck(); if (!st.deck.length || st.deck.every((x) => learned.has(x.id))) st.deck = []; } renderLearn(); };
    function got() { learned.add(d.id); saveLearned(); advance(); }
    function again() { st.deck.push(d); advance(); }
    const g = $("#got"), a = $("#again"), r = $("#restart");
    if (g) g.addEventListener("click", got);
    if (a) a.addEventListener("click", again);
    if (r) r.addEventListener("click", () => { st.onlyNew = false; buildDeck(); renderLearn(); });
  }

  /* ───────── QUIZ ───────── */
  let quizFocus = null;
  const quiz = { cat: "all", n: 10, qs: [], i: 0, score: 0, wrong: [], answered: false, started: false };
  const numOf = (v) => parseFloat(String(v).replace(",", "."));
  const allIngNames = uniq(drinks.flatMap((d) => d.ing.filter((i) => i.k !== "decor" && !i.side).map((i) => i.n)));

  function qQuantity(d) {
    const ings = d.ing.filter((i) => !i.side && i.k !== "decor" && !isNaN(numOf(qtyOf(i, d.sizes ? d.sizes[0] : null))));
    if (!ings.length) return null;
    const ing = pick(ings);
    const size = d.sizes ? pick(d.sizes) : null;
    const right = qtyOf(ing, size);
    const rv = numOf(right);
    const pool = uniq(drinks.flatMap((x) => x.ing.filter((i) => i.u === ing.u).flatMap((i) => (typeof i.q === "object" ? Object.values(i.q) : [i.q]))).map(String))
      .filter((v) => !isNaN(numOf(v)) && numOf(v) !== rv);
    let opts = shuffle(pool).slice(0, 3);
    const step = rv >= 100 ? 50 : rv >= 20 ? 10 : rv >= 5 ? 2 : 1;
    let k = 1; while (opts.length < 3) { const c = String(rv + step * k * (k % 2 ? 1 : -1)); if (numOf(c) > 0 && !opts.includes(c) && numOf(c) !== rv) opts.push(c); k++; }
    return { d, q: `${d.name}${size ? ` (size ${size})` : ""} dùng bao nhiêu ${ing.n}?`, opts: shuffle([String(right), ...opts]).map((o) => `${o} ${ing.u}`), answer: `${right} ${ing.u}`, explain: `${d.name}${size ? ` size ${size}` : ""}: ${formulaLine(d, size)}.` };
  }
  function qWhichDrink(d) {
    const ing = pick(d.ing.filter((i) => !i.side && i.k !== "decor" && !["Đá viên", "Đường nước", "Nước nóng", "Nước lọc"].includes(i.n)));
    if (!ing) return null;
    const others = drinks.filter((x) => !x.ing.some((i) => i.n === ing.n));
    if (others.length < 3) return null;
    const opts = shuffle([d, ...shuffle(others).slice(0, 3)]);
    return { d, q: `Món nào có “${ing.n}” trong công thức?`, opts: opts.map((x) => x.name), answer: d.name, explain: `${d.name} dùng ${ing.n} ${qtyOf(ing, d.sizes ? d.sizes[0] : null)} ${ing.u}.` };
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
  function buildQuiz() {
    const pool = quizFocus ? [byId[quizFocus]] : drinks.filter((d) => quiz.cat === "all" || d.cat === quiz.cat);
    const out = []; let guard = 0;
    const gens = quizFocus ? [qQuantity, qQuantity, qPack, qStep, qWhichDrink] : [qQuantity, qQuantity, qQuantity, qWhichDrink, qPack, qStep];
    while (out.length < quiz.n && guard++ < 300) {
      let q;
      if (!quizFocus && quiz.cat === "all" && Math.random() < 0.14) q = Math.random() < 0.5 ? qShelf() : qPrep();
      else q = pick(gens)(pick(pool));
      if (q && !out.some((x) => x.q === q.q && x.answer === q.answer)) out.push(q);
    }
    quiz.qs = out; quiz.i = 0; quiz.score = 0; quiz.wrong = []; quiz.answered = false; quiz.started = true;
  }
  function renderQuiz() {
    setTitle("Kiểm tra");
    if (quizFocus) { quiz.started = false; buildQuiz(); }
    if (!quiz.started) {
      const best = store.get("best", null);
      view.innerHTML = `<div class="quiz-setup">
        <div class="hello"><span class="eyebrow">Tự kiểm tra</span><h1>Thử sức với ${quiz.n} câu hỏi</h1></div>
        <p class="muted" style="margin:0">Câu hỏi về định lượng, dụng cụ, thứ tự các bước, bán thành phẩm và hạn dùng — lấy đúng từ cẩm nang của quán.</p>
        <div class="chips" role="toolbar" aria-label="Chọn nhóm"><button class="chip" data-cat="all" aria-pressed="${quiz.cat === "all"}">Tất cả món</button>${MENU.categories.map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${quiz.cat === c.id}">${esc(c.short)}</button>`).join("")}</div>
        <div class="seg" role="group" aria-label="Số câu">${[5, 10, 20].map((n) => `<button type="button" data-n="${n}" aria-pressed="${quiz.n === n}">${n} câu</button>`).join("")}</div>
        ${best ? `<div class="muted small">Điểm cao nhất của bạn: <b>${best.score}/${best.n}</b></div>` : ""}
        <button class="btn btn-primary btn-block" type="button" id="start">${I.check} Bắt đầu</button></div>`;
      $$(".chip[data-cat]").forEach((b) => b.addEventListener("click", () => { quiz.cat = b.dataset.cat; renderQuiz(); }));
      $$("[data-n]").forEach((b) => b.addEventListener("click", () => { quiz.n = +b.dataset.n; renderQuiz(); }));
      $("#start").addEventListener("click", () => { buildQuiz(); renderQuiz(); });
      return;
    }
    quizFocus = null;
    if (quiz.i >= quiz.qs.length) {
      const best = store.get("best", null);
      if (!best || quiz.score / quiz.qs.length > best.score / best.n) store.set("best", { score: quiz.score, n: quiz.qs.length });
      const pct = quiz.qs.length ? quiz.score / quiz.qs.length : 0;
      view.innerHTML = `<div class="quiz-setup">
        <div class="panel" style="display:flex;flex-direction:column;gap:8px;align-items:flex-start"><span class="eyebrow">Kết quả</span><div class="score-big num">${quiz.score}/${quiz.qs.length}</div>
        <div>${pct === 1 ? "Xuất sắc! Không sai câu nào." : pct >= 0.7 ? "Tốt lắm — ôn lại vài câu sai là chắc tay." : "Cần ôn thêm. Xem lại các câu sai bên dưới nhé."}</div></div>
        ${quiz.wrong.length ? `<h2 style="font-size:18px">Câu cần xem lại</h2><div class="review-list">${quiz.wrong.map((w) => `<div class="item"><b>${esc(w.q)}</b>Đáp án đúng: <b style="display:inline">${esc(w.answer)}</b><div class="muted">${esc(w.explain)}</div>${w.d ? `<a class="link-btn" href="#mon-${w.d.id}">Xem công thức →</a>` : ""}</div>`).join("")}</div>` : ""}
        <div class="btn-row"><button class="btn btn-primary" type="button" id="again">Làm bài mới</button><button class="btn btn-ghost" type="button" id="setup">Đổi nhóm món</button></div></div>`;
      $("#again").addEventListener("click", () => { buildQuiz(); renderQuiz(); });
      $("#setup").addEventListener("click", () => { quiz.started = false; renderQuiz(); });
      return;
    }
    const q = quiz.qs[quiz.i];
    const p = q.d ? photosOf(q.d.id)[0] : null;
    view.innerHTML = `<div class="quiz-setup">
      <div class="flash-meta"><span>Câu <b class="num">${quiz.i + 1}/${quiz.qs.length}</b></span><span>Đúng <b class="num">${quiz.score}</b></span></div>
      <div class="bar"><i style="width:${(quiz.i / quiz.qs.length) * 100}%"></i></div>
      <div class="card quiz-card">
        ${q.d ? `<div class="quiz-ctx">${p ? `<img src="images/drinks/thumb/${esc(p.f)}" alt="">` : ""}<div><span class="eyebrow">${esc(catById[q.d.cat].short)}</span><div><b>${esc(q.d.name)}</b></div></div></div>` : `<div class="quiz-ctx"><div><span class="eyebrow">${q.prep ? "Bán thành phẩm" : "Bảng date"}</span></div></div>`}
        <div class="quiz-q">${esc(q.q)}</div>
        <div class="options">${q.opts.map((o, i) => `<button class="opt" type="button" data-o="${esc(o)}"><span class="k">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
        <div id="explain"></div>
      </div></div>`;
    $$(".opt").forEach((b) => b.addEventListener("click", () => {
      if (quiz.answered) return;
      quiz.answered = true;
      const ok = b.dataset.o === q.answer;
      if (ok) quiz.score++; else quiz.wrong.push(q);
      $$(".opt").forEach((x) => { x.disabled = true; if (x.dataset.o === q.answer) x.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      $("#explain").innerHTML = `<div class="explain">${ok ? "✅ Chính xác!" : "❌ Chưa đúng."} ${esc(q.explain)}</div>
        <button class="btn btn-primary btn-block" type="button" id="nextq" style="margin-top:12px">${quiz.i + 1 < quiz.qs.length ? "Câu tiếp theo" : "Xem kết quả"} ${I.next}</button>`;
      $("#nextq").addEventListener("click", () => { quiz.i++; quiz.answered = false; renderQuiz(); });
      $("#nextq").focus({ preventScroll: true });
      $("#explain").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
  }

  /* ───────── PREPS (gọn: 2 thẻ chuyển, danh sách nhóm, hạn dùng dạng nhãn màu) ───────── */
  const prepState = { view: "nen", q: "" };
  const hoursOf = (s) => { const n = parseFloat(s); return /ngày/.test(s) ? n * 24 : n; };
  const datePill = (s) => { const h = hoursOf(s); return `<span class="pill ${h <= 24 ? "pill-short" : h <= 72 ? "pill-mid" : "pill-long"} num">${esc(s)}</span>`; };
  const PREP_GROUPS = [["Nền trà trái cây", "Nền trà trái cây"], ["Nền trà sữa", "Nền trà sữa"], ["Nền milk foam", "Milk foam"], ["Các loại khác", "Khác"]];
  const STORE_GROUPS = [
    { key: "mát", label: "Tủ mát", sub: "dưới 5°C", icon: I.snow, cls: "cold" },
    { key: "phòng", label: "Nhiệt độ phòng", sub: "dưới 25°C", icon: I.home, cls: "room" },
    { key: "đông", label: "Tủ đông", sub: "dưới 2°C", icon: I.ice, cls: "frozen" }
  ];

  function renderPreps(openId) {
    setTitle("Bán thành phẩm");
    if (openId) prepState.view = "nen";
    view.innerHTML = `
      <div class="prep-top">
        <div class="hello"><span class="eyebrow">Chuẩn bị đầu ca</span><h1>Bán thành phẩm</h1></div>
        <div class="seg seg-full" role="tablist" aria-label="Chọn mục">
          <button type="button" role="tab" data-v="nen" aria-pressed="${prepState.view === "nen"}" aria-selected="${prepState.view === "nen"}">Công thức nền <span class="cnt">${MENU.preps.length}</span></button>
          <button type="button" role="tab" data-v="date" aria-pressed="${prepState.view === "date"}" aria-selected="${prepState.view === "date"}">Hạn dùng <span class="cnt">${MENU.shelf.length}</span></button>
        </div>
        <label class="search" for="prep-q">${I.search}<input id="prep-q" type="search" placeholder="${prepState.view === "nen" ? "Tìm, vd: milk foam, thạch" : "Tìm, vd: sữa đặc, trân châu"}" value="${esc(prepState.q)}" autocomplete="off"></label>
      </div>
      <div id="prep-list"></div>`;
    $$(".seg-full button").forEach((b) => b.addEventListener("click", () => { prepState.view = b.dataset.v; prepState.q = ""; renderPreps(); }));
    $("#prep-q").addEventListener("input", (e) => { prepState.q = e.target.value; drawPrepList(); });
    drawPrepList(openId);
    if (openId) {
      const el = document.getElementById("btp-" + openId);
      if (el) { el.open = true; el.classList.add("flash-hl"); setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 60); setTimeout(() => el.classList.remove("flash-hl"), 2200); }
    } else window.scrollTo(0, 0);
  }

  function drawPrepList(openId) {
    const box = $("#prep-list");
    const q = norm(prepState.q);
    if (prepState.view === "nen") {
      const match = (p) => !q || norm([p.name, p.group, ...p.ing.map((i) => i[0])].join(" ")).includes(q);
      box.innerHTML = PREP_GROUPS.map(([g, label]) => {
        const ps = MENU.preps.filter((p) => p.group === g && match(p));
        if (!ps.length) return "";
        return `<section class="group"><h2 class="group-h">${esc(label)}<span>${ps.length}</span></h2><div class="list-card">${ps.map((p) => {
          const used = drinks.filter((d) => d.ing.some((i) => i.p === p.id));
          return `<details class="row-d" id="btp-${p.id}" ${p.id === openId ? "open" : ""}>
            <summary><div class="row-main"><b>${esc(p.name)}</b><small>Ra <span class="num">${esc(p.yield)}</span></small></div>${datePill(p.shelf)}<span class="chev" aria-hidden="true">${I.next}</span></summary>
            <div class="row-body">
              <ul class="kv">${p.ing.map((i) => `<li><span>${esc(i[0])}</span><b class="num">${esc(i[2])} <small>${esc(i[1])}</small></b></li>`).join("")}</ul>
              <ol class="mini-steps">${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
              ${(p.notes || []).map((n) => `<div class="note">${I.info}<div>${esc(n)}</div></div>`).join("")}
              ${used.length ? `<div class="used">Dùng cho: ${used.map((d) => `<a href="#mon-${d.id}">${esc(d.name)}</a>`).join(" · ")}</div>` : ""}
            </div></details>`;
        }).join("")}</div></section>`;
      }).join("") || `<div class="empty">Không có bán thành phẩm khớp “${esc(prepState.q)}”.</div>`;
    } else {
      const rows = MENU.shelf.filter((r) => !q || norm(r.join(" ")).includes(q));
      box.innerHTML = `<div class="legend-pills"><span class="pill pill-short">≤ 24 tiếng</span><span class="pill pill-mid">2–3 ngày</span><span class="pill pill-long">4 ngày trở lên</span></div>` +
        STORE_GROUPS.map((g) => {
          const rs = rows.filter((r) => r[3].toLowerCase().includes(g.key)).sort((a, b) => hoursOf(a[2]) - hoursOf(b[2]));
          if (!rs.length) return "";
          return `<section class="group"><h2 class="group-h"><span class="g-ico ${g.cls}">${g.icon}</span>${esc(g.label)} <small>${esc(g.sub)}</small><span>${rs.length}</span></h2><div class="list-card">${rs.map((r) =>
            `<div class="row"><div class="row-main"><b>${esc(r[0])}</b><small>${esc(r[1])}</small></div>${datePill(r[2])}</div>`).join("")}</div></section>`;
        }).join("") || `<div class="empty">Không có nguyên liệu khớp “${esc(prepState.q)}”.</div>`;
    }
  }

  /* ───────── CREDITS ───────── */
  function renderCredits() {
    setTitle("Nguồn ảnh");
    const all = drinks.flatMap((d) => photosOf(d.id).map((p) => ({ p, d })));
    view.innerHTML = `<div class="back-row"><a href="#mon">${I.back} Tất cả món</a></div>
      <div class="hello"><span class="eyebrow">Ghi công</span><h1>Nguồn ảnh &amp; tác giả</h1></div>
      <p class="muted">Tất cả ảnh là ảnh chụp thật, lấy từ Wikimedia Commons theo giấy phép tự do (CC0, CC BY, CC BY-SA, Public domain). Ảnh minh hoạ kiểu món, không phải ảnh chụp tại quán. Ảnh đã được thu nhỏ để tải nhanh trên điện thoại.</p>
      <div class="credits">${all.map(({ p, d }) => `<figure><img src="images/drinks/thumb/${esc(p.f)}" alt="" loading="lazy" decoding="async"><figcaption><b>${esc(d.name)}</b><br>${esc(p.by || "Không rõ tác giả")}<br>${esc(p.lic || "")} · <a href="${esc(p.src)}" target="_blank" rel="noopener">trang gốc</a></figcaption></figure>`).join("")}</div>`;
  }

  /* ───────── AI ASSISTANT — bong bóng nổi ───────── */
  const chat = { turns: [], busy: false, sample: null, inClaude: false, useClaude: store.get("useClaude", false), ready: null, ctx: null, open: false };
  const isWide = () => window.matchMedia("(min-width: 900px)").matches;

  function detectAI() {
    if (chat.ready) return chat.ready;
    chat.ready = (async () => {
      chat.inClaude = !!(window.claude && typeof window.claude.use === "function");
      if (chat.inClaude) { try { chat.sample = await window.claude.use("sample"); } catch (e) { chat.sample = null; } }
      return aiMode();
    })();
    return chat.ready;
  }
  // Trang trong Claude: chỉ dùng Claude khi người dùng tự bật. Trang web thường: dùng Worker (Groq/Gemini) nếu đã cấu hình.
  function aiMode() {
    if (chat.sample && chat.useClaude) return "claude";
    if (!chat.inClaude && CONFIG.aiProxyUrl) return "proxy";
    return "offline";
  }

  /* tìm món được nhắc tới trong câu hỏi */
  function findDrinks(question) {
    const q = " " + norm(question) + " ";
    return drinks.map((d) => {
      let s = 0;
      [d.name, ...(d.aka || [])].forEach((n) => { const nn = norm(n); if (q.includes(" " + nn + " ") || q.includes(nn)) s = Math.max(s, nn.length + 10); });
      if (!s) { const words = norm(d.name).split(" ").filter((w) => w.length > 2); const hit = words.filter((w) => q.includes(" " + w + " ") || q.includes(" " + w)).length; if (hit >= Math.max(2, words.length - 1)) s = hit * 3; }
      return { d, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  }

  function drinkDetail(d) {
    const sz = d.sizes ? `size ${d.sizes.join("/")}` : "không chia size";
    const out = [`### ${d.name} [id: ${d.id}] — ${catById[d.cat].name} — ${d.temp === "hot" ? "nóng" : d.temp === "blend" ? "đá xay" : "đá"} — ${sz}`];
    out.push("Thành phần: " + d.ing.map((i) => `${i.n}: ${typeof i.q === "object" ? Object.entries(i.q).map(([s, v]) => `${s} ${v}`).join(" / ") : i.q} ${i.u}${i.side ? " (phục vụ kèm)" : ""}`).join("; "));
    out.push("Dụng cụ/packaging: " + (Array.isArray(d.pack) ? d.pack.join(", ") : Object.entries(d.pack).map(([s, v]) => `${s}: ${v.join(", ")}`).join(" | ")));
    out.push("Các bước: " + d.steps.map((s, i) => `${i + 1}) ${s}`).join(" "));
    if (d.notes) out.push("Lưu ý: " + d.notes.join(" "));
    return out.join("\n");
  }
  function prepDetail(p) {
    return `### ${p.name} [id: ${p.id}] — ${p.group} — thành phẩm ${p.yield} — date ${p.shelf}\nNguyên liệu: ${p.ing.map((i) => `${i[0]} ${i[2]} ${i[1]}`).join("; ")}\nCác bước: ${p.steps.map((s, i) => `${i + 1}) ${s}`).join(" ")}${p.notes ? "\nLưu ý: " + p.notes.join(" ") : ""}`;
  }
  /* Chỉ gửi phần dữ liệu liên quan tới câu hỏi để tiết kiệm token. */
  function contextFor(question, ctxId) {
    const q = norm(question);
    const lines = [`NGUỒN: ${MENU.source}. Đơn vị giữ nguyên như tài liệu.`, "", "## DANH SÁCH MÓN (tóm tắt: tên [id] · nhóm · loại · size · dụng cụ · nguyên liệu)"];
    drinks.forEach((d) => lines.push(`- ${d.name} [${d.id}] · ${catById[d.cat].short} · ${d.temp === "hot" ? "nóng" : d.temp === "blend" ? "đá xay" : "đá"} · ${d.sizes ? "size " + d.sizes.join("/") : "1 size"} · ${packOf(d, d.sizes ? d.sizes[d.sizes.length - 1] : null).join("/")} · ${d.ing.filter((i) => !i.side && i.k !== "decor").map((i) => i.n).join(", ")}`));
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

  const RULES = `Bạn là "Trợ lý pha chế" của quán, giúp nhân viên (kể cả người mới) học và tra công thức đồ uống.
Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn; xưng "mình", gọi người hỏi là "bạn".
- Định lượng, dụng cụ, các bước, hạn dùng: CHỈ lấy từ phần CHI TIẾT trong DỮ LIỆU, không bịa số. Danh sách tóm tắt không có định lượng — nếu cần định lượng của món không có chi tiết, nhờ người dùng hỏi rõ tên món.
- Câu hỏi ngoài tài liệu (kỹ thuật chung, mẹo, giải thích): được trả lời bằng kiến thức chung nhưng nói rõ "tài liệu của quán không ghi, đây là kinh nghiệm chung".
- Khi nói về một món có trong dữ liệu, đặt thẻ [[mon:ID]] trên một dòng riêng ngay sau đoạn nói về món đó (trang sẽ hiện ảnh thật ở đó). Mỗi món tối đa 1 thẻ, tối đa 3 thẻ mỗi câu trả lời. Bán thành phẩm dùng [[btp:ID]]. ID phải đúng như trong dữ liệu.
- Nếu người dùng đang xem một món và hỏi chung chung ("món này", "size L"...), hiểu là hỏi về món đó.
- Định dạng Markdown đơn giản: **đậm**, gạch đầu dòng "- ", danh sách số "1. ", tiêu đề nhỏ "### ". Không dùng bảng, không dùng HTML.`;

  const SUGGESTIONS = [
    "Cà phê sữa đá size L cần những gì?",
    "Món nào dùng milk foam dừa?",
    "Latte nóng và cappuccino nóng khác nhau chỗ nào?",
    "Cách làm nền trà olong?",
    "Milk foam để được bao lâu?"
  ];
  function suggestionsFor(id) {
    const d = id && byId[id];
    if (!d) return SUGGESTIONS;
    const out = [];
    if (d.sizes && d.sizes.length > 1) out.push("Size M và size L khác nhau thế nào?");
    out.push("Các bước pha món này?", "Mẹo để nhớ nhanh công thức này?", "Món này dùng ly, nắp, ống gì?");
    if (d.ing.some((i) => i.p)) out.push("Cần chuẩn bị bán thành phẩm gì?");
    return out;
  }

  function currentDrinkId() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    if (h.startsWith("mon-") && byId[h.slice(4)]) return h.slice(4);
    if (h === "hoc" && learnState.deck[learnState.i]) return learnState.deck[learnState.i].id;
    if (h === "kiem-tra" && quiz.started && quiz.qs[quiz.i] && quiz.qs[quiz.i].d) return quiz.qs[quiz.i].d.id;
    return null;
  }

  // Chỉ hiện công tắc Claude khi trang chạy bên trong Claude; còn lại không hiện dòng phụ nào.
  function modeLine() {
    return chat.sample ? `<button type="button" class="mini-toggle" id="ai-claude" aria-pressed="${chat.useClaude}">Dùng Claude${chat.useClaude ? " · đang bật" : ""}</button>` : "";
  }

  function buildChatUI() {
    document.body.insertAdjacentHTML("beforeend", `
      <button class="ai-fab" id="ai-fab" type="button" aria-label="Hỏi trợ lý AI" aria-expanded="false" aria-controls="ai-panel">${I.chat}</button>
      <div class="ai-backdrop" id="ai-backdrop" hidden></div>
      <section class="ai-panel" id="ai-panel" role="dialog" aria-modal="true" aria-labelledby="ai-title" hidden>
        <header class="ai-head">
          <span class="ai-ava" aria-hidden="true">${I.spark}</span>
          <div class="ai-titles"><b id="ai-title">Trợ lý pha chế</b><div class="ai-mode" id="ai-mode"></div></div>
          <button class="icon-btn" type="button" id="ai-new" aria-label="Cuộc trò chuyện mới">${I.flip}</button>
          <button class="icon-btn" type="button" id="ai-close" aria-label="Đóng">${I.x}</button>
        </header>
        <div class="ai-ctx" id="ai-ctx"></div>
        <div class="ai-body" id="ai-body">
          <div class="thread" id="thread" aria-live="polite"></div>
          <div class="suggest" id="suggest"></div>
        </div>
        <form class="composer" id="composer" autocomplete="off">
          <label class="visually-hidden" for="ask">Câu hỏi</label>
          <textarea id="ask" rows="1" placeholder="Hỏi về món bất kỳ…" enterkeyhint="send"></textarea>
          <button class="send" type="submit" id="send" aria-label="Gửi">${I.send}</button>
        </form>
      </section>`);
    const ta = $("#ask");
    const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(120, ta.scrollHeight) + "px"; };
    ta.addEventListener("input", grow);
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); $("#composer").requestSubmit(); } });
    $("#composer").addEventListener("submit", (e) => {
      e.preventDefault();
      if (chat.busy) { if (aiAbort) aiAbort.abort(); return; }
      const v = ta.value.trim(); if (!v) return;
      ta.value = ""; grow(); ask(v);
    });
    $("#ai-fab").addEventListener("click", () => openChat({}));
    $("#ai-close").addEventListener("click", closeChat);
    $("#ai-backdrop").addEventListener("click", closeChat);
    $("#ai-new").addEventListener("click", () => { if (chat.busy && aiAbort) aiAbort.abort(); chat.turns = []; drawThread(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && chat.open && !$(".lightbox")) closeChat(); });
    // Bàn phím ảo trên điện thoại: đẩy khung chat lên trên bàn phím.
    if (window.visualViewport) {
      const vv = window.visualViewport;
      const fit = () => { const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); $("#ai-panel").style.setProperty("--kb", kb + "px"); };
      vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit);
    }
  }

  function drawChrome() {
    $("#ai-mode").innerHTML = modeLine();
    const t = $("#ai-claude");
    if (t) t.addEventListener("click", () => { chat.useClaude = !chat.useClaude; store.set("useClaude", chat.useClaude); drawChrome(); updateFab(); });
    const d = chat.ctx && byId[chat.ctx];
    $("#ai-ctx").innerHTML = d ? `<span class="ctx-chip">${photosOf(d.id)[0] ? `<img src="images/drinks/thumb/${esc(photosOf(d.id)[0].f)}" alt="">` : ""}Đang hỏi về: <b>${esc(d.name)}</b><button type="button" aria-label="Bỏ chọn món" id="ai-ctx-x">${I.x}</button></span>` : "";
    const x = $("#ai-ctx-x"); if (x) x.addEventListener("click", () => { chat.ctx = null; drawChrome(); drawSuggest(); });
    drawSuggest();
  }
  function drawSuggest() {
    const sug = $("#suggest");
    sug.hidden = chat.turns.length > 0;
    sug.innerHTML = suggestionsFor(chat.ctx).map((s) => `<button type="button">${esc(s)}</button>`).join("");
    $$("button", sug).forEach((b) => b.addEventListener("click", () => ask(b.textContent)));
  }
  function updateFab() {
    const f = $("#ai-fab"); if (!f) return;
    f.classList.toggle("live", aiMode() !== "offline");
  }

  async function openChat({ drink, prefill } = {}) {
    chat.ctx = drink !== undefined ? drink : currentDrinkId();
    chat.open = true;
    $("#ai-panel").hidden = false;
    $("#ai-backdrop").hidden = isWide();
    $("#ai-fab").hidden = true;
    $("#ai-fab").setAttribute("aria-expanded", "true");
    if (!isWide()) document.body.classList.add("chat-lock");
    drawChrome(); drawThread();
    if (prefill) $("#ask").value = prefill;
    if (!window.matchMedia("(pointer: coarse)").matches || prefill) $("#ask").focus({ preventScroll: true });
    else $("#ai-close").focus({ preventScroll: true });
    await detectAI(); drawChrome(); updateFab();
  }
  function closeChat(refocus) {
    chat.open = false;
    $("#ai-panel").hidden = true;
    $("#ai-backdrop").hidden = true;
    $("#ai-fab").hidden = false;
    $("#ai-fab").setAttribute("aria-expanded", "false");
    document.body.classList.remove("chat-lock");
    if (refocus !== false) $("#ai-fab").focus({ preventScroll: true });
  }
  function chatOnRoute() {
    if (!chat.open) return;
    if (!isWide()) closeChat(false);
    else { chat.ctx = currentDrinkId(); drawChrome(); }
  }

  function drawThread() {
    const th = $("#thread"); if (!th) return;
    const hello = `<div class="msg bot"><div class="bubble"><p>Chào bạn! Hỏi mình bất cứ điều gì về công thức: định lượng, các bước, ly dùng, bán thành phẩm hay hạn dùng nguyên liệu.</p></div></div>`;
    th.innerHTML = (chat.turns.length ? "" : hello) + chat.turns.map((t, i) => t.role === "user"
      ? `<div class="msg user"><div class="bubble">${esc(t.content)}</div></div>`
      : `<div class="msg bot" data-i="${i}"><div class="bubble">${t.pending && !t.content ? '<span class="thinking"><i></i><i></i><i></i> Đang nghĩ…</span>' : renderMarkdown(t.content, !t.pending)}</div>${t.meta ? `<div class="meta">${esc(t.meta)}</div>` : ""}</div>`).join("");
    const sug = $("#suggest"); if (sug) sug.hidden = chat.turns.length > 0;
    const send = $("#send"); if (send) { send.innerHTML = chat.busy ? I.stop : I.send; send.setAttribute("aria-label", chat.busy ? "Dừng" : "Gửi"); }
    scrollChat();
  }
  function scrollChat() { const b = $("#ai-body"); if (b) b.scrollTop = b.scrollHeight; }
  function updateLast() {
    const th = $("#thread"); if (!th) return;
    const i = chat.turns.length - 1, t = chat.turns[i];
    const el = th.querySelector(`.msg.bot[data-i="${i}"] .bubble`);
    if (el) { el.innerHTML = t.pending && !t.content ? '<span class="thinking"><i></i><i></i><i></i> Đang nghĩ…</span>' : renderMarkdown(t.content, !t.pending); scrollChat(); }
    else drawThread();
  }

  function inline(s) {
    return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>").replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,])/g, "$1<i>$2</i>");
  }
  function renderMarkdown(md, final) {
    const text = String(md || "").replace(/<think>[\s\S]*?(<\/think>|$)/g, "").trim();
    const lines = text.split(/\r?\n/);
    let html = "", list = null;
    const close = () => { if (list) { html += `</${list}>`; list = null; } };
    for (const raw of lines) {
      const line = raw.trimEnd();
      const tag = line.trim().match(/^\[\[(mon|btp):([a-z0-9-]+)\]\]$/i);
      if (tag) { close(); html += tag[1].toLowerCase() === "mon" ? aiDrinkCard(tag[2].toLowerCase()) : aiPrepCard(tag[2].toLowerCase()); continue; }
      const cleaned = line.replace(/\[\[(mon|btp):([a-z0-9-]+)\]\]/gi, "");
      let m;
      if (/^#{1,4}\s+/.test(cleaned)) { close(); html += `<h4>${inline(esc(cleaned.replace(/^#{1,4}\s+/, "")))}</h4>`; }
      else if ((m = cleaned.match(/^\s*[-*•]\s+(.*)$/))) { if (list !== "ul") { close(); html += "<ul>"; list = "ul"; } html += `<li>${inline(esc(m[1]))}</li>`; }
      else if ((m = cleaned.match(/^\s*\d+[.)]\s+(.*)$/))) { if (list !== "ol") { close(); html += "<ol>"; list = "ol"; } html += `<li>${inline(esc(m[1]))}</li>`; }
      else if ((m = cleaned.match(/^\s*>\s?(.*)$/))) { close(); html += `<p class="quote">${inline(esc(m[1]))}</p>`; }
      else if (!cleaned.trim()) { close(); }
      else { close(); html += `<p>${inline(esc(cleaned))}</p>`; }
    }
    close();
    return html || (final ? "<p>(Không có nội dung)</p>" : "");
  }
  function aiDrinkCard(id) {
    const d = byId[id]; if (!d) return "";
    const ps = photosOf(id).slice(0, 3);
    return `<div class="ai-card">${ps.length ? `<div class="strip n${ps.length}">${ps.map((p) => `<img src="images/drinks/thumb/${esc(p.f)}" alt="${esc(d.name)}" loading="lazy" decoding="async">`).join("")}</div>` : ""}
      <div class="info">${cupSVG(d)}<div><b>${esc(d.name)}</b><div class="f num">${d.sizes && d.sizes.length > 1 ? d.sizes.map((s) => `${s}: ${esc(formulaLine(d, s))}`).join("<br>") : esc(formulaLine(d))}</div><a href="#mon-${d.id}">Mở công thức đầy đủ →</a></div></div></div>`;
  }
  function aiPrepCard(id) {
    const p = prepById[id]; if (!p) return "";
    return `<a class="ai-prep" href="#btp-${p.id}"><b>${esc(p.name)}</b> · ra ${esc(p.yield)} · để ${esc(p.shelf)}<span>${esc(p.ing.map((i) => `${i[0]} ${i[2]} ${i[1]}`).join(" · "))}</span></a>`;
  }

  async function ask(question) {
    if (chat.busy) return;
    await detectAI();
    const mode = aiMode();
    const d = chat.ctx && byId[chat.ctx];
    const prompt = d ? `[Mình đang xem món: ${d.name} (id: ${d.id})]\n${question}` : question;
    chat.turns.push({ role: "user", content: question, prompt });
    const bot = { role: "assistant", content: "", pending: true };
    chat.turns.push(bot);
    chat.busy = true;
    drawThread();
    let raf = 0;
    const onText = (text) => { bot.content = text; if (!raf) raf = requestAnimationFrame(() => { raf = 0; updateLast(); }); };
    aiAbort = new AbortController();
    const data = contextFor(question + " " + (d ? d.name : ""), chat.ctx);
    try {
      if (mode === "claude") await askClaude(bot, onText, data);
      else if (mode === "proxy") await askProxy(bot, onText, data);
      else { bot.content = offlineAnswer(question, chat.ctx); }
    } catch (e) {
      const code = e && e.code;
      if (code === "cancelled" || (e && e.name === "AbortError")) { bot.content = (e.text || bot.content || "") + "\n\n_(Đã dừng)_"; }
      else if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) {
        chat.useClaude = false; store.set("useClaude", false); drawChrome(); updateFab();
        bot.content = offlineAnswer(question, chat.ctx); bot.meta = "Claude chưa được cho phép — đang trả lời từ dữ liệu";
      } else if (code === "rate_limited") { bot.content = "Hết lượt AI miễn phí tạm thời. Đây là câu trả lời từ dữ liệu:\n\n" + offlineAnswer(question, chat.ctx); }
      else { bot.content = offlineAnswer(question, chat.ctx); bot.meta = "Không kết nối được AI — đang trả lời từ dữ liệu"; }
    } finally {
      bot.pending = false; chat.busy = false; aiAbort = null;
      if (raf) cancelAnimationFrame(raf);
      drawThread();
    }
  }

  function historyForModel() {
    const done = chat.turns.slice(0, -1).filter((t) => t.content && t.content.trim());
    const hist = done.slice(-8).map((t) => ({ role: t.role, content: t.role === "user" ? (t.prompt || t.content) : t.content.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").slice(0, 3000) }));
    while (hist.length && hist[0].role !== "user") hist.shift();
    return hist;
  }
  async function askClaude(bot, onText, data) {
    const hist = historyForModel();
    const last = hist.pop();
    const input = [{ role: "user", content: RULES }, { role: "assistant", content: "Mình đã hiểu. Bạn cứ hỏi nhé!" }, ...hist,
      { role: "user", content: `=== DỮ LIỆU CÔNG THỨC ===\n${data}\n=== HẾT DỮ LIỆU ===\n\n${last ? last.content : ""}` }];
    const res = await chat.sample(input, { onText: ({ text }) => onText(text), signal: aiAbort.signal, cache: false, modelTier: "quick" });
    bot.content = res.text;
    if (res.truncated) bot.meta = "Câu trả lời bị cắt ngắn — thử hỏi gọn hơn.";
  }
  async function askProxy(bot, onText, data) {
    const res = await fetch(CONFIG.aiProxyUrl, {
      method: "POST", headers: { "content-type": "application/json" }, signal: aiAbort.signal,
      body: JSON.stringify({ data, messages: historyForModel() })
    });
    if (res.status === 429) { const err = new Error("rate"); err.code = "rate_limited"; throw err; }
    if (!res.ok || !res.body) throw new Error("proxy " + res.status);
    const reader = res.body.getReader(), dec = new TextDecoder();
    let text = "";
    for (;;) { const { value, done } = await reader.read(); if (done) break; text += dec.decode(value, { stream: true }); onText(text); }
    if (!text.trim()) throw new Error("empty");
    bot.content = text;
  }

  /* Trợ lý offline: tìm món/nguyên liệu trong câu hỏi và trả lời từ dữ liệu. */
  function offlineAnswer(question, ctxId) {
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
    return [
      "Mình chưa tìm thấy món hay nguyên liệu nào khớp với câu hỏi trong cẩm nang.",
      "Bạn thử hỏi theo kiểu:",
      ...SUGGESTIONS.slice(0, 4).map((s) => `- ${s}`)
    ].join("\n");
  }

  /* ───────── theme toggle ───────── */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    const b = $("#theme-btn");
    const dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (b) { b.innerHTML = dark ? I.sun : I.moon; b.setAttribute("aria-label", dark ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"); }
  }
  const savedTheme = store.get("theme", null);
  applyTheme(savedTheme);
  $("#theme-btn").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nt = cur === "dark" ? "light" : "dark"; store.set("theme", nt); applyTheme(nt);
  });
  $("#search-btn").addEventListener("click", () => { if (location.hash && location.hash !== "#mon") location.hash = "#mon"; setTimeout(() => { const q = $("#q"); if (q) { q.focus(); q.scrollIntoView({ block: "center" }); } }, 30); });

  // Ảnh lớn lỗi/chưa tải được -> dùng ảnh nhỏ; ảnh nhỏ cũng lỗi -> ẩn ảnh, giữ khung màu nền.
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (!t || t.tagName !== "IMG") return;
    if (t.srcset) { t.removeAttribute("srcset"); t.removeAttribute("sizes"); if (!t.src.includes("/thumb/")) t.src = t.src.replace("/full/", "/thumb/"); return; }
    if (t.src.includes("/full/")) { t.src = t.src.replace("/full/", "/thumb/"); return; }
    t.style.visibility = "hidden";
  }, true);

  window.__sotay = { ask: (q) => ask(q), offlineAnswer: (q, id) => offlineAnswer(q, id), openChat: (o) => openChat(o || {}), contextFor: (q, id) => contextFor(q, id) }; // tiện kiểm thử
  buildChatUI();
  route();
  detectAI().then(updateFab);

  /* PWA: cài lên màn hình chính, dùng được khi mất mạng (chỉ khi chạy trên web thường, không phải trong Claude). */
  // Chỉ bật trên web thật (https). Chạy local thì không cache để sửa code thấy ngay.
  if ("serviceWorker" in navigator && !window.claude && location.protocol === "https:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
