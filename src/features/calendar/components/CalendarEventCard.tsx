import { Tooltip, message } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { ArrowRight, Calendar, Clock, MapPin, MessageSquare, Paperclip, Star, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '@/types/domain';

dayjs.extend(isoWeek);

interface CalendarEventCardProps {
  event: CalendarEvent;
  onSelectEvent?: (event: CalendarEvent) => void;
  onHoverChange?: (isHovered: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
  disabledHover?: boolean;
}

export function CalendarEventCard({ event, onSelectEvent, onHoverChange, style, className, disabledHover }: CalendarEventCardProps) {
  const start = dayjs(event.startAt);
  const end = dayjs(event.endAt);

  const isEditorial = event.scope === 'editorial';
  const isPersonal = event.scope === 'personal';
  const isUserAttending = Boolean(event.isUserParticipant);
  const [isInterested, setIsInterested] = useState(Boolean(event.isInterested));
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onHoverChange?.(isHoverExpanded);
  }, [isHoverExpanded, onHoverChange]);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  // Khi drawer hoặc modal mở, lập tức tắt popup hover và xóa mọi timer
  useEffect(() => {
    if (disabledHover) {
      resetEnterTimer();
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      setIsHoverExpanded(false);
    }
  }, [disabledHover]);

  const resetEnterTimer = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  };

  const startEnterTimer = () => {
    if (disabledHover) return;
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    resetEnterTimer();
    // Độ trễ 120ms phản hồi nhanh khi hover vào thẻ
    enterTimerRef.current = setTimeout(() => {
      if (!disabledHover) {
        setIsHoverExpanded(true);
      }
    }, 120);
  };

  const handleMouseEnter = () => {
    if (disabledHover) return;
    startEnterTimer();
  };

  const handleMouseMove = () => {
    if (disabledHover) return;
    // Chỉ kích hoạt hẹn giờ nếu chưa có popup và chưa có timer đang chạy (tránh reset timer liên tục khi chuột di chuyển trong thẻ)
    if (!isHoverExpanded && !enterTimerRef.current) {
      startEnterTimer();
    }
  };

  const handleMouseLeave = () => {
    resetEnterTimer();
    // Khi chuột rời đi, giữ thêm khoảng 120ms trước khi đóng
    leaveTimerRef.current = setTimeout(() => {
      setIsHoverExpanded(false);
    }, 120);
  };

  const timeLabel = `${start.format('HH:mm')} - ${end.format('HH:mm')}`;

  const handleToggleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isInterested;
    setIsInterested(nextState);
    if (nextState) {
      message.success({
        content: `Đã quan tâm: "${event.title}". Bạn sẽ được nhắc nhở trước 15 phút!`,
        icon: <Star color="#f59e0b" fill="#f59e0b" size={16} style={{ marginRight: 6 }} />,
        duration: 3,
      });
    } else {
      message.info(`Đã hủy nhắc nhở lịch "${event.title}".`);
    }
  };

  const canOpenDrawer = isPersonal || isUserAttending;

  const now = dayjs();
  const isCurrentWeek = start.isSame(now, 'isoWeek') || end.isSame(now, 'isoWeek');
  const isPast = isCurrentWeek && end.isBefore(now);

  let cardClass = `calendar-list-card ${className || ''}`;
  if (isPast) {
    cardClass += ' is-past-event';
  }
  if (isEditorial) {
    cardClass += isUserAttending ? ' card-editorial-user' : ' card-editorial-other';
  } else if (isPersonal) {
    cardClass += ' card-personal';
  }
  if (isHoverExpanded && !disabledHover) {
    cardClass += ' is-hover-expanded';
  }

  const handleClick = () => {
    resetEnterTimer();
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsHoverExpanded(false);
    if (!canOpenDrawer) return;
    onSelectEvent?.(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!canOpenDrawer) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      aria-label={event.title}
      className={cardClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role={canOpenDrawer ? 'button' : undefined}
      style={style}
      tabIndex={canOpenDrawer ? 0 : undefined}
    >
      {/* 1. Trạng thái mặc định (khi không hover) */}
      <div className="card-default-view">
        <div className="card-header-row">
          <span className="card-time-tag">
            {timeLabel}
          </span>

          <div className="card-header-badges">
            {isEditorial && isUserAttending && (
              <span className="card-status-badge attending">Tham gia</span>
            )}
            {isPersonal && (
              <span className="card-status-badge personal">Cá nhân</span>
            )}
            {isEditorial && !isUserAttending && isInterested && !end.isBefore(now) && (
              <span className="card-star-indicator" title="Đang quan tâm">
                <Star color="#d97706" fill="#f59e0b" size={12} />
              </span>
            )}
          </div>
        </div>

        <div className="card-title">{event.title}</div>

        {event.isAdjusted && (
          <div className="card-adjusted-tag-row">
            <span className="card-status-badge adjusted">
              Đã điều chỉnh
            </span>
          </div>
        )}

        {(event.location || Boolean(event.leader?.trim())) && (
          <div className="card-location-row">
            {event.location ? (
              <div className="card-location-info" title={event.location}>
                <MapPin size={12} style={{ flexShrink: 0 }} />
                <span>{event.location}</span>
              </div>
            ) : Boolean(event.leader?.trim()) ? (
              <div className="card-location-info" title={event.leader}>
                <Users size={12} style={{ flexShrink: 0 }} />
                <span>{event.leader}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 2. Popup preview nhanh khi chuột dừng yên (120ms delay, có arrow beak chỉ hướng) */}
      <div className="card-hover-popover-portal">
        <div className="card-hover-arrow" />
        <div className="card-hover-rich-view">
        <div className="card-rich-header">
          <div className="card-rich-title">{event.title}</div>
          <div className="card-rich-badges">
            {isEditorial && isUserAttending && (
              <span className="card-status-badge attending">Tham gia</span>
            )}
            {isPersonal && (
              <span className="card-status-badge personal">Cá nhân</span>
            )}
          </div>
        </div>

        {event.isAdjusted && (
          <div className="card-rich-adjusted-alert">
            <span className="card-rich-adjusted-label">
              Đã điều chỉnh{event.adjustedNote ? ':' : ''}
            </span>
            {event.adjustedNote && (
              <span className="card-rich-adjusted-note"> {event.adjustedNote}</span>
            )}
          </div>
        )}

        <div className="card-rich-row">
          <Clock size={13} />
          <span>
            <strong>Thời gian:</strong> {timeLabel}
          </span>
        </div>

        {event.location && (
          <div className="card-rich-row">
            <MapPin size={13} />
            <span>
              <strong>Địa điểm:</strong> {event.location}
            </span>
          </div>
        )}

        {Boolean(event.leader?.trim()) && (
          <div className="card-rich-row">
            <Users size={13} />
            <span>
              <strong>Chủ trì:</strong> {event.leader}
            </span>
          </div>
        )}

        {event.participantText && (
          <div className="card-rich-row">
            <Users size={13} />
            <span>
              <strong>Thành phần:</strong> {event.participantText}
            </span>
          </div>
        )}

        {event.dutyInfo && (
          <div className="card-rich-row">
            <Calendar size={13} />
            <span>
              <strong>Trực ban:</strong> {event.dutyInfo}
            </span>
          </div>
        )}

        {isEditorial && !isUserAttending && !end.isBefore(now) && (
          <div className="card-rich-interest-row">
            <button
              aria-label={isInterested ? 'Bỏ quan tâm' : 'Quan tâm lịch họp'}
              className={`card-rich-star-btn ${isInterested ? 'active' : ''}`}
              onClick={handleToggleInterest}
              type="button"
            >
              <Star
                color={isInterested ? '#f59e0b' : '#64748b'}
                fill={isInterested ? '#f59e0b' : 'none'}
                size={13}
              />
              <span className="card-star-btn-text">
                {isInterested ? 'Đang quan tâm (Nhắc trước 15p)' : 'Quan tâm (Nhắc trước 15p)'}
              </span>
            </button>
          </div>
        )}

        {/* Nút gợi ý nhấp để mở Side Drawer chi tiết (chỉ hiện cho sự kiện được tham gia) */}
        {(Boolean(event.attachments?.length) || Boolean(event.comments?.length) || canOpenDrawer) && (
          <div className="card-hover-drawer-hint">
            <div className="card-hover-hint-meta">
              {Boolean(event.attachments?.length) && (
                <span className="card-meta-chip" title={`${event.attachments?.length} tệp đính kèm`}>
                  <Paperclip size={12} />
                  {event.attachments?.length}
                </span>
              )}
              {Boolean(event.comments?.length) && (
                <span className="card-meta-chip" title={`${event.comments?.length} bình luận`}>
                  <MessageSquare size={12} />
                  {event.comments?.length}
                </span>
              )}
            </div>
            {canOpenDrawer && (
              <span
                className="card-hover-hint-cta"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Xem chi tiết <ArrowRight size={12} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
