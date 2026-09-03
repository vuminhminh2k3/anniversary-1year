# Bình Minh & Hồng Phúc 💕

Web kỉ niệm tình yêu — 4 phần kiểu "thước phim".

## Xem thử ở máy
```bash
cd /home/bachasoft/Minh/anniversary/site
python3 -m http.server 8080
# mở http://localhost:8080
```

## 4 phần
1. **Công viên** — cặp đôi trao hoa → màn mờ + khung ảnh + "Bắt đầu 07.9.2025" + xe đạp + nút next.
2. **Cây tim** — cây mọc dần (thân → cành → lá tim), rung rung. Chạm vào cây → phần 3.
3. **Gió & lá tim** — >100 lá tim (mỗi lá = 1 ảnh) bay theo gió. 10s hiện dialog *Xem tiếp / Tiếp theo*.
4. **Bức thư** — phong bì mở, dialog *Có / Không* (bấm Không → nút Có to lên), bấm Có → thư chui ra.

## Bổ sung sau (chỉ sửa 1 file `index.html`)
- **Ảnh lá tim (phần 3):** thêm đường dẫn vào mảng `PHOTOS` trong `<script>`, để ảnh trong thư mục `photos/`.
  ```js
  const PHOTOS = ["photos/1.jpg","photos/2.jpg","photos/3.jpg"];
  ```
  Để trống `[]` → dùng lá tim màu (placeholder).
- **Khung ảnh phần 1:** bỏ ảnh vào `photos/frame.jpg`, mở comment `<img>` trong `.photo-frame`.
- **Nội dung thư phần 4:** sửa text trong `<div class="letter">`.

⚠️ Ảnh gốc rất nặng (10–24MB). Nén/resize xuống ~1600px, <500KB/ảnh trước khi cho lên web.

## Đưa lên GitHub Pages (lấy link)
```bash
cd /home/bachasoft/Minh/anniversary/site
git init && git add . && git commit -m "web ki niem"
gh repo create <ten-repo> --public --source=. --push
gh api repos/{owner}/<ten-repo>/pages -X POST -f "source[branch]=main" -f "source[path]=/"
# link: https://<user>.github.io/<ten-repo>/
```
