# Dispatch Log

## 2026-11-04T17:19:06Z
Sender: d153aebd-a73e-4e1a-8f59-bed494796733
Priority: MESSAGE_PRIORITY_HIGH

Nghiên cứu giải pháp thiết kế UI/UX cải tiến và triển khai mã nguồn thử nghiệm (code prototype) cho các ô nhập "Thời gian" và "Chọn thành phần" tại các modal tạo lịch họp và phiếu công việc trong phân hệ Lịch làm việc (`/calendar/week`) của ERP Báo Tuổi Trẻ.

Working directory: d:\tuoitreproject\ERP-WEB-v2
Integrity mode: development

## Requirements

### R1. Đề xuất thiết kế và triển khai prototype ô "Thời gian"
Cung cấp giải pháp chọn thời gian trực quan, thao tác nhanh, hỗ trợ các nhu cầu thực tế:
- Thiết lập nhanh ngày giờ thông qua các preset phổ biến ("Hôm nay", "Ngày mai", ngày trong tuần tới).
- Lựa chọn khung giờ và khoảng thời lượng linh hoạt (30 phút, 45 phút, 60 phút,...).
- Tích hợp phản hồi/cảnh báo trực quan khi phát hiện trùng lịch sự kiện.
- Thay thế hoặc nâng cấp trải nghiệm DatePicker/TimePicker hiện tại trong `CreatePersonalMeetingModal.tsx`, `CreateEditorialMeetingModal.tsx` và modal tạo phiếu công việc (Booking / Job Ticket).

### R2. Đề xuất thiết kế và triển khai prototype ô "Chọn thành phần"
Cung cấp giải pháp chọn thành viên tham gia, người duyệt và người theo dõi:
- Cho phép tìm kiếm và phân loại nhanh theo phòng ban/ban chuyên môn tòa soạn.
- Hiển thị danh sách và tag đã chọn kèm avatar và thông tin định danh rõ ràng.
- Gợi ý nhóm người hoặc đồng nghiệp thường xuyên cộng tác để hạn chế thao tác gõ tìm kiếm thủ công.
- Tích hợp trực tiếp vào các modal tạo lịch và tạo phiếu công việc liên quan.

### R3. Tuân thủ Design System và Chuẩn mực Anti-AI UI
Toàn bộ thiết kế giao diện và component triển khai phải tuân thủ nghiêm ngặt quy định Design System Báo Tuổi Trẻ:
- Phong cách hiện đại, nghiêm túc, thanh lịch, tạo cảm giác sản phẩm thật được thiết kế chuyên nghiệp.
- Tuyệt đối không dùng kiểu `border-left` trang trí để đánh dấu trạng thái hay phân loại.
- Hạn chế tối đa đóng khung lồng nhau (`box-in-box`), ưu tiên danh sách phẳng, khoảng trắng và phân cấp chữ.
- Màu đỏ thương hiệu `#D92D20` chỉ dùng có kiểm soát cho điểm nhấn và hành động chính, không phủ diện rộng.

## Acceptance Criteria

### Trải nghiệm người dùng và Tương tác (UX/UI)
- [ ] Ô "Thời gian" trong các modal mục tiêu cho phép người dùng chọn nhanh ngày (hôm nay, ngày mai), chọn thời lượng (30p, 45p, 60p,...) và hiển thị phản hồi trực quan khi phát hiện trùng lịch.
- [ ] Ô "Chọn thành phần" cho phép lọc/chọn người theo phòng ban tòa soạn, hiển thị avatar + họ tên trong danh sách/tag đã chọn, và có khu vực hiển thị danh sách người/nhóm thường xuyên làm việc cùng.
- [ ] Giao diện tuân thủ tuyệt đối quy tắc Anti-AI: không tồn tại thuộc tính `border-left` trang trí; các mục không bị bọc khung viền đa tầng bên trong modal; màu đỏ `#D92D20` chỉ xuất hiện ở các điểm nhấn chính.

### Kiểm thử kỹ thuật và Mã nguồn
- [ ] Prototype hoạt động tương tác mượt mà trực tiếp trên giao diện của các modal tương ứng tại route `/calendar/week`.
- [ ] Dự án vượt qua các lệnh kiểm tra tiêu chuẩn mà không phát sinh lỗi mới: `npm run typecheck`, `npm run lint`, và `npm run build`.
