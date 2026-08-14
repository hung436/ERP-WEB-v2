import type { CalendarNotificationItem, CalendarRecipientGroup } from '@/types/calendar';

export interface HtmlTemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  htmlContent: string;
}

export const initialRecipientGroups: CalendarRecipientGroup[] = [
  {
    id: 'grp-01',
    name: 'Ban Biên tập',
    description: 'Thành viên Ban Biên tập Báo Tuổi Trẻ (Tổng Biên tập & Các Phó Tổng Biên tập)',
    members: ['Phạm Đức Long (Admin)', 'Trần Thu Hà', 'Lê Thanh Vân', 'Nguyễn Minh Anh', 'Nguyễn Hoài Nam', 'Đỗ Quang Huy'],
    status: 'active',
    createdAt: '2026-08-01T08:00:00+07:00',
  },
  {
    id: 'grp-02',
    name: 'Ban Thư ký tòa soạn & Biên tập viên chính',
    description: 'Bộ phận duyệt xuất bản và điều phối nội dung các ấn phẩm',
    members: ['Trần Thu Hà', 'Lê Thanh Vân', 'Mai Phương Thảo', 'Vũ Hoàng Yến', 'Bùi Văn Hùng'],
    status: 'active',
    createdAt: '2026-08-02T09:30:00+07:00',
  },
  {
    id: 'grp-03',
    name: 'Phóng viên Ban Thời sự & Nội dung',
    description: 'Đội ngũ phóng viên tác nghiệp hiện trường các tuyến bài trong nước và quốc tế',
    members: ['Nguyễn Minh Anh', 'Nguyễn Hoài Nam', 'Đỗ Quang Huy', 'Hoàng Minh Tuấn', 'Trịnh Thị Lan', 'Phan Văn Kiệt'],
    status: 'active',
    createdAt: '2026-08-05T10:15:00+07:00',
  },
  {
    id: 'grp-04',
    name: 'Tổ Chuyển đổi số & Công nghệ',
    description: 'Bộ phận quản trị hệ thống CMS, ERP và hạ tầng số tòa soạn',
    members: ['Phan Văn Kiệt', 'Đỗ Quang Huy', 'Phạm Đức Long (Admin)', 'Lê Quốc Bảo'],
    status: 'active',
    createdAt: '2026-08-08T14:20:00+07:00',
  },
  {
    id: 'grp-05',
    name: 'Hội đồng Tuyển dụng nhiệm kỳ trước',
    description: 'Nhóm đã hoàn thành nhiệm vụ và đóng quyền nhận thông báo định kỳ',
    members: ['Lê Thanh Vân', 'Mai Phương Thảo', 'Nguyễn Hoài Nam'],
    status: 'closed',
    createdAt: '2026-06-10T08:00:00+07:00',
  },
];

export const HTML_NOTIFICATION_TEMPLATES: HtmlTemplateItem[] = [
  {
    id: 'tpl-meeting-regular',
    name: 'Mẫu Thông báo họp Ban Biên tập định kỳ',
    category: 'Lịch họp',
    description: 'Bố cục chuẩn với biểu tượng tòa soạn, nội dung chương trình, thành phần và tài liệu chuẩn bị.',
    htmlContent: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #d92d20 0%, #b42318 100%); color: #ffffff; padding: 20px 24px;">
    <h2 style="margin: 0; font-size: 19px; font-weight: 700; text-transform: uppercase;">Báo Tuổi Trẻ · Ban Biên tập</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">THÔNG BÁO CUỘC HỌP BAN BIÊN TẬP ĐỊNH KỲ TUẦN</p>
  </div>
  <div style="padding: 24px;">
    <p style="margin-top: 0;">Kính gửi <strong>Các đồng chí Thành viên Ban Biên tập & Trưởng các Ban chuyên môn</strong>,</p>
    <p>Ban Biên tập thông báo tổ chức cuộc họp giao ban và chỉ đạo công tác xuất bản trọng tâm trong tuần tới với các nội dung chi tiết như sau:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
      <tr style="background: #f9fafb;">
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 600; width: 160px;">Thời gian:</td>
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb; color: #d92d20; font-weight: 700;">08:30 - Thứ Hai hàng tuần</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 600;">Địa điểm:</td>
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb;">Phòng họp số 1 - Tòa soạn Tuổi Trẻ (60A Hoàng Văn Thụ, Q. Phú Nhuận)</td>
      </tr>
      <tr style="background: #f9fafb;">
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 600;">Chủ trì:</td>
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb;">Tổng Biên tập & Các Phó Tổng Biên tập</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 600;">Thành phần:</td>
        <td style="padding: 10px 14px; border: 1px solid #e5e7eb;">Ban Biên tập, Trưởng ban Nội dung, Ban Thư ký Tòa soạn, Ban Bạn đọc, Phòng Công nghệ.</td>
      </tr>
    </table>

    <h4 style="color: #111827; margin: 18px 0 8px; font-size: 15px;">Chương trình làm việc chính:</h4>
    <ol style="padding-left: 20px; margin: 0 0 16px 0;">
      <li style="margin-bottom: 6px;">Đánh giá ấn phẩm Tuổi Trẻ Nhật báo và Tuổi Trẻ Online trong tuần qua.</li>
      <li style="margin-bottom: 6px;">Duyệt kế hoạch đề tài đặc biệt, phóng sự điều tra và tuyến bài tiêu điểm tuần tới.</li>
      <li style="margin-bottom: 6px;">Xử lý các kiến nghị, phản hồi của bạn đọc và phân bổ nguồn lực sản xuất.</li>
      <li style="margin-bottom: 6px;">Kết luận và phân công nhiệm vụ của Tổng Biên tập.</li>
    </ol>

    <div style="background: #fef3f2; border-left: 4px solid #d92d20; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
      <p style="margin: 0; color: #b42318; font-size: 13px; font-weight: 600;">Lưu ý bảo mật:</p>
      <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 13px;">Tài liệu cuộc họp đã được gắn watermark cá nhân hóa. Các đồng chí vui lòng nghiên cứu trước tài liệu đính kèm và có mặt đúng giờ.</p>
    </div>
  </div>
  <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 12px 24px; text-align: right; font-size: 12px; color: #6b7280;">
    VĂN PHÒNG BAN BIÊN TẬP · BÁO TUỔI TRẺ
  </div>
</div>`,
  },
  {
    id: 'tpl-directive-guideline',
    name: 'Mẫu Thông báo chỉ đạo công tác xuất bản & tuyến bài',
    category: 'Chỉ đạo',
    description: 'Mẫu thông báo hướng dẫn triển khai đề tài trọng điểm từ Ban Biên tập tới toàn bộ phóng viên, biên tập viên.',
    htmlContent: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #ffffff;">
  <div style="border-bottom: 2px solid #d92d20; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h3 style="margin: 0; color: #d92d20; font-size: 18px; font-weight: 700;">BÁO TUỔI TRẺ</h3>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">TÒA SOẠN NỘI BỘ</p>
    </div>
    <div style="text-align: right;">
      <span style="display: inline-block; background: #fee4e2; color: #d92d20; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px;">CHỈ ĐẠO XUẤT BẢN</span>
    </div>
  </div>
  <div style="padding: 24px;">
    <h2 style="color: #111827; font-size: 17px; font-weight: 700; margin-top: 0; text-align: center;">THÔNG BÁO VỀ VIỆC TRIỂN KHAI TUYẾN BÀI TRỌNG ĐIỂM</h2>
    
    <p>Kính gửi: <strong>Toàn thể Cán bộ, Phóng viên, Biên tập viên Ban Nội dung & Ban Thời sự</strong></p>
    
    <p>Căn cứ định hướng tuyên truyền và kết luận tại cuộc họp Ban Biên tập, Ban Biên tập yêu cầu các bộ phận phối hợp triển khai tuyến nội dung:</p>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px 18px; margin: 16px 0;">
      <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 15px;">🎯 Mục tiêu & Yêu cầu trọng tâm:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 13.5px;">
        <li>Bám sát thực tiễn đời sống, phản ánh trung thực, khách quan và có chiều sâu giải pháp.</li>
        <li>Tận dụng tối đa các định dạng đa phương tiện (Infographic, Video phỏng vấn, Long-form) trên Tuổi Trẻ Online.</li>
        <li>Bảo đảm tuyệt đối tính chính xác của nguồn tin và tuân thủ quy trình kiểm duyệt 3 cấp.</li>
      </ul>
    </div>

    <p>Đề nghị các Trưởng ban chủ động phân công phóng viên thực hiện, gửi đề cương chi tiết về Ban Thư ký trước 17:00 hàng ngày.</p>
  </div>
  <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 14px 24px; display: flex; justify-content: space-between; font-size: 13px; color: #4b5563;">
    <span>Hệ thống ERP Tuổi Trẻ</span>
    <span><strong>TM. BAN BIÊN TẬP</strong></span>
  </div>
</div>`,
  },
  {
    id: 'tpl-holiday-schedule',
    name: 'Mẫu Thông báo lịch nghỉ lễ & phân công trực tòa soạn',
    category: 'Hành chính',
    description: 'Thông báo lịch làm việc, nghỉ lễ và danh sách phân công ca trực ban tòa soạn.',
    htmlContent: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #ffffff;">
  <div style="background: #1e293b; color: #ffffff; padding: 18px 24px;">
    <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #f87171;">BÁO TUỔI TRẺ · PHÒNG TỔ CHỨC - HÀNH CHÍNH</h3>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1;">THÔNG BÁO V/V NGHỈ LỄ VÀ LỊCH TRỰC BAN TÒA SOẠN</p>
  </div>
  <div style="padding: 24px;">
    <p style="margin-top: 0;">Kính gửi: <strong>Toàn thể Cán bộ công nhân viên Báo Tuổi Trẻ</strong></p>
    
    <p>Thực hiện quy định của Nhà nước và kế hoạch công tác của Cơ quan, Ban Biên tập thông báo lịch nghỉ và trực ban như sau:</p>
    
    <ul style="padding-left: 20px; margin: 12px 0;">
      <li><strong>Thời gian nghỉ:</strong> Từ ngày ... đến hết ngày ...</li>
      <li><strong>Thời gian đi làm lại:</strong> Bắt đầu từ 08:00 ngày ...</li>
    </ul>

    <p>Trong thời gian nghỉ lễ, các bộ phận trực ban xuất bản, trực công nghệ và bảo vệ tòa soạn duy trì chế độ trực 24/7 để đảm bảo dòng tin tức không gián đoạn.</p>
    
    <div style="margin-top: 18px; padding: 12px 16px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe; font-size: 13px; color: #1e40af;">
      ☎ Hotline khẩn cấp Tòa soạn: <strong>0918.033.133</strong> · Trực ban xuất bản Online: <strong>Ext 102</strong>
    </div>
  </div>
</div>`,
  },
];

export const initialCalendarNotifications: CalendarNotificationItem[] = [
  {
    id: 'notif-01',
    type: 'editorial_meeting',
    title: 'Lịch họp Ban Biên tập đầu tuần: Duyệt kế hoạch xuất bản & Tuyến bài trọng điểm Tuần 34',
    content: `Kính gửi các đồng chí Thành viên Ban Biên tập & Trưởng các ban chuyên môn,

Ban Biên tập triệu tập cuộc họp giao ban đầu tuần để đánh giá các ấn phẩm tuần 33 và duyệt kế hoạch tuyến bài trọng tâm tuần 34.

1. Thời gian: 08:30 - Thứ Hai (17/08/2026)
2. Địa điểm: Phòng họp số 1 - Tòa soạn Tuổi Trẻ
3. Chủ trì: Tổng Biên tập
4. Nội dung chính:
   - Đánh giá chất lượng các vệt bài thời sự, kinh tế trong tuần qua.
   - Duyệt tuyến phóng sự điều tra và chuyên đề chuyển đổi số báo chí.
   - Phân công phóng viên tác nghiệp hiện trường các sự kiện lớn.

Các đồng chí chuẩn bị kỹ báo cáo và tài liệu đính kèm.`,
    isHtmlContent: false,
    recipients: {
      targetType: 'groups',
      groupIds: ['grp-01', 'grp-02'],
      groupNames: ['Ban Biên tập', 'Ban Thư ký tòa soạn & Biên tập viên chính'],
    },
    sentAt: '2026-08-16T17:00:00+07:00',
    status: 'sent',
    sendMailCopy: true,
    applyWatermark: true,
    attachments: [
      { id: 'att-1', name: 'Ke-hoach-tuyen-bai-tuan-34.pdf', size: 1450000, type: 'application/pdf' },
      { id: 'att-2', name: 'Bao-cao-xuat-ban-tuan-33.xlsx', size: 890000, type: 'application/vnd.ms-excel' },
    ],
    createdBy: 'Trần Thu Hà (Ban Thư ký)',
    createdAt: '2026-08-15T09:30:00+07:00',
  },
  {
    id: 'notif-02',
    type: 'general_announcement',
    title: 'Thông báo về việc áp dụng quy chế tính định mức nhuận bút đa phương tiện năm 2026',
    content: HTML_NOTIFICATION_TEMPLATES[1].htmlContent,
    isHtmlContent: true,
    recipients: {
      targetType: 'all',
    },
    sentAt: '2026-08-14T08:00:00+07:00',
    status: 'sent',
    sendMailCopy: true,
    applyWatermark: false,
    attachments: [
      { id: 'att-3', name: 'Quy-che-nhuan-but-multimedia-2026.pdf', size: 2100000, type: 'application/pdf' },
    ],
    createdBy: 'Phòng Tài chính - Quản trị',
    createdAt: '2026-08-13T14:00:00+07:00',
  },
  {
    id: 'notif-03',
    type: 'editorial_meeting',
    title: 'Họp Ban Biên tập đột xuất: Xử lý thông tin thời sự và phối hợp tác nghiệp quốc tế',
    content: `Kính gửi các đồng chí thành viên Ban Biên tập,

Theo chỉ đạo khẩn của Tổng Biên tập, Ban Biên tập sẽ họp đột xuất lúc 14:00 chiều nay để thống nhất hướng xử lý nguồn tin và điều phối phóng viên thường trú tác nghiệp sự kiện quốc tế.

- Thời gian: 14:00 - Chiều nay
- Hình thức: Trực tiếp tại Phòng họp Ban Biên tập & Trực tuyến qua Tuổi Trẻ In-App Video Engine.
- Yêu cầu: Đầy đủ các thành viên Ban Biên tập và Trưởng ban Thời sự quốc tế.`,
    isHtmlContent: false,
    recipients: {
      targetType: 'groups',
      groupIds: ['grp-01'],
      groupNames: ['Ban Biên tập'],
      individuals: ['Nguyễn Minh Anh', 'Lê Thanh Vân'],
    },
    sentAt: '2026-08-14T11:30:00+07:00',
    status: 'sent',
    sendMailCopy: true,
    applyWatermark: true,
    attachments: [
      { id: 'att-4', name: 'Ho-so-nguon-tin-thoi-su.pdf', size: 3400000, type: 'application/pdf' },
    ],
    createdBy: 'Lê Thanh Vân',
    createdAt: '2026-08-14T11:00:00+07:00',
  },
  {
    id: 'notif-04',
    type: 'general_announcement',
    title: 'Thông báo kế hoạch nâng cấp hạ tầng hệ thống ERP và CMS Tòa soạn Tuổi Trẻ',
    content: HTML_NOTIFICATION_TEMPLATES[0].htmlContent,
    isHtmlContent: true,
    recipients: {
      targetType: 'all',
    },
    scheduledAt: '2026-08-18T20:00:00+07:00',
    status: 'pending',
    sendMailCopy: true,
    applyWatermark: true,
    attachments: [
      { id: 'att-5', name: 'Lich-trinh-nang-cap-ha-tang.pdf', size: 1200000, type: 'application/pdf' },
    ],
    createdBy: 'Phòng Công nghệ',
    createdAt: '2026-08-14T09:15:00+07:00',
  },
  {
    id: 'notif-05',
    type: 'editorial_meeting',
    title: 'Lịch họp Ban Biên tập mở rộng: Đánh giá tiến độ Đề án chuyển đổi số báo chí giai đoạn 2',
    content: `Kính gửi Ban Biên tập và các Đơn vị liên quan,

Ban Biên tập tổ chức cuộc họp mở rộng chuyên đề Chuyển đổi số báo chí và Ứng dụng AI trong quy trình sản xuất tin bài của Báo Tuổi Trẻ.

- Thời gian: 09:00 - Thứ Sáu (21/08/2026)
- Thành phần: Ban Biên tập, Phòng Công nghệ, Trung tâm Dữ liệu, Ban Phát triển bạn đọc số.
- Tài liệu đính kèm: Dự thảo Đề án số hóa và phân tích dữ liệu độc giả quý 3.`,
    isHtmlContent: false,
    recipients: {
      targetType: 'groups',
      groupIds: ['grp-01', 'grp-04'],
      groupNames: ['Ban Biên tập', 'Tổ Chuyển đổi số & Công nghệ'],
    },
    scheduledAt: '2026-08-20T08:00:00+07:00',
    status: 'pending',
    sendMailCopy: true,
    applyWatermark: true,
    attachments: [
      { id: 'att-6', name: 'Du-thao-de-an-chuyen-doi-so-2026.docx', size: 4800000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    ],
    createdBy: 'Nguyễn Minh Anh',
    createdAt: '2026-08-14T10:00:00+07:00',
  },
];
