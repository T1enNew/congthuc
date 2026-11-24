/*
 * Cấu hình trợ lý AI.
 *
 * aiProxyUrl: địa chỉ Cloudflare Worker trong thư mục ai-proxy/ (xem ai-proxy/README.md).
 *   - Để trống ""  -> trợ lý chạy chế độ offline (trả lời từ dữ liệu công thức, không cần mạng/khoá API).
 *   - Điền URL     -> trợ lý dùng Claude qua Worker của bạn (khoá API nằm trên Worker, không lộ ra web).
 *
 * Khi mở trang bên trong Claude (bản Artifact), trợ lý tự dùng Claude, không cần cấu hình gì.
 */
window.APP_CONFIG = {
  aiProxyUrl: ""
};
