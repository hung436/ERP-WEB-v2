export type ApiState = 'success' | 'loading' | 'empty' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page?: number; pageSize?: number; total?: number };
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  role: 'employee';
}

export interface DirectoryContact {
  id: string;
  fullName: string;
  penName?: string;
  department: string;
  phone: string;
  email: string;
  extension?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskSourceModule = 'documents' | 'evaluations';
export type TaskWorkflowKind = 'leave_request' | 'overseas_request' | 'self_evaluation' | 'subordinate_evaluation';
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  receivedAt?: string;
  assignedBy: string;
  department?: string;
  progress?: number;
  sourceModule?: TaskSourceModule;
  workflowKind?: TaskWorkflowKind;
  subjectName?: string;
  period?: string;
  requestDuration?: string;
  destination?: string;
  workflowStep?: string;
  documentId?: string;
}

export type CalendarEventType = 'meeting' | 'work' | 'deadline' | 'personal';
export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string;
  meetingUrl?: string;
  type: CalendarEventType;
  organizer: string;
  responseStatus?: 'pending' | 'accepted' | 'declined';
  meetingId?: string;
  platform?: string;
  agenda?: string;
  participants?: string[];
  recordingAvailable?: boolean;
}

export interface ChatMember {
  id: string;
  name: string;
  email: string;
  department: string;
  online: boolean;
}
export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}
export interface ChatConversation {
  id: string;
  participantName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  online?: boolean;
  isGroup?: boolean;
  members: ChatMember[];
  pinned?: boolean;
}
export interface ChatReaction { emoji: string; count: number; reacted: boolean }
export interface ChatReply { id: string; senderName: string; content: string }
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isMine: boolean;
  attachment?: ChatAttachment;
  replyTo?: ChatReply;
  reactions?: ChatReaction[];
}

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
  folder?: 'inbox' | 'sent' | 'drafts' | 'archive' | 'spam' | 'trash';
  recipients?: string[];
  cc?: string[];
  bcc?: string[];
  labels?: string[];
  isImportant?: boolean;
  threadCount?: number;
  attachments?: MailAttachment[];
}

export interface MailAttachment { id: string; name: string; size: number; type: string }
export interface MailComposePayload { recipients: string[]; cc?: string[]; bcc?: string[]; subject: string; content: string; attachments?: MailAttachment[] }

export interface MailReply {
  id: string;
  mailId: string;
  content: string;
  sentAt: string;
  attachments?: MailAttachment[];
}

export type AnnouncementLevel = 'normal' | 'important' | 'urgent';
export type AnnouncementSource = 'agency' | 'documents' | 'mail' | 'evaluations' | 'system';
export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  issuingDepartment: string;
  publishedAt: string;
  level: AnnouncementLevel;
  isRead: boolean;
  acknowledged?: boolean;
  sourceModule?: AnnouncementSource;
}

export interface DashboardSummary {
  taskSummary: { total: number; dueSoon: number; overdue: number; completed: number };
  unreadMailCount: number;
  unreadChatCount: number;
}

export type DocumentTemplateKind = 'leave_request' | 'overseas_request';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export interface DocumentTemplate {
  id: string;
  kind: DocumentTemplateKind;
  name: string;
  description: string;
  estimatedDays: number;
  workflow: string[];
}
export interface DocumentWorkflowStep {
  id: string;
  name: string;
  assignee: string;
  status: 'waiting' | 'pending' | 'approved' | 'rejected';
  actedAt?: string;
  note?: string;
}
export interface DocumentSubmission {
  id: string;
  code: string;
  templateId: string;
  kind: DocumentTemplateKind;
  title: string;
  createdBy: string;
  department: string;
  createdAt: string;
  status: DocumentStatus;
  currentStep: number;
  viewScope: 'sent' | 'pending_review' | 'reviewed';
  fields: Record<string, string>;
  steps: DocumentWorkflowStep[];
}
