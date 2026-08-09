# Mock API và Schema dữ liệu

## 1. Nguyên tắc

- Không đặt dữ liệu nghiệp vụ trực tiếp trong component.
- Component lấy dữ liệu qua service.
- Service gọi mock API.
- Mock API trả JSON.
- Có thể dùng MSW.
- Cho phép mô phỏng:
  - Thành công.
  - Loading.
  - Empty.
  - Error.
- Dữ liệu bằng tiếng Việt và phải hợp lý.

## 2. Response chuẩn

```ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}
```

## 3. User

```ts
export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  avatarUrl?: string;
  role: "employee";
}
```

### API

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Login request

```json
{
  "username": "nhanvien",
  "password": "123456"
}
```

### Login response

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "mock-token",
    "user": {
      "id": "user-001",
      "username": "nhanvien",
      "fullName": "Nguyễn Minh Anh",
      "email": "minhanh@noibo.vn",
      "department": "Ban Nội dung",
      "position": "Phóng viên",
      "role": "employee"
    }
  }
}
```

## 4. Task

```ts
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "overdue";

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  assignedBy: string;
  department?: string;
  progress?: number;
}
```

### API

```text
GET /api/tasks
GET /api/dashboard/tasks
```

### Query gợi ý

```text
status
priority
dueFrom
dueTo
page
pageSize
```

## 5. Calendar event

```ts
export type CalendarEventType =
  | "meeting"
  | "work"
  | "deadline"
  | "personal";

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string;
  meetingUrl?: string;
  type: CalendarEventType;
  organizer: string;
}
```

### API

```text
GET /api/calendar/events
GET /api/dashboard/today-events
```

## 6. Chat

```ts
export interface ChatConversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isMine: boolean;
}
```

### API

```text
GET /api/chat/conversations
GET /api/chat/conversations/:id/messages
GET /api/dashboard/chat-summary
```

## 7. Mail

```ts
export interface MailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  sentAt: string;
  isRead: boolean;
  isStarred: boolean;
}
```

### API

```text
GET /api/mail
GET /api/mail/:id
GET /api/dashboard/mail-summary
```

### Query gợi ý

```text
filter=all|unread|starred
page
pageSize
```

## 8. Announcement

```ts
export type AnnouncementLevel =
  | "normal"
  | "important"
  | "urgent";

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  issuingDepartment: string;
  publishedAt: string;
  level: AnnouncementLevel;
  isRead: boolean;
}
```

### API

```text
GET /api/announcements
GET /api/announcements/:id
GET /api/dashboard/announcements
```

### Query gợi ý

```text
level
sort=newest
page
pageSize
```

## 9. Dashboard summary

```ts
export interface DashboardSummary {
  taskSummary: {
    total: number;
    dueSoon: number;
    overdue: number;
    completed: number;
  };
  unreadMailCount: number;
  unreadChatCount: number;
}
```

### API

```text
GET /api/dashboard/summary
```

## 10. Dữ liệu mẫu tối thiểu

- 12–20 công việc.
- 8–12 sự kiện lịch.
- 8–12 cuộc trò chuyện.
- 10–15 tin nhắn cho một vài cuộc trò chuyện.
- 15–20 mail.
- 10–15 thông báo.
- Dữ liệu phải có ngày giờ hợp lý.
- Có đủ trạng thái để kiểm tra filter.
- Có ít nhất một trường hợp overdue.
- Có ít nhất một thông báo urgent.
- Có cả mail đã đọc và chưa đọc.
- Có cả chat có và không có unread count.

## 11. UI state test mode

Khuyến nghị hỗ trợ query hoặc cấu hình dev:

```text
?state=loading
?state=empty
?state=error
```

Hoặc tạo một development-only control để chuyển state trong quá trình kiểm thử.
