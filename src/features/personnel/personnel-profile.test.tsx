import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { personnelApi } from '@/services/api';
import { renderApp } from '@/test/testUtils';

describe('Module Nhân sự - Lý lịch cá nhân', () => {
  it('mock API trả đầy đủ các nhóm thông tin chính', async () => {
    const profile = (await personnelApi.profile()).data;
    expect(profile).toMatchObject({
      fullName: 'Nguyễn Minh Anh',
      identityNumber: '079090012345',
      professionalQualification: expect.any(String),
      civilServantRank: expect.any(String),
      workStrengths: expect.any(String),
    });
  });

  it('hiển thị lý lịch read-only và điều hướng Nhân sự', async () => {
    renderApp('/personnel/profile', true);
    expect(await screen.findByRole('heading', { name: /Sơ yếu lý lịch/ }, { timeout: 10000 })).toBeInTheDocument();
    expect(document.body).toHaveClass('personnel-page-open');
    expect(document.querySelector('main.app-content')).toHaveClass('app-content-personnel');
    const details = screen.getByRole('article', { name: /Sơ yếu lý lịch/ });
    expect(within(details).getByText('Sinh ngày')).toBeInTheDocument();
    expect(within(details).getByText('Phóng viên hạng III')).toBeInTheDocument();
    expect(within(details).getByText('Sở trường công tác')).toBeInTheDocument();
    expect(within(details).getByRole('heading', { name: /Lịch sử bản thân/ })).toBeInTheDocument();
    expect(within(details).getByRole('heading', { name: /Tự nhận xét/ })).toBeInTheDocument();
    const sectionNav = screen.getByRole('navigation', { name: 'Các mục hồ sơ nhân sự' });
    expect(within(sectionNav).getAllByRole('link')).toHaveLength(11);
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    fireEvent.click(within(sectionNav).getByRole('link', { name: /VII Khen thưởng/ }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(screen.getByRole('link', { name: 'Nhân sự' })).toHaveAttribute('href', '/personnel/profile');
  }, 15000);

  it('hiển thị trạng thái rỗng của hồ sơ', async () => {
    renderApp('/personnel/profile?state=empty', true);
    expect(await screen.findByText('Chưa có lý lịch cá nhân')).toBeInTheDocument();
  });
});
