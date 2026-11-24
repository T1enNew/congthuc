import { useCallback, useEffect, useMemo, useState } from "react";
import { AppCtx } from "./AppContext.js";
import { byId } from "./lib/recipes.js";
import { store, go } from "./lib/util.js";
import Icon from "./components/Icon.jsx";
import Lightbox from "./components/Lightbox.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import Home from "./pages/Home.jsx";
import Detail from "./pages/Detail.jsx";
import Learn from "./pages/Learn.jsx";
import Quiz from "./pages/Quiz.jsx";
import Preps from "./pages/Preps.jsx";
import Credits from "./pages/Credits.jsx";

const TABS = [
  { id: "mon", label: "Món", icon: "cup" },
  { id: "hoc", label: "Học nhanh", icon: "cards" },
  { id: "kiem-tra", label: "Kiểm tra", icon: "check" },
  { id: "ban-thanh-pham", label: "Bán TP", icon: "jar" }
];

/* Điều hướng bằng #hash (chạy được cả trên GitHub Pages lẫn trong Claude). */
function useHashRoute() {
  const read = () => decodeURIComponent((location.hash || "").slice(1));
  const [h, setH] = useState(read);
  useEffect(() => {
    const on = () => setH(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return h;
}

function useTheme() {
  const [theme, setTheme] = useState(() => store.get("theme", null));
  useEffect(() => {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
  }, [theme]);
  const dark = theme ? theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  const toggle = () => { const t = dark ? "light" : "dark"; store.set("theme", t); setTheme(t); };
  return { dark, toggle };
}

export default function App() {
  const route = useHashRoute();
  const { dark, toggle } = useTheme();
  const [learned, setLearned] = useState(() => new Set(store.get("learned", [])));
  const [toastMsg, setToastMsg] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [chatReq, setChatReq] = useState(null);

  const updateLearned = useCallback((fn) => setLearned((prev) => { const next = new Set(prev); fn(next); store.set("learned", Array.from(next)); return next; }), []);
  const toast = useCallback((msg) => { setToastMsg(msg); clearTimeout(window.__stpcToast); window.__stpcToast = setTimeout(() => setToastMsg(null), 2400); }, []);
  const ctx = useMemo(() => ({
    learned,
    setLearned: (id, on) => updateLearned((s) => (on ? s.add(id) : s.delete(id))),
    toast,
    openLightbox: (photos, index, name) => setLightbox({ photos, index, name }),
    openChat: (opts = {}) => setChatReq({ ...opts, at: Date.now() })
  }), [learned, updateLearned, toast]);

  let page, tab = "mon";
  if (route.startsWith("mon-") && byId[route.slice(4)]) page = <Detail key={route} id={route.slice(4)} />;
  else if (route === "hoc") { page = <Learn />; tab = "hoc"; }
  else if (route === "kiem-tra") { page = <Quiz />; tab = "kiem-tra"; }
  else if (route === "ban-thanh-pham" || route.startsWith("btp-")) { page = <Preps openId={route.startsWith("btp-") ? route.slice(4) : null} />; tab = "ban-thanh-pham"; }
  else if (route === "nguon-anh") { page = <Credits />; tab = ""; }
  else page = <Home />;

  useEffect(() => {
    if (route === "hoi-ai") { history.replaceState(null, "", "#mon"); setChatReq({ at: Date.now() }); }
    if (!route.startsWith("btp-")) window.scrollTo(0, 0);
  }, [route]);

  const focusSearch = () => { go("mon"); setTimeout(() => { const q = document.getElementById("q"); if (q) { q.focus(); q.scrollIntoView({ block: "center" }); } }, 60); };

  return (
    <AppCtx.Provider value={ctx}>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#mon" aria-label="Sổ tay pha chế — trang chủ">
            <span className="brand-mark" aria-hidden="true"><Icon name="cup" /></span>
            <span className="brand-text"><b>Sổ tay pha chế</b><small>{import.meta.env.VITE_SUBTITLE || "Last Minute Cafe"}</small></span>
          </a>
          <div className="top-actions">
            <button className="icon-btn" type="button" aria-label="Tìm món" onClick={focusSearch}><Icon name="search" /></button>
            <button className="icon-btn" type="button" aria-label={dark ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"} onClick={toggle}><Icon name={dark ? "sun" : "moon"} /></button>
          </div>
        </div>
      </header>
      <nav className="tabbar" aria-label="Điều hướng chính">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <a key={t.id} className="tab" href={`#${t.id}`} aria-current={t.id === tab ? "page" : undefined}><Icon name={t.icon} /><span>{t.label}</span></a>
          ))}
        </div>
      </nav>
      <main id="view" tabIndex={-1}>{page}</main>
      <ChatPanel route={route} request={chatReq} />
      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </AppCtx.Provider>
  );
}
