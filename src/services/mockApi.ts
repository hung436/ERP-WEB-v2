import { adminUser, announcements, calendarEvents, chatMembers, conversations, demoUser, directoryContacts, mails, messages, tasks } from '@/mocks/fixtures';
import { cloudRecords, evaluationRecords, expertRecords, libraryRecords, meetingRecords, requestRecords } from '@/mocks/extendedFixtures';
import { documentSubmissions, documentTemplates } from '@/mocks/documentFixtures';
import { evaluationPeriods, evaluationSheets } from '@/mocks/evaluationFixtures';
import { personalProfile } from '@/mocks/personnelFixtures';
import type { Announcement, ApiResponse, ApiState, CalendarEvent, ChatAttachment, ChatConversation, ChatMessage, DashboardSummary, DirectoryContact, DocumentSubmission, MailComposePayload, MailItem, MailReply, Task, User } from '@/types/domain';
import type { EvaluationSheet, EvaluationSummary } from '@/types/evaluation';

let activeUser: User = demoUser;
let chatConversationStore: ChatConversation[] = conversations.map((item) => ({ ...item, members: [...item.members] }));
let chatMessageStore: ChatMessage[] = [...messages];
let chatSequence = 100;
let calendarEventStore: CalendarEvent[] = calendarEvents.map((item) => ({ ...item, responseStatus: item.responseStatus ?? 'pending' }));
let mailStore: MailItem[] = mails.map((item) => ({ ...item }));
const announcementSources: NonNullable<Announcement['sourceModule']>[] = ['agency', 'agency', 'documents', 'agency', 'mail', 'agency', 'evaluations', 'system', 'documents', 'mail'];
let announcementStore: Announcement[] = announcements.map((item, index) => ({ ...item, acknowledged: item.acknowledged ?? false, sourceModule: item.sourceModule ?? announcementSources[index % announcementSources.length] }));
let documentSubmissionStore: DocumentSubmission[] = documentSubmissions.map((item) => ({ ...item, fields: { ...item.fields }, steps: item.steps.map((step) => ({ ...step })) }));
let documentSequence = documentSubmissions.length + 20;
let workspaceActionSequence = 100;
let evaluationSheetStore: EvaluationSheet[] = evaluationSheets.map((sheet) => ({ ...sheet, groups: sheet.groups.map((group) => ({ ...group, criteria: group.criteria.map((criterion) => ({ ...criterion })) })) }));

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

function currentState(): ApiState {
  if (typeof window === 'undefined') return 'success';
  return (new URLSearchParams(window.location.search).get('state') as ApiState) || 'success';
}

function documentToTask(document: DocumentSubmission): Task {
  const currentStep = document.steps[document.currentStep];
  const template = documentTemplates.find((item) => item.id === document.templateId);
  const dueAt = new Date(new Date(document.createdAt).getTime() + (template?.estimatedDays ?? 2) * 86_400_000).toISOString();
  const fields = document.fields;
  return {
    id: `task-${document.id}`,
    documentId: document.id,
    title: document.kind === 'leave_request' ? `Duyệt đơn xin nghỉ phép của ${document.createdBy}` : `Duyệt phiếu đề xuất đi nước ngoài của ${document.createdBy}`,
    description: fields.reason,
    status: 'todo',
    priority: 'medium',
    dueAt,
    receivedAt: document.createdAt,
    assignedBy: 'Hệ thống Tài liệu',
    department: document.department,
    progress: Math.round((document.currentStep / document.steps.length) * 100),
    sourceModule: 'documents',
    workflowKind: document.kind,
    subjectName: document.createdBy,
    requestDuration: document.kind === 'leave_request' ? `${fields.fromDate} – ${fields.toDate}` : `${fields.departureDate} – ${fields.returnDate}`,
    destination: fields.destination,
    workflowStep: currentStep?.name,
  };
}

const currentTaskStore = () => [
  ...documentSubmissionStore.filter((item) => item.viewScope === 'pending_review' && item.status === 'pending').map(documentToTask),
  ...tasks.filter((item) => item.sourceModule !== 'documents').map((item) => ({ ...item, receivedAt: item.receivedAt ?? new Date(new Date(item.dueAt).getTime() - 2 * 86_400_000).toISOString() })),
];

export async function mockRequest<T>(path: string, options?: { method?: string; body?: unknown }): Promise<ApiResponse<T>> {
  const url = new URL(path, 'https://erp.local');
  const pathname = url.pathname;
  const state = pathname.startsWith('/api/auth/') ? 'success' : currentState();
  await wait(import.meta.env.MODE === 'test' ? (state === 'loading' ? 120 : 0) : state === 'loading' ? 900 : 80);
  if (state === 'error') throw new Error('Không thể tải dữ liệu. Vui lòng thử lại.');

  let data: unknown;

  if (pathname === '/api/auth/login' && options?.method === 'POST') {
    const credentials = options.body as { username?: string; password?: string };
    if (credentials.username === 'admin' && (credentials.password === '123456' || credentials.password === 'admin123')) {
      activeUser = adminUser;
      data = { token: 'mock-admin-token', user: adminUser };
    } else if (credentials.username === 'nhanvien' && credentials.password === '123456') {
      activeUser = demoUser;
      data = { token: 'mock-token', user: demoUser };
    } else {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  } else if (pathname === '/api/auth/me') {
    data = activeUser;
  } else if (pathname === '/api/auth/logout') {
    activeUser = demoUser;
    data = null;
  }
  else if (pathname === '/api/dashboard/summary') {
    const taskStore = currentTaskStore();
    data = {
      taskSummary: { total: taskStore.length, dueSoon: taskStore.filter((item) => item.status !== 'completed').slice(0, 4).length, overdue: taskStore.filter((item) => item.status === 'overdue').length, completed: taskStore.filter((item) => item.status === 'completed').length },
      unreadMailCount: mailStore.filter((item) => (item.folder ?? 'inbox') === 'inbox' && !item.isRead).length,
      unreadChatCount: chatConversationStore.reduce((sum, item) => sum + item.unreadCount, 0),
    } satisfies DashboardSummary;
  } else if (pathname === '/api/dashboard/tasks') data = currentTaskStore().filter((item) => item.status !== 'completed').slice(0, 6);
  else if (pathname === '/api/dashboard/today-events') {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
    data = calendarEventStore.filter((item) => item.startAt.startsWith(today)).slice(0, 4);
  }
  else if (pathname === '/api/dashboard/mail-summary') data = mailStore.filter((item) => (item.folder ?? 'inbox') === 'inbox' && !item.isRead).slice(0, 3);
  else if (pathname === '/api/dashboard/chat-summary') data = chatConversationStore.filter((item) => item.unreadCount > 0).slice(0, 3);
  else if (pathname === '/api/dashboard/announcements') data = announcementStore.filter((item) => item.sourceModule === 'agency').slice(0, 5);
  else if (pathname === '/api/tasks') {
    data = currentTaskStore().filter((item) => (!url.searchParams.get('status') || item.status === url.searchParams.get('status')) && (!url.searchParams.get('priority') || item.priority === url.searchParams.get('priority')));
  } else if (pathname === '/api/calendar/events') data = calendarEventStore.filter((item) => !url.searchParams.get('type') || item.type === url.searchParams.get('type'));
  else if (/^\/api\/calendar\/events\/[^/]+\/respond$/.test(pathname) && options?.method === 'POST') {
    const eventId = pathname.split('/')[4];
    const body = options.body as { responseStatus?: CalendarEvent['responseStatus'] };
    const event = calendarEventStore.find((item) => item.id === eventId);
    if (!event || !body.responseStatus) throw new Error('Không thể cập nhật phản hồi lịch.');
    const updated = { ...event, responseStatus: body.responseStatus };
    calendarEventStore = calendarEventStore.map((item) => item.id === eventId ? updated : item);
    data = updated;
  }
  else if (pathname === '/api/directory') {
    const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
    const department = url.searchParams.get('department') ?? '';
    data = directoryContacts.filter((item) => {
      const searchable = normalizeSearch(`${item.fullName} ${item.penName ?? ''} ${item.department} ${item.phone} ${item.email} ${item.extension ?? ''}`);
      return (!search || searchable.includes(search)) && (!department || item.department === department);
    });
  }
  else if (pathname === '/api/personnel/profile') data = state === 'empty' ? null : personalProfile;
  else if (pathname === '/api/chat/members') data = chatMembers;
  else if (pathname === '/api/chat/direct' && options?.method === 'POST') {
    const contact = options.body as DirectoryContact;
    const existing = chatConversationStore.find((item) => !item.isGroup && item.members.some((member) => member.email === contact.email));
    if (existing) data = existing;
    else {
      const member = { id: contact.id, name: contact.fullName, email: contact.email, department: contact.department, online: false };
      const created: ChatConversation = { id: `chat-${++chatSequence}`, participantName: contact.fullName, lastMessage: 'Bắt đầu cuộc trò chuyện', lastMessageAt: new Date().toISOString(), unreadCount: 0, online: false, isGroup: false, members: [chatMembers[0], member] };
      chatConversationStore = [created, ...chatConversationStore];
      data = created;
    }
  }
  else if (pathname === '/api/chat/conversations' && options?.method === 'POST') {
    const body = options.body as { name?: string; memberIds?: string[] };
    if (!body.name?.trim()) throw new Error('Tên nhóm không được để trống.');
    const memberIds = new Set(['user-001', ...(body.memberIds ?? [])]);
    const members = chatMembers.filter((member) => memberIds.has(member.id));
    const created: ChatConversation = { id: `chat-${++chatSequence}`, participantName: body.name.trim(), lastMessage: 'Nhóm vừa được tạo', lastMessageAt: new Date().toISOString(), unreadCount: 0, online: members.some((member) => member.online), isGroup: true, members };
    chatConversationStore = [created, ...chatConversationStore]; data = created;
  } else if (pathname === '/api/chat/conversations') data = chatConversationStore;
  else if (/^\/api\/chat\/conversations\/[^/]+\/attachments$/.test(pathname) && options?.method === 'POST') {
    const file = options.body as Pick<ChatAttachment, 'name' | 'size' | 'type'>;
    if (!file.name || file.size <= 0) throw new Error('Tệp đính kèm không hợp lệ.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Tệp đính kèm không được vượt quá 10 MB.');
    data = { id: `attachment-${++chatSequence}`, ...file } satisfies ChatAttachment;
  } else if (/^\/api\/chat\/conversations\/[^/]+\/messages$/.test(pathname) && options?.method === 'POST') {
    const conversationId = pathname.split('/')[4];
    const body = options.body as { content?: string; attachment?: ChatAttachment; replyTo?: ChatMessage['replyTo'] };
    if (!body.content?.trim() && !body.attachment) throw new Error('Tin nhắn không được để trống.');
    const sentAt = new Date().toISOString();
    const created: ChatMessage = { id: `message-${++chatSequence}`, conversationId, senderId: demoUser.id, senderName: demoUser.fullName, content: body.content?.trim() || `Đã gửi tệp ${body.attachment?.name}`, sentAt, isMine: true, attachment: body.attachment, replyTo: body.replyTo, reactions: [] };
    chatMessageStore = [...chatMessageStore, created];
    chatConversationStore = chatConversationStore.map((item) => item.id === conversationId ? { ...item, lastMessage: created.content, lastMessageAt: sentAt } : item);
    data = created;
  } else if (/^\/api\/chat\/conversations\/[^/]+\/pin$/.test(pathname) && options?.method === 'POST') {
    const conversationId = pathname.split('/')[4]; const conversation = chatConversationStore.find((item) => item.id === conversationId);
    if (!conversation) throw new Error('Không tìm thấy hội thoại.');
    const updated = { ...conversation, pinned: !conversation.pinned };
    chatConversationStore = chatConversationStore.map((item) => item.id === conversationId ? updated : item); data = updated;
  } else if (/^\/api\/chat\/conversations\/[^/]+\/messages\/[^/]+\/reactions$/.test(pathname) && options?.method === 'POST') {
    const parts = pathname.split('/'); const messageId = parts[6]; const body = options.body as { emoji?: string };
    const target = chatMessageStore.find((item) => item.id === messageId); if (!target || !body.emoji) throw new Error('Không thể thả cảm xúc.');
    const reactions = [...(target.reactions ?? [])]; const index = reactions.findIndex((item) => item.emoji === body.emoji);
    if (index >= 0) { const current = reactions[index]; reactions[index] = { ...current, count: Math.max(0, current.count + (current.reacted ? -1 : 1)), reacted: !current.reacted }; }
    else reactions.push({ emoji: body.emoji, count: 1, reacted: true });
    const updated = { ...target, reactions: reactions.filter((item) => item.count > 0) };
    chatMessageStore = chatMessageStore.map((item) => item.id === messageId ? updated : item); data = updated;
  } else if (/^\/api\/chat\/conversations\/[^/]+\/messages\/[^/]+$/.test(pathname) && options?.method === 'DELETE') {
    const parts = pathname.split('/'); const conversationId = parts[4]; const messageId = parts[6]; const target = chatMessageStore.find((item) => item.id === messageId);
    if (!target?.isMine) throw new Error('Chỉ có thể xóa tin nhắn của bạn.');
    chatMessageStore = chatMessageStore.filter((item) => item.id !== messageId);
    const latest = chatMessageStore.filter((item) => item.conversationId === conversationId).slice(-1)[0];
    chatConversationStore = chatConversationStore.map((item) => item.id === conversationId ? { ...item, lastMessage: latest?.content ?? 'Chưa có tin nhắn', lastMessageAt: latest?.sentAt ?? item.lastMessageAt } : item); data = null;
  } else if (/^\/api\/chat\/conversations\/[^/]+\/members$/.test(pathname) && options?.method === 'POST') {
    const conversationId = pathname.split('/')[4]; const body = options.body as { memberId?: string };
    const member = chatMembers.find((item) => item.id === body.memberId); const conversation = chatConversationStore.find((item) => item.id === conversationId);
    if (!conversation?.isGroup || !member) throw new Error('Không thể thêm thành viên vào hội thoại này.');
    const updated = { ...conversation, members: conversation.members.some((item) => item.id === member.id) ? conversation.members : [...conversation.members, member] };
    chatConversationStore = chatConversationStore.map((item) => item.id === conversationId ? updated : item); data = updated;
  } else if (/^\/api\/chat\/conversations\/[^/]+\/members\/[^/]+$/.test(pathname) && options?.method === 'DELETE') {
    const parts = pathname.split('/'); const conversationId = parts[4]; const memberId = parts[6];
    const conversation = chatConversationStore.find((item) => item.id === conversationId);
    if (!conversation?.isGroup || memberId === demoUser.id) throw new Error('Không thể xóa thành viên này.');
    const updated = { ...conversation, members: conversation.members.filter((item) => item.id !== memberId) };
    chatConversationStore = chatConversationStore.map((item) => item.id === conversationId ? updated : item); data = updated;
  } else if (/^\/api\/chat\/conversations\/[^/]+\/messages$/.test(pathname)) data = chatMessageStore.filter((item) => item.conversationId === pathname.split('/')[4]);
  else if (pathname === '/api/mail/send' && options?.method === 'POST') {
    const body = options.body as MailComposePayload;
    if (!body.recipients?.length || !body.subject?.trim() || !body.content?.trim()) throw new Error('Vui lòng nhập đủ người nhận, chủ đề và nội dung.');
    const created: MailItem = { id: `mail-sent-${++workspaceActionSequence}`, senderName: demoUser.fullName, senderEmail: demoUser.email, recipients: body.recipients, cc: body.cc ?? [], bcc: body.bcc ?? [], subject: body.subject.trim(), preview: body.content.trim().slice(0, 90), body: body.content.trim(), sentAt: new Date().toISOString(), isRead: true, isStarred: false, folder: 'sent', labels: [], attachments: body.attachments ?? [] };
    mailStore = [created, ...mailStore]; data = created;
  }
  else if (pathname === '/api/mail/drafts' && options?.method === 'POST') {
    const body = options.body as Partial<MailComposePayload> & { id?: string };
    const draft: MailItem = { id: body.id ?? `mail-draft-${++workspaceActionSequence}`, senderName: demoUser.fullName, senderEmail: demoUser.email, recipients: body.recipients ?? [], cc: body.cc ?? [], bcc: body.bcc ?? [], subject: body.subject?.trim() || '(Không có chủ đề)', preview: body.content?.trim().slice(0, 90) || 'Bản nháp chưa có nội dung', body: body.content?.trim() || '', sentAt: new Date().toISOString(), isRead: true, isStarred: false, folder: 'drafts', labels: [], attachments: body.attachments ?? [] };
    mailStore = body.id ? mailStore.map((item) => item.id === body.id ? draft : item) : [draft, ...mailStore]; data = draft;
  }
  else if (/^\/api\/mail\/[^/]+\/(reply|reply-all)$/.test(pathname) && options?.method === 'POST') {
    const mailId = pathname.split('/')[3]; const body = options.body as { content?: string; attachments?: MailItem['attachments'] };
    if (!mailStore.some((item) => item.id === mailId) || !body.content?.trim()) throw new Error('Nội dung trả lời không được để trống.');
    mailStore = mailStore.map((item) => item.id === mailId ? { ...item, isRead: true } : item);
    data = { id: `mail-reply-${++workspaceActionSequence}`, mailId, content: body.content.trim(), sentAt: new Date().toISOString(), attachments: body.attachments ?? [] } satisfies MailReply;
  }
  else if (/^\/api\/mail\/[^/]+\/actions$/.test(pathname) && options?.method === 'POST') {
    const mailId = pathname.split('/')[3]; const body = options.body as { action?: string };
    const item = mailStore.find((entry) => entry.id === mailId); if (!item) throw new Error('Không tìm thấy Mail.');
    const updated: MailItem = { ...item };
    if (body.action === 'toggle-star') updated.isStarred = !updated.isStarred;
    else if (body.action === 'mark-read') updated.isRead = true;
    else if (body.action === 'mark-unread') updated.isRead = false;
    else if (body.action === 'archive') updated.folder = 'archive';
    else if (body.action === 'trash') updated.folder = 'trash';
    else if (body.action === 'restore') updated.folder = 'inbox';
    else if (body.action === 'spam') updated.folder = 'spam';
    else throw new Error('Thao tác Mail không hợp lệ.');
    mailStore = mailStore.map((entry) => entry.id === mailId ? updated : entry); data = updated;
  }
  else if (pathname === '/api/mail') {
    const folder = url.searchParams.get('folder'); const filter = url.searchParams.get('filter');
    data = mailStore.filter((item) => (!folder || (item.folder ?? 'inbox') === folder) && (filter === 'unread' ? !item.isRead : filter === 'starred' ? item.isStarred : true));
  }
  else if (/^\/api\/mail\/[^/]+$/.test(pathname)) data = mailStore.find((item) => item.id === pathname.split('/').pop());
  else if (/^\/api\/announcements\/[^/]+\/read$/.test(pathname) && options?.method === 'POST') {
    const id = pathname.split('/')[3]; const item = announcementStore.find((entry) => entry.id === id);
    if (!item) throw new Error('Không tìm thấy thông báo.');
    const updated = { ...item, isRead: true };
    announcementStore = announcementStore.map((entry) => entry.id === id ? updated : entry); data = updated;
  }
  else if (/^\/api\/announcements\/[^/]+\/acknowledge$/.test(pathname) && options?.method === 'POST') {
    const id = pathname.split('/')[3]; const item = announcementStore.find((entry) => entry.id === id);
    if (!item) throw new Error('Không tìm thấy thông báo.');
    const updated = { ...item, isRead: true, acknowledged: true };
    announcementStore = announcementStore.map((entry) => entry.id === id ? updated : entry); data = updated;
  }
  else if (pathname === '/api/announcements') data = announcementStore.filter((item) => url.searchParams.get('level') === 'important' ? item.level !== 'normal' : true);
  else if (/^\/api\/announcements\/[^/]+$/.test(pathname)) data = announcementStore.find((item) => item.id === pathname.split('/').pop());
  else if (pathname === '/api/documents/templates') data = documentTemplates;
  else if (pathname === '/api/documents/submissions' && options?.method === 'POST') {
    const body = options.body as { templateId?: string; fields?: Record<string, string> };
    const template = documentTemplates.find((item) => item.id === body.templateId);
    if (!template || !body.fields) throw new Error('Mẫu tài liệu không hợp lệ.');
    const sequence = ++documentSequence;
    const created: DocumentSubmission = {
      id: `document-${sequence}`,
      code: `${template.kind === 'leave_request' ? 'NP' : 'NN'}-2026-${String(sequence).padStart(3, '0')}`,
      templateId: template.id,
      kind: template.kind,
      title: template.name,
      createdBy: demoUser.fullName,
      department: body.fields.department || demoUser.department,
      createdAt: new Date().toISOString(),
      status: 'pending',
      currentStep: 0,
      viewScope: 'sent',
      fields: { ...body.fields },
      steps: template.workflow.map((name, index) => ({ id: `step-${sequence}-${index + 1}`, name, assignee: index === 0 ? 'Nguyễn Hoàng Minh' : 'Chờ phân công', status: index === 0 ? 'pending' : 'waiting' })),
    };
    documentSubmissionStore = [created, ...documentSubmissionStore];
    data = created;
  }
  else if (pathname === '/api/documents/submissions') data = documentSubmissionStore;
  else if (/^\/api\/documents\/submissions\/[^/]+\/actions$/.test(pathname) && options?.method === 'POST') {
    const id = pathname.split('/')[4];
    const body = options.body as { action?: 'approve' | 'reject'; note?: string };
    const item = documentSubmissionStore.find((entry) => entry.id === id);
    if (!item || item.status !== 'pending' || !body.action) throw new Error('Tài liệu không còn ở trạng thái chờ xử lý.');
    const actedAt = new Date().toISOString();
    const steps = item.steps.map((step, index) => index === item.currentStep ? { ...step, status: body.action === 'approve' ? 'approved' as const : 'rejected' as const, actedAt, note: body.note?.trim() || undefined } : { ...step });
    let status: DocumentSubmission['status'] = body.action === 'reject' ? 'rejected' : 'pending';
    let currentStep = item.currentStep;
    if (body.action === 'approve') {
      if (item.currentStep >= steps.length - 1) status = 'approved';
      else {
        currentStep += 1;
        steps[currentStep] = { ...steps[currentStep], status: 'pending', assignee: currentStep === steps.length - 1 ? 'Lê Quốc Hùng' : 'Trần Thu Hà' };
      }
    }
    const updated: DocumentSubmission = { ...item, steps, status, currentStep, viewScope: 'reviewed' };
    documentSubmissionStore = documentSubmissionStore.map((entry) => entry.id === id ? updated : entry);
    data = updated;
  }
  else if (pathname === '/api/requests') data = requestRecords;
  else if (pathname === '/api/cloud') data = cloudRecords;
  else if (pathname === '/api/meetings') data = meetingRecords;
  else if (pathname === '/api/evaluations') data = evaluationRecords;
  else if (pathname === '/api/evaluations/periods') data = evaluationPeriods;
  else if (pathname === '/api/evaluations/summary') {
    const period = evaluationPeriods.find((item) => item.id === (url.searchParams.get('period') ?? '2026-q3')) ?? evaluationPeriods[0];
    const sheets = evaluationSheetStore.filter((item) => item.periodId === period.id);
    data = { period, total: sheets.length, waitingForMe: sheets.filter((item) => item.status === 'waiting').length, inProgress: sheets.filter((item) => item.status === 'draft' || item.status === 'in_review').length, published: sheets.filter((item) => item.status === 'published').length } satisfies EvaluationSummary;
  }
  else if (pathname === '/api/evaluations/sheets') {
    const periodId = url.searchParams.get('period');
    data = evaluationSheetStore.filter((item) => !periodId || item.periodId === periodId);
  }
  else if (/^\/api\/evaluations\/sheets\/[^/]+$/.test(pathname) && options?.method !== 'POST') {
    const sheet = evaluationSheetStore.find((item) => item.id === pathname.split('/')[4]);
    if (!sheet) throw new Error('Không tìm thấy phiếu đánh giá.');
    data = sheet;
  }
  else if (/^\/api\/evaluations\/sheets\/[^/]+$/.test(pathname) && options?.method === 'POST') {
    const id = pathname.split('/')[4];
    const body = options.body as Pick<EvaluationSheet, 'groups'> & { action?: 'save' | 'submit' | 'approve' };
    const sheet = evaluationSheetStore.find((item) => item.id === id);
    if (!sheet) throw new Error('Không tìm thấy phiếu đánh giá.');
    const updated: EvaluationSheet = { ...sheet, groups: body.groups ?? sheet.groups, progress: body.action === 'submit' ? 100 : sheet.progress, status: body.action === 'submit' ? 'waiting' : body.action === 'approve' ? 'completed' : sheet.status, stage: body.action === 'submit' ? 'deputy' : sheet.stage, updatedAt: new Date().toISOString() };
    evaluationSheetStore = evaluationSheetStore.map((item) => item.id === id ? updated : item);
    data = updated;
  }
  else if (pathname === '/api/library') data = libraryRecords;
  else if (pathname === '/api/experts') data = expertRecords;
  else if (/^\/api\/(requests|cloud|meetings|evaluations|library|experts)\/actions$/.test(pathname) && options?.method === 'POST') {
    const body = options.body as { action?: string; values?: Record<string, unknown> };
    if (!body.action) throw new Error('Thao tác không hợp lệ.');
    data = { id: `workspace-action-${++workspaceActionSequence}`, ...body, completedAt: new Date().toISOString() };
  }
  else throw new Error(`Mock API chưa hỗ trợ endpoint: ${pathname}`);

  const normalized = state === 'empty' && Array.isArray(data) ? [] : data;
  return { success: true, message: 'Thành công', data: normalized as T };
}
