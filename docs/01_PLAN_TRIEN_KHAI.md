# Kế hoạch triển khai ERP nội bộ

## 1. Mục tiêu sản phẩm

Xây dựng một không gian làm việc nội bộ có tính thẩm mỹ cao, đơn giản, logic và hướng tới hiệu quả xử lý công việc.

Sản phẩm cần giúp người dùng:

- Nhìn thấy ngay công việc cần xử lý.
- Theo dõi thông báo cơ quan.
- Truy cập nhanh các module thường dùng.
- Nắm lịch làm việc trong ngày.
- Nhìn thấy mail và tin nhắn chưa đọc.
- Hạn chế thao tác không cần thiết.

## 2. Đối tượng sử dụng

- Nhân viên.
- Phóng viên.
- Trưởng phòng.
- Lãnh đạo.

Trong phiên bản đầu, tất cả vai trò dùng chung một bố cục và cùng loại nội dung. Chưa triển khai phân quyền hoặc dashboard riêng theo vai trò.

## 3. Phạm vi

### 3.1 Bao gồm

- Trang đăng nhập.
- Xác thực giả lập.
- Protected route.
- Đăng xuất.
- App shell hoàn chỉnh.
- Trang chủ.
- Module Công việc.
- Module Lịch làm việc.
- Module Chat.
- Module Mail.
- Module Thông báo cơ quan.
- Mock API.
- Dữ liệu giả lập bằng tiếng Việt.
- Loading state.
- Skeleton state.
- Empty state.
- Error state.
- Responsive desktop và tablet từ 768 px.
- Accessibility cơ bản.
- Unit test cho các phần quan trọng.
- README hướng dẫn chạy.

### 3.2 Không bao gồm

- Backend thật.
- Database thật.
- CRUD hoàn chỉnh.
- Chat realtime.
- Đồng bộ mail thật.
- Gửi hoặc trả lời mail.
- Gửi tin nhắn.
- Tạo, sửa hoặc xoá lịch.
- Phân quyền chi tiết.
- Dark mode.
- Mobile dưới 768 px.
- CRM.
- Quản lý nhân sự.
- Nghỉ phép.
- Phê duyệt.
- Đánh giá lao động.
- Quy trình bài viết của phóng viên.
- Meeting độc lập.

## 4. Thứ tự ưu tiên trang chủ

### Khối chính

1. Công việc cần xử lý.
2. Thông báo cơ quan.
3. Truy cập nhanh.

### Khối phụ

4. Lịch hôm nay.
5. Mail và Chat chưa đọc.

## 5. Các giai đoạn triển khai

### Giai đoạn 1 — Khởi tạo nền tảng

- Khởi tạo Vite React TypeScript.
- Cài Tailwind CSS.
- Cài Ant Design.
- Cài React Router.
- Cài MSW hoặc mock API tương đương.
- Cài Vitest và React Testing Library.
- Thiết lập ESLint.
- Thiết lập alias import.
- Tạo cấu trúc thư mục theo module.

### Giai đoạn 2 — Design system và app shell

- Khai báo design tokens.
- Thiết lập theme Ant Design.
- Xây sidebar.
- Xây header.
- Xây content layout.
- Xây responsive tablet.
- Xây trang 404.
- Xây shared states.

### Giai đoạn 3 — Authentication

- Trang đăng nhập.
- Mock API đăng nhập.
- Session giả lập.
- Protected route.
- Đăng xuất.
- Loading và error state.

### Giai đoạn 4 — Trang chủ

- Khối công việc.
- Khối thông báo.
- Khối truy cập nhanh.
- Khối lịch hôm nay.
- Khối mail/chat chưa đọc.
- Responsive layout.
- Mock API tổng hợp dashboard.

### Giai đoạn 5 — Năm module

- Công việc.
- Lịch.
- Chat.
- Mail.
- Thông báo.
- Mỗi module có dữ liệu mẫu, bộ lọc cơ bản và các UI state.
- Không có CRUD.

### Giai đoạn 6 — Kiểm thử và hoàn thiện

- Unit test.
- Accessibility.
- Responsive review.
- Kiểm tra TypeScript.
- Kiểm tra ESLint.
- Kiểm tra mock API.
- Kiểm tra hard-code.
- README.
- Checklist nghiệm thu.

## 6. Definition of Done

Một hạng mục chỉ được xem là hoàn thành khi:

- Chạy được.
- Không có lỗi TypeScript.
- Không có lỗi ESLint.
- Không hard-code dữ liệu nghiệp vụ trong component.
- Dữ liệu đi qua service hoặc mock API.
- Có loading, empty và error state phù hợp.
- Hoạt động tốt từ 768 px trở lên.
- Có keyboard focus rõ ràng.
- Giao diện tiếng Việt.
- Dữ liệu giả lập hợp lý.
- Không phá vỡ design system.
