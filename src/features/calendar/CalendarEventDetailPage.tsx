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

import { ContentSkeleton, ErrorState } from "@/components/AsyncState";
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

export function CalendarEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserName = user?.fullName || "Nguyễn Minh Anh";

  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const weekEvents = getEventsForWeek(targetDate.startOf("isoWeek"));
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
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin sự kiện",
      );
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
        <div className="event-detail-container">
          <ContentSkeleton rows={8} />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-container">
          <ErrorState
            message={error || "Không tìm thấy sự kiện"}
            onRetry={fetchEvent}
          />
          <div style={{ marginTop: 16 }}>
            <Button
              icon={<ArrowLeft size={14} />}
              onClick={() => navigate("/calendar/week")}
            >
              Quay lại Lịch làm việc
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isEditorial = event.scope === "editorial";
  const isPersonal = event.scope === "personal";
  const isUserAttending = Boolean(
    event.isUserParticipant || event.isUserWatcher,
  );
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
      event.approver.name
        .toLowerCase()
        .includes(currentUserName.toLowerCase())) ||
      (event.approvers &&
        event.approvers.some((a) =>
          a.name.toLowerCase().includes(currentUserName.toLowerCase()),
        )),
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
      setEvent((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), newCmt] } : null,
      );
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
      setEvent((prev) =>
        prev
          ? { ...prev, attachments: [...(prev.attachments || []), newAtt] }
          : null,
      );
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
      message.success(
        `Đã quan tâm: "${event.title}". Bạn sẽ được nhắc trước 15 phút!`,
      );
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
      approvers: (event.approvers || []).map((a) => ({
        ...a,
        status: "APPROVED",
      })),
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
      <div className="event-detail-container">
        {/* TOP NAVIGATION / QUAY LẠI */}
        <div className="event-detail-top-nav">
          <button
            className="event-detail-back-btn"
            onClick={() => navigate("/calendar/week")}
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Quay lại Lịch làm việc tuần</span>
          </button>
        </div>

        {/* BỀ MẶT THÔNG TIN DUY NHẤT (THEO PHONG CÁCH DRAWER GỐC, HẠN CHẾ ĐÓNG KHUNG) */}
        <div className="event-detail-surface">
          {/* HEADER: BADGES + ACTIONS + TITLE */}
          <div className="event-detail-header">
            <div className="event-detail-header-top">
              <div className="event-detail-badges">
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
                  <Tag
                    color="purple"
                    style={{ fontSize: 12, padding: "2px 8px" }}
                  >
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

              {/* Action buttons tường minh, tinh gọn */}
              <div className="event-detail-actions">
                {isPersonal ? (
                  <>
                    <Button
                      icon={<Edit3 size={14} />}
                      onClick={() => setEditModalOpen(true)}
                      size="small"
                    >
                      Chỉnh sửa
                    </Button>
                    <Popconfirm
                      cancelText="Hủy"
                      description="Bạn có chắc chắn muốn xóa lịch làm việc này không?"
                      okButtonProps={{ danger: true }}
                      okText="Xóa"
                      onConfirm={handleDelete}
                      placement="bottomRight"
                      title="Xóa lịch làm việc"
                    >
                      <Button
                        danger
                        icon={<Trash2 size={14} />}
                        loading={deleting}
                        size="small"
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  </>
                ) : isEditorial &&
                  !isUserAttending &&
                  !dayjs(event.endAt).isBefore(dayjs()) ? (
                  <Button
                    aria-label={
                      event.isInterested ? "Bỏ quan tâm" : "Quan tâm lịch họp"
                    }
                    icon={
                      <Star
                        color={event.isInterested ? "#d97706" : "#64748b"}
                        fill={event.isInterested ? "#f59e0b" : "none"}
                        size={14}
                      />
                    }
                    onClick={handleToggleInterest}
                    size="small"
                    style={
                      event.isInterested
                        ? {
                            borderColor: "#fcd34d",
                            background: "#fffbeb",
                            color: "#b45309",
                          }
                        : undefined
                    }
                  >
                    {event.isInterested ? "Đang quan tâm" : "Quan tâm"}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* TÊN SỰ KIỆN: Hiển thị trọn vẹn, không cắt dấu 3 chấm */}
            <h1 className="event-detail-title">{event.title}</h1>

            {/* Banner lưu ý điều chỉnh (nếu có) */}
            {event.isAdjusted && event.adjustedNote && (
              <div className="event-detail-adjusted-banner">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <strong>Lưu ý điều chỉnh:</strong> {event.adjustedNote}
                </span>
              </div>
            )}
          </div>

          {/* GRID THÔNG TIN CHUNG (THEO GỐC DRAWER: PHẲNG, GỌN, KHÔNG BỌC PILL TỪNG NGƯỜI) */}
          <div className="event-detail-grid">
            <div className="event-info-item">
              <span className="event-info-label">
                <Clock size={12} />
                Thời gian
              </span>
              <span className="event-info-value">
                {start.isValid()
                  ? `${start.format("HH:mm")} (${VI_DAY_NAMES[start.day()]}, ${start.format("DD/MM/YYYY")})`
                  : "Chưa xác định"}
              </span>
            </div>

            <div className="event-info-item">
              <span className="event-info-label">
                <MapPin size={12} />
                Địa điểm
              </span>
              <span className="event-info-value">
                {event.location ||
                  (event.meetingUrl
                    ? "Phòng họp trực tuyến"
                    : "Tòa soạn Tuổi Trẻ")}
              </span>
            </div>

            {Boolean((event.leader || event.organizer)?.trim()) && (
              <div className="event-info-item">
                <span className="event-info-label">
                  <Users size={12} />
                  Người chủ trì
                </span>
                <span className="event-info-value">
                  {event.leader || event.organizer}
                </span>
              </div>
            )}

            <div className="event-info-item">
              <span className="event-info-label">
                <Users size={12} />
                Thành phần tham gia
              </span>
              <span className="event-info-value">
                {highlightCurrentUserName(
                  event.participantText ||
                    event.participants?.join(", ") ||
                    "Toàn thể thành viên được mời",
                  currentUserName,
                )}
              </span>
            </div>
          </div>

          {/* KHUNG PHÒNG HỌP TRỰC TUYẾN (NẾU CÓ) */}
          {event.meetingUrl && (
            <div className="event-detail-video-banner">
              <div className="event-detail-video-left">
                <div className="event-detail-video-icon">
                  <Video size={18} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="event-detail-video-title">
                    Phòng họp video trực tuyến
                  </div>
                  <a
                    className="event-detail-video-link"
                    href={event.meetingUrl}
                    rel="noopener noreferrer"
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
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <Tooltip title="Sao chép liên kết">
                  <Button
                    aria-label="Sao chép liên kết"
                    icon={<Copy size={15} />}
                    onClick={handleCopyMeetingLink}
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

          {/* LỊCH TRỰC BAN TÒA SOẠN (NẾU CÓ) */}
          {event.dutyInfo && (
            <div className="event-detail-duty-banner">
              <Calendar size={14} style={{ display: "inline", marginRight: 6 }} />
              <strong>Lịch trực tòa soạn:</strong> {event.dutyInfo}
            </div>
          )}

          {/* THÔNG TIN PHÊ DUYỆT (NẾU CÓ) */}
          {isProposal && (
            <div className="event-detail-approval-box">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={15} style={{ color: "#059669" }} />
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

              <div style={{ fontSize: 13, color: "#475467", lineHeight: 1.5 }}>
                <span style={{ fontWeight: 500, color: "#1d2939" }}>
                  Người duyệt:{" "}
                </span>
                {event.approvers && event.approvers.length > 0
                  ? event.approvers.map((a) => a.name).join(", ")
                  : event.approver?.name || "Chưa chỉ định"}
              </div>

              {isUserAnApprover && event.approvalStatus === "PENDING" && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Button
                    icon={<CheckCircle2 size={14} />}
                    onClick={handleApproveProposal}
                    style={{
                      backgroundColor: "#059669",
                      borderColor: "#059669",
                      fontWeight: 600,
                      borderRadius: 6,
                    }}
                    type="primary"
                  >
                    Phê duyệt
                  </Button>
                  <Button
                    danger
                    icon={<XCircle size={14} />}
                    onClick={() => setRejectModalOpen(true)}
                    style={{ borderRadius: 6, fontWeight: 500 }}
                  >
                    Không duyệt
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* PHẦN: TÀI LIỆU ĐÍNH KÈM (PHẲNG, KHÔNG HỘP LỒNG HỘP) */}
          <div className="event-detail-section">
            <div className="event-detail-section-title">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Paperclip size={15} />
                Tài liệu ({event.attachments?.length || 0})
              </span>
              <Upload
                beforeUpload={handleUploadAttachment}
                fileList={fileList}
                showUploadList={false}
              >
                <Button icon={<UploadCloud size={14} />} size="small">
                  Đính kèm
                </Button>
              </Upload>
            </div>

            {event.attachments && event.attachments.length > 0 ? (
              <div className="event-detail-attachments-grid">
                {event.attachments.map((att) => {
                  const cat = getFileCategory(att.name);
                  return (
                    <div className="event-detail-att-item" key={att.id}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
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
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={att.name}
                        >
                          {att.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {formatBytes(att.size)} ·{" "}
                          {att.uploadedBy || "Người tham dự"}
                        </div>
                      </div>
                      <Tooltip title="Tải xuống tệp">
                        <Button
                          icon={<Download size={13} />}
                          onClick={() =>
                            message.info(`Đang tải xuống tệp: ${att.name}`)
                          }
                          size="small"
                          type="text"
                        />
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="event-detail-empty-box">
                Chưa có tài liệu đính kèm. Nhấp vào &ldquo;Đính kèm&rdquo; để
                thêm tài liệu cho buổi làm việc.
              </div>
            )}
          </div>

          {/* PHẦN: THẢO LUẬN / Ý KIẾN TRAO ĐỔI (FACEBOOK STYLE NHƯ GỐC DRAWER) */}
          <div className="event-detail-section">
            <div className="event-detail-section-title">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MessageSquare size={15} />
                Thảo luận ({event.comments?.length || 0})
              </span>
            </div>

            <div className="event-detail-comments-list">
              {event.comments && event.comments.length > 0 ? (
                event.comments.map((cmt) => (
                  <div className="event-detail-comment-row" key={cmt.id}>
                    <Avatar
                      className="event-detail-comment-avatar"
                      size={32}
                      style={{
                        backgroundColor: getAvatarColor(cmt.author),
                        color: "#fff",
                      }}
                    >
                      {getInitials(cmt.author)}
                    </Avatar>

                    <div className="event-detail-comment-body">
                      <div className="event-detail-comment-meta">
                        <span className="event-detail-comment-author">
                          {cmt.author}
                        </span>
                        <span className="event-detail-comment-time">
                          {dayjs(cmt.createdAt).isValid()
                            ? dayjs(cmt.createdAt).format("HH:mm · DD/MM/YYYY")
                            : "Vừa xong"}
                        </span>
                      </div>
                      <div className="event-detail-comment-text">
                        {cmt.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="event-detail-empty-box">
                  Chưa có trao đổi nào. Hãy là người đầu tiên để lại ý kiến thảo
                  luận!
                </div>
              )}
            </div>

            {/* Ô nhập trao đổi thảo luận dạng Facebook Composer */}
            <div className="event-detail-composer-wrapper">
              <Avatar
                size={32}
                style={{
                  backgroundColor: getAvatarColor(currentUserName),
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {getInitials(currentUserName)}
              </Avatar>

              <div className="event-detail-composer-box">
                <textarea
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder="Nhập nội dung trao đổi... (Enter để gửi, Shift + Enter xuống dòng)"
                  ref={inputRef}
                  rows={1}
                  value={commentText}
                />
                <Tooltip title="Gửi ý kiến (Enter)">
                  <button
                    aria-label="Gửi ý kiến"
                    className="event-detail-send-btn"
                    disabled={!commentText.trim() || submittingComment}
                    onClick={handleSendComment}
                    type="button"
                  >
                    <Send size={14} />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
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
