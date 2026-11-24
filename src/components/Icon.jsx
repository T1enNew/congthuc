/* Bộ icon SVG nội tuyến (không cần thư viện). Dùng: <Icon name="cup" /> */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };

const PATHS = {
  cup: <g {...S}><path d="M5 8h12v5a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V8Z" /><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M8 2.8c-.6.8-.6 1.6 0 2.4M11.5 2.8c-.6.8-.6 1.6 0 2.4" /></g>,
  cards: <g {...S}><rect x="3" y="6" width="13" height="15" rx="2.5" /><path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V17" /></g>,
  check: <g {...S}><path d="M9 11l3 3 8-8" /><path d="M20 12v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h9" /></g>,
  spark: <g {...S}><path d="M12 3l1.8 4.6L18.5 9.5l-4.7 1.9L12 16l-1.8-4.6L5.5 9.5l4.7-1.9L12 3Z" /><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" /></g>,
  chat: <g {...S} strokeWidth="2"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" /><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth="2.6" /></g>,
  jar: <g {...S}><path d="M7 3h10M8 3v3l-2 3v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9l-2-3V3" /><path d="M6 13h12" /></g>,
  search: <g {...S} strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></g>,
  filter: <g {...S} strokeWidth="2"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></g>,
  x: <g {...S} strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18" /></g>,
  back: <g {...S} strokeWidth="2"><path d="M15 18l-6-6 6-6" /></g>,
  next: <g {...S} strokeWidth="2"><path d="M9 18l6-6-6-6" /></g>,
  ok: <g {...S} strokeWidth="3"><path d="M5 12.5l4.5 4.5L19 7.5" /></g>,
  info: <g {...S} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></g>,
  send: <g {...S} strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></g>,
  flip: <g {...S} strokeWidth="2"><path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2" /><path d="M20 4v4h-4M4 20v-4h4" /></g>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />,
  moon: <g {...S} strokeWidth="2"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></g>,
  sun: <g {...S} strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></g>,
  snow: <g {...S} strokeWidth="2"><path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5" /></g>,
  home: <g {...S} strokeWidth="2"><path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z" /></g>,
  ice: <g {...S} strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 4v16M15 4v16" /></g>
};

export default function Icon({ name, className }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">{PATHS[name]}</svg>;
}
