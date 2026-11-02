import { useEffect, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { Button, Popover, Skeleton, message } from 'antd';
import {
  ClockCircleOutlined,
  DownOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  RightOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  dayNames,
  eventTime,
  getApprovalStatusMeta,
  getTicketTypeMeta,
  positionEvents,
  type DutyShiftData,
  type NormalizedMeetingEvent,
} from '../calendarWeekUtils';

import { ParticipantList } from './ParticipantList';

export function DutyInfo({ duty, past = false }: { duty?: DutyShiftData; past?: boolean }) {
  if (!duty) return <span className="booking-week-muted">Chưa có thông tin trực</span>;
  const shifts = duty.shifts;
  if (!shifts) return null;

  const shiftList = Array.isArray(shifts)
    ? shifts.map((s) => ({
        label: s.name ? `${s.name}:` : '',
        details: [
          s.tkts ? `TKTS: ${s.tkts}` : '',
          s.btv ? `BTV: ${s.btv}` : '',
        ].filter(Boolean).join(' · '),
      }))
    : Object.entries(shifts).map(([key, value]) => {
        const label = `${key.replace(/_/g, ' ').replace(/^ca/i, 'Ca')}:`;
        const details =
          typeof value === 'object' && value !== null
            ? Object.entries(value)
                .map(([role, names]) => `${role.toUpperCase()}: ${Array.isArray(names) ? names.join(', ') : names || '—'}`)
                .join(' · ')
            : String(value || '—');
        return { label, details };
      });

  return (
    <div className="booking-week-duty-details">
      {duty.leader && <strong className={past ? 'booking-week-past-duty' : ''}>{duty.leader}</strong>}
      {shiftList.map((item, idx) => (
        <div key={idx} className={past ? 'booking-week-past-duty' : ''}>
          <b>{item.label}</b> {item.details}
        </div>
      ))}
    </div>
  );
}

interface EventCardProps {
  event: NormalizedMeetingEvent;
  now: Dayjs;
  left?: number;
  width?: number;
  upward?: boolean;
  onSelect: (event: NormalizedMeetingEvent) => void;
  vertical?: boolean;
  compact?: boolean;
  expandLeft?: boolean;
  disabledHover?: boolean;
}

export function EventCard({
  event,
  now,
  left = 0,
  width = 10,
  upward = false,
  onSelect,
  vertical = false,
  compact = false,
  expandLeft = false,
  disabledHover = false,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [starred, setStarred] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  useEffect(() => {
    if (disabledHover) {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      enterTimer.current = null;
      setExpanded(false);
    }
  }, [disabledHover]);

  const enter = () => {
    if (disabledHover) return;
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (!expanded && !enterTimer.current) {
      enterTimer.current = setTimeout(() => {
        enterTimer.current = null;
        setExpanded(true);
      }, 120);
    }
  };

  const leave = () => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    enterTimer.current = null;
    leaveTimer.current = setTimeout(() => setExpanded(false), 100);
  };

  const badge = event.scope === 'personal' ? 'Cá nhân' : event.isUserParticipant ? 'Tham gia' : '';
  const typeMeta = getTicketTypeMeta(event.ticketType);
  const approvalMeta = getApprovalStatusMeta(event.approvalStatus);
  const typeKey = String(event.ticketType || 'MEETING').toLowerCase();
  const statusKey = String(event.approvalStatus || 'APPROVED').toLowerCase();
  const showExceptionStatus = statusKey !== 'approved' && statusKey !== 'completed';
  const showMetaRow =
    Boolean(event.location) ||
    showExceptionStatus ||
    Boolean(event.isAdjusted) ||
    Boolean(event.continuesFromPreviousDay || event.continuesToNextDay);
  const past = Boolean(
    now &&
      event.end &&
      event.end.isBefore(now) &&
      (event.start.isSame(now, 'isoWeek') || event.end.isSame(now, 'isoWeek'))
  );

  return (
    <div
      className={`booking-week-event booking-week-ticket-${typeKey} ${vertical ? 'booking-week-feed-card' : ''} ${
        compact ? 'booking-week-out-hours-card' : ''
      } ${past ? 'booking-week-past-event' : ''} ${
        event.scope === 'personal' ? 'booking-week-personal' : event.isUserParticipant ? 'booking-week-attending' : ''
      } ${expanded ? 'booking-week-expanded' : ''} ${
        expandLeft || left > 58 ? 'booking-week-expand-left' : ''
      } ${upward ? 'booking-week-expand-up' : ''}`}
      style={
        vertical || compact
          ? undefined
          : ({
              left: `${left}%`,
              width: `calc(${width}% - 4px)`,
              ['--booking-week-right']: `${100 - left - width}%`,
            } as React.CSSProperties)
      }
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button
        type="button"
        className="booking-week-card-button"
        aria-label={`${eventTime(event)} ${event.title}`}
        onClick={() => {
          if (enterTimer.current) clearTimeout(enterTimer.current);
          enterTimer.current = null;
          setExpanded(false);
          onSelect(event);
        }}
      >
        <div className="booking-week-card-top">
          <span className="booking-week-card-time-group">
            <span className={`booking-week-type-dot booking-week-dot-${typeKey}`} aria-hidden="true" />
            <span className="booking-week-card-time">{eventTime(event)}</span>
          </span>
          <span className="booking-week-card-badges">
            <span
              role="button"
              tabIndex={0}
              className="booking-week-card-star"
              aria-label="Quan tâm lịch họp"
              title="Nhắc trước 15 phút"
              onClick={(e) => {
                e.stopPropagation();
                setStarred(true);
                message.success('Bạn sẽ được nhắc nhở trước 15 phút');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setStarred(true);
                  message.success('Bạn sẽ được nhắc nhở trước 15 phút');
                }
              }}
            >
              <StarOutlined />
              {starred && (
                <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                  Bạn sẽ được nhắc nhở trước 15 phút
                </span>
              )}
            </span>
            {typeKey !== 'meeting' && (
              <span className={`booking-week-type-badge booking-week-type-${typeKey}`}>{typeMeta.label}</span>
            )}
            {badge && <span className="booking-week-badge">{badge}</span>}
          </span>
        </div>

        <div className="booking-week-card-title">{event.title}</div>

        {showMetaRow && (
          <div className="booking-week-card-meta-row">
            {event.location && <span className="booking-week-card-loc">{event.location}</span>}
            {showExceptionStatus && (
              <span className={`booking-week-status-badge booking-week-status-${statusKey}`}>
                {approvalMeta.label}
              </span>
            )}
            {event.isAdjusted && <span className="booking-week-adjusted">Đã điều chỉnh</span>}
            {(event.continuesFromPreviousDay || event.continuesToNextDay) && (
              <small className="booking-week-continuation">
                {event.continuesFromPreviousDay ? 'Tiếp tục' : 'Kéo dài'}
              </small>
            )}
          </div>
        )}
      </button>

      {expanded && !disabledHover && (
        <div className="booking-week-card-expanded">
          <div className="booking-week-card-expanded-badges">
            <span className={`booking-week-type-badge booking-week-type-${typeKey}`}>{typeMeta.label}</span>
            <span className={`booking-week-status-badge booking-week-status-${statusKey}`}>{approvalMeta.label}</span>
            {badge && <span className="booking-week-badge">{badge}</span>}
          </div>
          <strong>{event.title}</strong>
          <p>
            <ClockCircleOutlined /> {eventTime(event)}
          </p>
          {(event.location || event.ticketType !== 'TASK') && (
            <p>
              <EnvironmentOutlined /> {event.location || 'Chưa có địa điểm'}
            </p>
          )}
          {event.ticketType !== 'TASK' && (
            <p>
              <TeamOutlined />
              <ParticipantList
                text={
                  event.participantText ||
                  (event.participantCount ? `${event.participantCount} người tham gia · Xem trong chi tiết` : 'Chưa có thông tin thành phần')
                }
                scrollExpanded
              />
            </p>
          )}
          {event.ticketType !== 'MEETING' && event.executorText && (
            <p>
              <UserOutlined /> <span>Triển khai: {event.executorText}</span>
            </p>
          )}
          {event.ticketType !== 'MEETING' && event.approver && (
            <p>
              <UserOutlined /> <span>Người duyệt: {event.approver.display_name || event.approver.name}</span>
            </p>
          )}
          {event.ticketType !== 'MEETING' && event.watcherText && (
            <p>
              <EyeOutlined /> <span>Theo dõi: {event.watcherText}</span>
            </p>
          )}
          <div className="booking-week-card-footer">
            <span>{event.attachmentCount ?? event.attachments.length} tài liệu</span>
            <Button
              type="link"
              size="small"
              onClick={() => {
                if (enterTimer.current) clearTimeout(enterTimer.current);
                enterTimer.current = null;
                setExpanded(false);
                onSelect(event);
              }}
            >
              Xem chi tiết <RightOutlined />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OutHoursIcon({ late = false }: { late?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {late ? (
        <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
      ) : (
        <>
          <path d="M3 17h18M5 21h14M7 17a5 5 0 0 1 10 0M12 3v5M3 10l3 3M21 10l-3 3M9 6l3-3 3 3" />
        </>
      )}
    </svg>
  );
}

function OutHoursSlot({
  events,
  late = false,
  upward = false,
  now,
  loading = false,
  onSelectEvent,
  disabledHover = false,
}: {
  events: NormalizedMeetingEvent[];
  late?: boolean;
  upward?: boolean;
  now: Dayjs;
  loading?: boolean;
  onSelectEvent: (event: NormalizedMeetingEvent) => void;
  disabledHover?: boolean;
}) {
  return (
    <div className={`booking-week-out-hours-slot ${late ? 'booking-week-out-late' : 'booking-week-out-early'}`}>
      {loading ? (
        <Skeleton.Input active size="small" style={{ width: '100%', minWidth: 0, height: 32 }} />
      ) : events.length ? (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            now={now}
            compact
            expandLeft={late}
            upward={upward}
            onSelect={onSelectEvent}
            disabledHover={disabledHover}
          />
        ))
      ) : (
        <span className="booking-week-out-hours-empty" aria-hidden="true">
          -
        </span>
      )}
    </div>
  );
}

export interface WeekTimelineProps {
  week: Dayjs;
  now: Dayjs;
  selectedDate: Dayjs;
  events: NormalizedMeetingEvent[];
  duties: Record<string, DutyShiftData>;
  showDuty?: boolean;
  onSelectDay: (day: Dayjs) => void;
  onSelectEvent: (event: NormalizedMeetingEvent) => void;
  loading?: boolean;
  disabledHover?: boolean;
}

export function WeekTimeline({
  week,
  now,
  selectedDate,
  events,
  duties,
  showDuty = true,
  onSelectDay,
  onSelectEvent,
  loading = false,
  disabledHover = false,
}: WeekTimelineProps) {
  const hours = Array.from({ length: 11 }, (_, index) => index + 7);
  const currentMinutes = now.hour() * 60 + now.minute();
  const withinTimeline = week.isSame(now, 'isoWeek') && currentMinutes >= 420 && currentMinutes < 1080;

  return (
    <div className="booking-week-grid-scroll" aria-label="Lịch họp tuần" aria-busy={loading}>
      <div className="booking-week-grid">
        <div className="booking-week-hours-row">
          <div className="booking-week-corner" />
          <div className="booking-week-out-hours-header booking-week-out-early" title="Các sự kiện bắt đầu trước 07:00">
            <OutHoursIcon />
            <span>Trước 7h</span>
          </div>
          <div className="booking-week-hours">
            {hours.map((hour) => (
              <div className={withinTimeline && hour === now.hour() ? 'booking-week-current-hour' : ''} key={hour}>
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <div className="booking-week-out-hours-header booking-week-out-late" title="Các sự kiện bắt đầu từ 18:00 trở đi">
            <OutHoursIcon late />
            <span>Sau 18h</span>
          </div>
        </div>

        {dayNames.map((name, index) => {
          const day = week.add(index, 'day');
          const date = day.format('YYYY-MM-DD');
          const selected = date === selectedDate.format('YYYY-MM-DD');
          const dayEvents = events.filter((event) => event.date === date);
          const earlyEvents = dayEvents
            .filter((event) => event.start.hour() < 7)
            .sort((a, b) => a.start.valueOf() - b.start.valueOf());
          const lateEvents = dayEvents
            .filter((event) => event.start.hour() >= 18)
            .sort((a, b) => a.start.valueOf() - b.start.valueOf());
          const normalEvents = dayEvents.filter((event) => event.start.hour() >= 7 && event.start.hour() < 18);
          const pastDuty = week.isSame(now, 'isoWeek') && day.isBefore(now, 'day');
          const duty = duties[date];

          return (
            <div
              key={date}
              className={`booking-week-day-row ${selected ? 'booking-week-selected-day' : ''}`}
              style={{ minHeight: Math.max(118, Math.max(earlyEvents.length, lateEvents.length) * 35 + 10) }}
            >
              <div className="booking-week-day-header">
                <button
                  type="button"
                  className="booking-week-day-button"
                  disabled={loading}
                  onClick={() => onSelectDay(day)}
                >
                  <span className="booking-week-day-title">
                    <b>{name}</b>
                    <span className="booking-week-date-pill">{day.format('DD/MM')}</span>
                  </span>
                  <span className="booking-week-day-count">
                    {loading ? (
                      <Skeleton.Input active size="small" style={{ width: 65, height: 14, minWidth: 0 }} />
                    ) : (
                      <>
                        {dayEvents.length} mục ghi <RightOutlined />
                      </>
                    )}
                  </span>
                </button>

                {showDuty &&
                  (loading ? (
                    <div className="booking-week-duty-skeleton">
                      <Skeleton.Input active size="small" style={{ width: 150, height: 14, minWidth: 0 }} />
                    </div>
                  ) : (
                    <Popover
                      trigger="click"
                      placement={index >= 5 ? 'topLeft' : 'bottomLeft'}
                      content={<DutyInfo duty={duty} past={pastDuty} />}
                      overlayClassName="booking-week-duty-popover"
                    >
                      <button
                        type="button"
                        className={`booking-week-duty-button ${pastDuty ? 'booking-week-past-duty' : ''}`}
                        aria-label="Mở rộng các ca trực"
                      >
                        <span>TRỰC:</span>
                        <strong>{duty?.leader || 'Chưa có thông tin'}</strong>
                        <DownOutlined />
                      </button>
                    </Popover>
                  ))}
              </div>

              <OutHoursSlot
                events={earlyEvents}
                now={now}
                upward={index >= 3}
                loading={loading}
                onSelectEvent={onSelectEvent}
                disabledHover={disabledHover}
              />

              <div className="booking-week-day-track">
                <div className="booking-week-grid-background" aria-hidden="true">
                  {hours.map((hour) => (
                    <div key={hour} />
                  ))}
                </div>
                {day.isSame(now, 'day') && withinTimeline && (
                  <div
                    className="booking-week-now-indicator"
                    style={{ left: `${((currentMinutes - 420) / 660) * 100}%` }}
                    title={`Thời gian hiện tại: ${now.format('HH:mm')}`}
                  >
                    <span className="booking-week-now-pill">
                      <span />
                      {now.format('HH:mm')}
                    </span>
                    <span className="booking-week-now-line" />
                  </div>
                )}
                {loading && (
                  <div className="booking-week-row-skeleton" aria-hidden="true">
                    {[8.33, 25, 58.33].map((left) => (
                      <div key={left} className="booking-week-event-skeleton" style={{ left: `${left}%` }}>
                        <Skeleton active title={{ width: '55%' }} paragraph={{ rows: 2, width: ['90%', '65%'] }} />
                      </div>
                    ))}
                  </div>
                )}
                {positionEvents(normalEvents).map(({ event, left, width }) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    now={now}
                    left={left}
                    width={width}
                    upward={index >= 3}
                    onSelect={onSelectEvent}
                    disabledHover={disabledHover}
                  />
                ))}
              </div>

              <OutHoursSlot
                events={lateEvents}
                late
                now={now}
                upward={index >= 3}
                loading={loading}
                onSelectEvent={onSelectEvent}
                disabledHover={disabledHover}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekTimeline;
