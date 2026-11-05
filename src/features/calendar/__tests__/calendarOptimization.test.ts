import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  plainText,
  searchText,
  eventTimeRange,
  eventDurationText,
  normalizeMeeting,
} from '../calendarWeekUtils';

describe('Tối ưu hóa Calendar & Trải nghiệm đọc nhanh', () => {
  it('plainText: fast-path xử lý chuỗi không có HTML nhanh chóng', () => {
    const normalText = 'Họp ban biên tập Tuổi Trẻ định kỳ';
    expect(plainText(normalText)).toBe(normalText);

    const htmlText = '<p>Nội dung <b>quan trọng</b></p>';
    expect(plainText(htmlText)).toContain('Nội dung');
    expect(plainText(htmlText)).toContain('quan trọng');
  });

  it('eventTimeRange: hiển thị khung giờ đầy đủ để người đọc quét nhanh', () => {
    const meetingWithEnd: any = {
      ticketType: 'MEETING',
      start: dayjs('2026-11-05 08:30:00'),
      end: dayjs('2026-11-05 10:00:00'),
    };
    expect(eventTimeRange(meetingWithEnd)).toBe('08:30 – 10:00');

    const meetingWithoutEnd: any = {
      ticketType: 'MEETING',
      start: dayjs('2026-11-05 08:30:00'),
      end: null,
    };
    expect(eventTimeRange(meetingWithoutEnd)).toBe('08:30');

    const taskEvent: any = {
      ticketType: 'TASK',
      start: dayjs('2026-11-05 08:00:00'),
      end: dayjs('2026-11-05 17:30:00'),
    };
    expect(eventTimeRange(taskEvent)).toBe('Hạn: 17:30');
  });

  it('eventDurationText: tính toán thời lượng dễ đọc bằng tiếng Việt', () => {
    const event90m: any = {
      start: dayjs('2026-11-05 08:30:00'),
      end: dayjs('2026-11-05 10:00:00'),
    };
    expect(eventDurationText(event90m)).toBe('1 giờ 30 phút');

    const event45m: any = {
      start: dayjs('2026-11-05 08:30:00'),
      end: dayjs('2026-11-05 09:15:00'),
    };
    expect(eventDurationText(event45m)).toBe('45 phút');

    const event2h: any = {
      start: dayjs('2026-11-05 08:00:00'),
      end: dayjs('2026-11-05 10:00:00'),
    };
    expect(eventDurationText(event2h)).toBe('2 giờ');
  });

  it('normalizeMeeting: gán searchIndex tính toán trước cho tìm kiếm tức thì', () => {
    const normalized = normalizeMeeting({
      id: 'opt-test-1',
      title: 'Họp Giao Ban Đầu Tuần',
      startAt: '2026-11-05T08:30:00',
      endAt: '2026-11-05T10:00:00',
      leader: 'Lê Xuân Trung',
      location: 'Phòng Họp A',
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.searchIndex).toBeDefined();
    // searchIndex không dấu, chữ thường
    expect(normalized?.searchIndex).toContain('giao ban');
    expect(normalized?.searchIndex).toContain('le xuan trung');
    expect(normalized?.searchIndex).toContain('phong hop a');

    // Tìm kiếm với searchText nhanh
    const query = searchText('Xuân Trung');
    expect(normalized?.searchIndex.includes(query)).toBe(true);
  });
});
