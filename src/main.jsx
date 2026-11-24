import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Ảnh lớn lỗi/chưa có -> dùng ảnh nhỏ; ảnh nhỏ cũng lỗi -> ẩn ảnh, giữ khung màu nền.
document.addEventListener("error", (e) => {
  const t = e.target;
  if (!t || t.tagName !== "IMG") return;
  if (t.srcset) { t.removeAttribute("srcset"); t.removeAttribute("sizes"); if (!t.src.includes("/thumb/")) t.src = t.src.replace("/full/", "/thumb/"); return; }
  if (t.src.includes("/full/")) { t.src = t.src.replace("/full/", "/thumb/"); return; }
  t.style.visibility = "hidden";
}, true);

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);

// Cài lên màn hình chính & dùng khi mất mạng — chỉ trên web thật (https), không bật khi chạy local hay trong Claude.
if ("serviceWorker" in navigator && !window.claude && location.protocol === "https:" && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
