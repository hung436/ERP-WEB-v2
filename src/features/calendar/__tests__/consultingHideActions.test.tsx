import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AuthProvider } from '@/features/auth/AuthContext';
import type { CalendarEvent } from '@/types/domain';

import { CalendarEventDetailModal } from '../components/CalendarEventDetailModal';

describe('CalendarEventDetailModal - Đang lấy ý kiến ẩn các action', () => {
  it('Khi đang lấy ý kiến từ người khác (có consultants pending), Người duyệt sẽ KHÔNG thấy các action (ẩn action duyệt/không duyệt/lấy ý kiến)', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();

    // User hiện tại là Nguyễn Minh Anh (đóng vai trò Approver), đang lấy ý kiến của TS. Trần Quốc Hùng
    const ticketConsulting: CalendarEvent = {
      id: 'task-consulting-1',
      title: 'Đề xuất tuyến bài điều tra 5 kỳ',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Lê Văn Tuấn',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'PENDING',
      isUserParticipant: false,
      approvers: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', status: 'PENDING' },
      ],
      consultants: [
        { id: 'c-1', name: 'TS. Trần Quốc Hùng', status: 'PENDING' },
      ],
      steps: [
        {
          id: 'step-1',
          step_order: 1,
          role: 'CREATOR',
          status: 'COMPLETED',
          name: 'Khởi tạo phiếu',
          actor_name: 'Lê Văn Tuấn',
        },
        {
          id: 'step-2',
          step_order: 2,
          role: 'APPROVER',
          status: 'CONSULTING',
          note: 'Đang lấy ý kiến: TS. Trần Quốc Hùng',
          name: 'Duyệt phiếu',
          actor_name: 'Nguyễn Minh Anh',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={ticketConsulting}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Kiểm tra hiển thị chi tiết phiếu
    expect(screen.getByText('Chi tiết phiếu')).toBeInTheDocument();

    // Ẩn toàn bộ action: Không có nút Duyệt phiếu, Không duyệt, Lấy ý kiến
    expect(screen.queryByRole('button', { name: /Duyệt phiếu/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Không duyệt/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Lấy ý kiến/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Gửi ý kiến/i })).toBeNull();

    // Cụm action bar xử lý phải không tồn tại
    expect(screen.queryByRole('group', { name: /Thao tác xử lý/i })).toBeNull();
  });

  it('Khi chính user là Người được lấy ý kiến, sẽ hiển thị nút Gửi ý kiến nhưng ẩn Duyệt phiếu và Không duyệt', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();

    // User hiện tại là Nguyễn Minh Anh (được lấy ý kiến bởi Lãnh đạo Đạt)
    const ticketAsConsultee: CalendarEvent = {
      id: 'task-consulting-2',
      title: 'Tham vấn chuyên môn đề án đổi mới',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Trần Thu Hà',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'PENDING',
      isUserParticipant: true,
      approvers: [
        { id: 'user-107', name: 'Đ/c Nguyễn Tấn Đạt', status: 'PENDING' },
      ],
      consultants: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', status: 'PENDING' },
      ],
      steps: [
        {
          id: 'step-1',
          step_order: 1,
          role: 'CREATOR',
          status: 'COMPLETED',
          name: 'Khởi tạo phiếu',
          actor_name: 'Trần Thu Hà',
        },
        {
          id: 'step-2',
          step_order: 2,
          role: 'APPROVER',
          status: 'CONSULTING',
          name: 'Lấy ý kiến & Duyệt phiếu',
          actor_name: 'Đ/c Nguyễn Tấn Đạt',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={ticketAsConsultee}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Phải có nút Gửi ý kiến dành riêng cho người được tham vấn
    expect(screen.getByRole('button', { name: /Gửi ý kiến/i })).toBeInTheDocument();

    // Tuyệt đối không có các action của Người duyệt
    expect(screen.queryByRole('button', { name: /Duyệt phiếu/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Không duyệt/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Lấy ý kiến/i })).toBeNull();
  });

  it('Khi tất cả người được lấy ý kiến đã hoàn thành, Người duyệt sẽ thấy lại action Duyệt phiếu và Không duyệt', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();

    // TS. Trần Quốc Hùng đã gửi ý kiến xong (status = COMPLETED)
    const ticketConsultFinished: CalendarEvent = {
      id: 'task-consulting-3',
      title: 'Đề xuất tuyến bài điều tra 5 kỳ',
      type: 'event',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Lê Văn Tuấn',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'PENDING',
      isUserParticipant: false,
      approvers: [
        { id: 'user-001', name: 'Nguyễn Minh Anh', status: 'PENDING' },
      ],
      consultants: [
        { id: 'c-1', name: 'TS. Trần Quốc Hùng', status: 'COMPLETED', reply: 'Đồng ý với đề cương.' },
      ],
      steps: [
        {
          id: 'step-1',
          step_order: 1,
          role: 'CREATOR',
          status: 'COMPLETED',
          name: 'Khởi tạo phiếu',
          actor_name: 'Lê Văn Tuấn',
        },
        {
          id: 'step-2',
          step_order: 2,
          role: 'APPROVER',
          status: 'PENDING',
          name: 'Duyệt phiếu',
          actor_name: 'Nguyễn Minh Anh',
        },
      ],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={ticketConsultFinished}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Sau khi có ý kiến đầy đủ, Người duyệt thấy lại action Duyệt phiếu & Không duyệt
    expect(screen.getByRole('button', { name: /Duyệt phiếu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Không duyệt/i })).toBeInTheDocument();
  });
});
