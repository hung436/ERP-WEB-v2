import {
  Avatar,
  Button,
  Checkbox,
  Drawer,
  Input,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
  message,
} from 'antd';
import dayjs from 'dayjs';
import {
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Crown,
  FileText,
  LogOut,
  MapPin,
  MessageSquare,
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

import { calendarApi } from '@/services/api';
import type { CalendarAttachmentItem, CalendarEvent } from '@/types/domain';

import { formatBytes } from './AttachedFilesList';
import { SUGGESTED_MEMBERS } from './CreatePersonalMeetingModal';
import './JobTicketDetailDrawer.css';

const DOC_STATUS_LABELS: Record<string, { label: string; tone: 'warning' | 'success' | 'danger' | 'purple' }> = {
  DRAFT: { label: 'Bản nháp', tone: 'warning' },
  PENDING: { label: 'Chờ duyệt / Đang xử lý', tone: 'warning' },
  ACTIVE: { label: 'Chờ duyệt / Đang xử lý', tone: 'warning' },
  CONSULTING: { label: 'Đang lấy ý kiến', tone: 'purple' },
  COMPLETED: { label: 'Đã hoàn tất', tone: 'success' },
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

interface ChatMessage {
  id: string;
  author_name: string;
  role?: 'CREATOR' | 'EXECUTOR' | 'APPROVER' | 'CONSULTEE';
  content: string;
  time: string;
  isMine?: boolean;
}

export function CalendarEventDetailModal({
  event,
  open,
  onClose,
  onUpdateEvent,
  onDeleteEvent,
}: CalendarEventDetailModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [cardCollapsed, setCardCollapsed] = useState(false);
  const [followerModalOpen, setFollowerModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals tương tác đa vai trò
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [consultTarget, setConsultTarget] = useState('TS. Trần Quốc Hùng (Chuyên gia khách mời)');
  const [consultQuestion, setConsultQuestion] = useState('');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeNote, setCompleteNote] = useState('');
  const [consultReplyModalOpen, setConsultReplyModalOpen] = useState(false);

  // Phản hồi của Người được lấy ý kiến
  const [consultReply, setConsultReply] = useState('');

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
    // Khởi tạo watchers
    const initialWatchers =
      event.watchers && event.watchers.length > 0
        ? event.watchers
        : [{ id: 'usr-w1', name: 'Lê Văn Tuấn' }];
    setWatchers(initialWatchers);

    // Khởi tạo tin nhắn thảo luận chuẩn theo Image 5
    const msgs: ChatMessage[] = [];

    if (event.comments && event.comments.length > 0) {
      event.comments.forEach((c) => {
        msgs.push({
          id: c.id,
          author_name: c.author,
          role: c.author === 'Bùi Lê Thế Kiệt' ? 'CREATOR' : 'EXECUTOR',
          content: c.content,
          time: dayjs(c.createdAt).format('HH:mm DD/MM'),
          isMine: c.author === 'Bùi Lê Thế Kiệt',
        });
      });
    } else {
      // Tin nhắn mặc định từ Thành viên ban chuyên trách
      msgs.push({
        id: `default-welcome-${event.id}`,
        author_name: 'Thành viên ban chuyên trách',
        role: 'EXECUTOR',
        content: `Chào mọi người, chúng ta bắt đầu trao đổi và phối hợp triển khai công việc "${event.title}" tại đây nhé.`,
        time: '30/10 14:23',
      });
    }

    setChatMessages(msgs);
  }, [event]);

  if (!event) return null;

  const isTask = event.ticketType === 'TASK';
  const isMeeting = event.ticketType === 'MEETING' || (!event.ticketType && event.type === 'meeting');

  const currentUser = 'Bùi Lê Thế Kiệt';

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
      nextState ? 'Đã tắt thông báo cho phiếu này' : 'Đã bật nhận thông báo cho phiếu này'
    );
  };

  const handleLeaveTicket = () => {
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      message.success('Bạn đã rời khỏi phiếu này');
      onDeleteEvent?.(event.id);
      onClose();
    }, 400);
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
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      author_name: currentUser,
      role: 'CREATOR',
      content: content || (fileToUpload ? `[Tệp đính kèm: ${fileToUpload.name}]` : ''),
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setSelectedChatFile(null);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      if (fileToUpload) {
        await handleUploadAttachment(fileToUpload);
      }
      if (content) {
        const res = await calendarApi.addComment(event.id, content);
        onUpdateEvent(res.data);
      }
    } catch {
      // Local optimistic update remains
    }
  };

  // ─── TÁC TỬ: APPROVER DUYỆT PHIẾU ───
  const handleApproveConfirm = () => {
    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'APPROVED' as const,
          actor_name: event.approver?.name || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
          completed_at: new Date().toISOString(),
          note: approveNote.trim() || 'Đồng ý phê duyệt chủ trương triển khai theo kế hoạch.',
        };
      }
      if (st.step_order === 3 || st.role === 'EXECUTOR') {
        return {
          ...st,
          status: 'ACTIVE' as const,
        };
      }
      return st;
    });

    const updated: CalendarEvent = {
      ...event,
      approvalStatus: 'APPROVED',
      steps: updatedSteps,
    };

    const sysMsg: ChatMessage = {
      id: `msg-sys-appr-${Date.now()}`,
      author_name: event.approver?.name || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
      role: 'APPROVER',
      content: `Đã phê duyệt phiếu.${approveNote.trim() ? ` Ghi chú chỉ đạo: "${approveNote.trim()}"` : ''}`,
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);
    onUpdateEvent(updated);
    setApproveModalOpen(false);
    setApproveNote('');
    message.success('Đã phê duyệt phiếu thành công!');
  };

  // ─── TÁC TỬ: APPROVER TỪ CHỐI / KHÔNG DUYỆT ───
  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do không duyệt');
      return;
    }

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'REJECTED' as const,
          actor_name: event.approver?.name || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
          completed_at: new Date().toISOString(),
          note: rejectReason.trim(),
        };
      }
      if (st.step_order === 3 || st.role === 'EXECUTOR') {
        return {
          ...st,
          status: 'CANCELLED' as const,
        };
      }
      return st;
    });

    const updated: CalendarEvent = {
      ...event,
      approvalStatus: 'REJECTED',
      steps: updatedSteps,
    };

    const sysMsg: ChatMessage = {
      id: `msg-sys-rej-${Date.now()}`,
      author_name: event.approver?.name || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
      role: 'APPROVER',
      content: `Không duyệt phiếu. Lý do: "${rejectReason.trim()}"`,
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);
    onUpdateEvent(updated);
    setRejectModalOpen(false);
    setRejectReason('');
    message.error('Đã từ chối phê duyệt phiếu');
  };

  // ─── TÁC TỬ: APPROVER LẤY Ý KIẾN THAM VẤN ───
  const handleConsultConfirm = () => {
    if (!consultQuestion.trim()) {
      message.warning('Vui lòng nhập nội dung câu hỏi cần lấy ý kiến');
      return;
    }

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'CONSULTING' as const,
          actor_name: consultTarget,
          note: `Tham vấn ý kiến: "${consultQuestion.trim()}"`,
        };
      }
      return st;
    });

    const updated: CalendarEvent = {
      ...event,
      approvalStatus: 'CONSULTING',
      consultQuestion: consultQuestion.trim(),
      consultantName: consultTarget,
      steps: updatedSteps,
    };

    const sysMsg: ChatMessage = {
      id: `msg-sys-cons-${Date.now()}`,
      author_name: event.approver?.name || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)',
      role: 'APPROVER',
      content: `Yêu cầu tham vấn ý kiến từ ${consultTarget}: "${consultQuestion.trim()}"`,
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);
    onUpdateEvent(updated);
    setConsultModalOpen(false);
    setConsultQuestion('');
    message.info(`Đã gửi yêu cầu lấy ý kiến tham vấn tới ${consultTarget}`);
  };

  // ─── TÁC TỬ: CONSULTEE GỬI PHẢN HỒI Ý KIẾN ───
  const handleSendConsultReply = () => {
    if (!consultReply.trim()) {
      message.warning('Vui lòng nhập ý kiến đóng góp / phản hồi');
      return;
    }

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        return {
          ...st,
          status: 'ACTIVE' as const,
          note: `Ý kiến phản hồi: "${consultReply.trim()}"`,
        };
      }
      return st;
    });

    const updated: CalendarEvent = {
      ...event,
      approvalStatus: 'ACTIVE',
      consultReply: consultReply.trim(),
      steps: updatedSteps,
    };

    const replyMsg: ChatMessage = {
      id: `msg-cons-reply-${Date.now()}`,
      author_name: event.consultantName || 'TS. Trần Quốc Hùng (Chuyên gia khách mời)',
      role: 'CONSULTEE',
      content: `[Ý kiến tham vấn]: ${consultReply.trim()}`,
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
    };
    setChatMessages((prev) => [...prev, replyMsg]);
    onUpdateEvent(updated);
    setConsultReply('');
    setConsultReplyModalOpen(false);
    message.success('Đã gửi ý kiến phản hồi cho Lãnh đạo phê duyệt!');
  };

  // ─── TÁC TỬ: EXECUTOR BÁO CÁO HOÀN THÀNH ───
  const handleCompleteConfirm = () => {
    const defaultExecutor = event.executors?.[0]?.name || 'Bùi Lê Thế Kiệt';
    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 3 || st.role === 'EXECUTOR') {
        return {
          ...st,
          status: 'COMPLETED' as const,
          actor_name: defaultExecutor,
          completed_at: new Date().toISOString(),
          note: completeNote.trim() || 'Đã hoàn thành toàn bộ các hạng mục công việc theo yêu cầu.',
        };
      }
      return st;
    });

    const updated: CalendarEvent = {
      ...event,
      approvalStatus: 'COMPLETED',
      steps: updatedSteps,
    };

    const sysMsg: ChatMessage = {
      id: `msg-sys-comp-${Date.now()}`,
      author_name: defaultExecutor,
      role: 'EXECUTOR',
      content: `Đã báo cáo hoàn thành nhiệm vụ.${completeNote.trim() ? ` Kết quả: "${completeNote.trim()}"` : ''}`,
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);
    onUpdateEvent(updated);
    setCompleteModalOpen(false);
    setCompleteNote('');
    message.success('Đã báo cáo hoàn thành nhiệm vụ!');
  };

  const creatorName = event.leader || event.organizer || 'Bùi Lê Thế Kiệt';

  // 1 mốc thời gian duy nhất cho cả 3 loại đối tượng theo đặc tả 2.3
  const timeDisplay = dayjs(event.deadline || event.startAt).format('HH:mm DD/MM/YYYY');

  const statusKey = String(
    event.approvalStatus ||
      (!isMeeting ? 'PENDING' : event.responseStatus === 'accepted' ? 'COMPLETED' : 'ACTIVE')
  );
  const statusInfo = DOC_STATUS_LABELS[statusKey] || {
    label: 'Chờ duyệt / Đang xử lý',
    tone: 'warning' as const,
  };

  const executors =
    event.executors && event.executors.length > 0
      ? event.executors
      : [
          { id: 'usr-ex1', name: 'Bùi Lê Thế Kiệt' },
          { id: 'usr-ex2', name: 'Nguyễn Văn An' },
        ];

  const approver = event.approver || { id: 'usr-ap1', name: 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)' };

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
              <h2>{event.title}</h2>
            </div>
            <div className="jt-document-drawer__header-actions">
              <Button
                className={`jt-drawer-action-btn ${isMuted ? 'jt-drawer-action-btn--muted' : ''}`}
                icon={isMuted ? <BellOff size={14} /> : <Bell size={14} />}
                onClick={handleToggleMute}
                size="small"
              >
                {isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
              </Button>

              <Button
                className="jt-drawer-action-btn"
                icon={<UserPlus size={14} />}
                onClick={() => setFollowerModalOpen(true)}
                size="small"
              >
                Thêm người theo dõi
              </Button>

              <Popconfirm
                cancelText="Hủy"
                description="Bạn sẽ không còn nhận thông báo và phiếu sẽ không hiển thị trong danh sách của bạn."
                okButtonProps={{ danger: true }}
                okText="Rời phiếu"
                onConfirm={handleLeaveTicket}
                title="Rời khỏi phiếu này?"
              >
                <Button
                  className="jt-drawer-action-btn jt-drawer-action-btn--leave"
                  icon={<LogOut size={14} />}
                  loading={actionLoading}
                  size="small"
                >
                  Rời phiếu
                </Button>
              </Popconfirm>
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
        width={1220}
      >
        <div className="jt-doc-detail">
          {event.isAdjusted && event.adjustedNote && (
            <div
              style={{
                marginBottom: 12,
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
            {/* CỘT TRÁI: Pinned Hero Card + Activity Stream & Chat + Sticky Input */}
            <div className="jt-doc-detail-pane jt-doc-chat-pane">
              {/* 1. PINNED HERO CARD Ở ĐỈNH CỘT TRÁI (Chuẩn Image 5) */}
              <div className={`jt-pinned-hero-card ${cardCollapsed ? 'jt-pinned-hero-card--collapsed' : ''}`}>
                <div className="jt-pinned-hero-card__header">
                  <div className="jt-pinned-hero-card__header-left">
                    <Tag
                      className={`jt-ticket-type-badge jt-ticket-type-badge--${
                        isTask ? 'task' : isMeeting ? 'meeting' : 'event'
                      }`}
                    >
                      {isTask ? 'Công việc' : isMeeting ? 'Lịch họp' : 'Sự kiện'}
                    </Tag>
                    <h3 className="jt-pinned-hero-card__title" title={event.title}>
                      {event.title}
                    </h3>
                  </div>

                  <div className="jt-pinned-hero-card__header-right">
                    <Button
                      type="text"
                      size="small"
                      className="jt-pinned-hero-card__toggle-btn"
                      icon={cardCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                      onClick={() => setCardCollapsed(!cardCollapsed)}
                    >
                      {cardCollapsed ? 'Chi tiết phiếu' : 'Thu gọn'}
                    </Button>
                  </div>
                </div>

                {!cardCollapsed && (
                  <div className="jt-pinned-hero-card__content">
                    <div className="jt-pinned-hero-card__meta-bar">
                      {timeDisplay && (
                        <span className="jt-pinned-meta-chip">
                          <Calendar size={13} /> {timeDisplay}
                        </span>
                      )}
                      {isMeeting && event.mode && (
                        <span className="jt-pinned-meta-chip">
                          <Video size={13} />{' '}
                          {event.mode === 'online'
                            ? 'Trực tuyến'
                            : event.mode === 'offline'
                              ? 'Trực tiếp'
                              : 'Kết hợp'}
                        </span>
                      )}
                      {!isTask && event.location && (
                        <span className="jt-pinned-meta-chip">
                          <MapPin size={13} /> {event.location}
                        </span>
                      )}
                    </div>

                    <div className="jt-pinned-hero-card__desc">
                      {event.notes ||
                        event.agenda ||
                        event.description ||
                        'Rà soát tích hợp Webpack 5 Module Federation giữa host ERP và remote RemoteJobTicket.'}
                    </div>

                    {event.attachments && event.attachments.length > 0 && (
                      <div className="jt-pinned-hero-card__attachments">
                        <span className="jt-pinned-attachments-label">
                          Tài liệu ({event.attachments.length}):
                        </span>
                        <div className="jt-pinned-attachments-list">
                          {event.attachments.map((att) => (
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

              {/* 2. THANH TÁC VỤ NGHIỆP VỤ TỰ ĐỘNG THEO TRẠNG THÁI PHIẾU (CHỈ ÁP DỤNG TASK & EVENT, KHÔNG ÁP DỤNG MEETING) */}
              {!isMeeting && (
                <>
                  {/* TRẠNG THÁI 1: CHỜ DUYỆT / ĐANG XỬ LÝ */}
                  {(statusKey === 'PENDING' || statusKey === 'ACTIVE' || !event.approvalStatus) && (
                    <div className="jt-role-action-bar">
                      <div className="jt-role-action-bar__buttons">
                        <Button
                          className="jt-action-btn jt-action-btn--approve"
                          icon={<CheckCircle size={14} />}
                          onClick={() => setApproveModalOpen(true)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          className="jt-action-btn jt-action-btn--reject"
                          icon={<XCircle size={14} />}
                          onClick={() => setRejectModalOpen(true)}
                        >
                          Không duyệt
                        </Button>
                        <Button
                          className="jt-action-btn jt-action-btn--consult"
                          icon={<MessageSquare size={14} />}
                          onClick={() => setConsultModalOpen(true)}
                        >
                          Lấy ý kiến
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* TRẠNG THÁI 2: ĐÃ DUYỆT -> ĐANG TRIỂN KHAI */}
                  {statusKey === 'APPROVED' && (
                    <div className="jt-role-action-bar">
                      <div className="jt-role-action-bar__buttons">
                        <Button
                          className="jt-action-btn jt-action-btn--complete"
                          icon={<CheckCircle size={14} />}
                          onClick={() => setCompleteModalOpen(true)}
                        >
                          Báo cáo hoàn thành
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* TRẠNG THÁI 3: ĐANG LẤY Ý KIẾN THAM VẤN */}
                  {statusKey === 'CONSULTING' && (
                    <div className="jt-doc-consult-dock">
                      <div className="jt-doc-consult-dock__header">
                        <div className="jt-doc-consult-dock__title">
                          <MessageSquare size={16} />
                          <span>Yêu cầu cho ý kiến tham vấn từ Lãnh đạo phê duyệt</span>
                        </div>
                        <Tag color="purple">Tham vấn chuyên môn</Tag>
                      </div>

                      <div className="jt-doc-consult-dock__question">
                        <strong>Nội dung cần tham vấn:</strong>{' '}
                        {event.consultQuestion ||
                          'Đề nghị cho ý kiến chuyên môn về đề xuất kế hoạch triển khai và phương án điều phối nhân sự cho phiếu này.'}
                      </div>

                      <div className="jt-doc-consult-dock__actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                        <Button
                          type="primary"
                          className="jt-action-btn jt-action-btn--consult-reply"
                          icon={<Send size={14} />}
                          onClick={() => setConsultReplyModalOpen(true)}
                        >
                          Phản hồi ý kiến
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 4. CHAT STREAM & ACTIVITY TIMELINE (Image 5) */}
              <div className="jt-chat-stream__timeline">
                {/* Mốc sự kiện hệ thống khởi tạo */}
                <div className="jt-chat-system-event">
                  <div className="jt-chat-system-event__badge">
                    <FileText size={13} style={{ color: '#2563eb' }} />
                    <span className="jt-chat-system-event__text">
                      <strong>{creatorName}</strong> đã khởi tạo phiếu{' '}
                      {isTask ? 'Công việc' : isMeeting ? 'Lịch họp' : 'Sự kiện'}
                    </span>
                    <span className="jt-chat-system-event__time">29/10 16:23</span>
                  </div>
                </div>

                {/* Danh sách tin nhắn trao đổi */}
                {chatMessages.map((msg) => (
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
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 5. STICKY BOTTOM INPUT BAR (Image 5) */}
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
                  <Tooltip title="Đính kèm tệp">
                    <button
                      type="button"
                      className="jt-chat-attach-btn"
                      onClick={() => chatFileInputRef.current?.click()}
                    >
                      <Paperclip size={16} />
                      <span style={{ display: 'none' }}>Đính kèm</span>
                    </button>
                  </Tooltip>
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
                    placeholder="Viết trao đổi, ý kiến thảo luận... (Enter để gửi, Shift+Enter xuống dòng)"
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

            {/* CỘT PHẢI: Thông tin của phiếu & Quy trình xử lý (Image 5) */}
            <div className="jt-doc-detail-sidebar-stack">
              {/* Card 1: Thông tin của phiếu */}
              <section className="jt-doc-detail-pane jt-doc-detail-pane--info">
                <div className="jt-doc-detail-pane__header">
                  <div>
                    <span className="jt-doc-detail-pane__eyebrow">THÔNG TIN</span>
                    <h3>Thông tin của phiếu</h3>
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

                  {/* Người triển khai / Thực hiện */}
                  {!isMeeting && (
                    <div className="jt-doc-info-item jt-doc-info-item--block">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <Users size={14} />
                        </span>
                        Người triển khai / Thực hiện ({executors.length})
                      </span>
                      <div className="jt-doc-info-tags">
                        {executors.map((u: { name: string }, idx: number) => (
                          <Tag className="jt-doc-info-user-tag" key={idx}>
                            {u.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Người duyệt (chỉ có ở TASK và EVENT) */}
                  {!isMeeting && approver && (
                    <div className="jt-doc-info-item">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <User size={14} />
                        </span>
                        Người duyệt
                      </span>
                      <span className="jt-doc-info-item__value">
                        <strong>{approver.name}</strong>
                      </span>
                    </div>
                  )}

                  {/* Chữ ký số điện tử (nếu phiếu đã được ký số qua OTP) */}
                  {event.signedAt && (
                    <div className="jt-doc-info-item">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <CheckCircle size={14} style={{ color: '#16a34a' }} />
                        </span>
                        Chữ ký số
                      </span>
                      <span className="jt-doc-info-item__value">
                        <Tag color="success" style={{ fontWeight: 600 }}>
                          ✓ Đã ký số điện tử
                        </Tag>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          {event.signedBy || 'Bùi Lê Thế Kiệt'} • {dayjs(event.signedAt).format('HH:mm DD/MM/YYYY')}
                        </div>
                      </span>
                    </div>
                  )}

                  {/* Thành phần tham gia (đối với Cuộc họp hoặc Sự kiện) */}
                  {(isMeeting || !isTask) && event.participants && event.participants.length > 0 && (
                    <div className="jt-doc-info-item jt-doc-info-item--block">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <Users size={14} />
                        </span>
                        Thành phần tham gia ({event.participants.length})
                      </span>
                      <div className="jt-doc-info-tags">
                        {event.participants.map((name: string, idx: number) => (
                          <Tag className="jt-doc-info-user-tag" key={idx}>
                            {name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Người theo dõi */}
                  {!isMeeting && (
                    <div className="jt-doc-info-item jt-doc-info-item--block">
                      <span className="jt-doc-info-item__label">
                        <span className="jt-doc-info-icon">
                          <Users size={14} />
                        </span>
                        Người theo dõi ({watchers.length})
                      </span>
                      <div className="jt-doc-info-tags">
                        {watchers.map((u: { name: string }, idx: number) => (
                          <Tag className="jt-doc-info-user-tag" key={idx}>
                            {u.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Card 2: Quy trình xử lý (Chuẩn Image 5 & Nguyên tắc 2: Meeting không sinh bước duyệt) */}
              <aside className="jt-doc-detail-pane jt-doc-detail-pane--steps">
                <div className="jt-doc-detail-pane__header">
                  <div>
                    <span className="jt-doc-detail-pane__eyebrow">QUY TRÌNH</span>
                    <h3>Quy trình xử lý</h3>
                  </div>
                  <Tag>{isMeeting ? '2 bước' : '3 bước'}</Tag>
                </div>

                {(() => {
                  const step1 = (event.steps || []).find((s) => s.step_order === 1 || s.role === 'CREATOR');
                  const step2 = (event.steps || []).find((s) => s.step_order === 2 || s.role === 'APPROVER' || s.role === 'CONSULTANT');
                  const step3 = (event.steps || []).find((s) => s.step_order === 3 || s.role === 'EXECUTOR');

                  return (
                    <div className="jt-doc-steps">
                      {/* BƯỚC 1: KHỞI TẠO */}
                      <div className="jt-doc-step">
                        <div className="jt-doc-step__rail">
                          <span className="is-done" />
                          <i />
                        </div>
                        <div className="jt-doc-step__card">
                          <div className="jt-doc-step__top">
                            <div>
                              <span className="jt-doc-step__order">BƯỚC 1</span>
                              <h4>Khởi tạo</h4>
                            </div>
                            <Tag color="success">Hoàn tất</Tag>
                          </div>

                          <div className="jt-doc-step__actor">
                            <User size={12} />
                            <strong className="jt-doc-step__actor-name">{step1?.actor_name || creatorName}</strong>
                            <span className="jt-doc-step__time">
                              {step1?.completed_at ? dayjs(step1.completed_at).format('HH:mm DD/MM') : '29/10 16:23'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ĐỐI VỚI LỊCH HỌP: BƯỚC 2 LÀ DIỄN RA CUỘC HỌP (KHÔNG CÓ BƯỚC DUYỆT) */}
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
                              <Tag color="processing">Đã lên lịch</Tag>
                            </div>

                            <div className="jt-doc-step__actor">
                              <User size={12} />
                              <strong className="jt-doc-step__actor-name">
                                {event.leader || event.organizer || 'Ban Biên tập'}
                              </strong>
                            </div>

                            {event.agenda && (
                              <div className="jt-doc-step__note">
                                <strong>Nội dung: </strong>
                                <span>{event.agenda}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* ĐỐI VỚI CÔNG VIỆC & SỰ KIỆN: BƯỚC 2 PHÊ DUYỆT & BƯỚC 3 TRIỂN KHAI */
                        <>
                          {/* BƯỚC 2: PHÊ DUYỆT / LẤY Ý KIẾN */}
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
                                  <h4>{statusKey === 'CONSULTING' ? 'Lấy ý kiến' : 'Phê duyệt'}</h4>
                                </div>
                                {statusKey === 'APPROVED' || statusKey === 'COMPLETED' ? (
                                  <Tag color="success">Đã duyệt</Tag>
                                ) : statusKey === 'REJECTED' ? (
                                  <Tag color="error">Không duyệt</Tag>
                                ) : statusKey === 'CONSULTING' ? (
                                  <Tag color="purple">Đang lấy ý kiến</Tag>
                                ) : (
                                  <Tag color="warning">Đang chờ duyệt</Tag>
                                )}
                              </div>

                              <div className="jt-doc-step__actor">
                                {statusKey === 'CONSULTING' ? (
                                  <MessageSquare size={12} style={{ color: '#7c3aed' }} />
                                ) : (
                                  <Crown size={12} style={{ color: '#d97706' }} />
                                )}
                                <strong className="jt-doc-step__actor-name">
                                  {statusKey === 'CONSULTING'
                                    ? (event.consultantName || step2?.actor_name || 'TS. Trần Quốc Hùng')
                                    : (step2?.actor_name || approver.name)}
                                </strong>
                                {step2?.completed_at && (
                                  <span className="jt-doc-step__time">
                                    {dayjs(step2.completed_at).format('HH:mm DD/MM')}
                                  </span>
                                )}
                              </div>

                              {/* Ghi chú ở cấp duyệt hoặc lấy ý kiến */}
                              {statusKey === 'CONSULTING' ? (
                                (event.consultQuestion || step2?.note) && (
                                  <div className="jt-doc-step__note jt-doc-step__note--purple">
                                    <strong>Ghi chú lấy ý kiến: </strong>
                                    <span>{event.consultQuestion || step2?.note}</span>
                                  </div>
                                )
                              ) : (
                                <>
                                  {step2?.note && (
                                    <div
                                      className={`jt-doc-step__note ${
                                        statusKey === 'REJECTED'
                                          ? 'jt-doc-step__note--danger'
                                          : statusKey === 'APPROVED' || statusKey === 'COMPLETED'
                                            ? 'jt-doc-step__note--success'
                                            : ''
                                      }`}
                                    >
                                      <strong>{statusKey === 'REJECTED' ? 'Lý do từ chối: ' : 'Ghi chú: '}</strong>
                                      <span>{step2.note}</span>
                                    </div>
                                  )}
                                  {event.consultQuestion && (
                                    <div className="jt-doc-step__note jt-doc-step__note--purple">
                                      <strong>Ghi chú lấy ý kiến: </strong>
                                      <span>{event.consultQuestion}</span>
                                    </div>
                                  )}
                                  {event.consultReply && (
                                    <div className="jt-doc-step__note jt-doc-step__note--purple">
                                      <strong>Ý kiến phản hồi: </strong>
                                      <span>{event.consultReply}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* BƯỚC 3: TRIỂN KHAI */}
                          <div className="jt-doc-step">
                            <div className="jt-doc-step__rail">
                              <span className={statusKey === 'COMPLETED' ? 'is-done' : ''} />
                            </div>
                            <div className="jt-doc-step__card">
                              <div className="jt-doc-step__top">
                                <div>
                                  <span className="jt-doc-step__order">BƯỚC 3</span>
                                  <h4>Triển khai</h4>
                                </div>
                                {statusKey === 'COMPLETED' ? (
                                  <Tag color="success">Hoàn tất</Tag>
                                ) : statusKey === 'APPROVED' ? (
                                  <Tag color="processing">Đang thực hiện</Tag>
                                ) : statusKey === 'REJECTED' ? (
                                  <Tag color="default">Đã dừng</Tag>
                                ) : (
                                  <Tag color="warning">Đang chờ duyệt</Tag>
                                )}
                              </div>

                              <div className="jt-doc-step__actor">
                                <Wrench size={12} style={{ color: '#16a34a' }} />
                                <strong className="jt-doc-step__actor-name">
                                  {step3?.actor_name || executors[0]?.name || 'Bùi Lê Thế Kiệt'}
                                </strong>
                                {step3?.completed_at && (
                                  <span className="jt-doc-step__time">
                                    {dayjs(step3.completed_at).format('HH:mm DD/MM')}
                                  </span>
                                )}
                              </div>

                              {/* GHI CHÚ Ở CẤP TRIỂN KHAI */}
                              {step3?.note && (
                                <div className="jt-doc-step__note jt-doc-step__note--success">
                                  <strong>Ghi chú: </strong>
                                  <span>{step3.note}</span>
                                </div>
                              )}
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

      {/* Modal Duyệt phiếu (Approver) */}
      <Modal
        className="jt-modern-action-modal"
        closable
        footer={null}
        onCancel={() => setApproveModalOpen(false)}
        open={approveModalOpen}
        width={560}
      >
        <div className="jt-modern-modal-header">
          <div className="jt-modern-modal-icon jt-modern-modal-icon--success">
            <CheckCircle size={22} />
          </div>
          <div className="jt-modern-modal-title-group">
            <h3 className="jt-modern-modal-title">Xác nhận phê duyệt phiếu</h3>
            <p className="jt-modern-modal-subtitle">
              Phiếu sẽ được chuyển sang giai đoạn Triển khai thực hiện.
            </p>
          </div>
        </div>

        <div className="jt-modern-modal-card">
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Tiêu đề phiếu</span>
            <span className="jt-modern-modal-card-value" title={event.title}>
              {event.title}
            </span>
          </div>
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Người tạo phiếu</span>
            <span className="jt-modern-modal-card-value">{creatorName}</span>
          </div>
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Cấp phê duyệt</span>
            <span className="jt-modern-modal-card-value">{approver.name}</span>
          </div>
        </div>

        <div className="jt-modern-modal-form">
          <label className="jt-modern-field-label" htmlFor="approve-note-textarea">
            Ý kiến chỉ đạo / Ghi chú phê duyệt <span className="jt-modern-optional-tag">(tùy chọn)</span>
          </label>
          <Input.TextArea
            className="jt-modern-textarea"
            id="approve-note-textarea"
            onChange={(e) => setApproveNote(e.target.value)}
            placeholder="Nhập ý kiến chỉ đạo, yêu cầu cụ thể hoặc phân công phối hợp..."
            rows={4}
            value={approveNote}
          />
        </div>

        <div className="jt-modern-modal-footer">
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--cancel"
            onClick={() => setApproveModalOpen(false)}
          >
            Đóng
          </Button>
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--success"
            icon={<CheckCircle size={15} />}
            onClick={handleApproveConfirm}
          >
            Xác nhận duyệt
          </Button>
        </div>
      </Modal>

      {/* Modal Không duyệt / Từ chối (Approver) */}
      <Modal
        className="jt-modern-action-modal"
        closable
        footer={null}
        onCancel={() => setRejectModalOpen(false)}
        open={rejectModalOpen}
        width={560}
      >
        <div className="jt-modern-modal-header">
          <div className="jt-modern-modal-icon jt-modern-modal-icon--danger">
            <XCircle size={22} />
          </div>
          <div className="jt-modern-modal-title-group">
            <h3 className="jt-modern-modal-title">Không duyệt / Từ chối phiếu</h3>
            <p className="jt-modern-modal-subtitle">
              Vui lòng nêu rõ lý do để người tạo phiếu nắm thông tin và hoàn thiện lại.
            </p>
          </div>
        </div>

        <div className="jt-modern-modal-card">
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Tiêu đề phiếu</span>
            <span className="jt-modern-modal-card-value" title={event.title}>
              {event.title}
            </span>
          </div>
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Người tạo phiếu</span>
            <span className="jt-modern-modal-card-value">{creatorName}</span>
          </div>
        </div>

        <div className="jt-modern-modal-form">
          <label className="jt-modern-field-label jt-modern-field-label--required" htmlFor="reject-reason-textarea">
            Lý do không duyệt
          </label>
          <Input.TextArea
            className="jt-modern-textarea"
            id="reject-reason-textarea"
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nêu rõ lý do từ chối phê duyệt (ví dụ: nội dung chưa đạt yêu cầu, thiếu dự toán kinh phí...)..."
            rows={4}
            value={rejectReason}
          />
        </div>

        <div className="jt-modern-modal-footer">
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--cancel"
            onClick={() => setRejectModalOpen(false)}
          >
            Đóng
          </Button>
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--danger"
            icon={<XCircle size={15} />}
            onClick={handleRejectConfirm}
          >
            Xác nhận từ chối
          </Button>
        </div>
      </Modal>

      {/* Modal Lấy ý kiến tham vấn (Approver) */}
      <Modal
        className="jt-modern-action-modal"
        closable
        footer={null}
        onCancel={() => setConsultModalOpen(false)}
        open={consultModalOpen}
        width={560}
      >
        <div className="jt-modern-modal-header">
          <div className="jt-modern-modal-icon jt-modern-modal-icon--purple">
            <MessageSquare size={22} />
          </div>
          <div className="jt-modern-modal-title-group">
            <h3 className="jt-modern-modal-title">Lấy ý kiến tham vấn chuyên môn</h3>
            <p className="jt-modern-modal-subtitle">
              Chỉ định nhân sự hoặc chuyên gia để xin ý kiến góp ý trước khi đưa ra quyết định duyệt.
            </p>
          </div>
        </div>

        <div className="jt-modern-modal-card">
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Tiêu đề phiếu</span>
            <span className="jt-modern-modal-card-value" title={event.title}>
              {event.title}
            </span>
          </div>
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Người yêu cầu tham vấn</span>
            <span className="jt-modern-modal-card-value">{approver.name}</span>
          </div>
        </div>

        <div className="jt-modern-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="jt-modern-field-label jt-modern-field-label--required" htmlFor="consult-target-select">
              Người được lấy ý kiến
            </label>
            <Select
              className="w-full"
              id="consult-target-select"
              onChange={setConsultTarget}
              options={SUGGESTED_MEMBERS}
              size="large"
              style={{ width: '100%' }}
              value={consultTarget}
            />
          </div>

          <div>
            <label className="jt-modern-field-label jt-modern-field-label--required" htmlFor="consult-question-textarea">
              Nội dung câu hỏi cần tham vấn
            </label>
            <Input.TextArea
              className="jt-modern-textarea"
              id="consult-question-textarea"
              onChange={(e) => setConsultQuestion(e.target.value)}
              placeholder="Ví dụ: Đề nghị chuyên gia đánh giá tính khả thi và định mức chi phí..."
              rows={4}
              value={consultQuestion}
            />
          </div>
        </div>

        <div className="jt-modern-modal-footer">
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--cancel"
            onClick={() => setConsultModalOpen(false)}
          >
            Đóng
          </Button>
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--purple"
            icon={<Send size={15} />}
            onClick={handleConsultConfirm}
          >
            Gửi yêu cầu tham vấn
          </Button>
        </div>
      </Modal>

      {/* Modal Báo cáo hoàn thành (Executor) */}
      <Modal
        className="jt-modern-action-modal"
        closable
        footer={null}
        onCancel={() => setCompleteModalOpen(false)}
        open={completeModalOpen}
        width={560}
      >
        <div className="jt-modern-modal-header">
          <div className="jt-modern-modal-icon jt-modern-modal-icon--success">
            <CheckCircle size={22} />
          </div>
          <div className="jt-modern-modal-title-group">
            <h3 className="jt-modern-modal-title">Báo cáo hoàn thành công việc</h3>
            <p className="jt-modern-modal-subtitle">
              Báo cáo kết quả công việc để chuyển sang trạng thái hoàn tất nghiệm thu.
            </p>
          </div>
        </div>

        <div className="jt-modern-modal-card">
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Tiêu đề phiếu</span>
            <span className="jt-modern-modal-card-value" title={event.title}>
              {event.title}
            </span>
          </div>
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Người báo cáo</span>
            <span className="jt-modern-modal-card-value">{currentUser}</span>
          </div>
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Hạn hoàn thành</span>
            <span className="jt-modern-modal-card-value">{timeDisplay}</span>
          </div>
        </div>

        <div className="jt-modern-modal-form">
          <label className="jt-modern-field-label" htmlFor="complete-note-textarea">
            Ghi chú kết quả nghiệm thu <span className="jt-modern-optional-tag">(tùy chọn)</span>
          </label>
          <Input.TextArea
            className="jt-modern-textarea"
            id="complete-note-textarea"
            onChange={(e) => setCompleteNote(e.target.value)}
            placeholder="Mô tả kết quả đạt được, đường dẫn sản phẩm, tài liệu bàn giao hoặc link báo cáo..."
            rows={4}
            value={completeNote}
          />
        </div>

        <div className="jt-modern-modal-footer">
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--cancel"
            onClick={() => setCompleteModalOpen(false)}
          >
            Đóng
          </Button>
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--success"
            icon={<CheckCircle size={15} />}
            onClick={handleCompleteConfirm}
          >
            Xác nhận hoàn thành
          </Button>
        </div>
      </Modal>

      {/* Modal Phản hồi ý kiến tham vấn (Consultee) */}
      <Modal
        className="jt-modern-action-modal"
        closable
        footer={null}
        onCancel={() => setConsultReplyModalOpen(false)}
        open={consultReplyModalOpen}
        width={560}
      >
        <div className="jt-modern-modal-header">
          <div className="jt-modern-modal-icon jt-modern-modal-icon--purple">
            <MessageSquare size={22} />
          </div>
          <div className="jt-modern-modal-title-group">
            <h3 className="jt-modern-modal-title">Phản hồi ý kiến tham vấn</h3>
            <p className="jt-modern-modal-subtitle">
              Đóng góp ý kiến chuyên môn gửi lại cho Lãnh đạo phê duyệt phiếu.
            </p>
          </div>
        </div>

        <div className="jt-modern-modal-card">
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Tiêu đề phiếu</span>
            <span className="jt-modern-modal-card-value" title={event.title}>
              {event.title}
            </span>
          </div>
          <div className="jt-modern-modal-card-row">
            <span className="jt-modern-modal-card-label">Nội dung cần tham vấn</span>
            <span className="jt-modern-modal-card-value" style={{ whiteSpace: 'normal', textAlign: 'right' }}>
              {event.consultQuestion || 'Đề nghị cho ý kiến chuyên môn về kế hoạch triển khai phiếu này.'}
            </span>
          </div>
        </div>

        <div className="jt-modern-modal-form">
          <label className="jt-modern-field-label jt-modern-field-label--required" htmlFor="consult-reply-textarea">
            Ý kiến đóng góp / Phản hồi chuyên môn
          </label>
          <Input.TextArea
            className="jt-modern-textarea"
            id="consult-reply-textarea"
            onChange={(e) => setConsultReply(e.target.value)}
            placeholder="Nhập chi tiết ý kiến đánh giá, giải pháp hoặc khuyến nghị của bạn..."
            rows={4}
            value={consultReply}
          />
        </div>

        <div className="jt-modern-modal-footer">
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--cancel"
            onClick={() => setConsultReplyModalOpen(false)}
          >
            Đóng
          </Button>
          <Button
            className="jt-modern-modal-btn jt-modern-modal-btn--purple"
            icon={<Send size={15} />}
            onClick={handleSendConsultReply}
          >
            Gửi phản hồi
          </Button>
        </div>
      </Modal>

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
        title="Thêm người theo dõi phiếu"
      >
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Nhân sự được thêm vào danh sách theo dõi sẽ nhận thông báo cập nhật tiến độ của phiếu.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {['Lê Văn Tuấn', 'Võ Hoàng Nam', 'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Thị Mai'].map((name, i) => (
            <Checkbox defaultChecked={i === 0} key={i}>
              {name}
            </Checkbox>
          ))}
        </div>
      </Modal>
    </>
  );
}
