import type { MailAttachment } from '@/types/domain';

const fileKind = (file: Pick<MailAttachment, 'name' | 'type'>) => {
  const extension = file.name.split('.').pop()?.toLocaleLowerCase() ?? '';
  if (extension === 'pdf' || file.type.includes('pdf')) return { label: 'PDF', tone: 'pdf' };
  if (['doc', 'docx'].includes(extension) || file.type.includes('word')) return { label: 'DOC', tone: 'word' };
  if (['xls', 'xlsx', 'csv'].includes(extension) || file.type.includes('sheet') || file.type.includes('excel')) return { label: 'XLS', tone: 'sheet' };
  if (['ppt', 'pptx'].includes(extension) || file.type.includes('presentation')) return { label: 'PPT', tone: 'slide' };
  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return { label: 'IMG', tone: 'image' };
  if (['zip', 'rar', '7z'].includes(extension) || file.type.includes('zip')) return { label: 'ZIP', tone: 'archive' };
  return { label: extension.slice(0, 4).toUpperCase() || 'FILE', tone: 'file' };
};

export function MailFileIcon({ file, compact = false }: { file: Pick<MailAttachment, 'name' | 'type'>; compact?: boolean }) {
  const kind = fileKind(file);
  return <span aria-label={`Tệp ${kind.label}`} className={`mail-file-type ${kind.tone}${compact ? ' compact' : ''}`}><i /><b>{kind.label}</b></span>;
}
