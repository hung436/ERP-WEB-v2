import {
  Avatar,
  Button,
  Checkbox,
  Drawer,
  Input,
  Modal,
  Popconfirm,
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
  Clock,
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
import './JobTicketDetailDrawer.css';

const DOC_STATUS_LABELS: Record<string, { label: string; tone: 'warning' | 'success' | 'danger' | 'purple' }> = {
  DRAFT: { label: 'Bản nháp', tone: 'warning' },
  PENDING: { label: 'Chờ duyệt / Đang xử lý', tone: 'warning' },
  ACTIVE: { label: 'Đang xử lý', tone: 'warning' },
  CONSULTING: { label: 'Đang lấy ý kiến', tone: 'purple' },
  COMPLETED: { label: 'Đã hoàn thành', tone: 'success' },
  APPROVED: { label: 'Đã duyệt / Đang triển khai', tone: 'success' },
  NOT_APPROVED: { label: 'Tạm dừng / Không duyệt', tone: 'danger' },
  REJECTED: { label: 'Tạm dừng / Không duyệt', tone: 'danger' },
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
    const initialWatchers =
      event.watchers && event.watchers.length > 0
        ? event.watchers
        : [{ id: 'usr-w1', name: 'Lê Văn Tuấn' }];
    setWatchers(initialWatchers);

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
      msgs.push({
        id: `default-welcome-${event.id}`,
        author_name: 'Thành viên ban chuyên trách',
        role: 'EXECUTOR',
        content: `Đã khởi tạo sổ ghi nhận cho "${event.title}". Mọi người cập nhật tiến độ và trao đổi trực tiếp tại đây nhé.`,
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
      nextState ? 'Đã tắt thông báo cho mục này' : 'Đã bật nhận thông báo cho mục này'
    );
  };

  const handleLeaveTicket = () => {
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      message.success('Bạn đã rời khỏi mục ghi nhận này');
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

  // Đổi trạng thái nhanh 1-click và tự động ghi log vào dòng thời gian
  const handleQuickStatusChange = (
    nextStatus: 'PENDING' | 'APPROVED' | 'CONSULTING' | 'COMPLETED' | 'REJECTED',
    logLabel: string
  ) => {
    const defaultExecutor = event.executors?.[0]?.name || currentUser;
    const approverName = event.approver?.name || 'Nguyễn Tấn Đạt (Phó Tổng Biên tập)';

    const updatedSteps = (event.steps || []).map((st) => {
      if (st.step_order === 2 || st.role === 'APPROVER') {
        if (nextStatus === 'APPROVED' || nextStatus === 'COMPLETED') {
          return {
            ...st,
            status: 'APPROVED' as const,
            actor_name: approverName,
            completed_at: new Date().toISOString(),
            note: 'Đã xác nhận chủ trương triển khai.',
          };
        }
        if (nextStatus === 'CONSULTING') {
          return {
            ...st,
            status: 'CONSULTING' as const,
            note: 'Đang trao đổi / lấy ý kiến chuyên môn.',
          };
        }
        if (nextStatus === 'REJECTED') {
          return {
            ...st,
            status: 'REJECTED' as const,
            completed_at: new Date().toISOString(),
            note: 'Tạm dừng / Không duyệt.',
          };
        }
        return { ...st, status: 'PENDING' as const };
      }
      if (st.step_order === 3 || st.role === 'EXECUTOR') {
        if (nextStatus === 'COMPLETED') {
          return {
            ...st,
            status: 'COMPLETED' as const,
            actor_name: defaultExecutor,
            completed_at: new Date().toISOString(),
            note: 'Đã hoàn thành công việc.',
          };
        }
        if (nextStatus === 'APPROVED') {
          return { ...st, status: 'ACTIVE' as const };
        }
        return st;
      }
      return st;
    });

    const logContent = `[Nhật ký trạng thái] Chuyển trạng thái sang: "${logLabel}"`;
    const newComment = {
      id: `comm-log-${Date.now()}`,
      author: currentUser,
      content: logContent,
      createdAt: new Date().toISOString(),
    };

    const updated: CalendarEvent = {
      ...event,
      approvalStatus: nextStatus,
      steps: updatedSteps,
      comments: [...(event.comments || []), newComment],
    };

    const sysMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      author_name: currentUser,
      role: 'EXECUTOR',
      content: logContent,
      time: dayjs().format('HH:mm DD/MM'),
      isMine: true,
    };

    setChatMessages((prev) => [...prev, sysMsg]);
    onUpdateEvent(updated);
    message.success(`Đã ghi log trạng thái: ${logLabel}`);
  };

  const creatorName = event.leader || event.organizer || 'Bùi Lê Thế Kiệt';
  const timeDisplay = dayjs(event.deadline || event.startAt).format('HH:mm DD/MM/YYYY');

  const statusKey = String(
    event.approvalStatus ||
      (!isMeeting ? 'PENDING' : event.responseStatus === 'accepted' ? 'COMPLETED' : 'ACTIVE')
  );
  const statusInfo = DOC_STATUS_LABELS[statusKey] || {
    label: 'Đang xử lý',
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
                Người theo dõi
              </Button>

              <Popconfirm
                cancelText="Hủy"
                description="Bạn sẽ không còn nhận thông báo và mục này sẽ được gỡ khỏi danh sách cá nhân."
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
        width={1180}
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
            {/* CỘT TRÁI: Pinned Hero Card + Quick Status Log Bar + Activity Stream & Chat + Sticky Input */}
            <div className="jt-doc-detail-pane jt-doc-chat-pane">
              {/* 1. PINNED HERO CARD Ở ĐỈNH CỘT TRÁI */}
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
                        'Ghi nhận công việc và trao đổi tiến độ thực hiện.'}
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

              {/* 2. THANH CẬP NHẬT NHANH TRẠNG THÁI GHI LOG (1-CLICK, KHÔNG MỞ POPUP PHỤ) */}
              <div className="jt-quick-log-bar" role="group" aria-label="Cập nhật nhanh trạng thái ghi log">
                <span className="jt-quick-log-bar__label">Ghi nhận trạng thái:</span>
                <div className="jt-quick-log-bar__pills">
                  <button
                    type="button"
                    className={`jt-quick-log-pill jt-quick-log-pill--pending ${
                      statusKey === 'PENDING' || statusKey === 'ACTIVE' ? 'is-active' : ''
                    }`}
                    onClick={() => handleQuickStatusChange('PENDING', 'Đang xử lý')}
                  >
                    <Clock size={13} />
                    <span>Đang xử lý</span>
                  </button>
                  <button
                    type="button"
                    className={`jt-quick-log-pill jt-quick-log-pill--approved ${
                      statusKey === 'APPROVED' ? 'is-active' : ''
                    }`}
                    onClick={() => handleQuickStatusChange('APPROVED', 'Đã duyệt / Triển khai')}
                  >
                    <CheckCircle size={13} />
                    <span>Đã duyệt</span>
                  </button>
                  {!isMeeting && (
                    <button
                      type="button"
                      className={`jt-quick-log-pill jt-quick-log-pill--consulting ${
                        statusKey === 'CONSULTING' ? 'is-active' : ''
                      }`}
                      onClick={() => handleQuickStatusChange('CONSULTING', 'Đang lấy ý kiến')}
                    >
                      <MessageSquare size={13} />
                      <span>Lấy ý kiến</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={`jt-quick-log-pill jt-quick-log-pill--completed ${
                      statusKey === 'COMPLETED' ? 'is-active' : ''
                    }`}
                    onClick={() => handleQuickStatusChange('COMPLETED', 'Hoàn thành')}
                  >
                    <CheckCircle size={13} />
                    <span>Hoàn thành</span>
                  </button>
                  {!isMeeting && (
                    <button
                      type="button"
                      className={`jt-quick-log-pill jt-quick-log-pill--rejected ${
                        statusKey === 'REJECTED' || statusKey === 'NOT_APPROVED' ? 'is-active' : ''
                      }`}
                      onClick={() => handleQuickStatusChange('REJECTED', 'Tạm dừng')}
                    >
                      <XCircle size={13} />
                      <span>Tạm dừng</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. CHAT STREAM & ACTIVITY TIMELINE */}
              <div className="jt-chat-stream__timeline">
                <div className="jt-chat-system-event">
                  <div className="jt-chat-system-event__badge">
                    <FileText size={13} style={{ color: '#2563eb' }} />
                    <span className="jt-chat-system-event__text">
                      <strong>{creatorName}</strong> đã ghi nhận mục{' '}
                      {isTask ? 'Công việc' : isMeeting ? 'Lịch họp' : 'Sự kiện'}
                    </span>
                    <span className="jt-chat-system-event__time">29/10 16:23</span>
                  </div>
                </div>

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
                    placeholder="Viết trao đổi, ghi chú nhật ký công việc... (Enter để gửi)"
                    value={chatInput}
                  />
                  <Button
                    className="jt-chat-send-btn"
                    icon={<Send size={14} />}
                    onClick={handleSendChat}
                    type="primary"
                  >
                    Ghi log
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

                  {!isMeeting && approver && (
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
                      <div className="jt-doc-info-tags">
                        {event.participants.map((name: string, idx: number) => (
                          <Tag className="jt-doc-info-user-tag" key={idx}>
                            {name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

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

              {/* Card 2: Nhật ký tiến độ */}
              <aside className="jt-doc-detail-pane jt-doc-detail-pane--steps">
                <div className="jt-doc-detail-pane__header">
                  <div>
                    <span className="jt-doc-detail-pane__eyebrow">NHẬT KÝ TIẾN ĐỘ</span>
                    <h3>Các mốc thực hiện</h3>
                  </div>
                  <Tag>{isMeeting ? '2 mốc' : '3 mốc'}</Tag>
                </div>

                {(() => {
                  const step1 = (event.steps || []).find((s) => s.step_order === 1 || s.role === 'CREATOR');
                  const step2 = (event.steps || []).find((s) => s.step_order === 2 || s.role === 'APPROVER' || s.role === 'CONSULTANT');
                  const step3 = (event.steps || []).find((s) => s.step_order === 3 || s.role === 'EXECUTOR');

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
                              <span className="jt-doc-step__order">MỐC 1</span>
                              <h4>Ghi nhận</h4>
                            </div>
                            <Tag color="success">Đã ghi log</Tag>
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

                      {isMeeting ? (
                        <div className="jt-doc-step">
                          <div className="jt-doc-step__rail">
                            <span className="is-done" />
                          </div>
                          <div className="jt-doc-step__card">
                            <div className="jt-doc-step__top">
                              <div>
                                <span className="jt-doc-step__order">MỐC 2</span>
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
                                  <span className="jt-doc-step__order">MỐC 2</span>
                                  <h4>{statusKey === 'CONSULTING' ? 'Trao đổi ý kiến' : 'Rà soát / Duyệt'}</h4>
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
                                  {step2?.actor_name || approver.name}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="jt-doc-step">
                            <div className="jt-doc-step__rail">
                              <span className={statusKey === 'COMPLETED' ? 'is-done' : ''} />
                            </div>
                            <div className="jt-doc-step__card">
                              <div className="jt-doc-step__top">
                                <div>
                                  <span className="jt-doc-step__order">MỐC 3</span>
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
                                  {step3?.actor_name || executors[0]?.name || 'Bùi Lê Thế Kiệt'}
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
    </>
  );
}
