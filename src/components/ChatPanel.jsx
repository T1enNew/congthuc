/* Bong bóng AI: nút tròn nổi + khung chat mở ngay trên trang đang xem. */
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import Markdown from "./Markdown.jsx";
import { Thumb } from "./DrinkImg.jsx";
import { CONFIG } from "../config.js";
import { byId, photosOf } from "../lib/recipes.js";
import { RULES, contextFor, offlineAnswer, suggestionsFor } from "../lib/assistant.js";
import { store, focus, isWide } from "../lib/util.js";

const BLOCKED = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];
const stripThink = (s) => String(s || "").replace(/<think>[\s\S]*?(<\/think>|$)/g, "");

/* Lịch sử gửi cho AI: 8 lượt gần nhất, lượt người dùng dùng bản có kèm "đang xem món". */
function historyForModel(turns) {
  const hist = turns.filter((t) => !t.pending && t.content && t.content.trim()).slice(-8)
    .map((t) => ({ role: t.role, content: t.role === "user" ? t.prompt || t.content : stripThink(t.content).slice(0, 3000) }));
  while (hist.length && hist[0].role !== "user") hist.shift();
  return hist;
}

async function askClaude(sample, hist, data, signal, onText) {
  const last = hist.pop();
  const input = [
    { role: "user", content: RULES },
    { role: "assistant", content: "Mình đã hiểu. Bạn cứ hỏi nhé!" },
    ...hist,
    { role: "user", content: `=== DỮ LIỆU CÔNG THỨC ===\n${data}\n=== HẾT DỮ LIỆU ===\n\n${last ? last.content : ""}` }
  ];
  const res = await sample(input, { onText: ({ text }) => onText(text), signal, cache: false, modelTier: "quick" });
  return { content: res.text, meta: res.truncated ? "Câu trả lời bị cắt ngắn — thử hỏi gọn hơn." : "" };
}

async function askProxy(hist, data, signal, onText) {
  const res = await fetch(CONFIG.aiProxyUrl, { method: "POST", headers: { "content-type": "application/json" }, signal, body: JSON.stringify({ data, messages: hist }) });
  if (res.status === 429) { const e = new Error("rate"); e.code = "rate_limited"; throw e; }
  if (!res.ok || !res.body) throw new Error("proxy " + res.status);
  const reader = res.body.getReader(), dec = new TextDecoder();
  let text = "";
  for (;;) { const { value, done } = await reader.read(); if (done) break; text += dec.decode(value, { stream: true }); onText(text); }
  if (!text.trim()) throw new Error("empty");
  return { content: text, meta: "" };
}

export default function ChatPanel({ route, request }) {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [turns, setTurns] = useState([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [ai, setAi] = useState({ sample: null, inClaude: false });
  const [useClaude, setUseClaude] = useState(() => store.get("useClaude", false));
  const turnsRef = useRef(turns); turnsRef.current = turns;
  const abortRef = useRef(null);
  const panelRef = useRef(null), bodyRef = useRef(null), taRef = useRef(null), fabRef = useRef(null), closeRef = useRef(null);

  // Trang chạy trong Claude thì có thể dùng Claude (chỉ khi người dùng bật công tắc).
  useEffect(() => {
    let alive = true;
    (async () => {
      const inClaude = !!(window.claude && typeof window.claude.use === "function");
      let sample = null;
      if (inClaude) { try { sample = await window.claude.use("sample"); } catch { sample = null; } }
      if (alive) setAi({ sample, inClaude });
    })();
    return () => { alive = false; };
  }, []);
  const mode = ai.sample && useClaude ? "claude" : !ai.inClaude && CONFIG.aiProxyUrl ? "proxy" : "offline";

  const openChat = useCallback(({ drink, prefill } = {}) => {
    setCtx(drink !== undefined ? drink : focus.drinkId);
    if (prefill) setInput(prefill);
    setOpen(true);
  }, []);
  const close = useCallback((refocus = true) => { setOpen(false); if (refocus) setTimeout(() => fabRef.current?.focus({ preventScroll: true }), 0); }, []);

  useEffect(() => { if (request) openChat(request); }, [request, openChat]);

  // Chuyển trang: điện thoại thì đóng khung chat, máy tính thì cập nhật món đang xem.
  const openRef = useRef(open); openRef.current = open;
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    if (!openRef.current) return;
    if (!isWide()) setOpen(false); else setCtx(focus.drinkId);
  }, [route]);

  useEffect(() => {
    if (!open) return;
    const lock = !isWide();
    if (lock) document.body.classList.add("chat-lock");
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setTimeout(() => (coarse && !taRef.current?.value ? closeRef.current : taRef.current)?.focus({ preventScroll: true }), 0);
    const onKey = (e) => { if (e.key === "Escape" && !document.querySelector(".lightbox")) close(); };
    document.addEventListener("keydown", onKey);
    // Bàn phím ảo trên điện thoại: đẩy khung chat lên trên bàn phím.
    const vv = window.visualViewport;
    const fit = () => { if (vv && panelRef.current) panelRef.current.style.setProperty("--kb", Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + "px"); };
    vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit); fit();
    return () => {
      document.body.classList.remove("chat-lock");
      document.removeEventListener("keydown", onKey);
      vv?.removeEventListener("resize", fit); vv?.removeEventListener("scroll", fit);
    };
  }, [open, close]);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [turns, open]);

  const ask = useCallback(async (question) => {
    if (abortRef.current) return;
    const d = ctx && byId[ctx];
    const prompt = d ? `[Mình đang xem món: ${d.name} (id: ${d.id})]\n${question}` : question;
    const userTurn = { id: Date.now(), role: "user", content: question, prompt };
    const botId = userTurn.id + 1;
    setTurns((t) => [...t, userTurn, { id: botId, role: "assistant", content: "", pending: true }]);
    setBusy(true);
    const ctl = new AbortController();
    abortRef.current = ctl;
    const patch = (p) => setTurns((t) => t.map((x) => (x.id === botId ? { ...x, ...p } : x)));
    let raf = 0, latest = "";
    const onText = (text) => { latest = text; if (!raf) raf = requestAnimationFrame(() => { raf = 0; patch({ content: latest }); }); };
    const data = contextFor(question + " " + (d ? d.name : ""), ctx);
    const hist = historyForModel([...turnsRef.current, userTurn]);
    let result;
    try {
      if (mode === "claude") result = await askClaude(ai.sample, hist, data, ctl.signal, onText);
      else if (mode === "proxy") result = await askProxy(hist, data, ctl.signal, onText);
      else result = { content: offlineAnswer(question, ctx), meta: "" };
    } catch (e) {
      const code = e && e.code;
      if (code === "cancelled" || e?.name === "AbortError") result = { content: (e.text || latest || "") + "\n\n_(Đã dừng)_", meta: "" };
      else if (BLOCKED.includes(code)) { setUseClaude(false); store.set("useClaude", false); result = { content: offlineAnswer(question, ctx), meta: "Claude chưa được cho phép — đang trả lời từ dữ liệu" }; }
      else if (code === "rate_limited") result = { content: "Hết lượt AI miễn phí tạm thời. Đây là câu trả lời từ dữ liệu:\n\n" + offlineAnswer(question, ctx), meta: "" };
      else result = { content: offlineAnswer(question, ctx), meta: "Không kết nối được AI — đang trả lời từ dữ liệu" };
    } finally {
      if (raf) cancelAnimationFrame(raf);
      abortRef.current = null;
      setBusy(false);
    }
    patch({ ...result, pending: false });
  }, [ctx, mode, ai.sample]);

  // Móc kiểm thử tự động.
  useEffect(() => { window.__sotay = { ask, offlineAnswer, contextFor, openChat }; }, [ask, openChat]);

  const submit = (e) => {
    e.preventDefault();
    if (busy) { abortRef.current?.abort(); return; }
    const v = input.trim();
    if (!v) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    ask(v);
  };

  const d = ctx && byId[ctx];
  return (
    <>
      <button ref={fabRef} className={`ai-fab${mode !== "offline" ? " live" : ""}`} type="button" aria-label="Hỏi trợ lý AI" aria-expanded={open} hidden={open} onClick={() => openChat({})}>
        <Icon name="chat" />
      </button>
      {open && !isWide() && <div className="ai-backdrop" onClick={() => close()} />}
      {open && (
        <section className="ai-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="ai-title">
          <header className="ai-head">
            <span className="ai-ava" aria-hidden="true"><Icon name="spark" /></span>
            <div className="ai-titles">
              <b id="ai-title">Trợ lý pha chế</b>
              {ai.sample && (
                <div className="ai-mode">
                  <button type="button" className="mini-toggle" aria-pressed={useClaude} onClick={() => { setUseClaude(!useClaude); store.set("useClaude", !useClaude); }}>
                    Dùng Claude{useClaude ? " · đang bật" : ""}
                  </button>
                </div>
              )}
            </div>
            <button className="icon-btn" type="button" aria-label="Cuộc trò chuyện mới" onClick={() => { abortRef.current?.abort(); setTurns([]); }}><Icon name="flip" /></button>
            <button ref={closeRef} className="icon-btn" type="button" aria-label="Đóng" onClick={() => close()}><Icon name="x" /></button>
          </header>
          {d && (
            <div className="ai-ctx">
              <span className="ctx-chip"><Thumb p={photosOf(d.id)[0]} />Đang hỏi về: <b>{d.name}</b><button type="button" aria-label="Bỏ chọn món" onClick={() => setCtx(null)}><Icon name="x" /></button></span>
            </div>
          )}
          <div className="ai-body" ref={bodyRef}>
            <div className="thread" aria-live="polite">
              {turns.length === 0 && <div className="msg bot"><div className="bubble"><p>Chào bạn! Hỏi mình bất cứ điều gì về công thức: định lượng, các bước, ly dùng, bán thành phẩm hay hạn dùng nguyên liệu.</p></div></div>}
              {turns.map((t) => t.role === "user" ? (
                <div key={t.id} className="msg user"><div className="bubble">{t.content}</div></div>
              ) : (
                <div key={t.id} className="msg bot">
                  <div className="bubble">{t.pending && !t.content ? <span className="thinking"><i /><i /><i /> Đang nghĩ…</span> : <Markdown text={t.content} final={!t.pending} />}</div>
                  {t.meta && <div className="meta">{t.meta}</div>}
                </div>
              ))}
            </div>
            {turns.length === 0 && <div className="suggest">{suggestionsFor(ctx).map((s) => <button key={s} type="button" onClick={() => ask(s)}>{s}</button>)}</div>}
          </div>
          <form className="composer" autoComplete="off" onSubmit={submit}>
            <label className="visually-hidden" htmlFor="ask">Câu hỏi</label>
            <textarea
              id="ask" ref={taRef} rows={1} placeholder="Hỏi về món bất kỳ…" enterKeyHint="send" value={input}
              onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(120, e.target.scrollHeight) + "px"; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form.requestSubmit(); } }}
            />
            <button className="send" type="submit" aria-label={busy ? "Dừng" : "Gửi"}><Icon name={busy ? "stop" : "send"} /></button>
          </form>
        </section>
      )}
    </>
  );
}
