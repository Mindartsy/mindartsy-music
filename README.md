# MINDARTSY MUSIC — Independent Music · Art · Stories

Bộ mã nguồn hoàn chỉnh của nền tảng nghe nhạc trực tuyến **MINDARTSY MUSIC** (sẵn sàng triển khai lên tên miền `mindartsy-music.vercel.app` và cài đặt thành ứng dụng trên điện thoại/máy tính).

## Triển khai trong 3 bước

1. **Tạo Database & Storage miễn phí trên Supabase (`supabase.com`):**
   - Tạo dự án mới tên `mindartsy-music`.
   - Mở **SQL Editor**, copy toàn bộ nội dung tệp `supabase/schema.sql` và bấm **Run**.
   - Vào **Project Settings -> API**, sao chép `Project URL` và `anon public` key.

2. **Đưa mã nguồn lên GitHub & Vercel (`vercel.com`):**
   - Tải toàn bộ thư mục dự án này lên một Repository trên GitHub.
   - Vào Vercel -> **Add New Project** -> chọn Repository -> đặt tên dự án là `mindartsy-music` (bạn sẽ nhận được tên miền miễn phí `https://mindartsy-music.vercel.app`).
   - Thêm 2 biến môi trường trong phần **Environment Variables**:
     - `VITE_SUPABASE_URL` = Project URL của bạn
     - `VITE_SUPABASE_ANON_KEY` = anon public key của bạn
   - Bấm **Deploy**.

3. **Upload nhạc & chia sẻ:**
   - Truy cập `https://mindartsy-music.vercel.app`, bấm **Studio / Upload** (mã PIN mặc định: `mindartsy2026`).
   - Chọn file `.mp3` / `.wav` / `.flac` và ảnh bìa, bấm **Xuất bản bài hát** và gửi link cho bạn bè nghe trực tiếp.
