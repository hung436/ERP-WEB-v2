import type { DocumentSubmission, DocumentTemplate } from '@/types/domain';

export const documentTemplates: DocumentTemplate[] = [
  { id: 'template-leave', kind: 'leave_request', name: 'Đơn xin nghỉ phép', description: 'Đề nghị nghỉ phép năm hoặc nghỉ việc riêng theo quy định.', estimatedDays: 2, workflow: ['Trưởng bộ phận', 'Phòng Tổ chức', 'Ban Biên tập phụ trách'] },
  { id: 'template-overseas', kind: 'overseas_request', name: 'Phiếu đề xuất đi nước ngoài', description: 'Đề xuất đi công tác hoặc đi nước ngoài về việc riêng.', estimatedDays: 4, workflow: ['Trưởng bộ phận', 'Ban Biên tập phụ trách', 'Tổng Biên tập'] },
];

export const documentSubmissions: DocumentSubmission[] = [
  { id: 'document-001', code: 'NP-2026-018', templateId: 'template-leave', kind: 'leave_request', title: 'Đơn xin nghỉ phép · Nguyễn Minh Anh', createdBy: 'Nguyễn Minh Anh', department: 'Ban Nội dung', createdAt: '2026-08-06T09:20:00+07:00', status: 'pending', currentStep: 1, viewScope: 'sent', fields: { fullName: 'Nguyễn Minh Anh', department: 'Ban Nội dung', fromDate: '12/08/2026', toDate: '14/08/2026', reason: 'Giải quyết việc gia đình', leaveLocation: 'TP. Hồ Chí Minh' }, steps: [
    { id: 'step-001-1', name: 'Trưởng bộ phận', assignee: 'Trần Thu Hà', status: 'approved', actedAt: '2026-08-06T10:15:00+07:00', note: 'Đồng ý chuyển bước tiếp theo.' },
    { id: 'step-001-2', name: 'Phòng Tổ chức', assignee: 'Trịnh Khánh Vy', status: 'pending' },
    { id: 'step-001-3', name: 'Ban Biên tập phụ trách', assignee: 'Lãnh đạo phụ trách', status: 'waiting' },
  ] },
  { id: 'document-002', code: 'NN-2026-007', templateId: 'template-overseas', kind: 'overseas_request', title: 'Phiếu đề xuất đi Nhật Bản · Phan Thùy Dung', createdBy: 'Phan Thùy Dung', department: 'Trung tâm Tư liệu', createdAt: '2026-08-05T14:30:00+07:00', status: 'pending', currentStep: 2, viewScope: 'pending_review', fields: { fullName: 'Phan Thùy Dung', positionUnit: 'Biên tập viên, Trung tâm Tư liệu', destination: 'Tokyo, Nhật Bản', departureDate: '20/08/2026', returnDate: '26/08/2026', reason: 'Tham dự chương trình trao đổi nghiệp vụ lưu trữ số', hostUnit: 'Hiệp hội Lưu trữ Nhật Bản', funding: 'host', fundingOther: '' }, steps: [
    { id: 'step-002-1', name: 'Trưởng bộ phận', assignee: 'Giám đốc Trung tâm Tư liệu', status: 'approved', actedAt: '2026-08-05T16:00:00+07:00' },
    { id: 'step-002-2', name: 'Ban Biên tập phụ trách', assignee: 'Lãnh đạo phụ trách', status: 'approved', actedAt: '2026-08-06T09:40:00+07:00' },
    { id: 'step-002-3', name: 'Tổng Biên tập', assignee: 'Tổng Biên tập', status: 'pending' },
  ] },
  { id: 'document-003', code: 'NP-2026-014', templateId: 'template-leave', kind: 'leave_request', title: 'Đơn xin nghỉ phép · Ngô Mỹ Linh', createdBy: 'Ngô Mỹ Linh', department: 'Văn phòng', createdAt: '2026-08-01T08:45:00+07:00', status: 'approved', currentStep: 2, viewScope: 'reviewed', fields: { fullName: 'Ngô Mỹ Linh', department: 'Văn phòng', fromDate: '03/08/2026', toDate: '03/08/2026', reason: 'Nghỉ phép năm', leaveLocation: 'TP. Hồ Chí Minh' }, steps: [
    { id: 'step-003-1', name: 'Trưởng bộ phận', assignee: 'Phạm Đức Long', status: 'approved', actedAt: '2026-08-01T09:30:00+07:00' },
    { id: 'step-003-2', name: 'Phòng Tổ chức', assignee: 'Trịnh Khánh Vy', status: 'approved', actedAt: '2026-08-01T10:20:00+07:00' },
    { id: 'step-003-3', name: 'Ban Biên tập phụ trách', assignee: 'Lãnh đạo phụ trách', status: 'approved', actedAt: '2026-08-01T14:10:00+07:00' },
  ] },
  { id: 'document-004', code: 'NP-2026-021', templateId: 'template-leave', kind: 'leave_request', title: 'Đơn xin nghỉ phép · Bùi Anh Tú', createdBy: 'Bùi Anh Tú', department: 'Ban Thời sự', createdAt: '2026-08-07T08:10:00+07:00', status: 'pending', currentStep: 1, viewScope: 'pending_review', fields: { fullName: 'Bùi Anh Tú', department: 'Ban Thời sự', fromDate: '11/08/2026', toDate: '12/08/2026', reason: 'Nghỉ phép năm để giải quyết việc gia đình', leaveLocation: 'TP. Hồ Chí Minh' }, steps: [
    { id: 'step-004-1', name: 'Trưởng bộ phận', assignee: 'Nguyễn Quang Vinh', status: 'approved', actedAt: '2026-08-07T08:35:00+07:00' },
    { id: 'step-004-2', name: 'Phòng Tổ chức', assignee: 'Nguyễn Minh Anh', status: 'pending' },
    { id: 'step-004-3', name: 'Ban Biên tập phụ trách', assignee: 'Chờ phân công', status: 'waiting' },
  ] },
  { id: 'document-005', code: 'NN-2026-009', templateId: 'template-overseas', kind: 'overseas_request', title: 'Phiếu đề xuất đi Singapore · Trần Thu Hà', createdBy: 'Trần Thu Hà', department: 'Ban Nội dung', createdAt: '2026-08-07T08:45:00+07:00', status: 'pending', currentStep: 1, viewScope: 'pending_review', fields: { fullName: 'Trần Thu Hà', positionUnit: 'Phó Trưởng ban, Ban Nội dung', destination: 'Singapore', departureDate: '18/08/2026', returnDate: '22/08/2026', reason: 'Tham dự chương trình trao đổi nghiệp vụ nội dung số', hostUnit: 'Hiệp hội Truyền thông Singapore', funding: 'host', fundingOther: '' }, steps: [
    { id: 'step-005-1', name: 'Trưởng bộ phận', assignee: 'Trưởng Ban Nội dung', status: 'approved', actedAt: '2026-08-07T09:05:00+07:00' },
    { id: 'step-005-2', name: 'Ban Biên tập phụ trách', assignee: 'Nguyễn Minh Anh', status: 'pending' },
    { id: 'step-005-3', name: 'Tổng Biên tập', assignee: 'Chờ phân công', status: 'waiting' },
  ] },
  { id: 'document-006', code: 'NP-2026-022', templateId: 'template-leave', kind: 'leave_request', title: 'Đơn xin nghỉ phép · Lê Thanh Vân', createdBy: 'Lê Thanh Vân', department: 'Ban Khoa giáo', createdAt: '2026-08-07T09:20:00+07:00', status: 'pending', currentStep: 2, viewScope: 'pending_review', fields: { fullName: 'Lê Thanh Vân', department: 'Ban Khoa giáo', fromDate: '13/08/2026', toDate: '15/08/2026', reason: 'Nghỉ phép năm', leaveLocation: 'Đà Nẵng' }, steps: [
    { id: 'step-006-1', name: 'Trưởng bộ phận', assignee: 'Đỗ Quang Huy', status: 'approved', actedAt: '2026-08-07T09:45:00+07:00' },
    { id: 'step-006-2', name: 'Phòng Tổ chức', assignee: 'Trịnh Khánh Vy', status: 'approved', actedAt: '2026-08-07T10:10:00+07:00' },
    { id: 'step-006-3', name: 'Ban Biên tập phụ trách', assignee: 'Nguyễn Minh Anh', status: 'pending' },
  ] },
  { id: 'document-007', code: 'NN-2026-012', templateId: 'template-overseas', kind: 'overseas_request', title: 'Phiếu đề xuất đi Hàn Quốc · Nguyễn Hoàng Nam', createdBy: 'Nguyễn Hoàng Nam', department: 'Ban Quốc tế', createdAt: '2026-08-08T08:30:00+07:00', status: 'pending', currentStep: 1, viewScope: 'pending_review', fields: { fullName: 'Nguyễn Hoàng Nam', positionUnit: 'Phóng viên, Ban Quốc tế', destination: 'Seoul, Hàn Quốc', departureDate: '25/08/2026', returnDate: '30/08/2026', reason: 'Tác nghiệp Hội nghị Truyền thông Châu Á - Thái Bình Dương', hostUnit: 'KBS Korea', funding: 'self', fundingOther: '' }, steps: [
    { id: 'step-007-1', name: 'Trưởng bộ phận', assignee: 'Trưởng Ban Quốc tế', status: 'approved', actedAt: '2026-08-08T09:10:00+07:00', note: 'Đồng ý trình Ban Biên tập.' },
    { id: 'step-007-2', name: 'Ban Biên tập phụ trách', assignee: 'Nguyễn Minh Anh', status: 'pending', consultations: [
      { id: 'sub-007-1', name: 'Lấy ý kiến: Trần Thu Hà (Phó Ban Nội dung)', assignee: 'Trần Thu Hà (Phó Ban Nội dung)', status: 'pending', deadline: '15/08/2026' }
    ] },
    { id: 'step-007-3', name: 'Tổng Biên tập', assignee: 'Chờ phân công', status: 'waiting' },
  ] },
  { id: 'document-008', code: 'NP-2026-025', templateId: 'template-leave', kind: 'leave_request', title: 'Đơn xin nghỉ phép · Phạm Quốc Nam', createdBy: 'Phạm Quốc Nam', department: 'Ban Quản trị', createdAt: '2026-08-08T10:00:00+07:00', status: 'pending', currentStep: 1, viewScope: 'pending_review', fields: { fullName: 'Phạm Quốc Nam', department: 'Ban Quản trị', fromDate: '14/08/2026', toDate: '18/08/2026', reason: 'Nghỉ phép năm kết hợp đi tham quan', leaveLocation: 'Nha Trang' }, steps: [
    { id: 'step-008-1', name: 'Trưởng bộ phận', assignee: 'Ban Quản trị', status: 'approved', actedAt: '2026-08-08T10:30:00+07:00' },
    { id: 'step-008-2', name: 'Phòng Tổ chức', assignee: 'Nguyễn Minh Anh', status: 'pending', consultations: [
      { id: 'sub-008-1', name: 'Lấy ý kiến: Trần Văn Bình (Phó Trưởng ban Tổ chức)', assignee: 'Trần Văn Bình (Phó Trưởng ban Tổ chức)', status: 'approved', actedAt: '2026-08-08T11:45:00+07:00', note: 'Ý kiến tham khảo: Nhân sự đã hoàn thành đủ chỉ tiêu quý và có số ngày phép tồn 8 ngày. Đề xuất chấp thuận đơn.' }
    ] },
  ] },
];
