# Bật trợ lý AI trực tuyến (Claude) cho bản GitHub Pages

Mặc định, trợ lý trên trang chạy **offline**: tra công thức trong dữ liệu, không cần mạng hay khoá API.
Muốn trợ lý trả lời được mọi câu hỏi (giải thích, so sánh, mẹo pha chế…), bạn dựng một Cloudflare Worker nhỏ làm cầu nối tới Claude.
Khoá API nằm trên Worker, **không lộ** ra trang web công khai.

## Cần có

- Tài khoản Cloudflare (miễn phí): https://dash.cloudflare.com
- Khoá Claude API: https://console.anthropic.com → API Keys. Nên đặt **giới hạn chi tiêu** (Spending limit) trong Console.
- Node.js 18+ trên máy.

## Các bước

```bash
cd ai-proxy
npm install
npx wrangler login                       # đăng nhập Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY  # dán khoá API khi được hỏi
npx wrangler deploy
```

Lệnh `deploy` in ra địa chỉ dạng `https://so-tay-pha-che-ai.<tên-bạn>.workers.dev`.

Mở `assets/js/config.js` ở thư mục gốc và điền địa chỉ đó:

```js
window.APP_CONFIG = {
  aiProxyUrl: "https://so-tay-pha-che-ai.<tên-bạn>.workers.dev"
};
```

Commit, push lên GitHub là xong. Trên trang, mục **Hỏi AI** sẽ hiện “AI trực tuyến”.

## Ghi chú

- `wrangler.toml` → `ALLOWED_ORIGINS` chỉ cho phép trang `https://t1ennew.github.io` gọi Worker. Đổi nếu bạn dùng tên miền khác.
- Model dùng: `claude-opus-5-5`, effort `low` (trả lời nhanh, tiết kiệm). Phần công thức dài được cache để giảm chi phí.
- Mỗi câu hỏi tính phí theo lượng token trên tài khoản API của bạn.
