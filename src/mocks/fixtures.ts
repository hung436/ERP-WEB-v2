import type { Announcement, CalendarEvent, ChatConversation, ChatMember, ChatMessage, DirectoryContact, MailItem, MeetingEvent, Task, User } from '@/types/domain';

export const demoUser: User = {
  id: 'user-001', username: 'nhanvien', fullName: 'Nguyễn Minh Anh', email: 'minhanh@noibo.vn',
  department: 'Ban Nội dung', position: 'Phóng viên', role: 'employee',
  birthDate: '1995-08-14',
};

export const adminUser: User = {
  id: 'user-admin', username: 'admin', fullName: 'Phạm Đức Long (Admin)', email: 'admin@noibo.vn',
  department: 'Ban Quản trị & Công nghệ', position: 'Quản trị viên Hệ thống', role: 'admin',
  birthDate: '1990-08-14',
};

export const tasks: Task[] = [
  { id: 'task-01', title: 'Duyệt đơn xin nghỉ phép của Nguyễn Hoài Nam', description: 'Nhân viên đề nghị nghỉ phép năm để giải quyết việc gia đình. Hồ sơ đã được trưởng ban xác nhận và đang chờ cấp có thẩm quyền phê duyệt.', status: 'todo', priority: 'urgent', dueAt: '2026-08-06T11:00:00+07:00', assignedBy: 'Hệ thống Tài liệu', department: 'Ban Bạn đọc', progress: 75, sourceModule: 'documents', workflowKind: 'leave_request', subjectName: 'Nguyễn Hoài Nam', requestDuration: '03 ngày · 10/08–12/08/2026', workflowStep: 'Bước 3/3 · Chờ phê duyệt' },
  { id: 'task-02', title: 'Duyệt đơn xin đi nước ngoài của Trần Thu Hà', description: 'Đề nghị đi công tác tại Singapore theo thư mời của đối tác. Hồ sơ đã có ý kiến của Ban Nội dung và Phòng Tổ chức.', status: 'in_progress', priority: 'high', dueAt: '2026-08-06T16:30:00+07:00', assignedBy: 'Hệ thống Tài liệu', department: 'Ban Nội dung', progress: 60, sourceModule: 'documents', workflowKind: 'overseas_request', subjectName: 'Trần Thu Hà', requestDuration: '05 ngày · 18/08–22/08/2026', destination: 'Singapore', workflowStep: 'Bước 4/5 · Chờ lãnh đạo duyệt' },
  { id: 'task-03', title: 'Hoàn thành tự đánh giá lao động Quý III/2026', description: 'Thực hiện tự đánh giá kết quả công việc, kỷ luật lao động và mức độ hoàn thành mục tiêu cá nhân trong quý.', status: 'todo', priority: 'high', dueAt: '2026-08-08T17:00:00+07:00', assignedBy: 'Hệ thống Đánh giá lao động', department: 'Ban Nội dung', progress: 20, sourceModule: 'evaluations', workflowKind: 'self_evaluation', subjectName: 'Nguyễn Minh Anh', period: 'Quý III/2026', workflowStep: 'Tự đánh giá cá nhân' },
  { id: 'task-04', title: 'Chấm điểm đánh giá lao động của Lê Thanh Vân', description: 'Xem nội dung tự đánh giá, kết quả công việc và chấm điểm nhân viên cấp dưới theo tiêu chí của kỳ đánh giá.', status: 'todo', priority: 'medium', dueAt: '2026-08-09T17:00:00+07:00', assignedBy: 'Hệ thống Đánh giá lao động', department: 'Ban Nội dung', progress: 50, sourceModule: 'evaluations', workflowKind: 'subordinate_evaluation', subjectName: 'Lê Thanh Vân', period: 'Quý III/2026', workflowStep: 'Cấp quản lý chấm điểm' },
  { id: 'task-05', title: 'Duyệt đơn xin nghỉ phép của Bùi Anh Tú', description: 'Đơn nghỉ phép năm đã hoàn tất xác nhận ngày phép còn lại và ý kiến của trưởng đơn vị.', status: 'overdue', priority: 'urgent', dueAt: '2026-08-05T15:00:00+07:00', assignedBy: 'Hệ thống Tài liệu', department: 'Ban Thời sự', progress: 75, sourceModule: 'documents', workflowKind: 'leave_request', subjectName: 'Bùi Anh Tú', requestDuration: '02 ngày · 07/08–08/08/2026', workflowStep: 'Bước 3/3 · Quá hạn phê duyệt' },
  { id: 'task-06', title: 'Chấm điểm đánh giá lao động của Đỗ Quang Huy', description: 'Đánh giá mức độ hoàn thành nhiệm vụ và phản hồi kết quả cho nhân viên cấp dưới.', status: 'in_progress', priority: 'high', dueAt: '2026-08-10T12:00:00+07:00', assignedBy: 'Hệ thống Đánh giá lao động', department: 'Ban Khoa giáo', progress: 70, sourceModule: 'evaluations', workflowKind: 'subordinate_evaluation', subjectName: 'Đỗ Quang Huy', period: 'Quý III/2026', workflowStep: 'Cấp quản lý chấm điểm' },
  { id: 'task-07', title: 'Duyệt đơn xin đi nước ngoài của Phan Thùy Dung', description: 'Hồ sơ xin đi nước ngoài vì việc riêng đã hoàn thành xác minh thông tin.', status: 'todo', priority: 'medium', dueAt: '2026-08-12T10:00:00+07:00', assignedBy: 'Hệ thống Tài liệu', department: 'Trung tâm Tư liệu', progress: 60, sourceModule: 'documents', workflowKind: 'overseas_request', subjectName: 'Phan Thùy Dung', requestDuration: '07 ngày · 20/08–26/08/2026', destination: 'Nhật Bản', workflowStep: 'Bước 4/5 · Chờ lãnh đạo duyệt' },
  { id: 'task-08', title: 'Hoàn thành tự đánh giá lao động Quý II/2026', status: 'completed', priority: 'medium', dueAt: '2026-07-05T17:00:00+07:00', assignedBy: 'Hệ thống Đánh giá lao động', department: 'Ban Nội dung', progress: 100, sourceModule: 'evaluations', workflowKind: 'self_evaluation', subjectName: 'Nguyễn Minh Anh', period: 'Quý II/2026', workflowStep: 'Đã hoàn thành' },
  { id: 'task-09', title: 'Duyệt đơn xin nghỉ phép của Ngô Mỹ Linh', status: 'completed', priority: 'low', dueAt: '2026-08-01T17:00:00+07:00', assignedBy: 'Hệ thống Tài liệu', department: 'Văn phòng', progress: 100, sourceModule: 'documents', workflowKind: 'leave_request', subjectName: 'Ngô Mỹ Linh', requestDuration: '01 ngày · 03/08/2026', workflowStep: 'Đã duyệt' },
  { id: 'task-10', title: 'Chấm điểm đánh giá lao động của Mai Phương Thảo', status: 'todo', priority: 'medium', dueAt: '2026-08-13T17:00:00+07:00', assignedBy: 'Hệ thống Đánh giá lao động', department: 'Phòng Lưu trữ', progress: 50, sourceModule: 'evaluations', workflowKind: 'subordinate_evaluation', subjectName: 'Mai Phương Thảo', period: 'Quý III/2026', workflowStep: 'Cấp quản lý chấm điểm' },
  { id: 'task-11', title: 'Duyệt đơn xin đi nước ngoài của Hoàng Tuấn Anh', status: 'todo', priority: 'high', dueAt: '2026-08-14T15:00:00+07:00', assignedBy: 'Hệ thống Tài liệu', department: 'Ban Thư ký', progress: 60, sourceModule: 'documents', workflowKind: 'overseas_request', subjectName: 'Hoàng Tuấn Anh', requestDuration: '04 ngày · 25/08–28/08/2026', destination: 'Thái Lan', workflowStep: 'Bước 4/5 · Chờ lãnh đạo duyệt' },
  { id: 'task-12', title: 'Chấm điểm đánh giá lao động của Cao Thanh Tâm', status: 'completed', priority: 'low', dueAt: '2026-07-08T17:00:00+07:00', assignedBy: 'Hệ thống Đánh giá lao động', department: 'Phòng Tài chính', progress: 100, sourceModule: 'evaluations', workflowKind: 'subordinate_evaluation', subjectName: 'Cao Thanh Tâm', period: 'Quý II/2026', workflowStep: 'Đã hoàn thành' },
];

export const meetingEvents: MeetingEvent[] = [
  { id:'event-01', title:'Họp giao ban Ban Nội dung', startAt:'2026-08-07T08:30:00+07:00', endAt:'2026-08-07T09:30:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/giao-ban-noi-dung', type:'meeting', organizer:'Trần Thu Hà', responseStatus:'accepted', meetingId:'TT-482-193', platform:'meeting.tuoitre.vn', agenda:'Cập nhật tiến độ tuyến bài, kế hoạch xuất bản và các công việc cần phối hợp trong tuần.', participants:['Trần Thu Hà','Nguyễn Minh Anh','Lê Thanh Vân','Nguyễn Hoài Nam'], recordingAvailable:true },
  { id:'event-02', title:'Trao đổi tuyến bài chuyển đổi số', startAt:'2026-08-07T10:00:00+07:00', endAt:'2026-08-07T11:00:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/chuyen-doi-so', type:'meeting', organizer:'Nguyễn Hoài Nam', responseStatus:'pending', meetingId:'TT-610-245', platform:'meeting.tuoitre.vn', agenda:'Thống nhất góc tiếp cận và phân công nguồn tin cho tuyến bài chuyển đổi số.', participants:['Nguyễn Hoài Nam','Nguyễn Minh Anh','Đỗ Quang Huy'] },
  { id:'event-03', title:'Họp duyệt kế hoạch nội dung tuần 33', startAt:'2026-08-07T15:00:00+07:00', endAt:'2026-08-07T16:00:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/duyet-noi-dung-33', type:'meeting', organizer:'Ban Thư ký', responseStatus:'pending', meetingId:'TT-775-024', platform:'meeting.tuoitre.vn', agenda:'Duyệt kế hoạch nội dung và nguồn lực sản xuất cho tuần 33.', participants:['Hoàng Tuấn Anh','Trần Thu Hà','Nguyễn Minh Anh'] },
  { id:'event-04', title:'Họp kế hoạch truyền thông tháng 8', startAt:'2026-08-08T09:00:00+07:00', endAt:'2026-08-08T10:30:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/truyen-thong-thang-8', type:'meeting', organizer:'Lê Thanh Vân', responseStatus:'accepted', meetingId:'TT-320-889', platform:'meeting.tuoitre.vn', agenda:'Thống nhất thông điệp, lịch triển khai và đầu mối phối hợp.', participants:['Lê Thanh Vân','Trần Thu Hà','Ngô Mỹ Linh'] },
  { id:'event-05', title:'Làm việc trực tuyến với Ban Khoa giáo', startAt:'2026-08-08T14:00:00+07:00', endAt:'2026-08-08T15:00:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/khoa-giao', type:'meeting', organizer:'Đỗ Quang Huy', responseStatus:'declined', meetingId:'TT-448-701', platform:'meeting.tuoitre.vn', agenda:'Đối chiếu số liệu chuyên đề giáo dục và chốt tiến độ bàn giao.', participants:['Đỗ Quang Huy','Nguyễn Minh Anh','Phạm Đức Long'] },
  { id:'event-06', title:'Đào tạo an toàn thông tin', startAt:'2026-08-09T08:30:00+07:00', endAt:'2026-08-09T11:30:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/an-toan-thong-tin', type:'meeting', organizer:'Phòng Công nghệ', responseStatus:'accepted', meetingId:'TT-901-336', platform:'meeting.tuoitre.vn', agenda:'Cập nhật quy định bảo mật và hướng dẫn xử lý sự cố an toàn thông tin.', participants:['Đặng Quốc Bảo','Tạ Minh Châu','Nguyễn Minh Anh'], recordingAvailable:true },
  { id:'event-07', title:'Họp nhóm dự án số hóa', startAt:'2026-08-10T15:00:00+07:00', endAt:'2026-08-10T15:45:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/du-an-so-hoa', type:'meeting', organizer:'Phòng Công nghệ', responseStatus:'pending', meetingId:'TT-218-563', platform:'meeting.tuoitre.vn', agenda:'Rà soát tiến độ số hóa kho tư liệu và các vướng mắc kỹ thuật.', participants:['Tạ Minh Châu','Mai Phương Thảo','Phan Thùy Dung'] },
  { id:'event-08', title:'Tổng kết công việc tuần', startAt:'2026-08-11T16:00:00+07:00', endAt:'2026-08-11T17:00:00+07:00', location:'meeting.tuoitre.vn', meetingUrl:'https://meeting.tuoitre.vn/tong-ket-tuan', type:'meeting', organizer:'Trần Thu Hà', responseStatus:'pending', meetingId:'TT-557-142', platform:'meeting.tuoitre.vn', agenda:'Tổng kết kết quả trong tuần và thống nhất ưu tiên tuần tiếp theo.', participants:['Trần Thu Hà','Nguyễn Minh Anh','Lê Thanh Vân','Đỗ Quang Huy'] },
];

export const calendarEvents: CalendarEvent[] = meetingEvents.map((m) => ({
  ...m,
  type: 'meeting' as const,
}));

export const chatMembers: ChatMember[] = [
  { id: 'user-001', name: 'Nguyễn Minh Anh', email: 'minhanh@noibo.vn', department: 'Ban Nội dung', online: true },
  { id: 'user-002', name: 'Trần Thu Hà', email: 'thuhatran@noibo.vn', department: 'Ban Nội dung', online: true },
  { id: 'user-003', name: 'Nguyễn Hoài Nam', email: 'hoainam@noibo.vn', department: 'Ban Bạn đọc', online: false },
  { id: 'user-004', name: 'Lê Thanh Vân', email: 'thanhvan@noibo.vn', department: 'Văn phòng', online: true },
  { id: 'user-005', name: 'Đỗ Quang Huy', email: 'quanghuy@noibo.vn', department: 'Ban Khoa giáo', online: false },
  { id: 'user-006', name: 'Mai Phương Thảo', email: 'phuongthao@noibo.vn', department: 'Phòng Lưu trữ', online: false },
];

const memberById = (id: string) => chatMembers.find((member) => member.id === id) as ChatMember;

export const conversations: ChatConversation[] = [
  ['chat-01','Trần Thu Hà','Nhờ bạn gửi lại bản kế hoạch trước 15 giờ nhé.','2026-08-05T14:20:00+07:00',2,true],
  ['chat-02','Nhóm Ban Nội dung','Tài liệu họp đã được cập nhật.','2026-08-05T13:45:00+07:00',5,true],
  ['chat-03','Nguyễn Hoài Nam','Cảm ơn bạn, tôi đã nhận được.','2026-08-05T11:10:00+07:00',0,false],
  ['chat-04','Lê Thanh Vân','Chiều nay mình trao đổi nhanh nhé.','2026-08-05T09:25:00+07:00',1,true],
  ['chat-05','Nhóm Dự án số hóa','Biên bản họp đã lưu trên Drive nội bộ.','2026-08-04T17:40:00+07:00',0,false],
  ['chat-06','Đỗ Quang Huy','Số liệu mới đã được đối chiếu.','2026-08-04T15:05:00+07:00',3,false],
  ['chat-07','Phòng Công nghệ','Hệ thống sẽ bảo trì lúc 18 giờ.','2026-08-04T10:30:00+07:00',1,true],
  ['chat-08','Mai Phương Thảo','Hồ sơ còn thiếu một phụ lục.','2026-08-03T16:00:00+07:00',0,false],
].map(([id,participantName,lastMessage,lastMessageAt,unreadCount,online], index) => ({
  id, participantName, lastMessage, lastMessageAt, unreadCount, online,
  isGroup: String(participantName).startsWith('Nhóm') || String(participantName).startsWith('Phòng'),
  pinned: index < 2,
  members: String(participantName).startsWith('Nhóm') || String(participantName).startsWith('Phòng')
    ? [memberById('user-001'), memberById('user-002'), memberById('user-003'), memberById('user-004'), memberById('user-005')]
    : [memberById('user-001'), memberById(`user-00${(index % 5) + 2}`)],
} as ChatConversation));

export const messages: ChatMessage[] = [
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `message-${index + 1}`, conversationId: 'chat-01', senderId: index % 2 ? 'user-001' : 'user-002',
    senderName: index % 2 ? 'Nguyễn Minh Anh' : 'Trần Thu Hà',
    content: index === 11 ? 'Tôi sẽ gửi bản hoàn chỉnh trước 15 giờ.' : `Nội dung trao đổi công việc số ${index + 1}.`,
    sentAt: `2026-08-05T${String(9 + Math.floor(index / 3)).padStart(2,'0')}:${String((index % 3) * 15).padStart(2,'0')}:00+07:00`,
    isMine: index % 2 === 1,
    reactions: index === 2 ? [{ emoji: '👍', count: 2, reacted: false }] : [],
  })),
  { id: 'msg-group-201', conversationId: 'chat-02', senderId: 'user-002', senderName: 'Trần Thu Hà', content: 'Chào cả nhóm! Khung bài viết đề tài tuần này đã sẵn sàng trên Drive nội bộ.', sentAt: '2026-08-05T10:00:00+07:00', isMine: false },
  { id: 'msg-group-202', conversationId: 'chat-02', senderId: 'user-003', senderName: 'Nguyễn Hoài Nam', content: 'Ban Bạn đọc sẽ bổ sung thêm 3 ý kiến phản hồi độc giả vào bài viết.', sentAt: '2026-08-05T11:20:00+07:00', isMine: false },
  { id: 'msg-group-203', conversationId: 'chat-02', senderId: 'user-004', senderName: 'Lê Thanh Vân', content: 'Văn phòng đã duyệt kinh phí tác nghiệp cho nhóm.', sentAt: '2026-08-05T12:15:00+07:00', isMine: false },
  { id: 'msg-group-204', conversationId: 'chat-02', senderId: 'user-001', senderName: 'Nguyễn Minh Anh', content: 'Cảm ơn chị Vân, cả nhóm sẽ chốt bản thảo trước 16 giờ chiều nay.', sentAt: '2026-08-05T13:10:00+07:00', isMine: true },
  { id: 'msg-group-205', conversationId: 'chat-02', senderId: 'user-002', senderName: 'Trần Thu Hà', content: 'Tài liệu họp đã được cập nhật.', sentAt: '2026-08-05T13:45:00+07:00', isMine: false },

  { id: 'msg-group-501', conversationId: 'chat-05', senderId: 'user-005', senderName: 'Đỗ Quang Huy', content: 'Dự án số hóa dữ liệu tư liệu lịch sử báo chí đã hoàn thành giai đoạn 1.', sentAt: '2026-08-04T14:00:00+07:00', isMine: false },
  { id: 'msg-group-502', conversationId: 'chat-05', senderId: 'user-001', senderName: 'Nguyễn Minh Anh', content: 'Mọi người kiểm tra giao diện tìm kiếm mới trên laptop nhé.', sentAt: '2026-08-04T16:30:00+07:00', isMine: true },
  { id: 'msg-group-503', conversationId: 'chat-05', senderId: 'user-004', senderName: 'Lê Thanh Vân', content: 'Biên bản họp đã lưu trên Drive nội bộ.', sentAt: '2026-08-04T17:40:00+07:00', isMine: false },

  { id: 'msg-group-701', conversationId: 'chat-07', senderId: 'user-004', senderName: 'Lê Thanh Vân', content: 'Thông báo: Hệ thống hạ tầng máy chủ sẽ nâng cấp định kỳ.', sentAt: '2026-08-04T10:00:00+07:00', isMine: false },
  { id: 'msg-group-702', conversationId: 'chat-07', senderId: 'user-001', senderName: 'Nguyễn Minh Anh', content: 'Rõ rồi, đã thông báo tới toàn thể cán bộ.', sentAt: '2026-08-04T10:15:00+07:00', isMine: true },
  { id: 'msg-group-703', conversationId: 'chat-07', senderId: 'user-005', senderName: 'Đỗ Quang Huy', content: 'Hệ thống sẽ bảo trì lúc 18 giờ.', sentAt: '2026-08-04T10:30:00+07:00', isMine: false },
];

export const directoryContacts: DirectoryContact[] = [
  ['contact-01', 'Nguyễn Minh Anh', 'Minh Anh', 'Ban Nội dung', '0903 125 418', 'minhanh@noibo.vn', '2101'],
  ['contact-02', 'Trần Thu Hà', 'Thu Hà', 'Ban Nội dung', '0918 340 226', 'thuhatran@noibo.vn', '2102'],
  ['contact-03', 'Phạm Đức Long', undefined, 'Văn phòng', '0908 612 335', 'duclong@noibo.vn', '2201'],
  ['contact-04', 'Nguyễn Hoài Nam', 'Hoài Nam', 'Ban Bạn đọc', '0938 220 914', 'hoainam@noibo.vn'],
  ['contact-05', 'Lê Thanh Vân', undefined, 'Văn phòng', '0907 515 602', 'thanhvan@noibo.vn', '2202'],
  ['contact-06', 'Đỗ Quang Huy', 'Quang Huy', 'Ban Khoa giáo', '0914 733 280', 'quanghuy@noibo.vn', '2401'],
  ['contact-07', 'Mai Phương Thảo', undefined, 'Phòng Lưu trữ', '0983 405 117', 'phuongthao@noibo.vn'],
  ['contact-08', 'Vũ Minh Khôi', undefined, 'Phòng Hành chính', '0902 874 561', 'minhkhoi@noibo.vn', '2601'],
  ['contact-09', 'Hoàng Tuấn Anh', 'Tuấn Anh', 'Ban Thư ký', '0919 662 348', 'tuananh@noibo.vn', '2701'],
  ['contact-10', 'Ngô Mỹ Linh', 'Mỹ Linh', 'Văn phòng', '0932 114 790', 'mylinh@noibo.vn'],
  ['contact-11', 'Bùi Anh Tú', 'Anh Tú', 'Ban Thời sự', '0905 228 619', 'anhtu@noibo.vn', '2801'],
  ['contact-12', 'Phan Thùy Dung', undefined, 'Trung tâm Tư liệu', '0916 704 833', 'thuydung@noibo.vn'],
  ['contact-13', 'Đặng Quốc Bảo', undefined, 'Phòng Công nghệ', '0988 306 452', 'quocbao@noibo.vn', '3001'],
  ['contact-14', 'Tạ Minh Châu', undefined, 'Phòng Công nghệ', '0906 477 128', 'minhchau@noibo.vn', '3002'],
  ['contact-15', 'Đinh Gia Hân', 'Gia Hân', 'Ban Văn hóa', '0935 841 206', 'giahan@noibo.vn'],
  ['contact-16', 'Lương Hải Đăng', 'Hải Đăng', 'Ban Thể thao', '0912 590 774', 'haidang@noibo.vn', '3201'],
  ['contact-17', 'Cao Thanh Tâm', undefined, 'Phòng Tài chính', '0904 218 965', 'thanhtam@noibo.vn'],
  ['contact-18', 'Trịnh Khánh Vy', undefined, 'Phòng Tổ chức', '0977 635 410', 'khanhvy@noibo.vn', '3401'],
].map(([id, fullName, penName, department, phone, email, extension]) => ({ id, fullName, penName, department, phone, email, extension } as DirectoryContact));

const mailAttachmentKinds = [
  { extension: 'pdf', type: 'application/pdf' },
  { extension: 'docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { extension: 'xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
] as const;

export const mails: MailItem[] = Array.from({ length: 15 }, (_, index) => ({
  id: `mail-${String(index + 1).padStart(2,'0')}`,
  senderName: ['Văn phòng','Trần Thu Hà','Phòng Công nghệ','Ban Thư ký','Nguyễn Hoài Nam'][index % 5],
  senderEmail: `donvi${index + 1}@noibo.vn`,
  subject: ['Lịch công tác tuần 32','Yêu cầu cập nhật tiến độ','Thông báo bảo trì hệ thống','Tài liệu họp giao ban','Phản hồi báo cáo chuyên đề'][index % 5],
  preview: 'Thông tin công việc cần theo dõi và phản hồi theo kế hoạch của đơn vị.',
  body: 'Kính gửi anh/chị,\n\nĐề nghị anh/chị xem nội dung đính kèm trên hệ thống và hoàn thành phần việc theo đúng thời hạn.\n\nTrân trọng.',
  sentAt: `2026-08-${String(5 - Math.floor(index / 5)).padStart(2,'0')}T${String(15 - (index % 5)).padStart(2,'0')}:00:00+07:00`,
  isRead: index % 3 === 0,
  isStarred: index % 4 === 0,
  folder: index < 9 ? 'inbox' : index < 12 ? 'sent' : index === 12 ? 'drafts' : index === 13 ? 'archive' : 'trash',
  recipients: index < 9 ? ['minhanh@noibo.vn'] : [`dongnghiep${index + 1}@noibo.vn`],
  cc: index % 5 === 0 ? ['vanphong@noibo.vn'] : [],
  bcc: [],
  labels: index % 3 === 0 ? ['Công việc'] : index % 3 === 1 ? ['Nội bộ'] : [],
  isImportant: index % 4 === 0,
  threadCount: index % 5 === 0 ? 3 : 1,
  attachments: index % 4 === 0 ? [{ id: `mail-attachment-${index + 1}`, name: `tai-lieu-${index + 1}.${mailAttachmentKinds[(index / 4) % mailAttachmentKinds.length].extension}`, size: 245760 + index * 1024, type: mailAttachmentKinds[(index / 4) % mailAttachmentKinds.length].type }] : [],
}));

export const announcements: Announcement[] = Array.from({ length: 10 }, (_, index) => ({
  id: `announcement-${String(index + 1).padStart(2,'0')}`,
  title: ['Kế hoạch tổ chức họp giao ban tháng 8','Quy định sử dụng hệ thống nội bộ','Lịch bảo trì hạ tầng công nghệ','Phát động chương trình tiết kiệm điện','Thông báo lịch trực cơ quan'][index % 5],
  summary: 'Thông tin điều hành và hướng dẫn thực hiện trong toàn cơ quan.',
  content: 'Đề nghị các đơn vị và cá nhân liên quan chủ động theo dõi, phối hợp và thực hiện đúng nội dung thông báo.',
  issuingDepartment: ['Văn phòng','Phòng Công nghệ','Ban Thư ký'][index % 3],
  publishedAt: `2026-08-${String(5 - Math.floor(index / 3)).padStart(2,'0')}T08:00:00+07:00`,
  level: index === 0 ? 'urgent' : index % 3 === 0 ? 'important' : 'normal',
  isRead: index % 2 === 0,
}));
