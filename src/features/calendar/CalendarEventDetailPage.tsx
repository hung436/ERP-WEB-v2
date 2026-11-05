import {
  Avatar,
  Button,
  Input,
  Modal,
  Popconfirm,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  MapPin,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  Send,
  Star,
  Trash2,
  UploadCloud,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ContentSkeleton, EmptyState, ErrorState } from "@/components/AsyncState";
import { useAuth } from "@/features/auth/AuthContext";
import { calendarApi } from "@/services/api";
import type { CalendarAttachmentItem, CalendarEvent } from "@/types/domain";

import { formatBytes, getFileCategory } from "./components/AttachedFilesList";
import { CreatePersonalMeetingModal } from "./components/CreatePersonalMeetingModal";
import { getEventsForWeek } from "./mockCalendarData";

import "./CalendarEventDetailPage.css";

const VI_DAY_NAMES = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "#1877f2",
    "#e11d48",
    "#0284c7",
    "#16a34a",
    "#d97706",
    "#7c3aed",
    "#0891b2",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function CalendarEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserName = user?.fullName || "Nguyễn Minh Anh";

  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Panel Right toggle state (mặc định mở trên desktop)
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Comment & attachments states
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [fileList] = useState<UploadFile[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      let found: CalendarEvent | null = null;
      try {
        const res = await calendarApi.get(id);
        found = res.data;
      } catch (apiErr) {
        // Fallback: Tìm trong dữ liệu tuần nếu mock API chưa kịp nạp sự kiện động
        try {
          const dateMatch = id.match(/\b(20\d{2})(\d{2})(\d{2})\b/);
          const targetDate = dateMatch
            ? dayjs(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`)
            : dayjs();
          const weekEvents = getEventsForWeek(targetDate.startOf('isoWeek'));
          found = weekEvents.find((e) => e.id === id) || null;
        } catch {
          // ignore
        }
        if (!found) {
          throw apiErr;
        }
      }
      setEvent(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin sự kiện");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (loading) {
    return (
      <div className="event-detail-page">
        <ContentSkeleton rows={8} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <ErrorState message={error || "Không tìm thấy sự kiện"} onRetry={fetchEvent} />
        <div style={{ marginTop: 16 }}>
          <Button icon={<ArrowLeft size={14} />} onClick={() => navigate("/calendar/week")}>
            Quay lại Lịch làm việc
          </Button>
        </div>
      </div>
    );
  }

  const isEditorial = event.scope === "editorial";
  const isPersonal = event.scope === "personal";
  const isUserAttending = Boolean(event.isUserParticipant || event.isUserWatcher);
  const start = dayjs(event.startAt);
  const end = dayjs(event.endAt);

  const isProposal =
    event.workflowType === "PROPOSAL" ||
    Boolean(event.approver?.name) ||
    (event.approvers && event.approvers.length > 0) ||
    event.approvalStatus === "PENDING" ||
    event.approvalStatus === "REJECTED";

  const isUserAnApprover = Boolean(
    (event.approver?.name &&
      event.approver.name.toLowerCase().includes(currentUserName.toLowerCase())) ||
    (event.approvers &&
      event.approvers.some((a) => a.name.toLowerCase().includes(currentUserName.toLowerCase()))),
  );

  // Thao tác gửi thảo luận
  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await calendarApi.addComment(event.id, commentText.trim());
      setEvent(res.data);
      setCommentText("");
      message.success("Đã gửi ý kiến trao đổi");
    } catch {
      const newCmt = {
        id: `cmt-${Date.now()}`,
        author: currentUserName,
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
      };
      setEvent((prev) => (prev ? { ...prev, comments: [...(prev.comments || []), newCmt] } : null));
      setCommentText("");
      message.success("Đã gửi ý kiến trao đổi");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Upload tài liệu
  const handleUploadAttachment = async (file: File) => {
    const newAtt: CalendarAttachmentItem = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.name.split(".").pop() || "file",
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUserName,
    };
    try {
      const res = await calendarApi.addAttachment(event.id, newAtt);
      setEvent(res.data);
      message.success(`Đã đính kèm tệp: ${file.name}`);
    } catch {
      setEvent((prev) => (prev ? { ...prev, attachments: [...(prev.attachments || []), newAtt] } : null));
      message.success(`Đã đính kèm tệp: ${file.name}`);
    }
    return false;
  };

  // Toggle Quan tâm
  const handleToggleInterest = () => {
    const nextState = !event.isInterested;
    const updated = { ...event, isInterested: nextState };
    setEvent(updated);
    if (nextState) {
      message.success(`Đã quan tâm: "${event.title}". Bạn sẽ được nhắc trước 15 phút!`);
    } else {
      message.info(`Đã hủy nhắc nhở lịch "${event.title}"`);
    }
  };

  // Xóa lịch cá nhân
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await calendarApi.delete(event.id);
      message.success(`Đã xóa "${event.title}"`);
      navigate("/calendar/week");
    } catch {
      message.error("Không thể xóa. Vui lòng thử lại");
    } finally {
      setDeleting(false);
    }
  };

  // Sao chép link phòng họp
  const handleCopyMeetingLink = () => {
    if (!event.meetingUrl) return;
    navigator.clipboard.writeText(event.meetingUrl);
    message.success("Đã sao chép liên kết phòng họp");
  };

  // Duyệt phiếu
  const handleApproveProposal = async () => {
    const updatedEvent: CalendarEvent = {
      ...event,
      approvalStatus: "APPROVED",
      approvers: (event.approvers || []).map((a) => ({ ...a, status: "APPROVED" })),
    };
    try {
      await calendarApi.update(event.id, updatedEvent);
    } catch {
      // Fallback
    }
    setEvent(updatedEvent);
    message.success("Đã phê duyệt thành công");
  };

  // Từ chối duyệt
  const handleRejectProposal = async () => {
    const updatedEvent: CalendarEvent = {
      ...event,
      approvalStatus: "REJECTED",
      approvers: (event.approvers || []).map((a) => ({
        ...a,
        status: "REJECTED",
        note: rejectReason.trim() || undefined,
      })),
    };
    try {
      await calendarApi.update(event.id, updatedEvent);
    } catch {
      // Fallback
    }
    setEvent(updatedEvent);
    message.info("Đã từ chối duyệt");
    setRejectModalOpen(false);
    setRejectReason("");
  };

  return (
    <div className="event-detail-page">
      {/* TOP NAVIGATION / BREADCRUMB */}
      <div className="event-detail-top-nav">
        <button
          className="event-detail-back-btn"
          onClick={() => navigate("/calendar/week")}
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Quay lại Lịch làm việc tuần</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Button
            icon={rightPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            {rightPanelOpen ? "Thu gọn bảng phụ" : "Mở rộng bảng phụ"}
          </Button>
        </div>
      </div>

      {/* HEADER CARD CHÍNH */}
      <div className="event-detail-header-card">
        <div className="event-detail-badges-row">
          {event.isAdjusted && (
            <Tag
              bordered={false}
              color="warning"
              style={{ fontSize: 12, padding: "2px 8px", fontWeight: 600 }}
            >
              Đã điều chỉnh
            </Tag>
          )}

          {isEditorial ? (
            <Tag color="error" style={{ fontSize: 12, padding: "2px 8px" }}>
              Lịch chung
            </Tag>
          ) : isPersonal ? (
            <Tag color="blue" style={{ fontSize: 12, padding: "2px 8px" }}>
              Lịch cá nhân
            </Tag>
          ) : (
            <Tag color="purple" style={{ fontSize: 12, padding: "2px 8px" }}>
              Lịch họp
            </Tag>
          )}

          {isProposal && (
            <Tag
              color={
                event.approvalStatus === "APPROVED"
                  ? "success"
                  : event.approvalStatus === "REJECTED"
                    ? "error"
                    : "warning"
              }
              style={{ fontSize: 12, padding: "2px 8px", fontWeight: 600 }}
            >
              {event.approvalStatus === "APPROVED"
                ? "Đã duyệt"
                : event.approvalStatus === "REJECTED"
                  ? "Từ chối"
                  : "Chờ duyệt"}
            </Tag>
          )}
        </div>

        <div className="event-detail-title-wrap">
          {/* TÊN SỰ KIỆN: Hiển thị trọn vẹn, không cắt dấu 3 chấm (Task 4) */}
          <h1 className="event-detail-title-text">{event.title}</h1>

          {/* Action buttons tường minh, không dùng menu 3 chấm */}
          <div className="event-detail-header-actions">
            {isPersonal ? (
              <>
                <Button
                  icon={<Edit3 size={14} />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Chỉnh sửa
                </Button>
                <Popconfirm
                  cancelText="Hủy"
                  description="Bạn có chắc chắn muốn xóa lịch làm việc này không?"
                  okButtonProps={{ danger: true }}
                  okText="Xóa"
                  onConfirm={handleDelete}
                  title="Xóa lịch làm việc"
                >
                  <Button danger icon={<Trash2 size={14} />} loading={deleting}>
                    Xóa
                  </Button>
                </Popconfirm>
              </>
            ) : isEditorial && !isUserAttending ? (
              <Button
                icon={
                  <Star
                    color={event.isInterested ? "#d97706" : "#64748b"}
                    fill={event.isInterested ? "#f59e0b" : "none"}
                    size={14}
                  />
                }
                onClick={handleToggleInterest}
              >
                {event.isInterested ? "Đang quan tâm" : "Quan tâm"}
              </Button>
            ) : null}
          </div>
        </div>

        {event.isAdjusted && event.adjustedNote && (
          <div className="event-detail-adjusted-banner">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Lưu ý điều chỉnh:</strong> {event.adjustedNote}
            </span>
          </div>
        )}
      </div>

      {/* BỐ CỤC 2 CỘT LINH HOẠT (GỐC LỊCH HỌP + COLLAPSIBLE RIGHT PANEL) */}
      <div
        className={`event-detail-layout-grid ${!rightPanelOpen ? "is-right-collapsed" : ""}`}
      >
        {/* CỘT CHÍNH (MAIN CONTENT) */}
        <div className="event-detail-main-pane">
          {/* 1. Thông tin chung */}
          <div className="event-detail-card-section">
            <h2 className="event-detail-section-heading">
              <Clock size={16} />
              Thông tin chung
            </h2>

            <div className="event-detail-info-grid">
              <div className="event-detail-info-item">
                <span className="event-detail-info-label">
                  <Clock size={13} />
                  Thời gian
                </span>
                <span className="event-detail-info-value">
                  {start.isValid()
                    ? `${start.format("HH:mm")} (${VI_DAY_NAMES[start.day()]}, ${start.format("DD/MM/YYYY")})`
                    : "Chưa xác định"}
                </span>
              </div>

              <div className="event-detail-info-item">
                <span className="event-detail-info-label">
                  <MapPin size={13} />
                  Địa điểm
                </span>
                <span className="event-detail-info-value">
                  {event.location || (event.meetingUrl ? "Phòng họp trực tuyến" : "Tòa soạn Tuổi Trẻ")}
                </span>
              </div>

              {Boolean((event.leader || event.organizer)?.trim()) && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">
                    <Users size={13} />
                    Người chủ trì
                  </span>
                  {/* Tên người chủ trì hiển thị trọn vẹn không cắt 3 chấm */}
                  <span className="event-detail-info-value">
                    {event.leader || event.organizer}
                  </span>
                </div>
              )}

              <div className="event-detail-info-item">
                <span className="event-detail-info-label">
                  <Users size={13} />
                  Thành phần tham gia
                </span>
                <span className="event-detail-info-value">
                  {event.participantText || event.participants?.join(", ") || "Toàn thể thành viên được mời"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Phòng họp trực tuyến (nếu có meetingUrl) */}
          {event.meetingUrl && (
            <div className="event-detail-video-banner">
              <div className="event-detail-video-left">
                <div className="event-detail-video-icon">
                  <Video size={20} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0369a1" }}>
                    Phòng họp video trực tuyến
                  </div>
                  <a
                    href={event.meetingUrl}
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13,
                      color: "#475569",
                      display: "block",
                      marginTop: 2,
                    }}
                    target="_blank"
                  >
                    {event.meetingUrl}
                  </a>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Tooltip title="Sao chép liên kết">
                  <Button
                    aria-label="Sao chép liên kết"
                    icon={<Copy size={15} />}
                    onClick={handleCopyMeetingLink}
                  />
                </Tooltip>
                <Button
                  href={event.meetingUrl}
                  icon={<ExternalLink size={14} />}
                  target="_blank"
                  type="primary"
                >
                  Tham gia
                </Button>
              </div>
            </div>
          )}

          {/* 3. Lịch trực tòa soạn (nếu có) */}
          {event.dutyInfo && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#991b1b",
              }}
            >
              <Calendar size={15} style={{ display: "inline", marginRight: 6 }} />
              <strong>Lịch trực tòa soạn:</strong> {event.dutyInfo}
            </div>
          )}

          {/* 4. Quy trình phê duyệt (nếu là phiếu đề xuất họp hoặc có quy trình duyệt) */}
          {isProposal && (
            <div className="event-detail-card-section">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={16} style={{ color: "#059669" }} />
                  Thông tin phê duyệt
                </span>
                <Tag
                  color={
                    event.approvalStatus === "APPROVED"
                      ? "success"
                      : event.approvalStatus === "REJECTED"
                        ? "error"
                        : "warning"
                  }
                >
                  {event.approvalStatus === "APPROVED"
                    ? "Đã duyệt"
                    : event.approvalStatus === "REJECTED"
                      ? "Từ chối"
                      : "Chờ duyệt"}
                </Tag>
              </div>

              <div style={{ fontSize: 13.5, color: "#475467", lineHeight: 1.6 }}>
                <strong>Người duyệt: </strong>
                {event.approvers && event.approvers.length > 0
                  ? event.approvers.map((a) => a.name).join(", ")
                  : event.approver?.name || "Chưa chỉ định"}
              </div>

              {isUserAnApprover && event.approvalStatus === "PENDING" && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Button
                    icon={<CheckCircle2 size={15} />}
                    onClick={handleApproveProposal}
                    style={{ backgroundColor: "#059669", borderColor: "#059669" }}
                    type="primary"
                  >
                    Phê duyệt
                  </Button>
                  <Button
                    danger
                    icon={<XCircle size={15} />}
                    onClick={() => setRejectModalOpen(true)}
                  >
                    Không duyệt
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 5. Tài liệu đính kèm */}
          <div className="event-detail-card-section">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2 className="event-detail-section-heading" style={{ margin: 0, border: 0, padding: 0 }}>
                <Paperclip size={16} />
                Tài liệu đính kèm ({event.attachments?.length || 0})
              </h2>
              <Upload
                beforeUpload={handleUploadAttachment}
                fileList={fileList}
                showUploadList={false}
              >
                <Button icon={<UploadCloud size={14} />} size="small">
                  Đính kèm tệp
                </Button>
              </Upload>
            </div>

            {event.attachments && event.attachments.length > 0 ? (
              <div className="event-detail-attachments-grid">
                {event.attachments.map((att) => {
                  const cat = getFileCategory(att.name);
                  return (
                    <div className="event-detail-att-card" key={att.id}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 6,
                          background: cat.bg,
                          color: cat.color,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1e293b",
                            wordBreak: "break-all",
                          }}
                        >
                          {att.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>
                          {formatBytes(att.size)} · {att.uploadedBy || "Đính kèm"}
                        </div>
                      </div>
                      <Tooltip title="Tải xuống tệp">
                        <Button
                          icon={<Download size={14} />}
                          onClick={() => message.info(`Đang tải xuống tệp: ${att.name}`)}
                          type="text"
                        />
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState description="Chưa có tài liệu đính kèm" />
            )}
          </div>

          {/* 6. Thảo luận trao đổi (Facebook style) */}
          <div className="event-detail-card-section">
            <h2 className="event-detail-section-heading">
              <MessageSquare size={16} />
              Ý kiến trao đổi ({event.comments?.length || 0})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
              {event.comments && event.comments.length > 0 ? (
                event.comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <Avatar
                      size={36}
                      style={{
                        backgroundColor: getAvatarColor(cmt.author),
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(cmt.author)}
                    </Avatar>
                    <div
                      style={{
                        flex: 1,
                        background: "#f8fafc",
                        border: "1px solid #eaecf0",
                        borderRadius: 10,
                        padding: "10px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                          {cmt.author}
                        </span>
                        <span style={{ fontSize: 11.5, color: "#64748b" }}>
                          {dayjs(cmt.createdAt).format("HH:mm · DD/MM/YYYY")}
                        </span>
                      </div>
                      <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.5 }}>
                        {cmt.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState description="Chưa có trao đổi nào. Hãy là người đầu tiên để lại ý kiến thảo luận!" />
              )}
            </div>

            {/* Khung soạn thảo thảo luận */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 12 }}>
              <Avatar
                size={36}
                style={{ backgroundColor: "#1877f2", color: "#fff", flexShrink: 0 }}
              >
                {getInitials(currentUserName)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder="Nhập nội dung trao đổi"
                  ref={inputRef}
                  value={commentText}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <small style={{ color: "#64748b", fontSize: 12 }}>
                    Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng
                  </small>
                  <Button
                    disabled={submittingComment || !commentText.trim()}
                    icon={<Send size={14} />}
                    loading={submittingComment}
                    onClick={handleSendComment}
                    type="primary"
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (COLLAPSIBLE RIGHT PANEL - TASK 6) */}
        {rightPanelOpen && (
          <aside className="event-detail-right-pane">
            <div className="event-detail-right-header">
              <span className="event-detail-right-title">
                <Users size={16} />
                Nhân sự & Vai trò
              </span>
              <Button
                icon={<PanelRightClose size={14} />}
                onClick={() => setRightPanelOpen(false)}
                size="small"
                type="text"
              >
                Thu gọn
              </Button>
            </div>

            <div className="event-detail-role-group">
              {/* Người tổ chức */}
              <div className="event-detail-role-item">
                <span className="event-detail-role-label">Người tổ chức / Tạo</span>
                <div className="event-detail-person-chip">
                  <Avatar size={22} style={{ backgroundColor: getAvatarColor(event.organizer || "Bùi Lê Thế Kiệt") }}>
                    {getInitials(event.organizer || "Bùi Lê Thế Kiệt")}
                  </Avatar>
                  <span>{event.organizer || "Bùi Lê Thế Kiệt"}</span>
                </div>
              </div>

              {/* Người chủ trì */}
              {Boolean(event.leader) && (
                <div className="event-detail-role-item">
                  <span className="event-detail-role-label">Chủ trì</span>
                  <div className="event-detail-person-chip">
                    <Avatar size={22} style={{ backgroundColor: getAvatarColor(event.leader!) }}>
                      {getInitials(event.leader!)}
                    </Avatar>
                    <span>{event.leader}</span>
                  </div>
                </div>
              )}

              {/* Người duyệt */}
              {isProposal && (
                <div className="event-detail-role-item">
                  <span className="event-detail-role-label">Người phê duyệt</span>
                  <div className="event-detail-person-chip">
                    <Avatar size={22} style={{ backgroundColor: "#059669" }}>
                      {getInitials(event.approver?.name || "Ban Biên tập")}
                    </Avatar>
                    <span>{event.approver?.name || "Ban Biên tập"}</span>
                  </div>
                </div>
              )}

              {/* Người thực hiện / Triển khai */}
              {Boolean(event.executors?.length) && (
                <div className="event-detail-role-item">
                  <span className="event-detail-role-label">Người thực hiện</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {event.executors!.map((u) => {
                      const isSelf = u.name.toLowerCase().includes(currentUserName.toLowerCase());
                      return (
                        <div
                          className={`event-detail-person-chip ${isSelf ? "is-self" : ""}`}
                          key={u.id || u.name}
                        >
                          <Avatar size={20} style={{ backgroundColor: getAvatarColor(u.name) }}>
                            {getInitials(u.name)}
                          </Avatar>
                          <span>{u.name}</span>
                          {isSelf && <span className="event-detail-self-tag">Bạn</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Người theo dõi (Tuân thủ rule: không có nút tự hủy theo dõi) */}
              {Boolean(event.watchers?.length) && (
                <div className="event-detail-role-item">
                  <span className="event-detail-role-label">
                    Người theo dõi ({event.watchers!.length})
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {event.watchers!.map((w) => {
                      const isSelf = w.name.toLowerCase().includes(currentUserName.toLowerCase());
                      return (
                        <div
                          className={`event-detail-person-chip ${isSelf ? "is-self" : ""}`}
                          key={w.id || w.name}
                        >
                          <Avatar size={20} style={{ backgroundColor: getAvatarColor(w.name) }}>
                            {getInitials(w.name)}
                          </Avatar>
                          <span>{w.name}</span>
                          {isSelf && <span className="event-detail-self-tag">Bạn</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tiến độ & Quy trình */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
              <span className="event-detail-right-title" style={{ marginBottom: 12 }}>
                <CheckCircle2 size={16} />
                Tiến độ & Quy trình
              </span>

              <div className="event-detail-workflow-list">
                {event.steps && event.steps.length > 0 ? (
                  event.steps.map((st) => (
                    <div className="event-detail-workflow-step" key={st.step_order}>
                      <span
                        className={`event-detail-step-badge ${st.status === "APPROVED" || st.status === "DONE" ? "is-done" : ""}`}
                      >
                        {st.step_order}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{st.name}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>{st.role}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Chưa có quy trình các bước riêng biệt
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Modal Chỉnh sửa nếu là lịch cá nhân */}
      {isPersonal && (
        <CreatePersonalMeetingModal
          editingEvent={event}
          initialTicketType={event.ticketType || "MEETING"}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(updated) => {
            setEvent(updated);
            setEditModalOpen(false);
          }}
          open={editModalOpen}
        />
      )}

      {/* Modal từ chối duyệt */}
      <Modal
        cancelText="Đóng"
        destroyOnClose
        okButtonProps={{ danger: true }}
        okText="Xác nhận không duyệt"
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
        onOk={handleRejectProposal}
        open={rejectModalOpen}
        title="Lý do không duyệt"
      >
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontSize: 13, color: "#475467", marginBottom: 8 }}>
            Vui lòng nhập lý do để người gửi nắm thông tin:
          </div>
          <Input.TextArea
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do không duyệt lịch họp"
            rows={3}
            value={rejectReason}
          />
        </div>
      </Modal>
    </div>
  );
}

export default CalendarEventDetailPage;
