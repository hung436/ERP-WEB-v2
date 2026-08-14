import { Button, Form, Input, Modal, Radio, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { calendarGroupApi, directoryApi } from '@/services/api';
import { useAsyncData } from '@/hooks/useAsyncData';
import type { CalendarRecipientGroup, CreateRecipientGroupPayload, GroupStatus } from '@/types/calendar';

interface FormValues {
  name: string;
  members: string[];
  status: GroupStatus;
}

export function CreateRecipientGroupModal({
  open,
  editingGroup,
  onClose,
  onSaved,
}: {
  open: boolean;
  editingGroup: CalendarRecipientGroup | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  const contactsState = useAsyncData(async () => (await directoryApi.list()).data);
  const contacts = contactsState.data ?? [];

  const individualOptions = useMemo(() => {
    return contacts.map((c) => ({
      label: `${c.fullName} — ${c.department} (${c.email})`,
      value: c.fullName,
    }));
  }, [contacts]);

  useEffect(() => {
    if (editingGroup) {
      form.setFieldsValue({
        name: editingGroup.name,
        members: editingGroup.members,
        status: editingGroup.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 'active',
        members: [],
      });
    }
  }, [editingGroup, form, open]);

  const handleFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload: CreateRecipientGroupPayload = {
        name: values.name.trim(),
        members: values.members ?? [],
        status: values.status ?? 'active',
      };

      if (editingGroup) {
        await calendarGroupApi.update(editingGroup.id, payload);
        message.success('Đã cập nhật nhóm nhận thông báo');
      } else {
        await calendarGroupApi.create(payload);
        message.success('Đã tạo nhóm nhận thông báo mới');
      }

      form.resetFields();
      onClose();
      await onSaved();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể lưu thông tin nhóm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      centered
      className="calendar-group-modal"
      destroyOnClose
      footer={
        <div className="modal-actions-footer">
          <Button onClick={onClose} size="middle">Hủy</Button>
          <Button
            className="btn-primary-purple"
            loading={submitting}
            onClick={() => form.submit()}
            size="middle"
            type="primary"
          >
            {editingGroup ? 'Cập nhật nhóm' : 'Tạo nhóm mới'}
          </Button>
        </div>
      }
      onCancel={onClose}
      open={open}
      title={
        <div className="modal-header-with-icon">
          <span className="header-icon-badge group-badge">
            <ModuleIcon module="calendar" size={20} />
          </span>
          <h3 className="modal-main-title">
            {editingGroup ? 'Chỉnh sửa nhóm nhận thông báo' : 'Tạo nhóm nhận thông báo mới'}
          </h3>
        </div>
      }
      width={760}
    >
      <Form
        autoComplete="off"
        form={form}
        initialValues={{
          status: 'active',
          members: [],
        }}
        layout="vertical"
        onFinish={(values) => void handleFinish(values)}
      >
        <Form.Item
          label="Tên nhóm"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhóm nhận' }]}
        >
          <Input placeholder="VD: Ban Biên tập, Ban Thư ký tòa soạn, Tổ phóng viên thời sự..." size="middle" />
        </Form.Item>

        <Form.Item
          label="Cá nhân (Danh sách nhân viên trong nhóm)"
          name="members"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một nhân viên' }]}
        >
          <Select
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            mode="multiple"
            options={individualOptions}
            placeholder="Chọn các thành viên tham gia nhóm..."
            showSearch
            size="middle"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái nhóm"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Radio.Group buttonStyle="solid" size="middle">
            <Radio.Button value="active">
              <span style={{ color: '#027a48', fontWeight: 600 }}>● Đang mở</span>
            </Radio.Button>
            <Radio.Button value="closed">
              <span style={{ color: '#667085', fontWeight: 600 }}>○ Đã đóng</span>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
