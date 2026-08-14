import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Lịch làm việc - Quản lý thông báo & Quản lý nhóm', () => {
  it('hiển thị danh sách thông báo với đúng 3 cột Thời gian gửi, Tiêu đề, Trạng thái (không có cột Thao tác và không có cụm card thống kê)', async () => {
    renderApp('/calendar/notifications', true);

    expect(await screen.findByText('Lịch làm việc · Quản lý thông báo')).toBeInTheDocument();
    expect(screen.getByText('Tạo Lịch họp ban biên tập')).toBeInTheDocument();
    expect(screen.getByText('Tạo thông báo')).toBeInTheDocument();

    // Verify removed elements
    expect(screen.queryByText('Tuổi Trẻ ERP')).not.toBeInTheDocument();
    expect(screen.queryByText('Quản lý lịch họp Ban Biên tập và các thông báo, chỉ đạo nội bộ tòa soạn')).not.toBeInTheDocument();
    expect(screen.queryByText('Tổng thông báo & Lịch họp')).not.toBeInTheDocument();

    // Wait for table to load
    expect(
      await screen.findByText(/Lịch họp Ban Biên tập đầu tuần: Duyệt kế hoạch xuất bản & Tuyến bài trọng điểm Tuần 34/)
    ).toBeInTheDocument();

    // Exactly 3 Table columns
    expect(screen.getByText('Thời gian gửi')).toBeInTheDocument();
    expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.queryByText('Thao tác')).not.toBeInTheDocument();
  });

  it('mở modal Tạo Lịch họp ban biên tập với toolbar in đậm, in nghiêng, căn lề và nút Tạo', async () => {
    const user = userEvent.setup();
    renderApp('/calendar/notifications', true);

    await screen.findByText('Lịch làm việc · Quản lý thông báo');
    await user.click(screen.getByRole('button', { name: /Tạo Lịch họp ban biên tập/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Tạo Lịch họp Ban Biên tập')).toBeInTheDocument();
    expect(within(dialog).getByText('Danh sách nhận')).toBeInTheDocument();
    expect(within(dialog).getByText('Tiêu đề')).toBeInTheDocument();
    expect(within(dialog).getByText('Nội dung thông báo')).toBeInTheDocument();
    
    // Rich text formatting toolbar
    expect(within(dialog).getByTitle(/In đậm/i)).toBeInTheDocument();
    expect(within(dialog).getByTitle(/In nghiêng/i)).toBeInTheDocument();
    expect(within(dialog).getByTitle(/Gạch chân/i)).toBeInTheDocument();
    expect(within(dialog).getByTitle(/Căn trái/i)).toBeInTheDocument();
    expect(within(dialog).getByTitle(/Căn giữa/i)).toBeInTheDocument();

    // Button "Tạo"
    expect(within(dialog).getByRole('button', { name: /^Tạo$/i })).toBeInTheDocument();
  });

  it('mở modal Tạo Thông báo, có nút Tải biểu mẫu và ô nội dung với toolbar định dạng vẫn hiển thị', async () => {
    const user = userEvent.setup();
    renderApp('/calendar/notifications', true);

    await screen.findByText('Lịch làm việc · Quản lý thông báo');
    await user.click(screen.getByRole('button', { name: /Tạo thông báo/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Tạo Thông báo')).toBeInTheDocument();
    expect(within(dialog).getByText(/Tải biểu mẫu \(Đính kèm tệp\)/i)).toBeInTheDocument();
    expect(within(dialog).getByText('Hẹn giờ gửi')).toBeInTheDocument();

    // Rich text formatting toolbar
    expect(within(dialog).getByTitle(/In đậm/i)).toBeInTheDocument();
    expect(within(dialog).getByTitle(/In nghiêng/i)).toBeInTheDocument();
    expect(within(dialog).getByTitle(/Gạch chân/i)).toBeInTheDocument();
    expect(within(dialog).getByTitle(/Căn trái/i)).toBeInTheDocument();

    // Button "Tạo"
    expect(within(dialog).getByRole('button', { name: /^Tạo$/i })).toBeInTheDocument();
  });

  it('hiển thị trang Quản lý nhóm không có mô tả nhóm và không có card thống kê', async () => {
    renderApp('/calendar/groups', true);

    expect(await screen.findByText('Lịch làm việc · Quản lý nhóm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tạo nhóm mới/i })).toBeInTheDocument();

    // Verify removed elements
    expect(screen.queryByText('Tuổi Trẻ ERP')).not.toBeInTheDocument();
    expect(screen.queryByText('Tổng số nhóm nhận')).not.toBeInTheDocument();

    // Check groups from mock
    expect(await screen.findByText('Ban Biên tập')).toBeInTheDocument();
    expect(screen.getByText('Ban Thư ký tòa soạn & Biên tập viên chính')).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Tên nhóm')).toBeInTheDocument();
    expect(screen.getByText('Thành viên')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.queryByText('Mô tả')).not.toBeInTheDocument();
  });

  it('mở modal Tạo nhóm mới chỉ có Tên nhóm, Cá nhân, Trạng thái (đã bỏ mô tả)', async () => {
    const user = userEvent.setup();
    renderApp('/calendar/groups', true);

    await screen.findByText('Lịch làm việc · Quản lý nhóm');
    await user.click(screen.getByRole('button', { name: /Tạo nhóm mới/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Tạo nhóm nhận thông báo mới')).toBeInTheDocument();
    expect(within(dialog).getByText('Tên nhóm')).toBeInTheDocument();
    expect(within(dialog).getByText('Cá nhân (Danh sách nhân viên trong nhóm)')).toBeInTheDocument();
    expect(within(dialog).getByText('Trạng thái nhóm')).toBeInTheDocument();
    expect(within(dialog).queryByText(/Mô tả/i)).not.toBeInTheDocument();
  });
});
