import { Button, DatePicker, Form, Input, Modal, Radio, Select, Upload, message } from 'antd';
import type { UploadFile } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { isDayjs, type Dayjs } from 'dayjs';
import { CheckCircle2, MessageCircle, Paperclip, Rocket, Users, Workflow, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { followerOptions } from '@/mocks/workTicketFixtures';
import { demoUser } from '@/mocks/fixtures';
import { workTicketApi } from '@/services/api';
import { formatFileSize, getFileKind } from '@/features/work-tickets/attachmentUtils';
import type { WorkTicketTemplate } from '@/types/domain';

type StepType = 'approve' | 'consult' | 'execute';

const stepTypeOptions: { value: StepType; label: string; icon: typeof CheckCircle2 }[] = [
  { value: 'approve', label: 'Duyệt', icon: CheckCircle2 },
  { value: 'consult', label: 'Lấy ý kiến', icon: MessageCircle },
  { value: 'execute', label: 'Triển khai', icon: Rocket },
];

interface WorkTicketFormValues {
  title?: string;
  department?: string;
  content?: string;
  fullName?: string;
  positionUnit?: string;
  fromDate?: Dayjs;
  toDate?: Dayjs;
  departureDate?: Dayjs;
  returnDate?: Dayjs;
  reason?: string;
  leaveLocation?: string;
  destination?: string;
  hostUnit?: string;
  funding?: string;
  fundingOther?: string;
}

interface WorkflowStepDraft { id: string; type: StepType; assigneeId?: string }

const lineRule = [{ required: true, message: 'Vui lòng điền thông tin này' }];
let stepDraftSeq = 0;
const nextStepId = () => `step-draft-${++stepDraftSeq}`;

export function WorkTicketFormModal({ template, onClose, onSubmitted }: { template: WorkTicketTemplate | null; onClose: () => void; onSubmitted: () => Promise<void> }) {
  const [form] = Form.useForm<WorkTicketFormValues>();
  const [saving, setSaving] = useState(false);
  const [steps, setSteps] = useState<WorkflowStepDraft[]>([]);
  const [followerIds, setFollowerIds] = useState<string[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<StepType>('approve');
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | undefined>(undefined);
  const [rightTab, setRightTab] = useState<'workflow' | 'followers'>('workflow');
  const isBlank = template?.kind === 'blank';
  const isLeave = template?.kind === 'leave_request';

  useEffect(() => {
    if (template) {
      setSteps([]);
      setFollowerIds([]);
      setFileList([]);
      setStepModalOpen(false);
      setRightTab('workflow');
    }
  }, [template]);

  const removeStep = (id: string) => setSteps((prev) => prev.filter((step) => step.id !== id));

  const openAddStepModal = () => { setEditingStepId(null); setDraftType('approve'); setDraftAssigneeId(undefined); setStepModalOpen(true); };
  const openEditStepModal = (step: WorkflowStepDraft) => { setEditingStepId(step.id); setDraftType(step.type); setDraftAssigneeId(step.assigneeId); setStepModalOpen(true); };

  const confirmStepModal = () => {
    if (!draftAssigneeId) { message.error('Vui lòng chọn người phụ trách cho bước này'); return; }
    if (editingStepId) setSteps((prev) => prev.map((step) => (step.id === editingStepId ? { ...step, type: draftType, assigneeId: draftAssigneeId } : step)));
    else setSteps((prev) => [...prev, { id: nextStepId(), type: draftType, assigneeId: draftAssigneeId }]);
    setStepModalOpen(false);
  };

  const submit = async (values: WorkTicketFormValues) => {
    if (!template) return;
    if (isBlank && !steps.length) {
      message.error('Vui lòng thêm ít nhất 1 bước cho quy trình xử lý');
      return;
    }
    setSaving(true);
    try {
      const fields = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, isDayjs(value) ? value.format('DD/MM/YYYY') : String(value ?? '')]));
      const followers = followerOptions.filter((item) => followerIds.includes(item.id));
      const attachments = fileList.map((file) => ({ id: file.uid, name: file.name, size: file.size ?? 0, type: file.type ?? '' }));
      await workTicketApi.submit({
        templateId: template.id,
        fields,
        steps: isBlank ? steps.map((step) => ({ name: stepTypeOptions.find((option) => option.value === step.type)!.label, assignee: followerOptions.find((item) => item.id === step.assigneeId)?.name ?? '' })) : undefined,
        followers,
        attachments,
      });
      message.success('Đã gửi phiếu công việc vào quy trình xử lý');
      form.resetFields();
      onClose();
      await onSubmitted();
    } catch (reason) { message.error(reason instanceof Error ? reason.message : 'Không thể gửi phiếu'); }
    finally { setSaving(false); }
  };

  const followersPicker = <Select allowClear mode="multiple" onChange={setFollowerIds} options={followerOptions.map((item) => ({ value: item.id, label: `${item.name} · ${item.positionName} · ${item.departmentName}` }))} placeholder="Chọn người theo dõi (không bắt buộc)" style={{ width: '100%' }} value={followerIds} />;

  const workflowBuilder = <>
    {steps.length > 0 && <div className="work-ticket-step-timeline">
      {steps.map((step, index) => {
        const option = stepTypeOptions.find((item) => item.value === step.type)!;
        const Icon = option.icon;
        const assignee = followerOptions.find((item) => item.id === step.assigneeId);
        return <div className="work-ticket-step-timeline-row" key={step.id} onClick={() => openEditStepModal(step)} onKeyDown={(event) => { if (event.key === 'Enter') openEditStepModal(step); }} role="button" tabIndex={0}>
          <span className="work-ticket-step-avatar">{index + 1}</span>
          <div className="work-ticket-step-timeline-content">
            <span className={`work-ticket-step-type-tag tone-${step.type}`}><Icon size={11} /> {option.label}</span>
            <strong>{assignee?.name ?? 'Chưa chọn người phụ trách'}</strong>
          </div>
          <button aria-label="Xóa bước" className="work-ticket-step-remove" onClick={(event) => { event.stopPropagation(); removeStep(step.id); }} type="button"><X size={14} /></button>
        </div>;
      })}
    </div>}
    <Button block icon={<PlusOutlined />} onClick={openAddStepModal} type="dashed">Thêm bước</Button>
  </>;

  return <>
  <Modal centered className="document-form-modal work-ticket-form-modal" footer={<div className="document-modal-actions"><Button onClick={onClose}>Hủy</Button><Button className="document-submit-button" loading={saving} onClick={() => form.submit()} type="primary">Gửi phiếu</Button></div>} onCancel={onClose} open={Boolean(template)} title={<span className="preview-title"><span className="section-icon documents"><ModuleIcon module="work-tickets" size={20} /></span>{template?.name}</span>} width={isBlank ? 1120 : isLeave ? 1080 : 1360}>
    {template && <Form autoComplete="off" form={form} initialValues={{ funding: 'host', department: demoUser.department, fullName: demoUser.fullName }} layout="vertical" onFinish={(values) => void submit(values)}>
      <div className="work-ticket-form-layout">
        <div className="work-ticket-form-left">
          {isBlank ? <section className="document-paper blank-document-paper">
            <div className="document-wordmark"><img alt="Tuổi Trẻ" src={tuoiTreLogo} /></div>
            <h2>PHIẾU CÔNG VIỆC</h2>
            <Form.Item className="document-line-field" label="Tiêu đề:" name="title" rules={lineRule}><Input placeholder="Nhập tiêu đề phiếu" /></Form.Item>
            <Form.Item className="document-line-field" label="Người lập phiếu:" name="fullName"><Input disabled /></Form.Item>
            <Form.Item className="document-line-field" label="Đơn vị:" name="department" rules={lineRule}><Input /></Form.Item>
            <Form.Item className="document-line-field" label="Nội dung công việc:" name="content" rules={lineRule}><Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} /></Form.Item>
          </section> : isLeave ? <section className="document-paper leave-document-paper">
            <div className="document-wordmark"><img alt="Tuổi Trẻ" src={tuoiTreLogo} /></div>
            <h2>ĐƠN XIN NGHỈ PHÉP</h2>
            <Form.Item className="document-line-field" label="Họ tên:" name="fullName" rules={lineRule}><Input /></Form.Item>
            <Form.Item className="document-line-field" label="Bộ phận công tác:" name="department" rules={lineRule}><Input /></Form.Item>
            <div className="document-two-columns"><Form.Item className="document-line-field" label="Từ ngày:" name="fromDate" rules={lineRule}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item><Form.Item className="document-line-field" label="Đến hết ngày:" name="toDate" rules={lineRule}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></div>
            <Form.Item className="document-line-field" label="Lý do:" name="reason" rules={lineRule}><Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} /></Form.Item>
            <Form.Item className="document-line-field" label="Địa điểm nghỉ:" name="leaveLocation" rules={lineRule}><Input /></Form.Item>
          </section> : <section className="document-paper overseas-document-paper">
            <header className="formal-document-header"><strong>BÁO TUỔI TRẺ</strong><div><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><span>Độc lập - Tự do - Hạnh phúc</span><em>TP. HCM, ngày …… tháng …… năm ……</em></div></header>
            <div className="formal-document-title"><h2>PHIẾU ĐỀ XUẤT</h2><strong>V/v đi nước ngoài về việc riêng</strong><span>─────</span></div>
            <Form.Item className="document-line-field" label="Họ tên:" name="fullName" rules={lineRule}><Input /></Form.Item>
            <Form.Item className="document-line-field" label="Chức vụ, đơn vị:" name="positionUnit" rules={lineRule}><Input /></Form.Item>
            <p className="formal-intro">Đề xuất được đi công tác nước ngoài về việc riêng sau:</p>
            <Form.Item className="document-line-field" label="1. Địa điểm đi:" name="destination" rules={lineRule}><Input /></Form.Item>
            <div className="document-two-columns"><Form.Item className="document-line-field" label="2. Ngày đi:" name="departureDate" rules={lineRule}><DatePicker format="DD/MM/YYYY" /></Form.Item><Form.Item className="document-line-field" label="3. Ngày về:" name="returnDate" rules={lineRule}><DatePicker format="DD/MM/YYYY" /></Form.Item></div>
            <Form.Item className="document-line-field" label="4. Lý do đi:" name="reason" rules={lineRule}><Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} /></Form.Item>
            <Form.Item className="document-line-field" extra="Thông tin chi tiết về đơn vị mời và các đơn vị có liên quan trong chương trình." label="5. Đơn vị mời (nếu có):" name="hostUnit"><Input /></Form.Item>
            <Form.Item className="formal-funding" label="6. Kinh phí tài trợ cho chuyến đi (nếu có):" name="funding"><Radio.Group><Radio value="host">Do bên mời đài thọ</Radio><Radio value="self">Cá nhân tự túc</Radio></Radio.Group></Form.Item>
            <Form.Item className="document-line-field" label="* Khác:" name="fundingOther"><Input /></Form.Item>
            <div className="formal-signatures"><span>Người đề xuất</span><strong>Ý kiến của Trưởng bộ phận</strong><strong>Ý kiến của Ban biên tập phụ trách</strong><strong>Duyệt của Tổng Biên tập</strong></div>
          </section>}
          <section className="work-ticket-attachments">
            <h4><Paperclip size={13} /> Tệp đính kèm{fileList.length ? ` (${fileList.length})` : ''}</h4>
            <Upload.Dragger beforeUpload={() => false} className="work-ticket-dropzone" fileList={fileList} multiple onChange={({ fileList: next }) => setFileList(next)} showUploadList={false}>
              <p className="work-ticket-dropzone-icon"><UploadOutlined /></p>
              <p className="work-ticket-dropzone-text">Kéo thả tệp vào đây, hoặc <span>bấm để chọn</span></p>
              <p className="work-ticket-dropzone-hint">Hỗ trợ nhiều tệp — tài liệu, bảng tính, hình ảnh…</p>
            </Upload.Dragger>
            {fileList.length > 0 && <div className="work-ticket-attachment-grid">
              {fileList.map((file) => {
                const kind = getFileKind(file.name);
                const Icon = kind.icon;
                return <div className="work-ticket-attachment-card removable" key={file.uid} title={file.name}>
                  <span className={`work-ticket-attachment-icon tone-${kind.tone}`}><Icon size={18} /></span>
                  <span className="work-ticket-attachment-info">
                    <strong>{file.name}</strong>
                    <small>{kind.label} · {formatFileSize(file.size ?? 0)}</small>
                  </span>
                  <button aria-label={`Xóa tệp ${file.name}`} className="work-ticket-attachment-remove" onClick={() => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))} type="button"><X size={13} /></button>
                </div>;
              })}
            </div>}
          </section>
        </div>
        <aside className="document-workflow-panel work-ticket-panel work-ticket-form-right">
          {isBlank ? <>
            <div className="work-ticket-tabbar" role="tablist">
              <button className={rightTab === 'workflow' ? 'active' : ''} onClick={() => setRightTab('workflow')} type="button"><Workflow size={14} /> Quy trình</button>
              <button className={rightTab === 'followers' ? 'active' : ''} onClick={() => setRightTab('followers')} type="button"><Users size={14} /> Theo dõi{followerIds.length ? ` (${followerIds.length})` : ''}</button>
            </div>
            <div className="work-ticket-tab-content">
              {rightTab === 'workflow' ? workflowBuilder : followersPicker}
            </div>
          </> : <>
            <h3 className="work-ticket-panel-heading"><Users size={14} /> Người theo dõi</h3>
            {followersPicker}
          </>}
        </aside>
      </div>
    </Form>}
  </Modal>
  <Modal className="work-ticket-step-modal" footer={<div className="document-modal-actions"><Button onClick={() => setStepModalOpen(false)}>Hủy</Button><Button onClick={confirmStepModal} type="primary">{editingStepId ? 'Lưu thay đổi' : 'Thêm bước'}</Button></div>} onCancel={() => setStepModalOpen(false)} open={stepModalOpen} title={<span className="preview-title"><span className="section-icon documents"><Workflow size={17} /></span>{editingStepId ? 'Sửa bước xử lý' : 'Thêm bước xử lý'}</span>} width={440}>
    <div className="work-ticket-step-modal-body">
      <span className="work-ticket-step-modal-label">Vai trò</span>
      <div className="work-ticket-role-card-list">
        {stepTypeOptions.map((option) => { const Icon = option.icon; return <button className={`work-ticket-role-card tone-${option.value}${draftType === option.value ? ' active' : ''}`} key={option.value} onClick={() => setDraftType(option.value)} type="button">
          <Icon size={15} /> {option.label}
        </button>; })}
      </div>
      <span className="work-ticket-step-modal-label">Người phụ trách</span>
      <Select onChange={setDraftAssigneeId} options={followerOptions.map((item) => ({ value: item.id, label: `${item.name} · ${item.positionName} · ${item.departmentName}` }))} placeholder="Chọn người phụ trách bước này" showSearch style={{ width: '100%' }} value={draftAssigneeId} filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
    </div>
  </Modal>
  </>;
}
