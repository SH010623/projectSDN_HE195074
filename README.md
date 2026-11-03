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

- [Node.js](https://nodejs.org/) `>= 18.x`
- [npm](https://www.npmjs.com/) `>= 9.x`
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

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

Create a `.env` file inside the `cinema-be/` directory:

```env
PORT=9999
MONGO_URI=mongodb://127.0.0.1:27017/cinema_db
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
