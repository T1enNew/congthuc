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
    { id: "hoi-ai", label: "Hỏi AI", icon: I.spark },
    { id: "ban-thanh-pham", label: "Bán TP", icon: I.jar }
  ];
  function renderTabs(active) {
    $("#tabbar").innerHTML = `<div class="tabbar-inner">` + TABS.map((t) =>
      `<a class="tab${t.id === "hoi-ai" ? " tab-ai" : ""}" href="#${t.id}" ${t.id === active ? 'aria-current="page"' : ""}>${t.icon}<span>${t.label}</span></a>`).join("") + `</div>`;
  }

  let aiAbort = null;
  function route() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    if (aiAbort && !h.startsWith("hoi-ai")) { /* keep running answers when leaving; nothing to do */ }
    let tab = "mon";
    if (h.startsWith("mon-") && byId[h.slice(4)]) { tab = "mon"; renderDetail(h.slice(4)); }
    else if (h === "hoc") { tab = "hoc"; renderLearn(); }
    else if (h === "kiem-tra") { tab = "kiem-tra"; renderQuiz(); }
    else if (h === "hoi-ai") { tab = "hoi-ai"; renderAI(); }
    else if (h === "ban-thanh-pham" || h.startsWith("btp-")) { tab = "ban-thanh-pham"; renderPreps(h.startsWith("btp-") ? h.slice(4) : null); }
    else if (h === "nguon-anh") { tab = ""; renderCredits(); }
    else { renderHome(); }
    renderTabs(tab);
    if (!h.startsWith("btp-")) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  function setTitle(t) { document.title = t ? `${t} · Sổ tay pha chế` : "Sổ tay pha chế"; }

  /* ───────── HOME ───────── */
  const homeState = { q: "", cat: store.get("cat", "all") };
  function progressRing(done, total) {
    const r = 22, c = 2 * Math.PI * r, f = total ? done / total : 0;
    return `<svg class="ring" viewBox="0 0 54 54"><circle class="ring-bg" cx="27" cy="27" r="${r}"/><circle class="ring-fg" cx="27" cy="27" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}"/><text x="27" y="32" text-anchor="middle">${Math.round(f * 100)}%</text></svg>`;
  }
  function drinkCard(d) {
    const p = photosOf(d.id)[0];
    return `<a class="card drink-card" href="#mon-${d.id}">
      <div class="ph">${p ? imgTag(p, { sizes: "(min-width: 980px) 260px, (min-width: 640px) 33vw, 50vw", alt: d.name }) : ""}
        <div class="mini-cup">${cupSVG(d, { cls: "" })}</div></div>
      ${learned.has(d.id) ? `<span class="done-flag" title="Đã thuộc">${I.ok}</span>` : ""}
      <div class="body"><div class="badges">${tempBadge(d)}${sizeBadge(d)}</div><h3>${esc(d.name)}</h3><div class="formula num">${esc(formulaLine(d))}</div></div>
    </a>`;
  }
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
        <label class="search" for="q">${I.search}<input id="q" type="search" placeholder="Tìm món, nguyên liệu…" value="${esc(homeState.q)}" autocomplete="off" enterkeyhint="search"><button class="clear" type="button" aria-label="Xoá tìm kiếm" ${homeState.q ? "" : "hidden"}>${I.x}</button></label>
        <div class="chips" role="toolbar" aria-label="Lọc theo nhóm">
          <button class="chip" data-cat="all" aria-pressed="${homeState.cat === "all"}">Tất cả · ${drinks.length}</button>
          ${MENU.categories.map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${homeState.cat === c.id}">${esc(c.short)}</button>`).join("")}
        </div>
        <div class="progress-card">${progressRing(learned.size, drinks.length)}
          <div><b>Đã thuộc ${learned.size}/${drinks.length} món</b><div class="muted small">Lật thẻ để ôn, làm bài kiểm tra để chắc tay.</div>
          <div class="actions"><a class="link-btn" href="#hoc">Ôn bằng thẻ →</a><a class="link-btn" href="#kiem-tra">Làm kiểm tra →</a></div></div></div>
      </section>
      <div id="list"></div>
      <div class="footer-note"><span>Công thức theo ${esc(MENU.source)}.</span><span>Ảnh là ảnh chụp thật lấy từ Wikimedia Commons, minh hoạ kiểu món. <a href="#nguon-anh">Nguồn ảnh &amp; tác giả</a></span></div>`;
    const input = $("#q"), clear = $(".search .clear");
    input.addEventListener("input", () => { homeState.q = input.value; clear.hidden = !input.value; renderList(); });
    clear.addEventListener("click", () => { homeState.q = ""; input.value = ""; clear.hidden = true; renderList(); input.focus(); });
    $$(".chip[data-cat]").forEach((b) => b.addEventListener("click", () => {
      homeState.cat = b.dataset.cat; store.set("cat", homeState.cat);
      $$(".chip[data-cat]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderList();
    }));
    renderList();
  }
  function renderList() {
    const list = $("#list");
    const q = homeState.q.trim();
    const cats = MENU.categories.filter((c) => homeState.cat === "all" || c.id === homeState.cat);
    let html = "", n = 0;
    cats.forEach((c) => {
      const ds = drinks.filter((d) => d.cat === c.id && matchDrink(d, q));
      if (!ds.length) return;
      n += ds.length;
      html += `<section class="cat-block"><h2>${esc(c.name)} <span class="count">${ds.length} món</span></h2><div class="grid">${ds.map(drinkCard).join("")}</div></section>`;
    });
    if (!n) html = `<div class="empty"><div>Không thấy món nào khớp “${esc(q)}”.</div><a class="btn btn-primary" href="#hoi-ai" data-ask="${esc(q)}">${I.spark} Hỏi trợ lý AI</a></div>`;
    list.innerHTML = html;
    const askBtn = $("[data-ask]", list);
    if (askBtn) askBtn.addEventListener("click", () => { pendingAsk = askBtn.dataset.ask; });
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
    ${ps.length > 1 ? `<div class="thumbs">${ps.map((p, i) => `<button type="button" data-go="${i}" aria-label="Xem ảnh ${i + 1}" aria-current="${i === 0}"><img src="images/drinks/thumb/${esc(p.f)}" alt="" loading="lazy" decoding="async"></button>`).join("")}</div>` : ""}
    <div class="photo-note">Ảnh thật minh hoạ kiểu món — ly ở quán có thể khác. Chạm ảnh để phóng to.</div>`;
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
            <a class="btn btn-primary" href="#hoi-ai" id="ask-this">${I.spark} Hỏi AI về món này</a>
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
    $("#ask-this").addEventListener("click", () => { pendingAsk = `Hướng dẫn mình pha ${d.name} thật chi tiết${d.sizes && d.sizes.length > 1 ? " (cả size M và L)" : ""}, kèm mẹo để nhớ nhanh công thức.`; });
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

  /* ───────── PREPS ───────── */
  function renderPreps(openId) {
    setTitle("Bán thành phẩm");
    const groups = uniq(MENU.preps.map((p) => p.group));
    view.innerHTML = `<div class="hello"><span class="eyebrow">Chuẩn bị đầu ca</span><h1>Bán thành phẩm &amp; hạn dùng</h1></div>
      ${groups.map((g) => `<section class="prep-group"><h2>${esc(g)}</h2>${MENU.preps.filter((p) => p.group === g).map((p) => {
        const used = drinks.filter((d) => d.ing.some((i) => i.p === p.id));
        return `<details class="prep" id="btp-${p.id}" ${p.id === openId ? "open" : ""}>
          <summary><div><b>${esc(p.name)}</b><small>Để được ${esc(p.shelf)} · tủ mát</small></div><div class="yield num">${esc(p.yield)}</div></summary>
          <div class="inner"><ul class="ing-list">${p.ing.map((i) => `<li><span class="dot" style="background:var(--surface-3)"></span><div class="name">${esc(i[0])}</div><div class="qty num">${esc(i[2])}<span>${esc(i[1])}</span></div></li>`).join("")}</ul>
          <ol>${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          ${(p.notes || []).map((n) => `<div class="note">${I.info}<div>${esc(n)}</div></div>`).join("")}
          ${used.length ? `<div class="muted small">Dùng cho: ${used.map((d) => `<a href="#mon-${d.id}">${esc(d.name)}</a>`).join(", ")}</div>` : ""}</div></details>`;
      }).join("")}</section>`).join("")}
      <section class="prep-group"><h2>Bảng date nguyên vật liệu</h2>
        <label class="search" for="shelf-q">${I.search}<input id="shelf-q" type="search" placeholder="Tìm nguyên liệu, vd: sữa đặc" autocomplete="off"></label>
        <div class="table-wrap"><table><thead><tr><th>Nguyên liệu</th><th>Date</th><th>Bảo quản</th></tr></thead><tbody id="shelf-body"></tbody></table></div>
      </section>`;
    const body = $("#shelf-body");
    const draw = (q) => {
      body.innerHTML = MENU.shelf.filter((r) => !q || norm(r.join(" ")).includes(norm(q))).map((r) => `<tr><td><b>${esc(r[0])}</b><div class="muted small">${esc(r[1])}</div></td><td class="date num">${esc(r[2])}</td><td class="${/mát|đông/.test(r[3]) ? "cold" : "room"}">${esc(r[3])}</td></tr>`).join("") || `<tr><td colspan="3" class="muted">Không có nguyên liệu khớp.</td></tr>`;
    };
    draw("");
    $("#shelf-q").addEventListener("input", (e) => draw(e.target.value));
    if (openId) {
      const el = document.getElementById("btp-" + openId);
      if (el) { el.classList.add("flash-hl"); setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60); setTimeout(() => el.classList.remove("flash-hl"), 2200); }
    } else window.scrollTo(0, 0);
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

  /* ───────── AI ASSISTANT ───────── */
  let pendingAsk = null;
  const chat = { turns: [], busy: false, mode: null, sample: null, modeReady: null };

  function detectMode() {
    if (chat.modeReady) return chat.modeReady;
    chat.modeReady = (async () => {
      try {
        if (window.claude && typeof window.claude.use === "function") {
          const s = await window.claude.use("sample");
          if (s) { chat.sample = s; chat.mode = "claude"; return chat.mode; }
        }
      } catch (e) { /* không có Claude trong trang này */ }
      chat.mode = CONFIG.aiProxyUrl ? "proxy" : "offline";
      return chat.mode;
    })();
    return chat.modeReady;
  }

  function contextText() {
    const lines = [];
    lines.push(`NGUỒN: ${MENU.source}. Đơn vị giữ nguyên như tài liệu.`);
    MENU.categories.forEach((c) => {
      lines.push(`\n## NHÓM: ${c.name}`);
      drinks.filter((d) => d.cat === c.id).forEach((d) => {
        const sz = d.sizes ? `size ${d.sizes.join("/")}` : "không chia size";
        lines.push(`\n### ${d.name} [id: ${d.id}] — ${d.temp === "hot" ? "nóng" : d.temp === "blend" ? "đá xay" : "đá"} — ${sz}`);
        if (d.aka) lines.push(`Tên gọi khác: ${d.aka.join(", ")}`);
        lines.push("Thành phần: " + d.ing.map((i) => {
          const q = typeof i.q === "object" ? Object.entries(i.q).map(([s, v]) => `${s} ${v}`).join(" / ") : i.q;
          return `${i.n}: ${q} ${i.u}${i.side ? " (phục vụ kèm)" : ""}`;
        }).join("; "));
        lines.push("Dụng cụ/packaging: " + (Array.isArray(d.pack) ? d.pack.join(", ") : Object.entries(d.pack).map(([s, v]) => `${s}: ${v.join(", ")}`).join(" | ")));
        lines.push("Các bước: " + d.steps.map((s, i) => `${i + 1}) ${s}`).join(" "));
        if (d.notes) lines.push("Lưu ý: " + d.notes.join(" "));
      });
    });
    lines.push("\n## BÁN THÀNH PHẨM");
    MENU.preps.forEach((p) => {
      lines.push(`\n### ${p.name} [id: ${p.id}] — nhóm ${p.group} — thành phẩm ${p.yield} — date ${p.shelf}`);
      lines.push("Nguyên liệu: " + p.ing.map((i) => `${i[0]} ${i[2]} ${i[1]}`).join("; "));
      lines.push("Các bước: " + p.steps.map((s, i) => `${i + 1}) ${s}`).join(" "));
      if (p.notes) lines.push("Lưu ý: " + p.notes.join(" "));
    });
    lines.push("\n## BẢNG DATE NGUYÊN VẬT LIỆU (tên | tình trạng | date | nơi bảo quản)");
    MENU.shelf.forEach((r) => lines.push(r.join(" | ")));
    return lines.join("\n");
  }

  const RULES = `Bạn là "Trợ lý pha chế" của quán, giúp nhân viên (kể cả người mới) học và tra công thức đồ uống.
Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện, rõ ràng, ngắn gọn; xưng "mình", gọi người hỏi là "bạn".
- Định lượng, dụng cụ, các bước, hạn dùng: CHỈ lấy từ DỮ LIỆU CÔNG THỨC bên dưới, không bịa số. Món chỉ có một size thì nói rõ.
- Câu hỏi ngoài tài liệu (kỹ thuật barista chung, mẹo, giải thích vì sao…): được trả lời bằng kiến thức chung, nhưng nói rõ "Phần này tài liệu của quán không ghi, đây là kinh nghiệm chung".
- Khi nói về một món có trong dữ liệu, đặt thẻ [[mon:ID]] trên một dòng riêng ngay sau đoạn nói về món đó — trang web sẽ hiện ảnh thật và hình ly minh hoạ tại vị trí thẻ. Mỗi món tối đa 1 thẻ, tối đa 4 thẻ cho cả câu trả lời. Bán thành phẩm dùng thẻ [[btp:ID]]. ID phải đúng như trong dữ liệu.
- Khi đưa công thức: liệt kê thành phần kèm định lượng (theo từng size nếu có), packaging, rồi các bước đánh số 1. 2. 3.
- Định dạng Markdown đơn giản: **đậm**, gạch đầu dòng "- ", danh sách số "1. ", tiêu đề nhỏ "### ". Không dùng bảng, không dùng HTML.
- Nếu người dùng gửi lời chào hoặc hỏi chung chung, gợi ý vài câu hỏi họ có thể hỏi.`;

  function aiIntro(mode) {
    if (mode === "claude") return `<span class="mode-pill live"><i></i>Claude AI đang bật</span>`;
    if (mode === "proxy") return `<span class="mode-pill live"><i></i>AI trực tuyến</span>`;
    return `<span class="mode-pill"><i></i>Chế độ offline — trả lời từ dữ liệu công thức</span>`;
  }
  const SUGGESTIONS = [
    "Cà phê sữa đá size L cần những gì?",
    "Món nào dùng milk foam dừa?",
    "Latte nóng và cappuccino nóng khác nhau chỗ nào?",
    "Cách làm nền trà olong?",
    "Milk foam để được bao lâu?",
    "Các món trà trái cây dùng ly gì?"
  ];

  async function renderAI() {
    setTitle("Hỏi AI");
    view.innerHTML = `<div class="ai-shell">
      <div class="ai-head"><span class="eyebrow">Trợ lý pha chế</span><h1>Hỏi bất cứ điều gì về món</h1><div id="mode">${aiIntro(chat.mode || "offline")}</div></div>
      <div class="thread" id="thread" aria-live="polite"></div>
      <div class="suggest" id="suggest" ${chat.turns.length ? "hidden" : ""}>${SUGGESTIONS.map((s) => `<button type="button">${esc(s)}</button>`).join("")}</div>
      <form class="composer" id="composer" autocomplete="off">
        <label class="visually-hidden" for="ask">Câu hỏi</label>
        <textarea id="ask" rows="1" placeholder="Hỏi về món bất kỳ…" enterkeyhint="send"></textarea>
        <button class="send" type="submit" id="send" aria-label="Gửi">${I.send}</button>
      </form></div>`;
    drawThread();
    const ta = $("#ask");
    const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(140, ta.scrollHeight) + "px"; };
    ta.addEventListener("input", grow);
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); $("#composer").requestSubmit(); } });
    $("#composer").addEventListener("submit", (e) => {
      e.preventDefault();
      if (chat.busy) { if (aiAbort) aiAbort.abort(); return; }
      const v = ta.value.trim(); if (!v) return;
      ta.value = ""; grow(); ask(v);
    });
    $$("#suggest button").forEach((b) => b.addEventListener("click", () => ask(b.textContent)));
    const mode = await detectMode();
    const m = $("#mode"); if (m) m.innerHTML = aiIntro(mode);
    if (pendingAsk) { const q = pendingAsk; pendingAsk = null; ask(q); }
  }

  function drawThread() {
    const th = $("#thread"); if (!th) return;
    th.innerHTML = chat.turns.map((t, i) => t.role === "user"
      ? `<div class="msg user"><div class="bubble">${esc(t.content)}</div></div>`
      : `<div class="msg bot" data-i="${i}"><div class="bubble">${t.pending && !t.content ? '<span class="thinking"><i></i><i></i><i></i> Đang nghĩ…</span>' : renderMarkdown(t.content, !t.pending)}</div>${t.meta ? `<div class="meta">${esc(t.meta)}</div>` : ""}</div>`).join("");
    const sug = $("#suggest"); if (sug) sug.hidden = chat.turns.length > 0;
    const send = $("#send"); if (send) { send.innerHTML = chat.busy ? I.stop : I.send; send.setAttribute("aria-label", chat.busy ? "Dừng" : "Gửi"); }
  }
  function updateLast() {
    const th = $("#thread"); if (!th) return;
    const i = chat.turns.length - 1, t = chat.turns[i];
    const el = th.querySelector(`.msg.bot[data-i="${i}"] .bubble`);
    if (el) el.innerHTML = t.pending && !t.content ? '<span class="thinking"><i></i><i></i><i></i> Đang nghĩ…</span>' : renderMarkdown(t.content, !t.pending);
    else drawThread();
  }

  function inline(s) {
    return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  }
  function renderMarkdown(md, final) {
    const lines = String(md || "").split(/\r?\n/);
    let html = "", list = null;
    const close = () => { if (list) { html += `</${list}>`; list = null; } };
    for (const raw of lines) {
      const line = raw.trimEnd();
      const tag = line.trim().match(/^\[\[(mon|btp):([a-z0-9-]+)\]\]$/i);
      if (tag) { close(); html += tag[1] === "mon" ? aiDrinkCard(tag[2]) : aiPrepCard(tag[2]); continue; }
      const cleaned = line.replace(/\[\[(mon|btp):([a-z0-9-]+)\]\]/gi, "");
      const e = esc(cleaned);
      let m;
      if (/^#{1,4}\s+/.test(cleaned)) { close(); html += `<h4>${inline(esc(cleaned.replace(/^#{1,4}\s+/, "")))}</h4>`; }
      else if ((m = cleaned.match(/^\s*[-*•]\s+(.*)$/))) { if (list !== "ul") { close(); html += "<ul>"; list = "ul"; } html += `<li>${inline(esc(m[1]))}</li>`; }
      else if ((m = cleaned.match(/^\s*\d+[.)]\s+(.*)$/))) { if (list !== "ol") { close(); html += "<ol>"; list = "ol"; } html += `<li>${inline(esc(m[1]))}</li>`; }
      else if (!cleaned.trim()) { close(); }
      else { close(); html += `<p>${inline(e)}</p>`; }
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
    const mode = await detectMode();
    chat.turns.push({ role: "user", content: question });
    const bot = { role: "assistant", content: "", pending: true };
    chat.turns.push(bot);
    chat.busy = true;
    drawThread();
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    let raf = 0;
    const onText = (text) => { bot.content = text; if (!raf) raf = requestAnimationFrame(() => { raf = 0; updateLast(); }); };
    aiAbort = new AbortController();
    try {
      if (mode === "claude") await askClaude(bot, onText);
      else if (mode === "proxy") await askProxy(bot, onText);
      else { bot.content = offlineAnswer(question); bot.meta = "Trả lời offline từ dữ liệu công thức"; }
    } catch (e) {
      const code = e && e.code;
      if (code === "cancelled" || (e && e.name === "AbortError")) { bot.content = (e.text || bot.content || "") + "\n\n_(Đã dừng)_"; }
      else if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) {
        chat.mode = "offline"; const m = $("#mode"); if (m) m.innerHTML = aiIntro("offline");
        bot.content = offlineAnswer(question); bot.meta = "Claude chưa được cho phép trong trang này — đang trả lời offline";
      } else if (code === "rate_limited") { bot.content = (e.text || "") + "\n\nBạn hỏi hơi nhanh hoặc đã hết lượt dùng Claude. Đợi một lát rồi hỏi lại nhé. Trong lúc chờ, đây là câu trả lời từ dữ liệu:\n\n" + offlineAnswer(question); }
      else { bot.content = (e && e.text ? e.text + "\n\n" : "") + offlineAnswer(question); bot.meta = "Không kết nối được AI — đang trả lời offline"; }
    } finally {
      bot.pending = false; chat.busy = false; aiAbort = null;
      if (raf) cancelAnimationFrame(raf);
      drawThread();
    }
  }

  function historyForModel() {
    // giữ 8 lượt gần nhất (không tính câu trả lời đang chờ)
    const done = chat.turns.slice(0, -1).filter((t) => t.content && t.content.trim());
    return done.slice(-8).map((t) => ({ role: t.role, content: t.content }));
  }
  async function askClaude(bot, onText) {
    const hist = historyForModel();
    while (hist.length && hist[0].role !== "user") hist.shift();
    const input = [{ role: "user", content: RULES + "\n\n=== DỮ LIỆU CÔNG THỨC ===\n" + contextText() + "\n=== HẾT DỮ LIỆU ===\n\nHãy trả lời các câu hỏi tiếp theo." }, { role: "assistant", content: "Mình đã đọc xong cẩm nang. Bạn cứ hỏi nhé!" }, ...hist];
    const res = await chat.sample(input, { onText: ({ text }) => onText(text), signal: aiAbort.signal, cache: false });
    bot.content = res.text;
    if (res.truncated) bot.meta = "Câu trả lời bị cắt ngắn — thử hỏi gọn hơn.";
  }
  async function askProxy(bot, onText) {
    const res = await fetch(CONFIG.aiProxyUrl, {
      method: "POST", headers: { "content-type": "application/json" }, signal: aiAbort.signal,
      body: JSON.stringify({ system: RULES + "\n\n=== DỮ LIỆU CÔNG THỨC ===\n" + contextText(), messages: historyForModel() })
    });
    if (!res.ok || !res.body) throw new Error("proxy " + res.status);
    const reader = res.body.getReader(), dec = new TextDecoder();
    let text = "";
    for (;;) { const { value, done } = await reader.read(); if (done) break; text += dec.decode(value, { stream: true }); onText(text); }
    bot.content = text || "Xin lỗi, mình chưa trả lời được câu này.";
  }

  /* Trợ lý offline: tìm món/nguyên liệu trong câu hỏi và trả lời từ dữ liệu. */
  function offlineAnswer(question) {
    const q = " " + norm(question) + " ";
    const size = /\b(size|ly|co)\s*l\b|\bl\b/.test(q) ? "L" : /\b(size|ly|co)\s*m\b|\bm\b/.test(q) ? "M" : null;
    const scored = drinks.map((d) => {
      let s = 0;
      [d.name, ...(d.aka || [])].forEach((n) => { const nn = norm(n); if (q.includes(" " + nn + " ") || q.includes(nn)) s = Math.max(s, nn.length + 10); });
      if (!s) { const words = norm(d.name).split(" ").filter((w) => w.length > 2); const hit = words.filter((w) => q.includes(" " + w + " ") || q.includes(" " + w)).length; if (hit >= Math.max(2, words.length - 1)) s = hit * 3; }
      return { d, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    const preps = MENU.preps.filter((p) => q.includes(norm(p.name)) || q.includes(norm(p.name.replace(/^Nền /, ""))));
    const wantsShelf = /\b(date|han|bao lau|de duoc|bao quan|het han)\b/.test(q);
    const wantsWhich = /\b(mon nao|nhung mon|cac mon|mon gi)\b/.test(q);
    const ingHit = allIngNames.filter((n) => q.includes(norm(n))).sort((a, b) => b.length - a.length)[0];
    const catHit = MENU.categories.find((c) => q.includes(norm(c.short)) || q.includes(norm(c.name)));
    const out = [];

    if (wantsShelf) {
      const rows = MENU.shelf.filter((r) => { const n = norm(r[0]); return n.split(" ").some((w) => w.length > 3 && q.includes(w)); });
      const ps = preps.length ? preps : MENU.preps.filter((p) => q.includes(norm(p.name).split(" ").slice(-2).join(" ")));
      if (rows.length || ps.length) {
        out.push("### Hạn dùng (date)");
        rows.forEach((r) => out.push(`- **${r[0]}** (${r[1].toLowerCase()}): **${r[2]}** — bảo quản ${r[3]}`));
        ps.forEach((p) => out.push(`- **${p.name}**: ${p.shelf} (tủ mát <5 độ)`));
        return out.join("\n");
      }
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
    if ((wantsWhich || !scored.length) && ingHit) {
      const ds = drinks.filter((d) => d.ing.some((i) => i.n === ingHit));
      out.push(`Có **${ds.length} món** dùng **${ingHit}**:`);
      ds.forEach((d) => { const i = d.ing.find((x) => x.n === ingHit); out.push(`- **${d.name}**: ${typeof i.q === "object" ? Object.entries(i.q).map(([s, v]) => `${s} ${v}`).join(" / ") : i.q} ${i.u}`); });
      ds.slice(0, 3).forEach((d) => out.push(`[[mon:${d.id}]]`));
      return out.join("\n");
    }
    if (!scored.length && catHit) {
      const ds = drinks.filter((d) => d.cat === catHit.id);
      out.push(`Nhóm **${catHit.name}** có ${ds.length} món:`);
      ds.forEach((d) => out.push(`- **${d.name}** — ${packOf(d, d.sizes ? d.sizes[d.sizes.length - 1] : null).join(", ")}`));
      ds.slice(0, 2).forEach((d) => out.push(`[[mon:${d.id}]]`));
      return out.join("\n");
    }
    if (scored.length) {
      const strong = scored.filter((x) => x.s >= 12);
      const top = (strong.length ? strong : scored.slice(0, 1)).slice(0, 3).map((x) => x.d);
      top.forEach((d) => {
        const sizes = size && d.sizes && d.sizes.includes(size) ? [size] : sizesOf(d);
        out.push(`### ${d.name}`);
        if (size && d.sizes && !d.sizes.includes(size)) out.push(`_Món này chỉ có size ${d.sizes.join("/")}._`);
        if (!d.sizes && size) out.push("_Tài liệu không chia size cho món này._");
        sizes.forEach((s) => {
          if (s) out.push(`**Size ${s}:**`);
          d.ing.forEach((i) => out.push(`- ${i.n}: **${qtyOf(i, s)} ${i.u}**${i.side ? " (phục vụ kèm)" : ""}`));
          out.push(`- Dụng cụ: ${packOf(d, s).join(", ")}`);
        });
        out.push("**Các bước:**");
        d.steps.forEach((s, i) => out.push(`${i + 1}. ${s}`));
        (d.notes || []).forEach((n) => out.push(`> Lưu ý: ${n}`));
        out.push(`[[mon:${d.id}]]`, "");
      });
      return out.join("\n");
    }
    return [
      "Mình chưa tìm thấy món hay nguyên liệu nào khớp với câu hỏi trong cẩm nang.",
      "Bạn thử hỏi theo kiểu:",
      ...SUGGESTIONS.slice(0, 4).map((s) => `- ${s}`),
      "",
      CONFIG.aiProxyUrl ? "" : "_Trang đang ở chế độ offline nên chỉ trả lời được các câu về công thức có trong tài liệu. Xem README để bật AI trực tuyến._"
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

  window.__sotay = { ask: (q) => ask(q), offlineAnswer: (q) => offlineAnswer(q) }; // tiện kiểm thử
  route();
  detectMode().then((m) => { const dot = $(".tab-ai"); if (dot && (m === "claude" || m === "proxy")) dot.insertAdjacentHTML("beforeend", '<span class="tab-dot" aria-hidden="true"></span>'); });

  /* PWA: cài lên màn hình chính, dùng được khi mất mạng (chỉ khi chạy trên web thường, không phải trong Claude). */
  if ("serviceWorker" in navigator && !window.claude && /^https:$|^http:$/.test(location.protocol) && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
