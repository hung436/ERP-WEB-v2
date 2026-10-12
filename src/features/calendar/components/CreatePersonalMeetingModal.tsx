import { Button, DatePicker, Form, Input, Modal, Select, TimePicker, Tooltip, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { Copy, Plus, UploadCloud, Video } from 'lucide-react';
import { useState } from 'react';
import { calendarApi } from '@/services/api';
import type { CalendarAttachmentItem, CalendarEvent } from '@/types/domain';
import { AttachedFilesGrid } from './AttachedFilesList';

interface CreatePersonalMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newEvent: CalendarEvent) => void;
  initialDate?: dayjs.Dayjs;
}

const SUGGESTED_MEMBERS = [
  'Nguyễn Minh Anh (Phóng viên)',
  'Trần Thu Hà (Ban Nội dung)',
  'Lê Thanh Vân (Văn phòng)',
  'Nguyễn Hoài Nam (Ban Bạn đọc)',
  'Đỗ Quang Huy (Ban Khoa giáo)',
  'Mai Phương Thảo (Phòng Lưu trữ)',
  'Hoàng Điệp (BTV Ảnh)',
  'TS. Trần Quốc Hùng (Chuyên gia khách mời)',
];

export function CreatePersonalMeetingModal({
  open,
  onClose,
  onSuccess,
  initialDate,
}: CreatePersonalMeetingModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleUploadFile = (file: File) => {
    const uploadItem: UploadFile = {
      uid: `file-${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'done',
    };
    setFiles((prev) => [...prev, uploadItem]);
    return false;
  };

  const handleRemoveFile = (uid: string) => {
    setFiles((prev) => prev.filter((f) => f.uid !== uid));
  };

  const handleCopyLink = () => {
    const loc = form.getFieldValue('location');
    if (loc?.trim()) {
      navigator.clipboard.writeText(loc.trim());
      message.success('Đã sao chép đường link!');
    } else {
      message.warning('Chưa có đường link để sao chép.');
    }
  };

  const handleFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const dateStr = values.date.format('YYYY-MM-DD');
      const startAt = `${dateStr}T${values.timeRange[0].format('HH:mm')}:00+07:00`;
      const endAt = `${dateStr}T${values.timeRange[1].format('HH:mm')}:00+07:00`;

      const attachmentsPayload: CalendarAttachmentItem[] = files.map((f, i) => ({
        id: `att-${Date.now()}-${i}`,
        name: f.name,
        size: f.size || 102400,
        type: f.name.split('.').pop() || 'file',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Nguyễn Minh Anh',
      }));

      const initialComments = values.content?.trim()
        ? [
            {
              id: `cmt-${Date.now()}`,
              author: 'Nguyễn Minh Anh',
              content: values.content.trim(),
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

      const locVal = values.location?.trim() || '';
      const isUrl = /^https?:\/\//i.test(locVal) || locVal.includes('meeting.');
      const meetingUrl = isUrl ? (locVal.startsWith('http') ? locVal : `https://${locVal}`) : undefined;

      const payload: Partial<CalendarEvent> = {
        title: values.title.trim(),
        startAt,
        endAt,
        scope: 'personal',
        type: 'meeting',
        location: locVal || 'Trực tuyến (meeting.tuoitre.vn)',
        meetingUrl: meetingUrl || (locVal.includes('meeting') ? 'https://meeting.tuoitre.vn' : undefined),
        platform: isUrl ? 'meeting.tuoitre.vn' : undefined,
        leader: 'Nguyễn Minh Anh',
        participants: values.participants?.length ? values.participants : ['Nguyễn Minh Anh'],
        participantText: values.participants?.join(', ') || 'Nguyễn Minh Anh',
        participantCount: values.participants?.length || 1,
        notes: values.content?.trim() || '',
        attachments: attachmentsPayload,
        comments: initialComments,
        isUserParticipant: true,
      };

      const res = await calendarApi.create(payload);
      message.success('Đã tạo cuộc họp thành công!');
      form.resetFields();
      setFiles([]);
      onSuccess(res.data);
      onClose();
    } catch {
      message.error('Không thể tạo cuộc họp. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy bỏ
        </Button>,
        <Button
          form="create-personal-meeting-form"
          htmlType="submit"
          icon={<Plus size={15} />}
          key="submit"
          loading={submitting}
          type="primary"
        >
          Tạo
        </Button>,
      ]}
      onCancel={onClose}
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          <Video size={18} style={{ color: '#175cd3' }} />
          <span>Tạo lịch họp</span>
        </div>
      }
      width={600}
    >
      <Form
        form={form}
        id="create-personal-meeting-form"
        initialValues={{
          date: initialDate || dayjs('2026-10-09'),
          timeRange: [dayjs('09:00', 'HH:mm'), dayjs('10:00', 'HH:mm')],
          location: 'Trực tuyến (meeting.tuoitre.vn)',
          participants: ['Nguyễn Minh Anh (Phóng viên)'],
        }}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="Ví dụ: Phỏng vấn chuyên gia, Họp bàn tuyến bài phóng sự điều tra..." />
        </Form.Item>

        <Form.Item label="Thời gian" required style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="date"
              noStyle
              rules={[{ required: true, message: 'Vui lòng chọn ngày họp' }]}
            >
              <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="timeRange"
              noStyle
              rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
            >
              <TimePicker.RangePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item
          extra="Bạn có thể chọn từ danh sách hoặc nhập tên người tham gia rồi nhấn Enter"
          label="Thành phần tham gia"
          name="participants"
          rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập ít nhất một người tham dự' }]}
        >
          <Select
            mode="tags"
            options={SUGGESTED_MEMBERS.map((m) => ({ label: m, value: m }))}
            placeholder="Chọn hoặc nhập tên nhân sự / khách mời tham gia..."
          />
        </Form.Item>

        <Form.Item label="Địa điểm" name="location">
          <Input
            placeholder="Nhập địa điểm hoặc đường link phòng họp (meeting.tuoitre.vn)..."
            suffix={
              <Tooltip title="Sao chép đường link">
                <Button
                  icon={<Copy size={13} />}
                  onClick={handleCopyLink}
                  size="small"
                  style={{ padding: '0 4px', height: 22, border: 'none', background: 'transparent' }}
                  type="text"
                />
              </Tooltip>
            }
          />
        </Form.Item>

        <Form.Item label="Tài liệu">
          <Upload beforeUpload={handleUploadFile} fileList={[]} showUploadList={false}>
            <Button icon={<UploadCloud size={14} />}>Chọn tệp</Button>
          </Upload>
          {files.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <AttachedFilesGrid files={files} onRemove={handleRemoveFile} />
            </div>
          )}
        </Form.Item>

        <Form.Item label="Nội dung" name="content">
          <Input.TextArea
            placeholder="Nhập nội dung cuộc họp hoặc lưu ý đầu tiên cho các thành viên..."
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
