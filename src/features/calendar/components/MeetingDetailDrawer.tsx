import { calendarDetailHref } from '../calendarWeekUtils';
import {
  Avatar,
  Button,
  Drawer,
  Input,
  Modal,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import {
  AlertCircle,
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
import React, { useRef, useState } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import { calendarApi } from "@/services/api";
import type { CalendarAttachmentItem, CalendarEvent } from "@/types/domain";

import { formatBytes, getFileCategory } from "./AttachedFilesList";
import { CreatePersonalMeetingModal } from "./CreatePersonalMeetingModal";

import { canDownloadAttachment, downloadAttachment, readAttachment } from "../attachmentUtils";
import { canManagePersonalMeeting, matchesCalendarPerson } from "../calendarMembership";
import { useCalendarConfirmation } from '../useCalendarConfirmation';

import "./MeetingDetailDrawer.css";

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

export interface MeetingDetailDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const MeetingDetailDrawer: React.FC<MeetingDetailDrawerProps> = ({
  event,
  open,
  onClose,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const { confirm, confirmationHolder } = useCalendarConfirmation();
  const { user } = useAuth();
  const currentUserName = user?.fullName || "Nguyễn Minh Anh";

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [fileList] = useState<UploadFile[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  if (!event) return null;

  const isEditorial = event.scope === "editorial";
  const canManageMeeting = canManagePersonalMeeting(event, user);
  const isPersonal = event.scope === "personal";
  const isUserAttending = Boolean(event.isUserParticipant);
  const start = dayjs(event.startAt);
  const end = dayjs(event.endAt);

  const isProposal =
    event.workflowType === "PROPOSAL" ||
    Boolean(event.approver?.name) ||
    (event.approvers && event.approvers.length > 0) ||
    event.approvalStatus === "PENDING" ||
    event.approvalStatus === "REJECTED";

  const isUserAnApprover = Boolean(
    user && (
      event.approvers?.length
        ? event.approvers.some((person) => matchesCalendarPerson(person, user))
        : event.approver && matchesCalendarPerson(event.approver, user)
    ),
  );

  // Gửi bình luận thảo luận
  const handleSendComment = async () => {
    if (!commentText.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận.");
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await calendarApi.addComment(event.id, commentText.trim());
      message.success("Đã gửi bình luận thành công.");
      setCommentText("");
      onUpdateEvent(res.data);
    } catch {
      message.error("Không thể lưu bình luận. Vui lòng thử lại.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Đính kèm tệp tài liệu
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
      const res = await calendarApi.addAttachment(event.id, { ...newAtt, url: await readAttachment(file) });
      message.success(`Đã đính kèm tệp: ${file.name}`);
      onUpdateEvent(res.data);
    } catch {
      message.error("Không thể lưu tệp đính kèm. Vui lòng thử lại.");
    }
    return false;
  };

  // Bật/tắt quan tâm lịch họp
  const handleToggleInterest = () => {
    const nextState = !event.isInterested;
    try {
      onUpdateEvent(calendarApi.saveDemoChanges(event, { isInterested: nextState }));
    } catch {
      message.error("Không thể lưu thay đổi. Vui lòng thử lại.");
      return;
    }
    if (nextState) {
      message.success(
        'Đã quan tâm',
      );
    } else {
      message.info(`Đã hủy nhắc nhở lịch "${event.title}".`);
    }
  };

  // Xóa lịch làm việc cá nhân
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

  const confirmDelete = () => confirm({
    title: "Xóa lịch làm việc?",
    content: `Bạn có muốn xóa lịch “${event.title}” không?`,
    onConfirm: handleDelete,
  });


  // Cập nhật sau khi chỉnh sửa
  const handleEditSuccess = (updated: CalendarEvent) => {
    onUpdateEvent(updated);
    setEditModalOpen(false);
  };

  // Sao chép link phòng họp
  const handleCopyMeetingLink = () => {
    if (!event?.meetingUrl) return;
    navigator.clipboard.writeText(event.meetingUrl);
    message.success("Đã sao chép liên kết phòng họp!");
  };

  // Phê duyệt phiếu đề xuất họp
  const handleApproveProposal = async () => {
    const updatedEvent: CalendarEvent = {
      ...event,
      approvalStatus: "APPROVED",
      approvers: (event.approvers || []).map((a) => ({
        ...a,
        status: user && matchesCalendarPerson(a, user) ? "APPROVED" : a.status,
      })),
      steps: (event.steps || []).map((st) =>
        st.step_order === 2 || st.role === "APPROVER"
          ? {
              ...st,
              status: "APPROVED" as const,
              completed_at: new Date().toISOString(),
            }
          : st,
      ),
    };
    try {
      const response = await calendarApi.update(event.id, { approvalStatus: updatedEvent.approvalStatus, approvers: updatedEvent.approvers, steps: updatedEvent.steps });
      onUpdateEvent(response.data);
    } catch {
      message.error("Không thể lưu trạng thái lịch. Vui lòng thử lại.");
      return;
    }
    message.success("Đã phê duyệt lịch họp thành công!");
  };

  // Từ chối duyệt phiếu đề xuất họp
  const handleRejectProposal = async () => {
    const updatedEvent: CalendarEvent = {
      ...event,
      approvalStatus: "REJECTED",
      approvers: (event.approvers || []).map((a) => ({
        ...a,
        status: "REJECTED",
        note: rejectReason.trim() || undefined,
      })),
      steps: (event.steps || []).map((st) =>
        st.step_order === 2 || st.role === "APPROVER"
          ? {
              ...st,
              status: "REJECTED" as const,
              completed_at: new Date().toISOString(),
            }
          : st,
      ),
    };
    try {
      const response = await calendarApi.update(event.id, { approvalStatus: updatedEvent.approvalStatus, approvers: updatedEvent.approvers, steps: updatedEvent.steps });
      onUpdateEvent(response.data);
    } catch {
      message.error("Không thể lưu trạng thái lịch. Vui lòng thử lại.");
      return;
    }
    message.info("Đã từ chối duyệt lịch họp.");
    setRejectModalOpen(false);
    setRejectReason("");
  };

  return (
    <>
      {confirmationHolder}
      <Drawer
        aria-label="Chi tiết cuộc họp"
        className="calendar-detail-drawer"
        destroyOnClose
        extra={
          canManageMeeting ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button
                icon={<Edit3 size={14} />}
                onClick={() => setEditModalOpen(true)}
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
          ) : null
        }
        footer={null}
        onClose={onClose}
        open={open}
        placement="right"
        title={null}
        width={560}
      >
        {/* Header & Badges */}
        <div className="meeting-drawer-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <div className="meeting-drawer-badges" style={{ marginBottom: 0 }}>
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

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Button
                icon={<ExternalLink size={13} />}
                href={calendarDetailHref(event.id)}
                size="small"
                type="primary"
              >
                Xem chi tiết
              </Button>
              {canManageMeeting && (
                <>
                  <Button
                    icon={<Edit3 size={14} />}
                    onClick={() => setEditModalOpen(true)}
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
                </>
              )}
              {isEditorial &&
                !isUserAttending &&
                !dayjs(event.endAt).isBefore(dayjs()) && (
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
              )}
            </div>
          </div>

          <h2 className="meeting-drawer-title">{event.title}</h2>

          {event.isAdjusted && event.adjustedNote && (
            <div className="meeting-drawer-adjusted-banner">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                <strong>Lưu ý điều chỉnh:</strong> {event.adjustedNote}
              </span>
            </div>
          )}
        </div>

        {/* Grid thông tin chung */}
        <div className="meeting-drawer-grid">
          <div className="meeting-info-item">
            <span className="meeting-info-label">
              <Clock size={12} />
              Thời gian
            </span>
            <span className="meeting-info-value">
              {start.isValid() && end.isValid()
                ? `${start.format("HH:mm")} (${VI_DAY_NAMES[start.day()]}, ${start.format("DD/MM/YYYY")})`
                : "Chưa xác định"}
            </span>
          </div>

          <div className="meeting-info-item">
            <span className="meeting-info-label">
              <MapPin size={12} />
              Địa điểm
            </span>
            <span className="meeting-info-value">
              {event.location ||
                (event.meetingUrl
                  ? "Phòng họp trực tuyến"
                  : "Tòa soạn Tuổi Trẻ")}
            </span>
          </div>

          {Boolean((event.leader || event.organizer)?.trim()) && (
            <div className="meeting-info-item">
              <span className="meeting-info-label">
                <Users size={12} />
                Người chủ trì
              </span>
              <span className="meeting-info-value">
                {event.leader || event.organizer}
              </span>
            </div>
          )}

          <div className="meeting-info-item">
            <span className="meeting-info-label">
              <Users size={12} />
              Thành phần tham gia
            </span>
            <span className="meeting-info-value">
              {highlightCurrentUserName(
                event.participantText || event.participants?.join(", ") || "",
                currentUserName,
              )}
            </span>
          </div>
        </div>

        {/* Khung phòng họp trực tuyến nếu có */}
        {event.meetingUrl && (
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
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
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0284c7",
                  flexShrink: 0,
                }}
              >
                <Video size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
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

        {/* Trực ban tòa soạn nếu có */}
        {event.dutyInfo && (
          <div
            style={{
              marginBottom: 16,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 12.5,
              color: "#991b1b",
            }}
          >
            <Calendar size={14} style={{ display: "inline", marginRight: 6 }} />
            <strong>Lịch trực tòa soạn:</strong> {event.dutyInfo}
          </div>
        )}

        {/* Khối quy trình phê duyệt (nếu là phiếu đề xuất họp) */}
        {isProposal && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 16,
            }}
          >
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

            {/* Thao tác duyệt dành cho Người duyệt */}
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
                  type="primary"
                  icon={<CheckCircle2 size={14} />}
                  onClick={handleApproveProposal}
                  style={{
                    backgroundColor: "#059669",
                    borderColor: "#059669",
                    fontWeight: 600,
                    borderRadius: 6,
                  }}
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

        {/* PHẦN: TÀI LIỆU */}
        <div style={{ marginTop: 16, marginBottom: 18 }}>
          <div
            className="meeting-section-title"
            style={{ justifyContent: "space-between" }}
          >
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {event.attachments.map((att) => {
                const cat = getFileCategory(att.name);
                return (
                  <div
                    key={att.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: "#f8fafc",
                      border: "1px solid #eaecf0",
                      borderRadius: 8,
                    }}
                  >
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
                        disabled={!canDownloadAttachment(att.url)}
                        onClick={() => downloadAttachment(att)}
                        size="small"
                        type="text"
                      />
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: "12px",
                textAlign: "center",
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: 8,
                fontSize: 12.5,
                color: "#64748b",
              }}
            >
              Chưa có tài liệu đính kèm. Nhấp vào &ldquo;Đính kèm&rdquo; để thêm
              tài liệu cho buổi làm việc.
            </div>
          )}
        </div>

        {/* PHẦN: THẢO LUẬN (FACEBOOK STYLE) */}
        <div className="meeting-fb-comments-section" style={{ marginTop: 18 }}>
          <div className="meeting-section-title">
            <MessageSquare size={15} />
            Thảo luận ({event.comments?.length || 0})
          </div>

          <div className="meeting-fb-comments-list">
            {event.comments && event.comments.length > 0 ? (
              event.comments.map((cmt) => (
                <div className="meeting-fb-comment-item" key={cmt.id}>
                  <Avatar
                    className="meeting-fb-comment-avatar"
                    size={32}
                    style={{
                      backgroundColor: getAvatarColor(cmt.author),
                      color: "#fff",
                    }}
                  >
                    {getInitials(cmt.author)}
                  </Avatar>

                  <div className="meeting-fb-comment-content">
                    <div className="meeting-fb-comment-header">
                      <span className="meeting-fb-comment-author">
                        {cmt.author}
                      </span>
                      <span className="meeting-fb-comment-time">
                        {dayjs(cmt.createdAt).format("HH:mm · DD/MM/YYYY")}
                      </span>
                    </div>
                    <div className="meeting-fb-comment-text">{cmt.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: 12,
                  fontSize: 12.5,
                  color: "#65676b",
                }}
              >
                Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến thảo
                luận!
              </div>
            )}
          </div>

          {/* Khung nhập thảo luận phong cách Facebook */}
          <div className="meeting-fb-composer-wrapper">
            <Avatar
              className="meeting-fb-comment-avatar"
              size={32}
              style={{ backgroundColor: "#1877f2", color: "#fff" }}
            >
              {getInitials(currentUserName)}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="meeting-fb-composer-box">
                <Input.TextArea
                  autoSize={{ minRows: 1, maxRows: 4 }}
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
                <button
                  aria-label="Gửi bình luận"
                  className="meeting-fb-send-btn"
                  disabled={submittingComment || !commentText.trim()}
                  onClick={handleSendComment}
                  type="button"
                >
                  <Send size={13} />
                </button>
              </div>
              <div className="meeting-fb-composer-hint">
                Nhấn <strong>Enter</strong> để gửi,{" "}
                <strong>Shift + Enter</strong> để xuống dòng
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal Chỉnh sửa cuộc họp cá nhân */}
      {canManageMeeting && (
        <CreatePersonalMeetingModal
          editingEvent={event}
          initialTicketType="MEETING"
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          open={editModalOpen}
        />
      )}

      {/* Modal Nhập lý do từ chối duyệt */}
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
        title="Lý do không duyệt lịch họp"
      >
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontSize: 13, color: "#475467", marginBottom: 8 }}>
            Vui lòng nhập lý do hoặc ý kiến chỉ đạo để người đề xuất nắm thông
            tin:
          </div>
          <Input.TextArea
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do không duyệt lịch họp"
            rows={3}
            value={rejectReason}
          />
        </div>
      </Modal>
    </>
  );
};
