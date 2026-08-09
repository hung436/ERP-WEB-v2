import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Trạng thái dữ liệu', () => {
  it('hiển thị loading state', async () => {
    renderApp('/?state=loading', true);
    expect(await screen.findByLabelText('Đang tải dữ liệu')).toBeInTheDocument();
  });

  it('hiển thị empty state', async () => {
    renderApp('/?state=empty', true);
    expect(await screen.findByText('Hôm nay chưa có công việc cần xử lý')).toBeInTheDocument();
  });

  it('hiển thị error state', async () => {
    renderApp('/?state=error', true);
    expect(await screen.findByText('Không thể tải dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('Không thể tải dữ liệu. Vui lòng thử lại.')).toBeInTheDocument();
  });
});
