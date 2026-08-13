import { adminUser, announcements, calendarEvents, chatMembers, conversations, demoUser, directoryContacts, mails, messages, tasks } from '@/mocks/fixtures';
import { cloudRecords, evaluationRecords, expertRecords, libraryRecords, meetingRecords, requestRecords } from '@/mocks/extendedFixtures';
import { documentSubmissions, documentTemplates } from '@/mocks/documentFixtures';
import { evaluationPeriods, evaluationSheets } from '@/mocks/evaluationFixtures';
import { initialChangeRequests, initialPersonnelList, initialPositionTitles, initialResignedEmployees, initialSpecialties, initialUnitPositionMappings, initialWorkUnits, personalProfile } from '@/mocks/personnelFixtures';
import type { Announcement, ApiResponse, ApiState, CalendarEvent, ChatAttachment, ChatConversation, ChatMessage, DashboardSummary, DirectoryContact, DocumentSubmission, MailComposePayload, MailItem, MailReply, Task, User } from '@/types/domain';
import type { EvaluationSheet, EvaluationSummary } from '@/types/evaluation';
import type { PositionTitleItem, PersonnelChangeRequest, PersonnelRecordItem, ResignedEmployeeItem, SpecialtyItem, UnitPositionMapping, WorkUnitItem } from '@/types/personnel';

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
let personnelRecordStore: PersonnelRecordItem[] = [...initialPersonnelList];
let changeRequestsStore: PersonnelChangeRequest[] = [...initialChangeRequests];
let workUnitsStore: WorkUnitItem[] = [...initialWorkUnits];
let positionTitlesStore: PositionTitleItem[] = [...initialPositionTitles];
let specialtiesStore: SpecialtyItem[] = [...initialSpecialties];
let unitPositionMappingsStore: UnitPositionMapping[] = [...initialUnitPositionMappings];
let resignedEmployeesStore: ResignedEmployeeItem[] = [...initialResignedEmployees];


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
    title: document.title,
    description: fields.reason,
    status: document.status === 'pending' ? 'todo' : 'completed',
    priority: 'medium',
    dueAt,
    receivedAt: document.createdAt,
    assignedBy: document.createdBy,
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

function evaluationToTask(sheet: EvaluationSheet): Task {
  const isSelf = sheet.stage === 'self';
  const stageName =
    sheet.stage === 'self'
      ? 'Tự đánh giá'
      : sheet.stage === 'deputy'
      ? 'Phó Ban đánh giá'
      : sheet.stage === 'manager'
      ? 'Trưởng ban đánh giá'
      : 'Hội đồng xét duyệt';

  return {
    id: `task-${sheet.id}`,
    title: isSelf
      ? `Phiếu tự đánh giá lao động & KPI ${sheet.periodLabel}`
      : `Xét duyệt đánh giá lao động & KPI ${sheet.periodLabel} · ${sheet.employeeName}`,
    description: `Thực hiện ${stageName} cho ${sheet.employeeName} (${sheet.department})`,
    status: sheet.status === 'published' ? 'completed' : 'todo',
    priority: 'medium',
    dueAt: sheet.dueAt,
    receivedAt: sheet.updatedAt,
    assignedBy: isSelf ? sheet.employeeName : (sheet.stageEvaluators?.[sheet.stage] || 'Hội đồng đánh giá'),
    department: sheet.department,
    progress: sheet.progress,
    sourceModule: 'evaluations',
    workflowKind: isSelf ? 'self_evaluation' : 'subordinate_evaluation',
    subjectName: sheet.employeeName,
    period: sheet.periodLabel,
    workflowStep: stageName,
  };
}

const currentTaskStore = () => [
  ...documentSubmissionStore.filter((item) => item.viewScope === 'pending_review' && item.status === 'pending').map(documentToTask),
  ...evaluationSheetStore.filter((sheet) => sheet.status !== 'published').map(evaluationToTask),
  ...tasks.filter((item) => item.sourceModule !== 'documents' && item.sourceModule !== 'evaluations').map((item) => ({ ...item, receivedAt: item.receivedAt ?? new Date(new Date(item.dueAt).getTime() - 2 * 86_400_000).toISOString() })),
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
    const activeTasks = taskStore.filter((item) => item.status !== 'completed');
    data = {
      taskSummary: {
        total: activeTasks.length,
        dueSoon: activeTasks.slice(0, 4).length,
        overdue: taskStore.filter((item) => item.status === 'overdue').length,
        completed: taskStore.filter((item) => item.status === 'completed').length,
      },
      unreadMailCount: mailStore.filter((item) => (item.folder ?? 'inbox') === 'inbox' && !item.isRead).length,
      unreadChatCount: chatConversationStore.reduce((sum, item) => sum + item.unreadCount, 0),
    } satisfies DashboardSummary;
  } else if (pathname === '/api/dashboard/tasks') data = currentTaskStore().filter((item) => item.status !== 'completed');
  else if (pathname === '/api/dashboard/today-events') {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
    data = calendarEventStore.filter((item) => item.startAt.startsWith(today)).slice(0, 4);
  }
  else if (pathname === '/api/dashboard/mail-summary') data = mailStore.filter((item) => (item.folder ?? 'inbox') === 'inbox' && !item.isRead).slice(0, 3);
  else if (pathname === '/api/dashboard/chat-summary') data = chatConversationStore.filter((item) => item.unreadCount > 0).slice(0, 3);
  else if (pathname === '/api/dashboard/announcements') data = announcementStore;
  else if (pathname === '/api/tasks') {
    const statusParam = url.searchParams.get('status');
    const priorityParam = url.searchParams.get('priority');
    data = currentTaskStore().filter((item) => {
      if (statusParam === 'dueSoon') return item.status !== 'completed';
      return (!statusParam || item.status === statusParam) && (!priorityParam || item.priority === priorityParam);
    });
  } else if (pathname === '/api/calendar/events') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<CalendarEvent>;
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: body.title ?? 'Cuộc họp mới',
        startAt: body.startAt ?? new Date().toISOString(),
        endAt: body.endAt ?? new Date(Date.now() + 3600000).toISOString(),
        location: body.location ?? 'meeting.tuoitre.vn',
        meetingUrl: body.meetingUrl ?? 'https://meeting.tuoitre.vn/truc-tuyen',
        type: body.type ?? 'meeting',
        organizer: activeUser.fullName,
        responseStatus: 'accepted',
        meetingId: `TT-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
        platform: body.platform ?? 'meeting.tuoitre.vn',
        agenda: body.agenda ?? 'Trao đổi nội dung công việc',
        participants: body.participants?.length ? body.participants : [activeUser.fullName],
      };
      calendarEventStore = [newEvent, ...calendarEventStore];
      data = newEvent;
    } else {
      data = calendarEventStore.filter((item) => !url.searchParams.get('type') || item.type === url.searchParams.get('type'));
    }
  }
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
  else if (pathname === '/api/personnel/list') {
    const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
    const department = url.searchParams.get('department') ?? '';
    const position = url.searchParams.get('position') ?? '';
    const profileType = url.searchParams.get('profileType') ?? '';

    data = personnelRecordStore.filter((item) => {
      const nameSearchable = normalizeSearch(`${item.fullName} ${item.penName ?? ''}`);
      const matchSearch = !search || nameSearchable.includes(search);
      const matchDept = !department || item.department === department || item.assignments?.some((a) => a.department === department);
      const matchPos = !position || item.position === position || item.assignments?.some((a) => a.position === position);
      const matchType = !profileType || (item.profileType || '2A') === profileType;
      return matchSearch && matchDept && matchPos && matchType;
    });
  }
  else if (pathname === '/api/personnel/create' && options?.method === 'POST') {
    const body = options.body as any;
    if (!body?.fullName?.trim() || !body?.employmentType?.trim() || !body?.phone?.trim() || !body?.department?.trim() || !body?.position?.trim() || !body?.email?.trim()) {
      throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
    }
    const code = `NV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: PersonnelRecordItem = {
      id: `pers-${Date.now()}`,
      employeeCode: code,
      fullName: body.fullName,
      penName: body.penName,
      photoUrl: body.photoUrl,
      birthDate: body.birthDate,
      gender: body.gender,
      phone: body.phone,
      extension: body.extension,
      email: body.email,
      secondaryEmail: body.secondaryEmail,
      employmentType: body.employmentType,
      department: body.department,
      position: body.position,
      specialty: body.specialty,
      assignments: body.assignments || [{ department: body.department, position: body.position, specialty: body.specialty, isPrimary: true }],
      participateEvaluation: Boolean(body.participateEvaluation),
      isYouthUnionMember: Boolean(body.isYouthUnionMember),
      isPartyMember: Boolean(body.isPartyMember),
      leaveEffectiveDate: body.leaveEffectiveDate,
      identityNumber: body.identityNumber,
      identityIssuedDate: body.identityIssuedDate,
      identityIssuedPlace: body.identityIssuedPlace,
      notes: body.notes,
      status: body.action === 'complete' ? 'complete' : 'submitted',
      createdAt: new Date().toISOString(),
    };
    personnelRecordStore = [newRecord, ...personnelRecordStore];

    data = {
      id: newRecord.id,
      code,
      message: body.action === 'complete' ? `Hồ sơ nhân sự ${body.fullName} (${code}) đã được hoàn tất thành công.` : `Hồ sơ nhân sự ${body.fullName} (${code}) đã được gửi thành công.`,
    };
  }
  else if (pathname.startsWith('/api/personnel/') && options?.method === 'PUT') {
    const id = pathname.replace('/api/personnel/', '');
    const body = options.body as any;
    const index = personnelRecordStore.findIndex((item) => item.id === id);
    if (index !== -1) {
      personnelRecordStore[index] = {
        ...personnelRecordStore[index],
        ...body,
        department: body.department || personnelRecordStore[index].department,
        position: body.position || personnelRecordStore[index].position,
        assignments: body.assignments || personnelRecordStore[index].assignments,
      };
      data = { success: true, message: `Hồ sơ nhân sự ${personnelRecordStore[index].fullName} (${personnelRecordStore[index].employeeCode}) đã được cập nhật thành công.` };
    } else {
      throw new Error('Không tìm thấy hồ sơ nhân sự.');
    }
  }
  else if (pathname === '/api/personnel/change-requests') {
    if (options?.method === 'POST') {
      const body = options.body as any;
      const code = `YC-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newReq: PersonnelChangeRequest = {
        id: `req-${Date.now()}`,
        code,
        personnelId: body.personnelId || 'pers-101',
        employeeCode: body.employeeCode || 'NV-2026-101',
        fullName: body.fullName || 'Nguyễn Minh Anh',
        department: body.department || 'Ban Biên tập',
        profileType: body.profileType || '2A',
        fields: body.fields || [],
        reason: body.reason,
        attachmentName: body.attachmentName || 'Minh_Chung_Thay_Doi.pdf',
        requestedBy: body.requestedBy || body.fullName || 'Nguyễn Minh Anh',
        requestedAt: new Date().toISOString(),
        status: 'new',
        snapshotPdfName: `Ly_Lich_${body.profileType || '2A'}_${body.employeeCode || 'NV2026101'}_${Date.now()}.pdf`,
      };
      changeRequestsStore = [newReq, ...changeRequestsStore];
      data = { id: newReq.id, code, message: `Đã gửi yêu cầu thay đổi / bổ sung thông tin (${code}) thành công.` };
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      const status = url.searchParams.get('status') ?? '';
      const profileType = url.searchParams.get('profileType') ?? '';

      data = changeRequestsStore.filter((item) => {
        const searchable = normalizeSearch(`${item.code} ${item.fullName} ${item.employeeCode} ${item.department} ${item.requestedBy}`);
        const matchSearch = !search || searchable.includes(search);
        const matchStatus = !status || item.status === status;
        const matchType = !profileType || item.profileType === profileType;
        return matchSearch && matchStatus && matchType;
      });
    }
  }
  else if (pathname.includes('/api/personnel/change-requests/') && pathname.endsWith('/approve') && options?.method === 'POST') {
    const id = pathname.split('/')[4];
    const body = options.body as any;
    const req = changeRequestsStore.find((item) => item.id === id);
    if (req) {
      req.status = 'approved';
      req.reviewedBy = 'Ban Tổ chức - Nhân sự';
      req.reviewedAt = new Date().toISOString();
      req.reviewComment = body?.comment || 'Đã chấp nhận các nội dung thay đổi / bổ sung.';
      data = { success: true, message: `Đã phê duyệt yêu cầu thay đổi ${req.code} thành công.` };
    } else {
      throw new Error('Không tìm thấy yêu cầu.');
    }
  }
  else if (pathname.includes('/api/personnel/change-requests/') && pathname.endsWith('/reject') && options?.method === 'POST') {
    const id = pathname.split('/')[4];
    const body = options.body as any;
    const req = changeRequestsStore.find((item) => item.id === id);
    if (req) {
      req.status = 'returned';
      req.reviewedBy = 'Ban Tổ chức - Nhân sự';
      req.reviewedAt = new Date().toISOString();
      req.reviewComment = body?.comment || 'Yêu cầu bị trả về. Vui lòng kiểm tra lại thông tin hoặc minh chứng.';
      data = { success: true, message: `Đã trả về yêu cầu ${req.code}.` };
    } else {
      throw new Error('Không tìm thấy yêu cầu.');
    }
  }
  else if (pathname === '/api/personnel/management/units') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<WorkUnitItem>;
      if (body.id) {
        const index = workUnitsStore.findIndex((u) => u.id === body.id);
        if (index !== -1) {
          workUnitsStore[index] = { ...workUnitsStore[index], ...body } as WorkUnitItem;
          data = { success: true, message: 'Đã cập nhật Đơn vị công tác thành công.' };
        } else throw new Error('Không tìm thấy đơn vị.');
      } else {
        const newUnit: WorkUnitItem = {
          id: `unit-${Date.now()}`,
          name: body.name || 'Đơn vị mới',
          address: body.address || '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM',
          phone: body.phone || '028 3997 3800',
          type: body.type || 'Chính quyền',
          personnelCount: body.personnelCount || 0,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        workUnitsStore = [newUnit, ...workUnitsStore];
        data = { success: true, message: 'Đã thêm Đơn vị công tác mới thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      const type = url.searchParams.get('type') ?? '';
      data = workUnitsStore
        .map((u) => {
          const count = personnelRecordStore.filter((r) => r.department === u.name || r.assignments?.some((a) => a.department === u.name)).length;
          return { ...u, personnelCount: count || u.personnelCount };
        })
        .filter((u) => {
          const matchSearch = !search || normalizeSearch(`${u.name} ${u.address} ${u.phone}`).includes(search);
          const matchType = !type || u.type === type;
          return matchSearch && matchType;
        });
    }
  }
  else if (pathname.startsWith('/api/personnel/management/units/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/management/units/', '');
    workUnitsStore = workUnitsStore.filter((u) => u.id !== id);
    data = { success: true, message: 'Đã xóa Đơn vị công tác.' };
  }
  else if (pathname === '/api/personnel/management/positions') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<PositionTitleItem>;
      if (body.id) {
        const index = positionTitlesStore.findIndex((p) => p.id === body.id);
        if (index !== -1) {
          positionTitlesStore[index] = { ...positionTitlesStore[index], ...body } as PositionTitleItem;
          data = { success: true, message: 'Đã cập nhật Chức danh thành công.' };
        } else throw new Error('Không tìm thấy chức danh.');
      } else {
        const newPos: PositionTitleItem = {
          id: `pos-${Date.now()}`,
          name: body.name || 'Chức danh mới',
          unitType: body.unitType || 'Chính quyền',
          personnelCount: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        positionTitlesStore = [newPos, ...positionTitlesStore];
        data = { success: true, message: 'Đã thêm Chức danh mới thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      const unitType = url.searchParams.get('unitType') ?? '';
      data = positionTitlesStore
        .map((p) => {
          const count = personnelRecordStore.filter((r) => r.position === p.name || r.assignments?.some((a) => a.position === p.name)).length;
          return { ...p, personnelCount: count || p.personnelCount };
        })
        .filter((p) => {
          const matchSearch = !search || normalizeSearch(p.name).includes(search);
          const matchType = !unitType || p.unitType === unitType || p.unitType === 'Tất cả';
          return matchSearch && matchType;
        });
    }
  }
  else if (pathname.startsWith('/api/personnel/management/positions/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/management/positions/', '');
    positionTitlesStore = positionTitlesStore.filter((p) => p.id !== id);
    data = { success: true, message: 'Đã xóa Chức danh.' };
  }
  else if (pathname === '/api/personnel/management/specialties') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<SpecialtyItem>;
      if (body.id) {
        const index = specialtiesStore.findIndex((s) => s.id === body.id);
        if (index !== -1) {
          specialtiesStore[index] = { ...specialtiesStore[index], ...body } as SpecialtyItem;
          data = { success: true, message: 'Đã cập nhật Chuyên môn thành công.' };
        } else throw new Error('Không tìm thấy chuyên môn.');
      } else {
        const newSpec: SpecialtyItem = {
          id: `spec-${Date.now()}`,
          name: body.name || 'Chuyên môn mới',
          description: body.description || '',
          personnelCount: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        specialtiesStore = [newSpec, ...specialtiesStore];
        data = { success: true, message: 'Đã thêm Chuyên môn mới thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      data = specialtiesStore
        .map((s) => {
          const count = personnelRecordStore.filter((r) => r.specialty === s.name || r.notes?.includes(s.name) || r.assignments?.some((a) => a.specialty === s.name)).length;
          return { ...s, personnelCount: count || s.personnelCount };
        })
        .filter((s) => !search || normalizeSearch(`${s.name} ${s.description}`).includes(search));
    }
  }
  else if (pathname.startsWith('/api/personnel/management/specialties/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/management/specialties/', '');
    specialtiesStore = specialtiesStore.filter((s) => s.id !== id);
    data = { success: true, message: 'Đã xóa Chuyên môn.' };
  }
  else if (pathname === '/api/personnel/management/mappings') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<UnitPositionMapping>;
      const unit = workUnitsStore.find((u) => u.id === body.unitId);
      const pos = positionTitlesStore.find((p) => p.id === body.positionId);
      if (body.id) {
        const index = unitPositionMappingsStore.findIndex((m) => m.id === body.id);
        if (index !== -1) {
          unitPositionMappingsStore[index] = {
            ...unitPositionMappingsStore[index],
            unitId: body.unitId || unitPositionMappingsStore[index].unitId,
            unitName: unit ? unit.name : body.unitName || unitPositionMappingsStore[index].unitName,
            positionId: body.positionId || unitPositionMappingsStore[index].positionId,
            positionName: pos ? pos.name : body.positionName || unitPositionMappingsStore[index].positionName,
          };
          data = { success: true, message: 'Đã cập nhật liên kết Đơn vị - Chức danh thành công.' };
        } else throw new Error('Không tìm thấy liên kết.');
      } else {
        const newMap: UnitPositionMapping = {
          id: `map-${Date.now()}`,
          unitId: body.unitId || 'unit-1',
          unitName: unit ? unit.name : body.unitName || 'Ban Biên tập',
          positionId: body.positionId || 'pos-3',
          positionName: pos ? pos.name : body.positionName || 'Trưởng ban',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        unitPositionMappingsStore = [newMap, ...unitPositionMappingsStore];
        data = { success: true, message: 'Đã thêm liên kết Đơn vị - Chức danh thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      const unitId = url.searchParams.get('unitId') ?? '';
      data = unitPositionMappingsStore.filter((m) => {
        const matchSearch = !search || normalizeSearch(`${m.unitName} ${m.positionName}`).includes(search);
        const matchUnit = !unitId || m.unitId === unitId;
        return matchSearch && matchUnit;
      });
    }
  }
  else if (pathname.startsWith('/api/personnel/management/mappings/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/management/mappings/', '');
    unitPositionMappingsStore = unitPositionMappingsStore.filter((m) => m.id !== id);
    data = { success: true, message: 'Đã xóa liên kết Đơn vị - Chức danh.' };
  }
  else if (pathname === '/api/personnel/management/resigned') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<ResignedEmployeeItem>;
      if (body.id) {
        const index = resignedEmployeesStore.findIndex((r) => r.id === body.id);
        if (index !== -1) {
          resignedEmployeesStore[index] = {
            ...resignedEmployeesStore[index],
            ...body,
          } as ResignedEmployeeItem;
          data = { success: true, message: 'Đã cập nhật thông tin nhân viên nghỉ việc thành công.' };
        } else throw new Error('Không tìm thấy bản ghi nghỉ việc.');
      } else {
        const newResigned: ResignedEmployeeItem = {
          id: `res-${Date.now()}`,
          employeeCode: body.employeeCode || `NV-${Date.now().toString().slice(-4)}`,
          fullName: body.fullName || 'Nhân viên mới',
          department: body.department || 'Ban Biên tập',
          reason: body.reason || 'Nghỉ việc theo nguyện vọng',
          resignationDate: body.resignationDate || new Date().toISOString().slice(0, 10),
          attachmentName: body.attachmentName || 'Quyet_Dinh_Nghi_Viec.pdf',
        };
        resignedEmployeesStore = [newResigned, ...resignedEmployeesStore];
        data = { success: true, message: 'Đã ghi nhận nhân viên nghỉ việc thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      data = resignedEmployeesStore.filter((r) => !search || normalizeSearch(`${r.fullName} ${r.employeeCode} ${r.department} ${r.reason}`).includes(search));
    }
  }
  else if (pathname.startsWith('/api/personnel/management/resigned/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/management/resigned/', '');
    resignedEmployeesStore = resignedEmployeesStore.filter((r) => r.id !== id);
    data = { success: true, message: 'Đã xóa ghi nhận nghỉ việc.' };
  }
  else if (pathname.startsWith('/api/personnel/')) {

    const id = pathname.replace('/api/personnel/', '');
    const record = personnelRecordStore.find((item) => item.id === id);
    if (record) {
      data = record;
    } else {
      throw new Error('Không tìm thấy hồ sơ nhân sự.');
    }
  }
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
    const selectedIds = new Set(body.memberIds ?? []);
    const dirMembers = directoryContacts.filter((contact) => selectedIds.has(contact.id)).map((c) => ({ id: c.id, name: c.fullName, email: c.email, department: c.department, online: true }));
    const chatM = chatMembers.filter((m) => selectedIds.has(m.id));
    const members = [chatMembers[0], ...dirMembers, ...chatM.filter((m) => m.id !== 'user-001')];
    const created: ChatConversation = { id: `chat-${++chatSequence}`, participantName: body.name.trim(), lastMessage: 'Nhóm vừa được tạo', lastMessageAt: new Date().toISOString(), unreadCount: 0, online: true, isGroup: true, members };
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
