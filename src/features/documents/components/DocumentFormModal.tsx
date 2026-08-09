import { Button, DatePicker, Form, Input, Modal, Radio, message } from 'antd';
import { isDayjs, type Dayjs } from 'dayjs';
import { useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { documentApi } from '@/services/api';
import type { DocumentTemplate } from '@/types/domain';

interface DocumentFormValues {
  fullName: string;
  department?: string;
  positionUnit?: string;
  fromDate?: Dayjs;
  toDate?: Dayjs;
  departureDate?: Dayjs;
  returnDate?: Dayjs;
  reason: string;
  leaveLocation?: string;
  destination?: string;
  hostUnit?: string;
  funding?: string;
  fundingOther?: string;
}

const lineRule = [{ required: true, message: 'Vui lòng điền thông tin này' }];

export function DocumentFormModal({ template, onClose, onSubmitted }: { template: DocumentTemplate | null; onClose: () => void; onSubmitted: () => Promise<void> }) {
  const [form] = Form.useForm<DocumentFormValues>();
  const [saving, setSaving] = useState(false);
  const isLeave = template?.kind === 'leave_request';
  const submit = async (values: DocumentFormValues) => {
    if (!template) return;
    setSaving(true);
    try {
      const fields = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, isDayjs(value) ? value.format('DD/MM/YYYY') : String(value ?? '')]));
      await documentApi.submit(template.id, fields);
      message.success('Đã gửi tài liệu vào quy trình xét duyệt');
      form.resetFields();
      onClose();
      await onSubmitted();
    } catch (reason) { message.error(reason instanceof Error ? reason.message : 'Không thể gửi tài liệu'); }
    finally { setSaving(false); }
  };

  return <Modal centered className="document-form-modal" footer={<div className="document-modal-actions"><Button onClick={onClose}>Hủy</Button><Button className="document-submit-button" loading={saving} onClick={() => form.submit()} type="primary">Gửi tài liệu</Button></div>} onCancel={onClose} open={Boolean(template)} title={<span className="preview-title"><span className="section-icon documents"><ModuleIcon module="documents" size={20} /></span>{template?.name}</span>} width={isLeave ? 720 : 1040}>
    {template && <Form autoComplete="off" form={form} initialValues={{ funding: 'host' }} layout="vertical" onFinish={(values) => void submit(values)}>
      {isLeave ? <section className="document-paper leave-document-paper">
        <div className="document-wordmark"><img alt="Tuổi Trẻ" src={tuoiTreLogo} /></div>
        <h2>ĐƠN XIN NGHỈ PHÉP</h2>
        <Form.Item className="document-line-field" label="Họ tên:" name="fullName" rules={lineRule}><Input /></Form.Item>
        <Form.Item className="document-line-field leave-department" label="Bộ phận công tác:" name="department" rules={lineRule}><Input /></Form.Item>
        <div className="document-two-columns"><Form.Item className="document-line-field" label="Từ ngày:" name="fromDate" rules={lineRule}><DatePicker format="DD/MM/YYYY" /></Form.Item><Form.Item className="document-line-field" label="Đến hết ngày:" name="toDate" rules={lineRule}><DatePicker format="DD/MM/YYYY" /></Form.Item></div>
        <Form.Item className="document-line-field" label="Lý do:" name="reason" rules={lineRule}><Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} /></Form.Item>
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
    </Form>}
  </Modal>;
}
