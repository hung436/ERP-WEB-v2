import { Button, Input, Modal, message } from 'antd';
import { ChevronRight, MessageCircle, Paperclip, Search, Workflow } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { TaskDetailQuickView } from '@/features/dashboard/quickViews/TaskDetailQuickView';
import { WorkTicketDetailPanel, type WorkTicketPanelTab } from '@/features/work-tickets/components/WorkTicketDetailModal';
import { WorkTicketFormModal } from '@/features/work-tickets/components/WorkTicketFormModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { taskApi, workTicketApi } from '@/services/api';
import { isFollowing, isMyTurn } from '@/features/work-tickets/ticketPermissions';
import type { DocumentStatus, Task, TaskStatus, WorkTicketSubmission, WorkTicketTemplate } from '@/types/domain';

// Nội dung tóm tắt hiển thị ngay trên thẻ feed, giống phần thân bài viết trên newsfeed
function ticketPreview(ticket: WorkTicketSubmission) {
  if (ticket.kind === 'blank') return ticket.fields.content;
  return ticket.fields.reason;
}

const statusLabels: Record<DocumentStatus, string> = { draft: 'Bản nháp', pending: 'Chờ xử lý', approved: 'Đã duyệt', rejected: 'Từ chối' };
const taskStatusLabels: Record<TaskStatus, string> = { todo: 'Chờ xử lý', in_progress: 'Đang xử lý', overdue: 'Quá hạn', completed: 'Đã xử lý' };
const taskStatusTone: Record<TaskStatus, string> = { todo: 'pending', in_progress: 'pending', overdue: 'rejected', completed: 'approved' };

// "Chờ xử lý" chỉ nên xuất hiện khi đó thực sự là việc của MÌNH — nếu phiếu đang chờ người khác duyệt
// thì hiện "Đang xử lý" (trung tính) để tránh người xem tưởng nhầm là việc của họ.
function ticketStatusMeta(item: WorkTicketSubmission, pendingForMe: boolean): { label: string; tone: string } {
  if (item.status !== 'pending') return { label: statusLabels[item.status], tone: item.status };
  return pendingForMe ? { label: 'Cần bạn duyệt', tone: 'pending' } : { label: 'Đang xử lý', tone: 'inprogress' };
}

type ViewScope = 'sent' | 'pending_review' | 'following';
type CombinedRow = { key: string; kind: 'ticket'; ticket: WorkTicketSubmission } | { key: string; kind: 'task'; task: Task };
// Chỉ tính "chờ tôi xử lý" khi mình là người phụ trách bước hiện tại (ticket) — người theo dõi không được tính vào đây
const isPendingForMe = (row: CombinedRow) => row.kind === 'ticket' ? isMyTurn(row.ticket) : row.task.status !== 'completed';

const validTabs: ViewScope[] = ['sent', 'pending_review', 'following'];

// Giống dòng thời gian trên newsfeed: "Vừa xong / x phút / x giờ / Hôm qua / x ngày trước", cũ hơn thì hiện ngày cụ thể
function formatFeedTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function WorkTicketsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const initialTab = requestedTab && validTabs.includes(requestedTab as ViewScope) ? (requestedTab as ViewScope) : 'all';
  const state = useAsyncData(async () => {
    const [templates, submissions, tasks] = await Promise.all([workTicketApi.templates(), workTicketApi.submissions(), taskApi.list()]);
    return { templates: templates.data, submissions: submissions.data, tasks: tasks.data };
  });
  const [selectedTemplate, setSelectedTemplate] = useState<WorkTicketTemplate | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<WorkTicketSubmission | null>(null);
  const [detailTab, setDetailTab] = useState<WorkTicketPanelTab>('workflow');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Record<string, { status: TaskStatus; progress: number }>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<ViewScope | 'all'>(initialTab);
  const [view, setView] = useState<ViewScope>(initialTab === 'all' ? 'pending_review' : initialTab);
  const [search, setSearch] = useState('');

  // "Công việc của tôi" chỉ gồm phiếu có liên quan tới mình: do mình gửi, đến lượt mình xử lý, hoặc mình theo dõi —
  // bỏ các phiếu hoàn toàn không liên quan (không phải người gửi/không phải người xử lý/không theo dõi) để
  // "Tất cả" luôn khớp với tổng 3 nhóm Chờ tôi xử lý + Tôi gửi + Tôi theo dõi.
  const submissions = useMemo(() => (state.data?.submissions ?? []).filter((item) => item.viewScope === 'sent' || isMyTurn(item) || isFollowing(item)), [state.data?.submissions]);
  // Bỏ công việc nguồn Tài liệu — chỉ giữ Đánh giá lao động và các loại khác ngoài Tài liệu
  const tasks = useMemo(() => (state.data?.tasks ?? []).filter((task) => task.sourceModule !== 'documents').map((task) => ({ ...task, ...taskUpdates[task.id] })), [state.data?.tasks, taskUpdates]);

  const combined = useMemo<CombinedRow[]>(() => [
    ...submissions.map((ticket) => ({ key: `ticket-${ticket.id}`, kind: 'ticket' as const, ticket })),
    ...tasks.map((task) => ({ key: `task-${task.id}`, kind: 'task' as const, task })),
  ], [submissions, tasks]);

  const matchesView = (row: CombinedRow, targetView: ViewScope) => {
    if (targetView === 'following') return row.kind === 'ticket' && isFollowing(row.ticket);
    if (targetView === 'sent') return row.kind === 'ticket' && row.ticket.viewScope === 'sent';
    return isPendingForMe(row);
  };

  const rows = useMemo(() => combined
    .filter((row) => activeMetric === 'all' || matchesView(row, view))
    .filter((row) => {
      if (!search.trim()) return true;
      const query = search.trim().toLocaleLowerCase('vi');
      const haystack = row.kind === 'ticket' ? `${row.ticket.title} ${row.ticket.createdBy} ${row.ticket.department}` : `${row.task.title} ${row.task.assignedBy} ${row.task.department ?? ''}`;
      return haystack.toLocaleLowerCase('vi').includes(query);
    }), [combined, activeMetric, view, search]);

  const sentCount = submissions.filter((item) => item.viewScope === 'sent').length;
  const pendingCount = submissions.filter((item) => isMyTurn(item)).length + tasks.filter((item) => item.status !== 'completed').length;
  const followingCount = submissions.filter((item) => isFollowing(item)).length;

  const updateSelectedTicket = async (updated: WorkTicketSubmission) => { setSelectedTicket(updated); await state.reload(); };

  // Duyệt ngay trên thẻ, không cần mở modal — dành cho trường hợp không cần ghi ý kiến.
  // Nếu cần từ chối hoặc thêm ý kiến thì vẫn phải mở "Xem quy trình".
  const quickApprove = async (ticket: WorkTicketSubmission) => {
    setApprovingId(ticket.id);
    try {
      await workTicketApi.action(ticket.id, 'approve', '');
      message.success('Đã duyệt nhanh');
      await state.reload();
    } catch (reason) { message.error(reason instanceof Error ? reason.message : 'Không thể duyệt phiếu'); }
    finally { setApprovingId(null); }
  };

  const openTask = (task: Task) => {
    if (task.sourceModule === 'evaluations') {
      if (task.subjectName === 'Lê Thanh Vân') navigate('/evaluations?sheetId=eval-van-q3');
      else if (task.subjectName === 'Đỗ Quang Huy') navigate('/evaluations?sheetId=eval-huy-q3');
      else if (task.subjectName === 'Mai Phương Thảo') navigate('/evaluations?sheetId=eval-mai-q3');
      else if (task.period === 'Quý II/2026') navigate('/evaluations?sheetId=eval-self-q2');
      else navigate('/evaluations');
      return;
    }
    setSelectedTask(task);
  };

  return <div className="module-page work-tickets-module-page work-feed-page">
    <div className="work-feed-toolbar">
      <div className="work-feed-filters" aria-label="Bộ lọc công việc" role="tablist">
        <button className={`work-filter-pill ${activeMetric === 'all' ? 'active' : ''}`} onClick={() => setActiveMetric('all')} role="tab" type="button">Tất cả<b>{combined.length}</b></button>
        <button className={`work-filter-pill ${activeMetric === 'pending_review' ? 'active' : ''}`} onClick={() => { setActiveMetric('pending_review'); setView('pending_review'); }} role="tab" type="button">Chờ tôi xử lý<b>{pendingCount}</b></button>
        <button className={`work-filter-pill ${activeMetric === 'sent' ? 'active' : ''}`} onClick={() => { setActiveMetric('sent'); setView('sent'); }} role="tab" type="button">Tôi gửi<b>{sentCount}</b></button>
        <button className={`work-filter-pill ${activeMetric === 'following' ? 'active' : ''}`} onClick={() => { setActiveMetric('following'); setView('following'); }} role="tab" type="button">Tôi theo dõi<b>{followingCount}</b></button>
      </div>
      <div className="work-feed-toolbar-actions">
        <Input allowClear onChange={(event) => setSearch(event.target.value)} placeholder="Tìm công việc, phiếu, người gửi, đơn vị…" prefix={<Search size={15} />} value={search} />
        <Button className="doc-create-btn" icon={<ModuleIcon module="work-tickets" size={17} />} onClick={() => setTemplatePickerOpen(true)} type="primary">Tạo phiếu</Button>
      </div>
    </div>

    <div className={`work-feed-split${selectedTicket ? ' has-detail' : ''}`}>
    <div className="work-feed-list-col">
    {state.loading ? <ContentSkeleton rows={4} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : !rows.length ? <EmptyState description="Không có công việc phù hợp" /> : <div className="work-feed">
      {rows.map((row) => {
        const pendingForMe = isPendingForMe(row);
        if (row.kind === 'ticket') {
          const item = row.ticket;
          const displayTitle = item.title.split(' · ')[0];
          const openTab = (tab: WorkTicketPanelTab) => { setDetailTab(tab); setSelectedTicket(item); };
          const open = () => openTab('workflow');
          const statusMeta = ticketStatusMeta(item, pendingForMe);
          const daysPending = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86_400_000);
          const isUrgent = pendingForMe && daysPending >= 2;
          const isApproving = approvingId === item.id;
          return <article className={`work-feed-card${pendingForMe ? ' is-pending' : ''}${selectedTicket?.id === item.id ? ' is-selected' : ''}`} key={row.key}>
            <div className="work-feed-card-main" onClick={open} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } }} role="button" tabIndex={0}>
              <span className={`work-feed-avatar task-module-icon ${item.kind}`}><ModuleIcon module="work-tickets" size={20} /></span>
              <div className="work-feed-body">
                <div className="work-feed-title-row"><strong>{displayTitle}</strong><span className={`document-status ${statusMeta.tone}`}>{statusMeta.label}</span></div>
                <div className="work-feed-meta">{item.createdBy} · {item.department} · <time>{formatFeedTime(item.createdAt)}</time>{isUrgent && <span className="work-feed-urgent"> · Đã chờ {daysPending} ngày</span>}</div>
                {ticketPreview(item) && <p className="work-feed-preview">{ticketPreview(item)}</p>}
                <div className="work-feed-actions">
                  <div className="work-feed-stats">
                    <button className="work-feed-stat" onClick={(event) => { event.stopPropagation(); openTab('workflow'); }} title="Xem quy trình" type="button"><Workflow size={15} /><span>{item.steps.length}</span></button>
                    <button className="work-feed-stat" onClick={(event) => { event.stopPropagation(); openTab('workflow'); }} title="Tệp đính kèm" type="button"><Paperclip size={15} /><span>{item.attachments.length}</span></button>
                    <button className="work-feed-stat" onClick={(event) => { event.stopPropagation(); openTab('discussion'); }} title="Thảo luận" type="button"><MessageCircle size={15} /><span>{item.comments.length}</span></button>
                  </div>
                  {pendingForMe && <button className="work-feed-btn primary" disabled={isApproving} onClick={(event) => { event.stopPropagation(); void quickApprove(item); }} type="button">{isApproving ? 'Đang duyệt…' : 'Duyệt nhanh'}</button>}
                </div>
              </div>
            </div>
          </article>;
        }
        const task = row.task;
        const open = () => openTask(task);
        return <article className="work-feed-card" key={row.key}>
          <div className="work-feed-card-main" onClick={open} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } }} role="button" tabIndex={0}>
            <span className="work-feed-avatar task-module-icon evaluations"><ModuleIcon module="evaluations" size={20} /></span>
            <div className="work-feed-body">
              <div className="work-feed-title-row"><strong>{task.title}</strong><span className={`document-status ${taskStatusTone[task.status]}`}>{taskStatusLabels[task.status]}</span></div>
              <div className="work-feed-meta">{task.assignedBy} · {task.department ?? '—'} · <time>{formatFeedTime(task.dueAt)}</time></div>
              {task.description && <p className="work-feed-preview">{task.description}</p>}
            </div>
          </div>
        </article>;
      })}
    </div>}
    </div>
    {selectedTicket && <WorkTicketDetailPanel initialTab={detailTab} onClose={() => setSelectedTicket(null)} onUpdated={updateSelectedTicket} ticket={selectedTicket} />}
    </div>
    <Modal centered className="document-template-picker" footer={null} onCancel={() => setTemplatePickerOpen(false)} open={templatePickerOpen} title="Chọn mẫu phiếu" width={760}><div className="document-template-grid">{(state.data?.templates ?? []).map((template) => <button className={`document-template-card ${template.kind}`} key={template.id} onClick={() => { setTemplatePickerOpen(false); setSelectedTemplate(template); }} type="button"><span className="document-template-icon"><ModuleIcon module="work-tickets" size={26} /></span><h3>{template.name}</h3><b><ChevronRight size={22} /></b></button>)}</div></Modal>
    <WorkTicketFormModal onClose={() => setSelectedTemplate(null)} onSubmitted={state.reload} template={selectedTemplate} />
    {selectedTask && <TaskDetailQuickView onClose={() => setSelectedTask(null)} onSave={(nextStatus, progress) => setTaskUpdates((current) => ({ ...current, [selectedTask.id]: { status: nextStatus, progress } }))} task={selectedTask} />}
  </div>;
}
