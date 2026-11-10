import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs, { extend } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { describe, expect, it, vi } from 'vitest';

import type { CalendarEvent } from '@/types/domain';

import { detectEventConflicts, isIntervalOverlap, findSuggestedSlot } from './conflictUtils';
import { SmartTimePicker } from './components/SmartTimePicker';
import { SmartParticipantPicker } from './components/SmartParticipantPicker';

extend(isoWeek);

const mockExistingEvents: CalendarEvent[] = [
  {
    id: 'ev-01',
    title: 'Họp giao ban Ban Biên tập',
    startAt: '2026-10-05T09:00:00+07:00',
    endAt: '2026-10-05T10:00:00+07:00',
    location: 'PH3A',
    type: 'meeting',
    scope: 'editorial',
    organizer: 'Phạm Đức Long',
    participants: ['Trần Thu Hà', 'Nguyễn Minh Anh'],
    isUserParticipant: true,
  },
  {
    id: 'ev-02',
    title: 'Phỏng vấn chuyên gia kinh tế',
    startAt: '2026-10-05T14:00:00+07:00',
    endAt: '2026-10-05T15:30:00+07:00',
    location: 'Phòng họp số 2',
    type: 'work',
    scope: 'personal',
    organizer: 'Nguyễn Hoài Nam',
    participants: ['Nguyễn Hoài Nam', 'Đỗ Quang Huy'],
  },
];

describe('Milestone 1: Conflict Detection Engine (conflictUtils.ts)', () => {
  it('xác định chính xác giao thoa khoảng thời gian (isIntervalOverlap)', () => {
    const s1 = dayjs('2026-10-05T09:00:00');
    const e1 = dayjs('2026-10-05T10:00:00');

    // Case 1: Trùng một phần
    const s2 = dayjs('2026-10-05T09:30:00');
    const e2 = dayjs('2026-10-05T10:30:00');
    expect(isIntervalOverlap(s1, e1, s2, e2)).toBe(true);

    // Case 2: Liền kề chạm biên (không tính là trùng lịch)
    const s3 = dayjs('2026-10-05T10:00:00');
    const e3 = dayjs('2026-10-05T11:00:00');
    expect(isIntervalOverlap(s1, e1, s3, e3)).toBe(false);

    // Case 3: Hoàn toàn không giao nhau
    const s4 = dayjs('2026-10-05T11:00:00');
    const e4 = dayjs('2026-10-05T12:00:00');
    expect(isIntervalOverlap(s1, e1, s4, e4)).toBe(false);
  });

  it('phát hiện trùng lịch cá nhân (self_busy) và phòng họp (room_occupied)', () => {
    const proposedStart = dayjs('2026-10-05T09:15:00+07:00');
    const proposedEnd = dayjs('2026-10-05T10:15:00+07:00');

    const result = detectEventConflicts({
      proposedStart,
      proposedEnd,
      currentUserName: 'Nguyễn Minh Anh',
      selectedLocation: 'PH3A',
      existingEvents: mockExistingEvents,
    });

    expect(result.hasConflict).toBe(true);
    expect(result.selfConflictCount).toBeGreaterThan(0);
    expect(result.roomConflictCount).toBeGreaterThan(0);

    const roomConflict = result.conflicts.find((c) => c.type === 'room_occupied');
    expect(roomConflict).toBeDefined();
    expect(roomConflict?.severity).toBe('error');
    expect(roomConflict?.message).toContain('PH3A');
  });

  it('phát hiện trùng lịch của đồng nghiệp được chọn (attendee_busy)', () => {
    const proposedStart = dayjs('2026-10-05T14:30:00+07:00');
    const proposedEnd = dayjs('2026-10-05T15:00:00+07:00');

    const result = detectEventConflicts({
      proposedStart,
      proposedEnd,
      currentUserName: 'Nguyễn Minh Anh',
      selectedParticipants: ['Đỗ Quang Huy'],
      existingEvents: mockExistingEvents,
    });

    expect(result.hasConflict).toBe(true);
    expect(result.attendeeConflictCount).toBe(1);

    const attendeeConflict = result.conflicts.find((c) => c.type === 'attendee_busy');
    expect(attendeeConflict).toBeDefined();
    expect(attendeeConflict?.message).toContain('Đỗ Quang Huy');
  });

  it('gợi ý khung giờ trống khả dụng tiếp theo khi có trùng lịch (suggestedSlot)', () => {
    const proposedStart = dayjs('2026-10-05T09:00:00+07:00');
    const proposedEnd = dayjs('2026-10-05T10:00:00+07:00');

    const slot = findSuggestedSlot({
      proposedStart,
      proposedEnd,
      currentUserName: 'Nguyễn Minh Anh',
      selectedLocation: 'PH3A',
      existingEvents: mockExistingEvents,
    });

    expect(slot).toBeDefined();
    expect(slot?.startAt).toBeDefined();
    expect(slot?.label).toBeTruthy();
  });
});

describe('Milestone 1: SmartTimePicker Component (Custom Antd DatePicker)', () => {
  it('không hiển thị các chip gợi ý rườm rà (chuẩn theo yêu cầu người dùng)', () => {
    const handleChange = vi.fn();
    render(
      <SmartTimePicker
        value={dayjs('2026-10-05T09:00:00+07:00')}
        onChange={handleChange}
        ticketType="MEETING"
        existingEvents={[]}
      />,
    );

    // Tuyệt đối không hiển thị các chip gợi ý rườm rà
    expect(screen.queryByText(/Hôm nay \(/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ngày mai \(/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Thứ Hai tới \(/i)).not.toBeInTheDocument();
    expect(screen.queryByText('30 phút')).not.toBeInTheDocument();
    expect(screen.queryByText('45 phút')).not.toBeInTheDocument();
    expect(screen.queryByText('60 phút')).not.toBeInTheDocument();
  });

  it('render Ant Design DatePicker tinh gọn với icon lịch và placeholder rõ ràng', () => {
    const { container } = render(
      <SmartTimePicker
        value={dayjs('2026-10-05T09:00:00+07:00')}
        ticketType="TASK"
        existingEvents={[]}
      />,
    );

    const picker = container.querySelector('.jt-custom-datepicker');
    expect(picker).toBeInTheDocument();
    expect(container.querySelector('.anticon-calendar')).toBeInTheDocument();
  });

  it('tuân thủ chuẩn Anti-AI: tuyệt đối không có border-left trang trí', () => {
    const { container } = render(
      <SmartTimePicker
        value={dayjs('2026-10-05T09:30:00+07:00')}
        ticketType="MEETING"
        selectedLocation="PH3A"
        existingEvents={mockExistingEvents}
      />,
    );

    const allElements = container.querySelectorAll('*');
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const borderLeftWidth = Number.parseFloat(style.borderLeftWidth) || 0;
      if (borderLeftWidth > 2) {
        expect(style.borderLeftStyle).not.toBe('solid');
      }
    });
  });

  it('bảo toàn hàm Dayjs.prototype.date(), không bị đè thuộc tính date làm lỗi rc-picker', () => {
    let capturedVal = dayjs();
    const handleChange = vi.fn((val) => {
      capturedVal = val;
    });

    // Giả lập value bị lỗi đè thuộc tính date bằng Object
    const brokenInput = Object.assign(dayjs('2026-10-05T09:30:00+07:00'), {
      date: dayjs('2026-10-05T00:00:00+07:00'),
    });

    const { container } = render(
      <SmartTimePicker
        value={brokenInput}
        ticketType="TASK"
        onChange={handleChange}
      />,
    );

    const input = container.querySelector('input')!;
    expect(input).toBeInTheDocument();
    expect(input.value).toContain('05/10/2026');
  });

  it('cho phép click chọn ngày và giờ trong popup mà không bị crash date.date is not a function', async () => {
    const user = userEvent.setup();
    let capturedVal = dayjs();
    const handleChange = vi.fn((val) => {
      capturedVal = val;
    });

    const { container } = render(
      <SmartTimePicker
        value={dayjs('2026-10-05T09:30:00+07:00')}
        allowPast={true}
        ticketType="TASK"
        onChange={handleChange}
      />,
    );

    const input = container.querySelector('input')!;
    await user.click(input);

    // Tìm ô ngày trong popup và click chọn
    const dateCell = await screen.findByTitle('2026-10-06');
    expect(dateCell).toBeInTheDocument();
    await user.click(dateCell);

    // Click nút OK trong footer để xác nhận thời gian đã chọn
    const okBtn = await screen.findByRole('button', { name: /ok/i });
    expect(okBtn).toBeInTheDocument();
    await user.click(okBtn);

    // Đảm bảo không ném lỗi TypeError và giá trị trả về có hàm date() hợp lệ
    expect(handleChange).toHaveBeenCalled();
    expect(typeof capturedVal.date).toBe('function');
    expect(capturedVal.date()).toBe(6);
  });

  it('mặc định là thời gian hiện tại khi không truyền value', () => {
    const { container } = render(
      <SmartTimePicker ticketType="TASK" />,
    );
    const input = container.querySelector('input')!;
    expect(input).toBeInTheDocument();
    expect(input.value).toContain(dayjs().format('DD/MM/YYYY'));
  });

  it('validate chỉ cho chọn thời gian hiện tại và tương lai (vô hiệu hóa ngày quá khứ)', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SmartTimePicker ticketType="TASK" />,
    );
    const input = container.querySelector('input')!;
    await user.click(input);

    // Ngày hôm qua phải có class ant-picker-cell-disabled
    const yesterday = dayjs().subtract(1, 'day');
    const yesterdayCell = await screen.findByTitle(yesterday.format('YYYY-MM-DD'));
    expect(yesterdayCell).toBeInTheDocument();
    expect(yesterdayCell).toHaveClass('ant-picker-cell-disabled');
  });
});

describe('Milestone 1: SmartParticipantPicker Component (Clean Multi-Select)', () => {
  it('render danh sách tag đã chọn với avatar initials và nút xóa ✕', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <SmartParticipantPicker
        value={['Trần Thu Hà', 'Lê Thanh Vân']}
        onChange={handleChange}
      />,
    );

    expect(screen.getByText('Trần Thu Hà')).toBeInTheDocument();
    expect(screen.getByText('Lê Thanh Vân')).toBeInTheDocument();

    const tagAvatars = container.querySelectorAll('.jt-tag-avatar');
    expect(tagAvatars.length).toBe(2);
    expect(tagAvatars[0].textContent).toBe('TH');
    expect(tagAvatars[1].textContent).toBe('LV');
  });

  it('render Ant Design Select với placeholder tìm kiếm thành phần', () => {
    render(
      <SmartParticipantPicker
        value={[]}
        placeholder="Chọn hoặc tìm kiếm thành phần..."
      />,
    );

    expect(screen.getByText('Chọn hoặc tìm kiếm thành phần...')).toBeInTheDocument();
  });

  it('chọn thành phần không cần nhóm: chỉ hiển thị nhân sự cá nhân, không có optgroup nhóm', () => {
    const { container } = render(
      <SmartParticipantPicker
        value={[]}
        placeholder="Chọn nhân sự tham gia..."
      />,
    );

    // Tuyệt đối không có phân nhóm "Nhóm tòa soạn", "Cộng tác thường xuyên"
    expect(screen.queryByText(/Cộng tác thường xuyên/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nhóm tòa soạn/i)).not.toBeInTheDocument();
    expect(container.querySelector('.ant-select-item-group')).toBeNull();
  });

  it('tuân thủ Anti-AI: không chứa thuộc tính border-left trang trí', () => {
    const { container } = render(
      <SmartParticipantPicker
        value={['Nguyễn Minh Anh', 'Trần Thu Hà']}
      />,
    );

    const allElements = container.querySelectorAll('*');
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const borderLeftWidth = Number.parseFloat(style.borderLeftWidth) || 0;
      if (borderLeftWidth > 2) {
        expect(style.borderLeftStyle).not.toBe('solid');
      }
    });
  });
});
