import type { CalendarAttachment } from '@/types/calendar';

/** Keep uploaded bytes with the mock record so downloads contain the actual uploaded bytes. */
export function readAttachment(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result) : reject(new Error('Không thể đọc tệp'));
    reader.onerror = () => reject(new Error('Không thể đọc tệp'));
    reader.readAsDataURL(file);
  });
}

export function canDownloadAttachment(url?: string): boolean {
  return Boolean(url && (/^https?:\/\//i.test(url) || /^(data:|blob:|\/(?!\/))/i.test(url)));
}

export function downloadAttachment(attachment: CalendarAttachment): void {
  if (!canDownloadAttachment(attachment.url)) throw new Error('Tệp mẫu chưa có nội dung để tải xuống');
  const link = document.createElement('a');
  link.href = attachment.url!;
  link.download = attachment.name;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
