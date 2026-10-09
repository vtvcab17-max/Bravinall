# Bravinall

Website của Phạm Việt Hà: trang chủ Bravinall, trang giới thiệu Bravin dạng trình chiếu, và hai trang Micon, Antifact (sắp ra mắt).

| Đường dẫn | Nội dung |
|---|---|
| `site/index.html` | Trang chủ Bravinall |
| `site/bravin.html` | Trang trình chiếu tính năng Bravin, cuối trang có link tải |
| `site/micon.html`, `site/antifact.html` | Trang sắp ra mắt |
| `site/assets/` | CSS dùng chung, biểu tượng |
| `site/downloads/` | `Bravin_4.1.apk` (Android), `Bravin_Setup_4.1.exe` (Windows) |
| `wrangler.jsonc` | Cấu hình đưa lên Cloudflare Workers (phát thư mục `site/`) |

Trang tĩnh, không cần build. Xem thử trên máy: `cd site && python3 -m http.server 8080`.

Cloudflare giới hạn mỗi file 25 MiB; file APK hiện 25,7 MB (24,5 MiB).
