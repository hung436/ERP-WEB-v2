import { Button, DatePicker, Empty, Input, Modal, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Paperclip, Plus, MessageCircle, MessageSquare, Send, UserCog, Users, Workflow, X } from 'lucide-react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { StatusTag } from '@/components/StatusTag';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { demoUser } from '@/mocks/fixtures';
import { followerOptions } from '@/mocks/workTicketFixtures';
import { workTicketApi } from '@/services/api';
import { formatFileSize, getFileKind } from '@/features/work-tickets/attachmentUtils';
import { isMyTurn } from '@/features/work-tickets/ticketPermissions';
import type { DocumentConsultationSubStep, DocumentWorkflowStep, WorkTicketSubmission } from '@/types/domain';

const stepLabels: Record<DocumentWorkflowStep['status'], string> = {
  waiting: 'Chờ đến lượt',
  pending: 'Đang chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Không đồng ý',
};

function ReadonlyLine({ label, value }: { label: string; value?: string }) {
  return <div className="readonly-document-line"><span>{label}</span><strong>{value || '—'}</strong></div>;
}

function ReadonlyTicket({ ticket }: { ticket: WorkTicketSubmission }) {
  const fields = ticket.fields;
  if (ticket.kind === 'blank') return <section className="document-paper blank-document-paper readonly-document-paper">
    <div className="document-wordmark"><img alt="Tuổi Trẻ" src={tuoiTreLogo} /></div>
    <h2>PHIẾU CÔNG VIỆC</h2>
    <ReadonlyLine label="Tiêu đề:" value={fields.title} />
    <ReadonlyLine label="Người lập phiếu:" value={ticket.createdBy} />
    <ReadonlyLine label="Đơn vị:" value={fields.department} />
    <ReadonlyLine label="Nội dung công việc:" value={fields.content} />
  </section>;
  if (ticket.kind === 'leave_request') return <section className="document-paper leave-document-paper readonly-document-paper">
    <div className="document-wordmark"><img alt="Tuổi Trẻ" src={tuoiTreLogo} /></div>
    <h2>ĐƠN XIN NGHỈ PHÉP</h2>
    <ReadonlyLine label="Họ tên:" value={fields.fullName} />
    <ReadonlyLine label="Bộ phận công tác:" value={fields.department} />
    <div className="document-two-columns"><ReadonlyLine label="Từ ngày:" value={fields.fromDate} /><ReadonlyLine label="Đến hết ngày:" value={fields.toDate} /></div>
    <ReadonlyLine label="Lý do:" value={fields.reason} />
    <ReadonlyLine label="Địa điểm nghỉ:" value={fields.leaveLocation} />
  </section>;
  return <section className="document-paper overseas-document-paper readonly-document-paper">
    <header className="formal-document-header"><strong>BÁO TUỔI TRẺ</strong><div><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><span>Độc lập - Tự do - Hạnh phúc</span><em>TP. HCM, ngày …… tháng …… năm ……</em></div></header>
    <div className="formal-document-title"><h2>PHIẾU ĐỀ XUẤT</h2><strong>V/v đi nước ngoài về việc riêng</strong><span>─────</span></div>
    <ReadonlyLine label="Họ tên:" value={fields.fullName} />
    <ReadonlyLine label="Chức vụ, đơn vị:" value={fields.positionUnit} />
    <p className="formal-intro">Đề xuất được đi công tác nước ngoài về việc riêng sau:</p>
    <ReadonlyLine label="1. Địa điểm đi:" value={fields.destination} />
    <div className="document-two-columns"><ReadonlyLine label="2. Ngày đi:" value={fields.departureDate} /><ReadonlyLine label="3. Ngày về:" value={fields.returnDate} /></div>
    <ReadonlyLine label="4. Lý do đi:" value={fields.reason} />
    <ReadonlyLine label="5. Đơn vị mời (nếu có):" value={fields.hostUnit} />
    <ReadonlyLine label="6. Kinh phí:" value={fields.funding === 'host' ? 'Do bên mời đài thọ' : fields.funding === 'self' ? 'Cá nhân tự túc' : fields.funding} />
    <ReadonlyLine label="* Khác:" value={fields.fundingOther} />
    <div className="formal-signatures"><span>Người đề xuất</span><strong>Ý kiến của Trưởng bộ phận</strong><strong>Ý kiến của Ban biên tập phụ trách</strong><strong>Duyệt của Tổng Biên tập</strong></div>
  </section>;
}

function WorkflowTab({ ticket }: { ticket: WorkTicketSubmission }) {
  return <ol className="workflow-steps">
    {ticket.steps.map((step, index) => {
      const hasAssignee = Boolean(step.assignee) && step.assignee !== 'Chờ phân công';
      return <li className={step.status} key={step.id}>
        <i>{step.status === 'approved' ? '✓' : step.status === 'rejected' ? '×' : index + 1}</i>
        <div>
          <div className="workflow-step-head">
            <strong>{step.name}</strong>
            {step.status !== 'waiting' && <span className={`workflow-status-pill ${step.status}`}>{stepLabels[step.status]}</span>}
          </div>
          {hasAssignee && <span>{step.assignee}</span>}
          {step.actedAt && <time>{new Date(step.actedAt).toLocaleString('vi-VN')}</time>}
          {step.note && <p className="workflow-step-note">{step.note}</p>}
          {step.consultations && step.consultations.length > 0 && <div className="workflow-consult-group">
            <span className="workflow-consult-label">Ý kiến tham vấn</span>
            <ul className="workflow-consult-list">
              {step.consultations.map((sub) => <li className="workflow-consult-item" key={sub.id}>
                <div className="workflow-consult-header">
                  <span aria-hidden="true" className="workflow-consult-icon"><MessageSquare size={12} /></span>
                  <strong>{sub.assignee}</strong>
                  <span className={`workflow-status-pill compact ${sub.status}`}>{sub.status === 'approved' ? 'Đã cho ý kiến' : 'Chờ cho ý kiến'}</span>
                </div>
                {sub.actedAt ? <span className="workflow-consult-meta">{new Date(sub.actedAt).toLocaleString('vi-VN')}</span> : sub.deadline && <span className="workflow-consult-meta">Hạn: {sub.deadline}</span>}
                {sub.note && <p className="workflow-consult-note">{sub.note}</p>}
              </li>)}
            </ul>
          </div>}
        </div>
      </li>;
    })}
  </ol>;
}

function AttachmentList({ ticket }: { ticket: WorkTicketSubmission }) {
  if (!ticket.attachments.length) return null;
  return <section className="work-ticket-attachments">
    <h4><Paperclip size={13} /> Tệp đính kèm ({ticket.attachments.length})</h4>
    <div className="work-ticket-attachment-grid">
      {ticket.attachments.map((file) => {
        const kind = getFileKind(file.name);
        const Icon = kind.icon;
        return <div className="work-ticket-attachment-card" key={file.id} title={file.name}>
          <span className={`work-ticket-attachment-icon tone-${kind.tone}`}><Icon size={18} /></span>
          <span className="work-ticket-attachment-info">
            <strong>{file.name}</strong>
            <small>{kind.label} · {formatFileSize(file.size)}</small>
          </span>
        </div>;
      })}
    </div>
  </section>;
}

function FollowersTab({ ticket, onUpdated }: { ticket: WorkTicketSubmission; onUpdated: (ticket: WorkTicketSubmission) => Promise<void> }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const [adding, setAdding] = useState(false);
  const available = followerOptions.filter((option) => !ticket.followers.some((follower) => follower.id === option.id));

  const addFollower = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      const updated = (await workTicketApi.addFollower(ticket.id, selected)).data;
      setSelected(undefined);
      setPickerOpen(false);
      await onUpdated(updated);
    } catch (reason) { message.error(reason instanceof Error ? reason.message : 'Không thể thêm người theo dõi'); }
    finally { setAdding(false); }
  };

  return <div className="work-ticket-followers-tab">
    {ticket.followers.length ? <ul className="work-ticket-followers-list">
      {ticket.followers.map((follower) => <li key={follower.id}><strong>{follower.name}</strong><span>{follower.positionName} · {follower.departmentName}</span></li>)}
    </ul> : <Empty description="Chưa có người theo dõi" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    {pickerOpen ? <div className="work-ticket-follower-picker">
      <Select onChange={setSelected} options={available.map((item) => ({ value: item.id, label: `${item.name} · ${item.positionName} · ${item.departmentName}` }))} placeholder="Chọn người theo dõi" showSearch value={selected} filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
      <div className="work-ticket-follower-picker-actions">
        <Button onClick={() => { setPickerOpen(false); setSelected(undefined); }} size="small">Hủy</Button>
        <Button disabled={!selected} loading={adding} onClick={() => void addFollower()} size="small" type="primary">Thêm</Button>
      </div>
    </div> : <Button block className="work-ticket-add-follower-btn" disabled={!available.length} icon={<Plus size={14} />} onClick={() => setPickerOpen(true)} type="dashed">Thêm người theo dõi</Button>}
  </div>;
}

function DiscussionTab({ ticket, onUpdated }: { ticket: WorkTicketSubmission; onUpdated: (ticket: WorkTicketSubmission) => Promise<void> }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const updated = (await workTicketApi.comment(ticket.id, draft.trim())).data;
      setDraft('');
      await onUpdated(updated);
    } catch (reason) { message.error(reason instanceof Error ? reason.message : 'Không thể gửi bình luận'); }
    finally { setSending(false); }
  };

  return <div className="work-ticket-discussion">
    <div className="work-ticket-comment-list">
      {ticket.comments.length ? ticket.comments.map((comment) => <div className="work-ticket-comment" key={comment.id}>
        <div className="work-ticket-comment-head"><strong>{comment.author}</strong><time>{new Date(comment.createdAt).toLocaleString('vi-VN')}</time></div>
        <p>{comment.content}</p>
      </div>) : <Empty description="Chưa có thảo luận nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    </div>
    <div className="work-ticket-comment-composer">
      <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} onChange={(event) => setDraft(event.target.value)} onPressEnter={(event) => { if (!event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={`Bình luận với tư cách ${demoUser.fullName}…`} value={draft} />
      <Button disabled={!draft.trim()} icon={<Send size={15} />} loading={sending} onClick={() => void send()} type="primary" />
    </div>
  </div>;
}

export type WorkTicketPanelTab = 'workflow' | 'followers' | 'discussion';
type PanelTab = WorkTicketPanelTab;

// Dùng chung cho cả Modal (Dashboard) và Panel gắn liền trang (module Công việc) —
// tránh lặp lại state ghi ý kiến/duyệt-từ chối ở hai nơi.
function useTicketAction(ticket: WorkTicketSubmission | null, onUpdated: (ticket: WorkTicketSubmission) => Promise<void>) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState<'approve' | 'reject' | null>(null);

  const act = async (action: 'approve' | 'reject', nextAssignee?: string) => {
    if (!ticket) return;
    setSaving(action);
    try {
      const updated = (await workTicketApi.action(ticket.id, action, note, nextAssignee)).data;
      message.success(action === 'approve' ? (nextAssignee ? `Đã duyệt và giao cho ${nextAssignee} triển khai` : 'Đã duyệt và chuyển bước tiếp theo') : 'Đã phản hồi không duyệt');
      setNote('');
      await onUpdated(updated);
    } catch (reason) { message.error(reason instanceof Error ? reason.message : 'Không thể xử lý phiếu'); }
    finally { setSaving(null); }
  };

  return { note, setNote, saving, act };
}

// "Lấy ý kiến": gắn thêm nhánh tham vấn vào bước hiện tại mà không chuyển bước — chỉ lưu cục bộ qua onUpdated
// (giống cơ chế đã dùng ở module Tài liệu), không có endpoint riêng trên mockApi.
function useConsultation(ticket: WorkTicketSubmission | null, onUpdated: (ticket: WorkTicketSubmission) => Promise<void>) {
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);
  const [consultDate, setConsultDate] = useState<Dayjs | null>(() => dayjs().add(1, 'day'));
  const [submittingConsult, setSubmittingConsult] = useState(false);

  const activeStep = ticket?.steps[ticket.currentStep];
  const pendingConsult = activeStep?.consultations?.find((sub) => sub.status === 'pending');

  const sendConsultation = async () => {
    if (!ticket) return;
    if (!selectedConsultants.length) { message.error('Vui lòng chọn ít nhất 1 người cần lấy ý kiến'); return; }
    const deadline = consultDate ? consultDate.format('DD/MM/YYYY') : undefined;
    setSubmittingConsult(true);
    try {
      const newConsults: DocumentConsultationSubStep[] = selectedConsultants.map((name, index) => ({ id: `${ticket.id}-consult-${Date.now()}-${index}`, name: `Lấy ý kiến: ${name}`, assignee: name, status: 'pending', deadline }));
      const steps = ticket.steps.map((step, index) => index === ticket.currentStep ? { ...step, consultations: [...(step.consultations ?? []), ...newConsults] } : step);
      await onUpdated({ ...ticket, steps });
      message.success(`Đã gửi yêu cầu lấy ý kiến tới ${selectedConsultants.length} người`);
      setConsultModalOpen(false);
      setSelectedConsultants([]);
    } catch { message.error('Không thể gửi yêu cầu lấy ý kiến'); }
    finally { setSubmittingConsult(false); }
  };

  return { consultModalOpen, setConsultModalOpen, selectedConsultants, setSelectedConsultants, consultDate, setConsultDate, submittingConsult, sendConsultation, pendingConsult };
}

function TicketDetailBody({ ticket, onUpdated, activeTab, setActiveTab }: { ticket: WorkTicketSubmission; onUpdated: (ticket: WorkTicketSubmission) => Promise<void>; activeTab: PanelTab; setActiveTab: (tab: PanelTab) => void }) {
  return <div className="document-detail-layout work-ticket-detail-layout">
    <div className="document-detail-paper-scroll">
      <ReadonlyTicket ticket={ticket} />
      <AttachmentList ticket={ticket} />
    </div>
    <aside className="document-workflow-panel work-ticket-panel">
      <div className="workflow-sent-date">
        <small>NGÀY GỬI</small>
        <strong>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</strong>
      </div>
      <div className="work-ticket-tabbar" role="tablist">
        <button className={activeTab === 'workflow' ? 'active' : ''} onClick={() => setActiveTab('workflow')} role="tab" type="button"><Workflow size={14} /> Quy trình</button>
        <button className={activeTab === 'followers' ? 'active' : ''} onClick={() => setActiveTab('followers')} role="tab" type="button"><Users size={14} /> Theo dõi{ticket.followers.length ? ` (${ticket.followers.length})` : ''}</button>
        <button className={activeTab === 'discussion' ? 'active' : ''} onClick={() => setActiveTab('discussion')} role="tab" type="button"><MessageCircle size={14} /> Thảo luận{ticket.comments.length ? ` (${ticket.comments.length})` : ''}</button>
      </div>
      <div className="work-ticket-tab-content">
        {activeTab === 'workflow' && <WorkflowTab ticket={ticket} />}
        {activeTab === 'followers' && <FollowersTab onUpdated={onUpdated} ticket={ticket} />}
        {activeTab === 'discussion' && <DiscussionTab onUpdated={onUpdated} ticket={ticket} />}
      </div>
    </aside>
  </div>;
}

export function WorkTicketDetailModal({ ticket, onClose, onUpdated, initialTab = 'workflow' }: { ticket: WorkTicketSubmission | null; onClose: () => void; onUpdated: (ticket: WorkTicketSubmission) => Promise<void>; initialTab?: PanelTab }) {
  const [activeTab, setActiveTab] = useState<PanelTab>('workflow');
  const { note, setNote, saving, act } = useTicketAction(ticket, onUpdated);
  const { consultModalOpen, setConsultModalOpen, selectedConsultants, setSelectedConsultants, consultDate, setConsultDate, submittingConsult, sendConsultation, pendingConsult } = useConsultation(ticket, onUpdated);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployAssignee, setDeployAssignee] = useState<string | undefined>();

  useEffect(() => { if (ticket) setActiveTab(initialTab); }, [ticket?.id, initialTab]);

  const hasNextStep = Boolean(ticket) && ticket!.currentStep < ticket!.steps.length - 1;
  const consultantOptions = followerOptions.map((item) => ({ value: item.name, label: `${item.name} · ${item.positionName} · ${item.departmentName}` }));

  const confirmDeploy = async () => {
    if (!deployAssignee) { message.error('Vui lòng chọn người triển khai'); return; }
    await act('approve', deployAssignee);
    setDeployModalOpen(false);
    setDeployAssignee(undefined);
  };

  return <>
    <Modal centered className="document-detail-modal work-ticket-detail-modal" footer={ticket && isMyTurn(ticket) ? <div className="document-approval-footer">
      <Input.TextArea aria-label="Ý kiến xử lý" onChange={(event) => setNote(event.target.value)} placeholder="Nhập ý kiến xử lý (không bắt buộc)" rows={2} value={note} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Button icon={<MessageSquare size={14} />} onClick={() => setConsultModalOpen(true)}>{pendingConsult ? 'Thêm người lấy ý kiến' : 'Lấy ý kiến'}</Button>
        {hasNextStep && <Button icon={<UserCog size={14} />} onClick={() => setDeployModalOpen(true)}>Triển khai</Button>}
        <Button danger loading={saving === 'reject'} onClick={() => void act('reject')} style={{ marginLeft: 'auto' }}>Không duyệt</Button>
        <Button loading={saving === 'approve'} onClick={() => void act('approve')} type="primary">Duyệt</Button>
      </div>
    </div> : <Button onClick={onClose} type="primary">Đóng</Button>} onCancel={onClose} open={Boolean(ticket)} title={<span className="preview-title"><span className="section-icon documents"><ModuleIcon module="work-tickets" size={20} /></span>{ticket?.title.split(' · ')[0]}{ticket && <StatusTag category="status" value={ticket.status} />}</span>} width={1240}>
      {ticket && <TicketDetailBody activeTab={activeTab} onUpdated={onUpdated} setActiveTab={setActiveTab} ticket={ticket} />}
    </Modal>
    <Modal cancelText="Hủy" confirmLoading={submittingConsult} okText="Gửi xin ý kiến" onCancel={() => setConsultModalOpen(false)} onOk={() => void sendConsultation()} open={consultModalOpen} title="Lấy ý kiến" width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 0' }}>
        <div>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Hạn chót cho ý kiến</span>
          <DatePicker format="DD/MM/YYYY" onChange={setConsultDate} placeholder="Chọn ngày hạn chót…" style={{ width: '100%' }} value={consultDate} />
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Chọn người lấy ý kiến</span>
          <Select maxTagCount="responsive" mode="multiple" onChange={setSelectedConsultants} options={consultantOptions} placeholder="Chọn người cần lấy ý kiến…" showSearch style={{ width: '100%' }} value={selectedConsultants} />
        </div>
      </div>
    </Modal>
    <Modal cancelText="Hủy" confirmLoading={saving === 'approve'} okText="Duyệt và giao việc" onCancel={() => setDeployModalOpen(false)} onOk={() => void confirmDeploy()} open={deployModalOpen} title="Triển khai" width={420}>
      <div style={{ padding: '12px 0' }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Người triển khai bước tiếp theo</span>
        <Select onChange={setDeployAssignee} options={consultantOptions} placeholder="Chọn người triển khai…" showSearch style={{ width: '100%' }} value={deployAssignee} />
      </div>
    </Modal>
  </>;
}

// Panel chi tiết gắn liền bên phải trang Công việc (thay vì Modal nổi) — danh sách bên trái thu hẹp lại khi mở.
export function WorkTicketDetailPanel({ ticket, onClose, onUpdated, initialTab = 'workflow' }: { ticket: WorkTicketSubmission; onClose: () => void; onUpdated: (ticket: WorkTicketSubmission) => Promise<void>; initialTab?: PanelTab }) {
  const [activeTab, setActiveTab] = useState<PanelTab>(initialTab);
  const { note, setNote, saving, act } = useTicketAction(ticket, onUpdated);
  const { consultModalOpen, setConsultModalOpen, selectedConsultants, setSelectedConsultants, consultDate, setConsultDate, submittingConsult, sendConsultation, pendingConsult } = useConsultation(ticket, onUpdated);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployAssignee, setDeployAssignee] = useState<string | undefined>();

  useEffect(() => { setActiveTab(initialTab); }, [ticket.id, initialTab]);

  const hasNextStep = ticket.currentStep < ticket.steps.length - 1;
  const consultantOptions = followerOptions.map((item) => ({ value: item.name, label: `${item.name} · ${item.positionName} · ${item.departmentName}` }));

  const confirmDeploy = async () => {
    if (!deployAssignee) { message.error('Vui lòng chọn người triển khai'); return; }
    await act('approve', deployAssignee);
    setDeployModalOpen(false);
    setDeployAssignee(undefined);
  };

  return <div className="work-ticket-detail-panel">
    <button aria-label="Đóng" className="work-ticket-detail-panel-close" onClick={onClose} type="button"><X size={18} /></button>
    <div className="work-ticket-detail-panel-body">
      <TicketDetailBody activeTab={activeTab} onUpdated={onUpdated} setActiveTab={setActiveTab} ticket={ticket} />
    </div>
    {isMyTurn(ticket) && <div className="work-ticket-detail-panel-footer">
      <div className="document-approval-footer">
        <Input.TextArea aria-label="Ý kiến xử lý" onChange={(event) => setNote(event.target.value)} placeholder="Nhập ý kiến xử lý (không bắt buộc)" rows={2} value={note} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Button icon={<MessageSquare size={14} />} onClick={() => setConsultModalOpen(true)}>{pendingConsult ? 'Thêm người lấy ý kiến' : 'Lấy ý kiến'}</Button>
          {hasNextStep && <Button icon={<UserCog size={14} />} onClick={() => setDeployModalOpen(true)}>Triển khai</Button>}
          <Button danger loading={saving === 'reject'} onClick={() => void act('reject')} style={{ marginLeft: 'auto' }}>Không duyệt</Button>
          <Button loading={saving === 'approve'} onClick={() => void act('approve')} type="primary">Duyệt</Button>
        </div>
      </div>
    </div>}
    <Modal cancelText="Hủy" confirmLoading={submittingConsult} okText="Gửi xin ý kiến" onCancel={() => setConsultModalOpen(false)} onOk={() => void sendConsultation()} open={consultModalOpen} title="Lấy ý kiến" width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 0' }}>
        <div>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Hạn chót cho ý kiến</span>
          <DatePicker format="DD/MM/YYYY" onChange={setConsultDate} placeholder="Chọn ngày hạn chót…" style={{ width: '100%' }} value={consultDate} />
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Chọn người lấy ý kiến</span>
          <Select maxTagCount="responsive" mode="multiple" onChange={setSelectedConsultants} options={consultantOptions} placeholder="Chọn người cần lấy ý kiến…" showSearch style={{ width: '100%' }} value={selectedConsultants} />
        </div>
      </div>
    </Modal>
    <Modal cancelText="Hủy" confirmLoading={saving === 'approve'} okText="Duyệt và giao việc" onCancel={() => setDeployModalOpen(false)} onOk={() => void confirmDeploy()} open={deployModalOpen} title="Triển khai" width={420}>
      <div style={{ padding: '12px 0' }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Người triển khai bước tiếp theo</span>
        <Select onChange={setDeployAssignee} options={consultantOptions} placeholder="Chọn người triển khai…" showSearch style={{ width: '100%' }} value={deployAssignee} />
      </div>
    </Modal>
  </div>;
}
