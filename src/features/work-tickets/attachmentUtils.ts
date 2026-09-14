import { File, FileArchive, FileImage, FileSpreadsheet, FileText, Presentation } from 'lucide-react';

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const fileKindByExt: Record<string, { icon: typeof File; tone: string; label: string }> = {
  pdf: { icon: FileText, tone: 'pdf', label: 'PDF' },
  doc: { icon: FileText, tone: 'doc', label: 'DOC' },
  docx: { icon: FileText, tone: 'doc', label: 'DOCX' },
  xls: { icon: FileSpreadsheet, tone: 'sheet', label: 'XLS' },
  xlsx: { icon: FileSpreadsheet, tone: 'sheet', label: 'XLSX' },
  csv: { icon: FileSpreadsheet, tone: 'sheet', label: 'CSV' },
  ppt: { icon: Presentation, tone: 'slide', label: 'PPT' },
  pptx: { icon: Presentation, tone: 'slide', label: 'PPTX' },
  jpg: { icon: FileImage, tone: 'image', label: 'JPG' },
  jpeg: { icon: FileImage, tone: 'image', label: 'JPEG' },
  png: { icon: FileImage, tone: 'image', label: 'PNG' },
  gif: { icon: FileImage, tone: 'image', label: 'GIF' },
  zip: { icon: FileArchive, tone: 'archive', label: 'ZIP' },
  rar: { icon: FileArchive, tone: 'archive', label: 'RAR' },
};

export function getFileKind(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return fileKindByExt[ext] ?? { icon: File, tone: 'default', label: ext ? ext.toUpperCase() : 'FILE' };
}
