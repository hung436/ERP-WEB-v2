import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AuthProvider } from '@/features/auth/AuthContext';
import { calendarApi } from '@/services/api';
import type { CalendarEvent } from '@/types/domain';

import { CalendarEventDetailModal } from '../components/CalendarEventDetailModal';
import { normalizeMeeting } from '../calendarWeekUtils';

describe('Task and Event Leader & Meeting Link Rules', () => {
  it('phiếu công việc (TASK) KHÔNG bao giờ hiển thị Phòng họp trực tuyến và Chủ trì trong modal chi tiết', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    const taskEvent: CalendarEvent = {
      id: 'task-test-no-meet-1',
      title: 'Đề xuất kinh phí thuê bao phần mềm AI',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'PROPOSAL',
      scope: 'personal',
      organizer: 'Trần Thu Hà',
      leader: 'Trần Thu Hà',
      meetingUrl: 'https://meeting.tuoitre.vn/phong-test-123',
      startAt: '2026-11-05T16:30:00Z',
      endAt: '2026-11-05T16:30:00Z',
      approvalStatus: 'PENDING',
      participants: ['Trần Thu Hà', 'Nguyễn Minh Anh'],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={taskEvent}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
        />
      </AuthProvider>
    );

    // Không được xuất hiện "Phòng họp trực tuyến"
    expect(screen.queryByText(/Phòng họp trực tuyến/i)).not.toBeInTheDocument();

    // Không được xuất hiện "Chủ trì"
    expect(screen.queryByText(/^Chủ trì$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Chủ trì:/i)).not.toBeInTheDocument();
  });

  it('normalizeMeeting tự động triệt tiêu meetingUrl và leader cho ticketType là TASK hoặc EVENT', () => {
    const rawTask = {
      id: 'test-raw-task',
      title: 'Phiếu kiểm tra',
      ticketType: 'TASK',
      startAt: '2026-11-05T10:00:00Z',
      leader: 'Trần Thu Hà',
      meetingUrl: 'https://meeting.tuoitre.vn/room-abc',
      location: 'Tòa soạn',
    };

    const normalized = normalizeMeeting(rawTask);
    expect(normalized).not.toBeNull();
    expect(normalized?.ticketType).toBe('TASK');
    expect(normalized?.leader).toBeUndefined();
    expect(normalized?.meetingUrl).toBe('');
  });

  it('mockApi.createEvent và addComment cho TASK không tự sinh meetingUrl hoặc leader', async () => {
    const created = await calendarApi.create({
      title: 'Phiếu nhiệm vụ nội bộ mới',
      ticketType: 'TASK',
      startAt: '2026-11-05T14:00:00Z',
    });

    expect(created.data.ticketType).toBe('TASK');
    expect(created.data.meetingUrl).toBeUndefined();
    expect(created.data.leader).toBeUndefined();

    // Thêm bình luận vào phiếu mới tạo
    const updated = await calendarApi.addComment(
      created.data.id,
      'Tin nhắn trao đổi công việc mới trên phiếu'
    );

    expect(updated.data.ticketType).toBe('TASK');
    expect(updated.data.meetingUrl).toBeUndefined();
    expect(updated.data.leader).toBeUndefined();
  });
});
