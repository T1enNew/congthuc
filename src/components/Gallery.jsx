/* Thư viện ảnh vuốt ngang (scroll-snap), chấm vị trí, ảnh thu nhỏ, chạm để phóng to. */
import { useRef, useState } from "react";
import Icon from "./Icon.jsx";
import CupSVG from "./CupSVG.jsx";
import DrinkImg, { thumbUrl } from "./DrinkImg.jsx";
import { photosOf } from "../lib/recipes.js";
import { useApp } from "../AppContext.js";

export default function Gallery({ d }) {
  const { openLightbox } = useApp();
  const ps = photosOf(d.id);
  const track = useRef(null);
  const [cur, setCur] = useState(0);
  const go = (i) => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" });
  const onScroll = () => { const t = track.current; if (t) setCur(Math.round(t.scrollLeft / Math.max(1, t.clientWidth))); };

  if (!ps.length) {
    return <div className="gallery" style={{ aspectRatio: "4/3", display: "grid", placeItems: "center", padding: 16 }}><CupSVG d={d} style={{ height: "100%", width: "auto" }} /></div>;
  }
  return (
    <>
      <div className="gallery">
        <div className="gallery-track" ref={track} onScroll={onScroll} tabIndex={0} aria-label={`Ảnh ${d.name}`}>
          {ps.map((p, i) => (
            <figure key={p.f}>
              <button type="button" aria-label={`Phóng to ảnh ${i + 1}`} onClick={() => openLightbox(ps, i, d.name)}>
                <DrinkImg p={p} sizes="(min-width: 900px) 560px, 100vw" eager={i === 0} alt={`${d.name} — ảnh ${i + 1}`} />
              </button>
            </figure>
          ))}
        </div>
        {ps.length > 1 && (
          <>
            <div className="gallery-dots" aria-hidden="true">{ps.map((p, i) => <i key={p.f} className={i === cur ? "on" : ""} />)}</div>
            <button className="gallery-nav prev" type="button" aria-label="Ảnh trước" onClick={() => go((cur - 1 + ps.length) % ps.length)}><Icon name="back" /></button>
            <button className="gallery-nav next" type="button" aria-label="Ảnh sau" onClick={() => go((cur + 1) % ps.length)}><Icon name="next" /></button>
          </>
        )}
      </div>
      {ps.length > 1 && (
        <div className="thumbs">
          {ps.map((p, i) => (
            <button key={p.f} type="button" aria-label={`Xem ảnh ${i + 1}`} aria-current={i === cur} onClick={() => go(i)}>
              <img src={thumbUrl(p)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
