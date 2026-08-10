import type { ExpertRecord, WorkspaceFile, WorkspaceRecord } from '@/types/extended';

export const requestRecords: WorkspaceRecord[] = [
  { id: 'request-leave', title: 'Đơn xin nghỉ phép', subtitle: '12/08–13/08/2026 · Gửi ngày 05/08', status: 'Chờ duyệt', category: 'Nghỉ phép', description: 'Nghỉ phép năm để giải quyết việc gia đình. Công việc đã được bàn giao cho Nguyễn Thị Mai.', meta: [{ label: 'Số ngày', value: '2 ngày' }, { label: 'Đã nghỉ trong năm', value: '5/12 ngày' }, { label: 'Người duyệt', value: 'Trưởng phòng' }] },
  { id: 'request-equipment', title: 'Đề xuất mua thiết bị phòng họp', subtitle: 'Ngân sách dự kiến 48.000.000 đ', status: 'Đã duyệt', category: 'Mua sắm', description: 'Trang bị màn hình trình chiếu, camera hội nghị và micro cho phòng họp B.', meta: [{ label: 'Người gửi', value: 'Nguyễn Thị Mai' }, { label: 'Ngân sách', value: '48.000.000 đ' }, { label: 'Báo giá', value: '3 nhà cung cấp' }] },
  { id: 'request-trip', title: 'Đề xuất công tác Hà Nội', subtitle: '20/08–22/08/2026 · Cần bổ sung dự toán', status: 'Từ chối', category: 'Công tác', description: 'Tham dự hội thảo chuyển đổi số báo chí tại Hà Nội.', meta: [{ label: 'Dự toán', value: '12.500.000 đ' }, { label: 'Người duyệt', value: 'Trưởng phòng' }, { label: 'Lý do', value: 'Thiếu chi tiết lưu trú' }] },
];

export const cloudRecords: WorkspaceFile[] = [
  { id: 'cloud-reports', title: 'Báo cáo 2026', subtitle: '18 tệp · Cập nhật hôm qua', kind: 'folder', category: 'Thư mục', description: 'Tập hợp báo cáo định kỳ năm 2026 của đơn vị.', meta: [{ label: 'Chủ sở hữu', value: 'Nguyễn Minh Anh' }, { label: 'Quyền truy cập', value: 'Người trong đơn vị' }] },
  { id: 'cloud-meetings', title: 'Tài liệu họp', subtitle: '12 tệp · Cập nhật 2 giờ trước', kind: 'folder', category: 'Thư mục', description: 'Biên bản và tài liệu dùng trong các cuộc họp gần đây.', meta: [{ label: 'Chủ sở hữu', value: 'Văn phòng' }, { label: 'Quyền truy cập', value: 'Toàn cơ quan' }] },
  { id: 'cloud-plan', title: 'Kế hoạch chuyển đổi số.pdf', subtitle: '4,8 MB · Nguyễn Minh Anh', kind: 'pdf', size: '4,8 MB', category: 'PDF', description: 'Kế hoạch triển khai chuyển đổi số giai đoạn 2026–2028.', meta: [{ label: 'Cập nhật', value: '05/08/2026' }, { label: 'Quyền truy cập', value: 'Người trong đơn vị' }] },
  { id: 'cloud-staff', title: 'Danh sách nhân sự.xlsx', subtitle: '1,2 MB · Phòng Tổ chức', kind: 'sheet', size: '1,2 MB', category: 'Bảng tính', description: 'Danh sách đầu mối nhân sự được cập nhật tháng 8/2026.', meta: [{ label: 'Cập nhật', value: '04/08/2026' }, { label: 'Quyền truy cập', value: 'Hạn chế' }] },
];

export const meetingRecords: WorkspaceRecord[] = [
  { id: 'meet-editorial', title: 'Họp giao ban Ban Biên tập', subtitle: '09:00 hôm nay · Phòng họp B', status: 'Sắp diễn ra', category: '45 phút', description: 'Rà soát tiến độ nội dung và thống nhất kế hoạch tuần.', meta: [{ label: 'Người tổ chức', value: 'Trần Thu Hà' }, { label: 'Người tham dự', value: '12 người' }, { label: 'Hình thức', value: 'Trực tiếp' }] },
  { id: 'meet-website', title: 'Triển khai Website mới', subtitle: '11:00 hôm nay · meeting.tuoitre.vn', status: 'Sắp diễn ra', category: '60 phút', description: 'Thống nhất kế hoạch chuyển đổi và các mốc nghiệm thu website mới.', meta: [{ label: 'Người tổ chức', value: 'Ban Công nghệ' }, { label: 'Người tham dự', value: '8 người' }, { label: 'Hình thức', value: 'Trực tuyến' }] },
  { id: 'meet-security', title: 'Đào tạo an toàn thông tin', subtitle: '05/08/2026 · Có bản ghi', status: 'Đã kết thúc', category: 'Bản ghi', description: 'Chương trình đào tạo nhận diện rủi ro và xử lý sự cố an toàn thông tin.', meta: [{ label: 'Thời lượng', value: '90 phút' }, { label: 'Đơn vị', value: 'Phòng Công nghệ' }] },
];

export const evaluationRecords: WorkspaceRecord[] = [
  { id: 'evaluation-self', title: 'Phiếu tự đánh giá Quý III/2026', subtitle: 'Đã hoàn thành 8/10 tiêu chí', status: 'Đang thực hiện', category: '86,5 điểm', description: 'Phiếu đánh giá hiệu suất, năng lực phối hợp và tinh thần đổi mới.', meta: [{ label: 'Hạn hoàn thành', value: '15/08/2026' }, { label: 'Tiến độ', value: '80%' }] },
  { id: 'score-mai', title: 'Nguyễn Thị Mai', subtitle: 'Tự đánh giá 86,5 · Chờ cấp phòng', status: 'Chờ chấm', category: 'Cấp phòng', description: 'Phiếu chấm điểm nhân sự theo 10 tiêu chí thống nhất.', meta: [{ label: 'Phòng ban', value: 'Phòng Hành chính' }, { label: 'Tiêu chí đã chấm', value: '0/10' }] },
  { id: 'score-minh', title: 'Trần Văn Minh', subtitle: 'Tự đánh giá 89,0 · Đã chấm 6/10', status: 'Đang chấm', category: 'Cấp phòng', description: 'Phiếu chấm điểm nhân sự đang được hoàn thiện.', meta: [{ label: 'Phòng ban', value: 'Ban Biên tập' }, { label: 'Tiêu chí đã chấm', value: '6/10' }] },
];

export const libraryRecords: WorkspaceRecord[] = [
  { id: 'library-handbook', title: 'Sổ tay Biên tập 2026', subtitle: 'Ban Biên tập · 128 trang', category: 'PDF', description: 'Quy trình biên tập và tiêu chuẩn nghiệp vụ áp dụng trong năm 2026.', meta: [{ label: 'Tác giả', value: 'Ban Biên tập' }, { label: 'Cập nhật', value: '02/08/2026' }, { label: 'Lượt xem', value: '286' }] },
  { id: 'library-brand', title: 'Quy chuẩn nhận diện thương hiệu', subtitle: 'Phòng Truyền thông · Cập nhật 08/2026', category: 'PDF', description: 'Hướng dẫn sử dụng logo, màu sắc và hệ thống nhận diện Tuổi Trẻ.', meta: [{ label: 'Tác giả', value: 'Phòng Truyền thông' }, { label: 'Phiên bản', value: '3.2' }] },
  { id: 'library-photo', title: 'Kho ảnh 50 năm Tuổi Trẻ', subtitle: '1.284 hình ảnh chất lượng cao', category: 'Hình ảnh', description: 'Kho tư liệu hình ảnh lịch sử và hoạt động của Tuổi Trẻ.', meta: [{ label: 'Đơn vị quản lý', value: 'Trung tâm Tư liệu' }, { label: 'Dung lượng', value: '18,6 GB' }] },
  { id: 'library-digital', title: 'Đào tạo chuyển đổi số', subtitle: 'Ban Công nghệ · 24 tài liệu', category: 'Tài liệu', description: 'Tài liệu đào tạo công cụ số và quy trình làm việc mới.', meta: [{ label: 'Cập nhật', value: '01/08/2026' }, { label: 'Đối tượng', value: 'Toàn cơ quan' }] },
];

export const expertRecords: ExpertRecord[] = [
  { id: 'expert-khoi', title: 'PGS.TS Nguyễn Minh Khôi', subtitle: 'Chuyên gia kinh tế', initials: 'NK', field: 'Kinh tế', organization: 'Đại học Kinh tế TP.HCM', email: 'minhkhoi@chuyengia.vn', phone: '0903 642 518', rating: '4,9/5', collaborations: 24, description: 'Chuyên gia kinh tế vĩ mô và chính sách công.', category: 'Kinh tế', meta: [{ label: 'Bài cộng tác', value: '24' }, { label: 'Đánh giá', value: '4,9/5' }] },
  { id: 'expert-trang', title: 'TS. Phạm Thu Trang', subtitle: 'Chuyên gia AI & dữ liệu', initials: 'PT', field: 'Công nghệ', organization: 'Viện Công nghệ số', email: 'thutrang@chuyengia.vn', phone: '0918 410 226', rating: '4,8/5', collaborations: 18, description: 'Nghiên cứu trí tuệ nhân tạo, dữ liệu và chuyển đổi số.', category: 'Công nghệ', meta: [{ label: 'Bài cộng tác', value: '18' }, { label: 'Đánh giá', value: '4,8/5' }] },
  { id: 'expert-huy', title: 'ThS. Trần Quang Huy', subtitle: 'Chuyên gia giáo dục', initials: 'TH', field: 'Giáo dục', organization: 'Đại học Sư phạm', email: 'quanghuy@chuyengia.vn', phone: '0938 520 914', rating: '4,7/5', collaborations: 12, description: 'Chuyên gia chính sách và đổi mới giáo dục.', category: 'Giáo dục', meta: [{ label: 'Bài cộng tác', value: '12' }, { label: 'Đánh giá', value: '4,7/5' }] },
];
