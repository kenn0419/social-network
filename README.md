# Social Network

Dự án **Social Network** là một nền tảng mạng xã hội được phát triển với kiến trúc client-server, bao gồm backend viết bằng Java và frontend sử dụng TypeScript.

## 📁 Cấu trúc dự án

- `api/`: Thư mục chứa mã nguồn backend (sử dụng Spring Boot).
- `web/`: Thư mục chứa mã nguồn frontend (sử dụng React kết hợp với Typescript).

## 🚀 Tính năng chính

- Đăng ký và đăng nhập người dùng
- Tạo và quản lý bài viết
- Viết comment và phản hồi các comment
- Kết bạn và quản lý danh sách bạn bè
- Gửi và nhận tin nhắn
- Thông báo thời gian thực

## 🛠️ Công nghệ sử dụng

- **Backend**: Java (57.1%)
- **Frontend**: TypeScript (41.7%)
- **Other**: 1.2%
- **Cơ sở dữ liệu**: MySQL
- **Công nghệ khác**: Websocket, Redis
- **Quản lý phiên bản**: Git

## ⚙️ Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/kenn0419/social-network.git
```

### 2. Cài đặt backend
cd social-network/api
#### Cài đặt các phụ thuộc và chạy ứng dụng
mvn install  
mvn spring-boot:run

### 3. Cài đặt frontend
cd social-network/web  
npm install  
npm run dev
