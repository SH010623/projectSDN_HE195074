# 🎬 SDN302 Cinema Project

Full-stack Cinema application built with **React (Vite + TypeScript)** on the frontend and **Express.js + MongoDB** on the backend, using **JWT** for authentication.

---

## 📁 Project Structure

```
SDN302_cinema/
├── cinema-be/        # Backend – Express.js + MongoDB + JWT
└── cinema-fe/        # Frontend – React + Vite + TypeScript
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) `20.19.x` hoặc `>= 22.12.0` (theo yêu cầu Vite)
- [npm](https://www.npmjs.com/) `>= 9.x`
- [MongoDB](https://www.mongodb.com/) Atlas hoặc local replica set (cần cho transaction thanh toán)

---

## 🚀 Backend Setup (`cinema-be`)

### 1. Navigate to backend folder

```bash
cd cinema-be
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy mẫu cấu hình rồi điền thông tin thật (file `.env` không được đưa lên Git):

```bash
cp .env.example .env
```

Các biến cơ bản:

```env
PORT=9999
MONGO_URI=mongodb://127.0.0.1:27017/cinema_db?replicaSet=rs0
JWT_SECRET=your_secret_key_here
```

> ⚠️ Replace `cinema_db` with your desired database name and `your_secret_key_here` with any secret string.

### 4. Run the backend server

```bash
npm start
```

Server will be running at: `http://localhost:9999`

---

## 🖥️ Frontend Setup (`cinema-fe`)

### 1. Navigate to frontend folder

```bash
cd cinema-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---
### Email OTP cho quên mật khẩu

Thêm cấu hình SMTP vào `cinema-be/.env` rồi khởi động lại backend:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Cinema <your-email@gmail.com>"
```

Với Gmail, dùng App Password của tài khoản đã bật xác minh hai bước.
Không commit thông tin đăng nhập SMTP.

- `POST /forgot-password` với `{ "email": "..." }`: gửi OTP, cũng dùng để gửi lại sau 60 giây.
- `POST /reset-password` với `{ "email": "...", "otp": "123456", "newPassword": "..." }`: xác thực OTP và đổi mật khẩu.
- OTP hết hạn sau 5 phút, tối đa 5 lần thử, chỉ dùng một lần. Gửi lại sẽ thay thế mã cũ. Database chỉ lưu mã đã băm.

## Thanh toán SePay qua QR chuyển khoản

Luồng mới: tạo đơn `pending` → giữ ghế tối đa 5 phút → quét QR → webhook xác thực tiền vào → `confirmed`/`paid` → gửi email. Trình duyệt không có API tự xác nhận đã thanh toán. Voucher giảm đơn về 0 được xác nhận trực tiếp mà không cần chuyển tiền.

### Cấu hình backend

Thêm vào `cinema-be/.env` (xem `.env.example`, không ghi đè cấu hình hiện có):

```env
SEPAY_ACCOUNT_NUMBER=0123456789
SEPAY_BANK=MB
SEPAY_ACCOUNT_NAME=NGUYEN VAN A
SEPAY_WEBHOOK_API_KEY=your-webhook-api-key
```

`SEPAY_ACCOUNT_NUMBER` là tài khoản nhận đã liên kết trên SePay, giữ nguyên số 0 đầu. `SEPAY_BANK` là mã ngân hàng/bin/short name dùng tạo VietQR (ví dụ `MB`, `VCB`). `SEPAY_ACCOUNT_NAME` là tên chủ tài khoản để hiển thị. `SEPAY_WEBHOOK_API_KEY` phải khớp API Key ở phần xác thực webhook SePay; không phải API Token dùng truy vấn ngân hàng. Không đưa key này lên frontend.

Backend dùng MongoDB transaction để cập nhật vé, voucher và giao dịch cùng lúc. `MONGO_URI` cần trỏ tới **MongoDB Atlas hoặc replica set**; MongoDB standalone không hỗ trợ. Các unique index khoá ghế và ID giao dịch được tạo trước khi server nhận request.

### Thêm lịch chiếu mẫu

Trong thư mục `cinema-be`, chạy `npm run seed:showtimes` để bổ sung lịch cho 7 ngày tới theo giờ Việt Nam. Script giữ nguyên lịch/vé hiện có, bỏ giờ đã qua và các khung giờ trùng phòng. Nếu chưa có phim đang chiếu hoặc phòng hoạt động, script tạo dữ liệu mẫu để thử đặt vé.

### Chạy local với SePay

1. Sau khi sửa `.env`, dừng backend bằng `Ctrl + C` rồi chạy lại trong thư mục `cinema-be`:

   ```bash
   npm run dev
   ```

2. Mở terminal khác. Trên macOS có Homebrew, nếu chưa có ngrok, cài một lần và thêm authtoken lấy từ [ngrok Dashboard](https://dashboard.ngrok.com/get-started/your-authtoken):

   ```bash
   brew install ngrok
   ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
   ```

   Sau đó chạy:

   ```bash
   ngrok http 9999
   ```

3. Copy URL HTTPS ngrok cấp, ví dụ `https://abc.ngrok-free.app`. Trên SePay → **Webhooks → Thêm webhook**, điền:

   - URL: `https://abc.ngrok-free.app/payments/sepay/webhook` (thay bằng URL của bạn).
   - Sự kiện: **Có tiền vào**, chọn tài khoản đã liên kết.
   - Định dạng: **JSON**.
   - Xác thực: **API Key**, nhập đúng giá trị `SEPAY_WEBHOOK_API_KEY` trong `.env`.
   - Tắt bộ lọc yêu cầu mã thanh toán nếu chưa cấu hình quy tắc nhận diện.

4. Giữ backend và ngrok đang chạy. Mở web, tạo đơn để kiểm tra QR và trạng thái thanh toán. Ngrok đổi URL thì cập nhật lại webhook.

### Chạy trên máy khác

1. Clone/copy source, chạy `npm install` trong cả `cinema-be` và `cinema-fe`.
2. Tạo `cinema-be/.env` từ `.env.example`, điền MongoDB, JWT, SMTP và SePay. Nếu dùng Atlas, cho phép IP máy mới trong **Network Access**. API Key phải trùng cấu hình webhook trên SePay.
3. Chạy `npm run dev` ở mỗi thư mục bằng hai terminal riêng. Frontend hiện gọi `http://localhost:9999` trong `cinema-fe/src/config/api.ts`.
4. Cài ngrok, thêm authtoken trên máy mới rồi chạy `ngrok http 9999` ở terminal thứ ba. Windows/Linux cài theo [hướng dẫn ngrok](https://ngrok.com/download).
5. Nếu URL public thay đổi, sửa webhook SePay thành `https://URL-NGROK-MOI/payments/sepay/webhook`. Giữ backend và ngrok chạy, gửi thử webhook để kiểm tra HTTP 200.
6. Nếu cần lịch mới, chạy `npm run seed:showtimes` trong `cinema-be`. Dùng chung database Atlas thì dữ liệu cũ đã có sẵn, không cần tạo lại tài khoản/phim.

**Ngrok** tạo đường dẫn public cho máy local; chạy local không cần Nginx. Khi deploy lên server có domain HTTPS cố định, có thể dùng **Nginx** làm reverse proxy, đổi API base của frontend sang backend đã deploy và cập nhật webhook theo domain đó. Một webhook trỏ tới một backend; chuyển sang máy mới thì webhook không còn gửi tới máy cũ.

### Đối soát và giới hạn

- Chỉ xác nhận khi giao dịch tiền vào, đúng tài khoản nhận, đúng số tiền, mã đơn duy nhất và đơn còn hạn. Mỗi `id` giao dịch chỉ xử lý một lần; webhook trả `{ "success": true }` cho giao dịch đã xử lý.
- Không hỗ trợ cộng dồn nhiều lần chuyển. Sai số tiền, đơn hết hạn/đã hủy hoặc chuyển thêm vào đơn đã trả tiền được lưu để đối soát, không cấp lại ghế đã giải phóng.
- Admin xem sổ giao dịch qua `GET /payments/admin/transactions?outcome=review` hoặc `outcome=unmatched` với JWT admin. Có phân trang `page`, mỗi trang 50 giao dịch. Giao dịch không nhận diện mã cũng được lưu.
- Chưa tích hợp API hoàn tiền tự động. Vé SePay đã nhận tiền cần rạp xử lý huỷ/hoàn tiền thủ công; hệ thống không tự đổi sang `refunded` khi chưa có hoàn tiền thật.
- Job chạy mỗi 15 giây giải phóng đơn hết hạn và thử lại email lỗi; trạng thái job được lưu trong database để tiếp tục sau khi backend khởi động lại. Email SMTP có thể gửi lặp nếu tiến trình bị dừng ngay sau khi gửi nhưng trước khi ghi nhận thành công.

Tài liệu: [Webhook SePay](https://docs.sepay.vn/tich-hop-webhooks.html), [xác thực API Key](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc), [tạo QR](https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code).
