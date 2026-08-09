# HỢP ĐỒNG THI CÔNG FRONTEND ERP NỘI BỘ DÀNH CHO CODEX

> Tài liệu này là **hợp đồng kỹ thuật và hợp đồng thực thi** giữa Người giao việc và Codex.
>
> Đây không phải hợp đồng pháp lý dân sự. Đây là văn bản ràng buộc phạm vi, cách triển khai, tiêu chuẩn chất lượng, quy tắc nghiệm thu và hành vi làm việc của Codex trong quá trình thi công source code.
>
> Khi nhận tài liệu này, Codex phải xem toàn bộ nội dung là yêu cầu bắt buộc, trừ các mục được ghi rõ là “khuyến nghị”.

---

# I. THÔNG TIN CÔNG VIỆC

## Điều 1. Tên dự án

**Website ERP nội bộ — Không gian làm việc dành cho nhân viên và lãnh đạo**

## Điều 2. Bên giao việc

Người dùng giao nhiệm vụ triển khai dự án thông qua Codex.

## Điều 3. Bên thực hiện

Codex, trong vai trò:

- Senior Frontend Engineer.
- UI Engineer.
- Software Architect ở phạm vi frontend.
- QA reviewer cho phần việc đã triển khai.

## Điều 4. Mục tiêu dự án

Codex phải xây dựng một ứng dụng ERP nội bộ có các đặc tính:

- Có tính thẩm mỹ cao.
- Đơn giản.
- Logic.
- Nghiêm túc.
- Hiện đại.
- Thân thiện.
- Có mật độ thông tin cân bằng.
- Hướng trực tiếp tới hiệu quả xử lý công việc.
- Người dùng đăng nhập xong phải nhìn thấy ngay công việc cần xử lý.
- Người dùng có thể truy cập nhanh các công cụ thường dùng.
- Giao diện phải tạo cảm giác như một sản phẩm thật, không phải bản demo sơ sài.

Ứng dụng là một **không gian làm việc nội bộ**, không được thiết kế giống:

- Trang tin.
- Báo điện tử.
- Landing page.
- Admin template cũ.
- Dashboard chỉ để xem biểu đồ hoặc KPI.

---

# II. TÀI LIỆU CÓ GIÁ TRỊ RÀNG BUỘC

## Điều 5. Bộ tài liệu nguồn

Codex phải đọc và tuân thủ các file sau nếu chúng tồn tại trong repository:

```text
00_README.md
01_PLAN_TRIEN_KHAI.md
02_KIEN_TRUC_VA_DESIGN_SYSTEM.md
03_MOCK_API_SCHEMA.md
04_PROMPT_TONG_CODEX.md
05_PROMPT_THEO_GIAI_DOAN.md
06_CHECKLIST_NGHIEM_THU.md
HOP_DONG_THI_CONG_CODEX_ERP.md
```

## Điều 6. Thứ tự ưu tiên khi tài liệu có mâu thuẫn

Nếu xuất hiện mâu thuẫn, áp dụng thứ tự ưu tiên sau:

1. `HOP_DONG_THI_CONG_CODEX_ERP.md`
2. `04_PROMPT_TONG_CODEX.md`
3. `02_KIEN_TRUC_VA_DESIGN_SYSTEM.md`
4. `03_MOCK_API_SCHEMA.md`
5. `01_PLAN_TRIEN_KHAI.md`
6. `06_CHECKLIST_NGHIEM_THU.md`
7. Các file còn lại

Codex không được tự ý dung hòa mâu thuẫn bằng cách mở rộng phạm vi.

Nếu mâu thuẫn ảnh hưởng đến kiến trúc, dữ liệu, UI hoặc nghiệm thu, Codex phải:

1. Dừng tại phần bị ảnh hưởng.
2. Nêu rõ hai yêu cầu đang mâu thuẫn.
3. Đề xuất một phương án ưu tiên.
4. Không tự triển khai quyết định quan trọng khi chưa có cơ sở trong tài liệu.

---

# III. PHẠM VI THI CÔNG

## Điều 7. Công nghệ bắt buộc

Codex phải sử dụng:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Ant Design.
- React Router.
- MSW hoặc một lớp mock API tương đương.
- Vitest.
- React Testing Library.
- ESLint.
- Font Inter.

Codex không được đổi framework, bundler hoặc ngôn ngữ nếu không có yêu cầu mới từ Người giao việc.

## Điều 8. Phạm vi bắt buộc phải triển khai

### 8.1 Authentication

- Trang đăng nhập.
- Mock API đăng nhập.
- Validation.
- Loading state.
- Error state.
- Session giả lập.
- Protected route.
- Đăng xuất.

### 8.2 App shell

- Sidebar.
- Header.
- Content area.
- Active navigation.
- Responsive tablet.
- Avatar và menu tài khoản.
- Trang 404.

### 8.3 Trang chủ

Ba khối chính:

1. Công việc cần xử lý.
2. Thông báo cơ quan.
3. Truy cập nhanh.

Hai khối phụ:

4. Lịch hôm nay.
5. Mail và Chat chưa đọc.

### 8.4 Năm module

- Công việc.
- Lịch làm việc.
- Chat.
- Mail.
- Thông báo cơ quan.

### 8.5 Trạng thái giao diện

Mỗi khu vực lấy dữ liệu phải có các trạng thái phù hợp:

- Loading.
- Skeleton.
- Empty.
- Error.
- Success.

### 8.6 Responsive

- Desktop.
- Tablet từ 768 px.
- Không bắt buộc tối ưu cho màn hình dưới 768 px.

### 8.7 Kiểm thử

Phải có unit test hoặc integration test cho các phần quan trọng được quy định tại Điều 38.

## Điều 9. Các nội dung ngoài phạm vi

Codex không được tự ý triển khai:

- Backend thật.
- Database thật.
- CRUD hoàn chỉnh.
- Chat realtime.
- Gửi tin nhắn.
- Đồng bộ mail thật.
- Gửi hoặc trả lời mail.
- Tạo, sửa hoặc xoá lịch.
- Dark mode.
- Mobile dưới 768 px.
- Phân quyền chi tiết.
- CRM.
- Quản lý nhân sự.
- Nghỉ phép.
- Phê duyệt.
- Đánh giá lao động.
- Meeting độc lập.
- Quy trình bài viết của phóng viên.
- Biểu đồ hoặc KPI không được yêu cầu.
- Hệ thống notification realtime.
- WebSocket.
- State management library phức tạp nếu chưa cần thiết.

Việc tự ý mở rộng phạm vi được xem là vi phạm hợp đồng thi công.

---

# IV. YÊU CẦU CHỨC NĂNG

## Điều 10. Tài khoản demo

```text
Tên đăng nhập: nhanvien
Mật khẩu: 123456
```

## Điều 11. Routes bắt buộc

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

## Điều 12. Quy tắc authentication

- Người chưa đăng nhập truy cập route bảo vệ phải được chuyển về `/login`.
- Đăng nhập đúng chuyển về `/`.
- Đăng nhập sai phải hiển thị lỗi rõ ràng.
- Đăng xuất phải xóa session giả lập.
- Sau đăng xuất phải chuyển về `/login`.
- Không cần “Quên mật khẩu”.
- Không cần “Ghi nhớ đăng nhập”.

## Điều 13. Trang chủ

### 13.1 Công việc cần xử lý

Phải là khối có mức ưu tiên thị giác cao nhất.

Hiển thị từ 5 đến 7 item.

Mỗi item gồm tối thiểu:

- Tiêu đề.
- Mức độ ưu tiên.
- Hạn xử lý.
- Trạng thái.
- Người giao hoặc đơn vị liên quan.

Có điều hướng “Xem tất cả”.

Không có thao tác CRUD trên trang chủ.

### 13.2 Thông báo cơ quan

Hiển thị từ 4 đến 6 item.

Mỗi item gồm:

- Tiêu đề.
- Đơn vị phát hành.
- Ngày phát hành.
- Mức độ.
- Trạng thái mới hoặc đã đọc nếu phù hợp.

Không được:

- Dùng ảnh thumbnail lớn.
- Dùng bố cục giống báo điện tử.
- Dùng headline giật gân.
- Biến khu vực thông báo thành feed tin tức.

### 13.3 Truy cập nhanh

Phải có đúng 5 module:

- Công việc.
- Lịch làm việc.
- Chat.
- Mail.
- Thông báo.

Mỗi module có:

- Icon.
- Nhãn.
- Màu nhận diện nhẹ.
- Hover state.
- Focus state.
- Điều hướng đúng route.

### 13.4 Lịch hôm nay

Hiển thị từ 3 đến 5 sự kiện.

Mỗi sự kiện có:

- Thời gian.
- Tên sự kiện.
- Địa điểm hoặc kênh họp.
- Người tổ chức nếu cần.

### 13.5 Mail và Chat chưa đọc

Hiển thị:

- Tổng số mail chưa đọc.
- Tổng số chat chưa đọc.
- Một số item gần nhất.

Không cho phép trả lời trực tiếp trên trang chủ.

## Điều 14. Module Công việc

Phải có:

- Page header.
- Tổng quan:
  - Tổng công việc.
  - Sắp đến hạn.
  - Quá hạn.
  - Hoàn thành.
- Bộ lọc:
  - Trạng thái.
  - Mức ưu tiên.
  - Hạn xử lý.
- Danh sách hoặc bảng.
- Pagination giả lập.
- Loading.
- Skeleton.
- Empty.
- Error.

Không có tạo, sửa hoặc xoá.

## Điều 15. Module Lịch làm việc

Phải có:

- Chế độ Hôm nay.
- Chế độ Tuần.
- Filter loại sự kiện.
- Thời gian.
- Tên sự kiện.
- Địa điểm hoặc kênh họp.
- Người tổ chức.
- Loading.
- Skeleton.
- Empty.
- Error.

Không có tạo, sửa hoặc xoá.

## Điều 16. Module Chat

Phải có:

- Danh sách hội thoại.
- Tìm kiếm.
- Badge chưa đọc.
- Preview tin nhắn cuối.
- Online indicator nếu dữ liệu có hỗ trợ.
- Khung hội thoại read-only.
- Loading.
- Skeleton.
- Empty.
- Error.

Không có:

- Gửi tin.
- Realtime.
- WebSocket.
- Upload file.

## Điều 17. Module Mail

Phải có:

- Danh sách mail.
- Bộ lọc:
  - Tất cả.
  - Chưa đọc.
  - Gắn sao.
- Người gửi.
- Tiêu đề.
- Preview.
- Thời gian.
- Nội dung thư read-only.
- Loading.
- Skeleton.
- Empty.
- Error.

Không có:

- Soạn mail.
- Gửi mail.
- Trả lời mail.
- Chuyển tiếp mail.

## Điều 18. Module Thông báo cơ quan

Phải có:

- Danh sách hoặc bảng.
- Bộ lọc:
  - Tất cả.
  - Quan trọng.
  - Mới nhất.
- Tiêu đề.
- Đơn vị phát hành.
- Ngày phát hành.
- Mức độ.
- Trạng thái đọc.
- Drawer hoặc trang chi tiết read-only.
- Loading.
- Skeleton.
- Empty.
- Error.

Không có CRUD.

---

# V. YÊU CẦU DỮ LIỆU VÀ MOCK API

## Điều 19. Nguyên tắc dữ liệu

Codex phải tuân thủ:

- Không hard-code dữ liệu nghiệp vụ trong component.
- Dữ liệu phải nằm trong fixtures, mocks hoặc lớp data riêng.
- Component lấy dữ liệu qua service hoặc API hook.
- Mock API trả JSON.
- Dữ liệu phải bằng tiếng Việt.
- Dữ liệu giả nhưng hợp lý.
- Ngày giờ và trạng thái phải nhất quán.
- Không dùng Lorem Ipsum cho dữ liệu nghiệp vụ.

## Điều 20. API tối thiểu

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

GET /api/dashboard/summary
GET /api/dashboard/tasks
GET /api/dashboard/today-events
GET /api/dashboard/mail-summary
GET /api/dashboard/chat-summary
GET /api/dashboard/announcements

GET /api/tasks
GET /api/calendar/events
GET /api/chat/conversations
GET /api/chat/conversations/:id/messages
GET /api/mail
GET /api/mail/:id
GET /api/announcements
GET /api/announcements/:id
```

## Điều 21. Số lượng dữ liệu mẫu tối thiểu

- 12 công việc.
- 8 sự kiện.
- 8 cuộc trò chuyện.
- 15 mail.
- 10 thông báo.
- 10–15 tin nhắn cho một số hội thoại.

Dữ liệu phải có đủ trạng thái để kiểm thử filter.

## Điều 22. Trạng thái API

Codex phải cung cấp cách mô phỏng:

- Success.
- Loading.
- Empty.
- Error.

Có thể sử dụng:

```text
?state=loading
?state=empty
?state=error
```

hoặc dev control chỉ bật trong môi trường phát triển.

---

# VI. YÊU CẦU THẨM MỸ VÀ DESIGN SYSTEM

## Điều 23. Tính cách giao diện

Giao diện phải:

- Hiện đại.
- Nghiêm túc.
- Sáng.
- Gọn.
- Tin cậy.
- Thân thiện.
- Hướng công việc.
- Có tính thẩm mỹ cao.
- Nhiều dữ liệu nhưng dễ đọc.
- Gần tinh thần Google Workspace nhưng phù hợp môi trường cơ quan.

## Điều 24. Màu thương hiệu

```text
Brand Red: #D92D20
Brand Red Hover: #B42318
Brand Red Active: #912018
Brand Red Soft: #FEF3F2
```

Màu đỏ chỉ được dùng có kiểm soát cho:

- Logo.
- Primary action.
- Active navigation.
- Điểm nhấn.
- Trạng thái quan trọng khi hợp lý.

Không dùng đỏ làm nền lớn cho:

- Toàn bộ sidebar.
- Toàn bộ header.
- Toàn bộ page background.
- Các card lớn.

## Điều 25. Màu trung tính

```text
Text Primary: #1D2939
Text Secondary: #475467
Text Muted: #667085
Border: #E4E7EC
Border Strong: #D0D5DD
Surface: #FFFFFF
Surface Secondary: #F9FAFB
Page Background: #F5F7FA
```

## Điều 26. Màu module

```text
Tasks: #D92D20
Calendar: #7F56D9
Chat: #039855
Mail: #1570EF
Announcements: #DC6803
```

Màu module chỉ dùng nhẹ ở:

- Icon.
- Icon background.
- Badge.
- Indicator.
- Accent nhỏ.

## Điều 27. Typography

- Font chính: Inter.
- Fallback: system sans-serif.
- Body: 14–16 px.
- Heading rõ nhưng không quá lớn.
- Không dùng typography kiểu landing page.
- Tiêu đề thường dùng weight 500–600.

## Điều 28. Spacing và radius

Spacing theo hệ 4 px:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48
```

Radius:

```text
Small: 6 px
Medium: 10 px
Large: 14 px
```

Không bo tròn quá mức.

## Điều 29. Shadow

Chỉ dùng shadow nhẹ:

```text
0 1px 2px rgba(16, 24, 40, 0.06)
0 4px 12px rgba(16, 24, 40, 0.08)
```

## Điều 30. Những hình thức bị cấm

Codex không được:

- Dùng hero banner lớn.
- Dùng gradient sặc sỡ.
- Dùng glassmorphism phô trương.
- Dùng shadow nặng.
- Dùng animation thừa.
- Biến mọi khu vực thành card.
- Dùng ảnh stock.
- Dùng ảnh tin tức.
- Dùng sidebar kiểu admin template lỗi thời.
- Dùng quá nhiều biểu đồ.
- Dùng icon từ nhiều hệ không đồng nhất.
- Dùng màu đỏ làm màu phủ diện rộng.
- Dùng component mặc định Ant Design mà không tinh chỉnh để phù hợp design system.

---

# VII. KIẾN TRÚC CODE

## Điều 31. Cấu trúc thư mục

Codex phải tổ chức theo feature/module.

Cấu trúc khuyến nghị bắt buộc về tinh thần:

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

## Điều 32. Quy tắc component

- Không tạo component khổng lồ.
- Không tạo component chung khi chỉ dùng một lần.
- Không over-engineer.
- Không copy-paste logic giữa các module.
- Shared component chỉ được tạo khi có ít nhất hai nơi sử dụng hợp lý.
- Business data không nằm trong component.
- UI state phải rõ ràng.
- Props phải có TypeScript type.
- Không dùng `any` nếu không có lý do bắt buộc.
- Không bỏ qua lỗi TypeScript bằng `@ts-ignore`.
- Không tắt rule ESLint chỉ để vượt qua kiểm tra.

## Điều 33. Tailwind và Ant Design

### Tailwind sử dụng cho

- Layout.
- Spacing.
- Responsive.
- Typography.
- Surface.
- Border.
- Fine-tuning.

### Ant Design sử dụng cho

- Form.
- Input.
- Table.
- Dropdown.
- Tooltip.
- Drawer.
- Modal.
- DatePicker.
- Pagination.
- Empty.
- Skeleton.

Không được trộn hai hệ style thiếu kiểm soát trong cùng một component.

## Điều 34. State management

- Ưu tiên React state, context và custom hooks.
- Không cài Redux, Zustand hoặc thư viện state management khác nếu không có nhu cầu rõ ràng.
- Server state phải đi qua service/hook.
- Không tạo global state cho dữ liệu chỉ dùng trong một page.

---

# VIII. ACCESSIBILITY VÀ RESPONSIVE

## Điều 35. Accessibility

Phải có:

- Focus state rõ ràng.
- Form label.
- Error message liên kết với input.
- Icon-only button có `aria-label` hoặc tooltip.
- Contrast phù hợp.
- Không dùng màu làm dấu hiệu duy nhất.
- Semantic navigation.
- Keyboard interaction hợp lý.
- Table/list có cấu trúc dễ đọc.

## Điều 36. Responsive

### Desktop

- Sidebar cố định hoặc theo thiết kế app shell.
- Dashboard có thể dùng grid hai cột.
- Công việc chiếm ưu tiên thị giác lớn nhất.

### Tablet từ 768 px

- Sidebar có thể thu gọn.
- Grid chuyển linh hoạt một hoặc hai cột.
- Không được tràn ngang ngoài chủ đích.
- Không được làm mất chức năng chính.

### Dưới 768 px

Không nằm trong phạm vi bắt buộc.

Codex không được hy sinh trải nghiệm desktop/tablet để tối ưu mobile ngoài phạm vi.

---

# IX. KIỂM THỬ VÀ CHẤT LƯỢNG

## Điều 37. Các lệnh bắt buộc

Project phải có các lệnh tương đương:

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
```

## Điều 38. Test bắt buộc

Tối thiểu phải có test cho:

- Đăng nhập đúng.
- Đăng nhập sai.
- Protected route.
- Đăng xuất.
- Render dashboard.
- Navigation sidebar.
- Một loading state.
- Một empty state.
- Một error state.
- Filter module Công việc hoặc Mail.

## Điều 39. Không được tuyên bố hoàn thành khi

- Build chưa chạy.
- TypeScript còn lỗi.
- ESLint còn lỗi.
- Test còn fail.
- Có dữ liệu nghiệp vụ hard-code trong component.
- Route bảo vệ chưa hoạt động.
- UI state chưa đủ.
- Responsive tablet bị vỡ.
- README chưa có.
- Có chức năng ngoài phạm vi làm tăng độ phức tạp.
- Giao diện chưa tuân thủ design system.

---

# X. QUY TRÌNH THI CÔNG

## Điều 40. Thứ tự thực hiện bắt buộc

Codex phải thực hiện theo thứ tự:

1. Đọc toàn bộ tài liệu.
2. Kiểm tra repository.
3. Lập danh sách việc cần làm.
4. Khởi tạo hoặc chuẩn hóa project.
5. Thiết lập design tokens.
6. Thiết lập app shell.
7. Thiết lập authentication.
8. Thiết lập mock API.
9. Xây dashboard.
10. Xây từng module.
11. Viết test.
12. Rà soát accessibility.
13. Rà soát responsive.
14. Chạy typecheck.
15. Chạy lint.
16. Chạy test.
17. Chạy build.
18. Sửa toàn bộ lỗi.
19. Cập nhật README.
20. Lập báo cáo bàn giao.

## Điều 41. Không được bỏ qua bước kiểm tra

Codex không được nói “đã hoàn thành” chỉ dựa vào việc đã tạo file.

Hoàn thành phải dựa trên bằng chứng:

- Kết quả build.
- Kết quả typecheck.
- Kết quả lint.
- Kết quả test.
- Danh sách route.
- Danh sách tính năng.
- Danh sách giới hạn còn lại.

## Điều 42. Cách xử lý khi gặp lỗi

Khi gặp lỗi, Codex phải:

1. Đọc lỗi.
2. Xác định nguyên nhân.
3. Sửa nguyên nhân gốc.
4. Không che lỗi bằng cách tắt type checking hoặc lint.
5. Chạy lại kiểm tra.
6. Ghi rõ lỗi nào đã được sửa.

## Điều 43. Cách xử lý quyết định chưa được mô tả

Đối với chi tiết nhỏ:

- Chọn giải pháp đơn giản.
- Tuân thủ design system.
- Không mở rộng phạm vi.
- Ghi chú ngắn trong báo cáo.

Đối với quyết định lớn ảnh hưởng:

- Kiến trúc.
- Route.
- Data schema.
- Stack.
- Phạm vi.
- UX chính.

Codex không được tự ý thay đổi.

---

# XI. QUẢN LÝ THAY ĐỔI

## Điều 44. Thay đổi nhỏ

Codex được phép tự quyết với:

- Tên biến.
- Cách chia file nhỏ.
- Tên component nội bộ.
- Cách viết helper.
- Chi tiết spacing nhỏ trong token cho phép.
- Cách cài đặt kỹ thuật không làm thay đổi hành vi.

## Điều 45. Thay đổi lớn

Các thay đổi sau phải được xem là thay đổi phạm vi:

- Thêm module.
- Thêm CRUD.
- Thêm backend.
- Đổi framework.
- Đổi design direction.
- Đổi màu thương hiệu.
- Thêm dark mode.
- Thêm mobile.
- Thêm realtime.
- Thay đổi routes.
- Thay đổi schema chính.
- Thêm thư viện kiến trúc lớn.

Codex không được tự ý thực hiện.

---

# XII. NGHIỆM THU

## Điều 46. Tiêu chí nghiệm thu chức năng

- Đăng nhập hoạt động.
- Protected route hoạt động.
- Đăng xuất hoạt động.
- Tất cả route hoạt động.
- Dashboard có đủ 5 khối.
- Năm module có dữ liệu và filter theo yêu cầu.
- Không có CRUD ngoài phạm vi.
- Mock API hoạt động.

## Điều 47. Tiêu chí nghiệm thu giao diện

- Có tính thẩm mỹ cao.
- Hiện đại.
- Nghiêm túc.
- Không giống trang tin.
- Không giống admin template cũ.
- Đỏ dùng có kiểm soát.
- Mật độ thông tin cân bằng.
- Typography rõ ràng.
- Spacing nhất quán.
- Desktop/tablet không vỡ.

## Điều 48. Tiêu chí nghiệm thu kỹ thuật

- Build thành công.
- Typecheck thành công.
- ESLint thành công.
- Test thành công.
- Không có `any` thiếu lý do.
- Không dùng `@ts-ignore` để né lỗi.
- Không hard-code dữ liệu nghiệp vụ trong component.
- Có service layer.
- Có mock API.
- Có README.

## Điều 49. Tiêu chí nghiệm thu accessibility

- Focus state.
- Label.
- Aria-label hoặc tooltip.
- Contrast.
- Keyboard navigation cơ bản.
- Không dựa hoàn toàn vào màu.

---

# XIII. BÁO CÁO BÀN GIAO

## Điều 50. Nội dung báo cáo cuối

Codex phải kết thúc bằng báo cáo theo đúng mẫu:

```markdown
# Báo cáo bàn giao

## 1. Tổng quan
- Trạng thái:
- Phạm vi đã hoàn thành:

## 2. Các route
- ...

## 3. Các tính năng đã hoàn thành
- ...

## 4. Kiến trúc chính
- ...

## 5. Mock API
- ...

## 6. Kiểm thử
- Typecheck:
- ESLint:
- Unit test:
- Build:

## 7. Responsive và accessibility
- ...

## 8. Các quyết định kỹ thuật
- ...

## 9. Giới hạn đúng theo phạm vi
- ...

## 10. File quan trọng
- ...
```

## Điều 51. Bằng chứng bàn giao

Codex phải cung cấp kết quả thực tế của:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Không được ghi “pass” nếu chưa chạy.

---

# XIV. CÁC VI PHẠM NGHIÊM TRỌNG

Các hành vi sau được xem là vi phạm nghiêm trọng:

1. Tự ý đổi stack.
2. Tự ý mở rộng phạm vi.
3. Hard-code dữ liệu nghiệp vụ trong component.
4. Tắt TypeScript hoặc ESLint để né lỗi.
5. Bỏ qua test.
6. Tuyên bố hoàn thành khi build chưa chạy.
7. Dùng giao diện giống trang tin.
8. Dùng đỏ diện rộng.
9. Không có loading/empty/error.
10. Không có protected route.
11. Không responsive tablet.
12. Cài thư viện lớn không cần thiết.
13. Tạo kiến trúc phức tạp hơn yêu cầu.
14. Dùng dữ liệu tiếng Anh hoặc Lorem Ipsum thay cho dữ liệu nghiệp vụ tiếng Việt.
15. Không đọc tài liệu trước khi thi công.

Nếu phát hiện vi phạm, Codex phải sửa trước khi tiếp tục bàn giao.

---

# XV. LỆNH KHỞI ĐỘNG DÀNH CHO CODEX

Sau khi nhận hợp đồng này, Codex phải thực hiện theo chỉ dẫn sau:

```text
Hãy đọc toàn bộ tài liệu trong repository, đặc biệt là:

- HOP_DONG_THI_CONG_CODEX_ERP.md
- 00_README.md
- 01_PLAN_TRIEN_KHAI.md
- 02_KIEN_TRUC_VA_DESIGN_SYSTEM.md
- 03_MOCK_API_SCHEMA.md
- 04_PROMPT_TONG_CODEX.md
- 05_PROMPT_THEO_GIAI_DOAN.md
- 06_CHECKLIST_NGHIEM_THU.md

Xem HOP_DONG_THI_CONG_CODEX_ERP.md là tài liệu có mức ưu tiên cao nhất.

Trước khi sửa code:
1. Kiểm tra repository.
2. Tóm tắt phạm vi.
3. Liệt kê kế hoạch triển khai.
4. Chỉ ra các rủi ro kỹ thuật.
5. Không hỏi lại các thông tin đã có trong tài liệu.
6. Không tự ý mở rộng phạm vi.

Sau đó triển khai theo từng giai đoạn, chạy kiểm tra sau mỗi giai đoạn quan trọng và chỉ tuyên bố hoàn thành khi typecheck, lint, test và build đều thành công.
```

---

# XVI. XÁC NHẬN THỰC THI

Khi bắt đầu công việc, Codex phải phản hồi:

```text
Tôi đã đọc và chấp nhận HỢP ĐỒNG THI CÔNG FRONTEND ERP NỘI BỘ.

Tôi xác nhận:
- Không tự ý đổi stack.
- Không tự ý mở rộng phạm vi.
- Không hard-code dữ liệu nghiệp vụ trong component.
- Tuân thủ design system.
- Tuân thủ mock API.
- Tuân thủ responsive desktop/tablet.
- Tuân thủ accessibility cơ bản.
- Chỉ bàn giao khi typecheck, lint, test và build đều đạt.
```

---

# PHỤ LỤC A — DEFINITION OF DONE TÓM TẮT

- [ ] Đúng stack.
- [ ] Đúng routes.
- [ ] Đúng phạm vi.
- [ ] Đúng app shell.
- [ ] Đủ dashboard.
- [ ] Đủ 5 module.
- [ ] Có mock API.
- [ ] Không hard-code.
- [ ] Có loading.
- [ ] Có skeleton.
- [ ] Có empty.
- [ ] Có error.
- [ ] Có protected route.
- [ ] Có đăng xuất.
- [ ] Có responsive từ 768 px.
- [ ] Có accessibility cơ bản.
- [ ] Có unit test.
- [ ] Typecheck pass.
- [ ] ESLint pass.
- [ ] Test pass.
- [ ] Build pass.
- [ ] README đầy đủ.
- [ ] Có báo cáo bàn giao.

---

# PHỤ LỤC B — NGUYÊN TẮC CUỐI CÙNG

**Ưu tiên chất lượng, tính nhất quán và khả năng sử dụng thực tế hơn số lượng tính năng.**

**Không xây thêm để trông có vẻ nhiều. Chỉ xây đúng những gì cần thiết và xây cho tốt.**

**Khi giao diện đẹp mâu thuẫn với khả năng đọc dữ liệu, ưu tiên khả năng đọc và xử lý công việc.**

**Khi giải pháp phức tạp mâu thuẫn với giải pháp đơn giản nhưng đáp ứng đủ yêu cầu, chọn giải pháp đơn giản.**

**Mọi quyết định phải phục vụ mục tiêu: người dùng nhìn vào thấy công việc của mình và bắt đầu xử lý được ngay.**
