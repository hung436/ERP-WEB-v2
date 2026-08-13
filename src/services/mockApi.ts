import { adminUser, announcements, calendarEvents, chatMembers, conversations, demoUser, directoryContacts, mails, messages, tasks } from '@/mocks/fixtures';
import { cloudRecords, evaluationRecords, expertRecords, libraryRecords, meetingRecords, requestRecords } from '@/mocks/extendedFixtures';
import { documentSubmissions, documentTemplates } from '@/mocks/documentFixtures';
import { evaluationPeriods, evaluationSheets } from '@/mocks/evaluationFixtures';
import { initialChangeRequests, initialPersonnelList, initialPositionTitles, initialResignedEmployees, initialSpecialties, initialUnitPositionMappings, initialWorkUnits, personalProfile } from '@/mocks/personnelFixtures';
import type { Announcement, ApiResponse, ApiState, CalendarEvent, ChatAttachment, ChatConversation, ChatMessage, CustomDocumentTemplateItem, DashboardSummary, DirectoryContact, DocumentSubmission, MailComposePayload, MailItem, MailReply, Task, User } from '@/types/domain';
import type { EvaluationSheet, EvaluationSummary } from '@/types/evaluation';
import type { PositionTitleItem, PersonnelChangeRequest, PersonnelRecordItem, PermissionAssignmentItem, PermissionGroupItem, PermissionItem, ResignedEmployeeItem, SpecialtyItem, UnitPositionMapping, WorkUnitItem } from '@/types/personnel';

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

let permissionItemsStore: PermissionItem[] = [
  { id: 'perm-1', name: 'Xem danh sách hồ sơ nhân sự', uri: '/api/personnel/list', method: 'GET', serviceName: 'personnel-service', createdAt: '2026-01-10' },
  { id: 'perm-2', name: 'Tạo mới hồ sơ cán bộ', uri: '/api/personnel/create', method: 'POST', serviceName: 'personnel-service', createdAt: '2026-01-10' },
  { id: 'perm-3', name: 'Cập nhật sơ yếu lý lịch', uri: '/api/personnel/profile', method: 'PUT', serviceName: 'personnel-service', createdAt: '2026-01-10' },
  { id: 'perm-4', name: 'Duyệt yêu cầu thay đổi thông tin', uri: '/api/personnel/change-requests/approve', method: 'POST', serviceName: 'personnel-service', createdAt: '2026-01-10' },
  { id: 'perm-5', name: 'Xem danh sách đặt xe & phòng họp', uri: '/api/booking/list', method: 'GET', serviceName: 'booking-service', createdAt: '2026-01-12' },
  { id: 'perm-6', name: 'Đăng ký đặt xe & phòng họp', uri: '/api/booking/create', method: 'POST', serviceName: 'booking-service', createdAt: '2026-01-12' },
  { id: 'perm-7', name: 'Duyệt đăng ký lịch xe Công đoàn', uri: '/api/booking/approve', method: 'POST', serviceName: 'booking-service', createdAt: '2026-01-12' },
  { id: 'perm-8', name: 'Khởi tạo quy trình phê duyệt', uri: '/api/workflow/start', method: 'POST', serviceName: 'workflow-service', createdAt: '2026-01-15' },
  { id: 'perm-9', name: 'Phê duyệt hồ sơ quy trình', uri: '/api/workflow/approve', method: 'POST', serviceName: 'workflow-service', createdAt: '2026-01-15' },
  { id: 'perm-10', name: 'Xóa tài liệu lưu trữ', uri: '/api/documents/archive', method: 'DELETE', serviceName: 'document-service', createdAt: '2026-01-18' },
];

let permissionGroupsStore: PermissionGroupItem[] = [
  { id: 'group-1', code: '[PROFILE]', name: '[PROFILE] Quyền Nhân sự', description: 'Nhóm quyền quản lý, duyệt và trích xuất sơ yếu lý lịch nhân sự', permissionIds: ['perm-1', 'perm-2', 'perm-3', 'perm-4'], createdAt: '2026-01-10' },
  { id: 'group-2', code: '[BOOKING]', name: '[BOOKING] Quyền Tổ trưởng Công đoàn', description: 'Nhóm quyền duyệt và quản lý lịch họp, đặt xe dành cho Tổ trưởng Công đoàn', permissionIds: ['perm-5', 'perm-6', 'perm-7'], createdAt: '2026-01-12' },
  { id: 'group-3', code: '[WORKFLOW]', name: '[WORKFLOW] Quyền Trưởng ban', description: 'Nhóm quyền khởi tạo và phê duyệt quy trình xử lý công văn, bài viết', permissionIds: ['perm-8', 'perm-9'], createdAt: '2026-01-15' },
  { id: 'group-4', code: '[DOCUMENT]', name: '[DOCUMENT] Quyền Văn thư Toà soạn', description: 'Nhóm quyền tiếp nhận, quản lý và lưu trữ tài liệu công văn', permissionIds: ['perm-5', 'perm-10'], createdAt: '2026-01-18' },
];

let permissionAssignmentsStore: PermissionAssignmentItem[] = [
  { id: 'assign-1', unitId: 'unit-5', unitName: 'Ban Tổ chức - Nhân sự', positionId: 'pos-3', positionName: 'Trưởng ban', specialtyId: 'spec-3', specialtyName: 'Quản trị nhân sự & Đào tạo', groupId: 'group-1', groupName: '[PROFILE] Quyền Nhân sự', createdAt: '2026-01-10' },
  { id: 'assign-2', unitId: 'unit-2', unitName: 'Ban Thư ký toà soạn', positionId: 'pos-3', positionName: 'Trưởng ban', specialtyId: 'spec-1', specialtyName: 'Biên tập & Xuất bản tin bài', groupId: 'group-3', groupName: '[WORKFLOW] Quyền Trưởng ban', createdAt: '2026-01-15' },
  { id: 'assign-3', unitId: 'unit-1', unitName: 'Ban Biên tập', positionId: 'pos-1', positionName: 'Tổng Biên tập', specialtyId: 'spec-1', specialtyName: 'Biên tập & Xuất bản tin bài', groupId: 'group-3', groupName: '[WORKFLOW] Quyền Trưởng ban', createdAt: '2026-01-15' },
  { id: 'assign-4', unitId: 'unit-3', unitName: 'Công đoàn Báo Tuổi Trẻ', positionId: 'pos-4', positionName: 'Chủ tịch Công đoàn', specialtyId: 'spec-2', specialtyName: 'Y tế & An toàn sức khỏe', groupId: 'group-2', groupName: '[BOOKING] Quyền Tổ trưởng Công đoàn', createdAt: '2026-01-12' },
];

let customDocumentTemplatesStore: CustomDocumentTemplateItem[] = [
  {
    id: 'tpl-1',
    category: 'Hành chính - Nhân sự',
    name: 'Đơn xin nghỉ phép',
    fileName: 'don_xin_nghi_phep.html',
    fileContent: `<!DOCTYPE html>
<html>
<head><style>body { font-family: sans-serif; line-height: 1.6; padding: 20px; }</style></head>
<body>
  <h2 style="text-align: center;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
  <h3 style="text-align: center;">Độc lập - Tự do - Hạnh phúc</h3>
  <h1 style="text-align: center; margin-top: 30px;">ĐƠN XIN NGHỈ PHÉP</h1>
  <p><b>Kính gửi:</b> Ban Tổ chức - Nhân sự và Ban Biên tập</p>
  <p>Tôi tên là: ..................................................... Chức danh: .....................................................</p>
  <p>Đơn vị công tác: ......................................................................................................................</p>
  <p>Xin được nghỉ phép từ ngày ...../...../2026 đến hết ngày ...../...../2026.</p>
  <p>Lý do xin nghỉ: ........................................................................................................................</p>
</body>
</html>`,
    steps: [
      { stepIndex: 1, positionName: 'Trưởng ban', departmentName: 'Ban Tổ chức - Nhân sự', roleName: 'Người phê duyệt chính' },
      { stepIndex: 2, positionName: 'Phó Tổng Biên tập', departmentName: 'Ban Biên tập', roleName: 'Người xem xét', actionType: 'process', continueOnReject: false },
      { stepIndex: 3, positionName: 'Chuyên viên Nhân sự', departmentName: 'Ban Tổ chức - Nhân sự', roleName: 'Người theo dõi', actionType: 'notify_only', continueOnReject: true },
    ],
    createdAt: '2026-01-15',
  },
  {
    id: 'tpl-2',
    category: 'Tài chính - Kế toán',
    name: 'Tờ trình phê duyệt kinh phí mua sắm',
    fileName: 'to_trinh_kinh_phi_mua_sam.html',
    fileContent: `<!DOCTYPE html>
<html>
<body>
  <h2 style="text-align: center;">TỜ TRÌNH PHÊ DUYỆT KINH PHÍ MUA SẮM THIẾT BỊ</h2>
  <p><b>Kính gửi:</b> Ban Tài chính - Kế toán và Ban Biên tập</p>
  <p>Căn cứ nhu cầu mua sắm thiết bị công nghệ chuyên môn năm 2026...</p>
</body>
</html>`,
    steps: [
      { stepIndex: 1, positionName: 'Trưởng ban', departmentName: 'Ban Công nghệ thông tin', roleName: 'Người đề xuất' },
      { stepIndex: 2, positionName: 'Kế toán trưởng', departmentName: 'Ban Tài chính - Kế toán', roleName: 'Người thẩm định', actionType: 'process', continueOnReject: false },
      { stepIndex: 3, positionName: 'Tổng Biên tập', departmentName: 'Ban Biên tập', roleName: 'Người phê duyệt cuối', actionType: 'process', continueOnReject: false },
    ],
    createdAt: '2026-01-18',
  },
  {
    id: 'tpl-3',
    category: 'Hành chính - Nhân sự',
    name: 'Phiếu đăng ký xe công tác',
    fileName: 'phieu_dang_ky_xe_cong_tac.html',
    fileContent: `<!DOCTYPE html><html><body><h2>PHIẾU ĐĂNG KÝ SỬ DỤNG XE Ô TÔ CÔNG TÁC</h2></body></html>`,
    steps: [
      { stepIndex: 1, positionName: 'Trưởng ban', departmentName: 'Ban Thư ký toà soạn', roleName: 'Người phê duyệt ban' },
      { stepIndex: 2, positionName: 'Chủ tịch Công đoàn', departmentName: 'Công đoàn Báo Tuổi Trẻ', roleName: 'Người điều xe', actionType: 'process', continueOnReject: false },
    ],
    createdAt: '2026-01-20',
  },
];


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
  else if (pathname === '/api/personnel/extraction' && options?.method === 'POST') {
    const filters = (options.body ?? {}) as Record<string, any>;
    const fullName = normalizeSearch(filters.fullName?.trim() ?? '');
    const penName = normalizeSearch(filters.penName?.trim() ?? '');
    const department = filters.department ?? '';
    const position = filters.position ?? '';
    const gender = filters.gender ?? '';
    const currentAddress = normalizeSearch(filters.currentAddress?.trim() ?? '');
    const permanentAddress = normalizeSearch(filters.permanentAddress?.trim() ?? '');
    const employmentType = filters.employmentType ?? '';
    const hometown = normalizeSearch(filters.hometown?.trim() ?? '');
    const birthPlace = normalizeSearch(filters.birthPlace?.trim() ?? '');
    const ethnicity = normalizeSearch(filters.ethnicity?.trim() ?? '');
    const religion = normalizeSearch(filters.religion?.trim() ?? '');
    const recruitmentDate = filters.recruitmentDate ?? '';
    const isPartyMember = filters.isPartyMember ?? '';
    const isYouthUnionMember = filters.isYouthUnionMember ?? '';

    data = personnelRecordStore.filter((item) => {
      const matchName = !fullName || normalizeSearch(item.fullName).includes(fullName);
      const matchPenName = !penName || normalizeSearch(item.penName ?? '').includes(penName);
      const matchDept = !department || item.department === department || item.assignments?.some((a) => a.department === department);
      const matchPos = !position || item.position === position || item.assignments?.some((a) => a.position === position);
      const matchGender = !gender || (item.gender || 'Nam') === gender;
      const matchCurrentAddress = !currentAddress || normalizeSearch(item.notes ?? '123 Tuổi Trẻ, P.8, Q. Phú Nhuận, TP.HCM').includes(currentAddress);
      const matchPermanentAddress = !permanentAddress || normalizeSearch(item.notes ?? '123 Tuổi Trẻ, P.8, Q. Phú Nhuận, TP.HCM').includes(permanentAddress);
      const matchEmpType = !employmentType || item.employmentType === employmentType;
      const matchHometown = !hometown || normalizeSearch('TP. Hồ Chí Minh').includes(hometown);
      const matchBirthPlace = !birthPlace || normalizeSearch('TP. Hồ Chí Minh').includes(birthPlace);
      const matchEthnicity = !ethnicity || normalizeSearch('Kinh').includes(ethnicity);
      const matchReligion = !religion || normalizeSearch('Không').includes(religion);
      const matchRecruitment = !recruitmentDate || item.createdAt.includes(recruitmentDate);
      const matchParty = !isPartyMember || (isPartyMember === 'yes' ? item.isPartyMember : !item.isPartyMember);
      const matchYouth = !isYouthUnionMember || (isYouthUnionMember === 'yes' ? item.isYouthUnionMember : !item.isYouthUnionMember);

      return (
        matchName &&
        matchPenName &&
        matchDept &&
        matchPos &&
        matchGender &&
        matchCurrentAddress &&
        matchPermanentAddress &&
        matchEmpType &&
        matchHometown &&
        matchBirthPlace &&
        matchEthnicity &&
        matchReligion &&
        matchRecruitment &&
        matchParty &&
        matchYouth
      );
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
  else if (pathname === '/api/personnel/permissions/items') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<PermissionItem>;
      if (body.id) {
        const index = permissionItemsStore.findIndex((p) => p.id === body.id);
        if (index !== -1) {
          permissionItemsStore[index] = { ...permissionItemsStore[index], ...body } as PermissionItem;
          data = { success: true, message: 'Đã cập nhật quyền thành công.' };
        } else throw new Error('Không tìm thấy quyền.');
      } else {
        const newItem: PermissionItem = {
          id: `perm-${Date.now()}`,
          name: body.name || 'Quyền mới',
          uri: body.uri || '/api/new-permission',
          method: body.method || 'GET',
          serviceName: body.serviceName || 'personnel-service',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        permissionItemsStore = [newItem, ...permissionItemsStore];
        data = { success: true, message: 'Đã thêm quyền mới thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      data = permissionItemsStore.filter((p) => !search || normalizeSearch(`${p.name} ${p.uri} ${p.serviceName}`).includes(search));
    }
  }
  else if (pathname.startsWith('/api/personnel/permissions/items/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/permissions/items/', '');
    permissionItemsStore = permissionItemsStore.filter((p) => p.id !== id);
    data = { success: true, message: 'Đã xóa quyền.' };
  }
  else if (pathname === '/api/personnel/permissions/groups') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<PermissionGroupItem>;
      if (body.id) {
        const index = permissionGroupsStore.findIndex((g) => g.id === body.id);
        if (index !== -1) {
          permissionGroupsStore[index] = { ...permissionGroupsStore[index], ...body } as PermissionGroupItem;
          data = { success: true, message: 'Đã cập nhật nhóm quyền thành công.' };
        } else throw new Error('Không tìm thấy nhóm quyền.');
      } else {
        const newGroup: PermissionGroupItem = {
          id: `group-${Date.now()}`,
          code: body.code || '[GROUP]',
          name: body.name || '[NEW] Nhóm quyền mới',
          description: body.description || '',
          permissionIds: body.permissionIds || [],
          createdAt: new Date().toISOString().slice(0, 10),
        };
        permissionGroupsStore = [newGroup, ...permissionGroupsStore];
        data = { success: true, message: 'Đã thêm nhóm quyền mới thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      data = permissionGroupsStore.filter((g) => !search || normalizeSearch(`${g.name} ${g.code} ${g.description ?? ''}`).includes(search));
    }
  }
  else if (pathname.startsWith('/api/personnel/permissions/groups/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/permissions/groups/', '');
    permissionGroupsStore = permissionGroupsStore.filter((g) => g.id !== id);
    data = { success: true, message: 'Đã xóa nhóm quyền.' };
  }
  else if (pathname === '/api/personnel/permissions/assignments') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<PermissionAssignmentItem>;
      const unit = workUnitsStore.find((u) => u.id === body.unitId);
      const pos = positionTitlesStore.find((p) => p.id === body.positionId);
      const spec = specialtiesStore.find((s) => s.id === body.specialtyId);
      const group = permissionGroupsStore.find((g) => g.id === body.groupId);

      if (body.id) {
        const index = permissionAssignmentsStore.findIndex((a) => a.id === body.id);
        if (index !== -1) {
          permissionAssignmentsStore[index] = {
            ...permissionAssignmentsStore[index],
            unitId: body.unitId || permissionAssignmentsStore[index].unitId,
            unitName: unit ? unit.name : body.unitName || permissionAssignmentsStore[index].unitName,
            positionId: body.positionId || permissionAssignmentsStore[index].positionId,
            positionName: pos ? pos.name : body.positionName || permissionAssignmentsStore[index].positionName,
            specialtyId: body.specialtyId,
            specialtyName: spec ? spec.name : body.specialtyName || 'Tất cả chuyên môn',
            groupId: body.groupId || permissionAssignmentsStore[index].groupId,
            groupName: group ? group.name : body.groupName || permissionAssignmentsStore[index].groupName,
          };
          data = { success: true, message: 'Đã cập nhật phân quyền thành công.' };
        } else throw new Error('Không tìm thấy phân quyền.');
      } else {
        const newAssign: PermissionAssignmentItem = {
          id: `assign-${Date.now()}`,
          unitId: body.unitId || 'unit-1',
          unitName: unit ? unit.name : body.unitName || 'Ban Biên tập',
          positionId: body.positionId || 'pos-3',
          positionName: pos ? pos.name : body.positionName || 'Trưởng ban',
          specialtyId: body.specialtyId,
          specialtyName: spec ? spec.name : body.specialtyName || 'Tất cả chuyên môn',
          groupId: body.groupId || 'group-1',
          groupName: group ? group.name : body.groupName || '[PROFILE] Quyền Nhân sự',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        permissionAssignmentsStore = [newAssign, ...permissionAssignmentsStore];
        data = { success: true, message: 'Đã thêm phân quyền thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      data = permissionAssignmentsStore.filter((a) => !search || normalizeSearch(`${a.unitName} ${a.positionName} ${a.specialtyName ?? ''} ${a.groupName}`).includes(search));
    }
  }
  else if (pathname.startsWith('/api/personnel/permissions/assignments/') && options?.method === 'DELETE') {
    const id = pathname.replace('/api/personnel/permissions/assignments/', '');
    permissionAssignmentsStore = permissionAssignmentsStore.filter((a) => a.id !== id);
    data = { success: true, message: 'Đã xóa phân quyền.' };
  }
  else if (pathname === '/api/documents/custom-templates') {
    if (options?.method === 'POST') {
      const body = options.body as Partial<CustomDocumentTemplateItem>;
      if (body.id) {
        const index = customDocumentTemplatesStore.findIndex((t) => t.id === body.id);
        if (index !== -1) {
          customDocumentTemplatesStore[index] = { ...customDocumentTemplatesStore[index], ...body } as CustomDocumentTemplateItem;
          data = { success: true, message: 'Đã cập nhật tài liệu mẫu thành công.' };
        } else throw new Error('Không tìm thấy tài liệu mẫu.');
      } else {
        const newTpl: CustomDocumentTemplateItem = {
          id: `tpl-${Date.now()}`,
          category: body.category || 'Hành chính - Nhân sự',
          name: body.name || 'Tài liệu mẫu mới',
          fileName: body.fileName || 'tai_lieu_mau.html',
          fileContent: body.fileContent || '<html><body><p>Nội dung tài liệu mẫu</p></body></html>',
          steps: body.steps || [],
          createdAt: new Date().toISOString().slice(0, 10),
        };
        customDocumentTemplatesStore = [newTpl, ...customDocumentTemplatesStore];
        data = { success: true, message: 'Đã tạo tài liệu mẫu mới thành công.' };
      }
    } else {
      const search = normalizeSearch(url.searchParams.get('search')?.trim() ?? '');
      data = customDocumentTemplatesStore.filter((t) => !search || normalizeSearch(`${t.name} ${t.category} ${t.fileName}`).includes(search));
    }
  }
  else if (pathname.startsWith('/api/documents/custom-templates/')) {
    const id = pathname.replace('/api/documents/custom-templates/', '');
    if (options?.method === 'DELETE') {
      customDocumentTemplatesStore = customDocumentTemplatesStore.filter((t) => t.id !== id);
      data = { success: true, message: 'Đã xóa tài liệu mẫu.' };
    } else {
      const found = customDocumentTemplatesStore.find((t) => t.id === id);
      if (found) data = found;
      else throw new Error('Không tìm thấy tài liệu mẫu.');
    }
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
