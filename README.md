# Sổ tay pha chế — Last Minute Cafe

Trang web giúp nhân viên học nhanh công thức đồ uống trong **Cẩm nang thức uống Last Minute Cafe**.
Thiết kế ưu tiên điện thoại, cài được lên màn hình chính như một app và dùng được khi mất mạng.

## Có gì trong trang

- **Món** — 43 món theo 10 nhóm. Mỗi món có ảnh chụp thật (nhiều ảnh, nhiều góc), **hình ly minh hoạ** vẽ đúng các lớp trong ly, thành phần theo size M/L, packaging, các bước (chạm để đánh dấu khi tập pha), lưu ý và bán thành phẩm liên quan.
- **Học nhanh** — thẻ ghi nhớ: nhìn ảnh, tự nhẩm công thức, lật thẻ để kiểm tra; đánh dấu “Nhớ rồi / Chưa nhớ”. Tiến độ lưu trên máy.
- **Kiểm tra** — bài trắc nghiệm tự sinh từ cẩm nang: định lượng, ly/nắp/ống, thứ tự bước, bán thành phẩm, hạn dùng.
- **Hỏi AI** — hỏi bất kỳ điều gì về món; câu trả lời kèm ảnh thật và hình ly của món được nhắc tới.
- **Bán thành phẩm** — 16 công thức nền (trà, trà sữa, milk foam, thạch, cold brew…) và bảng date nguyên vật liệu có ô tìm kiếm.

## Trợ lý AI chạy thế nào

| Nơi mở trang | Trợ lý dùng |
|---|---|
| Trong Claude (bản Artifact) | Claude, không cần cấu hình |
| GitHub Pages / máy cá nhân, đã cấu hình Worker | Claude qua Cloudflare Worker của bạn — xem [ai-proxy/README.md](ai-proxy/README.md) |
| GitHub Pages / máy cá nhân, chưa cấu hình | Chế độ offline: tra cứu trực tiếp trong dữ liệu công thức |

## Đưa lên GitHub Pages

1. Vào repo trên GitHub → **Settings** → **Pages**.
2. *Source*: **Deploy from a branch** → Branch **main**, thư mục **/ (root)** → **Save**.
3. Sau 1–2 phút trang có tại `https://t1ennew.github.io/congthuc/`.

Trên điện thoại: mở trang → menu trình duyệt → **Thêm vào màn hình chính** để dùng như app.

## Chạy trên máy

Mở thư mục bằng một web server tĩnh bất kỳ, ví dụ:

```bash
npx serve .
```

## Sửa công thức, thêm ảnh

- **Công thức**: sửa `assets/js/data.js` (mỗi món một khối, có chú thích cách ghi).
- **Ảnh**: đặt ảnh vào `images/drinks/full/` (rộng ~960px) và `images/drinks/thumb/` (rộng ~480px) cùng tên file, rồi khai báo trong `assets/js/photos.js`. Nên thay dần bằng ảnh chụp chính món của quán.
- Sau khi sửa, tăng `VERSION` trong `sw.js` để máy đã cài app nhận bản mới.

## Ghi chú về nội dung

- Một số chỗ trong cẩm nang gốc có vẻ là lỗi soạn thảo (ví dụ “Đường nâu gói: 100” ở Chocolate nóng, đơn vị “Lát/Miếng” ở Olong vải hồng dưa lưới). Trang giữ nguyên ý tài liệu và hiện **ghi chú màu vàng** ở các món đó để quản lý xác nhận.
- Ảnh là ảnh chụp thật từ [Wikimedia Commons](https://commons.wikimedia.org) theo giấy phép tự do (CC0, CC BY, CC BY-SA, Public domain), minh hoạ kiểu món — không phải ảnh chụp tại quán. Danh sách tác giả & giấy phép xem trong trang, mục **Nguồn ảnh** (`#nguon-anh`).
