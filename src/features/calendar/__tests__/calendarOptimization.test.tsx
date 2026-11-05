import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import {
  plainText,
  searchText,
  eventTimeRange,
  eventDurationText,
  normalizeMeeting,
} from '../calendarWeekUtils';
import { calendarApi } from '@/services/api';
import { AuthProvider } from '@/features/auth/AuthContext';
import { CalendarEventDetailPage } from '../CalendarEventDetailPage';

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
    expect(normalized?.searchIndex).toContain('giao ban');
    expect(normalized?.searchIndex).toContain('le xuan trung');
    expect(normalized?.searchIndex).toContain('phong hop a');

    const query = searchText('Xuân Trung');
    expect(normalized?.searchIndex.includes(query)).toBe(true);
  });

  it('calendarApi.get: tải thành công sự kiện động bbt-sat-0830-taphuan-20261107', async () => {
    const targetId = 'bbt-sat-0830-taphuan-20261107';
    const res = await calendarApi.get(targetId);

    expect(res).toBeDefined();
    expect(res.data).toBeDefined();
    expect(res.data.id).toBe(targetId);
    expect(res.data.title).toContain('Lớp tập huấn nội bộ');
    expect(res.data.location).toBe('HTT2');
    expect(res.data.organizer).toBe('Trung tâm Đào tạo');
  });

  it('CalendarEventDetailPage: mở trang chi tiết sự kiện bbt-sat-0830-taphuan-20261107 không bị lỗi "Không thể tải dữ liệu"', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/calendar/events/bbt-sat-0830-taphuan-20261107']}>
          <Routes>
            <Route path="/calendar/events/:id" element={<CalendarEventDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      // Phải render ra tiêu đề lớp tập huấn, không bị lỗi Không thể tải dữ liệu
      expect(screen.queryByText('Không thể tải dữ liệu')).toBeNull();
      expect(screen.getByText(/Lớp tập huấn nội bộ/i)).toBeInTheDocument();
    });
  });
});
