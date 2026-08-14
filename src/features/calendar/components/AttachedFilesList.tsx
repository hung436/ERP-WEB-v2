import { Button, Tooltip, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { CalendarAttachment } from '@/types/calendar';

export function getFileCategory(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return { type: 'pdf', icon: '📄', color: '#d92d20', bg: '#fef3f2', border: '#fecdca', label: 'PDF' };
  if (['doc', 'docx'].includes(ext)) return { type: 'doc', icon: '📝', color: '#1570ef', bg: '#eff8ff', border: '#b2ddff', label: 'DOCX' };
  if (['xls', 'xlsx'].includes(ext)) return { type: 'xls', icon: '📊', color: '#079455', bg: '#edfcf2', border: '#abefc6', label: 'XLSX' };
  if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) return { type: 'img', icon: '🖼️', color: '#0694a2', bg: '#f0fdfa', border: '#99f6e4', label: 'IMG' };
  if (['html', 'htm'].includes(ext)) return { type: 'html', icon: '🌐', color: '#7f56d9', bg: '#f4f3ff', border: '#d6bbffb', label: 'HTML' };
  return { type: 'file', icon: '📁', color: '#475569', bg: '#f8fafc', border: '#e2e8f0', label: 'FILE' };
}

export function formatBytes(bytes?: number) {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachedFilesGrid({
  files,
  onRemove,
}: {
  files: UploadFile[];
  onRemove: (uid: string) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="attached-files-custom-grid">
      {files.map((file) => {
        const cat = getFileCategory(file.name);
        return (
          <div className="custom-file-card-item" key={file.uid || file.name}>
            <div
              className="file-badge-type"
              style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}
            >
              <span className="badge-icon">{cat.icon}</span>
              <small className="badge-label">{cat.label}</small>
            </div>

            <div className="file-card-details">
              <Tooltip title={file.name}>
                <strong className="file-card-name">{file.name}</strong>
              </Tooltip>
              <span className="file-card-size">{formatBytes(file.size)}</span>
            </div>

            <Button
              className="btn-remove-file-card"
              onClick={() => onRemove(file.uid)}
              size="small"
              title="Gỡ tệp này"
              type="text"
            >
              ✕
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export function ReadonlyAttachmentsGrid({
  attachments,
}: {
  attachments: CalendarAttachment[];
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="attached-files-custom-grid readonly-grid">
      {attachments.map((att) => {
        const cat = getFileCategory(att.name);
        return (
          <div className="custom-file-card-item readonly-card" key={att.id}>
            <div
              className="file-badge-type"
              style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}
            >
              <span className="badge-icon">{cat.icon}</span>
              <small className="badge-label">{cat.label}</small>
            </div>

            <div className="file-card-details">
              <Tooltip title={att.name}>
                <strong className="file-card-name">{att.name}</strong>
              </Tooltip>
              <span className="file-card-size">{formatBytes(att.size)}</span>
            </div>

            <Button
              className="btn-download-file-card"
              onClick={() => message.info(`Đang tải xuống tệp: ${att.name}`)}
              size="small"
              type="link"
            >
              Tải về
            </Button>
          </div>
        );
      })}
    </div>
  );
}
