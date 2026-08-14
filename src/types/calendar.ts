export type CalendarNotificationType = 'editorial_meeting' | 'general_announcement';

export type CalendarNotificationStatus = 'sent' | 'pending';

export type RecipientTargetType = 'all' | 'groups' | 'individuals';

export type GroupStatus = 'active' | 'closed'; // 'Đang mở' | 'Đã đóng'

export interface CalendarRecipientGroup {
  id: string;
  name: string;
  description?: string;
  members: string[]; // Danh sách nhân viên trong nhóm
  status: GroupStatus; // 'active' (Đang mở) | 'closed' (Đã đóng)
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRecipientGroupPayload {
  name: string;
  description?: string;
  members: string[];
  status: GroupStatus;
}

export interface CalendarAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface CalendarNotificationRecipient {
  targetType: RecipientTargetType;
  groupIds?: string[];
  groupNames?: string[];
  departments?: string[];
  individuals?: string[];
}

export interface CalendarNotificationItem {
  id: string;
  type: CalendarNotificationType; // 'editorial_meeting': Lịch họp ban biên tập | 'general_announcement': Thông báo
  title: string;
  content: string; // Nội dung văn bản hoặc HTML
  isHtmlContent?: boolean;
  recipients: CalendarNotificationRecipient;
  scheduledAt?: string; // Thời gian hẹn giờ gửi (nếu có)
  sentAt?: string; // Thời gian đã gửi thực tế
  status: CalendarNotificationStatus; // 'sent': Đã gửi | 'pending': Chưa gửi
  sendMailCopy: boolean; // Nhận thêm thông báo qua mail
  applyWatermark: boolean; // Watermark tệp đính kèm
  attachments: CalendarAttachment[];
  createdBy: string;
  createdAt: string;
}

export interface CreateCalendarNotificationPayload {
  type: CalendarNotificationType;
  title: string;
  content: string;
  isHtmlContent?: boolean;
  recipients: CalendarNotificationRecipient;
  scheduledAt?: string; // Nếu không truyền / để trống -> Gửi ngay
  sendMailCopy: boolean;
  applyWatermark: boolean;
  attachments?: CalendarAttachment[];
}
