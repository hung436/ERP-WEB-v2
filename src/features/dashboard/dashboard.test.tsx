import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Trang chủ và điều hướng', () => {
  it('render đủ các khối dashboard chính', async () => {
    renderApp('/', true);
    expect(await screen.findByText('Công việc của tôi')).toBeInTheDocument();
    expect(screen.getAllByText('Thông báo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lịch hôm nay').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mail chưa đọc').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tin nhắn mới').length).toBeGreaterThan(0);
    expect(screen.queryByText('Truy cập nhanh')).not.toBeInTheDocument();
  });

  it('điều hướng từ sidebar tới Công việc', async () => {
    const user = userEvent.setup(); renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(screen.getByRole('link', { name: 'Công việc' }));
    expect(await screen.findByText('Tổng công việc')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/tasks');
  });

  it('mở popup chi tiết có xử lý công việc mà không rời trang chủ', async () => {
    const user = userEvent.setup(); renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    const quickViewButtons = screen.getAllByRole('button', { name: /Xem và xử lý công việc:/ });
    await user.click(quickViewButtons[0]);
    expect(await screen.findByText('Chi tiết công việc')).toBeInTheDocument();
    expect(screen.getByText('Xử lý công việc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cập nhật xử lý' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('mở chi tiết công việc từ nội dung item', async () => {
    const user = userEvent.setup(); renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(screen.getAllByRole('button', { name: /Xem chi tiết công việc:/ })[0]);
    expect(await screen.findByText('Chi tiết công việc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cập nhật xử lý' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('mở Mail và trả lời trực tiếp trên Trang chủ', async () => {
    const user = userEvent.setup(); renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(screen.getByRole('tab', { name: /Mail chưa đọc/ }));
    await user.click(screen.getByRole('button', { name: /Trần Thu Hà Yêu cầu cập nhật tiến độ/ }));
    expect(await screen.findByText('Đọc và trả lời Mail')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Nội dung trả lời Mail'), 'Tôi đã nhận và sẽ cập nhật trước thời hạn.');
    await user.click(screen.getByRole('button', { name: 'Gửi phản hồi' }));
    expect(await screen.findByText('Phản hồi gần nhất đã được gửi')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('phản hồi lịch trực tiếp trên Trang chủ', async () => {
    const user = userEvent.setup(); const { container } = renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(container.querySelector('.widget-event') as HTMLElement);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Lịch làm việc')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận tham gia' }));
    expect(await within(dialog).findByText('Sẽ tham gia')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('xác nhận thông báo trực tiếp trên Trang chủ', async () => {
    const user = userEvent.setup(); const { container } = renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(container.querySelector('.announcement-widget .widget-list button') as HTMLElement);
    expect(await screen.findByText('Thông báo cơ quan')).toBeInTheDocument();
    const acknowledge = screen.queryByRole('button', { name: 'Xác nhận đã nắm thông tin' });
    if (acknowledge) await user.click(acknowledge);
    expect(await screen.findByRole('button', { name: 'Đã xác nhận' })).toBeDisabled();
    expect(window.location.pathname).toBe('/');
  });

  it('gửi Chat trực tiếp trên Trang chủ', async () => {
    const user = userEvent.setup(); const { container } = renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(container.querySelector('.communication-widget .chat-widget button') as HTMLElement);
    expect(await screen.findByText('Nhắn tin nhanh')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Soạn tin nhắn'), 'Tôi đã nhận thông tin.');
    await user.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(await screen.findByText('Tôi đã nhận thông tin.')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('chỉ điều hướng module từ liên kết Xem tất cả', async () => {
    const user = userEvent.setup(); renderApp('/', true);
    await screen.findByText('Công việc của tôi');
    await user.click(screen.getByRole('link', { name: 'Xem tất cả công việc' }));
    expect(window.location.pathname).toBe('/tasks');
  });
});
