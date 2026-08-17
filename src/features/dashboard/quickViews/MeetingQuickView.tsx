import { Button, Modal, Tooltip, message } from 'antd';
import { Copy, Video } from 'lucide-react';

import { ModuleIcon } from '@/components/ModuleIcon';
import type { MeetingEvent } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const initials = (value: string) =>
  value
    .split(' ')
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

export function MeetingQuickView({ event, onClose }: { event: MeetingEvent; onClose: () => void }) {
  const joinMeeting = () => {
    const url = event.meetingUrl || `https://meeting.tuoitre.vn/${event.meetingId ?? 'room'}`;
    window.open(url, '_blank', 'noreferrer');
    message.success(`Đang tham gia phòng họp ${event.meetingId ?? ''}`);
  };

  const handleCopy = () => {
    const url = event.meetingUrl || `https://meeting.tuoitre.vn/${event.meetingId ?? 'room'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    message.success('Đã sao chép liên kết cuộc họp');
  };

  const now = Date.now();
  const start = new Date(event.startAt).getTime();
  const end = new Date(event.endAt).getTime();
  const isLive = now >= start && now <= end;
  const isUpcoming = now < start;

  return (
    <Modal
      centered
      className="modern-meeting-modal modern-meeting-detail-modal"
      footer={
        <div className="modal-custom-footer">
          <Button onClick={onClose} size="large">
            Đóng
          </Button>
          <Button
            className="btn-modal-submit"
            icon={<Video size={16} />}
            onClick={joinMeeting}
            size="large"
            type="primary"
          >
            {isLive ? 'Vào họp ngay 🔴' : 'Tham gia phòng họp'}
          </Button>
        </div>
      }
      onCancel={onClose}
      open
      title={
        <div className="modal-custom-header">
          <span className="modal-header-icon">
            <ModuleIcon module="meetings" size={20} />
          </span>
          <div className="modal-header-text">
            <div className="modal-title-with-status">
              <h3>{event.title}</h3>
              {isLive ? (
                <span className="status-chip chip-live">
                  <span className="pulse-dot" /> Đang diễn ra
                </span>
              ) : isUpcoming ? (
                <span className="status-chip chip-upcoming">⏳ Sắp diễn ra</span>
              ) : (
                <span className="status-chip chip-past">Đã kết thúc</span>
              )}
            </div>
            <p>ID phòng: <strong>{event.meetingId ?? 'TT-ONLINE'}</strong></p>
          </div>
        </div>
      }
      width={680}
    >
      <div className="meeting-detail-container">
        {/* TIME CARD */}
        <div className="meeting-time-box">
          <div className="time-endpoint">
            <span className="time-sublabel">Bắt đầu</span>
            <strong>{formatDate(event.startAt)}</strong>
          </div>
          <span className="time-arrow">➔</span>
          <div className="time-endpoint">
            <span className="time-sublabel">Kết thúc</span>
            <strong>{formatDate(event.endAt)}</strong>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="meeting-details-grid">
          <div className="detail-field">
            <span className="field-label">Chủ trì / Tổ chức</span>
            <strong className="field-value">👤 {event.organizer}</strong>
          </div>

          <div className="detail-field">
            <span className="field-label">Nền tảng họp</span>
            <strong className="field-value">{event.platform || 'Phòng họp ứng dụng Tuổi Trẻ'}</strong>
          </div>

          <div className="detail-field full-width">
            <span className="field-label">Đường dẫn tham gia</span>
            <div className="field-url-box">
              <code>{event.meetingUrl || `https://meeting.tuoitre.vn/${event.meetingId ?? 'room'}`}</code>
              <Tooltip title="Sao chép liên kết">
                <Button className="btn-copy-url" icon={<Copy size={14} />} onClick={handleCopy} size="small">
                  Sao chép
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* AGENDA SECTION */}
        {event.agenda && (
          <div className="meeting-agenda-box">
            <h4>Nội dung / Chương trình làm việc</h4>
            <p>{event.agenda}</p>
          </div>
        )}

        {/* PARTICIPANTS LIST */}
        <div className="meeting-participants-box">
          <h4>
            Thành viên tham dự <span>({event.participants?.length ?? 0})</span>
          </h4>
          <div className="participants-pills">
            {event.participants?.map((person) => (
              <div className="participant-chip" key={person}>
                <i className={avatarTone(person)}>{initials(person)}</i>
                <span>{person}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export const CalendarQuickView = MeetingQuickView;
