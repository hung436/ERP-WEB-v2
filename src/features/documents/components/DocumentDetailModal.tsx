import { Button, DatePicker, Input, Modal, Segmented, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { StatusTag } from '@/components/StatusTag';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { documentApi } from '@/services/api';
import type { DocumentConsultationSubStep, DocumentSubmission, DocumentWorkflowStep } from '@/types/domain';

const stepLabels: Record<DocumentWorkflowStep['status'], string> = {
  waiting: 'Chờ đến lượt',
  pending: 'Đang chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Không đồng ý',
};

const defaultConsultants = [
  { value: 'Trần Thu Hà (Phó Ban Nội dung)', label: 'Trần Thu Hà · Phó Ban Nội dung' },
  { value: 'Trần Văn Bình (Phó Trưởng ban Tổ chức)', label: 'Trần Văn Bình · Phó Trưởng ban Tổ chức' },
  { value: 'Phạm Quốc Nam (Trưởng Ban Quản trị)', label: 'Phạm Quốc Nam · Trưởng Ban Quản trị' },
  { value: 'Hoàng Thị Lan (Ban Biên tập)', label: 'Hoàng Thị Lan · Ban Biên tập' },
  { value: 'Đỗ Quang Huy (Ban Khoa giáo)', label: 'Đỗ Quang Huy · Ban Khoa giáo' },
  { value: 'Nguyễn Văn Hải (Phòng Hành chính)', label: 'Nguyễn Văn Hải · Phòng Hành chính' },
];

function ReadonlyLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="readonly-document-line">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

function ReadonlyDocument({ document }: { document: DocumentSubmission }) {
  const fields = document.fields;
  return document.kind === 'leave_request' ? (
    <section className="document-paper leave-document-paper readonly-document-paper">
      <div className="document-wordmark">
        <img alt="Tuổi Trẻ" src={tuoiTreLogo} />
      </div>
      <h2>ĐƠN XIN NGHỈ PHÉP</h2>
      <ReadonlyLine label="Họ tên:" value={fields.fullName} />
      <ReadonlyLine label="Bộ phận công tác:" value={fields.department} />
      <div className="document-two-columns">
        <ReadonlyLine label="Từ ngày:" value={fields.fromDate} />
        <ReadonlyLine label="Đến hết ngày:" value={fields.toDate} />
      </div>
      <ReadonlyLine label="Lý do:" value={fields.reason} />
      <ReadonlyLine label="Địa điểm nghỉ:" value={fields.leaveLocation} />
    </section>
  ) : (
    <section className="document-paper overseas-document-paper readonly-document-paper">
      <header className="formal-document-header">
        <strong>BÁO TUỔI TRẺ</strong>
        <div>
          <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b>
          <span>Độc lập - Tự do - Hạnh phúc</span>
          <em>TP. HCM, ngày …… tháng …… năm ……</em>
        </div>
      </header>
      <div className="formal-document-title">
        <h2>PHIẾU ĐỀ XUẤT</h2>
        <strong>V/v đi nước ngoài về việc riêng</strong>
        <span>─────</span>
      </div>
      <ReadonlyLine label="Họ tên:" value={fields.fullName} />
      <ReadonlyLine label="Chức vụ, đơn vị:" value={fields.positionUnit} />
      <p className="formal-intro">Đề xuất được đi công tác nước ngoài về việc riêng sau:</p>
      <ReadonlyLine label="1. Địa điểm đi:" value={fields.destination} />
      <div className="document-two-columns">
        <ReadonlyLine label="2. Ngày đi:" value={fields.departureDate} />
        <ReadonlyLine label="3. Ngày về:" value={fields.returnDate} />
      </div>
      <ReadonlyLine label="4. Lý do đi:" value={fields.reason} />
      <ReadonlyLine label="5. Đơn vị mời (nếu có):" value={fields.hostUnit} />
      <ReadonlyLine
        label="6. Kinh phí:"
        value={
          fields.funding === 'host'
            ? 'Do bên mời đài thọ'
            : fields.funding === 'self'
            ? 'Cá nhân tự túc'
            : fields.funding
        }
      />
      <ReadonlyLine label="* Khác:" value={fields.fundingOther} />
      <div className="formal-signatures">
        <span>Người đề xuất</span>
        <strong>Ý kiến của Trưởng bộ phận</strong>
        <strong>Ý kiến của Ban biên tập phụ trách</strong>
        <strong>Duyệt của Tổng Biên tập</strong>
      </div>
    </section>
  );
}

export function DocumentDetailModal({
  document,
  onClose,
  onUpdated,
}: {
  document: DocumentSubmission | null;
  onClose: () => void;
  onUpdated: (document: DocumentSubmission) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState<'approve' | 'reject' | null>(null);

  const [consultFeedbackText, setConsultFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Consultation request sub-modal state with Antd DatePicker (dayjs) and Multiple Select
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);
  const [consultDate, setConsultDate] = useState<Dayjs | null>(() => dayjs().add(1, 'day'));
  const [submittingConsult, setSubmittingConsult] = useState(false);

  // Check if current active step has any pending sub-branch consultation
  const activeMainStep = document ? document.steps[document.currentStep] : null;
  const pendingSubConsult = activeMainStep?.consultations?.find((sub) => sub.status === 'pending') ||
    document?.steps.flatMap((s) => s.consultations || []).find((sub) => sub.status === 'pending');
  const isConsultantStep = Boolean(pendingSubConsult || document?.id === 'document-007');

  const act = async (action: 'approve' | 'reject') => {
    if (!document) return;
    setSaving(action);
    try {
      const updated = (await documentApi.action(document.id, action, note)).data;
      message.success(
        action === 'approve' ? 'Đã duyệt và chuyển bước tiếp theo' : 'Đã phản hồi không duyệt'
      );
      setNote('');
      await onUpdated(updated);
    } catch (reason) {
      message.error(reason instanceof Error ? reason.message : 'Không thể xử lý tài liệu');
    } finally {
      setSaving(null);
    }
  };

  const handleSendConsultation = async () => {
    if (!document) return;
    if (!selectedConsultants || selectedConsultants.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 nhân sự / cán bộ cần lấy ý kiến');
      return;
    }

    const formattedDate = consultDate ? consultDate.format('DD/MM/YYYY') : 'Hạn ngày mai';

    setSubmittingConsult(true);
    try {
      const newSubConsults: DocumentConsultationSubStep[] = selectedConsultants.map((consultant, idx) => ({
        id: `sub-consult-${Date.now()}-${idx}`,
        name: `Lấy ý kiến: ${consultant}`,
        assignee: consultant,
        status: 'pending',
        deadline: formattedDate,
      }));

      const currentStepIdx = document.currentStep;
      const updatedSteps = document.steps.map((step, idx) => {
        if (idx === currentStepIdx) {
          return {
            ...step,
            consultations: [...(step.consultations || []), ...newSubConsults],
          };
        }
        return step;
      });

      const updatedDoc: DocumentSubmission = {
        ...document,
        // Note: currentStep remains the same! Document only advances when main approver approves!
        steps: updatedSteps,
      };

      await onUpdated(updatedDoc);
      message.success(`Đã đính kèm nhánh xin ý kiến tới ${selectedConsultants.length} cán bộ/nhân sự (Hạn đến ngày: ${formattedDate})!`);
      setConsultModalOpen(false);
      setSelectedConsultants([]);
    } catch (err) {
      message.error('Có lỗi khi gửi yêu cầu lấy ý kiến.');
    } finally {
      setSubmittingConsult(false);
    }
  };

  const handleSendConsultFeedback = async () => {
    if (!document) return;
    if (!consultFeedbackText.trim()) {
      message.error('Vui lòng nhập nội dung ý kiến tham khảo trước khi gửi.');
      return;
    }
    setSubmittingFeedback(true);
    try {
      let updated = false;
      const updatedSteps = document.steps.map((step) => {
        if (!updated && step.consultations && step.consultations.length > 0) {
          const updatedConsults = step.consultations.map((sub) => {
            if (!updated && sub.status === 'pending') {
              updated = true;
              return {
                ...sub,
                status: 'approved' as const,
                actedAt: new Date().toISOString(),
                note: consultFeedbackText.trim(),
              };
            }
            return sub;
          });
          return { ...step, consultations: updatedConsults };
        }
        return step;
      });

      const updatedDoc: DocumentSubmission = {
        ...document,
        steps: updatedSteps,
      };

      await onUpdated(updatedDoc);
      message.success('Đã gửi phản hồi ý kiến tham khảo thành công!');
      setConsultFeedbackText('');
    } catch (err) {
      message.error('Có lỗi xảy ra.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <>
      <Modal
        centered
        className="document-detail-modal"
        footer={
          document?.viewScope === 'pending_review' ? (
            isConsultantStep ? (
              <div className="document-approval-footer" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 14, borderRadius: 10 }}>
                <Input.TextArea
                  placeholder="Nhập nhận xét / ý kiến tư vấn..."
                  rows={2}
                  value={consultFeedbackText}
                  onChange={(e) => setConsultFeedbackText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <Button
                    type="primary"
                    loading={submittingFeedback}
                    style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
                    icon={<MessageSquare size={14} />}
                    onClick={handleSendConsultFeedback}
                  >
                    Gửi ý kiến tham khảo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="document-approval-footer">
                <Input.TextArea
                  aria-label="Ý kiến xử lý"
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Nhập ý kiến xử lý (không bắt buộc)"
                  rows={2}
                  value={note}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    style={{
                      background: '#f0fdf4',
                      borderColor: '#86efac',
                      color: '#16a34a',
                      fontWeight: 600,
                    }}
                    icon={<MessageSquare size={14} />}
                    onClick={() => setConsultModalOpen(true)}
                  >
                    {activeMainStep?.consultations?.length ? 'Thêm người lấy ý kiến' : 'Lấy ý kiến'}
                  </Button>
                  <Button
                    danger
                    loading={saving === 'reject'}
                    onClick={() => void act('reject')}
                  >
                    Không duyệt
                  </Button>
                  <Button
                    loading={saving === 'approve'}
                    onClick={() => void act('approve')}
                    type="primary"
                  >
                    Duyệt
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Button onClick={onClose} type="primary">
              Đóng
            </Button>
          )
        }
        onCancel={onClose}
        open={Boolean(document)}
        title={
          <span className="preview-title">
            <span className="section-icon documents">
              <ModuleIcon module="documents" size={20} />
            </span>
            {/* Tên người gửi đã có trong nội dung phiếu và cột quy trình, chỉ nêu loại phiếu ở đây để tránh lặp */}
            {document?.title.split(' · ')[0]}
            {document && <StatusTag category="status" value={document.status} />}
          </span>
        }
        width={1100}
      >
        {document && (
          <div className="document-detail-layout">
            <div className="document-detail-paper-scroll">
              <ReadonlyDocument document={document} />
            </div>
            <aside className="document-workflow-panel">
              <div className="workflow-sent-date">
                <small>NGÀY GỬI</small>
                <strong>
                  {new Date(document.createdAt).toLocaleDateString('vi-VN')}
                </strong>
              </div>
              <h3>Quy trình xét duyệt</h3>
              <ol className="workflow-steps">
                {document.steps.map((step, index) => {
                  return (
                    <li className={step.status} key={step.id}>
                      <i>
                        {step.status === 'approved'
                          ? '✓'
                          : step.status === 'rejected'
                          ? '×'
                          : index + 1}
                      </i>
                      <div>
                        <strong>{step.name}</strong>
                        <span>{step.assignee}</span>
                        <div className="workflow-step-meta">
                          <span className={`workflow-status-pill ${step.status}`}>{stepLabels[step.status]}</span>
                          {step.actedAt && (
                            <time>{new Date(step.actedAt).toLocaleString('vi-VN')}</time>
                          )}
                        </div>
                        {step.note && <p className="workflow-step-note">{step.note}</p>}

                        {/* Sub-branch Consultations */}
                        {step.consultations && step.consultations.length > 0 && (
                          <div className="workflow-consult-group">
                            {/* Tách nhãn rõ khỏi luồng duyệt chính: đây là ý kiến tham vấn phụ, không phải bước phê duyệt kế tiếp */}
                            <span className="workflow-consult-label">Ý kiến tham vấn</span>
                            <ul className="workflow-consult-list">
                            {step.consultations.map((sub) => (
                              <li className="workflow-consult-item" key={sub.id}>
                                {/* Người được hỏi ý kiến hiện trực tiếp ở đây, không cần nhắc lại "Lấy ý kiến" */}
                                <div className="workflow-consult-header">
                                  <span className="workflow-consult-icon" aria-hidden="true">
                                    <MessageSquare size={12} />
                                  </span>
                                  <strong>{sub.assignee}</strong>
                                  <span className={`workflow-status-pill compact ${sub.status}`}>
                                    {sub.status === 'approved' ? 'Đã cho ý kiến' : 'Chờ cho ý kiến'}
                                  </span>
                                </div>
                                {sub.actedAt ? (
                                  <span className="workflow-consult-meta">
                                    {new Date(sub.actedAt).toLocaleString('vi-VN')}
                                  </span>
                                ) : (
                                  sub.deadline && <span className="workflow-consult-meta">Hạn: {sub.deadline}</span>
                                )}
                                {sub.note && <p className="workflow-consult-note">{sub.note}</p>}
                              </li>
                            ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </aside>
          </div>
        )}
      </Modal>

      {/* Consultation Sub-Modal */}
      <Modal
        title="Lấy ý kiến"
        open={consultModalOpen}
        onCancel={() => setConsultModalOpen(false)}
        onOk={handleSendConsultation}
        confirmLoading={submittingConsult}
        okText="Gửi xin ý kiến"
        cancelText="Hủy"
        width={460}
        style={{ top: 40 }}
      >
        <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
              Hạn chót cho ý kiến (theo ngày):
            </label>
            <DatePicker
              style={{ width: '100%', height: 38 }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày hạn chót..."
              value={consultDate}
              onChange={(date) => setConsultDate(date)}
              getPopupContainer={() => window.document.body}
              placement="bottomLeft"
              popupClassName="consult-date-picker-dropdown"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
              Chọn người lấy ý kiến:
            </label>
            <Select
              mode="multiple"
              maxTagCount="responsive"
              style={{ width: '100%' }}
              placeholder="Chọn các cán bộ / nhân sự cần lấy ý kiến..."
              value={selectedConsultants}
              onChange={setSelectedConsultants}
              options={defaultConsultants}
              showSearch
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
