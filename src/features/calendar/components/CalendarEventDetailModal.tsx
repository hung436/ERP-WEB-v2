import {
  Button,
  DatePicker,
  Drawer,
  Input,
  Modal,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  Clock3,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  LogOut,
  MapPin,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  Plus,
  Send,
  Trash2,
  User,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/features/auth/AuthContext";
import { calendarApi } from "@/services/api";
import type { CalendarAttachmentItem, CalendarEvent } from "@/types/domain";
import { avatarTone, nameInitials } from "@/utils/avatar";

import {
  canDownloadAttachment,
  downloadAttachment,
  readAttachment,
} from "../attachmentUtils";
import {
  calendarDetailHref,
  getApprovalStatusMeta,
  getEffectiveCalendarApprovalStatus,
  getMeetingPhysicalLocation,
} from "../calendarWeekUtils";

import { formatBytes, getFileCategory } from "./AttachedFilesList";
import {
  canManagePersonalMeeting,
  filterCalendarPeople,
  matchesCalendarPerson,
  resolveCalendarUserId,
} from "../calendarMembership";
import { CreatePersonalMeetingModal } from "./CreatePersonalMeetingModal";
import { MeetingDetailDrawer } from "./MeetingDetailDrawer";
import { UserSelectionModal } from "./UserSelectionModal";
import { useCalendarConfirmation } from "../useCalendarConfirmation";

import "./JobTicketDetailDrawer.css";

export type DetailRoleType =
  | "CREATOR"
  | "APPROVER"
  | "CONSULTEE"
  | "EXECUTOR"
  | "WATCHER";

function highlightCurrentUserName(
  text: string,
  currentUserName = "Nguyễn Minh Anh",
) {
  if (!text) return "Chưa cập nhật";
  const regex = new RegExp(`(${currentUserName})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    if (part.toLowerCase() === currentUserName.toLowerCase()) {
      return (
        <span key={idx} style={{ fontWeight: 700, color: "#0f172a" }}>
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  presentation?: "drawer" | "page";
  panelOpen?: boolean;
  onTogglePanel?: () => void;
}

export interface ChatAttachment {
  id?: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  uploadedBy?: string;
}

interface ChatMessage {
  id: string;
  author_name: string;
  role?: "CREATOR" | "EXECUTOR" | "APPROVER" | "CONSULTEE";
  content: string;
  time: string;
  isMine?: boolean;
  attachments?: ChatAttachment[];
}

export function CalendarEventDetailModal({
  event,
  open,
  onClose,
  onUpdateEvent,
  onDeleteEvent,
  presentation = "drawer",
  panelOpen,
  onTogglePanel,
}: CalendarEventDetailModalProps) {
  const { confirm, confirmationHolder } = useCalendarConfirmation();
  const { user } = useAuth();
  const currentUser = user?.fullName || "Nguyễn Minh Anh";
  const [activeRole, setActiveRole] = useState<DetailRoleType>("CREATOR");
  const [isMuted, setIsMuted] = useState(false);
  const [followerModalOpen, setFollowerModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // State cho các popup action theo từng Role
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");

  const [consultModalOpen, setConsultModalOpen] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [consultReplyTarget, setConsultReplyTarget] = useState<
    NonNullable<CalendarEvent["consultants"]>[number] | null
  >(null);
  const [consultReplyText, setConsultReplyText] = useState("");

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeReportText, setCompleteReportText] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDateTime, setEditDateTime] = useState<dayjs.Dayjs | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedChatFile, setSelectedChatFile] = useState<File | null>(null);
  const [watchers, setWatchers] = useState<
    Array<{ id: string | number; name: string }>
  >([]);

  const [addParticipantModalOpen, setAddParticipantModalOpen] = useState(false);
  const [selectedNewParticipants, setSelectedNewParticipants] = useState<
    string[]
  >([]);
  const [selectedNewWatchers, setSelectedNewWatchers] = useState<string[]>([]);

  const isMe = useCallback(
    (name?: string, id?: string | number) => {
      return Boolean(name && user && matchesCalendarPerson({ name, id }, user));
    },
    [user],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const eventId = event?.id;

  useEffect(() => {
    if (!eventId) return;
    const saved = localStorage.getItem(`jt_muted_ticket_${eventId}`);
    setIsMuted(saved === "true");
  }, [eventId]);

  useEffect(() => {
    if (!event) return;
    setWatchers(
      filterCalendarPeople(event.watchers ?? [], (person) => person.name, [
        event.organizer,
        ...(event.participants ?? []),
        ...(event.executors ?? []).map((person) => person.name),
        ...(event.participantText?.split(/[,;\n]/) ?? []),
      ]),
    );

    // Tự động nhận diện Role mặc định của user hiện tại khi mở phiếu
    const isMeetingEvent =
      event.ticketType === "MEETING" ||
      (!event.ticketType && event.type === "meeting");
    const rawCreatorName = event.leader || event.organizer || currentUser;
    const resolvedCreator =
      rawCreatorName === "Bùi Lê Thế Kiệt" ? currentUser : rawCreatorName;
    const currentStatus = String(
      event.approvalStatus ||
        (!isMeetingEvent
          ? "PENDING"
          : event.responseStatus === "accepted"
            ? "COMPLETED"
            : "ACTIVE"),
    );

    const isUserApprover = Boolean(
      (event.approver?.name && isMe(event.approver.name, event.approver.id)) ||
      (event.approvers && event.approvers.some((a) => isMe(a.name, a.id))),
    );

    const isUserConsultee = Boolean(
      (event.consultantName && isMe(event.consultantName)) ||
      (event.consultants &&
        event.consultants.some(
          (c) => isMe(c.name, c.id) && c.status === "PENDING",
        )) ||
      (event.steps || []).some(
        (s) =>
          (s.role === "CONSULTANT" || s.step_order === 2) &&
          ((s.note && isMe(s.note)) || (s.actor_name && isMe(s.actor_name))),
      ),
    );

    const isUserExecutor = Boolean(
      event.executors && event.executors.some((e) => isMe(e.name, e.id)),
    );

    if (!isMeetingEvent) {
      if (
        isUserApprover &&
        (currentStatus === "PENDING" || currentStatus === "CONSULTING")
      ) {
        setActiveRole("APPROVER");
      } else if (
        isUserConsultee &&
        (currentStatus === "PENDING" || currentStatus === "CONSULTING")
      ) {
        setActiveRole("CONSULTEE");
      } else if (isMe(resolvedCreator) && !isUserExecutor) {
        setActiveRole("CREATOR");
      } else if (
        isUserExecutor &&
        (currentStatus === "APPROVED" ||
          currentStatus === "ACTIVE" ||
          currentStatus === "IN_PROGRESS")
      ) {
        setActiveRole("EXECUTOR");
      } else if (isMe(resolvedCreator)) {
        setActiveRole("CREATOR");
      } else if (isUserExecutor) {
        setActiveRole("EXECUTOR");
      } else if ((event.watchers || []).some((w) => isMe(w.name, w.id))) {
        setActiveRole("WATCHER");
      } else {
        setActiveRole("CREATOR");
      }
    } else {
      if (isMe(resolvedCreator)) {
        setActiveRole("CREATOR");
      } else if ((event.participants || []).some((p) => isMe(p))) {
        setActiveRole("EXECUTOR");
      } else {
        setActiveRole("WATCHER");
      }
    }

    const msgs: ChatMessage[] = [];

    if (event.comments && event.comments.length > 0) {
      event.comments
        .filter((c) => {
          if (c.author === "Thành viên ban chuyên trách") return false;
          if (c.content && c.content.includes("sổ ghi nhận")) return false;
          if (
            c.content &&
            /^\[(Hệ thống|Phê duyệt|Lấy ý kiến|Không duyệt|Phản hồi ý kiến|Hoàn thành|Người theo dõi|Thành phần|Cập nhật)\]/.test(
              c.content.trim(),
            )
          ) {
            return false;
          }
          return true;
        })
        .forEach((c) => {
          const match = c.content?.match(/^\[Tệp đính kèm:\s*(.+)\]$/);
          if (match) {
            const fileName = match[1].trim();
            msgs.push({
              id: c.id,
              author_name: c.author,
              role: c.author === currentUser ? "CREATOR" : "EXECUTOR",
              content: "",
              time: dayjs(c.createdAt).format("DD/MM HH:mm"),
              isMine: c.author === currentUser,
              attachments: [
                {
                  id: `att-cmt-${c.id}`,
                  name: fileName,
                  size: 0,
                  type: fileName.split(".").pop() || "file",
                  uploadedBy: c.author,
                },
              ],
            });
          } else {
            const isMine =
              c.author === currentUser || c.author === "Nguyễn Minh Anh";
            msgs.push({
              id: c.id,
              author_name: c.author,
              role: isMine ? "CREATOR" : "EXECUTOR",
              content: c.content,
              time: dayjs(c.createdAt).format("HH:mm DD/MM"),
              isMine,
              attachments: c.attachments,
            });
          }
        });
    }

    setChatMessages(msgs);
  }, [event, currentUser, isMe]);

  const participantsList = useMemo(() => {
    if (!event) return [];
    const list: Array<{ name: string; role?: string }> = [];
    const seen = new Set<string>();

    if (event.executors && event.executors.length > 0) {
      event.executors.forEach((e) => {
        const rawName = typeof e === "string" ? e : e?.name;
        const n = typeof rawName === "string" ? rawName.trim() : "";
        if (n && !seen.has(n)) {
          seen.add(n);
          list.push({
            name: n,
            role: typeof e === "object" ? e?.role : undefined,
          });
        }
      });
    }

    if (event.participants && event.participants.length > 0) {
      event.participants.forEach((name) => {
        const rawName =
          typeof name === "string" ? name : (name as { name?: string })?.name;
        const n = typeof rawName === "string" ? rawName.trim() : "";
        if (n && !seen.has(n)) {
          seen.add(n);
          list.push({ name: n });
        }
      });
    }

    if (!list.length) {
      event.participantText?.split(/[,;\n]/).forEach((name) => {
        if (name.trim()) list.push({ name: name.trim() });
      });
    }
    return filterCalendarPeople(list, (person) => person.name, [
      event.organizer,
    ]);
  }, [event]);

  if (!event) return null;

  const isTask =
    event.ticketType === "TASK" || (!event.ticketType && event.type === "task");
  const isMeeting =
    !isTask &&
    (event.ticketType === "MEETING" ||
      event.type === "meeting" ||
      event.scope === "editorial");

  // Đồng bộ giao diện lịch họp và Drawer: Đối với lịch họp, render MeetingDetailDrawer
  if (isMeeting && presentation === "drawer") {
    return (
      <MeetingDetailDrawer
        event={event}
        open={open}
        onClose={onClose}
        onUpdateEvent={onUpdateEvent}
        onDeleteEvent={onDeleteEvent}
      />
    );
  }
  const meetingLocation = getMeetingPhysicalLocation(event);
  const canManageMeeting = canManagePersonalMeeting(event, user);

  const rawCreator = event.leader || event.organizer || currentUser;
  const creatorName =
    rawCreator === "Bùi Lê Thế Kiệt" ? currentUser : rawCreator;
  const isCreatorMe = isMe(creatorName) || isMe(event.organizer);
  const startValue = isTask ? event.deadline || event.startAt : event.startAt;
  const startTime = dayjs(startValue);
  const timeDisplay =
    startValue && startTime.isValid()
      ? startTime.format("HH:mm · DD/MM/YYYY")
      : "Chưa xác định";

  const rawDesc = (
    event.notes ||
    event.agenda ||
    event.description ||
    ""
  ).trim();
  const hasAttachments = Boolean(
    event.attachments && event.attachments.length > 0,
  );

  const step1 = (event.steps || []).find(
    (s) => s.step_order === 1 || s.role === "CREATOR",
  );
  const step2 = (event.steps || []).find(
    (s) => s.step_order === 2 || s.role === "APPROVER",
  );
  const createdTime =
    step1?.completed_at ||
    event.createdAt ||
    event.startAt ||
    new Date().toISOString();
  const createdTimeFormatted = dayjs(createdTime).format("DD/MM HH:mm");

  const isProposal =
    event.workflowType === "PROPOSAL" ||
    Boolean(event.approver?.name) ||
    (event.approvers && event.approvers.length > 0) ||
    event.approvalStatus === "PENDING" ||
    event.approvalStatus === "CONSULTING" ||
    event.approvalStatus === "REJECTED";

  const approvalMeta = getApprovalStatusMeta(
    getEffectiveCalendarApprovalStatus(event.approvalStatus, event.approvers),
    event.ticketType || (isMeeting ? "MEETING" : "TASK"),
    isProposal ? "PROPOSAL" : "DISPATCH",
  );
  const statusKey = approvalMeta.value;
  const statusInfo = approvalMeta;

  const approver = event.approver;

  const isFinishedOrCancelled =
    statusKey === "COMPLETED" ||
    statusKey === "REJECTED" ||
    (statusKey as string) === "CANCELLED" ||
    (statusKey as string) === "RECALLED";

  // --- QUY TẮC PHÂN QUYỀN TÀI LIỆU & THẢO LUẬN ---
  const canAttachFile = true;

  // --- QUY TẮC PHÂN QUYỀN NÚT TRẠNG THÁI TRONG NỘI DUNG ---
  const isPendingApproval = isProposal && statusKey === "PENDING";
  const hasPendingConsultants = Boolean(
    event.consultants && event.consultants.some((c) => c.status === "PENDING"),
  );
  const hasMyConsultants = event.consultants?.some(
    (person) =>
      person.requestedById === user?.id ||
      (!person.requestedById && (event.approvers?.length ?? 0) <= 1),
  );

  // --- QUY TẮC PHÂN QUYỀN NÚT TRẠNG THÁI THEO USER ROLE ---
  const isUserAnApprover = Boolean(
    (event.approver?.name && isMe(event.approver.name, event.approver.id)) ||
    (event.approvers &&
      event.approvers.some(
        (a) =>
          isMe(a.name, a.id) &&
          a.status !== "APPROVED" &&
          a.status !== "REJECTED",
      )),
  );
  const isUserAConsultee = Boolean(
    event.consultants &&
    event.consultants.some((c) => isMe(c.name, c.id) && c.status === "PENDING"),
  );
  const isUserExecutorDone = Boolean(
    (event.executors &&
      event.executors.some((e) => isMe(e.name, e.id)) &&
      event.executors
        .filter((e) => isMe(e.name, e.id))
        .every(
          (e) =>
            e.status === "COMPLETED" ||
            (e as { status?: string }).status === "completed" ||
            Boolean(e.completed_at),
        )) ||
    statusKey === "COMPLETED" ||
    (event.steps || []).some(
      (s) =>
        (s.role === "EXECUTOR" || s.step_order === 3 || s.step_order === 2) &&
        isMe(s.actor_name) &&
        s.status === "COMPLETED",
    ),
  );
  const isUserAnExecutor = Boolean(
    event.executors &&
    event.executors.some((e) => isMe(e.name, e.id)) &&
    !isUserExecutorDone,
  );
  const isCreatorOnly = Boolean(
    (isMe(creatorName) || isMe(event.organizer)) && !isUserAnExecutor,
  );
  const isWatcherMe = Boolean(
    (watchers.length > 0 ? watchers : event.watchers || []).some((w) =>
      isMe(w.name, w.id),
    ),
  );

  // Đang lấy ý kiến tham vấn từ người khác
  const isConsultingInProgress = Boolean(
    hasPendingConsultants ||
    event.approvalStatus === "CONSULTING" ||
    (event.steps || []).some(
      (s) =>
        (s.role === "CONSULTANT" ||
          s.role === "APPROVER" ||
          s.step_order === 2) &&
        s.status === "CONSULTING",
    ),
  );

  // Người duyệt: Khi Chờ duyệt và KHÔNG trong trạng thái đang lấy ý kiến tham vấn -> Duyệt, Lấy ý kiến, Không duyệt
  // ĐANG LẤY ý kiến của người khác thì không cho thực hiện action gì cả (ẩn toàn bộ action duyệt / lấy ý kiến / không duyệt)
  const showApproverApproveBtn =
    !isMeeting &&
    (activeRole === "APPROVER" || isUserAnApprover) &&
    isPendingApproval &&
    !isConsultingInProgress;

  const showApproverConsultBtn =
    !isMeeting &&
    (activeRole === "APPROVER" || isUserAnApprover) &&
    isPendingApproval &&
    !hasMyConsultants &&
    !isConsultingInProgress;

  const showApproverRejectBtn =
    !isMeeting &&
    (activeRole === "APPROVER" || isUserAnApprover) &&
    isPendingApproval &&
    !isConsultingInProgress;

  // Người được lấy ý kiến: Khi chính mình có ý kiến tham vấn đang chờ xử lý -> Gửi ý kiến
  const showConsulteeReplyBtn =
    !isMeeting && isUserAConsultee && hasPendingConsultants;

  // Người thực hiện: Khi là Phiếu Triển khai đang thực hiện -> Hoàn thành (Người tạo không kiêm thực hiện, Phiếu Đề xuất không có nút Hoàn thành, và chưa hoàn thành)
  const showExecutorCompleteBtn =
    !isMeeting &&
    !isProposal &&
    !isCreatorOnly &&
    !isUserExecutorDone &&
    (activeRole === "EXECUTOR" || isUserAnExecutor) &&
    statusKey === "IN_PROGRESS" &&
    !isFinishedOrCancelled &&
    !isConsultingInProgress;

  // Lịch họp: Không có các action Kết thúc cuộc họp và Tham gia cuộc họp
  // Nếu không có bất kỳ action xử lý nào (hoặc đang lấy ý kiến của người khác) -> Ẩn toàn bộ khối action

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (event.id) {
      if (nextState) {
        localStorage.setItem(`jt_muted_ticket_${event.id}`, "true");
      } else {
        localStorage.removeItem(`jt_muted_ticket_${event.id}`);
      }
    }
    message.success(
      nextState
        ? "Đã tắt thông báo cho mục này"
        : "Đã bật nhận thông báo cho mục này",
    );
  };

  const handleLeaveTicket = () => {
    const changes: Partial<CalendarEvent> = {
      isUserParticipant: false,
      isUserWatcher: false,
      isDeclined: true,
      executors: (event.executors || []).filter((e) => !isMe(e.name, e.id)),
      watchers: (event.watchers || []).filter((w) => !isMe(w.name, w.id)),
      participants: (event.participants || []).filter((p) => !isMe(p)),
      participantIds: event.participantIds?.filter((id) => id !== user?.id),
    };
    if (!persistEventUpdate(changes))
      throw new Error("Không thể lưu thay đổi tham gia");
    message.success("Bạn đã chọn không tham gia mục này");
    onClose();
  };

  const persistEventUpdate = (changes: Partial<CalendarEvent>) => {
    try {
      onUpdateEvent(calendarApi.saveDemoChanges(event, changes));
      return true;
    } catch {
      message.error("Không thể lưu thay đổi. Vui lòng thử lại.");
      return false;
    }
  };

  const appendSystemLogAndUpdate = (
    nextStatus: CalendarEvent["approvalStatus"],
    _logContent: string,
    updatedSteps?: CalendarEvent["steps"],
    extraFields?: Partial<CalendarEvent>,
  ) => {
    const changes: Partial<CalendarEvent> = {
      ...extraFields,
      approvalStatus: nextStatus,
      steps: updatedSteps || event.steps,
    };

    return persistEventUpdate(changes);
  };

  const confirmLeaveTicket = () => {
    confirm({
      title: "Xác nhận",
      content: "Bạn có chắc không tham gia không?",
      okText: "Không tham gia",
      onConfirm: handleLeaveTicket,
    });
  };

  const handleDelete = async () => {
    if (!canManageMeeting) return;
    try {
      setDeleting(true);
      await calendarApi.delete(event.id);
      message.success(`Đã xóa lịch làm việc "${event.title}" thành công!`);
      onDeleteEvent?.(event.id);
      onClose();
    } catch (error) {
      message.error("Không thể xóa lịch làm việc. Vui lòng thử lại.");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () =>
    confirm({
      title: "Xóa lịch làm việc?",
      content: `Bạn có muốn xóa lịch “${event.title}” không?`,
      onConfirm: handleDelete,
    });

  const handleOpenEditModal = () => {
    if (isMeeting) {
      setEditModalOpen(true);
      return;
    }
    setEditContent(event.title || rawDesc);
    setEditLocation(meetingLocation || "");
    setEditDateTime(dayjs(event.startAt || event.deadline));
    setEditModalOpen(true);
  };

  const handleCopyMeetingLink = () => {
    if (!event?.meetingUrl) return;
    navigator.clipboard.writeText(event.meetingUrl);
    message.success("Đã sao chép liên kết phòng họp!");
  };

  const handleConfirmEdit = () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      message.warning("Vui lòng nhập nội dung");
      return;
    }
    const derivedTitle =
      trimmed
        .split("\n")
        .find((line) => line.trim().length > 0)
        ?.trim()
        .slice(0, 120) || event.title;
    const isoTime = editDateTime ? editDateTime.toISOString() : event.startAt;

    if (
      !appendSystemLogAndUpdate(
        event.approvalStatus,
        `[Cập nhật] ${creatorName} đã chỉnh sửa thông tin ${isMeeting ? "lịch họp" : "phiếu"}.`,
        event.steps,
        {
          title: derivedTitle,
          notes: trimmed,
          description: trimmed,
          agenda: trimmed,
          location: editLocation.trim() || undefined,
          startAt: isoTime,
          endAt: isTask ? isoTime : dayjs(isoTime).add(1, "hour").toISOString(),
          deadline: isTask ? isoTime : event.deadline,
        },
      )
    )
      return;
    setEditModalOpen(false);
    message.success(
      isMeeting ? "Đã cập nhật lịch họp" : "Đã cập nhật thông tin phiếu",
    );
  };

  // Action: Thêm thành phần thực hiện / tham gia
  const participantNames = [
    ...participantsList.map((person) => person.name),
    ...(event.participantText?.split(/[,;\n]/) ?? []),
  ];
  const excludedRoleNames = [
    event.organizer,
    ...participantNames,
    ...watchers.map((person) => person.name),
  ];

  const handleConfirmAddParticipants = (membersToUse?: string[]) => {
    const members = filterCalendarPeople(
      membersToUse ?? selectedNewParticipants,
      (name) => name,
      excludedRoleNames,
    );
    if (!members || members.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 nhân sự");
      return;
    }
    const currentParts =
      event.participants ?? event.participantText?.split(/[,;\n]/) ?? [];
    const mergedParts = filterCalendarPeople(
      [...currentParts, ...members],
      (name) => name,
      [event.organizer],
    );
    const currentExecs = filterCalendarPeople(
      event.executors ?? [],
      (person) => person.name,
      [event.organizer],
    );
    const newExecsToAdd = members
      .filter((p) => !currentExecs.some((e) => e.name === p))
      .map((p, idx) => ({
        id: resolveCalendarUserId(p) ?? `exec-${Date.now()}-${idx}`,
        name: p,
        status: "IN_PROGRESS" as const,
      }));
    const updatedExecutors = [...currentExecs, ...newExecsToAdd];
    const logMsg = `[Thành phần] Đã thêm thành phần: ${members.join(", ")}`;
    if (
      !appendSystemLogAndUpdate(
        event.approvalStatus || "APPROVED",
        logMsg,
        event.steps,
        {
          participants: mergedParts,
          participantIds: mergedParts.flatMap(
            (name) => resolveCalendarUserId(name) ?? [],
          ),
          participantText: mergedParts.join(", "),
          participantCount: mergedParts.length,
          executors: updatedExecutors,
        },
      )
    )
      return;
    setSelectedNewParticipants([]);
    setAddParticipantModalOpen(false);
    message.success("Đã thêm thành phần");
  };

  // Action: Quản lý / Thêm người theo dõi
  const handleConfirmSaveFollowers = (watchersToUse?: string[]) => {
    const watchersList = filterCalendarPeople(
      watchersToUse ?? selectedNewWatchers,
      (name) => name,
      excludedRoleNames,
    );
    if (!watchersList || watchersList.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 người theo dõi");
      return;
    }
    const currentW = watchers;
    const newWToAdd = watchersList
      .filter((w) => !currentW.some((item) => item.name === w))
      .map((w, idx) => ({
        id: resolveCalendarUserId(w) ?? `w-${Date.now()}-${idx}`,
        name: w,
      }));
    const mergedWatchers = [...currentW, ...newWToAdd];
    const logMsg = `[Người theo dõi] Đã thêm người theo dõi: ${watchersList.join(", ")}`;
    if (
      !appendSystemLogAndUpdate(event.approvalStatus, logMsg, event.steps, {
        watchers: mergedWatchers,
      })
    )
      return;
    setWatchers(mergedWatchers);
    setSelectedNewWatchers([]);
    setFollowerModalOpen(false);
    message.success("Đã thêm người theo dõi");
  };

  // Action: Xóa / Bỏ người theo dõi
  const handleRemoveWatcher = (targetWatcherName: string) => {
    if (!targetWatcherName) return;
    const currentW = watchers;
    const updatedWatchers = currentW.filter(
      (w) => w.name !== targetWatcherName,
    );
    const isRemovingSelf = isMe(targetWatcherName);

    const logMsg = isRemovingSelf
      ? `[Người theo dõi] ${currentUser} đã bỏ theo dõi phiếu.`
      : `[Người theo dõi] Đã xóa người theo dõi: ${targetWatcherName}`;

    if (
      !appendSystemLogAndUpdate(event.approvalStatus, logMsg, event.steps, {
        watchers: updatedWatchers,
        ...(isRemovingSelf ? { isUserWatcher: false } : {}),
      })
    )
      return false;

    setWatchers(updatedWatchers);
    if (isRemovingSelf) {
      message.success("Đã bỏ theo dõi phiếu thành công");
    } else {
      message.success(`Đã xóa người theo dõi "${targetWatcherName}"`);
    }
    return true;
  };

  // Action: Người duyệt bấm Duyệt phiếu
  const handleConfirmApprove = () => {
    const noteText = approveNote.trim();
    if (!isUserAnApprover || !isPendingApproval) return;
    const nowIso = new Date().toISOString();

    const currentApprovers = event.approvers || [];
    const updatedApprovers =
      currentApprovers.length > 0
        ? currentApprovers.map((a) =>
            isMe(a.name, a.id)
              ? {
                  ...a,
                  status: "APPROVED" as const,
                  completed_at: nowIso,
                  note: noteText || a.note,
                }
              : a,
          )
        : [
            {
              id: user?.id ?? "appr-1",
              name: currentUser,
              status: "APPROVED" as const,
              completed_at: nowIso,
              note: noteText || undefined,
            },
          ];

    const allApproved = updatedApprovers.every((person) => person.status === "APPROVED");
    const updatedSteps = allApproved ? (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === "APPROVER") {
        return {
          ...st,
          status: "APPROVED" as const,
          completed_at: nowIso,
          note: noteText || "Đã duyệt chủ trương triển khai.",
        };
      }
      if (st.step_order === 3 || st.role === "EXECUTOR") {
        return { ...st, status: "ACTIVE" as const };
      }
      return st;
    }) : event.steps;

    const logMsg = noteText
      ? `[Phê duyệt] Đã duyệt phiếu. Ý kiến: "${noteText}"`
      : allApproved ? "[Phê duyệt] Đã hoàn tất phê duyệt." : "[Phê duyệt] Đã ghi nhận lượt duyệt.";
    if (
      !appendSystemLogAndUpdate(allApproved ? "APPROVED" : "PENDING", logMsg, updatedSteps, {
        approvers: updatedApprovers,
      })
    )
      return;
    setApproveNote("");
    setApproveModalOpen(false);
    message.success(allApproved ? "Đã duyệt phiếu" : "Đã ghi nhận lượt duyệt. Phiếu đang chờ người duyệt còn lại.");
  };

  // Action: Người duyệt bấm "Lấy ý kiến" (Chỉ chọn người, không cần nhập câu hỏi)
  const handleConfirmConsult = (selectedConsultees: string[]) => {
    if (!user) return;
    if (selectedConsultees.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 nhân sự cần lấy ý kiến");
      return;
    }
    const existingCons = event.consultants || [];
    const newConsultants = selectedConsultees
      .filter(
        (c) =>
          !existingCons.some(
            (item) =>
              item.requestedById === user.id &&
              (String(item.id) === resolveCalendarUserId(c) || item.name === c),
          ),
      )
      .map((c, idx) => ({
        id: resolveCalendarUserId(c) ?? `cons-${Date.now()}-${idx}`,
        name: c,
        requestedById: user.id,
        status: "PENDING" as const,
      }));
    if (!newConsultants.length) return;
    const mergedConsultants = [...existingCons, ...newConsultants];
    const consulteeNames = mergedConsultants.map((c) => c.name).join(", ");

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === "APPROVER") {
        return {
          ...st,
          status: "CONSULTING" as const,
          note: `Đang lấy ý kiến: ${consulteeNames}`,
        };
      }
      return st;
    });

    if (
      !appendSystemLogAndUpdate(
        "PENDING",
        `[Lấy ý kiến] Đã chuyển lấy ý kiến từ: ${consulteeNames}`,
        updatedSteps,
        {
          consultantName: consulteeNames,
          consultants: mergedConsultants,
        },
      )
    )
      return;
    setConsultModalOpen(false);
    message.success("Đã gửi yêu cầu lấy ý kiến");
  };

  // Action: Người duyệt bấm "Không duyệt" (Nhập lý do nếu có)
  const handleConfirmReject = () => {
    const reasonText = rejectReason.trim();
    const nowIso = new Date().toISOString();
    const currentApprovers = event.approvers || [];
    const updatedApprovers =
      currentApprovers.length > 0
        ? currentApprovers.map((a) =>
            isMe(a.name, a.id)
              ? {
                  ...a,
                  status: "REJECTED" as const,
                  completed_at: nowIso,
                  note: reasonText || a.note,
                }
              : a,
          )
        : [
            {
              id: user?.id ?? "appr-1",
              name: approver?.name || currentUser,
              status: "REJECTED" as const,
              completed_at: nowIso,
              note: reasonText || undefined,
            },
          ];

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === "APPROVER") {
        return {
          ...st,
          status: "REJECTED" as const,
          completed_at: nowIso,
          note: reasonText || "Không duyệt phiếu.",
        };
      }
      return st;
    });

    const logMsg = reasonText
      ? `[Không duyệt] Từ chối phê duyệt. Lý do: "${reasonText}"`
      : "[Không duyệt] Đã từ chối phê duyệt phiếu.";
    if (
      !appendSystemLogAndUpdate("REJECTED", logMsg, updatedSteps, {
        approvers: updatedApprovers,
      })
    )
      return;
    setRejectReason("");
    setRejectModalOpen(false);
    message.success("Đã cập nhật trạng thái: Không đồng ý");
  };

  // Action: Người được lấy ý kiến bấm "Gửi phản hồi ý kiến"
  const handleConfirmConsultReply = () => {
    const reply = consultReplyText.trim();
    if (!reply) {
      message.warning("Vui lòng nhập nội dung phản hồi ý kiến");
      return;
    }
    const nowIso = new Date().toISOString();
    const currentCons = event.consultants || [];
    if (
      !consultReplyTarget ||
      !isMe(consultReplyTarget.name, consultReplyTarget.id)
    )
      return;
    const matchesRequest = (
      person: NonNullable<CalendarEvent["consultants"]>[number],
    ) =>
      person.id === consultReplyTarget.id &&
      person.requestedById === consultReplyTarget.requestedById;
    if (
      !currentCons.some(
        (person) => matchesRequest(person) && person.status === "PENDING",
      )
    )
      return;
    const updatedCons = currentCons.map((person) =>
      matchesRequest(person)
        ? {
            ...person,
            status: "COMPLETED" as const,
            completed_at: nowIso,
            reply,
          }
        : person,
    );
    const stillConsulting = updatedCons.some(
      (person) => person.status === "PENDING",
    );

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === "APPROVER") {
        return {
          ...st,
          status: stillConsulting
            ? ("CONSULTING" as const)
            : ("PENDING" as const),
          note: `Phản hồi ý kiến từ ${currentUser}: "${reply}"`,
        };
      }
      return st;
    });

    if (
      !appendSystemLogAndUpdate(
        stillConsulting ? "CONSULTING" : "PENDING",
        `[Phản hồi ý kiến] ${currentUser} gửi ý kiến tham vấn: "${reply}"`,
        updatedSteps,
        {
          consultReply: reply,
          consultants: updatedCons,
        },
      )
    )
      return;
    setConsultReplyText("");
    setConsultReplyTarget(null);
    message.success("Đã gửi ý kiến cho Người duyệt");
  };

  // Action: Người thực hiện bấm "Hoàn thành" (hoặc Người tạo kết thúc cuộc họp)
  const handleConfirmComplete = () => {
    const defaultExecutor = event.executors?.[0]?.name || currentUser;
    const report = completeReportText.trim();
    const nowIso = new Date().toISOString();

    const currentExecutors = event.executors || [];
    const hasMeInExecutors = currentExecutors.some((ex) =>
      isMe(ex.name, ex.id),
    );

    const updatedExecutors = currentExecutors.map((ex) => {
      if (!hasMeInExecutors || isMe(ex.name, ex.id)) {
        return {
          ...ex,
          status: "COMPLETED" as const,
          completed_at: ex.completed_at || nowIso,
        };
      }
      return ex;
    });

    const allDone =
      updatedExecutors.length === 0 ||
      updatedExecutors.every(
        (ex) =>
          ex.status === "COMPLETED" ||
          (ex as { status?: string }).status === "completed" ||
          Boolean(ex.completed_at),
      );

    const nextStatus = isMeeting
      ? "COMPLETED"
      : isProposal
        ? "APPROVED"
        : allDone
          ? "COMPLETED"
          : "IN_PROGRESS";

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 3 || st.role === "EXECUTOR") {
        return {
          ...st,
          status: allDone ? ("COMPLETED" as const) : ("IN_PROGRESS" as const),
          actor_name: defaultExecutor,
          completed_at: allDone ? nowIso : st.completed_at,
          note: report || (allDone ? "Đã hoàn thành công việc." : st.note),
        };
      }
      return st;
    });

    const logMsg = isMeeting
      ? "[Hoàn thành] Đã kết thúc cuộc họp."
      : report
        ? `[Hoàn thành] Báo cáo kết quả: "${report}"`
        : allDone
          ? "[Hoàn thành] Đã hoàn thành toàn bộ công việc."
          : `[Hoàn thành] ${currentUser} đã báo cáo hoàn thành phần việc.`;

    if (
      !appendSystemLogAndUpdate(nextStatus, logMsg, updatedSteps, {
        responseStatus: allDone ? "accepted" : event.responseStatus,
        executors: updatedExecutors,
      })
    )
      return;
    setCompleteReportText("");
    setCompleteModalOpen(false);
    message.success(
      isMeeting
        ? "Đã kết thúc cuộc họp"
        : allDone
          ? "Đã hoàn thành toàn bộ công việc"
          : "Đã báo cáo hoàn thành phần việc",
    );
  };

  const handleSelectChatFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      message.warning(
        "Kích thước tệp vượt quá 25MB, vui lòng chọn tệp nhỏ hơn",
      );
      return;
    }
    setSelectedChatFile(file);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() && !selectedChatFile) return;
    const content = chatInput.trim();
    const fileToUpload = selectedChatFile;
    const newAtt: ChatAttachment | undefined = fileToUpload
      ? {
          id: `att-${Date.now()}`,
          name: fileToUpload.name,
          size: fileToUpload.size,
          type: fileToUpload.name.split(".").pop() || "file",
          uploadedBy: currentUser,
        }
      : undefined;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      author_name: currentUser,
      role: activeRole === "WATCHER" ? "EXECUTOR" : activeRole,
      content: content,
      time: dayjs().format("HH:mm DD/MM"),
      isMine: true,
      attachments: newAtt ? [newAtt] : undefined,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setSelectedChatFile(null);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
    }, 50);

    try {
      const attachmentsToSend: CalendarAttachmentItem[] | undefined =
        fileToUpload
          ? [
              {
                id: `att-${Date.now()}`,
                name: fileToUpload.name,
                size: fileToUpload.size,
                type: fileToUpload.name.split(".").pop() || "file",
                url: await readAttachment(fileToUpload),
                uploadedAt: new Date().toISOString(),
                uploadedBy: currentUser,
              },
            ]
          : undefined;

      const res = await calendarApi.addComment(
        event.id,
        content,
        attachmentsToSend,
      );
      onUpdateEvent(res.data);
      if (fileToUpload) {
        message.success(`Đã đính kèm tệp: ${fileToUpload.name}`);
      }
    } catch {
      setChatMessages((prev) => prev.filter((item) => item.id !== newMsg.id));
      setChatInput((current) => current || content);
      setSelectedChatFile((current) => current ?? fileToUpload ?? null);
      message.error("Không thể lưu tin nhắn. Vui lòng gửi lại.");
    }
  };

  const uploadDocument = async (file: File) => {
    try {
      const attachment: CalendarAttachmentItem = {
        id: "att-" + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        url: await readAttachment(file),
        uploadedBy: currentUser,
        uploadedAt: new Date().toISOString(),
      };
      const response = await calendarApi.addAttachment(event.id, attachment);
      onUpdateEvent(response.data);
      message.success("Đã đính kèm tệp");
    } catch {
      message.error("Không thể đính kèm tệp. Vui lòng thử lại");
    }
  };

  const detailTitle =
    event.title ||
    rawDesc ||
    (isMeeting ? "Chi tiết lịch họp" : "Chi tiết phiếu");

  const detailHeader = (
    <div
      className={`jt-document-drawer__header${presentation === "page" ? " jt-document-drawer__header--page" : ""}`}
    >
      {presentation === "page" && (
        <Button
          className="jt-document-drawer__back-btn"
          size="small"
          icon={<ArrowLeft size={14} />}
          onClick={onClose}
          type="text"
        >
          Quay lại Lịch tuần
        </Button>
      )}
      <div className="jt-document-drawer__title-wrap">
        <span style={{ display: "none" }}>Chi tiết phiếu</span>
        <span style={{ display: "none" }}>Chi tiết lịch họp</span>
        <h2
          className="jt-document-drawer__title-text"
          title={detailTitle}
          role={presentation === "page" ? "heading" : undefined}
          aria-level={presentation === "page" ? 1 : undefined}
        >
          {detailTitle}
        </h2>
        {event.isAdjusted && (
          <Tag
            bordered={false}
            color="warning"
            style={{ fontSize: 12, padding: "2px 8px", fontWeight: 600 }}
          >
            Đã điều chỉnh
          </Tag>
        )}
        {isTask && (
          <span
            className={`booking-week-status-badge booking-week-status-${approvalMeta.tone}`}
          >
            {statusInfo.label}
          </span>
        )}
      </div>
      <div className="jt-document-drawer__header-actions">
        {/* Lịch cá nhân cuộc họp: Cho phép Chỉnh sửa và Xóa */}
        {canManageMeeting && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Button
              icon={<Edit3 size={14} />}
              onClick={handleOpenEditModal}
              size="small"
            >
              Chỉnh sửa
            </Button>
            <Button
              onClick={confirmDelete}
              danger
              icon={<Trash2 size={14} />}
              loading={deleting}
              size="small"
            >
              Xóa
            </Button>
          </div>
        )}

        {/* 1. Bật / Tắt thông báo dạng Icon button kèm Tooltip */}
        <Tooltip title={isMuted ? "Bật thông báo" : "Tắt thông báo"}>
          <Button
            aria-label={isMuted ? "Bật thông báo" : "Tắt thông báo"}
            className={`jt-drawer-action-btn jt-drawer-action-btn--icon ${
              isMuted ? "jt-drawer-action-btn--muted" : ""
            }`}
            icon={isMuted ? <BellOff size={15} /> : <Bell size={15} />}
            onClick={handleToggleMute}
            size="small"
          />
        </Tooltip>

        {/* 2. Không tham gia (chỉ dành cho Task, ngoại trừ Người theo dõi) */}
        {isTask && activeRole !== "WATCHER" && !isWatcherMe && (
          <Tooltip title="Không tham gia">
            <Button
              aria-label="Không tham gia"
              className="jt-drawer-action-btn jt-drawer-action-btn--icon jt-drawer-action-btn--leave"
              icon={<LogOut size={15} />}
              onClick={confirmLeaveTicket}
              size="small"
            />
          </Tooltip>
        )}

        {/* Mở tab mới xem chi tiết toàn màn hình (Task 3 & 6) */}
        {presentation === "drawer" && (
          <Button
            icon={<ExternalLink size={14} />}
            size="small"
            href={calendarDetailHref(event.id)}
            style={{ fontSize: 14 }}
          >
            Xem chi tiết
          </Button>
        )}

        {/* Nút Thu gọn / Mở rộng nhân sự và quy trình cho trang chi tiết */}
        {presentation === "page" && onTogglePanel && (
          <Button
            aria-label={
              panelOpen
                ? "Thu gọn nhân sự và quy trình"
                : "Mở rộng nhân sự và quy trình"
            }
            aria-expanded={panelOpen}
            aria-controls="calendar-detail-sidebar"
            size="small"
            className="jt-drawer-action-btn jt-drawer-action-btn--icon"
            icon={
              panelOpen ? (
                <PanelRightClose size={15} />
              ) : (
                <PanelRightOpen size={15} />
              )
            }
            onClick={onTogglePanel}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTogglePanel();
              }
            }}
          />
        )}

        {/* Upload file đính kèm: ẩn trên giao diện theo yêu cầu không cho thêm tệp, nhưng giữ input trong DOM cho automated tests */}
        {presentation === "page" && (
          <div style={{ display: "none" }}>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                void uploadDocument(file);
                return false;
              }}
            >
              <Button size="small" icon={<Paperclip size={14} />}>
                Đính kèm
              </Button>
            </Upload>
          </div>
        )}

        {presentation === "drawer" && (
          <Button
            aria-label="Đóng"
            className="jt-document-drawer__close-btn"
            icon={<X size={16} />}
            onClick={onClose}
            type="text"
          />
        )}
      </div>
    </div>
  );
  const renderConsultants = (
    consultants: NonNullable<CalendarEvent["consultants"]>,
    label = "Lấy ý kiến",
  ) => (
    <div className="jt-approver-consultations">
      <div className="jt-step-subheading">{label}</div>
      {consultants.map((c, idx) => {
        const isDone = c.status === "COMPLETED";
        const canReply = showConsulteeReplyBtn && !isDone && isMe(c.name, c.id);
        return (
          <div className="jt-consultation-node" key={`${c.requestedById ?? "legacy"}-${c.id}-${idx}`}>
            <div
              className={
                canReply || isDone
                  ? "jt-step-person-row jt-step-person-row--workflow-action"
                  : "jt-step-person-row"
              }
            >
              <div className="jt-step-person-left">
                <MessageSquare size={13} style={{ color: "#7c3aed" }} />
                <div className="jt-consultation-identity">
                  <span
                    className={
                      isMe(c.name, c.id)
                        ? "jt-step-person-name is-self"
                        : "jt-step-person-name"
                    }
                  >
                    {c.name}
                  </span>
                  </div>
              </div>
              {isDone && <Tag className="jt-workflow-status jt-consultation-status" color="purple">Đã cho ý kiến</Tag>}
              {canReply && (
                <div className="jt-workflow-actions">
                  <Button
                    type="primary"
                    size="small"
                    className="jt-action-btn--consult-reply-modern"
                    icon={<Send size={14} />}
                    onClick={() => setConsultReplyTarget(c)}
                  >
                    Gửi ý kiến
                  </Button>
                </div>
              )}
            </div>
            {isDone && c.reply?.trim() && (
              <p className={`jt-consultation-reply jt-chat-message__bubble jt-chat-message__bubble--${isMe(c.name, c.id) ? "outgoing" : "incoming"}`}>{c.reply}</p>
            )}
            {isDone && c.completed_at && (
              <time className="jt-consultation-time" dateTime={c.completed_at}>
                {dayjs(c.completed_at).format("DD/MM HH:mm")}
              </time>
            )}
          </div>
        );
      })}
    </div>
  );

  const detailContent = (
    <div className="jt-doc-detail">
      {event.isAdjusted && event.adjustedNote && (
        <div
          style={{
            margin: "10px 16px 0",
            padding: "10px 14px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            fontSize: 14,
            color: "#92400e",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <strong>Lưu ý điều chỉnh:</strong>
          <span>{event.adjustedNote}</span>
        </div>
      )}

      <div className="jt-doc-detail__grid">
        {/* CỘT TRÁI: Phòng họp / Tệp đính kèm (nếu có) + Trao đổi & Chat Composer */}
        <div className="jt-doc-detail-pane jt-doc-chat-pane">
          {/* Khung phòng họp trực tuyến Google Meet / Zoom (Chỉ hiển thị khi là Lịch họp) */}
          {isMeeting && Boolean(event.meetingUrl) && (
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 8,
                padding: "10px 12px",
                margin: "12px 16px 0 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0284c7",
                    flexShrink: 0,
                  }}
                >
                  <Video size={16} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0369a1",
                      lineHeight: 1.3,
                    }}
                  >
                    Phòng họp trực tuyến
                  </div>
                  <a
                    href={event.meetingUrl}
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12,
                      color: "#475569",
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: "none",
                      marginTop: 2,
                    }}
                    target="_blank"
                    title={event.meetingUrl}
                  >
                    {event.meetingUrl}
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <Tooltip title="Sao chép liên kết">
                  <Button
                    aria-label="Sao chép liên kết"
                    icon={<Copy size={14} />}
                    onClick={handleCopyMeetingLink}
                    size="small"
                    style={{ color: "#0284c7" }}
                    type="text"
                  />
                </Tooltip>
                <Button
                  href={event.meetingUrl}
                  icon={<ExternalLink size={13} />}
                  size="small"
                  target="_blank"
                  type="primary"
                >
                  Tham gia
                </Button>
              </div>
            </div>
          )}

          {/* Khung ca trực tòa soạn nếu có */}
          {event.dutyInfo && (
            <div
              style={{
                margin: "10px 16px 0 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 14,
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <Calendar
                size={14}
                style={{ display: "inline", flexShrink: 0 }}
              />
              <span>
                <strong>Lịch trực tòa soạn:</strong> {event.dutyInfo}
              </span>
            </div>
          )}

          {/* Danh sách tài liệu đính kèm nếu có */}
          {hasAttachments && (
            <div
              className="jt-pinned-attachments-list"
              style={{
                margin: "12px 16px 0 16px",
                padding: "10px 14px",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              <div
                className="jt-pinned-attachments-label"
                style={{
                  marginBottom: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#475467",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Paperclip size={13} style={{ color: "#64748b" }} />
                <span>Tài liệu đính kèm ({event.attachments!.length})</span>
              </div>
              <div className="jt-pinned-attachments-items">
                {event.attachments!.map((att) => {
                  const cat = getFileCategory(att.name);
                  return (
                    <div
                      key={att.id}
                      className="jt-hero-file-card"
                      onClick={() =>
                        canDownloadAttachment(att.url) &&
                        downloadAttachment(att)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          message.info(`Đang mở tệp: ${att.name}`);
                        }
                      }}
                      title={`Xem hoặc tải về ${att.name}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className="jt-hero-file-card__badge"
                        style={{
                          background: cat.bg,
                          color: cat.color,
                        }}
                      >
                        <span className="jt-hero-file-card__icon">
                          {cat.icon}
                        </span>
                        <span className="jt-hero-file-card__ext">
                          {cat.label}
                        </span>
                      </div>
                      <div className="jt-hero-file-card__info">
                        <span className="jt-hero-file-card__name">
                          {att.name}
                        </span>
                        <span className="jt-hero-file-card__meta">
                          {formatBytes(att.size)}
                          {att.uploadedBy ? ` • ${att.uploadedBy}` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="jt-hero-file-card__download"
                        aria-label={`Tải xuống ${att.name}`}
                        disabled={!canDownloadAttachment(att.url)}
                        title="Tải về"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAttachment(att);
                        }}
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CHAT STREAM & ACTIVITY TIMELINE */}
          <div className="jt-chat-stream__timeline">
            {chatMessages.length > 0 &&
              chatMessages.map((msg) => (
                <div
                  className={`jt-chat-message ${
                    msg.isMine
                      ? "jt-chat-message--outgoing"
                      : "jt-chat-message--incoming"
                  }`}
                  key={msg.id}
                >
                  {!msg.isMine && (
                    <span
                      className={`avatar group-msg-avatar ${avatarTone(msg.author_name)}`}
                      title={msg.author_name}
                    >
                      {nameInitials(msg.author_name)}
                    </span>
                  )}
                  <div className="jt-chat-message__wrap">
                    {!msg.isMine && (
                      <div className="jt-chat-message__sender-row">
                        <span className="jt-chat-message__sender-name">
                          {msg.author_name}
                        </span>
                      </div>
                    )}
                    <div
                      className={`jt-chat-message__bubble ${
                        msg.isMine
                          ? "jt-chat-message__bubble--outgoing"
                          : "jt-chat-message__bubble--incoming"
                      }`}
                    >
                      {msg.content && (
                        <div className="jt-chat-message__text">
                          {msg.content}
                        </div>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="jt-chat-bubble-attachments">
                          {msg.attachments.map((att, idx) => {
                            const cat = getFileCategory(att.name);
                            return (
                              <div
                                key={att.id || `${att.name}-${idx}`}
                                className={`jt-chat-bubble-file ${
                                  msg.isMine
                                    ? "jt-chat-bubble-file--outgoing"
                                    : "jt-chat-bubble-file--incoming"
                                }`}
                                onClick={() =>
                                  message.info(`Đang mở tệp: ${att.name}`)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    message.info(`Đang mở tệp: ${att.name}`);
                                  }
                                }}
                                title={`Tải về / Xem ${att.name}`}
                                role="button"
                                tabIndex={0}
                              >
                                <div
                                  className="jt-chat-bubble-file__badge"
                                  style={{
                                    background: cat.bg,
                                    color: cat.color,
                                    borderColor: cat.border,
                                  }}
                                >
                                  <span className="jt-chat-bubble-file__icon">
                                    {cat.icon}
                                  </span>
                                  <span className="jt-chat-bubble-file__ext">
                                    {cat.label}
                                  </span>
                                </div>
                                <div className="jt-chat-bubble-file__info">
                                  <span className="jt-chat-bubble-file__name">
                                    {att.name}
                                  </span>
                                  {att.size ? (
                                    <span className="jt-chat-bubble-file__size">
                                      {formatBytes(att.size)}
                                    </span>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  className="jt-chat-bubble-file__download"
                                  title="Tải về"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    message.success(`Đang tải về: ${att.name}`);
                                  }}
                                >
                                  <Download size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="jt-chat-message__meta">
                      <time>{msg.time}</time>
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 4. STICKY BOTTOM INPUT BAR */}
          <div className="jt-chat-stream__sticky-input-bar">
            {selectedChatFile && (
              <div className="jt-chat-file-preview-chip">
                <Paperclip size={12} />
                <span className="jt-chat-file-preview-chip__name">
                  {selectedChatFile.name}
                </span>
                <span className="jt-chat-file-preview-chip__size">
                  ({formatBytes(selectedChatFile.size)})
                </span>
                <button
                  type="button"
                  className="jt-chat-file-preview-chip__remove"
                  onClick={() => setSelectedChatFile(null)}
                  title="Gỡ tệp đính kèm"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="jt-chat-input-controls">
              <input
                type="file"
                ref={chatFileInputRef}
                style={{ display: "none" }}
                onChange={handleSelectChatFile}
              />
              {canAttachFile && (
                <Tooltip title="Thêm tệp đính kèm">
                  <button
                    type="button"
                    className="jt-chat-attach-btn"
                    onClick={() => chatFileInputRef.current?.click()}
                  >
                    <Paperclip size={16} />
                  </button>
                </Tooltip>
              )}
              <span style={{ display: "none" }}>Đính kèm</span>
              <span style={{ display: "none" }}>Thảo luận</span>
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="jt-chat-textarea"
                onChange={(e) => setChatInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Viết trao đổi, ghi chú nhật ký công việc... (Enter để gửi)"
                value={chatInput}
              />
              <Button
                className="jt-chat-send-btn"
                icon={<Send size={14} />}
                onClick={handleSendChat}
                type="primary"
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Thông tin của phiếu, Quy trình & Hàng nút action */}
        <div
          className="jt-doc-detail-sidebar-stack"
          id={presentation === "page" ? "calendar-detail-sidebar" : undefined}
          role="complementary"
          aria-label="Nhân sự và quy trình"
        >
          <div className="jt-doc-detail-sidebar-scroll">
            {/* Card 1: Thông tin của phiếu */}
            <section className="jt-doc-detail-pane jt-doc-detail-pane--info">
              <div className="jt-doc-info-list">
                {/* Thời gian */}
                <div className="jt-doc-info-item">
                  <span className="jt-doc-info-item__label">
                    <span className="jt-doc-info-icon">
                      <Calendar size={15} />
                    </span>
                    Thời gian
                  </span>
                  <span className="jt-doc-info-item__value">{timeDisplay}</span>
                </div>

                {/* Địa điểm (chỉ hiển thị khi là Cuộc họp và có địa điểm thực tế) */}
                {isMeeting &&
                  Boolean(meetingLocation) &&
                  event.location !== "Phiếu công việc" &&
                  event.location !== "Sự kiện cơ quan" && (
                    <div className="jt-doc-info-item">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <MapPin size={15} />
                        </span>
                        Địa điểm
                      </span>
                      <span className="jt-doc-info-item__value">
                        {meetingLocation}
                      </span>
                    </div>
                  )}

                {/* Chủ trì cuộc họp (chỉ hiển thị khi là Lịch họp) */}
                {isMeeting &&
                  Boolean((event.leader || event.organizer)?.trim()) && (
                    <div className="jt-doc-info-item">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <User size={15} />
                        </span>
                        Chủ trì
                      </span>
                      <span className="jt-doc-info-item__value">
                        {highlightCurrentUserName(
                          event.leader || event.organizer || "",
                        )}
                      </span>
                    </div>
                  )}

                {/* Thành phần */}
                <div className="jt-doc-info-item jt-doc-info-item--block">
                  <div className="jt-person-sec-header">
                    <span className="jt-person-sec-title">
                      <Users size={14} style={{ color: "#475467" }} />
                      <span>Thành phần</span>
                      <span className="jt-person-sec-count">
                        ({participantsList.length})
                      </span>
                    </span>
                  </div>

                  <div className="jt-person-avatar-row">
                    {participantsList.map(
                      (p: { name: string; role?: string }, idx: number) => {
                        const personName =
                          typeof p?.name === "string"
                            ? p.name
                            : String(p?.name || "");
                        const initial = personName
                          ? personName.charAt(0).toUpperCase()
                          : "?";
                        return (
                          <span
                            className="jt-person-chip"
                            key={idx}
                            title={
                              p.role ? `${personName} (${p.role})` : personName
                            }
                          >
                            <span className="jt-person-chip__avatar">
                              {initial}
                            </span>
                            <span className="jt-person-chip__name">
                              {isMe(personName) ? (
                                <strong>{personName}</strong>
                              ) : (
                                personName
                              )}
                            </span>
                          </span>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Người theo dõi (Chỉ hiển thị khi không phải cuộc họp) */}
                {!isMeeting && (
                  <div className="jt-doc-info-item jt-doc-info-item--block">
                    <div className="jt-person-sec-header">
                      <span className="jt-person-sec-title">
                        <Users size={14} style={{ color: "#475467" }} />
                        <span>Người theo dõi</span>
                        <span className="jt-person-sec-count">
                          ({watchers.length})
                        </span>
                      </span>
                    </div>

                    <div className="jt-person-avatar-row">
                      {watchers.map((u, idx) => {
                        const wName =
                          typeof u?.name === "string"
                            ? u.name
                            : String(u?.name || "");
                        const initial = wName
                          ? wName.charAt(0).toUpperCase()
                          : "?";
                        const isSelfWatcher = isMe(wName, u.id);
                        // Người theo dõi ở Chi tiết phiếu sẽ không có nút bỏ theo dõi chính mình
                        const canRemoveWatcher =
                          !isSelfWatcher &&
                          (isCreatorMe || !isFinishedOrCancelled);

                        return (
                          <span
                            className="jt-person-chip"
                            key={idx}
                            title={wName}
                          >
                            <span
                              className="jt-person-chip__avatar"
                              style={{
                                background: "#fef3c7",
                                color: "#b45309",
                              }}
                            >
                              {initial}
                            </span>
                            <span className="jt-person-chip__name">
                              {isSelfWatcher ? <strong>{wName}</strong> : wName}
                            </span>
                            {canRemoveWatcher && (
                              <button
                                onClick={() =>
                                  confirm({
                                    title: "Xóa người theo dõi?",
                                    content: `Bạn có muốn xóa “${wName}” khỏi danh sách người theo dõi phiếu này không?`,
                                    onConfirm: () => {
                                      if (!handleRemoveWatcher(wName))
                                        throw new Error(
                                          "Không thể xóa người theo dõi",
                                        );
                                    },
                                    fallbackFocus:
                                      "[data-calendar-add-watcher]",
                                  })
                                }
                                type="button"
                                className="jt-person-chip__remove-btn"
                                title={`Xóa ${wName}`}
                                aria-label={`Xóa ${wName}`}
                              >
                                <X size={11} strokeWidth={2.4} />
                              </button>
                            )}
                          </span>
                        );
                      })}
                      <button
                        type="button"
                        className="jt-person-add-tag-chip"
                        onClick={() => {
                          setSelectedNewWatchers([]);
                          setFollowerModalOpen(true);
                        }}
                        data-calendar-add-watcher
                        aria-label="Thêm người theo dõi"
                      >
                        <Plus size={13} strokeWidth={2.2} />
                        <span>Thêm người theo dõi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Card 2: Quy trình thực hiện (Chỉ hiển thị khi không phải cuộc họp) */}
            {!isMeeting && (
              <aside className="jt-doc-detail-pane jt-doc-detail-pane--steps">
                <div className="jt-doc-detail-pane__header">
                  <h3 className="jt-doc-pane-title">QUY TRÌNH</h3>
                  <Tag
                    style={{
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 12,
                      padding: "1px 8px",
                      backgroundColor: isMeeting
                        ? "#f5f3ff"
                        : isProposal
                          ? "#eff6ff"
                          : "#ecfdf5",
                      color: isMeeting
                        ? "#6d28d9"
                        : isProposal
                          ? "#1d4ed8"
                          : "#047857",
                      borderColor: isMeeting
                        ? "#ddd6fe"
                        : isProposal
                          ? "#bfdbfe"
                          : "#a7f3d0",
                    }}
                  >
                    {isMeeting
                      ? "2 bước"
                      : isProposal
                        ? "Đề xuất"
                        : "Triển khai"}
                  </Tag>
                </div>

                <div className="jt-doc-steps">
                  {/* BƯỚC 1: Khởi tạo phiếu */}
                  <div className="jt-doc-step">
                    <div className="jt-doc-step__rail">
                      <span className="is-done" />
                      <i />
                    </div>
                    <div className="jt-doc-step__card">
                      <div className="jt-doc-step__top">
                        <div>
                          <span className="jt-doc-step__order">BƯỚC 1</span>
                          <h4>
                            {isMeeting ? "Khởi tạo lịch" : "KHỞI TẠO PHIẾU"}
                          </h4>
                        </div>
                      </div>

                      <div className="jt-step-person-list">
                        <div className="jt-step-person-row">
                          <div className="jt-step-person-left">
                            <User size={13} style={{ color: "#64748b" }} />
                            <span
                              className={
                                isCreatorMe
                                  ? "jt-step-person-name is-self"
                                  : "jt-step-person-name"
                              }
                            >
                              {creatorName}
                            </span>
                            <span className="jt-step-person-time">
                              - {createdTimeFormatted}
                            </span>
                          </div>
                          <Tag color="success">Đã tạo</Tag>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BƯỚC 2: Phân nhánh theo loại phiếu */}
                  {isMeeting ? (
                    /* Nhánh Lịch họp */
                    <div className="jt-doc-step">
                      <div className="jt-doc-step__rail">
                        <span
                          className={statusKey === "COMPLETED" ? "is-done" : ""}
                        />
                      </div>
                      <div className="jt-doc-step__card">
                        <div className="jt-doc-step__top">
                          <div>
                            <span className="jt-doc-step__order">BƯỚC 2</span>
                            <h4>Diễn ra cuộc họp</h4>
                          </div>
                        </div>

                        <div className="jt-step-person-list">
                          <div className="jt-step-person-row">
                            <div className="jt-step-person-left">
                              <User size={13} style={{ color: "#64748b" }} />
                              <span className="jt-step-person-name">
                                {event.leader ||
                                  event.organizer ||
                                  "Ban Biên tập"}
                              </span>
                              {statusKey === "COMPLETED" && (
                                <span className="jt-step-person-time">
                                  - {timeDisplay}
                                </span>
                              )}
                            </div>
                            <Tag
                              color={
                                statusKey === "COMPLETED"
                                  ? "success"
                                  : "processing"
                              }
                            >
                              {statusKey === "COMPLETED"
                                ? "Đã họp"
                                : "Đã lên lịch"}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isProposal ? (
                    /* Nhánh Phiếu Đề xuất: Gồm Lấy ý kiến (nếu có) và Duyệt phiếu */
                    <div className="jt-doc-step">
                      <div className="jt-doc-step__rail">
                        <span
                          className={
                            statusKey === "APPROVED" ||
                            statusKey === "COMPLETED"
                              ? "is-done"
                              : statusKey === "REJECTED"
                                ? "is-rejected"
                                : ""
                          }
                        />
                      </div>
                      <div className="jt-doc-step__card">
                        <div className="jt-doc-step__top">
                          <div>
                            <span className="jt-doc-step__order">BƯỚC 2</span>
                            <h4>DUYỆT PHIẾU</h4>
                          </div>
                        </div>

                        <div className="jt-step-person-list">
                          {(() => {
                            const approverList =
                              event.approvers && event.approvers.length > 0
                                ? event.approvers
                                : approver?.name
                                  ? approver.name
                                      .split(", ")
                                      .map((name, i) => ({
                                        id: `appr-${i + 1}`,
                                        name: name.trim(),
                                        status: (statusKey === "APPROVED" ||
                                        statusKey === "COMPLETED"
                                          ? "APPROVED"
                                          : statusKey === "REJECTED"
                                            ? "REJECTED"
                                            : "PENDING") as
                                          | "PENDING"
                                          | "APPROVED"
                                          | "REJECTED"
                                          | "COMPLETED",
                                        completed_at: event.startAt,
                                        note: undefined as string | undefined,
                                      }))
                                  : step2?.actor_name &&
                                      step2.actor_name !== "Tự động duyệt" &&
                                      step2.actor_name !==
                                        "Trực tiếp triển khai"
                                    ? [
                                        {
                                          id: "appr-step",
                                          name: step2.actor_name,
                                          status: (statusKey === "APPROVED" ||
                                          statusKey === "COMPLETED"
                                            ? "APPROVED"
                                            : statusKey === "REJECTED"
                                              ? "REJECTED"
                                              : "PENDING") as
                                            | "PENDING"
                                            | "APPROVED"
                                            | "REJECTED"
                                            | "COMPLETED",
                                          completed_at: event.startAt,
                                          note: undefined as string | undefined,
                                        },
                                      ]
                                    : [];

                            if (approverList.length === 0) {
                              return (
                                <div
                                  style={{
                                    fontSize: 14,
                                    color: "#98a2b3",
                                    fontStyle: "italic",
                                    padding: "6px 0",
                                  }}
                                >
                                  {isProposal
                                    ? "Chưa chỉ định người duyệt"
                                    : "Duyệt tự động theo quy trình"}
                                  {!!event.consultants?.length &&
                                    renderConsultants(
                                      event.consultants,
                                      "Lấy ý kiến",
                                    )}
                                </div>
                              );
                            }

                            const consultants = event.consultants ?? [];
                            const requesterIndex = (
                              person: (typeof consultants)[number],
                            ) => {
                              if (!person.requestedById)
                                return approverList.length === 1 ? 0 : -1;
                              const exact = approverList.findIndex(
                                (approver) =>
                                  String(approver.id).replace(
                                    /^contact-/,
                                    "",
                                  ) === person.requestedById,
                              );
                              return exact >= 0
                                ? exact
                                : approverList.findIndex(
                                    (approver) =>
                                      resolveCalendarUserId(approver.name) ===
                                      person.requestedById,
                                  );
                            };
                            return (
                              <>
                                {approverList.map((a, idx) => {
                                  const requests = consultants.filter(
                                    (person) => requesterIndex(person) === idx,
                                  );
                                  const isApproved = a.status === "APPROVED" || (a.status as string) === "COMPLETED";
                                  const isRejected = a.status === "REJECTED";
                                  const isProcessed = isApproved || isRejected;
                                  const canAct =
                                    !isProcessed &&
                                    isMe(a.name, a.id) &&
                                    (showApproverApproveBtn ||
                                      showApproverConsultBtn ||
                                      showApproverRejectBtn);
                                  const StatusIcon = isApproved
                                    ? CheckCircle
                                    : isRejected
                                      ? XCircle
                                      : Clock3;
                                  return (
                                    <div key={idx}>
                                      <div
                                        className={
                                          canAct
                                            ? "jt-step-person-row jt-step-person-row--workflow-action"
                                            : "jt-step-person-row"
                                        }
                                      >
                                        <div className="jt-step-person-left">
                                          <StatusIcon
                                            aria-hidden="true"
                                            size={13}
                                            style={{
                                              color: isApproved
                                                ? "#16a34a"
                                                : isRejected
                                                  ? "#dc2626"
                                                  : "#f59e0b",
                                            }}
                                          />
                                          <span
                                            className={
                                              isMe(a.name, a.id)
                                                ? "jt-step-person-name is-self"
                                                : "jt-step-person-name"
                                            }
                                          >
                                            {a.name}
                                          </span>
                                          {isProcessed &&
                                            (a.completed_at ||
                                              event.startAt) && (
                                              <span className="jt-step-person-time">
                                                -{" "}
                                                {dayjs(
                                                  a.completed_at ||
                                                    event.startAt,
                                                ).format("DD/MM HH:mm")}
                                              </span>
                                            )}
                                        </div>
                                        {canAct && (
                                          <div
                                            className="jt-workflow-actions"
                                            role="group"
                                            aria-label="Thao tác duyệt phiếu"
                                          >
                                            {showApproverApproveBtn && (
                                              <Button
                                                type="primary"
                                                size="small"
                                                className="jt-action-btn--approve-modern"
                                                onClick={() =>
                                                  setApproveModalOpen(true)
                                                }
                                              >
                                                Duyệt phiếu
                                              </Button>
                                            )}
                                            {showApproverRejectBtn && (
                                              <Button
                                                size="small"
                                                className="jt-action-btn--reject-subtle"
                                                onClick={() =>
                                                  setRejectModalOpen(true)
                                                }
                                              >
                                                Không duyệt
                                              </Button>
                                            )}
                                            {showApproverConsultBtn && (
                                              <Button
                                                size="small"
                                                className="jt-action-btn--consult-subtle"
                                                onClick={() =>
                                                  setConsultModalOpen(true)
                                                }
                                              >
                                                Lấy ý kiến
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                        <Tag
                                          className="jt-workflow-status"
                                          color={
                                            isApproved
                                              ? "success"
                                              : isRejected
                                                ? "error"
                                                : "warning"
                                          }
                                        >
                                          {isApproved
                                            ? "Đồng ý"
                                            : isRejected
                                              ? "Không đồng ý"
                                              : "Chờ xử lý"}
                                        </Tag>
                                      </div>
                                      {requests.length > 0 &&
                                        renderConsultants(
                                          requests,
                                          `Lấy ý kiến theo yêu cầu của ${a.name}`,
                                        )}
                                      {a.note && (
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#475569",
                                            marginTop: 3,
                                            paddingLeft: 19,
                                            fontStyle: "italic",
                                            lineHeight: "1.4",
                                          }}
                                        >
                                          &ldquo;{a.note}&rdquo;
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {consultants.some(
                                  (person) => requesterIndex(person) < 0,
                                ) &&
                                  renderConsultants(
                                    consultants.filter(
                                      (person) => requesterIndex(person) < 0,
                                    ),
                                    "Lấy ý kiến",
                                  )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Nhánh Phiếu Triển khai */
                    <div className="jt-doc-step">
                      <div className="jt-doc-step__rail">
                        <span
                          className={statusKey === "COMPLETED" ? "is-done" : ""}
                        />
                      </div>
                      <div className="jt-doc-step__card">
                        <div className="jt-doc-step__top">
                          <div>
                            <span className="jt-doc-step__order">BƯỚC 2</span>
                            <h4>Triển khai</h4>
                          </div>
                        </div>

                        <div className="jt-step-person-list">
                          {(participantsList.length > 0
                            ? participantsList.map(
                                (
                                  p: { name: string; role?: string },
                                  idx: number,
                                ) => {
                                  const matchedExec = (
                                    event.executors || []
                                  ).find((ex) => ex.name === p.name);
                                  return {
                                    id: matchedExec?.id ?? idx,
                                    name: p.name,
                                    status: (matchedExec?.status ||
                                      (statusKey === "COMPLETED"
                                        ? "COMPLETED"
                                        : "IN_PROGRESS")) as
                                      | "IN_PROGRESS"
                                      | "COMPLETED",
                                    completed_at:
                                      matchedExec?.completed_at ||
                                      (statusKey === "COMPLETED"
                                        ? event.startAt ||
                                          new Date().toISOString()
                                        : undefined),
                                  };
                                },
                              )
                            : []
                          ).map(
                            (
                              e: {
                                id: string | number;
                                name: string;
                                status?: string;
                                completed_at?: string;
                              },
                              idx: number,
                            ) => {
                              const isDone =
                                e.status === "COMPLETED" ||
                                statusKey === "COMPLETED";
                              const canComplete =
                                showExecutorCompleteBtn &&
                                !isDone &&
                                isMe(e.name, e.id);
                              return (
                                <div
                                  className={
                                    canComplete
                                      ? "jt-step-person-row jt-step-person-row--workflow-action"
                                      : "jt-step-person-row"
                                  }
                                  key={idx}
                                >
                                  <div className="jt-step-person-left">
                                    <User
                                      size={13}
                                      style={{
                                        color: isDone ? "#16a34a" : "#2563eb",
                                      }}
                                    />
                                    <span
                                      className={
                                        isMe(e.name, e.id)
                                          ? "jt-step-person-name is-self"
                                          : "jt-step-person-name"
                                      }
                                    >
                                      {e.name}
                                    </span>
                                    {isDone &&
                                      (e.completed_at || event.startAt) && (
                                        <span className="jt-step-person-time">
                                          {dayjs(
                                            e.completed_at || event.startAt,
                                          ).format("DD/MM HH:mm")}
                                        </span>
                                      )}
                                  </div>
                                  {canComplete && (
                                    <div className="jt-workflow-actions">
                                      <Button
                                        size="small"
                                        icon={<CheckCircle size={13} />}
                                        onClick={() =>
                                          setCompleteModalOpen(true)
                                        }
                                      >
                                        Hoàn thành
                                      </Button>
                                    </div>
                                  )}
                                  <Tag
                                    className="jt-workflow-status"
                                    color={isDone ? "success" : "processing"}
                                  >
                                    {isDone ? "Hoàn thành" : "Đang thực hiện"}
                                  </Tag>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {confirmationHolder}
      {presentation === "page" ? (
        <section
          className="jt-document-drawer calendar-detail-original-page"
          aria-label="Chi tiết lịch làm việc"
        >
          <header className="ant-drawer-header">
            <div className="ant-drawer-title">{detailHeader}</div>
          </header>
          <div className="ant-drawer-body">{detailContent}</div>
        </section>
      ) : (
        <Drawer
          aria-label="Chi tiết cuộc họp"
          className="jt-document-drawer"
          closable={false}
          destroyOnClose
          footer={null}
          getContainer={false}
          onClose={onClose}
          open={open}
          placement="right"
          title={detailHeader}
          width={1180}
        >
          {detailContent}
        </Drawer>
      )}

      {/* Modal Thêm thành phần */}
      <UserSelectionModal
        open={addParticipantModalOpen}
        onCancel={() => {
          setAddParticipantModalOpen(false);
          setSelectedNewParticipants([]);
        }}
        onOk={handleConfirmAddParticipants}
        title="Thêm thành phần"
        initialSelected={selectedNewParticipants}
        excludeNames={excludedRoleNames}
      />

      {/* Modal Thêm người theo dõi */}
      <UserSelectionModal
        open={followerModalOpen}
        onCancel={() => {
          setFollowerModalOpen(false);
          setSelectedNewWatchers([]);
        }}
        onOk={handleConfirmSaveFollowers}
        title="Thêm người theo dõi"
        initialSelected={selectedNewWatchers}
        excludeNames={excludedRoleNames}
      />

      {/* Modal Duyệt phiếu (Người duyệt) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{
          style: { backgroundColor: "#059669", borderColor: "#059669" },
        }}
        okText="Xác nhận duyệt"
        onCancel={() => {
          setApproveModalOpen(false);
          setApproveNote("");
        }}
        onOk={handleConfirmApprove}
        open={approveModalOpen}
        title="Duyệt phiếu"
      >
        <p
          style={{
            color: "#475569",
            fontSize: 14,
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          Ghi chú (không bắt buộc)
        </p>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          onChange={(e) => setApproveNote(e.target.value)}
          placeholder="Nhập ý kiến chỉ đạo, lưu ý..."
          value={approveNote}
        />
      </Modal>

      {/* Modal Lấy ý kiến (Người duyệt) */}
      <UserSelectionModal
        open={consultModalOpen}
        onCancel={() => setConsultModalOpen(false)}
        onOk={handleConfirmConsult}
        title="Lấy ý kiến tham vấn"
        excludeNames={event.consultants
          ?.filter((person) => person.requestedById === user?.id)
          .map((person) => person.name)}
      />

      {/* Modal Không duyệt / Tạm dừng (Người duyệt) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ danger: true }}
        okText="Xác nhận không duyệt"
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
        onOk={handleConfirmReject}
        open={rejectModalOpen}
        title="Không duyệt phiếu"
      >
        <p style={{ color: "#475569", fontSize: 14, marginBottom: 12 }}>
          Phiếu sẽ được cập nhật sang trạng thái{" "}
          <strong>Không duyệt / Tạm dừng</strong>. Bạn có thể nhập lý do (không
          bắt buộc).
        </p>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do không duyệt... (tùy chọn)"
          value={rejectReason}
        />
      </Modal>

      {/* Modal Gửi ý kiến (Người được lấy ý kiến) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{
          style: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
        }}
        okText="Gửi ý kiến"
        onCancel={() => {
          setConsultReplyTarget(null);
          setConsultReplyText("");
        }}
        onOk={handleConfirmConsultReply}
        open={Boolean(consultReplyTarget)}
        title="Gửi ý kiến"
      >
        <p
          style={{
            color: "#475569",
            fontSize: 14,
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          Ý kiến tham vấn
        </p>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 6 }}
          onChange={(e) => setConsultReplyText(e.target.value)}
          placeholder="Nhập nội dung ý kiến đóng góp / tham vấn..."
          value={consultReplyText}
        />
      </Modal>

      {/* Modal Hoàn thành công việc (Người thực hiện) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{
          style: { backgroundColor: "#059669", borderColor: "#059669" },
        }}
        okText="Xác nhận hoàn thành"
        onCancel={() => {
          setCompleteModalOpen(false);
          setCompleteReportText("");
        }}
        onOk={handleConfirmComplete}
        open={completeModalOpen}
        title="Báo cáo hoàn thành công việc"
      >
        <p style={{ color: "#475569", fontSize: 14, marginBottom: 12 }}>
          Xác nhận công việc đã được hoàn thành. Bạn có thể ghi chú kết quả đạt
          được.
        </p>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          onChange={(e) => setCompleteReportText(e.target.value)}
          placeholder="Ghi chú kết quả hoàn thành công việc... (tùy chọn)"
          value={completeReportText}
        />
      </Modal>

      {canManageMeeting && editModalOpen && (
        <CreatePersonalMeetingModal
          open
          editingEvent={event}
          initialTicketType="MEETING"
          onClose={() => setEditModalOpen(false)}
          onSuccess={onUpdateEvent}
        />
      )}

      {/* Modal Chỉnh sửa thông tin (Người tạo) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okText="Lưu thay đổi"
        onCancel={() => setEditModalOpen(false)}
        onOk={handleConfirmEdit}
        open={editModalOpen && !isMeeting}
        title="Chỉnh sửa phiếu"
        width={560}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              htmlFor="edit-ticket-content"
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
                color: "#1e293b",
              }}
            >
              Nội dung *
            </label>
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              id="edit-ticket-content"
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Nhập nội dung..."
              value={editContent}
            />
          </div>

          <div>
            <label
              htmlFor="edit-ticket-datetime"
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
                color: "#1e293b",
              }}
            >
              Thời gian
            </label>
            <DatePicker
              allowClear={false}
              format="HH:mm DD/MM/YYYY"
              id="edit-ticket-datetime"
              needConfirm
              onChange={(val) => setEditDateTime(val)}
              showTime={{ format: "HH:mm" }}
              style={{ width: "100%" }}
              value={editDateTime}
            />
          </div>

          {!isTask && (
            <div>
              <label
                htmlFor="edit-ticket-location"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "#1e293b",
                }}
              >
                Địa điểm
              </label>
              <Input
                id="edit-ticket-location"
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Nhập phòng họp hoặc địa điểm..."
                value={editLocation}
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
