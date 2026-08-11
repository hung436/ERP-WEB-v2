import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

async function clickFirst(selector: string, route: string) {
  const user = userEvent.setup();
  const { container } = renderApp(route, true);
  await waitFor(() => expect(container.querySelector(selector)).toBeInTheDocument());
  await user.click(container.querySelector(selector) as HTMLElement);
}

describe('Chi tiết phù hợp cho từng module', () => {
  it('mở chi tiết và xử lý Công việc trong cùng popup', async () => {
    const user = userEvent.setup();
    renderApp('/tasks', true);
    const title = await screen.findByText('Hoàn thành tự đánh giá lao động Quý III/2026');
    await user.click(title.closest('tr') as HTMLElement);
    expect(await screen.findByText('Chi tiết công việc')).toBeInTheDocument();
    expect(screen.getByText('Xử lý công việc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cập nhật xử lý' })).toBeInTheDocument();
  });

  it('mở chi tiết Lịch làm việc', async () => {
    await clickFirst('.meeting-card', '/calendar');
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Lịch làm việc')).toBeInTheDocument();
  });

  it('hiển thị hội thoại Chat trong khung chi tiết có sẵn', async () => {
    const user = userEvent.setup(); const { container } = renderApp('/chat', true);
    await waitFor(() => expect(container.querySelectorAll('.conversation').length).toBeGreaterThan(1));
    await user.click(container.querySelectorAll('.conversation')[1] as HTMLElement);
    await waitFor(() => expect(container.querySelector('.chat-identity strong')).toHaveTextContent('Nhóm Ban Nội dung'));
    expect(screen.queryByText('Chi tiết hội thoại')).not.toBeInTheDocument();
  });

  it('hiển thị Mail trong vùng đọc thư có sẵn', async () => {
    const user = userEvent.setup(); const { container } = renderApp('/mail', true);
    await waitFor(() => expect(container.querySelectorAll('.mail-row').length).toBeGreaterThan(1));
    await user.click(container.querySelectorAll('.mail-row')[1] as HTMLElement);
    await waitFor(() => expect(container.querySelector('.gmail-detail h2')).toHaveTextContent('Yêu cầu cập nhật tiến độ'));
    expect(screen.queryByText('Chi tiết thư')).not.toBeInTheDocument();
  });

  it('mở chi tiết Thông báo', async () => {
    await clickFirst('.announcement-card', '/announcements');
    expect(await screen.findByText('Chi tiết thông báo')).toBeInTheDocument();
  });
});
