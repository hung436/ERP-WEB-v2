import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { CreateDocumentTemplatePage } from './CreateDocumentTemplatePage';
import { DocumentTemplatesPage } from './DocumentTemplatesPage';

describe('Document Templates Module', () => {
  it('renders DocumentTemplatesPage title and search toolbar', async () => {
    render(
      <BrowserRouter>
        <DocumentTemplatesPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Tài liệu mẫu' })).toBeInTheDocument();
    expect(screen.getByText('Tạo tài liệu mẫu')).toBeInTheDocument();
  });

  it('renders CreateDocumentTemplatePage form sections and workflow step options', async () => {
    render(
      <BrowserRouter>
        <CreateDocumentTemplatePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Nhóm Tài liệu *')).toBeInTheDocument();
    expect(screen.getByText('Tên Tài liệu *')).toBeInTheDocument();
    expect(screen.getByText('Quy trình')).toBeInTheDocument();
    expect(screen.getAllByText('Tiếp tục quy trình khi từ chối')[0]).toBeInTheDocument();
  });
});
