import { Tag } from 'antd';

import type { AnnouncementLevel, TaskPriority, TaskStatus } from '@/types/domain';

const labels: Record<string, string> = {
  todo: 'Chờ xử lý',
  pending: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  completed: 'Đã duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  overdue: 'Quá hạn',
  draft: 'Bản nháp',
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  urgent: 'Khẩn',
  normal: 'Thông thường',
  important: 'Quan trọng',
};

const variants: Record<string, string> = {
  todo: 'warning',
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  approved: 'success',
  rejected: 'danger',
  overdue: 'danger',
  draft: 'neutral',
  low: 'neutral',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
  normal: 'neutral',
  important: 'high',
};

export function StatusTag({
  value,
  category,
}: {
  value: TaskStatus | TaskPriority | AnnouncementLevel | string;
  category?: 'priority' | 'status' | 'level';
}) {
  const variant = variants[value] || 'neutral';
  const label = labels[value] || value;
  return (
    <Tag className={`status-tag status-tag--${variant}${category ? ` status-tag--${category}` : ''}`}>
      {label}
    </Tag>
  );
}
