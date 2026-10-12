import { Popover, Tooltip, message } from 'antd';
import dayjs from 'dayjs';
import { Calendar, Clock, MapPin, MessageSquare, Paperclip, Star, Users } from 'lucide-react';
import { useState } from 'react';
import type { CalendarEvent } from '@/types/domain';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onSelectEvent?: (event: CalendarEvent) => void;
}

export function CalendarEventCard({ event, onSelectEvent }: CalendarEventCardProps) {
  const start = dayjs(event.startAt);
  const end = dayjs(event.endAt);

  const isEditorial = event.scope === 'editorial';
  const isPersonal = event.scope === 'personal';
  const isUserAttending = Boolean(event.isUserParticipant);
  const [isInterested, setIsInterested] = useState(Boolean(event.isInterested));

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

  // Readonly Popover content for BBT events without user participation
  const readonlyContent = (
    <div className="readonly-popover-content">
      <div className="readonly-popover-title">{event.title}</div>
      {event.isAdjusted && (
        <div className="readonly-popover-adjusted-alert">
          <span className="readonly-adjusted-label">
            Đã điều chỉnh{event.adjustedNote ? ':' : ''}
          </span>
          {event.adjustedNote && (
            <span className="readonly-adjusted-note"> {event.adjustedNote}</span>
          )}
        </div>
      )}
      <div className="readonly-popover-row">
        <Clock size={13} />
        <span>
          <strong>Thời gian:</strong> {timeLabel}
        </span>
      </div>
      {event.location && (
        <div className="readonly-popover-row">
          <MapPin size={13} />
          <span>
            <strong>Địa điểm:</strong> {event.location}
          </span>
        </div>
      )}
      {Boolean(event.leader?.trim()) && (
        <div className="readonly-popover-row">
          <Users size={13} />
          <span>
            <strong>Chủ trì:</strong> {event.leader}
          </span>
        </div>
      )}
      {event.participantText && (
        <div className="readonly-popover-row">
          <Users size={13} />
          <span>
            <strong>Thành phần:</strong> {event.participantText}
          </span>
        </div>
      )}
      {event.dutyInfo && (
        <div className="readonly-popover-row">
          <Calendar size={13} />
          <span>
            <strong>Trực ban:</strong> {event.dutyInfo}
          </span>
        </div>
      )}
      <div className="readonly-popover-interest-row">
        <button
          aria-label={isInterested ? 'Bỏ quan tâm' : 'Quan tâm'}
          className={`popover-star-btn ${isInterested ? 'active' : ''}`}
          onClick={handleToggleInterest}
          type="button"
        >
          <Star
            color={isInterested ? '#f59e0b' : '#64748b'}
            fill={isInterested ? '#f59e0b' : 'none'}
            size={13}
          />
          <span>{isInterested ? 'Đang quan tâm (Nhắc trước 15p)' : 'Quan tâm (Nhắc nhở trước 15 phút)'}</span>
        </button>
      </div>
    </div>
  );

  let cardClass = 'calendar-list-card';
  if (isEditorial) {
    cardClass += isUserAttending ? ' card-editorial-user' : ' card-editorial-other';
  } else if (isPersonal) {
    cardClass += ' card-personal';
  }

  const handleClick = () => {
    if (isEditorial && !isUserAttending) {
      return;
    }
    onSelectEvent?.(event);
  };

  const cardElement = (
    <div
      className={cardClass}
      onClick={handleClick}
      role={isEditorial && !isUserAttending ? undefined : 'button'}
      tabIndex={isEditorial && !isUserAttending ? undefined : 0}
    >
      <div className="card-header-row">
        <span className="card-time-tag">
          <Clock size={12} />
          {timeLabel}
        </span>

        <div className="card-header-badges">
          {isEditorial && !isUserAttending && (
            <Tooltip
              title={
                isInterested
                  ? 'Đang quan tâm · Nhắc nhở trước 15 phút (Bấm để hủy)'
                  : 'Quan tâm · Nhắc nhở trước 15 phút'
              }
            >
              <button
                aria-label={isInterested ? 'Bỏ quan tâm' : 'Quan tâm lịch họp'}
                className={`card-star-btn ${isInterested ? 'active' : ''}`}
                onClick={handleToggleInterest}
                type="button"
              >
                <Star
                  color={isInterested ? '#d97706' : '#94a3b8'}
                  fill={isInterested ? '#f59e0b' : 'none'}
                  size={14}
                />
              </button>
            </Tooltip>
          )}

          {isEditorial && isUserAttending && (
            <span className="card-status-badge attending">Tham gia</span>
          )}
          {isPersonal && (
            <span className="card-status-badge personal">Cá nhân</span>
          )}
        </div>
      </div>

      <div className="card-title">{event.title}</div>

      {(event.location || Boolean(event.leader?.trim()) || event.isAdjusted) && (
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
          ) : (
            <div />
          )}

          {event.isAdjusted && (
            <Tooltip
              title={
                event.adjustedNote
                  ? `Lịch đã điều chỉnh: ${event.adjustedNote}`
                  : 'Lịch đã có sự điều chỉnh'
              }
            >
              <span className="card-status-badge adjusted">
                Đã điều chỉnh
              </span>
            </Tooltip>
          )}
        </div>
      )}

      {(Boolean(event.attachments?.length) || Boolean(event.comments?.length)) && (
        <div className="card-footer-row">
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
      )}
    </div>
  );

  if (isEditorial && !isUserAttending) {
    return (
      <Popover content={readonlyContent} mouseEnterDelay={0.2} placement="rightTop" trigger="hover">
        {cardElement}
      </Popover>
    );
  }

  return cardElement;
}
