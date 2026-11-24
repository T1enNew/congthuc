# Sổ tay pha chế — Last Minute Cafe

Trang web giúp nhân viên học nhanh công thức đồ uống trong **Cẩm nang thức uống Last Minute Cafe**.
Thiết kế ưu tiên điện thoại, cài được lên màn hình chính như một app và dùng được khi mất mạng.

**Công nghệ:** React 19 + Vite 8 (JavaScript/JSX), CSS thuần, không dùng thư viện giao diện. Trợ lý AI miễn phí qua Groq (Cloudflare Worker). CI/CD bằng GitHub Actions → GitHub Pages.

## Có gì trong trang

- **Món** — 43 món theo 10 nhóm, thu gọn theo nhóm (chạm để mở). Một ô tìm kiếm + một nút bộ lọc (nhóm, nóng/đá/đá xay, đã thuộc/chưa thuộc). Mỗi món có ảnh chụp thật (nhiều ảnh, nhiều góc), **hình ly minh hoạ** vẽ đúng các lớp trong ly, thành phần theo size M/L, packaging, các bước (chạm để đánh dấu khi tập pha), lưu ý và bán thành phẩm liên quan.
- **Học nhanh** — thẻ ghi nhớ: nhìn ảnh, tự nhẩm công thức, lật thẻ để kiểm tra; đánh dấu “Nhớ rồi / Chưa nhớ”. Tiến độ lưu trên máy.
- **Kiểm tra** — bài trắc nghiệm tự sinh từ cẩm nang: định lượng, ly/nắp/ống, thứ tự bước, bán thành phẩm, hạn dùng.
- **Bán thành phẩm** — 2 mục: *Công thức nền* (16 món, chạm để xem nguyên liệu & các bước) và *Hạn dùng* (29 nguyên liệu, chia theo tủ mát / nhiệt độ phòng / tủ đông, nhãn màu theo thời gian).
- **Bong bóng AI** — nút tròn ở góc phải, mở được trên mọi trang. Đang xem món nào thì AI tự hiểu là hỏi về món đó; câu trả lời kèm ảnh thật và hình ly.

## Chạy trên máy (local)

Cần [Node.js](https://nodejs.org) **20.19 trở lên** (máy bạn đang có Node 24 là được).

- **Cách dễ nhất (Windows):** bấm đúp file `chay-local.cmd` — lần đầu tự cài thư viện, sau đó trình duyệt tự mở trang.
- **Bằng lệnh** (trong thư mục dự án):

```bash
npm install          # chỉ cần chạy lần đầu (hoặc khi package.json thay đổi)
npm run dev          # chạy web tại http://localhost:5173 — sửa code là trang tự cập nhật
npm test             # kiểm tra dữ liệu công thức, ảnh, AI Worker
npm run build        # build bản đưa lên mạng vào thư mục dist/
npm run preview      # build rồi chạy thử đúng bản sẽ đưa lên mạng (cổng 5174)
```

Khi chạy `npm run dev`, cửa sổ lệnh in thêm các dòng `Network: http://192.168.x.x:5173` — mở địa chỉ của card **Wi-Fi** trên điện thoại **cùng mạng** để thử giao diện di động thật. Nhấn `Ctrl + C` để dừng.

Muốn bật AI trực tuyến khi chạy local: tạo file `.env.local` với dòng `VITE_AI_PROXY_URL=https://...workers.dev` (xem `ai-proxy/README.md`).

## Cấu trúc thư mục

```
index.html              Trang gốc của Vite
src/
  main.jsx              Điểm khởi động React
  App.jsx               Khung app: thanh trên/dưới, điều hướng theo #hash
  styles.css            Toàn bộ giao diện (sáng/tối, điện thoại/máy tính)
  config.js             Cấu hình trợ lý AI
  data/menu.js          ★ Công thức 43 món, bán thành phẩm, bảng date
  data/photos.js        ★ Danh sách ảnh từng món + ghi công tác giả
  lib/                  Logic: tìm kiếm, trợ lý offline, sinh câu hỏi, màu hình ly
  components/           Hình ly, thư viện ảnh, bong bóng chat, bộ lọc...
  pages/                Món, Chi tiết món, Học nhanh, Kiểm tra, Bán thành phẩm, Nguồn ảnh
public/
  images/               Ảnh món (full ~960px, thumb ~480px) và icon app
  sw.js, manifest.webmanifest   Cài app & chạy khi mất mạng
ai-proxy/               Cloudflare Worker nối AI miễn phí (Groq/Gemini)
scripts/                validate.mjs (npm test), stamp-sw.mjs (sau build)
```

## Sửa công thức, thêm ảnh

- **Công thức**: sửa `src/data/menu.js` (mỗi món một khối, có chú thích cách ghi ở đầu file).
- **Ảnh**: đặt ảnh vào `public/images/drinks/full/` (rộng ~960px) và `public/images/drinks/thumb/` (rộng ~480px) cùng tên file, rồi khai báo trong `src/data/photos.js`. Nên thay dần bằng ảnh chụp chính món của quán.
- Sửa xong chạy `npm test`, rồi push — CI/CD tự kiểm tra, build và đưa lên web, tự đổi phiên bản để máy đã cài app nhận bản mới.

## Trợ lý AI chạy thế nào

| Nơi mở trang | Trợ lý dùng | Chi phí |
|---|---|---|
| GitHub Pages / local, chưa cấu hình | Tra cứu trực tiếp trong dữ liệu công thức | Miễn phí |
| Đã dựng Worker | **Groq** (hoặc Gemini) qua Cloudflare Worker — xem [ai-proxy/README.md](ai-proxy/README.md) | Miễn phí (hạn mức của Groq) |
| Trong Claude (bản Artifact) | Tra cứu; bật công tắc “Dùng Claude” trong khung chat nếu muốn | Claude tính vào lượt của người đang xem |

## CI/CD (tự kiểm tra & tự đưa lên web)

File `.github/workflows/ci-cd.yml` chạy trên GitHub Actions:

| Khi nào | Làm gì |
|---|---|
| Mỗi lần push hoặc mở Pull Request | `npm ci` → `npm test` (dữ liệu 43 món, ảnh đủ file, Worker) → `npm run build` (bắt lỗi code React) |
| Push lên nhánh `main` và kiểm tra đạt | Tự đưa web lên **GitHub Pages** |
| Như trên, và repo có secret `CLOUDFLARE_API_TOKEN` | Tự cập nhật **AI Worker** trong `ai-proxy/` lên Cloudflare |

Kiểm tra mà lỗi thì web **không** bị cập nhật — bản đang chạy giữ nguyên.

**Bật một lần duy nhất:** repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**. Sau đó mỗi lần push, xem tiến trình ở tab **Actions**; trang có tại `https://t1ennew.github.io/congthuc/`.

**AI trực tuyến trên web:** repo → **Settings → Secrets and variables → Actions → Variables → New repository variable**: tên `AI_PROXY_URL`, giá trị là địa chỉ Worker. Lần build sau sẽ tự gắn vào.

**Tự deploy Worker (tuỳ chọn):** thêm *Secrets* `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → mẫu *Edit Cloudflare Workers*) và `CLOUDFLARE_ACCOUNT_ID`. Khoá Groq (`AI_API_KEY`) vẫn đặt trực tiếp trên Cloudflare — không đưa vào GitHub.

Trên điện thoại: mở trang → menu trình duyệt → **Thêm vào màn hình chính** để dùng như app.

## Ghi chú về nội dung

- Một số chỗ trong cẩm nang gốc có vẻ là lỗi soạn thảo (ví dụ “Đường nâu gói: 100” ở Chocolate nóng, đơn vị “Lát/Miếng” ở Olong vải hồng dưa lưới). Trang giữ nguyên ý tài liệu và hiện **ghi chú màu vàng** ở các món đó để quản lý xác nhận.
- Ảnh là ảnh chụp thật từ [Wikimedia Commons](https://commons.wikimedia.org) theo giấy phép tự do (CC0, CC BY, CC BY-SA, Public domain), minh hoạ kiểu món — không phải ảnh chụp tại quán. Tác giả & giấy phép: chạm ảnh để phóng to, hoặc trang `#nguon-anh`.
