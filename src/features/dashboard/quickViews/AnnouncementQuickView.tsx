import { Button, Modal } from 'antd';
import { useEffect, useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { announcementApi } from '@/services/api';
import type { Announcement } from '@/types/domain';

export function AnnouncementQuickView({ announcement, onClose }: { announcement: Announcement; onClose: () => void }) {
  const [current, setCurrent] = useState(announcement);
  useEffect(() => {
    if (!announcement.isRead) void announcementApi.markRead(announcement.id).then((response) => setCurrent(response.data)).catch(() => undefined);
  }, [announcement.id, announcement.isRead]);
  return <Modal centered className="dashboard-preview workspace-preview announcement-preview-modal" footer={<Button onClick={onClose} type="primary">Đóng</Button>} onCancel={onClose} open title={<span className="preview-title"><span className="section-icon announcements"><ModuleIcon module="announcements" size={20} /></span>{current.title}</span>} width={680}>
    <article className="announcement-preview-content"><div className="announcement-preview-meta"><span>{current.issuingDepartment}</span><time>{new Date(current.publishedAt).toLocaleString('vi-VN')}</time></div><p className="announcement-summary">{current.summary}</p><div className="announcement-document">{current.content}</div></article>
  </Modal>;
}
