# Kiến trúc thông tin và Design System

## 1. Routes

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

## 2. Quy tắc điều hướng

- `/login`: trang đăng nhập.
- `/`: trang chủ.
- Các route còn lại nằm trong app shell.
- Người chưa đăng nhập truy cập route bảo vệ phải được chuyển về `/login`.
- Đăng nhập thành công chuyển đến `/`.
- Đăng xuất xoá session giả lập và chuyển về `/login`.
- Route không tồn tại hiển thị trang 404.

## 3. Cấu trúc màn hình

### 3.1 Trang đăng nhập

- Logo hoặc wordmark tạm.
- Tên hệ thống.
- Mô tả ngắn.
- Input tên đăng nhập.
- Input mật khẩu.
- Nút đăng nhập.
- Loading state.
- Validation.
- Error message.
- Tài khoản demo hiển thị kín đáo.
- Không cần quên mật khẩu.
- Không cần ghi nhớ đăng nhập.

### 3.2 App shell

#### Sidebar

- Trang chủ.
- Công việc.
- Lịch làm việc.
- Chat.
- Mail.
- Thông báo cơ quan.
- Logo/wordmark.
- Active state rõ ràng.
- Có thể thu gọn ở tablet.
- Không dùng đỏ làm nền toàn sidebar.

#### Header

- Tên trang hoặc breadcrumb.
- Badge thông báo nhỏ nếu cần.
- Avatar.
- Menu tài khoản.
- Đăng xuất.
- Không đặt quá nhiều nút.

### 3.3 Trang chủ

#### Khối chính 1 — Công việc cần xử lý

Hiển thị 5–7 công việc:

- Tiêu đề.
- Mức ưu tiên.
- Hạn xử lý.
- Trạng thái.
- Người giao hoặc đơn vị liên quan.
- Nút “Xem tất cả”.

#### Khối chính 2 — Thông báo cơ quan

Hiển thị 4–6 thông báo:

- Tiêu đề.
- Đơn vị phát hành.
- Ngày phát hành.
- Mức độ.
- Trạng thái mới.

Không dùng ảnh thumbnail lớn. Không trình bày như báo điện tử.

#### Khối chính 3 — Truy cập nhanh

- Công việc.
- Lịch làm việc.
- Chat.
- Mail.
- Thông báo.

Mỗi module có icon và màu nhận diện nhẹ.

#### Khối phụ 1 — Lịch hôm nay

- 3–5 sự kiện.
- Giờ.
- Tên sự kiện.
- Địa điểm hoặc kênh họp.

#### Khối phụ 2 — Mail và Chat chưa đọc

- Tổng mail chưa đọc.
- Tổng chat chưa đọc.
- Một vài item gần nhất.

## 4. Design direction

### Tính cách

- Hiện đại.
- Nghiêm túc.
- Sáng.
- Gọn.
- Tin cậy.
- Thân thiện.
- Có mật độ thông tin vừa phải.
- Gần tinh thần Google Workspace nhưng phù hợp môi trường cơ quan.

### Tránh

- Không giống trang tin.
- Không dùng hero banner.
- Không dùng ảnh tin tức.
- Không dùng gradient sặc sỡ.
- Không dùng shadow nặng.
- Không dùng đỏ diện rộng.
- Không dùng animation phô trương.
- Không biến mọi khu vực thành card.
- Không dùng quá nhiều biểu đồ.
- Không làm giống admin template cũ.

## 5. Design tokens

### 5.1 Màu thương hiệu

```text
Brand Red: #D92D20
Brand Red Hover: #B42318
Brand Red Active: #912018
Brand Red Soft: #FEF3F2
```

Đỏ chỉ dùng cho:

- Logo/wordmark.
- Primary action.
- Active navigation.
- Điểm nhấn.
- Trạng thái quan trọng khi hợp lý.

Không dùng đỏ làm màu nền lớn.

### 5.2 Màu trung tính

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

### 5.3 Semantic colors

```text
Success: #039855
Success Soft: #ECFDF3
Warning: #DC6803
Warning Soft: #FFFAEB
Error: #D92D20
Error Soft: #FEF3F2
Info: #1570EF
Info Soft: #EFF8FF
```

### 5.4 Màu module

Dùng nhẹ, chủ yếu ở icon background hoặc indicator:

```text
Tasks: #D92D20
Calendar: #7F56D9
Chat: #039855
Mail: #1570EF
Announcements: #DC6803
```

## 6. Typography

- Font: Inter.
- Fallback: system sans-serif.
- Body mặc định: 14–16 px.
- Heading rõ ràng nhưng không quá lớn.
- Không dùng heading kiểu landing page.
- Dùng font weight 500–600 cho tiêu đề.
- Dùng line-height thoáng vừa phải.

## 7. Spacing

Dùng hệ 4 px:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48
```

## 8. Radius

```text
Small: 6 px
Medium: 10 px
Large: 14 px
```

Không dùng bo tròn quá mức.

## 9. Shadow

Chỉ dùng shadow nhẹ:

```text
0 1px 2px rgba(16, 24, 40, 0.06)
0 4px 12px rgba(16, 24, 40, 0.08)
```

## 10. Responsive

### Desktop

- Sidebar cố định.
- Trang chủ dùng grid 2 cột.
- Khối công việc chiếm ưu tiên lớn hơn.

### Tablet từ 768 px

- Sidebar thu gọn.
- Grid chuyển linh hoạt 1–2 cột.
- Công việc và thông báo vẫn xuất hiện trước.
- Không tối ưu riêng cho mobile dưới 768 px.

## 11. Accessibility

- Focus state nhìn thấy rõ.
- Tất cả button có accessible name.
- Icon-only button phải có tooltip hoặc aria-label.
- Contrast phù hợp.
- Không dùng màu là dấu hiệu duy nhất.
- Form có label.
- Error message liên kết đúng với input.
- Navigation dùng semantic element.
