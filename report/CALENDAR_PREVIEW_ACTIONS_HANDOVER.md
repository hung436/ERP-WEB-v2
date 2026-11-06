# Báo cáo bàn giao

## 1. Tổng quan
- Đã chuyển nhóm số tài liệu/thảo luận và liên kết chi tiết từ footer lên dưới tiêu đề Drawer.
- Đã đồng bộ cờ tham gia đã chuẩn hóa vào dữ liệu truyền sang Drawer; giữ nguyên quy tắc chấm trạng thái.

## 2. Các route
- Giữ liên kết `/calendar/events/:id`, mở tab mới với `noopener noreferrer`.

## 3. Các tính năng đã hoàn thành
- Nhóm thao tác nằm trong header, không còn footer ở đáy Drawer.
- Người tham gia được suy ra từ dữ liệu phiếu vẫn có nút chi tiết khi mở Drawer.
- Người không tham gia vẫn xem được Drawer tóm tắt và số lượng tài liệu/thảo luận của phiếu, không được tự nâng cờ tham gia.

## 4. Kiến trúc chính
- Điều chỉnh vị trí JSX trong `CalendarEventPreviewDrawer`.
- `normalizeMeeting` giữ `isUserParticipant` và `isUserWatcher` đã tính trong `raw` để tránh dùng hai kết quả khác nhau giữa lịch và Drawer.

## 5. Mock API
- Không thay API, schema hoặc dữ liệu nghiệp vụ.

## 6. Kiểm thử
- Typecheck: `node node_modules/typescript/bin/tsc --noEmit`, exit 0 ở lượt cuối.
- ESLint ba file thay đổi chính: exit 0, 0 lỗi và 3 cảnh báo có sẵn tại `calendarWeekUtils.ts`.
- Test Drawer và thao tác header: 49 test đạt, gồm 44 test hiện có và 5 test mới.
- Test quy tắc không tham gia: một test cũ yêu cầu chặn click card đã được cập nhật theo hành vi mở Drawer xem nhanh; chạy lại file đạt 3/3 test.
- Build: `node node_modules/vite/bin/vite.js build`, exit 0, hoàn thành trong 1 phút 38 giây; còn cảnh báo bundle lớn.
- Các công cụ được gọi trực tiếp qua Node thay cho npm do hạn chế môi trường đã ghi trong báo cáo trước.

## 7. Responsive và accessibility
- Nhóm thao tác được phép xuống dòng khi thiếu chiều rộng; giữ accessible name và liên kết tab mới.
- Test xác nhận liên kết và số lượng nằm trong header, không còn footer. Chưa có visual QA trình duyệt cho lượt thay đổi này.

## 8. Các quyết định kỹ thuật
- Giữ điều kiện quyền hiện hành; sửa việc mất cờ tham gia khi chuyển dữ liệu.
- Giữ số tài liệu/thảo luận cho Phiếu công việc và Sự kiện như giao diện trước đó; không thêm số lượng mới cho Lịch họp.

## 9. Giới hạn đúng theo phạm vi
- Không thay các quy tắc vai trò khác, chấm trạng thái, API hoặc bố cục card.
- Không kết luận toàn bộ ứng dụng đã đạt nghiệm thu.

## 10. File quan trọng
- `src/features/calendar/components/CalendarEventPreviewDrawer.tsx`
- `src/features/calendar/calendarWeekUtils.ts`
- `src/features/calendar/calendar-week.css`
- `src/features/calendar/__tests__/calendarPreviewActions.test.tsx`
- `src/features/calendar/__tests__/nonAttendingEventRule.test.tsx`
