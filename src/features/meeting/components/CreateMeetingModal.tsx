import { Button, DatePicker, Form, Input, Modal, Select, Switch, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { Calendar, Video } from 'lucide-react';

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
        platform: values.platform || 'Phòng họp ứng dụng Tuổi Trẻ',
        location: values.platform === 'Phòng họp ứng dụng Tuổi Trẻ' ? 'Phòng họp trực tuyến' : values.platform,
        meetingUrl: `https://meeting.tuoitre.vn/${roomSlug}`,
        recordingAvailable: values.recordingAvailable ?? true,
        agenda: values.agenda,
        participants: values.participants,
      });
      message.success('Đã lên lịch cuộc họp trực tuyến thành công');
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
      className="modern-meeting-modal"
      footer={
        <div className="modal-custom-footer">
          <Button onClick={onClose} size="large">
            Hủy
          </Button>
          <Button
            className="btn-modal-submit"
            icon={<Video size={16} />}
            loading={loading}
            onClick={() => form.submit()}
            size="large"
            type="primary"
          >
            Lên lịch cuộc họp
          </Button>
        </div>
      }
      onCancel={onClose}
      open={open}
      title={
        <div className="modal-custom-header">
          <span className="modal-header-icon">
            <Calendar size={20} />
          </span>
          <div className="modal-header-text">
            <h3>Lên lịch cuộc họp mới</h3>
          </div>
        </div>
      }
      width={640}
    >
      <Form
        autoComplete="off"
        className="modern-meeting-form"
        form={form}
        initialValues={{
          platform: 'Phòng họp ứng dụng Tuổi Trẻ',
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
          <Input
            className="modal-form-input"
            placeholder="Ví dụ: Họp Ban Thư ký duyệt kế hoạch xuất bản tuần..."
            size="large"
          />
        </Form.Item>

        <div className="form-row-2col">
          <Form.Item
            label="Thời gian họp"
            name="timeRange"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian họp' }]}
          >
            <DatePicker.RangePicker
              className="modal-form-datepicker"
              format="DD/MM/YYYY HH:mm"
              placeholder={['Bắt đầu', 'Kết thúc']}
              showTime={{ format: 'HH:mm' }}
              size="large"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Nền tảng họp"
            name="platform"
            rules={[{ required: true, message: 'Vui lòng chọn nền tảng' }]}
          >
            <Select
              className="modal-form-select"
              options={[
                { label: 'Hệ thống nội bộ Tuổi Trẻ', value: 'Phòng họp ứng dụng Tuổi Trẻ' },
                { label: 'Google Meet', value: 'Google Meet' },
                { label: 'Microsoft Teams', value: 'Microsoft Teams' },
                { label: 'Zoom Workplace', value: 'Zoom' },
              ]}
              size="large"
            />
          </Form.Item>
        </div>

        <Form.Item label="Thành viên tham dự" name="participants">
          <Select
            allowClear
            className="modal-form-select"
            maxTagCount="responsive"
            mode="multiple"
            options={contactOptions}
            placeholder="Chọn các thành viên từ danh bạ nội bộ tòa soạn..."
            size="large"
          />
        </Form.Item>

        <Form.Item label="Chương trình / Nội dung trao đổi" name="agenda">
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            className="modal-form-textarea"
            placeholder="Nhập tóm tắt nội dung, tài liệu đính kèm hoặc các vấn đề cần thảo luận..."
          />
        </Form.Item>

        <div className="form-toggle-row">
          <div className="toggle-text">
            <strong>Ghi hình cuộc họp tự động</strong>
            <small>Lưu lại video và biên bản cuộc họp vào kho dữ liệu nội bộ</small>
          </div>
          <Form.Item name="recordingAvailable" noStyle valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
