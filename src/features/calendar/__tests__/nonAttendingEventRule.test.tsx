import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import dayjs from 'dayjs';

import type { CalendarEvent } from '@/types/domain';
import { AuthProvider } from '@/features/auth/AuthContext';
import { CalendarEventDetailModal } from '../components/CalendarEventDetailModal';
import { CalendarEventCard } from '../components/CalendarEventCard';
import { normalizeMeeting } from '../calendarWeekUtils';

describe('Quy tắc sự kiện không tham gia (Không tham gia vẫn còn ở lịch, chỉ là không mở chi tiết được)', () => {
  it('Khi bấm Không tham gia trên phiếu: Cập nhật sự kiện thành không tham gia, KHÔNG xóa khỏi lịch', async () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();

    const taskEvent: CalendarEvent = {
      id: 'task-test-non-attend-1',
      title: 'Phiếu công việc thử nghiệm kiểm tra tính năng không tham gia',
      type: 'work',
      ticketType: 'TASK',
      workflowType: 'DISPATCH',
      scope: 'personal',
      organizer: 'Lê Văn Tuấn',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T11:00:00Z',
      approvalStatus: 'IN_PROGRESS',
      isUserParticipant: true,
      executors: [{ id: 'user-001', name: 'Nguyễn Minh Anh', status: 'IN_PROGRESS' }],
      participants: ['Nguyễn Minh Anh', 'Lê Văn Tuấn'],
    };

    render(
      <AuthProvider>
        <CalendarEventDetailModal
          event={taskEvent}
          open={true}
          onClose={handleClose}
          onUpdateEvent={handleUpdate}
          onDeleteEvent={handleDelete}
        />
      </AuthProvider>
    );

    // Tìm nút Không tham gia trên thanh header drawer
    const leaveBtns = screen.getAllByRole('button', { name: /^Không tham gia$/i });
    expect(leaveBtns.length).toBeGreaterThan(0);
    fireEvent.click(leaveBtns[0]);

    // Modal confirm hiển thị nút xác nhận "Không tham gia" trong .ant-modal-confirm-btns
    await waitFor(() => {
      const confirmContainer = document.querySelector('.ant-modal-confirm-btns');
      expect(confirmContainer).toBeInTheDocument();
    });

    const confirmContainer = document.querySelector('.ant-modal-confirm-btns') as HTMLElement;
    const confirmBtn = within(confirmContainer).getByRole('button', { name: /^Không tham gia$/i });
    fireEvent.click(confirmBtn);

    // Chờ xử lý: onUpdateEvent được gọi (chứ KHÔNG gọi onDeleteEvent)
    await waitFor(
      () => {
        expect(handleUpdate).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    expect(handleDelete).not.toHaveBeenCalled();

    const updatedArg = handleUpdate.mock.calls[0][0] as CalendarEvent;
    expect(updatedArg.isUserParticipant).toBe(false);
    expect(updatedArg.isDeclined).toBe(true);
    expect(updatedArg.executors?.some((e) => e.name === 'Nguyễn Minh Anh')).toBe(false);
  });

  it('Thẻ sự kiện không tham gia: Vẫn hiển thị trên lịch nhưng click KHÔNG mở chi tiết (cursor default, không gọi onSelectEvent)', () => {
    const handleSelect = vi.fn();

    const nonAttendingEvent: CalendarEvent = {
      id: 'event-non-attend-2',
      title: 'Họp ban biên tập chuyên đề số hóa',
      type: 'meeting',
      ticketType: 'MEETING',
      scope: 'editorial',
      organizer: 'Ban Biên tập',
      startAt: dayjs().hour(10).minute(0).toISOString(),
      endAt: dayjs().hour(11).minute(30).toISOString(),
      isUserParticipant: false,
      isUserWatcher: false,
      approvalStatus: 'SCHEDULED',
    };

    render(
      <CalendarEventCard
        event={nonAttendingEvent}
        onSelectEvent={handleSelect}
      />
    );

    // Thẻ vẫn hiển thị trên lịch
    const cardTitles = screen.getAllByText('Họp ban biên tập chuyên đề số hóa');
    expect(cardTitles.length).toBeGreaterThan(0);

    const cardElement = screen.getByLabelText('Họp ban biên tập chuyên đề số hóa');
    expect(cardElement).toHaveStyle({ cursor: 'default' });

    // Click vào thẻ
    fireEvent.click(cardElement);

    // KHÔNG được mở chi tiết
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('normalizeMeeting nhận diện đúng trạng thái isDeclined và isUserParticipant: false', () => {
    const raw = {
      id: 'declined-item-1',
      title: 'Phiếu đã chọn không tham gia',
      startAt: '2026-11-05T09:00:00Z',
      endAt: '2026-11-05T10:00:00Z',
      ticketType: 'TASK',
      scope: 'personal',
      isDeclined: true,
      isUserParticipant: true, // dù trước đó có true nhưng khi đã declined thì phải false
      executors: [{ id: 'user-001', name: 'Nguyễn Minh Anh' }],
    };

    const normalized = normalizeMeeting(raw, 'user-001');
    expect(normalized).not.toBeNull();
    expect(normalized!.isUserParticipant).toBe(false);
    expect(normalized!.isUserWatcher).toBe(false);
  });
});
