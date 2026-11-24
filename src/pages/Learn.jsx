import { useEffect, useRef, useState } from "react";
import { useApp } from "../AppContext.js";
import { MENU, drinks, photosOf, packOf } from "../lib/recipes.js";
import { shuffle, focus } from "../lib/util.js";
import Icon from "../components/Icon.jsx";
import CupSVG from "../components/CupSVG.jsx";
import DrinkImg from "../components/DrinkImg.jsx";
import { IngList } from "../components/IngList.jsx";
import { Badges } from "./Detail.jsx";

/* Món chưa thuộc lên trước, đã thuộc xếp sau. */
function buildDeck(cat, onlyNew, learned) {
  let ds = drinks.filter((d) => cat === "all" || d.cat === cat);
  if (onlyNew) ds = ds.filter((d) => !learned.has(d.id));
  return shuffle(ds.filter((d) => !learned.has(d.id))).concat(shuffle(ds.filter((d) => learned.has(d.id))));
}

export default function Learn() {
  const { learned, setLearned } = useApp();
  const [cat, setCat] = useState("all");
  const [onlyNew, setOnlyNew] = useState(false);
  const [deck, setDeck] = useState(() => buildDeck("all", false, learned));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const sx = useRef(null);
  const d = deck[i];

  useEffect(() => { document.title = "Học nhanh · Sổ tay pha chế"; }, []);
  useEffect(() => { focus.drinkId = d ? d.id : null; }, [d]);

  const reset = (c = cat, o = onlyNew) => { setDeck(buildDeck(c, o, learned)); setI(0); setFlipped(false); };
  const inCat = drinks.filter((x) => cat === "all" || x.cat === cat);
  const done = inCat.filter((x) => learned.has(x.id)).length;

  const advance = (nextDeck, nextLearned) => {
    setFlipped(false);
    if (i + 1 < nextDeck.length) { setDeck(nextDeck); setI(i + 1); return; }
    const fresh = buildDeck(cat, onlyNew, nextLearned);
    setDeck(fresh.every((x) => nextLearned.has(x.id)) ? [] : fresh);
    setI(0);
  };
  const got = () => { setLearned(d.id, true); const nl = new Set(learned); nl.add(d.id); advance(deck, nl); };
  const again = () => advance([...deck, d], learned);

  return (
    <>
      <div className="learn-top">
        <div className="hello"><span className="eyebrow">Thẻ ghi nhớ</span><h1>Nhìn món — nhớ công thức</h1></div>
        <div className="chips" role="toolbar" aria-label="Chọn nhóm">
          <button className="chip" aria-pressed={cat === "all"} onClick={() => { setCat("all"); reset("all"); }}>Tất cả</button>
          {MENU.categories.map((c) => <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => { setCat(c.id); reset(c.id); }}>{c.short}</button>)}
        </div>
        <div className="flash-meta">
          <span>Đã thuộc <b className="num">{done}/{inCat.length}</b></span>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={onlyNew} onChange={(e) => { setOnlyNew(e.target.checked); reset(cat, e.target.checked); }} style={{ width: 20, height: 20 }} /> Chỉ món chưa thuộc
          </label>
        </div>
        <div className="bar"><i style={{ width: `${inCat.length ? (done / inCat.length) * 100 : 0}%` }} /></div>
      </div>

      {d ? (
        <>
          <div className="flash-wrap">
            <button
              className={`flash${flipped ? " flipped" : ""}`} type="button" aria-label="Chạm để lật thẻ"
              onClick={() => setFlipped(!flipped)}
              onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => { if (sx.current == null) return; const dx = e.changedTouches[0].clientX - sx.current; sx.current = null; if (Math.abs(dx) > 70 && flipped) (dx > 0 ? got : again)(); }}
            >
              <div className="face front">
                <div className="ph"><DrinkImg p={photosOf(d.id)[0]} sizes="(min-width: 700px) 640px, 100vw" alt={d.name} eager /></div>
                <div className="cap">
                  <div style={{ display: "flex", gap: 6 }}><Badges d={d} /></div>
                  <h2>{d.name}</h2>
                  <span className="hint"><Icon name="flip" /> Tự nhẩm công thức, rồi chạm để lật thẻ</span>
                </div>
              </div>
              <div className="face back">
                <h3>{d.name}</h3>
                <div className="mini"><CupSVG d={d} /><IngList d={d} size={d.sizes ? d.sizes[0] : null} both style={{ fontSize: 14.5 }} /></div>
                <div><div className="eyebrow" style={{ marginBottom: 6 }}>Các bước</div><ol>{d.steps.map((s, k) => <li key={k}>{s}</li>)}</ol></div>
                <div className="muted small">{packOf(d, d.sizes ? d.sizes[d.sizes.length - 1] : null).join(" · ")}</div>
              </div>
            </button>
          </div>
          <div className="flash-meta" style={{ marginTop: 10 }}>
            <span>Thẻ <b className="num">{i + 1}/{deck.length}</b></span>
            <a className="link-btn" href={`#mon-${d.id}`}>Xem chi tiết món →</a>
          </div>
          <div className="flash-actions">
            <button className="btn btn-ghost" type="button" onClick={again}>Chưa nhớ</button>
            <button className="btn btn-good" type="button" onClick={got}><Icon name="ok" /> Nhớ rồi</button>
          </div>
        </>
      ) : (
        <div className="empty panel" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 40 }}>🎉</div>
          <b>Bạn đã thuộc hết các món trong nhóm này!</b>
          <div className="btn-row" style={{ width: "100%" }}>
            <button className="btn btn-ghost" type="button" onClick={() => { setOnlyNew(false); reset(cat, false); }}>Ôn lại từ đầu</button>
            <a className="btn btn-primary" href="#kiem-tra">Làm bài kiểm tra</a>
          </div>
        </div>
      )}
    </>
  );
}
