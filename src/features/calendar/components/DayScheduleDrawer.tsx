import { Button, Drawer, Empty, Tag, Tooltip } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageSquare,
  Paperclip,
  Plus,
  ShieldCheck,
  Users,
  Video,
} from 'lucide-react';
import { useMemo } from 'react';
import type { CalendarEvent } from '@/types/domain';
import { getDayDutyInfo } from '../dutySchedule';

const VI_DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

interface DayScheduleDrawerProps {
  open: boolean;
  onClose: () => void;
  day: Dayjs | null;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateEvent: (day: Dayjs) => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
}

export function DayScheduleDrawer({
  open,
  onClose,
  day,
  events,
  onSelectEvent,
  onCreateEvent,
  onPrevDay,
  onNextDay,
}: DayScheduleDrawerProps) {
  const now = dayjs();
  const currentDay = day || now;
  const dayStr = currentDay.format('YYYY-MM-DD');
  const dayNameVi = VI_DAY_NAMES[currentDay.day()];
  const isToday = currentDay.isSame(now, 'day');

  // Trực ban & ca trực trong ngày
  const duty = useMemo(() => getDayDutyInfo(currentDay), [currentDay]);

  // Các sự kiện thuộc ngày được chọn, xếp theo thời gian
  const dayEvents = useMemo(() => {
    return events
      .filter((ev) => dayjs(ev.startAt).format('YYYY-MM-DD') === dayStr)
      .sort((a, b) => dayjs(a.startAt).diff(dayjs(b.startAt)));
  }, [events, dayStr]);

  return (
    <Drawer
      className="day-schedule-drawer"
      destroyOnClose={false}
      onClose={onClose}
      open={open}
      placement="right"
      title={null}
      width={520}
    >
      <div className="day-schedule-wrapper">
        {/* Header thứ ngày đơn giản, gọn gàng */}
        <header className="day-schedule-simple-header">
          <div className="day-schedule-title-area">
            <div className="day-schedule-heading-row">
              <h3 className="day-heading-text">
                {dayNameVi}, {currentDay.format('DD/MM/YYYY')}
              </h3>

              <div className="day-schedule-nav-inline">
                {onPrevDay && (
                  <Tooltip title="Ngày trước">
                    <Button
                      aria-label="Ngày trước"
                      className="day-nav-btn"
                      icon={<ChevronLeft size={15} />}
                      onClick={onPrevDay}
                      size="small"
                      type="text"
                    />
                  </Tooltip>
                )}
                {onNextDay && (
                  <Tooltip title="Ngày tiếp theo">
                    <Button
                      aria-label="Ngày tiếp theo"
                      className="day-nav-btn"
                      icon={<ChevronRight size={15} />}
                      onClick={onNextDay}
                      size="small"
                      type="text"
                    />
                  </Tooltip>
                )}
              </div>

              {isToday && <Tag className="tag-today-pill" color="blue">Hôm nay</Tag>}
            </div>
            <span className="day-subtitle-count">{dayEvents.length} sự kiện</span>
          </div>

          <Button
            className="btn-create-day-meeting-compact"
            icon={<Plus size={14} />}
            onClick={() => onCreateEvent(currentDay)}
            size="middle"
            type="primary"
          >
            Tạo lịch họp
          </Button>
        </header>

        {/* Trực ban & Ca trực trong ngày: Viết liền Trực: {leader} */}
        {duty && (
          <section className="day-schedule-duty-banner">
            <div className="duty-banner-header">
              <ShieldCheck className="duty-banner-icon" size={15} />
              <span className="duty-banner-inline-leader">
                <strong>Trực:</strong> {duty.leader}
              </span>
            </div>

            {duty.shifts.length > 0 && (
              <div className="duty-banner-shifts-list">
                {duty.shifts.map((shift, idx) => (
                  <div className="duty-banner-shift-row" key={idx}>
                    <span className="shift-badge-text">{shift.name}:</span>
                    <span className="shift-body-text">
                      {shift.tkts && (
                        <span>
                          <strong className="sub-lbl">TKTS:</strong> {shift.tkts}
                        </span>
                      )}
                      {shift.tkts && shift.btv && <span className="shift-dot">·</span>}
                      {shift.btv && (
                        <span>
                          <strong className="sub-lbl">BTV:</strong> {shift.btv}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Danh sách các sự kiện trong ngày (Không dùng bộ lọc filter) */}
        <div className="day-schedule-events-container">
          {dayEvents.length === 0 ? (
            <div className="day-schedule-empty">
              <Empty
                description={`Không có sự kiện hoặc lịch họp nào trong ${dayNameVi.toLowerCase()}, ngày ${currentDay.format('DD/MM')}.`}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  icon={<Plus size={14} />}
                  onClick={() => onCreateEvent(currentDay)}
                  type="primary"
                >
                  Tạo lịch họp mới
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="day-schedule-timeline-list">
              {dayEvents.map((event) => {
                const start = dayjs(event.startAt);
                const end = dayjs(event.endAt);
                const isEditorial = event.scope === 'editorial';
                const isPersonal = event.scope === 'personal';
                const isUserAttending = Boolean(event.isUserParticipant);

                // Màu sắc thẻ theo 3 màu chính ngoài lịch:
                // - Lịch BBT không tham gia: Xám (theme-gray)
                // - Lịch BBT có tham gia: Đỏ (theme-red)
                // - Lịch Cá nhân: Xanh (theme-blue)
                let cardColorClass = 'theme-gray';
                if (isEditorial) {
                  cardColorClass = isUserAttending ? 'theme-red' : 'theme-gray';
                } else if (isPersonal) {
                  cardColorClass = 'theme-blue';
                }

                const durationMinutes = end.diff(start, 'minute');
                const durationHour = Math.floor(durationMinutes / 60);
                const durationRemMin = durationMinutes % 60;
                const durationStr =
                  durationHour > 0
                    ? `${durationHour}h${durationRemMin > 0 ? ` ${durationRemMin}p` : ''}`
                    : `${durationMinutes}p`;

                const canOpen = isPersonal || isUserAttending;

                // Danh sách tham gia (không tiêu đề)
                const participantsText =
                  event.participantText ||
                  (event.participants && event.participants.length > 0
                    ? event.participants.join(', ')
                    : (event.leader || event.organizer));

                return (
                  <article
                    className={`day-event-card ${cardColorClass}`}
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    role="button"
                    style={{ cursor: canOpen ? 'pointer' : 'default' }}
                    tabIndex={0}
                  >
                    {/* Cột mốc thời gian */}
                    <div className="day-event-time-col">
                      <span className="event-start-time">{start.format('HH:mm')}</span>
                      <span className="event-end-time">{end.format('HH:mm')}</span>
                      <span className="event-duration-tag">{durationStr}</span>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="day-event-content-col">
                      {((isEditorial && isUserAttending) || isPersonal || event.isAdjusted) && (
                        <div className="day-event-tags-row">
                          {isEditorial && isUserAttending && (
                            <Tag className="event-badge-attending-red">
                              Tham gia
                            </Tag>
                          )}
                          {isPersonal && (
                            <Tag className="event-scope-badge scope-blue">
                              Cá nhân
                            </Tag>
                          )}
                          {event.isAdjusted && (
                            <Tag className="event-badge-adjusted" color="gold">
                              Đã điều chỉnh
                            </Tag>
                          )}
                        </div>
                      )}

                      <h4 className="day-event-title">{event.title}</h4>

                      <div className="day-event-meta-list">
                        {/* Địa điểm / Trực tuyến */}
                        {(event.meetingUrl || event.platform) ? (
                          <div className="day-event-meta-item is-online">
                            <Video size={13} style={{ flexShrink: 0 }} />
                            <span>Họp trực tuyến {event.platform ? `(${event.platform})` : ''}</span>
                          </div>
                        ) : event.location ? (
                          <div className="day-event-meta-item">
                            <MapPin size={13} style={{ flexShrink: 0 }} />
                            <span>{event.location}</span>
                          </div>
                        ) : null}

                        {/* Danh sách tham gia (không có tiền tố tiêu đề 'Chủ trì:') */}
                        {Boolean(participantsText?.trim()) && (
                          <div className="day-event-meta-item is-participants" title={participantsText}>
                            <Users size={13} style={{ flexShrink: 0 }} />
                            <span className="participants-text-line">{participantsText}</span>
                          </div>
                        )}

                        {/* Tài liệu & Thảo luận dạng icon và số lượng đơn giản */}
                        {(Boolean(event.attachments?.length) || Boolean(event.comments?.length)) && (
                          <div className="day-event-meta-counts">
                            {Boolean(event.attachments?.length) && (
                              <span className="meta-count-chip" title={`${event.attachments!.length} tài liệu đính kèm`}>
                                <Paperclip size={12} />
                                <span>{event.attachments!.length}</span>
                              </span>
                            )}
                            {Boolean(event.comments?.length) && (
                              <span className="meta-count-chip" title={`${event.comments!.length} thảo luận`}>
                                <MessageSquare size={12} />
                                <span>{event.comments!.length}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
