import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { StatusTag } from '@/components/StatusTag';
import { AnnouncementQuickView } from '@/features/dashboard/quickViews/AnnouncementQuickView';
import { MeetingQuickView } from '@/features/dashboard/quickViews/MeetingQuickView';
import { ChatQuickView } from '@/features/dashboard/quickViews/ChatQuickView';
import { MailQuickView } from '@/features/dashboard/quickViews/MailQuickView';
import { TaskDetailQuickView } from '@/features/dashboard/quickViews/TaskDetailQuickView';
import { WorkTicketDetailModal } from '@/features/work-tickets/components/WorkTicketDetailModal';
import { isMyTurn } from '@/features/work-tickets/ticketPermissions';
import { useAsyncData } from '@/hooks/useAsyncData';
import { dashboardApi, taskApi, workTicketApi } from '@/services/api';
import type { Announcement, ChatConversation, MailItem, MeetingEvent, Task, TaskStatus, WorkTicketSubmission } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

type WorkItem = { key: string; kind: 'task'; task: Task } | { key: string; kind: 'ticket'; ticket: WorkTicketSubmission };

const taskDue = (value: string) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month} ${hour}:${minute}`;
};
const shortTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export function DashboardPage() {
  const navigate = useNavigate();

  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailTicket, setDetailTicket] = useState<WorkTicketSubmission | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Record<string, { status: TaskStatus; progress: number }>>({});
  const state = useAsyncData(async () => {
    const [summary, tasks, events, mails, chats, announcements, workTickets] = await Promise.all([
      dashboardApi.summary(), taskApi.list(), dashboardApi.events(), dashboardApi.mails(),
      dashboardApi.chats(), dashboardApi.announcements(), workTicketApi.submissions(),
    ]);
    return { summary: summary.data, tasks: tasks.data, events: events.data, mails: mails.data, chats: chats.data, announcements: announcements.data, workTickets: workTickets.data };
  });

  if (state.loading) return <ContentSkeleton rows={10} />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;
  // Cùng tiêu chí "Chờ xử lý" như trang module Công việc (/tasks): công việc từ Đánh giá lao động
  // (không tính Tài liệu) chưa hoàn thành + phiếu mà mình là người phụ trách bước hiện tại
  // (người theo dõi không được tính, không có quyền duyệt)
  const pendingTasks = (state.data?.tasks ?? []).filter((item) => item.sourceModule !== 'documents' && item.status !== 'completed');
  const pendingTickets = (state.data?.workTickets ?? []).filter((item) => isMyTurn(item));
  if (!state.data || (pendingTasks.length === 0 && pendingTickets.length === 0)) return <EmptyState description="Hôm nay chưa có công việc cần xử lý" />;
  const { summary, events, mails, chats, announcements } = state.data;
  const workItems: WorkItem[] = [
    ...pendingTickets.map((ticket) => ({ key: `ticket-${ticket.id}`, kind: 'ticket' as const, ticket })),
    ...pendingTasks.map((task) => ({ key: `task-${task.id}`, kind: 'task' as const, task })),
  ];
  const pendingTotal = workItems.length;

  const openTask = (task: Task) => {
    if (task.subjectName === 'Lê Thanh Vân') navigate('/evaluations?mode=scoring&sheetId=eval-van-q3');
    else if (task.subjectName === 'Đỗ Quang Huy') navigate('/evaluations?mode=scoring&sheetId=eval-huy-q3');
    else if (task.subjectName === 'Mai Phương Thảo') navigate('/evaluations?mode=scoring&sheetId=eval-mai-q3');
    else if (task.period === 'Quý II/2026') navigate('/evaluations?mode=self&sheetId=eval-self-q2');
    else if (task.sourceModule === 'evaluations') navigate('/evaluations?mode=scoring');
    else setDetailTask(task);
  };

  return (
    <div className="dashboard-page">
      <section aria-label="Tổng quan không gian làm việc" className="workspace-metrics">
        <Link className="workspace-metric metric-tasks" to="/tasks?tab=pending_review"><span className="metric-icon"><ModuleIcon module="work-tickets" /></span><span className="metric-copy"><small>Việc chờ xử lý</small><strong>{pendingTotal}</strong></span><span className="metric-arrow">›</span></Link>
        <Link className="workspace-metric metric-announcements" to="/announcements"><span className="metric-icon"><ModuleIcon module="announcements" /></span><span className="metric-copy"><small>Thông báo mới</small><strong>{announcements.filter((item) => !item.isRead).length}</strong></span><span className="metric-arrow">›</span></Link>
        <Link className="workspace-metric metric-chat" to="/chat"><span className="metric-icon"><ModuleIcon module="chat" /></span><span className="metric-copy"><small>Tin nhắn chưa đọc</small><strong>{summary.unreadChatCount}</strong></span><span className="metric-arrow">›</span></Link>
        <Link className="workspace-metric metric-mail" to="/mail"><span className="metric-icon"><ModuleIcon module="mail" /></span><span className="metric-copy"><small>Email chưa đọc</small><strong>{summary.unreadMailCount}</strong></span><span className="metric-arrow">›</span></Link>
      </section>

      <div className="dashboard-focus">
        <section aria-labelledby="dashboard-tasks-title" className="surface-panel dashboard-tasks">
          <div className="section-heading"><div><div><h2 id="dashboard-tasks-title">Công việc của tôi</h2></div><span className="section-count">{workItems.length}</span></div></div>
          <div className="work-list">{workItems.map((item) => {
            if (item.kind === 'ticket') {
              const ticket = item.ticket;
              const displayTitle = ticket.title.split(' · ')[0];
              return <article className="work-item" key={item.key}>
                <span className={`task-module-icon ${ticket.kind}`}><ModuleIcon module="work-tickets" size={19} /></span>
                <button aria-label={`Xem chi tiết công việc: ${displayTitle}`} className="work-main task-detail-trigger" onClick={() => setDetailTicket(ticket)} type="button">
                  <strong>{displayTitle}</strong>
                  <small>{ticket.createdBy} · {ticket.department}</small>
                </button>
                <StatusTag category="status" value={ticket.status} />
                <time className="task-due" dateTime={ticket.createdAt}>{taskDue(ticket.createdAt)}</time>
                <button className="work-ticket-process-btn" onClick={() => setDetailTicket(ticket)} type="button">Xử lý</button>
              </article>;
            }
            const task = item.task;
            const currentTask = { ...task, ...taskUpdates[task.id] };
            // Tiêu đề đánh giá cấp dưới đã có sẵn "· Tên người", nên dòng phụ chỉ nêu thêm đơn vị để tránh lặp tên
            const subtitle = task.workflowKind === 'self_evaluation'
              ? task.subjectName ?? task.assignedBy
              : task.department ?? task.subjectName ?? task.assignedBy;

            return <article className="work-item" key={item.key}>
              <span className="task-module-icon evaluations"><ModuleIcon module="evaluations" size={19} /></span>
              <button aria-label={`Xem chi tiết công việc: ${task.title}`} className="work-main task-detail-trigger" onClick={() => openTask(currentTask)} type="button">
                <strong>{task.title}</strong>
                <small>{subtitle}</small>
              </button>
              <StatusTag category="status" value={currentTask.status} />
              <time className="task-due" dateTime={task.dueAt}>{taskDue(task.dueAt)}</time>
            </article>;
          })}</div>
          <footer className="section-footer">
            <Link aria-label="Xem tất cả công việc" to="/tasks?tab=pending_review">Xem tất cả →</Link>
          </footer>
        </section>

        <aside aria-label="Cập nhật trong ngày" className="dashboard-widgets communication-widget">
          <section className="surface-panel compact-widget announcement-widget">
            <div className="widget-heading"><div><span className="section-icon announcements"><ModuleIcon module="announcements" /></span><span className="widget-heading-copy"><h2>Thông báo cơ quan</h2><span className="section-count">{announcements.filter((item) => !item.isRead).length}</span></span></div></div>
            <div className="widget-body widget-list announcement-widget-list">{announcements.slice(0, 3).map((item) => <button aria-label={`${item.isRead ? 'Thông báo đã đọc' : 'Thông báo mới'}: ${item.title}`} className={`widget-item ${item.isRead ? 'read' : 'unread'}`} key={item.id} onClick={() => setSelectedAnnouncement(item)} type="button"><i /><span><strong>{item.title}</strong><small>{item.issuingDepartment} · {new Date(item.publishedAt).toLocaleDateString('vi-VN')}</small></span></button>)}</div>
            <footer className="widget-footer">
              <Link aria-label="Xem tất cả thông báo cơ quan" to="/announcements">Xem tất cả →</Link>
            </footer>
          </section>

          <section className="surface-panel compact-widget agenda-widget">
            <div className="widget-heading"><div><span className="section-icon meetings"><ModuleIcon module="meetings" /></span><span className="widget-heading-copy"><h2>Họp trực tuyến</h2><span className="section-count">{events.length}</span></span></div></div>
            <div className="widget-body widget-timeline">{events.map((event) => <button className="widget-event" key={event.id} onClick={() => setSelectedEvent(event)} type="button"><time>{shortTime(event.startAt)}</time><span><strong>{event.title}</strong><small>{event.platform ?? event.location}</small></span></button>)}</div>
            <footer className="widget-footer">
              <Link aria-label="Xem tất cả họp trực tuyến" to="/meeting">Xem tất cả →</Link>
            </footer>
          </section>

          <section className="surface-panel compact-widget chat-widget">
            <div className="widget-heading"><div><span className="section-icon chat"><ModuleIcon module="chat" /></span><span className="widget-heading-copy"><h2>Tin nhắn</h2><span className="section-count">{summary.unreadChatCount}</span></span></div></div>
            <div className="widget-body widget-list">{chats.slice(0, 2).map((chat) => <button key={chat.id} onClick={() => setSelectedChat(chat)} type="button"><span className={`mini-avatar chat-avatar ${avatarTone(chat.participantName)}`}>{chat.participantName.slice(0, 2).toUpperCase()}</span><span><strong>{chat.participantName}</strong><small>{chat.lastMessage}</small></span>{chat.unreadCount > 0 && <b>{chat.unreadCount}</b>}</button>)}</div>
            <footer className="widget-footer">
              <Link aria-label="Xem tất cả Chat" to="/chat">Xem tất cả →</Link>
            </footer>
          </section>

          <section className="surface-panel compact-widget mail-widget">
            <div className="widget-heading"><div><span className="section-icon mail"><ModuleIcon module="mail" /></span><span className="widget-heading-copy"><h2>Email</h2><span className="section-count">{summary.unreadMailCount}</span></span></div></div>
            <div className="widget-body widget-list">{mails.slice(0, 2).map((mail) => <button key={mail.id} onClick={() => setSelectedMail(mail)} type="button"><span className={`mini-avatar mail-avatar ${avatarTone(mail.senderName)}`}>{mail.senderName.slice(0, 2).toUpperCase()}</span><span><strong>{mail.senderName}</strong><small>{mail.subject}</small></span><time>{shortTime(mail.sentAt)}</time></button>)}</div>
            <footer className="widget-footer">
              <Link aria-label="Xem tất cả Mail" to="/mail">Xem tất cả →</Link>
            </footer>
          </section>
        </aside>
      </div>

      {detailTask && (
        <TaskDetailQuickView
          onClose={() => setDetailTask(null)}
          onSave={(status, progress) => {
            setTaskUpdates((prev) => ({ ...prev, [detailTask.id]: { status, progress } }));
            setDetailTask(null);
          }}
          task={detailTask}
        />
      )}

      <WorkTicketDetailModal
        onClose={() => setDetailTicket(null)}
        onUpdated={async (updated) => {
          setDetailTicket(updated);
          await state.reload();
        }}
        ticket={detailTicket}
      />

      {selectedEvent && <MeetingQuickView event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {selectedMail && <MailQuickView mail={selectedMail} onClose={() => setSelectedMail(null)} />}
      {selectedChat && <ChatQuickView chat={selectedChat} onClose={() => setSelectedChat(null)} />}
      {selectedAnnouncement && <AnnouncementQuickView announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />}
    </div>
  );
}
