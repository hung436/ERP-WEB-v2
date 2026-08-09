import { Button, Input, Modal, message } from 'antd';
import { useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { documentApi } from '@/services/api';
import type { DocumentSubmission, DocumentWorkflowStep } from '@/types/domain';

const stepLabels: Record<DocumentWorkflowStep['status'], string> = { waiting: 'Chờ đến lượt', pending: 'Đang chờ duyệt', approved: 'Đã duyệt', rejected: 'Đã từ chối' };
const statusLabels: Record<DocumentSubmission['status'], string> = { draft: 'Bản nháp', pending: 'Đang xét duyệt', approved: 'Đã hoàn tất', rejected: 'Đã từ chối' };

function ReadonlyLine({ label, value }: { label: string; value?: string }) { return <div className="readonly-document-line"><span>{label}</span><strong>{value || '—'}</strong></div>; }

function ReadonlyDocument({ document }: { document: DocumentSubmission }) {
  const fields = document.fields;
  return document.kind === 'leave_request' ? <section className="document-paper leave-document-paper readonly-document-paper">
    <div className="document-wordmark"><img alt="Tuổi Trẻ" src={tuoiTreLogo} /></div><h2>ĐƠN XIN NGHỈ PHÉP</h2>
    <ReadonlyLine label="Họ tên:" value={fields.fullName} /><ReadonlyLine label="Bộ phận công tác:" value={fields.department} />
    <div className="document-two-columns"><ReadonlyLine label="Từ ngày:" value={fields.fromDate} /><ReadonlyLine label="Đến hết ngày:" value={fields.toDate} /></div>
    <ReadonlyLine label="Lý do:" value={fields.reason} /><ReadonlyLine label="Địa điểm nghỉ:" value={fields.leaveLocation} />
  </section> : <section className="document-paper overseas-document-paper readonly-document-paper">
    <header className="formal-document-header"><strong>BÁO TUỔI TRẺ</strong><div><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><span>Độc lập - Tự do - Hạnh phúc</span><em>TP. HCM, ngày …… tháng …… năm ……</em></div></header>
    <div className="formal-document-title"><h2>PHIẾU ĐỀ XUẤT</h2><strong>V/v đi nước ngoài về việc riêng</strong><span>─────</span></div>
    <ReadonlyLine label="Họ tên:" value={fields.fullName} /><ReadonlyLine label="Chức vụ, đơn vị:" value={fields.positionUnit} /><p className="formal-intro">Đề xuất được đi công tác nước ngoài về việc riêng sau:</p>
    <ReadonlyLine label="1. Địa điểm đi:" value={fields.destination} /><div className="document-two-columns"><ReadonlyLine label="2. Ngày đi:" value={fields.departureDate} /><ReadonlyLine label="3. Ngày về:" value={fields.returnDate} /></div>
    <ReadonlyLine label="4. Lý do đi:" value={fields.reason} /><ReadonlyLine label="5. Đơn vị mời (nếu có):" value={fields.hostUnit} /><ReadonlyLine label="6. Kinh phí:" value={fields.funding === 'host' ? 'Do bên mời đài thọ' : fields.funding === 'self' ? 'Cá nhân tự túc' : fields.funding} /><ReadonlyLine label="* Khác:" value={fields.fundingOther} />
    <div className="formal-signatures"><span>Người đề xuất</span><strong>Ý kiến của Trưởng bộ phận</strong><strong>Ý kiến của Ban biên tập phụ trách</strong><strong>Duyệt của Tổng Biên tập</strong></div>
  </section>;
}

export function DocumentDetailModal({ document, onClose, onUpdated }: { document: DocumentSubmission | null; onClose: () => void; onUpdated: (document: DocumentSubmission) => Promise<void> }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState<'approve' | 'reject' | null>(null);
  const act = async (action: 'approve' | 'reject') => {
    if (!document) return;
    setSaving(action);
    try { const updated = (await documentApi.action(document.id, action, note)).data; message.success(action === 'approve' ? 'Đã duyệt và chuyển bước tiếp theo' : 'Đã từ chối tài liệu'); setNote(''); await onUpdated(updated); }
    catch (reason) { message.error(reason instanceof Error ? reason.message : 'Không thể xử lý tài liệu'); }
    finally { setSaving(null); }
  };
  return <Modal centered className="document-detail-modal" footer={document?.viewScope === 'pending_review' ? <div className="document-approval-footer"><Input.TextArea aria-label="Ý kiến xử lý" onChange={(event) => setNote(event.target.value)} placeholder="Nhập ý kiến xử lý (không bắt buộc)" rows={2} value={note} /><div><Button onClick={onClose}>Đóng</Button><Button danger loading={saving === 'reject'} onClick={() => void act('reject')}>Từ chối</Button><Button loading={saving === 'approve'} onClick={() => void act('approve')} type="primary">Duyệt</Button></div></div> : <Button onClick={onClose} type="primary">Đóng</Button>} onCancel={onClose} open={Boolean(document)} title={<span className="preview-title"><span className="section-icon documents"><ModuleIcon module="documents" size={20} /></span>{document?.title} · {document && statusLabels[document.status]}</span>} width={1100}>
    {document && <div className="document-detail-layout"><div className="document-detail-paper-scroll"><ReadonlyDocument document={document} /></div><aside className="document-workflow-panel"><div><small>NGÀY GỬI</small><strong>{new Date(document.createdAt).toLocaleDateString('vi-VN')}</strong><span>{document.createdBy} · {document.department}</span></div><h3>Quy trình xét duyệt</h3><ol>{document.steps.map((step, index) => <li className={step.status} key={step.id}><i>{step.status === 'approved' ? '✓' : step.status === 'rejected' ? '×' : index + 1}</i><div><strong>{step.name}</strong><span>{step.assignee}</span><em>{stepLabels[step.status]}</em>{step.actedAt && <time>{new Date(step.actedAt).toLocaleString('vi-VN')}</time>}{step.note && <p>“{step.note}”</p>}</div></li>)}</ol></aside></div>}
  </Modal>;
}
