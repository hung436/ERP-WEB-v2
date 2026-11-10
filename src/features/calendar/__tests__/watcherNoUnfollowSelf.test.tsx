import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AuthProvider } from '@/features/auth/AuthContext';
import type { CalendarEvent } from '@/types/domain';

import { CalendarEventDetailModal } from '../components/CalendarEventDetailModal';

describe('CalendarEventDetailModal Watcher No Unfollow Self Rule', () => {
  it('người theo dõi ở Chi tiết phiếu sẽ KHÔNG có nút bỏ theo dõi chính mình', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();

    // User hiện tại là Nguyễn Minh Anh, nằm trong danh sách watchers (Người theo dõi)
    const ticketWithSelfWatcher: CalendarEvent = {
      id: 'task-watcher-test-1',
      title: 'Đề xuất nâng cấp đường truyền mạng tòa soạn',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Trần Văn Nam',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'PENDING',
      isUserParticipant: false,
      participants: ['Trần Thu Hà'],
      watchers: [
        { id: 'w-1', name: 'Nguyễn Minh Anh' }, // Chính mình
        { id: 'w-2', name: 'Lê Thanh Vân' }, // Người khác
      ],
      steps: [
        {
          id: 'step-1',
          step_order: 1,
          role: 'CREATOR',
          status: 'COMPLETED',
          name: 'Khởi tạo phiếu',
          actor_name: 'Trần Văn Nam',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={ticketWithSelfWatcher}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Kiểm tra modal Chi tiết phiếu đã hiển thị
    expect(screen.getByText('Chi tiết phiếu')).toBeInTheDocument();

    // Kiểm tra danh sách người theo dõi có mặt
    expect(screen.getByText('Người theo dõi')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Minh Anh')).toBeInTheDocument();
    expect(screen.getByText('Bạn')).toBeInTheDocument();
    expect(screen.getByText('Lê Thanh Vân')).toBeInTheDocument();

    // KHÔNG có bất kỳ nút nào là "Bỏ theo dõi" hoặc "Bỏ theo dõi phiếu"
    expect(screen.queryByTitle(/Bỏ theo dõi/i)).toBeNull();
    expect(screen.queryByLabelText(/Bỏ theo dõi/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Bỏ theo dõi/i })).toBeNull();

    // Header cũng không có nút "Không tham gia" cho vai trò Người theo dõi
    expect(screen.queryByLabelText('Không tham gia')).toBeNull();
  });
});
