# Thiết lập NGINX HTTPS Backend & Deploy Frontend Vercel

Hướng dẫn này sẽ giúp bạn biến tên miền miễn phí mới trên Namecheap thành điểm cầu HTTPs xịn xò cho Backend trên EC2, và cách đưa mã nguồn Frontend lên nền tảng Vercel Vĩ đại.

---

## Phần 1: Cấu hình SSL HTTPS cho Backend trên EC2

Giả sử IP máy ảo EC2 của bạn là `123.45.67.89` và tên miền vừa đăng ký ở Namecheap là `leaselink.me`.

### Bước 1.1: Trỏ IP ở Namecheap (DNS)
1. Đăng nhập Namecheap, vào **Domain List** -> chọn tên miền -> **Manage**.
2. Chuyển sang thẻ **Advanced DNS**.
3. Thêm 1 bản ghi mới (Add New Record): 
   - Type: `A Record`
   - Host: `api` (Nghĩa là ta dùng sub-domain `api.leaselink.me` cho backend)
   - Value: `<IP_Của_EC2>` (ví dụ: `123.45.67.89`)
4. Lưu lại (chấu tích xanh). Sẽ mất khoảng vài phút đến 1 tiếng để DNS lan toả.

### Bước 1.2: Cài Nginx & Certbot trên EC2
*Lưu ý: Mở cổng TCP 80 & 443 trên AWS Security Group trước khi thực hiện bước này!*

1. Đăng nhập SSH vào server Ubuntu EC2.
2. Cài NGINX và Certbot (Let's encrypt):
   ```bash
   sudo apt update
   sudo apt install nginx -y
   sudo apt install certbot python3-certbot-nginx -y
   ```
3. Tạo file cấu hình reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/leaselink
   ```
4. Copy đoạn mã này dán vào (nhớ đổi `api.leaselink.me` thành domain thật của bạn):
   ```nginx
   server {
       listen 80;
       server_name api.leaselink.me;

       location / {
           proxy_pass http://localhost:8080; # Trỏ về Docker container
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
5. Kích hoạt và kiểm tra cấu hình:
   ```bash
   sudo ln -s /etc/nginx/sites-available/leaselink /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
6. **Bật HTTPS miễn phí tự động bằng Certbot:**
   ```bash
   sudo certbot --nginx -d api.leaselink.me
   ```
   *Quá trình sẽ hỏi Email của bạn (để báo khi sắp hết hạn) và hỏi có muốn Redirect HTTP sang HTTPS không (Nhấn 2 để đồng ý Redirect 100%).*
7. XONG. Bây giờ backend của bạn có thể gọi từ `https://api.leaselink.me`.

---

## Phần 2: Deploy Frontend lên Vercel

Bước này cực kỳ nhanh chóng và nhét túi.

1. **Chuẩn bị Code (Github):** 
   Frontend phải được cam kết vào một kho lưu trữ Github (Private hay Public đều được). Đảm bảo source web tĩnh (thư mục frontend) đã yên ổn ở trên đó.
   
2. **Khởi tạo Vercel:**
   - Đăng nhập [Vercel.com](https://vercel.com/) bằng chính tài khoản Github.
   - Bấm **"Add New..."** ở góc phải -> Chọn **Project**.
   - Vercel sẽ đề xuất các kho trên Github của bạn. Bấm **"Import"** bên cạnh thư mục chứa `LeaseLink Frontend`.

3. **Cấu hình môi trường (Quan trọng nhất):**
   - Tại màn hình config trước khi bấm Deploy, cuộn xuống mở phần **Environment Variables**.
   - Khai báo một biến mới nối mây với Backend URL:
     - **Key:** `VITE_API_BASE_URL`
     - **Value:** `https://api.leaselink.me/` *(tên miền bạn vừa thiết lập bằng certbot ở phần 1).*
   - Ở máy backend của chúng ta (`.env`), bây giờ bạn phải mở `.env` phía EC2 và thêm URL biến `FRONTEND_URL` ngược để Backend cho phép Request CORS từ Vercel này tới: 
     - Mở con VPS gõ `nano /home/ubuntu/leaselink-backend/.env`, điền: `FRONTEND_URL=https://<tên-miền-vercel-cấp.vercel.app>` kèm các môi trường local dự phòng nếu có. (Nếu mới deploy lần đầu chưa biết tên miền vercel cấp là gì thì phải đợi Vercel làm xong, lấy tên miền qua sửa file `.env` bật EC2 lại `docker compose down && docker compose up -d`).

4. Nhấn nút xanh **"Deploy"**. Đợi Vercel chép mã nguồn, cấu hình NodeJs v20 và Render Tailwind.
5. Sau ~1 phút, màn hình sẽ pháo hoa "Congratulations!". 
Bạn có thể ra ứng dụng kiểm thử chức năng Đăng ký tài khoản/Bất động sản để xem đường viền data mượt mà chạy qua HTTPS!
