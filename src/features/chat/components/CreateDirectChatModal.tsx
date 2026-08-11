import { Button, Form, Modal, Select } from 'antd';

import { useAsyncData } from '@/hooks/useAsyncData';
import { directoryApi } from '@/services/api';
import type { DirectoryContact } from '@/types/domain';

export function CreateDirectChatModal({ open, creating, onClose, onStartChat }: { open: boolean; creating: boolean; onClose: () => void; onStartChat: (contact: DirectoryContact) => Promise<void> }) {
  const directoryState = useAsyncData(async () => (await directoryApi.list()).data);
  const [form] = Form.useForm<{ contactId: string }>();

  const close = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: { contactId: string }) => {
    const contact = directoryState.data?.find((c) => c.id === values.contactId);
    if (!contact) return;
    await onStartChat(contact);
    form.resetFields();
  };

  return (
    <Modal className="create-group-modal" footer={null} onCancel={close} open={open} title="Đoạn chat mới">
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Chọn người nhận" name="contactId" rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}>
          <Select
            aria-label="Chọn người nhận"
            loading={directoryState.loading}
            optionFilterProp="label"
            options={(directoryState.data ?? []).map((item) => ({
              value: item.id,
              label: `${item.fullName} · ${item.department}`,
            }))}
            placeholder="Tìm theo tên, phòng ban..."
            showSearch
          />
        </Form.Item>
        <div className="modal-actions">
          <Button onClick={close}>Hủy</Button>
          <Button htmlType="submit" loading={creating} type="primary">
            Tạo đoạn chat
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
