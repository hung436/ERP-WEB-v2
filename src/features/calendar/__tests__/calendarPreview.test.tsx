import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CalendarEvent } from '@/types/domain';

import { CalendarWeekPage } from '../CalendarWeekPage';
import { normalizeMeeting } from '../calendarWeekUtils';
import { CalendarEventCard } from '../components/CalendarEventCard';
import { CalendarEventPreviewDrawer } from '../components/CalendarEventPreviewDrawer';
import { EventCard } from '../components/WeekTimeline';

import { previewMeeting, previewWatcher } from './fixtures/previewEvents';

vi.mock('@/services/api', () => ({ calendarApi: { saveDemoChanges: (event: CalendarEvent, changes: Partial<CalendarEvent>) => ({ ...event, ...changes }), list: vi.fn(async () => ({ data: [previewMeeting, previewWatcher] })) } }));
vi.mock('../mockCalendarData', () => ({ getEventsForWeek: (_week: unknown, events: CalendarEvent[]) => events }));

function renderWeek() {
  return render(<MemoryRouter initialEntries={['/calendar/week?date=2026-11-05']}><CalendarWeekPage /></MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
});

describe('Drawer thông tin lịch tóm tắt', () => {
  it('đưa tên lịch lên header, chỉ một mốc giờ và liên kết chi tiết trong cùng tab', () => {
    render(<CalendarEventPreviewDrawer event={previewMeeting} onClose={vi.fn()} />);
    const drawer = screen.getByRole('dialog', { name: previewMeeting.title });
    const content = within(drawer);
    for (const label of ['Thông tin lịch', 'Lịch họp', 'Lịch chung', 'Đã lên lịch', 'Người tổ chức']) {
      expect(content.queryByText(label)).not.toBeInTheDocument();
    }
    expect(content.getByRole('heading', { name: previewMeeting.title })).toBeInTheDocument();
    const time = content.getByText('Thời gian').closest('dt')?.nextElementSibling;
    expect(time).toHaveTextContent('08:30 · Thứ Năm, 05/11/2026');
    expect(content.queryByText('10:00')).not.toBeInTheDocument();
    expect(drawer.querySelectorAll('time')).toHaveLength(1);
    expect(time?.textContent?.match(/05\/11\/2026/g)).toHaveLength(1);
    expect(content.getByText('Phòng họp tầng 3')).toBeInTheDocument();
    expect(content.getByText(previewMeeting.leader!)).toBeInTheDocument();
    expect(content.getByText('Thành phần').closest('dt')?.nextElementSibling).toHaveTextContent('Nguyễn Minh Anh, Lê Thanh Liêm');
    const detail = content.getByRole('link', { name: 'Xem chi tiết' });
    expect(detail).toHaveAttribute('href', '/calendar/events/preview-meeting');
    expect(detail).not.toHaveAttribute('target');
    expect(content.queryByText(previewMeeting.description!)).not.toBeInTheDocument();
    expect(content.queryByText('Ke-hoach-xuat-ban.pdf')).not.toBeInTheDocument();
    expect(content.queryByText('Bình luận chỉ xem tại trang chi tiết.')).not.toBeInTheDocument();
    expect(content.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it.each([{ ...previewMeeting, isUserParticipant: false }, { ...previewMeeting, isUserParticipant: undefined }])(
    'ẩn nút chi tiết khi không phải người tham gia (isUserParticipant=$isUserParticipant)', (event) => {
      render(<CalendarEventPreviewDrawer event={event} onClose={vi.fn()} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Xem chi tiết' })).not.toBeInTheDocument();
      expect(document.querySelector('.calendar-preview-drawer .ant-drawer-footer')).toBeNull();
    },
  );

  it('người theo dõi (isUserWatcher) có nút Xem chi tiết để theo dõi tiến độ', () => {
    render(<CalendarEventPreviewDrawer event={previewWatcher} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem chi tiết' })).toBeInTheDocument();
  });

  it('lịch nhiều ngày vẫn chỉ hiện mốc bắt đầu, ẩn trường rỗng và không cắt nội dung dài', () => {
    const title = previewMeeting.title.repeat(12);
    render(<CalendarEventPreviewDrawer event={{ ...previewMeeting, title, endAt: '2026-11-06T10:00:00', location: ' ', leader: '', organizer: '', participants: [], meetingUrl: '' }} onClose={vi.fn()} />);
    expect(screen.getByText('Thời gian').closest('dt')?.nextElementSibling).toHaveTextContent('08:30 · Thứ Năm, 05/11/2026');
    expect(screen.queryByText(/06\/11\/2026/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: title })).toHaveTextContent(title);
    for (const label of ['Địa điểm', 'Chủ trì', 'Người tổ chức', 'Thành phần', 'Kênh họp']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it.each(['APPROVED', 'SCHEDULED', 'PENDING', 'REJECTED', 'COMPLETED', 'IN_PROGRESS', 'CANCELLED', undefined] as const)(
    'nhóm trạng thái cá nhân quy định có chấm màu: %s', (approvalStatus) => {
      render(<CalendarEventPreviewDrawer event={{ ...previewMeeting, scope: 'personal', approvalStatus }} onClose={vi.fn()} />);
      const dot = document.querySelector('.calendar-preview-status .booking-week-status-dot');
      if (approvalStatus && ['APPROVED', 'PENDING', 'REJECTED', 'COMPLETED', 'IN_PROGRESS'].includes(approvalStatus)) {
        expect(dot).toHaveClass(`dot-${approvalStatus.toLowerCase()}`);
      } else {
        expect(dot).toBeNull();
      }
    },
  );

  it('lịch chung không có chấm trạng thái kể cả khi phiếu có trạng thái Đã duyệt', () => {
    render(<CalendarEventPreviewDrawer event={{ ...previewMeeting, approvalStatus: 'APPROVED' }} onClose={vi.fn()} />);
    expect(screen.queryByLabelText('Trạng thái: Đã duyệt')).not.toBeInTheDocument();
    expect(document.querySelector('.calendar-preview-status .booking-week-status-dot')).toBeNull();
  });

  it.each(['TASK', 'EVENT'] as const)('ẩn Địa điểm với %s dù dữ liệu có địa điểm', (ticketType) => {
    render(<CalendarEventPreviewDrawer event={{ ...previewMeeting, ticketType }} onClose={vi.fn()} />);
    expect(screen.queryByText('Địa điểm')).not.toBeInTheDocument();
    expect(screen.queryByText(previewMeeting.location!)).not.toBeInTheDocument();
  });

  it('phiếu công việc dùng một mốc hạn xử lý khi có deadline', () => {
    render(<CalendarEventPreviewDrawer event={{ ...previewMeeting, ticketType: 'TASK', deadline: '2026-11-06T17:30:00' }} onClose={vi.fn()} />);
    expect(screen.getByText('Thời gian').closest('dt')?.nextElementSibling).toHaveTextContent('17:30 · Thứ Sáu, 06/11/2026');
    expect(screen.getByRole('dialog').querySelectorAll('time')).toHaveLength(1);
  });

  it.each(['TASK', 'EVENT'] as const)('tóm tắt %s có nhãn loại, trạng thái, người theo dõi và số tài liệu/thảo luận', (ticketType) => {
    const event: CalendarEvent = {
      ...previewMeeting,
      ticketType,
      scope: 'personal',
      approvalStatus: 'REJECTED',
      isUserWatcher: true,
      watchers: [{ id: 'watcher-preview', name: 'Bùi Anh Tú' }],
      executors: [{ id: 'executor-preview', name: 'Lê Thanh Liêm' }],
    };
    render(<CalendarEventPreviewDrawer event={event} onClose={vi.fn()} />);
    const drawer = within(screen.getByRole('dialog', { name: event.title }));
    expect(drawer.getByText(ticketType === 'TASK' ? 'Phiếu công việc' : 'Sự kiện')).toBeInTheDocument();
    expect(drawer.getByText('Không duyệt')).toBeInTheDocument();
    expect(drawer.getByText('Theo dõi').closest('dt')?.nextElementSibling).toHaveTextContent('Bùi Anh Tú');
    expect(drawer.getByText('1 tài liệu · 1 thảo luận')).toBeInTheDocument();
    if (ticketType === 'EVENT') {
      expect(drawer.queryByText('Địa điểm')).not.toBeInTheDocument();
    } else {
      expect(drawer.getByText('Địa điểm').closest('dt')?.nextElementSibling).toHaveTextContent('Phòng họp tầng 3');
    }
    expect(drawer.queryByText('Chủ trì')).not.toBeInTheDocument();
    expect(drawer.queryByText('Người tổ chức')).not.toBeInTheDocument();
    if (ticketType === 'TASK') {
      expect(drawer.getByText('Thành phần').closest('dt')?.nextElementSibling).toHaveTextContent('Lê Thanh Liêm');
    }
  });

  it('người theo dõi vẫn xem được số tài liệu/thảo luận và có nút chi tiết', () => {
    render(<CalendarEventPreviewDrawer event={{ ...previewWatcher, ticketType: 'TASK' }} onClose={vi.fn()} />);
    expect(screen.getByText('1 tài liệu · 1 thảo luận')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem chi tiết' })).toBeInTheDocument();
  });
});

describe.each(['thẻ danh sách', 'thẻ cột/dòng thời gian'])('Quy tắc chấm trên %s', (layout) => {
  it('ẩn chủ trì trên card kể cả khi không có địa điểm', () => {
    const event = { ...previewMeeting, location: '' };
    const { container } = render(layout === 'thẻ danh sách'
      ? <CalendarEventCard event={event} />
      : <EventCard event={normalizeMeeting(event)!} now={dayjs('2026-11-05T07:00:00')} onSelect={vi.fn()} />);
    expect(within(container).queryByText(/Chủ trì/)).not.toBeInTheDocument();
    expect(within(container).queryByText(previewMeeting.leader!)).not.toBeInTheDocument();
  });

  it('quan tâm độc lập với mở card, hỗ trợ bàn phím và đánh dấu ngôi sao đang chọn', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const event = { ...previewMeeting, isUserParticipant: false, isInterested: true, startAt: '2099-11-05T08:30:00', endAt: '2099-11-05T09:30:00' };
    const { container } = render(layout === 'thẻ danh sách'
      ? <CalendarEventCard event={event} onSelectEvent={onSelect} />
      : <EventCard event={normalizeMeeting(event)!} now={dayjs('2026-11-05T07:00:00')} onSelect={onSelect} />);
    const star = screen.getByRole('button', { name: /quan tâm lịch họp/i });
    expect(star).toHaveAttribute('aria-pressed', 'true');
    expect(star.querySelector('.calendar-star-icon')).toBeInTheDocument();
    await user.click(star);
    expect(star).toHaveAttribute('aria-pressed', 'false');
    star.focus();
    await user.keyboard(' ');
    expect(star).toHaveAttribute('aria-pressed', 'true');
    expect(onSelect).not.toHaveBeenCalled();
    expect(container.querySelector('.booking-week-card-button .booking-week-card-star')).toBeNull();
  });

  it.each([
    ['personal', 'APPROVED', true], ['personal', 'PENDING', true], ['personal', 'REJECTED', true],
    ['personal', 'IN_PROGRESS', true], ['personal', 'COMPLETED', true],
    ['personal', 'SCHEDULED', false],
    ['editorial', 'APPROVED', false], ['editorial', 'PENDING', false], ['editorial', 'REJECTED', false], ['editorial', 'SCHEDULED', false],
  ] as const)('%s / %s: chấm trạng thái=%s, chấm điều chỉnh chỉ dành cho lịch chung', (scope, approvalStatus, hasStatusDot) => {
    const event = { ...previewMeeting, scope, approvalStatus, isAdjusted: true };
    const normalized = normalizeMeeting(event)!;
    const { container } = render(layout === 'thẻ danh sách'
      ? <CalendarEventCard event={event} />
      : <EventCard event={normalized} now={dayjs('2026-11-05T07:00:00')} onSelect={vi.fn()} />);
    expect(container.querySelectorAll('.booking-week-status-dot')).toHaveLength(hasStatusDot ? 1 : 0);
    expect(container.querySelectorAll('.booking-week-adjusted-dot')).toHaveLength(scope === 'editorial' ? 1 : 0);
  });
});

describe('Luồng xem nhanh từ lịch tuần', () => {
  it('bỏ Trực/Ca ở cả hai bố cục, mở drawer ngày trực tiếp và giữ điều hướng ngày', async () => {
    const user = userEvent.setup();
    renderWeek();
    await screen.findByRole('button', { name: `08:30 ${previewMeeting.title}` });
    expect(screen.queryByText('Trực:')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mở rộng các ca trực/ })).not.toBeInTheDocument();
    const dayButton = screen.getByRole('button', { name: 'Xem ca trực ngày Thứ Năm 05/11' });
    dayButton.focus();
    await user.keyboard('{Enter}');
    const dayDrawer = await screen.findByRole('dialog', { name: 'Lịch ca trực Thứ Năm, ngày 05/11/2026' });
    expect(within(dayDrawer).getByText('Ca 0:')).toBeInTheDocument();
    expect(within(dayDrawer).getByText('Trực:')).toBeInTheDocument();
    await user.click(within(dayDrawer).getByRole('button', { name: 'Ngày tiếp theo' }));
    expect(screen.getByRole('dialog', { name: 'Lịch ca trực Thứ Sáu, ngày 06/11/2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ngày trước' }));
    // rc-drawer xử lý Escape qua keyCode; jsdom không tự gán keyCode cho userEvent.
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape', keyCode: 27 });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(dayButton).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Xem dạng ngang theo dòng thời gian' }));
    expect(screen.queryByText('TRỰC:')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mở rộng các ca trực/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Xem ca trực ngày Thứ Năm 05/11' }));
    expect(await screen.findByRole('dialog', { name: 'Lịch ca trực Thứ Năm, ngày 05/11/2026' })).toBeInTheDocument();
  });

  it('bấm/Enter mở đúng một drawer sự kiện, đóng trả focus và không có popover trung gian', async () => {
    const user = userEvent.setup();
    renderWeek();
    const trigger = await screen.findByRole('button', { name: `08:30 ${previewMeeting.title}` });
    trigger.focus();
    await user.keyboard('{Enter}');
    const drawer = await screen.findByRole('dialog', { name: previewMeeting.title });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(drawer).getByRole('link', { name: 'Xem chi tiết' })).toBeInTheDocument();
    expect(document.querySelector('.ant-popover')).toBeNull();
    await user.click(within(drawer).getByRole('button', { name: 'Đóng thông tin lịch' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(screen.getByRole('button', { name: `08:30 ${previewWatcher.title}` }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: previewWatcher.title })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog', { name: previewWatcher.title })).getByRole('link', { name: 'Xem chi tiết' })).toBeInTheDocument();
  });
});
