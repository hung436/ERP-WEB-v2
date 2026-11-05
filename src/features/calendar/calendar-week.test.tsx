import dayjs, { extend } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { App } from '@/App';

extend(isoWeek);

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

describe('Lịch làm việc theo tuần (Google Calendar style)', () => {
  it('hiển thị đầy đủ thanh điều hướng tuần, bộ lọc và các cột ngày', async () => {
    renderCalendarWeek();

    expect(await screen.findByText(/Tuần 41/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Tạo$/i })).toBeInTheDocument();

    // 3 Filter Chips ở Cụm Giữa
    expect(screen.getByText('Lịch chung')).toBeInTheDocument();
    expect(screen.getAllByText('Lịch cá nhân').length).toBeGreaterThan(0);
    expect(screen.getByText('Chỉ hiện lịch có mặt tôi')).toBeInTheDocument();
    // Task 7: Thay tag loại bằng chấm tròn trạng thái trên thẻ
    await waitFor(() => {
      expect(document.querySelectorAll('.booking-week-status-dot').length).toBeGreaterThan(0);
    });

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
    renderCalendarWeek();

    await screen.findByText(/Tuần 41/i);

    // Chào cờ đầu tuần là sự kiện user tham gia
    const attendingEvent = (await screen.findAllByText('Chào cờ đầu tuần'))[0];
    expect(attendingEvent).toBeInTheDocument();

    // Click vào sự kiện để mở modal
    await user.click(attendingEvent);

    // Kiểm tra nội dung modal chi tiết mở ra (tệp hiển thị ở mục Tài liệu và Timeline trao đổi)
    const fileItems = await screen.findAllByText('Thong-bao-chao-co-dau-tuan-thang-10.pdf');
    expect(fileItems.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tài liệu/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Thảo luận/i)).toBeInTheDocument();
    expect(screen.getByText('Đính kèm')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nhập nội dung trao đổi/i)).toBeInTheDocument();
    expect(screen.getByText('Đề nghị các ban có mặt đúng 7g40 để ổn định vị trí.')).toBeInTheDocument();
  });

  it('mở modal Tạo lịch họp với đầy đủ các trường và tính năng đính kèm tệp', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();

    await screen.findByText(/Tuần 41/i);
    await user.click(screen.getByRole('button', { name: /^Tạo$/i }));

    // Khi mở popup chọn loại phiếu theo chuẩn Booking / Job-Ticket, chọn option "Lịch họp"
    const dialogs = await screen.findAllByRole('dialog');
    const meetingTypeBtn = within(dialogs[0]).queryByRole('button', { name: /Lịch họp/i });
    if (meetingTypeBtn) {
      await user.click(meetingTypeBtn);
    }

    // Kiểm tra modal tạo cuộc họp hiển thị (đã bỏ trường Tiêu đề, chỉ giữ Nội dung)
    expect((await screen.findAllByRole('dialog')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Tiêu đề')).not.toBeInTheDocument();
    expect(screen.getByText('Thời gian')).toBeInTheDocument();
    expect(screen.getByText('Thành phần tham gia')).toBeInTheDocument();
    expect(screen.getByText('Địa điểm')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu')).toBeInTheDocument();
    expect(screen.getByText('Chọn tệp')).toBeInTheDocument();
    expect(screen.getByText('Nội dung')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Tạo/i })).toBeInTheDocument();
  }, 40000);

  it('bật tắt bộ lọc qua Filter Chips đồng nhất', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();

    await screen.findByText(/Tuần 41/i);
    const editorialChip = screen.getByRole('button', { name: 'Lịch chung' });
    expect(editorialChip).toHaveAttribute('aria-pressed', 'true');

    await user.click(editorialChip);
    expect(editorialChip).toHaveAttribute('aria-pressed', 'false');

    await user.click(editorialChip);
    expect(editorialChip).toHaveAttribute('aria-pressed', 'true');
  }, 45000);

  it('không hiển thị tag Chỉ xem và dòng thông báo Chỉ xem thông tin', async () => {
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    expect(screen.queryByText('Chỉ xem')).not.toBeInTheDocument();
    expect(screen.queryByText(/Không thuộc thành phần tham dự/i)).not.toBeInTheDocument();
  }, 45000);

  it('cho phép bấm icon ngôi sao Quan tâm trên lịch chỉ xem và hiển thị thông báo nhắc nhở 15 phút', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    const starButtons = screen.getAllByRole('button', { name: /Quan tâm lịch họp/i });
    expect(starButtons.length).toBeGreaterThan(0);

    await user.click(starButtons[0]);
    expect(await screen.findByText(/Bạn sẽ được nhắc nhở trước 15 phút/i)).toBeInTheDocument();
  }, 45000);

  it('hiển thị thông tin người trực và các ca trực tòa soạn cho từng ngày trong tuần', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Người trực ban Thứ Hai
    expect((await screen.findAllByText('Anh Hoàng Nguyên')).length).toBeGreaterThan(0);

    // Chuyển sang dạng ngang Timeline để tương tác với các ca trực mở rộng
    const timelineBtn = screen.getByRole('button', { name: /Xem dạng ngang theo dòng thời gian/i });
    await user.click(timelineBtn);

    // Mặc định đóng ca trực, click mở rộng các ca trực
    const toggleButtons = screen.getAllByRole('button', { name: /Mở rộng các ca trực/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
    await user.click(toggleButtons[0]);

    // Các ca trực hiển thị trên cột Thứ Hai
    expect(screen.getAllByText('Ca 0:').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ca 1:').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ca 2:').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Đà Trang/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Viễn Sự, N.V.Hải/i).length).toBeGreaterThan(0);
  }, 45000);

  it('hiển thị chấm vàng Đã điều chỉnh cho các sự kiện có lịch điều chỉnh', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Task 7: Có chấm vàng Đã điều chỉnh trên giao diện tuần
    await waitFor(() => {
      expect(document.querySelectorAll('.booking-week-adjusted-dot').length).toBeGreaterThan(0);
    });

    // Click vào sự kiện có điều chỉnh mà user tham gia (Họp giao ban phóng viên)
    const adjustedAttendingEvent = screen.getAllByText('Họp giao ban phóng viên')[0];
    await user.click(adjustedAttendingEvent);

    // Trong modal chi tiết hiển thị banner thông tin điều chỉnh
    expect(await screen.findByText(/Lưu ý điều chỉnh:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Thay đổi địa điểm sang Hội trường HTT2/i)[0]).toBeInTheDocument();
  }, 45000);

  it('mặc định hiển thị tuần đang hiện hành khi mở module', async () => {
    // Gọi trực tiếp route không có param ?date để kiểm tra mặc định tuần hiện hành
    window.sessionStorage.clear();
    window.sessionStorage.setItem('erp-session', 'mock-token');
    const todayKey = `tuoitre_bday_welcomed_user-001_${new Date().toDateString()}`;
    window.sessionStorage.setItem(todayKey, 'true');
    window.sessionStorage.setItem('birthday_modal_shown_user-001', 'true');
    window.history.pushState({}, '', '/calendar/week');
    render(<App />);
    const currentWeekNumber = dayjs().isoWeek();
    expect(await screen.findByText(new RegExp(`Tuần ${currentWeekNumber}`, 'i'))).toBeInTheDocument();
  }, 45000);

  it('hiển thị drawer danh sách sự kiện trong ngày khi bấm vào một ngày trong tuần', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Bấm vào header ngày Thứ Hai
    const mondayBtn = screen.getByRole('button', { name: /Xem danh sách lịch ngày Thứ Hai/i });
    await user.click(mondayBtn);

    // Mở drawer xem lịch trong ngày
    expect((await screen.findAllByText(/Trực:/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Tạo/i }).length).toBeGreaterThan(0);
  }, 45000);

  it('hỗ trợ responsive với nút Bộ lọc thu gọn mở popover đầy đủ các nhóm lọc', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();
    await screen.findByText(/Tuần 41/i);

    // Nút Bộ lọc thu gọn
    const filterBtn = screen.getByRole('button', { name: /Bộ lọc lịch/i });
    expect(filterBtn).toBeInTheDocument();

    // Click mở popover
    await user.click(filterBtn);

    // Nguồn lịch Ban biên tập & Cá nhân luôn ở ngoài thanh công cụ
    expect(screen.getByRole('button', { name: 'Lịch chung' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lịch cá nhân' })).toBeInTheDocument();

    // Popover hiển thị các bộ lọc bổ sung (Tham gia & Loại mục ghi)
    expect(await screen.findByText('Bộ lọc lịch làm việc')).toBeInTheDocument();
    expect(screen.getAllByText('Tham gia').length).toBeGreaterThan(0);
    expect(screen.getByText('Loại mục')).toBeInTheDocument();
  }, 45000);

  it('phiếu công việc có 3 thành phần chính và 2 nút Triển khai / Đề xuất cùng các popup tương ứng', async () => {
    const user = userEvent.setup();
    renderCalendarWeek();

    await screen.findByText(/Tuần 41/i);
    await user.click(screen.getByRole('button', { name: /^Tạo$/i }));

    // Khi mở popup chọn loại phiếu, chọn option "Phiếu công việc"
    const dialogs = await screen.findAllByRole('dialog');
    const taskTypeBtn = within(dialogs[0]).queryByRole('button', { name: /Phiếu công việc/i });
    if (taskTypeBtn) {
      await user.click(taskTypeBtn);
    }

    // Kiểm tra form có đủ 3 trường: Nội dung, Thời gian, Chọn thành phần
    const activeDialogs = await screen.findAllByRole('dialog');
    const formModal = activeDialogs[activeDialogs.length - 1];

    expect(within(formModal).getByText('Tạo mới phiếu công việc')).toBeInTheDocument();
    expect(within(formModal).getByText('Nội dung')).toBeInTheDocument();
    expect(within(formModal).getAllByText('Thời gian').length).toBeGreaterThan(0);
    expect(within(formModal).getByText('Chọn thành phần')).toBeInTheDocument();

    // Có 2 nút: Triển khai và Đề xuất
    const deployBtn = within(formModal).getByRole('button', { name: /Triển khai/i });
    const proposeBtn = within(formModal).getByRole('button', { name: /Đề xuất/i });
    expect(deployBtn).toBeInTheDocument();
    expect(proposeBtn).toBeInTheDocument();
  }, 40000);
});


