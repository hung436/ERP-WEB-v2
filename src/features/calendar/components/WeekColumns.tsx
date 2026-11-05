import { useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { Skeleton } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

import { dayNames, type DutyShiftData, type NormalizedMeetingEvent } from '../calendarWeekUtils';

import { EventCard } from './WeekTimeline';

function DutyShifts({ shifts, past = false }: { shifts?: DutyShiftData['shifts']; past?: boolean }) {
  if (!shifts) return null;

  if (Array.isArray(shifts)) {
    return (
      <div className="booking-week-column-shifts">
        {shifts.map((shift, idx) => (
          <div className={`booking-week-column-shift ${past ? 'booking-week-past-duty' : ''}`} key={idx}>
            <b>{shift.name ? `${shift.name}:` : ''}</b>
            <div>
              {shift.tkts && (
                <div className="booking-week-column-role">
                  <b>TKTS:</b>
                  <span>{shift.tkts}</span>
                </div>
              )}
              {shift.btv && (
                <div className="booking-week-column-role">
                  <b>BTV:</b>
                  <span>{shift.btv}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="booking-week-column-shifts">
      {Object.entries(shifts).map(([name, roles]) => (
        <div className={`booking-week-column-shift ${past ? 'booking-week-past-duty' : ''}`} key={name}>
          <b>{name.replace(/_/g, ' ').replace(/^ca/i, 'Ca')}:</b>
          <div>
            {typeof roles === 'object' && roles !== null
              ? Object.entries(roles)
                  .sort(([a], [b]) =>
                    a.toUpperCase() === 'TKTS' ? -1 : b.toUpperCase() === 'TKTS' ? 1 : a.localeCompare(b),
                  )
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

export interface WeekColumnsProps {
  week: Dayjs;
  now: Dayjs;
  selectedDate: Dayjs;
  events: NormalizedMeetingEvent[];
  duties: Record<string, DutyShiftData>;
  showDuty?: boolean;
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
  duties,
  showDuty = true,
  loading = false,
  onSelectDay,
  onSelectEvent,
  onToggleInterest,
  disabledHover = false,
}: WeekColumnsProps) {
  const [dutyExpanded, setDutyExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleDutyExpanded = () => {
    setDutyExpanded((prev) => {
      const next = !prev;
      if (next && scrollContainerRef.current && scrollContainerRef.current.scrollTop > 40) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return next;
    });
  };

  return (
    <div
      ref={scrollContainerRef}
      className="booking-week-columns-scroll"
      aria-label="Lịch họp tuần theo cột ngày"
      aria-busy={loading}
    >
      <div className="booking-week-columns-grid">
        {dayNames.map((name, index) => {
          const day = week.add(index, 'day');
          const date = day.format('YYYY-MM-DD');
          const duty = duties[date];
          const selected = date === selectedDate.format('YYYY-MM-DD');
          const isToday = day.isSame(now, 'day');
          const pastDuty = week.isSame(now, 'isoWeek') && day.isBefore(now, 'day');
          const dayEvents = events
            .filter((event) => event.date === date)
            .sort((a, b) => a.start.valueOf() - b.start.valueOf());

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
                    aria-label={`Xem danh sách lịch ngày ${name} ${day.format('DD/MM')}`}
                    onClick={() => onSelectDay(day)}
                    disabled={loading}
                  >
                    <span>{name}</span>
                    <b className="booking-week-column-date">{day.format('DD/MM')}</b>
                  </button>
                </div>

                {showDuty && (
                  <div className="booking-week-column-duty">
                    {loading ? (
                      <Skeleton active title={false} paragraph={{ rows: 1, width: ['75%'] }} />
                    ) : (
                      <button
                        type="button"
                        className={`booking-week-column-leader booking-week-column-leader--interactive ${
                          pastDuty ? 'booking-week-past-duty' : ''
                        }`}
                        aria-expanded={dutyExpanded}
                        aria-label={dutyExpanded ? 'Thu gọn các ca trực' : 'Mở rộng các ca trực'}
                        onClick={handleToggleDutyExpanded}
                      >
                        <span>Trực:</span>
                        <strong title={duty?.leader}>{duty?.leader || 'Chưa có thông tin'}</strong>
                        {duty?.shifts &&
                          (dutyExpanded ? (
                            <UpOutlined className="booking-week-duty-chevron" />
                          ) : (
                            <DownOutlined className="booking-week-duty-chevron" />
                          ))}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="booking-week-column-events">
                {showDuty && !loading && dutyExpanded && duty?.shifts && (
                  <div className="booking-week-column-shifts-drawer">
                    <DutyShifts shifts={duty.shifts} past={pastDuty} />
                  </div>
                )}
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
