import { Input, Pagination, Select, Table } from 'antd';
import { useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { StatusTag } from '@/components/StatusTag';
import { TaskDetailQuickView } from '@/features/dashboard/quickViews/TaskDetailQuickView';
import { DocumentDetailModal } from '@/features/documents/components/DocumentDetailModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { dashboardApi, documentApi, taskApi } from '@/services/api';
import type { DocumentSubmission, Task, TaskStatus } from '@/types/domain';

import { useNavigate, useSearchParams } from 'react-router-dom';

export function TasksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatusState] = useState(searchParams.get('status') ?? '');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentSubmission | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Record<string, { status: TaskStatus; progress: number }>>({});

  const setStatus = (nextStatus: string) => {
    setStatusState(nextStatus);
    setPage(1);
    if (nextStatus) setSearchParams({ status: nextStatus });
    else setSearchParams({});
  };

  const query = `?${new URLSearchParams({ ...(status && { status }) }).toString()}`;
  const state = useAsyncData(async () => {
    const [filtered, summary, documents] = await Promise.all([taskApi.list(query), dashboardApi.summary(), documentApi.submissions()]);
    return { rows: filtered.data, summary: summary.data.taskSummary, documents: documents.data };
  }, query);
  const rows = (state.data?.rows ?? []).map((task) => ({ ...task, ...taskUpdates[task.id] })).filter((task) => `${task.title} ${task.assignedBy} ${task.department ?? ''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  const summary = state.data?.summary;
  const openTask = (task: Task) => {
    if (task.sourceModule === 'evaluations') {
      if (task.subjectName === 'Lê Thanh Vân') navigate('/evaluations?sheetId=eval-van-q3');
      else if (task.subjectName === 'Đỗ Quang Huy') navigate('/evaluations?sheetId=eval-huy-q3');
      else if (task.subjectName === 'Mai Phương Thảo') navigate('/evaluations?sheetId=eval-mai-q3');
      else if (task.period === 'Quý II/2026') navigate('/evaluations?sheetId=eval-self-q2');
      else navigate('/evaluations');
      return;
    }
    if (task.sourceModule === 'documents' && task.documentId) {
      setSelectedDocument(state.data?.documents.find((item) => item.id === task.documentId) ?? null);
      return;
    }
    setSelectedTask(task);
  };
  return <div className="module-page tasks-module-page">
    <div className="filter-bar tasks-filter-bar"><Input aria-label="Tìm công việc" allowClear onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm công việc, người gửi, đơn vị…" value={search} /><Select aria-label="Lọc theo trạng thái" onChange={setStatus} options={[{value:'',label:'Tất cả trạng thái'},{value:'todo',label:'Chờ xử lý'},{value:'completed',label:'Đã xử lý'}]} value={status} /></div>
    {state.loading ? <ContentSkeleton rows={8} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : rows.length === 0 ? <EmptyState description="Không có công việc phù hợp bộ lọc" /> : <section className="surface-panel table-panel"><Table<Task> pagination={false} rowClassName="clickable-table-row" rowKey="id" onRow={(task) => ({ onClick: () => openTask(task), onKeyDown: (event) => { if (event.key === 'Enter') openTask(task); }, tabIndex: 0, 'aria-label': `Xem chi tiết công việc: ${task.title}` })} scroll={{x:720}} columns={[{title:'Công việc',dataIndex:'title',render:(value:string,row)=><div className="task-table-primary"><span className={`task-module-icon ${row.sourceModule ?? 'documents'}`}><ModuleIcon module={row.sourceModule === 'evaluations' ? 'evaluations' : 'documents'} size={19} /></span><div className="table-primary"><strong>{value}</strong><span>{row.assignedBy} · {row.department}</span></div></div>},{title:'Trạng thái',dataIndex:'status',width:140,render:(value:TaskStatus)=><StatusTag category="status" value={value}/>},{title:'Thời gian',dataIndex:'receivedAt',width:170,render:(value:string)=>new Date(value).toLocaleString('vi-VN')}]} dataSource={rows.slice((page-1)*6,page*6)} /><Pagination current={page} pageSize={6} total={rows.length} onChange={setPage} showSizeChanger={false} /></section>}
    {selectedTask && <TaskDetailQuickView onClose={() => setSelectedTask(null)} onSave={(nextStatus, progress) => setTaskUpdates((current) => ({ ...current, [selectedTask.id]: { status: nextStatus, progress } }))} task={selectedTask} />}
    <DocumentDetailModal document={selectedDocument} onClose={() => setSelectedDocument(null)} onUpdated={async (updated) => { setSelectedDocument(updated); await state.reload(); }} />
  </div>;
}
