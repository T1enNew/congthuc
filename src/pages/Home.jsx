import { useEffect, useState } from "react";
import { useApp } from "../AppContext.js";
import { MENU, drinks, catById, photosOf, tempLabel, matchDrink } from "../lib/recipes.js";
import { store, focus } from "../lib/util.js";
import Icon from "../components/Icon.jsx";
import CupSVG from "../components/CupSVG.jsx";
import { Thumb } from "../components/DrinkImg.jsx";
import FilterSheet, { passFilter, TEMP_OPTS, PROG_OPTS } from "../components/FilterSheet.jsx";

const NO_FILTER = { cat: "all", temp: "all", prog: "all" };

function ProgressRing({ done, total }) {
  const r = 22, c = 2 * Math.PI * r, f = total ? done / total : 0;
  return (
    <svg className="ring" viewBox="0 0 54 54" aria-hidden="true">
      <circle className="ring-bg" cx="27" cy="27" r={r} />
      <circle className="ring-fg" cx="27" cy="27" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - f)} />
      <text x="27" y="32" textAnchor="middle">{Math.round(f * 100)}%</text>
    </svg>
  );
}

function DrinkRow({ d, done }) {
  return (
    <a className="drink-row" href={`#mon-${d.id}`}>
      <span className="dr-ph">{photosOf(d.id)[0] ? <Thumb p={photosOf(d.id)[0]} /> : <CupSVG d={d} className="" />}</span>
      <span className="dr-main"><b>{d.name}</b><small><i className={`tdot ${d.temp}`} />{tempLabel(d)}{d.sizes ? ` · Size ${d.sizes.join("/")}` : ""}</small></span>
      {done ? <span className="dr-done" title="Đã thuộc" aria-label="Đã thuộc"><Icon name="ok" /></span> : <span />}
      <span className="chev" aria-hidden="true"><Icon name="next" /></span>
    </a>
  );
}

export default function Home() {
  const { learned, openChat } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(() => ({ ...NO_FILTER, ...store.get("filter", {}) }));
  const [openCats, setOpenCats] = useState(() => new Set(store.get("openCats", [])));
  const [sheet, setSheet] = useState(false);

  useEffect(() => { focus.drinkId = null; document.title = "Sổ tay pha chế"; }, []);

  const applyFilter = (f) => { setFilter(f); store.set("filter", f); };
  const nFilter = (filter.cat !== "all") + (filter.temp !== "all") + (filter.prog !== "all");
  const auto = !!q.trim() || nFilter > 0; // đang tìm/lọc thì mở sẵn các nhóm có kết quả
  const ok = passFilter(filter, learned);
  const hour = new Date().getHours();
  const hi = hour < 11 ? "Chào buổi sáng" : hour < 14 ? "Chào buổi trưa" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const groups = MENU.categories
    .filter((c) => filter.cat === "all" || c.id === filter.cat)
    .map((c) => ({ c, ds: drinks.filter((d) => d.cat === c.id && ok(d) && matchDrink(d, q.trim())) }))
    .filter((g) => g.ds.length);

  const toggleCat = (id, open) => {
    if (auto) return;
    setOpenCats((prev) => { const next = new Set(prev); open ? next.add(id) : next.delete(id); store.set("openCats", Array.from(next)); return next; });
  };

  const summary = [
    filter.cat !== "all" && catById[filter.cat].short,
    filter.temp !== "all" && TEMP_OPTS.find((x) => x[0] === filter.temp)[1],
    filter.prog !== "all" && PROG_OPTS.find((x) => x[0] === filter.prog)[1]
  ].filter(Boolean);

  return (
    <>
      <section className="section">
        <div className="hello"><span className="eyebrow">{hi}</span><h1>Hôm nay mình học món gì?</h1></div>
        <div className="search-row">
          <label className="search" htmlFor="q">
            <Icon name="search" />
            <input id="q" type="search" placeholder="Tìm món, nguyên liệu…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" enterKeyHint="search" />
            {q && <button className="clear" type="button" aria-label="Xoá tìm kiếm" onClick={() => { setQ(""); document.getElementById("q")?.focus(); }}><Icon name="x" /></button>}
          </label>
          <button className={`filter-btn${nFilter ? " on" : ""}`} type="button" aria-haspopup="dialog" aria-label="Bộ lọc" onClick={() => setSheet(true)}>
            <Icon name="filter" />{nFilter > 0 && <span className="fcount">{nFilter}</span>}
          </button>
        </div>
        {nFilter > 0 && (
          <div className="active-filters"><span>Đang lọc: <b>{summary.join(" · ")}</b></span><button type="button" className="link-btn" onClick={() => applyFilter(NO_FILTER)}>Bỏ lọc</button></div>
        )}
        <div className="progress-card">
          <ProgressRing done={learned.size} total={drinks.length} />
          <div>
            <b>Đã thuộc {learned.size}/{drinks.length} món</b>
            <div className="muted small">Lật thẻ để ôn, làm bài kiểm tra để chắc tay.</div>
            <div className="actions"><a className="link-btn" href="#hoc">Ôn bằng thẻ →</a><a className="link-btn" href="#kiem-tra">Làm kiểm tra →</a></div>
          </div>
        </div>
      </section>

      {groups.length ? (
        <div className="menu-list">
          {groups.map(({ c, ds }) => {
            const all = drinks.filter((d) => d.cat === c.id);
            const done = all.filter((d) => learned.has(d.id)).length;
            return (
              <details key={c.id + (auto ? "-a" : "")} className="cat-acc" open={auto || openCats.has(c.id)} onToggle={(e) => toggleCat(c.id, e.currentTarget.open)}>
                <summary>
                  <b className="cat-name">{c.name.length > 22 ? c.short : c.name}</b>
                  <span className="cat-count num">{done ? `${done}/` : ""}{ds.length} món</span>
                  <span className="chev" aria-hidden="true"><Icon name="next" /></span>
                </summary>
                <div className="drink-rows">{ds.map((d) => <DrinkRow key={d.id} d={d} done={learned.has(d.id)} />)}</div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          {q.trim() ? (
            <>
              <div>Không thấy món nào khớp “{q.trim()}”{nFilter ? " trong bộ lọc đang chọn" : ""}.</div>
              <button className="btn btn-primary" type="button" onClick={() => openChat({ drink: null, prefill: q.trim() })}><Icon name="chat" /> Hỏi trợ lý AI</button>
            </>
          ) : <div>Không có món nào với bộ lọc này.</div>}
        </div>
      )}

      <div className="footer-note"><span>Công thức theo {MENU.source}.</span></div>
      {sheet && <FilterSheet value={filter} learned={learned} onApply={applyFilter} onClose={() => setSheet(false)} />}
    </>
  );
}
