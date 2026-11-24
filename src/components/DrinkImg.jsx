/* Ảnh món: ảnh nhỏ (480px) cho danh sách, tự đổi sang ảnh lớn (960px) khi màn hình cần. */
const base = import.meta.env.BASE_URL;
export const thumbUrl = (p) => `${base}images/drinks/thumb/${p.f}`;
export const fullUrl = (p) => `${base}images/drinks/full/${p.f}`;

export default function DrinkImg({ p, sizes = "50vw", eager = false, alt = "", className }) {
  if (!p) return null;
  return (
    <img
      className={className}
      src={thumbUrl(p)}
      srcSet={`${thumbUrl(p)} 480w, ${fullUrl(p)} 960w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      width={p.w || 960}
      height={p.h || 720}
    />
  );
}

export function Thumb({ p, alt = "" }) {
  if (!p) return null;
  return <img src={thumbUrl(p)} alt={alt} loading="lazy" decoding="async" />;
}
