import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TooltipPlacement } from 'antd/es/tooltip';
import type { Dayjs } from 'dayjs';
import { Button, Popover, Skeleton, message } from 'antd';
import {
  ClockCircleOutlined,
  DownOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  RightOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  dayNames,
  eventTime,
  eventTimeRange,
  eventDurationText,
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
  upward = false,
  onSelect,
  onToggleInterest,
  vertical = false,
  compact = false,
  expandLeft = false,
  disabledHover = false,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getInitialPlacement = (): TooltipPlacement => {
    if (vertical) {
      return expandLeft ? 'leftTop' : 'rightTop';
    }
    return upward ? 'top' : 'bottom';
  };

  const [placement, setPlacement] = useState<TooltipPlacement>(getInitialPlacement);

  const updatePlacement = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const POPOVER_WIDTH = 340;
    const POPOVER_HEIGHT = 280;

    if (vertical) {
      const spaceRight = vw - rect.right;
      const spaceLeft = rect.left;

      // Card horizontal center - nếu nằm ở nửa phải màn hình hoặc bên phải không đủ rộng thì mở sang trái
      const cardCenterX = rect.left + rect.width / 2;
      const goLeft = spaceRight < POPOVER_WIDTH || cardCenterX > vw / 2 || (expandLeft && spaceLeft >= POPOVER_WIDTH);

      // Căn chỉnh trục dọc:
      // Khi căn top (*Top), đỉnh popover nằm ở rect.top (không bao giờ âm nếu rect.top >= 0).
      // Chỉ căn bottom (*Bottom) khi khoảng trống phía dưới không đủ VÀ rect.bottom đủ cao để không bị tràn ngược lên đỉnh màn hình!
      const spaceBelow = vh - rect.top;
      const canFitBelow = spaceBelow >= POPOVER_HEIGHT;
      const canFitAbove = rect.bottom >= POPOVER_HEIGHT + 20;
      const goUpward = !canFitBelow && canFitAbove;

      if (goLeft) {
        setPlacement(goUpward ? 'leftBottom' : 'leftTop');
      } else {
        setPlacement(goUpward ? 'rightBottom' : 'rightTop');
      }
    } else {
      const spaceBelow = vh - rect.bottom;
      const spaceAbove = rect.top;
      const goUpward = spaceBelow < POPOVER_HEIGHT && spaceAbove >= POPOVER_HEIGHT + 20;
      setPlacement(goUpward ? 'top' : 'bottom');
    }
  }, [vertical, expandLeft]);

  useEffect(() => {
    setPlacement(getInitialPlacement());
  }, [vertical, expandLeft, upward]);
  const [starred, setStarred] = useState(Boolean(event.isInterested));

  useEffect(() => {
    setStarred(Boolean(event.isInterested));
  }, [event.isInterested]);

  useEffect(() => {
    if (disabledHover) {
      setExpanded(false);
    }
  }, [disabledHover]);

  const isEditorial = event.scope === 'editorial';
  const isPersonal = event.scope === 'personal';
  const isTaskTicket = event.ticketType === 'TASK';

  // Lịch có tôi tham gia (kể cả họp MEETING hay sự kiện EVENT, hoặc do tôi tạo / cá nhân / theo dõi)
  const isUserAttending = Boolean(event.isUserParticipant || event.isUserWatcher);
  const canOpenDrawer = isUserAttending;

  const typeMeta = getTicketTypeMeta(event.ticketType);
  const approvalMeta = getApprovalStatusMeta(event.approvalStatus, event.ticketType, event.workflowType);
  const typeKey = String(event.ticketType || 'MEETING').toLowerCase();
  const statusKey = approvalMeta.tone;

  // Chỉ dùng 2 màu đánh dấu theo yêu cầu:
  // 1. Phiếu cá nhân / việc cá nhân: Xanh dương (booking-week-personal)
  // 2. Ban biên tập có tôi tham gia: Đỏ (booking-week-attending)
  // 3. Toàn bộ còn lại (không tham gia): Trung tính xám / trắng (booking-week-non-attending)
  const isMyPersonal = isPersonal || isTaskTicket;
  const isMyEditorial = isEditorial && isUserAttending;

  const cardColorClass = !isUserAttending
    ? 'booking-week-non-attending'
    : isMyPersonal
    ? 'booking-week-personal'
    : 'booking-week-attending';

  const typeBadgeClass = !isUserAttending
    ? 'booking-week-type-badge booking-week-type-neutral'
    : isMyPersonal
    ? 'booking-week-type-badge booking-week-type-task'
    : 'booking-week-type-badge booking-week-type-meeting';

  const hasStatus = Boolean(
    approvalMeta &&
    approvalMeta.label &&
    (!isEditorial || (event.approvalStatus && event.approvalStatus !== 'SCHEDULED')) &&
    approvalMeta.value !== 'SCHEDULED'
  );
  const past = Boolean(
    now &&
      event.end &&
      event.end.isBefore(now) &&
      (event.start.isSame(now, 'isoWeek') || event.end.isSame(now, 'isoWeek'))
  );

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

  const attachmentTotal = event.attachmentCount ?? event.attachments.length;
  const commentTotal = event.commentCount ?? event.raw?.comments?.length ?? 0;

  const popoverContent = (
    <div className="booking-week-card-expanded-content">
      <div className="booking-week-card-expanded-badges">
        <span className={typeBadgeClass}>{typeMeta.label}</span>
        {hasStatus && (
          <span className={`booking-week-status-badge booking-week-status-${statusKey}`}>{approvalMeta.label}</span>
        )}
      </div>
      <strong className="booking-week-popover-title">{event.title}</strong>

      {event.isAdjusted && (
        <div className="booking-week-card-adjusted-alert">
          <strong>Đã điều chỉnh{event.adjustedNote ? ':' : ''}</strong> {event.adjustedNote}
        </div>
      )}

      <div className="booking-week-popover-row">
        <span className="booking-week-popover-icon"><ClockCircleOutlined /></span>
        <span className="booking-week-popover-text">
          <b>Thời gian:</b> {eventTimeRange(event)}
          {eventDurationText(event) ? ` (${eventDurationText(event)})` : ''}
        </span>
      </div>
      {(event.location || (!isEditorial && event.ticketType !== 'TASK')) && (
        <div className="booking-week-popover-row">
          <span className="booking-week-popover-icon"><EnvironmentOutlined /></span>
          <span className="booking-week-popover-text"><b>Địa điểm:</b> {event.location || 'Chưa có địa điểm'}</span>
        </div>
      )}
      {event.ticketType === 'MEETING' && Boolean(event.leader?.trim()) && (
        <div className="booking-week-popover-row">
          <span className="booking-week-popover-icon"><UserOutlined /></span>
          <span className="booking-week-popover-text"><b>Chủ trì:</b> {event.leader}</span>
        </div>
      )}
      {isEditorial ? (
        Boolean(event.participantText) && (
          <div className="booking-week-popover-row">
            <span className="booking-week-popover-icon"><TeamOutlined /></span>
            <span className="booking-week-popover-text">
              <b>Thành phần:</b> <ParticipantList text={event.participantText} scrollExpanded />
            </span>
          </div>
        )
      ) : (
        event.ticketType !== 'TASK' && (
          <div className="booking-week-popover-row">
            <span className="booking-week-popover-icon"><TeamOutlined /></span>
            <span className="booking-week-popover-text">
              <ParticipantList
                text={
                  event.participantText ||
                  (event.participantCount ? `${event.participantCount} người tham gia · Xem trong chi tiết` : 'Chưa có thông tin thành phần')
                }
                scrollExpanded
              />
            </span>
          </div>
        )
      )}
      {Boolean(event.dutyInfo) && (
        <div className="booking-week-popover-row">
          <span className="booking-week-popover-icon"><ClockCircleOutlined /></span>
          <span className="booking-week-popover-text"><b>Trực ban:</b> {event.dutyInfo}</span>
        </div>
      )}
      {!isEditorial && event.ticketType !== 'MEETING' && event.executorText && (
        <div className="booking-week-popover-row">
          <span className="booking-week-popover-icon"><UserOutlined /></span>
          <span className="booking-week-popover-text">Triển khai: {event.executorText}</span>
        </div>
      )}
      {!isEditorial && event.ticketType !== 'MEETING' && event.approver && (
        <div className="booking-week-popover-row">
          <span className="booking-week-popover-icon"><UserOutlined /></span>
          <span className="booking-week-popover-text">Người duyệt: {event.approver.display_name || event.approver.name}</span>
        </div>
      )}
      {!isEditorial && event.ticketType !== 'MEETING' && event.watcherText && (
        <div className="booking-week-popover-row">
          <span className="booking-week-popover-icon"><EyeOutlined /></span>
          <span className="booking-week-popover-text">Theo dõi: {event.watcherText}</span>
        </div>
      )}


      {(canOpenDrawer || attachmentTotal > 0 || commentTotal > 0) && (
        <div className="booking-week-card-footer">
          <span>
            {attachmentTotal} tài liệu{commentTotal > 0 ? ` · ${commentTotal} thảo luận` : ''}
          </span>
          {canOpenDrawer && (
            <Button
              type="link"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
                onSelect(event);
              }}
            >
              Xem chi tiết <RightOutlined />
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // dynamic placement





  return (
    <div
      ref={cardRef}
      onMouseEnter={() => {
        if (!disabledHover) {
          updatePlacement();
        }
      }}
      className={`booking-week-event booking-week-ticket-${typeKey} ${vertical ? 'booking-week-feed-card' : ''} ${
        compact ? 'booking-week-out-hours-card' : ''
      } ${past ? 'booking-week-past-event' : ''} ${cardColorClass} ${expanded && !disabledHover ? 'booking-week-expanded' : ''}`}
      style={
        vertical || compact
          ? undefined
          : ({
              left: `${left}%`,
              width: `calc(${width}% - 4px)`,
              ['--booking-week-right']: `${100 - left - width}%`,
            } as React.CSSProperties)
      }
    >
      <Popover
        content={popoverContent}
        open={expanded && !disabledHover}
        onOpenChange={(visible) => {
          if (disabledHover) {
            setExpanded(false);
            return;
          }
          if (visible) {
            updatePlacement();
          }
          setExpanded(visible);
        }}
        trigger="hover"
        mouseEnterDelay={0.09}
        mouseLeaveDelay={0.12}
        placement={placement}
        overlayClassName="booking-week-card-popover"
        autoAdjustOverflow={{ adjustX: 1, adjustY: 1 }}
        destroyOnHidden
        arrow={false}
      >
        <button
          type="button"
          className="booking-week-card-button"
          aria-label={`${eventTime(event)} ${event.title}`}
          onClick={() => {
            if (!canOpenDrawer) return;
            setExpanded(false);
            onSelect(event);
          }}
          style={{ cursor: canOpenDrawer ? 'pointer' : 'default' }}
        >
          <div className="booking-week-card-top">
            <span className="booking-week-card-time" title={eventTime(event)}>
              {eventTimeRange(event)}
            </span>
            <span className="booking-week-card-badges">
              <span className={typeBadgeClass}>
                {typeMeta.label}
              </span>
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
            </span>
          </div>

          {(event.continuesFromPreviousDay || event.continuesToNextDay) && (
            <small className="booking-week-continuation">
              {event.continuesFromPreviousDay ? 'Tiếp tục từ ngày trước' : 'Kéo dài sang ngày sau'}
            </small>
          )}

          {hasStatus && (
            <div className="booking-week-card-status-row">
              <span className={`booking-week-status-badge booking-week-status-${statusKey}`}>
                {approvalMeta.label}
              </span>
            </div>
          )}

          <div className="booking-week-card-title">{event.title}</div>

          {event.isAdjusted && <span className="booking-week-adjusted">Đã điều chỉnh</span>}

          <div className="booking-week-card-meta-list">
            {Boolean(event.location) && (
              <div className="booking-week-card-location" title={event.location}>
                <EnvironmentOutlined className="booking-week-card-loc-icon" aria-hidden="true" />
                <span>{event.location}</span>
              </div>
            )}
            {event.ticketType === 'MEETING' && Boolean(event.leader?.trim()) && (
              <div className="booking-week-card-leader" title={`Chủ trì: ${event.leader}`}>
                <UserOutlined className="booking-week-card-loc-icon" aria-hidden="true" />
                <span>Chủ trì: <strong>{event.leader}</strong></span>
              </div>
            )}
            {event.ticketType === 'TASK' && Boolean(event.executorText) && (
              <div className="booking-week-card-leader" title={`Thực hiện: ${event.executorText}`}>
                <UserOutlined className="booking-week-card-loc-icon" aria-hidden="true" />
                <span>{event.executorText}</span>
              </div>
            )}
          </div>
        </button>
      </Popover>
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
