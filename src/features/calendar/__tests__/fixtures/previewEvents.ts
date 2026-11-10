import type { CalendarEvent } from '@/types/domain';

export const previewMeeting: CalendarEvent = {
  id: 'preview-meeting',
  title: 'Họp rà soát kế hoạch xuất bản',
  startAt: '2026-11-05T08:30:00',
  endAt: '2026-11-05T10:00:00',
  type: 'meeting',
  ticketType: 'MEETING',
  scope: 'editorial',
  organizer: 'Văn phòng tòa soạn',
  leader: 'Nguyễn Thái Bình',
  location: 'Phòng họp tầng 3',
  participants: ['Nguyễn Minh Anh', 'Lê Thanh Liêm'],
  isUserParticipant: true,
  approvalStatus: 'SCHEDULED',
  description: 'Nội dung đầy đủ chỉ xem tại trang chi tiết.',
  attachments: [{ id: 'attachment-preview', name: 'Ke-hoach-xuat-ban.pdf', size: 1024, type: 'application/pdf' }],
  comments: [{ id: 'comment-preview', author: 'Lê Thanh Liêm', content: 'Bình luận chỉ xem tại trang chi tiết.', createdAt: '2026-11-04T09:00:00' }],
};

export const previewWatcher: CalendarEvent = {
  ...previewMeeting,
  id: 'preview-watcher',
  title: 'Họp phối hợp các ban chuyên môn',
  scope: 'personal',
  isUserParticipant: false,
  isUserWatcher: true,
  approvalStatus: 'PENDING',
};
