import { Tooltip, message } from 'antd';
import dayjs from 'dayjs';
import { ArrowRight, Calendar, Clock, MapPin, MessageSquare, Paperclip, Star, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '@/types/domain';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onSelectEvent?: (event: CalendarEvent) => void;
  onHoverChange?: (isHovered: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
}

export function CalendarEventCard({ event, onSelectEvent, onHoverChange, style, className }: CalendarEventCardProps) {
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

  const resetEnterTimer = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  };

  const startEnterTimer = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    resetEnterTimer();
    // Độ trễ 400ms (trong khoảng 300ms - 500ms): chuột dừng yên trên card mới kích hoạt popup
    enterTimerRef.current = setTimeout(() => {
      setIsHoverExpanded(true);
    }, 400);
  };

  const handleMouseEnter = () => {
    startEnterTimer();
  };

  const handleMouseMove = () => {
    // Nếu chưa kích hoạt popup (chuột đang lướt qua), tiếp tục reset timer: chỉ khi chuột dừng yên 400ms mới kích hoạt
    if (!isHoverExpanded) {
      startEnterTimer();
    }
  };

  const handleMouseLeave = () => {
    resetEnterTimer();
    // Khi chuột rời đi, giữ thêm khoảng 100ms trước khi đóng
    leaveTimerRef.current = setTimeout(() => {
      setIsHoverExpanded(false);
    }, 100);
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

  let cardClass = `calendar-list-card ${className || ''}`;
  if (isEditorial) {
    cardClass += isUserAttending ? ' card-editorial-user' : ' card-editorial-other';
  } else if (isPersonal) {
    cardClass += ' card-personal';
  }
  if (isHoverExpanded) {
    cardClass += ' is-hover-expanded';
  }

  const handleClick = () => {
    if (!canOpenDrawer) return;
    onSelectEvent?.(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!canOpenDrawer) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectEvent?.(event);
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
            {isEditorial && !isUserAttending && isInterested && (
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
                <MapPin size={11} style={{ flexShrink: 0 }} />
                <span>{event.location}</span>
              </div>
            ) : Boolean(event.leader?.trim()) ? (
              <div className="card-location-info" title={event.leader}>
                <Users size={11} style={{ flexShrink: 0 }} />
                <span>{event.leader}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 2. Popup preview nhanh khi chuột dừng yên (300-500ms delay, đóng sau 100ms khi rời đi) */}
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

        {isEditorial && !isUserAttending && (
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
              <span className="card-hover-hint-cta">
                Xem chi tiết <ArrowRight size={12} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
