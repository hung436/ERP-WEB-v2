import { FileIcon, defaultStyles } from 'react-file-icon';
import type { MailAttachment } from '@/types/domain';

export function MailFileIcon({ file }: { file: Pick<MailAttachment, 'name' | 'type'>; compact?: boolean }) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'file';
  const iconProps = defaultStyles[ext as keyof typeof defaultStyles] ?? {
    color: '#64748b',
    labelColor: '#475569',
    glyphColor: '#e2e8f0',
  };

  return (
    <span className="mail-official-file-icon" style={{ width: 24, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <FileIcon extension={ext} labelUppercase {...iconProps} />
    </span>
  );
}
