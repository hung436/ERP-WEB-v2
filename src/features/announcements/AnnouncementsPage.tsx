import { Button, Input, Segmented, message } from 'antd';
import { useMemo, useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { CountedTabLabel } from '@/components/CountedTabLabel';
import { ModuleIcon, type ModuleName } from '@/components/ModuleIcon';
import { AnnouncementDetailDrawer } from '@/features/announcements/components/AnnouncementDetailDrawer';
import { useAsyncData } from '@/hooks/useAsyncData';
import { announcementApi } from '@/services/api';
import type { Announcement, AnnouncementSource } from '@/types/domain';

type AnnouncementFilter = 'all' | 'unread' | 'newest';

const sourceMeta: Record<AnnouncementSource, { label: string; module: ModuleName }> = {
  agency: { label: 'Thông báo cơ quan', module: 'announcements' },
  documents: { label: 'Tài liệu', module: 'documents' },
  mail: { label: 'Mail', module: 'mail' },
  evaluations: { label: 'Đánh giá lao động', module: 'evaluations' },
  system: { label: 'Hệ thống', module: 'tasks' },
};

export function AnnouncementsPage() {
  const [filter, setFilter] = useState<AnnouncementFilter>('all');
  const [source, setSource] = useState<'all' | AnnouncementSource>('all');
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [search, setSearch] = useState('');
  const state = useAsyncData(async () => (await announcementApi.list()).data);
  const announcements = useMemo(() => state.data ?? [], [state.data]);
  const unreadCount = announcements.filter((item) => !item.isRead).length;
  const sourceOptions = useMemo(() => [
    { label: <CountedTabLabel count={announcements.length} label="Tất cả" />, value: 'all' },
    ...Object.entries(sourceMeta).map(([value, meta]) => ({ label: <CountedTabLabel count={announcements.filter((item) => (item.sourceModule ?? 'agency') === value).length} label={meta.label} />, value })),
  ], [announcements]);
  const rows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    const filtered = announcements
      .filter((item) => source === 'all' || item.sourceModule === source)
      .filter((item) => filter !== 'unread' || !item.isRead)
      .filter((item) => !keyword || `${item.title} ${item.summary} ${item.issuingDepartment}`.toLocaleLowerCase('vi').includes(keyword));
    return filter === 'newest' ? [...filtered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)) : filtered;
  }, [announcements, filter, search, source]);

  const openAnnouncement = async (item: Announcement) => {
    setSelected(item);
    if (!item.isRead) {
      try {
        const updated = (await announcementApi.markRead(item.id)).data;
        setSelected(updated);
        await state.reload();
      } catch { /* Giữ nội dung hiện tại nếu cập nhật trạng thái thất bại. */ }
    }
  };

  const markAllRead = async () => {
    await Promise.all(announcements.filter((item) => !item.isRead).map((item) => announcementApi.markRead(item.id)));
    await state.reload();
    message.success('Đã đánh dấu tất cả thông báo là đã xem');
  };

  return <div className="module-page announcements-module-page notification-center-page">
    <section className="notification-center surface-panel">
      <header className="notification-center-header">
        <div className="notification-center-title"><span><ModuleIcon module="announcements" size={21} /></span><div><h1>Thông báo</h1><p>Cập nhật tập trung từ các module trong hệ thống</p></div></div>
        <div className="notification-center-actions"><Input aria-label="Tìm thông báo" allowClear onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tiêu đề, nội dung hoặc đơn vị" prefix={<ModuleIcon module="announcements" size={17} />} value={search} /><Button disabled={!unreadCount} onClick={() => void markAllRead()}>Đánh dấu tất cả đã xem</Button></div>
      </header>

      <div className="notification-center-toolbar">
        <Segmented onChange={(value) => setFilter(value as AnnouncementFilter)} options={[{ label: <CountedTabLabel count={announcements.length} label="Tất cả" />, value: 'all' }, { label: <CountedTabLabel count={unreadCount} label="Chưa xem" />, value: 'unread' }, { label: <CountedTabLabel count={announcements.length} label="Mới nhất" />, value: 'newest' }]} value={filter} />
        <span>{rows.length} kết quả</span>
      </div>

      <div className="notification-source-filter"><Segmented onChange={(value) => setSource(value as 'all' | AnnouncementSource)} options={sourceOptions} value={source} /></div>

      <div className="notification-list">
        {state.loading ? <ContentSkeleton rows={8} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : !rows.length ? <EmptyState description="Không có thông báo phù hợp" /> : rows.map((item) => {
          const meta = sourceMeta[item.sourceModule ?? 'agency'];
          return <button aria-label={`${item.isRead ? 'Đã xem' : 'Chưa xem'}: ${item.title}`} className={`notification-row${item.isRead ? '' : ' unread'}`} key={item.id} onClick={() => void openAnnouncement(item)} type="button">
            <span className={`notification-source-icon ${item.sourceModule ?? 'agency'}`}><ModuleIcon module={meta.module} size={19} /></span>
            <span className="notification-row-content"><span><b>{meta.label}</b><i>·</i><small>{item.issuingDepartment}</small></span><strong>{item.title}</strong><p>{item.summary}</p></span>
            <span className="notification-row-time"><time>{new Date(item.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</time><small>{new Date(item.publishedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small></span>
            <span className="notification-row-state" aria-hidden="true"><i /><b>›</b></span>
          </button>;
        })}
      </div>
    </section>
    <AnnouncementDetailDrawer announcement={selected} onClose={() => setSelected(null)} />
  </div>;
}
