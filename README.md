# Sổ tay pha chế — Last Minute Cafe

Trang web giúp nhân viên học nhanh công thức đồ uống trong **Cẩm nang thức uống Last Minute Cafe**.
Thiết kế ưu tiên điện thoại, cài được lên màn hình chính như một app và dùng được khi mất mạng.

## Có gì trong trang

- **Món** — 43 món theo 10 nhóm, thu gọn theo nhóm (chạm để mở). Một ô tìm kiếm + một nút bộ lọc (nhóm, nóng/đá/đá xay, đã thuộc/chưa thuộc). Mỗi món có ảnh chụp thật (nhiều ảnh, nhiều góc), **hình ly minh hoạ** vẽ đúng các lớp trong ly, thành phần theo size M/L, packaging, các bước (chạm để đánh dấu khi tập pha), lưu ý và bán thành phẩm liên quan.
- **Học nhanh** — thẻ ghi nhớ: nhìn ảnh, tự nhẩm công thức, lật thẻ để kiểm tra; đánh dấu “Nhớ rồi / Chưa nhớ”. Tiến độ lưu trên máy.
- **Kiểm tra** — bài trắc nghiệm tự sinh từ cẩm nang: định lượng, ly/nắp/ống, thứ tự bước, bán thành phẩm, hạn dùng.
- **Bán thành phẩm** — 2 mục: *Công thức nền* (16 món, chạm để xem nguyên liệu & các bước) và *Hạn dùng* (29 nguyên liệu, chia theo tủ mát / nhiệt độ phòng / tủ đông, nhãn màu theo thời gian).
- **Bong bóng AI** — nút tròn ở góc phải, mở được trên mọi trang. Đang xem món nào thì AI tự hiểu là hỏi về món đó; câu trả lời kèm ảnh thật và hình ly.

## Trợ lý AI chạy thế nào

| Nơi mở trang | Trợ lý dùng | Chi phí |
|---|---|---|
| GitHub Pages, chưa cấu hình | Tra cứu trực tiếp trong dữ liệu công thức | Miễn phí |
| GitHub Pages, đã dựng Worker | **Groq** (hoặc Gemini) qua Cloudflare Worker — xem [ai-proxy/README.md](ai-proxy/README.md) | Miễn phí (hạn mức của Groq) |
| Trong Claude (bản Artifact) | Tra cứu; bật công tắc “Dùng Claude” trong khung chat nếu muốn | Claude tính vào lượt của người đang xem |

## Chạy trên máy (local)

Chỉ cần cài [Node.js](https://nodejs.org) (bản 18 trở lên), không cần cài thêm thư viện nào.

- **Cách dễ nhất (Windows):** bấm đúp file `chay-local.cmd` → trình duyệt tự mở `http://localhost:5173`.
- **Bằng lệnh** (trong thư mục dự án):

```bash
npm start            # chạy web tại http://localhost:5173
npm test             # kiểm tra code + dữ liệu công thức + ảnh
npm run build        # gói bản web vào dist/
npm run preview      # build rồi chạy thử đúng bản sẽ đưa lên mạng (cổng 5174)
```

Khi chạy, cửa sổ lệnh in thêm dòng `Trên điện thoại: http://192.168.x.x:5173` — mở địa chỉ đó trên điện thoại **cùng mạng Wi-Fi** để thử giao diện di động thật. Sửa file xong chỉ cần tải lại trang. Nhấn `Ctrl + C` để dừng.

Lưu ý: mở thẳng file `index.html` bằng cách bấm đúp vẫn xem được, nhưng một số tính năng (trợ lý AI trực tuyến, cài app) chỉ chạy qua server ở trên.

## CI/CD (tự kiểm tra & tự đưa lên web)

File `.github/workflows/ci-cd.yml` chạy trên GitHub Actions:

| Khi nào | Làm gì |
|---|---|
| Mỗi lần push hoặc mở Pull Request | `npm test` (cú pháp JS, dữ liệu 43 món, ảnh có đủ file, link trong trang) và `npm run build` |
| Push lên nhánh `main` và kiểm tra đạt | Tự đưa web lên **GitHub Pages** |
| Như trên, và repo có secret `CLOUDFLARE_API_TOKEN` | Tự cập nhật **AI Worker** trong `ai-proxy/` lên Cloudflare |

Kiểm tra mà lỗi (vd. món trỏ tới ảnh không tồn tại, sai định lượng theo size) thì web **không** bị cập nhật — bản đang chạy giữ nguyên.

**Bật một lần duy nhất:** repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**. Sau đó mỗi lần push, xem tiến trình ở tab **Actions**; trang có tại `https://t1ennew.github.io/congthuc/`.

**Tự deploy Worker (tuỳ chọn):** repo → **Settings → Secrets and variables → Actions → New repository secret**:
- `CLOUDFLARE_API_TOKEN`: tạo ở Cloudflare → My Profile → API Tokens → mẫu *Edit Cloudflare Workers*.
- `CLOUDFLARE_ACCOUNT_ID`: xem ở trang Workers & Pages của Cloudflare (cột bên phải).

Khoá Groq (`AI_API_KEY`) vẫn đặt trực tiếp trên Cloudflare như hướng dẫn ở `ai-proxy/README.md` — không đưa vào GitHub.

Trên điện thoại: mở trang → menu trình duyệt → **Thêm vào màn hình chính** để dùng như app.

## Sửa công thức, thêm ảnh

- **Công thức**: sửa `assets/js/data.js` (mỗi món một khối, có chú thích cách ghi).
- **Ảnh**: đặt ảnh vào `images/drinks/full/` (rộng ~960px) và `images/drinks/thumb/` (rộng ~480px) cùng tên file, rồi khai báo trong `assets/js/photos.js`. Nên thay dần bằng ảnh chụp chính món của quán.
- Sửa xong chạy `npm test` để kiểm tra, rồi push — CI/CD tự đưa lên web và tự đổi phiên bản để máy đã cài app nhận bản mới.

## Ghi chú về nội dung

- Một số chỗ trong cẩm nang gốc có vẻ là lỗi soạn thảo (ví dụ “Đường nâu gói: 100” ở Chocolate nóng, đơn vị “Lát/Miếng” ở Olong vải hồng dưa lưới). Trang giữ nguyên ý tài liệu và hiện **ghi chú màu vàng** ở các món đó để quản lý xác nhận.
- Ảnh là ảnh chụp thật từ [Wikimedia Commons](https://commons.wikimedia.org) theo giấy phép tự do (CC0, CC BY, CC BY-SA, Public domain), minh hoạ kiểu món — không phải ảnh chụp tại quán. Danh sách tác giả & giấy phép xem trong trang, mục **Nguồn ảnh** (`#nguon-anh`).
