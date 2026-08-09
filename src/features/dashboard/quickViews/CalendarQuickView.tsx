import { Button, Modal, message } from 'antd';

import { ModuleIcon } from '@/components/ModuleIcon';
import type { CalendarEvent } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

const formatDate = (value: string) => new Date(value).toLocaleString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const initials = (value: string) => value.split(' ').slice(-2).map((word) => word[0]).join('').toUpperCase();

export function CalendarQuickView({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const joinMeeting = () => message.success(`Đang mở phòng họp ${event.meetingId ?? ''} trong môi trường mô phỏng`);

  return <Modal centered className="online-meeting-modal" footer={<Button onClick={joinMeeting} type="primary">Tham gia phòng họp</Button>} onCancel={onClose} open title={<span className="preview-title"><span className="section-icon meetings"><ModuleIcon module="meetings" size={20} /></span>{event.title}</span>} width={720}>
    <article className="meeting-modal-content">
      <header className="meeting-modal-summary"><p>{event.platform} · ID phòng {event.meetingId}</p></header>
      <section className="meeting-time-panel"><div><small>Bắt đầu</small><strong>{formatDate(event.startAt)}</strong></div><span>→</span><div><small>Kết thúc</small><strong>{formatDate(event.endAt)}</strong></div></section>
      <dl><div><dt>Người tổ chức</dt><dd>{event.organizer}</dd></div><div><dt>Kênh họp</dt><dd>{event.location || event.platform}</dd></div><div><dt>Liên kết</dt><dd>{event.meetingUrl ?? 'Chưa cập nhật'}</dd></div><div><dt>Bản ghi</dt><dd>{event.recordingAvailable ? 'Có ghi hình' : 'Không ghi hình'}</dd></div></dl>
      <section className="meeting-agenda"><h3>Nội dung cuộc họp</h3><p>{event.agenda ?? 'Chưa cập nhật nội dung.'}</p></section>
      <section className="meeting-participants"><h3>Người tham gia <span>{event.participants?.length ?? 0}</span></h3><div>{event.participants?.map((person) => <span key={person}><i className={avatarTone(person)}>{initials(person)}</i><strong>{person}</strong></span>)}</div></section>
    </article>
  </Modal>;
}
