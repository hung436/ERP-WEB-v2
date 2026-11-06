import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { CalendarEvent } from '@/types/domain';
import { getDayDutyInfo } from './dutySchedule';

dayjs.extend(isoWeek);

export const vietnamNow = (): Dayjs => dayjs();

export const TICKET_TYPES = {
  MEETING: {
    value: 'MEETING',
    label: 'Lịch họp',
    fullLabel: 'Lịch họp',
    tone: 'meeting',
    color: 'red',
    textColor: '#C8161D',
    bgColor: '#FFEEEE',
    baseColor: '#EC1C24',
  },
  TASK: {
    value: 'TASK',
    label: 'Phiếu công việc',
    fullLabel: 'Phiếu công việc',
    tone: 'task',
    color: 'blue',
    textColor: '#1D4ED8',
    bgColor: '#E9F0FE',
    baseColor: '#2563EB',
  },
  EVENT: {
    value: 'EVENT',
    label: 'Sự kiện',
    fullLabel: 'Sự kiện',
    tone: 'event',
    color: 'green',
    textColor: '#0F766E',
    bgColor: '#E6F7F5',
    baseColor: '#0D9488',
  },
} as const;

export type TicketTypeKey = keyof typeof TICKET_TYPES;

export function getCalendarStatusDotTone(status?: string, scope?: CalendarEvent['scope']) {
  if (scope !== 'personal') return null;
  const key = String(status || '').toUpperCase();
  switch (key) {
    case 'APPROVED':
      return 'approved';
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'WAITING':
    case 'CONSULTING':
    case 'CONSULT':
      return 'pending';
    case 'REJECTED':
    case 'NOT_APPROVED':
      return 'rejected';
    case 'IN_PROGRESS':
    case 'DEPLOYING':
      return 'in_progress';
    case 'COMPLETED':
    case 'DONE':
      return 'completed';
    default:
      return null;
  }
}

export const APPROVAL_STATUS_META = {
  PENDING: { value: 'PENDING', label: 'Chờ duyệt', color: 'gold', tone: 'pending' },
  APPROVED: { value: 'APPROVED', label: 'Đã duyệt', color: 'success', tone: 'approved' },
  REJECTED: { value: 'REJECTED', label: 'Không duyệt', color: 'error', tone: 'rejected' },
  IN_PROGRESS: { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: 'processing', tone: 'in_progress' },
  COMPLETED: { value: 'COMPLETED', label: 'Hoàn thành', color: 'success', tone: 'completed' },
  SCHEDULED: { value: 'SCHEDULED', label: 'Đã lên lịch', color: 'default', tone: 'scheduled' },
} as const;

export function getTicketTypeMeta(type?: string | { value?: string }) {
  const key = String(typeof type === 'object' ? type?.value : type || 'MEETING').toUpperCase() as TicketTypeKey;
  return TICKET_TYPES[key] || TICKET_TYPES.MEETING;
}

export function getApprovalStatusMeta(
  status?: string | { value?: string },
  ticketType?: string,
  workflowType?: string
) {
  const key = String(typeof status === 'object' ? status?.value : status || '').toUpperCase();

  // 1. Không duyệt
  if (['REJECTED', 'NOT_APPROVED'].includes(key)) {
    return APPROVAL_STATUS_META.REJECTED;
  }

  // 2. Chờ duyệt (nếu có bước lấy ý kiến thì trạng thái chung vẫn là Chờ duyệt)
  if (['PENDING', 'PENDING_APPROVAL', 'WAITING', 'CONSULTING', 'CONSULT'].includes(key)) {
    return APPROVAL_STATUS_META.PENDING;
  }

  // 3. Hoàn thành
  if (['COMPLETED', 'DONE'].includes(key)) {
    return APPROVAL_STATUS_META.COMPLETED;
  }

  // 4. Đang triển khai
  if (['IN_PROGRESS', 'DEPLOYING'].includes(key)) {
    return APPROVAL_STATUS_META.IN_PROGRESS;
  }

  // 5. Đã lên lịch
  if (['SCHEDULED'].includes(key)) {
    return APPROVAL_STATUS_META.SCHEDULED;
  }

  // 6. Đã duyệt
  if (key === 'APPROVED') {
    return APPROVAL_STATUS_META.APPROVED;
  }

  // 7. Xử lý fallback theo loại phiếu
  if (ticketType === 'TASK') {
    if (workflowType === 'DISPATCH' || key === 'ACTIVE') {
      return APPROVAL_STATUS_META.IN_PROGRESS;
    }
    return APPROVAL_STATUS_META.APPROVED;
  }

  if (ticketType === 'MEETING' || ticketType === 'EVENT') {
    return APPROVAL_STATUS_META.SCHEDULED;
  }

  return APPROVAL_STATUS_META.APPROVED;
}

export function plainText(value?: string): string {
  if (!value) return '';
  const str = String(value);
  // Fast path: nếu không chứa ký tự '<' thì chắc chắn là plain text thông thường, không cần khởi tạo DOMParser
  if (!str.includes('<')) return str.trim();
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(str, 'text/html');
      doc.querySelectorAll('script, style').forEach((node) => node.remove());
      doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
      doc.querySelectorAll('p, div, li').forEach((node) => node.append('\n'));
      return (doc.body.textContent || '').trim();
    } catch {
      // fallback
    }
  }
  return str.replace(/<[^>]*>/g, ' ').trim();
}

export const searchText = (value: string): string =>
  plainText(value)
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

export const dayNames = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];

interface CalendarPerson { id?: string | number; user_id?: string | number; name?: string; display_name?: string }
type DutyShifts = Record<string, string | Record<string, string>>;
type CalendarRecord = Omit<Partial<CalendarEvent>, 'participants' | 'dutyInfo' | 'executors' | 'watchers' | 'scope' | 'ticketType'> & {
  scope?: string; ticketType?: string;
  continuesFromPreviousDay?: boolean; continuesToNextDay?: boolean;
  participants?: Array<string | CalendarPerson>;
  executors?: Array<CalendarPerson>; watchers?: Array<CalendarPerson>;
  dutyInfo?: string | false; declined?: boolean;
  start_at?: string; end_at?: string; meeting_datetime?: string; meeting_date?: string; time_end?: string;
  category?: string; ticket_type?: string; workflow_type?: 'PROPOSAL' | 'DISPATCH'; approval_status?: string;
  attendees_text?: string; file_attachments?: CalendarEvent['attachments']; content?: string;
  date?: string; calendar_date?: string; host?: CalendarPerson; approvalSteps?: CalendarEvent['steps'];
  is_adjusted?: boolean; adjusted_at?: string; adjusted_note?: string;
  meeting_url?: string; attachmentCount?: number; commentCount?: number;
  continues_from_previous_day?: boolean; continues_to_next_day?: boolean; is_interested?: boolean;
  deleted_at?: string; dutyLeader?: string; shifts?: DutyShifts;
  metadata?: { office_child_category?: string; date_block_text?: string; duty_schedule?: DutyShifts };
};
const personName = (person: string | CalendarPerson): string => typeof person === 'string' ? person : person.display_name || person.name || '';

export interface DutyShiftData {
  leader?: string;
  shifts?: DutyShifts;
}

export interface NormalizedMeetingEvent {
  id: string;
  scope: 'editorial' | 'personal';
  ticketType: 'TASK' | 'MEETING' | 'EVENT';
  workflowType?: 'PROPOSAL' | 'DISPATCH';
  approvalStatus?: string;
  start: Dayjs;
  end: Dayjs | null;
  date: string;
  title: string;
  content: string;
  location: string;
  leader?: string;
  participantText: string;
  participants?: Array<string | CalendarPerson>;
  executors?: CalendarPerson[];
  executorText?: string;
  watchers?: CalendarPerson[];
  watcherText?: string;
  isUserWatcher?: boolean;
  approver?: CalendarEvent['approver'];
  approvalSteps?: CalendarEvent['steps'];
  isUserParticipant: boolean;
  isAdjusted?: boolean;
  adjustedNote?: string;
  dutyInfo?: string;
  meetingUrl?: string;
  mode?: string | null;
  attachments: NonNullable<CalendarEvent['attachments']>;
  attachmentCount: number;
  commentCount: number;
  participantCount: number;
  continuesFromPreviousDay?: boolean;
  continuesToNextDay?: boolean;
  isInterested?: boolean;
  searchIndex: string;
  raw: CalendarEvent;
}

export function normalizeMeeting(record: CalendarRecord, userId = 'nhanvien'): NormalizedMeetingEvent | null {
  if (!record) return null;

  const rawStart = record.startAt || record.start_at || record.meeting_datetime || record.meeting_date;
  const rawEnd = record.endAt || record.end_at || record.time_end;

  const start = rawStart ? dayjs(rawStart) : null;
  if (!start || !start.isValid()) return null;

  const scope: 'editorial' | 'personal' = record.scope === 'personal' || record.category === 'personal' ? 'personal' : 'editorial';
  const rawTicketType = String(
    record.ticketType ||
    record.ticket_type ||
    (record.type === 'meeting' ? 'MEETING' : record.type === 'event' ? 'EVENT' : record.type === 'work' ? 'TASK' : 'MEETING')
  ).toUpperCase();
  const ticketType: 'TASK' | 'MEETING' | 'EVENT' =
    rawTicketType === 'TASK' ? 'TASK' : rawTicketType === 'EVENT' ? 'EVENT' : 'MEETING';
  const isTask = ticketType === 'TASK';
  const isMeeting = ticketType === 'MEETING';

  const endObj = rawEnd ? dayjs(rawEnd) : null;
  const end = isTask ? null : (endObj && endObj.isValid() && endObj.isAfter(start) ? endObj : null);

  const workflowType: 'PROPOSAL' | 'DISPATCH' | undefined =
    scope === 'editorial'
      ? undefined
      : record.workflowType ||
        record.workflow_type ||
        (record.approver?.name || (record.approvers && record.approvers.length > 0) ? 'PROPOSAL' : isTask ? 'DISPATCH' : undefined);

  let defaultStatus = 'APPROVED';
  if (isTask) {
    defaultStatus = workflowType === 'PROPOSAL' ? 'PENDING' : 'IN_PROGRESS';
  } else if (isMeeting || ticketType === 'EVENT') {
    defaultStatus = 'SCHEDULED';
  }

  const approvalStatus = getEffectiveCalendarApprovalStatus(record.approvalStatus || record.approval_status || defaultStatus, record.approvers);

  const executors = record.executors || [];
  const executorText = executors.map((e) => e.display_name || e.name).filter(Boolean).join(', ');

  const watchers = record.watchers || [];
  const watcherText = watchers.map((w) => w.display_name || w.name).filter(Boolean).join(', ');

  const isUserExecutor = Array.isArray(executors) && executors.some((e) =>
    String(e.id || e.user_id) === String(userId) || String(e.name || '').includes('Nguyễn Minh Anh')
  );
  const isUserApprover = Boolean(
    record.approver && (String(record.approver.id) === String(userId) || String(record.approver.name || '').includes('Nguyễn Minh Anh'))
  );
  const isUserConsultant = Boolean(
    record.consultantName && String(record.consultantName).includes('Nguyễn Minh Anh')
  );
  const isUserLeader = Boolean(
    (record.leader && String(record.leader).includes('Nguyễn Minh Anh')) ||
    (record.organizer && String(record.organizer).includes('Nguyễn Minh Anh'))
  );

  const isDeclined = Boolean(record.isDeclined || record.declined);

  const isUserWatcher =
    scope === 'editorial' || isDeclined
      ? false
      : Boolean(
          record.isUserWatcher ||
          (Array.isArray(watchers) &&
            watchers.some(
              (w) =>
                String(w.id || w.user_id) === String(userId) ||
                String(w.name || '').includes('Nguyễn Minh Anh'),
            )),
        );

  const isUserParticipant = isDeclined
    ? false
    : record.isUserParticipant !== undefined
      ? Boolean(record.isUserParticipant)
      : scope === 'editorial'
        ? false
        : Boolean(
            isUserExecutor ||
            isUserApprover ||
            isUserConsultant ||
            isUserLeader ||
            (scope === 'personal' && !isTask) ||
            (Array.isArray(record.participants) &&
              record.participants.some(
                (p) =>
                  String(typeof p === 'string' ? p : p.id || p.user_id) === String(userId) ||
                  personName(p).includes('Nguyễn Minh Anh'),
              )),
          );

  const participantText = record.participantText || record.attendees_text || (Array.isArray(record.participants) ? record.participants.map(personName).join(', ') : '');

  const attachments = Array.isArray(record.attachments) ? record.attachments : Array.isArray(record.file_attachments) ? record.file_attachments : [];
  const content = plainText(record.content || record.description || record.notes);

  return {
    id: String(record.id),
    scope,
    ticketType,
    workflowType,
    approvalStatus,
    start,
    end,
    date: record.date || record.calendar_date || start.format('YYYY-MM-DD'),
    title: record.title || 'Cuộc họp',
    content,
    location: isTask ? '' : (record.location || (record.mode === 'online' ? 'Trực tuyến' : '')),
    leader: isMeeting ? (record.leader || record.host?.display_name || record.host?.name || record.organizer) : undefined,
    participantText,
    participants: record.participants || [],
    executors,
    executorText,
    watchers,
    watcherText,
    isUserWatcher,
    approver: record.approver,
    approvalSteps: record.steps || record.approvalSteps || [],
    isUserParticipant,
    isAdjusted: Boolean(record.isAdjusted || record.is_adjusted || record.adjusted_at),
    adjustedNote: record.adjustedNote || record.adjusted_note || undefined,
    dutyInfo: typeof record.dutyInfo === 'string' ? record.dutyInfo : undefined,
    meetingUrl: isMeeting ? (record.meetingUrl || record.meeting_url || '') : '',
    mode: record.mode || null,
    attachments,
    attachmentCount: record.attachmentCount ?? attachments.length,
    commentCount: record.commentCount ?? record.comments?.length ?? 0,
    participantCount: record.participantCount ?? (record.participants?.length || 0),
    continuesFromPreviousDay: Boolean(record.continuesFromPreviousDay || record.continues_from_previous_day),
    continuesToNextDay: Boolean(record.continuesToNextDay || record.continues_to_next_day),
    isInterested: Boolean(record.isInterested || record.is_interested),
    searchIndex: searchText(
      [
        record.title || '',
        content,
        participantText,
        watcherText,
        executorText,
        isTask ? '' : (record.location || ''),
        isMeeting ? (record.leader || record.host?.display_name || record.host?.name || record.organizer || '') : '',
      ]
        .filter(Boolean)
        .join(' ')
    ),
    raw: { ...record, scope, ticketType, isUserParticipant, isUserWatcher, executors: record.executors?.map((person) => ({ ...person, id: person.id || person.user_id || '', name: personName(person) })), watchers: record.watchers?.map((person) => ({ ...person, id: person.id || person.user_id || '', name: personName(person) })), id: String(record.id), title: record.title || 'Cuộc họp', startAt: start.toISOString(), endAt: rawEnd || start.toISOString(), type: record.type || 'meeting', organizer: record.organizer || '', participants: record.participants?.map(personName), dutyInfo: typeof record.dutyInfo === 'string' ? record.dutyInfo : undefined },
  };
}

export function collectDuty(records: CalendarRecord[]): Record<string, DutyShiftData> {
  const duties: Record<string, DutyShiftData> = {};

  // Luôn nạp thông tin trực ban chuẩn từ bảng phân công getDayDutyInfo
  records.forEach((record) => {
    const rawStart = record.startAt || record.start_at || record.meeting_datetime || record.date;
    if (rawStart) {
      const d = dayjs(rawStart);
      if (d.isValid()) {
        const dateKey = d.format('YYYY-MM-DD');
        if (!duties[dateKey]) {
          const dayDuty = getDayDutyInfo(d);
          if (dayDuty) {
            const shiftsRecord: DutyShifts = {};
            if (Array.isArray(dayDuty.shifts)) {
              dayDuty.shifts.forEach((s) => {
                shiftsRecord[s.name] = {
                  ...(s.tkts ? { TKTS: s.tkts } : {}),
                  ...(s.btv ? { BTV: s.btv } : {}),
                };
              });
            } else if (dayDuty.shifts) {
              Object.assign(shiftsRecord, dayDuty.shifts);
            }
            duties[dateKey] = {
              leader: dayDuty.leader,
              shifts: shiftsRecord,
            };
          }
        }
      }
    }
  });

  // Bổ sung hoặc ghi đè nếu bản ghi có thông tin trực chuyên biệt (daily_duty_schedule)
  records.forEach((record) => {
    if (record.deleted_at || record.dutyInfo === false) return;
    const dateStr = record.meeting_date || record.meeting_datetime || record.startAt || record.date;
    const date = dateStr ? String(dateStr).slice(0, 10) : '';
    if (!date) return;

    if (record.metadata?.office_child_category === 'daily_duty_schedule') {
      const leader = record.dutyLeader || record.metadata?.date_block_text?.match(/\b(?:Anh|Chị)\s+.+$/i)?.[0];
      const shifts = record.shifts || record.metadata?.duty_schedule;
      if (!duties[date]) duties[date] = {};
      if (leader) duties[date].leader = leader;
      if (shifts) duties[date].shifts = shifts;
    }
  });

  return duties;
}

export const eventTime = (event: Pick<NormalizedMeetingEvent, 'ticketType' | 'start' | 'end'>): string => {
  if (event.ticketType === 'TASK') {
    const target = event.end || event.start;
    return target ? target.format('HH:mm') : '';
  }
  return event.start.format('HH:mm');
};

/**
 * Hiển thị khung giờ đầy đủ giúp người đọc quét nhanh:
 * - Lịch họp / Sự kiện: 08:30 – 10:00 (hoặc 08:30 nếu không có giờ kết thúc)
 * - Phiếu công việc (TASK): Hạn: 17:30
 */
/**
 * Chuẩn hóa thời gian sự kiện: Chỉ hiển thị 1 mốc thời gian duy nhất (HH:mm)
 */
export const eventTimeRange = (event: Pick<NormalizedMeetingEvent, 'ticketType' | 'start' | 'end'>): string => {
  if (event.ticketType === 'TASK') {
    const target = event.end || event.start;
    return target ? `Hạn: ${target.format('HH:mm')}` : '';
  }
  if (event.end && event.end.isValid() && !event.end.isSame(event.start)) {
    return `${event.start.format('HH:mm')} – ${event.end.format('HH:mm')}`;
  }
  return event.start.format('HH:mm');
};

/**
 * Tính thời lượng bằng tiếng Việt dễ đọc (vd: 1 giờ 30 phút, 45 phút)
 */
export const eventDurationText = (event: Pick<NormalizedMeetingEvent, 'start' | 'end'>): string => {
  if (!event.end || !event.end.isValid() || event.end.isSame(event.start)) return '';
  const diffMinutes = event.end.diff(event.start, 'minute');
  if (diffMinutes <= 0) return '';
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} giờ ${minutes} phút`;
  if (hours > 0) return `${hours} giờ`;
  return `${minutes} phút`;
};

export function positionEvents(events: NormalizedMeetingEvent[]) {
  let previousLeft = -100;
  return [...events]
    .sort(
      (a, b) =>
        a.start.valueOf() - b.start.valueOf() ||
        Number(b.isUserParticipant) - Number(a.isUserParticipant) ||
        (b.end ? b.end.diff(b.start, 'minute') : 0) -
          (a.end ? a.end.diff(a.start, 'minute') : 0),
    )
    .map((event) => {
      const startMinutes = event.start.hour() * 60 + event.start.minute();
      let left = Math.max(0, Math.min(92.5, ((startMinutes - 420) / 660) * 100));
      if (left - previousLeft < 3.8) left = Math.min(92.5, previousLeft + 3.8);
      previousLeft = left;
      const durationWidth = event.end
        ? (Math.max(
            30,
            Math.min(
              event.end.diff(event.start.startOf('day'), 'minute'),
              1080,
            ) - startMinutes,
          ) /
            660) *
          100
        : 7.5;
      const width = Math.min(100 - left, Math.max(7.5, durationWidth));
      return { event, left, width };
    });
}

/**
 * Kiểm tra xem một sự kiện đã diễn ra trong quá khứ hay chưa
 * (so sánh thời điểm kết thúc/bắt đầu của sự kiện với thời điểm hiện tại/mốc tham chiếu)
 */
export function isPastEvent(
  event: { start?: Dayjs; end?: Dayjs | null; startAt?: string; endAt?: string; deadline?: string },
  referenceTime?: Dayjs,
): boolean {
  const current = referenceTime || dayjs();
  if (event.end) {
    return current.isAfter(event.end);
  }
  if (event.start) {
    return current.isAfter(event.start);
  }
  const endAt = event.endAt || event.deadline;
  if (endAt) {
    const endDayjs = dayjs(endAt);
    if (endDayjs.isValid()) return current.isAfter(endDayjs);
  }
  if (event.startAt) {
    const startDayjs = dayjs(event.startAt);
    if (startDayjs.isValid()) return current.isAfter(startDayjs);
  }
  return false;
}

export function getMeetingPhysicalLocation(event: Pick<CalendarEvent, 'location' | 'meetingUrl'>) {
  return event.location?.split(/\s+•\s+/)
    .map((part) => part.trim())
    .filter((part) => part && part !== event.meetingUrl?.trim() && !/^https?:\/\//i.test(part) && part !== 'Trực tuyến')
    .join(' • ') ?? '';
}
export function calendarDetailHref(eventId: string) {
  const date = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('date');
  const path = `/calendar/events/${encodeURIComponent(eventId)}`;
  return date ? `${path}?${new URLSearchParams({ date })}` : path;
}

export function getEffectiveCalendarApprovalStatus<T extends string | undefined>(
  status: T,
  approvers?: CalendarEvent['approvers'],
): T | 'PENDING' {
  if (status === 'APPROVED' && approvers && approvers.length > 1 &&
    approvers.some((person) => person.status === 'PENDING')) {
    return 'PENDING';
  }
  return status;
}
