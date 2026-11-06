import { readAttachment } from "../attachmentUtils";
import { filterCalendarPeople, resolveCalendarUserId } from "../calendarMembership";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs, isDayjs } from "dayjs";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Checkbox,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  NotificationOutlined,
  PaperClipOutlined,
  PlusOutlined,
  RocketOutlined,
  SendOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import { useAuth } from "@/features/auth/AuthContext";
import { directoryContacts } from "@/mocks/fixtures";
import { calendarApi } from "@/services/api";
import type { CalendarAttachmentItem, CalendarEvent } from "@/types/domain";
import { avatarTone, nameInitials } from "@/utils/avatar";

import { getMeetingPhysicalLocation } from "../calendarWeekUtils";
import { AttachedFilesGrid } from "./AttachedFilesList";
import { SmartTimePicker } from "./SmartTimePicker";
import { SmartParticipantPicker } from "./SmartParticipantPicker";
import { UserSelectionModal } from "./UserSelectionModal";
import "./JobTicketDetailDrawer.css";


const POSITION_MAP: Record<string, string> = {
  'Nguyễn Minh Anh': 'Phóng viên',
  'Trần Thu Hà': 'Phó Trưởng ban',
  'Phạm Đức Long': 'Quản trị viên hệ thống',
  'Nguyễn Hoài Nam': 'Phóng viên chuyên đề',
  'Lê Thanh Vân': 'Thư ký điều phối',
  'Đỗ Quang Huy': 'Trưởng ban',
  'Mai Phương Thảo': 'Chuyên viên lưu trữ',
  'Vũ Minh Khôi': 'Chuyên viên',
  'Hoàng Tuấn Anh': 'Thư ký biên tập',
  'Ngô Mỹ Linh': 'Chuyên viên văn thư',
  'Bùi Anh Tú': 'Phóng viên thời sự',
  'Phan Thùy Dung': 'Chuyên viên tư liệu',
  'Đặng Quốc Bảo': 'Kỹ sư phần mềm',
  'Tạ Minh Châu': 'Kỹ sư hệ thống',
  'Đinh Gia Hân': 'Phóng viên',
  'Lương Hải Đăng': 'Phóng viên',
  'Cao Thanh Tâm': 'Kế toán viên',
  'Trịnh Khánh Vy': 'Chuyên viên nhân sự',
  'Nguyễn Tấn Đạt': 'Phó Tổng Biên tập',
  'Lê Văn Tuấn': 'Trưởng ban Thư ký',
};

function parsePersonInfo(raw: string): { name: string; roleOrDept: string } {
  const trimmed = (raw || '').trim();
  const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    return { name: match[1].trim(), roleOrDept: match[2].trim() };
  }
  if (POSITION_MAP[trimmed]) {
    return { name: trimmed, roleOrDept: POSITION_MAP[trimmed] };
  }
  const contact = directoryContacts.find(
    (c) =>
      c.fullName.toLowerCase() === trimmed.toLowerCase() ||
      (c.penName && c.penName.toLowerCase() === trimmed.toLowerCase())
  );
  if (contact) {
    return {
      name: contact.fullName,
      roleOrDept: contact.department || '',
    };
  }
  return { name: trimmed, roleOrDept: '' };
}

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
  existingEvents?: CalendarEvent[];
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
  mode?: "offline" | "online" | "hybrid" | ("offline" | "online")[];
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
  existingEvents = [],
  onClose,
  onSuccess,
}: CreatePersonalMeetingModalProps) {
  const { user } = useAuth();
  const currentUserName = user?.fullName || "Nguyễn Minh Anh";
  const organizerName = editingEvent?.organizer || currentUserName;
  const [form] = Form.useForm<TicketFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(editingEvent);

  const [step, setStep] = useState<number>(isEdit ? 1 : 0);
  const [ticketType, setTicketType] = useState<"TASK" | "MEETING" | "EVENT">(
    (editingEvent?.ticketType as "TASK" | "MEETING" | "EVENT" | undefined) ||
      initialTicketType,
  );
  const [files, setFiles] = useState<Array<UploadFile & { sourceFile?: File }>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sub-modal states
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [modalParticipants, setModalParticipants] = useState<string[]>([]);
  const isPendingDeployAfterSelection = useRef(false);

  const [showApproverModal, setShowApproverModal] = useState(false);
  const [modalApprovers, setModalApprovers] = useState<string[]>([]);
  const [approverModalError, setApproverModalError] = useState<string>("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<
    "DEPLOY" | "PROPOSE" | "DIRECT"
  >("DEPLOY");

  const selectedApprover = Form.useWatch("approver", form);
  const watchedMode = Form.useWatch("mode", form);
  const currentModes: string[] = Array.isArray(watchedMode)
    ? watchedMode
    : watchedMode === "hybrid"
      ? ["offline", "online"]
      : watchedMode === "online"
        ? ["online"]
        : ["offline"];
  const isOffline = currentModes.includes("offline");
  const isOnline = currentModes.includes("online");
  const watchedParticipants = Form.useWatch("participants", form);
  const watchedLocation = Form.useWatch("location", form);
  const selectedParticipantsList = useMemo(() => {
    if (Array.isArray(watchedParticipants)) return watchedParticipants;
    if (typeof watchedParticipants === "string" && watchedParticipants.trim()) return [watchedParticipants];
    return [];
  }, [watchedParticipants]);
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
          location: tType === "MEETING" ? getMeetingPhysicalLocation(editingEvent) : editingEvent.location,
          meetingLink: editingEvent.meetingUrl,
          mode:
            editingEvent.mode === "hybrid" || (!editingEvent.mode && editingEvent.meetingUrl && getMeetingPhysicalLocation(editingEvent))
              ? ["offline", "online"]
              : editingEvent.mode === "online" || (!editingEvent.mode && editingEvent.meetingUrl && !getMeetingPhysicalLocation(editingEvent))
                ? ["online"]
                : ["offline"],
          participants: editingEvent.participants ?? [],
          executors: editingEvent.executors?.map((e) => e.name) || [
            "Bùi Lê Thế Kiệt",
          ],
          watchers: editingEvent.watchers?.map((w) => w.name) || [
            "Lê Văn Tuấn",
          ],
          approver: editingEvent.approver?.name
            ? editingEvent.approver.name.split(", ").filter(Boolean)
            : [],
        });

        if (editingEvent.attachments) {
          setFiles(
            editingEvent.attachments.map((att) => ({
              uid: att.id,
              name: att.name,
              size: att.size,
              type: att.type,
              url: att.url,
              status: "done" as const,
            })),
          );
        }
      } else {
        setStep(0);
        setTicketType(initialTicketType || "TASK");
        form.resetFields();
        setFiles([]);

        const now = dayjs();
        const remainder = now.minute() % 5;
        const roundedNow =
          remainder === 0
            ? now.second(0).millisecond(0)
            : now.add(5 - remainder, "minute").second(0).millisecond(0);

        const baseDate = initialDate
          ? initialDate.isBefore(roundedNow, "day")
            ? roundedNow
            : initialDate
          : roundedNow;

        const start = baseDate.isSame(roundedNow, "day")
          ? roundedNow
          : baseDate.hour(roundedNow.hour()).minute(roundedNow.minute()).second(0);
        const end = start.add(1, "hour");

        form.setFieldsValue({
          mode: ["offline"],
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
      const newFiles = Array.from(e.target.files).map(
        (f, idx) => ({
          uid: `f-${Date.now()}-${idx}`,
          name: f.name,
          size: f.size,
          type: f.type,
          sourceFile: f,
          status: "done" as const,
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
        isPendingDeployAfterSelection.current = true;
        setShowParticipantModal(true);
      } else {
        setConfirmActionType("DEPLOY");
        setShowConfirmModal(true);
      }
    } catch {
      // Form validation error triggered
    }
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

      setModalApprovers(apprList);
      setApproverModalError("");
      setShowApproverModal(true);
    } catch {
      // Form validation error triggered
    }
  };

  // Xác nhận sau khi chọn người duyệt từ popup
  const handleConfirmApproverModal = () => {
    if (!modalApprovers || modalApprovers.length === 0) {
      setApproverModalError("Vui lòng chọn ít nhất một người duyệt");
      return;
    }
    const eligibleApprovers = filterCalendarPeople(modalApprovers, (name) => name, selectedParticipantsList);
    if (eligibleApprovers.length !== modalApprovers.length) {
      setModalApprovers(eligibleApprovers);
      setApproverModalError("Người duyệt không được trùng với thành phần đã chọn.");
      return;
    }
    setApproverModalError("");
    form.setFieldValue("approver", eligibleApprovers);
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

      const data = form.getFieldsValue(true);
      const rawContent = (data.content || "").trim();
      if (!rawContent) {
        message.error("Vui lòng nhập nội dung");
        setSaving(false);
        return;
      }

      // Trích xuất thời gian chính xác, bảo đảm không bị mất giờ hay sai lệch
      const extractTimeRange = (
        rawTime: unknown,
        fallbackHour = 9,
        durationMinutes = 60,
      ): { startIso: string; endIso: string } => {
        const defaultBase = (initialDate || dayjs())
          .hour(fallbackHour)
          .minute(0)
          .second(0);
        let start: Dayjs = defaultBase;
        let end: Dayjs = defaultBase.add(durationMinutes, "minute");

        if (rawTime) {
          if (Array.isArray(rawTime) && rawTime.length >= 2) {
            const s = dayjs(rawTime[0]);
            const e = dayjs(rawTime[1]);
            if (s.isValid()) start = s;
            if (e.isValid()) end = e;
            else end = start.add(durationMinutes, "minute");
          } else if (Array.isArray(rawTime) && rawTime.length === 1) {
            const s = dayjs(rawTime[0]);
            if (s.isValid()) {
              start = s;
              end = s.add(durationMinutes, "minute");
            }
          } else if (isDayjs(rawTime)) {
            if (rawTime.isValid()) {
              start = rawTime;
              const customEnd = (rawTime as unknown as { endAt?: unknown })?.endAt;
              if (customEnd && isDayjs(customEnd) && customEnd.isValid()) {
                end = customEnd;
              } else if (customEnd && typeof customEnd === "string" && dayjs(customEnd).isValid()) {
                end = dayjs(customEnd);
              } else {
                end = start.add(durationMinutes, "minute");
              }
            }
          } else if (typeof rawTime === "object" && rawTime !== null) {
            const obj = rawTime as Record<string, unknown>;
            const rawStart = obj.startAt || obj[0] || obj.time || obj.date;
            const rawEnd = obj.endAt || obj[1] || obj.deadline;

            if (rawStart) {
              const s = dayjs(rawStart as string | number | Date | Dayjs);
              if (s.isValid()) start = s;
            }
            if (rawEnd) {
              const e = dayjs(rawEnd as string | number | Date | Dayjs);
              if (e.isValid()) end = e;
              else end = start.add(durationMinutes, "minute");
            } else {
              end = start.add(durationMinutes, "minute");
            }
          } else if (typeof rawTime === "string" || typeof rawTime === "number") {
            const s = dayjs(rawTime);
            if (s.isValid()) {
              start = s;
              end = s.add(durationMinutes, "minute");
            }
          }
        }

        if (end.isBefore(start)) {
          end = start.add(durationMinutes, "minute");
        }

        return {
          startIso: start.toISOString(),
          endIso: end.toISOString(),
        };
      };

      let startAtStr = new Date().toISOString();
      let endAtStr = new Date().toISOString();

      if (ticketType === "MEETING") {
        const { startIso, endIso } = extractTimeRange(
          data.time || data.startAt || data.dateTimeRange,
          9,
          60,
        );
        startAtStr = startIso;
        const existingDuration = editingEvent ? dayjs(editingEvent.endAt).diff(dayjs(editingEvent.startAt)) : -1;
        endAtStr = existingDuration >= 0 ? dayjs(startIso).add(existingDuration, "millisecond").toISOString() : endIso;
      } else if (ticketType === "TASK") {
        const { startIso } = extractTimeRange(
          data.time || data.deadline || data.startAt,
          17,
          0,
        );
        startAtStr = startIso;
        endAtStr = startIso;
      } else {
        const { startIso, endIso } = extractTimeRange(
          data.time || data.startAt,
          9,
          60,
        );
        startAtStr = startIso;
        endAtStr = endIso;
      }

            const rawLocation = (data.location as string)?.trim() || "";
      const rawLink = (data.meetingLink as string)?.trim() || "";
      const rawModes: string[] = Array.isArray(data.mode)
        ? data.mode
        : data.mode === "hybrid"
          ? ["offline", "online"]
          : data.mode === "online"
            ? ["online"]
            : ["offline"];
      const hasOffline = rawModes.includes("offline");
      const hasOnline = rawModes.includes("online");
      const finalMode: "offline" | "online" | "hybrid" =
        hasOffline && hasOnline
          ? "hybrid"
          : hasOnline
            ? "online"
            : "offline";

      const location = ticketType === "MEETING" && hasOffline ? rawLocation : "";

      const attachedItems: CalendarAttachmentItem[] = await Promise.all(files.map(async (file) => {
        const existing = editingEvent?.attachments?.find((attachment) => attachment.id === file.uid);
        return existing ?? {
          id: file.uid,
          name: file.name,
          size: file.size ?? 0,
          type: file.type || "application/octet-stream",
          url: file.sourceFile ? await readAttachment(file.sourceFile) : file.url,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUserName,
        };
      }));

      const rawPartsList: string[] = (Array.isArray(data.participants)
        ? data.participants
        : typeof data.participants === "string" && data.participants.trim()
          ? [data.participants]
          : []
      )
        .map((p: unknown) => (typeof p === "string" ? p.trim() : typeof (p as { name?: string })?.name === "string" ? ((p as { name?: string }).name || "").trim() : ""))
        .filter(Boolean);
      const partsList = filterCalendarPeople(rawPartsList, (name) => name, [organizerName]);

      let approverName: string | undefined = undefined;
      let initialApprovalStatus: CalendarEvent["approvalStatus"] = "APPROVED";
      let apprListToSave: string[] = [];

      if (actionType === "PROPOSE") {
        const rawAppr = modalApprovers && modalApprovers.length > 0
          ? modalApprovers
          : form.getFieldValue("approver") || data.approver;
        const apprList = Array.isArray(rawAppr)
          ? rawAppr
          : typeof rawAppr === "string" && rawAppr.trim()
            ? [rawAppr]
            : [];
        apprListToSave = apprList;
        approverName = apprListToSave.join(", ");
        initialApprovalStatus = "PENDING";
      } else if (actionType === "DEPLOY") {
        approverName = undefined;
        initialApprovalStatus = "IN_PROGRESS";
      } else {
        if (hasApprover) {
          const rawAppr = modalApprovers && modalApprovers.length > 0
            ? modalApprovers
            : form.getFieldValue("approver") || data.approver;
          const apprList = Array.isArray(rawAppr)
            ? rawAppr
            : [String(rawAppr)];
          apprListToSave = apprList;
          approverName = apprList.join(", ");
          initialApprovalStatus = isEdit
            ? editingEvent?.approvalStatus || "PENDING"
            : "PENDING";
        } else {
          initialApprovalStatus = (ticketType === "MEETING" || ticketType === "EVENT") ? "SCHEDULED" : "IN_PROGRESS";
        }
      }

      if (actionType === "PROPOSE" && filterCalendarPeople(apprListToSave, (name) => name, rawPartsList).length !== apprListToSave.length) {
        message.error("Người duyệt không được trùng với thành phần đã chọn.");
        setSaving(false);
        return;
      }

      const isSendingForApproval =
        actionType === "PROPOSE" ||
        initialApprovalStatus === "PENDING" ||
        (Boolean(approverName) && apprListToSave.length > 0);

      const finalParticipants = isSendingForApproval
        ? filterCalendarPeople(apprListToSave, (name) => name, [organizerName])
        : partsList;
      const proposedWatchers = isSendingForApproval
        ? partsList.map((name, idx) => ({
            id: resolveCalendarUserId(name) ?? `watcher-${idx}-${Date.now()}`,
            name,
          }))
        : [];
      const finalWatchers = filterCalendarPeople(
        [...(editingEvent?.watchers ?? []), ...proposedWatchers],
        (person) => person.name,
        [organizerName, ...finalParticipants],
      );

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
        meetingUrl: ticketType === "MEETING" && hasOnline ? (rawLink || undefined) : undefined,
        mode: finalMode,
        organizer: organizerName,
        leader: ticketType === "MEETING" ? (editingEvent?.leader || currentUserName) : undefined,
        participants: finalParticipants,
        participantIds: finalParticipants.flatMap((name) => resolveCalendarUserId(name) ?? []),
        participantText: finalParticipants.join(", "),
        participantCount: finalParticipants.length,
        isUserParticipant: true,
        notes: data.content,
        description: data.content,
        agenda: data.content,
        attachments: attachedItems,
        approver: approverName
          ? { id: resolveCalendarUserId(approverName) ?? "appr-1", name: approverName }
          : undefined,
        approvers: apprListToSave.map((name, idx) => ({
          id: resolveCalendarUserId(name) ?? `appr-${idx}`,
          name,
          status: 'PENDING',
        })),
        approvalStatus: initialApprovalStatus,
        comments: editingEvent?.comments || [],
        executors: isSendingForApproval
          ? []
          : partsList.map((p: string, i: number) => ({
              id: resolveCalendarUserId(p) ?? `exec-${i}`,
              name: p,
              status: actionType === "DEPLOY" ? 'IN_PROGRESS' : 'PENDING',
            })),
        watchers: finalWatchers,
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
            actor_name:
              approverName ||
              (actionType === "DEPLOY"
                ? "Trực tiếp triển khai"
                : "Tự động duyệt"),
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

      const savedRecord = isEdit
        ? await calendarApi.update(newRecord.id, ticketType === "MEETING" ? {
            title: newRecord.title,
            notes: newRecord.notes,
            description: newRecord.description,
            agenda: newRecord.agenda,
            startAt: newRecord.startAt,
            endAt: newRecord.endAt,
            location: newRecord.location,
            meetingUrl: newRecord.meetingUrl,
            mode: newRecord.mode,
            participants: newRecord.participants,
            participantIds: newRecord.participantIds,
            participantText: newRecord.participantText,
            participantCount: newRecord.participantCount,
            watchers: newRecord.watchers,
            attachments: newRecord.attachments,
          } : newRecord)
        : await calendarApi.create(newRecord);

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

      onSuccess(savedRecord.data);
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
                <div style={{ marginBottom: 14 }}>
                  <AttachedFilesGrid
                    files={files}
                    onRemove={(uid) =>
                      setFiles((prev) =>
                        prev.filter((f) => (f.uid || f.name) !== uid),
                      )
                    }
                  />
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
                  {
                    validator: async (_, val) => {
                      if (!val || editingEvent) return Promise.resolve();
                      const now = dayjs();
                      let startDayjs: Dayjs | null = null;
                      if (Array.isArray(val) && val[0]) {
                        startDayjs = dayjs(val[0]);
                      } else if (isDayjs(val)) {
                        startDayjs = val;
                      } else if (typeof val === "object" && val !== null) {
                        const obj = val as Record<string, unknown>;
                        const raw = obj.startAt || obj.time;
                        if (typeof raw === "string" || isDayjs(raw)) startDayjs = dayjs(raw as string | Dayjs);
                      }
                      if (
                        startDayjs &&
                        startDayjs.isValid() &&
                        startDayjs.isBefore(now.subtract(1, "minute"))
                      ) {
                        return Promise.reject(
                          new Error("Thời gian không được ở trong quá khứ"),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                style={{ marginBottom: 14 }}
              >
                <SmartTimePicker
                  ticketType={ticketType}
                  allowPast={Boolean(editingEvent)}
                  existingEvents={existingEvents}
                  currentUserName={currentUserName}
                  selectedParticipants={selectedParticipantsList}
                  selectedLocation={watchedLocation}
                  excludeEventId={editingEvent?.id}
                />
              </Form.Item>

              <Form.Item
                name="participants"
                label={<span className="jt-field-label">Chọn thành phần</span>}
                style={{ marginBottom: 0 }}
              >
                <div className="jt-popup-participant-picker">
                  {selectedParticipantsList.length === 0 ? (
                    <button
                      type="button"
                      className="jt-modern-picker-surface is-empty"
                      onClick={() => {
                        isPendingDeployAfterSelection.current = false;
                        setShowParticipantModal(true);
                      }}
                      aria-label="Chọn thành phần"
                    >
                      <span className="jt-modern-picker-placeholder">
                        <TeamOutlined style={{ fontSize: 14, color: "#94a3b8" }} />
                        <span>
                          {ticketType === "EVENT"
                            ? "Chọn thành phần tham gia sự kiện..."
                            : "Chọn thành phần..."}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <div
                      className="jt-modern-picker-surface"
                      onClick={() => {
                        isPendingDeployAfterSelection.current = false;
                        setShowParticipantModal(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          isPendingDeployAfterSelection.current = false;
                          setShowParticipantModal(true);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Thành phần đã chọn"
                    >
                      <div className="jt-modern-picker-tag-list">
                        {selectedParticipantsList.map((name) => {
                          const toneClass = avatarTone(name);
                          const initials = nameInitials(name);
                          return (
                            <span
                              key={name}
                              className="jt-modern-user-tag"
                            >
                              <span className={`jt-user-tag-avatar ${toneClass}`}>
                                {initials}
                              </span>
                              <span className="jt-user-tag-name">{name}</span>
                              <button
                                type="button"
                                className="jt-user-tag-remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = selectedParticipantsList.filter(
                                    (n) => n !== name,
                                  );
                                  form.setFieldValue("participants", next);
                                }}
                                aria-label={`Xóa ${name}`}
                                title={`Xóa ${name}`}
                              >
                                <CloseOutlined style={{ fontSize: 9 }} />
                              </button>
                            </span>
                          );
                        })}
                        <button
                          type="button"
                          className="jt-modern-picker-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            isPendingDeployAfterSelection.current = false;
                            setShowParticipantModal(true);
                          }}
                          aria-label="Thêm thành phần"
                        >
                          <PlusOutlined style={{ fontSize: 10 }} />
                          <span>Thêm</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                  <div style={{ marginBottom: 14 }}>
                    <AttachedFilesGrid
                      files={files}
                      onRemove={(uid) =>
                        setFiles((prev) =>
                          prev.filter((f) => (f.uid || f.name) !== uid),
                        )
                      }
                    />
                  </div>
                )}

                <div className="jt-form-grid-2col">
                  <Form.Item
                    name="startAt"
                    label={
                      <span className="jt-field-label">
                        Thời gian
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn thời gian",
                      },
                      {
                        validator: async (_, val) => {
                          if (!val || editingEvent) return Promise.resolve();
                          const now = dayjs();
                          let startDayjs: Dayjs | null = null;
                          if (Array.isArray(val) && val[0]) {
                            startDayjs = dayjs(val[0]);
                          } else if (isDayjs(val)) {
                            startDayjs = val;
                          } else if (typeof val === "object" && val !== null) {
                            const obj = val as Record<string, unknown>;
                            const raw = obj.startAt || obj.time;
                            if (typeof raw === "string" || isDayjs(raw)) startDayjs = dayjs(raw as string | Dayjs);
                          }
                          if (
                            startDayjs &&
                            startDayjs.isValid() &&
                            startDayjs.isBefore(now.subtract(1, "minute"))
                          ) {
                            return Promise.reject(
                              new Error("Thời gian không được ở trong quá khứ"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ marginBottom: 14 }}
                  >
                    <SmartTimePicker
                      ticketType="MEETING"
                      mode="single"
                      placeholder="Chọn thời gian họp..."
                      allowPast={Boolean(editingEvent)}
                      existingEvents={existingEvents}
                      currentUserName={currentUserName}
                      selectedParticipants={selectedParticipantsList}
                      selectedLocation={!isOffline ? "" : watchedLocation}
                      excludeEventId={editingEvent?.id}
                    />
                  </Form.Item>

                  <Form.Item
                    name="mode"
                    label={
                      <span className="jt-field-label">
                        Hình thức họp
                      </span>
                    }
                    initialValue={["offline"]}
                    rules={[
                      {
                        validator: async (_, value) => {
                          const arr = Array.isArray(value)
                            ? value
                            : value
                              ? [value]
                              : [];
                          if (arr.length === 0) {
                            return Promise.reject(
                              new Error("Vui lòng chọn ít nhất một hình thức họp"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ marginBottom: 14 }}
                  >
                    <Checkbox.Group
                      className="jt-meeting-mode-checkboxes"
                      options={[
                        { label: "Trực tiếp", value: "offline" },
                        { label: "Trực tuyến", value: "online" },
                      ]}
                    />
                  </Form.Item>
                </div>

                {isOffline && isOnline ? (
                  <div className="jt-form-grid-2col">
                    <Form.Item
                      name="location"
                      label={
                        <span className="jt-field-label">
                          Địa điểm
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
                ) : isOnline ? (
                  <div className="jt-form-grid-1col">
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
                        placeholder="Dán link Google Meet, Zoom, MS Teams để người tham dự truy cập..."
                      />
                    </Form.Item>
                  </div>
                ) : isOffline ? (
                  <div className="jt-form-grid-1col">
                    <Form.Item
                      name="location"
                      label={
                        <span className="jt-field-label">
                          Địa điểm
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
                ) : null}
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
                    <SmartParticipantPicker
                      ticketType="MEETING"
                      targetRole="participants"
                      excludeNames={[organizerName, ...(editingEvent?.watchers ?? []).map((person) => person.name)]}
                      placeholder="Chọn nhân sự tham dự cuộc họp..."
                    />
                  </Form.Item>
                </div>
              </div>
            </>
          )}

        </Form>
      </Modal>

      {/* ─── POPUP CHỌN THÀNH PHẦN (DÙNG CHO CẢ TẠO PHIẾU VÀ TRIỂN KHAI) ─── */}
      <UserSelectionModal
        open={showParticipantModal}
        title={
          ticketType === "EVENT"
            ? "Chọn thành phần tham gia"
            : ticketType === "TASK"
              ? "Chọn thành phần"
              : "Chọn thành phần tham dự"
        }
        initialSelected={selectedParticipantsList}
        excludeNames={[organizerName, ...(editingEvent?.watchers ?? []).map((person) => person.name)]}
        onCancel={() => {
          isPendingDeployAfterSelection.current = false;
          setShowParticipantModal(false);
        }}
        onOk={(selected) => {
          form.setFieldValue("participants", selected);
          setShowParticipantModal(false);
          if (isPendingDeployAfterSelection.current && selected.length > 0) {
            isPendingDeployAfterSelection.current = false;
            setConfirmActionType("DEPLOY");
            setShowConfirmModal(true);
          }
        }}
      />

      {/* ─── POPUP CHỌN NGƯỜI DUYỆT (KHI BẤM ĐỀ XUẤT - CHỌN NHIỀU) ─── */}
      <Modal
        open={showApproverModal}
        title="Chọn người duyệt phiếu"
        centered
        width={540}
        destroyOnClose={false}
        onCancel={() => {
          setShowApproverModal(false);
          setApproverModalError("");
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              onClick={() => {
                setShowApproverModal(false);
                setApproverModalError("");
              }}
            >
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
        <div style={{ padding: "4px 0" }}>
          <SmartParticipantPicker
            ticketType={ticketType}
            targetRole="approvers"
            excludeNames={selectedParticipantsList}
            allowGroups={false}
            status={approverModalError ? "error" : undefined}
            value={modalApprovers}
            onChange={(newVal) => {
              setModalApprovers(newVal);
              if (newVal && newVal.length > 0) {
                setApproverModalError("");
              }
            }}
            placeholder="Chọn người duyệt..."
          />
          {approverModalError && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12.5,
                color: "#d92d20",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <ExclamationCircleOutlined />
              <span>Vui lòng chọn ít nhất một người duyệt</span>
            </div>
          )}
        </div>
      </Modal>

      {/* ─── POPUP HỎI XÁC NHẬN THÔNG TIN LẠI (CHO CẢ TRIỂN KHAI VÀ ĐỀ XUẤT) ─── */}
      <Modal
        open={showConfirmModal}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor:
                  confirmActionType === "DEPLOY" ? "#ecfdf3" : "#eff8ff",
                color:
                  confirmActionType === "DEPLOY" ? "#027a48" : "#175cd3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {confirmActionType === "DEPLOY" ? (
                <RocketOutlined />
              ) : (
                <SendOutlined />
              )}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1d2939" }}>
                Xác nhận
              </div>
            </div>
          </div>
        }
        centered
        width={480}
        destroyOnClose={false}
        onCancel={() => setShowConfirmModal(false)}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              paddingTop: 12,
              borderTop: "1px solid #f2f4f7",
            }}
          >
            <Button
              onClick={() => setShowConfirmModal(false)}
              style={{
                borderRadius: 6,
                fontWeight: 500,
                color: "#344054",
                borderColor: "#d0d5dd",
              }}
            >
              Quay lại
            </Button>
            <Button
              type="primary"
              loading={saving}
              onClick={() => handleExecuteFinalSubmit(confirmActionType)}
              icon={
                confirmActionType === "DEPLOY" ? (
                  <CheckOutlined />
                ) : (
                  <SendOutlined />
                )
              }
              style={{
                backgroundColor:
                  confirmActionType === "DEPLOY" ? "#059669" : "#1d4ed8",
                borderColor:
                  confirmActionType === "DEPLOY" ? "#059669" : "#1d4ed8",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Xác nhận
            </Button>
          </div>
        }
      >
        {(() => {
          const rawParticipants =
            modalParticipants && modalParticipants.length > 0
              ? modalParticipants
              : form.getFieldValue("participants");
          const rawApprovers =
            modalApprovers && modalApprovers.length > 0
              ? modalApprovers
              : form.getFieldValue("approver");
          const confirmRecipients: string[] =
            confirmActionType === "DEPLOY"
              ? Array.isArray(rawParticipants)
                ? rawParticipants
                : typeof rawParticipants === "string" && rawParticipants.trim()
                  ? [rawParticipants]
                  : []
              : Array.isArray(rawApprovers)
                ? rawApprovers
                : typeof rawApprovers === "string" && rawApprovers.trim()
                  ? [rawApprovers]
                  : [];

          return (
            <div style={{ padding: "8px 0 4px 0" }}>
              {/* Header dòng hướng dẫn / số lượng */}
              <div
                style={{
                  fontSize: 13.5,
                  color: "#475467",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {confirmActionType === "DEPLOY"
                    ? "Xác nhận triển khai cho:"
                    : "Xác nhận gửi duyệt cho:"}
                </span>
                {confirmRecipients.length > 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#667085",
                      backgroundColor: "#f2f4f7",
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontWeight: 500,
                    }}
                  >
                    {confirmRecipients.length}{" "}
                    {confirmActionType === "DEPLOY" ? "nhân sự" : "người duyệt"}
                  </span>
                )}
              </div>

              {/* Danh sách người nhận */}
              {confirmRecipients.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "#98a2b3",
                    fontSize: 13,
                    backgroundColor: "#f9fafb",
                    borderRadius: 8,
                    border: "1px dashed #d0d5dd",
                  }}
                >
                  {confirmActionType === "DEPLOY"
                    ? "Chưa chọn nhân sự thực hiện"
                    : "Chưa chọn người duyệt"}
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    border: "1px solid #eaecf0",
                    borderRadius: 8,
                    backgroundColor: "#ffffff",
                  }}
                >
                  {confirmRecipients.map((rawName, idx) => {
                    const info = parsePersonInfo(rawName);
                    return (
                      <div
                        key={`${rawName}-${idx}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          borderBottom:
                            idx < confirmRecipients.length - 1
                              ? "1px solid #f2f4f7"
                              : "none",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <span
                          className={`mini-avatar ${avatarTone(info.name)}`}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {nameInitials(info.name)}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "#1d2939",
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {info.name}
                          </div>
                          {info.roleOrDept && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#667085",
                                lineHeight: 1.3,
                                marginTop: 2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {info.roleOrDept}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })()}
      </Modal>
    </>
  );
}
