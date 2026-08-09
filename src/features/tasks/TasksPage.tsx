import { Input, Pagination, Select, Table } from 'antd';
import { useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { StatusTag } from '@/components/StatusTag';
import { TaskDetailQuickView } from '@/features/dashboard/quickViews/TaskDetailQuickView';
import { DocumentDetailModal } from '@/features/documents/components/DocumentDetailModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { dashboardApi, documentApi, taskApi } from '@/services/api';
import type { DocumentSubmission, Task, TaskStatus } from '@/types/domain';

export function TasksPage() {
  const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentSubmission | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Record<string, { status: TaskStatus; progress: number }>>({});
  const query = `?${new URLSearchParams({ ...(status && { status }) }).toString()}`;
  const state = useAsyncData(async () => {
    const [filtered, summary, documents] = await Promise.all([taskApi.list(query), dashboardApi.summary(), documentApi.submissions()]);
    return { rows: filtered.data, summary: summary.data.taskSummary, documents: documents.data };
  }, query);
  const rows = (state.data?.rows ?? []).map((task) => ({ ...task, ...taskUpdates[task.id] })).filter((task) => `${task.title} ${task.assignedBy} ${task.department ?? ''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  const summary = state.data?.summary;
  const openTask = (task: Task) => {
    if (task.sourceModule === 'documents' && task.documentId) {
      setSelectedDocument(state.data?.documents.find((item) => item.id === task.documentId) ?? null);
      return;
    }
    setSelectedTask(task);
  };
  return <div className="module-page tasks-module-page">
    <section className="metric-grid" aria-label="Tổng quan công việc"><div><span>Tổng công việc</span><strong>{summary?.total ?? 0}</strong></div><div><span>Sắp đến hạn</span><strong>{summary?.dueSoon ?? 0}</strong></div><div><span>Quá hạn</span><strong className="text-brand">{summary?.overdue ?? 0}</strong></div><div><span>Hoàn thành</span><strong>{summary?.completed ?? 0}</strong></div></section>
    <div className="filter-bar tasks-filter-bar"><Input aria-label="Tìm công việc" allowClear onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm công việc, người gửi, đơn vị…" value={search} /><Select aria-label="Lọc theo trạng thái" onChange={setStatus} options={[{value:'',label:'Tất cả trạng thái'},{value:'todo',label:'Chưa thực hiện'},{value:'in_progress',label:'Đang xử lý'},{value:'completed',label:'Hoàn thành'},{value:'overdue',label:'Quá hạn'}]} value={status} /></div>
    {state.loading ? <ContentSkeleton rows={8} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : rows.length === 0 ? <EmptyState description="Không có công việc phù hợp bộ lọc" /> : <section className="surface-panel table-panel"><Table<Task> pagination={false} rowClassName="clickable-table-row" rowKey="id" onRow={(task) => ({ onClick: () => openTask(task), onKeyDown: (event) => { if (event.key === 'Enter') openTask(task); }, tabIndex: 0, 'aria-label': `Xem chi tiết công việc: ${task.title}` })} scroll={{x:720}} columns={[{title:'Công việc',dataIndex:'title',render:(value:string,row)=><div className="table-primary"><strong>{value}</strong><span>{row.assignedBy} · {row.department}</span></div>},{title:'Ngày gửi đến',dataIndex:'receivedAt',width:190,render:(value:string)=>new Date(value).toLocaleString('vi-VN')},{title:'Trạng thái',dataIndex:'status',width:150,render:(value:TaskStatus)=><StatusTag category="status" value={value}/>}]} dataSource={rows.slice((page-1)*6,page*6)} /><Pagination current={page} pageSize={6} total={rows.length} onChange={setPage} showSizeChanger={false} /></section>}
    {selectedTask && <TaskDetailQuickView onClose={() => setSelectedTask(null)} onSave={(nextStatus, progress) => setTaskUpdates((current) => ({ ...current, [selectedTask.id]: { status: nextStatus, progress } }))} task={selectedTask} />}
    <DocumentDetailModal document={selectedDocument} onClose={() => setSelectedDocument(null)} onUpdated={async (updated) => { setSelectedDocument(updated); await state.reload(); }} />
  </div>;
}
