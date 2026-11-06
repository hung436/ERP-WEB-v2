# Báo cáo bàn giao

## 1. Tổng quan
- Trạng thái: phần trang chi tiết và panel phải đã triển khai, qua kiểm tra kỹ thuật trong phạm vi này. Chưa nghiệm thu toàn bộ module lịch hoặc toàn ứng dụng.
- Phạm vi: tiếp tục Task 3 & 6, phần tên/nội dung ở trang chi tiết, tải tệp, xử lý lỗi và kiểm thử. Theo xác nhận mới nhất của người giao việc, card/Drawer do một luồng khác tiếp tục xử lý; không thay đổi quy tắc chấm trạng thái mới.

## 2. Các route
- Giữ route `/calendar/events/:id` và các alias chi tiết hiện có. Không thêm route mới trong lượt triển khai này.

## 3. Các tính năng đã hoàn thành
- Panel nhân sự và vai trò: tổ chức, chủ trì, thực hiện, duyệt, tham vấn, theo dõi; hiển thị tên đầy đủ và avatar.
- Quy trình được sắp theo thứ tự bước, hiển thị trạng thái, người xử lý, hạn và mức ưu tiên nếu có dữ liệu.
- Nút đóng/mở panel, cập nhật `aria-expanded`; thu gọn để nội dung chính chiếm toàn bộ chiều rộng.
- Thời gian trang chi tiết có giờ bắt đầu/kết thúc; hỗ trợ ngày kết thúc khác ngày bắt đầu.
- Upload giữ nội dung tệp bằng data URL; tải lại nội dung thật. Tệp mẫu thiếu URL không báo tải thành công giả.
- Lỗi gửi ý kiến, upload và sao chép liên kết có thông báo rõ ràng; không thêm dữ liệu thành công giả khi API upload/gửi ý kiến lỗi.
- Thêm tên truy cập cho ô trao đổi và lý do không duyệt. Liên kết nhãn trình soạn nội dung thông báo với textbox.

## 4. Kiến trúc chính
- `CalendarEventDetailPage` quản lý tải dữ liệu và thao tác.
- `EventDetailPanel` trình bày vai trò và quy trình theo dữ liệu sự kiện.
- `attachmentUtils` dùng chung cho trang chi tiết và danh sách tài liệu.
- Bổ sung kiểu cụ thể thay cho `any` trong các phần lịch đã rà soát, không tắt rule lint hoặc type checking.

## 5. Mock API
- Sử dụng API chi tiết, bình luận và đính kèm hiện có; không thêm backend.
- `CalendarEvent.priority` là trường tùy chọn dùng cùng kiểu ưu tiên hiện có; dữ liệu cũ tiếp tục hợp lệ.
- Dữ liệu không được cung cấp hiển thị “Chưa chỉ định” hoặc “Chưa thiết lập”, không tạo quy trình hoặc nhân sự giả trong component.

## 6. Kiểm thử
Các lệnh tương đương được chạy trực tiếp qua Node vì môi trường không cung cấp `npm/npx` trên PATH và chặn truy cập npm trong Program Files.

| Kiểm tra | Lệnh thực tế | Kết quả cuối |
|---|---|---|
| Typecheck | `node node_modules/typescript/bin/tsc --noEmit` | Exit 0 |
| ESLint lịch và trình soạn nội dung | `node node_modules/eslint/bin/eslint.js src/features/calendar src/components/RichTextEditor.tsx --ext .ts,.tsx -f json -o calendar-detail-lint.json` | Exit 0; 0 lỗi, 34 cảnh báo |
| Test trang chi tiết và tối ưu đọc | `node node_modules/vitest/vitest.mjs run src/features/calendar/__tests__/eventDetailPanel.test.tsx src/features/calendar/__tests__/calendarOptimization.test.tsx` | 2 file, 13/13 test đạt, exit 0 |
| Build | `node node_modules/vite/bin/vite.js build` | Exit 0; build 36,60 giây |

- Test bao gồm đóng/mở panel bằng bàn phím, tên dài, thứ tự quy trình, hạn, lỗi tải/thử lại, upload thành công/thất bại, tải tệp và chặn URL không hợp lệ.
- Lượt lint toàn dự án ghi nhận 78 lỗi và 126 cảnh báo ngoài module lịch. Lượt test toàn dự án ghi nhận lỗi tại module Đánh giá lao động và đã dừng; không có kết luận toàn suite đạt.
- Test toàn lịch đã dừng sau khi xác nhận card/Drawer đang được sửa ở luồng khác. Kết quả 13 test ở trên là bộ kiểm tra độc lập cho phần bàn giao này.
- Build có cảnh báo bundle lớn; không thay cấu hình để giấu cảnh báo.
- Log đã lưu tại `C:/Users/hung/.codex/visualizations/2026/11/05/01a1aabb-047e-7b81-a195-0d86fbc49161/calendar-detail-verification/`.

## 7. Responsive và accessibility
- Desktop: hai cột 7:3. Trong khoảng tablet 768–1023px: panel xuống dưới nội dung chính, tránh ép bề rộng.
- Panel có tên ngữ nghĩa, heading, nút điều khiển bằng bàn phím và trạng thái mở/đóng cho công cụ hỗ trợ.
- Chưa xác minh trực quan bằng trình duyệt: công cụ mở local gặp connection refused/timeout. Không kết luận visual QA desktop/tablet đã đạt.

## 8. Các quyết định kỹ thuật
- Giữ stack và API hiện tại. Trường ưu tiên bổ sung là tùy chọn, không thay schema bắt buộc.
- Tệp upload giữ nội dung trong mock record của phiên chạy hiện tại; không bổ sung dịch vụ lưu tệp hoặc cơ chế lưu trữ lâu dài.
- Không ghi đè các thay đổi đồng thời ở card/Drawer, authentication và các module khác.

## 9. Giới hạn đúng theo phạm vi
- Không có backend lưu trữ tệp thật; dữ liệu mock có thể đặt lại khi tải lại ứng dụng.
- Card/Drawer và quy tắc chấm mới tiếp tục do luồng khác phụ trách theo xác nhận của người giao việc.
- Toàn ứng dụng chưa đủ điều kiện nghiệm thu do lỗi lint/test ngoài phạm vi và chưa có visual QA.

## 10. File quan trọng
- `src/features/calendar/CalendarEventDetailPage.tsx`
- `src/features/calendar/CalendarEventDetailPage.css`
- `src/features/calendar/components/EventDetailPanel.tsx`
- `src/features/calendar/attachmentUtils.ts`
- `src/features/calendar/__tests__/eventDetailPanel.test.tsx`
- `README.md`
