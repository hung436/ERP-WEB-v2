import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('PersonnelListPage', () => {
  it('renders the Excel personnel roster and complete pagination', async () => {
    const user = userEvent.setup();
    const { container } = renderApp('/personnel/list', true);

    expect(await screen.findByRole('heading', { name: 'Danh sách nhân sự & Chức vụ' })).toBeInTheDocument();
    expect(await screen.findByText('Hiển thị 1-10 trong 265 hồ sơ')).toBeInTheDocument();
    expect(screen.getAllByText('TRẦN XUÂN TOÀN').length).toBeGreaterThan(0);
    expect(screen.queryByText('Danh sách các đợt bình bầu đã thiết lập')).not.toBeInTheDocument();

    const nextPage = container.querySelector('.ant-pagination-next');
    expect(nextPage).not.toBeNull();
    if (!nextPage) throw new Error('Pagination next button was not rendered');
    await user.click(nextPage);
    expect(await screen.findByText('Hiển thị 11-20 trong 265 hồ sơ')).toBeInTheDocument();
    const pageSizeSelect = container.querySelector('.ant-pagination-options-size-changer .ant-select-selector');
    expect(pageSizeSelect).not.toBeNull();
    if (!pageSizeSelect) throw new Error('Pagination page-size selector was not rendered');
    await user.click(pageSizeSelect);
    await user.click(await screen.findByText('25 / trang'));
    await waitFor(() => expect(screen.getByText('Hiển thị 1-25 trong 265 hồ sơ')).toBeInTheDocument());
  });

  it('offers the four personnel actions and updates work status locally', async () => {
    const user = userEvent.setup();
    const { container } = renderApp('/personnel/list', true);

    await screen.findByText('Hiển thị 1-10 trong 265 hồ sơ', {}, { timeout: 10000 });
    await user.click(await screen.findByRole('button', { name: 'Thao tác với TRẦN XUÂN TOÀN' }, { timeout: 10000 }));
    expect(await screen.findByRole('menuitem', { name: /Lịch sử lưu file hồ sơ/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Xem hồ sơ/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Chỉnh sửa bộ phận \/ chức vụ/ })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: /Thay đổi tình trạng làm việc/ }));

    await user.click(await screen.findByRole('combobox', { name: 'Tình trạng làm việc' }));
    await waitFor(() => expect(document.querySelectorAll('.ant-select-item-option').length).toBeGreaterThan(1));
    const suspendedOption = [...document.querySelectorAll<HTMLElement>('.ant-select-item-option')]
      .find((option) => option.textContent === 'Tạm hoãn');
    expect(suspendedOption).toBeDefined();
    await user.click(suspendedOption as HTMLElement);
    const statusSelection = document.querySelector('.peopleos-work-status-editor .ant-select-selection-item');
    expect(statusSelection).not.toBeNull();
    expect(statusSelection).toHaveTextContent('Tạm hoãn');
    await user.click(screen.getByRole('button', { name: 'Lưu tình trạng' }));

    await waitFor(() => expect(container.querySelector('.peopleos-profile-badges .ant-tag')).toHaveTextContent('Tạm hoãn'));
  }, 40000);

  it('creates a campaign without rendering the removed campaign list', async () => {
    const user = userEvent.setup();
    renderApp('/personnel/list', true);

    await user.click(await screen.findByRole('button', { name: /Tạo bình bầu/ }));
    expect(screen.queryByText('Danh sách các đợt bình bầu đã thiết lập')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '✓ Khởi tạo đợt thi đua' }));
    expect(await screen.findByText(/Lịch trình thi đua:/)).toBeInTheDocument();
    expect(screen.getByText(/Danh sách Bộ tiêu chí đánh giá/)).toBeInTheDocument();
  });
});
