# Báo cáo kết quả thực hiện

## 25. Kết quả modal và badge dữ liệu — 07/08/2026

- Họp trực tuyến: một icon Meeting ở title và một nút `Tham gia phòng họp`.
- Chat nhanh: avatar, tên và trạng thái hiện diện nằm gọn trong title modal.
- Tab: badge số lượng được tính trực tiếp từ dữ liệu của Tài liệu, Chat, Họp và Thông báo.
- Mail: số lượng từng thư mục được tính từ toàn bộ mail store, không phụ thuộc thư mục đang mở.
- Menu: badge lấy từ mock API và dùng đúng ngữ nghĩa cần chú ý/chưa đọc/hôm nay cho từng module.
- Typecheck: **PASS** — `npm.cmd run typecheck`, exit code 0.
- ESLint: **PASS** — `npm.cmd run lint`, exit code 0.
- Build: **PASS** — 1.477 modules transformed; CSS 153,56 kB, JS 1.293,63 kB.
- Build còn cảnh báo bundle JavaScript lớn hơn 500 kB; không ảnh hưởng kết quả build.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.

## 24. Kết quả tinh chỉnh Thông báo, Tài liệu, Chat và Mail — 07/08/2026

- Popup Trang chủ: không còn lặp tiêu đề giữa thanh tiêu đề và nội dung.
- Thông báo: giao diện notification center mới; không còn mức độ Khẩn/Quan trọng/Thông thường; vẫn phân biệt rõ đã xem/chưa xem.
- Tài liệu: tab gọn, không hiển thị số trong ngoặc; tiêu đề và mô tả có khoảng cách rõ ràng.
- Chat: icon button thẳng hàng, vùng bấm đồng nhất và hover dễ nhận biết.
- Mail: tìm kiếm mở rộng, filter kiểu Gmail, preview Thư nháp đúng ngữ cảnh và icon phân loại tệp đính kèm.
- Typecheck: **PASS** — `npm.cmd run typecheck`, exit code 0.
- ESLint: **PASS** — `npm.cmd run lint`, exit code 0.
- Build: **PASS** — 1.476 modules transformed; CSS 151,30 kB, JS 1.292,96 kB.
- Build còn cảnh báo bundle JavaScript lớn hơn 500 kB; không ảnh hưởng kết quả build.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.

## 23. Kết quả đồng bộ UX và hoàn thiện Mail/Thông báo — 07/08/2026

- Sidebar: tooltip ngang khi collapse; logo/header cùng chiều cao 68 px.
- Thông báo: lọc theo nguồn module, trạng thái đọc trực quan và nguồn Trang chủ giới hạn đúng ở Thông báo cơ quan.
- Popup Trang chủ: title theo mail, người chat, cuộc họp hoặc thông báo đang mở; Mail có phản hồi và tệp đính kèm đầy đủ.
- Chat: tên và trạng thái hoạt động không còn dính trên cùng một dòng.
- Mail: bản nháp có thể lưu, mở lại, cập nhật, tự lưu khi đóng và gửi như một thư đang soạn; tệp đính kèm được giữ trong mock API.
- Typecheck: **PASS** — `npm.cmd run typecheck`, exit code 0.
- ESLint: **PASS** — `npm.cmd run lint`, exit code 0.
- Build: **PASS** — 1.475 modules transformed; CSS 140,78 kB, JS 1.291,09 kB.
- Build còn cảnh báo bundle JavaScript lớn hơn 500 kB; không ảnh hưởng kết quả build.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.

## 1. Tổng quan

- Trạng thái: Hoàn thành source và toàn bộ kiểm tra tự động bắt buộc.
- Phạm vi đã hoàn thành: authentication, app shell, dashboard, 6 module, mock API, UI states, responsive CSS từ 768 px, accessibility cơ bản, test và README.
- Tài khoản demo: `nhanvien / 123456`.

## 2. Các route

- `/login`: đăng nhập.
- `/`: dashboard.
- `/tasks`: Công việc.
- `/calendar`: Lịch làm việc.
- `/chat`: web chat ba vùng với gửi tin/file, emoji, reply, reaction, tìm kiếm, ghim, tạo nhóm và quản lý thành viên qua mock API; không gọi thoại/video và không realtime.
- `/mail`: Mail read-only.
- `/announcements`: Thông báo cơ quan read-only.
- `/directory`: Danh bạ nội bộ với tìm kiếm, lọc phòng ban và xem nhanh thông tin liên hệ.
- `/*`: 404 trong app shell đối với người đã đăng nhập.

## 3. Các tính năng đã hoàn thành

- Đăng nhập đúng/sai, session giả lập, protected route và đăng xuất.
- Sidebar, header, active navigation, avatar/menu tài khoản và tablet collapse.
- Dashboard ưu tiên khối Công việc, có tổng quan, lịch, thông báo, mail và chat; khu “Truy cập nhanh” đã được bỏ theo yêu cầu UI mới của người giao việc.
- Mọi item nội dung trên trang chủ mở popup riêng theo module; chỉ liên kết “Xem tất cả” điều hướng sang module riêng.
- Popup Chi tiết Công việc tích hợp cập nhật trạng thái và tiến độ ngay bên dưới nội dung; không còn bước chuyển sang popup xử lý khác.
- Mỗi module chỉ có một cơ chế chi tiết: Công việc/Lịch dùng popup, Chat/Mail dùng khung chi tiết có sẵn, Thông báo dùng Drawer.
- Danh sách Công việc cần xử lý dùng bố cục quét nhanh, không hiển thị các nhãn trường lặp lại và tự giảm thông tin trên tablet.
- Công việc có popup chi tiết read-only riêng và có thể chuyển trực tiếp sang popup xử lý.
- Sidebar dùng bộ icon SVG nét đơn sắc, không nền; mục đang chọn có nền primary nhạt và không còn mô tả phụ.
- Năm module có filter/read-only interaction theo tài liệu và không có CRUD.
- Riêng Chat được mở rộng theo chỉ đạo mới: gửi tin, file, tạo nhóm, xem thông tin và thêm/xóa thành viên bằng mock API.
- Chat có thêm lọc chưa đọc, tìm trong hội thoại, ghim, reply, reaction, xóa tin của mình và bảng tệp chia sẻ.
- Các thao tác Chat ưu tiên icon SVG riêng kèm tooltip; action của mỗi message chỉ hiện khi hover hoặc focus bàn phím.
- Danh bạ có 18 nhân sự, bút danh tùy chọn, tìm kiếm không dấu theo mọi trường liên hệ, lọc phòng ban và popup thông tin chi tiết.
- Card Danh bạ ưu tiên điện thoại/email; số nội bộ là dữ liệu tùy chọn và chỉ hiện dưới dạng metadata phụ khi có.
- Mỗi card và popup Danh bạ có nút Chat, dùng mock API để tìm/tạo rồi mở đúng hội thoại cá nhân.
- Trang chủ có thanh tìm kiếm Danh bạ; chọn kết quả mở xem nhanh tại chỗ, liên kết “Xem tất cả” mới chuyển sang `/directory`.
- Loading/skeleton, empty, error và success có thể kiểm tra bằng query state.
- Dữ liệu nghiệp vụ tiếng Việt, hợp lý và nằm trong fixture/service thay vì component.

## 4. Kiến trúc chính

- Tổ chức source theo feature/module.
- React context quản lý auth; React state/custom hook quản lý state từng trang.
- Shared component chỉ dùng cho page header, async states và status tag.
- Tailwind/CSS dùng cho layout, spacing, responsive; Ant Design dùng cho form, table, select, pagination, drawer, empty và skeleton.
- Không thêm Redux, Zustand hoặc thư viện kiến trúc lớn.

## 5. Mock API

- Có response JSON typed qua `ApiResponse<T>`.
- Có endpoint auth, dashboard, tasks, calendar, chat conversations/messages/members/attachments/groups/pin/reactions/delete, mail list/detail, announcements list/detail và directory search/filter.
- Filter API cho task status/priority, calendar type, mail unread/starred và announcement important.
- Query simulation: `?state=loading`, `?state=empty`, `?state=error`.
- Dữ liệu mẫu: 12 tasks, 8 events, 8 conversations, 12 messages, 15 mails, 10 announcements và 18 directory contacts.

## 6. Kiểm thử

- Typecheck: **PASS** — `npm run typecheck`, exit code 0, không có lỗi.
- ESLint: **PASS** — `npm run lint`, exit code 0, không có error hoặc warning.
- Unit/integration test: **PASS** — 7 test files, 27/27 tests pass.
- Build: **PASS** — Vite build thành công, 1467 modules transformed.
- Dev server: **PASS** — Vite sẵn sàng tại `http://127.0.0.1:4173`.
- Bundle chính: 1,225.27 kB, gzip 385.06 kB; Vite cảnh báo chunk lớn hơn 500 kB.

## 7. Responsive và accessibility

- CSS hỗ trợ desktop và tablet; sidebar thu gọn, dashboard đổi cột và table cho phép cuộn ngang có chủ đích.
- Phạm vi dưới 768 px không được tối ưu, đúng yêu cầu.
- Form có label và validation message; navigation dùng `nav`; icon-only/menu button có accessible name.
- Focus-visible toàn cục, text đi kèm semantic color, button/list có keyboard focus.
- Nhãn ưu tiên và trạng thái có thêm hình dạng, ký hiệu và nhãn chữ nên không dựa duy nhất vào màu.
- Typography toàn ứng dụng được chuẩn hóa: nội dung chính tối thiểu 15 px, nội dung phụ tối thiểu 13 px.
- Năm module được tăng vùng bấm, khoảng cách hàng, contrast, hover, focus và active state để dễ quét dữ liệu hơn.
- Đã thử kết nối Browser skill để nghiệm thu trực quan nhưng runtime không cung cấp browser nào (`[]`). Vì vậy chưa có xác minh pixel/screenshot trên browser thật; không tuyên bố đã visual regression test.

## 8. Các quyết định kỹ thuật

- Dùng lớp mock API trong trình duyệt thay cho MSW handler vì hợp đồng cho phép “MSW hoặc lớp mock API tương đương”; lớp này vẫn giữ endpoint, JSON, filter và UI state rõ ràng.
- Dùng `sessionStorage` để session demo kết thúc khi đóng tab.
- Chạy Vitest tuần tự (`--maxWorkers=1`) trong nghiệm thu để tránh tranh chấp tài nguyên jsdom/Ant Design; không tăng test timeout.
- Giữ target ES2020 và sửa code tương thích thay vì nâng target.

## 9. Giới hạn đúng theo phạm vi

- Không backend/database thật.
- Không backend/database thật, realtime hoặc WebSocket; mutation Chat chỉ nằm trong mock store và reset khi khởi động lại.
- Soạn/gửi/trả lời/chuyển tiếp Mail chỉ hoạt động trong mock API, không gửi ra hệ thống thật.
- Không tạo/sửa/xoá lịch hoặc thông báo.
- Không dark mode, phân quyền chi tiết hoặc tối ưu mobile dưới 768 px.
- Chưa code-split theo route; build hiện có cảnh báo bundle lớn nhưng không ảnh hưởng build thành công.
- `npm install` báo 6 dependency vulnerabilities (2 low, 3 moderate, 1 high). Không chạy `npm audit fix --force` vì có thể tạo breaking change ngoài phạm vi; cần đánh giá dependency riêng trước khi phát hành thật.

## 10. File quan trọng

- `README.md` — hướng dẫn chạy và kiểm tra.
- `src/routes/AppRoutes.tsx` — toàn bộ route.
- `src/features/auth/AuthContext.tsx` — session và auth.
- `src/layouts/AppLayout.tsx` — app shell.
- `src/features/dashboard/DashboardPage.tsx` — dashboard.
- `src/features/dashboard/quickViews/*` — năm popup chuyên biệt theo module.
- `src/components/ModuleIcon.tsx` — bộ icon SVG riêng theo module.
- `src/mocks/fixtures.ts` — dữ liệu nghiệp vụ mẫu.
- `src/services/mockApi.ts` — mock API dispatcher.
- `src/styles/index.css` — design system và responsive.
- `src/styles/workspace-v7.css` — lớp thiết kế lại toàn diện theo file HTML v7.
- `src/features/auth/auth.test.tsx` cùng các test suite còn lại — bằng chứng chức năng quan trọng.

## 11. Bàn giao giao diện workspace v7 — 06/08/2026

- Trạng thái: hoàn thành thiết kế lại cấu trúc giao diện theo file HTML tham chiếu, giữ nguyên kiến trúc React/TypeScript và logic mock API.
- App shell: logo Tuổi Trẻ chính thức, sidebar 246 px có thu gọn, topbar 72 px, tìm Danh bạ toàn cục, tạo nhanh, badge Chat/Mail/Thông báo.
- Trang chủ: hero gọn, bốn metric điều hướng, Công việc của tôi, Lịch, Thông báo và Chat/Mail theo bố cục v7.
- Module hiện có: Công việc, Lịch, Chat, Mail, Thông báo, Danh bạ được đồng bộ surface, spacing, typography và interaction.
- Module bổ sung: `/requests`, `/cloud`, `/meetings`, `/evaluations`, `/library`, `/experts` với tìm kiếm, lọc, thống kê, chi tiết và hành động mock phù hợp.
- Typography: nội dung chính từ 15 px; nội dung phụ từ 13 px; trạng thái/focus không chỉ dựa vào màu.
- Responsive: desktop và tablet từ 768 px; sidebar tự chuyển dạng gọn, grid giảm cột, toolbar wrap có kiểm soát.
- Typecheck: `npm run typecheck` — đạt, 48,3 giây.
- ESLint: `npm run lint` — đạt, không lỗi/cảnh báo, 61,6 giây.
- Unit/integration test: `npm run test` — 8 file đạt, 37/37 test đạt, 258,17 giây.
- Build: `npm run build` — đạt, 1.474 module transformed, 38,73 giây.
- Ghi chú build: Vite cảnh báo JS chunk 1.267,91 kB (gzip 397,07 kB); đây là cảnh báo tối ưu tải, không phải lỗi build. Chưa tách route lazy vì không thay đổi kiến trúc ngoài yêu cầu UI.
- Giới hạn kiểm chứng: runtime không cung cấp browser cho Browser skill nên chưa có screenshot/pixel regression tự động; đã kiểm chứng bằng DOM integration tests, typecheck, lint và build.

## 12. Kết quả rà soát toàn bộ page/module — 06/08/2026

- Phạm vi: toàn bộ route dashboard, Công việc, Lịch, Chat, Mail, Thông báo, Danh bạ, Đơn & đề xuất, Cloud, Họp trực tuyến, Đánh giá lao động, Thư viện số và Chuyên gia.
- Kết quả UI: app shell và module header đồng bộ HTML v7; các module mở rộng có bố cục chuyên biệt; Chat/Mail sử dụng đúng chiều cao viewport; breakpoint tablet và vùng cuộn nội bộ đã được gia cố để tránh vỡ layout.
- Typecheck: **PASS** — `npm run typecheck`, exit code 0.
- ESLint: **PASS** — `npm run lint`, exit code 0.
- Unit/integration test: **PASS** — 8 test files, 37/37 tests, 241,46 giây.
- Build: **PASS** — 1.474 modules transformed, 30,86 giây.
- Bundle production: CSS 117,41 kB (gzip 20,71 kB); JS 1.271,73 kB (gzip 397,84 kB). Vite cảnh báo chunk JS lớn hơn 500 kB nhưng build không lỗi.
- Giới hạn xác minh: môi trường Browser skill không có browser khả dụng, nên mức “giống 100%” chưa thể được chứng minh bằng ảnh chụp/pixel diff. Cấu trúc, hành vi responsive, DOM và chất lượng build đã được xác minh tự động.

## 13. Kết quả hoàn tác thiết kế HTML v7 — 06/08/2026

- Trạng thái: đã trả giao diện đang chạy về thiết kế trước khi áp dụng file HTML v7.
- Routes hoạt động trở lại đúng nhóm trước v7: `/`, `/tasks`, `/calendar`, `/chat`, `/mail`, `/announcements`, `/directory` và route 404.
- Các chức năng mock API, popup chi tiết/xử lý, Chat, Mail và Danh bạ được giữ nguyên.
- Các route và thành phần mở rộng riêng của mẫu v7 không còn xuất hiện trong điều hướng hoặc giao diện đang chạy.
- Typecheck: **PASS** — `npm run typecheck`, exit code 0.
- ESLint: **PASS** — `npm run lint`, exit code 0.
- Unit/integration test: **PASS** — 7 test files, 30/30 tests, 167,36 giây.
- Build: **PASS** — 1.467 modules transformed, 27,44 giây.
- Bundle production sau hoàn tác: CSS 85,04 kB (gzip 14,98 kB); JS 1.240,50 kB (gzip 389,62 kB).
- Browser skill vẫn trả về `No browser is available`; chưa thể tạo screenshot xác minh trực quan trong môi trường hiện tại.

## 14. Kết quả cập nhật Trang chủ và luồng Công việc — 06/08/2026

- Header: đã loại bỏ `app-context` và phân bổ lại lưới cho tìm kiếm Danh bạ cùng tài khoản.
- Trang chủ: Chat và Mail là hai box riêng, không còn tab dùng chung.
- Công việc: dữ liệu tổng hợp từ module Tài liệu và Đánh giá lao động; popup xử lý theo đúng loại nghiệp vụ.
- Dữ liệu và thao tác hiện là mock API/UI state, không có backend workflow thật.
- Typecheck: **PASS** — `npm run typecheck`, exit code 0.
- ESLint: **PASS** — `npm run lint`, exit code 0.
- Build: **PASS** — build cuối sau khi loại bỏ `app-context`, 1.467 modules transformed, 55,31 giây.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.

## 19. Kết quả tinh chỉnh module Tài liệu — 07/08/2026

- Logo chính thức: đã bundle thành asset SVG 19,19 kB và dùng thống nhất trong web/tài liệu.
- Tạo tài liệu: nút `Tạo tài liệu` → popup chọn mẫu → biểu mẫu tương ứng → gửi.
- Phân loại: `Đã gửi` dành cho tài liệu người dùng tạo; `Chờ xử lý` dành cho tài liệu người khác cần người dùng duyệt; `Đã xử lý` lưu tài liệu người dùng đã duyệt/từ chối.
- Mã đơn: không còn hiển thị trên UI.
- Typecheck: **PASS** — exit code 0.
- ESLint: **PASS** — exit code 0, không lỗi và không warning.
- Build: **PASS** — 1.474 modules transformed; SVG logo được xuất thành asset riêng.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.
- Xác minh trình duyệt: môi trường Browser không có browser khả dụng; chưa thể chụp ảnh kiểm chứng trực quan.

## 15. Kết quả nâng cấp Mail và tìm kiếm Danh bạ — 06/08/2026

- Mail có đầy đủ nhóm tính năng mock cốt lõi theo trải nghiệm Gmail: thư mục, nhãn, soạn/gửi, Cc/Bcc, đính kèm, bản nháp, reply/reply-all/forward và quản lý trạng thái thư.
- Popup Mail Trang chủ cho phép xử lý trực tiếp mà không cần điều hướng sang module.
- Thanh tìm kiếm Danh bạ trên app header đã được sửa cấu trúc hiển thị.
- Typecheck: **PASS** — `npm run typecheck`, exit code 0.
- ESLint: **PASS** — `npm run lint`, exit code 0, không warning.
- Build: **PASS** — 1.468 modules transformed, 29,76 giây.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.

## 16. Kết quả tinh chỉnh UX — 07/08/2026

- Công việc Trang chủ sử dụng icon nguồn nghiệp vụ, không hiển thị ưu tiên và có CTA Chi tiết trung tính.
- Bốn metric, avatar toàn cục, item Danh bạ và nút thu gọn sidebar đã được thiết kế lại.
- Thông báo chuyển lên app header; page filter được sửa và chi tiết sử dụng modal trung tâm.
- Typecheck: **PASS** — `npm run typecheck`, exit code 0.
- ESLint: **PASS** — `npm run lint`, exit code 0, không warning.
- Build: **PASS** — build cuối sau khi chuẩn hóa icon chuông, 1.469 modules transformed, 21,89 giây.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.

## 17. Kết quả Thông báo và Họp trực tuyến — 07/08/2026

- Thông báo: read-only, filter mới, overview/toolbar mới, phân biệt Chưa xem/Đã xem và modal trung tâm.
- Họp trực tuyến: thay thế giao diện Lịch làm việc trên toàn bộ ứng dụng, có danh sách và modal chuyên biệt.
- Route kỹ thuật vẫn là `/calendar`; nhãn, icon và nội dung người dùng đều là Họp trực tuyến.
- Typecheck: **PASS** — `npm run typecheck`, exit code 0.
- ESLint: **PASS** — `npm run lint`, exit code 0, không warning.
- Build: **PASS** — 1.469 modules transformed, 26,72 giây.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.
## 18. Kết quả module Tài liệu — 07/08/2026

- Route: `/documents`.
- Mẫu hỗ trợ: Đơn xin nghỉ phép và Phiếu đề xuất đi nước ngoài.
- Luồng người gửi: chọn mẫu → điền thông tin → xem trước quy trình → gửi → theo dõi trạng thái.
- Luồng người duyệt: mở chi tiết → xem nguyên bản tài liệu và lịch sử → nhập ý kiến → Duyệt/chuyển bước hoặc Từ chối.
- Mock API: lấy danh sách mẫu, lấy danh sách hồ sơ, tạo hồ sơ và xử lý từng cấp; dữ liệu chỉ tồn tại trong phiên trình duyệt.
- UI state: loading, empty, error và success thông qua lớp dữ liệu dùng chung.
- Responsive: danh sách, biểu mẫu và panel quy trình chuyển bố cục an toàn trên tablet từ 768 px.
- Typecheck: **PASS** — `npm run typecheck`, exit code 0.
- ESLint: **PASS** — `npm run lint`, exit code 0, không lỗi và không warning.
- Build: **PASS** — 1.473 modules transformed; CSS 122,25 kB (gzip 20,60 kB), JS 1.283,42 kB (gzip 399,99 kB).
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.
## 20. Kết quả đồng bộ Tài liệu và Công việc — 07/08/2026

- Trang chủ: item Tài liệu mở nguyên bản biểu mẫu và xử lý bằng modal chuẩn của module Tài liệu.
- Module Công việc: hàng Tài liệu mở cùng modal, cùng lịch sử quy trình và cùng mock API.
- Nguồn dữ liệu: công việc Tài liệu được suy ra trực tiếp từ hồ sơ `pending_review`, không còn fixture xử lý song song.
- Sau xử lý: tài liệu chuyển sang `Đã xử lý` và được loại khỏi Công việc cần xử lý ở cả hai page.
- Typecheck: **PASS** — exit code 0.
- ESLint: **PASS** — exit code 0, không lỗi và không warning.
- Build: **PASS** — 1.474 modules transformed.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.
## 21. Kết quả cập nhật giao diện tổng hợp — 07/08/2026

- Sidebar: logo chính thức lớn, không còn mô tả phụ; nút collapse nằm đè nửa ngoài mép sidebar.
- Công việc: bảng còn Công việc, Ngày gửi đến và Trạng thái; dữ liệu Tài liệu chờ xử lý có bốn hồ sơ.
- Mail: không còn Có gắn sao và hệ thống nhãn trên UI.
- Thông báo: giao diện workspace mới, filter rõ ràng, tìm kiếm, số liệu nhanh, danh sách dễ quét và modal đọc mới.
- Typecheck: **PASS** — exit code 0.
- ESLint: **PASS** — exit code 0, không lỗi và không warning.
- Build: **PASS** — 1.474 modules transformed; CSS 132,05 kB, JS 1.285,72 kB.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.
## 22. Kết quả đồng bộ nhận diện và Mail/Thông báo — 07/08/2026

- Sidebar collapse: dùng đúng ảnh PNG được cung cấp; menu tự đóng sau điều hướng.
- Thông báo: trạng thái đọc thể hiện bằng nhiều dấu hiệu thị giác, không còn text trạng thái trực tiếp; Trang chủ dùng cùng quy tắc.
- Mail: danh sách có avatar màu; modal phản hồi/chuyển tiếp mới; vùng đính kèm mới và popup Trang chủ mang tiêu đề `Mail`.
- Attachment: Mail và Chat sử dụng cùng tinh thần card tệp rõ tên, dung lượng, icon và thao tác xóa.
- Typecheck: **PASS** — exit code 0.
- ESLint: **PASS** — exit code 0, không lỗi và không warning.
- Build: **PASS** — 1.475 modules transformed; CSS 137,29 kB, JS 1.288,65 kB.
- Test case: **KHÔNG CHẠY** theo yêu cầu trực tiếp của Người giao việc.
