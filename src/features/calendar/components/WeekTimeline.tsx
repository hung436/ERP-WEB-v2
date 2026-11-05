import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { Button, Popover, Skeleton, message } from 'antd';
import {
  DownOutlined,
  EnvironmentOutlined,
  RightOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  dayNames,
  eventTime,
  eventTimeRange,
  getApprovalStatusMeta,
  isPastEvent,
  positionEvents,
  type DutyShiftData,
  type NormalizedMeetingEvent,
} from '../calendarWeekUtils';


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
  onToggleInterest?: (event: NormalizedMeetingEvent, nextState: boolean) => void;
  vertical?: boolean;
  compact?: boolean;
  expandLeft?: boolean;
  disabledHover?: boolean;
}

export const EventCard = memo(function EventCard({
  event,
  now,
  left = 0,
  width = 10,
  onSelect,
  onToggleInterest,
  vertical = false,
  compact = false,
}: EventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [starred, setStarred] = useState(Boolean(event.isInterested));

  useEffect(() => {
    setStarred(Boolean(event.isInterested));
  }, [event.isInterested]);

  const isEditorial = event.scope === 'editorial';
  const isUserAttending = Boolean(event.isUserParticipant || event.isUserWatcher);

  const approvalMeta = getApprovalStatusMeta(event.approvalStatus, event.ticketType, event.workflowType);
  const typeKey = String(event.ticketType || 'MEETING').toLowerCase();
  const statusKey = approvalMeta.tone;

  const past = isPastEvent(event, now);

  const handleToggleStar = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const nextState = !starred;
    setStarred(nextState);
    onToggleInterest?.(event, nextState);
    if (nextState) {
      message.success(`Đã quan tâm: "${event.title}". Bạn sẽ được nhắc nhở trước 15 phút!`);
    } else {
      message.info(`Đã hủy nhắc nhở lịch "${event.title}".`);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`booking-week-event booking-week-flat-card booking-week-ticket-${typeKey} ${isUserAttending ? 'booking-week-attending' : 'booking-week-non-attending'} ${vertical ? 'booking-week-feed-card' : ''} ${
        compact ? 'booking-week-out-hours-card' : ''
      } ${past ? 'booking-week-past-event is-past-event' : ''}`}
      style={
        vertical || compact
          ? ({ border: 'none', ...(past ? { opacity: 0.65 } : {}) } as React.CSSProperties)
          : ({
              border: 'none',
              left: `${left}%`,
              width: `calc(${width}% - 4px)`,
              ['--booking-week-right']: `${100 - left - width}%`,
              ...(past ? { opacity: 0.65 } : {}),
            } as React.CSSProperties)
      }
    >
      <button
        type="button"
        className="booking-week-card-button"
        aria-label={`${eventTime(event)} ${event.title}`}
        onClick={() => onSelect(event)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        {/* Chấm tròn vàng ở góc phải nếu lịch đã điều chỉnh (Task 7) */}
        {event.isAdjusted && (
          <span
            className="booking-week-adjusted-dot"
            title={event.adjustedNote ? `Đã điều chỉnh: ${event.adjustedNote}` : 'Lịch đã điều chỉnh'}
          />
        )}

        <div className="booking-week-card-top">
          <div className="booking-week-card-time-group" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Chấm tròn trạng thái trước giờ (Task 7) */}
            <span
              className={`booking-week-status-dot dot-${statusKey}`}
              title={`Trạng thái: ${approvalMeta.label}`}
            />
            <span
              className={`booking-week-card-time ${isUserAttending ? 'is-attending-time' : ''}`}
              title={eventTime(event)}
              style={isUserAttending ? { color: '#D92D20', fontWeight: 600 } : { color: '#475467', fontWeight: 500 }}
            >
              {eventTime(event)}
            </span>
          </div>

          {isEditorial && !isUserAttending && !past && (
            <span
              role="button"
              tabIndex={0}
              className={`booking-week-card-star ${starred ? 'is-interested' : ''}`}
              aria-label="Quan tâm lịch họp"
              title="Nhắc trước 15 phút"
              onClick={handleToggleStar}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleStar(e);
                }
              }}
            >
              {starred ? <StarFilled style={{ color: '#f59e0b' }} /> : <StarOutlined />}
              {starred && (
                <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                  Bạn sẽ được nhắc nhở trước 15 phút
                </span>
              )}
            </span>
          )}
        </div>

        {(event.continuesFromPreviousDay || event.continuesToNextDay) && (
          <small className="booking-week-continuation">
            {event.continuesFromPreviousDay ? 'Tiếp tục từ ngày trước' : 'Kéo dài sang ngày sau'}
          </small>
        )}

        {/* Tên sự kiện: Hiển thị đầy đủ, không cắt 3 chấm (Task 4) */}
        <div className="booking-week-card-title">{event.title}</div>

        <div className="booking-week-card-meta-list">
          {Boolean(event.location) && (
            <div className="booking-week-card-location" title={event.location}>
              <EnvironmentOutlined className="booking-week-card-loc-icon" aria-hidden="true" style={{ color: '#667085' }} />
              <span>{event.location}</span>
            </div>
          )}
          {event.ticketType === 'MEETING' && Boolean(event.leader?.trim()) && (
            <div className="booking-week-card-leader" title={`Chủ trì: ${event.leader}`}>
              <UserOutlined className="booking-week-card-loc-icon" aria-hidden="true" style={{ color: '#667085' }} />
              <span>Chủ trì: <strong>{event.leader}</strong></span>
            </div>
          )}
          {event.ticketType === 'TASK' && Boolean(event.executorText) && (
            <div className="booking-week-card-leader" title={`Thực hiện: ${event.executorText}`}>
              <UserOutlined className="booking-week-card-loc-icon" aria-hidden="true" style={{ color: '#667085' }} />
              <span>{event.executorText}</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
});

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
  onToggleInterest,
  disabledHover = false,
}: {
  events: NormalizedMeetingEvent[];
  late?: boolean;
  upward?: boolean;
  now: Dayjs;
  loading?: boolean;
  onSelectEvent: (event: NormalizedMeetingEvent) => void;
  onToggleInterest?: (event: NormalizedMeetingEvent, nextState: boolean) => void;
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
            onToggleInterest={onToggleInterest}
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
  onToggleInterest?: (event: NormalizedMeetingEvent, nextState: boolean) => void;
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
  onToggleInterest,
  loading = false,
  disabledHover = false,
}: WeekTimelineProps) {
  const hours = Array.from({ length: 11 }, (_, index) => index + 7);
  const currentMinutes = now.hour() * 60 + now.minute();
  const withinTimeline = week.isSame(now, 'isoWeek') && currentMinutes >= 420 && currentMinutes < 1080;

  // Tối ưu hóa: Nhóm sự kiện theo ngày một lần duy nhất với useMemo
  const eventsByDay = useMemo(() => {
    const map = new Map<string, NormalizedMeetingEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

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
          const dayEvents = eventsByDay.get(date) || [];
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
                onToggleInterest={onToggleInterest}
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
                    onToggleInterest={onToggleInterest}
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
                onToggleInterest={onToggleInterest}
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
