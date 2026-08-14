import { Button, Checkbox, DatePicker, Form, Input, Modal, Select, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { RichTextEditor } from '@/components/RichTextEditor';
import { AttachedFilesGrid } from '@/features/calendar/components/AttachedFilesList';
import { calendarGroupApi, calendarNotificationApi, directoryApi } from '@/services/api';
import { useAsyncData } from '@/hooks/useAsyncData';
import type { CalendarAttachment, CalendarNotificationRecipient, CreateCalendarNotificationPayload } from '@/types/calendar';

interface FormValues {
  recipientType: 'all' | 'groups' | 'individuals';
  selectedGroups?: string[];
  selectedIndividuals?: string[];
  title: string;
  content: string;
  scheduledAt?: Dayjs;
  sendMailCopy?: boolean;
  applyWatermark?: boolean;
}

export function CreateEditorialMeetingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'groups' | 'individuals'>('groups');
  const [editorContent, setEditorContent] = useState('');

  const groupsState = useAsyncData(async () => (await calendarGroupApi.list()).data);
  const contactsState = useAsyncData(async () => (await directoryApi.list()).data);

  const activeGroups = (groupsState.data ?? []).filter((g) => g.status === 'active');
  const contacts = contactsState.data ?? [];

  const groupOptions = useMemo(() => {
    return activeGroups.map((g) => ({
      label: `${g.name} (${g.members.length} thành viên)`,
      value: g.name,
    }));
  }, [activeGroups]);

  const individualOptions = useMemo(() => {
    return contacts.map((c) => ({
      label: `${c.fullName} (${c.department})`,
      value: c.fullName,
    }));
  }, [contacts]);

  const handleFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      let recipientData: CalendarNotificationRecipient;
      if (values.recipientType === 'all') {
        recipientData = { targetType: 'all' };
      } else if (values.recipientType === 'groups') {
        if (!values.selectedGroups || values.selectedGroups.length === 0) {
          message.error('Vui lòng chọn ít nhất một nhóm nhận');
          setSubmitting(false);
          return;
        }
        recipientData = {
          targetType: 'groups',
          groupNames: values.selectedGroups,
        };
      } else {
        if (!values.selectedIndividuals || values.selectedIndividuals.length === 0) {
          message.error('Vui lòng chọn ít nhất một cá nhân nhận');
          setSubmitting(false);
          return;
        }
        recipientData = {
          targetType: 'individuals',
          individuals: values.selectedIndividuals,
        };
      }

      const contentToSave = editorContent || values.content || '';
      if (!contentToSave.trim()) {
        message.error('Vui lòng nhập nội dung cuộc họp');
        setSubmitting(false);
        return;
      }

      const attachments: CalendarAttachment[] = fileList.map((f, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        name: f.name,
        size: f.size ?? 1024 * 500,
        type: f.type || 'application/octet-stream',
      }));

      const scheduledIso = values.scheduledAt ? values.scheduledAt.toISOString() : undefined;

      const payload: CreateCalendarNotificationPayload = {
        type: 'editorial_meeting',
        title: values.title.trim(),
        content: contentToSave.trim(),
        isHtmlContent: true,
        recipients: recipientData,
        scheduledAt: scheduledIso,
        sendMailCopy: values.sendMailCopy ?? false,
        applyWatermark: values.applyWatermark ?? false,
        attachments,
      };

      await calendarNotificationApi.create(payload);
      message.success(scheduledIso ? 'Đã hẹn giờ phát lịch họp' : 'Đã tạo lịch họp Ban Biên tập thành công');
      form.resetFields();
      setFileList([]);
      setEditorContent('');
      onClose();
      await onCreated();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể tạo lịch họp Ban Biên tập');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      centered
      className="calendar-large-modal"
      destroyOnClose
      footer={
        <div className="modal-actions-footer">
          <Button onClick={onClose} size="middle">Hủy</Button>
          <Button
            className="btn-primary-red"
            loading={submitting}
            onClick={() => form.submit()}
            size="middle"
            type="primary"
          >
            Tạo
          </Button>
        </div>
      }
      onCancel={onClose}
      open={open}
      title={
        <div className="modal-header-with-icon">
          <span className="header-icon-badge meeting-badge">
            <ModuleIcon module="calendar" size={20} />
          </span>
          <h3 className="modal-main-title">Tạo Lịch họp Ban Biên tập</h3>
        </div>
      }
      width={900}
    >
      <Form
        autoComplete="off"
        form={form}
        initialValues={{
          recipientType: 'groups',
          selectedGroups: ['Ban Biên tập'],
          sendMailCopy: true,
          applyWatermark: true,
        }}
        layout="vertical"
        onFinish={(values) => void handleFinish(values)}
      >
        {/* 1. DANH SÁCH NHẬN */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14 }}>
          <Form.Item label="Danh sách nhận" name="recipientType" rules={[{ required: true }]}>
            <Select
              onChange={(val) => setRecipientType(val)}
              options={[
                { label: 'Chọn theo nhóm', value: 'groups' },
                { label: 'Từng cá nhân', value: 'individuals' },
                { label: 'Toàn thể nhân viên', value: 'all' },
              ]}
              size="middle"
            />
          </Form.Item>

          {recipientType === 'groups' && (
            <Form.Item
              label="Chọn nhóm nhận"
              name="selectedGroups"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
            >
              <Select
                allowClear
                mode="multiple"
                options={groupOptions}
                placeholder="Chọn một hoặc nhiều nhóm nhận..."
                showSearch
                size="middle"
              />
            </Form.Item>
          )}

          {recipientType === 'individuals' && (
            <Form.Item
              label="Chọn nhân viên"
              name="selectedIndividuals"
              rules={[{ required: true, message: 'Vui lòng chọn cá nhân' }]}
            >
              <Select
                allowClear
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                mode="multiple"
                options={individualOptions}
                placeholder="Chọn các nhân viên..."
                showSearch
                size="middle"
              />
            </Form.Item>
          )}

          {recipientType === 'all' && (
            <Form.Item label="Phạm vi nhận">
              <Input disabled size="middle" value="Toàn thể cán bộ công nhân viên tòa soạn Báo Tuổi Trẻ" />
            </Form.Item>
          )}
        </div>

        {/* 2. TIÊU ĐỀ */}
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="VD: Lịch họp Ban Biên tập đầu tuần duyệt kế hoạch xuất bản tuần 34" size="middle" />
        </Form.Item>

        {/* 3. NỘI DUNG THÔNG BÁO VỚI RICH TEXT EDITOR */}
        <Form.Item
          label="Nội dung thông báo"
          name="content"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <RichTextEditor
            minHeight={200}
            onChange={(html) => {
              setEditorContent(html);
              form.setFieldsValue({ content: html });
            }}
            placeholder="Nhập nội dung chi tiết cuộc họp, thời gian, địa điểm, thành phần..."
            value={editorContent}
          />
        </Form.Item>

        {/* 4. TẬP TIN ĐÍNH KÈM */}
        <Form.Item label="Tập tin đính kèm">
          <Upload
            beforeUpload={(file) => {
              setFileList((prev) => [...prev, file]);
              return false;
            }}
            fileList={[]}
            multiple
            showUploadList={false}
          >
            <button className="simple-upload-btn" type="button">
              📎 Đính kèm tệp tin (PDF, DOCX, XLSX, Ảnh...)
            </button>
          </Upload>

          <AttachedFilesGrid
            files={fileList}
            onRemove={(uid) => setFileList((prev) => prev.filter((item) => item.uid !== uid))}
          />
        </Form.Item>

        {/* 5. HẸN GIỜ GỬI */}
        <Form.Item
          label="Hẹn giờ gửi"
          name="scheduledAt"
        >
          <DatePicker
            allowClear
            format="DD/MM/YYYY HH:mm"
            minDate={dayjs()}
            placeholder="Chọn ngày & giờ hẹn gửi"
            showTime={{ format: 'HH:mm' }}
            size="middle"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 6. TÙY CHỌN */}
        <div style={{ display: 'flex', gap: 28, paddingTop: 4 }}>
          <Form.Item name="sendMailCopy" noStyle valuePropName="checked">
            <Checkbox>Nhận thêm thông báo qua mail</Checkbox>
          </Form.Item>

          <Form.Item name="applyWatermark" noStyle valuePropName="checked">
            <Checkbox>Watermark tệp đính kèm</Checkbox>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
