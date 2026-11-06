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

### Lịch làm việc — xem nhanh

- Số tài liệu/thảo luận và nút Xem chi tiết nằm ngay dưới tiêu đề trong header Drawer; dữ liệu mở Drawer giữ cờ tham gia đã được chuẩn hóa để hiển thị nút nhất quán.

- Cột ngày chỉ hiển thị thứ/ngày và các sự kiện; bấm thứ/ngày để xem trực ban, ca trực và chuyển ngày trong drawer.
- Bấm sự kiện để mở drawer tóm tắt với tên/nội dung lịch ngay trên header và một mốc giờ liền cùng dòng với thứ/ngày (phiếu công việc dùng hạn xử lý nếu có). Không hiển thị dòng loại/nguồn lịch họp, Đã lên lịch hoặc Người tổ chức.
- Lịch họp hiển thị địa điểm/kênh họp, chủ trì và thành phần. Phiếu công việc/Sự kiện có nhãn loại và trạng thái, người thực hiện/tham gia, người theo dõi khi có và số tài liệu/thảo luận; không có địa điểm. Không hiển thị nội dung tệp hoặc bình luận.
- Chỉ lịch có `isUserParticipant === true` mới hiện liên kết Xem chi tiết, mở trong tab mới. Đóng drawer trả focus về nút đã mở.
- Chấm trạng thái chỉ dành cho lịch cá nhân: APPROVED xanh #10b981, PENDING cam #f59e0b, REJECTED đỏ #ef4444. SCHEDULED và các trạng thái khác không có chấm.
- Chấm Đã điều chỉnh chỉ hiện trên lịch chung. Dữ liệu ca trực và API không thay đổi.
- Card lịch không hiển thị Chủ trì; thông tin này nằm trong drawer lịch họp. Sao đã quan tâm màu vàng #f59e0b, sao chưa quan tâm màu xám; nút sao hoạt động riêng với nút mở card và không chồng chấm điều chỉnh.

Kiểm thử riêng luồng xem nhanh: `npm run test -- src/features/calendar/__tests__/calendarPreview.test.tsx`.
### Lịch làm việc — trang chi tiết

- Liên kết `/calendar/events/:id` mở trang chi tiết trong tab mới.
- Phiên đăng nhập giả lập lưu trong `localStorage` để các tab dùng chung tài khoản. Phiên cũ trong `sessionStorage` được chuyển tự động khi ứng dụng khởi tạo; đăng xuất xóa cả hai bộ nhớ và cập nhật các tab đang mở. Phiên được giữ đến khi đăng xuất hoặc xóa dữ liệu trình duyệt.
- Kiểm thử phiên giữa các tab: `npm run test -- src/features/auth/auth-session.test.tsx`.
- Trang chi tiết sử dụng trực tiếp `CalendarEventDetailModal` với `presentation="page"` và CSS drawer cũ `JobTicketDetailDrawer.css`, gồm nội dung và trao đổi bên trái, nhân sự và quy trình bên phải. Không có một giao diện dựng lại riêng cho trang.
- Chế độ drawer cũ giữ nguyên cách mở. Ở chế độ page, không hiển thị liên kết mở lại chính trang chi tiết; panel có thể thu gọn. Từ 768 đến 1023px, hai cột xếp dọc.
- Nhân sự, bước quy trình, hạn và mức ưu tiên lấy từ bản ghi lịch; trường chưa có dữ liệu hiển thị trạng thái chưa thiết lập. Mức ưu tiên là trường tùy chọn, không thay đổi dữ liệu cũ.
- Tên lịch và nhân sự được xuống dòng đầy đủ. Quy tắc chấm trạng thái hiện tại được giữ nguyên.
- Tệp upload lưu nội dung dạng data URL trong mock record để tải lại. Tệp mẫu thiếu nội dung không có nút tải khả dụng; chưa có backend lưu trữ tệp thật.
- Test panel, lỗi tải chi tiết và tải tệp: `npm run test -- src/features/calendar/__tests__/eventDetailPanel.test.tsx`.
