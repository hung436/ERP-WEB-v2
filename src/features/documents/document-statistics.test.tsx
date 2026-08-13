import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { DocumentStatisticsPage } from './DocumentStatisticsPage';

describe('Document Statistics Module', () => {
  it('renders DocumentStatisticsPage headers and metric cards', async () => {
    render(
      <BrowserRouter>
        <DocumentStatisticsPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Thống kê tài liệu' })).toBeInTheDocument();
    expect(screen.getByText('Xuất Báo Cáo Excel')).toBeInTheDocument();
    expect(screen.getByText('Mẫu tài liệu')).toBeInTheDocument();
  });
});
