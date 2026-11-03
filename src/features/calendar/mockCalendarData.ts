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
    // Thứ Hai: ROLE APPROVER - Nguyễn Minh Anh là Người duyệt (Phiếu Chờ duyệt)
    {
      id: `mock-psn-task-mon-${mon.format('YYYYMMDD')}`,
      title: 'Phê duyệt đề tài: Tuyến bài Phóng sự Điều tra Gian lận Thương mại điện tử',
      startAt: mon.hour(17).minute(30).second(0).toISOString(),
      endAt: mon.hour(17).minute(30).second(0).toISOString(),
      deadline: mon.hour(17).minute(30).second(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      scope: 'personal',
      organizer: 'Lê Văn Tuấn',
      leader: 'Lê Văn Tuấn (Trưởng ban Thư ký)',
      participants: [],
      participantText: '',
      isUserParticipant: true,
      executors: [
        { id: 'user-103', name: 'Nguyễn Hoài Nam', role: 'Phóng viên điều tra' },
        { id: 'user-104', name: 'Đỗ Quang Huy', role: 'Phóng viên tác nghiệp' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      approver: { id: 'user-001', name: 'Nguyễn Minh Anh' },
      approvalStatus: 'PENDING',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo', status: 'DONE', completed_at: mon.subtract(1, 'day').toISOString(), actor_name: 'Lê Văn Tuấn', role: 'CREATOR', note: 'Đã hoàn thiện đề cương điều tra và dự toán tác nghiệp liên tỉnh.' },
        { id: 'step-2', step_order: 2, name: 'Phê duyệt', status: 'ACTIVE', actor_name: 'Nguyễn Minh Anh', role: 'APPROVER', note: 'Chờ Lãnh đạo Nguyễn Minh Anh xem xét duyệt đề tài.' },
        { id: 'step-3', step_order: 3, name: 'Triển khai', status: 'PENDING', actor_name: 'Nguyễn Hoài Nam', role: 'EXECUTOR' },
      ],
      agenda: 'Đề xuất tuyến bài điều tra 5 kỳ vạch trần các đường dây lừa đảo qua sàn thương mại điện tử xuyên biên giới.',
      notes: 'Đề xuất tuyến bài điều tra 5 kỳ vạch trần các đường dây lừa đảo qua sàn thương mại điện tử xuyên biên giới.',
      isInterested: true,
      attachments: [
        {
          id: `att-mon-decuong-${mon.format('YYYYMMDD')}`,
          name: 'De-cuong-phong-su-dieu-tra-TMDT-2026.pdf',
          size: 520000,
          type: 'pdf',
          uploadedAt: mon.subtract(1, 'day').hour(17).toISOString(),
          uploadedBy: 'Lê Văn Tuấn',
        },
      ],
      comments: [
        {
          id: 'cmt-task-mon-1',
          author: 'Lê Văn Tuấn',
          content: 'Kính gửi đ/c Nguyễn Minh Anh xem xét và cho ý kiến phê duyệt đề cương tuyến bài.',
          createdAt: mon.hour(8).minute(30).toISOString(),
        },
      ],
    },

    // Thứ Ba: ROLE CONSULTEE - Nguyễn Minh Anh là Người được tham vấn (Phiếu Đang lấy ý kiến)
    {
      id: `mock-psn-task-tue-${tue.format('YYYYMMDD')}`,
      title: 'Tham vấn chuyên môn: Đề án Đổi mới Quy trình Sản xuất Video Tin tức Đa nền tảng',
      startAt: tue.hour(16).minute(0).second(0).toISOString(),
      endAt: tue.hour(16).minute(0).second(0).toISOString(),
      deadline: tue.hour(16).minute(0).second(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      scope: 'personal',
      organizer: 'Trần Thu Hà',
      leader: 'Trần Thu Hà (Phó ban Media)',
      participants: [],
      participantText: '',
      isUserParticipant: true,
      executors: [
        { id: 'user-104', name: 'Đỗ Quang Huy', role: 'Kỹ thuật viên dựng hình' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      approver: { id: 'user-107', name: 'Đ/c Nguyễn Tấn Đạt (Phó Tổng Biên tập)' },
      approvalStatus: 'CONSULTING',
      consultantName: 'Nguyễn Minh Anh',
      consultQuestion: 'Đề nghị đ/c Nguyễn Minh Anh cho ý kiến chuyên môn về hạ tầng streaming video và công cụ dựng clip tin tức ngắn tự động.',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo', status: 'DONE', completed_at: tue.subtract(1, 'day').toISOString(), actor_name: 'Trần Thu Hà', role: 'CREATOR', note: 'Đã lập đề án chuẩn hóa video tin tức cho TikTok & Tuổi Trẻ Online.' },
        { id: 'step-2', step_order: 2, name: 'Lấy ý kiến tham vấn', status: 'CONSULTING', actor_name: 'Nguyễn Minh Anh', role: 'CONSULTANT', note: 'Đang xin ý kiến tham vấn chuyên môn từ Nguyễn Minh Anh.' },
        { id: 'step-3', step_order: 3, name: 'Phê duyệt', status: 'PENDING', actor_name: 'Đ/c Nguyễn Tấn Đạt (Phó Tổng Biên tập)', role: 'APPROVER' },
        { id: 'step-4', step_order: 4, name: 'Triển khai', status: 'PENDING', actor_name: 'Đỗ Quang Huy', role: 'EXECUTOR' },
      ],
      agenda: 'Đề xuất quy trình sản xuất video đa nền tảng tối ưu thời lượng và tăng tương tác độc giả trẻ.',
      notes: 'Đề xuất quy trình sản xuất video đa nền tảng tối ưu thời lượng và tăng tương tác độc giả trẻ.',
      isInterested: true,
      attachments: [
        {
          id: `att-tue-dean-${tue.format('YYYYMMDD')}`,
          name: 'De-an-Quy-trinh-Video-Tin-tuc-Shorts.docx',
          size: 410000,
          type: 'docx',
          uploadedAt: tue.subtract(1, 'day').hour(16).toISOString(),
          uploadedBy: 'Trần Thu Hà',
        },
      ],
      comments: [
        {
          id: 'cmt-task-tue-1',
          author: 'Trần Thu Hà',
          content: 'Nhờ anh Minh Anh xem qua phần đề xuất công cụ tự động tạo phụ đề và cắt highlight tin bài nhé.',
          createdAt: tue.hour(9).minute(15).toISOString(),
        },
      ],
    },

    // Thứ Tư: ROLE EXECUTOR - Nguyễn Minh Anh là Người triển khai / thực hiện (Phiếu Đang triển khai)
    {
      id: `mock-psn-task-wed-${wed.format('YYYYMMDD')}`,
      title: 'Triển khai tuyến bài ảnh: Không gian Kiến trúc Xanh và Đô thị Bền vững TP.HCM',
      startAt: wed.hour(17).minute(30).second(0).toISOString(),
      endAt: wed.hour(17).minute(30).second(0).toISOString(),
      deadline: wed.hour(17).minute(30).second(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      scope: 'personal',
      organizer: 'Hoàng Điệp',
      leader: 'Hoàng Điệp',
      participants: [],
      participantText: '',
      isUserParticipant: true,
      executors: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', role: 'Phóng viên ảnh chính' },
        { id: 'user-103', name: 'Nguyễn Hoài Nam', role: 'Phóng viên phối hợp' },
      ],
      watchers: [
        { id: 'user-107', name: 'Trần Xuân Toàn' },
      ],
      approver: { id: 'user-105', name: 'Lê Thanh Vân (Văn phòng BBT)' },
      approvalStatus: 'APPROVED',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo', status: 'DONE', completed_at: wed.subtract(2, 'day').toISOString(), actor_name: 'Hoàng Điệp', role: 'CREATOR' },
        { id: 'step-2', step_order: 2, name: 'Phê duyệt', status: 'APPROVED', completed_at: wed.subtract(1, 'day').toISOString(), actor_name: 'Lê Thanh Vân (Văn phòng BBT)', role: 'APPROVER', note: 'Đồng ý chủ trương và cấp phương tiện tác nghiệp flycam.' },
        { id: 'step-3', step_order: 3, name: 'Triển khai', status: 'ACTIVE', actor_name: 'Nguyễn Minh Anh', role: 'EXECUTOR', note: 'Đang tiến hành chụp thực địa tại khu đô thị Thủ Thiêm và bến Bạch Đằng.' },
      ],
      agenda: 'Thực hiện phóng sự ảnh flycam và visual story về các mảng xanh kiến trúc mới tại TP.HCM.',
      notes: 'Thực hiện phóng sự ảnh flycam và visual story về các mảng xanh kiến trúc mới tại TP.HCM.',
      isInterested: false,
      comments: [
        {
          id: 'cmt-task-wed-1',
          author: 'Hoàng Điệp',
          content: 'Tuyến ảnh tiến độ thế nào rồi anh Minh Anh? Cố gắng hoàn thành trong hôm nay để kịp duyệt số báo thứ Năm nhé.',
          createdAt: wed.hour(10).minute(0).toISOString(),
        },
      ],
    },

    // Thứ Năm: ROLE CREATOR - Nguyễn Minh Anh là Người tạo lịch họp / chủ trì (Lịch họp cá nhân)
    {
      id: `mock-psn-meet-thu-${thu.format('YYYYMMDD')}`,
      title: 'Họp chuyên đề: Đổi mới Format Chương trình Media Trực tuyến Báo Tuổi Trẻ',
      startAt: thu.hour(10).minute(0).second(0).toISOString(),
      endAt: thu.hour(11).minute(30).second(0).toISOString(),
      location: 'Phòng họp Kỹ thuật (Phòng 302)',
      meetingUrl: 'https://meeting.tuoitre.vn/media-format-2026',
      platform: 'meeting.tuoitre.vn',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'hybrid',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      leader: 'Nguyễn Minh Anh',
      participantText: 'Nguyễn Minh Anh, Lê Thanh Vân, Đỗ Quang Huy, Trần Thu Hà',
      participants: ['Nguyễn Minh Anh', 'Lê Thanh Vân', 'Đỗ Quang Huy', 'Trần Thu Hà'],
      isUserParticipant: true,
      watchers: [
        { id: 'user-107', name: 'Trần Xuân Toàn' },
      ],
      approvalStatus: 'APPROVED',
      agenda: 'Rà soát format trường quay podcast và kịch bản tương tác trực tiếp với bạn đọc trên các nền tảng số.',
      attachments: [
        {
          id: `att-thu-khao-sat-${thu.format('YYYYMMDD')}`,
          name: 'Khao-sat-Format-Chuong-trinh-Media-2026.pdf',
          size: 680000,
          type: 'pdf',
          uploadedAt: thu.hour(8).minute(0).toISOString(),
          uploadedBy: 'Nguyễn Minh Anh',
        },
      ],
      comments: [
        {
          id: 'cmt-thu-1',
          author: 'Lê Thanh Vân',
          content: 'Chị sẽ tham gia đúng giờ, có chuẩn bị ý kiến đóng góp về phần podcast bạn đọc.',
          createdAt: thu.hour(8).minute(45).toISOString(),
        },
      ],
    },

    // Thứ Sáu: ROLE WATCHER - Nguyễn Minh Anh là Người theo dõi phiếu (Phiếu do phòng khác chủ trì)
    {
      id: `mock-psn-task-fri-${fri.format('YYYYMMDD')}`,
      title: 'Kế hoạch Nâng cấp Hệ thống Máy chủ và Diễn tập An toàn Thông tin CMS Tòa soạn',
      startAt: fri.hour(17).minute(0).second(0).toISOString(),
      endAt: fri.hour(17).minute(0).second(0).toISOString(),
      deadline: fri.hour(17).minute(0).second(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      scope: 'personal',
      organizer: 'Võ Hoàng Nam',
      leader: 'Võ Hoàng Nam (Trưởng phòng Kỹ thuật)',
      participants: [],
      participantText: '',
      isUserParticipant: false,
      isUserWatcher: true,
      executors: [
        { id: 'user-106', name: 'Phan Nghệ Đô', role: 'Kỹ sư an toàn mạng' },
        { id: 'user-108', name: 'Lê Văn Tuấn', role: 'Kỹ thuật viên hệ thống' },
      ],
      watchers: [
        { id: 'user-001', name: 'Nguyễn Minh Anh' },
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      approver: { id: 'user-109', name: 'Đ/c Trần Xuân Toàn (Phó Tổng Biên tập)' },
      approvalStatus: 'APPROVED',
      steps: [
        { id: 'step-1', step_order: 1, name: 'Khởi tạo', status: 'DONE', completed_at: fri.subtract(2, 'day').toISOString(), actor_name: 'Võ Hoàng Nam', role: 'CREATOR' },
        { id: 'step-2', step_order: 2, name: 'Phê duyệt', status: 'APPROVED', completed_at: fri.subtract(1, 'day').toISOString(), actor_name: 'Trần Xuân Toàn (Phó Tổng Biên tập)', role: 'APPROVER' },
        { id: 'step-3', step_order: 3, name: 'Triển khai', status: 'ACTIVE', actor_name: 'Phan Nghệ Đô', role: 'EXECUTOR', note: 'Đang cấu hình cụm máy chủ dự phòng và kịch bản chống tấn công DDoS.' },
      ],
      agenda: 'Diễn tập quy trình ứng cứu sự cố gián đoạn dịch vụ báo điện tử trong khung giờ cao điểm phát hành bản tin nóng.',
      notes: 'Diễn tập quy trình ứng cứu sự cố gián đoạn dịch vụ báo điện tử trong khung giờ cao điểm phát hành bản tin nóng.',
      isInterested: false,
      comments: [
        {
          id: 'cmt-fri-1',
          author: 'Võ Hoàng Nam',
          content: 'Đã hoàn thành kiểm tra kết nối với hệ thống sao lưu điện toán đám mây. Tiến hành diễn tập lúc 23:00.',
          createdAt: fri.hour(14).minute(10).toISOString(),
        },
      ],
    },

    // Thứ Bảy: Họp Ban Thư ký Tòa soạn & Trực ca báo cuối tuần
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

  // Lọc sự kiện hiện có rơi vào tuần này (bao gồm fixtures và sự kiện do người dùng tạo/sửa)
  const weekExisting = existingEvents.filter((ev) => {
    const d = dayjs(ev.startAt).format('YYYY-MM-DD');
    return d >= startStr && d <= endStr;
  });

  // Đảm bảo các sự kiện hiện có đều có ticketType chuẩn
  const enrichedExisting = weekExisting.map((ev) => ({
    ...ev,
    ticketType: ev.ticketType || (ev.type === 'meeting' ? 'MEETING' : 'TASK'),
  }));

  const existingIds = new Set(enrichedExisting.map((ev) => ev.id));
  const personalList = getMockPersonalEvents(weekStart);
  const editorialList = getMockEditorialEvents(weekStart);

  const additions: CalendarEvent[] = [];
  personalList.forEach((ev) => {
    if (!existingIds.has(ev.id)) additions.push(ev);
  });
  editorialList.forEach((ev) => {
    if (!existingIds.has(ev.id)) additions.push(ev);
  });

  return [...enrichedExisting, ...additions];
}
