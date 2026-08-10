import { Button, Modal } from 'antd';
import { useEffect, useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { announcementApi } from '@/services/api';
import type { Announcement } from '@/types/domain';

export function AnnouncementQuickView({ announcement, onClose }: { announcement: Announcement; onClose: () => void }) {
  const [current, setCurrent] = useState(announcement);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!announcement.isRead) void announcementApi.markRead(announcement.id).then((response) => setCurrent(response.data)).catch(() => undefined);
  }, [announcement.id, announcement.isRead]);

  const confirmRead = async () => {
    setLoading(true);
    try {
      const response = await announcementApi.markRead(current.id);
      setCurrent(response.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return <Modal centered className="dashboard-preview workspace-preview announcement-preview-modal" footer={<div className="modal-quick-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button disabled={current.isRead} loading={loading} onClick={() => void confirmRead()}>{current.isRead ? 'Đã xác nhận' : 'Xác nhận đã nắm thông tin'}</Button><Button onClick={onClose} type="primary">Đóng</Button></div>} onCancel={onClose} open title={<span className="preview-title"><span className="section-icon announcements"><ModuleIcon module="announcements" size={20} /></span><span>Thông báo cơ quan</span><small>· {current.title}</small></span>} width={680}>
    <article className="announcement-preview-content"><div className="announcement-preview-meta"><span>{current.issuingDepartment}</span><time>{new Date(current.publishedAt).toLocaleString('vi-VN')}</time></div><p className="announcement-summary">{current.summary}</p><div className="announcement-document">{current.content}</div></article>
  </Modal>;
}
