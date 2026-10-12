import { Avatar, Button, Empty, Input, Modal, Tag, Tooltip, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { AlertCircle, Calendar, Clock, Download, ExternalLink, MapPin, MessageSquare, Paperclip, Send, UploadCloud, Users, Video } from 'lucide-react';
import { useRef, useState } from 'react';
import { calendarApi } from '@/services/api';
import type { CalendarAttachmentItem, CalendarEvent } from '@/types/domain';
import { formatBytes, getFileCategory } from './AttachedFilesList';

const VI_DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = ['#1877f2', '#e11d48', '#0284c7', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function highlightCurrentUserName(text: string, currentUserName = 'Nguyễn Minh Anh') {
  if (!text) return 'Chưa cập nhật';
  const regex = new RegExp(`(${currentUserName})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    if (part.toLowerCase() === currentUserName.toLowerCase()) {
      return (
        <span key={idx} style={{ fontWeight: 700, color: '#0f172a' }}>
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: CalendarEvent) => void;
}

export function CalendarEventDetailModal({
  event,
  open,
  onClose,
  onUpdateEvent,
}: CalendarEventDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'comments' | 'attachments'>('info');
  const inputRef = useRef<any>(null);

  if (!event) return null;

  const isEditorial = event.scope === 'editorial';
  const isPersonal = event.scope === 'personal';
  const start = dayjs(event.startAt);
  const end = dayjs(event.endAt);

  // Send comment
  const handleSendComment = async () => {
    if (!commentText.trim()) {
      message.warning('Vui lòng nhập nội dung bình luận.');
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await calendarApi.addComment(event.id, commentText.trim());
      message.success('Đã gửi bình luận thành công.');
      setCommentText('');
      onUpdateEvent(res.data);
    } catch {
      message.error('Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Upload attachment
  const handleUploadAttachment = async (file: File) => {
    const newAtt: CalendarAttachmentItem = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || 'file',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Nguyễn Minh Anh',
    };

    try {
      const res = await calendarApi.addAttachment(event.id, newAtt);
      message.success(`Đã đính kèm tệp: ${file.name}`);
      onUpdateEvent(res.data);
    } catch {
      message.error('Không thể tải lên tệp.');
    }
    return false; // prevent default upload
  };

  return (
    <Modal
      className="calendar-detail-modal"
      footer={[
        event.meetingUrl && (
          <Button
            href={event.meetingUrl}
            icon={<Video size={15} />}
            key="join"
            target="_blank"
            type="primary"
          >
            Vào phòng họp trực tuyến
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      onCancel={onClose}
      open={open}
      title={null}
      width={680}
    >
      <div className="detail-modal-header">
        <div className="detail-modal-badges">
          {event.isAdjusted && (
            <Tag bordered={false} color="warning" style={{ fontSize: 12, padding: '2px 8px', fontWeight: 600 }}>
              Đã điều chỉnh
            </Tag>
          )}

          {isEditorial ? (
            <Tag color="error" style={{ fontSize: 12, padding: '2px 8px' }}>
              Lịch Ban biên tập
            </Tag>
          ) : (
            <Tag color="blue" style={{ fontSize: 12, padding: '2px 8px' }}>
              Lịch cá nhân
            </Tag>
          )}

          {event.platform && (
            <Tag color="purple" style={{ fontSize: 12, padding: '2px 8px' }}>
              {event.platform}
            </Tag>
          )}
        </div>

        <h2 className="detail-modal-title">{event.title}</h2>

        {event.isAdjusted && event.adjustedNote && (
          <div className="detail-modal-adjusted-banner">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>
              <strong>Lưu ý điều chỉnh:</strong> {event.adjustedNote}
            </span>
          </div>
        )}
      </div>

      {/* Grid thông tin chung */}
      <div className="detail-modal-grid">
        <div className="detail-info-item">
          <span className="detail-info-label">
            <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
            Thời gian
          </span>
          <span className="detail-info-value">
            {start.format('HH:mm')} - {end.format('HH:mm')} ({VI_DAY_NAMES[start.day()]}, {start.format('DD/MM/YYYY')})
          </span>
        </div>

        <div className="detail-info-item">
          <span className="detail-info-label">
            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
            Địa điểm
          </span>
          <span className="detail-info-value">
            {event.location || (event.meetingUrl ? 'Phòng họp trực tuyến' : 'Tòa soạn Tuổi Trẻ')}
          </span>
        </div>

        {Boolean((event.leader || event.organizer)?.trim()) && (
          <div className="detail-info-item">
            <span className="detail-info-label">
              <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
              Người chủ trì
            </span>
            <span className="detail-info-value">{event.leader || event.organizer}</span>
          </div>
        )}

        <div className="detail-info-item">
          <span className="detail-info-label">
            <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
            Thành phần tham gia
          </span>
          <span className="detail-info-value">
            {highlightCurrentUserName(event.participantText || event.participants?.join(', ') || '')}
            {event.participantCount ? ` (SL: ${event.participantCount})` : ''}
          </span>
        </div>
      </div>

      {/* Meeting link card nếu là họp trực tuyến */}
      {event.meetingUrl && (
        <div
          style={{
            background: '#eff8ff',
            border: '1px solid #b2ddff',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#175cd3' }}>
              <Video size={15} style={{ display: 'inline', marginRight: 6 }} />
              Đường dẫn phòng họp trực tuyến Tuổi Trẻ
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{event.meetingUrl}</div>
          </div>
          <Button
            href={event.meetingUrl}
            icon={<ExternalLink size={14} />}
            size="small"
            target="_blank"
            type="primary"
          >
            Mở phòng họp
          </Button>
        </div>
      )}

      {/* Trực ban tòa soạn nếu có */}
      {event.dutyInfo && (
        <div
          style={{
            marginBottom: 16,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 12.5,
            color: '#991b1b',
          }}
        >
          <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
          <strong>Lịch trực tòa soạn:</strong> {event.dutyInfo}
        </div>
      )}

      {/* PHẦN: TÀI LIỆU */}
      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <div className="detail-section-title" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {event.attachments.map((att) => {
              const cat = getFileCategory(att.name);
              return (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    background: '#f8fafc',
                    border: '1px solid #eaecf0',
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
                      display: 'grid',
                      placeItems: 'center',
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
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={att.name}
                    >
                      {att.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {formatBytes(att.size)} · {att.uploadedBy || 'Người tham dự'}
                    </div>
                  </div>
                  <Tooltip title="Tải xuống tệp">
                    <Button
                      icon={<Download size={13} />}
                      onClick={() => message.info(`Đang tải xuống tệp: ${att.name}`)}
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
              padding: '12px',
              textAlign: 'center',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 8,
              fontSize: 12.5,
              color: '#64748b',
            }}
          >
            Chưa có tài liệu đính kèm. Nhấp vào "Đính kèm" để thêm tài liệu cho buổi làm việc.
          </div>
        )}
      </div>

      {/* PHẦN 2: THẢO LUẬN (FACEBOOK STYLE) */}
      <div className="fb-comments-section" style={{ marginTop: 18 }}>
        <div className="detail-section-title">
          <MessageSquare size={15} />
          Thảo luận ({event.comments?.length || 0})
        </div>

        <div className="fb-comments-list">
          {event.comments && event.comments.length > 0 ? (
            event.comments.map((cmt) => (
              <div className="fb-comment-item" key={cmt.id}>
                <Avatar
                  className="fb-comment-avatar"
                  size={32}
                  style={{
                    backgroundColor: getAvatarColor(cmt.author),
                    color: '#fff',
                  }}
                >
                  {getInitials(cmt.author)}
                </Avatar>

                <div className="fb-comment-content">
                  <div className="fb-comment-header">
                    <span className="fb-comment-author">{cmt.author}</span>
                    <span className="fb-comment-time">
                      {dayjs(cmt.createdAt).format('HH:mm · DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="fb-comment-text">{cmt.content}</div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: 12,
                fontSize: 12.5,
                color: '#65676b',
              }}
            >
              Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến thảo luận!
            </div>
          )}
        </div>

        {/* Khung nhập thảo luận phong cách Facebook */}
        <div className="fb-composer-wrapper">
          <Avatar
            className="fb-comment-avatar"
            size={32}
            style={{ backgroundColor: '#1877f2', color: '#fff' }}
          >
            NA
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fb-composer-box">
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 4 }}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder="Viết trao đổi..."
                ref={inputRef}
                value={commentText}
              />
              <button
                aria-label="Gửi bình luận"
                className="fb-send-btn"
                disabled={submittingComment || !commentText.trim()}
                onClick={handleSendComment}
                type="button"
              >
                <Send size={13} />
              </button>
            </div>
            <div className="fb-composer-hint">
              Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
