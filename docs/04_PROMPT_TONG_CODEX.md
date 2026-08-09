# Prompt tổng giao cho Codex

Bạn là senior frontend engineer kiêm UI engineer. Hãy xây dựng một ứng dụng ERP nội bộ hoàn chỉnh ở mức frontend demo sản phẩm thật, dựa trên toàn bộ yêu cầu dưới đây.

## 1. Mục tiêu

Xây dựng một **không gian làm việc nội bộ**, không phải trang tin, không phải báo điện tử và không phải dashboard chỉ để xem.

Người dùng phải nhìn thấy công việc cần xử lý ngay sau khi đăng nhập, đồng thời có thể xem thông báo, mở nhanh module, theo dõi lịch hôm nay và thấy mail/chat chưa đọc.

## 2. Stack bắt buộc

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Ant Design.
- React Router.
- MSW hoặc mock API tương đương.
- Vitest.
- React Testing Library.
- ESLint.
- Font Inter.

Không thay đổi stack nếu không có lý do kỹ thuật bắt buộc.

## 3. Phạm vi

Xây dựng:

- Trang đăng nhập.
- Mock authentication.
- Protected route.
- Đăng xuất.
- App shell gồm sidebar, header và content area.
- Trang chủ.
- Module Công việc.
- Module Lịch làm việc.
- Module Chat.
- Module Mail.
- Module Thông báo cơ quan.
- Trang 404.
- Loading, skeleton, empty và error state.
- Responsive desktop và tablet từ 768 px.
- Unit test cho các phần quan trọng.
- README.

Không xây dựng:

- Backend thật.
- Database thật.
- CRUD hoàn chỉnh.
- Chat realtime.
- Gửi tin nhắn.
- Gửi hoặc trả lời mail.
- Tạo/sửa/xoá lịch.
- Dark mode.
- Mobile dưới 768 px.
- Phân quyền chi tiết.
- CRM, nhân sự, nghỉ phép, phê duyệt hoặc quy trình bài viết.

## 4. Tài khoản demo

```text
Tên đăng nhập: nhanvien
Mật khẩu: 123456
```

## 5. Routes

```text
/login
/
/tasks
/calendar
/chat
/mail
/announcements
/*
```

## 6. Trang chủ

Bố cục gồm:

### Ba khối chính

1. Công việc cần xử lý.
2. Thông báo cơ quan.
3. Truy cập nhanh.

### Hai khối phụ

4. Lịch hôm nay.
5. Mail và Chat chưa đọc.

Công việc phải là khối ưu tiên lớn nhất.

Không được trình bày thông báo như trang tin. Không dùng ảnh thumbnail lớn.

## 7. Năm module

### Công việc

- Thống kê tổng quan.
- Bộ lọc trạng thái, ưu tiên, hạn xử lý.
- Bảng hoặc list.
- Pagination giả lập.
- Không CRUD.

### Lịch

- Chế độ hôm nay và tuần.
- Bộ lọc loại sự kiện.
- Không CRUD.

### Chat

- Danh sách hội thoại.
- Tìm kiếm.
- Badge chưa đọc.
- Khung hội thoại read-only.
- Không realtime và không gửi tin.

### Mail

- Danh sách.
- Filter tất cả, chưa đọc, gắn sao.
- Nội dung thư read-only.
- Không gửi/trả lời.

### Thông báo

- Danh sách.
- Filter tất cả, quan trọng, mới nhất.
- Drawer hoặc trang chi tiết read-only.
- Không CRUD.

## 8. Design direction

- Hiện đại.
- Nghiêm túc.
- Sáng.
- Gọn.
- Tin cậy.
- Thân thiện.
- Gần tinh thần Google Workspace.
- Phù hợp môi trường cơ quan.
- Mật độ thông tin cân bằng.

Không:

- Hero banner.
- Gradient sặc sỡ.
- Shadow nặng.
- Đỏ diện rộng.
- Animation phô trương.
- Card ở mọi nơi.
- Giao diện kiểu báo điện tử.
- Admin template cũ.

## 9. Màu sắc

```text
Brand Red: #D92D20
Brand Red Hover: #B42318
Brand Red Active: #912018
Brand Red Soft: #FEF3F2

Text Primary: #1D2939
Text Secondary: #475467
Text Muted: #667085
Border: #E4E7EC
Surface: #FFFFFF
Surface Secondary: #F9FAFB
Page Background: #F5F7FA
```

Đỏ chỉ dùng có kiểm soát cho logo, primary action, active navigation và điểm nhấn.

Màu module nhẹ:

```text
Tasks: #D92D20
Calendar: #7F56D9
Chat: #039855
Mail: #1570EF
Announcements: #DC6803
```

## 10. Kiến trúc code

Tổ chức theo feature/module. Không đặt tất cả vào một thư mục components chung.

Gợi ý:

```text
src/
  app/
  assets/
  components/
  config/
  features/
    auth/
    dashboard/
    tasks/
    calendar/
    chat/
    mail/
    announcements/
  layouts/
  mocks/
  routes/
  services/
  styles/
  types/
  utils/
```

Mỗi feature có thể gồm:

```text
api/
components/
hooks/
pages/
types/
utils/
```

## 11. Quy tắc dữ liệu

- Không hard-code dữ liệu nghiệp vụ trong component.
- Mọi dữ liệu đi qua service hoặc API hook.
- Mock API trả JSON.
- Dữ liệu bằng tiếng Việt.
- Dữ liệu giả nhưng hợp lý.
- Có thể mô phỏng loading, empty và error.

## 12. Quy tắc UI

- Tailwind dùng cho layout, spacing, typography và responsive.
- Ant Design dùng cho form, input, table, dropdown, modal, date picker, pagination, empty và skeleton.
- Không trộn style thiếu kiểm soát.
- Dùng một hệ icon chính.
- Tạo reusable components vừa đủ, không over-engineer.
- Có focus state.
- Icon-only button có aria-label hoặc tooltip.
- Không dùng màu là dấu hiệu duy nhất.

## 13. Testing

Tối thiểu kiểm thử:

- Đăng nhập đúng.
- Đăng nhập sai.
- Protected route.
- Đăng xuất.
- Render dashboard.
- Render một state loading.
- Render một state empty.
- Render một state error.
- Filter cơ bản của module Công việc hoặc Mail.
- Navigation sidebar.

## 14. Tiêu chí hoàn thành

- Chạy được theo README.
- Không lỗi TypeScript.
- Không lỗi ESLint.
- Không hard-code dữ liệu nghiệp vụ trong component.
- Dữ liệu qua mock API.
- Hoạt động tốt từ 768 px.
- Có loading, skeleton, empty và error.
- Có unit test.
- Có protected route.
- Giao diện tiếng Việt.
- Không tối ưu mobile.
- Không dark mode.

## 15. Cách làm việc

Thực hiện theo thứ tự:

1. Khởi tạo project và dependencies.
2. Tạo design tokens.
3. Tạo app shell.
4. Tạo authentication.
5. Tạo mock API.
6. Tạo dashboard.
7. Tạo 5 module.
8. Tạo tests.
9. Rà soát accessibility và responsive.
10. Viết README.
11. Chạy typecheck, lint và test.
12. Sửa tất cả lỗi trước khi kết thúc.

Không tự ý mở rộng phạm vi.

Khi gặp một quyết định nhỏ chưa được mô tả, chọn giải pháp đơn giản, nhất quán với design system và ghi lại trong README hoặc code comment ngắn. Không thay đổi các quyết định quan trọng đã được chốt.
