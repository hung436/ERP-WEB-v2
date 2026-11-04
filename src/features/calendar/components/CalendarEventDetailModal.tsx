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
  Plus,
  Send,
  User,
  UserPlus,
  Users,
  Video,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/AuthContext';
import { calendarApi } from '@/services/api';
import type { CalendarAttachmentItem, CalendarEvent } from '@/types/domain';
import { avatarTone, nameInitials } from '@/utils/avatar';

import { getApprovalStatusMeta } from '../calendarWeekUtils';
import { formatBytes, getFileCategory } from './AttachedFilesList';
import { SUGGESTED_MEMBERS } from './CreatePersonalMeetingModal';
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
  ACTIVE: { label: 'Đang thực hiện', tone: 'success' },
  CONSULTING: { label: 'Đang lấy ý kiến', tone: 'purple' },
  COMPLETED: { label: 'Đã hoàn thành', tone: 'success' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
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

  const [addParticipantModalOpen, setAddParticipantModalOpen] = useState(false);
  const [selectedNewParticipants, setSelectedNewParticipants] = useState<string[]>([]);
  const [selectedNewWatchers, setSelectedNewWatchers] = useState<string[]>([]);

  const isMe = (name?: string) => {
    if (!name) return false;
    const n = name.trim().toLowerCase();
    const u = (currentUser || '').trim().toLowerCase();
    return (
      n.includes('nguyễn minh anh') ||
      n.includes('minh anh') ||
      n.includes('nhanvien') ||
      (u !== '' && (n.includes(u) || u.includes(n)))
    );
  };

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

    const isUserApprover = Boolean(
      (event.approver?.name && isMe(event.approver.name)) ||
      (event.approvers && event.approvers.some((a) => isMe(a.name)))
    );

    const isUserConsultee = Boolean(
      (event.consultantName && isMe(event.consultantName)) ||
      (event.consultants && event.consultants.some((c) => isMe(c.name) && c.status === 'PENDING')) ||
      (event.steps || []).some(
        (s) =>
          (s.role === 'CONSULTANT' || s.step_order === 2) &&
          ((s.note && isMe(s.note)) || (s.actor_name && isMe(s.actor_name)))
      )
    );

    const isUserExecutor = Boolean(
      (event.executors && event.executors.some((e) => isMe(e.name))) ||
      (!event.approver?.name && (!event.approvers || event.approvers.length === 0) && isMe(resolvedCreator))
    );

    if (!isMeetingEvent) {
      if (isUserApprover && (currentStatus === 'PENDING' || currentStatus === 'CONSULTING')) {
        setActiveRole('APPROVER');
      } else if (isUserConsultee && currentStatus === 'CONSULTING') {
        setActiveRole('CONSULTEE');
      } else if (isUserExecutor && (currentStatus === 'APPROVED' || currentStatus === 'ACTIVE')) {
        setActiveRole('EXECUTOR');
      } else if (isMe(resolvedCreator)) {
        setActiveRole('CREATOR');
      } else if (isUserExecutor) {
        setActiveRole('EXECUTOR');
      } else if ((event.watchers || []).some((w) => isMe(w.name))) {
        setActiveRole('WATCHER');
      } else {
        setActiveRole('CREATOR');
      }
    } else {
      if (isMe(resolvedCreator)) {
        setActiveRole('CREATOR');
      } else if ((event.participants || []).some((p) => isMe(p))) {
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
          if (
            c.content &&
            /^\[(Hệ thống|Phê duyệt|Lấy ý kiến|Không duyệt|Phản hồi ý kiến|Hoàn thành|Người theo dõi|Thành phần|Cập nhật)\]/.test(
              c.content.trim()
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
              time: dayjs(c.createdAt).format('HH:mm DD/MM'),
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
  const isCreatorMe = isMe(creatorName) || isMe(event.organizer);
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

  const isProposal =
    event.workflowType === 'PROPOSAL' ||
    Boolean(event.approver?.name) ||
    (event.approvers && event.approvers.length > 0) ||
    event.approvalStatus === 'PENDING' ||
    event.approvalStatus === 'CONSULTING' ||
    event.approvalStatus === 'REJECTED';

  const approvalMeta = getApprovalStatusMeta(
    event.approvalStatus,
    event.ticketType || (isMeeting ? 'MEETING' : 'TASK'),
    isProposal ? 'PROPOSAL' : 'DISPATCH'
  );
  const statusKey = approvalMeta.value;
  const statusInfo = approvalMeta;

  const executors = event.executors || [];
  const approver = event.approver;

  const participantsList = useMemo(() => {
    const list: Array<{ name: string; role?: string }> = [];
    const seen = new Set<string>();

    if (event.executors && event.executors.length > 0) {
      event.executors.forEach((e) => {
        if (!seen.has(e.name)) {
          seen.add(e.name);
          list.push({ name: e.name, role: e.role });
        }
      });
    }

    if (event.participants && event.participants.length > 0) {
      event.participants.forEach((name) => {
        if (!seen.has(name)) {
          seen.add(name);
          list.push({ name });
        }
      });
    }

    return list;
  }, [event.executors, event.participants]);
  const isFinishedOrCancelled =
    statusKey === 'COMPLETED' || statusKey === 'REJECTED' || (statusKey as string) === 'CANCELLED' || (statusKey as string) === 'RECALLED';

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
  const canAttachFile = true;

  // --- QUY TẮC PHÂN QUYỀN NÚT TRẠNG THÁI TRONG NỘI DUNG ---
  const isPendingApproval = isProposal && statusKey === 'PENDING';
  const hasPendingConsultants = Boolean(
    event.consultants && event.consultants.some((c) => c.status === 'PENDING')
  );
  const hasAnyConsultants = Boolean(event.consultants && event.consultants.length > 0);
  const isApprovedOrActive =
    statusKey === 'APPROVED' || statusKey === 'IN_PROGRESS';

  // --- QUY TẮC PHÂN QUYỀN NÚT TRẠNG THÁI THEO USER ROLE ---
  const isUserAnApprover = Boolean(
    (event.approver?.name && isMe(event.approver.name)) ||
    (event.approvers &&
      event.approvers.some((a) => isMe(a.name) && a.status !== 'APPROVED' && a.status !== 'REJECTED'))
  );
  const isUserAConsultee = Boolean(
    event.consultants && event.consultants.some((c) => isMe(c.name) && c.status === 'PENDING')
  );
  const isUserExecutorDone = Boolean(
    event.executors &&
      event.executors.some((e) => isMe(e.name)) &&
      event.executors.filter((e) => isMe(e.name)).every((e) => e.status === 'COMPLETED')
  );
  const isUserAnExecutor = Boolean(
    ((event.executors && event.executors.some((e) => isMe(e.name))) ||
      (!isProposal && !isMeeting && isMe(creatorName))) &&
      !isUserExecutorDone
  );

  // Người duyệt: Khi Chờ duyệt -> Duyệt, Lấy ý kiến, Không duyệt
  const showApproverApproveBtn =
    !isMeeting && (activeRole === 'APPROVER' || isUserAnApprover) && isPendingApproval;
  const showApproverConsultBtn =
    !isMeeting &&
    (activeRole === 'APPROVER' || isUserAnApprover) &&
    isPendingApproval &&
    !hasAnyConsultants;
  const showApproverRejectBtn =
    !isMeeting && (activeRole === 'APPROVER' || isUserAnApprover) && isPendingApproval;

  // Người được lấy ý kiến: Khi có ý kiến tham vấn đang chờ xử lý của mình -> Gửi ý kiến
  const showConsulteeReplyBtn =
    !isMeeting && isUserAConsultee && hasPendingConsultants;

  // Người thực hiện: Khi là Phiếu Triển khai đang thực hiện -> Hoàn thành (Phiếu Đề xuất không có nút Hoàn thành)
  const showExecutorCompleteBtn =
    !isMeeting &&
    !isProposal &&
    isUserAnExecutor &&
    statusKey === 'IN_PROGRESS' &&
    !isFinishedOrCancelled;

  // Lịch họp: Tham gia họp trực tuyến & Hoàn thành / Kết thúc cuộc họp
  const showMeetingJoinBtn = isMeeting && Boolean(event.meetingUrl) && !isFinishedOrCancelled;
  const showMeetingCompleteBtn =
    isMeeting && (isCreatorMe || activeRole === 'CREATOR') && !isFinishedOrCancelled;

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
      message.success('Bạn đã chọn không tham gia mục này');
      onDeleteEvent?.(event.id);
      onClose();
    }, 400);
  };

  const appendSystemLogAndUpdate = (
    nextStatus: CalendarEvent['approvalStatus'],
    _logContent: string,
    updatedSteps?: CalendarEvent['steps'],
    extraFields?: Partial<CalendarEvent>
  ) => {
    const updated: CalendarEvent = {
      ...event,
      ...extraFields,
      approvalStatus: nextStatus,
      steps: updatedSteps || event.steps,
    };

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
      title: 'Không tham gia?',
      content: 'Bạn sẽ không còn nhận thông báo và mục này sẽ được gỡ khỏi danh sách cá nhân.',
      okText: 'Không tham gia',
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
            label: 'Không tham gia',
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
    setEditContent(event.title || event.notes || event.agenda || event.description || '');
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

  // Action: Thêm thành phần thực hiện / tham gia
  const handleConfirmAddParticipants = () => {
    if (!selectedNewParticipants || selectedNewParticipants.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 nhân sự');
      return;
    }
    const currentParts = event.participants || [];
    const mergedParts = Array.from(new Set([...currentParts, ...selectedNewParticipants]));
    const currentExecs = event.executors || [];
    const newExecsToAdd = selectedNewParticipants
      .filter((p) => !currentExecs.some((e) => e.name === p))
      .map((p, idx) => ({
        id: `exec-${Date.now()}-${idx}`,
        name: p,
        status: 'IN_PROGRESS' as const,
      }));
    const updatedExecutors = [...currentExecs, ...newExecsToAdd];
    const logMsg = `[Thành phần] Đã thêm thành phần: ${selectedNewParticipants.join(', ')}`;
    appendSystemLogAndUpdate(event.approvalStatus || 'APPROVED', logMsg, event.steps, {
      participants: mergedParts,
      participantText: mergedParts.join(', '),
      participantCount: mergedParts.length,
      executors: updatedExecutors,
    });
    setSelectedNewParticipants([]);
    setAddParticipantModalOpen(false);
    message.success('Đã thêm thành phần');
  };

  // Action: Quản lý / Thêm người theo dõi
  const handleConfirmSaveFollowers = () => {
    if (!selectedNewWatchers || selectedNewWatchers.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 người theo dõi');
      return;
    }
    const currentW = watchers.length > 0 ? watchers : event.watchers || [];
    const newWToAdd = selectedNewWatchers
      .filter((w) => !currentW.some((item) => item.name === w))
      .map((w, idx) => ({ id: `w-${Date.now()}-${idx}`, name: w }));
    const mergedWatchers = [...currentW, ...newWToAdd];
    const logMsg = `[Người theo dõi] Đã thêm người theo dõi: ${selectedNewWatchers.join(', ')}`;
    appendSystemLogAndUpdate(event.approvalStatus, logMsg, event.steps, {
      watchers: mergedWatchers,
    });
    setWatchers(mergedWatchers);
    setSelectedNewWatchers([]);
    setFollowerModalOpen(false);
    message.success('Đã thêm người theo dõi');
  };

  // Action: Người duyệt bấm Duyệt phiếu
  const handleConfirmApprove = () => {
    const noteText = approveNote.trim();
    const approverName = approver?.name || currentUser;
    const nowIso = new Date().toISOString();

    const currentApprovers = event.approvers || [];
    const updatedApprovers =
      currentApprovers.length > 0
        ? currentApprovers.map((a) =>
            isMe(a.name) || a.name.includes(currentUser) || currentApprovers.length === 1
              ? {
                  ...a,
                  status: 'APPROVED' as const,
                  completed_at: nowIso,
                  note: noteText || a.note,
                }
              : a
          )
        : [
            {
              id: 'appr-1',
              name: approverName,
              status: 'APPROVED' as const,
              completed_at: nowIso,
              note: noteText || undefined,
            },
          ];

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'APPROVED' as const,
          completed_at: nowIso,
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
      : '[Phê duyệt] Đã duyệt phiếu và hoàn tất phê duyệt.';
    appendSystemLogAndUpdate('APPROVED', logMsg, updatedSteps, {
      approvers: updatedApprovers,
    });
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
    const existingCons = event.consultants || [];
    const newConsultants = selectedConsultees
      .filter((c) => !existingCons.some((item) => item.name === c))
      .map((c, idx) => ({
        id: `cons-${Date.now()}-${idx}`,
        name: c,
        status: 'PENDING' as const,
      }));
    const mergedConsultants = [...existingCons, ...newConsultants];
    const consulteeNames = mergedConsultants.map((c) => c.name).join(', ');

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
      'PENDING',
      `[Lấy ý kiến] Đã chuyển lấy ý kiến từ: ${consulteeNames}`,
      updatedSteps,
      {
        consultantName: consulteeNames,
        consultants: mergedConsultants,
      }
    );
    setSelectedConsultees([]);
    setConsultModalOpen(false);
    message.success('Đã gửi yêu cầu lấy ý kiến');
  };

  // Action: Người duyệt bấm "Không duyệt" (Nhập lý do nếu có)
  const handleConfirmReject = () => {
    const reasonText = rejectReason.trim();
    const nowIso = new Date().toISOString();
    const currentApprovers = event.approvers || [];
    const updatedApprovers =
      currentApprovers.length > 0
        ? currentApprovers.map((a) =>
            isMe(a.name) || a.name.includes(currentUser) || currentApprovers.length === 1
              ? {
                  ...a,
                  status: 'REJECTED' as const,
                  completed_at: nowIso,
                  note: reasonText || a.note,
                }
              : a
          )
        : [
            {
              id: 'appr-1',
              name: approver?.name || currentUser,
              status: 'REJECTED' as const,
              completed_at: nowIso,
              note: reasonText || undefined,
            },
          ];

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'REJECTED' as const,
          completed_at: nowIso,
          note: reasonText || 'Không duyệt phiếu.',
        };
      }
      return st;
    });

    const logMsg = reasonText
      ? `[Không duyệt] Từ chối phê duyệt. Lý do: "${reasonText}"`
      : '[Không duyệt] Đã từ chối phê duyệt phiếu.';
    appendSystemLogAndUpdate('REJECTED', logMsg, updatedSteps, {
      approvers: updatedApprovers,
    });
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
    const nowIso = new Date().toISOString();
    const currentCons = event.consultants || [];
    const updatedCons =
      currentCons.length > 0
        ? currentCons.map((c) =>
            isMe(c.name) || c.name.includes(currentUser) || currentCons.length === 1
              ? { ...c, status: 'COMPLETED' as const, completed_at: nowIso, reply }
              : c
          )
        : [{ id: 'cons-1', name: currentUser, status: 'COMPLETED' as const, completed_at: nowIso, reply }];

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          note: `Phản hồi ý kiến từ ${currentUser}: "${reply}"`,
        };
      }
      return st;
    });

    appendSystemLogAndUpdate(
      'PENDING',
      `[Phản hồi ý kiến] ${currentUser} gửi ý kiến tham vấn: "${reply}"`,
      updatedSteps,
      {
        consultReply: reply,
        consultants: updatedCons,
      }
    );
    setConsultReplyText('');
    setConsultReplyModalOpen(false);
    message.success('Đã gửi ý kiến cho Người duyệt');
  };

  // Action: Người thực hiện bấm "Hoàn thành" (hoặc Người tạo kết thúc cuộc họp)
  const handleConfirmComplete = () => {
    const defaultExecutor = event.executors?.[0]?.name || currentUser;
    const report = completeReportText.trim();
    const nowIso = new Date().toISOString();

    const currentExecutors = event.executors || [];
    const updatedExecutors = currentExecutors.map((ex) => ({
      ...ex,
      status: 'COMPLETED' as const,
      completed_at: ex.completed_at || nowIso,
    }));

    const allDone = true;
    const nextStatus = isMeeting ? 'COMPLETED' : isProposal ? 'APPROVED' : 'COMPLETED';

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 3 || st.role === 'EXECUTOR') {
        return {
          ...st,
          status: allDone ? ('COMPLETED' as const) : ('IN_PROGRESS' as const),
          actor_name: defaultExecutor,
          completed_at: allDone ? nowIso : undefined,
          note: report || (allDone ? 'Đã hoàn thành công việc.' : undefined),
        };
      }
      return st;
    });

    const logMsg = isMeeting
      ? '[Hoàn thành] Đã kết thúc cuộc họp.'
      : report
        ? `[Hoàn thành] Báo cáo kết quả: "${report}"`
        : allDone
          ? '[Hoàn thành] Đã hoàn thành toàn bộ công việc.'
          : `[Hoàn thành] ${currentUser} đã báo cáo hoàn thành phần việc.`;

    appendSystemLogAndUpdate(nextStatus, logMsg, updatedSteps, {
      responseStatus: allDone ? 'accepted' : event.responseStatus,
      executors: updatedExecutors,
    });
    setCompleteReportText('');
    setCompleteModalOpen(false);
    message.success(isMeeting ? 'Đã kết thúc cuộc họp' : allDone ? 'Đã hoàn thành toàn bộ công việc' : 'Đã báo cáo hoàn thành phần việc');
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
              <h2 className="jt-document-drawer__title-text">
                {isMeeting ? 'Chi tiết lịch họp' : 'Chi tiết phiếu'}
              </h2>
              <span className={`booking-week-status-badge booking-week-status-${approvalMeta.tone}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="jt-document-drawer__header-actions">
              {/* 1. Bật / Tắt thông báo dạng Icon button kèm Tooltip */}
              <Tooltip title={isMuted ? 'Bật thông báo' : 'Tắt thông báo'}>
                <Button
                  aria-label={isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
                  className={`jt-drawer-action-btn jt-drawer-action-btn--icon ${
                    isMuted ? 'jt-drawer-action-btn--muted' : ''
                  }`}
                  icon={isMuted ? <BellOff size={15} /> : <Bell size={15} />}
                  onClick={handleToggleMute}
                  size="small"
                />
              </Tooltip>

              {/* 2. Không tham gia dạng Icon button kèm Tooltip */}
              <Tooltip title="Không tham gia">
                <Button
                  aria-label="Không tham gia"
                  className="jt-drawer-action-btn jt-drawer-action-btn--icon jt-drawer-action-btn--leave"
                  icon={<LogOut size={15} />}
                  onClick={confirmLeaveTicket}
                  size="small"
                />
              </Tooltip>

              {/* 3. Nút Đóng drawer */}
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
            {/* CỘT TRÁI: Pinned Card Nội dung & file đính kèm + Trao đổi & Chat Composer */}
            <div className="jt-doc-detail-pane jt-doc-chat-pane">
              {/* 1. NỘI DUNG VÀ TỆP ĐÍNH KÈM (CHỈ HIỂN THỊ NỘI DUNG DUY NHẤT) */}
              <div className={`jt-pinned-hero-card ${cardCollapsed ? 'jt-pinned-hero-card--collapsed' : ''}`}>
                <div className="jt-pinned-hero-card__body">
                  <div className="jt-pinned-hero-card__main-row">
                    <div className="jt-pinned-hero-card__text">
                      {event.title || rawDesc}
                    </div>
                    <button
                      type="button"
                      className="jt-pinned-hero-card__chevron-btn"
                      aria-label={cardCollapsed ? 'Mở rộng nội dung' : 'Thu gọn nội dung'}
                      onClick={() => setCardCollapsed(!cardCollapsed)}
                    >
                      {cardCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                    </button>
                  </div>

                  {!cardCollapsed && (
                    <>
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

                      {hasAttachments && (
                        <div className="jt-pinned-attachments-list">
                          {event.attachments!.map((att) => (
                            <span key={att.id} className="jt-pinned-attachment-chip" title={att.name}>
                              <Paperclip size={12} />
                              <span className="jt-pinned-attachment-chip__name">{att.name}</span>
                              <small className="jt-pinned-attachment-chip__size">({formatBytes(att.size)})</small>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

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
                  const commentAttachmentNames = new Set(
                    (event.comments || []).flatMap((c) => (c.attachments || []).map((a) => a.name))
                  );
                  const ticketAttachments = (event.attachments || []).filter(
                    (att) => !commentAttachmentNames.has(att.name)
                  );

                  if (ticketAttachments.length === 0) return null;

                  return (
                    <div className="jt-chat-system-event jt-chat-system-event--attachment">
                      <div className="jt-chat-system-event__badge">
                        <Paperclip size={12} style={{ color: '#475467' }} />
                        <span className="jt-chat-system-event__text">
                          <strong>{creatorName}</strong> đã đính kèm {ticketAttachments.length} tệp tài liệu
                        </span>
                        <span className="jt-chat-system-event__time">{createdTimeFormatted}</span>
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
                            <span className="jt-chat-message__sender-name">{msg.author_name}</span>
                          </div>
                        )}
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
                          <div className="jt-chat-message__meta">
                            <time
                              className={`jt-chat-message__time ${
                                msg.isMine ? 'jt-chat-message__time--mine' : ''
                              }`}
                            >
                              {msg.time}
                            </time>
                          </div>
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

            {/* CỘT PHẢI: Thông tin của phiếu, Quy trình & Hàng nút action */}
            <div className="jt-doc-detail-sidebar-stack">
              <div className="jt-doc-detail-sidebar-scroll">
                {/* Card 1: Thông tin của phiếu */}
                <section className="jt-doc-detail-pane jt-doc-detail-pane--info">
                <div className="jt-doc-info-list">
                  {/* Thời gian */}
                  <div className="jt-doc-info-item">
                    <span className="jt-doc-info-item__label">
                      <span className="jt-doc-info-icon">
                        <Calendar size={14} />
                      </span>
                      Thời gian
                    </span>
                    <span className="jt-doc-info-item__value">{timeDisplay}</span>
                  </div>

                  {/* Thành phần */}
                  <div className="jt-doc-info-item jt-doc-info-item--block">
                    <div className="jt-person-sec-header">
                      <span className="jt-person-sec-title">
                        <Users size={13} style={{ color: '#64748b' }} />
                        <span>Thành phần</span>
                        <span className="jt-person-sec-count">({participantsList.length})</span>
                      </span>
                    </div>

                    <div className="jt-person-avatar-row">
                      {participantsList.map((p: { name: string; role?: string }, idx: number) => (
                        <span className="jt-person-chip" key={idx} title={p.role ? `${p.name} (${p.role})` : p.name}>
                          <span className="jt-person-chip__avatar">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="jt-person-chip__name">{p.name}</span>
                          {isMe(p.name) && <span className="jt-person-chip__me-tag">Bạn</span>}
                        </span>
                      ))}
                      <button
                        type="button"
                        className="jt-person-add-tag-chip"
                        onClick={() => {
                          setSelectedNewParticipants([]);
                          setAddParticipantModalOpen(true);
                        }}
                        aria-label="Thêm thành phần"
                      >
                        <Plus size={12} strokeWidth={2.2} />
                        <span>Thêm thành phần</span>
                      </button>
                    </div>
                  </div>

                  {/* Người theo dõi (Chỉ hiển thị khi không phải cuộc họp) */}
                  {!isMeeting && (
                    <div className="jt-doc-info-item jt-doc-info-item--block">
                      <div className="jt-person-sec-header">
                        <span className="jt-person-sec-title">
                          <Users size={13} style={{ color: '#64748b' }} />
                          <span>Người theo dõi</span>
                          <span className="jt-person-sec-count">({watchers.length})</span>
                        </span>
                      </div>

                      <div className="jt-person-avatar-row">
                        {watchers.map((u: { name: string }, idx: number) => (
                          <span className="jt-person-chip" key={idx} title={u.name}>
                            <span className="jt-person-chip__avatar" style={{ background: '#fef3c7', color: '#b45309' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="jt-person-chip__name">{u.name}</span>
                            {isMe(u.name) && <span className="jt-person-chip__me-tag">Bạn</span>}
                          </span>
                        ))}
                        <button
                          type="button"
                          className="jt-person-add-tag-chip"
                          onClick={() => {
                            setSelectedNewWatchers([]);
                            setFollowerModalOpen(true);
                          }}
                          aria-label="Thêm người theo dõi"
                        >
                          <Plus size={12} strokeWidth={2.2} />
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
                      fontSize: 11.5,
                      padding: '1px 8px',
                      backgroundColor: isMeeting
                        ? '#f5f3ff'
                        : isProposal
                        ? '#eff6ff'
                        : '#ecfdf5',
                      color: isMeeting
                        ? '#6d28d9'
                        : isProposal
                        ? '#1d4ed8'
                        : '#047857',
                      borderColor: isMeeting
                        ? '#ddd6fe'
                        : isProposal
                        ? '#bfdbfe'
                        : '#a7f3d0',
                    }}
                  >
                    {isMeeting ? '2 bước' : isProposal ? 'Đề xuất' : 'Triển khai'}
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
                          <h4>{isMeeting ? 'Khởi tạo lịch' : 'Khởi tạo phiếu'}</h4>
                        </div>
                      </div>

                      <div className="jt-step-person-list">
                        <div className="jt-step-person-row">
                          <div className="jt-step-person-left">
                            <User size={13} style={{ color: '#64748b' }} />
                            <span className="jt-step-person-name">
                              {creatorName}{isCreatorMe ? ' (Bạn)' : ''}
                            </span>
                            <span className="jt-step-person-time">- {createdTimeFormatted}</span>
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
                        <span className={statusKey === 'COMPLETED' ? 'is-done' : ''} />
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
                              <User size={13} style={{ color: '#64748b' }} />
                              <span className="jt-step-person-name">
                                {event.leader || event.organizer || 'Ban Biên tập'}
                              </span>
                              {statusKey === 'COMPLETED' && (
                                <span className="jt-step-person-time">- {timeDisplay}</span>
                              )}
                            </div>
                            <Tag color={statusKey === 'COMPLETED' ? 'success' : 'processing'}>
                              {statusKey === 'COMPLETED' ? 'Đã họp' : 'Đã lên lịch'}
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
                            statusKey === 'APPROVED' || statusKey === 'COMPLETED'
                              ? 'is-done'
                              : statusKey === 'REJECTED'
                                ? 'is-rejected'
                                : ''
                          }
                        />
                      </div>
                      <div className="jt-doc-step__card">
                        <div className="jt-doc-step__top">
                          <div>
                            <span className="jt-doc-step__order">BƯỚC 2</span>
                            <h4>
                              {Boolean(event.consultants && event.consultants.length > 0)
                                ? 'Lấy ý kiến & Duyệt phiếu'
                                : 'Duyệt phiếu'}
                            </h4>
                          </div>
                        </div>

                        <div className="jt-step-person-list">
                          {/* Tiểu mục 1: Lấy ý kiến (chỉ hiển thị khi có nhân sự được lấy ý kiến) */}
                          {Boolean(event.consultants && event.consultants.length > 0) && (
                            <>
                              <div className="jt-step-subheading">Lấy ý kiến</div>
                              {event.consultants!.map((c, idx) => {
                                const isDone = c.status === 'COMPLETED';
                                return (
                                  <div className="jt-step-person-row" key={idx}>
                                    <div className="jt-step-person-left">
                                      <MessageSquare size={13} style={{ color: '#7c3aed' }} />
                                      <span className="jt-step-person-name">
                                        {c.name}{isMe(c.name) ? ' (Bạn)' : ''}
                                      </span>
                                      {isDone && c.completed_at && (
                                        <span className="jt-step-person-time">
                                          - {dayjs(c.completed_at).format('DD/MM HH:mm')}
                                        </span>
                                      )}
                                    </div>
                                    <Tag color={isDone ? 'purple' : 'warning'}>
                                      {isDone ? 'Đã cho ý kiến' : 'Chờ xử lý'}
                                    </Tag>
                                  </div>
                                );
                              })}
                            </>
                          )}

                          {/* Tiểu mục 2: Duyệt phiếu (chỉ hiển thị nhãn phụ nếu trước đó có bước Lấy ý kiến để phân biệt) */}
                          {Boolean(event.consultants && event.consultants.length > 0) && (
                            <div className="jt-step-subheading" style={{ marginTop: 12 }}>
                              Duyệt phiếu
                            </div>
                          )}
                          {(event.approvers && event.approvers.length > 0
                            ? event.approvers
                            : approver?.name
                              ? [{
                                  id: 'appr-1',
                                  name: approver.name,
                                  status: (statusKey === 'APPROVED' || statusKey === 'COMPLETED'
                                    ? 'APPROVED'
                                    : statusKey === 'REJECTED'
                                      ? 'REJECTED'
                                      : 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
                                  completed_at: event.startAt,
                                }]
                              : [{
                                  id: 'appr-default',
                                  name: 'Đ/c Đinh Minh Trung',
                                  status: (statusKey === 'APPROVED' || statusKey === 'COMPLETED'
                                    ? 'APPROVED'
                                    : statusKey === 'REJECTED'
                                      ? 'REJECTED'
                                      : 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
                                  completed_at: event.startAt,
                                }]
                          ).map((a, idx) => {
                            const isApproved =
                              a.status === 'APPROVED' ||
                              (a as any).status === 'COMPLETED' ||
                              statusKey === 'APPROVED' ||
                              statusKey === 'COMPLETED';
                            const isRejected = a.status === 'REJECTED' || statusKey === 'REJECTED';
                            const isProcessed = isApproved || isRejected;
                            return (
                              <div key={idx}>
                                <div className="jt-step-person-row">
                                  <div className="jt-step-person-left">
                                    <CheckCircle
                                      size={13}
                                      style={{
                                        color: isApproved ? '#16a34a' : isRejected ? '#dc2626' : '#f59e0b',
                                      }}
                                    />
                                    <span className="jt-step-person-name">
                                      {a.name}{isMe(a.name) ? ' (Bạn)' : ''}
                                    </span>
                                    {isProcessed && (a.completed_at || event.startAt) && (
                                      <span className="jt-step-person-time">
                                        - {dayjs(a.completed_at || event.startAt).format('DD/MM HH:mm')}
                                      </span>
                                    )}
                                  </div>
                                  <Tag color={isApproved ? 'success' : isRejected ? 'error' : 'warning'}>
                                    {isApproved ? 'Đã duyệt' : isRejected ? 'Không duyệt' : 'Chờ xử lý'}
                                  </Tag>
                                </div>
                                {a.note && (
                                  <div style={{ fontSize: 12, color: '#475569', marginTop: 3, paddingLeft: 19, fontStyle: 'italic', lineHeight: '1.4' }}>
                                    "{a.note}"
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Nhánh Phiếu Triển khai */
                    <div className="jt-doc-step">
                      <div className="jt-doc-step__rail">
                        <span className={statusKey === 'COMPLETED' ? 'is-done' : ''} />
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
                            ? participantsList.map((p: { name: string; role?: string }, idx: number) => {
                                const matchedExec = (event.executors || []).find((ex) => ex.name === p.name);
                                return {
                                  id: matchedExec?.id ?? idx,
                                  name: p.name,
                                  status: (matchedExec?.status ||
                                    (statusKey === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')) as
                                    | 'IN_PROGRESS'
                                    | 'COMPLETED',
                                  completed_at:
                                    matchedExec?.completed_at ||
                                    (statusKey === 'COMPLETED' ? event.startAt || new Date().toISOString() : undefined),
                                };
                              })
                            : [{
                                id: 'exec-default',
                                name: currentUser,
                                status: (statusKey === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS') as
                                  | 'IN_PROGRESS'
                                  | 'COMPLETED',
                                completed_at: statusKey === 'COMPLETED' ? event.startAt || new Date().toISOString() : undefined,
                              }]
                          ).map((e: { name: string; status?: string; completed_at?: string }, idx: number) => {
                            const isDone = e.status === 'COMPLETED' || statusKey === 'COMPLETED';
                            return (
                              <div className="jt-step-person-row" key={idx}>
                                <div className="jt-step-person-left">
                                  <User size={13} style={{ color: isDone ? '#16a34a' : '#2563eb' }} />
                                  <span className="jt-step-person-name">
                                    {e.name}{isMe(e.name) ? ' (Bạn)' : ''}
                                  </span>
                                  {isDone && (e.completed_at || event.startAt) && (
                                    <span className="jt-step-person-time">
                                      - {dayjs(e.completed_at || event.startAt).format('DD/MM HH:mm')}
                                    </span>
                                  )}
                                </div>
                                <Tag color={isDone ? 'success' : 'processing'}>
                                  {isDone ? 'Hoàn thành' : 'Đang thực hiện'}
                                </Tag>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
              )}
            </div>

            {/* 3. HÀNG NÚT ACTION XỬ LÝ THEO VAI TRÒ (ĐÁY CỘT PHẢI - CỐ ĐỊNH / FIXED) */}
            {hasAnyWorkflowAction && (
                <div className="jt-doc-action-group" role="group" aria-label="Thao tác xử lý">
                  {/* Row 1: Nút Duyệt (Primary Emerald thanh lịch) */}
                  {showApproverApproveBtn && (
                    <div className="jt-action-row--full">
                      <Button
                        type="primary"
                        className="jt-action-btn--approve-modern"
                        icon={<CheckCircle size={14} />}
                        onClick={() => setApproveModalOpen(true)}
                        block
                      >
                        Duyệt phiếu
                      </Button>
                    </div>
                  )}

                  {/* Row 2: 2 nút phụ (Lấy ý kiến & Không duyệt) với style Neutral Soft */}
                  {(showApproverRejectBtn || showApproverConsultBtn) && (
                    <div className="jt-action-row--split">
                      {showApproverConsultBtn && (
                        <Button
                          className="jt-action-btn--consult-subtle"
                          icon={<MessageSquare size={14} />}
                          onClick={() => setConsultModalOpen(true)}
                        >
                          Lấy ý kiến
                        </Button>
                      )}
                      {showApproverRejectBtn && (
                        <Button
                          className="jt-action-btn--reject-subtle"
                          icon={<XCircle size={14} />}
                          onClick={() => setRejectModalOpen(true)}
                        >
                          Không duyệt
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Row 3: Nút Hoàn thành (Primary Emerald) */}
                  {(showExecutorCompleteBtn || showMeetingCompleteBtn) && (
                    <div className="jt-action-row--full">
                      <Button
                        type="primary"
                        className="jt-action-btn--complete-modern"
                        icon={<CheckCircle size={14} />}
                        onClick={showMeetingCompleteBtn ? handleConfirmComplete : () => setCompleteModalOpen(true)}
                        block
                      >
                        {isMeeting ? 'Kết thúc cuộc họp' : 'Hoàn thành'}
                      </Button>
                    </div>
                  )}

                  {/* Nút phụ đặc thù: Gửi ý kiến */}
                  {showConsulteeReplyBtn && (
                    <div className="jt-action-row--full">
                      <Button
                        type="primary"
                        className="jt-action-btn--consult-reply-modern"
                        icon={<Send size={14} />}
                        onClick={() => setConsultReplyModalOpen(true)}
                        block
                      >
                        Gửi ý kiến
                      </Button>
                    </div>
                  )}

                  {showMeetingJoinBtn && (
                    <div className="jt-action-row--full">
                      <Button
                        type="primary"
                        icon={<ExternalLink size={14} />}
                        onClick={() => window.open(event.meetingUrl, '_blank', 'noopener,noreferrer')}
                        block
                      >
                        Tham gia họp trực tuyến
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal Thêm thành phần */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okText="Thêm"
        onCancel={() => {
          setAddParticipantModalOpen(false);
          setSelectedNewParticipants([]);
        }}
        onOk={handleConfirmAddParticipants}
        open={addParticipantModalOpen}
        title="Thêm thành phần"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>
          Chọn thêm nhân sự tham gia hoặc thực hiện mục ghi nhận này.
        </p>
        <Select
          mode="multiple"
          onChange={setSelectedNewParticipants}
          options={SUGGESTED_MEMBERS}
          placeholder="Chọn thành phần..."
          style={{ width: '100%' }}
          value={selectedNewParticipants}
        />
      </Modal>

      {/* Modal Thêm người theo dõi */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okText="Thêm"
        onCancel={() => {
          setFollowerModalOpen(false);
          setSelectedNewWatchers([]);
        }}
        onOk={handleConfirmSaveFollowers}
        open={followerModalOpen}
        title="Thêm người theo dõi"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>
          Chọn thêm nhân sự theo dõi tiến độ và trao đổi của mục này.
        </p>
        <Select
          mode="multiple"
          onChange={setSelectedNewWatchers}
          options={SUGGESTED_MEMBERS.filter((m) => !watchers.some((w) => w.name === m.value))}
          placeholder="Chọn người theo dõi mới..."
          style={{ width: '100%' }}
          value={selectedNewWatchers}
        />
      </Modal>


      {/* Modal Duyệt phiếu (Người duyệt) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669' } }}
        okText="Xác nhận duyệt"
        onCancel={() => {
          setApproveModalOpen(false);
          setApproveNote('');
        }}
        onOk={handleConfirmApprove}
        open={approveModalOpen}
        title="Duyệt phiếu"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
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

      {/* Modal Gửi ý kiến (Người được lấy ý kiến) */}
      <Modal
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ style: { backgroundColor: '#2563eb', borderColor: '#2563eb' } }}
        okText="Gửi ý kiến"
        onCancel={() => {
          setConsultReplyModalOpen(false);
          setConsultReplyText('');
        }}
        onOk={handleConfirmConsultReply}
        open={consultReplyModalOpen}
        title="Gửi ý kiến"
      >
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
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
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669' } }}
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
              Thời gian
            </label>
            <DatePicker
              allowClear={false}
              format="HH:mm DD/MM/YYYY"
              id="edit-ticket-datetime"
              needConfirm
              onChange={(val) => setEditDateTime(val)}
              showTime={{ format: 'HH:mm' }}
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
