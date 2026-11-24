import { useEffect, useRef, useState } from "react";
import { MENU, catById, photosOf } from "../lib/recipes.js";
import { buildQuiz } from "../lib/quiz.js";
import { store, focus, pending } from "../lib/util.js";
import Icon from "../components/Icon.jsx";
import { thumbUrl } from "../components/DrinkImg.jsx";

export default function Quiz() {
  const [cat, setCat] = useState("all");
  const [n, setN] = useState(10);
  const [qs, setQs] = useState(null); // null = màn chọn
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [picked, setPicked] = useState(null);
  const nextRef = useRef(null);

  const start = (opts) => { setQs(buildQuiz(opts)); setI(0); setScore(0); setWrong([]); setPicked(null); };

  useEffect(() => {
    document.title = "Kiểm tra · Sổ tay pha chế";
    if (pending.quizFocus) { const id = pending.quizFocus; pending.quizFocus = null; start({ focusId: id, n: 5 }); }
  }, []);
  useEffect(() => { focus.drinkId = qs && qs[i] && qs[i].d ? qs[i].d.id : null; }, [qs, i]);
  useEffect(() => { if (picked) { nextRef.current?.focus({ preventScroll: true }); nextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); } }, [picked]);

  if (!qs) {
    const best = store.get("best", null);
    return (
      <div className="quiz-setup">
        <div className="hello"><span className="eyebrow">Tự kiểm tra</span><h1>Thử sức với {n} câu hỏi</h1></div>
        <p className="muted" style={{ margin: 0 }}>Câu hỏi về định lượng, dụng cụ, thứ tự các bước, bán thành phẩm và hạn dùng — lấy đúng từ cẩm nang của quán.</p>
        <div className="chips" role="toolbar" aria-label="Chọn nhóm">
          <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>Tất cả món</button>
          {MENU.categories.map((c) => <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.short}</button>)}
        </div>
        <div className="seg" role="group" aria-label="Số câu">
          {[5, 10, 20].map((x) => <button key={x} type="button" aria-pressed={n === x} onClick={() => setN(x)}>{x} câu</button>)}
        </div>
        {best && <div className="muted small">Điểm cao nhất của bạn: <b>{best.score}/{best.n}</b></div>}
        <button className="btn btn-primary btn-block" type="button" onClick={() => start({ cat, n })}><Icon name="check" /> Bắt đầu</button>
      </div>
    );
  }

  if (i >= qs.length) {
    const best = store.get("best", null);
    if (!best || score / qs.length > best.score / best.n) store.set("best", { score, n: qs.length });
    const pct = qs.length ? score / qs.length : 0;
    return (
      <div className="quiz-setup">
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <span className="eyebrow">Kết quả</span>
          <div className="score-big num">{score}/{qs.length}</div>
          <div>{pct === 1 ? "Xuất sắc! Không sai câu nào." : pct >= 0.7 ? "Tốt lắm — ôn lại vài câu sai là chắc tay." : "Cần ôn thêm. Xem lại các câu sai bên dưới nhé."}</div>
        </div>
        {wrong.length > 0 && (
          <>
            <h2 style={{ fontSize: 18 }}>Câu cần xem lại</h2>
            <div className="review-list">
              {wrong.map((w, k) => (
                <div key={k} className="item"><b>{w.q}</b>Đáp án đúng: <b style={{ display: "inline" }}>{w.answer}</b><div className="muted">{w.explain}</div>{w.d && <a className="link-btn" href={`#mon-${w.d.id}`}>Xem công thức →</a>}</div>
              ))}
            </div>
          </>
        )}
        <div className="btn-row">
          <button className="btn btn-primary" type="button" onClick={() => start({ cat, n })}>Làm bài mới</button>
          <button className="btn btn-ghost" type="button" onClick={() => setQs(null)}>Đổi nhóm món</button>
        </div>
      </div>
    );
  }

  const q = qs[i];
  const p = q.d ? photosOf(q.d.id)[0] : null;
  const choose = (o) => {
    if (picked) return;
    setPicked(o);
    if (o === q.answer) setScore((s) => s + 1); else setWrong((w) => [...w, q]);
  };
  return (
    <div className="quiz-setup">
      <div className="flash-meta"><span>Câu <b className="num">{i + 1}/{qs.length}</b></span><span>Đúng <b className="num">{score}</b></span></div>
      <div className="bar"><i style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <div className="card quiz-card">
        <div className="quiz-ctx">
          {p && <img src={thumbUrl(p)} alt="" />}
          <div><span className="eyebrow">{q.d ? catById[q.d.cat].short : q.prep ? "Bán thành phẩm" : "Bảng date"}</span>{q.d && <div><b>{q.d.name}</b></div>}</div>
        </div>
        <div className="quiz-q">{q.q}</div>
        <div className="options">
          {q.opts.map((o, k) => (
            <button key={o} className={`opt${picked && o === q.answer ? " right" : ""}${picked === o && o !== q.answer ? " wrong" : ""}`} type="button" disabled={!!picked} onClick={() => choose(o)}>
              <span className="k">{"ABCD"[k]}</span><span>{o}</span>
            </button>
          ))}
        </div>
        {picked && (
          <div>
            <div className="explain">{picked === q.answer ? "✅ Chính xác!" : "❌ Chưa đúng."} {q.explain}</div>
            <button ref={nextRef} className="btn btn-primary btn-block" type="button" style={{ marginTop: 12 }} onClick={() => { setI(i + 1); setPicked(null); }}>
              {i + 1 < qs.length ? "Câu tiếp theo" : "Xem kết quả"} <Icon name="next" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
