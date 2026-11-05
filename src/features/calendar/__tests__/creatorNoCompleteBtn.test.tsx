import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AuthProvider } from '@/features/auth/AuthContext';
import type { CalendarEvent } from '@/types/domain';

import { CalendarEventDetailModal } from '../components/CalendarEventDetailModal';

describe('CalendarEventDetailModal Creator Complete Button Rule', () => {
  it('người tạo triển khai chi tiết phiếu sẽ KHÔNG có nút Hoàn thành', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    const dispatchTicketAsCreator: CalendarEvent = {
      id: 'task-dispatch-1',
      title: 'Triển khai bảo trì hệ thống máy chủ',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      leader: undefined,
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'IN_PROGRESS',
      isUserParticipant: false,
      participants: ['Trần Thu Hà', 'Lê Thanh Vân'],
      executors: [
        { id: 'e1', name: 'Trần Thu Hà', status: 'IN_PROGRESS' },
        { id: 'e2', name: 'Lê Thanh Vân', status: 'IN_PROGRESS' },
      ],
      steps: [
        {
          id: 'step-1',
          step_order: 1,
          role: 'CREATOR',
          status: 'COMPLETED',
          name: 'Khởi tạo phiếu',
          actor_name: 'Nguyễn Minh Anh',
        },
        {
          id: 'step-2',
          step_order: 2,
          role: 'EXECUTOR',
          status: 'IN_PROGRESS',
          name: 'Triển khai công việc',
          actor_name: 'Trần Thu Hà',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={dispatchTicketAsCreator}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Người tạo triển khai xem chi tiết phiếu
    expect(screen.getByText('Chi tiết phiếu')).toBeInTheDocument();

    // Tuyệt đối không có nút "Hoàn thành"
    const completeBtn = screen.queryByRole('button', { name: /^Hoàn thành$/i });
    expect(completeBtn).toBeNull();
  });

  it('người thực hiện (không phải người tạo) trên phiếu IN_PROGRESS sẽ có nút Hoàn thành', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    // User hiện tại là Nguyễn Minh Anh đóng vai trò executor được giao việc bởi Trần Văn Nam
    const dispatchTicketAsExecutor: CalendarEvent = {
      id: 'task-dispatch-2',
      title: 'Xử lý dữ liệu biên tập',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Trần Văn Nam',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'IN_PROGRESS',
      isUserParticipant: true,
      participants: ['Nguyễn Minh Anh'],
      executors: [
        { id: 'e1', name: 'Nguyễn Minh Anh', status: 'IN_PROGRESS' },
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
        {
          id: 'step-2',
          step_order: 2,
          role: 'EXECUTOR',
          status: 'IN_PROGRESS',
          name: 'Triển khai công việc',
          actor_name: 'Nguyễn Minh Anh',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={dispatchTicketAsExecutor}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Người thực hiện có nút "Hoàn thành"
    const completeBtn = screen.getByRole('button', { name: /^Hoàn thành$/i });
    expect(completeBtn).toBeInTheDocument();
  });
});
