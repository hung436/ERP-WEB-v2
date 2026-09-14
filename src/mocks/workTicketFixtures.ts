import { demoUser } from '@/mocks/fixtures';
import type { WorkTicketFollower, WorkTicketSubmission, WorkTicketTemplate } from '@/types/domain';

const meAsFollower: WorkTicketFollower = { id: demoUser.id, name: demoUser.fullName, positionName: demoUser.position, departmentName: demoUser.department };

export const workTicketTemplates: WorkTicketTemplate[] = [
  { id: 'ticket-template-blank', kind: 'blank', name: 'Phiếu trắng', description: 'Tự soạn nội dung công việc và tự thiết lập quy trình xử lý.', estimatedDays: 3, workflow: [] },
  { id: 'ticket-template-leave', kind: 'leave_request', name: 'Đơn xin nghỉ phép', description: 'Đề nghị nghỉ phép năm hoặc nghỉ việc riêng theo quy định.', estimatedDays: 2, workflow: ['Trưởng bộ phận', 'Phòng Tổ chức', 'Ban Biên tập phụ trách'] },
  { id: 'ticket-template-overseas', kind: 'overseas_request', name: 'Phiếu đề xuất đi nước ngoài', description: 'Đề xuất đi công tác hoặc đi nước ngoài về việc riêng.', estimatedDays: 4, workflow: ['Trưởng bộ phận', 'Ban Biên tập phụ trách', 'Tổng Biên tập'] },
];

export const followerOptions: WorkTicketFollower[] = [
  { id: 'follower-1', name: 'Trần Thu Hà', positionName: 'Phó Trưởng ban', departmentName: 'Ban Nội dung' },
  { id: 'follower-2', name: 'Trịnh Khánh Vy', positionName: 'Chuyên viên', departmentName: 'Phòng Tổ chức' },
  { id: 'follower-3', name: 'Nguyễn Hoàng Minh', positionName: 'Lãnh đạo phụ trách', departmentName: 'Ban Biên tập' },
  { id: 'follower-4', name: 'Phạm Quốc Nam', positionName: 'Trưởng ban', departmentName: 'Ban Quản trị' },
  { id: 'follower-5', name: 'Đỗ Quang Huy', positionName: 'Trưởng ban', departmentName: 'Ban Khoa giáo' },
  { id: 'follower-6', name: 'Nguyễn Văn Hải', positionName: 'Chuyên viên', departmentName: 'Phòng Hành chính' },
  { id: 'follower-7', name: 'Hoàng Thị Lan', positionName: 'Thành viên', departmentName: 'Ban Biên tập' },
];

export const workTicketSubmissions: WorkTicketSubmission[] = [
  {
    id: 'ticket-001', code: 'PT-2026-004', templateId: 'ticket-template-blank', kind: 'blank',
    title: 'Đề xuất triển khai chuyên trang Tết 2027', createdBy: 'Nguyễn Minh Anh', department: 'Ban Nội dung',
    createdAt: '2026-08-06T09:00:00+07:00', status: 'pending', currentStep: 0, viewScope: 'sent',
    fields: { title: 'Đề xuất triển khai chuyên trang Tết 2027', department: 'Ban Nội dung', content: 'Xây dựng kế hoạch nội dung, phân công nhân sự và tiến độ thực hiện chuyên trang Tết 2027.' },
    steps: [
      { id: 'ticket-001-step-1', name: 'Trưởng ban duyệt nội dung', assignee: 'Trần Thu Hà', status: 'pending' },
      { id: 'ticket-001-step-2', name: 'Ban Biên tập phê duyệt', assignee: 'Nguyễn Hoàng Minh', status: 'waiting' },
    ],
    followers: [followerOptions[2], followerOptions[5]],
    comments: [
      { id: 'ticket-001-c1', author: 'Trần Thu Hà', content: 'Đề nghị bổ sung thêm mốc thời gian chốt bài cho từng tuyến nội dung.', createdAt: '2026-08-06T10:05:00+07:00' },
      { id: 'ticket-001-c2', author: 'Nguyễn Minh Anh', content: 'Đã cập nhật tiến độ chi tiết trong file đính kèm, anh chị xem giúp em.', createdAt: '2026-08-06T11:20:00+07:00' },
    ],
    attachments: [
      { id: 'ticket-001-a1', name: 'ke-hoach-noi-dung-tet-2027.docx', size: 245_760, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { id: 'ticket-001-a2', name: 'tien-do-phan-cong.xlsx', size: 89_400, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    ],
  },
  {
    id: 'ticket-002', code: 'NP-2026-030', templateId: 'ticket-template-leave', kind: 'leave_request',
    title: 'Đơn xin nghỉ phép · Bùi Anh Tú', createdBy: 'Bùi Anh Tú', department: 'Ban Thời sự',
    createdAt: '2026-08-07T08:10:00+07:00', status: 'pending', currentStep: 1, viewScope: 'pending_review',
    fields: { fullName: 'Bùi Anh Tú', department: 'Ban Thời sự', fromDate: '11/08/2026', toDate: '12/08/2026', reason: 'Nghỉ phép năm để giải quyết việc gia đình', leaveLocation: 'TP. Hồ Chí Minh' },
    steps: [
      { id: 'ticket-002-step-1', name: 'Trưởng bộ phận', assignee: 'Nguyễn Quang Vinh', status: 'approved', actedAt: '2026-08-07T08:35:00+07:00' },
      { id: 'ticket-002-step-2', name: 'Phòng Tổ chức', assignee: 'Trịnh Khánh Vy', status: 'pending' },
      { id: 'ticket-002-step-3', name: 'Ban Biên tập phụ trách', assignee: 'Chờ phân công', status: 'waiting' },
    ],
    followers: [followerOptions[0], meAsFollower],
    comments: [
      { id: 'ticket-002-c1', author: 'Nguyễn Quang Vinh', content: 'Đã duyệt bước đầu, lưu ý bố trí người trực thay trong thời gian nghỉ.', createdAt: '2026-08-07T08:36:00+07:00' },
    ],
    attachments: [],
  },
  {
    id: 'ticket-003', code: 'NN-2026-015', templateId: 'ticket-template-overseas', kind: 'overseas_request',
    title: 'Phiếu đề xuất đi Thái Lan · Nguyễn Hoàng Nam', createdBy: 'Nguyễn Hoàng Nam', department: 'Ban Quốc tế',
    createdAt: '2026-08-08T08:30:00+07:00', status: 'pending', currentStep: 0, viewScope: 'pending_review',
    fields: { fullName: 'Nguyễn Hoàng Nam', positionUnit: 'Phóng viên, Ban Quốc tế', destination: 'Bangkok, Thái Lan', departureDate: '25/08/2026', returnDate: '29/08/2026', reason: 'Tác nghiệp Diễn đàn Truyền thông ASEAN', hostUnit: 'Hiệp hội Báo chí ASEAN', funding: 'host', fundingOther: '' },
    steps: [
      { id: 'ticket-003-step-1', name: 'Trưởng bộ phận', assignee: 'Trưởng Ban Quốc tế', status: 'pending' },
      { id: 'ticket-003-step-2', name: 'Ban Biên tập phụ trách', assignee: 'Chờ phân công', status: 'waiting' },
      { id: 'ticket-003-step-3', name: 'Tổng Biên tập', assignee: 'Chờ phân công', status: 'waiting' },
    ],
    followers: [followerOptions[3], followerOptions[4]],
    comments: [],
    attachments: [
      { id: 'ticket-003-a1', name: 'thu-moi-dien-dan-asean.pdf', size: 512_000, type: 'application/pdf' },
    ],
  },
  {
    id: 'ticket-004', code: 'PT-2026-002', templateId: 'ticket-template-blank', kind: 'blank',
    title: 'Kế hoạch bảo trì hệ thống máy chủ quý III', createdBy: 'Vũ Minh Đức', department: 'Ban Kỹ thuật & Công nghệ',
    createdAt: '2026-07-28T10:00:00+07:00', status: 'approved', currentStep: 1, viewScope: 'reviewed',
    fields: { title: 'Kế hoạch bảo trì hệ thống máy chủ quý III', department: 'Ban Kỹ thuật & Công nghệ', content: 'Lên lịch bảo trì định kỳ hệ thống máy chủ, sao lưu dữ liệu và nâng cấp bảo mật.' },
    steps: [
      { id: 'ticket-004-step-1', name: 'Trưởng ban duyệt kế hoạch', assignee: 'Phạm Đức Long', status: 'approved', actedAt: '2026-07-28T14:00:00+07:00' },
      { id: 'ticket-004-step-2', name: 'Ban Biên tập phê duyệt', assignee: 'Nguyễn Hoàng Minh', status: 'approved', actedAt: '2026-07-29T09:00:00+07:00' },
    ],
    followers: [followerOptions[5], meAsFollower],
    comments: [
      { id: 'ticket-004-c1', author: 'Nguyễn Hoàng Minh', content: 'Đồng ý kế hoạch, phối hợp với Phòng Hành chính để thông báo lịch bảo trì tới toàn bộ nhân sự.', createdAt: '2026-07-29T09:10:00+07:00' },
    ],
    attachments: [
      { id: 'ticket-004-a1', name: 'ke-hoach-bao-tri-q3.pdf', size: 178_200, type: 'application/pdf' },
    ],
  },
  {
    id: 'ticket-005', code: 'PT-2026-006', templateId: 'ticket-template-blank', kind: 'blank',
    title: 'Triển khai loạt bài chuyên đề Bảo vệ nền tảng tư tưởng', createdBy: 'Trần Thu Hà', department: 'Ban Nội dung',
    createdAt: '2026-08-09T09:20:00+07:00', status: 'pending', currentStep: 1, viewScope: 'pending_review',
    fields: { title: 'Triển khai loạt bài chuyên đề Bảo vệ nền tảng tư tưởng', department: 'Ban Nội dung', content: 'Lên đề cương, phân công phóng viên thực hiện loạt bài chuyên đề theo kế hoạch quý III/2026.' },
    steps: [
      { id: 'ticket-005-step-1', name: 'Trưởng ban duyệt đề cương', assignee: 'Nguyễn Hoàng Minh', status: 'approved', actedAt: '2026-08-09T10:00:00+07:00' },
      { id: 'ticket-005-step-2', name: 'Người duyệt', assignee: demoUser.fullName, status: 'pending' },
    ],
    followers: [followerOptions[0]],
    comments: [
      { id: 'ticket-005-c1', author: 'Nguyễn Hoàng Minh', content: 'Đã duyệt đề cương, em triển khai theo tiến độ đã thống nhất nhé.', createdAt: '2026-08-09T10:02:00+07:00' },
    ],
    attachments: [
      { id: 'ticket-005-a1', name: 'de-cuong-chuyen-de-bao-ve-nen-tang-tu-tuong.docx', size: 156_800, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    ],
  },
];
