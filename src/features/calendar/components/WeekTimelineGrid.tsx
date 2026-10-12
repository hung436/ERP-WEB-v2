import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '@/types/domain';
import { CalendarEventCard } from './CalendarEventCard';
import { DayDutyCard } from './DayDutyCard';
import { getDayDutyInfo } from '../dutySchedule';

interface WeekTimelineGridProps {
  currentWeekStart: Dayjs;
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  filterEditorial: boolean;
  filterPersonal: boolean;
  filterOnlyMyEvents: boolean;
}

export function WeekTimelineGrid({
  currentWeekStart,
  events,
  onSelectEvent,
  filterEditorial,
  filterPersonal,
  filterOnlyMyEvents,
}: WeekTimelineGridProps) {
  const now = dayjs();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDutyExpanded, setIsDutyExpanded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 7 days from Monday to Sunday
  const days = Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, 'day'));

  // Detect scroll to collapse event count line in sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const nextScrolled = scrollY > 20;
      setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll();

    let observer: IntersectionObserver | null = null;
    if (sentinelRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          const nextScrolled = !entry.isIntersecting;
          setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
        },
        { threshold: 0, rootMargin: '-68px 0px 0px 0px' }
      );
      observer.observe(sentinelRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Filter events based on active toggles
  const filteredEvents = events.filter((ev) => {
    if (ev.scope === 'editorial' && !filterEditorial) return false;
    if (ev.scope === 'personal' && !filterPersonal) return false;
    if (filterOnlyMyEvents && !ev.isUserParticipant) return false;
    return true;
  });

  // Pre-calculate day events and info
  const dayDataList = days.map((day) => {
    const isToday = day.isSame(now, 'day');
    const dayStr = day.format('YYYY-MM-DD');
    const dayNameVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][day.day()];
    const duty = getDayDutyInfo(day);

    // Sort events chronologically by start time
    const dayEvents = filteredEvents
      .filter((e) => dayjs(e.startAt).format('YYYY-MM-DD') === dayStr)
      .sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf());

    return {
      day,
      dayStr,
      isToday,
      dayNameVi,
      duty,
      dayEvents,
    };
  });

  return (
    <div className="week-timeline-container">
      {/* Scroll detection sentinel */}
      <div className="week-scroll-sentinel" ref={sentinelRef} aria-hidden="true" />

      {/* Dải phẳng đồng nhất 7 ô header (Sticky Unified Header Strip) */}
      <div className={`week-sticky-header-strip${isScrolled ? ' is-scrolled' : ''}`}>
        <div className="week-header-cells-row">
          {dayDataList.map(({ day, dayStr, isToday, dayNameVi, duty, dayEvents }) => (
            <div
              className={`week-day-header-cell week-day-column-header${isToday ? ' is-today' : ''}`}
              key={dayStr}
            >
              <div className="week-day-title-row">
                <span className="week-day-name">{dayNameVi}</span>
                <span className="week-day-date-number">{day.format('DD/MM')}</span>
              </div>

              <div className={`week-day-sub-info${isScrolled ? ' is-hidden' : ''}`}>
                <span>{dayEvents.length} sự kiện</span>
                {isToday && <span className="week-day-today-badge">Hôm nay</span>}
              </div>

              {duty && (
                <DayDutyCard
                  duty={duty}
                  isOpen={isDutyExpanded}
                  onToggle={() => setIsDutyExpanded((prev) => !prev)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Events List arranged by time in 7 columns */}
      <div className="week-list-board">
        {dayDataList.map(({ dayStr, isToday, dayEvents }) => (
          <div
            className={`week-day-column-card${isToday ? ' is-today' : ''}`}
            key={dayStr}
          >
            <div className="week-day-event-list">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                  <CalendarEventCard
                    event={event}
                    key={event.id}
                    onSelectEvent={onSelectEvent}
                  />
                ))
              ) : (
                <div className="week-day-empty-state">Không có lịch</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
