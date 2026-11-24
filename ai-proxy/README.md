# Bật trợ lý AI miễn phí (Groq) cho bản GitHub Pages

Không cấu hình gì thì bong bóng AI vẫn chạy **miễn phí ở chế độ tra cứu**: trả lời định lượng, các bước, hạn dùng trực tiếp từ dữ liệu công thức.

Muốn AI trả lời tự nhiên mọi câu hỏi (giải thích, so sánh, mẹo pha chế…), dựng một Cloudflare Worker nhỏ nối tới **Groq** — miễn phí, không cần thẻ tín dụng, cùng nhà cung cấp dự án Sprouty đang dùng.
Khoá nằm trên Worker nên **không lộ** ra trang web công khai.

## Cách nhanh nhất (không cần cài gì)

1. **Lấy khoá Groq**: vào https://console.groq.com → đăng nhập Google → **API Keys** → **Create API Key** → copy (dạng `gsk_...`). Có thể dùng lại khoá đang chạy cho Sprouty.
2. **Tạo Worker**: vào https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker** → đặt tên `so-tay-pha-che-ai` → **Deploy**.
3. Bấm **Edit code**, xoá hết code mẫu, dán toàn bộ nội dung file [`worker.js`](worker.js) → **Deploy**.
4. Vào **Settings → Variables and Secrets** của Worker → **Add**:
   - Type **Secret**, tên `AI_API_KEY`, giá trị khoá `gsk_...`
5. Copy địa chỉ Worker (dạng `https://so-tay-pha-che-ai.<tên-bạn>.workers.dev`), mở `assets/js/config.js` ở thư mục gốc và điền:

```js
window.APP_CONFIG = {
  aiProxyUrl: "https://so-tay-pha-che-ai.<tên-bạn>.workers.dev"
};
```

Commit, push lên GitHub. Mở trang → bong bóng AI có chấm xanh và dòng “AI trực tuyến · miễn phí”.

## Dùng bằng dòng lệnh (tuỳ chọn)

```bash
cd ai-proxy
npx wrangler login
npx wrangler secret put AI_API_KEY   # dán khoá gsk_...
npx wrangler deploy
```

## Đổi model / nhà cung cấp

| Muốn dùng | Biến cần đặt |
|---|---|
| Groq (mặc định) | `AI_API_KEY=gsk_...` · model mặc định `qwen/qwen3.8-27b` |
| Gemini miễn phí | `AI_PROVIDER=gemini`, secret `GEMINI_API_KEY=AIza...` (lấy ở aistudio.google.com/app/apikey). Để trống `AI_MODEL` để dùng alias `gemini-flash-latest` |
| OpenRouter (model `:free`) | `AI_ENDPOINT=https://openrouter.ai/api/v1/chat/completions`, `AI_API_KEY=sk-or-...`, `AI_MODEL=<tên model có đuôi :free>` |

Danh sách model Groq thay đổi theo thời gian, xem bằng:

```bash
curl -s https://api.groq.com/openai/v1/models -H "Authorization: Bearer gsk_..." | grep -o '"id":"[^"]*"'
```

Lưu ý từ dự án Sprouty: `openai/gpt-oss-*` trên Groq trả về nội dung rỗng với cách gọi này; `qwen/qwen3.8-27b` trả lời tiếng Việt tốt.

## Khi AI không trả lời

Trang tự chuyển sang chế độ tra cứu và ghi “Không kết nối được AI”. Xem nguyên nhân ở Cloudflare → Worker → **Logs** (dòng `AI error ...`):
- `401/403`: khoá sai hoặc bị thu hồi.
- `404`: tên model không còn — đổi `AI_MODEL`.
- `429`: hết lượt miễn phí tạm thời — chờ vài phút hoặc sang ngày.

## Ghi chú

- Mỗi câu hỏi chỉ gửi phần công thức liên quan (khoảng 2–4 nghìn token) để tiết kiệm lượt miễn phí.
- `ALLOWED_ORIGINS` chỉ cho trang `https://t1ennew.github.io` gọi Worker. Lời dặn hệ thống nằm trên Worker và AI chỉ nhận câu hỏi về pha chế.
- Dữ liệu công thức và câu hỏi sẽ được gửi tới nhà cung cấp AI bạn chọn.
