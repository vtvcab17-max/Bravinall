# Bravinall

Website hệ sinh thái Bravinall của Phạm Việt Hà: Antifact để thiết kế, Bravin để dựng video, Micron để mở rộng bằng AI.

| Đường dẫn | Nội dung |
|---|---|
| `site/index.html` | Trang chủ: sản phẩm, sơ đồ hệ sinh thái tương tác, khu dùng ngay |
| `site/bravin.html` | Trang trình chiếu Bravin 4.10: video giới thiệu, tính năng (có Phim AI), hệ sinh thái, so sánh, dùng ngay |
| `site/antifact.html` | Trang Antifact 1.1: video giới thiệu, thử hoà trộn layer, trước/sau, khung, so sánh, dùng ngay |
| `site/micron.html` | Trang Micron 1.0: video giới thiệu, thử quy trình, chợ plugin, so sánh, dùng ngay |
| `site/micon.html`, `site/_redirects` | Chuyển đường dẫn cũ Micon sang Micron |
| `site/assets/site.css`, `site/assets/site.js` | Giao diện và phần tương tác dùng chung (trình phát video HTML, so sánh, tải về) |
| `site/assets/brand/` | Biểu tượng Bravin, Antifact, Micron |
| `wrangler.jsonc` | Cấu hình Cloudflare Workers (phát thư mục `site/`) |

## Dùng ngay
Trang chỉ dẫn tới bản web của từng ứng dụng, không phát file cài:
- Antifact: https://antiface.vtvcab17.workers.dev/
- Bravin: https://bravin.vtvcab17.workers.dev/
- Micron: https://micron.vtvcab17.workers.dev/

Video MP4 thật: đặt file (< 25 MiB) vào `site/media/` rồi thêm `data-video="media/ten.mp4"` vào thẻ `.promo` của trang tương ứng; nút "Xem video đầy đủ" sẽ hiện.

Trang tĩnh, không cần build. Xem thử: `cd site && python3 -m http.server 8080`.
