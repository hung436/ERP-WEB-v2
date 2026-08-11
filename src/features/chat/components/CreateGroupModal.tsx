import { Button, Form, Input, Modal, Select } from 'antd';

import { useAsyncData } from '@/hooks/useAsyncData';
import { directoryApi } from '@/services/api';

export function CreateGroupModal({ open, creating, onClose, onCreate }: { open: boolean; creating: boolean; onClose: () => void; onCreate: (name: string, memberIds: string[]) => Promise<void> }) {
  const directoryState = useAsyncData(async () => (await directoryApi.list()).data);
  const [form] = Form.useForm<{ name: string; memberIds: string[] }>();

  const close = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal className="create-group-modal" footer={null} onCancel={close} open={open} title="Nhóm mới">
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onCreate(values.name, values.memberIds);
          form.resetFields();
        }}
      >
        <Form.Item label="Tên nhóm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}>
          <Input maxLength={60} placeholder="Nhập tên nhóm..." />
        </Form.Item>
        <Form.Item label="Thành viên" name="memberIds" rules={[{ required: true, message: 'Vui lòng chọn thành viên' }]}>
          <Select
            aria-label="Chọn thành viên"
            loading={directoryState.loading}
            mode="multiple"
            optionFilterProp="label"
            options={(directoryState.data ?? []).map((item) => ({
              value: item.id,
              label: `${item.fullName} · ${item.department}`,
            }))}
            placeholder="Chọn thành viên..."
          />
        </Form.Item>
        <div className="modal-actions">
          <Button onClick={close}>Hủy</Button>
          <Button htmlType="submit" loading={creating} type="primary">
            Tạo nhóm
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
