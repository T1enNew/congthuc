/* Xem ảnh toàn màn hình, kèm ghi công tác giả & giấy phép (bắt buộc với ảnh CC BY / CC BY-SA). */
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { fullUrl } from "./DrinkImg.jsx";

export default function Lightbox({ photos, index, name, onClose }) {
  const [i, setI] = useState(index);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const n = photos.length;
  const p = photos[i];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [n]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh" onClick={(e) => { if (e.target === e.currentTarget || e.target.classList.contains("lb-img")) onClose(); }}>
      <div className="lb-img"><img src={fullUrl(p)} alt={name} /></div>
      <div className="lb-bar">
        {n > 1 && <button className="icon-btn" type="button" aria-label="Ảnh trước" onClick={() => setI((x) => (x - 1 + n) % n)}><Icon name="back" /></button>}
        <div className="grow">
          {p.title || name}<br />
          Tác giả: {p.by || "không rõ"} · {p.licUrl ? <a href={p.licUrl} target="_blank" rel="noopener noreferrer">{p.lic}</a> : p.lic} ·{" "}
          <a href={p.src} target="_blank" rel="noopener noreferrer">Xem gốc</a> · <a href="#nguon-anh" onClick={onClose}>Tất cả nguồn ảnh</a>
        </div>
        {n > 1 && <button className="icon-btn" type="button" aria-label="Ảnh sau" onClick={() => setI((x) => (x + 1) % n)}><Icon name="next" /></button>}
        <button ref={closeRef} className="icon-btn" type="button" aria-label="Đóng" onClick={onClose}><Icon name="x" /></button>
      </div>
    </div>
  );
}
