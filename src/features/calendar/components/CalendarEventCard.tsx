import { message } from 'antd';
import dayjs, { extend } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { MapPin, Star, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { CalendarEvent } from '@/types/domain';

import { getApprovalStatusMeta } from '../calendarWeekUtils';

extend(isoWeek);

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
  const isTask = event.ticketType === 'TASK';
  const isUserAttending = Boolean(event.isUserParticipant || event.isUserWatcher);
  const [isInterested, setIsInterested] = useState(Boolean(event.isInterested));
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  const approvalMeta = getApprovalStatusMeta(event.approvalStatus, event.ticketType, event.workflowType);

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

  const timeLabel = dayjs(
    isTask && event.deadline ? event.deadline : event.startAt || event.deadline || event.endAt
  ).format('HH:mm');

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

  const canOpenDrawer = isUserAttending;

  const now = dayjs();
  const isCurrentWeek = start.isSame(now, 'isoWeek') || end.isSame(now, 'isoWeek');
  const isPast = isCurrentWeek && end.isBefore(now);

  let cardClass = `calendar-list-card booking-week-flat-card ${isUserAttending ? 'card-attending' : 'card-non-attending'} ${className || ''}`;
  if (isPast) {
    cardClass += ' is-past-event';
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
      role="button"
      style={{ ...style, cursor: canOpenDrawer ? 'pointer' : 'default', position: 'relative' }}
      tabIndex={canOpenDrawer ? 0 : -1}
    >
      {/* Chấm tròn vàng ở góc phải nếu lịch đã điều chỉnh (Task 7) */}
      {event.isAdjusted && (
        <span
          className="booking-week-adjusted-dot"
          aria-label="Đã điều chỉnh"
          title={event.adjustedNote ? `Đã điều chỉnh: ${event.adjustedNote}` : 'Lịch đã điều chỉnh'}
        />
      )}

      <div className="card-default-view">
        <div className="card-header-row">
          <div className="card-time-group" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Chấm tròn trạng thái trước giờ (Task 7) */}
            <span
              className={`booking-week-status-dot dot-${(approvalMeta.tone || 'scheduled').toLowerCase()}`}
              title={`Trạng thái: ${approvalMeta.label}`}
            />
            <span
              className={`card-time-tag ${isUserAttending ? 'is-attending-time' : ''}`}
              style={isUserAttending ? { color: '#D92D20', fontWeight: 600 } : { color: '#475467', fontWeight: 500 }}
            >
              {timeLabel}
            </span>
          </div>

          <div className="card-header-actions">
            {isEditorial && !isUserAttending && !isPast && (
              <button
                type="button"
                className={`calendar-star-btn ${isInterested ? 'active' : ''}`}
                onClick={handleToggleInterest}
                title={isInterested ? 'Bỏ quan tâm' : 'Quan tâm lịch họp'}
                aria-label={isInterested ? 'Bỏ quan tâm lịch họp' : 'Quan tâm lịch họp'}
              >
                <Star size={13} fill={isInterested ? '#f59e0b' : 'none'} color={isInterested ? '#f59e0b' : '#94a3b8'} />
              </button>
            )}
          </div>
        </div>

        {/* Tên sự kiện: Hiển thị đầy đủ, không cắt 3 chấm (Task 4) */}
        <div className="card-title">{event.title}</div>

        {(event.location || (event.ticketType === 'MEETING' && Boolean(event.leader?.trim()))) && (
          <div className="card-location-row">
            {event.location ? (
              <div className="card-location-info" title={event.location}>
                <MapPin size={12} style={{ flexShrink: 0 }} />
                <span>{event.location}</span>
              </div>
            ) : (event.ticketType === 'MEETING' && event.leader?.trim()) ? (
              <div className="card-location-info" title={event.leader}>
                <Users size={12} style={{ flexShrink: 0 }} />
                <span>{event.leader}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
