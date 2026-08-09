# Báo cáo về những việc đã làm

## 38. Tối giản modal và đồng bộ số đếm theo dữ liệu — 07/08/2026

- Modal Họp trực tuyến chỉ giữ một nút `Tham gia phòng họp`; loại bỏ `Không tham gia` và `Xác nhận tham gia`.
- Thống nhất nhận diện Họp trực tuyến chỉ còn một icon Meeting tại title modal; loại bỏ icon lặp trong nội dung và nút hành động.
- Modal Chat đưa avatar, tên, trạng thái trực tuyến/số thành viên và số chưa đọc lên cùng title; loại bỏ header nhận diện lặp trong nội dung.
- Tạo `CountedTabLabel` dùng chung, hiển thị số lượng dưới dạng badge gọn thay vì số trong ngoặc.
- Nối số lượng thật vào tab Tài liệu, Chat, Họp trực tuyến, Thông báo và các bộ lọc nguồn Thông báo.
- Chuyển Mail sang tải nguồn dữ liệu chung rồi chia theo thư mục, giúp badge Hộp thư đến, Đã gửi, Bản nháp, Lưu trữ, Thư rác và Thùng rác luôn khớp mock data.
- Bổ sung badge sidebar: Công việc chưa hoàn thành, Tài liệu chờ xử lý, Họp hôm nay, tổng tin Chat chưa đọc và Mail chưa đọc.
- Badge sidebar thu gọn được đặt trên icon; tooltip và aria-label đồng thời chứa số lượng tương ứng.
- Không chạy test case theo yêu cầu; đã chạy typecheck, ESLint và production build.

## 37. Tinh chỉnh popup, thiết kế lại Thông báo và hoàn thiện Chat/Mail — 07/08/2026

- Loại bỏ tiêu đề lặp trong phần thân popup Mail, Chat, Họp trực tuyến và Thông báo cơ quan trên Trang chủ.
- Xây lại module Thông báo thành notification center một vùng: header gọn, tìm kiếm, tab trạng thái, bộ lọc nguồn và danh sách có trạng thái đọc bằng dấu hiệu thị giác.
- Loại bỏ toàn bộ nhãn và bộ lọc mức độ `Khẩn`, `Quan trọng`, `Thông thường` khỏi danh sách, popup Trang chủ và modal chi tiết Thông báo.
- Module Tài liệu bỏ số đếm trong nhãn tab; tăng khoảng cách giữa tiêu đề `Tài liệu` và phần mô tả.
- Chuẩn hóa kích thước, căn giữa, hover và vùng bấm cho icon button ở header, tin nhắn và ô soạn Chat.
- Mail bổ sung tìm kiếm theo người gửi, người nhận, tiêu đề và tên tệp; thêm filter Tất cả, Chưa đọc, Đã đọc và Có tệp đính kèm.
- Thiết kế preview riêng cho Thư nháp với chỉ dẫn và nút `Tiếp tục soạn và gửi`; chọn item không còn mở editor đột ngột.
- Tạo component icon tệp dùng chung, nhận diện PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, ảnh và tệp nén bằng màu và ký hiệu riêng.
- Bổ sung fixture PDF, DOCX và XLSX để giao diện thể hiện được sự khác biệt định dạng.
- Không chạy test case theo yêu cầu; đã chạy typecheck, ESLint và production build.

## 36. Đồng bộ điều hướng, Thông báo, popup Trang chủ và luồng Thư nháp — 07/08/2026

- Menu thu gọn hiển thị tooltip nằm ngang bên phải; chiều cao vùng logo được đồng bộ 68 px với app header.
- Chuẩn hóa kiểu tab ngang bằng Segmented và trạng thái tab dọc bằng chỉ báo active bên trái; đồng bộ chiều cao, border, radius và focus của thanh tìm kiếm các module.
- Thiết kế lại nguồn dữ liệu Thông báo với bộ lọc: Tất cả, Thông báo cơ quan, Tài liệu, Mail, Đánh giá lao động và Hệ thống.
- Trang chủ chỉ lấy Thông báo cơ quan; popup Mail, Chat, Họp trực tuyến và Thông báo cơ quan dùng chính tiêu đề nội dung làm title.
- Tách tên người dùng và trạng thái Đang hoạt động trong Chat thành hai dòng có chỉ báo hiện diện riêng.
- Mở rộng popup Mail Trang chủ với vùng phản hồi lớn hơn, các thao tác rõ hơn và hỗ trợ chọn/bỏ tệp đính kèm.
- Hoàn thiện luồng Thư nháp kiểu Gmail: lưu mới, cập nhật cùng bản nháp, mở lại để chỉnh sửa, tự lưu khi đóng và loại bản nháp sau khi gửi.
- Thiết kế lại vùng đính kèm Mail, đồng bộ model và mock API để phản hồi/chuyển tiếp có tệp đính kèm.
- Không chạy test case theo yêu cầu; đã chạy typecheck, ESLint và production build.

## 1. Căn cứ thực hiện

- Đã đọc và áp dụng `Agents.md` cùng toàn bộ tài liệu `docs/00_README.md` đến `docs/06_CHECKLIST_NGHIEM_THU.md`.
- Thực hiện theo sáu giai đoạn trong `docs/01_PLAN_TRIEN_KHAI.md`.
- Tái tạo toàn bộ `src/` từ đầu theo yêu cầu của người giao việc sau khi xác nhận source cũ không còn trong workspace.
- Không mở rộng sang backend thật, database, realtime, dark mode hoặc mobile dưới 768 px; riêng Chat được mở rộng mutation qua mock API theo yêu cầu mới của người giao việc.

## 2. Giai đoạn 1 — Nền tảng

- Khôi phục entry point React, cấu hình application và routing.
- Giữ nguyên React, TypeScript, Vite, Tailwind CSS, Ant Design và React Router.
- Giữ alias `@/` và cấu trúc source theo feature/module.
- Bổ sung `jsdom` để Vitest và React Testing Library kiểm thử UI.
- Bổ sung cấu hình test trong `vite.config.ts` và test setup cho jsdom.

## 3. Giai đoạn 2 — Design system và app shell

- Khai báo Ant Design theme theo màu thương hiệu `#D92D20` và hệ màu trung tính.
- Xây app shell gồm sidebar, header, content area, active navigation và menu tài khoản.
- Sidebar tự thu gọn ở tablet; các layout dữ liệu chuyển cột tại 1100 px và 820 px.
- Xây các shared component: page header, loading/skeleton, empty, error và status tag.
- Thêm trang 404 trong app shell.
- Dùng màu đỏ ở logo, active state, tag và điểm nhấn nhỏ; không dùng làm nền diện rộng.

## 4. Giai đoạn 3 — Authentication

- Xây trang `/login` với label, validation, loading và error state.
- Tạo session giả lập bằng `sessionStorage`.
- Tạo mock API cho login, current user và logout.
- Tạo protected route; người chưa đăng nhập được chuyển về `/login`.
- Đăng nhập đúng chuyển về `/`; đăng xuất xoá session và quay về `/login`.

## 5. Giai đoạn 4 — Mock API và trang chủ

- Tạo domain types, fixtures tiếng Việt và service layer riêng.
- Tạo lớp mock API tương đương với các endpoint auth, dashboard, tasks, calendar, chat, mail và announcements.
- Hỗ trợ mô phỏng `loading`, `empty`, `error` qua query `?state=` cho dữ liệu nghiệp vụ.
- Fixture gồm 12 công việc, 8 sự kiện, 8 cuộc trò chuyện, 12 tin nhắn, 15 mail và 10 thông báo.
- Trang chủ ban đầu có đủ năm khối theo tài liệu; khu “Truy cập nhanh” sau đó được bỏ theo chỉ đạo UI mới, giữ Công việc, Thông báo, Lịch, Mail và Chat.
- Công việc được đặt ở vị trí và kích thước ưu tiên cao nhất.

## 6. Giai đoạn 5 — Năm module

- Công việc: summary, filter trạng thái/ưu tiên/hạn, bảng và pagination.
- Lịch: chế độ hôm nay/tuần, filter loại sự kiện và lịch read-only.
- Chat ban đầu: tìm kiếm, unread badge, online indicator và hội thoại read-only; sau đó được mở rộng gửi tin, file và quản lý nhóm qua mock API.
- Mail: filter tất cả/chưa đọc/gắn sao và nội dung thư read-only.
- Thông báo: filter tất cả/quan trọng/mới nhất và drawer chi tiết read-only.
- Ban đầu không thêm chức năng tạo, sửa, xoá, gửi hoặc realtime; phạm vi Chat được thay đổi rõ ràng ở đợt sau nhưng vẫn không có backend thật/WebSocket.

## 7. Giai đoạn 6 — Test và hoàn thiện

- Viết 10 test cho đăng nhập đúng/sai, protected route, logout, dashboard, sidebar navigation, loading, empty, error và Mail filter.
- Loại bỏ dữ liệu nghiệp vụ khỏi component; tên người dùng và summary được lấy từ auth/service.
- Loại bỏ `@ts-ignore`, `any` và eslint suppression.
- Sửa mock state để lỗi dữ liệu nghiệp vụ không làm hỏng `/api/auth/me`.
- Sửa selection của Mail để tự chọn item hợp lệ sau khi đổi filter.
- Viết README hướng dẫn cài đặt, chạy, routes và mô phỏng UI state.
- Khởi động thành công Vite dev server tại `http://127.0.0.1:4173`.

## 8. Các lỗi đã phát hiện và sửa

- Source cũ bị thiếu hoàn toàn: tái tạo `src/` từ đầu sau khi được người giao việc xác nhận.
- PowerShell chặn `npm.ps1`: dùng `npm.cmd` để chạy cùng npm mà không thay đổi môi trường.
- Sandbox chặn Node truy cập profile: chạy lệnh nghiệm thu với quyền được phê duyệt.
- Mock state tác động nhầm auth: giới hạn state simulation ở API nghiệp vụ.
- Code dùng `Array.prototype.at()` ngoài target ES2020: đổi sang truy cập index tương thích ES2020.
- Test Mail dựa vào tiêu đề trùng lặp: chuyển sang kiểm tra số dòng trước/sau filter.
- Test bị chậm khi chạy đồng thời với production build: nghiệm thu lại test độc lập, không tăng timeout.

## 9. File chính đã tạo/cập nhật

- `src/App.tsx`, `src/main.tsx`, `src/routes/AppRoutes.tsx`.
- `src/features/*` cho 7 feature gồm auth, dashboard, tasks, calendar, chat, mail, announcements và 404.
- `src/mocks/fixtures.ts`, `src/services/mockApi.ts`, `src/services/api.ts`.
- `src/layouts/*`, `src/components/*`, `src/styles/index.css`, `src/config/theme.ts`.
- Bốn test suite trong `src/` và setup tại `src/test/`.
- `README.md`, `vite.config.ts`, `package.json`, `package-lock.json`.

## 10. Đợt tối ưu icon, sidebar và xem nhanh trang chủ

- Tạo bộ 6 icon SVG đồng nhất cho Trang chủ, Công việc, Lịch, Chat, Mail và Thông báo; không còn dùng ký tự văn bản làm icon.
- Gán màu nhận diện riêng cho từng module và dùng nhất quán ở sidebar, thẻ tổng quan, tiêu đề khối và popup.
- Thiết kế lại toàn bộ sidebar bằng navigation semantic, active state theo màu module, mô tả phụ và trạng thái focus rõ ràng.
- Thiết kế lại item “Công việc cần xử lý” thành một hàng thông tin có icon, người giao/đơn vị, ưu tiên, hạn xử lý, trạng thái và affordance “Xem nhanh”.
- Phân biệt nhãn ưu tiên bằng mũi tên/hình khối và nhãn quy trình bằng pill có chấm trạng thái; không phụ thuộc duy nhất vào màu sắc.
- Chuyển item Công việc, Lịch, Thông báo, Mail và Chat trên trang chủ thành nút mở popup read-only.
- Chỉ các liên kết có accessible name “Xem tất cả…” mới điều hướng đến page module.
- Bổ sung 2 integration test cho quy tắc popup không đổi URL và liên kết “Xem tất cả” điều hướng đúng.
- Sửa accessible name của sidebar để trình đọc màn hình nhận đúng tên module.

## 11. Đợt tách popup và tinh giản sidebar

- Giới hạn toàn bộ tiêu đề và nội dung trong bốn cụm Lịch, Thông báo, Mail, Chat ở mức tối đa 15 px.
- Tách popup dùng chung thành năm component độc lập; mỗi module có cấu trúc chi tiết riêng phù hợp loại dữ liệu.
- Popup Công việc có thể cập nhật trạng thái và phần trăm tiến độ ngay tại trang chủ; thay đổi được giữ trong state của phiên hiện tại và không ghi về backend.
- Thiết kế lại menu sidebar thành một dòng cho mỗi module, bỏ mô tả phụ, icon không nền/không màu module.
- Menu đang chọn dùng chữ primary và nền `#FEF3F2`; hover/focus vẫn có độ tương phản rõ.
- Bổ sung kiểm thử popup module riêng; tổng số hiện tại là 13 test.

## 12. Đợt thu gọn danh sách Công việc cần xử lý

- Bỏ các nhãn trường lặp lại: “Ưu tiên”, “Hạn xử lý” và “Trạng thái”.
- Mỗi item chỉ giữ tiêu đề, người giao, hạn ngắn gọn, tag mức độ, tag trạng thái và hành động xử lý.
- Thay icon công việc lặp lại bằng chấm màu mức độ nhỏ và giảm chiều cao item còn 66 px.
- Trên tablet, tiếp tục ẩn mức ưu tiên và thời hạn để ưu tiên tiêu đề cùng trạng thái.

## 13. Bổ sung xem chi tiết Công việc

- Bổ sung popup “Chi tiết công việc” độc lập với popup xử lý.
- Hiển thị mã công việc, mức ưu tiên, trạng thái, người giao, đơn vị, hạn xử lý, thanh tiến độ và mô tả đầy đủ.
- Mỗi item có hai hành động rõ ràng: “Chi tiết” và “Xử lý”.
- Cho phép chuyển trực tiếp từ popup chi tiết sang popup xử lý mà không rời trang chủ.
- Bổ sung integration test cho toàn bộ luồng; tổng số hiện tại là 14 test.

## 14. Chuẩn hóa chi tiết cho năm module

- Gộp khu cập nhật trạng thái và tiến độ trực tiếp vào popup Chi tiết Công việc; loại bỏ popup xử lý trung gian.
- Bảng module Công việc cho phép mở chi tiết bằng chuột, phím Enter và cập nhật xử lý trong cùng popup.
- Mỗi item Lịch làm việc mở popup riêng với thời gian bắt đầu/kết thúc, địa điểm, người tổ chức và loại sự kiện.
- Chat giữ một khung hội thoại chi tiết bên phải; chọn item chỉ thay đổi nội dung khung này, không mở modal trùng lặp.
- Mail giữ một vùng đọc thư chi tiết bên phải; chọn item chỉ thay đổi thư đang đọc, không mở modal trùng lặp.
- Tách chi tiết Thông báo thành drawer component riêng với mức độ, trạng thái đọc, đơn vị, thời gian và văn bản đầy đủ.
- Bổ sung 5 integration test tương ứng; tổng số hiện tại là 19 test.

## 15. Loại bỏ lớp chi tiết trùng lặp

- Gỡ `ChatDetailModal` vì module Chat đã có khung hội thoại đầy đủ.
- Gỡ `MailDetailModal` vì module Mail đã có vùng đọc thư đầy đủ.
- Xóa import, state mở modal và CSS không còn sử dụng.
- Cập nhật test để xác nhận item Chat/Mail thay đổi đúng khung chi tiết hiện hữu và không tạo popup thứ hai.

## 16. Chuẩn hóa typography và thiết kế lại toàn bộ module

- Thiết lập body và nội dung điều khiển chính ở mức tối thiểu 15 px; nội dung phụ, metadata, thời gian và nhãn hỗ trợ ở mức tối thiểu 13 px.
- Tăng typography thực tế trước đây chỉ 9–12 px trong Chat, Mail, Lịch, Thông báo, bảng Công việc, header và trang đăng nhập.
- Chuẩn hóa page heading, filter toolbar, border, radius, shadow nhẹ, hover, focus và khoảng cách theo design system.
- Công việc: thiết kế lại summary, header bảng, mật độ hàng và trạng thái hover/focus.
- Lịch: tăng vùng bấm, làm rõ ngày/giờ, nội dung sự kiện và pill loại sự kiện.
- Chat: tăng chiều rộng danh sách, active indicator, typography hội thoại và message bubble.
- Mail: tăng vùng đọc, mật độ hàng, active indicator và typography nội dung thư.
- Thông báo: tăng nhịp hàng, độ tương phản metadata và bố cục Drawer.
- Trang đăng nhập, empty state và error state được đồng bộ font chữ tối thiểu.
- Đã dùng Browser skill để thử nghiệm thu trực quan nhưng runtime không cung cấp browser (`[]`), vì vậy không có screenshot/pixel review trong đợt này.

## 17. Mở rộng Chat bằng mock API

- Bổ sung schema thành viên, nhóm, tệp đính kèm và attachment trong tin nhắn.
- Tạo mock store mutable cho hội thoại/tin nhắn, không dùng backend thật hoặc WebSocket.
- Bổ sung API gửi tin, upload metadata tệp tối đa 10 MB, tạo nhóm, thêm và xóa thành viên.
- Xây composer hỗ trợ Enter để gửi, Shift+Enter xuống dòng, chọn/bỏ tệp và trạng thái đang gửi.
- Bổ sung nút tạo nhóm, form validation và lựa chọn nhiều thành viên.
- Bổ sung bảng thông tin hội thoại; nhóm có danh sách, thêm và xóa thành viên, hội thoại cá nhân hiển thị người tham gia.
- Tin nhắn gửi kèm file hiển thị tên, dung lượng và MIME type trong message bubble.
- Dữ liệu mutation tồn tại trong vòng đời ứng dụng và quay về fixture khi khởi động lại.
- Bổ sung 3 test Chat; tổng toàn dự án hiện là 22 test.

## 18. Thiết kế lại Chat theo mô hình web chat đầy đủ

- Chuyển module Chat sang bố cục ba vùng: danh sách hội thoại, luồng tin nhắn và bảng thông tin.
- Danh sách có tìm kiếm, lọc Tất cả/Chưa đọc, sắp xếp hội thoại ghim và active state rõ ràng.
- Header hội thoại chỉ có Tìm tin, Ghim/Bỏ ghim và Thông tin; không có gọi thoại hoặc video.
- Bổ sung tìm kiếm nội dung/tên tệp trong hội thoại và hiển thị số kết quả.
- Tin nhắn được nhóm theo ngày, có trả lời trích dẫn, reaction, xóa tin của mình và action khi hover/focus.
- Composer có emoji picker, gửi tệp, preview tệp, trạng thái trả lời và phím tắt Enter/Shift+Enter.
- Bảng thông tin hiển thị thành viên, thêm/xóa thành viên và danh sách tệp đã chia sẻ.
- Bổ sung mock API ghim hội thoại, reaction và xóa tin; không sử dụng WebSocket.
- Responsive: bảng thông tin chuyển thành panel phủ bên phải ở màn hình hẹp, giữ nguyên luồng chat chính.

## 19. Tối ưu module một màn hình và sửa tương tác Chat

- Loại bỏ page heading lặp lại ở năm module Công việc, Lịch làm việc, Chat, Mail và Thông báo; giữ tên module tại app header.
- Chuyển bộ lọc Lịch, Mail và Thông báo vào toolbar gọn phía trên nội dung để không làm mất chức năng.
- Chuẩn hóa module page theo chiều cao viewport, khóa cuộn trang và chỉ cho vùng danh sách/bảng cần thiết cuộn nội bộ.
- Sửa Chat workspace dùng toàn bộ chiều cao khả dụng, bỏ `min-height` làm composer bị đẩy khỏi màn hình và cố định composer ở đáy khung hội thoại.
- Loại bỏ nút Tạo nhóm tại page heading; chỉ giữ một nút tạo nhóm trong đầu danh sách hội thoại.
- Thiết kế lại thao tác tin nhắn với vùng bấm ổn định cho trả lời, reaction và xóa; bổ sung bảng chọn sáu reaction.
- Reply tự đưa focus về ô nhập; reaction, ghim và xóa có trạng thái đang xử lý và reload dữ liệu sau mutation.
- Bổ sung kiểm thử giao diện cho composer, số lượng nút tạo nhóm, reply, reaction và ghim; tổng toàn dự án là 23 test.
- Đã thử kết nối Browser skill để kiểm tra trực quan nhưng runtime không cung cấp browser, nên không tuyên bố đã pixel-review.

## 20. Chuẩn hóa icon thao tác Chat

- Thay các nút chữ Tìm tin, Ghim, Thông tin, Trả lời, Cảm xúc và Xóa bằng bộ SVG icon nội bộ.
- Mỗi icon-only button có Tooltip và `aria-label` mô tả chính xác hành động.
- Action của từng message ẩn mặc định, chỉ xuất hiện khi hover hoặc khi focus bàn phím đi vào cụm thao tác.
- Composer dùng icon cho đính kèm, emoji và gửi tin nhắn; không cài thêm thư viện icon.

## 21. Bổ sung module Danh bạ

- Bổ sung schema và 18 fixture nhân sự gồm họ tên, chức danh, phòng ban, số điện thoại, email và số nội bộ.
- Bổ sung `GET /api/directory` hỗ trợ `search` và `department`; tìm kiếm xử lý cả chuỗi tiếng Việt không dấu.
- Tạo route `/directory`, icon SVG và mục Danh bạ trong sidebar/app header.
- Module Danh bạ dùng toolbar gọn, tìm kiếm đa trường, lọc phòng ban, bộ đếm kết quả và lưới card responsive trong một màn hình.
- Mỗi card mở popup thông tin liên hệ với liên kết gọi điện/email phù hợp.
- Đưa thanh tìm kiếm Danh bạ lên heading Trang chủ; chọn kết quả mở popup tại chỗ, “Xem tất cả” chuyển sang module riêng.
- Bổ sung 3 test cho API, module và tìm nhanh Trang chủ; tổng toàn dự án là 7 test files, 26/26 test đạt.

## 22. Thiết kế lại item Danh bạ và số nội bộ tùy chọn

- Đổi card từ lưới ba cột chật sang hai cột ở desktop/tablet; chỉ dùng ba cột khi viewport từ 1600 px.
- Tách card thành phần nhận diện và phần liên hệ, dùng `minmax(0, ...)`, ellipsis và title để email dài không phá layout.
- Ưu tiên hiển thị điện thoại và email; số nội bộ chuyển thành badge metadata nhỏ “Máy lẻ” ở góc card.
- Chuyển `DirectoryContact.extension` thành trường tùy chọn và bổ sung fixture nhân sự không có số nội bộ.
- Không render badge hoặc dòng số nội bộ trong card, popup và kết quả tìm kiếm khi dữ liệu không tồn tại.
- Mock API và tìm kiếm cục bộ xử lý an toàn trường số nội bộ thiếu.

## 23. Bút danh, chi tiết Danh bạ và Chat trực tiếp

- Thay trường chức vụ trong `DirectoryContact` bằng bút danh tùy chọn; bút danh nằm sau họ tên để không chiếm thêm một dòng card.
- Đưa nút Chat lên góc trên bên phải mỗi card; số nội bộ chuyển xuống footer phụ và chỉ hiện khi có.
- Tách card thành các vùng tương tác độc lập, tránh button lồng nhau: hồ sơ, Chat và Xem chi tiết.
- Thiết kế lại popup với profile hero, phòng ban, điện thoại/email dạng contact tile, thông tin phụ và CTA Chat rõ ràng.
- Bổ sung mock API tìm hoặc tạo hội thoại cá nhân; điều hướng tới `/chat?conversation=...` và chọn đúng người trong Chat.
- Thiết kế lại thanh tìm Trang chủ thành khối tra cứu có icon, focus state và liên kết module riêng.
- Mỗi kết quả tìm kiếm hiển thị họ tên/bút danh, phòng ban, email, điện thoại và số nội bộ nếu có.
- Bổ sung integration test điều hướng Chat trực tiếp; toàn dự án đạt 27/27 test.

## 24. Thiết kế lại toàn bộ giao diện theo workspace v7

- Đọc và đối chiếu toàn bộ file `khong-gian-lam-viec-so-noi-bo-v7.html` (233.889 byte), xác định hệ token, shell 246/72, 12 module, dashboard, menu tạo nhanh và các modal hành động.
- Thay logo tạm bằng SVG Tuổi Trẻ chính thức tại `src/assets/logo-tuoitre.svg`.
- Tạo stylesheet `src/styles/workspace-v7.css` được nạp cuối để giao diện v7 là lớp hiển thị có thẩm quyền, tránh xung đột với CSS lịch sử.
- Viết lại app shell: sidebar cố định/thu gọn, active indicator đỏ, header tìm Danh bạ toàn cục, tạo nhanh và cụm Chat/Mail/Thông báo.
- Viết lại cấu trúc Trang chủ: hero 116 px, bốn metric có điều hướng, khối Công việc của tôi ưu tiên thị giác và ba widget Lịch/Thông báo/Chat-Mail.
- Tạo `ModuleIntro` và hệ module header/toolbar/stats/list/tile thống nhất; áp dụng cho Công việc, Lịch, Danh bạ, Thông báo và sáu module mở rộng.
- Bổ sung sáu module/route từ mẫu: Đơn & đề xuất, Cloud, Họp trực tuyến, Đánh giá lao động, Thư viện số, Chuyên gia.
- Tách đúng biểu mẫu Tạo họp và Tham gia bằng ID; phân biệt Tải tệp và Tạo thư mục; bổ sung chọn tệp cho Cloud/Thư viện.
- Giữ toàn bộ dữ liệu qua fixtures/service/mock API, không đưa dữ liệu nghiệp vụ vào component và không thêm backend/WebSocket.
- Chuẩn hóa nội dung chính tối thiểu 15 px, phụ tối thiểu 13 px; tăng contrast, focus-visible và responsive tablet.
- Cập nhật test theo nhãn v7, loại race selector bằng cách chờ region nghiệp vụ, cấu hình ngưỡng chờ DOM phù hợp cho Ant Design.
- Nghiệm thu cuối: typecheck đạt; ESLint đạt; 8 test files/37 tests đạt; production build đạt.

## 25. Rà soát toàn bộ page và module theo HTML v7 — 06/08/2026

- Đối chiếu lại cấu trúc app shell, header module, toolbar, vùng nội dung và responsive tablet với file HTML tham chiếu.
- Bổ sung header đúng ngữ cảnh cho Chat và Mail, đồng thời tính lại chiều cao workspace để danh sách, hội thoại và composer nằm gọn trong viewport.
- Tách sáu module mở rộng khỏi bố cục dùng chung: Họp trực tuyến có hero và hai nhóm cuộc họp; Đánh giá có segmented tabs và bảng tổng quan; Đơn & đề xuất có danh sách cùng panel tiến độ; Cloud, Thư viện số và Chuyên gia giữ cấu trúc tile/chuyên gia riêng.
- Chuẩn hóa trang Công việc theo tiêu đề, mô tả và cụm hành động của HTML; bổ sung thao tác làm mới và tạo yêu cầu bằng mock modal, không thay đổi backend hay data flow.
- Chỉnh Thông báo theo ngữ cảnh truyền thông nội bộ và giữ toàn bộ chi tiết/hành động trong mock UI hiện có.
- Bổ sung CSS khóa tràn, `minmax(0, ...)`, cuộn nội bộ và breakpoint tablet cho các layout mới nhằm tránh vỡ card, toolbar và cột nội dung.
- Sửa race condition trong test Danh bạ bằng cách chờ region nghiệp vụ tải xong trước khi thao tác.
- Kiểm tra cuối: ESLint đạt; TypeScript đạt; 8 test files/37 tests đạt; production build đạt.
- Browser skill đã được gọi để nghiệm thu trực quan nhưng runtime trả về `No browser is available`; vì vậy không tuyên bố đã có kiểm chứng pixel-perfect/screenshot tự động.

## 26. Hoàn tác thiết kế theo HTML v7 — 06/08/2026

- Gỡ stylesheet `workspace-v7.css` khỏi entrypoint và loại bỏ các override shell v7 khỏi stylesheet chính.
- Khôi phục sidebar nhận diện chữ `TT`, danh sách 7 module và active state nền primary nhạt như trước đợt áp dụng HTML.
- Khôi phục app header ba vùng: ngữ cảnh ứng dụng, tìm kiếm Danh bạ toàn cục và tài khoản người dùng; loại bỏ menu tạo nhanh cùng badge module của v7.
- Loại bỏ hero v7 trên Trang chủ và các module heading được thêm trong đợt v7.
- Gỡ sáu route/module phát sinh từ file HTML khỏi router và sidebar; source được giữ lại ở trạng thái không truy cập để tránh xóa dữ liệu khó phục hồi.
- Giữ nguyên logic Công việc, Lịch, Chat, Mail, Thông báo, Danh bạ và các popup xử lý đã tồn tại trước v7.
- Dọn stylesheet, component module heading, logo và test suite chỉ thuộc bản v7 sau khi xác nhận không còn nơi sử dụng.
- Nghiệm thu hoàn tác: typecheck đạt; ESLint đạt; 7 test files/30 tests đạt; production build đạt.

## 27. Tách widget liên lạc và tổng hợp công việc nghiệp vụ — 06/08/2026

- Loại bỏ hoàn toàn vùng `app-context`; app header còn tìm kiếm Danh bạ và menu tài khoản.
- Tách “Tin nhắn mới” và “Mail chưa đọc” thành hai widget độc lập, mỗi widget có danh sách, bộ đếm, popup xem nhanh và liên kết xem tất cả riêng.
- Chuẩn hóa dữ liệu Công việc cần xử lý thành hai nguồn: Tài liệu và Đánh giá lao động.
- Bổ sung đơn xin nghỉ phép và đơn xin đi nước ngoài với thông tin người đề nghị, thời gian, điểm đến, bước quy trình cùng thao tác Duyệt/Từ chối.
- Bổ sung tự đánh giá theo quý và chấm điểm nhân viên cấp dưới với điểm số, nhận xét và hành động hoàn tất riêng.
- Không chạy test case theo chỉ dẫn mới của Người giao việc; chỉ chạy typecheck, ESLint và production build.

## 28. Nâng cấp Mail theo trải nghiệm Gmail — 06/08/2026

- Thiết kế lại module Mail thành ba vùng: thư mục, danh sách thư và nội dung chi tiết.
- Bổ sung Hộp thư đến, Gắn sao, Đã gửi, Bản nháp, Lưu trữ, Thư rác và Thùng rác.
- Bổ sung soạn thư, Cc/Bcc, nhiều người nhận, tệp đính kèm, lưu bản nháp và tìm kiếm toàn hộp thư.
- Bổ sung trả lời, trả lời tất cả, chuyển tiếp, đọc/chưa đọc, gắn sao, lưu trữ, báo spam, xóa và khôi phục qua mock API.
- Nâng popup Mail tại Trang chủ thành cửa sổ làm việc trực tiếp với đầy đủ Trả lời, Trả lời tất cả, Chuyển tiếp và nhóm thao tác quản lý thư.
- Sửa thanh tìm Danh bạ bị vỡ do selector `app-header > div:first-child` ép AutoComplete sang `flex-column`; trả lại layout grid và bổ sung `min-width: 0`.
- Không chạy test case theo yêu cầu; typecheck, ESLint và build đều đạt.

## 29. Tinh chỉnh Trang chủ, avatar, Thông báo và sidebar — 07/08/2026

- Bỏ mức ưu tiên khỏi danh sách Công việc cần xử lý; thay nhãn nguồn bằng icon Tài liệu/Đánh giá lao động và giảm độ nổi bật của nút Chi tiết.
- Thiết kế lại bốn metric Trang chủ với lưới ba vùng an toàn, arrow có vùng chứa riêng, ellipsis và breakpoint tablet để không vỡ layout.
- Tạo hệ tám màu avatar xác định theo tên và áp dụng cho tài khoản, Danh bạ, Chat, Mail cùng widget Trang chủ.
- Loại bỏ thao tác Xem chi tiết ở item Danh bạ; toàn bộ thông tin cần thiết nằm trực tiếp trên card, chỉ giữ Chat.
- Gỡ Thông báo khỏi sidebar và đưa nút chuông có badge chưa đọc lên cạnh avatar người dùng.
- Viết lại filter Thông báo trên một nguồn dữ liệu thống nhất; thiết kế trang thành overview, toolbar và danh sách card.
- Chuyển chi tiết Thông báo từ Drawer sang Modal giữa màn hình, có xác nhận đã nắm thông tin.
- Di chuyển nút Thu gọn menu thành nút icon nhỏ ở phía trên khu vực logo.
- Không chạy test case theo yêu cầu; typecheck, ESLint và build đều đạt.

## 30. Thông báo read-only và module Họp trực tuyến — 07/08/2026

- Thiết kế lại overview Thông báo thành phần nhận diện module và ba chỉ số Tất cả/Chưa xem/Quan trọng.
- Sắp xếp lại toolbar với tìm kiếm ưu tiên, filter Tất cả/Chưa xem/Quan trọng/Mới nhất và thao tác đánh dấu tất cả đã xem.
- Loại bỏ toàn bộ thao tác xác nhận đã nắm thông tin ở page và popup Trang chủ; Thông báo chỉ cho phép xem.
- Tăng khác biệt thị giác giữa thông báo Chưa xem và Đã xem bằng nền, viền, trạng thái chữ và cập nhật trạng thái khi mở.
- Đổi tên module Lịch làm việc thành Họp trực tuyến trên sidebar, Trang chủ và popup; giữ route `/calendar` để bảo toàn điều hướng.
- Thay dữ liệu lịch bằng tám cuộc họp trực tuyến có nền tảng, ID phòng, liên kết, nội dung, người tham gia và trạng thái phản hồi.
- Thiết kế module Họp trực tuyến với overview, tìm kiếm, khoảng thời gian, filter phản hồi, danh sách card và avatar người tham gia.
- Thiết kế lại modal chi tiết với thời gian, thông tin phòng, nội dung, danh sách người tham gia và thao tác phản hồi/tham gia mô phỏng.
- Không chạy test case theo yêu cầu; typecheck, ESLint và production build đều đạt.
## 31. Xây dựng module Tài liệu theo quy trình xét duyệt — 07/08/2026

- Bổ sung route `/documents` và mục Tài liệu trong sidebar với icon module thống nhất.
- Thiết kế vùng tổng quan, hai thẻ tài liệu mẫu, bộ lọc, tìm kiếm, danh sách tài liệu của tôi và danh sách chờ duyệt.
- Dựng Đơn xin nghỉ phép theo bố cục logo, tiêu đề và trường gạch chấm của ảnh tham chiếu.
- Dựng Phiếu đề xuất đi nước ngoài theo thể thức văn bản hành chính: cơ quan, quốc hiệu, tiêu ngữ, ngày lập, trường đánh số, kinh phí và các vùng ký duyệt.
- Tạo modal biểu mẫu riêng theo từng mẫu; dữ liệu được gửi vào mock API thay vì hard-code trong component.
- Tạo modal chi tiết gồm bản xem văn bản, mã hồ sơ, lịch sử từng cấp và thao tác Duyệt/Từ chối trực tiếp.
- Mỗi mẫu có quy trình ba cấp riêng; khi duyệt, hồ sơ tự chuyển cấp tiếp theo, khi từ chối quy trình kết thúc.
- Không chạy test case theo yêu cầu trực tiếp của Người giao việc; thực hiện typecheck, ESLint và production build.

## 32. Tinh chỉnh logo và phân luồng module Tài liệu — 07/08/2026

- Sao chép nguyên bản `logo-tuoitre-2026-do-chu.svg` vào assets và sử dụng cho sidebar, trang đăng nhập và biểu mẫu tài liệu.
- Loại bỏ mã đơn khỏi danh sách, tiêu đề chi tiết và panel thông tin tài liệu.
- Loại bỏ khu chọn mẫu cố định khỏi page; bổ sung nút `Tạo tài liệu` mở popup chọn mẫu.
- Khi điền tài liệu mới không còn hiển thị quy trình xét duyệt.
- Chia danh sách thành ba tab: `Đã gửi`, `Chờ xử lý`, `Đã xử lý`.
- Sau khi Duyệt/Từ chối, tài liệu tự chuyển từ `Chờ xử lý` sang `Đã xử lý` trong mock store.
- Đổi nhãn hành động `Duyệt & chuyển bước` thành `Duyệt`.
- Không chạy test case theo yêu cầu; thực hiện typecheck, ESLint và production build.
## 33. Đồng bộ xử lý Tài liệu với Công việc — 07/08/2026

- Chuyển nguồn công việc Tài liệu sang `documentSubmissionStore`; không còn duy trì hai luồng xử lý độc lập.
- Tự động tạo item Công việc từ tài liệu thuộc tab `Chờ xử lý`, kèm người gửi, đơn vị, thời gian, nơi đến và bước hiện tại.
- Trang chủ và module Công việc cùng mở `DocumentDetailModal` chuẩn của module Tài liệu.
- Loại bỏ toàn bộ giao diện Duyệt/Từ chối Tài liệu cũ khỏi `TaskDetailQuickView`; component này chỉ còn xử lý Đánh giá lao động và công việc thường.
- Khi Duyệt/Từ chối ở Trang chủ hoặc Công việc, mock API cập nhật tài liệu sang `Đã xử lý`; item đồng thời biến mất khỏi danh sách công việc chờ xử lý.
- Đồng bộ lại tổng quan công việc từ nguồn dữ liệu kết hợp Tài liệu và Đánh giá lao động.
- Không chạy test case theo yêu cầu; typecheck, ESLint và production build đều đạt.
## 34. Tinh chỉnh sidebar, Công việc, Mail và thiết kế lại Thông báo — 07/08/2026

- Sidebar chỉ còn logo Tuổi Trẻ kích thước lớn; loại bỏ cụm chữ Không gian làm việc/ERP nội bộ.
- Đặt nút thu gọn tại tâm theo chiều dọc của logo và đè ra ngoài 50% mép phải sidebar.
- Bổ sung ba hồ sơ Tài liệu chờ duyệt với dữ liệu đầy đủ, nâng tổng số hồ sơ Tài liệu chờ xử lý lên bốn.
- Module Công việc bỏ cột Mức độ ưu tiên và Tiến độ; đổi Hạn xử lý thành Ngày gửi đến lấy từ thời điểm hồ sơ/công việc được giao.
- Module Mail loại bỏ thư mục Có gắn sao, thao tác gắn sao và toàn bộ nhãn ở sidebar, tìm kiếm, danh sách và chi tiết.
- Viết lại module Thông báo thành workspace hai vùng: điều hướng/thống kê bên trái và vùng danh sách/tìm kiếm bên phải.
- Thiết kế lại item Thông báo, trạng thái đã xem/chưa xem và modal đọc nội dung theo phong cách văn bản nội bộ.
- Không chạy test case theo yêu cầu; typecheck, ESLint và production build đều đạt.
## 35. Logo collapse, trạng thái Thông báo và trải nghiệm Mail — 07/08/2026

- Đưa ảnh PNG `07625108-8b44-4b75-9b19-6ce57ac0c709-2.png` vào source dưới dạng data asset nguyên bản và chỉ sử dụng khi sidebar thu gọn.
- Khi chọn Trang chủ hoặc bất kỳ menu module nào, sidebar tự chuyển sang trạng thái collapse.
- Loại bỏ chữ Đã xem/Chưa xem khỏi item và modal Thông báo; phân biệt bằng chấm báo, nền, độ đậm và độ tương phản, đồng thời giữ aria-label cho accessibility.
- Đồng bộ widget và popup Thông báo Trang chủ với trạng thái thị giác mới.
- Bổ sung avatar màu theo người gửi cho danh sách Mail và popup Mail Trang chủ.
- Thiết kế lại modal Thư mới, Trả lời, Trả lời tất cả và Chuyển tiếp theo design system sáng, gọn và thống nhất.
- Thiết kế lại vùng đính kèm Mail thành drop-style field có mô tả, danh sách tệp và thao tác bỏ tệp; đồng bộ card tệp đính kèm trong Chat.
- Đổi tiêu đề popup Mail Trang chủ từ `Xử lý Mail` thành `Mail` và loại bỏ thao tác gắn sao còn sót lại.
- Không chạy test case theo yêu cầu; typecheck, ESLint và production build đều đạt.
