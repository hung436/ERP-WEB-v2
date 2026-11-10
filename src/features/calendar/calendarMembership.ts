import { demoUsers } from '@/mocks/usersFixtures';
import type { CalendarEvent, User } from '@/types/domain';

function normalizeName(name: string) {
  return name.trim().toLowerCase()
    .replace(/^đ\/?c\s+/u, '').replace(/\s*\([^)]*\)\s*$/u, '').trim();
}

export function resolveCalendarUserId(name: string): string | undefined {
  const normalized = normalizeName(name);
  const matches = demoUsers.filter((user) =>
    [user.fullName, user.penName, user.username, ...(user.aliases ?? [])].some((value) => value && normalizeName(value) === normalized),
  );
  return matches.length === 1 ? matches[0].id : undefined;
}

export function matchesCalendarPerson(person: { id?: string | number; name: string }, user: User) {
  const id = String(person.id ?? '').replace(/^contact-/, '');
  if (id === user.id) return true;
  if (demoUsers.some((account) => account.id === id)) return false;
  return resolveCalendarUserId(person.name) === user.id;
}

export function getCalendarMembership(event: CalendarEvent, user: User) {
  const matchesName = (value?: string) => Boolean(value && matchesCalendarPerson({ name: value }, user));
  const matchesPerson = (person: { id: string | number; name: string }) => matchesCalendarPerson(person, user);

  return {
    isUserParticipant: !event.isDeclined && Boolean(
      matchesName(event.organizer) ||
      matchesName(event.leader) ||
      (event.participantIds
        ? event.participantIds.includes(user.id)
        : event.participants?.some(matchesName) || event.participantText?.split(/[,;\n]/).some(matchesName)) ||
      event.executors?.some(matchesPerson) ||
      (event.approver && matchesPerson(event.approver)) ||
      event.approvers?.some(matchesPerson) ||
      (event.consultants?.length
        ? event.consultants.some(matchesPerson)
        : matchesName(event.consultantName))
    ),
    isUserWatcher: !event.isDeclined && Boolean(event.watchers?.some(matchesPerson)),
  };
}

export function calendarPersonKey(name: string) {
  return resolveCalendarUserId(name) ?? normalizeName(name);
}

export function filterCalendarPeople<T>(
  people: T[],
  getName: (person: T) => string,
  excludedNames: string[],
) {
  const seen = new Set(excludedNames.map(calendarPersonKey));
  return people.filter((person) => {
    const key = calendarPersonKey(getName(person));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function isCalendarMeeting(event: CalendarEvent) {
  return event.ticketType === 'MEETING' || (!event.ticketType && event.type === 'meeting');
}

export function canManagePersonalMeeting(event: CalendarEvent, user?: User | null) {
  return Boolean(user && event.scope === 'personal' && isCalendarMeeting(event) &&
    matchesCalendarPerson({ id: event.organizerId, name: event.organizer }, user));
}