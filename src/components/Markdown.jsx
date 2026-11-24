/* Hiển thị câu trả lời của trợ lý (Markdown đơn giản) + thẻ [[mon:id]] / [[btp:id]] thành thẻ món có ảnh thật. */
import CupSVG from "./CupSVG.jsx";
import { Thumb } from "./DrinkImg.jsx";
import { byId, prepById, photosOf, formulaLine } from "../lib/recipes.js";

const INLINE = /(\*\*[^*]+?\*\*|`[^`]+`|\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_)/g;

function Inline({ text }) {
  return String(text).split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={i}>{part.slice(1, -1)}</code>;
    if (/^(\*[^*].*\*|_[^_].*_)$/.test(part)) return <i key={i}>{part.slice(1, -1)}</i>;
    return part;
  });
}

function DrinkCard({ id }) {
  const d = byId[id];
  if (!d) return null;
  const ps = photosOf(id).slice(0, 3);
  return (
    <div className="ai-card">
      {ps.length > 0 && <div className={`strip n${ps.length}`}>{ps.map((p) => <Thumb key={p.f} p={p} alt={d.name} />)}</div>}
      <div className="info">
        <CupSVG d={d} className="" />
        <div>
          <b>{d.name}</b>
          <div className="f num">{d.sizes && d.sizes.length > 1 ? d.sizes.map((s) => <div key={s}>{s}: {formulaLine(d, s)}</div>) : formulaLine(d)}</div>
          <a href={`#mon-${d.id}`}>Mở công thức đầy đủ →</a>
        </div>
      </div>
    </div>
  );
}

function PrepCard({ id }) {
  const p = prepById[id];
  if (!p) return null;
  return (
    <a className="ai-prep" href={`#btp-${p.id}`}>
      <b>{p.name}</b> · ra {p.yield} · để {p.shelf}
      <span>{p.ing.map((i) => `${i[0]} ${i[2]} ${i[1]}`).join(" · ")}</span>
    </a>
  );
}

function parse(text) {
  const blocks = [];
  let list = null;
  const close = () => { if (list) { blocks.push(list); list = null; } };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    const tag = line.trim().match(/^\[\[(mon|btp):([a-z0-9-]+)\]\]$/i);
    if (tag) { close(); blocks.push({ t: tag[1].toLowerCase(), id: tag[2].toLowerCase() }); continue; }
    const s = line.replace(/\[\[(mon|btp):([a-z0-9-]+)\]\]/gi, "");
    let m;
    if (/^#{1,4}\s+/.test(s)) { close(); blocks.push({ t: "h", text: s.replace(/^#{1,4}\s+/, "") }); }
    else if ((m = s.match(/^\s*[-*•]\s+(.*)$/))) { if (!list || list.t !== "ul") { close(); list = { t: "ul", items: [] }; } list.items.push(m[1]); }
    else if ((m = s.match(/^\s*\d+[.)]\s+(.*)$/))) { if (!list || list.t !== "ol") { close(); list = { t: "ol", items: [] }; } list.items.push(m[1]); }
    else if ((m = s.match(/^\s*>\s?(.*)$/))) { close(); blocks.push({ t: "quote", text: m[1] }); }
    else if (!s.trim()) close();
    else { close(); blocks.push({ t: "p", text: s }); }
  }
  close();
  return blocks;
}

export default function Markdown({ text, final }) {
  const clean = String(text || "").replace(/<think>[\s\S]*?(<\/think>|$)/g, "").trim();
  const blocks = parse(clean);
  if (!blocks.length) return final ? <p>(Không có nội dung)</p> : null;
  return blocks.map((b, i) => {
    switch (b.t) {
      case "mon": return <DrinkCard key={i} id={b.id} />;
      case "btp": return <PrepCard key={i} id={b.id} />;
      case "h": return <h4 key={i}><Inline text={b.text} /></h4>;
      case "quote": return <p key={i} className="quote"><Inline text={b.text} /></p>;
      case "ul": return <ul key={i}>{b.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ul>;
      case "ol": return <ol key={i}>{b.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ol>;
      default: return <p key={i}><Inline text={b.text} /></p>;
    }
  });
}
