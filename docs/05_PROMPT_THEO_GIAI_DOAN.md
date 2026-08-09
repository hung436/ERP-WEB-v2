# Bộ prompt theo từng giai đoạn cho Codex

> Dùng các prompt này sau khi Codex đã đọc prompt tổng.
>
> Chạy lần lượt. Không nên yêu cầu Codex làm toàn bộ trong một lần nếu muốn kiểm soát chất lượng.

---

# Prompt 1 — Khởi tạo dự án

Hãy khởi tạo dự án React + TypeScript + Vite cho ERP nội bộ.

Yêu cầu:

- Cài Tailwind CSS.
- Cài Ant Design.
- Cài React Router.
- Cài MSW.
- Cài Vitest và React Testing Library.
- Cài ESLint.
- Thiết lập alias `@/`.
- Tạo cấu trúc source theo feature:
  - auth
  - dashboard
  - tasks
  - calendar
  - chat
  - mail
  - announcements
- Tạo các thư mục app, layouts, mocks, routes, services, styles, types, utils.
- Tạo lệnh:
  - dev
  - build
  - lint
  - test
  - typecheck
- Chưa triển khai UI chi tiết.
- Chạy typecheck và lint.
- Báo cáo các file đã tạo và quyết định kỹ thuật.

Không thay đổi stack.

---

# Prompt 2 — Design system và app shell

Dựa trên tài liệu yêu cầu, hãy xây design system cơ bản và app shell.

Yêu cầu:

- Font Inter.
- Brand red `#D92D20`.
- Không dùng đỏ diện rộng.
- Tạo CSS variables hoặc token module.
- Cấu hình Ant Design theme.
- Xây:
  - Sidebar.
  - Header.
  - Content layout.
  - Navigation active state.
  - Tablet collapsed sidebar.
  - Page container.
  - Page header.
  - Shared loading state.
  - Shared empty state.
  - Shared error state.
  - 404 page.
- Routes:
  - `/`
  - `/tasks`
  - `/calendar`
  - `/chat`
  - `/mail`
  - `/announcements`
- Tạm thời route có thể render placeholder có cấu trúc.
- Không làm giống admin template cũ.
- Không dùng shadow nặng.
- Không biến mọi khu vực thành card.
- Có focus state và accessibility cơ bản.
- Chạy typecheck, lint và test hiện có.

---

# Prompt 3 — Authentication

Hãy triển khai authentication giả lập.

Tài khoản:

```text
nhanvien
123456
```

Yêu cầu:

- Trang `/login`.
- UI hiện đại, nghiêm túc, sáng.
- Form username/password.
- Validation.
- Loading state.
- Error state.
- Mock API:
  - POST `/api/auth/login`
  - GET `/api/auth/me`
  - POST `/api/auth/logout`
- Session giả lập bằng localStorage hoặc sessionStorage.
- Protected route.
- Người chưa đăng nhập quay về `/login`.
- Đăng nhập thành công chuyển về `/`.
- Đăng xuất quay về `/login`.
- Không cần quên mật khẩu.
- Không cần ghi nhớ đăng nhập.
- Thêm test:
  - đăng nhập đúng
  - đăng nhập sai
  - protected route
  - đăng xuất
- Chạy typecheck, lint và test.

---

# Prompt 4 — Mock API và dữ liệu mẫu

Hãy triển khai mock API đầy đủ bằng MSW.

Yêu cầu:

- Không hard-code dữ liệu trong component.
- Tạo type TypeScript.
- Tạo fixtures riêng.
- Tạo handlers riêng.
- API:
  - auth
  - dashboard
  - tasks
  - calendar
  - chat
  - mail
  - announcements
- Dữ liệu bằng tiếng Việt.
- Dữ liệu hợp lý.
- Có đủ trạng thái, mức độ và ngày giờ.
- Hỗ trợ pagination hoặc filter ở các API cần thiết.
- Hỗ trợ mô phỏng loading, empty và error bằng query hoặc cấu hình dev.
- Tối thiểu:
  - 12 công việc
  - 8 sự kiện
  - 8 cuộc trò chuyện
  - 15 mail
  - 10 thông báo
- Chạy typecheck, lint và test.

---

# Prompt 5 — Trang chủ

Hãy xây trang chủ ERP.

Bố cục:

## Khối chính

1. Công việc cần xử lý.
2. Thông báo cơ quan.
3. Truy cập nhanh.

## Khối phụ

4. Lịch hôm nay.
5. Mail và Chat chưa đọc.

Yêu cầu:

- Công việc là khối lớn nhất.
- Công việc hiển thị tiêu đề, mức ưu tiên, hạn, trạng thái, người giao.
- Thông báo hiển thị tiêu đề, đơn vị, ngày, mức độ.
- Không dùng thumbnail ảnh.
- Không giống trang tin.
- Truy cập nhanh gồm 5 module với icon và màu nhận diện nhẹ.
- Lịch hôm nay hiển thị giờ, tên, địa điểm/kênh.
- Mail/chat hiển thị count và item gần nhất.
- Có nút “Xem tất cả” hoặc link hợp lý.
- Dữ liệu từ mock API.
- Có loading, skeleton, empty và error.
- Responsive desktop và tablet từ 768 px.
- Không dark mode.
- Thêm test render dashboard và ít nhất một UI state.
- Chạy typecheck, lint và test.

---

# Prompt 6 — Module Công việc

Hãy xây module Công việc tại `/tasks`.

Yêu cầu:

- Page header.
- Summary:
  - Tổng công việc.
  - Sắp đến hạn.
  - Quá hạn.
  - Hoàn thành.
- Filter:
  - Trạng thái.
  - Mức ưu tiên.
  - Hạn xử lý.
- Bảng hoặc list có tính thẩm mỹ cao.
- Pagination giả lập.
- Không CRUD.
- Dữ liệu qua mock API.
- Loading, skeleton, empty, error.
- Responsive từ 768 px.
- Thêm test filter cơ bản.
- Chạy typecheck, lint và test.

---

# Prompt 7 — Module Lịch

Hãy xây module Lịch làm việc tại `/calendar`.

Yêu cầu:

- Chế độ Hôm nay và Tuần.
- Filter loại sự kiện.
- Hiển thị thời gian, tên, địa điểm/kênh và người tổ chức.
- Không cần tạo, sửa hoặc xoá.
- Dữ liệu qua mock API.
- Loading, skeleton, empty, error.
- Responsive từ 768 px.
- Chạy typecheck, lint và test.

---

# Prompt 8 — Module Chat

Hãy xây module Chat tại `/chat`.

Yêu cầu:

- Danh sách hội thoại.
- Search.
- Badge chưa đọc.
- Preview tin cuối.
- Online indicator nếu có.
- Khung hội thoại read-only.
- Không realtime.
- Không gửi tin.
- Dữ liệu qua mock API.
- Loading, skeleton, empty, error.
- Responsive từ 768 px.
- Chạy typecheck, lint và test.

---

# Prompt 9 — Module Mail

Hãy xây module Mail tại `/mail`.

Yêu cầu:

- Danh sách mail.
- Filter:
  - Tất cả.
  - Chưa đọc.
  - Gắn sao.
- Hiển thị người gửi, tiêu đề, preview, thời gian.
- Nội dung thư read-only.
- Không gửi hoặc trả lời.
- Dữ liệu qua mock API.
- Loading, skeleton, empty, error.
- Responsive từ 768 px.
- Thêm test filter cơ bản.
- Chạy typecheck, lint và test.

---

# Prompt 10 — Module Thông báo

Hãy xây module Thông báo cơ quan tại `/announcements`.

Yêu cầu:

- List hoặc table.
- Filter:
  - Tất cả.
  - Quan trọng.
  - Mới nhất.
- Hiển thị tiêu đề, đơn vị phát hành, ngày, mức độ, trạng thái đọc.
- Drawer hoặc trang chi tiết read-only.
- Không CRUD.
- Không trình bày như trang tin.
- Dữ liệu qua mock API.
- Loading, skeleton, empty, error.
- Responsive từ 768 px.
- Chạy typecheck, lint và test.

---

# Prompt 11 — Rà soát cuối

Hãy rà soát toàn bộ dự án như một senior frontend engineer và UI reviewer.

Kiểm tra:

- TypeScript.
- ESLint.
- Unit test.
- Build.
- Protected route.
- Đăng xuất.
- Mock API.
- Không hard-code dữ liệu nghiệp vụ trong component.
- Responsive desktop/tablet.
- Không tối ưu mobile dưới 768 px.
- Không dark mode.
- Accessibility cơ bản.
- Focus state.
- Contrast.
- Empty/error/loading/skeleton.
- Sự nhất quán của spacing, typography, radius, border và icon.
- Đỏ chỉ được dùng có kiểm soát.
- Không có UI giống trang tin.
- Không có card thừa.
- Không có shadow nặng.
- Không có gradient sặc sỡ.

Sau đó:

1. Sửa mọi lỗi phát hiện.
2. Viết hoặc cập nhật README.
3. Liệt kê các điểm đã hoàn thành.
4. Liệt kê giới hạn còn lại đúng với phạm vi.
5. Không đề xuất mở rộng phạm vi trong lần triển khai này.
