import { Button, Input, InputNumber, Modal, Progress, Select, message } from 'antd';
import { useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { StatusTag } from '@/components/StatusTag';
import type { Task, TaskStatus } from '@/types/domain';

const formatDate = (value: string) => new Date(value).toLocaleString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function TaskDetailQuickView({ task, onClose, onSave }: { task: Task; onClose: () => void; onSave: (status: TaskStatus, progress: number) => void }) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [progress, setProgress] = useState(task.progress ?? 0);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const save = () => { onSave(status, progress); message.success('Đã cập nhật xử lý công việc'); onClose(); };
  const submitEvaluation = () => {
    if (score === null) { message.warning('Vui lòng nhập điểm đánh giá'); return; }
    onSave('completed', 100);
    message.success(task.workflowKind === 'self_evaluation' ? 'Đã gửi tự đánh giá cá nhân' : 'Đã hoàn tất chấm điểm nhân viên');
    onClose();
  };
  const isEvaluation = task.sourceModule === 'evaluations';

  return <Modal centered className="dashboard-preview task-detail-modal" footer={null} onCancel={onClose} open title={<span className="preview-title"><span className="section-icon tasks"><ModuleIcon module="tasks" size={20} /></span>{isEvaluation ? 'Xử lý Đánh giá lao động' : 'Chi tiết công việc'}</span>} width={680}>
    <article className="task-detail-content">
      <header><div><span className={`task-workflow-source ${task.sourceModule ?? 'documents'}`}>{isEvaluation ? 'Đánh giá lao động' : 'Tài liệu'}</span><h3>{task.title}</h3><p>Mã công việc: {task.id} · {task.workflowStep ?? 'Đang xử lý'}</p></div><div className="preview-tags"><StatusTag category="status" value={task.status} /></div></header>
      <dl><div><dt>Nhân viên</dt><dd>{task.subjectName ?? task.assignedBy}</dd></div><div><dt>Đơn vị</dt><dd>{task.department || 'Chưa cập nhật'}</dd></div><div><dt>Kỳ đánh giá</dt><dd>{task.period ?? 'Chưa cập nhật'}</dd></div><div><dt>Hạn xử lý</dt><dd>{formatDate(task.dueAt)}</dd></div><div><dt>Tiến độ quy trình</dt><dd><Progress percent={task.progress ?? 0} size="small" strokeColor="#D92D20" /></dd></div></dl>
      <section><h4>Nội dung công việc</h4><p>{task.description || 'Chưa có mô tả chi tiết cho công việc này.'}</p></section>
      {isEvaluation && <section className="evaluation-processing"><div><h4>{task.workflowKind === 'self_evaluation' ? 'Tự đánh giá cá nhân' : 'Chấm điểm nhân viên cấp dưới'}</h4><p>{task.workflowKind === 'self_evaluation' ? 'Tự nhận xét kết quả thực hiện nhiệm vụ trong kỳ.' : 'Đối chiếu nội dung tự đánh giá trước khi cho điểm.'}</p></div><label htmlFor="evaluation-score"><span>Điểm đánh giá</span><InputNumber id="evaluation-score" max={100} min={0} onChange={setScore} placeholder="0–100" value={score} /></label><label htmlFor="evaluation-comment"><span>Nhận xét</span><Input.TextArea id="evaluation-comment" onChange={(event) => setComment(event.target.value)} placeholder="Nhập nhận xét đánh giá…" rows={3} value={comment} /></label></section>}
      {!isEvaluation && <section className="task-detail-processing"><div><h4>Xử lý công việc</h4><p>Vừa xem nội dung, vừa cập nhật tiến độ trong cùng cửa sổ.</p></div><label htmlFor="task-detail-status"><span>Trạng thái</span><Select id="task-detail-status" onChange={setStatus} options={[{ value: 'todo', label: 'Chưa thực hiện' }, { value: 'in_progress', label: 'Đang xử lý' }, { value: 'completed', label: 'Hoàn thành' }]} value={status} /></label><label htmlFor="task-detail-progress"><span>Tiến độ (%)</span><InputNumber id="task-detail-progress" max={100} min={0} onChange={(value) => setProgress(value ?? 0)} value={progress} /></label></section>}
      <footer><Button onClick={onClose}>Đóng</Button>{isEvaluation ? <Button onClick={submitEvaluation} type="primary">{task.workflowKind === 'self_evaluation' ? 'Gửi tự đánh giá' : 'Hoàn tất chấm điểm'}</Button> : <Button onClick={save} type="primary">Cập nhật xử lý</Button>}</footer>
    </article>
  </Modal>;
}
