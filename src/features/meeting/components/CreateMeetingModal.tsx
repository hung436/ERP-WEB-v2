import { Button, DatePicker, Form, Input, Modal, Select, Switch, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { directoryApi, meetingApi } from '@/services/api';
import { useAsyncData } from '@/hooks/useAsyncData';

interface FormValues {
  title: string;
  timeRange: [Dayjs, Dayjs];
  platform: string;
  agenda: string;
  participants: string[];
  recordingAvailable: boolean;
}

export function CreateMeetingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const contactsState = useAsyncData(async () => (await directoryApi.list()).data);

  const contactOptions = (contactsState.data ?? []).map((contact) => ({
    label: `${contact.fullName} (${contact.department})`,
    value: contact.fullName,
  }));

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const [startAt, endAt] = values.timeRange;
      const roomSlug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'room';
      await meetingApi.create({
        title: values.title,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        platform: values.platform || 'meeting.tuoitre.vn',
        location: values.platform || 'meeting.tuoitre.vn',
        meetingUrl: `https://meeting.tuoitre.vn/${roomSlug}`,
        recordingAvailable: values.recordingAvailable ?? true,
        agenda: values.agenda,
        participants: values.participants,
      });
      message.success('Đã tạo phòng họp trực tuyến thành công');
      form.resetFields();
      onClose();
      await onCreated();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể tạo cuộc họp trực tuyến.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      centered
      className="create-meeting-modal"
      footer={
        <div className="document-modal-actions">
          <Button onClick={onClose}>Hủy</Button>
          <Button loading={loading} onClick={() => form.submit()} type="primary">
            Tạo phòng họp
          </Button>
        </div>
      }
      onCancel={onClose}
      open={open}
      title={
        <span className="preview-title">
          <span className="section-icon meetings">
            <ModuleIcon module="meetings" size={20} />
          </span>
          Tạo cuộc họp trực tuyến mới
        </span>
      }
      width={640}
    >
      <Form
        autoComplete="off"
        form={form}
        initialValues={{
          platform: 'meeting.tuoitre.vn',
          recordingAvailable: true,
          timeRange: [dayjs().add(1, 'hour').startOf('hour'), dayjs().add(2, 'hour').startOf('hour')],
        }}
        layout="vertical"
        onFinish={(values) => void handleSubmit(values)}
      >
        <Form.Item
          label="Tên cuộc họp trực tuyến"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên cuộc họp' }]}
        >
          <Input placeholder="Ví dụ: Họp trực tuyến duyệt kế hoạch xuất bản tuần 33" />
        </Form.Item>

        <Form.Item
          label="Thời gian họp trực tuyến"
          name="timeRange"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian họp' }]}
        >
          <DatePicker.RangePicker
            format="DD/MM/YYYY HH:mm"
            showTime={{ format: 'HH:mm' }}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Nền tảng họp trực tuyến"
          name="platform"
          rules={[{ required: true, message: 'Vui lòng chọn nền tảng họp trực tuyến' }]}
        >
          <Select
            options={[
              { label: 'meeting.tuoitre.vn (Hệ thống họp trực tuyến nội bộ Tuổi Trẻ)', value: 'meeting.tuoitre.vn' },
              { label: 'Google Meet', value: 'Google Meet' },
              { label: 'Microsoft Teams', value: 'Microsoft Teams' },
              { label: 'Zoom Workplace', value: 'Zoom' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Thành phần tham dự" name="participants">
          <Select
            allowClear
            mode="multiple"
            options={contactOptions}
            placeholder="Chọn các thành viên tham gia từ danh bạ nội bộ"
          />
        </Form.Item>

        <Form.Item label="Chương trình / Nội dung trao đổi" name="agenda">
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder="Nhập tóm tắt nội dung cuộc họp hoặc các vấn đề cần chốt trực tuyến..."
          />
        </Form.Item>

        <Form.Item label="Ghi hình cuộc họp trực tuyến" name="recordingAvailable" valuePropName="checked">
          <Switch checkedChildren="Có ghi hình" unCheckedChildren="Không ghi hình" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
