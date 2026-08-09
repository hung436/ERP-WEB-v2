# ERP nội bộ Tuổi Trẻ

Không gian làm việc số frontend dành cho nhân viên và lãnh đạo. Giao diện được xây dựng bằng React, TypeScript, Vite, Tailwind CSS và Ant Design; dữ liệu chạy qua lớp mock API trong trình duyệt.

## Chạy dự án

Yêu cầu Node.js 20+ và npm 10+.

```bash
npm install
npm run dev
```

Ứng dụng mặc định chạy tại `http://localhost:4173`.

Tài khoản demo:

```text
Tên đăng nhập: nhanvien
Mật khẩu: 123456
```

## Kiểm tra chất lượng

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Routes

- `/login`: đăng nhập.
- `/`: trang chủ workspace.
- `/tasks`: công việc.
- `/documents`: tạo đơn nghỉ phép/phiếu đề xuất đi nước ngoài, theo dõi quy trình và duyệt hoặc từ chối từng cấp bằng mock API.
- `/evaluations`: đánh giá lao động theo quý, gồm tự đánh giá, chấm điểm nhiều cấp, chấm nhanh nhiều phiếu và lịch sử công bố bằng mock API.
- `/calendar`: họp trực tuyến, lịch họp, phản hồi tham gia và xem chi tiết phòng họp.
- `/announcements`: thông báo cơ quan.
- `/chat`: chat, gửi tệp, reply, reaction, ghim và quản lý nhóm bằng mock API.
- `/mail`: hộp thư ba vùng, tìm kiếm, thư mục, nhãn, soạn thư, Cc/Bcc, đính kèm, bản nháp, trả lời, trả lời tất cả, chuyển tiếp, gắn sao, lưu trữ, spam và thùng rác bằng mock API.
- `/directory`: danh bạ, tìm kiếm, lọc phòng ban và mở chat trực tiếp.
- `/personnel/profile`: hồ sơ nhân sự read-only với đầy đủ thông tin lý lịch cá nhân qua mock API.
- `/*`: trang 404 trong app shell.

## Mô phỏng trạng thái dữ liệu

Thêm query vào route bảo vệ để kiểm tra UI state:

- `?state=loading`
- `?state=empty`
- `?state=error`

Ví dụ: `/tasks?state=empty`.

Mock API của hồ sơ cá nhân: `GET /api/personnel/profile`. Endpoint hỗ trợ các query state chung ở trên.

## Giới hạn

Ứng dụng không có backend/database thật, realtime, WebSocket hoặc gọi thoại/video. Các thao tác gửi chat, Mail, tạo đơn, tải tệp, tạo/tham gia họp và cập nhật phiếu đánh giá chỉ ghi nhận trong mock API và được đặt lại khi tải lại ứng dụng. Không tối ưu bắt buộc cho màn hình dưới 768px.
