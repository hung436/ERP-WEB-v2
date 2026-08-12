import { Button, Drawer, Tag, message } from 'antd';
import dayjs from 'dayjs';

import type { PersonnelChangeRequest } from '@/types/personnel';
import '../personnel-change-requests.css';

interface ChangeHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  historyRequests: PersonnelChangeRequest[];
  fullName: string;
  employeeCode: string;
}

const statusConfig: Record<PersonnelChangeRequest['status'], { label: string; color: string; bg: string; border: string; dot: string }> = {
  new: { label: 'Mới', color: '#1570ef', bg: '#eff8ff', border: '#b2ddff', dot: '#1570ef' },
  in_progress: { label: 'Đang xử lý', color: '#b54708', bg: '#fffaeb', border: '#fedf89', dot: '#dc6803' },
  approved: { label: 'Đã duyệt', color: '#027a48', bg: '#ecfdf3', border: '#abefc6', dot: '#039855' },
  returned: { label: 'Đã trả về', color: '#b42318', bg: '#fef3f2', border: '#fecdca', dot: '#d92d20' },
};

export function ChangeHistoryDrawer({ open, onClose, historyRequests, fullName, employeeCode }: ChangeHistoryDrawerProps) {
  const handleDownloadSnapshot = (fileName: string) => {
    message.success(`Đang tải xuống: ${fileName}`);
  };

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>Lịch sử chỉnh sửa lý lịch</span>
          <span style={{ fontSize: 13, color: '#667085', fontWeight: 400 }}>{fullName} · {employeeCode}</span>
        </div>
      }
      width={520}
      styles={{ body: { padding: '16px 20px', background: '#f9fafb' } }}
    >
      {historyRequests.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '60px 20px', color: '#98a2b3', textAlign: 'center',
        }}>
          <span style={{ fontSize: 36 }}>📋</span>
          <strong style={{ fontSize: 15, color: '#667085' }}>Chưa có lịch sử thay đổi</strong>
          <span style={{ fontSize: 13 }}>Mọi yêu cầu thay đổi thông tin lý lịch sẽ hiển thị tại đây</span>
        </div>
      ) : (
        <div className="history-timeline">
          {historyRequests.map((item, index) => {
            const cfg = statusConfig[item.status];
            return (
              <div key={item.id} className="history-timeline-item">
                {/* Timeline connector */}
                <div className="history-timeline-track">
                  <div className="history-timeline-dot" style={{ background: cfg.dot, boxShadow: `0 0 0 3px ${cfg.bg}` }} />
                  {index < historyRequests.length - 1 && <div className="history-timeline-line" />}
                </div>

                {/* Card content */}
                <div className="history-timeline-card">
                  {/* Card header */}
                  <div className="history-card-header">
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#344054' }}>
                        {dayjs(item.requestedAt).format('DD/MM/YYYY')}
                      </span>
                      <span style={{ fontSize: 12, color: '#98a2b3', marginLeft: 8 }}>
                        {dayjs(item.requestedAt).format('HH:mm')}
                      </span>
                    </div>
                    <Tag style={{
                      fontSize: 12, fontWeight: 600, padding: '2px 8px', margin: 0,
                      color: cfg.color, background: cfg.bg, borderColor: cfg.border,
                    }}>
                      {cfg.label}
                    </Tag>
                  </div>

                  {/* Requester */}
                  <div style={{ fontSize: 13, color: '#475467', marginBottom: 10 }}>
                    Người gửi: <strong style={{ color: '#344054' }}>{item.requestedBy}</strong>
                  </div>

                  {/* Changed fields */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#667085', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Nội dung thay đổi
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {item.fields.map((f, idx) => (
                        <div key={idx} style={{
                          display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 6,
                          background: '#fff', border: '1px solid #f2f4f7', borderRadius: 6, padding: '6px 10px',
                          fontSize: 12.5, alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ color: '#98a2b3', fontSize: 11, marginBottom: 2 }}>{f.fieldLabel}</div>
                            <div style={{ color: '#667085', textDecoration: 'line-through' }}>{f.currentValue || '(Trống)'}</div>
                          </div>
                          <span style={{ color: '#d0d5dd', fontSize: 14 }}>→</span>
                          <div style={{ color: '#027a48', fontWeight: 600 }}>{f.newValue}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reason */}
                  {item.reason && (
                    <div style={{ fontSize: 12.5, color: '#475467', marginBottom: 10, padding: '7px 10px', background: '#fff', border: '1px solid #f2f4f7', borderRadius: 6 }}>
                      <span style={{ color: '#98a2b3', fontSize: 11, display: 'block', marginBottom: 3 }}>GHI CHÚ GIẢI TRÌNH</span>
                      {item.reason}
                    </div>
                  )}

                  {/* Review comment */}
                  {item.reviewComment && (
                    <div style={{
                      fontSize: 12.5, padding: '7px 10px', borderRadius: 6, marginBottom: 10,
                      color: item.status === 'returned' ? '#b42318' : '#027a48',
                      background: item.status === 'returned' ? '#fef3f2' : '#ecfdf3',
                      border: `1px solid ${item.status === 'returned' ? '#fecdca' : '#abefc6'}`,
                    }}>
                      <span style={{ fontSize: 11, display: 'block', marginBottom: 3, opacity: 0.7, fontWeight: 600 }}>
                        {item.status === 'returned' ? 'LÝ DO TRẢ VỀ' : 'Ý KIẾN DUYỆT'}
                      </span>
                      {item.reviewComment}
                      {item.reviewedBy && (
                        <span style={{ display: 'block', marginTop: 4, fontSize: 11, opacity: 0.75 }}>
                          — {item.reviewedBy} · {dayjs(item.reviewedAt).format('DD/MM/YYYY HH:mm')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* PDF Snapshot download */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f2f4f7' }}>
                    <span style={{ fontSize: 12, color: '#98a2b3' }}>Bản lưu lý lịch tại thời điểm gửi</span>
                    <Button
                      icon={<span>📄</span>}
                      onClick={() => handleDownloadSnapshot(item.snapshotPdfName)}
                      size="small"
                      type="link"
                      style={{ fontSize: 12.5, padding: '0 4px' }}
                    >
                      Tải PDF
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}
