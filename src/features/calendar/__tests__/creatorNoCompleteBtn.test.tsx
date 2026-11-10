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

  it('người tạo kiêm người thực hiện trên phiếu IN_PROGRESS sẽ có nút Hoàn thành', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    // User hiện tại là Nguyễn Minh Anh vừa là người tạo vừa là người thực hiện
    const dispatchTicketCreatorAsExecutor: CalendarEvent = {
      id: 'task-dispatch-3',
      title: 'Tổ chức buổi giao lưu trực tuyến cùng bạn đọc về An toàn thông tin số 2026',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'IN_PROGRESS',
      isUserParticipant: true,
      participants: ['Nguyễn Minh Anh', 'Trần Thu Hà'],
      executors: [
        { id: 'e1', name: 'Nguyễn Minh Anh', status: 'IN_PROGRESS' },
        { id: 'e2', name: 'Trần Thu Hà', status: 'IN_PROGRESS' },
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
          actor_name: 'Nguyễn Minh Anh',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={dispatchTicketCreatorAsExecutor}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Người tạo kiêm người thực hiện có nút "Hoàn thành"
    const completeBtn = screen.getByRole('button', { name: /^Hoàn thành$/i });
    expect(completeBtn).toBeInTheDocument();
  });

  it('người thực hiện đã hoàn thành phần việc (status COMPLETED) trên phiếu IN_PROGRESS sẽ KHÔNG còn nút Hoàn thành', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    // User Nguyễn Minh Anh là 1 trong các executor và đã hoàn thành phần việc của mình
    const dispatchTicketUserCompleted: CalendarEvent = {
      id: 'task-dispatch-completed-me',
      title: 'Triển khai tuyến bài ảnh: Không gian kiến trúc xanh và phát triển đô thị bền vững TP.HCM',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Hoàng Điệp (Trưởng ban Văn hóa)',
      startAt: '2026-11-04T17:30:00Z',
      endAt: '2026-11-04T17:30:00Z',
      approvalStatus: 'IN_PROGRESS',
      isUserParticipant: true,
      participants: ['Nguyễn Minh Anh', 'Đỗ Quang Huy', 'Hoàng Điệp'],
      executors: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', role: 'Phóng viên ảnh chính', status: 'COMPLETED', completed_at: '2026-11-04T13:40:00Z' },
        { id: 'user-104', name: 'Đỗ Quang Huy', role: 'Phóng viên phối hợp', status: 'IN_PROGRESS' },
        { id: 'user-105', name: 'Hoàng Điệp', role: 'Chỉ đạo tuyến bài', status: 'IN_PROGRESS' },
      ],
      steps: [
        {
          id: 'step-1',
          step_order: 1,
          role: 'CREATOR',
          status: 'COMPLETED',
          name: 'Khởi tạo phiếu',
          actor_name: 'Hoàng Điệp',
        },
        {
          id: 'step-2',
          step_order: 2,
          role: 'EXECUTOR',
          status: 'IN_PROGRESS',
          name: 'Triển khai',
          actor_name: 'Nguyễn Minh Anh',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={dispatchTicketUserCompleted}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Xác nhận mở được modal
    expect(screen.getByText('Chi tiết phiếu')).toBeInTheDocument();

    // Người dùng đã hoàn thành phần việc -> Tuyệt đối không hiển thị nút "Hoàn thành"
    const completeBtn = screen.queryByRole('button', { name: /^Hoàn thành$/i });
    expect(completeBtn).toBeNull();
  });
});
