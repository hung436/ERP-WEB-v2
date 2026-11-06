import { Button, Drawer, message } from 'antd';
import dayjs from 'dayjs';
import {
  CircleAlert,
  CalendarDays,
  ClipboardList,
  Clock3,
  Copy,
  ExternalLink,
  Eye,
  MapPin,
  Radio,
  UserRound,
  UsersRound,
  Video,
  X,
} from 'lucide-react';
import { useId } from 'react';

import { useOptionalAuth } from '@/features/auth/AuthContext';
import { filterCalendarPeople, getCalendarMembership } from '../calendarMembership';
import type { CalendarEvent } from '@/types/domain';

import { calendarDetailHref, dayNames, getApprovalStatusMeta, getCalendarStatusDotTone, getEffectiveCalendarApprovalStatus, getTicketTypeMeta, normalizeCalendarMeetingUrl } from '../calendarWeekUtils';

interface CalendarEventPreviewDrawerProps {
  event: CalendarEvent | null;
  onClose: () => void;
  afterOpenChange?: (open: boolean) => void;
}

export function CalendarEventPreviewDrawer({ event, onClose, afterOpenChange }: CalendarEventPreviewDrawerProps) {
  const titleId = useId();
  const user = useOptionalAuth()?.user;
  const ticketType = event?.ticketType || (['task', 'work', 'deadline'].includes(event?.type || '') ? 'TASK' : event?.type === 'event' ? 'EVENT' : 'MEETING');
  const meetingUrl = normalizeCalendarMeetingUrl(event?.meetingUrl);
  const hasOnlineMeeting = event?.mode === 'online' || event?.mode === 'hybrid' || Boolean(event?.meetingUrl?.trim());
  const meetingMode = event?.mode ?? (hasOnlineMeeting ? (event?.location?.trim() ? 'hybrid' : 'online') : 'offline');
  const isMeeting = ticketType === 'MEETING';
  const startAt = ticketType === 'TASK' && event?.deadline ? event.deadline : event?.startAt;
  const start = dayjs(startAt);
  const status = getEffectiveCalendarApprovalStatus(event?.approvalStatus, event?.approvers);
  const statusMeta = getApprovalStatusMeta(status, event?.ticketType, event?.workflowType);
  const statusLabel = status === 'CANCELLED' ? 'Đã hủy' : statusMeta.label;
  const statusDotTone = getCalendarStatusDotTone(status, event?.scope);
  const organizer = event?.organizer ?? '';
  const participantNames = filterCalendarPeople(
    event?.participantText?.trim().split(/[,;\n]/) ?? event?.participants ?? [],
    (name) => name,
    [organizer],
  );
  const executorNames = filterCalendarPeople(
    event?.executors ?? [],
    (person) => person.name,
    [organizer],
  ).map((person) => person.name);
  const executors = executorNames.join(', ');
  const displayedParticipants = ticketType === 'TASK' && executors
    ? executors
    : participantNames.join(', ');
  const watchers = filterCalendarPeople(
    event?.watchers ?? [],
    (person) => person.name,
    [organizer, ...participantNames, ...executorNames],
  ).map((person) => person.name).join(', ');
  const showStatus = event?.scope === 'personal' && status && status !== 'SCHEDULED';
  const showTicketType = !isMeeting && event?.scope !== 'editorial';
  const hasHeaderBadges = showTicketType || Boolean(showStatus);
  const adjustedNote = event?.adjustedNote?.trim().replace(/^Lịch điều chỉnh\s*[:：–—-]?\s*/iu, '');
  const membership = event && user ? getCalendarMembership(event, user) : event;
  const canViewDetail = Boolean(membership?.isUserParticipant || membership?.isUserWatcher);
  const hasPersonnel = Boolean(
    (!isMeeting && organizer.trim()) ||
    (isMeeting && event?.leader?.trim()) ||
    displayedParticipants ||
    (!isMeeting && watchers)
  );

  const title = <h2 className="calendar-preview-title" id={titleId}>{event?.title}</h2>;

  return (
    <Drawer
      aria-labelledby={titleId}
      rootClassName={`calendar-preview-drawer ${isMeeting ? '' : 'calendar-preview-drawer--ticket'}`}
      open={Boolean(event)}
      onClose={onClose}
      afterOpenChange={afterOpenChange}
      closable={false}
      width="min(480px, 100vw)"
      title={
        <div className="calendar-preview-header">
          <div className={hasHeaderBadges ? "calendar-preview-top-bar" : "calendar-preview-top-bar calendar-preview-top-bar--compact"}>
            {!hasHeaderBadges && title}
            {hasHeaderBadges && <div className="calendar-preview-badges">
              {showTicketType && (
                <span className={`calendar-preview-type-label calendar-preview-type-label--${ticketType.toLowerCase()}`}>
                  {ticketType === 'TASK' ? <ClipboardList size={14} aria-hidden="true" /> : <CalendarDays size={14} aria-hidden="true" />}
                  {getTicketTypeMeta(ticketType).label}
                </span>
              )}
              {showStatus && (
                <span className={`calendar-preview-status-badge calendar-preview-status-badge--${statusMeta.tone}`}>
                  {statusDotTone && <span className={`booking-week-status-dot dot-${statusDotTone}`} aria-hidden="true" />}
                  {statusLabel}
                </span>
              )}
            </div>}

            <div className="calendar-preview-header-actions">
              <Button
                type="text"
                className="calendar-preview-close-btn"
                aria-label="Đóng thông tin lịch"
                icon={<X size={18} />}
                onClick={onClose}
              />
            </div>
          </div>

          {hasHeaderBadges && title}

          {event?.isAdjusted && (
            <div className="calendar-preview-adjustment">
              <CircleAlert size={14} aria-hidden="true" />
              <div>
                <strong>{adjustedNote ? 'Lưu ý điều chỉnh:' : 'Lưu ý điều chỉnh'}</strong>
                {adjustedNote && <> {adjustedNote}</>}
              </div>
            </div>
          )}

          {!isMeeting && (
            <div className="calendar-preview-counts-row">
              <span className="calendar-preview-counts">
                {event?.attachments?.length || 0} tài liệu · {event?.comments?.length || 0} thảo luận
              </span>
            </div>
          )}
        </div>
      }
    >
      {event && (
        <div className="calendar-preview-body-container">
          {isMeeting && showStatus && (
            <div className="calendar-preview-summary">
              <div className="calendar-preview-status" aria-label={`Trạng thái: ${statusLabel}`}>
                {statusDotTone && <span className={`booking-week-status-dot dot-${statusDotTone}`} aria-hidden="true" />}
                <span>{statusLabel}</span>
              </div>
            </div>
          )}

          <div className="calendar-preview-section">
            <dl className="calendar-preview-fields">
              <div className="calendar-preview-time">
                <dt>
                  <Clock3 size={16} aria-hidden="true" />
                  <span>Thời gian</span>
                </dt>
                <dd className="calendar-preview-time-value">
                  <time dateTime={startAt}>
                    <span className="calendar-preview-time-value-hour">{start.format('HH:mm')}</span>
                    {' · '}
                    <span className="calendar-preview-date">{dayNames[(start.day() + 6) % 7]}, {start.format('DD/MM/YYYY')}</span>
                  </time>
                </dd>
              </div>

              {!(event.scope === 'personal' && ticketType === 'EVENT') && event.location?.trim() && (
                <div className="calendar-preview-location">
                  <dt>
                    <MapPin size={16} aria-hidden="true" />
                    <span>Địa điểm</span>
                  </dt>
                  <dd>{event.location}</dd>
                </div>
              )}

              {isMeeting && meetingUrl && (
                <div className="calendar-preview-location">
                  <dt>
                    <Video size={16} aria-hidden="true" />
                    <span>Kênh họp</span>
                  </dt>
                  <dd className="calendar-preview-meeting-channel">
                    <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
                      <span>{meetingUrl}</span>
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                    <Button
                      aria-label="Sao chép đường dẫn họp"
                      title="Sao chép đường dẫn họp"
                      icon={<Copy size={14} aria-hidden="true" />}
                      size="small"
                      type="text"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(meetingUrl);
                          message.success('Đã sao chép đường dẫn họp');
                        } catch {
                          message.error('Không thể sao chép đường dẫn họp');
                        }
                      }}
                    />
                  </dd>
                </div>
              )}

              {isMeeting && hasOnlineMeeting && !meetingUrl && (
                <div className="calendar-preview-location">
                  <dt><Video size={16} aria-hidden="true" /><span>Kênh họp</span></dt>
                  <dd>{event.meetingUrl?.trim() ? 'Đường dẫn không hợp lệ' : 'Chưa có đường dẫn'}</dd>
                </div>
              )}

              {isMeeting && (event.location?.trim() || hasOnlineMeeting) && (
                <div className="calendar-preview-mode">
                  <dt>
                    <Radio size={16} aria-hidden="true" />
                    <span>Hình thức</span>
                  </dt>
                  <dd>{meetingMode === 'hybrid' ? 'Trực tuyến kết hợp' : meetingMode === 'online' ? 'Trực tuyến' : 'Trực tiếp tại cơ quan'}</dd>
                </div>
              )}
            </dl>
          </div>

          {hasPersonnel && (
            <div className="calendar-preview-section">
              <dl className="calendar-preview-fields">
                {!isMeeting && organizer.trim() && (
                  <div className="calendar-preview-person">
                    <dt>
                      <UserRound size={16} aria-hidden="true" />
                      <span>Người tạo</span>
                    </dt>
                    <dd>{organizer}</dd>
                  </div>
                )}

                {isMeeting && event.leader?.trim() && (
                  <div className="calendar-preview-person">
                    <dt>
                      <UserRound size={16} aria-hidden="true" />
                      <span>Chủ trì</span>
                    </dt>
                    <dd>
                      <span>{event.leader}</span>
                    </dd>
                  </div>
                )}

                {ticketType === 'TASK' && executors && (
                  <div className="calendar-preview-person">
                    <dt>
                      <ClipboardList size={16} aria-hidden="true" />
                      <span>Thành phần</span>
                    </dt>
                    <dd>{executors}</dd>
                  </div>
                )}

                {displayedParticipants && !(ticketType === 'TASK' && executors) && (
                  <div className="calendar-preview-participants">
                    <dt>
                      <UsersRound size={16} aria-hidden="true" />
                      <span>Thành phần</span>
                    </dt>
                    <dd>
                      <span>{displayedParticipants}</span>
                    </dd>
                  </div>
                )}

                {!isMeeting && watchers && (
                  <div className="calendar-preview-watchers">
                    <dt>
                      <Eye size={16} aria-hidden="true" />
                      <span>Theo dõi</span>
                    </dt>
                    <dd>{watchers}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {canViewDetail && (
            <Button
              type="primary"
              className="calendar-preview-detail-btn"
              href={calendarDetailHref(event?.id || '')}
              icon={<ExternalLink size={13} aria-hidden="true" />}
            >
              Xem chi tiết
            </Button>
          )}
        </div>
      )}
    </Drawer>
  );
}
