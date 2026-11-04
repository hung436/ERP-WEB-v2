import dayjs, { type Dayjs } from 'dayjs';

import type { CalendarEvent } from '@/types/domain';

/**
 * Sinh danh sách sự kiện Ban Biên tập chuẩn chỉnh cho tuần đang xem.
 * Đầy đủ nghiệp vụ Tòa soạn Báo Tuổi Trẻ: Chào cờ, họp BBT, duyệt maket, giao ban báo chí số, tọa đàm, xuất bản.
 */
export function getMockEditorialEvents(weekStart: Dayjs): CalendarEvent[] {
  const mon = weekStart.startOf('isoWeek');
  const tue = mon.add(1, 'day');
  const wed = mon.add(2, 'day');
  const thu = mon.add(3, 'day');
  const fri = mon.add(4, 'day');
  const sat = mon.add(5, 'day');

  return [
    // --- THỨ HAI ---
    // Chào cờ đầu tuần (Sự kiện toàn cơ quan, user tham gia)
    {
      id: `bbt-mon-flag-${mon.format('YYYYMMDD')}`,
      title: 'Chào cờ đầu tuần',
      startAt: mon.hour(7).minute(45).second(0).toISOString(),
      endAt: mon.hour(8).minute(0).second(0).toISOString(),
      createdAt: mon.subtract(2, 'day').hour(10).toISOString(),
      location: 'Sân T.1 BP KQĐ VPĐD',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'offline',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Ban Biên tập',
      participantText: 'Ban Biên tập, tất cả CB-NV, NLĐ',
      participantCount: 150,
      isUserParticipant: true,
      responseStatus: 'accepted',
      approvalStatus: 'SCHEDULED',
      agenda: 'Chào cờ đầu tuần',
      attachments: [
        {
          id: `att-flag-${mon.format('YYYYMMDD')}`,
          name: 'Thong-bao-chao-co-dau-tuan.pdf',
          size: 245000,
          type: 'pdf',
          uploadedAt: mon.subtract(1, 'day').hour(15).toISOString(),
          uploadedBy: 'Văn phòng BBT',
        },
      ],
      comments: [
        {
          id: 'cmt-flag-1',
          author: 'Lê Thanh Vân',
          content: 'Đề nghị các ban có mặt đúng 7g40 để ổn định vị trí chào cờ.',
          createdAt: mon.subtract(1, 'day').hour(16).minute(30).toISOString(),
        },
      ],
    },
    // Họp Ban Biên tập
    {
      id: `bbt-mon-bbt-${mon.format('YYYYMMDD')}`,
      title: 'Họp Ban Biên tập',
      startAt: mon.hour(8).minute(0).second(0).toISOString(),
      endAt: mon.hour(9).minute(0).second(0).toISOString(),
      createdAt: mon.subtract(2, 'day').hour(14).toISOString(),
      location: 'PH3A',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'offline',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Ban Biên tập',
      participantText: 'Ban Biên tập, Thư ký Tòa soạn',
      participantCount: 12,
      isUserParticipant: false,
      isAdjusted: true,
      adjustedNote: 'Dời thời gian họp sớm 30 phút (08:00 thay vì 08:30)',
      approvalStatus: 'SCHEDULED',
      agenda: 'Họp Ban Biên tập',
    },
    // Họp giao ban phóng viên (Có điều chỉnh địa điểm, user tham gia)
    {
      id: `bbt-mon-reporters-${mon.format('YYYYMMDD')}`,
      title: 'Họp giao ban phóng viên',
      startAt: mon.hour(15).minute(30).second(0).toISOString(),
      endAt: mon.hour(17).minute(0).second(0).toISOString(),
      createdAt: mon.subtract(1, 'day').hour(11).toISOString(),
      location: 'Hội trường HTT2',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'offline',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Ban Biên tập',
      participantText: 'Ban Biên tập, Trưởng các ban, Phóng viên các khối',
      participantCount: 85,
      isUserParticipant: true,
      responseStatus: 'accepted',
      isAdjusted: true,
      adjustedNote: 'Thay đổi địa điểm sang Hội trường HTT2 (thay vì PH1)',
      approvalStatus: 'SCHEDULED',
      agenda: 'Họp giao ban phóng viên',
    },

    // --- THỨ BA ---
    // Hội đồng Duyệt Maket Báo in & Tuyến bài Phóng sự Điều tra
    {
      id: `bbt-tue-maket-${tue.format('YYYYMMDD')}`,
      title: 'Hội đồng Duyệt Maket Báo in & Tuyến bài Phóng sự Điều tra',
      startAt: tue.hour(14).minute(0).second(0).toISOString(),
      endAt: tue.hour(16).minute(30).second(0).toISOString(),
      createdAt: tue.subtract(2, 'day').hour(9).toISOString(),
      location: 'PH1',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'offline',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      leader: 'Đ/c Đinh Minh Trung - Phó Tổng Biên tập',
      participantText: 'Hội đồng duyệt bài, Ban Thư ký Tòa soạn, Tổ Thiết kế Maket',
      participantCount: 15,
      isUserParticipant: false,
      approvalStatus: 'SCHEDULED',
      agenda: 'Hội đồng Duyệt Maket Báo in & Tuyến bài Phóng sự Điều tra',
    },

    // --- THỨ TƯ ---
    // Giao ban Chuyển đổi số & Phát triển Báo chí Đa nền tảng (Hybrid Meeting)
    {
      id: `bbt-wed-digital-${wed.format('YYYYMMDD')}`,
      title: 'Giao ban Chuyển đổi số & Phát triển Báo chí Đa nền tảng',
      startAt: wed.hour(9).minute(30).second(0).toISOString(),
      endAt: wed.hour(11).minute(30).second(0).toISOString(),
      createdAt: wed.subtract(1, 'day').hour(14).toISOString(),
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
      approvalStatus: 'SCHEDULED',
      agenda: 'Giao ban Chuyển đổi số & Phát triển Báo chí Đa nền tảng',
    },

    // --- THỨ NĂM ---
    // Tọa đàm Hợp tác Phát triển Nội dung Kinh tế - Tài chính Xanh (SỰ KIỆN - EVENT ĐỀ XUẤT)
    {
      id: `bbt-thu-event-${thu.format('YYYYMMDD')}`,
      title: 'Tọa đàm Hợp tác Phát triển Nội dung Kinh tế - Tài chính Xanh',
      startAt: thu.hour(15).minute(0).second(0).toISOString(),
      endAt: thu.hour(17).minute(0).second(0).toISOString(),
      createdAt: thu.subtract(3, 'day').hour(10).toISOString(),
      location: 'Phòng khách Quốc tế (Lầu 2)',
      type: 'work',
      ticketType: 'EVENT',
      workflowType: 'PROPOSAL',
      scope: 'editorial',
      organizer: 'Vũ Hoàng Nam (Ban Kinh tế)',
      leader: 'Đ/c Lê Thế Chữ (Tổng Biên tập)',
      participantText: 'Ban Kinh tế, Ban Trị sự, Đoàn Chuyên gia Khách mời',
      participantCount: 35,
      isUserParticipant: true,
      approvalStatus: 'PENDING',
      approvers: [
        { id: 'user-101', name: 'Đ/c Lê Thế Chữ - Tổng Biên tập', status: 'PENDING' },
      ],
      consultants: [
        { id: 'user-102', name: 'Trần Xuân Toàn', status: 'COMPLETED', completed_at: thu.subtract(1, 'day').toISOString(), reply: 'Đồng ý chủ trương mời thêm các chuyên gia tài chính xanh.' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Văn Tuấn (Trưởng ban Trị sự)' },
      ],
      agenda: 'Tọa đàm Hợp tác Phát triển Nội dung Kinh tế - Tài chính Xanh',
      attachments: [
        {
          id: `att-thu-toa-dam-${thu.format('YYYYMMDD')}`,
          name: 'De-an-Toa-dam-Kinh-te-Xanh-2026.pdf',
          size: 780000,
          type: 'pdf',
          uploadedAt: thu.subtract(2, 'day').toISOString(),
          uploadedBy: 'Vũ Hoàng Nam (Ban Kinh tế)',
        },
      ],
    },

    // --- THỨ SÁU ---
    // Giao ban Xuất bản Báo in & Chuẩn bị Số báo Cuối tuần
    {
      id: `bbt-fri-pub-${fri.format('YYYYMMDD')}`,
      title: 'Giao ban Xuất bản Báo in & Chuẩn bị Số báo Cuối tuần',
      startAt: fri.hour(16).minute(0).second(0).toISOString(),
      endAt: fri.hour(17).minute(30).second(0).toISOString(),
      createdAt: fri.subtract(1, 'day').hour(15).toISOString(),
      location: 'Phòng Giao ban Tòa soạn',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'offline',
      scope: 'editorial',
      organizer: 'Ban Thư ký Tòa soạn',
      leader: 'Ban Thư ký Tòa soạn',
      participantText: 'Ban Thư ký Tòa soạn, Ban Văn hóa, Ban Thể thao',
      participantCount: 20,
      isUserParticipant: false,
      approvalStatus: 'SCHEDULED',
      agenda: 'Giao ban Xuất bản Báo in & Chuẩn bị Số báo Cuối tuần',
    },

    // --- THỨ BẢY ---
    // Giao ban Báo cuối tuần & Kế hoạch Xuất bản tuần tới
    {
      id: `bbt-sat-plan-${sat.format('YYYYMMDD')}`,
      title: 'Giao ban Báo cuối tuần & Kế hoạch Xuất bản tuần tới',
      startAt: sat.hour(8).minute(30).second(0).toISOString(),
      endAt: sat.hour(10).minute(30).second(0).toISOString(),
      createdAt: sat.subtract(1, 'day').hour(16).toISOString(),
      location: 'Phòng họp BBT',
      type: 'meeting',
      ticketType: 'MEETING',
      mode: 'offline',
      scope: 'editorial',
      organizer: 'Ban Thư ký Tòa soạn',
      leader: 'Ban Thư ký Tòa soạn',
      participantText: 'Ban Thư ký Tòa soạn, BTV trực ca',
      participantCount: 14,
      isUserParticipant: false,
      approvalStatus: 'SCHEDULED',
      agenda: 'Giao ban Báo cuối tuần & Kế hoạch Xuất bản tuần tới',
    },
  ];
}

/**
 * Sinh danh sách sự kiện và phiếu công việc cá nhân chuẩn chỉnh cho tuần đang xem.
 * Bao quát 100% mọi vai trò thực tế của người dùng Nguyễn Minh Anh (user-001):
 * - APPROVER: Người duyệt (Thứ Hai)
 * - CONSULTEE: Người được lấy ý kiến tham vấn (Thứ Ba)
 * - EXECUTOR: Người triển khai đang thực hiện (Thứ Tư)
 * - CREATOR: Người tạo & chủ trì cuộc họp (Thứ Năm)
 * - COMPLETED EXECUTOR: Người hoàn thành nhiệm vụ (Thứ Sáu)
 * - WATCHER: Người theo dõi phiếu (Thứ Sáu)
 * - PARTICIPANT: Người tham gia họp cá nhân (Thứ Bảy)
 */
export function getMockPersonalEvents(weekStart: Dayjs): CalendarEvent[] {
  const mon = weekStart.startOf('isoWeek');
  const tue = mon.add(1, 'day');
  const wed = mon.add(2, 'day');
  const thu = mon.add(3, 'day');
  const fri = mon.add(4, 'day');
  const sat = mon.add(5, 'day');

  return [
    // --- THỨ HAI: PHIẾU ĐỀ XUẤT - USER LÀ NGƯỜI DUYỆT (CHỜ DUYỆT) ---
    {
      id: `psn-task-mon-${mon.format('YYYYMMDD')}`,
      title: 'Đề xuất tuyến bài điều tra 5 kỳ vạch trần đường dây lừa đảo tuyển dụng xuyên biên giới',
      startAt: mon.hour(17).minute(30).second(0).toISOString(),
      endAt: mon.hour(17).minute(30).second(0).toISOString(),
      deadline: mon.hour(17).minute(30).second(0).toISOString(),
      createdAt: mon.subtract(1, 'day').hour(14).minute(20).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Lê Văn Tuấn (Trưởng ban Thư ký)',
      leader: 'Lê Văn Tuấn (Trưởng ban Thư ký)',
      participants: ['Nguyễn Minh Anh', 'Lê Văn Tuấn', 'Trần Văn Hùng'],
      participantText: 'Nguyễn Minh Anh, Lê Văn Tuấn, Trần Văn Hùng',
      participantCount: 3,
      isUserParticipant: true,
      approvalStatus: 'PENDING',
      approvers: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', status: 'PENDING' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Thanh Vân (Phó BBT)' },
        { id: 'user-106', name: 'Võ Hoàng Nam (Thư ký Tòa soạn)' },
      ],
      agenda: 'Đề xuất tuyến bài điều tra 5 kỳ vạch trần đường dây lừa đảo tuyển dụng xuyên biên giới',
      notes: 'Đề xuất tuyến bài điều tra 5 kỳ vạch trần đường dây lừa đảo tuyển dụng xuyên biên giới',
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
          content: 'Kính gửi đ/c Nguyễn Minh Anh xem xét và cho ý kiến phê duyệt đề cương tuyến bài điều tra.',
          createdAt: mon.hour(8).minute(30).toISOString(),
        },
      ],
    },

    // --- THỨ BA: PHIẾU ĐỀ XUẤT - USER LÀ NGƯỜI ĐƯỢC LẤY Ý KIẾN (ĐANG LẤY Ý KIẾN) ---
    {
      id: `psn-task-tue-${tue.format('YYYYMMDD')}`,
      title: 'Tham vấn chuyên môn: Đề án đổi mới quy trình sản xuất video tin tức đa nền tảng cho Tuổi Trẻ',
      startAt: tue.hour(16).minute(0).second(0).toISOString(),
      endAt: tue.hour(16).minute(0).second(0).toISOString(),
      deadline: tue.hour(16).minute(0).second(0).toISOString(),
      createdAt: tue.subtract(1, 'day').hour(9).minute(15).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Trần Thu Hà (Phó ban Media)',
      leader: 'Trần Thu Hà (Phó ban Media)',
      participants: ['Trần Thu Hà', 'Nguyễn Hoài Nam', 'Nguyễn Minh Anh'],
      participantText: 'Trần Thu Hà, Nguyễn Hoài Nam, Nguyễn Minh Anh',
      participantCount: 3,
      isUserParticipant: true,
      approvalStatus: 'PENDING',
      consultQuestion: 'Đề nghị đ/c Nguyễn Minh Anh cho ý kiến chuyên môn về hạ tầng streaming video và công cụ dựng clip tin tức ngắn tự động.',
      consultants: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', status: 'PENDING' },
        { id: 'user-103', name: 'Nguyễn Hoài Nam', status: 'COMPLETED', completed_at: tue.subtract(1, 'day').hour(17).toISOString(), reply: 'Đã rà soát định dạng video ngắn, đề xuất triển khai trước trên TikTok.' },
      ],
      approvers: [
        { id: 'user-107', name: 'Đ/c Nguyễn Tấn Đạt (Phó Tổng Biên tập)', status: 'PENDING' },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      agenda: 'Tham vấn chuyên môn: Đề án đổi mới quy trình sản xuất video tin tức đa nền tảng cho Tuổi Trẻ',
      notes: 'Tham vấn chuyên môn: Đề án đổi mới quy trình sản xuất video tin tức đa nền tảng cho Tuổi Trẻ',
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

    // --- THỨ TƯ: PHIẾU ĐỀ XUẤT - ĐÃ DUYỆT (USER LÀ NGƯỜI THEO DÕI) ---
    {
      id: `psn-task-wed-appr-${wed.format('YYYYMMDD')}`,
      title: 'Đề xuất chủ trương tổ chức Tuyến bài kỷ niệm 50 năm Ngày Giải phóng miền Nam trên Báo Tuổi Trẻ',
      startAt: wed.hour(14).minute(0).second(0).toISOString(),
      endAt: wed.hour(14).minute(0).second(0).toISOString(),
      deadline: wed.hour(14).minute(0).second(0).toISOString(),
      createdAt: wed.subtract(3, 'day').hour(9).minute(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Phạm Hồng Ngọc (Trưởng ban Văn hóa - Nghệ thuật)',
      leader: 'Phạm Hồng Ngọc',
      participants: ['Phạm Hồng Ngọc', 'Nguyễn Minh Anh'],
      participantText: 'Phạm Hồng Ngọc, Nguyễn Minh Anh',
      participantCount: 2,
      isUserParticipant: false,
      isUserWatcher: true,
      approvalStatus: 'APPROVED',
      approvers: [
        {
          id: 'user-101',
          name: 'Đ/c Lê Thế Chữ (Tổng Biên tập)',
          status: 'APPROVED',
          completed_at: wed.subtract(1, 'day').hour(10).minute(30).toISOString(),
          note: 'Đồng ý phê duyệt chủ trương. Đề nghị Ban Văn hóa phối hợp chặt chẽ với Ban Thư ký Tòa soạn triển khai đúng tiến độ.',
        },
      ],
      watchers: [
        { id: 'user-001', name: 'Nguyễn Minh Anh' },
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      agenda: 'Đề xuất chủ trương tổ chức Tuyến bài kỷ niệm 50 năm Ngày Giải phóng miền Nam trên Báo Tuổi Trẻ',
      notes: 'Đề xuất chủ trương tổ chức Tuyến bài kỷ niệm 50 năm Ngày Giải phóng miền Nam trên Báo Tuổi Trẻ',
      isInterested: true,
      attachments: [
        {
          id: `att-wed-tuyenbai50nam-${wed.format('YYYYMMDD')}`,
          name: 'De-an-Tuyen-bai-Ky-niem-50-nam.pdf',
          size: 640000,
          type: 'pdf',
          uploadedAt: wed.subtract(3, 'day').hour(9).minute(15).toISOString(),
          uploadedBy: 'Phạm Hồng Ngọc',
        },
      ],
      comments: [
        {
          id: 'cmt-task-wed-appr-1',
          author: 'Lê Thế Chữ',
          content: 'Đã phê duyệt đề án. Chúc ban Văn hóa hoàn thành xuất sắc đợt tuyên truyền trọng điểm.',
          createdAt: wed.subtract(1, 'day').hour(10).minute(30).toISOString(),
        },
      ],
    },

    // --- THỨ TƯ: PHIẾU TRIỂN KHAI - USER LÀ NGƯỜI THỰC HIỆN (ĐANG THỰC HIỆN) ---
    {
      id: `psn-task-wed-${wed.format('YYYYMMDD')}`,
      title: 'Triển khai tuyến bài ảnh: Không gian kiến trúc xanh và phát triển đô thị bền vững TP.HCM',
      startAt: wed.hour(17).minute(30).second(0).toISOString(),
      endAt: wed.hour(17).minute(30).second(0).toISOString(),
      deadline: wed.hour(17).minute(30).second(0).toISOString(),
      createdAt: wed.subtract(2, 'day').hour(10).minute(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Hoàng Điệp (Trưởng ban Văn hóa)',
      leader: 'Hoàng Điệp',
      participants: ['Nguyễn Minh Anh', 'Đỗ Quang Huy', 'Hoàng Điệp'],
      participantText: 'Nguyễn Minh Anh, Đỗ Quang Huy, Hoàng Điệp',
      participantCount: 3,
      isUserParticipant: true,
      approvalStatus: 'IN_PROGRESS',
      executors: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', role: 'Phóng viên ảnh chính', status: 'IN_PROGRESS' },
        { id: 'user-104', name: 'Đỗ Quang Huy', role: 'Phóng viên phối hợp', status: 'IN_PROGRESS' },
      ],
      watchers: [
        { id: 'user-107', name: 'Trần Xuân Toàn' },
      ],
      agenda: 'Triển khai tuyến bài ảnh: Không gian kiến trúc xanh và phát triển đô thị bền vững TP.HCM',
      notes: 'Triển khai tuyến bài ảnh: Không gian kiến trúc xanh và phát triển đô thị bền vững TP.HCM',
      isInterested: false,
      attachments: [
        {
          id: `att-wed-huongdan-${wed.format('YYYYMMDD')}`,
          name: 'Ke-hoach-tuyen-bai-anh-khong-gian-xanh.pdf',
          size: 320000,
          type: 'pdf',
          uploadedAt: wed.subtract(1, 'day').hour(14).toISOString(),
          uploadedBy: 'Hoàng Điệp',
        },
      ],
      comments: [
        {
          id: 'cmt-task-wed-1',
          author: 'Hoàng Điệp',
          content: 'Tuyến ảnh tiến độ thế nào rồi anh Minh Anh? Cố gắng hoàn thành trong hôm nay để kịp duyệt số báo thứ Năm nhé.',
          createdAt: wed.hour(10).minute(0).toISOString(),
        },
      ],
    },

    // --- THỨ NĂM: LỊCH HỌP CÁ NHÂN - USER LÀ NGƯỜI TẠO & CHỦ TRÌ ---
    {
      id: `psn-meet-thu-${thu.format('YYYYMMDD')}`,
      title: 'Họp chuyên đề: Đổi mới Format Chương trình Media Trực tuyến Báo Tuổi Trẻ',
      startAt: thu.hour(10).minute(0).second(0).toISOString(),
      endAt: thu.hour(11).minute(30).second(0).toISOString(),
      createdAt: thu.subtract(2, 'day').hour(8).minute(30).toISOString(),
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
      approvalStatus: 'SCHEDULED',
      agenda: 'Họp chuyên đề: Đổi mới Format Chương trình Media Trực tuyến Báo Tuổi Trẻ',
      notes: 'Họp chuyên đề: Đổi mới Format Chương trình Media Trực tuyến Báo Tuổi Trẻ',
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

    // --- THỨ NĂM: PHIẾU ĐỀ XUẤT - KHÔNG DUYỆT (USER LÀ NGƯỜI THEO DÕI) ---
    {
      id: `psn-task-thu-rejc-${thu.format('YYYYMMDD')}`,
      title: 'Đề xuất kinh phí thuê bao bổ sung gói tài khoản AI tạo hình và biên dịch tin tức quốc tế tự động năm 2026',
      startAt: thu.hour(16).minute(30).second(0).toISOString(),
      endAt: thu.hour(16).minute(30).second(0).toISOString(),
      deadline: thu.hour(16).minute(30).second(0).toISOString(),
      createdAt: thu.subtract(2, 'day').hour(11).minute(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Trần Thu Hà (Phó ban Media)',
      leader: 'Trần Thu Hà',
      participants: ['Trần Thu Hà', 'Nguyễn Minh Anh'],
      participantText: 'Trần Thu Hà, Nguyễn Minh Anh',
      participantCount: 2,
      isUserParticipant: false,
      isUserWatcher: true,
      approvalStatus: 'REJECTED',
      approvers: [
        {
          id: 'user-102',
          name: 'Đ/c Đinh Minh Trung (Phó Tổng Biên tập)',
          status: 'REJECTED',
          completed_at: thu.hour(11).minute(0).toISOString(),
          note: 'Kinh phí đề xuất chưa nằm trong danh mục dự toán Quý IV. Yêu cầu Ban Media tận dụng hạ tầng AI dùng chung của Khối Báo điện tử.',
        },
      ],
      watchers: [
        { id: 'user-001', name: 'Nguyễn Minh Anh' },
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      agenda: 'Đề xuất kinh phí thuê bao bổ sung gói tài khoản AI tạo hình và biên dịch tin tức quốc tế tự động năm 2026',
      notes: 'Đề xuất kinh phí thuê bao bổ sung gói tài khoản AI tạo hình và biên dịch tin tức quốc tế tự động năm 2026',
      isInterested: false,
      attachments: [
        {
          id: `att-thu-kinhphi-ai-${thu.format('YYYYMMDD')}`,
          name: 'To-trinh-Kinh-phi-AI-Tools-2026.docx',
          size: 285000,
          type: 'docx',
          uploadedAt: thu.subtract(2, 'day').hour(11).minute(15).toISOString(),
          uploadedBy: 'Trần Thu Hà',
        },
      ],
      comments: [
        {
          id: 'cmt-task-thu-rejc-1',
          author: 'Đinh Minh Trung',
          content: 'Đã trao đổi với đồng chí Hà về phương án sử dụng API dùng chung, tạm thời không phê duyệt gói riêng này.',
          createdAt: thu.hour(11).minute(0).toISOString(),
        },
      ],
    },

    // --- THỨ SÁU: PHIẾU TRIỂN KHAI - USER ĐÃ HOÀN THÀNH (HOÀN THÀNH) ---
    {
      id: `psn-task-fri-done-${fri.format('YYYYMMDD')}`,
      title: 'Quyết toán chi phí tác nghiệp hiện trường và nghiệm thu loạt bài điều tra Quý III',
      startAt: fri.hour(15).minute(30).second(0).toISOString(),
      endAt: fri.hour(15).minute(30).second(0).toISOString(),
      deadline: fri.hour(15).minute(30).second(0).toISOString(),
      createdAt: fri.subtract(3, 'day').hour(9).minute(0).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      leader: 'Trần Thị Bích (Kế toán)',
      participants: ['Nguyễn Minh Anh', 'Trần Thị Bích (Kế toán)'],
      participantText: 'Nguyễn Minh Anh, Trần Thị Bích',
      participantCount: 2,
      isUserParticipant: true,
      approvalStatus: 'COMPLETED',
      executors: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', role: 'Cán bộ lập báo cáo', status: 'COMPLETED', completed_at: fri.hour(15).minute(0).toISOString() },
      ],
      watchers: [
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      agenda: 'Quyết toán chi phí tác nghiệp hiện trường và nghiệm thu loạt bài điều tra Quý III',
      notes: 'Quyết toán chi phí tác nghiệp hiện trường và nghiệm thu loạt bài điều tra Quý III',
      attachments: [
        {
          id: `att-fri-quyet-toan-${fri.format('YYYYMMDD')}`,
          name: 'Bang-quyet-toan-chi-phi-tac-nghiep-Q3.xlsx',
          size: 198000,
          type: 'xlsx',
          uploadedAt: fri.hour(14).minute(30).toISOString(),
          uploadedBy: 'Nguyễn Minh Anh',
        },
      ],
    },

    // --- THỨ SÁU: PHIẾU TRIỂN KHAI - USER LÀ NGƯỜI THEO DÕI ---
    {
      id: `psn-task-fri-watch-${fri.format('YYYYMMDD')}`,
      title: 'Kế hoạch nâng cấp hạ tầng máy chủ và diễn tập an toàn thông tin CMS Tòa soạn',
      startAt: fri.hour(17).minute(0).second(0).toISOString(),
      endAt: fri.hour(17).minute(0).second(0).toISOString(),
      deadline: fri.hour(17).minute(0).second(0).toISOString(),
      createdAt: fri.subtract(2, 'day').hour(13).minute(45).toISOString(),
      location: '',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Võ Hoàng Nam (Trưởng phòng Kỹ thuật)',
      leader: 'Võ Hoàng Nam (Trưởng phòng Kỹ thuật)',
      participants: ['Phan Nghệ Đô', 'Lê Văn Tuấn', 'Võ Hoàng Nam'],
      participantText: 'Phan Nghệ Đô, Lê Văn Tuấn, Võ Hoàng Nam',
      participantCount: 3,
      isUserParticipant: false,
      isUserWatcher: true,
      approvalStatus: 'IN_PROGRESS',
      executors: [
        { id: 'user-106', name: 'Phan Nghệ Đô', role: 'Kỹ sư an toàn mạng', status: 'IN_PROGRESS' },
        { id: 'user-108', name: 'Lê Văn Tuấn', role: 'Kỹ thuật viên hệ thống', status: 'IN_PROGRESS' },
      ],
      watchers: [
        { id: 'user-001', name: 'Nguyễn Minh Anh' },
        { id: 'user-105', name: 'Lê Thanh Vân' },
      ],
      agenda: 'Kế hoạch nâng cấp hạ tầng máy chủ và diễn tập an toàn thông tin CMS Tòa soạn',
      notes: 'Kế hoạch nâng cấp hạ tầng máy chủ và diễn tập an toàn thông tin CMS Tòa soạn',
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

    // --- THỨ BẢY: LỊCH HỌP CÁ NHÂN - USER THAM GIA ---
    {
      id: `psn-meet-sat-${sat.format('YYYYMMDD')}`,
      title: 'Họp Ban Thư ký Tòa soạn & Trực ca báo cuối tuần',
      startAt: sat.hour(9).minute(0).second(0).toISOString(),
      endAt: sat.hour(11).minute(0).second(0).toISOString(),
      createdAt: sat.subtract(2, 'day').hour(16).toISOString(),
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
      approvalStatus: 'SCHEDULED',
      agenda: 'Họp Ban Thư ký Tòa soạn & Trực ca báo cuối tuần',
      notes: 'Họp Ban Thư ký Tòa soạn & Trực ca báo cuối tuần',
    },
  ];
}

/**
 * Lấy danh sách sự kiện cho tuần đang xem.
 * Đảm bảo 100% dữ liệu mới, chuẩn hóa và loại bỏ các id trùng lặp.
 */
export function getEventsForWeek(weekStart: Dayjs, existingEvents: CalendarEvent[] = []): CalendarEvent[] {
  const startStr = weekStart.startOf('isoWeek').format('YYYY-MM-DD');
  const endStr = weekStart.endOf('isoWeek').format('YYYY-MM-DD');

  // Lọc sự kiện hiện có rơi vào tuần này
  const weekExisting = existingEvents.filter((ev) => {
    const d = dayjs(ev.startAt).format('YYYY-MM-DD');
    return d >= startStr && d <= endStr;
  });

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
