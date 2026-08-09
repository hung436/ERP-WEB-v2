import { Tag } from 'antd';

import type { AnnouncementLevel, TaskPriority, TaskStatus } from '@/types/domain';

const labels: Record<string, string> = {
  todo: 'Chưa thực hiện', in_progress: 'Đang xử lý', completed: 'Hoàn thành', overdue: 'Quá hạn',
  low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn', normal: 'Thông thường', important: 'Quan trọng',
};
const variants: Record<string, string> = {
  todo: 'neutral',
  in_progress: 'info',
  completed: 'success',
  overdue: 'danger',
  low: 'neutral',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
  normal: 'neutral',
  important: 'high',
};

export function StatusTag({ value, category }: { value: TaskStatus | TaskPriority | AnnouncementLevel; category?: 'priority' | 'status' | 'level' }) {
  return <Tag className={`status-tag status-tag--${variants[value]}${category ? ` status-tag--${category}` : ''}`}>{labels[value]}</Tag>;
}
