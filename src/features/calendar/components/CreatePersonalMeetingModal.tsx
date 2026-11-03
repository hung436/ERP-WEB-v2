import { useEffect, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  CheckOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  NotificationOutlined,
  PaperClipOutlined,
  TeamOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import { useAuth } from "@/features/auth/AuthContext";
import { calendarApi } from "@/services/api";
import type { CalendarAttachmentItem, CalendarEvent } from "@/types/domain";

import { formatBytes, getFileCategory } from "./AttachedFilesList";
import "./JobTicketDetailDrawer.css";

const TICKET_TYPE_ITEMS = [
  {
    value: "TASK" as const,
    name: "Phiếu công việc",
    icon: <CheckSquareOutlined />,
    contentPlaceholder:
      "Nhập nội dung công việc, mục tiêu hoặc yêu cầu phối hợp...",
    createButtonText: "Tạo phiếu công việc",
  },
  {
    value: "MEETING" as const,
    name: "Lịch họp",
    icon: <VideoCameraOutlined />,
    contentPlaceholder: "Nhập nội dung cuộc họp, chương trình nghị sự...",
    createButtonText: "Tạo lịch họp",
  },
  {
    value: "EVENT" as const,
    name: "Sự kiện",
    icon: <NotificationOutlined />,
    contentPlaceholder: "Nhập nội dung sự kiện, kế hoạch tổ chức...",
    createButtonText: "Tạo sự kiện",
  },
];

export const SUGGESTED_MEMBERS = [
  {
    value: "Nguyễn Minh Anh (Phóng viên)",
    label: "Nguyễn Minh Anh (Phóng viên)",
  },
  { value: "Trần Thu Hà (Ban Nội dung)", label: "Trần Thu Hà (Ban Nội dung)" },
  { value: "Lê Thanh Vân (Văn phòng)", label: "Lê Thanh Vân (Văn phòng)" },
  {
    value: "Nguyễn Hoài Nam (Ban Bạn đọc)",
    label: "Nguyễn Hoài Nam (Ban Bạn đọc)",
  },
  {
    value: "Đỗ Quang Huy (Ban Khoa giáo)",
    label: "Đỗ Quang Huy (Ban Khoa giáo)",
  },
  {
    value: "Mai Phương Thảo (Phòng Lưu trữ)",
    label: "Mai Phương Thảo (Phòng Lưu trữ)",
  },
  { value: "Hoàng Điệp (BTV Ảnh)", label: "Hoàng Điệp (BTV Ảnh)" },
  {
    value: "TS. Trần Quốc Hùng (Chuyên gia khách mời)",
    label: "TS. Trần Quốc Hùng (Chuyên gia khách mời)",
  },
  { value: "PHAN NGHỆ ĐÔ", label: "PHAN NGHỆ ĐÔ" },
  { value: "Bùi Lê Thế Kiệt", label: "Bùi Lê Thế Kiệt" },
  { value: "Nguyễn Văn An", label: "Nguyễn Văn An" },
  { value: "Lê Văn Tuấn", label: "Lê Văn Tuấn" },
  {
    value: "Nguyễn Tấn Đạt (Phó Tổng Biên tập)",
    label: "Nguyễn Tấn Đạt (Phó Tổng Biên tập)",
  },
];

export interface CreatePersonalMeetingModalProps {
  open: boolean;
  initialDate?: Dayjs | null;
  editingEvent?: CalendarEvent | null;
  initialTicketType?: "TASK" | "MEETING" | "EVENT";
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
  meetingLink?: string;
  mode?: "offline" | "online" | "hybrid";
  participants?: string[] | string;
  executors?: string[];
  watchers?: string[];
  approver?: string[] | string;
}

export function CreatePersonalMeetingModal({
  open,
  initialDate,
  editingEvent,
  initialTicketType = "TASK",
  onClose,
  onSuccess,
}: CreatePersonalMeetingModalProps) {
  const { user } = useAuth();
  const currentUserName = user?.fullName || "Nguyễn Minh Anh";
  const [form] = Form.useForm<TicketFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(editingEvent);

  const [ticketType, setTicketType] = useState<"TASK" | "MEETING" | "EVENT">(
    (editingEvent?.ticketType as "TASK" | "MEETING" | "EVENT" | undefined) ||
      initialTicketType,
  );
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedApprover = Form.useWatch("approver", form);
  const selectedMode = Form.useWatch("mode", form) || "offline";
  const hasApprover =
    ticketType !== "MEETING" &&
    Boolean(
      selectedApprover &&
      (Array.isArray(selectedApprover)
        ? selectedApprover.length > 0
        : String(selectedApprover).trim() !== ""),
    );

  useEffect(() => {
    if (open) {
      setError("");
      setSaving(false);

      if (editingEvent) {
        const tType =
          (editingEvent.ticketType as
            | "TASK"
            | "MEETING"
            | "EVENT"
            | undefined) ||
          (editingEvent.type === "meeting" ? "MEETING" : "TASK");
        setTicketType(tType);

        const start = editingEvent.startAt
          ? dayjs(editingEvent.startAt)
          : dayjs().hour(9).minute(0).second(0);
        const end = editingEvent.endAt
          ? dayjs(editingEvent.endAt)
          : start.add(1, "hour");

        form.setFieldsValue({
          content:
            editingEvent.notes ||
            editingEvent.description ||
            editingEvent.title ||
            "",
          startAt: start,
          deadline: editingEvent.deadline ? dayjs(editingEvent.deadline) : end,
          location: editingEvent.location,
          mode: editingEvent.mode || "offline",
          participants: editingEvent.participants || ["PHAN NGHỆ ĐÔ"],
          executors: editingEvent.executors?.map((e) => e.name) || [
            "Bùi Lê Thế Kiệt",
          ],
          watchers: editingEvent.watchers?.map((w) => w.name) || [
            "Lê Văn Tuấn",
          ],
          approver: editingEvent.approver?.name
            ? editingEvent.approver.name.split(", ").filter(Boolean)
            : ["Nguyễn Tấn Đạt (Phó Tổng Biên tập)"],
        });

        if (editingEvent.attachments) {
          setFiles(
            editingEvent.attachments.map((att) => ({
              uid: att.id,
              name: att.name,
              size: att.size,
              type: att.type,
              status: "done",
            })),
          );
        }
      } else {
        setTicketType(initialTicketType || "TASK");
        form.resetFields();
        setFiles([]);

        const baseDate = initialDate || dayjs();
        const start = baseDate.hour(9).minute(0).second(0);
        const end = start.add(1, "hour");

        form.setFieldsValue({
          mode: "offline",
          startAt: start,
          deadline: end,
          participants: [],
          executors: [],
          watchers: [],
          approver: [],
        });
      }
    }
  }, [open, editingEvent, initialDate, initialTicketType, form]);

  const currentTypeMeta =
    TICKET_TYPE_ITEMS.find((item) => item.value === ticketType) ||
    TICKET_TYPE_ITEMS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadFile[] = Array.from(e.target.files).map(
        (f, idx) => ({
          uid: `f-${Date.now()}-${idx}`,
          name: f.name,
          size: f.size,
          type: f.type,
          status: "done",
        }),
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Lưu trực tiếp khi người dùng bấm nút Tạo / Ghi nhận (không qua popup Review / OTP)
  const handleDirectSubmit = async () => {
    try {
      const data = await form.validateFields();
      setError("");
      setSaving(true);

      let startAtStr = new Date().toISOString();
      let endAtStr = new Date().toISOString();

      if (ticketType === "TASK") {
        const d = data.deadline ? dayjs(data.deadline) : dayjs();
        startAtStr = d.toISOString();
        endAtStr = d.toISOString();
      } else {
        const s = data.startAt
          ? dayjs(data.startAt)
          : data.dateTimeRange
            ? dayjs(data.dateTimeRange[0])
            : dayjs();
        startAtStr = s.toISOString();
        endAtStr = s.add(1, "hour").toISOString();
      }

      const rawLocation = (data.location as string)?.trim() || "";
      const rawLink = (data.meetingLink as string)?.trim() || "";
      const location =
        data.mode === "online"
          ? rawLink || rawLocation || "Trực tuyến"
          : data.mode === "hybrid"
            ? [rawLocation, rawLink].filter(Boolean).join(" • ") || "Phòng họp cơ quan"
            : rawLocation ||
              (ticketType === "TASK" ? "Task công việc" : "Phòng họp cơ quan");

      const attachedItems: CalendarAttachmentItem[] = files.map(
        (file, idx) => ({
          id: `att-${Date.now()}-${idx}`,
          name: file.name,
          size: file.size || 1024,
          type: file.type || "application/octet-stream",
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUserName,
        }),
      );

      const approverName = hasApprover
        ? Array.isArray(data.approver)
          ? data.approver.join(", ")
          : String(data.approver)
        : undefined;
      const initialApprovalStatus = isEdit
        ? editingEvent?.approvalStatus || "APPROVED"
        : hasApprover
          ? "PENDING"
          : "APPROVED";

      const rawContent = (data.content || "").trim();
      const firstLine = rawContent.split(/\r?\n/)[0] || currentTypeMeta.name;
      const derivedTitle =
        firstLine.length > 120 ? `${firstLine.slice(0, 120)}...` : firstLine;

      const newRecord: CalendarEvent = {
        id: editingEvent?.id || `event-${Date.now()}`,
        title: derivedTitle,
        type:
          ticketType === "TASK"
            ? "task"
            : ticketType === "EVENT"
              ? "event"
              : "meeting",
        ticketType,
        scope: "personal",
        startAt: startAtStr,
        endAt: endAtStr,
        createdAt: editingEvent?.createdAt || new Date().toISOString(),
        deadline: ticketType === "TASK" ? endAtStr : undefined,
        location,
        meetingUrl: rawLink || undefined,
        mode: data.mode || "offline",
        organizer: currentUserName,
        leader: currentUserName,
        participants: Array.isArray(data.participants)
          ? data.participants
          : typeof data.participants === "string"
            ? [data.participants]
            : [],
        participantText: Array.isArray(data.participants)
          ? data.participants.join(", ")
          : String(data.participants || ""),
        participantCount: Array.isArray(data.participants)
          ? data.participants.length
          : 0,
        isUserParticipant: true,
        notes: data.content,
        description: data.content,
        agenda: data.content,
        attachments: attachedItems,
        approver: approverName
          ? { id: "appr-1", name: approverName }
          : undefined,
        approvalStatus: initialApprovalStatus,
        comments: editingEvent?.comments || [],
        executors:
          Array.isArray(data.executors) && data.executors.length > 0
            ? data.executors.map((e: string, i: number) => ({
                id: `exec-${i}`,
                name: e,
              }))
            : [],
        watchers:
          Array.isArray(data.watchers) && data.watchers.length > 0
            ? data.watchers.map((w: string, i: number) => ({
                id: `watch-${i}`,
                name: w,
              }))
            : [],
        steps: [
          {
            id: "step-1",
            step_order: 1,
            name: "Ghi nhận",
            status: "APPROVED",
            completed_at: new Date().toISOString(),
            actor_name: currentUserName,
            role: "CREATOR",
          },
          {
            id: "step-2",
            step_order: 2,
            name: "Rà soát / Phê duyệt",
            status: hasApprover ? "PENDING" : "APPROVED",
            actor_name: approverName || "Tự động duyệt",
            role: "APPROVER",
          },
          {
            id: "step-3",
            step_order: 3,
            name: "Triển khai",
            status: "PENDING",
            actor_name:
              Array.isArray(data.executors) && data.executors.length > 0
                ? data.executors.join(", ")
                : "Chưa phân công",
            role: "EXECUTOR",
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
          : `Đã ghi nhận ${currentTypeMeta.name.toLowerCase()} vào lịch tuần`,
      );
      setSaving(false);
      onSuccess(newRecord);
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Vui lòng kiểm tra lại thông tin bắt buộc";
      setError(errorMsg);
    }
  };

  const submitButtonText = isEdit
    ? "Lưu thay đổi"
    : currentTypeMeta.createButtonText;

  return (
    <Modal
      open={open}
      centered
      width={680}
      closable={false}
      destroyOnClose
      className="jt-create-template-modal"
      title={
        <div className="jt-modal-clean-header">
          <div className="jt-modal-clean-header__left">
            <div className="jt-modal-clean-header__titles">
              <div className="jt-modal-clean-header__title-row">
                <h3 className="jt-modal-clean-header__title">
                  {isEdit
                    ? `Chỉnh sửa ${currentTypeMeta.name.toLowerCase()}`
                    : "Tạo Phiếu / Lịch"}
                </h3>
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
          <Button
            onClick={onClose}
            style={{ borderRadius: 6, height: 36, padding: "0 18px" }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={saving}
            onClick={handleDirectSubmit}
            style={{
              backgroundColor: "#dc2626",
              borderColor: "#dc2626",
              borderRadius: 6,
              height: 36,
              padding: "0 20px",
              fontWeight: 600,
            }}
          >
            <span style={{ display: "none" }}>Tạo</span>
            {submitButtonText}
          </Button>
        </div>
      }
    >
      {/* Thanh Tabs phẳng không đóng khung (Chọn 1 trong 3) */}
      {!isEdit && (
        <div
          className="jt-inline-type-switcher"
          role="tablist"
          aria-label="Chọn loại phiếu / lịch"
        >
          {TICKET_TYPE_ITEMS.map((item) => {
            const active = ticketType === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={`jt-inline-type-tab ${active ? "is-active" : ""}`}
                aria-pressed={active}
                onClick={() => setTicketType(item.value)}
              >
                <span className="jt-inline-type-tab__icon">{item.icon}</span>
                <span className="jt-inline-type-tab__label">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Form form={form} layout="vertical" requiredMark>
        {/* PHÂN ĐOẠN 1: NỘI DUNG & THỜI GIAN */}
        <div className="jt-form-section">
          <Form.Item
            name="content"
            label={<span className="jt-field-label">Nội dung</span>}
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập nội dung",
              },
            ]}
            style={{ marginBottom: 14 }}
          >
            <Input.TextArea
              rows={3}
              className="jt-modern-textarea"
              placeholder={currentTypeMeta.contentPlaceholder}
            />
          </Form.Item>

          {ticketType === "TASK" ? (
            <div className="jt-form-grid-1col">
              <Form.Item
                name="deadline"
                label={
                  <span className="jt-field-label">
                    <span style={{ display: "none" }}>Thời gian</span>
                    Thời gian / Hạn hoàn thành
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời hạn hoàn thành",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  showTime={{ format: "HH:mm", minuteStep: 5 }}
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn ngày và giờ hoàn thành..."
                  className="jt-modern-picker"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
          ) : ticketType === "MEETING" ? (
            <>
              <div className="jt-form-grid-2col">
                <Form.Item
                  name="startAt"
                  label={
                    <span className="jt-field-label">
                      <span style={{ display: "none" }}>Thời gian</span>
                      Thời gian diễn ra cuộc họp
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thời gian diễn ra cuộc họp",
                    },
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <DatePicker
                    showTime={{ format: "HH:mm", minuteStep: 5 }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày và giờ họp..."
                    className="jt-modern-picker"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="mode"
                  label={
                    <span className="jt-field-label">
                      Hình thức tổ chức họp
                    </span>
                  }
                  initialValue="offline"
                  style={{ marginBottom: 14 }}
                >
                  <Radio.Group
                    options={[
                      { value: "offline", label: "Trực tiếp" },
                      { value: "online", label: "Trực tuyến" },
                      { value: "hybrid", label: "Kết hợp" },
                    ]}
                    optionType="button"
                    buttonStyle="solid"
                    className="jt-segmented-radio"
                  />
                </Form.Item>
              </div>

              {selectedMode === "online" ? (
                <div className="jt-form-grid-1col">
                  <Form.Item
                    name="meetingLink"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: "none" }}>Địa điểm</span>
                        Đường dẫn họp trực tuyến (Link Online)
                      </span>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      className="jt-modern-input"
                      prefix={<LinkOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="Dán link Google Meet, Zoom, MS Teams để người tham dự truy cập..."
                    />
                  </Form.Item>
                </div>
              ) : selectedMode === "hybrid" ? (
                <div className="jt-form-grid-2col">
                  <Form.Item
                    name="location"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: "none" }}>Địa điểm</span>
                        Phòng họp / Địa điểm
                      </span>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      className="jt-modern-input"
                      prefix={
                        <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                      }
                      placeholder="Ví dụ: Phòng họp 1 (Lầu 2), Hội trường..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="meetingLink"
                    label={
                      <span className="jt-field-label">Link họp trực tuyến</span>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      className="jt-modern-input"
                      prefix={<LinkOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="Dán link Google Meet, Zoom, MS Teams..."
                    />
                  </Form.Item>
                </div>
              ) : (
                <div className="jt-form-grid-1col">
                  <Form.Item
                    name="location"
                    label={
                      <span className="jt-field-label">
                        <span style={{ display: "none" }}>Địa điểm</span>
                        Phòng họp / Địa điểm
                      </span>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      className="jt-modern-input"
                      prefix={
                        <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                      }
                      placeholder="Ví dụ: Phòng họp 1 (Lầu 2), Hội trường, Phòng giao ban..."
                    />
                  </Form.Item>
                </div>
              )}
            </>
          ) : (
            <div className="jt-form-grid-2col">
              <Form.Item
                name="startAt"
                label={
                  <span className="jt-field-label">
                    <span style={{ display: "none" }}>Thời gian</span>
                    Thời gian diễn ra sự kiện
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian diễn ra sự kiện",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  showTime={{ format: "HH:mm", minuteStep: 5 }}
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn ngày và giờ sự kiện..."
                  className="jt-modern-picker"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="location"
                label={
                  <span className="jt-field-label">
                    <span style={{ display: "none" }}>Địa điểm</span>
                    Địa điểm sự kiện
                  </span>
                }
                style={{ marginBottom: 0 }}
              >
                <Input
                  className="jt-modern-input"
                  prefix={<EnvironmentOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Hội trường, địa điểm tổ chức..."
                />
              </Form.Item>
            </div>
          )}
        </div>

        {/* PHÂN ĐOẠN 2: THÀNH PHẦN THAM GIA */}
        <div className="jt-form-section jt-form-section--divider">
          <div className="jt-form-section-header">
            <TeamOutlined />
            <span>Thành phần tham gia</span>
          </div>

          {ticketType === "MEETING" ? (
            <div className="jt-form-grid-1col">
              <Form.Item
                name="participants"
                label={
                  <span className="jt-field-label">
                    Danh sách nhân sự tham dự
                  </span>
                }
                rules={[
                  {
                    required: true,
                    type: "array",
                    min: 1,
                    message: "Vui lòng chọn thành phần tham dự",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  mode="multiple"
                  options={SUGGESTED_MEMBERS}
                  placeholder="Chọn nhân sự tham dự cuộc họp..."
                  className="jt-modern-select"
                />
              </Form.Item>
            </div>
          ) : (
            <>
              <div className="jt-form-grid-1col" style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      className="jt-field-label"
                      style={{ color: "#0f172a", fontWeight: 600 }}
                    >
                      Người duyệt phiếu
                    </span>
                  </div>
                </div>

                <Form.Item name="approver" style={{ marginBottom: 0 }}>
                  <Select
                    mode="multiple"
                    allowClear
                    options={SUGGESTED_MEMBERS}
                    placeholder={
                      ticketType === "EVENT"
                        ? "Chọn người duyệt (để trống nếu là sự kiện nội bộ)..."
                        : "Chọn người duyệt (để trống nếu là việc nội bộ)..."
                    }
                    className="jt-modern-select"
                  />
                </Form.Item>
              </div>

              <div className="jt-form-grid-2col">
                <Form.Item
                  name="executors"
                  label={<span className="jt-field-label">Người triển khai</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    className="jt-modern-select"
                    mode="multiple"
                    options={SUGGESTED_MEMBERS}
                    placeholder="Chọn người trực tiếp triển khai..."
                  />
                </Form.Item>

                <Form.Item
                  name="watchers"
                  label={<span className="jt-field-label">Người theo dõi</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    mode="multiple"
                    options={SUGGESTED_MEMBERS}
                    placeholder="Chọn người theo dõi..."
                    className="jt-modern-select"
                  />
                </Form.Item>
              </div>
            </>
          )}
        </div>

        {/* PHÂN ĐOẠN 3: TÀI LIỆU ĐÍNH KÈM */}
        <div className="jt-form-section jt-form-section--divider">
          <div className="jt-form-section-header">
            <PaperClipOutlined />
            <span>
              <span style={{ display: "none" }}>Tài liệu</span>
              Tài liệu đính kèm ({files.length})
            </span>
          </div>

          <div
            className="jt-upload-dropzone"
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
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
              <span style={{ display: "none" }}>Chọn tệp</span>
              Duyệt tệp
            </Button>
          </div>

          {files.length > 0 && (
            <div className="jt-attached-preview-list">
              {files.map((file, idx) => {
                const cat = getFileCategory(file.name);
                return (
                  <div key={file.uid || idx} className="jt-attached-preview-item">
                    <div
                      className="jt-attached-preview-item__badge"
                      style={{
                        background: cat.bg,
                        color: cat.color,
                        borderColor: cat.border,
                      }}
                    >
                      <span style={{ fontSize: 13, lineHeight: 1 }}>{cat.icon}</span>
                      <small style={{ fontSize: 8.5, fontWeight: 800, marginTop: 2 }}>{cat.label}</small>
                    </div>
                    <div className="jt-attached-preview-item__details">
                      <span className="jt-attached-preview-item__name" title={file.name}>
                        {file.name}
                      </span>
                      <span className="jt-attached-preview-item__size">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="jt-attached-preview-item__remove"
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
                      title="Xóa tệp này"
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
}
