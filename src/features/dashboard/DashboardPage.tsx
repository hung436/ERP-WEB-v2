import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { StatusTag } from '@/components/StatusTag';
import { AnnouncementQuickView } from '@/features/dashboard/quickViews/AnnouncementQuickView';
import { CalendarQuickView } from '@/features/dashboard/quickViews/CalendarQuickView';
import { ChatQuickView } from '@/features/dashboard/quickViews/ChatQuickView';
import { MailQuickView } from '@/features/dashboard/quickViews/MailQuickView';
import { TaskDetailQuickView } from '@/features/dashboard/quickViews/TaskDetailQuickView';
import { DocumentDetailModal } from '@/features/documents/components/DocumentDetailModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { dashboardApi, documentApi } from '@/services/api';
import type { Announcement, CalendarEvent, ChatConversation, DocumentSubmission, MailItem, Task, TaskStatus } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

const taskDue = (value: string) => new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const shortTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export function DashboardPage() {
  const navigate = useNavigate();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailDocument, setDetailDocument] = useState<DocumentSubmission | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Record<string, { status: TaskStatus; progress: number }>>({});
  const state = useAsyncData(async () => {
    const [summary, tasks, events, mails, chats, announcements, documents] = await Promise.all([
      dashboardApi.summary(), dashboardApi.tasks(), dashboardApi.events(), dashboardApi.mails(),
      dashboardApi.chats(), dashboardApi.announcements(), documentApi.submissions(),
    ]);
    return { summary: summary.data, tasks: tasks.data, events: events.data, mails: mails.data, chats: chats.data, announcements: announcements.data, documents: documents.data };
  });
  if (state.loading) return <ContentSkeleton rows={10} />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (!state.data || state.data.tasks.length === 0) return <EmptyState description="Hôm nay chưa có công việc cần xử lý" />;
  const { summary, tasks, events, mails, chats, announcements, documents } = state.data;
  const openTask = (task: Task) => {
    if (task.sourceModule === 'evaluations') {
      if (task.subjectName === 'Lê Thanh Vân') navigate('/evaluations?mode=scoring&sheetId=eval-van-q3');
      else if (task.subjectName === 'Đỗ Quang Huy') navigate('/evaluations?mode=scoring&sheetId=eval-huy-q3');
      else if (task.subjectName === 'Mai Phương Thảo') navigate('/evaluations?mode=scoring&sheetId=eval-mai-q3');
      else if (task.period === 'Quý II/2026') navigate('/evaluations?mode=self&sheetId=eval-self-q2');
      else navigate('/evaluations?mode=scoring');
      return;
    }
    if (task.sourceModule === 'documents' && task.documentId) {
      setDetailDocument(documents.find((item) => item.id === task.documentId) ?? null);
      return;
    }
    setDetailTask(task);
  };
  return <div className="dashboard-page">
    <section className="workspace-metrics" aria-label="Tổng quan không gian làm việc">
      <Link className="workspace-metric metric-tasks" to="/tasks"><span className="metric-icon"><ModuleIcon module="tasks" /></span><span className="metric-copy"><small>Việc chờ xử lý</small><strong>{summary.taskSummary.total}</strong><em>{summary.taskSummary.dueSoon} sắp đến hạn</em></span><span className="metric-arrow">›</span></Link>
      <Link className="workspace-metric metric-announcements" to="/announcements"><span className="metric-icon"><ModuleIcon module="announcements" /></span><span className="metric-copy"><small>Thông báo mới</small><strong>{announcements.filter((item) => !item.isRead).length}</strong><em>Cần xem</em></span><span className="metric-arrow">›</span></Link>
      <Link className="workspace-metric metric-chat" to="/chat"><span className="metric-icon"><ModuleIcon module="chat" /></span><span className="metric-copy"><small>Chat chưa đọc</small><strong>{summary.unreadChatCount}</strong><em>{chats.length} hội thoại</em></span><span className="metric-arrow">›</span></Link>
      <Link className="workspace-metric metric-mail" to="/mail"><span className="metric-icon"><ModuleIcon module="mail" /></span><span className="metric-copy"><small>Email chưa đọc</small><strong>{summary.unreadMailCount}</strong><em>Cần kiểm tra</em></span><span className="metric-arrow">›</span></Link>
    </section>

    <div className="dashboard-focus">
      <section className="surface-panel dashboard-tasks" aria-labelledby="dashboard-tasks-title">
        <div className="section-heading"><div><div><h2 id="dashboard-tasks-title">Công việc của tôi</h2></div><span className="section-count">{tasks.length}</span></div></div>
        <div className="work-list">{tasks.map((task) => {
          const currentTask = { ...task, ...taskUpdates[task.id] };
          const isDoc = task.sourceModule === 'documents';
          const relatedDoc = isDoc && task.documentId ? documents.find((d) => d.id === task.documentId) : null;
          const displayTitle = relatedDoc ? relatedDoc.title : task.title;

          return <article className="work-item" key={task.id}>
            <span className={`task-module-icon ${task.sourceModule ?? 'documents'}`}><ModuleIcon module={task.sourceModule === 'evaluations' ? 'evaluations' : 'documents'} size={19} /></span>
            <button aria-label={`Xem chi tiết công việc: ${displayTitle}`} className="work-main task-detail-trigger" onClick={() => openTask(currentTask)} type="button">
              <strong>{displayTitle}</strong>
              <small>{relatedDoc ? `${relatedDoc.createdBy} · ${relatedDoc.department}` : (task.subjectName ?? task.assignedBy)}</small>
            </button>
            <StatusTag category="status" value={currentTask.status} />
            <time className="task-due" dateTime={task.dueAt}>{taskDue(task.dueAt)}</time>
          </article>;
        })}</div>
        <footer className="section-footer">
          <Link aria-label="Xem tất cả công việc" to="/tasks">Xem tất cả →</Link>
        </footer>
      </section>

      <aside className="dashboard-widgets communication-widget" aria-label="Cập nhật trong ngày">
        <section className="surface-panel compact-widget agenda-widget">
          <div className="widget-heading"><div><span className="section-icon meetings"><ModuleIcon module="meetings" /></span><span><h2>Họp trực tuyến</h2><p>{events.length} cuộc họp hôm nay</p></span></div></div>
          <div className="widget-body widget-timeline">{events.map((event) => <button className="widget-event" key={event.id} onClick={() => setSelectedEvent(event)} type="button"><time>{shortTime(event.startAt)}</time><span><strong>{event.title}</strong><small>{event.platform ?? event.location}</small></span></button>)}</div>
          <footer className="widget-footer">
            <Link aria-label="Xem tất cả họp trực tuyến" to="/calendar">Xem tất cả →</Link>
          </footer>
        </section>

        <section className="surface-panel compact-widget announcement-widget">
          <div className="widget-heading"><div><span className="section-icon announcements"><ModuleIcon module="announcements" /></span><span><h2>Thông báo cơ quan</h2><p>Mới từ cơ quan</p></span></div></div>
          <div className="widget-body widget-list announcement-widget-list">{announcements.slice(0, 3).map((item) => <button aria-label={`${item.isRead ? 'Thông báo đã đọc' : 'Thông báo mới'}: ${item.title}`} className={`widget-item ${item.isRead ? 'read' : 'unread'}`} key={item.id} onClick={() => setSelectedAnnouncement(item)} type="button"><i /><span><strong>{item.title}</strong><small>{item.issuingDepartment} · {new Date(item.publishedAt).toLocaleDateString('vi-VN')}</small></span></button>)}</div>
          <footer className="widget-footer">
            <Link aria-label="Xem tất cả thông báo cơ quan" to="/announcements">Xem tất cả →</Link>
          </footer>
        </section>

        <section className="surface-panel compact-widget chat-widget">
          <div className="widget-heading"><div><span className="section-icon chat"><ModuleIcon module="chat" /></span><span><h2>Tin nhắn mới</h2><p>{summary.unreadChatCount} chưa đọc</p></span></div></div>
          <div className="widget-body widget-list">{chats.slice(0, 2).map((chat) => <button key={chat.id} onClick={() => setSelectedChat(chat)} type="button"><span className={`mini-avatar chat-avatar ${avatarTone(chat.participantName)}`}>{chat.participantName.slice(0, 2).toUpperCase()}</span><span><strong>{chat.participantName}</strong><small>{chat.lastMessage}</small></span>{chat.unreadCount > 0 && <b>{chat.unreadCount}</b>}</button>)}</div>
          <footer className="widget-footer">
            <Link aria-label="Xem tất cả Chat" to="/chat">Xem tất cả →</Link>
          </footer>
        </section>

        <section className="surface-panel compact-widget mail-widget">
          <div className="widget-heading"><div><span className="section-icon mail"><ModuleIcon module="mail" /></span><span><h2>Mail chưa đọc</h2><p>{summary.unreadMailCount} thư cần xem</p></span></div></div>
          <div className="widget-body widget-list">{mails.slice(0, 2).map((mail) => <button key={mail.id} onClick={() => setSelectedMail(mail)} type="button"><span className={`mini-avatar mail-avatar ${avatarTone(mail.senderName)}`}>{mail.senderName.slice(0, 2).toUpperCase()}</span><span><strong>{mail.senderName}</strong><small>{mail.subject}</small></span><time>{shortTime(mail.sentAt)}</time></button>)}</div>
          <footer className="widget-footer">
            <Link aria-label="Xem tất cả Mail" to="/mail">Xem tất cả →</Link>
          </footer>
        </section>
      </aside>
    </div>
    {detailTask && <TaskDetailQuickView onClose={() => setDetailTask(null)} onSave={(status, progress) => setTaskUpdates((current) => ({ ...current, [detailTask.id]: { status, progress } }))} task={detailTask} />}
    <DocumentDetailModal document={detailDocument} onClose={() => setDetailDocument(null)} onUpdated={async (updated) => { setDetailDocument(updated); await state.reload(); }} />
    {selectedEvent && <CalendarQuickView event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    {selectedMail && <MailQuickView mail={selectedMail} onClose={() => setSelectedMail(null)} />}
    {selectedChat && <ChatQuickView chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    {selectedAnnouncement && <AnnouncementQuickView announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />}
  </div>;
}
