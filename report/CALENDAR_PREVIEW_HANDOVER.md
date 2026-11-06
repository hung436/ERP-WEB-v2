# Báo cáo bàn giao

## 1. Tổng quan

- Trạng thái: đã triển khai các thay đổi cột lịch, drawer tóm tắt và card theo các yêu cầu cập nhật trong phiên làm việc. Chưa xác nhận nghiệm thu toàn repository do lint và test toàn dự án còn lỗi.
- Giữ nguyên các thay đổi khác có sẵn/đang được cập nhật trong workspace.

## 2. Các route

- Không thêm hoặc đổi route. Xem lịch tại `/calendar/week`; liên kết chi tiết dùng `/calendar/events/:id` ở tab mới.

## 3. Các tính năng đã hoàn thành

- Bỏ Trực/Ca và nút bung/thu khỏi hai bố cục tuần. Bấm ngày mở drawer ca trực, giữ chuyển ngày trước/sau.
- Bấm card mở drawer tóm tắt trực tiếp. Tên/nội dung lịch nằm trên header; không còn dòng “Thông tin lịch”, nguồn lịch, “Đã lên lịch” hoặc Người tổ chức.
- Một mốc giờ liền cùng thứ/ngày; phiếu công việc dùng deadline khi có. Ví dụ: `16:30 · Thứ Năm, 05/11/2026`.
- Lịch họp có địa điểm/kênh họp, chủ trì và thành phần. Phiếu công việc/Sự kiện có nhãn loại/trạng thái, thực hiện/thành phần, theo dõi khi có và số tài liệu/thảo luận; không có địa điểm.
- Chỉ `isUserParticipant === true` mới thấy Xem chi tiết; người chỉ theo dõi không có nút này.
- Chấm trạng thái chỉ ở lịch cá nhân: APPROVED xanh #10b981, PENDING cam #f59e0b, REJECTED đỏ #ef4444. SCHEDULED không có chấm. Chấm điều chỉnh chỉ ở lịch chung.
- Card không hiển thị Chủ trì; drawer lịch họp vẫn giữ thông tin này. Sao đã quan tâm màu vàng #f59e0b, chưa quan tâm màu xám. Nút sao tách khỏi nút mở card và không chồng chấm điều chỉnh.

## 4. Kiến trúc chính

- Drawer tóm tắt riêng trong feature calendar; dữ liệu tiếp tục đi từ page/service qua props.
- Hàm dùng chung xác định chấm trạng thái được dùng ở drawer và hai loại card.
- Không đổi schema, không thêm thư viện.

## 5. Mock API

- Không thay đổi endpoint hoặc fixture ca trực. Số tài liệu/thảo luận lấy từ dữ liệu phiếu hiện có; drawer không hiển thị nội dung tệp/bình luận.

## 6. Kiểm thử

- `npm run typecheck`: exit 0.
- `npm run lint`: exit 1; lượt kiểm tra toàn repository ghi nhận 78 errors, 126 warnings. Không tắt rule để vượt kiểm tra.
- ESLint riêng bốn file giao diện/test của lượt sửa cuối: exit 0, 0 errors, 3 cảnh báo unused trong CalendarEventCard hiện có.
- `npm run test -- src/features/calendar/__tests__/calendarPreview.test.tsx`: exit 0, **44/44 tests passed** ở lượt cuối.
- `npm run test -- --bail=1`: exit 1; dừng tại test “chấm liên tục, cập nhật tổng điểm tức thì và ghi chú bằng modal” của module Đánh giá lao động. Không phải kết quả đạt toàn bộ test suite.
- `npm run build`: exit 0; có cảnh báo kích thước bundle lớn.
- `git diff --check`: không có lỗi whitespace.
- Log thực thi: `calendar-validation-typecheck.log`, `calendar-validation-lint.log`, `calendar-validation-scoped-lint.log`, `calendar-validation-preview.log`, `calendar-validation-test.log`, `calendar-validation-build.log` tại root workspace.

## 7. Responsive và accessibility

- Đã rà desktop và tablet 768 px; drawer rộng 460 px, tối đa viewport, không tràn ngang.
- Đã xác minh trực tiếp giờ/ngày cùng dòng (cùng tọa độ dọc); line-height 24 px, row-gap 16 px, nhãn–nội dung cách 4 px.
- Đã xác minh màu ngôi sao đang chọn bằng computed style: rgb(245, 158, 11); không đè chấm điều chỉnh.
- Nút quan tâm dùng button riêng, aria-pressed, hỗ trợ Enter/Space; không kích hoạt mở card. Drawer có nút đóng có tên truy cập và trả focus sau khi đóng.

## 8. Các quyết định kỹ thuật

- Quy tắc hiển thị được điều chỉnh theo các yêu cầu mới nhất của người dùng, thay cho các chi tiết cũ trong kế hoạch (header bằng tên lịch, một mốc giờ, không Người tổ chức/Đã lên lịch).
- Dùng CSS có phạm vi theo drawer/card; loại icon sao khỏi rule ép màu trung tính thay vì ép màu toàn bộ icon.
- Giữ nút chi tiết ở footer; phiếu công việc/Sự kiện vẫn có dòng đếm tài liệu/thảo luận khi người dùng chỉ theo dõi.

## 9. Giới hạn đúng theo phạm vi

- Không thêm backend, dữ liệu nghiệp vụ, route hay chức năng xử lý phiếu mới.
- Không sửa các lỗi lint/test ngoài phần việc này để tuyên bố đạt toàn repository.

## 10. File quan trọng

- `src/features/calendar/components/CalendarEventPreviewDrawer.tsx`
- `src/features/calendar/components/WeekColumns.tsx`, `WeekTimeline.tsx`, `CalendarEventCard.tsx`, `DayScheduleDrawer.tsx`
- `src/features/calendar/CalendarWeekPage.tsx`, `calendarWeekUtils.ts`, `calendar-week.css`
- `src/features/calendar/__tests__/calendarPreview.test.tsx`, `__tests__/fixtures/previewEvents.ts`
- `README.md`
