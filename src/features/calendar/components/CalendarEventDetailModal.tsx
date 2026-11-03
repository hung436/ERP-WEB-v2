import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Dropdown,
  Input,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import {
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Crown,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  LogOut,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Send,
  User,
  UserPlus,
  Users,
  Video,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/AuthContext';
import { calendarApi } from '@/services/api';
import type { CalendarAttachmentItem, CalendarEvent } from '@/types/domain';

import { formatBytes, getFileCategory } from './AttachedFilesList';
import './JobTicketDetailDrawer.css';

export type DetailRoleType = 'CREATOR' | 'APPROVER' | 'CONSULTEE' | 'EXECUTOR' | 'WATCHER';

const CONSULT_CANDIDATE_OPTIONS = [
  { value: 'TS. Trần Quốc Hùng (Chuyên gia khách mời)', label: 'TS. Trần Quốc Hùng (Chuyên gia khách mời)' },
  { value: 'Lê Văn Tuấn (Trưởng ban Thư ký)', label: 'Lê Văn Tuấn (Trưởng ban Thư ký)' },
  { value: 'Võ Hoàng Nam (Trưởng phòng Kỹ thuật)', label: 'Võ Hoàng Nam (Trưởng phòng Kỹ thuật)' },
  { value: 'Nguyễn Văn An (Phó ban Thời sự)', label: 'Nguyễn Văn An (Phó ban Thời sự)' },
  { value: 'Trần Thị Bích (Kế toán trưởng)', label: 'Trần Thị Bích (Kế toán trưởng)' },
];

const DOC_STATUS_LABELS: Record<string, { label: string; tone: 'warning' | 'success' | 'danger' | 'purple' }> = {
  DRAFT: { label: 'Bản nháp', tone: 'warning' },
  PENDING: { label: 'Chờ duyệt', tone: 'warning' },
  ACTIVE: { label: 'Đang triển khai', tone: 'success' },
  CONSULTING: { label: 'Đang lấy ý kiến', tone: 'purple' },
  COMPLETED: { label: 'Đã hoàn thành', tone: 'success' },
  APPROVED: { label: 'Đang triển khai', tone: 'success' },
  NOT_APPROVED: { label: 'Không duyệt', tone: 'danger' },
  REJECTED: { label: 'Không duyệt', tone: 'danger' },
  RECALLED: { label: 'Đã thu hồi', tone: 'danger' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
};

export interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
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
  role?: 'CREATOR' | 'EXECUTOR' | 'APPROVER' | 'CONSULTEE';
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
}: CalendarEventDetailModalProps) {
  const { user } = useAuth();
  const currentUser = user?.fullName || 'Nguyễn Minh Anh';
  const [activeRole, setActiveRole] = useState<DetailRoleType>('CREATOR');
  const [isMuted, setIsMuted] = useState(false);
  const [cardCollapsed, setCardCollapsed] = useState(false);
  const [followerModalOpen, setFollowerModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // State cho các popup action theo từng Role
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveNote, setApproveNote] = useState('');

  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [selectedConsultees, setSelectedConsultees] = useState<string[]>([]);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [consultReplyModalOpen, setConsultReplyModalOpen] = useState(false);
  const [consultReplyText, setConsultReplyText] = useState('');

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeReportText, setCompleteReportText] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editDateTime, setEditDateTime] = useState<dayjs.Dayjs | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedChatFile, setSelectedChatFile] = useState<File | null>(null);
  const [watchers, setWatchers] = useState<Array<{ id: string | number; name: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const eventId = event?.id;

  useEffect(() => {
    if (!eventId) return;
    const saved = localStorage.getItem(`jt_muted_ticket_${eventId}`);
    setIsMuted(saved === 'true');
  }, [eventId]);

  useEffect(() => {
    if (!event) return;
    setWatchers(event.watchers || []);

    // Tự động nhận diện Role mặc định của user hiện tại khi mở phiếu
    const isMeetingEvent = event.ticketType === 'MEETING' || (!event.ticketType && event.type === 'meeting');
    const rawCreatorName = event.leader || event.organizer || currentUser;
    const resolvedCreator = rawCreatorName === 'Bùi Lê Thế Kiệt' ? currentUser : rawCreatorName;
    const currentStatus = String(
      event.approvalStatus ||
        (!isMeetingEvent ? 'PENDING' : event.responseStatus === 'accepted' ? 'COMPLETED' : 'ACTIVE')
    );

    if (!isMeetingEvent) {
      if (
        currentStatus === 'CONSULTING' &&
        (
          event.consultantName?.includes(currentUser) ||
          (event.steps || []).some(
            (s) =>
              (s.role === 'CONSULTANT' || s.step_order === 2) &&
              ((s.note && s.note.includes(currentUser)) || (s.actor_name && s.actor_name.includes(currentUser)))
          )
        )
      ) {
        setActiveRole('CONSULTEE');
      } else if (event.approver?.name?.includes(currentUser) && (currentStatus === 'PENDING' || currentStatus === 'CONSULTING')) {
        setActiveRole('APPROVER');
      } else if (
        (event.executors || []).some((e) => e.name.includes(currentUser)) &&
        (currentStatus === 'APPROVED' || currentStatus === 'ACTIVE')
      ) {
        setActiveRole('EXECUTOR');
      } else if (resolvedCreator.includes(currentUser)) {
        setActiveRole('CREATOR');
      } else if ((event.executors || []).some((e) => e.name.includes(currentUser))) {
        setActiveRole('EXECUTOR');
      } else if ((event.watchers || []).some((w) => w.name.includes(currentUser))) {
        setActiveRole('WATCHER');
      } else {
        setActiveRole('CREATOR');
      }
    } else {
      if (resolvedCreator.includes(currentUser)) {
        setActiveRole('CREATOR');
      } else if ((event.participants || []).some((p) => p.includes(currentUser))) {
        setActiveRole('EXECUTOR');
      } else {
        setActiveRole('WATCHER');
      }
    }

    const msgs: ChatMessage[] = [];

    if (event.comments && event.comments.length > 0) {
      event.comments
        .filter((c) => {
          if (c.author === 'Thành viên ban chuyên trách') return false;
          if (c.content && c.content.includes('sổ ghi nhận')) return false;
          return true;
        })
        .forEach((c) => {
          const match = c.content?.match(/^\[Tệp đính kèm:\s*(.+)\]$/);
          if (match) {
            const fileName = match[1].trim();
            msgs.push({
              id: c.id,
              author_name: c.author,
              role: c.author === currentUser ? 'CREATOR' : 'EXECUTOR',
              content: '',
              time: dayjs(c.createdAt).format('DD/MM HH:mm'),
              isMine: c.author === currentUser,
              attachments: [
                {
                  id: `att-cmt-${c.id}`,
                  name: fileName,
                  size: 0,
                  type: fileName.split('.').pop() || 'file',
                  uploadedBy: c.author,
                },
              ],
            });
          } else {
            const isMine =
              c.author === currentUser ||
              c.author === 'Nguyễn Minh Anh';
            msgs.push({
              id: c.id,
              author_name: c.author,
              role: isMine ? 'CREATOR' : 'EXECUTOR',
              content: c.content,
              time: dayjs(c.createdAt).format('DD/MM HH:mm'),
              isMine,
              attachments: c.attachments,
            });
          }
        });
    }

    setChatMessages(msgs);
  }, [event, currentUser]);

  if (!event) return null;

  const isTask = event.ticketType === 'TASK' || (!event.ticketType && event.type === 'task');
  const isMeeting = !isTask && (event.ticketType === 'MEETING' || event.type === 'meeting');

  const rawCreator = event.leader || event.organizer || currentUser;
  const creatorName = rawCreator === 'Bùi Lê Thế Kiệt' ? currentUser : rawCreator;
  const timeDisplay = dayjs(event.deadline || event.startAt).format('HH:mm DD/MM/YYYY');

  const rawDesc = (event.notes || event.agenda || event.description || '').trim();
  const isDuplicateDesc =
    !rawDesc ||
    rawDesc.toLowerCase() === event.title.trim().toLowerCase() ||
    rawDesc === 'Ghi nhận công việc và trao đổi tiến độ thực hiện.';
  const hasExtraDesc = !isDuplicateDesc;
  const hasAttachments = Boolean(event.attachments && event.attachments.length > 0);
  const hasMeetingDetails = isMeeting && Boolean(event.mode || event.location || event.meetingUrl);
  const showHeroCard = hasExtraDesc || hasAttachments || hasMeetingDetails;

  const step1 = (event.steps || []).find((s) => s.step_order === 1 || s.role === 'CREATOR');
  const createdTime = step1?.completed_at || event.createdAt || event.startAt || new Date().toISOString();
  const createdTimeFormatted = dayjs(createdTime).format('DD/MM HH:mm');

  const statusKey = String(
    event.approvalStatus ||
      (!isMeeting ? 'PENDING' : event.responseStatus === 'accepted' ? 'COMPLETED' : 'ACTIVE')
  );
  const statusInfo = isMeeting
    ? {
        label: statusKey === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã lên lịch',
        tone: (statusKey === 'COMPLETED' ? 'success' : 'processing') as 'success' | 'warning',
      }
    : DOC_STATUS_LABELS[statusKey] || {
        label: 'Đang triển khai',
        tone: 'success' as const,
      };

  const executors = event.executors || [];
  const approver = event.approver;
  const isFinishedOrCancelled =
    statusKey === 'COMPLETED' || statusKey === 'CANCELLED' || statusKey === 'RECALLED';

  // --- QUY TẮC PHÂN QUYỀN HEADER BUTTONS THEO ROLE_ACTIONS_SPEC.MD ---
  const canManageFollowers = isMeeting
    ? activeRole === 'CREATOR'
    : activeRole === 'CREATOR' || activeRole === 'APPROVER';

  const canEditTicket = activeRole === 'CREATOR' && !isFinishedOrCancelled;
  const canCancelTicket = activeRole === 'CREATOR' && !isFinishedOrCancelled;

  const canLeaveTicket = isMeeting
    ? activeRole === 'WATCHER'
    : activeRole === 'EXECUTOR' || activeRole === 'WATCHER';

  // --- QUY TẮC PHÂN QUYỀN TÀI LIỆU & THẢO LUẬN ---
  const canAttachFile = isMeeting ? activeRole === 'CREATOR' : true;

  // --- QUY TẮC PHÂN QUYỀN NÚT TRẠNG THÁI TRONG NỘI DUNG ---
  const isPendingApproval = statusKey === 'PENDING' || (statusKey === 'ACTIVE' && Boolean(approver?.name));
  const isConsulting = statusKey === 'CONSULTING';
  const isApprovedOrActive =
    statusKey === 'APPROVED' || (statusKey === 'ACTIVE' && !approver?.name);

  // Người duyệt: Khi Chờ duyệt -> Duyệt, Lấy ý kiến, Không duyệt; Khi Đang lấy ý kiến -> Duyệt, Không duyệt
  const isUserAnApprover = Boolean(approver?.name && approver.name.includes(currentUser));
  const showApproverApproveBtn =
    !isMeeting && (activeRole === 'APPROVER' || isUserAnApprover) && (isPendingApproval || isConsulting);
  const showApproverConsultBtn =
    !isMeeting && (activeRole === 'APPROVER' || isUserAnApprover) && isPendingApproval;
  const showApproverRejectBtn =
    !isMeeting && (activeRole === 'APPROVER' || isUserAnApprover) && (isPendingApproval || isConsulting);

  // Người được lấy ý kiến: Khi Đang lấy ý kiến -> Gửi phản hồi ý kiến
  const showConsulteeReplyBtn =
    !isMeeting && activeRole === 'CONSULTEE' && isConsulting;

  // Người thực hiện: Khi Đang triển khai -> Hoàn thành
  const isUserAnExecutor =
    executors.some((e) => e.name.includes(currentUser)) ||
    (!approver?.name && creatorName.includes(currentUser));
  const showExecutorCompleteBtn =
    !isMeeting && (activeRole === 'EXECUTOR' || isUserAnExecutor) && isApprovedOrActive;

  // Lịch họp: Tham gia họp trực tuyến & Hoàn thành / Kết thúc cuộc họp
  const showMeetingJoinBtn = isMeeting && Boolean(event.meetingUrl);
  const showMeetingCompleteBtn =
    isMeeting && activeRole === 'CREATOR' && !isFinishedOrCancelled;

  const hasAnyWorkflowAction =
    showApproverApproveBtn ||
    showApproverConsultBtn ||
    showApproverRejectBtn ||
    showConsulteeReplyBtn ||
    showExecutorCompleteBtn ||
    showMeetingJoinBtn ||
    showMeetingCompleteBtn;

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (event.id) {
      if (nextState) {
        localStorage.setItem(`jt_muted_ticket_${event.id}`, 'true');
      } else {
        localStorage.removeItem(`jt_muted_ticket_${event.id}`);
      }
    }
    message.success(
      nextState ? 'Đã tắt thông báo cho mục này' : 'Đã bật nhận thông báo cho mục này'
    );
  };

  const handleLeaveTicket = () => {
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      message.success(isMeeting ? 'Bạn đã rời khỏi lịch họp này' : 'Bạn đã rời khỏi phiếu này');
      onDeleteEvent?.(event.id);
      onClose();
    }, 400);
  };

  const appendSystemLogAndUpdate = (
    nextStatus: CalendarEvent['approvalStatus'],
    logContent: string,
    updatedSteps?: CalendarEvent['steps'],
    extraFields?: Partial<CalendarEvent>
  ) => {
    const newComment = {
      id: `comm-log-${Date.now()}`,
      author: currentUser,
      content: logContent,
      createdAt: new Date().toISOString(),
    };

    const updated: CalendarEvent = {
      ...event,
      ...extraFields,
      approvalStatus: nextStatus,
      steps: updatedSteps || event.steps,
      comments: [...(event.comments || []), newComment],
    };

    const sysMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      author_name: currentUser,
      role: activeRole === 'WATCHER' ? 'EXECUTOR' : activeRole,
      content: logContent,
      time: dayjs().format('DD/MM HH:mm'),
      isMine: true,
    };

    setChatMessages((prev) => [...prev, sysMsg]);
    onUpdateEvent(updated);
  };

  const handleCancelOrRecallTicket = () => {
    const label = isMeeting ? 'Đã hủy lịch họp' : 'Đã thu hồi / hủy phiếu';
    appendSystemLogAndUpdate('CANCELLED', `[Hệ thống] ${currentUser}: ${label}.`);
    message.success(label);
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết vào bộ nhớ tạm');
    } else {
      message.info('Đã sao chép liên kết');
    }
  };

  const confirmCancelTicket = () => {
    Modal.confirm({
      title: isMeeting ? 'Xác nhận hủy lịch họp?' : 'Thu hồi / Hủy phiếu này?',
      content: isMeeting
        ? 'Lịch họp này sẽ chuyển sang trạng thái Đã hủy và gửi thông báo đến các thành viên.'
        : 'Phiếu này sẽ chuyển sang trạng thái Đã thu hồi / hủy.',
      okText: isMeeting ? 'Hủy lịch họp' : 'Thu hồi / Hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: () => handleCancelOrRecallTicket(),
    });
  };

  const confirmLeaveTicket = () => {
    Modal.confirm({
      title: isMeeting ? 'Rời khỏi lịch họp này?' : 'Rời khỏi phiếu này?',
      content: 'Bạn sẽ không còn nhận thông báo và mục này sẽ được gỡ khỏi danh sách cá nhân.',
      okText: isMeeting ? 'Rời lịch' : 'Rời phiếu',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleLeaveTicket(),
    });
  };

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'copy-link',
      icon: <Copy size={14} />,
      label: 'Sao chép liên kết',
      onClick: handleCopyLink,
    },
    ...(canLeaveTicket
      ? [
          {
            key: 'leave-ticket',
            icon: <LogOut size={14} />,
            label: isMeeting ? 'Rời lịch họp' : 'Rời phiếu',
            danger: true,
            onClick: confirmLeaveTicket,
          },
        ]
      : []),
    ...(canCancelTicket
      ? [
          {
            type: 'divider' as const,
          },
          {
            key: 'cancel-ticket',
            icon: <XCircle size={14} />,
            label: isMeeting ? 'Hủy lịch họp' : 'Thu hồi / Hủy phiếu',
            danger: true,
            onClick: confirmCancelTicket,
          },
        ]
      : []),
  ];

  const handleOpenEditModal = () => {
    setEditContent(event.notes || event.agenda || event.description || event.title || '');
    setEditLocation(event.location || '');
    setEditMeetingLink(event.meetingUrl || '');
    setEditDateTime(dayjs(event.deadline || event.startAt));
    setEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      message.warning('Vui lòng nhập nội dung');
      return;
    }
    const derivedTitle =
      trimmed.split('\n').find((line) => line.trim().length > 0)?.trim().slice(0, 120) || event.title;
    const isoTime = editDateTime ? editDateTime.toISOString() : event.startAt;

    appendSystemLogAndUpdate(
      event.approvalStatus,
      `[Cập nhật] ${creatorName} đã chỉnh sửa thông tin ${isMeeting ? 'lịch họp' : 'phiếu'}.`,
      event.steps,
      {
        title: derivedTitle,
        notes: trimmed,
        description: trimmed,
        agenda: trimmed,
        location: editLocation.trim() || undefined,
        meetingUrl: editMeetingLink.trim() || undefined,
        startAt: isoTime,
        endAt: isTask ? isoTime : dayjs(isoTime).add(1, 'hour').toISOString(),
        deadline: isTask ? isoTime : event.deadline,
      }
    );
    setEditModalOpen(false);
    message.success(isMeeting ? 'Đã cập nhật lịch họp' : 'Đã cập nhật thông tin phiếu');
  };

  // Action: Người duyệt bấm "Duyệt" (Cho nhập text nếu có)
  const handleConfirmApprove = () => {
    const approverName = approver?.name || currentUser;
    const noteText = approveNote.trim();
    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'APPROVED' as const,
          actor_name: approverName,
          completed_at: new Date().toISOString(),
          note: noteText || 'Đã duyệt chủ trương triển khai.',
        };
      }
      if (st.step_order === 3 || st.role === 'EXECUTOR') {
        return { ...st, status: 'ACTIVE' as const };
      }
      return st;
    });

    const logMsg = noteText
      ? `[Phê duyệt] Đã duyệt phiếu. Ý kiến: "${noteText}"`
      : '[Phê duyệt] Đã duyệt phiếu và chuyển sang giai đoạn triển khai.';
    appendSystemLogAndUpdate('APPROVED', logMsg, updatedSteps);
    setApproveNote('');
    setApproveModalOpen(false);
    message.success('Đã duyệt phiếu');
  };

  // Action: Người duyệt bấm "Lấy ý kiến" (Chỉ chọn người, không cần nhập câu hỏi)
  const handleConfirmConsult = () => {
    if (selectedConsultees.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 nhân sự cần lấy ý kiến');
      return;
    }
    const consulteeNames = selectedConsultees.join(', ');
    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'CONSULTING' as const,
          note: `Đang lấy ý kiến: ${consulteeNames}`,
        };
      }
      return st;
    });

    appendSystemLogAndUpdate(
      'CONSULTING',
      `[Lấy ý kiến] Đã chuyển lấy ý kiến từ: ${consulteeNames}`,
      updatedSteps
    );
    setSelectedConsultees([]);
    setConsultModalOpen(false);
    message.success('Đã gửi yêu cầu lấy ý kiến');
  };

  // Action: Người duyệt bấm "Không duyệt" (Nhập lý do nếu có)
  const handleConfirmReject = () => {
    const reasonText = rejectReason.trim();
    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'REJECTED' as const,
          completed_at: new Date().toISOString(),
          note: reasonText || 'Không duyệt phiếu.',
        };
      }
      return st;
    });

    const logMsg = reasonText
      ? `[Không duyệt] Từ chối phê duyệt. Lý do: "${reasonText}"`
      : '[Không duyệt] Đã từ chối phê duyệt phiếu.';
    appendSystemLogAndUpdate('REJECTED', logMsg, updatedSteps);
    setRejectReason('');
    setRejectModalOpen(false);
    message.success('Đã cập nhật trạng thái: Không duyệt');
  };

  // Action: Người được lấy ý kiến bấm "Gửi phản hồi ý kiến"
  const handleConfirmConsultReply = () => {
    const reply = consultReplyText.trim();
    if (!reply) {
      message.warning('Vui lòng nhập nội dung phản hồi ý kiến');
      return;
    }
    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'PENDING' as const,
          note: `Phản hồi ý kiến: "${reply}"`,
        };
      }
      return st;
    });

    appendSystemLogAndUpdate(
      'PENDING',
      `[Phản hồi ý kiến] Đã gửi ý kiến tham vấn lại cho Người duyệt: "${reply}"`,
      updatedSteps
    );
    setConsultReplyText('');
    setConsultReplyModalOpen(false);
    message.success('Đã gửi phản hồi ý kiến cho Người duyệt');
  };

  // Action: Người thực hiện bấm "Hoàn thành" (hoặc Người tạo kết thúc cuộc họp)
  const handleConfirmComplete = () => {
    const defaultExecutor = event.executors?.[0]?.name || currentUser;
    const report = completeReportText.trim();
    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 3 || st.role === 'EXECUTOR') {
        return {
          ...st,
          status: 'COMPLETED' as const,
          actor_name: defaultExecutor,
          completed_at: new Date().toISOString(),
          note: report || 'Đã hoàn thành công việc.',
        };
      }
      return st;
    });

    const logMsg = isMeeting
      ? '[Hoàn thành] Đã kết thúc cuộc họp.'
      : report
        ? `[Hoàn thành] Báo cáo kết quả: "${report}"`
        : '[Hoàn thành] Đã hoàn thành công việc.';
    appendSystemLogAndUpdate('COMPLETED', logMsg, updatedSteps, {
      responseStatus: 'accepted',
    });
    setCompleteReportText('');
    setCompleteModalOpen(false);
    message.success(isMeeting ? 'Đã kết thúc cuộc họp' : 'Đã báo cáo hoàn thành công việc');
  };

  const handleUploadAttachment = async (file: File) => {
    const newAtt: CalendarAttachmentItem = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || 'file',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser,
    };

    try {
      const res = await calendarApi.addAttachment(event.id, newAtt);
      message.success(`Đã đính kèm tệp: ${file.name}`);
      onUpdateEvent(res.data);
    } catch {
      message.error('Không thể tải lên tệp.');
    }
    return false;
  };

  const handleSelectChatFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      message.warning('Kích thước tệp vượt quá 25MB, vui lòng chọn tệp nhỏ hơn');
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
          type: fileToUpload.name.split('.').pop() || 'file',
          uploadedBy: currentUser,
        }
      : undefined;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      author_name: currentUser,
      role: activeRole === 'WATCHER' ? 'EXECUTOR' : activeRole,
      content: content,
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
      attachments: newAtt ? [newAtt] : undefined,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setSelectedChatFile(null);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const attachmentsToSend: CalendarAttachmentItem[] | undefined = fileToUpload
        ? [
            {
              id: `att-${Date.now()}`,
              name: fileToUpload.name,
              size: fileToUpload.size,
              type: fileToUpload.name.split('.').pop() || 'file',
              uploadedAt: new Date().toISOString(),
              uploadedBy: currentUser,
            },
          ]
        : undefined;

      const res = await calendarApi.addComment(event.id, content, attachmentsToSend);
      onUpdateEvent(res.data);
      if (fileToUpload) {
        message.success(`Đã đính kèm tệp: ${fileToUpload.name}`);
      }
    } catch {
      // Local optimistic update remains
    }
  };

  return (
    <>
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
        title={
          <div className="jt-document-drawer__header">
            <div className="jt-document-drawer__title-wrap">
              <Tag
                className={`jt-ticket-type-badge jt-ticket-type-badge--${
                  isTask ? 'task' : isMeeting ? 'meeting' : 'event'
                }`}
              >
                {isTask ? 'Công việc' : isMeeting ? 'Lịch họp' : 'Sự kiện'}
              </Tag>
              <h2>{event.title}</h2>
            </div>
            <div className="jt-document-drawer__header-actions">
              {/* 1. Bật / Tắt thông báo dạng Icon button kèm Tooltip */}
              <Tooltip title={isMuted ? 'Bật thông báo' : 'Tắt thông báo'}>
                <Button
                  aria-label={isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
                  className={`jt-drawer-action-btn jt-drawer-action-btn--icon ${
                    isMuted ? 'jt-drawer-action-btn--muted' : ''
                  }`}
                  icon={isMuted ? <BellOff size={14} /> : <Bell size={14} />}
                  onClick={handleToggleMute}
                  size="small"
                />
              </Tooltip>

              {/* 2. Chỉnh sửa phiếu / lịch họp: Nút chính duy nhất ở Header */}
              {canEditTicket && (
                <Button
                  className="jt-drawer-action-btn jt-drawer-action-btn--edit"
                  icon={<Edit3 size={13} />}
                  onClick={handleOpenEditModal}
                  size="small"
                >
                  {isMeeting ? 'Chỉnh sửa lịch' : 'Chỉnh sửa'}
                </Button>
              )}

              {/* 3. Menu thao tác phụ (More options dropdown) */}
              {moreMenuItems && moreMenuItems.length > 0 && (
                <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight" trigger={['click']}>
                  <Button
                    aria-label="Tùy chọn khác"
                    className="jt-drawer-action-btn jt-drawer-action-btn--icon jt-drawer-action-btn--more"
                    icon={<MoreHorizontal size={15} />}
                    size="small"
                    title="Tùy chọn khác"
                  />
                </Dropdown>
              )}
            </div>
            {onClose && (
              <Button
                aria-label="Đóng"
                className="jt-document-drawer__close-btn"
                icon={<X size={16} />}
                onClick={onClose}
                type="text"
              />
            )}
          </div>
        }
        width={1180}
      >
        <div className="jt-doc-detail">
          {event.isAdjusted && event.adjustedNote && (
            <div
              style={{
                margin: '10px 16px 0',
                padding: '10px 14px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                fontSize: 13,
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <strong>Lưu ý điều chỉnh:</strong>
              <span>{event.adjustedNote}</span>
            </div>
          )}

          <div className="jt-doc-detail__grid">
            {/* CỘT TRÁI: Pinned Hero Card + Role Workflow Actions + Activity Stream & Chat + Sticky Input */}
            <div className="jt-doc-detail-pane jt-doc-chat-pane">
              {/* 1. PINNED HERO CARD Ở ĐỈNH CỘT TRÁI (Chỉ hiển thị khi có thông tin bổ sung, không lặp lại tiêu đề/ngày) */}
              {showHeroCard && (
                <div className={`jt-pinned-hero-card ${cardCollapsed ? 'jt-pinned-hero-card--collapsed' : ''}`}>
                  <div className="jt-pinned-hero-card__header">
                    <div className="jt-pinned-hero-card__header-left">
                      <span className="jt-pinned-hero-card__label">
                        {isMeeting ? 'Thông tin cuộc họp' : 'Nội dung chi tiết'}
                      </span>
                    </div>

                    <div className="jt-pinned-hero-card__header-right">
                      <Button
                        type="text"
                        size="small"
                        className="jt-pinned-hero-card__toggle-btn"
                        icon={cardCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                        onClick={() => setCardCollapsed(!cardCollapsed)}
                      >
                        {cardCollapsed ? 'Xem chi tiết' : 'Thu gọn'}
                      </Button>
                    </div>
                  </div>

                  {!cardCollapsed && (
                    <div className="jt-pinned-hero-card__content">
                      {isMeeting && (event.mode || event.location || event.meetingUrl) && (
                        <div className="jt-pinned-hero-card__meta-bar">
                          {event.mode && (
                            <span className="jt-pinned-meta-chip">
                              <Video size={13} />{' '}
                              {event.mode === 'online'
                                ? 'Trực tuyến'
                                : event.mode === 'offline'
                                  ? 'Trực tiếp'
                                  : 'Kết hợp'}
                            </span>
                          )}
                          {event.location && (
                            <span className="jt-pinned-meta-chip">
                              <MapPin size={13} /> {event.location}
                            </span>
                          )}
                          {event.meetingUrl && (
                            <a
                              className="jt-pinned-meta-chip jt-pinned-meta-chip--link"
                              href={event.meetingUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <ExternalLink size={13} /> Tham gia họp trực tuyến
                            </a>
                          )}
                        </div>
                      )}

                      {hasExtraDesc && (
                        <div className="jt-pinned-hero-card__desc">
                          {rawDesc}
                        </div>
                      )}

                      {hasAttachments && (
                        <div className="jt-pinned-hero-card__attachments">
                          <span className="jt-pinned-attachments-label">
                            Tài liệu ({event.attachments!.length}):
                          </span>
                          <div className="jt-pinned-attachments-list">
                            {event.attachments!.map((att) => (
                              <span key={att.id} className="jt-pinned-attachment-chip" title={att.name}>
                                <Paperclip size={12} />
                                <span className="jt-pinned-attachment-chip__name">{att.name}</span>
                                <small style={{ color: '#94a3b8' }}>({formatBytes(att.size)})</small>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2. THANH ACTION XỬ LÝ TRẠNG THÁI THEO ĐÚNG VAI TRÒ (CHỈ HIỆN KHI ROLE CÓ QUYỀN) */}
              {hasAnyWorkflowAction && (
                <div className="jt-quick-log-bar" role="group" aria-label="Thao tác xử lý theo vai trò">
                  <span className="jt-quick-log-bar__label">Thao tác xử lý:</span>
                  <div className="jt-quick-log-bar__pills">
                    {showApproverApproveBtn && (
                      <Button
                        size="small"
                        className="jt-action-btn--approve"
                        icon={<CheckCircle size={13} />}
                        onClick={() => setApproveModalOpen(true)}
                      >
                        Duyệt
                      </Button>
                    )}

                    {showApproverConsultBtn && (
                      <Button
                        size="small"
                        className="jt-action-btn--consult"
                        icon={<MessageSquare size={13} />}
                        onClick={() => setConsultModalOpen(true)}
                      >
                        Lấy ý kiến
                      </Button>
                    )}

                    {showApproverRejectBtn && (
                      <Button
                        size="small"
                        className="jt-action-btn--reject"
                        icon={<XCircle size={13} />}
                        onClick={() => setRejectModalOpen(true)}
                      >
                        Không duyệt
                      </Button>
                    )}

                    {showConsulteeReplyBtn && (
                      <Button
                        size="small"
                        className="jt-action-btn--consult-reply"
                        icon={<Send size={13} />}
                        onClick={() => setConsultReplyModalOpen(true)}
                      >
                        Gửi phản hồi ý kiến
                      </Button>
                    )}

                    {showExecutorCompleteBtn && (
                      <Button
                        size="small"
                        className="jt-action-btn--complete"
                        icon={<CheckCircle size={13} />}
                        onClick={() => setCompleteModalOpen(true)}
                      >
                        Hoàn thành
                      </Button>
                    )}

                    {showMeetingJoinBtn && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<ExternalLink size={13} />}
                        onClick={() => window.open(event.meetingUrl, '_blank', 'noopener,noreferrer')}
                      >
                        Tham gia họp trực tuyến
                      </Button>
                    )}

                    {showMeetingCompleteBtn && (
                      <Button
                        size="small"
                        className="jt-action-btn--complete"
                        icon={<CheckCircle size={13} />}
                        onClick={handleConfirmComplete}
                      >
                        Hoàn thành / Kết thúc cuộc họp
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* 3. CHAT STREAM & ACTIVITY TIMELINE */}
              <div className="jt-chat-stream__timeline">
                <div className="jt-chat-system-event">
                  <div className="jt-chat-system-event__badge">
                    <FileText size={13} style={{ color: '#2563eb' }} />
                    <span className="jt-chat-system-event__text">
                      <strong>{creatorName}</strong> đã tạo{' '}
                      {isTask ? 'phiếu Công việc' : isMeeting ? 'lịch họp' : 'sự kiện'}
                    </span>
                    <span className="jt-chat-system-event__time">{createdTimeFormatted}</span>
                  </div>
                </div>

                {/* ĐÍNH KÈM TỆP THEO PHIẾU TRÊN TIMELINE TRAO ĐỔI */}
                {(() => {
                  const isCreatorMe =
                    creatorName === currentUser ||
                    creatorName === 'Nguyễn Minh Anh' ||
                    event.organizer === currentUser ||
                    event.isUserParticipant;

                  const commentAttachmentNames = new Set(
                    (event.comments || []).flatMap((c) => (c.attachments || []).map((a) => a.name))
                  );
                  const ticketAttachments = (event.attachments || []).filter(
                    (att) => !commentAttachmentNames.has(att.name)
                  );

                  if (ticketAttachments.length === 0) return null;

                  return (
                    <div
                      className={`jt-timeline-attachment-event ${
                        isCreatorMe ? 'jt-timeline-attachment-event--outgoing' : 'jt-timeline-attachment-event--incoming'
                      }`}
                    >
                      <div className="jt-timeline-attachment-event__header">
                        <div className="jt-timeline-attachment-event__badge">
                          <Paperclip size={12} style={{ color: isCreatorMe ? '#d92d20' : '#0284c7' }} />
                          <span className="jt-timeline-attachment-event__text">
                            <strong>{creatorName}</strong> đã đính kèm {ticketAttachments.length} tệp tài liệu
                          </span>
                          <span className="jt-chat-system-event__time">{createdTimeFormatted}</span>
                        </div>
                      </div>
                      <div className="jt-timeline-attachment-grid">
                        {ticketAttachments.map((att) => {
                          const cat = getFileCategory(att.name);
                          return (
                            <div
                              key={att.id}
                              className="jt-timeline-file-card"
                              onClick={() => message.info(`Đang mở tệp: ${att.name}`)}
                              title={`Xem hoặc tải về ${att.name}`}
                              role="button"
                              tabIndex={0}
                            >
                              <div
                                className="jt-timeline-file-card__badge"
                                style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}
                              >
                                <span className="jt-timeline-file-card__icon">{cat.icon}</span>
                                <span className="jt-timeline-file-card__ext">{cat.label}</span>
                              </div>
                              <div className="jt-timeline-file-card__info">
                                <span className="jt-timeline-file-card__name">{att.name}</span>
                                <span className="jt-timeline-file-card__meta">
                                  {formatBytes(att.size)}
                                  {att.uploadedBy && att.uploadedBy !== creatorName ? ` • ${att.uploadedBy}` : ''}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="jt-timeline-file-card__download"
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
                    </div>
                  );
                })()}

                {chatMessages.length === 0 ? (
                  <div className="jt-chat-empty-state">
                    Chưa có trao đổi nào. Hãy nhập tin nhắn bên dưới để bắt đầu trao đổi.
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      className={`jt-chat-message ${
                        msg.isMine ? 'jt-chat-message--outgoing' : 'jt-chat-message--incoming'
                      }`}
                      key={msg.id}
                    >
                      <Avatar
                        className="jt-chat-message__avatar"
                        icon={<User size={16} />}
                        size={32}
                        style={{
                          backgroundColor: msg.isMine ? '#d92d20' : '#94a3b8',
                        }}
                      />
                      <div className="jt-chat-message__wrap">
                        <div className="jt-chat-message__sender-row">
                          <span className="jt-chat-message__sender-name">{msg.author_name}</span>
                          <span className="jt-chat-message__time">{msg.time}</span>
                        </div>
                        <div
                          className={`jt-chat-message__bubble ${
                            msg.isMine
                              ? 'jt-chat-message__bubble--outgoing'
                              : 'jt-chat-message__bubble--incoming'
                          }`}
                        >
                          {msg.content && <div className="jt-chat-message__text">{msg.content}</div>}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="jt-chat-bubble-attachments">
                              {msg.attachments.map((att, idx) => {
                                const cat = getFileCategory(att.name);
                                return (
                                  <div
                                    key={att.id || `${att.name}-${idx}`}
                                    className={`jt-chat-bubble-file ${
                                      msg.isMine ? 'jt-chat-bubble-file--outgoing' : 'jt-chat-bubble-file--incoming'
                                    }`}
                                    onClick={() => message.info(`Đang mở tệp: ${att.name}`)}
                                    title={`Tải về / Xem ${att.name}`}
                                    role="button"
                                    tabIndex={0}
                                  >
                                    <div
                                      className="jt-chat-bubble-file__badge"
                                      style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}
                                    >
                                      <span className="jt-chat-bubble-file__icon">{cat.icon}</span>
                                      <span className="jt-chat-bubble-file__ext">{cat.label}</span>
                                    </div>
                                    <div className="jt-chat-bubble-file__info">
                                      <span className="jt-chat-bubble-file__name">{att.name}</span>
                                      {att.size ? (
                                        <span className="jt-chat-bubble-file__size">{formatBytes(att.size)}</span>
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
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 4. STICKY BOTTOM INPUT BAR */}
              <div className="jt-chat-stream__sticky-input-bar">
                {selectedChatFile && (
                  <div className="jt-chat-file-preview-chip">
                    <Paperclip size={12} />
                    <span className="jt-chat-file-preview-chip__name">{selectedChatFile.name}</span>
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
                    style={{ display: 'none' }}
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
                  <span style={{ display: 'none' }}>Đính kèm</span>
                  <span style={{ display: 'none' }}>Thảo luận</span>
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

            {/* CỘT PHẢI: Thông tin của phiếu & Nhật ký trạng thái */}
            <div className="jt-doc-detail-sidebar-stack">
              {/* Card 1: Thông tin của phiếu */}
              <section className="jt-doc-detail-pane jt-doc-detail-pane--info">
                <div className="jt-doc-detail-pane__header">
                  <div>
                    <span className="jt-doc-detail-pane__eyebrow">THÔNG TIN</span>
                    <h3>Thông tin chi tiết</h3>
                  </div>
                  <Tag className={`jt-doc-status jt-doc-status--${statusInfo.tone}`}>
                    {statusInfo.label}
                  </Tag>
                </div>

                <div className="jt-doc-info-list">
                  <div className="jt-doc-info-item">
                    <span className="jt-doc-info-item__label">
                      <span className="jt-doc-info-icon">
                        <User size={14} />
                      </span>
                      Người tạo
                    </span>
                    <span className="jt-doc-info-item__value">
                      <strong>{creatorName}</strong>
                    </span>
                  </div>

                  <div className="jt-doc-info-item">
                    <span className="jt-doc-info-item__label">
                      <span className="jt-doc-info-icon">
                        <Calendar size={14} />
                      </span>
                      {isTask ? 'Hạn hoàn thành' : isMeeting ? 'Thời gian họp' : 'Thời gian sự kiện'}
                    </span>
                    <span className="jt-doc-info-item__value">{timeDisplay}</span>
                  </div>

                  {!isMeeting && (
                    <div className="jt-doc-info-item jt-doc-info-item--block">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <Users size={14} />
                        </span>
                        Người triển khai ({executors.length})
                      </span>
                      {executors.length > 0 ? (
                        <div className="jt-doc-info-user-list">
                          {executors.map((u: { name: string }, idx: number) => (
                            <span className="jt-doc-info-user-name" key={idx}>
                              {u.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12.5 }}>Chưa chọn</span>
                      )}
                    </div>
                  )}

                  {!isMeeting && approver?.name && (
                    <div className="jt-doc-info-item">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <User size={14} />
                        </span>
                        Người duyệt / Giao việc
                      </span>
                      <span className="jt-doc-info-item__value">
                        <strong>{approver.name}</strong>
                      </span>
                    </div>
                  )}

                  {(isMeeting || !isTask) && event.participants && event.participants.length > 0 && (
                    <div className="jt-doc-info-item jt-doc-info-item--block">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <Users size={14} />
                        </span>
                        Thành phần tham gia ({event.participants.length})
                      </span>
                      <div className="jt-doc-info-user-list">
                        {event.participants.map((name: string, idx: number) => (
                          <span className="jt-doc-info-user-name" key={idx}>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isMeeting && (
                    <div className="jt-doc-info-item jt-doc-info-item--block">
                      <div className="jt-doc-info-item__header-row">
                        <span className="jt-doc-info-item__label">
                          <span className="jt-doc-info-icon">
                            <Users size={14} />
                          </span>
                          Người theo dõi ({watchers.length})
                        </span>
                        {canManageFollowers && (
                          <Button
                            className="jt-doc-info-action-btn"
                            icon={<UserPlus size={12} />}
                            onClick={() => setFollowerModalOpen(true)}
                            size="small"
                            type="text"
                          >
                            Quản lý
                          </Button>
                        )}
                      </div>
                      {watchers.length > 0 ? (
                        <div className="jt-doc-info-user-list">
                          {watchers.map((u: { name: string }, idx: number) => (
                            <span className="jt-doc-info-user-name" key={idx}>
                              {u.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12.5 }}>Chưa có</span>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Card 2: Quy trình thực hiện */}
              <aside className="jt-doc-detail-pane jt-doc-detail-pane--steps">
                <div className="jt-doc-detail-pane__header">
                  <div>
                    <span className="jt-doc-detail-pane__eyebrow">QUY TRÌNH</span>
                    <h3>Quy trình thực hiện</h3>
                  </div>
                  <Tag>{isMeeting || !approver?.name ? '2 bước' : '3 bước'}</Tag>
                </div>

                {(() => {
                  const step1 = (event.steps || []).find((s) => s.step_order === 1 || s.role === 'CREATOR');
                  const step2 = (event.steps || []).find((s) => s.step_order === 2 || s.role === 'APPROVER' || s.role === 'CONSULTANT');
                  const step3 = (event.steps || []).find((s) => s.step_order === 3 || s.role === 'EXECUTOR');
                  const hasApprovalStep = !isMeeting && Boolean(approver?.name);

                  return (
                    <div className="jt-doc-steps">
                      <div className="jt-doc-step">
                        <div className="jt-doc-step__rail">
                          <span className="is-done" />
                          <i />
                        </div>
                        <div className="jt-doc-step__card">
                          <div className="jt-doc-step__top">
                            <div>
                              <span className="jt-doc-step__order">BƯỚC 1</span>
                              <h4>{isMeeting ? 'Khởi tạo lịch' : 'Khởi tạo phiếu'}</h4>
                            </div>
                            <Tag color="success">Đã tạo</Tag>
                          </div>

                          <div className="jt-doc-step__actor">
                            <User size={12} />
                            <strong className="jt-doc-step__actor-name">
                              {step1?.actor_name && step1.actor_name !== 'Bùi Lê Thế Kiệt'
                                ? step1.actor_name
                                : creatorName}
                            </strong>
                            <span className="jt-doc-step__time">
                              {step1?.completed_at ? dayjs(step1.completed_at).format('DD/MM HH:mm') : createdTimeFormatted}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isMeeting ? (
                        <div className="jt-doc-step">
                          <div className="jt-doc-step__rail">
                            <span className="is-done" />
                          </div>
                          <div className="jt-doc-step__card">
                            <div className="jt-doc-step__top">
                              <div>
                                <span className="jt-doc-step__order">BƯỚC 2</span>
                                <h4>Diễn ra cuộc họp</h4>
                              </div>
                              <Tag color={statusKey === 'COMPLETED' ? 'success' : 'processing'}>
                                {statusKey === 'COMPLETED' ? 'Đã họp' : 'Đã lên lịch'}
                              </Tag>
                            </div>

                            <div className="jt-doc-step__actor">
                              <User size={12} />
                              <strong className="jt-doc-step__actor-name">
                                {event.leader || event.organizer || 'Ban Biên tập'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {hasApprovalStep && (
                            <div className="jt-doc-step">
                              <div className="jt-doc-step__rail">
                                <span
                                  className={
                                    statusKey === 'APPROVED' || statusKey === 'COMPLETED'
                                      ? 'is-done'
                                      : statusKey === 'REJECTED'
                                        ? 'is-rejected'
                                        : ''
                                  }
                                />
                                <i />
                              </div>
                              <div className="jt-doc-step__card">
                                <div className="jt-doc-step__top">
                                  <div>
                                    <span className="jt-doc-step__order">BƯỚC 2</span>
                                    <h4>{statusKey === 'CONSULTING' ? 'Trao đổi ý kiến' : 'Rà soát / Phê duyệt'}</h4>
                                  </div>
                                  {statusKey === 'APPROVED' || statusKey === 'COMPLETED' ? (
                                    <Tag color="success">Đã duyệt</Tag>
                                  ) : statusKey === 'REJECTED' ? (
                                    <Tag color="error">Tạm dừng</Tag>
                                  ) : statusKey === 'CONSULTING' ? (
                                    <Tag color="purple">Đang lấy ý kiến</Tag>
                                  ) : (
                                    <Tag color="warning">Đang xử lý</Tag>
                                  )}
                                </div>

                                <div className="jt-doc-step__actor">
                                  {statusKey === 'CONSULTING' ? (
                                    <MessageSquare size={12} style={{ color: '#7c3aed' }} />
                                  ) : (
                                    <Crown size={12} style={{ color: '#d97706' }} />
                                  )}
                                  <strong className="jt-doc-step__actor-name">
                                    {step2?.actor_name || approver?.name}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="jt-doc-step">
                            <div className="jt-doc-step__rail">
                              <span className={statusKey === 'COMPLETED' ? 'is-done' : ''} />
                            </div>
                            <div className="jt-doc-step__card">
                              <div className="jt-doc-step__top">
                                <div>
                                  <span className="jt-doc-step__order">BƯỚC {hasApprovalStep ? '3' : '2'}</span>
                                  <h4>Hoàn thành công việc</h4>
                                </div>
                                {statusKey === 'COMPLETED' ? (
                                  <Tag color="success">Hoàn thành</Tag>
                                ) : statusKey === 'APPROVED' ? (
                                  <Tag color="processing">Đang thực hiện</Tag>
                                ) : statusKey === 'REJECTED' ? (
                                  <Tag color="default">Đã dừng</Tag>
                                ) : (
                                  <Tag color="warning">Chờ hoàn thành</Tag>
                                )}
                              </div>

                              <div className="jt-doc-step__actor">
                                <Wrench size={12} style={{ color: '#16a34a' }} />
                                <strong className="jt-doc-step__actor-name">
                                  {step3?.actor_name && step3.actor_name !== 'Bùi Lê Thế Kiệt'
                                    ? step3.actor_name
                                    : executors.length > 0
                                      ? executors.map((e: { name: string }) => e.name).join(', ')
                                      : 'Chưa phân công'}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </aside>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal Thêm người theo dõi */}
      <Modal
        cancelText="Hủy"
        okText="Lưu"
        onCancel={() => setFollowerModalOpen(false)}
        onOk={() => {
          message.success('Đã cập nhật danh sách người theo dõi');
          setFollowerModalOpen(false);
        }}
        open={followerModalOpen}
        title="Người theo dõi mục ghi nhận"
      >
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Nhân sự trong danh sách theo dõi sẽ nắm bắt tiến độ và nhật ký trao đổi của mục này.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {['Lê Văn Tuấn', 'Võ Hoàng Nam', 'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Thị Mai'].map((name, i) => (
            <Checkbox defaultChecked={i === 0} key={i}>
              {name}
            </Checkbox>
          ))}
        </div>
      </Modal>

      {/* Modal Duyệt phiếu (Người duyệt) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ style: { backgroundColor: '#16a34a', borderColor: '#16a34a' } }}
        okText="Xác nhận duyệt"
        onCancel={() => {
          setApproveModalOpen(false);
          setApproveNote('');
        }}
        onOk={handleConfirmApprove}
        open={approveModalOpen}
        title="Phê duyệt phiếu"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>
          Bạn đang phê duyệt chủ trương triển khai cho mục ghi nhận này. Bạn có thể nhập ý kiến chỉ đạo hoặc lưu ý (không bắt buộc).
        </p>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          onChange={(e) => setApproveNote(e.target.value)}
          placeholder="Nhập ý kiến chỉ đạo, yêu cầu triển khai... (tùy chọn)"
          value={approveNote}
        />
      </Modal>

      {/* Modal Lấy ý kiến (Người duyệt) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ style: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' } }}
        okText="Gửi yêu cầu"
        onCancel={() => {
          setConsultModalOpen(false);
          setSelectedConsultees([]);
        }}
        onOk={handleConfirmConsult}
        open={consultModalOpen}
        title="Lấy ý kiến tham vấn"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>
          Chọn nhân sự hoặc chuyên gia cần lấy ý kiến chuyên môn trước khi đưa ra quyết định duyệt.
        </p>
        <Select
          mode="multiple"
          onChange={setSelectedConsultees}
          options={CONSULT_CANDIDATE_OPTIONS}
          placeholder="Chọn người cần lấy ý kiến..."
          style={{ width: '100%' }}
          value={selectedConsultees}
        />
      </Modal>

      {/* Modal Không duyệt / Tạm dừng (Người duyệt) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ danger: true }}
        okText="Xác nhận không duyệt"
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason('');
        }}
        onOk={handleConfirmReject}
        open={rejectModalOpen}
        title="Không duyệt phiếu"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>
          Phiếu sẽ được cập nhật sang trạng thái <strong>Không duyệt / Tạm dừng</strong>. Bạn có thể nhập lý do (không bắt buộc).
        </p>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do không duyệt... (tùy chọn)"
          value={rejectReason}
        />
      </Modal>

      {/* Modal Gửi phản hồi ý kiến (Người được lấy ý kiến) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ style: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' } }}
        okText="Gửi phản hồi"
        onCancel={() => {
          setConsultReplyModalOpen(false);
          setConsultReplyText('');
        }}
        onOk={handleConfirmConsultReply}
        open={consultReplyModalOpen}
        title="Phản hồi ý kiến tham vấn"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>
          Nhập ý kiến chuyên môn của bạn để gửi phản hồi lại cho Người duyệt phiếu.
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
        okButtonProps={{ style: { backgroundColor: '#16a34a', borderColor: '#16a34a' } }}
        okText="Xác nhận hoàn thành"
        onCancel={() => {
          setCompleteModalOpen(false);
          setCompleteReportText('');
        }}
        onOk={handleConfirmComplete}
        open={completeModalOpen}
        title={isMeeting ? 'Kết thúc cuộc họp' : 'Báo cáo hoàn thành công việc'}
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>
          {isMeeting
            ? 'Xác nhận cuộc họp đã kết thúc và ghi nhận vào nhật ký tiến độ.'
            : 'Xác nhận công việc đã được hoàn thành. Bạn có thể ghi chú kết quả đạt được.'}
        </p>
        {!isMeeting && (
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            onChange={(e) => setCompleteReportText(e.target.value)}
            placeholder="Ghi chú kết quả hoàn thành công việc... (tùy chọn)"
            value={completeReportText}
          />
        )}
      </Modal>

      {/* Modal Chỉnh sửa thông tin (Người tạo) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okText="Lưu thay đổi"
        onCancel={() => setEditModalOpen(false)}
        onOk={handleConfirmEdit}
        open={editModalOpen}
        title={isMeeting ? 'Chỉnh sửa lịch họp' : 'Chỉnh sửa phiếu'}
        width={560}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label
              htmlFor="edit-ticket-content"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#1e293b' }}
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
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#1e293b' }}
            >
              {isTask ? 'Hạn hoàn thành' : 'Thời gian'}
            </label>
            <DatePicker
              format="HH:mm DD/MM/YYYY"
              id="edit-ticket-datetime"
              onChange={(val) => setEditDateTime(val)}
              showTime
              style={{ width: '100%' }}
              value={editDateTime}
            />
          </div>

          {!isTask && (
            <div>
              <label
                htmlFor="edit-ticket-location"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#1e293b' }}
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

          {isMeeting && (
            <div>
              <label
                htmlFor="edit-ticket-meeting-link"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#1e293b' }}
              >
                Link họp trực tuyến
              </label>
              <Input
                id="edit-ticket-meeting-link"
                onChange={(e) => setEditMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                value={editMeetingLink}
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
