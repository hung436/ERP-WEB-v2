import dayjs, { extend, type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import type { CalendarEvent } from '@/types/domain';

import type {
  ConflictCheckResult,
  ConflictItem,
  SuggestedSlot,
} from './types/timeConflict';

extend(isoWeek);

/**
 * Clean and normalize a member or attendee name for comparison.
 * Removes parenthesized titles like "(Ban Nội dung)", "(Phóng viên)", extra spaces, and diacritic casing.
 */
export function normalizeName(name?: unknown): string {
  if (!name) return '';
  const object = typeof name === 'object' && name !== null ? name as Record<string, unknown> : {};
  const str = typeof name === 'string' ? name : String(object.name || object.label || object.value || '');
  return str
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Fuzzy diacritic and substring match for names.
 */
export function isNameMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const normA = normalizeName(a);
  const normB = normalizeName(b);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.length >= 3 && normB.includes(normA)) return true;
  if (normB.length >= 3 && normA.includes(normB)) return true;
  return false;
}

/**
 * Normalize location string for room collision checking.
 */
export function normalizeLocation(loc?: string): string {
  if (!loc) return '';
  return loc.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Checks whether two time intervals strictly overlap.
 * Touching boundaries (s1 === e2 or s2 === e1) do NOT overlap.
 */
export function isIntervalOverlap(s1: Dayjs, e1: Dayjs, s2: Dayjs, e2: Dayjs): boolean {
  return s1.isBefore(e2) && s2.isBefore(e1);
}

export interface DetectEventConflictsParams {
  proposedStart: Dayjs;
  proposedEnd: Dayjs;
  currentUserName?: string;
  selectedParticipants?: string[];
  selectedLocation?: string;
  existingEvents?: CalendarEvent[];
  excludeEventId?: string;
}

/**
 * Pure conflict detection engine.
 * Evaluates 4 multi-dimensional collision categories:
 * 1. room_occupied: physical room is already booked
 * 2. editorial_clash: clashes with agency-wide or editorial board meetings
 * 3. self_busy: current user already has a conflicting assignment
 * 4. attendee_busy: one or more selected colleagues are booked elsewhere
 */
export function detectEventConflicts({
  proposedStart,
  proposedEnd,
  currentUserName = 'Nguyễn Minh Anh',
  selectedParticipants = [],
  selectedLocation = '',
  existingEvents = [],
  excludeEventId,
}: DetectEventConflictsParams): ConflictCheckResult {
  if (!proposedStart || !proposedStart.isValid()) {
    return {
      hasConflict: false,
      conflicts: [],
      selfConflictCount: 0,
      attendeeConflictCount: 0,
      roomConflictCount: 0,
      editorialClashCount: 0,
    };
  }

  let effectiveEnd = proposedEnd;
  if (!effectiveEnd || !effectiveEnd.isValid() || effectiveEnd.isSame(proposedStart) || effectiveEnd.isBefore(proposedStart)) {
    effectiveEnd = proposedStart.add(30, 'minute');
  }

  const conflicts: ConflictItem[] = [];
  const normLocation = normalizeLocation(selectedLocation);
  const participantList = selectedParticipants.filter(Boolean);

  for (const ev of existingEvents) {
    if (excludeEventId && ev.id === excludeEventId) continue;
    if (!ev.startAt) continue;

    const evStart = dayjs(ev.startAt);
    if (!evStart.isValid()) continue;

    let evEnd = ev.endAt ? dayjs(ev.endAt) : evStart.add(30, 'minute');
    if (!evEnd.isValid() || evEnd.isSame(evStart) || evEnd.isBefore(evStart)) {
      evEnd = evStart.add(30, 'minute');
    }

    // Interval overlap condition: proposedStart < evEnd && evStart < proposedEnd
    if (!isIntervalOverlap(proposedStart, effectiveEnd, evStart, evEnd)) {
      continue;
    }

    const evParticipants = (ev.participants || [])
      .map((p) => p.trim())
      .filter(Boolean);
    const isEditorialScope = ev.scope === 'editorial';
    const evLocationNorm = normalizeLocation(ev.location);

    // 1. Physical Room Collision (Severity: error)
    if (normLocation && evLocationNorm && (normLocation === evLocationNorm || evLocationNorm.includes(normLocation) || normLocation.includes(evLocationNorm))) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt || evEnd.toISOString(),
        location: ev.location,
        type: 'room_occupied',
        severity: 'error',
        conflictingEntities: [ev.location || selectedLocation],
        message: `Phòng họp "${ev.location || selectedLocation}" đã có lịch "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: {
          scope: ev.scope,
          ticketType: ev.ticketType,
          organizer: ev.organizer,
        },
      });
    }

    // 2. Editorial All-Hands / Agency Meeting Clash (Severity: warning)
    const titleLower = ev.title.toLowerCase();
    const partTextLower = (ev.participantText || '').toLowerCase();
    const isAllHands =
      isEditorialScope &&
      (partTextLower.includes('tất cả') ||
        partTextLower.includes('toàn thể') ||
        titleLower.includes('chào cờ') ||
        titleLower.includes('họp ban biên tập') ||
        titleLower.includes('giao ban'));

    if (isAllHands) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt || evEnd.toISOString(),
        location: ev.location,
        type: 'editorial_clash',
        severity: 'warning',
        conflictingEntities: ['Toàn cơ quan / Ban Biên tập'],
        message: `Trùng với lịch chung tòa soạn: "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: {
          scope: ev.scope,
          ticketType: ev.ticketType,
          organizer: ev.organizer,
        },
      });
    }

    // 3. Current User Collision (Severity: warning)
    const isSelfBusy =
      ev.isUserParticipant ||
      isNameMatch(ev.organizer, currentUserName) ||
      isNameMatch(ev.leader, currentUserName) ||
      evParticipants.some((p) => isNameMatch(p, currentUserName)) ||
      (ev.executors || []).some((e) => isNameMatch(e.name, currentUserName));

    if (isSelfBusy) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt || evEnd.toISOString(),
        location: ev.location,
        type: 'self_busy',
        severity: 'warning',
        conflictingEntities: [currentUserName],
        message: `Bạn đang có lịch "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: {
          scope: ev.scope,
          ticketType: ev.ticketType,
          organizer: ev.organizer,
        },
      });
    }

    // 4. Attendee Collision (Severity: info)
    const busyAttendees = participantList.filter((p) => {
      // Skip if this attendee is the current user (already covered in self_busy)
      if (isNameMatch(p, currentUserName)) return false;

      return (
        isNameMatch(ev.organizer, p) ||
        isNameMatch(ev.leader, p) ||
        evParticipants.some((ep) => isNameMatch(ep, p)) ||
        (ev.executors || []).some((e) => isNameMatch(e.name, p))
      );
    });

    if (busyAttendees.length > 0) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt || evEnd.toISOString(),
        location: ev.location,
        type: 'attendee_busy',
        severity: 'info',
        conflictingEntities: busyAttendees,
        message: `${busyAttendees.join(', ')} bận lịch "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: {
          scope: ev.scope,
          ticketType: ev.ticketType,
          organizer: ev.organizer,
        },
      });
    }
  }

  // Deduplicate conflicts by id + type
  const seenKeys = new Set<string>();
  const uniqueConflicts = conflicts.filter((c) => {
    const key = `${c.id}__${c.type}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  const selfCount = uniqueConflicts.filter((c) => c.type === 'self_busy').length;
  const attendeeCount = uniqueConflicts.filter((c) => c.type === 'attendee_busy').length;
  const roomCount = uniqueConflicts.filter((c) => c.type === 'room_occupied').length;
  const editorialCount = uniqueConflicts.filter((c) => c.type === 'editorial_clash').length;

  let suggestedSlot: SuggestedSlot | undefined;
  if (uniqueConflicts.length > 0) {
    suggestedSlot = findSuggestedSlot({
      proposedStart,
      proposedEnd: effectiveEnd,
      currentUserName,
      selectedParticipants,
      selectedLocation,
      existingEvents,
      excludeEventId,
    });
  }

  return {
    hasConflict: uniqueConflicts.length > 0,
    conflicts: uniqueConflicts,
    selfConflictCount: selfCount,
    attendeeConflictCount: attendeeCount,
    roomConflictCount: roomCount,
    editorialClashCount: editorialCount,
    suggestedSlot,
  };
}

/**
 * Searches for an alternative clean time slot on the proposed date or nearby working hours.
 */
export function findSuggestedSlot({
  proposedStart,
  proposedEnd,
  currentUserName = 'Nguyễn Minh Anh',
  selectedParticipants = [],
  selectedLocation = '',
  existingEvents = [],
  excludeEventId,
}: DetectEventConflictsParams): SuggestedSlot | undefined {
  const duration = Math.max(30, proposedEnd.diff(proposedStart, 'minute'));

  // Helper to check if a specific candidate interval has any hard collision
  const hasIntervalCollision = (candStart: Dayjs, candEnd: Dayjs): boolean => {
    const normLoc = normalizeLocation(selectedLocation);
    for (const ev of existingEvents) {
      if (excludeEventId && ev.id === excludeEventId) continue;
      if (!ev.startAt) continue;

      const evStart = dayjs(ev.startAt);
      if (!evStart.isValid()) continue;

      let evEnd = ev.endAt ? dayjs(ev.endAt) : evStart.add(30, 'minute');
      if (!evEnd.isValid() || evEnd.isSame(evStart) || evEnd.isBefore(evStart)) {
        evEnd = evStart.add(30, 'minute');
      }

      if (!isIntervalOverlap(candStart, candEnd, evStart, evEnd)) continue;

      // Check room
      if (normLoc && ev.location && normalizeLocation(ev.location) === normLoc) {
        return true;
      }

      // Check self
      const isSelf =
        ev.isUserParticipant ||
        isNameMatch(ev.organizer, currentUserName) ||
        isNameMatch(ev.leader, currentUserName) ||
        (ev.participants || []).some((p) => isNameMatch(p, currentUserName));
      if (isSelf) return true;

      // Check attendees
      if (
        selectedParticipants.some(
          (p) =>
            isNameMatch(ev.organizer, p) ||
            isNameMatch(ev.leader, p) ||
            (ev.participants || []).some((ep) => isNameMatch(ep, p)),
        )
      ) {
        return true;
      }
    }
    return false;
  };

  // 1. Try subsequent slots starting from proposedEnd rounded to nearest 15/30 min
  let nextAttempt = proposedEnd;
  const rem = nextAttempt.minute() % 15;
  if (rem !== 0) {
    nextAttempt = nextAttempt.add(15 - rem, 'minute').second(0);
  }

  const endOfDayWork = proposedStart.hour(18).minute(0).second(0);
  while (!nextAttempt.add(duration, 'minute').isAfter(endOfDayWork)) {
    const candidateEnd = nextAttempt.add(duration, 'minute');
    if (!hasIntervalCollision(nextAttempt, candidateEnd)) {
      return {
        startAt: nextAttempt,
        endAt: candidateEnd,
        label: `${nextAttempt.format('HH:mm')} - ${candidateEnd.format('HH:mm')} (hôm nay)`,
      };
    }
    nextAttempt = nextAttempt.add(30, 'minute');
  }

  // 2. Try standard slots on the same day (morning 08:30 - 11:30, afternoon 13:30 - 17:30)
  const candidateHours = [
    { h: 8, m: 30 },
    { h: 9, m: 0 },
    { h: 9, m: 30 },
    { h: 10, m: 0 },
    { h: 10, m: 30 },
    { h: 11, m: 0 },
    { h: 13, m: 30 },
    { h: 14, m: 0 },
    { h: 14, m: 30 },
    { h: 15, m: 0 },
    { h: 15, m: 30 },
    { h: 16, m: 0 },
    { h: 16, m: 30 },
  ];

  for (const time of candidateHours) {
    const candStart = proposedStart.hour(time.h).minute(time.m).second(0);
    const candEnd = candStart.add(duration, 'minute');

    if (candEnd.hour() > 18 || (candEnd.hour() === 18 && candEnd.minute() > 0)) continue;
    // Don't test the exact slot that currently has conflicts
    if (candStart.isSame(proposedStart)) continue;

    if (!hasIntervalCollision(candStart, candEnd)) {
      return {
        startAt: candStart,
        endAt: candEnd,
        label: `${candStart.format('HH:mm')} - ${candEnd.format('HH:mm')} (cùng ngày)`,
      };
    }
  }

  // 3. Fallback: Next day at 09:00
  const nextDayStart = proposedStart.add(1, 'day').hour(9).minute(0).second(0);
  const nextDayEnd = nextDayStart.add(duration, 'minute');
  return {
    startAt: nextDayStart,
    endAt: nextDayEnd,
    label: `${nextDayStart.format('HH:mm')} - ${nextDayEnd.format('HH:mm')} ngày mai`,
  };
}
