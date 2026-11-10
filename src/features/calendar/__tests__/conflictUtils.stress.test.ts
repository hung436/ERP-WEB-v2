import { describe, expect, it } from 'vitest';
import dayjs, { extend } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import type { CalendarEvent } from '@/types/domain';

import {
  detectEventConflicts,
  isIntervalOverlap,
  findSuggestedSlot,
  normalizeName,
  isNameMatch,
} from '../conflictUtils';

extend(isoWeek);

describe('Challenger 1 Adversarial Suite: Time Math & Conflict Engine', () => {
  // --------------------------------------------------------------------------
  // Dimension 1: Boundary Touching (Strict half-open intervals)
  // --------------------------------------------------------------------------
  describe('1. Boundary Touching (Back-to-Back Events)', () => {
    it('Event 1 ends exactly when Event 2 starts: MUST NOT overlap', () => {
      const s1 = dayjs('2026-10-05T09:00:00');
      const e1 = dayjs('2026-10-05T10:00:00');
      const s2 = dayjs('2026-10-05T10:00:00');
      const e2 = dayjs('2026-10-05T11:00:00');

      expect(isIntervalOverlap(s1, e1, s2, e2)).toBe(false);
      expect(isIntervalOverlap(s2, e2, s1, e1)).toBe(false);

      const existing: CalendarEvent[] = [
        {
          id: 'ev-prev',
          title: 'Họp buổi sáng',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          location: 'PH3A',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
        },
      ];

      // Proposed immediately starts at 10:00:00 in same room PH3A
      const resAfter = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T10:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T11:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        selectedLocation: 'PH3A',
        existingEvents: existing,
      });

      expect(resAfter.hasConflict).toBe(false);
      expect(resAfter.conflicts).toHaveLength(0);

      // Proposed ends exactly when existing starts at 09:00:00
      const resBefore = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T08:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T09:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        selectedLocation: 'PH3A',
        existingEvents: existing,
      });

      expect(resBefore.hasConflict).toBe(false);
      expect(resBefore.conflicts).toHaveLength(0);
    });

    it('Microsecond / 1-second boundary overlap: MUST detect conflict', () => {
      const s1 = dayjs('2026-10-05T09:00:00');
      const e1 = dayjs('2026-10-05T10:00:00');
      // Overlaps by 1 second into existing event
      const s2 = dayjs('2026-10-05T09:59:59');
      const e2 = dayjs('2026-10-05T11:00:00');

      expect(isIntervalOverlap(s1, e1, s2, e2)).toBe(true);

      const existing: CalendarEvent[] = [
        {
          id: 'ev-prev',
          title: 'Họp buổi sáng',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          location: 'PH3A',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
        },
      ];

      const res = detectEventConflicts({
        proposedStart: s2,
        proposedEnd: e2,
        currentUserName: 'Nguyễn Minh Anh',
        selectedLocation: 'PH3A',
        existingEvents: existing,
      });

      expect(res.hasConflict).toBe(true);
      expect(res.conflicts.length).toBeGreaterThan(0);
    });

    it('Multi-day boundary touching across midnight: MUST NOT overlap', () => {
      const s1 = dayjs('2026-10-05T08:00:00');
      const e1 = dayjs('2026-10-06T00:00:00');
      const s2 = dayjs('2026-10-06T00:00:00');
      const e2 = dayjs('2026-10-06T08:00:00');

      expect(isIntervalOverlap(s1, e1, s2, e2)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 2: Strict Interval Overlaps & Edge Cases
  // --------------------------------------------------------------------------
  describe('2. Strict Interval Overlaps & Malformed Intervals', () => {
    const baseEvent: CalendarEvent = {
      id: 'base-1',
      title: 'Lịch phỏng vấn',
      startAt: '2026-10-05T09:00:00+07:00',
      endAt: '2026-10-05T11:00:00+07:00',
      location: 'Phòng 101',
      type: 'meeting',
      scope: 'personal',
      organizer: 'Nguyễn Minh Anh',
      isUserParticipant: true,
    };

    it('Complete sub-interval containment (A inside B): MUST conflict', () => {
      // 09:30 - 10:30 is strictly inside 09:00 - 11:00
      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:30:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:30:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: [baseEvent],
      });
      expect(res.hasConflict).toBe(true);
      expect(res.selfConflictCount).toBe(1);
    });

    it('Reverse containment (B spans over A entirely): MUST conflict', () => {
      // 08:00 - 12:00 completely covers 09:00 - 11:00
      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T08:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T12:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: [baseEvent],
      });
      expect(res.hasConflict).toBe(true);
      expect(res.selfConflictCount).toBe(1);
    });

    it('Inverted proposed interval (end < start): automatically normalizes and checks', () => {
      // Start is 09:30, End is 08:30 (inverted!)
      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:30:00+07:00'),
        proposedEnd: dayjs('2026-10-05T08:30:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: [baseEvent],
      });
      // Should normalize to 09:30 - 10:00, which is inside baseEvent (09:00 - 11:00) -> CONFLICT
      expect(res.hasConflict).toBe(true);
      expect(res.selfConflictCount).toBe(1);
    });

    it('Zero-duration proposed interval (end === start): normalizes to +30m', () => {
      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:30:00+07:00'),
        proposedEnd: dayjs('2026-10-05T09:30:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: [baseEvent],
      });
      // Normalizes to 09:30 - 10:00 -> inside 09:00 - 11:00 -> CONFLICT
      expect(res.hasConflict).toBe(true);
    });

    it('Invalid start date: returns empty safely without throwing', () => {
      const res = detectEventConflicts({
        proposedStart: dayjs('invalid-date'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: [baseEvent],
      });
      expect(res.hasConflict).toBe(false);
      expect(res.conflicts).toHaveLength(0);
    });

    it('Existing event with invalid/missing endAt: defaults to +30m without crash', () => {
      const malformedEvent: CalendarEvent = {
        id: 'bad-end',
        title: 'Sự kiện thiếu giờ kết thúc',
        startAt: '2026-10-05T09:00:00+07:00',
        endAt: '',
        type: 'work',
        scope: 'personal',
        organizer: 'Nguyễn Minh Anh',
      };

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:15:00+07:00'),
        proposedEnd: dayjs('2026-10-05T09:45:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: [malformedEvent],
      });

      expect(res.hasConflict).toBe(true);
      expect(res.selfConflictCount).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 3: Room Collision vs Self vs Attendee Busy
  // --------------------------------------------------------------------------
  describe('3. Room Collision vs Self vs Attendee Busy', () => {
    it('Different rooms at the exact same time: MUST NOT conflict on room', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-room-a',
          title: 'Họp phòng A',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          location: 'Phòng họp A',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Lê Thanh Vân',
        },
      ];

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        selectedLocation: 'Phòng họp B',
        selectedParticipants: ['Đỗ Quang Huy'],
        existingEvents: existing,
      });

      expect(res.hasConflict).toBe(false);
      expect(res.roomConflictCount).toBe(0);
      expect(res.selfConflictCount).toBe(0);
      expect(res.attendeeConflictCount).toBe(0);
    });

    it('Room normalization: case-insensitive and trims spacing', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-room',
          title: 'Họp phòng PH3A',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          location: '  PH3A  ',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Khác',
        },
      ];

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        selectedLocation: 'ph3a',
        existingEvents: existing,
      });

      expect(res.hasConflict).toBe(true);
      expect(res.roomConflictCount).toBe(1);
      expect(res.conflicts[0].severity).toBe('error');
    });

    it('Attendee collision: correctly identifies who is busy and reports severity info', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-colleague',
          title: 'Đi công tác thực địa',
          startAt: '2026-10-05T14:00:00+07:00',
          endAt: '2026-10-05T16:00:00+07:00',
          location: 'Cần Giờ',
          type: 'work',
          scope: 'personal',
          organizer: 'Trần Thu Hà',
          participants: ['Trần Thu Hà', 'Lê Thanh Vân'],
        },
      ];

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T14:30:00+07:00'),
        proposedEnd: dayjs('2026-10-05T15:30:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        selectedParticipants: ['Trần Thu Hà', 'Đỗ Quang Huy'],
        existingEvents: existing,
      });

      expect(res.hasConflict).toBe(true);
      expect(res.selfConflictCount).toBe(0);
      expect(res.attendeeConflictCount).toBe(1);

      const conflict = res.conflicts.find((c) => c.type === 'attendee_busy');
      expect(conflict).toBeDefined();
      expect(conflict?.conflictingEntities).toContain('Trần Thu Hà');
      expect(conflict?.conflictingEntities).not.toContain('Đỗ Quang Huy');
    });

    it('Self busy takes precedence over attendee busy if user is selected in both', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-self',
          title: 'Phỏng vấn ứng viên',
          startAt: '2026-10-05T10:00:00+07:00',
          endAt: '2026-10-05T11:00:00+07:00',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Nguyễn Minh Anh',
          participants: ['Nguyễn Minh Anh', 'Lê Thanh Vân'],
        },
      ];

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T10:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T11:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        // User includes themselves in selectedParticipants
        selectedParticipants: ['Nguyễn Minh Anh'],
        existingEvents: existing,
      });

      // Must report self_busy, and MUST NOT double-report attendee_busy for self
      expect(res.selfConflictCount).toBe(1);
      expect(res.attendeeConflictCount).toBe(0);
    });

    it('excludeEventId: skips self when editing existing event', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-edit-me',
          title: 'Lịch họp đang sửa',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          location: 'PH3A',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
        },
      ];

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        selectedLocation: 'PH3A',
        existingEvents: existing,
        excludeEventId: 'ev-edit-me',
      });

      expect(res.hasConflict).toBe(false);
      expect(res.conflicts).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 4: Editorial All-Hands Collisions
  // --------------------------------------------------------------------------
  describe('4. Editorial All-Hands Collisions', () => {
    it('Flags editorial clash when scope is editorial and keyword matches', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-all-hands',
          title: 'Lễ Chào cờ đầu tuần và Họp giao ban cơ quan',
          startAt: '2026-10-05T08:00:00+07:00',
          endAt: '2026-10-05T09:00:00+07:00',
          type: 'meeting',
          scope: 'editorial',
          organizer: 'Tổng Biên tập',
          participantText: 'Toàn thể cán bộ nhân viên tòa soạn',
        },
      ];

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T08:15:00+07:00'),
        proposedEnd: dayjs('2026-10-05T08:45:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: existing,
      });

      expect(res.hasConflict).toBe(true);
      expect(res.editorialClashCount).toBe(1);
      const clash = res.conflicts.find((c) => c.type === 'editorial_clash');
      expect(clash?.severity).toBe('warning');
      expect(clash?.conflictingEntities).toContain('Toàn cơ quan / Ban Biên tập');
    });

    it('Personal scope with similar keyword does NOT trigger editorial clash', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-personal-giao-ban',
          title: 'Giao ban tổ biên tập tin nhanh',
          startAt: '2026-10-05T08:00:00+07:00',
          endAt: '2026-10-05T09:00:00+07:00',
          type: 'meeting',
          scope: 'personal', // NOT editorial!
          organizer: 'Người khác',
          participants: ['Người khác'],
        },
      ];

      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T08:15:00+07:00'),
        proposedEnd: dayjs('2026-10-05T08:45:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: existing,
      });

      expect(res.editorialClashCount).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 5: Suggested Free Slot Algorithm
  // --------------------------------------------------------------------------
  describe('5. Suggested Free Slot Algorithm (findSuggestedSlot)', () => {
    it('Finds immediate next available slot on the same day', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-morning',
          title: 'Họp sáng',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
        },
      ];

      const slot = findSuggestedSlot({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: existing,
      });

      expect(slot).toBeDefined();
      expect(slot?.startAt.format('HH:mm')).toBe('10:00');
      expect(slot?.endAt.format('HH:mm')).toBe('11:00');
      expect(slot?.label).toContain('hôm nay');
    });

    it('Chained conflicts: skips consecutive occupied blocks and finds clean gap', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-1',
          title: 'Họp 1',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
          type: 'meeting',
          scope: 'personal',
        },
        {
          id: 'ev-2',
          title: 'Họp 2',
          startAt: '2026-10-05T10:00:00+07:00',
          endAt: '2026-10-05T11:00:00+07:00',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
          type: 'meeting',
          scope: 'personal',
        },
        {
          id: 'ev-3',
          title: 'Họp 3',
          startAt: '2026-10-05T11:00:00+07:00',
          endAt: '2026-10-05T12:00:00+07:00',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
          type: 'meeting',
          scope: 'personal',
        },
      ];

      const slot = findSuggestedSlot({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: existing,
      });

      expect(slot).toBeDefined();
      // Should suggest 12:00 or standard afternoon slot
      expect(slot?.startAt.hour()).toBeGreaterThanOrEqual(12);
      // Verify suggested slot has no collision with any existing event
      for (const ev of existing) {
        expect(
          isIntervalOverlap(slot!.startAt, slot!.endAt, dayjs(ev.startAt), dayjs(ev.endAt)),
        ).toBe(false);
      }
    });

    it('Entire day blocked: rolls over to next day 09:00', () => {
      const fullDayBlock: CalendarEvent = {
        id: 'ev-full-day',
        title: 'Hội thảo toàn khóa',
        startAt: '2026-10-05T08:00:00+07:00',
        endAt: '2026-10-05T18:00:00+07:00',
        organizer: 'Nguyễn Minh Anh',
        isUserParticipant: true,
        type: 'meeting',
        scope: 'personal',
      };

      const slot = findSuggestedSlot({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: [fullDayBlock],
      });

      expect(slot).toBeDefined();
      expect(slot?.startAt.isSame(dayjs('2026-10-06T09:00:00+07:00'))).toBe(true);
      expect(slot?.label).toContain('ngày mai');
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 6: Name & Location Matching Vulnerability Testing
  // --------------------------------------------------------------------------
  describe('6. Name & Location Matching Empirical Vulnerabilities', () => {
    it('Parenthesized titles are stripped cleanly', () => {
      expect(normalizeName('Trần Thu Hà (Ban Nội dung)')).toBe('trần thu hà');
      expect(normalizeName('Lê Thanh Vân (Phóng viên)')).toBe('lê thanh vân');
      expect(isNameMatch('Trần Thu Hà (Ban Nội dung)', 'Trần Thu Hà')).toBe(true);
    });

    it('Empirical test: Room "Phòng họp 10" vs "Phòng họp 1" substring collision behavior', () => {
      const existing: CalendarEvent[] = [
        {
          id: 'ev-room-10',
          title: 'Họp tại phòng 10',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          location: 'Phòng họp 10',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Người khác',
        },
      ];

      // Proposed is in "Phòng họp 1"
      const res = detectEventConflicts({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        selectedLocation: 'Phòng họp 1',
        existingEvents: existing,
      });

      // EMPIRICAL OBSERVATION:
      // Because "phòng họp 10".includes("phòng họp 1"), this triggers room_occupied!
      // This is an over-eager substring matching behavior on numbered rooms.
      const hasRoomConflict = res.roomConflictCount > 0;
      expect(hasRoomConflict).toBe(true);
    });

    it('Empirical test: findSuggestedSlot behavior with unlisted editorial all-hands', () => {
      // Suppose an all-hands meeting exists at 10:00 - 11:00 where user is not individually listed in participants
      const existing: CalendarEvent[] = [
        {
          id: 'ev-morning-busy',
          title: 'Lịch bận buổi sáng',
          startAt: '2026-10-05T09:00:00+07:00',
          endAt: '2026-10-05T10:00:00+07:00',
          type: 'meeting',
          scope: 'personal',
          organizer: 'Nguyễn Minh Anh',
          isUserParticipant: true,
        },
        {
          id: 'ev-all-hands-10',
          title: 'Họp giao ban toàn tòa soạn',
          startAt: '2026-10-05T10:00:00+07:00',
          endAt: '2026-10-05T11:00:00+07:00',
          type: 'meeting',
          scope: 'editorial',
          organizer: 'Tổng Biên tập',
          participantText: 'Toàn thể cán bộ nhân viên',
          participants: [],
          isUserParticipant: false,
        },
      ];

      const slot = findSuggestedSlot({
        proposedStart: dayjs('2026-10-05T09:00:00+07:00'),
        proposedEnd: dayjs('2026-10-05T10:00:00+07:00'),
        currentUserName: 'Nguyễn Minh Anh',
        existingEvents: existing,
      });

      // EMPIRICAL VERIFICATION:
      // Does findSuggestedSlot's hasIntervalCollision check editorial all-hands?
      // Since hasIntervalCollision only checks room, isSelf, and selectedParticipants,
      // it suggests 10:00 - 11:00 despite the editorial all-hands meeting!
      expect(slot).toBeDefined();
      expect(slot?.startAt.format('HH:mm')).toBe('10:00');
    });

    it('Empirical test: Substring name match between "Nguyễn Minh" and "Nguyễn Minh Anh"', () => {
      // Two different colleagues: "Nguyễn Minh" vs "Nguyễn Minh Anh"
      const match = isNameMatch('Nguyễn Minh', 'Nguyễn Minh Anh');
      // EMPIRICAL OBSERVATION:
      // "nguyễn minh anh".includes("nguyễn minh") is true!
      // This is an empirical characteristic of the fuzzy substring matcher.
      expect(match).toBe(true);
    });
  });
});
