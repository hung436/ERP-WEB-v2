import { Button, Input, Modal, Segmented, Select } from 'antd';
import { useMemo, useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { CountedTabLabel } from '@/components/CountedTabLabel';
import { ModuleIcon } from '@/components/ModuleIcon';
import { DocumentDetailModal } from '@/features/documents/components/DocumentDetailModal';
import { DocumentFormModal } from '@/features/documents/components/DocumentFormModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { documentApi } from '@/services/api';
import type { DocumentStatus, DocumentSubmission, DocumentTemplate } from '@/types/domain';

const statusLabels: Record<DocumentStatus, string> = { draft: 'Bản nháp', pending: 'Đang xét duyệt', approved: 'Đã hoàn tất', rejected: 'Đã từ chối' };

export function DocumentsPage() {
  const state = useAsyncData(async () => {
    const [templates, submissions] = await Promise.all([documentApi.templates(), documentApi.submissions()]);
    return { templates: templates.data, submissions: submissions.data };
  });
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentSubmission | null>(null);
  const [view, setView] = useState<'sent' | 'pending_review' | 'reviewed'>('sent');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const submissions = useMemo(() => state.data?.submissions ?? [], [state.data?.submissions]);
  const rows = useMemo(() => submissions.filter((item) => item.viewScope === view).filter((item) => !status || item.status === status).filter((item) => !search.trim() || `${item.title} ${item.createdBy} ${item.department}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))), [search, status, submissions, view]);
  const updateSelected = async (updated: DocumentSubmission) => { setSelectedDocument(updated); await state.reload(); };

  return <div className="module-page documents-module-page">
    <section className="documents-overview" aria-label="Tổng quan tài liệu"><div className="documents-overview-title"><span className="section-icon documents"><ModuleIcon module="documents" /></span><span className="documents-overview-copy"><strong>Tài liệu</strong><small>Gửi tài liệu và xử lý hồ sơ theo trách nhiệm</small></span><Button icon={<ModuleIcon module="documents" size={17} />} onClick={() => setTemplatePickerOpen(true)} type="primary">Tạo tài liệu</Button></div><div><small>Đã gửi</small><strong>{submissions.filter((item) => item.viewScope === 'sent').length}</strong></div><div className="pending"><small>Chờ xử lý</small><strong>{submissions.filter((item) => item.viewScope === 'pending_review').length}</strong></div><div className="approved"><small>Đã xử lý</small><strong>{submissions.filter((item) => item.viewScope === 'reviewed').length}</strong></div><div><small>Tổng tài liệu</small><strong>{submissions.length}</strong></div></section>

    <section className="document-list-section"><div className="document-list-toolbar"><Segmented onChange={(value) => { setView(value as 'sent' | 'pending_review' | 'reviewed'); setStatus(''); }} options={[{ label: <CountedTabLabel count={submissions.filter((item) => item.viewScope === 'sent').length} label="Đã gửi" />, value: 'sent' }, { label: <CountedTabLabel count={submissions.filter((item) => item.viewScope === 'pending_review').length} label="Chờ xử lý" />, value: 'pending_review' }, { label: <CountedTabLabel count={submissions.filter((item) => item.viewScope === 'reviewed').length} label="Đã xử lý" />, value: 'reviewed' }]} value={view} /><div><Input allowClear onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tiêu đề, người gửi…" value={search} /><Select onChange={setStatus} options={[{ label: 'Tất cả trạng thái', value: '' }, { label: 'Đang xét duyệt', value: 'pending' }, { label: 'Đã hoàn tất', value: 'approved' }, { label: 'Đã từ chối', value: 'rejected' }]} value={status} /></div></div>
      {state.loading ? <ContentSkeleton rows={4} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : !rows.length ? <EmptyState description="Không có tài liệu phù hợp" /> : <div className="document-submission-list">{rows.map((item) => { const current = item.steps[item.currentStep]; return <button className="document-submission-row" key={item.id} onClick={() => setSelectedDocument(item)} type="button"><span className={`document-row-icon ${item.kind}`}><ModuleIcon module="documents" size={21} /></span><span className="document-row-main"><small>{item.kind === 'leave_request' ? 'Đơn xin nghỉ phép' : 'Phiếu đề xuất đi nước ngoài'}</small><strong>{item.title}</strong><span>{item.createdBy} · {item.department}</span></span><span className="document-row-date"><small>Ngày gửi</small><time>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</time></span><span className="document-row-step"><small>{item.status === 'pending' ? 'Đang chờ' : 'Kết quả'}</small><strong>{item.status === 'pending' ? current?.name : statusLabels[item.status]}</strong></span><span className={`document-status ${item.status}`}>{statusLabels[item.status]}</span><span className="document-row-action">Chi tiết ›</span></button>; })}</div>}
    </section>
    <Modal centered className="document-template-picker" footer={null} onCancel={() => setTemplatePickerOpen(false)} open={templatePickerOpen} title="Chọn mẫu tài liệu" width={760}><p className="document-picker-intro">Chọn loại tài liệu bạn muốn tạo. Biểu mẫu tương ứng sẽ mở ngay sau khi chọn.</p><div className="document-template-grid">{(state.data?.templates ?? []).map((template) => <button className={`document-template-card ${template.kind}`} key={template.id} onClick={() => { setTemplatePickerOpen(false); setSelectedTemplate(template); }} type="button"><span className="document-template-icon"><ModuleIcon module="documents" size={26} /></span><span><strong>{template.name}</strong><small>{template.description}</small><em>Dự kiến {template.estimatedDays} ngày làm việc</em></span><b>Chọn ›</b></button>)}</div></Modal>
    <DocumentFormModal onClose={() => setSelectedTemplate(null)} onSubmitted={state.reload} template={selectedTemplate} />
    <DocumentDetailModal document={selectedDocument} onClose={() => setSelectedDocument(null)} onUpdated={updateSelected} />
  </div>;
}
