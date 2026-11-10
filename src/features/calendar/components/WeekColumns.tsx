import { getDayDutyInfo } from '../dutySchedule';
import { useMemo } from 'react';
import type { Dayjs } from 'dayjs';
import { Skeleton } from 'antd';

import { dayNames, type NormalizedMeetingEvent } from '../calendarWeekUtils';

import { EventCard } from './WeekTimeline';

export interface WeekColumnsProps {
  week: Dayjs;
  now: Dayjs;
  selectedDate: Dayjs | null;
  events: NormalizedMeetingEvent[];

  loading?: boolean;
  onSelectDay: (day: Dayjs) => void;
  onSelectEvent: (event: NormalizedMeetingEvent) => void;
  onToggleInterest?: (event: NormalizedMeetingEvent, nextState: boolean) => void;
  disabledHover?: boolean;
}

export function WeekColumns({
  week,
  now,
  selectedDate,
  events,

  loading = false,
  onSelectDay,
  onSelectEvent,
  onToggleInterest,
  disabledHover = false,
}: WeekColumnsProps) {
  // Tối ưu hóa: Nhóm các sự kiện theo ngày 1 lần duy nhất với useMemo (O(N) thay vì lặp O(7*N))
  const eventsByDay = useMemo(() => {
    const map = new Map<string, NormalizedMeetingEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start.valueOf() - b.start.valueOf());
    }
    return map;
  }, [events]);

  return (
    <div

      className="booking-week-columns-scroll"
      aria-label="Lịch họp tuần theo cột ngày"
      aria-busy={loading}
    >
      <div className="booking-week-columns-grid">
        {dayNames.map((name, index) => {
          const day = week.add(index, 'day');
          const date = day.format('YYYY-MM-DD');
          const dutyLeader = getDayDutyInfo(day)?.leader;

          const selected = date === selectedDate?.format('YYYY-MM-DD');
          const isToday = day.isSame(now, 'day');

          const dayEvents = eventsByDay.get(date) || [];

          return (
            <section
              className={`booking-week-column ${selected ? 'booking-week-column-selected' : ''} ${
                isToday ? 'booking-week-column-today' : ''
              }`}
              key={date}
              aria-label={`${name} ${day.format('DD/MM')}`}
            >
              <div className="booking-week-column-header">
                <div className="booking-week-column-day-row">
                  <button
                    type="button"
                    className="booking-week-column-day"
                    aria-label={`Xem ca trực ngày ${name} ${day.format('DD/MM')}`}
                    data-calendar-day={date}
                    onClick={() => onSelectDay(day)}
                    disabled={loading}
                  >
                    <span className="booking-week-column-day-title">
                      <span>{name}</span>
                    </span>
                    <b className="booking-week-column-date">{day.format('DD/MM')}</b>
                  </button>
                </div>

                {dutyLeader && <div className="booking-week-day-duty-leader">Trực: <strong>{dutyLeader}</strong></div>}
              </div>

              <div className="booking-week-column-events">
                {loading ? (
                  [0, 1, 2].map((item) => (
                    <div key={item} className="booking-week-feed-skeleton">
                      <Skeleton active title={{ width: '45%' }} paragraph={{ rows: 2, width: ['95%', '65%'] }} />
                    </div>
                  ))
                ) : dayEvents.length === 0 ? (
                  <div className="booking-week-column-empty">
                    <span>Chưa có mục ghi</span>
                  </div>
                ) : (
                  dayEvents.map((event, eventIndex) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      now={now}
                      vertical
                      expandLeft={index >= 3}
                      upward={eventIndex >= 4}
                      onSelect={onSelectEvent}
                      onToggleInterest={onToggleInterest}
                      disabledHover={disabledHover}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default WeekColumns;
