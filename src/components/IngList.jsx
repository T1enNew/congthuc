/* Danh sách thành phần + chú thích các lớp trong ly. */
import { colorOf, PALETTE } from "../lib/palette.js";
import { prepById, qtyOf } from "../lib/recipes.js";
import { uniq } from "../lib/util.js";

export function IngList({ d, size, both = false, style }) {
  return (
    <ul className="ing-list" style={style}>
      {d.ing.map((i) => {
        const prep = i.p && prepById[i.p];
        const showBoth = both && d.sizes && d.sizes.length > 1 && typeof i.q === "object";
        return (
          <li key={i.n}>
            <span className="dot" style={{ background: i.k ? colorOf(i.k) : "var(--surface-3)" }} />
            <div className="name">
              {prep ? <a href={`#btp-${i.p}`}>{i.n}</a> : i.n}
              {i.side && <small>Phục vụ kèm</small>}
              {prep && <small>Bán thành phẩm — chạm để xem cách làm</small>}
            </div>
            {showBoth ? (
              <div className="qty both num">
                {d.sizes.map((s, j) => <span key={s}>{j > 0 && " · "}<em>{s}</em>{i.q[s]}</span>)}<span>{i.u}</span>
              </div>
            ) : (
              <div className="qty num">{qtyOf(i, size)}<span>{i.u}</span></div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CupLegend({ d }) {
  const cup = d.cup || {};
  const items = (cup.layers || []).slice().reverse().map(([k]) => k);
  if (cup.ice) items.push("ice");
  if (cup.dust) items.unshift(cup.dust === "choco" ? "dust-choco" : "dust-genmai");
  if (cup.decor) items.unshift("decor");
  return (
    <ul className="legend">
      {uniq(items).map((k, i) => {
        let label = (PALETTE[k] || [, k])[1];
        if (k === "decor") label = cup.decor === "mint" ? "Húng lũi (decor)" : "Cam sấy + húng lũi (decor)";
        return (
          <li key={k}><span className="sw" style={{ background: colorOf(k) }} /><span>{label}{i === 0 && <span className="lg-top"> ← trên cùng</span>}</span></li>
        );
      })}
    </ul>
  );
}
