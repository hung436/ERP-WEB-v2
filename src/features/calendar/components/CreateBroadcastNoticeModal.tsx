import { Button, Checkbox, DatePicker, Dropdown, Form, Input, Modal, Select, Space, Upload, message } from 'antd';
import type { MenuProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useRef, useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { RichTextEditor } from '@/components/RichTextEditor';
import { AttachedFilesGrid } from '@/features/calendar/components/AttachedFilesList';
import { calendarGroupApi, calendarNotificationApi, directoryApi } from '@/services/api';
import { HTML_NOTIFICATION_TEMPLATES, type HtmlTemplateItem } from '@/mocks/calendarNotificationFixtures';
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

interface AttachedTemplateInfo {
  name: string;
  size: number;
  content: string;
  isHtml: boolean;
}

export function CreateBroadcastNoticeModal({
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
  const [recipientType, setRecipientType] = useState<'all' | 'groups' | 'individuals'>('all');
  const [attachedTemplate, setAttachedTemplate] = useState<AttachedTemplateInfo | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(true);
  const [editorContent, setEditorContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Apply template from sample list
  const handleSelectSampleTemplate = (tpl: HtmlTemplateItem) => {
    setAttachedTemplate({
      name: `${tpl.name}.html`,
      size: tpl.htmlContent.length,
      content: tpl.htmlContent,
      isHtml: true,
    });
    if (!form.getFieldValue('title')) {
      form.setFieldsValue({ title: tpl.name });
    }
    setShowTemplatePreview(true);
    message.success(`Đã đính kèm biểu mẫu: ${tpl.name}`);
  };

  // Upload custom template file (HTML, TXT, MD, etc.)
  const handleFileUploadTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setAttachedTemplate({
        name: file.name,
        size: file.size,
        content: text,
        isHtml: isHtml,
      });
      if (!form.getFieldValue('title')) {
        form.setFieldsValue({ title: file.name.replace(/\.[^/.]+$/, '') });
      }
      setShowTemplatePreview(true);
      message.success(`Đã đính kèm tệp biểu mẫu: ${file.name}`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleRemoveAttachedTemplate = () => {
    setAttachedTemplate(null);
    setShowTemplatePreview(false);
  };

  const templateMenuItems: MenuProps['items'] = [
    {
      key: 'upload-template-file',
      label: '📂 Đính kèm tệp biểu mẫu từ máy tính (.html, .htm, .txt)',
      onClick: () => fileInputRef.current?.click(),
    },
    { type: 'divider' },
    ...HTML_NOTIFICATION_TEMPLATES.map((tpl) => ({
      key: tpl.id,
      label: `📄 ${tpl.name}`,
      onClick: () => handleSelectSampleTemplate(tpl),
    })),
  ];

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

      const contentToSave = editorContent || (attachedTemplate ? attachedTemplate.content : values.content) || '';
      if (!contentToSave.trim() && !attachedTemplate) {
        message.error('Vui lòng nhập nội dung thông báo hoặc đính kèm biểu mẫu');
        setSubmitting(false);
        return;
      }

      const attachments: CalendarAttachment[] = fileList.map((f, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        name: f.name,
        size: f.size ?? 1024 * 500,
        type: f.type || 'application/octet-stream',
      }));

      // If attached template, also add it as attachment
      if (attachedTemplate) {
        attachments.unshift({
          id: `tpl-${Date.now()}`,
          name: attachedTemplate.name,
          size: attachedTemplate.size,
          type: attachedTemplate.isHtml ? 'text/html' : 'text/plain',
        });
      }

      const scheduledIso = values.scheduledAt ? values.scheduledAt.toISOString() : undefined;

      const payload: CreateCalendarNotificationPayload = {
        type: 'general_announcement',
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
      message.success(scheduledIso ? 'Đã hẹn giờ phát thông báo' : 'Đã tạo và phát thông báo thành công');
      form.resetFields();
      setFileList([]);
      setAttachedTemplate(null);
      setEditorContent('');
      onClose();
      await onCreated();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể tạo thông báo');
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
            className="btn-primary-blue"
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
          <span className="header-icon-badge notice-badge">
            <ModuleIcon module="announcements" size={20} />
          </span>
          <h3 className="modal-main-title">Tạo Thông báo</h3>
        </div>
      }
      width={940}
    >
      <input
        accept=".html,.htm,.txt"
        onChange={handleFileUploadTemplate}
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
      />

      <Form
        autoComplete="off"
        form={form}
        initialValues={{
          recipientType: 'all',
          sendMailCopy: true,
          applyWatermark: false,
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
                { label: 'Toàn thể nhân viên', value: 'all' },
                { label: 'Chọn theo nhóm', value: 'groups' },
                { label: 'Từng cá nhân', value: 'individuals' },
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
          <Input placeholder="VD: Thông báo về việc triển khai quy chế nhuận bút đa phương tiện năm 2026" size="middle" />
        </Form.Item>

        {/* 3. TẢI BIỂU MẪU ĐÍNH KÈM */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14, color: '#344054' }}>
            Nội dung thông báo <span style={{ color: '#d92d20' }}>*</span>
          </label>

          <Dropdown menu={{ items: templateMenuItems }} placement="bottomRight">
            <Button className="btn-attack-template" size="middle" type="dashed">
              📎 Tải biểu mẫu (Đính kèm tệp) ▾
            </Button>
          </Dropdown>
        </div>

        {/* KHUNG SOẠN THẢO NỘI DUNG (RICH TEXT EDITOR CHỈ HIỂN THỊ ICON TOOLBAR) */}
        <Form.Item
          name="content"
          style={{ marginBottom: 14 }}
        >
          <RichTextEditor
            minHeight={200}
            onChange={(html) => {
              setEditorContent(html);
              form.setFieldsValue({ content: html });
            }}
            placeholder="Nhập nội dung thông báo..."
            value={editorContent}
          />
        </Form.Item>

        {/* PHẦN XEM PREVIEW BIỂU MẪU NẰM NGOÀI KHUNG INPUT NỘI DUNG (NẾU CÓ ĐÍNH KÈM) */}
        {attachedTemplate && (
          <div className="template-outside-preview-section">
            <div className="template-file-strip">
              <div className="file-info-left">
                <span className="file-icon">🌐</span>
                <div>
                  <strong className="file-name">{attachedTemplate.name}</strong>
                  <span className="file-meta">
                    {(attachedTemplate.size / 1024).toFixed(1)} KB · Biểu mẫu đính kèm
                  </span>
                </div>
              </div>

              <Space size={8}>
                <Button
                  onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                  size="small"
                  type="default"
                >
                  {showTemplatePreview ? 'Ẩn Preview biểu mẫu' : '👁 Xem Preview biểu mẫu'}
                </Button>
                <Button
                  danger
                  onClick={handleRemoveAttachedTemplate}
                  size="small"
                  type="link"
                >
                  Gỡ tệp mẫu
                </Button>
              </Space>
            </div>

            {showTemplatePreview && (
              <div className="template-preview-box">
                <div className="preview-box-header">
                  <span>Khung Xem trước Preview Biểu mẫu đính kèm ({attachedTemplate.name})</span>
                </div>
                {attachedTemplate.isHtml ? (
                  <div
                    className="html-preview-render"
                    dangerouslySetInnerHTML={{ __html: attachedTemplate.content }}
                  />
                ) : (
                  <pre className="text-preview-render">{attachedTemplate.content}</pre>
                )}
              </div>
            )}
          </div>
        )}

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
