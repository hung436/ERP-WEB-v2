import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { PersonnelDataExtractionPage } from './PersonnelDataExtractionPage';

describe('PersonnelDataExtractionPage', () => {
  it('renders extraction page title and filter form fields', async () => {
    render(
      <BrowserRouter>
        <PersonnelDataExtractionPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Trích xuất dữ liệu' })).toBeInTheDocument();
    expect(screen.getByText('Điều kiện trích xuất dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('Đặt lại bộ lọc')).toBeInTheDocument();
    expect(screen.getByText('Xuất Excel')).toBeInTheDocument();
  });
});
