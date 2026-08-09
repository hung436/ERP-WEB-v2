import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { directoryApi } from '@/services/api';
import { renderApp } from '@/test/testUtils';

describe('Module Danh bạ', () => {
  it('mock API tìm kiếm và lọc đúng phòng ban', async () => {
    const result = (await directoryApi.list('?search=thu%20ha&department=Ban%20Nội%20dung')).data;
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ fullName: 'Trần Thu Hà', extension: '2102' });
  });

  it('tìm kiếm và lọc nhân sự trong module Danh bạ', async () => {
    const user = userEvent.setup();
    renderApp('/directory', true);
    const search = await screen.findByLabelText('Tìm kiếm trong danh bạ');
    const directory = await screen.findByRole('region', { name: 'Danh sách nhân sự' });
    expect(within(directory).getByText('Nguyễn Minh Anh')).toBeInTheDocument();
    expect(within(screen.getByRole('button', { name: 'Xem thông tin liên hệ của Nguyễn Minh Anh' })).getByText('(Minh Anh)')).toBeInTheDocument();
    const contactWithoutExtension = screen.getByRole('button', { name: 'Xem thông tin liên hệ của Nguyễn Hoài Nam' });
    expect(within(contactWithoutExtension).queryByText(/Máy lẻ/)).not.toBeInTheDocument();
    await user.type(search, 'quang huy');
    expect(await screen.findByText('Đỗ Quang Huy')).toBeInTheDocument();
    expect(within(directory).queryByText('Nguyễn Minh Anh')).not.toBeInTheDocument();
    await user.clear(search);
    await user.click(screen.getByText('Tất cả phòng ban'));
    await waitFor(() => expect(document.querySelectorAll('.ant-select-item-option').length).toBeGreaterThan(1));
    const technologyOption = [...document.querySelectorAll<HTMLElement>('.ant-select-item-option')].find((item) => item.textContent === 'Phòng Công nghệ');
    expect(technologyOption).toBeDefined();
    await user.click(technologyOption as HTMLElement);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Xem thông tin liên hệ của/ })).toHaveLength(2));
  });

  it('tìm Danh bạ và mở xem nhanh ngay trên Trang chủ', async () => {
    const user = userEvent.setup();
    renderApp('/', true);
    const search = await screen.findByLabelText('Tìm kiếm danh bạ toàn cục');
    await user.type(search, 'Minh Châu');
    await user.click(await screen.findByText('Tạ Minh Châu'));
    expect(await screen.findByText('Thông tin liên hệ')).toBeInTheDocument();
    expect(screen.getByText('3002')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chat với Tạ Minh Châu' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('link', { name: 'Mở toàn bộ Danh bạ' })).toHaveAttribute('href', '/directory');
  });

  it('mở đúng hội thoại trực tiếp từ nút Chat của nhân sự', async () => {
    const user = userEvent.setup();
    const { container } = renderApp('/directory', true);
    await screen.findByText('Đặng Quốc Bảo');
    await user.click(screen.getByRole('button', { name: 'Chat với Đặng Quốc Bảo' }));
    await waitFor(() => expect(window.location.pathname).toBe('/chat'));
    expect(window.location.search).toMatch(/conversation=chat-/);
    await waitFor(() => expect(container.querySelector('.message-pane header strong')).toHaveTextContent('Đặng Quốc Bảo'));
  }, 15000);
});
