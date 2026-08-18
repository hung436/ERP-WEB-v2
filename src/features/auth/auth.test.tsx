import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Xác thực', () => {
  it('đăng nhập đúng và chuyển về trang chủ', async () => {
    const user = userEvent.setup(); renderApp('/login');
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'nhanvien');
    await user.type(screen.getByLabelText('Mật khẩu'), '123456');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(await screen.findByText('Công việc của tôi')).toBeInTheDocument();
  });

  it('đăng nhập bằng tài khoản admin thành công', async () => {
    const user = userEvent.setup(); renderApp('/login');
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'admin');
    await user.type(screen.getByLabelText('Mật khẩu'), '123456');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(await screen.findByText('Công việc của tôi')).toBeInTheDocument();
  });

  it('hiển thị lỗi khi đăng nhập sai', async () => {
    const user = userEvent.setup(); renderApp('/login');
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'nhanvien');
    await user.type(screen.getByLabelText('Mật khẩu'), '654321');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Tên đăng nhập hoặc mật khẩu không đúng');
  });

  it('chuyển người chưa đăng nhập khỏi route bảo vệ', async () => {
    renderApp('/tasks');
    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('đăng xuất, xoá session và quay về login', async () => {
    const user = userEvent.setup(); renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(screen.getByRole('button', { name: 'Mở menu tài khoản' }));
    await user.click(await screen.findByText('Đăng xuất'));
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
    expect(window.sessionStorage.getItem('erp-session')).toBeNull();
  });
});
