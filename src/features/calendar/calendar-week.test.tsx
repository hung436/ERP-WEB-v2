import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '@/App';

dayjs.extend(isoWeek);

function renderCalendarWeek(path = '/calendar/week?date=2026-10-05') {
  window.sessionStorage.clear();
  window.sessionStorage.setItem('erp-session', 'mock-token');
  window.sessionStorage.setItem('birthday_modal_shown_user-001', 'true');
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('Lịch làm việc theo tuần (Google Calendar style)', () => {
  it('hiển thị đầy đủ thanh điều hướng tuần, bộ lọc và các cột ngày', async () => {
    renderCalendarWeek('/calendar/week');

    expect(await screen.findByText(/Tuần 41/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Tạo lịch họp$/i })).toBeInTheDocument();

    // 3 Filter Chips ở Cụm Giữa
    expect(screen.getByText('Ban biên tập')).toBeInTheDocument();
    expect(screen.getByText('Cá nhân')).toBeInTheDocument();
    expect(screen.getByText('Chỉ hiện lịch có mặt tôi')).toBeInTheDocument();
    expect(screen.getAllByText('Tham gia').length).toBeGreaterThan(0);

    // Các ngày trong tuần
    expect(screen.getAllByText('Thứ Hai').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thứ Ba').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thứ Tư').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thứ Năm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thứ Sáu').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thứ Bảy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chủ Nhật').length).toBeGreaterThan(0);
  });

  it('sự kiện BBT mà user tham gia được highlight và có thể click mở modal chi tiết kèm tệp đính kèm và bình luận', async () => {
    const user = userEvent.setup();
    renderCalendarWeek('/calendar/week');

    await screen.findByText(/Tuần 41/i);

    // Chào cờ đầu tuần là sự kiện user tham gia
    const attendingEvent = await screen.findByText('Chào cờ đầu tuần');
    expect(attendingEvent).toBeInTheDocument();

    // Click vào sự kiện để mở modal
    await user.click(attendingEvent);

    // Kiểm tra nội dung modal chi tiết mở ra
    expect(await screen.findByText('Thong-bao-chao-co-dau-tuan-thang-10.pdf')).toBeInTheDocument();
    expect(screen.getByText(/Tài liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/Thảo luận/i)).toBeInTheDocument();
    expect(screen.getByText('Đính kèm')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Viết trao đổi/i)).toBeInTheDocument();
    expect(screen.getByText('Đề nghị các ban có mặt đúng 7g40 để ổn định vị trí.')).toBeInTheDocument();
  });

  it('mở modal Tạo lịch họp với đầy đủ các trường và tính năng đính kèm tệp', async () => {
    const user = userEvent.setup();
    renderCalendarWeek('/calendar/week');

    await screen.findByText(/Tuần 41/i);
    await user.click(screen.getByRole('button', { name: /^Tạo lịch họp$/i }));

    // Kiểm tra modal tạo cuộc họp hiển thị
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
    expect(screen.getByText('Thời gian')).toBeInTheDocument();
    expect(screen.getByText('Thành phần tham gia')).toBeInTheDocument();
    expect(screen.getByText('Địa điểm')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu')).toBeInTheDocument();
    expect(screen.getByText('Chọn tệp')).toBeInTheDocument();
    expect(screen.getByText('Nội dung')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Tạo$/i })).toBeInTheDocument();
  });

  it('bật tắt bộ lọc qua Filter Chips đồng nhất', async () => {
    const user = userEvent.setup();
    renderCalendarWeek('/calendar/week');

    await screen.findByText(/Tuần 41/i);
    const editorialChip = screen.getByRole('button', { name: /Ban biên tập/i });
    expect(editorialChip).toHaveAttribute('aria-pressed', 'true');

    await user.click(editorialChip);
    expect(editorialChip).toHaveAttribute('aria-pressed', 'false');

    await user.click(editorialChip);
    expect(editorialChip).toHaveAttribute('aria-pressed', 'true');
  });

  it('không hiển thị tag Chỉ xem và dòng thông báo Chỉ xem thông tin', async () => {
    renderCalendarWeek('/calendar/week');
    await screen.findByText(/Tuần 41/i);

    expect(screen.queryByText('Chỉ xem')).not.toBeInTheDocument();
    expect(screen.queryByText(/Không thuộc thành phần tham dự/i)).not.toBeInTheDocument();
  });

  it('cho phép bấm icon ngôi sao Quan tâm trên lịch chỉ xem và hiển thị thông báo nhắc nhở 15 phút', async () => {
    const user = userEvent.setup();
    renderCalendarWeek('/calendar/week');
    await screen.findByText(/Tuần 41/i);

    const starButtons = screen.getAllByRole('button', { name: /Quan tâm lịch họp/i });
    expect(starButtons.length).toBeGreaterThan(0);

    await user.click(starButtons[0]);
    expect(await screen.findByText(/Bạn sẽ được nhắc nhở trước 15 phút/i)).toBeInTheDocument();
  });

  it('hiển thị thông tin người trực và các ca trực tòa soạn cho từng ngày trong tuần', async () => {
    const user = userEvent.setup();
    renderCalendarWeek('/calendar/week');
    await screen.findByText(/Tuần 41/i);

    // Người trực ban Thứ Hai
    expect(screen.getByText('Anh Hoàng Nguyên')).toBeInTheDocument();

    // Mặc định đóng ca trực, click mở rộng các ca trực
    const toggleButtons = screen.getAllByRole('button', { name: /Mở rộng các ca trực/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
    await user.click(toggleButtons[0]);

    // Các ca trực hiển thị trên cột Thứ Hai
    expect(screen.getAllByText('Ca 0:').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ca 1:').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ca 2:').length).toBeGreaterThan(0);
    expect(screen.getByText(/Đà Trang/i)).toBeInTheDocument();
    expect(screen.getByText(/Viễn Sự, N.V.Hải/i)).toBeInTheDocument();
  });

  it('hiển thị tag Đã điều chỉnh cho các sự kiện có lịch điều chỉnh', async () => {
    const user = userEvent.setup();
    renderCalendarWeek('/calendar/week');
    await screen.findByText(/Tuần 41/i);

    // Có các tag Đã điều chỉnh trên giao diện tuần
    const adjustedBadges = await screen.findAllByText('Đã điều chỉnh');
    expect(adjustedBadges.length).toBeGreaterThan(0);

    // Click vào sự kiện có điều chỉnh mà user tham gia (Họp giao ban phóng viên)
    const adjustedAttendingEvent = screen.getByText('Họp giao ban phóng viên');
    await user.click(adjustedAttendingEvent);

    // Trong modal chi tiết hiển thị banner thông tin điều chỉnh
    expect(await screen.findByText(/Lưu ý điều chỉnh:/i)).toBeInTheDocument();
    expect(screen.getByText(/Thay đổi địa điểm sang Hội trường HTT2/i)).toBeInTheDocument();
  });

  it('mặc định hiển thị tuần đang hiện hành khi mở module', async () => {
    renderCalendarWeek('/calendar/week');
    const currentWeekNumber = dayjs().isoWeek();
    expect(await screen.findByText(new RegExp(`Tuần ${currentWeekNumber}`, 'i'))).toBeInTheDocument();
  });
});

