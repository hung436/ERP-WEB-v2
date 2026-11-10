import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Phân quyền điều hướng Lịch làm việc theo vai trò tài khoản', () => {
  it('tài khoản nhân viên: Lịch làm việc không có submenu, click vào thẳng Lịch tuần', async () => {
    const user = userEvent.setup();
    // authenticated=true tương đương token nhân viên 'mock-token' (demoUser, role: employee)
    renderApp('/', true);

    // Chờ Dashboard load
    await screen.findByText('Công việc của tôi');

    // Tìm menu "Lịch làm việc" trên Sidebar
    const calendarLink = screen.getByRole('link', { name: /^Lịch làm việc$/i });
    expect(calendarLink).toBeInTheDocument();
    expect(calendarLink).toHaveAttribute('href', '/calendar/week');

    // Không có submenu (không có mục Quản lý thông báo hay Quản lý nhóm)
    expect(screen.queryByRole('link', { name: /^Quản lý thông báo$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Quản lý nhóm$/i })).not.toBeInTheDocument();

    // Click vào Lịch làm việc -> điều hướng thẳng tới trang Lịch tuần
    await user.click(calendarLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/calendar/week');
    });
    expect(await screen.findByRole('main', { name: /Lịch họp tuần/i })).toBeInTheDocument();
  });

  it('tài khoản nhân viên: gõ URL trực tiếp /calendar/notifications bị tự động redirect về /calendar/week', async () => {
    renderApp('/calendar/notifications', true);

    // Bị chuyển hướng về Lịch tuần
    await waitFor(() => {
      expect(window.location.pathname).toBe('/calendar/week');
    });
    expect(screen.queryByText('Lịch làm việc · Quản lý thông báo')).not.toBeInTheDocument();
  });

  it('tài khoản nhân viên: gõ URL trực tiếp /calendar/groups bị tự động redirect về /calendar/week', async () => {
    renderApp('/calendar/groups', true);

    // Bị chuyển hướng về Lịch tuần
    await waitFor(() => {
      expect(window.location.pathname).toBe('/calendar/week');
    });
    expect(screen.queryByText('Lịch làm việc · Quản lý nhóm')).not.toBeInTheDocument();
  });

  it('tài khoản quản trị (admin): Lịch làm việc có submenu đầy đủ và truy cập được các trang quản trị', async () => {
    const user = userEvent.setup();
    // authenticated='admin' tương đương token 'mock-admin-token' (adminUser, role: admin)
    renderApp('/', 'admin');

    await screen.findByText('Công việc của tôi');

    // Nút Lịch làm việc là button toggle submenu
    const calendarGroupBtn = screen.getByRole('button', { name: /^Lịch làm việc$/i });
    expect(calendarGroupBtn).toBeInTheDocument();

    // Mở submenu
    await user.click(calendarGroupBtn);

    // Có các mục submenu sau khi mở
    expect(screen.getByRole('link', { name: /^Lịch tuần$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Quản lý thông báo$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Quản lý nhóm$/i })).toBeInTheDocument();
  });
});
