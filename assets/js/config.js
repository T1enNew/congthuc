/*
 * Cấu hình trợ lý AI (bong bóng chat).
 *
 * aiProxyUrl: địa chỉ Cloudflare Worker trong thư mục ai-proxy/ (xem ai-proxy/README.md).
 *   - Để trống ""  -> chế độ tra cứu miễn phí: trả lời từ dữ liệu công thức, không cần mạng/khoá.
 *   - Điền URL     -> AI trực tuyến miễn phí qua Groq (hoặc Gemini) — khoá nằm trên Worker, không lộ ra web.
 *
 * Khi mở trang bên trong Claude (bản Artifact), có thêm công tắc "Dùng Claude" trong khung chat (mặc định tắt).
 */
window.APP_CONFIG = {
  aiProxyUrl: ""
};
