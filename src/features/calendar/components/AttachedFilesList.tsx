import React from 'react';
import { Tooltip, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Paperclip,
  Download,
  X,
} from 'lucide-react';

import type { CalendarAttachment } from '@/types/calendar';

export interface FileCategoryMeta {
  type: string;
  color: string;
  bg: string;
  border: string;
  label: string;
  icon: React.ReactNode;
}

export function getFileCategory(name: string): FileCategoryMeta {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) {
    return {
      type: 'pdf',
      color: '#d92d20',
      bg: '#fef3f2',
      border: '#fecdca',
      label: 'PDF',
      icon: <FileText size={13} strokeWidth={2.2} />,
    };
  }
  if (['doc', 'docx'].includes(ext)) {
    return {
      type: 'doc',
      color: '#1570ef',
      bg: '#eff8ff',
      border: '#b2ddff',
      label: 'DOCX',
      icon: <FileText size={13} strokeWidth={2.2} />,
    };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return {
      type: 'xls',
      color: '#079455',
      bg: '#edfcf2',
      border: '#abefc6',
      label: 'XLSX',
      icon: <FileSpreadsheet size={13} strokeWidth={2.2} />,
    };
  }
  if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
    return {
      type: 'img',
      color: '#0694a2',
      bg: '#f0fdfa',
      border: '#99f6e4',
      label: 'IMG',
      icon: <ImageIcon size={13} strokeWidth={2.2} />,
    };
  }
  return {
    type: 'file',
    color: '#475569',
    bg: '#f8fafc',
    border: '#e2e8f0',
    label: ext ? ext.toUpperCase() : 'FILE',
    icon: <Paperclip size={13} strokeWidth={2.2} />,
  };
}

export function formatBytes(bytes?: number): string {
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
              style={{ background: cat.bg, color: cat.color }}
              title={cat.label}
            >
              {cat.icon}
            </div>

            <div className="file-card-details">
              <Tooltip title={file.name}>
                <span className="file-card-name">{file.name}</span>
              </Tooltip>
              <span className="file-card-size">{formatBytes(file.size)}</span>
            </div>

            <button
              type="button"
              className="btn-remove-file-card"
              onClick={() => onRemove(file.uid)}
              title="Gỡ tệp này"
              aria-label={`Xóa tệp ${file.name}`}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
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
              style={{ background: cat.bg, color: cat.color }}
              title={cat.label}
            >
              {cat.icon}
            </div>

            <div className="file-card-details">
              <Tooltip title={att.name}>
                <span className="file-card-name">{att.name}</span>
              </Tooltip>
              <span className="file-card-size">{formatBytes(att.size)}</span>
            </div>

            <button
              type="button"
              className="btn-download-file-card"
              onClick={() => message.info(`Đang tải xuống tệp: ${att.name}`)}
              title="Tải về"
              aria-label={`Tải về ${att.name}`}
            >
              <Download size={13} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
