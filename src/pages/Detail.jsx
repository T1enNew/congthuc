import { useEffect, useState } from "react";
import { useApp } from "../AppContext.js";
import { drinks, byId, catById, prepById, packOf, tempLabel } from "../lib/recipes.js";
import { uniq, focus, pending, go } from "../lib/util.js";
import Icon from "../components/Icon.jsx";
import CupSVG from "../components/CupSVG.jsx";
import Gallery from "../components/Gallery.jsx";
import { IngList, CupLegend } from "../components/IngList.jsx";

const TEMP_CLASS = { hot: "badge-hot", ice: "badge-ice", blend: "badge-blend" };

export function Badges({ d, done }) {
  return (
    <>
      <span className={`badge ${TEMP_CLASS[d.temp]}`}>{tempLabel(d)}</span>
      {d.sizes && <span className="badge badge-size">Size {d.sizes.join("/")}</span>}
      {done && <span className="badge badge-done">Đã thuộc</span>}
    </>
  );
}

export default function Detail({ id }) {
  const d = byId[id];
  const { learned, setLearned, toast, openChat } = useApp();
  const [size, setSize] = useState(d.sizes ? d.sizes[0] : null);
  const [doneSteps, setDoneSteps] = useState(() => new Set());
  const isLearned = learned.has(id);

  useEffect(() => { focus.drinkId = id; document.title = `${d.name} · Sổ tay pha chế`; return () => { focus.drinkId = null; }; }, [id, d.name]);

  const idx = drinks.indexOf(d);
  const prev = drinks[(idx - 1 + drinks.length) % drinks.length], next = drinks[(idx + 1) % drinks.length];
  const relatedPreps = uniq(d.ing.filter((i) => i.p && prepById[i.p]).map((i) => i.p));

  return (
    <>
      <div className="back-row"><a href="#mon"><Icon name="back" /> Tất cả món</a></div>
      <div className="detail">
        <div className="col-media"><Gallery d={d} /></div>
        <div className="col-info" style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          <div className="title-block">
            <span className="eyebrow">{catById[d.cat].name}</span>
            <h1>{d.name}</h1>
            <div className="badges"><Badges d={d} done={isLearned} /></div>
          </div>
          {d.sizes && d.sizes.length > 1 && (
            <div><div className="seg" role="group" aria-label="Chọn size">
              {d.sizes.map((s) => <button key={s} type="button" aria-pressed={s === size} onClick={() => setSize(s)}>Size {s}</button>)}
            </div></div>
          )}
          <div className="card visual"><CupSVG d={d} /><div><div className="eyebrow" style={{ marginBottom: 8 }}>Lớp trong ly</div><CupLegend d={d} /></div></div>

          <section className="section" style={{ marginTop: 4 }}>
            <div className="section-head"><h2>Thành phần{size ? ` · size ${size}` : ""}</h2></div>
            <div className="panel" style={{ padding: "4px 14px" }}><IngList d={d} size={size} /></div>
          </section>
          <section className="section">
            <div className="section-head"><h2>{d.temp === "hot" ? "Bộ ly tách" : "Packaging"}</h2></div>
            <div className="pack">{packOf(d, size).map((x) => <span key={x}>{x}</span>)}</div>
          </section>
          <section className="section">
            <div className="section-head"><h2>Các bước</h2><span className="muted small">Chạm để đánh dấu</span></div>
            <ol className="steps">
              {d.steps.map((s, i) => (
                <li key={i}><button type="button" aria-pressed={doneSteps.has(i)} onClick={() => setDoneSteps((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}>{s}</button></li>
              ))}
            </ol>
          </section>
          {(d.notes || []).map((n) => <div key={n} className="note"><Icon name="info" /><div>{n}</div></div>)}
          {relatedPreps.length > 0 && (
            <section className="section">
              <div className="section-head"><h2>Bán thành phẩm cần có</h2></div>
              <div className="related">
                {relatedPreps.map((p) => <a key={p} href={`#btp-${p}`}><span>{prepById[p].name} <span className="muted small">· để {prepById[p].shelf}</span></span><Icon name="next" /></a>)}
              </div>
            </section>
          )}
          <div className="btn-row">
            <button className={`btn ${isLearned ? "btn-ghost" : "btn-good"}`} type="button" onClick={() => { setLearned(id, !isLearned); if (!isLearned) toast("Tuyệt! Đã thêm vào danh sách đã thuộc."); }}>
              <Icon name="ok" /> {isLearned ? "Bỏ đánh dấu đã thuộc" : "Đánh dấu đã thuộc"}
            </button>
            <button className="btn btn-primary" type="button" onClick={() => openChat({ drink: id })}><Icon name="chat" /> Hỏi AI về món này</button>
          </div>
          <button className="btn btn-ghost btn-block" type="button" onClick={() => { pending.quizFocus = id; go("kiem-tra"); }}><Icon name="check" /> Kiểm tra riêng món này</button>
        </div>
      </div>
      <nav className="pager" aria-label="Món khác">
        <a href={`#mon-${prev.id}`}><small>← Món trước</small><b>{prev.name}</b></a>
        <a className="next" href={`#mon-${next.id}`}><small>Món sau →</small><b>{next.name}</b></a>
      </nav>
    </>
  );
}
