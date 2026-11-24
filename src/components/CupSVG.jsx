/* Hình ly minh hoạ: vẽ các lớp trong ly từ đáy lên miệng theo dữ liệu cup.layers. */
import { useId } from "react";
import { PARTICLE, colorOf } from "../lib/palette.js";
import { packOf } from "../lib/recipes.js";

const CUBES = [[0.22, 0.12], [0.6, 0.1], [0.38, 0.3], [0.7, 0.36], [0.18, 0.5], [0.52, 0.56], [0.3, 0.76], [0.66, 0.74]];

export default function CupSVG({ d, className = "cup-svg", style }) {
  const id = "c" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const cup = d.cup || { type: "ice", layers: [] };
  const layers = cup.layers || [];
  const hot = cup.type === "hot";
  const small = cup.vessel === "tach-nho";

  let geo;
  if (hot) {
    const w = small ? 74 : 104, h = small ? 62 : 92, cx = 76, bottom = 176;
    geo = { top: bottom - h, bottom, xl: cx - w / 2, xr: cx + w / 2, bl: cx - w / 2 + 12, br: cx + w / 2 - 12, cx };
  } else {
    geo = { top: 46, bottom: 204, xl: 28, xr: 132, bl: 42, br: 118, cx: 80 };
  }
  const poly = `M${geo.xl},${geo.top} L${geo.xr},${geo.top} L${geo.br},${geo.bottom - 10} Q${geo.br - 2},${geo.bottom} ${geo.br - 12},${geo.bottom} L${geo.bl + 12},${geo.bottom} Q${geo.bl + 2},${geo.bottom} ${geo.bl},${geo.bottom - 10} Z`;
  const fillH = (geo.bottom - geo.top) * (hot ? 0.86 : 0.84);
  const total = layers.reduce((a, l) => a + l[1], 0) || 1;

  let y = geo.bottom;
  const rects = layers.map(([k, amt]) => { const h = Math.max(hot ? 8 : 9, (amt / total) * fillH); y -= h; return { k, y, h }; });
  const liquidTop = y;
  const span = (geo.xr - geo.xl);

  const inner = [];
  rects.forEach((r, idx) => {
    if (PARTICLE[r.k]) {
      const next = rects[idx + 1], prev = rects[idx - 1];
      const bgK = next && !PARTICLE[next.k] ? next.k : prev ? prev.k : "water";
      inner.push(<rect key={`b${idx}`} x="0" y={r.y} width="200" height={r.h + 1} fill={colorOf(bgK)} />);
      const n = Math.max(6, Math.round(r.h / 4));
      for (let j = 0; j < n * 2; j++) {
        const px = geo.xl + 8 + ((j * 37) % (span - 16));
        const py = r.y + 4 + ((j * 13) % Math.max(4, r.h - 6));
        const key = `p${idx}-${j}`;
        if (r.k === "mango-cube" || r.k.startsWith("jelly")) inner.push(<rect key={key} x={px - 5} y={py - 4} width="10" height="9" rx="2" fill={colorOf(r.k)} opacity=".95" />);
        else if (r.k === "cereal") inner.push(<ellipse key={key} cx={px} cy={py} rx="4" ry="2.6" fill={colorOf(r.k)} />);
        else inner.push(<circle key={key} cx={px} cy={py} r={r.k === "pearl" ? 4.6 : 3.6} fill={colorOf(r.k)} />);
      }
    } else {
      inner.push(<rect key={`l${idx}`} x="0" y={r.y} width="200" height={r.h + 1} fill={colorOf(r.k)} />);
      if (r.k.startsWith("foam")) inner.push(<rect key={`f${idx}`} x="0" y={r.y} width="200" height="3" fill="#fff" opacity=".6" />);
    }
  });
  if (cup.foamTop) inner.push(<rect key="ft" x="0" y={liquidTop - 1} width="200" height="7" fill={cup.foamTop === "coffee-foam" ? "#c99467" : "#d9a48a"} opacity=".9" />);
  if (cup.slush) for (let j = 0; j < 40; j++) inner.push(<circle key={`s${j}`} cx={geo.xl + 6 + ((j * 29) % (span - 10))} cy={liquidTop + 6 + ((j * 17) % Math.max(10, geo.bottom - liquidTop - 12))} r="1.6" fill="#fff" opacity=".55" />);
  if (cup.ice) {
    const iceSpan = geo.bottom - liquidTop - 14;
    CUBES.forEach(([fx, fy], j) => {
      const cx = geo.xl + 10 + fx * (span - 20), cy = liquidTop + 4 + fy * iceSpan;
      inner.push(<rect key={`i${j}`} x={cx - 10} y={cy - 9} width="21" height="19" rx="5" transform={`rotate(${(j * 23) % 40 - 18} ${cx} ${cy})`} fill="#fff" fillOpacity=".38" stroke="#fff" strokeOpacity=".75" strokeWidth="1.2" />);
    });
  }
  if (cup.dust) for (let j = 0; j < 26; j++) inner.push(<circle key={`d${j}`} cx={geo.xl + 10 + ((j * 31) % (span - 20))} cy={liquidTop + 1 + ((j * 7) % 6)} r="1.4" fill={cup.dust === "choco" ? "#5b311d" : "#b08a4f"} />);
  if (cup.sprinkle) for (let j = 0; j < 9; j++) inner.push(<ellipse key={`a${j}`} cx={geo.xl + 14 + ((j * 23) % (span - 28))} cy={liquidTop + 3 + ((j * 5) % 7)} rx="4.5" ry="2" fill="#e7c89a" stroke="#c9a06c" strokeWidth=".6" />);

  const surfW = span * (1 - ((liquidTop - geo.top) / (geo.bottom - geo.top)) * 0.25);
  const topK = layers.length ? layers[layers.length - 1][0] : "coffee";
  const artColor = cup.top === "art-matcha" ? "#7aa140" : cup.top === "art-choco" ? "#6b3c24" : "#b9824f";
  const dy = liquidTop - 2, ox = geo.cx - 18;
  const thickStraw = /phi 12/.test(packOf(d).join(" "));
  const vb = hot ? `0 ${small ? 70 : 40} 175 ${small ? 125 : 155}` : "0 0 160 212";
  const hy = geo.top + (geo.bottom - geo.top) * 0.25;

  return (
    <svg className={className} style={style} viewBox={vb} role="img" aria-label={`Hình ly minh hoạ ${d.name}`}>
      <defs>
        <clipPath id={id}><path d={poly} /></clipPath>
        <linearGradient id={`${id}g`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".18" stopColor="#fff" stopOpacity=".28" /><stop offset=".3" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {hot ? (
        <>
          <ellipse cx={geo.cx} cy={geo.bottom + 4} rx={small ? 58 : 74} ry="10" fill="#d2462a" />
          <ellipse cx={geo.cx} cy={geo.bottom + 1} rx={small ? 44 : 56} ry="6" fill="#e9684b" />
          <path d={`M${geo.xr - 4},${hy} C${geo.xr + 26},${hy - 4} ${geo.xr + 26},${hy + 40} ${geo.br - 2},${hy + 44}`} fill="none" stroke="#d2462a" strokeWidth="9" strokeLinecap="round" />
          <path d={poly} fill="#fbe2d8" />
        </>
      ) : <path d={poly} fill="rgba(220,236,244,.35)" />}
      <g clipPath={`url(#${id})`}>
        {inner}
        <rect x="0" y="0" width="200" height="220" fill={`url(#${id}g)`} />
      </g>
      {hot && cup.top && (
        <>
          <ellipse cx={geo.cx} cy={liquidTop} rx={surfW / 2 - 4} ry="6" fill={cup.top === "crema" ? "#c58b55" : colorOf(topK)} />
          {cup.top.startsWith("art") && (
            <>
              <ellipse cx={geo.cx} cy={liquidTop} rx={surfW / 2 - 4} ry="6" fill={artColor} />
              <path d={`M${geo.cx - 12},${liquidTop} q12,-9 24,0 q-12,8 -24,0Z`} fill="#fff8ee" />
            </>
          )}
        </>
      )}
      {cup.decor && (
        <>
          {cup.decor !== "mint" && (
            <>
              <circle cx={ox} cy={dy} r="11" fill="#f39a2a" stroke="#c96a12" strokeWidth="1.5" />
              {[0, 1, 2, 3, 4, 5].map((a) => { const t = (a * Math.PI) / 3; return <line key={a} x1={ox} y1={dy} x2={ox + 9 * Math.cos(t)} y2={dy + 9 * Math.sin(t)} stroke="#fbd39a" strokeWidth="1.2" />; })}
            </>
          )}
          <ellipse cx={geo.cx + 12} cy={dy - 5} rx="8" ry="4" transform={`rotate(-30 ${geo.cx + 12} ${dy - 5})`} fill="#4f9a3e" />
          <ellipse cx={geo.cx + 22} cy={dy - 3} rx="7" ry="3.6" transform={`rotate(25 ${geo.cx + 22} ${dy - 3})`} fill="#3f8a34" />
        </>
      )}
      <path d={poly} fill="none" stroke={hot ? "#d2462a" : "var(--cup-line)"} strokeWidth={hot ? 3 : 2} />
      {!hot && cup.lid === "dome" && (
        <>
          <path d={`M${geo.xl - 4},${geo.top} Q${geo.cx},${geo.top - 52} ${geo.xr + 4},${geo.top}`} fill="rgba(220,236,244,.25)" stroke="var(--cup-line)" strokeWidth="2" />
          <rect x={geo.xl - 6} y={geo.top - 3} width={span + 12} height="7" rx="3" fill="var(--cup-line)" />
        </>
      )}
      {!hot && cup.lid === "flat" && <rect x={geo.xl - 6} y={geo.top - 7} width={span + 12} height="9" rx="3" fill="var(--cup-line)" />}
      {!hot && cup.lid && <path d={`M${geo.cx + 14},${geo.bottom - 30} L${geo.cx + 30},${cup.lid === "dome" ? 2 : 14}`} stroke="#d2462a" strokeWidth={thickStraw ? 9 : 6} strokeLinecap="round" />}
    </svg>
  );
}
