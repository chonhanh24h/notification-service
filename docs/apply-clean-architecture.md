# Áp dụng Clean Architecture vào Notification Service

## Vấn đề hiện tại

### 1. Đang khởi tạo trực tiếp AWS SES Client trong NotificationService
Giải pháp: 
- Tạo Email module
    - Tạo adapters folder để quản lý các email provider: AWS hoặc SendGrid
    - Tạo interface IEmailService để định nghĩa các phương thức gửi email
- Inject EmailService vào NotificationService