import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/App';

function renderCalendarWeek(path = '/calendar/week?date=2026-10-05') {
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.sessionStorage.setItem('erp-session', 'mock-token');
  const todayKey = `tuoitre_bday_welcomed_user-001_${new Date().toDateString()}`;
  window.sessionStorage.setItem(todayKey, 'true');
  window.sessionStorage.setItem('birthday_modal_shown_user-001', 'true');
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('Tái cấu trúc UX/UI Lịch làm việc tuần (7 Tasks Overhaul)', () => {
  it('Task 1: Không còn nút "Hôm nay" trên thanh điều hướng tuần', async () => {
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Nút "Hôm nay" trên thanh điều hướng tuần đã được loại bỏ
    expect(screen.queryByRole('button', { name: /^Hôm nay$/i })).not.toBeInTheDocument();
  });

  it('Task 2: Đổi "Ban biên tập / Cá nhân" thành "Lịch chung / Lịch cá nhân"', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Có nút "Lịch chung" và "Lịch cá nhân"
    const lichChungBtn = screen.getByRole('button', { name: 'Lịch chung' });
    const lichCaNhanBtn = screen.getByRole('button', { name: 'Lịch cá nhân' });

    expect(lichChungBtn).toBeInTheDocument();
    expect(lichCaNhanBtn).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ban biên tập' })).not.toBeInTheDocument();

    // Tương tác toggle hoạt động chuẩn
    expect(lichChungBtn).toHaveAttribute('aria-pressed', 'true');
    await user.click(lichChungBtn);
    expect(lichChungBtn).toHaveAttribute('aria-pressed', 'false');
    await user.click(lichChungBtn);
    expect(lichChungBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('Task 4: Hạn chế tối đa dấu 3 chấm trong văn bản và placeholder', async () => {
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Không còn dấu 3 chấm trong placeholder tìm kiếm
    const searchInput = screen.queryByPlaceholderText(/Tìm kiếm công việc, lịch họp, sự kiện/i);
    if (searchInput) {
      expect(searchInput).not.toHaveAttribute('placeholder', expect.stringContaining('...'));
    }

    // Không còn nhãn 'Đang tải lịch họp...' với 3 chấm
    expect(screen.queryByText('Đang tải lịch họp...')).not.toBeInTheDocument();
  });

  it('Task 7: Item Card bỏ background màu, bỏ tag loại, có chấm tròn status trước giờ và chấm vàng góc phải khi điều chỉnh', async () => {
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // 1. Thẻ có chấm tròn trạng thái trước giờ
    const statusDots = document.querySelectorAll('.booking-week-status-dot');
    expect(statusDots.length).toBeGreaterThan(0);

    // 2. Thẻ có chấm vàng điều chỉnh góc phải cho các sự kiện điều chỉnh
    const adjustedDots = document.querySelectorAll('.booking-week-adjusted-dot');
    expect(adjustedDots.length).toBeGreaterThan(0);

    // 3. Không có thẻ tag loại dạng text trên Item Card
    expect(document.querySelectorAll('.card-status-badge.meeting')).toHaveLength(0);
    expect(document.querySelectorAll('.card-status-badge.task')).toHaveLength(0);
  });

  it('Task 5, 3 & 6: Click vào thẻ mở Drawer xem nhanh, có nút Xem chi tiết mở tab mới', async () => {
    const user = userEvent.setup();
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Click vào một sự kiện để mở Drawer xem nhanh (không dùng popover hover)
    const eventCards = screen.getAllByText('Chào cờ đầu tuần');
    expect(eventCards.length).toBeGreaterThan(0);
    await user.click(eventCards[0]);

    // Drawer xem nhanh mở ra
    await waitFor(() => {
      expect(screen.getByText(/Thảo luận/i)).toBeInTheDocument();
    });

    // Tag "Lịch chung" xuất hiện trên Toolbar và trên Drawer (Task 2)
    expect(screen.getAllByText('Lịch chung').length).toBeGreaterThanOrEqual(2);

    // Nút "Xem chi tiết" mở tab mới (Task 3 & 6)
    const detailBtn = screen.getByRole('button', { name: /Xem chi tiết/i });
    expect(detailBtn).toBeInTheDocument();
    await user.click(detailBtn);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/calendar\/events\//),
      '_blank'
    );

    windowOpenSpy.mockRestore();
  });

  it('Phân biệt Card có tôi tham gia bằng cách tô màu đỏ ở phần thời gian (#D92D20)', async () => {
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Sự kiện có user tham gia (vd: "Chào cờ đầu tuần" bbt-01 có isUserParticipant: true)
    // Phần thời gian có class 'is-attending-time' và style color đỏ #D92D20
    const attendingTimes = document.querySelectorAll('.booking-week-card-time.is-attending-time');
    expect(attendingTimes.length).toBeGreaterThan(0);
    const firstAttendingTime = attendingTimes[0] as HTMLElement;
    expect(firstAttendingTime.style.color).toBe('rgb(217, 45, 32)'); // #D92D20

    // Sự kiện không có user tham gia (vd: "Họp Ban Biên tập" bbt-02 có isUserParticipant: false)
    const nonAttendingTimes = document.querySelectorAll('.booking-week-card-time:not(.is-attending-time)');
    expect(nonAttendingTimes.length).toBeGreaterThan(0);
    const firstNonAttending = nonAttendingTimes[0] as HTMLElement;
    expect(firstNonAttending.style.color).toBe('rgb(71, 84, 103)'); // #475467
  });

  it('Chuẩn hóa thời gian trên thẻ: Chỉ có 1 mốc thời gian duy nhất (HH:mm), không có dải thời gian', async () => {
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    const timeElements = document.querySelectorAll('.booking-week-card-time');
    expect(timeElements.length).toBeGreaterThan(0);

    timeElements.forEach((el) => {
      const text = el.textContent?.trim() || '';
      // Phải định dạng HH:mm đúng 1 mốc thời gian duy nhất
      expect(text).toMatch(/^\d{2}:\d{2}$/);
      expect(text).not.toContain('–');
      expect(text).not.toContain('-');
    });
  });
});
