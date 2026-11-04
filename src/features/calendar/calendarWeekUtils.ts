import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { CalendarEvent } from '@/types/domain';
import { getDayDutyInfo } from './dutySchedule';

dayjs.extend(isoWeek);

export const vietnamNow = (): Dayjs => dayjs();

export const TICKET_TYPES = {
  TASK: {
    value: 'TASK',
    label: 'Công việc',
    fullLabel: 'Công việc',
    tone: 'task',
    color: 'blue',
  },
  MEETING: {
    value: 'MEETING',
    label: 'Lịch họp',
    fullLabel: 'Lịch họp',
    tone: 'meeting',
    color: 'red',
  },
  EVENT: {
    value: 'EVENT',
    label: 'Sự kiện',
    fullLabel: 'Sự kiện',
    tone: 'event',
    color: 'purple',
  },
} as const;

export type TicketTypeKey = keyof typeof TICKET_TYPES;

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
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(String(value || ''), 'text/html');
      doc.querySelectorAll('script, style').forEach((node) => node.remove());
      doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
      doc.querySelectorAll('p, div, li').forEach((node) => node.append('\n'));
      return (doc.body.textContent || '').trim();
    } catch {
      // fallback
    }
  }
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .trim();
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

export interface DutyShiftData {
  leader?: string;
  shifts?: Record<string, any>;
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
  participants?: any[];
  executors?: any[];
  executorText?: string;
  watchers?: any[];
  watcherText?: string;
  isUserWatcher?: boolean;
  approver?: any;
  approvalSteps?: any[];
  isUserParticipant: boolean;
  isAdjusted?: boolean;
  adjustedNote?: string;
  dutyInfo?: string;
  meetingUrl?: string;
  mode?: string | null;
  attachments: any[];
  attachmentCount: number;
  commentCount: number;
  participantCount: number;
  continuesFromPreviousDay?: boolean;
  continuesToNextDay?: boolean;
  isInterested?: boolean;
  raw: any;
}

export function normalizeMeeting(record: CalendarEvent | any, userId = 'nhanvien'): NormalizedMeetingEvent | null {
  if (!record) return null;

  const rawStart = record.startAt || record.start_at || record.meeting_datetime || record.meeting_date;
  const rawEnd = record.endAt || record.end_at || record.time_end;

  const start = rawStart ? dayjs(rawStart) : null;
  if (!start || !start.isValid()) return null;

  const scope: 'editorial' | 'personal' = record.scope === 'personal' || record.category === 'personal' ? 'personal' : 'editorial';
  const isTask = scope !== 'editorial' && (record.ticketType || record.ticket_type) === 'TASK';
  const isMeeting = scope === 'editorial' || (record.ticketType || record.ticket_type || 'MEETING') === 'MEETING';
  const ticketType: 'TASK' | 'MEETING' | 'EVENT' =
    scope === 'editorial' ? 'MEETING' : isTask ? 'TASK' : (record.ticketType || record.ticket_type || 'MEETING');

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

  const approvalStatus = record.approvalStatus || record.approval_status || defaultStatus;

  const executors = record.executors || [];
  const executorText = executors.map((e: any) => e.display_name || e.name).filter(Boolean).join(', ');

  const watchers = record.watchers || [];
  const watcherText = watchers.map((w: any) => w.display_name || w.name).filter(Boolean).join(', ');

  const isUserExecutor = Array.isArray(executors) && executors.some((e: any) =>
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

  const isUserWatcher =
    scope === 'editorial'
      ? false
      : Boolean(
          record.isUserWatcher ||
          (Array.isArray(watchers) &&
            watchers.some(
              (w: any) =>
                String(w.id || w.user_id) === String(userId) ||
                String(w.name || '').includes('Nguyễn Minh Anh'),
            )),
        );

  const isUserParticipant =
    scope === 'editorial'
      ? Boolean(record.isUserParticipant)
      : Boolean(
          record.isUserParticipant ||
          isUserExecutor ||
          isUserApprover ||
          isUserConsultant ||
          isUserLeader ||
          (scope === 'personal' && !isTask) ||
          (Array.isArray(record.participants) &&
            record.participants.some(
              (p: any) =>
                String(p.id || p.user_id || p) === String(userId) ||
                String(p.name || p).includes('Nguyễn Minh Anh'),
            )),
        );

  const participantText = record.participantText || record.attendees_text || (Array.isArray(record.participants) ? record.participants.map((p: any) => p.display_name || p.name || p).join(', ') : '');

  const attachments = Array.isArray(record.attachments) ? record.attachments : Array.isArray(record.file_attachments) ? record.file_attachments : [];

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
    content: plainText(record.content || record.description || record.notes),
    location: isTask ? '' : (record.location || (record.mode === 'online' ? 'Trực tuyến' : '')),
    leader: record.leader || record.host?.display_name || record.host?.name || record.organizer,
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
    meetingUrl: record.meetingUrl || record.meeting_url || '',
    mode: record.mode || null,
    attachments,
    attachmentCount: record.attachmentCount ?? attachments.length,
    commentCount: record.commentCount ?? record.comments?.length ?? 0,
    participantCount: record.participantCount ?? (record.participants?.length || 0),
    continuesFromPreviousDay: Boolean(record.continuesFromPreviousDay || record.continues_from_previous_day),
    continuesToNextDay: Boolean(record.continuesToNextDay || record.continues_to_next_day),
    isInterested: Boolean(record.isInterested || record.is_interested),
    raw: record,
  };
}

export function collectDuty(records: any[]): Record<string, DutyShiftData> {
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
            const shiftsRecord: Record<string, any> = {};
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

export const eventTime = (event: NormalizedMeetingEvent): string => {
  if (event.ticketType === 'TASK') {
    const target = event.end || event.start;
    return target ? target.format('HH:mm') : '';
  }
  return event.start.format('HH:mm');
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
      let left = Math.max(0, Math.min(94, ((startMinutes - 420) / 660) * 100));
      if (left >= previousLeft && left - previousLeft < 3.8) {
        left = Math.min(94, previousLeft + 3.8);
      }
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
      return {
        event,
        left,
        width: Math.min(100 - left, Math.max(7.5, durationWidth)),
      };
    });
}
