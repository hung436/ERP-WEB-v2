import { Button, Modal } from 'antd';

import { ModuleIcon } from '@/components/ModuleIcon';
import type { Announcement } from '@/types/domain';

export function AnnouncementDetailDrawer({ announcement, onClose }: { announcement: Announcement | null; onClose: () => void }) {
  return <Modal centered className="announcement-detail-modal announcement-reader-modal" footer={<Button onClick={onClose} type="primary">Đóng</Button>} onCancel={onClose} open={Boolean(announcement)} title={<span className="preview-title"><span className="section-icon announcements"><ModuleIcon module="announcements" size={20} /></span>{announcement?.title}</span>} width={760}>
    {announcement && <article className="announcement-reader">
      <header><div className="announcement-reader-eyebrow"><span>{announcement.issuingDepartment}</span><time>{new Date(announcement.publishedAt).toLocaleString('vi-VN')}</time></div><p>{announcement.summary}</p></header>
      <section><span className="announcement-reader-rule" /><div>{announcement.content}</div></section>
      <footer><span><ModuleIcon module="announcements" size={18} /></span><div><small>Đơn vị phát hành</small><strong>{announcement.issuingDepartment}</strong></div></footer>
    </article>}
  </Modal>;
}
