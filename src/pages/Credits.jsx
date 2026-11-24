import { useEffect } from "react";
import { drinks, photosOf } from "../lib/recipes.js";
import Icon from "../components/Icon.jsx";
import { thumbUrl } from "../components/DrinkImg.jsx";

/* Ghi công tác giả ảnh (giấy phép CC BY / CC BY-SA yêu cầu). */
export default function Credits() {
  useEffect(() => { document.title = "Nguồn ảnh · Sổ tay pha chế"; }, []);
  const all = drinks.flatMap((d) => photosOf(d.id).map((p) => ({ p, d })));
  return (
    <>
      <div className="back-row"><a href="#mon"><Icon name="back" /> Tất cả món</a></div>
      <div className="hello"><span className="eyebrow">Ghi công</span><h1>Nguồn ảnh &amp; tác giả</h1></div>
      <p className="muted">Ảnh chụp thật lấy từ Wikimedia Commons theo giấy phép tự do (CC0, CC BY, CC BY-SA, Public domain), minh hoạ kiểu món. Ảnh đã được thu nhỏ để tải nhanh trên điện thoại.</p>
      <div className="credits">
        {all.map(({ p, d }) => (
          <figure key={p.f}>
            <img src={thumbUrl(p)} alt="" loading="lazy" decoding="async" />
            <figcaption><b>{d.name}</b><br />{p.by || "Không rõ tác giả"}<br />{p.lic} · <a href={p.src} target="_blank" rel="noopener noreferrer">trang gốc</a></figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
