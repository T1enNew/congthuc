/* Bảng chọn bộ lọc (trượt lên từ đáy trên điện thoại). */
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { MENU, drinks } from "../lib/recipes.js";

export const TEMP_OPTS = [["all", "Tất cả"], ["hot", "Nóng"], ["ice", "Đá"], ["blend", "Đá xay"]];
export const PROG_OPTS = [["all", "Tất cả"], ["todo", "Chưa thuộc"], ["done", "Đã thuộc"]];

export const passFilter = (f, learned) => (d) =>
  (f.cat === "all" || d.cat === f.cat) && (f.temp === "all" || d.temp === f.temp) && (f.prog === "all" || (f.prog === "done") === learned.has(d.id));

export default function FilterSheet({ value, learned, onApply, onClose }) {
  const [draft, setDraft] = useState(value);
  const applyRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeRef.current(); };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("chat-lock");
    applyRef.current?.focus({ preventScroll: true });
    return () => { document.removeEventListener("keydown", onKey); document.body.classList.remove("chat-lock"); };
  }, []);

  const count = drinks.filter(passFilter(draft, learned)).length;
  const Opt = ({ k, v, label }) => (
    <button type="button" className="opt-chip" aria-pressed={draft[k] === v} onClick={() => setDraft({ ...draft, [k]: v })}>{label}</button>
  );

  return (
    <div className="sheet-wrap">
      <div className="sheet-backdrop" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="f-title">
        <header className="sheet-head"><b id="f-title">Bộ lọc</b><button className="icon-btn" type="button" aria-label="Đóng" onClick={onClose}><Icon name="x" /></button></header>
        <div className="sheet-body">
          <div className="f-group"><div className="eyebrow">Nhóm món</div><div className="opt-wrap">
            <Opt k="cat" v="all" label="Tất cả" />
            {MENU.categories.map((c) => <Opt key={c.id} k="cat" v={c.id} label={c.short} />)}
          </div></div>
          <div className="f-group"><div className="eyebrow">Loại</div><div className="opt-wrap">{TEMP_OPTS.map(([v, l]) => <Opt key={v} k="temp" v={v} label={l} />)}</div></div>
          <div className="f-group"><div className="eyebrow">Tiến độ học</div><div className="opt-wrap">{PROG_OPTS.map(([v, l]) => <Opt key={v} k="prog" v={v} label={l} />)}</div></div>
        </div>
        <footer className="sheet-foot">
          <button className="btn btn-ghost" type="button" onClick={() => setDraft({ cat: "all", temp: "all", prog: "all" })}>Xoá lọc</button>
          <button ref={applyRef} className="btn btn-primary" type="button" onClick={() => { onApply(draft); onClose(); }}>Xem {count} món</button>
        </footer>
      </section>
    </div>
  );
}
