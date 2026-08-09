import { Form, Input, Modal, Select, message } from 'antd';
import { useState } from 'react';

import { extendedWorkspaceApi } from '@/services/api';

interface ActionConfig { module: string; title: string; action: string; kind: 'request' | 'upload' | 'meeting' | 'library' }

export function WorkspaceActionModal({ config, onClose }: { config: ActionConfig | null; onClose: () => void }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const submit = async (values: Record<string, unknown>) => {
    if (!config) return;
    setSaving(true);
    try {
      await extendedWorkspaceApi.action(config.module, config.action, values);
      message.success(`${config.title} thành công`);
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.');
    } finally { setSaving(false); }
  };

  return <Modal cancelText="Hủy" confirmLoading={saving} okText="Hoàn tất" onCancel={onClose} onOk={() => form.submit()} open={Boolean(config)} title={config?.title}>
    {config && <Form form={form} layout="vertical" onFinish={(values) => void submit(values)}>
      {config.kind === 'request' && <>
        <Form.Item label="Loại đơn" name="type" rules={[{ required: true, message: 'Chọn loại đơn' }]}><Select options={['Đơn xin nghỉ phép', 'Đề xuất mua sắm', 'Đề xuất công tác'].map((value) => ({ label: value, value }))} placeholder="Chọn loại đơn" /></Form.Item>
        <Form.Item label="Nội dung" name="content" rules={[{ required: true, message: 'Nhập nội dung' }]}><Input.TextArea rows={4} /></Form.Item>
      </>}
      {config.kind === 'upload' && <>
        {config.action === 'upload' && <Form.Item label="Chọn tệp" name="file" rules={[{ required: true, message: 'Chọn tệp cần tải lên' }]}><Input accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" type="file" /></Form.Item>}
        <Form.Item label={config.action === 'create-folder' ? 'Tên thư mục' : 'Tên hiển thị'} name="name" rules={[{ required: config.action === 'create-folder', message: 'Nhập tên thư mục' }]}><Input /></Form.Item>
        <Form.Item label="Quyền truy cập" name="access"><Select options={['Chỉ mình tôi', 'Người trong đơn vị', 'Toàn cơ quan'].map((value) => ({ label: value, value }))} /></Form.Item>
      </>}
      {config.kind === 'meeting' && (config.action === 'join-meeting' ? <>
        <Form.Item label="ID cuộc họp" name="meetingId" rules={[{ required: true, message: 'Nhập ID cuộc họp' }]}><Input placeholder="Ví dụ: 824 510 629" /></Form.Item>
        <Form.Item label="Mật mã" name="passcode"><Input.Password placeholder="Nhập nếu cuộc họp yêu cầu" /></Form.Item>
      </> : <>
        <Form.Item label="Tên cuộc họp" name="name" rules={[{ required: true, message: 'Nhập tên cuộc họp' }]}><Input /></Form.Item>
        <div className="workspace-form-grid"><Form.Item label="Ngày" name="date" rules={[{ required: true }]}><Input type="date" /></Form.Item><Form.Item label="Giờ bắt đầu" name="time" rules={[{ required: true }]}><Input type="time" /></Form.Item></div>
        <Form.Item label="Người tham dự" name="participants"><Input placeholder="Tìm trong danh bạ" /></Form.Item>
      </>)}
      {config.kind === 'library' && <>
        <Form.Item label="Chọn tài liệu" name="file" rules={[{ required: true, message: 'Chọn tài liệu cần tải lên' }]}><Input accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg" type="file" /></Form.Item>
        <Form.Item label="Tên tài liệu" name="name" rules={[{ required: true, message: 'Nhập tên tài liệu' }]}><Input /></Form.Item>
        <Form.Item label="Kho lưu trữ" name="collection"><Select options={['Tài liệu nghiệp vụ', 'Ấn phẩm Tuổi Trẻ', 'Hình ảnh'].map((value) => ({ label: value, value }))} /></Form.Item>
      </>}
    </Form>}
  </Modal>;
}
