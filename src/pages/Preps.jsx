import { useEffect, useState } from "react";
import { MENU, drinks } from "../lib/recipes.js";
import { norm, focus } from "../lib/util.js";
import Icon from "../components/Icon.jsx";

const hoursOf = (s) => { const n = parseFloat(s); return /ngày/.test(s) ? n * 24 : n; };
/* Nhãn hạn dùng: "Dùng trong 10 tiếng" = được dùng tối đa 10 tiếng. Màu: đỏ ≤ 24 tiếng, vàng 2–3 ngày, xanh lâu hơn. */
function DatePill({ s }) {
  const h = hoursOf(s);
  return <span className={`pill ${h <= 24 ? "pill-short" : h <= 72 ? "pill-mid" : "pill-long"} num`} title={`Được dùng tối đa ${s}`}>Dùng trong {s}</span>;
}

/* "Đã chế biến" -> tính từ lúc pha, "Đã khui" -> tính từ lúc mở bao bì. */
const SINCE = { "Đã chế biến": "Tính từ lúc pha chế", "Đã khui": "Tính từ lúc khui", "Chưa khui": "Khi chưa khui", "Tủ đông": "Để trong tủ đông", "Tủ mát": "Để trong tủ mát" };

const PREP_GROUPS = [["Nền trà trái cây", "Nền trà trái cây"], ["Nền trà sữa", "Nền trà sữa"], ["Nền milk foam", "Milk foam"], ["Các loại khác", "Khác"]];
const STORE_GROUPS = [
  { key: "mát", label: "Tủ mát", sub: "dưới 5°C", icon: "snow", cls: "cold" },
  { key: "phòng", label: "Nhiệt độ phòng", sub: "dưới 25°C", icon: "home", cls: "room" },
  { key: "đông", label: "Tủ đông", sub: "dưới 2°C", icon: "ice", cls: "frozen" }
];

export default function Preps({ openId }) {
  const [view, setView] = useState("nen");
  const [q, setQ] = useState("");
  const nq = norm(q);

  useEffect(() => { document.title = "Bán thành phẩm · Sổ tay pha chế"; focus.drinkId = null; }, []);
  useEffect(() => {
    if (!openId) return;
    setView("nen"); setQ("");
    const t = setTimeout(() => {
      const el = document.getElementById("btp-" + openId);
      if (!el) return;
      el.open = true; el.classList.add("flash-hl");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.classList.remove("flash-hl"), 2200);
    }, 60);
    return () => clearTimeout(t);
  }, [openId]);

  const switchView = (v) => { setView(v); setQ(""); };

  return (
    <>
      <div className="prep-top">
        <div className="hello"><span className="eyebrow">Chuẩn bị đầu ca</span><h1>Bán thành phẩm</h1></div>
        <div className="seg seg-full" role="tablist" aria-label="Chọn mục">
          <button type="button" role="tab" aria-pressed={view === "nen"} aria-selected={view === "nen"} onClick={() => switchView("nen")}>Công thức nền <span className="cnt">{MENU.preps.length}</span></button>
          <button type="button" role="tab" aria-pressed={view === "date"} aria-selected={view === "date"} onClick={() => switchView("date")}>Hạn dùng <span className="cnt">{MENU.shelf.length}</span></button>
        </div>
        <label className="search" htmlFor="prep-q">
          <Icon name="search" />
          <input id="prep-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" placeholder={view === "nen" ? "Tìm, vd: milk foam, thạch" : "Tìm, vd: sữa đặc, trân châu"} />
        </label>
      </div>

      {view === "nen" ? <PrepList nq={nq} q={q} openId={openId} /> : <ShelfList nq={nq} q={q} />}
    </>
  );
}

function PrepList({ nq, q, openId }) {
  const match = (p) => !nq || norm([p.name, p.group, ...p.ing.map((i) => i[0])].join(" ")).includes(nq);
  const groups = PREP_GROUPS.map(([g, label]) => ({ label, ps: MENU.preps.filter((p) => p.group === g && match(p)) })).filter((x) => x.ps.length);
  if (!groups.length) return <div className="empty">Không có bán thành phẩm khớp “{q}”.</div>;
  return groups.map(({ label, ps }) => (
    <section key={label} className="group">
      <h2 className="group-h">{label}<span>{ps.length}</span></h2>
      <div className="list-card">
        {ps.map((p) => {
          const used = drinks.filter((d) => d.ing.some((i) => i.p === p.id));
          return (
            <details key={p.id} className="row-d" id={`btp-${p.id}`} open={p.id === openId || undefined}>
              <summary>
                <div className="row-main"><b>{p.name}</b><small>Ra <span className="num">{p.yield}</span></small></div>
                <DatePill s={p.shelf} />
                <span className="chev" aria-hidden="true"><Icon name="next" /></span>
              </summary>
              <div className="row-body">
                <div className="shelf-note"><b>Hạn dùng: tối đa {p.shelf}</b> kể từ lúc pha xong. Ghi DATE lên hộp, bảo quản kín trong tủ mát (dưới 5°C).</div>
                <ul className="kv">{p.ing.map((i) => <li key={i[0]}><span>{i[0]}</span><b className="num">{i[2]} <small>{i[1]}</small></b></li>)}</ul>
                <ol className="mini-steps">{p.steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
                {(p.notes || []).map((n) => <div key={n} className="note"><Icon name="info" /><div>{n}</div></div>)}
                {used.length > 0 && (
                  <div className="used">Dùng cho: {used.map((d, k) => <span key={d.id}>{k > 0 && " · "}<a href={`#mon-${d.id}`}>{d.name}</a></span>)}</div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  ));
}

function ShelfList({ nq, q }) {
  const rows = MENU.shelf.filter((r) => !nq || norm(r.join(" ")).includes(nq));
  const groups = STORE_GROUPS.map((g) => ({ g, rs: rows.filter((r) => r[3].toLowerCase().includes(g.key)).sort((a, b) => hoursOf(a[2]) - hoursOf(b[2])) })).filter((x) => x.rs.length);
  return (
    <>
      <p className="muted small" style={{ margin: "16px 0 0" }}>Thời gian <b>tối đa</b> được dùng nguyên liệu, tính từ lúc pha chế hoặc lúc khui. Quá thời gian này thì không dùng nữa.</p>
      <div className="legend-pills" style={{ marginTop: 8 }}><span className="pill pill-short">≤ 24 tiếng</span><span className="pill pill-mid">2–3 ngày</span><span className="pill pill-long">4 ngày trở lên</span></div>
      {groups.length ? groups.map(({ g, rs }) => (
        <section key={g.key} className="group">
          <h2 className="group-h"><span className={`g-ico ${g.cls}`}><Icon name={g.icon} /></span>{g.label} <small>{g.sub}</small><span>{rs.length}</span></h2>
          <div className="list-card">
            {rs.map((r) => <div key={r[0]} className="row"><div className="row-main"><b>{r[0]}</b><small>{SINCE[r[1]] || r[1]}</small></div><DatePill s={r[2]} /></div>)}
          </div>
        </section>
      )) : <div className="empty">Không có nguyên liệu khớp “{q}”.</div>}
    </>
  );
}
