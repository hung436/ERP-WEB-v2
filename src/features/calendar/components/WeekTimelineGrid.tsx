import dayjs, { type Dayjs } from 'dayjs';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CalendarEvent } from '@/types/domain';
import { CalendarEventCard } from './CalendarEventCard';
import { getDayDutyInfo } from '../dutySchedule';

interface WeekTimelineGridProps {
  currentWeekStart: Dayjs;
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectDay?: (day: Dayjs) => void;
  filterEditorial: boolean;
  filterPersonal: boolean;
  filterOnlyMyEvents: boolean;
}

const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 19;
const TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60; // 720 minutes

const TIMELINE_HOURS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

interface PositionedEvent {
  event: CalendarEvent;
  leftPct: number;
  widthPct: number;
  rightOffsetPct: number;
  isRightAligned: boolean;
}

function computePositionedEvents(events: CalendarEvent[]): PositionedEvent[] {
  if (events.length === 0) {
    return [];
  }

  const parsed = events.map((ev) => {
    const s = dayjs(ev.startAt);
    const e = dayjs(ev.endAt);
    const startM = s.hour() * 60 + s.minute();
    const rawEndM = e.hour() * 60 + e.minute();
    const endM = Math.max(startM + 30, rawEndM);
    return { ev, startM, endM };
  });

  // Sắp xếp theo giờ bắt đầu; nếu cùng giờ thì ưu tiên sự kiện có mặt người dùng trước
  parsed.sort((a, b) => {
    if (a.startM !== b.startM) return a.startM - b.startM;
    if (Boolean(a.ev.isUserParticipant) !== Boolean(b.ev.isUserParticipant)) {
      return a.ev.isUserParticipant ? -1 : 1;
    }
    return (b.endM - b.startM) - (a.endM - a.startM);
  });

  const baseM = TIMELINE_START_HOUR * 60;
  const positioned: PositionedEvent[] = [];
  let prevLeftPct = -100;

  for (let i = 0; i < parsed.length; i++) {
    const { ev, startM, endM } = parsed[i];
    const clampedStart = Math.max(baseM, startM);
    const clampedEnd = Math.min(TIMELINE_END_HOUR * 60, endM);

    let leftPct = Math.max(0, Math.min(94, ((clampedStart - baseM) / TOTAL_MINUTES) * 100));

    // Phân tầng so le (stagger) nếu sự kiện bắt đầu quá sát sự kiện trước (trùng giờ) để không bị che khuất thẻ
    if (leftPct >= prevLeftPct && leftPct - prevLeftPct < 3.8) {
      leftPct = Math.min(94, prevLeftPct + 3.8);
    }
    prevLeftPct = leftPct;

    const rawWidthPct = ((clampedEnd - clampedStart) / TOTAL_MINUTES) * 100;
    const widthPct = Math.max(4.2, Math.min(rawWidthPct, 100 - leftPct));
    // Chỉ các sự kiện sát mép phải từ 16:00 trở đi (leftPct >= 72%) mới mở rộng về bên trái; các sự kiện ở giữa (14:00 - 15:30) vẫn mở rộng sang phải
    const isRightAligned = leftPct >= 72;
    const rightOffsetPct = Math.max(0.5, 100 - (leftPct + widthPct));

    positioned.push({
      event: ev,
      leftPct,
      widthPct,
      rightOffsetPct,
      isRightAligned,
    });
  }

  return positioned;
}

export function WeekTimelineGrid({
  currentWeekStart,
  events,
  onSelectEvent,
  onSelectDay,
  filterEditorial,
  filterPersonal,
  filterOnlyMyEvents,
}: WeekTimelineGridProps) {
  const now = dayjs();
  const [expandedDutyDays, setExpandedDutyDays] = useState<Record<string, boolean>>({});

  const toggleDayDuty = (dayStr: string) => {
    setExpandedDutyDays((prev) => {
      const isCurrentlyOpen = Boolean(prev[dayStr]);
      return isCurrentlyOpen ? {} : { [dayStr]: true };
    });
  };

  // Đóng popup ca trực tự động khi click chuột ra ngoài hoặc nhấn phím Escape
  useEffect(() => {
    const hasExpanded = Object.values(expandedDutyDays).some(Boolean);
    if (!hasExpanded) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.timeline-day-duty-box')) {
        return;
      }
      setExpandedDutyDays({});
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedDutyDays({});
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedDutyDays]);

  // 7 days from Monday to Sunday
  const days = Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, 'day'));

  // Filter events based on active toggles
  const filteredEvents = events.filter((ev) => {
    if (ev.scope === 'editorial' && !filterEditorial) return false;
    if (ev.scope === 'personal' && !filterPersonal) return false;
    if (filterOnlyMyEvents && !ev.isUserParticipant) return false;
    return true;
  });

  // Calculate day timeline data (all events on the same single row)
  const dayDataList = days.map((day) => {
    const isToday = day.isSame(now, 'day');
    const dayStr = day.format('YYYY-MM-DD');
    const dayNameVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][day.day()];
    const duty = getDayDutyInfo(day);

    const dayEvents = filteredEvents.filter((e) => dayjs(e.startAt).format('YYYY-MM-DD') === dayStr);
    const positionedEvents = computePositionedEvents(dayEvents);

    return {
      day,
      dayStr,
      isToday,
      dayNameVi,
      duty,
      dayEvents,
      positionedEvents,
    };
  });

  const [activePopupDayIdx, setActivePopupDayIdx] = useState<number | null>(null);

  // Check which hour slot has highlight tint (matches 08:00 - 09:00 slot 1 like mockup)
  const currentHourIndex = now.hour() >= TIMELINE_START_HOUR && now.hour() < TIMELINE_END_HOUR
    ? now.hour() - TIMELINE_START_HOUR
    : 1;

  return (
    <div className="timeline-horizontal-wrapper">
      <div className="timeline-horizontal-container">
        {/* Header Row: Corner Cell + 12 Hours */}
        <div className="timeline-header-row">
          <div className="timeline-corner-cell" />
          <div className="timeline-hours-track">
            {TIMELINE_HOURS.map((hour, idx) => (
              <div
                className={`timeline-hour-label-cell${idx === currentHourIndex ? ' is-highlight-hour' : ''}`}
                key={hour}
              >
                <span>{hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7 Day Rows: Xếp chồng cùng 1 hàng */}
        <div className="timeline-body">
          {dayDataList.map(({ day, dayStr, isToday, dayNameVi, duty, dayEvents, positionedEvents }, dIdx) => {
            const isDayExpanded = Boolean(expandedDutyDays[dayStr]);
            const hasActivePopup = activePopupDayIdx === dIdx;

            return (
              <div
                className={`timeline-day-row${isToday ? ' is-today' : ''}${hasActivePopup ? ' has-active-popup' : ''}${isDayExpanded ? ' has-open-duty' : ''}`}
                key={dayStr}
                style={hasActivePopup ? { zIndex: 300 } : isDayExpanded ? { zIndex: 120 } : undefined}
              >
                {/* Left Day Header Column */}
                <div className={`timeline-day-header-cell${isToday ? ' is-today' : ''}`}>
                  <button
                    aria-label={`Xem danh sách lịch ngày ${dayNameVi} ${day.format('DD/MM')}`}
                    className="timeline-day-title-btn"
                    onClick={() => onSelectDay?.(day)}
                    title={`Bấm để xem danh sách các sự kiện ${dayNameVi} (${day.format('DD/MM')})`}
                    type="button"
                  >
                    <div className="timeline-day-title-row">
                      <span className="timeline-day-name">{dayNameVi}</span>
                      <span className={`timeline-day-date-pill${isToday ? ' is-today' : ''}`}>
                        {day.format('DD/MM')}
                      </span>
                    </div>
                    <span className="timeline-day-event-count">
                      {dayEvents.length} sự kiện <ChevronRight className="count-arrow" size={12} />
                    </span>
                  </button>

                  {duty && (
                    <div className="timeline-day-duty-box">
                      <button
                        aria-expanded={isDayExpanded}
                        aria-label={isDayExpanded ? 'Thu gọn các ca trực' : 'Mở rộng các ca trực'}
                        className="timeline-duty-leader-btn"
                        onClick={() => toggleDayDuty(dayStr)}
                        type="button"
                      >
                        <span className="timeline-duty-label">Trực:</span>
                        <span className="timeline-duty-name" title={duty.leader}>{duty.leader}</span>
                        <ChevronDown
                          className={`timeline-duty-chevron ${isDayExpanded ? 'is-open' : ''}`}
                          size={13}
                        />
                      </button>

                      {isDayExpanded && (
                        <div className={`timeline-duty-shifts-list ${dIdx >= 5 ? 'is-upward' : ''}`}>
                          {duty.shifts.map((shift, sIdx) => (
                            <div className="timeline-duty-shift-row" key={sIdx}>
                              <span className="timeline-shift-badge">{shift.name}:</span>
                              <div className="timeline-shift-content">
                                {shift.tkts && (
                                  <span className="timeline-role-item">
                                    <span className="role-lbl">TKTS:</span> {shift.tkts}
                                  </span>
                                )}
                                {shift.tkts && shift.btv && <span className="role-dot">·</span>}
                                {shift.btv && (
                                  <span className="timeline-role-item">
                                    <span className="role-lbl">BTV:</span> {shift.btv}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Timeline Canvas (Cùng 1 hàng, xếp chồng timeline) */}
                <div
                  className="timeline-day-track"
                  style={hasActivePopup ? { zIndex: 300 } : undefined}
                >
                  {/* Background 12 Columns & Current Hour Strip */}
                  <div className="timeline-grid-background" aria-hidden="true">
                    {TIMELINE_HOURS.map((hour, idx) => (
                      <div
                        className={`timeline-grid-col${idx === currentHourIndex ? ' is-highlight-col' : ''}`}
                        key={hour}
                      />
                    ))}
                  </div>

                  {/* Positioned Events Layer: cùng 1 hàng, mở rộng hiển thị chữ khi hover */}
                  <div
                    className="timeline-events-layer"
                    style={hasActivePopup ? { zIndex: 300 } : undefined}
                  >
                    {positionedEvents.map(({ event, leftPct, widthPct, rightOffsetPct, isRightAligned }, idx) => (
                      <CalendarEventCard
                        className={`timeline-single-lane-card ${isRightAligned ? 'expand-left' : 'expand-right'} ${dIdx >= 3 ? 'expand-upward' : ''}`}
                        event={event}
                        key={event.id}
                        onHoverChange={(isExpanded) => {
                          if (isExpanded) {
                            setActivePopupDayIdx(dIdx);
                          } else {
                            setActivePopupDayIdx((prev) => (prev === dIdx ? null : prev));
                          }
                        }}
                        onSelectEvent={onSelectEvent}
                        style={{
                          left: `${leftPct}%`,
                          width: `calc(${widthPct}% - 4px)`,
                          zIndex: idx + 2,
                          ['--card-right-offset' as any]: `max(8px, calc(${rightOffsetPct}% + 2px))`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
