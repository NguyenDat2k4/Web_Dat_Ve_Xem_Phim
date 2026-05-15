# 🎬 CineMax - Hệ Thống Đặt Vé Xem Phim Trực Tuyến

CineMax là một ứng dụng web hiện đại được xây dựng bằng Next.js, cung cấp trải nghiệm đặt vé xem phim mượt mà, chuyên nghiệp và đầy đủ tính năng cho cả người dùng và quản trị viên.

## 🚀 Tính Năng Chính

### 👤 Dành cho Khách hàng
- **Khám phá Điện ảnh**: Xem danh sách phim đang chiếu, phim đánh giá cao và gợi ý theo sở thích.
- **Đặt vé Thông minh**:
  - Đặt vé nhanh (Quick Booking) ngay tại trang chủ.
  - Chọn ghế theo thời gian thực (Real-time Seat Selection).
  - Tích hợp chọn Combo bắp nước tiện lợi.
- **Thanh toán Đa dạng**: Hỗ trợ mô phỏng thanh toán qua VNPay và MoMo.
- **Quản lý Cá nhân**:
  - Hồ sơ người dùng với hệ thống tích điểm và thăng hạng thành viên (Silver, Gold, Diamond).
  - Xem lại lịch sử đặt vé và quản lý vé điện tử qua mã QR.
  - Danh sách phim yêu thích (Watchlist).
- **Hệ thống Tài khoản Bảo mật**:
  - Xác thực email khi đăng ký.
  - Quên mật khẩu và đặt lại qua email.
- **Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh.
- **🤖 Trợ lý ảo Hibiki Cine (AI)**:
  - Hỗ trợ giải đáp thắc mắc về phim, rạp và lịch chiếu 24/7.
  - **Voice Assistant**: Giao tiếp bằng giọng nói (Speech-to-Text & Text-to-Speech).
  - Tích hợp tra cứu dữ liệu thời gian thực từ Database.

### 🔐 Dành cho Quản trị viên (Admin)
- **Tổng quan Hệ thống**: Dashboard thống kê doanh thu, vé bán và hoạt động.
- **Quản lý Phim**: Thêm, sửa, xóa phim, quản lý trailer và thông tin chi tiết.
- **Quản lý Rạp & Phòng**: Cấu hình rạp chiếu và sơ đồ ghế ngồi linh hoạt.
- **Lịch chiếu**: Sắp xếp suất chiếu thông minh, tránh trùng lịch.
- **Quản lý Người dùng**: Phân quyền (Admin, Staff, User), quản lý điểm và trạng thái tài khoản.
- **Quản lý Đơn hàng**: Theo dõi trạng thái đặt vé và doanh thu.
- **Soát vé QR**: Ứng dụng quét mã QR để check-in khách hàng tại rạp.
- **📈 AI Analytics Dashboard**:
  - Phân tích doanh thu, tỷ lệ lấp đầy rạp tự động bằng AI.
  - Đưa ra nhận xét chiến lược và dự báo kinh doanh.
  - Xuất báo cáo PDF chuyên nghiệp chỉ với một lần nhấn.
- **Marketing**: Quản lý tin tức, sự kiện và các chương trình khuyến mãi.

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion (Animations).
- **AI Engine**: Google Gemini AI (SDK `@google/generative-ai`), Function Calling.
- **Backend**: Next.js API Routes, Socket.io (Real-time).
- **Database**: MongoDB (Mongoose).
- **Xác thực**: JWT (Jose), Bcryptjs.
- **Dịch vụ**: Nodemailer (Gửi email), QR Code Generator.
- **UI Components**: Radix UI, Shadcn/UI, Lucide Icons, Sonner (Toast).

## 📦 Cài Đặt & Chạy Dự Án

### 1. Yêu cầu hệ thống
- Node.js 20.x trở lên
- MongoDB (Local hoặc Atlas)

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo tệp `.env.local` tại thư mục gốc và cấu hình các biến sau:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cấu hình Email (SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cấu hình VNPay/MoMo (Tùy chọn)
VNP_TMN_CODE=...
VNP_HASH_SECRET=...

# Cấu hình Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Khởi tạo tài khoản Admin
Chạy script sau để tạo tài khoản admin mặc định (`admin@cinemax.com` / `admin123`):
```bash
npx tsx scripts/seed-admin.ts
```

### 5. Chạy dự án
```bash
npm run dev
```
Truy cập: `http://localhost:3000`

## 🌍 Triển khai Production (AWS Cloud)

Dự án hiện đã được triển khai chính thức trên nền tảng **AWS (Amazon Web Services)**.

- **Hosting**: AWS EC2 (Ubuntu 24.04 LTS).
- **Địa chỉ IP tĩnh (Elastic IP)**: `100.49.206.10`
- **Tên miền ảo (Dùng cho OAuth)**: [http://100.49.206.10.nip.io:3000](http://100.49.206.10.nip.io:3000)
- **Công nghệ triển khai**: Docker & Docker Compose (Multi-container architecture).

### Cấu trúc hạ tầng Docker:
- **`cinemax-web`**: Next.js App chạy ở chế độ Standalone (Port 3000).
- **`cinemax-socket`**: Socket.io Server xử lý thời gian thực (Port 3001).
- **`mongodb`**: Cơ sở dữ liệu NoSQL lưu trữ dữ liệu phim và người dùng.

### 🛠 Hướng Dẫn Vận Hành & Cập Nhật

#### 1. Cập nhật Code mới từ máy local:
1. Tại máy tính: Nén code (trừ `node_modules` và `.next`) thành `cinemax.zip`.
2. Đẩy file lên server: `scp -i "key.pem" cinemax.zip ubuntu@100.49.206.10:~/`
3. Tại server chạy chuỗi lệnh:
   ```bash
   cd ~/cinemax && unzip -o ../cinemax.zip && docker compose up -d --build
   ```

#### 2. Các lệnh quản trị thông dụng:
- **Xem Log lỗi thực tế**: `docker compose logs -f web`
- **Khởi động lại toàn bộ**: `docker compose restart`
- **Truy cập Database**: `docker exec -it mongodb mongosh cinemax`
- **Dọn dẹp bộ nhớ (Khi ổ cứng đầy)**: `docker system prune -a`

## 📝 Giấy Phép
Dự án được phát triển cho mục đích học tập và tham khảo.

---
© 2026 CineMax Team. Triển khai thành công trên AWS bởi Antigravity AI.
