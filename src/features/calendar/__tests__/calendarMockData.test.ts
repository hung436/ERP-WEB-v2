import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { initialCalendarNotifications, initialRecipientGroups } from '@/mocks/calendarNotificationFixtures';
import { calendarEvents } from '@/mocks/fixtures';
import { demoUsers } from '@/mocks/usersFixtures';

import { resolveCalendarUserId } from '../calendarMembership';
import { getMockEditorialEvents, getMockPersonalEvents } from '../mockCalendarData';

describe('Tính nhất quán của dữ liệu mẫu Lịch làm việc', () => {
  const week = dayjs('2026-11-02');
  const accounts = new Map(demoUsers.map((user) => [user.id, user]));

  it('gắn vai trò trên lịch cá nhân với tài khoản đăng nhập, không trùng thành phần và theo dõi', () => {
    for (const event of getMockPersonalEvents(week)) {
      const owner = resolveCalendarUserId(event.organizer);
      expect(owner, event.title).toBeDefined();
      expect(event.participantCount).toBe(event.participants?.length);
      expect(event.participantIds).toHaveLength(event.participantCount ?? 0);
      expect(event.participantIds).not.toContain(owner);

      for (const person of [...(event.approvers ?? []), ...(event.consultants ?? []), ...(event.executors ?? []), ...(event.watchers ?? [])]) {
        expect(accounts.get(String(person.id))?.fullName, event.title).toBe(person.name);
      }
      for (const watcher of event.watchers ?? []) {
        expect(watcher.id).not.toBe(owner);
        expect(event.participantIds).not.toContain(watcher.id);
      }
    }
  });

  it('giữ ID và thời gian hợp lệ ở các nguồn lịch mẫu', () => {
    const events = [...calendarEvents, ...getMockEditorialEvents(week), ...getMockPersonalEvents(week)];
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
    for (const event of events) {
      expect(dayjs(event.startAt).isValid(), event.id).toBe(true);
      expect(dayjs(event.endAt).valueOf(), event.id).toBeGreaterThanOrEqual(dayjs(event.startAt).valueOf());
      if (event.isAdjusted) expect(event.adjustedNote?.trim(), event.id).toBeTruthy();
    }
  });

  it('danh sách nhận thông báo mẫu tham chiếu người có trong danh bạ tài khoản', () => {
    const recipients = [
      ...initialRecipientGroups.flatMap((group) => group.members),
      ...initialCalendarNotifications.flatMap((notice) => notice.recipients.individuals ?? []),
    ];
    for (const name of recipients) expect(resolveCalendarUserId(name), name).toBeDefined();
  });
});
