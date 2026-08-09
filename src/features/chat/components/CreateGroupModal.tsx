import { Button, Form, Input, Modal, Select } from 'antd';

import type { ChatMember } from '@/types/domain';

export function CreateGroupModal({ members, open, creating, onClose, onCreate }: { members: ChatMember[]; open: boolean; creating: boolean; onClose: () => void; onCreate: (name: string, memberIds: string[]) => Promise<void> }) {
  const [form] = Form.useForm<{ name: string; memberIds: string[] }>();
  const close = () => { form.resetFields(); onClose(); };
  return <Modal className="create-group-modal" footer={null} onCancel={close} open={open} title="Tạo nhóm mới">
    <p>Đặt tên nhóm và chọn những đồng nghiệp cần tham gia.</p>
    <Form form={form} layout="vertical" onFinish={async (values) => { await onCreate(values.name, values.memberIds); form.resetFields(); }}>
      <Form.Item label="Tên nhóm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }, { min: 3, message: 'Tên nhóm cần ít nhất 3 ký tự' }]}><Input maxLength={60} placeholder="Ví dụ: Nhóm kế hoạch tuần" /></Form.Item>
      <Form.Item label="Thành viên" name="memberIds" rules={[{ required: true, message: 'Chọn ít nhất một thành viên' }]}><Select mode="multiple" optionFilterProp="label" options={members.filter((item) => item.id !== 'user-001').map((item) => ({ value: item.id, label: `${item.name} · ${item.department}` }))} placeholder="Chọn thành viên" /></Form.Item>
      <div className="modal-actions"><Button onClick={close}>Hủy</Button><Button htmlType="submit" loading={creating} type="primary">Tạo nhóm</Button></div>
    </Form>
  </Modal>;
}
