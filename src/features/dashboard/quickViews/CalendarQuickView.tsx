import { Button, Modal, message } from 'antd';

import { ModuleIcon } from '@/components/ModuleIcon';
import type { CalendarEvent } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

const formatDate = (value: string) => new Date(value).toLocaleString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const initials = (value: string) => value.split(' ').slice(-2).map((word) => word[0]).join('').toUpperCase();

export function CalendarQuickView({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const joinMeeting = () => {
    const url = event.meetingUrl || `https://meeting.tuoitre.vn/${event.meetingId ?? 'room'}`;
    window.open(url, '_blank', 'noreferrer');
    message.success(`Đang tham gia phòng họp trực tuyến ${event.meetingId ?? ''}`);
  };

  return <Modal centered className="online-meeting-modal" footer={<div className="document-modal-actions"><Button onClick={onClose}>Đóng</Button><Button icon={<ModuleIcon module="meetings" size={16} />} onClick={joinMeeting} type="primary">Tham gia phòng họp trực tuyến</Button></div>} onCancel={onClose} open title={<span className="preview-title"><span className="section-icon meetings"><ModuleIcon module="meetings" size={20} /></span><span>Chi tiết cuộc họp trực tuyến</span><small>· {event.title}</small></span>} width={720}>
    <article className="meeting-modal-content">
      <header className="meeting-modal-summary"><p>📹 Nền tảng: <strong>{event.platform}</strong> · ID phòng: <strong>{event.meetingId ?? 'TT-ONLINE'}</strong></p></header>
      <section className="meeting-time-panel"><div><small>Bắt đầu</small><strong>{formatDate(event.startAt)}</strong></div><span>→</span><div><small>Kết thúc</small><strong>{formatDate(event.endAt)}</strong></div></section>
      <dl><div><dt>Người chủ trì / Tổ chức</dt><dd>{event.organizer}</dd></div><div><dt>Nền tảng trực tuyến</dt><dd>{event.platform}</dd></div><div><dt>Đường dẫn phòng họp</dt><dd>{event.meetingUrl ?? 'https://meeting.tuoitre.vn'}</dd></div><div><dt>Ghi hình cuộc họp</dt><dd>{event.recordingAvailable ? 'Có ghi hình tự động' : 'Không ghi hình'}</dd></div></dl>
      <section className="meeting-agenda"><h3>Chương trình / Nội dung họp trực tuyến</h3><p>{event.agenda ?? 'Chưa cập nhật nội dung.'}</p></section>
      <section className="meeting-participants"><h3>Thành phần tham dự <span>{event.participants?.length ?? 0}</span></h3><div>{event.participants?.map((person) => <span key={person}><i className={avatarTone(person)}>{initials(person)}</i><strong>{person}</strong></span>)}</div></section>
    </article>
  </Modal>;
}
