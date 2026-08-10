import type { MailAttachment } from '@/types/domain';

type FileKind = {
  label: string;
  tone: string;
  bg: string;
  color: string;
  icon: JSX.Element;
};

const getFileKind = (file: Pick<MailAttachment, 'name' | 'type'>): FileKind => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'pdf' || file.type.includes('pdf')) {
    return {
      label: 'PDF',
      tone: 'pdf',
      bg: '#ef4444',
      color: '#ffffff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
    };
  }

  if (['doc', 'docx'].includes(ext) || file.type.includes('word')) {
    return {
      label: ext.toUpperCase() || 'DOC',
      tone: 'word',
      bg: '#2563eb',
      color: '#ffffff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      ),
    };
  }

  if (['xls', 'xlsx', 'csv'].includes(ext) || file.type.includes('sheet') || file.type.includes('excel')) {
    return {
      label: ext.toUpperCase() || 'XLS',
      tone: 'sheet',
      bg: '#10b981',
      color: '#ffffff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M8 13h8M8 17h8M12 13v8" />
        </svg>
      ),
    };
  }

  if (['ppt', 'pptx'].includes(ext) || file.type.includes('presentation')) {
    return {
      label: ext.toUpperCase() || 'PPT',
      tone: 'slide',
      bg: '#f97316',
      color: '#ffffff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <rect x="8" y="12" width="8" height="6" rx="1" />
        </svg>
      ),
    };
  }

  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return {
      label: ext.toUpperCase() || 'IMG',
      tone: 'image',
      bg: '#8b5cf6',
      color: '#ffffff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    };
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || file.type.includes('zip')) {
    return {
      label: ext.toUpperCase() || 'ZIP',
      tone: 'archive',
      bg: '#475569',
      color: '#ffffff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8v13H3V8M1 3h22v5H1z" />
          <path d="M10 12h4" />
        </svg>
      ),
    };
  }

  return {
    label: ext.slice(0, 4).toUpperCase() || 'FILE',
    tone: 'file',
    bg: '#64748b',
    color: '#ffffff',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  };
};

export function MailFileIcon({ file, compact = false }: { file: Pick<MailAttachment, 'name' | 'type'>; compact?: boolean }) {
  const kind = getFileKind(file);
  return (
    <span
      aria-label={`Tệp ${kind.label}`}
      className={`mail-file-icon-badge ${kind.tone}${compact ? ' compact' : ''}`}
      style={{
        backgroundColor: kind.bg,
        color: kind.color,
      }}
    >
      <span className="file-icon-symbol">{kind.icon}</span>
      <b className="file-icon-ext">{kind.label}</b>
    </span>
  );
}
