/* Tiện ích chung: chuẩn hoá tiếng Việt để tìm kiếm, xáo trộn, lưu trên máy. */

export const norm = (s) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/\s+/g, " ").trim();

export const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const uniq = (a) => Array.from(new Set(a));

/* localStorage có thể bị chặn (tab ẩn danh, trong Claude...) nên luôn bọc try/catch. */
export const store = {
  get(k, d) { try { const v = localStorage.getItem("stpc:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("stpc:" + k, JSON.stringify(v)); } catch { /* bỏ qua */ } }
};

export const isWide = () => window.matchMedia("(min-width: 900px)").matches;

/* Món đang được xem/ôn — trợ lý AI dùng để biết người dùng đang hỏi về món nào. */
export const focus = { drinkId: null };

/* Lệnh chuyển giữa các trang (vd. "Kiểm tra riêng món này"). */
export const pending = { quizFocus: null };

export const go = (hash) => { if (location.hash !== "#" + hash) location.hash = hash; };
