import { mockRequest } from '@/services/mockApi';
import type { Announcement, CalendarEvent, ChatAttachment, ChatConversation, ChatMember, ChatMessage, ChatReply, DashboardSummary, DirectoryContact, DocumentSubmission, DocumentTemplate, MailAttachment, MailComposePayload, MailItem, MailReply, Task, User } from '@/types/domain';
import type { ExpertRecord, WorkspaceFile, WorkspaceRecord } from '@/types/extended';
import type { EvaluationPeriod, EvaluationSheet, EvaluationSummary } from '@/types/evaluation';
import type { CreatePersonnelPayload, PersonalProfile, PersonnelRecordItem } from '@/types/personnel';

export const authApi = {
  login: (username: string, password: string) => mockRequest<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: () => mockRequest<User>('/api/auth/me'),
  logout: () => mockRequest<null>('/api/auth/logout', { method: 'POST' }),
};

export const dashboardApi = {
  summary: () => mockRequest<DashboardSummary>('/api/dashboard/summary'),
  tasks: () => mockRequest<Task[]>('/api/dashboard/tasks'),
  events: () => mockRequest<CalendarEvent[]>('/api/dashboard/today-events'),
  mails: () => mockRequest<MailItem[]>('/api/dashboard/mail-summary'),
  chats: () => mockRequest<ChatConversation[]>('/api/dashboard/chat-summary'),
  announcements: () => mockRequest<Announcement[]>('/api/dashboard/announcements'),
};

export const taskApi = { list: (query = '') => mockRequest<Task[]>(`/api/tasks${query}`) };
export const calendarApi = {
  list: (query = '') => mockRequest<CalendarEvent[]>(`/api/calendar/events${query}`),
  respond: (id: string, responseStatus: NonNullable<CalendarEvent['responseStatus']>) => mockRequest<CalendarEvent>(`/api/calendar/events/${id}/respond`, { method: 'POST', body: { responseStatus } }),
  create: (data: Partial<CalendarEvent>) => mockRequest<CalendarEvent>('/api/calendar/events', { method: 'POST', body: data }),
};
export const directoryApi = { list: (query = '') => mockRequest<DirectoryContact[]>(`/api/directory${query}`) };
export const personnelApi = {
  list: (query = '') => mockRequest<PersonnelRecordItem[]>(`/api/personnel/list${query}`),
  get: (id: string) => mockRequest<PersonnelRecordItem>(`/api/personnel/${id}`),
  profile: () => mockRequest<PersonalProfile | null>('/api/personnel/profile'),
  create: (payload: CreatePersonnelPayload) => mockRequest<{ id: string; code: string; message: string }>('/api/personnel/create', { method: 'POST', body: payload }),
  update: (id: string, payload: Partial<CreatePersonnelPayload>) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/${id}`, { method: 'PUT', body: payload }),
};
export const changeRequestsApi = {
  list: (query = '') => mockRequest<import('@/types/personnel').PersonnelChangeRequest[]>(`/api/personnel/change-requests${query}`),
  create: (payload: any) => mockRequest<{ id: string; code: string; message: string }>('/api/personnel/change-requests', { method: 'POST', body: payload }),
  approve: (id: string, comment?: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/change-requests/${id}/approve`, { method: 'POST', body: { comment } }),
  reject: (id: string, comment?: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/change-requests/${id}/reject`, { method: 'POST', body: { comment } }),
};
export const chatApi = {
  conversations: () => mockRequest<ChatConversation[]>('/api/chat/conversations'),
  members: () => mockRequest<ChatMember[]>('/api/chat/members'),
  messages: (id: string) => mockRequest<ChatMessage[]>(`/api/chat/conversations/${id}/messages`),
  sendMessage: (id: string, content: string, attachment?: ChatAttachment, replyTo?: ChatReply) => mockRequest<ChatMessage>(`/api/chat/conversations/${id}/messages`, { method: 'POST', body: { content, attachment, replyTo } }),
  uploadAttachment: (id: string, file: Pick<ChatAttachment, 'name' | 'size' | 'type'>) => mockRequest<ChatAttachment>(`/api/chat/conversations/${id}/attachments`, { method: 'POST', body: file }),
  createGroup: (name: string, memberIds: string[]) => mockRequest<ChatConversation>('/api/chat/conversations', { method: 'POST', body: { name, memberIds } }),
  addMember: (id: string, memberId: string) => mockRequest<ChatConversation>(`/api/chat/conversations/${id}/members`, { method: 'POST', body: { memberId } }),
  removeMember: (id: string, memberId: string) => mockRequest<ChatConversation>(`/api/chat/conversations/${id}/members/${memberId}`, { method: 'DELETE' }),
  togglePin: (id: string) => mockRequest<ChatConversation>(`/api/chat/conversations/${id}/pin`, { method: 'POST' }),
  react: (conversationId: string, messageId: string, emoji: string) => mockRequest<ChatMessage>(`/api/chat/conversations/${conversationId}/messages/${messageId}/reactions`, { method: 'POST', body: { emoji } }),
  deleteMessage: (conversationId: string, messageId: string) => mockRequest<null>(`/api/chat/conversations/${conversationId}/messages/${messageId}`, { method: 'DELETE' }),
  startDirect: (contact: DirectoryContact) => mockRequest<ChatConversation>('/api/chat/direct', { method: 'POST', body: contact }),
};
export const mailApi = {
  list: (query = '') => mockRequest<MailItem[]>(`/api/mail${query}`),
  detail: (id: string) => mockRequest<MailItem>(`/api/mail/${id}`),
  reply: (id: string, content: string, replyAll = false, attachments: MailAttachment[] = []) => mockRequest<MailReply>(`/api/mail/${id}/${replyAll ? 'reply-all' : 'reply'}`, { method: 'POST', body: { content, attachments } }),
  send: (payload: MailComposePayload) => mockRequest<MailItem>('/api/mail/send', { method: 'POST', body: payload }),
  saveDraft: (payload: Partial<MailComposePayload>, id?: string) => mockRequest<MailItem>('/api/mail/drafts', { method: 'POST', body: { ...payload, id } }),
  action: (id: string, action: 'toggle-star' | 'mark-read' | 'mark-unread' | 'archive' | 'trash' | 'restore' | 'spam') => mockRequest<MailItem>(`/api/mail/${id}/actions`, { method: 'POST', body: { action } }),
};
export const announcementApi = {
  list: (query = '') => mockRequest<Announcement[]>(`/api/announcements${query}`),
  detail: (id: string) => mockRequest<Announcement>(`/api/announcements/${id}`),
  markRead: (id: string) => mockRequest<Announcement>(`/api/announcements/${id}/read`, { method: 'POST' }),
  acknowledge: (id: string) => mockRequest<Announcement>(`/api/announcements/${id}/acknowledge`, { method: 'POST' }),
};
export const documentApi = {
  templates: () => mockRequest<DocumentTemplate[]>('/api/documents/templates'),
  submissions: () => mockRequest<DocumentSubmission[]>('/api/documents/submissions'),
  submit: (templateId: string, fields: Record<string, string>) => mockRequest<DocumentSubmission>('/api/documents/submissions', { method: 'POST', body: { templateId, fields } }),
  action: (id: string, action: 'approve' | 'reject', note?: string) => mockRequest<DocumentSubmission>(`/api/documents/submissions/${id}/actions`, { method: 'POST', body: { action, note } }),
};

const workspaceAction = (module: string, action: string, values: Record<string, unknown> = {}) => mockRequest<{ id: string; action: string; completedAt: string }>(`/api/${module}/actions`, { method: 'POST', body: { action, values } });
export const extendedWorkspaceApi = {
  requests: () => mockRequest<WorkspaceRecord[]>('/api/requests'),
  cloud: () => mockRequest<WorkspaceFile[]>('/api/cloud'),
  meetings: () => mockRequest<WorkspaceRecord[]>('/api/meetings'),
  evaluations: () => mockRequest<WorkspaceRecord[]>('/api/evaluations'),
  library: () => mockRequest<WorkspaceRecord[]>('/api/library'),
  experts: () => mockRequest<ExpertRecord[]>('/api/experts'),
  action: workspaceAction,
};

export const evaluationApi = {
  periods: () => mockRequest<EvaluationPeriod[]>('/api/evaluations/periods'),
  summary: (periodId: string) => mockRequest<EvaluationSummary>(`/api/evaluations/summary?period=${periodId}`),
  sheets: (periodId?: string) => mockRequest<EvaluationSheet[]>(`/api/evaluations/sheets${periodId ? `?period=${periodId}` : ''}`),
  detail: (id: string) => mockRequest<EvaluationSheet>(`/api/evaluations/sheets/${id}`),
  save: (sheet: EvaluationSheet, action: 'save' | 'submit' | 'approve' = 'save') => mockRequest<EvaluationSheet>(`/api/evaluations/sheets/${sheet.id}`, { method: 'POST', body: { groups: sheet.groups, action } }),
};
