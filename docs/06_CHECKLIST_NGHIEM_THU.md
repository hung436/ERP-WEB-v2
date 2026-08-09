# Checklist nghiệm thu ERP nội bộ

## 1. Cài đặt và chạy

- [ ] Có README.
- [ ] Cài dependencies thành công.
- [ ] `npm run dev` chạy được.
- [ ] `npm run build` chạy được.
- [ ] `npm run typecheck` không lỗi.
- [ ] `npm run lint` không lỗi.
- [ ] `npm run test` không lỗi.

## 2. Authentication

- [ ] Có trang đăng nhập.
- [ ] Tài khoản `nhanvien / 123456` đăng nhập được.
- [ ] Sai thông tin hiển thị lỗi.
- [ ] Có loading khi đăng nhập.
- [ ] Có protected route.
- [ ] Người chưa đăng nhập bị chuyển về `/login`.
- [ ] Đăng xuất hoạt động.
- [ ] Đăng xuất chuyển về `/login`.

## 3. App shell

- [ ] Có sidebar.
- [ ] Có header.
- [ ] Có active navigation.
- [ ] Có avatar/menu tài khoản.
- [ ] Sidebar thu gọn ở tablet.
- [ ] Có trang 404.
- [ ] Không dùng đỏ làm nền diện rộng.

## 4. Trang chủ

- [ ] Công việc là khối ưu tiên lớn nhất.
- [ ] Có thông báo cơ quan.
- [ ] Có truy cập nhanh.
- [ ] Có lịch hôm nay.
- [ ] Có mail/chat chưa đọc.
- [ ] Không có thumbnail tin tức.
- [ ] Không giống trang báo.
- [ ] Dữ liệu lấy từ mock API.
- [ ] Có loading.
- [ ] Có skeleton.
- [ ] Có empty state.
- [ ] Có error state.

## 5. Module Công việc

- [ ] Có summary.
- [ ] Có filter trạng thái.
- [ ] Có filter ưu tiên.
- [ ] Có filter hạn.
- [ ] Có pagination.
- [ ] Không có CRUD.
- [ ] Có đầy đủ UI state.

## 6. Module Lịch

- [ ] Có chế độ hôm nay.
- [ ] Có chế độ tuần.
- [ ] Có filter loại sự kiện.
- [ ] Không có CRUD.
- [ ] Có đầy đủ UI state.

## 7. Module Chat

- [ ] Có danh sách hội thoại.
- [ ] Có search.
- [ ] Có unread badge.
- [ ] Có khung hội thoại read-only.
- [ ] Không gửi tin.
- [ ] Không realtime.
- [ ] Có đầy đủ UI state.

## 8. Module Mail

- [ ] Có danh sách mail.
- [ ] Có filter tất cả.
- [ ] Có filter chưa đọc.
- [ ] Có filter gắn sao.
- [ ] Có nội dung read-only.
- [ ] Không gửi/trả lời mail.
- [ ] Có đầy đủ UI state.

## 9. Module Thông báo

- [ ] Có danh sách.
- [ ] Có filter.
- [ ] Có chi tiết read-only.
- [ ] Không có CRUD.
- [ ] Không giống trang tin.
- [ ] Có đầy đủ UI state.

## 10. Dữ liệu và API

- [ ] Không hard-code dữ liệu nghiệp vụ trong component.
- [ ] Có service layer.
- [ ] Có mock API.
- [ ] API trả JSON.
- [ ] Dữ liệu bằng tiếng Việt.
- [ ] Dữ liệu hợp lý.
- [ ] Có fixtures riêng.
- [ ] Có handlers riêng.
- [ ] Có thể kiểm thử loading/empty/error.

## 11. Design

- [ ] Dùng Inter.
- [ ] Dùng đỏ `#D92D20` có kiểm soát.
- [ ] Nền chính trắng/xám.
- [ ] Mỗi module có màu nhận diện nhẹ.
- [ ] Không gradient sặc sỡ.
- [ ] Không shadow nặng.
- [ ] Không card ở mọi nơi.
- [ ] Không admin template cũ.
- [ ] Spacing nhất quán.
- [ ] Typography rõ ràng.
- [ ] Mật độ thông tin cân bằng.

## 12. Responsive

- [ ] Hoạt động tốt trên desktop.
- [ ] Hoạt động tốt từ 768 px.
- [ ] Không vỡ layout ở tablet.
- [ ] Không bắt buộc tối ưu dưới 768 px.

## 13. Accessibility

- [ ] Có focus state.
- [ ] Form có label.
- [ ] Icon-only button có aria-label hoặc tooltip.
- [ ] Không dùng màu làm dấu hiệu duy nhất.
- [ ] Contrast phù hợp.
- [ ] Navigation có semantic structure.

## 14. Test

- [ ] Test đăng nhập đúng.
- [ ] Test đăng nhập sai.
- [ ] Test protected route.
- [ ] Test đăng xuất.
- [ ] Test dashboard.
- [ ] Test loading.
- [ ] Test empty.
- [ ] Test error.
- [ ] Test filter.
- [ ] Test navigation.

## 15. Ngoài phạm vi

Xác nhận dự án không tự ý thêm:

- [ ] Backend thật.
- [ ] Database thật.
- [ ] Dark mode.
- [ ] Mobile dưới 768 px.
- [ ] CRUD hoàn chỉnh.
- [ ] Chat realtime.
- [ ] Gửi mail.
- [ ] CRM.
- [ ] Nhân sự.
- [ ] Nghỉ phép.
- [ ] Phê duyệt.
- [ ] Quy trình bài viết.
