import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useRef, useState } from 'react';
import type { CalendarEvent } from '@/types/domain';
import { CalendarEventCard } from './CalendarEventCard';
import { getDayDutyInfo } from '../dutySchedule';

interface WeekVerticalGridProps {
  currentWeekStart: Dayjs;
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectDay?: (day: Dayjs) => void;
  filterEditorial: boolean;
  filterPersonal: boolean;
  filterOnlyMyEvents: boolean;
  disabledHover?: boolean;
}

export function WeekVerticalGrid({
  currentWeekStart,
  events,
  onSelectEvent,
  onSelectDay,
  filterEditorial,
  filterPersonal,
  filterOnlyMyEvents,
  disabledHover,
}: WeekVerticalGridProps) {
  const now = dayjs();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRafRef = useRef<number | null>(null);
  const isScrolledRef = useRef(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      // Vùng đệm trễ (Hysteresis): cuộn xuống > 70px mới ẩn ca trực, chỉ hiện lại khi cuộn về sát đỉnh < 15px
      // Tránh hiện tượng giật lag / nhấp nháy liên tục khi người dùng chỉ cuộn nhẹ
      if (scrollTop > 70 && !isScrolledRef.current) {
        isScrolledRef.current = true;
        setIsScrolled(true);
      } else if (scrollTop < 15 && isScrolledRef.current) {
        isScrolledRef.current = false;
        setIsScrolled(false);
      }
    });
  };

  // 7 ngày trong tuần từ Thứ Hai đến Chủ Nhật
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, 'day')),
    [currentWeekStart]
  );

  // Lọc sự kiện theo bộ lọc
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (ev.scope === 'editorial' && !filterEditorial) return false;
      if (ev.scope === 'personal' && !filterPersonal) return false;
      if (filterOnlyMyEvents && !ev.isUserParticipant) return false;
      return true;
    });
  }, [events, filterEditorial, filterPersonal, filterOnlyMyEvents]);

  // Tính toán dữ liệu cho 7 cột ngày
  const dayColumns = useMemo(() => {
    return days.map((day, dIdx) => {
      const isToday = day.isSame(now, 'day');
      const dayStr = day.format('YYYY-MM-DD');
      const dayNameVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][day.day()];
      const duty = getDayDutyInfo(day);

      const dayEvents = filteredEvents
        .filter((e) => dayjs(e.startAt).format('YYYY-MM-DD') === dayStr)
        .sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf());

      return {
        day,
        dayStr,
        dIdx,
        isToday,
        dayNameVi,
        duty,
        dayEvents,
      };
    });
  }, [days, filteredEvents, now]);

  return (
    <div
      className={`week-vertical-feed-wrapper${isScrolled ? ' is-scrolled' : ''}`}
      onScroll={handleScroll}
    >
      <div className="week-vertical-feed-grid">
        {dayColumns.map(({ day, dayStr, dIdx, isToday, dayNameVi, duty, dayEvents }) => {
          return (
            <div
              className={`vertical-feed-column${isToday ? ' is-today' : ''}`}
              key={dayStr}
            >
              {/* Header của cột ngày */}
              <div className="vertical-feed-column-header">
                <button
                  aria-label={`Xem danh sách lịch ngày ${dayNameVi} ${day.format('DD/MM')}`}
                  className="vertical-feed-day-btn"
                  onClick={() => onSelectDay?.(day)}
                  title={`Bấm để xem danh sách các sự kiện ${dayNameVi} (${day.format('DD/MM')})`}
                  type="button"
                >
                  <span className="vertical-feed-day-name">{dayNameVi.toUpperCase()}</span>

                  <div className="vertical-feed-date-side">
                    <span
                      className={`vertical-feed-date-badge${isToday ? ' is-today' : ''}`}
                      title={isToday ? 'Hôm nay' : undefined}
                    >
                      {day.format('DD/MM')}
                    </span>
                  </div>
                </button>

                {/* Thông tin trực ban hiển thị trực tiếp, bỏ đóng khung */}
                {duty && (
                  <div className="vertical-feed-duty-inline">
                    <div className="duty-inline-leader">
                      <span className="duty-prefix">Trực:</span>
                      <span className="duty-leader-name" title={duty.leader}>{duty.leader}</span>
                    </div>

                    {duty.shifts && duty.shifts.length > 0 && (
                      <div className="duty-inline-shifts">
                        {duty.shifts.map((shift, sIdx) => (
                          <div className="duty-inline-shift-row" key={sIdx}>
                            <span className="shift-badge">{shift.name}:</span>
                            <div className="shift-roles">
                              {shift.tkts && (
                                <div className="role-item">
                                  <span className="role-lbl">TKTS:</span>
                                  <span className="role-val">{shift.tkts}</span>
                                </div>
                              )}
                              {shift.btv && (
                                <div className="role-item">
                                  <span className="role-lbl">BTV:</span>
                                  <span className="role-val">{shift.btv}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Danh sách các sự kiện dạng thẻ theo chiều dọc (Không dùng khung thời gian) */}
              <div className="vertical-feed-events-list">
                {dayEvents.map((event, idx) => {
                  // Ưu tiên hiển thị popup bên phải thẻ; chỉ những ngày sát mép ngoài bên phải (Thứ 7, CN) mới bung sang trái
                  const isNearRightEdge = dIdx >= 5;
                  const isBottomHalf = idx >= 4;

                  return (
                    <CalendarEventCard
                      className={`vertical-feed-card ${isNearRightEdge ? 'expand-left' : 'expand-right'} ${isBottomHalf ? 'expand-upward' : ''}`}
                      disabledHover={disabledHover}
                      event={event}
                      key={event.id}
                      onSelectEvent={onSelectEvent}
                    />
                  );
                })}

                {dayEvents.length === 0 && (
                  <div className="vertical-feed-empty-state">
                    <span>Không có sự kiện</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
