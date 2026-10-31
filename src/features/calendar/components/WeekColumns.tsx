import { useState, type UIEvent } from 'react';
import type { Dayjs } from 'dayjs';
import { Skeleton } from 'antd';
import { dayNames, type DutyShiftData, type NormalizedMeetingEvent } from '../calendarWeekUtils';
import { EventCard } from './WeekTimeline';

function DutyShifts({ shifts, past = false }: { shifts?: Record<string, any>; past?: boolean }) {
  if (!shifts) return null;
  return (
    <div className="booking-week-column-shifts">
      {Object.entries(shifts).map(([name, roles]) => (
        <div className={`booking-week-column-shift ${past ? 'booking-week-past-duty' : ''}`} key={name}>
          <b>{name.replace(/_/g, ' ').replace(/^ca/i, 'Ca')}:</b>
          <div>
            {typeof roles === 'object' && roles !== null
              ? Object.entries(roles)
                  .sort(([a], [b]) => (a.toUpperCase() === 'TKTS' ? -1 : b.toUpperCase() === 'TKTS' ? 1 : a.localeCompare(b)))
                  .map(([role, names]) => (
                    <div className="booking-week-column-role" key={role}>
                      <b>{role.toUpperCase()}:</b>
                      <span>{Array.isArray(names) ? names.join(', ') : String(names || '—')}</span>
                    </div>
                  ))
              : String(roles || '—')}
          </div>
        </div>
      ))}
    </div>
  );
}

interface WeekColumnsProps {
  week: Dayjs;
  now: Dayjs;
  selectedDate: Dayjs;
  events: NormalizedMeetingEvent[];
  duties: Record<string, DutyShiftData>;
  loading?: boolean;
  onSelectDay: (day: Dayjs) => void;
  onSelectEvent: (event: NormalizedMeetingEvent) => void;
  disabledHover?: boolean;
}

export function WeekColumns({
  week,
  now,
  selectedDate,
  events,
  duties,
  loading = false,
  onSelectDay,
  onSelectEvent,
  disabledHover = false,
}: WeekColumnsProps) {
  const [compact, setCompact] = useState(false);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const top = event.currentTarget.scrollTop;
    if (top > 70 && !compact) setCompact(true);
    else if (top < 15 && compact) setCompact(false);
  };

  return (
    <div
      className={`booking-week-columns-scroll ${compact ? 'booking-week-columns-compact' : ''}`}
      aria-label="Lịch họp tuần theo cột ngày"
      aria-busy={loading}
      onScroll={handleScroll}
    >
      <div className="booking-week-columns-grid">
        {dayNames.map((name, index) => {
          const day = week.add(index, 'day');
          const date = day.format('YYYY-MM-DD');
          const duty = duties[date];
          const selected = date === selectedDate.format('YYYY-MM-DD');
          const pastDuty = week.isSame(now, 'isoWeek') && day.isBefore(now, 'day');
          const dayEvents = events
            .filter((event) => event.date === date)
            .sort((a, b) => a.start.valueOf() - b.start.valueOf());

          return (
            <section
              className={`booking-week-column ${selected ? 'booking-week-column-selected' : ''}`}
              key={date}
              aria-label={`${name} ${day.format('DD/MM')}`}
            >
              <div className="booking-week-column-header">
                <button
                  type="button"
                  className="booking-week-column-day"
                  aria-label={`Xem danh sách lịch ngày ${name} ${day.format('DD/MM')}`}
                  onClick={() => onSelectDay(day)}
                  disabled={loading}
                >
                  <span>{name}</span>
                  <b className="booking-week-column-date">{day.format('DD/MM')}</b>
                </button>

                <div className="booking-week-column-duty">
                  {loading ? (
                    <Skeleton active title={false} paragraph={{ rows: 4, width: ['80%', '95%', '85%', '90%'] }} />
                  ) : (
                    <>
                      <div className={`booking-week-column-leader ${pastDuty ? 'booking-week-past-duty' : ''}`}>
                        <span>Trực:</span>
                        <strong title={duty?.leader}>{duty?.leader || 'Chưa có thông tin'}</strong>
                      </div>
                      <DutyShifts shifts={duty?.shifts} past={pastDuty} />
                    </>
                  )}
                </div>
              </div>

              <div className="booking-week-column-events">
                {loading
                  ? [0, 1, 2].map((item) => (
                      <div key={item} className="booking-week-feed-skeleton">
                        <Skeleton active title={{ width: '45%' }} paragraph={{ rows: 2, width: ['95%', '65%'] }} />
                      </div>
                    ))
                  : dayEvents.map((event, eventIndex) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        now={now}
                        vertical
                        expandLeft={index >= 5}
                        upward={eventIndex >= 4}
                        onSelect={onSelectEvent}
                        disabledHover={disabledHover}
                      />
                    ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default WeekColumns;
