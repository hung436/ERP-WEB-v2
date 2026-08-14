import { Button, Modal, Space, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { ReadonlyAttachmentsGrid } from '@/features/calendar/components/AttachedFilesList';
import { calendarNotificationApi } from '@/services/api';
import type { CalendarNotificationItem } from '@/types/calendar';

export function NotificationDetailModal({
  item,
  onClose,
  onUpdated,
}: {
  item: CalendarNotificationItem | null;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [sending, setSending] = useState(false);

  if (!item) return null;

  const isMeeting = item.type === 'editorial_meeting';
  const isSent = item.status === 'sent';

  const handleSendNow = async () => {
    setSending(true);
    try {
      await calendarNotificationApi.send(item.id);
      message.success('Đã gửi thông báo thành công');
      await onUpdated();
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      centered
      className="calendar-notif-detail-modal"
      footer={
        <div className="detail-modal-footer">
          <div className="footer-left-info">
            <span>Người tạo: <strong>{item.createdBy}</strong> ({dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')})</span>
          </div>

          <Space>
            <Button onClick={onClose}>Đóng</Button>
            {!isSent && (
              <Button
                className="btn-primary-red"
                loading={sending}
                onClick={handleSendNow}
                type="primary"
              >
                Gửi thông báo ngay
              </Button>
            )}
          </Space>
        </div>
      }
      onCancel={onClose}
      open={Boolean(item)}
      title={
        <div className="detail-header">
          <div className="header-tags-row">
            <Tag color={isMeeting ? 'magenta' : 'blue'}>
              {isMeeting ? '🏛️ Lịch họp Ban Biên tập' : '📢 Thông báo cơ quan'}
            </Tag>

            <Tag color={isSent ? 'success' : 'warning'}>
              {isSent ? '✓ Đã gửi' : '⏳ Chưa gửi / Hẹn giờ'}
            </Tag>

            {item.sendMailCopy && (
              <Tag color="cyan">✉ Đã kèm email</Tag>
            )}

            {item.applyWatermark && (
              <Tag color="purple">🔒 Watermark bảo mật</Tag>
            )}
          </div>
          <h2 className="detail-main-title">{item.title}</h2>
        </div>
      }
      width={780}
    >
      <div className="detail-body-container">
        {/* METADATA STRIP */}
        <div className="detail-meta-strip">
          <div className="meta-item">
            <small>Thời gian {isSent ? 'đã gửi' : 'hẹn gửi'}:</small>
            <strong>
              {item.sentAt
                ? dayjs(item.sentAt).format('DD/MM/YYYY HH:mm')
                : item.scheduledAt
                ? `${dayjs(item.scheduledAt).format('DD/MM/YYYY HH:mm')} (Hẹn giờ)`
                : 'Chưa đặt lịch'}
            </strong>
          </div>

          <div className="meta-item">
            <small>Danh sách nhận:</small>
            <div>
              {item.recipients.targetType === 'all' ? (
                <Tag color="volcano">Toàn thể cán bộ, phóng viên, nhân viên</Tag>
              ) : item.recipients.targetType === 'groups' ? (
                <Space wrap size={[0, 4]}>
                  {item.recipients.groupNames?.map((grp) => (
                    <Tag color="geekblue" key={grp}>{grp}</Tag>
                  ))}
                </Space>
              ) : item.recipients.targetType === 'departments' ? (
                <Space wrap size={[0, 4]}>
                  {item.recipients.departments?.map((dept) => (
                    <Tag color="geekblue" key={dept}>{dept}</Tag>
                  ))}
                </Space>
              ) : (
                <Space wrap size={[0, 4]}>
                  {item.recipients.individuals?.map((person) => (
                    <Tag color="purple" key={person}>{person}</Tag>
                  ))}
                </Space>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT VIEW */}
        <div className="detail-content-box">
          <h4 className="box-section-title">Nội dung chi tiết:</h4>
          {item.isHtmlContent ? (
            <div
              className="detail-html-content"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          ) : (
            <div className="detail-text-content">
              {item.content}
            </div>
          )}
        </div>

        {/* ATTACHMENTS */}
        {item.attachments && item.attachments.length > 0 && (
          <div className="detail-attachments-box">
            <h4 className="box-section-title">
              Tập tin đính kèm ({item.attachments.length}):
            </h4>

            <ReadonlyAttachmentsGrid attachments={item.attachments} />
          </div>
        )}
      </div>
    </Modal>
  );
}
