import dayjs, { type Dayjs } from 'dayjs';

import type { CalendarEvent } from '@/types/domain';

/**
 * Sinh dữ liệu mẫu động cho tuần đang chọn (Ban biên tập, Cá nhân, Task, Meeting, Event)
 */
export function getMockEditorialEvents(weekStart: Dayjs): CalendarEvent[] {
  const mon = weekStart.startOf('isoWeek');
  const tue = mon.add(1, 'day');
  const wed = mon.add(2, 'day');
  const thu = mon.add(3, 'day');
  const fri = mon.add(4, 'day');
  const sat = mon.add(5, 'day');

  return [
    // Thứ Hai: Chào cờ đầu tuần
    {
      id: `mock-bbt-mon-flag-${mon.format('YYYYMMDD')}`,
      title: 'Chào cờ đầu tuần',
      startAt: mon.hour(7).minute(45).second(0).toISOString(),
      endAt: mon.hour(8).minute(0).second(0).toISOString(),
      location: 'Sân T.1 BP KQĐ VPĐD',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Ban Biên tập',
      participantText: 'Ban Biên tập, tất cả CB-NV, NLĐ',
      participantCount: 150,
      isUserParticipant: true,
      responseStatus: 'accepted',
      agenda: 'Chào cờ đầu tuần định kỳ và thông báo chung của Tòa soạn.',
      attachments: [
        {
          id: `att-flag-${mon.format('YYYYMMDD')}`,
          name: 'Thong-bao-chao-co-dau-tuan-thang-10.pdf',
          size: 245000,
          type: 'pdf',
          uploadedAt: mon.subtract(1, 'day').hour(15).toISOString(),
          uploadedBy: 'Văn phòng BBT',
        },
      ],
      comments: [
        {
          id: `cmt-flag-1`,
          author: 'Lê Thanh Vân',
          content: 'Đề nghị các ban có mặt đúng 7g40 để ổn định vị trí.',
          createdAt: mon.subtract(1, 'day').hour(16).minute(30).toISOString(),
        },
      ],
    },
    // Thứ Hai: Họp Ban Biên tập
    {
      id: `mock-bbt-mon-bbt-${mon.format('YYYYMMDD')}`,
      title: 'Họp Ban Biên tập',
      startAt: mon.hour(8).minute(0).second(0).toISOString(),
      endAt: mon.hour(9).minute(0).second(0).toISOString(),
      location: 'PH3A',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Ban Biên tập',
      participantText: 'Ban Biên tập, Ngọc Hiển',
      participantCount: 12,
      isUserParticipant: false,
      isAdjusted: true,
      adjustedNote: 'Dời thời gian họp sớm 30 phút (08:00 thay vì 08:30)',
      agenda: 'Họp giao ban lãnh đạo Ban Biên tập.',
    },
    // Thứ Hai: Họp giao ban tin ca 1
    {
      id: `mock-bbt-mon-news-${mon.format('YYYYMMDD')}`,
      title: 'Họp giao ban tin ca 1',
      startAt: mon.hour(8).minute(30).second(0).toISOString(),
      endAt: mon.hour(9).minute(30).second(0).toISOString(),
      location: 'PHT5',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Tòa soạn',
      leader: 'Anh Hoàng Nguyên',
      participantText: 'Anh Hoàng Nguyên, TKTS trực, BTV ca trực, BTV tòa soạn, BTV mảng, Văn phòng',
      isUserParticipant: false,
      dutyInfo: 'Lịch TS: Ca 0: TKTS: Đà Trang - Ca 1: TKTS: Viễn Sự, N.V.Hải; BTV: Lan Anh, H.Điệp',
    },
    // Thứ Hai: Họp trực tuyến Hội đồng biên tập
    {
      id: `mock-bbt-mon-board-${mon.format('YYYYMMDD')}`,
      title: 'Họp trực tuyến Hội đồng biên tập',
      startAt: mon.hour(9).minute(30).second(0).toISOString(),
      endAt: mon.hour(11).minute(30).second(0).toISOString(),
      location: 'HTT2',
      meetingUrl: 'https://meeting.tuoitre.vn/hoi-dong-bien-tap',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'online',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Anh Xuân Toàn',
      participantText: 'Anh Xuân Toàn, BBT, TKTS, BTV, Giám đốc các TT',
      participantCount: 60,
      isUserParticipant: false,
      agenda: 'Đánh giá chất lượng nội dung và định hướng tuyên truyền trong tuần.',
    },
    // Thứ Hai: Họp giao ban phóng viên (có điều chỉnh)
    {
      id: `mock-bbt-mon-reporters-${mon.format('YYYYMMDD')}`,
      title: 'Họp giao ban phóng viên',
      startAt: mon.hour(15).minute(30).second(0).toISOString(),
      endAt: mon.hour(17).minute(0).second(0).toISOString(),
      location: 'Hội trường HTT2',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Ban Biên tập',
      participantText: 'Ban Biên tập, Trưởng các ban, Phóng viên các khối',
      participantCount: 85,
      isUserParticipant: true,
      responseStatus: 'accepted',
      isAdjusted: true,
      adjustedNote: 'Thay đổi địa điểm sang Hội trường HTT2 (thay vì PH1)',
      agenda: 'Định hướng các tuyến bài phóng sự điều tra và chuyên đề tháng.',
    },
    // Thứ Ba: Hội đồng Duyệt Maket Báo in & Tuyến bài Phóng sự Điều tra
    {
      id: `mock-bbt-tue-${tue.format('YYYYMMDD')}`,
      title: 'Hội đồng Duyệt Maket Báo in & Tuyến bài Phóng sự Điều tra',
      startAt: tue.hour(14).minute(0).second(0).toISOString(),
      endAt: tue.hour(16).minute(30).second(0).toISOString(),
      location: 'PH1',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Đ/c Đinh Minh Trung - Phó Tổng Biên tập',
      participantText: 'Hội đồng duyệt bài, Ban Thư ký Tòa soạn, Tổ Thiết kế Maket',
      participantCount: 15,
      isUserParticipant: false,
      agenda: 'Kiểm duyệt đề cương phóng sự điều tra độc quyền, phê duyệt bố cục maket trang 1.',
    },
    // Thứ Tư: Giao ban Chuyển đổi số & Media
    {
      id: `mock-bbt-wed-${wed.format('YYYYMMDD')}`,
      title: 'Giao ban Chuyển đổi số & Phát triển Báo chí Đa nền tảng',
      startAt: wed.hour(9).minute(30).second(0).toISOString(),
      endAt: wed.hour(11).minute(30).second(0).toISOString(),
      location: 'Hội trường Trung tâm Media (Lầu 1)',
      meetingUrl: 'https://meeting.tuoitre.vn/chuyen-doi-so',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'hybrid',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Đ/c Trần Xuân Toàn - Phó Tổng Biên tập',
      participantText: 'Trung tâm Media, Tuổi Trẻ Online, Trung tâm CNTT',
      participantCount: 28,
      isUserParticipant: false,
      agenda: 'Đánh giá tốc độ truy cập hệ sinh thái CMS, kiểm thử luồng video tin tức trên các nền tảng.',
    },
    // Thứ Năm: Tọa đàm Hợp tác Phát triển Nội dung Kinh tế - Tài chính Xanh (Sự kiện)
    {
      id: `mock-bbt-thu-${thu.format('YYYYMMDD')}`,
      title: 'Tọa đàm Hợp tác Phát triển Nội dung Kinh tế - Tài chính Xanh',
      startAt: thu.hour(15).minute(0).second(0).toISOString(),
      endAt: thu.hour(17).minute(0).second(0).toISOString(),
      location: 'Phòng khách Quốc tế (Lầu 2)',
      type: 'work',
      ticketType: 'EVENT',
      scope: 'editorial',
      organizer: 'Ban Kinh tế & Ban Trị sự',
      leader: 'Ban Kinh tế & Ban Trị sự',
      participantText: 'Ban Kinh tế, Ban Trị sự, Đoàn Chuyên gia Khách mời',
      participantCount: 35,
      isUserParticipant: true,
      executors: [
        { id: 'user-201', name: 'Trần Văn Bình', role: 'Điều phối tọa đàm' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Văn Tuấn (Trưởng ban Trị sự)' },
      ],
      approver: { id: 'user-101', name: 'Đ/c Lê Thế Chữ - Tổng Biên tập' },
      approvalStatus: 'PENDING',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo sự kiện', status: 'DONE', actor_name: 'Ban Kinh tế' },
        { id: 'step-2', step_order: 2, name: 'Phê duyệt chủ trương', status: 'ACTIVE', actor_name: 'Lê Thế Chữ' },
        { id: 'step-3', step_order: 3, name: 'Triển khai tọa đàm', status: 'PENDING', actor_name: 'Trần Văn Bình' },
      ],
      agenda: 'Trao đổi với đoàn chuyên gia viện nghiên cứu kinh tế về chuyên trang Net Zero và tăng trưởng bền vững.',
    },
    // Thứ Sáu: Giao ban Xuất bản Báo in & Chuẩn bị Số báo Cuối tuần
    {
      id: `mock-bbt-fri-${fri.format('YYYYMMDD')}`,
      title: 'Giao ban Xuất bản Báo in & Chuẩn bị Số báo Cuối tuần',
      startAt: fri.hour(16).minute(0).second(0).toISOString(),
      endAt: fri.hour(17).minute(30).second(0).toISOString(),
      location: 'Phòng Giao ban Tòa soạn',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Ban Thư ký Tòa soạn',
      leader: 'Ban Thư ký Tòa soạn',
      participantText: 'Ban Thư ký Tòa soạn, Ban Văn hóa, Ban Thể thao',
      participantCount: 20,
      isUserParticipant: false,
      agenda: 'Tổng kết số lượng phát hành tuần qua, hoàn thiện các trang văn hóa - thể thao Tuổi Trẻ Cuối tuần.',
    },
    // Thứ Bảy: Giao ban Báo cuối tuần & Kế hoạch Xuất bản tuần tới
    {
      id: `mock-bbt-sat-${sat.format('YYYYMMDD')}`,
      title: 'Giao ban Báo cuối tuần & Kế hoạch Xuất bản tuần tới',
      startAt: sat.hour(8).minute(30).second(0).toISOString(),
      endAt: sat.hour(10).minute(30).second(0).toISOString(),
      location: 'Phòng họp BBT',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Ban Thư ký Tòa soạn',
      leader: 'Ban Thư ký Tòa soạn',
      participantText: 'Ban Thư ký Tòa soạn, BTV trực ca',
      participantCount: 14,
      isUserParticipant: false,
    },
  ];
}

export function getMockPersonalEvents(weekStart: Dayjs): CalendarEvent[] {
  const mon = weekStart.startOf('isoWeek');
  const tue = mon.add(1, 'day');
  const wed = mon.add(2, 'day');
  const thu = mon.add(3, 'day');
  const fri = mon.add(4, 'day');
  const sat = mon.add(5, 'day');

  return [
    // Thứ Hai: TASK kết nối Micro-Frontend (1 mốc thời gian, không có participants, có executors, watchers, approver)
    {
      id: `mock-psn-task-mon-${mon.format('YYYYMMDD')}`,
      title: 'Triển khai kết nối Micro-Frontend Phiếu công việc & Lịch tuần',
      startAt: mon.hour(17).minute(30).second(0).toISOString(),
      endAt: mon.hour(17).minute(30).second(0).toISOString(),
      deadline: mon.hour(17).minute(30).second(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      leader: 'Nguyễn Minh Anh',
      // TASK KHÔNG CÓ THÀNH PHẦN THAM GIA
      participants: [],
      participantText: '',
      isUserParticipant: true,
      executors: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', role: 'Chủ trì kỹ thuật' },
        { id: 'user-102', name: 'Trần Thu Hà', role: 'Kiểm thử Webpack 5' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      approver: { id: 'user-107', name: 'Đ/c Nguyễn Tấn Đạt (Phó Tổng Biên tập)' },
      approvalStatus: 'PENDING',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo', status: 'DONE', completed_at: mon.toISOString(), actor_name: 'Nguyễn Minh Anh', role: 'CREATOR', note: 'Đã hoàn tất lập đề xuất và đính kèm tài liệu kiến trúc.' },
        { id: 'step-2', step_order: 2, name: 'Phê duyệt', status: 'ACTIVE', actor_name: 'Đ/c Nguyễn Tấn Đạt (Phó Tổng Biên tập)', role: 'APPROVER' },
        { id: 'step-3', step_order: 3, name: 'Triển khai', status: 'PENDING', actor_name: 'Nguyễn Minh Anh', role: 'EXECUTOR' },
      ],
      agenda: 'Rà soát tích hợp Webpack 5 Module Federation giữa host ERP và remote RemoteJobTicket.',
      notes: 'Rà soát tích hợp Webpack 5 Module Federation giữa host ERP và remote RemoteJobTicket.',
      isInterested: true,
      comments: [
        {
          id: 'cmt-task-1',
          author: 'Nguyễn Minh Anh',
          content: 'Đã hoàn tất kiểm thử cơ chế expose component và các hook điều hướng.',
          createdAt: mon.hour(14).minute(20).toISOString(),
        },
        {
          id: 'cmt-task-2',
          author: 'Trần Thu Hà',
          content: 'Đã xác nhận hoạt động ổn định trên cả môi trường Dev và Production.',
          createdAt: mon.hour(15).minute(45).toISOString(),
        },
      ],
    },
    // Thứ Ba: MEETING Họp trực tuyến Tiêu dùng số
    {
      id: `mock-psn-meet-tue-${tue.format('YYYYMMDD')}`,
      title: 'Họp trực tuyến: Tuyến bài Điều tra Tiêu dùng số',
      startAt: tue.hour(9).minute(0).second(0).toISOString(),
      endAt: tue.hour(10).minute(30).second(0).toISOString(),
      location: 'Trực tuyến',
      meetingUrl: 'https://meeting.tuoitre.vn/tieu-dung-so-2026',
      platform: 'meeting.tuoitre.vn',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'online',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      leader: 'Nguyễn Minh Anh',
      participantText: 'Nguyễn Minh Anh, Lê Thanh Vân, Trần Thu Hà',
      participants: ['Nguyễn Minh Anh', 'Lê Thanh Vân', 'Trần Thu Hà'],
      isUserParticipant: true,
      responseStatus: 'accepted',
      agenda: 'Thống nhất dàn ý, phân công phỏng vấn các hiệp hội bảo vệ quyền lợi người tiêu dùng.',
      attachments: [
        {
          id: `att-tieu-dung-${tue.format('YYYYMMDD')}`,
          name: 'De-cuong-dieu-tra-tieu-dung-so-v2.docx',
          size: 380000,
          type: 'docx',
          uploadedAt: tue.hour(8).minute(30).toISOString(),
          uploadedBy: 'Nguyễn Minh Anh',
        },
      ],
      comments: [
        {
          id: 'cmt-meet-1',
          author: 'Lê Thanh Vân',
          content: 'Chị đã xem đề cương, rất hay. Chiều nay bàn thêm góc phỏng vấn ngân hàng nhé.',
          createdAt: tue.hour(8).minute(50).toISOString(),
        },
      ],
    },
    // Thứ Tư: TASK Báo cáo tiến độ ký số OTP 2FA (1 mốc thời gian, không có participants, có executors, watchers, approver)
    {
      id: `mock-psn-task-wed-${wed.format('YYYYMMDD')}`,
      title: 'Hoàn thiện Báo cáo Tiến độ Số hóa Quy trình Ký điện tử OTP 2FA',
      startAt: wed.hour(17).minute(0).second(0).toISOString(),
      endAt: wed.hour(17).minute(0).second(0).toISOString(),
      deadline: wed.hour(17).minute(0).second(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      leader: 'Nguyễn Minh Anh',
      participants: [],
      participantText: '',
      isUserParticipant: true,
      executors: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', role: 'Soạn thảo báo cáo' },
      ],
      watchers: [
        { id: 'user-107', name: 'Trần Xuân Toàn' },
      ],
      approver: { id: 'user-105', name: 'Lê Thanh Vân (Văn phòng BBT)' },
      approvalStatus: 'APPROVED',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo', status: 'DONE', completed_at: wed.toISOString(), actor_name: 'Nguyễn Minh Anh', role: 'CREATOR', note: 'Khởi tạo phiếu và gửi trình phê duyệt số hóa OTP.' },
        { id: 'step-2', step_order: 2, name: 'Phê duyệt', status: 'APPROVED', completed_at: wed.add(1, 'hour').toISOString(), actor_name: 'Lê Thanh Vân (Văn phòng BBT)', role: 'APPROVER', note: 'Đồng ý chủ trương triển khai thử nghiệm ký số OTP 2FA.' },
        { id: 'step-3', step_order: 3, name: 'Triển khai', status: 'ACTIVE', actor_name: 'Nguyễn Minh Anh', role: 'EXECUTOR' },
      ],
      agenda: 'Tổng kết số lượng phiếu phát hành thành công và kịch bản bảo mật chữ ký điện tử xác thực 2 lớp.',
      notes: 'Tổng kết số lượng phiếu phát hành thành công và kịch bản bảo mật chữ ký điện tử xác thực 2 lớp.',
      isInterested: false,
    },
    // Thứ Năm: MEETING Họp demo kịch bản Ban Biên tập
    {
      id: `mock-psn-meet-thu-${thu.format('YYYYMMDD')}`,
      title: 'Họp nhóm Dự án: Kiểm thử giao diện và kịch bản Demo Ban Biên tập',
      startAt: thu.hour(10).minute(0).second(0).toISOString(),
      endAt: thu.hour(11).minute(30).second(0).toISOString(),
      location: 'Phòng họp Kỹ thuật (Phòng 302)',
      meetingUrl: 'https://meeting.tuoitre.vn/bbt-demo-prep',
      platform: 'meeting.tuoitre.vn',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'hybrid',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      leader: 'Nguyễn Minh Anh',
      participantText: 'Nguyễn Minh Anh, Lê Thanh Vân, Đỗ Quang Huy',
      participants: ['Nguyễn Minh Anh', 'Lê Thanh Vân', 'Đỗ Quang Huy'],
      isUserParticipant: true,
      agenda: 'Duyệt slide thuyết trình và chuẩn bị dữ liệu demo cho buổi báo cáo Lãnh đạo cơ quan.',
    },
    // Thứ Sáu: EVENT Sinh hoạt chuyên đề
    {
      id: `mock-psn-event-fri-${fri.format('YYYYMMDD')}`,
      title: 'Sinh hoạt chuyên đề: Kỹ năng Báo chí Đa phương tiện & Trí tuệ Nhân tạo',
      startAt: fri.hour(9).minute(30).second(0).toISOString(),
      endAt: fri.hour(11).minute(30).second(0).toISOString(),
      location: 'Hội trường Lầu 2 - Tòa soạn Tuổi Trẻ',
      type: 'work',
      ticketType: 'EVENT',
      scope: 'personal',
      organizer: 'Trần Văn Bình',
      leader: 'Trần Văn Bình',
      participantText: 'Nguyễn Minh Anh, Trần Thu Hà, Hoàng Điệp, Đỗ Quang Huy',
      participants: ['Nguyễn Minh Anh', 'Trần Thu Hà', 'Hoàng Điệp', 'Đỗ Quang Huy'],
      isUserParticipant: true,
      executors: [
        { id: 'user-201', name: 'Trần Văn Bình', role: 'Chủ trì nội dung' },
        { id: 'user-001', name: 'Nguyễn Minh Anh', role: 'Thuyết trình viên' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      approver: { id: 'user-107', name: 'Đ/c Trần Xuân Toàn (Phó Tổng Biên tập)' },
      approvalStatus: 'CONSULTING',
      consultantName: 'TS. Trần Quốc Hùng (Chuyên gia khách mời)',
      consultQuestion: 'Đề nghị chuyên gia tham vấn đánh giá nội dung chương trình đào tạo và định mức chi phí hỗ trợ diễn giả.',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo', status: 'DONE', completed_at: fri.subtract(1, 'day').toISOString(), actor_name: 'Trần Văn Bình', role: 'CREATOR', note: 'Đã hoàn thiện đề cương tập huấn chuyên đề.' },
        { id: 'step-2', step_order: 2, name: 'Lấy ý kiến tham vấn', status: 'CONSULTING', actor_name: 'TS. Trần Quốc Hùng', role: 'CONSULTANT', note: 'Đang xin ý kiến chuyên môn về đề xuất khung đào tạo.' },
        { id: 'step-3', step_order: 3, name: 'Triển khai', status: 'PENDING', actor_name: 'Nguyễn Minh Anh', role: 'EXECUTOR' },
      ],
      agenda: 'Tập huấn ứng dụng AI tạo sinh trong hỗ trợ sản xuất nội dung báo chí hiện đại.',
    },
    // Thứ Bảy: MEETING Họp Ban Thư ký Tòa soạn & Trực ca báo cuối tuần
    {
      id: `mock-psn-meet-sat-${sat.format('YYYYMMDD')}`,
      title: 'Họp Ban Thư ký Tòa soạn & Trực ca báo cuối tuần',
      startAt: sat.hour(9).minute(0).second(0).toISOString(),
      endAt: sat.hour(11).minute(0).second(0).toISOString(),
      location: 'Phòng họp Thư ký Tòa soạn',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'offline',
      scope: 'personal',
      organizer: 'Phạm Hồng Ngọc',
      leader: 'Phạm Hồng Ngọc',
      participantText: 'Nguyễn Minh Anh, Hoàng Điệp, Phạm Hồng Ngọc',
      participants: ['Nguyễn Minh Anh', 'Hoàng Điệp', 'Phạm Hồng Ngọc'],
      isUserParticipant: true,
      agenda: 'Rà soát quy trình xuất bản các ấn phẩm phụ san và bản tin đặc biệt ngày Chủ nhật.',
    },
  ];
}

/**
 * Lấy danh sách sự kiện cho tuần đang xem.
 * Nếu tuần đó đã có dữ liệu từ database/fixtures (ví dụ tuần 41), bổ sung các sự kiện Task/Event còn thiếu.
 * Nếu tuần đó chưa có dữ liệu (ví dụ tuần hiện tại hoặc các tuần khác), tự động sinh đầy đủ dữ liệu mẫu cho tuần đó.
 */
export function getEventsForWeek(weekStart: Dayjs, existingEvents: CalendarEvent[] = []): CalendarEvent[] {
  const startStr = weekStart.startOf('isoWeek').format('YYYY-MM-DD');
  const endStr = weekStart.endOf('isoWeek').format('YYYY-MM-DD');

  // Lọc sự kiện hiện có rơi vào tuần này
  const weekExisting = existingEvents.filter((ev) => {
    const d = dayjs(ev.startAt).format('YYYY-MM-DD');
    return d >= startStr && d <= endStr;
  });

  // Nếu tuần này đã có từ 3 sự kiện trở lên (ví dụ tuần 41 với fixtures chuẩn)
  if (weekExisting.length >= 3) {
    // Đảm bảo các sự kiện hiện có đều có ticketType chuẩn
    const enrichedExisting = weekExisting.map((ev) => ({
      ...ev,
      ticketType: ev.ticketType || (ev.type === 'meeting' ? 'MEETING' : 'TASK'),
    }));

    // Bổ sung đầy đủ các sự kiện mẫu (Chờ duyệt PENDING, Đang làm APPROVED, Lấy ý kiến CONSULTING)
    const existingIds = new Set(enrichedExisting.map((ev) => ev.id));
    const personalList = getMockPersonalEvents(weekStart);
    const editorialList = getMockEditorialEvents(weekStart);

    const additions: CalendarEvent[] = [];
    personalList.forEach((ev) => {
      if (!existingIds.has(ev.id)) additions.push(ev);
    });
    editorialList.forEach((ev) => {
      if (!existingIds.has(ev.id) && ev.ticketType === 'EVENT') additions.push(ev);
    });

    return [...enrichedExisting, ...additions];
  }

  // Nếu tuần này chưa có sự kiện nào (ví dụ chuyển sang tuần mới hoặc tuần hiện tại),
  // tự động sinh toàn bộ dữ liệu phong phú theo tuần đó
  const editorial = getMockEditorialEvents(weekStart);
  const personal = getMockPersonalEvents(weekStart);
  return [...editorial, ...personal];
}
