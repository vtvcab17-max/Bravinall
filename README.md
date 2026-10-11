# Bravinall

Website hệ sinh thái Bravinall của Phạm Việt Hà: Antifact để thiết kế, Bravin để dựng video, Micron để mở rộng bằng AI.

| Đường dẫn | Nội dung |
|---|---|
| `site/index.html` | Trang chủ: sản phẩm, sơ đồ hệ sinh thái tương tác, khu tải về |
| `site/bravin.html` | Trang trình chiếu Bravin 4.9.1: video giới thiệu, tính năng, hệ sinh thái, so sánh, tải về |
| `site/antifact.html` | Trang Antifact 1.1: video giới thiệu, thử hoà trộn layer, trước/sau, khung, so sánh, tải về |
| `site/micron.html` | Trang Micron 1.0: video giới thiệu, thử quy trình, chợ plugin, so sánh, tải về |
| `site/micon.html`, `site/_redirects` | Chuyển đường dẫn cũ Micon sang Micron |
| `site/assets/site.css`, `site/assets/site.js` | Giao diện và phần tương tác dùng chung (trình phát video HTML, so sánh, tải về) |
| `site/assets/brand/` | Biểu tượng Bravin, Antifact, Micron |
| `site/downloads/` | File tải về đặt trên Cloudflare (mỗi file < 25 MiB) |
| `wrangler.jsonc` | Cấu hình Cloudflare Workers (phát thư mục `site/`) |

## File tải về

| File | Nơi đặt | Lý do |
|---|---|---|
| `Bravin_Setup_4.9.1.exe` (4,3 MB) | `site/downloads/` (Cloudflare) | Dưới giới hạn 25 MiB |
| `Antifact-1.1.html` (0,4 MB) | `site/downloads/` (Cloudflare) | Dưới giới hạn 25 MiB |
| `Bravin_4.9.1.apk` (28,4 MB) | GitHub Releases của repo Bravin, tag `v4.9.1` | Vượt giới hạn 25 MiB của Cloudflare Workers |
| `Micron-1.0.0.zip` (518 MB) | GitHub Releases của repo micron, tag `v1.0.0-b1` | Vượt giới hạn |

Video MP4 thật: đặt file (< 25 MiB) vào `site/media/` rồi thêm `data-video="media/ten.mp4"` vào thẻ `.promo` của trang tương ứng; nút "Xem video đầy đủ" sẽ hiện.

Trang tĩnh, không cần build. Xem thử: `cd site && python3 -m http.server 8080`.
