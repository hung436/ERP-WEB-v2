import { mockRequest } from '@/services/mockApi';
import type { Announcement, CalendarEvent, ChatAttachment, ChatConversation, ChatMember, ChatMessage, ChatReply, DashboardSummary, DirectoryContact, DocumentSubmission, DocumentTemplate, MailAttachment, MailComposePayload, MailItem, MailReply, MeetingEvent, Task, User } from '@/types/domain';
import type { ExpertRecord, WorkspaceFile, WorkspaceRecord } from '@/types/extended';
import type { EvaluationPeriod, EvaluationSheet, EvaluationSummary } from '@/types/evaluation';
import type { CreatePersonnelPayload, PersonalProfile, PersonnelRecordItem, PositionTitleItem, ResignedEmployeeItem, SpecialtyItem, UnitPositionMapping, WorkUnitItem } from '@/types/personnel';


import type { CalendarNotificationItem, CalendarRecipientGroup, CreateCalendarNotificationPayload, CreateRecipientGroupPayload } from '@/types/calendar';

export const authApi = {
  login: (username: string, password: string) => mockRequest<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: () => mockRequest<User>('/api/auth/me'),
  logout: () => mockRequest<null>('/api/auth/logout', { method: 'POST' }),
};

export const dashboardApi = {
  summary: () => mockRequest<DashboardSummary>('/api/dashboard/summary'),
  tasks: () => mockRequest<Task[]>('/api/dashboard/tasks'),
  events: () => mockRequest<MeetingEvent[]>('/api/dashboard/today-events'),
  mails: () => mockRequest<MailItem[]>('/api/dashboard/mail-summary'),
  chats: () => mockRequest<ChatConversation[]>('/api/dashboard/chat-summary'),
  announcements: () => mockRequest<Announcement[]>('/api/dashboard/announcements'),
};

export const taskApi = { list: (query = '') => mockRequest<Task[]>(`/api/tasks${query}`) };
export const meetingApi = {
  list: (query = '') => mockRequest<MeetingEvent[]>(`/api/meeting/events${query}`),
  respond: (id: string, responseStatus: NonNullable<MeetingEvent['responseStatus']>) => mockRequest<MeetingEvent>(`/api/meeting/events/${id}/respond`, { method: 'POST', body: { responseStatus } }),
  create: (data: Partial<MeetingEvent>) => mockRequest<MeetingEvent>('/api/meeting/events', { method: 'POST', body: data }),
};
export const calendarApi = {
  list: (query = '') => mockRequest<CalendarEvent[]>(`/api/calendar/events${query}`),
  respond: (id: string, responseStatus: NonNullable<CalendarEvent['responseStatus']>) => mockRequest<CalendarEvent>(`/api/calendar/events/${id}/respond`, { method: 'POST', body: { responseStatus } }),
  create: (data: Partial<CalendarEvent>) => mockRequest<CalendarEvent>('/api/calendar/events', { method: 'POST', body: data }),
};
export const calendarNotificationApi = {
  list: (query = '') => mockRequest<CalendarNotificationItem[]>(`/api/calendar/notifications${query}`),
  get: (id: string) => mockRequest<CalendarNotificationItem>(`/api/calendar/notifications/${id}`),
  create: (data: CreateCalendarNotificationPayload) => mockRequest<CalendarNotificationItem>('/api/calendar/notifications', { method: 'POST', body: data }),
  update: (id: string, data: Partial<CalendarNotificationItem>) => mockRequest<CalendarNotificationItem>(`/api/calendar/notifications/${id}`, { method: 'PUT', body: data }),
  send: (id: string) => mockRequest<CalendarNotificationItem>(`/api/calendar/notifications/${id}/send`, { method: 'POST' }),
  delete: (id: string) => mockRequest<{ success: boolean }>(`/api/calendar/notifications/${id}`, { method: 'DELETE' }),
};
export const calendarGroupApi = {
  list: (query = '') => mockRequest<CalendarRecipientGroup[]>(`/api/calendar/groups${query}`),
  get: (id: string) => mockRequest<CalendarRecipientGroup>(`/api/calendar/groups/${id}`),
  create: (data: CreateRecipientGroupPayload) => mockRequest<CalendarRecipientGroup>('/api/calendar/groups', { method: 'POST', body: data }),
  update: (id: string, data: Partial<CalendarRecipientGroup>) => mockRequest<CalendarRecipientGroup>(`/api/calendar/groups/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => mockRequest<{ success: boolean }>(`/api/calendar/groups/${id}`, { method: 'DELETE' }),
};
export const directoryApi = { list: (query = '') => mockRequest<DirectoryContact[]>(`/api/directory${query}`) };
export const personnelApi = {
  list: (query = '') => mockRequest<PersonnelRecordItem[]>(`/api/personnel/list${query}`),
  extraction: (filters: Record<string, any>) => mockRequest<PersonnelRecordItem[]>('/api/personnel/extraction', { method: 'POST', body: filters }),
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

export const customDocumentTemplateApi = {
  list: (query = '') => mockRequest<import('@/types/domain').CustomDocumentTemplateItem[]>(`/api/documents/custom-templates${query}`),
  get: (id: string) => mockRequest<import('@/types/domain').CustomDocumentTemplateItem>(`/api/documents/custom-templates/${id}`),
  save: (payload: Partial<import('@/types/domain').CustomDocumentTemplateItem>) => mockRequest<{ success: boolean; message: string }>('/api/documents/custom-templates', { method: 'POST', body: payload }),
  delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/documents/custom-templates/${id}`, { method: 'DELETE' }),
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

export const personnelManagementApi = {
  units: {
    list: (query = '') => mockRequest<WorkUnitItem[]>(`/api/personnel/management/units${query}`),
    save: (payload: Partial<WorkUnitItem>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/management/units', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/management/units/${id}`, { method: 'DELETE' }),
  },
  positions: {
    list: (query = '') => mockRequest<PositionTitleItem[]>(`/api/personnel/management/positions${query}`),
    save: (payload: Partial<PositionTitleItem>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/management/positions', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/management/positions/${id}`, { method: 'DELETE' }),
  },
  specialties: {
    list: (query = '') => mockRequest<SpecialtyItem[]>(`/api/personnel/management/specialties${query}`),
    save: (payload: Partial<SpecialtyItem>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/management/specialties', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/management/specialties/${id}`, { method: 'DELETE' }),
  },
  mappings: {
    list: (query = '') => mockRequest<UnitPositionMapping[]>(`/api/personnel/management/mappings${query}`),
    save: (payload: Partial<UnitPositionMapping>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/management/mappings', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/management/mappings/${id}`, { method: 'DELETE' }),
  },
  resigned: {
    list: (query = '') => mockRequest<ResignedEmployeeItem[]>(`/api/personnel/management/resigned${query}`),
    save: (payload: Partial<ResignedEmployeeItem>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/management/resigned', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/management/resigned/${id}`, { method: 'DELETE' }),
  },
};

export const personnelPermissionsApi = {
  items: {
    list: (query = '') => mockRequest<import('@/types/personnel').PermissionItem[]>(`/api/personnel/permissions/items${query}`),
    save: (payload: Partial<import('@/types/personnel').PermissionItem>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/permissions/items', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/permissions/items/${id}`, { method: 'DELETE' }),
  },
  groups: {
    list: (query = '') => mockRequest<import('@/types/personnel').PermissionGroupItem[]>(`/api/personnel/permissions/groups${query}`),
    save: (payload: Partial<import('@/types/personnel').PermissionGroupItem>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/permissions/groups', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/permissions/groups/${id}`, { method: 'DELETE' }),
  },
  assignments: {
    list: (query = '') => mockRequest<import('@/types/personnel').PermissionAssignmentItem[]>(`/api/personnel/permissions/assignments${query}`),
    save: (payload: Partial<import('@/types/personnel').PermissionAssignmentItem>) => mockRequest<{ success: boolean; message: string }>('/api/personnel/permissions/assignments', { method: 'POST', body: payload }),
    delete: (id: string) => mockRequest<{ success: boolean; message: string }>(`/api/personnel/permissions/assignments/${id}`, { method: 'DELETE' }),
  },
};

