import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { normalizeMeeting } from '../calendarWeekUtils';
import { CalendarEventPreviewDrawer } from '../components/CalendarEventPreviewDrawer';

import { previewMeeting } from './fixtures/previewEvents';

describe('Thao tác xem chi tiết ở đầu Drawer', () => {
  it.each(['TASK', 'EVENT', 'MEETING'] as const)('%s: nút chi tiết nằm trong header, không còn footer', (ticketType) => {
    render(<CalendarEventPreviewDrawer event={{ ...previewMeeting, ticketType, attachments: [], comments: [] }} onClose={vi.fn()} />);
    const header = screen.getByRole('heading', { name: previewMeeting.title }).closest('.ant-drawer-header')!;
    const link = within(header as HTMLElement).getByRole('link', { name: 'Xem chi tiết' });
    expect(link).toHaveAttribute('href', '/calendar/events/preview-meeting');
    expect(link).not.toHaveAttribute('target');
    expect(document.querySelector('.ant-drawer-footer')).toBeNull();
    if (ticketType !== 'MEETING') expect(within(header as HTMLElement).getByText('0 tài liệu · 0 thảo luận')).toBeInTheDocument();
  });

  it('giữ cờ tham gia được suy ra từ người thực hiện khi truyền dữ liệu sang Drawer', () => {
    const normalized = normalizeMeeting({ ...previewMeeting, ticketType: 'TASK', scope: 'personal', isUserParticipant: undefined, executors: [{ id: 'user-001', name: 'Nguyễn Minh Anh' }] })!;
    expect(normalized.isUserParticipant).toBe(true);
    render(<CalendarEventPreviewDrawer event={normalized.raw} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Xem chi tiết' })).toBeInTheDocument();
  });

  it('người không tham gia vẫn thấy số lượng ở đầu phiếu nhưng không có nút chi tiết', () => {
    render(<CalendarEventPreviewDrawer event={{ ...previewMeeting, ticketType: 'TASK', isUserParticipant: false, attachments: [], comments: [] }} onClose={vi.fn()} />);
    const header = screen.getByRole('heading').closest('.ant-drawer-header')!;
    expect(within(header as HTMLElement).getByText('0 tài liệu · 0 thảo luận')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Xem chi tiết' })).not.toBeInTheDocument();
  });
});
