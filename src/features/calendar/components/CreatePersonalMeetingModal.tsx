import { Button, DatePicker, Form, Input, Modal, Select, TimePicker, Tooltip, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { Check, Copy, Edit3, Plus, UploadCloud, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { calendarApi } from '@/services/api';
import type { CalendarAttachmentItem, CalendarEvent } from '@/types/domain';
import { AttachedFilesGrid } from './AttachedFilesList';

interface CreatePersonalMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newEvent: CalendarEvent) => void;
  initialDate?: dayjs.Dayjs;
  editingEvent?: CalendarEvent | null;
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
  editingEvent,
}: CreatePersonalMeetingModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const isEdit = Boolean(editingEvent);

  useEffect(() => {
    if (open) {
      if (editingEvent) {
        form.setFieldsValue({
          title: editingEvent.title,
          date: dayjs(editingEvent.startAt),
          timeRange: [dayjs(editingEvent.startAt), dayjs(editingEvent.endAt)],
          location: editingEvent.location || '',
          participants: editingEvent.participants?.length
            ? editingEvent.participants
            : [editingEvent.leader || 'Nguyễn Minh Anh (Phóng viên)'],
          content: editingEvent.notes || '',
        });
        if (editingEvent.attachments?.length) {
          setFiles(
            editingEvent.attachments.map((att) => ({
              uid: att.id,
              name: att.name,
              size: att.size,
              type: att.type,
              status: 'done',
            }))
          );
        } else {
          setFiles([]);
        }
      } else {
        form.resetFields();
        setFiles([]);
      }
    }
  }, [open, editingEvent, form]);

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
        id: f.uid?.startsWith('file-') ? `att-${Date.now()}-${i}` : f.uid,
        name: f.name,
        size: f.size || 102400,
        type: f.name.split('.').pop() || 'file',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Nguyễn Minh Anh',
      }));

      const locVal = values.location?.trim() || '';
      const isUrl = /^https?:\/\//i.test(locVal) || locVal.includes('meeting.');
      const meetingUrl = isUrl ? (locVal.startsWith('http') ? locVal : `https://${locVal}`) : undefined;

      if (isEdit && editingEvent) {
        const payload: Partial<CalendarEvent> = {
          title: values.title.trim(),
          startAt,
          endAt,
          location: locVal || 'https://meeting.tuoitre.vn/room-123',
          meetingUrl: meetingUrl || (locVal.includes('meeting') ? (locVal.startsWith('http') ? locVal : `https://${locVal}`) : 'https://meeting.tuoitre.vn/room-123'),
          platform: isUrl ? 'meeting.tuoitre.vn' : undefined,
          participants: values.participants?.length ? values.participants : ['Nguyễn Minh Anh'],
          participantText: values.participants?.join(', ') || 'Nguyễn Minh Anh',
          participantCount: values.participants?.length || 1,
          notes: values.content?.trim() || '',
          attachments: attachmentsPayload,
        };

        const res = await calendarApi.update(editingEvent.id, payload);
        message.success('Đã cập nhật lịch làm việc thành công!');
        onSuccess(res.data);
        onClose();
      } else {
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

        const payload: Partial<CalendarEvent> = {
          title: values.title.trim(),
          startAt,
          endAt,
          scope: 'personal',
          type: 'meeting',
          location: locVal || 'https://meeting.tuoitre.vn/room-123',
          meetingUrl: meetingUrl || (locVal.includes('meeting') ? (locVal.startsWith('http') ? locVal : `https://${locVal}`) : 'https://meeting.tuoitre.vn/room-123'),
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
      }
    } catch {
      message.error(isEdit ? 'Không thể cập nhật cuộc họp. Vui lòng kiểm tra lại thông tin.' : 'Không thể tạo cuộc họp. Vui lòng kiểm tra lại thông tin.');
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
          icon={isEdit ? <Check size={15} /> : <Plus size={15} />}
          key="submit"
          loading={submitting}
          type="primary"
        >
          {isEdit ? 'Lưu thay đổi' : 'Tạo'}
        </Button>,
      ]}
      onCancel={onClose}
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          {isEdit ? (
            <Edit3 size={18} style={{ color: '#175cd3' }} />
          ) : (
            <Video size={18} style={{ color: '#175cd3' }} />
          )}
          <span>{isEdit ? 'Chỉnh sửa lịch làm việc' : 'Tạo lịch họp'}</span>
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
          location: 'https://meeting.tuoitre.vn/room-123',
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
              <TimePicker.RangePicker
                format="HH:mm"
                minuteStep={15}
                needConfirm={false}
                onCalendarChange={(dates, _dateStrings, info) => {
                  if (info.range === 'start' && dates?.[0]) {
                    const start = dates[0];
                    const autoEnd = start.add(1, 'hour');
                    form.setFieldValue('timeRange', [start, autoEnd]);
                  } else if (info.range === 'end' && dates?.[1]) {
                    const currentStart = form.getFieldValue('timeRange')?.[0] || dates[0];
                    form.setFieldValue('timeRange', [currentStart, dates[1]]);
                  }
                }}
                onChange={(dates) => {
                  if (!dates) {
                    form.setFieldValue('timeRange', null);
                    return;
                  }
                  const [start, end] = dates;
                  if (start && (!end || end.isBefore(start) || end.isSame(start))) {
                    form.setFieldValue('timeRange', [start, start.add(1, 'hour')]);
                  } else {
                    form.setFieldValue('timeRange', [start, end]);
                  }
                }}
                popupClassName="clean-time-picker-popup"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item
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
            placeholder="Nhập địa điểm hoặc đường link phòng họp (https://meeting.tuoitre.vn/room-123)..."
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
