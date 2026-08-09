# ERP Internal Workspace — Codex Implementation Kit

Bộ tài liệu này dùng để giao cho Codex triển khai phiên bản đầu của website ERP nội bộ.

## Thứ tự sử dụng khuyến nghị

1. Đọc `01_PLAN_TRIEN_KHAI.md`.
2. Đọc `02_KIEN_TRUC_VA_DESIGN_SYSTEM.md`.
3. Đọc `03_MOCK_API_SCHEMA.md`.
4. Dán `04_PROMPT_TONG_CODEX.md` vào Codex để Codex hiểu toàn bộ bối cảnh.
5. Thực hiện lần lượt các prompt trong `05_PROMPT_THEO_GIAI_DOAN.md`.
6. Đối chiếu kết quả với `06_CHECKLIST_NGHIEM_THU.md`.

## Phạm vi phiên bản đầu

- Tạo dự án mới hoàn toàn.
- React + TypeScript + Vite.
- Tailwind CSS + Ant Design.
- React Router.
- Mock API trả dữ liệu JSON.
- Trang đăng nhập.
- Protected route.
- App shell gồm sidebar, header và content area.
- Trang chủ.
- 5 module:
  - Công việc.
  - Lịch làm việc.
  - Chat.
  - Mail.
  - Thông báo cơ quan.
- Responsive desktop và tablet từ 768 px.
- Chỉ giao diện sáng.
- Không cần backend thật.
- Không tối ưu cho điện thoại dưới 768 px.

## Tài khoản demo

```text
Tên đăng nhập: nhanvien
Mật khẩu: 123456
```

## Nguyên tắc sản phẩm

Đây là một **không gian làm việc nội bộ**, không phải trang tin, không phải báo điện tử và không phải dashboard chỉ để xem số liệu.

Người dùng phải nhìn thấy công việc cần xử lý và có thể mở nhanh các công cụ liên quan ngay sau khi đăng nhập.
