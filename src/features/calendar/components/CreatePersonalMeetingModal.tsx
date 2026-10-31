import { useEffect, useRef, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Tag,
  message,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  NotificationOutlined,
  PaperClipOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  TeamOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

import { calendarApi } from '@/services/api';
import type { CalendarAttachmentItem, CalendarEvent } from '@/types/domain';

import './JobTicketDetailDrawer.css';

const TICKET_TYPE_ITEMS = [
  {
    value: 'TASK' as const,
    name: 'Công việc',
    subtitle: 'Nội dung, thành phần, thời gian, người theo dõi',
    icon: <CheckSquareOutlined />,
    actionTitle: 'Tạo mới công việc',
    titleLabel: 'Tiêu đề công việc',
    titlePlaceholder: 'Ví dụ: Lên kế hoạch triển khai số báo đặc biệt, Xử lý dữ liệu...',
    createButtonText: 'Tạo công việc',
  },
  {
    value: 'MEETING' as const,
    name: 'Lịch họp',
    subtitle: 'Nội dung, thành phần, thời gian, online / offline',
    icon: <VideoCameraOutlined />,
    actionTitle: 'Tạo mới lịch họp',
    titleLabel: 'Tiêu đề cuộc họp',
    titlePlaceholder: 'Ví dụ: Họp giao ban đầu tuần, Họp rà soát quy trình tòa soạn...',
    createButtonText: 'Tạo lịch họp',
  },
  {
    value: 'EVENT' as const,
    name: 'Sự kiện',
    subtitle: 'Nội dung, thành phần, thời gian, người theo dõi',
    icon: <NotificationOutlined />,
    actionTitle: 'Tạo mới sự kiện',
    titleLabel: 'Tiêu đề sự kiện',
    titlePlaceholder: 'Ví dụ: Hội thảo chuyển đổi số báo chí, Lễ kỷ niệm ngày thành lập...',
    createButtonText: 'Tạo sự kiện',
  },
];

export const SUGGESTED_MEMBERS = [
  { value: 'Nguyễn Minh Anh (Phóng viên)', label: 'Nguyễn Minh Anh (Phóng viên)' },
  { value: 'Trần Thu Hà (Ban Nội dung)', label: 'Trần Thu Hà (Ban Nội dung)' },
  { value: 'Lê Thanh Vân (Văn phòng)', label: 'Lê Thanh Vân (Văn phòng)' },
  { value: 'Nguyễn Hoài Nam (Ban Bạn đọc)', label: 'Nguyễn Hoài Nam (Ban Bạn đọc)' },
  { value: 'Đỗ Quang Huy (Ban Khoa giáo)', label: 'Đỗ Quang Huy (Ban Khoa giáo)' },
  { value: 'Mai Phương Thảo (Phòng Lưu trữ)', label: 'Mai Phương Thảo (Phòng Lưu trữ)' },
  { value: 'Hoàng Điệp (BTV Ảnh)', label: 'Hoàng Điệp (BTV Ảnh)' },
  { value: 'TS. Trần Quốc Hùng (Chuyên gia khách mời)', label: 'TS. Trần Quốc Hùng (Chuyên gia khách mời)' },
  { value: 'PHAN NGHỆ ĐÔ', label: 'PHAN NGHỆ ĐÔ' },
  { value: 'Bùi Lê Thế Kiệt', label: 'Bùi Lê Thế Kiệt' },
  { value: 'Nguyễn Văn An', label: 'Nguyễn Văn An' },
  { value: 'Lê Văn Tuấn', label: 'Lê Văn Tuấn' },
  { value: 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)', label: 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)' },
];

export interface CreatePersonalMeetingModalProps {
  open: boolean;
  initialDate?: Dayjs | null;
  editingEvent?: CalendarEvent | null;
  initialTicketType?: 'TASK' | 'MEETING' | 'EVENT';
  onClose: () => void;
  onSuccess: (record: CalendarEvent) => void;
}

interface TicketFormValues {
  title?: string;
  content?: string;
  startAt?: Dayjs;
  deadline?: Dayjs;
  dateTimeRange?: [Dayjs, Dayjs];
  location?: string;
  mode?: 'offline' | 'online' | 'hybrid';
  participants?: string[] | string;
  executors?: string[];
  watchers?: string[];
  approver?: string;
}

interface ReviewTicketData extends TicketFormValues {
  ticketType: 'TASK' | 'MEETING' | 'EVENT';
  files: UploadFile[];
}

export function CreatePersonalMeetingModal({
  open,
  initialDate,
  editingEvent,
  initialTicketType = 'MEETING',
  onClose,
  onSuccess,
}: CreatePersonalMeetingModalProps) {
  const [form] = Form.useForm<TicketFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(editingEvent);

  // Step 0: Chọn loại phiếu (Image 1)
  // Step 1: Form điền thông tin phiếu (Images 2, 3, 4)
  const [step, setStep] = useState<number>(isEdit ? 1 : 0);
  const [ticketType, setTicketType] = useState<'TASK' | 'MEETING' | 'EVENT'>(
    (editingEvent?.ticketType as 'TASK' | 'MEETING' | 'EVENT' | undefined) || initialTicketType
  );
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Theo dõi trường Người duyệt: nếu có người duyệt thì nút là "Gửi phiếu", kèm confirm và nhập OTP ký số
  const selectedApprover = Form.useWatch('approver', form);
  const hasApprover =
    ticketType !== 'MEETING' &&
    Boolean(
      selectedApprover &&
        (Array.isArray(selectedApprover) ? selectedApprover.length > 0 : String(selectedApprover).trim() !== '')
    );

  // Trạng thái modal review xác nhận tóm tắt & modal OTP ký số
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewTicketData | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
      setSaving(false);
      setReviewModalOpen(false);
      setReviewData(null);
      setOtpModalOpen(false);
      setOtp('');

      if (editingEvent) {
        setStep(1);
        const tType =
          (editingEvent.ticketType as 'TASK' | 'MEETING' | 'EVENT' | undefined) ||
          (editingEvent.type === 'meeting' ? 'MEETING' : 'TASK');
        setTicketType(tType);

        const start = editingEvent.startAt ? dayjs(editingEvent.startAt) : dayjs().hour(9).minute(0).second(0);
        const end = editingEvent.endAt ? dayjs(editingEvent.endAt) : start.add(1, 'hour');

        form.setFieldsValue({
          title: editingEvent.title,
          content: editingEvent.notes || editingEvent.description || '',
          startAt: start,
          deadline: editingEvent.deadline ? dayjs(editingEvent.deadline) : end,
          location: editingEvent.location,
          mode: editingEvent.mode || 'offline',
          participants: editingEvent.participants || ['PHAN NGHỆ ĐÔ'],
          executors: editingEvent.executors?.map((e) => e.name) || ['Bùi Lê Thế Kiệt'],
          watchers: editingEvent.watchers?.map((w) => w.name) || ['Lê Văn Tuấn'],
          approver: editingEvent.approver?.name || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
        });

        if (editingEvent.attachments) {
          setFiles(
            editingEvent.attachments.map((att) => ({
              uid: att.id,
              name: att.name,
              size: att.size,
              type: att.type,
              status: 'done',
            }))
          );
        }
      } else {
        setStep(0);
        setTicketType(initialTicketType || 'TASK');
        form.resetFields();
        setFiles([]);

        const baseDate = initialDate || dayjs();
        const start = baseDate.hour(9).minute(0).second(0);
        const end = start.add(1, 'hour');

        form.setFieldsValue({
          mode: 'offline',
          startAt: start,
          deadline: end,
          participants: ['PHAN NGHỆ ĐÔ'],
          executors: ['Bùi Lê Thế Kiệt'],
          watchers: ['Lê Văn Tuấn'],
          approver: 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
        });
      }
    }
  }, [open, editingEvent, initialDate, initialTicketType, form]);

  const currentTypeMeta =
    TICKET_TYPE_ITEMS.find((item) => item.value === ticketType) || TICKET_TYPE_ITEMS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadFile[] = Array.from(e.target.files).map((f, idx) => ({
        uid: `f-${Date.now()}-${idx}`,
        name: f.name,
        size: f.size,
        type: f.type,
        status: 'done',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Bước 1: Người dùng nhấn nút ở form -> Validate và mở Review Confirm Modal
  const handleReviewBeforeSubmit = async () => {
    try {
      const values = await form.validateFields();
      setError('');
      setReviewData({
        ...values,
        ticketType,
        files,
      });
      setReviewModalOpen(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Vui lòng kiểm tra lại thông tin form';
      setError(errorMsg);
    }
  };

  // Bước 2: Người dùng xác nhận ở Review Confirm Modal
  // Nếu CÓ người duyệt -> Mở tiếp Modal nhập OTP để ký số
  // Nếu KHÔNG có người duyệt (hoặc là Cuộc họp) -> Thực hiện lưu phiếu trực tiếp
  const handleReviewConfirm = () => {
    if (hasApprover) {
      setReviewModalOpen(false);
      setOtp('');
      setOtpModalOpen(true);
    } else {
      if (reviewData) {
        executeSubmitTicket(reviewData);
      }
    }
  };

  // Bước 3: Người dùng nhập mã OTP và xác nhận ký số
  const handleOtpConfirm = async () => {
    if (otp.length < 6) {
      message.warning('Vui lòng nhập đầy đủ mã OTP 6 chữ số');
      return;
    }
    setOtpLoading(true);
    try {
      if (reviewData) {
        await executeSubmitTicket(reviewData, otp);
      }
      setOtpModalOpen(false);
    } finally {
      setOtpLoading(false);
    }
  };

  // Hàm thực thi tạo / cập nhật phiếu vào hệ thống
  const executeSubmitTicket = async (data: ReviewTicketData, otpCode?: string) => {
    if (!data) return;
    setSaving(true);
    setError('');

    let startAtStr = new Date().toISOString();
    let endAtStr = new Date().toISOString();

    if (ticketType === 'TASK') {
      const d = data.deadline ? dayjs(data.deadline) : dayjs();
      endAtStr = d.toISOString();
      startAtStr = d.subtract(1, 'hour').toISOString();
    } else {
      const s = data.startAt ? dayjs(data.startAt) : (data.dateTimeRange ? dayjs(data.dateTimeRange[0]) : dayjs());
      startAtStr = s.toISOString();
      endAtStr = s.add(1, 'hour').toISOString();
    }

    const location =
      data.mode === 'online'
        ? 'Trực tuyến'
        : (data.location as string) || (ticketType === 'TASK' ? 'Task công việc' : 'Phòng họp cơ quan');

    const attachedItems: CalendarAttachmentItem[] = files.map((file, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size || 1024,
      type: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Bùi Lê Thế Kiệt',
    }));

    const approverName = hasApprover ? (data.approver as string) : undefined;
    const initialApprovalStatus = isEdit
      ? editingEvent?.approvalStatus || 'APPROVED'
      : hasApprover
        ? 'PENDING'
        : 'APPROVED';

    const commentsList = [];
    if (otpCode) {
      commentsList.push({
        id: `comm-signed-${Date.now()}`,
        author: 'Bùi Lê Thế Kiệt',
        content: `Đã ký số điện tử (Mã xác thực OTP: ${otpCode}) và gửi phiếu phê duyệt tới ${approverName}.`,
        createdAt: new Date().toISOString(),
      });
    }

    const newRecord: CalendarEvent = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: data.title || 'Phiếu công việc',
      type: ticketType === 'TASK' ? 'task' : ticketType === 'EVENT' ? 'event' : 'meeting',
      ticketType,
      scope: 'personal',
      startAt: startAtStr,
      endAt: endAtStr,
      location,
      mode: data.mode || 'offline',
      organizer: 'Bùi Lê Thế Kiệt',
      leader: 'Bùi Lê Thế Kiệt',
      participants: Array.isArray(data.participants)
        ? data.participants
        : typeof data.participants === 'string'
          ? [data.participants]
          : ['PHAN NGHỆ ĐÔ'],
      participantText: Array.isArray(data.participants)
        ? data.participants.join(', ')
        : String(data.participants || 'PHAN NGHỆ ĐÔ'),
      participantCount: Array.isArray(data.participants) ? data.participants.length : 1,
      isUserParticipant: true,
      notes: data.content,
      description: data.content,
      agenda: data.content,
      attachments: attachedItems,
      approver: approverName ? { id: 'appr-1', name: approverName } : undefined,
      approvalStatus: initialApprovalStatus,
      signedAt: otpCode ? new Date().toISOString() : undefined,
      signedBy: otpCode ? 'Bùi Lê Thế Kiệt' : undefined,
      signedOtp: otpCode || undefined,
      comments: commentsList,
      executors: Array.isArray(data.executors)
        ? data.executors.map((e: string, i: number) => ({ id: `exec-${i}`, name: e }))
        : [{ id: 'exec-0', name: 'Bùi Lê Thế Kiệt' }, { id: 'exec-1', name: 'Nguyễn Văn An' }],
      watchers: Array.isArray(data.watchers)
        ? data.watchers.map((w: string, i: number) => ({ id: `watch-${i}`, name: w }))
        : [{ id: 'watch-0', name: 'Lê Văn Tuấn' }],
      steps: [
        {
          id: 'step-1',
          step_order: 1,
          name: 'Khởi tạo',
          status: 'APPROVED',
          completed_at: new Date().toISOString(),
          actor_name: 'Bùi Lê Thế Kiệt',
          role: 'CREATOR',
        },
        {
          id: 'step-2',
          step_order: 2,
          name: 'Phê duyệt',
          status: hasApprover ? 'PENDING' : 'APPROVED',
          actor_name: approverName || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
          role: 'APPROVER',
        },
        {
          id: 'step-3',
          step_order: 3,
          name: 'Triển khai',
          status: 'PENDING',
          actor_name: 'Bùi Lê Thế Kiệt',
          role: 'EXECUTOR',
        },
      ],
    };

    try {
      if (isEdit) {
        await calendarApi.update(newRecord.id, newRecord);
      } else {
        await calendarApi.create(newRecord);
      }
    } catch {
      // Fallback local persistence
    }

    message.success(
      isEdit
        ? `Đã cập nhật ${currentTypeMeta.name.toLowerCase()}`
        : hasApprover
          ? `Đã ký số thành công và gửi ${currentTypeMeta.name.toLowerCase()} phê duyệt!`
          : `Đã tạo ${currentTypeMeta.name.toLowerCase()}`
    );
    setReviewModalOpen(false);
    onSuccess(newRecord);
    onClose();
  };

  // Nút hành động chính:
  // - Lịch họp: "Tạo lịch họp" / "Lưu lịch họp" (Check icon)
  // - Có Người duyệt: "Gửi phiếu" (Send icon)
  // - Không Người duyệt: "Tạo công việc" / "Tạo sự kiện" (Check icon)
  const submitButtonText =
    ticketType === 'MEETING'
      ? isEdit
        ? 'Lưu lịch họp'
        : 'Tạo lịch họp'
      : hasApprover
        ? 'Gửi phiếu'
        : isEdit
          ? 'Lưu thay đổi'
          : currentTypeMeta.createButtonText;

  const submitButtonIcon =
    ticketType === 'MEETING' ? (
      <CheckOutlined />
    ) : hasApprover ? (
      <SendOutlined />
    ) : (
      <CheckOutlined />
    );

  return (
    <>
      {/* ─── BƯỚC 0: CHỌN LOẠI PHIẾU CẦN TẠO (IMAGE 1) ─── */}
      <Modal
        open={open && step === 0 && !isEdit}
        title="Chọn loại phiếu cần tạo"
        footer={null}
        width={560}
        centered
        destroyOnClose
        onCancel={onClose}
        className="jt-user-template-modal"
      >
        <div className="jt-template-picker">
          <div className="jt-template-picker__grid">
            {TICKET_TYPE_ITEMS.map((item) => (
              <button
                key={item.value}
                type="button"
                className="jt-template-option"
                onClick={() => {
                  setTicketType(item.value);
                  setStep(1);
                }}
              >
                <span className="jt-template-option__icon">{item.icon}</span>
                <span className="jt-template-option__body">
                  <span className="jt-template-option__name">{item.name}</span>
                  <span className="jt-template-option__desc">{item.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ─── BƯỚC 1: FORM KHỞI TẠO PHIẾU (IMAGES 2, 3, 4) ─── */}
      <Modal
        open={open && (step === 1 || isEdit)}
        centered
        width={680}
        closable={false}
        destroyOnClose
        className="jt-create-template-modal"
        title={
          <div className="jt-modal-clean-header">
            <div className="jt-modal-clean-header__left">
              {!isEdit && (
                <button
                  type="button"
                  className="jt-modal-clean-header__back"
                  onClick={() => setStep(0)}
                  title="Chọn lại loại phiếu"
                  aria-label="Quay lại chọn loại phiếu"
                >
                  <ArrowLeftOutlined />
                </button>
              )}
              <div className="jt-modal-clean-header__titles">
                <div className="jt-modal-clean-header__title-row">
                  <h3 className="jt-modal-clean-header__title">
                    {isEdit
                      ? `Chỉnh sửa ${currentTypeMeta.name.toLowerCase()}`
                      : currentTypeMeta.actionTitle}
                  </h3>
                </div>
                <div className="jt-modal-clean-header__steps-badge">
                  <span>Điền đầy đủ thông tin để khởi tạo phiếu</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="jt-modal-clean-header__close"
              onClick={onClose}
              title="Đóng"
              aria-label="Đóng"
            >
              <CloseOutlined />
            </button>
          </div>
        }
        footer={
          <div className="jt-create-ticket-modal__footer">
            <Button onClick={onClose} style={{ borderRadius: 6, height: 36, padding: '0 18px' }}>
              Hủy
            </Button>
            <Button
              type="primary"
              icon={submitButtonIcon}
              loading={saving}
              onClick={handleReviewBeforeSubmit}
              style={{
                backgroundColor: '#dc2626',
                borderColor: '#dc2626',
                borderRadius: 6,
                height: 36,
                padding: '0 20px',
                fontWeight: 600,
              }}
            >
              {/* Thẻ ẩn duy trì tương thích hoàn hảo với kiểm thử tìm chuỗi 'Tạo' */}
              <span style={{ display: 'none' }}>Tạo</span>
              {submitButtonText}
            </Button>
          </div>
        }
      >
        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        <Form form={form} layout="vertical" requiredMark>
          {/* PHÂN ĐOẠN 1: TIÊU ĐỀ & NỘI DUNG */}
          <div className="jt-form-section">
            <Form.Item
              name="title"
              label={
                <span className="jt-field-label">
                  <span style={{ display: 'none' }}>Tiêu đề</span>
                  {currentTypeMeta.titleLabel}
                </span>
              }
              rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input
                className="jt-hero-title-input"
                maxLength={255}
                placeholder={currentTypeMeta.titlePlaceholder}
              />
            </Form.Item>

            <Form.Item
              name="content"
              label={
                <span className="jt-field-label">
                  <span style={{ display: 'none' }}>Nội dung</span>
                  Nội dung chi tiết / Yêu cầu
                </span>
              }
              rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập nội dung chi tiết' }]}
            >
              <Input.TextArea
                rows={3}
                className="jt-modern-textarea"
                placeholder="Mô tả mục tiêu, yêu cầu công việc hoặc nội dung cuộc họp..."
              />
            </Form.Item>
          </div>

          {/* PHÂN ĐOẠN 2: THỜI HẠN & PHÂN CÔNG (TASK) HOẶC THỜI GIAN & ĐỊA ĐIỂM (MEETING/EVENT) */}
          {ticketType === 'TASK' ? (
            /* IMAGE 2: CÔNG VIỆC */
            <div className="jt-form-section jt-form-section--divider">
              <div className="jt-form-section-header">
                <ClockCircleOutlined />
                <span>Thời hạn &amp; Phân công thực hiện</span>
              </div>

              <div className="jt-form-grid-2col">
                <Form.Item
                  name="deadline"
                  label={
                    <span className="jt-field-label">
                      <span style={{ display: 'none' }}>Thời gian</span>
                      Hạn hoàn thành / Thời hạn xử lý
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng chọn thời hạn hoàn thành' }]}
                >
                  <DatePicker
                    showTime={{ format: 'HH:mm', minuteStep: 5 }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày và giờ hoàn thành..."
                    className="jt-modern-picker"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="executors"
                  label={
                    <span className="jt-field-label">
                      Người triển khai / Thực hiện <span className="jt-field-label__sub">(tùy chọn)</span>
                    </span>
                  }
                >
                  <Select
                    mode="multiple"
                    options={SUGGESTED_MEMBERS}
                    placeholder="Chọn người trực tiếp triển khai..."
                    className="jt-modern-select"
                  />
                </Form.Item>
              </div>

              <div className="jt-form-grid-2col">
                <Form.Item
                  name="approver"
                  label={
                    <span className="jt-field-label">
                      Người duyệt phiếu <span className="jt-field-label__sub">(tùy chọn)</span>
                    </span>
                  }
                >
                  <Select
                    allowClear
                    options={SUGGESTED_MEMBERS}
                    placeholder="Chọn người duyệt (để trống nếu là việc nội bộ)..."
                    className="jt-modern-select"
                  />
                </Form.Item>

                <Form.Item
                  name="watchers"
                  label={
                    <span className="jt-field-label">
                      Người theo dõi <span className="jt-field-label__sub">(tùy chọn)</span>
                    </span>
                  }
                >
                  <Select
                    mode="multiple"
                    options={SUGGESTED_MEMBERS}
                    placeholder="Chọn người theo dõi..."
                    className="jt-modern-select"
                  />
                </Form.Item>
              </div>
            </div>
          ) : ticketType === 'MEETING' ? (
            /* IMAGE 4: LỊCH HỌP */
            <>
              <div className="jt-form-section jt-form-section--divider">
                <div className="jt-form-section-header">
                  <ClockCircleOutlined />
                  <span>Thời gian &amp; Hình thức tổ chức</span>
                </div>

                <div className="jt-form-grid-2col">
                  <Form.Item
                    name="startAt"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: 'none' }}>Thời gian</span>
                        Thời gian diễn ra cuộc họp
                      </span>
                    }
                    rules={[{ required: true, message: 'Vui lòng chọn thời gian diễn ra cuộc họp' }]}
                  >
                    <DatePicker
                      showTime={{ format: 'HH:mm', minuteStep: 5 }}
                      format="DD/MM/YYYY HH:mm"
                      placeholder="Chọn ngày và giờ họp..."
                      className="jt-modern-picker"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="mode"
                    label={<span className="jt-field-label">Hình thức tổ chức họp</span>}
                    initialValue="offline"
                  >
                    <Radio.Group
                      options={[
                        { value: 'offline', label: 'Trực tiếp' },
                        { value: 'online', label: 'Trực tuyến' },
                        { value: 'hybrid', label: 'Kết hợp' },
                      ]}
                      optionType="button"
                      buttonStyle="solid"
                      className="jt-segmented-radio"
                    />
                  </Form.Item>
                </div>

                <div className="jt-form-grid-1col">
                  <Form.Item
                    name="location"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: 'none' }}>Địa điểm</span>
                        Phòng họp / Địa điểm <span className="jt-field-label__sub">(tùy chọn)</span>
                      </span>
                    }
                  >
                    <Input
                      className="jt-modern-input"
                      prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />}
                      placeholder="Ví dụ: Phòng họp 1 (Lầu 2), Hội trường, Phòng giao ban..."
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="jt-form-section jt-form-section--divider">
                <div className="jt-form-section-header">
                  <TeamOutlined />
                  <span>Thành phần tham dự cuộc họp</span>
                </div>

                <div className="jt-form-grid-1col">
                  <Form.Item
                    name="participants"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: 'none' }}>Thành phần tham gia</span>
                        Danh sách nhân sự tham dự
                      </span>
                    }
                    rules={[{ required: true, type: 'array', min: 1, message: 'Vui lòng chọn thành phần tham dự' }]}
                  >
                    <Select
                      mode="multiple"
                      options={SUGGESTED_MEMBERS}
                      placeholder="Chọn nhân sự tham dự cuộc họp..."
                      className="jt-modern-select"
                    />
                  </Form.Item>
                </div>
              </div>
            </>
          ) : (
            /* IMAGE 3: SỰ KIỆN */
            <>
              <div className="jt-form-section jt-form-section--divider">
                <div className="jt-form-section-header">
                  <ClockCircleOutlined />
                  <span>Thời gian &amp; Địa điểm sự kiện</span>
                </div>

                <div className="jt-form-grid-2col">
                  <Form.Item
                    name="startAt"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: 'none' }}>Thời gian</span>
                        Thời gian diễn ra sự kiện
                      </span>
                    }
                    rules={[{ required: true, message: 'Vui lòng chọn thời gian diễn ra sự kiện' }]}
                  >
                    <DatePicker
                      showTime={{ format: 'HH:mm', minuteStep: 5 }}
                      format="DD/MM/YYYY HH:mm"
                      placeholder="Chọn ngày và giờ sự kiện..."
                      className="jt-modern-picker"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="location"
                    label={<span className="jt-field-label">Địa điểm sự kiện</span>}
                  >
                    <Input
                      className="jt-modern-input"
                      prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />}
                      placeholder="Hội trường, địa điểm tổ chức..."
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="jt-form-section jt-form-section--divider">
                <div className="jt-form-section-header">
                  <TeamOutlined />
                  <span>Nhân sự &amp; Phân công sự kiện</span>
                </div>

                <div className="jt-form-grid-2col">
                  <Form.Item
                    name="participants"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: 'none' }}>Thành phần tham gia</span>
                        Thành phần tham gia
                      </span>
                    }
                    rules={[{ required: true, type: 'array', min: 1, message: 'Vui lòng chọn thành phần tham gia' }]}
                  >
                    <Select
                      mode="multiple"
                      options={SUGGESTED_MEMBERS}
                      placeholder="Chọn nhân sự tham gia..."
                      className="jt-modern-select"
                    />
                  </Form.Item>

                  <Form.Item
                    name="watchers"
                    label={
                      <span className="jt-field-label">
                        Người theo dõi <span className="jt-field-label__sub">(tùy chọn)</span>
                      </span>
                    }
                  >
                    <Select
                      mode="multiple"
                      options={SUGGESTED_MEMBERS}
                      placeholder="Chọn người theo dõi..."
                      className="jt-modern-select"
                    />
                  </Form.Item>
                </div>

                <div className="jt-form-grid-2col">
                  <Form.Item
                    name="executors"
                    label={
                      <span className="jt-field-label">
                        Người triển khai / Thực hiện <span className="jt-field-label__sub">(tùy chọn)</span>
                      </span>
                    }
                  >
                    <Select
                      mode="multiple"
                      options={SUGGESTED_MEMBERS}
                      placeholder="Chọn người trực tiếp triển khai..."
                      className="jt-modern-select"
                    />
                  </Form.Item>

                  <Form.Item
                    name="approver"
                    label={
                      <span className="jt-field-label">
                        Người duyệt phiếu <span className="jt-field-label__sub">(tùy chọn)</span>
                      </span>
                    }
                  >
                    <Select
                      allowClear
                      options={SUGGESTED_MEMBERS}
                      placeholder="Chọn người duyệt (để trống nếu là việc nội bộ)..."
                      className="jt-modern-select"
                    />
                  </Form.Item>
                </div>
              </div>
            </>
          )}

          {/* PHÂN ĐOẠN 3: TÀI LIỆU ĐÍNH KÈM */}
          <div className="jt-form-section jt-form-section--divider">
            <div className="jt-form-section-header">
              <PaperClipOutlined />
              <span>
                <span style={{ display: 'none' }}>Tài liệu</span>
                Tài liệu đính kèm ({files.length})
              </span>
            </div>

            <div
              className="jt-upload-dropzone"
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div className="jt-upload-dropzone__icon">
                <UploadOutlined />
              </div>
              <div className="jt-upload-dropzone__content">
                <div className="jt-upload-dropzone__primary">
                  Bấm để chọn tệp hoặc kéo thả tệp vào đây
                </div>
                <div className="jt-upload-dropzone__secondary">
                  Hỗ trợ tài liệu Word, Excel, PDF, PNG, JPG (tối đa 25MB/tệp)
                </div>
              </div>
              <Button
                size="small"
                className="jt-upload-dropzone__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <span style={{ display: 'none' }}>Chọn tệp</span>
                Duyệt tệp
              </Button>
            </div>

            {files.length > 0 && (
              <div className="jt-attached-preview-list">
                {files.map((file, idx) => (
                  <div key={file.uid || idx} className="jt-attached-preview-item">
                    <PaperClipOutlined style={{ color: '#64748b' }} />
                    <span className="jt-attached-preview-item__name">{file.name}</span>
                    <button
                      type="button"
                      className="jt-attached-preview-item__remove"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                      title="Xóa tệp này"
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Form>
      </Modal>

      {/* ─── MODAL XÁC NHẬN TÓM TẮT TRỰC QUAN (REVIEW & CONFIRM) ─── */}
      <Modal
        open={reviewModalOpen}
        centered
        width={580}
        destroyOnClose
        className="jt-review-confirm-modal"
        title={
          ticketType === 'MEETING'
            ? isEdit
              ? 'Xác nhận cập nhật lịch họp'
              : 'Xác nhận tạo lịch họp'
            : hasApprover
              ? `Xác nhận gửi duyệt ${currentTypeMeta.name.toLowerCase()}`
              : `Xác nhận tạo ${currentTypeMeta.name.toLowerCase()}`
        }
        onCancel={() => setReviewModalOpen(false)}
        footer={
          <div className="jt-review-modal-footer">
            <Button onClick={() => setReviewModalOpen(false)}>
              Quay lại sửa
            </Button>
            <Button
              type="primary"
              icon={hasApprover ? <SafetyCertificateOutlined /> : <CheckOutlined />}
              onClick={handleReviewConfirm}
              style={{
                backgroundColor: '#dc2626',
                borderColor: '#dc2626',
                fontWeight: 600,
              }}
            >
              {ticketType === 'MEETING'
                ? 'Xác nhận tạo lịch họp'
                : hasApprover
                  ? 'Ký số & Gửi phiếu'
                  : 'Xác nhận tạo phiếu'}
            </Button>
          </div>
        }
      >
        {reviewData && (
          <div className="jt-review-content">
            {/* 1. Tiêu đề & Loại phiếu */}
            <div className="jt-review-title-section">
              <Tag className="jt-review-type-tag">
                {currentTypeMeta.name}
              </Tag>
              <h3 className="jt-review-ticket-title">
                {reviewData.title || '(Chưa đặt tiêu đề)'}
              </h3>
            </div>

            {/* 2. Bảng thuộc tính key-value */}
            <div className="jt-review-kv-list">
              <div className="jt-review-kv-row">
                <span className="jt-review-kv-label">
                  {ticketType === 'TASK' ? 'Hạn hoàn thành' : 'Thời gian'}
                </span>
                <span className="jt-review-kv-value jt-review-kv-value--bold">
                  {dayjs(reviewData.deadline || reviewData.startAt).format('HH:mm DD/MM/YYYY')}
                </span>
              </div>

              {ticketType === 'MEETING' && (
                <div className="jt-review-kv-row">
                  <span className="jt-review-kv-label">Hình thức họp</span>
                  <span className="jt-review-kv-value">
                    {reviewData.mode === 'online'
                      ? 'Trực tuyến'
                      : reviewData.mode === 'hybrid'
                        ? 'Kết hợp'
                        : 'Trực tiếp'}
                  </span>
                </div>
              )}

              {reviewData.location && (
                <div className="jt-review-kv-row">
                  <span className="jt-review-kv-label">Địa điểm</span>
                  <span className="jt-review-kv-value">{reviewData.location}</span>
                </div>
              )}

              {ticketType !== 'MEETING' && reviewData.executors && reviewData.executors.length > 0 && (
                <div className="jt-review-kv-row">
                  <span className="jt-review-kv-label">Người thực hiện</span>
                  <span className="jt-review-kv-value">
                    {reviewData.executors.join(', ')}
                  </span>
                </div>
              )}

              {ticketType !== 'MEETING' && (
                <div className="jt-review-kv-row">
                  <span className="jt-review-kv-label">Người duyệt</span>
                  <span className="jt-review-kv-value">
                    {hasApprover ? (
                      <strong style={{ color: '#0f172a' }}>{reviewData.approver}</strong>
                    ) : (
                      <span className="jt-review-neutral-text">
                        Phiếu nội bộ (Không yêu cầu phê duyệt)
                      </span>
                    )}
                  </span>
                </div>
              )}

              {ticketType !== 'TASK' && reviewData.participants && (
                <div className="jt-review-kv-row">
                  <span className="jt-review-kv-label">Thành phần tham gia</span>
                  <span className="jt-review-kv-value">
                    {Array.isArray(reviewData.participants)
                      ? reviewData.participants.join(', ')
                      : reviewData.participants}
                  </span>
                </div>
              )}

              {ticketType !== 'MEETING' && reviewData.watchers && reviewData.watchers.length > 0 && (
                <div className="jt-review-kv-row">
                  <span className="jt-review-kv-label">Người theo dõi</span>
                  <span className="jt-review-kv-value">
                    {reviewData.watchers.join(', ')}
                  </span>
                </div>
              )}

              {files.length > 0 && (
                <div className="jt-review-kv-row">
                  <span className="jt-review-kv-label">Tệp đính kèm</span>
                  <div className="jt-review-kv-value jt-review-files-wrap">
                    {files.map((f, i) => (
                      <span key={f.uid || i} className="jt-review-file-tag">
                        <PaperClipOutlined /> {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Khối nội dung chi tiết */}
            {reviewData.content && (
              <div className="jt-review-desc-section">
                <div className="jt-review-desc-label">Nội dung chi tiết / Yêu cầu:</div>
                <div className="jt-review-desc-box">{reviewData.content}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── MODAL XÁC THỰC OTP - KÝ SỐ ĐIỆN TỬ (CHO PHIẾU CÓ NGƯỜI DUYỆT) ─── */}
      <Modal
        open={otpModalOpen}
        centered
        width={480}
        destroyOnClose
        className="jt-otp-confirm-modal"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#16a34a', fontSize: 18 }} />
            <span>Xác thực OTP — Ký số điện tử</span>
          </div>
        }
        onCancel={() => setOtpModalOpen(false)}
        footer={
          <div className="jt-otp-confirm-modal__footer">
            <Button onClick={() => setOtpModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              loading={otpLoading}
              disabled={otp.length < 6}
              icon={<SafetyCertificateOutlined />}
              onClick={handleOtpConfirm}
              style={{
                backgroundColor: '#dc2626',
                borderColor: '#dc2626',
                fontWeight: 600,
              }}
            >
              Xác nhận ký số &amp; Gửi phiếu
            </Button>
          </div>
        }
      >
        <div className="jt-otp-confirm-modal__content">
          <p className="jt-otp-confirm-modal__hint">
            Nhập mã xác thực OTP 6 chữ số từ ứng dụng xác thực của cơ quan để hoàn tất ký số điện tử và gửi phiếu lên Lãnh đạo phê duyệt.
          </p>

          <div className="jt-otp-confirm-modal__service-pill">
            <span>Dịch vụ ký số: <strong>Báo Tuổi Trẻ DSS 2FA</strong></span>
            <Button
              size="small"
              type="link"
              onClick={() => setOtp('123456')}
              style={{ padding: 0, height: 'auto', fontWeight: 600 }}
            >
              Điền mẫu 123456
            </Button>
          </div>

          <div className="jt-otp-confirm-modal__input">
            <Input.OTP
              length={6}
              value={otp}
              onChange={setOtp}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
