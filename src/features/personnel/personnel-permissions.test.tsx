import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { PersonnelPermissionsPage } from './PersonnelPermissionsPage';

describe('PersonnelPermissionsPage', () => {
  it('renders permissions page title and 3 main tabs', async () => {
    render(
      <BrowserRouter>
        <PersonnelPermissionsPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Quyền' })).toBeInTheDocument();
    expect(screen.getByText('Quản lý quyền')).toBeInTheDocument();
    expect(screen.getByText('Nhóm quyền')).toBeInTheDocument();
    expect(screen.getByText('Phân quyền')).toBeInTheDocument();
  });
});
