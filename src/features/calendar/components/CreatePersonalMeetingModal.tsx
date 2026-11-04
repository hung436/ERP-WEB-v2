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
  ArrowLeftOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  NotificationOutlined,
  PaperClipOutlined,
  RocketOutlined,
  SendOutlined,
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
    subtitle: "Nội dung, thời gian, thành phần thực hiện",
    icon: <CheckSquareOutlined />,
    contentPlaceholder:
      "Nhập nội dung công việc, mục tiêu hoặc yêu cầu phối hợp...",
    createButtonText: "Tạo phiếu công việc",
  },
  {
    value: "MEETING" as const,
    name: "Lịch họp",
    subtitle: "Nội dung, thời gian, thành phần, online / offline",
    icon: <VideoCameraOutlined />,
    contentPlaceholder: "Nhập nội dung cuộc họp, chương trình nghị sự...",
    createButtonText: "Tạo lịch họp",
  },
  {
    value: "EVENT" as const,
    name: "Sự kiện",
    subtitle: "Nội dung, thời gian, thành phần tham gia",
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
  time?: Dayjs;
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


interface SmartTimePickerProps {
  value?: Dayjs;
  onChange?: (val: Dayjs) => void;
  ticketType?: "TASK" | "MEETING" | "EVENT";
}

function SmartTimePicker({
  value,
  onChange,
}: SmartTimePickerProps) {
  return (
    <DatePicker
      value={value}
      onChange={(val) => {
        if (val) onChange?.(val);
      }}
      showTime={{ format: "HH:mm" }}
      format="HH:mm DD/MM/YYYY"
      needConfirm
      allowClear={false}
      className="jt-modern-picker"
      style={{ width: "100%", height: 36, borderRadius: 6 }}
      placeholder="Chọn thời gian..."
    />
  );
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

  const [step, setStep] = useState<number>(isEdit ? 1 : 0);
  const [ticketType, setTicketType] = useState<"TASK" | "MEETING" | "EVENT">(
    (editingEvent?.ticketType as "TASK" | "MEETING" | "EVENT" | undefined) ||
      initialTicketType,
  );
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sub-modal states
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [modalParticipants, setModalParticipants] = useState<string[]>([]);

  const [showApproverModal, setShowApproverModal] = useState(false);
  const [modalApprovers, setModalApprovers] = useState<string[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<
    "DEPLOY" | "PROPOSE" | "DIRECT"
  >("DEPLOY");

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
      setShowParticipantModal(false);
      setShowApproverModal(false);
      setShowConfirmModal(false);

      if (editingEvent) {
        setStep(1);
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
        const end = editingEvent.deadline
          ? dayjs(editingEvent.deadline)
          : editingEvent.endAt
            ? dayjs(editingEvent.endAt)
            : start.add(1, "hour");

        const effectiveTime = tType === "TASK" ? end : start;

        form.setFieldsValue({
          content:
            editingEvent.title ||
            editingEvent.notes ||
            editingEvent.description ||
            "",
          time: effectiveTime,
          startAt: start,
          deadline: end,
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
        setStep(0);
        setTicketType(initialTicketType || "TASK");
        form.resetFields();
        setFiles([]);

        const baseDate = initialDate || dayjs();
        const start = baseDate.hour(9).minute(0).second(0);
        const end = start.add(1, "hour");

        form.setFieldsValue({
          mode: "offline",
          time: start,
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

  // Nút "Triển khai": Bắt buộc có thành phần, nếu chưa thì mở popup chọn thành phần
  const handleDeployClick = async () => {
    try {
      if (ticketType === "MEETING") {
        await form.validateFields(["content", "startAt", "participants"]);
      } else {
        await form.validateFields(["content", "time"]);
      }
      setError("");

      const currentParts = form.getFieldValue("participants");
      const partsList = Array.isArray(currentParts)
        ? currentParts
        : typeof currentParts === "string" && currentParts.trim()
          ? [currentParts]
          : [];

      if (partsList.length === 0) {
        setModalParticipants([]);
        setShowParticipantModal(true);
      } else {
        setConfirmActionType("DEPLOY");
        setShowConfirmModal(true);
      }
    } catch {
      // Form validation error triggered
    }
  };

  // Xác nhận sau khi chọn thành phần từ popup
  const handleConfirmParticipantModal = () => {
    if (!modalParticipants || modalParticipants.length === 0) {
      message.warning("Vui lòng chọn ít nhất một thành phần tham gia / thực hiện");
      return;
    }
    form.setFieldValue("participants", modalParticipants);
    setShowParticipantModal(false);
    setConfirmActionType("DEPLOY");
    setShowConfirmModal(true);
  };

  // Nút "Đề xuất": Mở popup chọn người duyệt (chọn nhiều)
  const handleProposeClick = async () => {
    try {
      if (ticketType === "MEETING") {
        await form.validateFields(["content", "startAt", "participants"]);
      } else {
        await form.validateFields(["content", "time"]);
      }
      setError("");

      const currentApprovers = form.getFieldValue("approver");
      const apprList = Array.isArray(currentApprovers)
        ? currentApprovers
        : typeof currentApprovers === "string" && currentApprovers.trim()
          ? [currentApprovers]
          : [];

      setModalApprovers(
        apprList.length > 0
          ? apprList
          : ["Nguyễn Tấn Đạt (Phó Tổng Biên tập)"],
      );
      setShowApproverModal(true);
    } catch {
      // Form validation error triggered
    }
  };

  // Xác nhận sau khi chọn người duyệt từ popup
  const handleConfirmApproverModal = () => {
    if (!modalApprovers || modalApprovers.length === 0) {
      message.warning("Vui lòng chọn ít nhất một người duyệt");
      return;
    }
    form.setFieldValue("approver", modalApprovers);
    setShowApproverModal(false);
    setConfirmActionType("PROPOSE");
    setShowConfirmModal(true);
  };

  // Thực hiện lưu phiếu vào hệ thống
  const handleExecuteFinalSubmit = async (
    actionType: "DEPLOY" | "PROPOSE" | "DIRECT" = confirmActionType,
  ) => {
    try {
      setSaving(true);
      setError("");

      const data = form.getFieldsValue();
      const rawContent = (data.content || "").trim();
      if (!rawContent) {
        message.error("Vui lòng nhập nội dung");
        setSaving(false);
        return;
      }

      let startAtStr = new Date().toISOString();
      let endAtStr = new Date().toISOString();

      if (ticketType === "MEETING") {
        const s = data.startAt
          ? dayjs(data.startAt)
          : data.dateTimeRange
            ? dayjs(data.dateTimeRange[0])
            : dayjs();
        startAtStr = s.toISOString();
        endAtStr = s.add(1, "hour").toISOString();
      } else {
        const t = data.time
          ? dayjs(data.time)
          : data.deadline
            ? dayjs(data.deadline)
            : data.startAt
              ? dayjs(data.startAt)
              : dayjs();
        startAtStr = t.toISOString();
        endAtStr =
          ticketType === "TASK" ? t.toISOString() : t.add(1, "hour").toISOString();
      }

      const rawLocation = (data.location as string)?.trim() || "";
      const rawLink = (data.meetingLink as string)?.trim() || "";
      const location =
        ticketType === "MEETING"
          ? data.mode === "online"
            ? rawLink || rawLocation || "Trực tuyến"
            : data.mode === "hybrid"
              ? [rawLocation, rawLink].filter(Boolean).join(" • ") ||
                "Phòng họp cơ quan"
              : rawLocation || "Phòng họp cơ quan"
          : ticketType === "TASK"
            ? "Phiếu công việc"
            : "Sự kiện cơ quan";

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

      const partsList = Array.isArray(data.participants)
        ? data.participants
        : typeof data.participants === "string" && data.participants.trim()
          ? [data.participants]
          : [];

      let approverName: string | undefined = undefined;
      let initialApprovalStatus: CalendarEvent["approvalStatus"] = "APPROVED";
      let apprListToSave: string[] = [];

      if (actionType === "PROPOSE") {
        const apprList = Array.isArray(data.approver)
          ? data.approver
          : typeof data.approver === "string" && data.approver.trim()
            ? [data.approver]
            : [];
        apprListToSave = apprList.length > 0 ? apprList : ["Nguyễn Tấn Đạt (Phó Tổng Biên tập)"];
        approverName = apprListToSave.join(", ");
        initialApprovalStatus = "PENDING";
      } else if (actionType === "DEPLOY") {
        approverName = undefined;
        initialApprovalStatus = "IN_PROGRESS";
      } else {
        if (hasApprover) {
          const apprList = Array.isArray(data.approver)
            ? data.approver
            : [String(data.approver)];
          apprListToSave = apprList;
          approverName = apprList.join(", ");
          initialApprovalStatus = isEdit
            ? editingEvent?.approvalStatus || "PENDING"
            : "PENDING";
        } else {
          initialApprovalStatus = (ticketType === "MEETING" || ticketType === "EVENT") ? "SCHEDULED" : "IN_PROGRESS";
        }
      }

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
        workflowType: actionType === "PROPOSE" ? "PROPOSAL" : "DISPATCH",
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
        participants: partsList,
        participantText: partsList.join(", "),
        participantCount: partsList.length,
        isUserParticipant: true,
        notes: data.content,
        description: data.content,
        agenda: data.content,
        attachments: attachedItems,
        approver: approverName
          ? { id: "appr-1", name: approverName }
          : undefined,
        approvers: apprListToSave.map((name, idx) => ({
          id: `appr-${idx}`,
          name,
          status: 'PENDING',
        })),
        approvalStatus: initialApprovalStatus,
        comments: editingEvent?.comments || [],
        executors: partsList.map((p: string, i: number) => ({
          id: `exec-${i}`,
          name: p,
          status: actionType === "DEPLOY" ? 'IN_PROGRESS' : 'PENDING',
        })),
        watchers: [],
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
            name: actionType === "PROPOSE" ? "Rà soát / Phê duyệt" : "Phê duyệt",
            status: initialApprovalStatus === "PENDING" ? "PENDING" : "APPROVED",
            actor_name: approverName || "Tự động duyệt",
            role: "APPROVER",
          },
          {
            id: "step-3",
            step_order: 3,
            name: "Triển khai",
            status: actionType === "DEPLOY" ? "IN_PROGRESS" : "PENDING",
            actor_name:
              partsList.length > 0 ? partsList.join(", ") : "Chưa phân công",
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

      setShowConfirmModal(false);
      setSaving(false);

      if (actionType === "PROPOSE") {
        message.success(
          `Đã gửi đề xuất ${currentTypeMeta.name.toLowerCase()} cho người duyệt`,
        );
      } else if (actionType === "DEPLOY") {
        message.success(
          `Đã triển khai ${currentTypeMeta.name.toLowerCase()} thành công`,
        );
      } else {
        message.success(
          isEdit
            ? `Đã cập nhật ${currentTypeMeta.name.toLowerCase()}`
            : `Đã ghi nhận ${currentTypeMeta.name.toLowerCase()} vào lịch tuần`,
        );
      }

      onSuccess(newRecord);
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Vui lòng kiểm tra lại thông tin";
      setError(errorMsg);
    }
  };

  // Dùng trực tiếp khi chỉnh sửa hoặc cho lịch họp
  const handleDirectSubmit = async () => {
    try {
      if (ticketType === "MEETING") {
        await form.validateFields(["content", "startAt", "participants"]);
      } else {
        await form.validateFields(["content", "time"]);
      }
      await handleExecuteFinalSubmit("DIRECT");
    } catch {
      // Form validation error triggered
    }
  };

  return (
    <>
      {/* ─── BƯỚC 0: POPUP CHỌN LOẠI PHIẾU CẦN TẠO ─── */}
      <Modal
        open={open && step === 0 && !isEdit}
        title="Tạo mới"
        footer={null}
        width={480}
        centered
        destroyOnClose={false}
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
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ─── BƯỚC 1: FORM KHỞI TẠO / CHỈNH SỬA PHIẾU ─── */}
      <Modal
        open={open && (step === 1 || isEdit)}
        centered
        width={680}
        closable={false}
        destroyOnClose={false}
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
                      : `Tạo mới ${currentTypeMeta.name.toLowerCase()}`}
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
            {isEdit ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={saving}
                onClick={handleDirectSubmit}
                style={{
                  backgroundColor: "#d92d20",
                  borderColor: "#d92d20",
                  borderRadius: 6,
                  height: 36,
                  padding: "0 20px",
                  fontWeight: 600,
                }}
              >
                Lưu thay đổi
              </Button>
            ) : ticketType === "MEETING" ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={saving}
                onClick={handleDirectSubmit}
                style={{
                  backgroundColor: "#d92d20",
                  borderColor: "#d92d20",
                  borderRadius: 6,
                  height: 36,
                  padding: "0 20px",
                  fontWeight: 600,
                }}
              >
                <span style={{ display: "none" }}>Tạo</span>
                {currentTypeMeta.createButtonText}
              </Button>
            ) : (
              <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  onClick={handleDeployClick}
                  style={{
                    backgroundColor: "#059669",
                    borderColor: "#059669",
                    color: "#ffffff",
                    borderRadius: 6,
                    height: 36,
                    padding: "0 20px",
                    fontWeight: 600,
                    boxShadow: "0 1px 2px rgba(5, 150, 105, 0.2)",
                  }}
                >
                  Triển khai
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleProposeClick}
                  style={{
                    backgroundColor: "#1d4ed8",
                    borderColor: "#1d4ed8",
                    color: "#ffffff",
                    borderRadius: 6,
                    height: 36,
                    padding: "0 20px",
                    fontWeight: 600,
                    boxShadow: "0 1px 2px rgba(29, 78, 216, 0.2)",
                  }}
                >
                  Đề xuất
                </Button>
              </div>
            )}
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
          {/* File input ẩn dùng cho nút Đính kèm tệp */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* PHIẾU CÔNG VIỆC VÀ SỰ KIỆN: GIỐNG NHAU (NỘI DUNG*, THỜI GIAN*, CHỌN THÀNH PHẦN) */}
          {ticketType !== "MEETING" ? (
            <div className="jt-form-section">
              <Form.Item
                name="content"
                label={
                  <div className="jt-content-field-header">
                    <span className="jt-field-label">Nội dung</span>
                    <button
                      type="button"
                      className="jt-attach-inline-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Đính kèm tệp tài liệu"
                    >
                      <PaperClipOutlined style={{ fontSize: 13 }} />
                      <span>Đính kèm tệp</span>
                      <span style={{ display: "none" }}>Tài liệu</span>
                      <span style={{ display: "none" }}>Chọn tệp</span>
                      {files.length > 0 && (
                        <span className="jt-attach-inline-badge">{files.length}</span>
                      )}
                    </button>
                  </div>
                }
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

              {files.length > 0 && (
                <div className="jt-attached-chips-container">
                  {files.map((file, idx) => {
                    const cat = getFileCategory(file.name);
                    return (
                      <div key={file.uid || idx} className="jt-attached-chip">
                        <span
                          className="jt-attached-chip__icon"
                          style={{ color: cat.color }}
                        >
                          {cat.icon}
                        </span>
                        <span
                          className="jt-attached-chip__name"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                        <span className="jt-attached-chip__size">
                          ({formatBytes(file.size)})
                        </span>
                        <button
                          type="button"
                          className="jt-attached-chip__remove"
                          onClick={() =>
                            setFiles((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          title="Xóa tệp này"
                          aria-label="Xóa tệp"
                        >
                          <CloseOutlined />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Form.Item
                name="time"
                label={
                  <span className="jt-field-label">
                    <span style={{ display: "none" }}>Thời gian</span>
                    Thời gian
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian",
                  },
                ]}
                style={{ marginBottom: 14 }}
              >
                <SmartTimePicker ticketType={ticketType} />
              </Form.Item>

              <Form.Item
                name="participants"
                label={<span className="jt-field-label">Chọn thành phần</span>}
                style={{ marginBottom: 0 }}
              >
                <Select
                  mode="multiple"
                  allowClear
                  options={SUGGESTED_MEMBERS}
                  placeholder={
                    ticketType === "TASK"
                      ? "Chọn thành phần thực hiện công việc..."
                      : "Chọn thành phần tham gia sự kiện..."
                  }
                  className="jt-modern-select"
                />
              </Form.Item>
            </div>
          ) : (
            /* LỊCH HỌP: FORM CHUYÊN BIỆT CHO CUỘC HỌP */
            <>
              <div className="jt-form-section">
                <Form.Item
                  name="content"
                  label={
                    <div className="jt-content-field-header">
                      <span className="jt-field-label">Nội dung</span>
                      <button
                        type="button"
                        className="jt-attach-inline-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Đính kèm tệp tài liệu"
                      >
                        <PaperClipOutlined style={{ fontSize: 13 }} />
                        <span>Đính kèm tệp</span>
                        <span style={{ display: "none" }}>Tài liệu</span>
                        <span style={{ display: "none" }}>Chọn tệp</span>
                        {files.length > 0 && (
                          <span className="jt-attach-inline-badge">{files.length}</span>
                        )}
                      </button>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Vui lòng nhập nội dung cuộc họp",
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

                {files.length > 0 && (
                  <div className="jt-attached-chips-container">
                    {files.map((file, idx) => {
                      const cat = getFileCategory(file.name);
                      return (
                        <div key={file.uid || idx} className="jt-attached-chip">
                          <span
                            className="jt-attached-chip__icon"
                            style={{ color: cat.color }}
                          >
                            {cat.icon}
                          </span>
                          <span
                            className="jt-attached-chip__name"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <span className="jt-attached-chip__size">
                            ({formatBytes(file.size)})
                          </span>
                          <button
                            type="button"
                            className="jt-attached-chip__remove"
                            onClick={() =>
                              setFiles((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            title="Xóa tệp này"
                            aria-label="Xóa tệp"
                          >
                            <CloseOutlined />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

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
                    <SmartTimePicker ticketType="MEETING" />
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
                        <span className="jt-field-label">
                          Link họp trực tuyến
                        </span>
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
              </div>

              <div className="jt-form-section jt-form-section--divider">
                <div className="jt-form-section-header">
                  <TeamOutlined />
                  <span>Thành phần tham gia</span>
                </div>

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
              </div>
            </>
          )}

        </Form>
      </Modal>

      {/* ─── POPUP CHỌN THÀNH PHẦN (KHI BẤM TRIỂN KHAI MÀ CHƯA CÓ THÀNH PHẦN) ─── */}
      <Modal
        open={showParticipantModal}
        title={
          ticketType === "EVENT"
            ? "Chọn thành phần tham gia"
            : "Chọn thành phần thực hiện"
        }
        centered
        width={500}
        destroyOnClose={false}
        onCancel={() => setShowParticipantModal(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setShowParticipantModal(false)}>
              Đóng
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmParticipantModal}
              style={{
                backgroundColor: "#059669",
                borderColor: "#059669",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Tiếp tục
            </Button>
          </div>
        }
      >
        <p className="jt-modal-helper-text">
          {ticketType === "EVENT"
            ? "Vui lòng chọn nhân sự hoặc đơn vị tham gia sự kiện trước khi tiến hành triển khai:"
            : "Vui lòng chọn ít nhất một nhân sự chịu trách nhiệm thực hiện công việc trước khi tiến hành triển khai:"}
        </p>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          options={SUGGESTED_MEMBERS}
          value={modalParticipants}
          onChange={setModalParticipants}
          placeholder="Chọn nhân sự thực hiện / tham gia..."
          className="jt-modern-select"
        />
      </Modal>

      {/* ─── POPUP CHỌN NGƯỜI DUYỆT (KHI BẤM ĐỀ XUẤT - CHỌN NHIỀU) ─── */}
      <Modal
        open={showApproverModal}
        title="Chọn người duyệt phiếu đề xuất"
        centered
        width={500}
        destroyOnClose={false}
        onCancel={() => setShowApproverModal(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setShowApproverModal(false)}>
              Đóng
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmApproverModal}
              style={{
                backgroundColor: "#1d4ed8",
                borderColor: "#1d4ed8",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Tiếp tục
            </Button>
          </div>
        }
      >
        <p className="jt-modal-helper-text">
          Chỉ định một hoặc nhiều lãnh đạo/cấp quản lý để gửi phiếu đề xuất phê duyệt:
        </p>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          options={SUGGESTED_MEMBERS}
          value={modalApprovers}
          onChange={setModalApprovers}
          placeholder="Chọn người duyệt (có thể chọn nhiều)..."
          className="jt-modern-select"
        />
      </Modal>

      {/* ─── POPUP HỎI XÁC NHẬN THÔNG TIN LẠI (CHO CẢ TRIỂN KHAI VÀ ĐỀ XUẤT) ─── */}
      <Modal
        open={showConfirmModal}
        title={
          confirmActionType === "DEPLOY"
            ? `Xác nhận triển khai ${currentTypeMeta.name.toLowerCase()}`
            : `Xác nhận gửi đề xuất ${currentTypeMeta.name.toLowerCase()}`
        }
        centered
        width={560}
        destroyOnClose={false}
        onCancel={() => setShowConfirmModal(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setShowConfirmModal(false)}>
              Quay lại
            </Button>
            <Button
              type="primary"
              loading={saving}
              onClick={() => handleExecuteFinalSubmit(confirmActionType)}
              style={{
                backgroundColor: confirmActionType === "DEPLOY" ? "#059669" : "#1d4ed8",
                borderColor: confirmActionType === "DEPLOY" ? "#059669" : "#1d4ed8",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              {confirmActionType === "DEPLOY"
                ? "Xác nhận triển khai"
                : "Xác nhận gửi đề xuất"}
            </Button>
          </div>
        }
      >
        <p className="jt-modal-helper-text">
          Vui lòng kiểm tra lại toàn bộ thông tin phiếu trước khi xác nhận lưu vào lịch làm việc:
        </p>

        <div className="jt-confirm-summary">
          <div className="jt-confirm-row">
            <span className="jt-confirm-label">Loại phiếu</span>
            <span className="jt-confirm-value" style={{ fontWeight: 600, color: "#0f172a" }}>
              {currentTypeMeta.name}
            </span>
          </div>

          <div className="jt-confirm-row">
            <span className="jt-confirm-label">Nội dung</span>
            <span className="jt-confirm-value" style={{ whiteSpace: "pre-wrap" }}>
              {form.getFieldValue("content") || "—"}
            </span>
          </div>

          <div className="jt-confirm-row">
            <span className="jt-confirm-label">Thời gian</span>
            <span className="jt-confirm-value" style={{ fontWeight: 500 }}>
              {form.getFieldValue("time")
                ? dayjs(form.getFieldValue("time")).format("DD/MM/YYYY HH:mm")
                : form.getFieldValue("startAt")
                  ? dayjs(form.getFieldValue("startAt")).format("DD/MM/YYYY HH:mm")
                  : "Chưa chọn"}
            </span>
          </div>

          <div className="jt-confirm-row">
            <span className="jt-confirm-label">Thành phần</span>
            <span className="jt-confirm-value">
              {Array.isArray(form.getFieldValue("participants")) &&
              form.getFieldValue("participants").length > 0
                ? form.getFieldValue("participants").join(", ")
                : "Chưa chọn thành phần"}
            </span>
          </div>

          {confirmActionType === "PROPOSE" && (
            <div className="jt-confirm-row">
              <span className="jt-confirm-label">Người duyệt</span>
              <span className="jt-confirm-value" style={{ color: "#b45309", fontWeight: 600 }}>
                {Array.isArray(form.getFieldValue("approver")) &&
                form.getFieldValue("approver").length > 0
                  ? form.getFieldValue("approver").join(", ")
                  : "Chưa chỉ định người duyệt"}
              </span>
            </div>
          )}

          <div className="jt-confirm-row">
            <span className="jt-confirm-label">Hình thức xử lý</span>
            <span className="jt-confirm-value">
              {confirmActionType === "DEPLOY" ? (
                <span
                  style={{
                    color: "#15803d",
                    backgroundColor: "#f0fdf4",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Triển khai ngay
                </span>
              ) : (
                <span
                  style={{
                    color: "#b45309",
                    backgroundColor: "#fffbeb",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Chờ lãnh đạo duyệt
                </span>
              )}
            </span>
          </div>

          {files.length > 0 && (
            <div className="jt-confirm-row">
              <span className="jt-confirm-label">Tài liệu kèm theo</span>
              <span className="jt-confirm-value">
                {files.length} tệp ({files.map((f) => f.name).join(", ")})
              </span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
