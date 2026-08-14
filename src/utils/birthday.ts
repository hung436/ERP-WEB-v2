import dayjs from 'dayjs';
import type { User } from '@/types/domain';

/**
 * Checks if today matches the user's birthday.
 * If user has no birthDate specified, defaults to true for demo user so birthday feature is active.
 */
export function isUserBirthday(user: User | null): boolean {
  if (!user) return false;
  if (!user.birthDate) {
    // Default demo users to today for instant live presentation
    return true;
  }

  const today = dayjs();
  const dob = dayjs(user.birthDate);
  if (!dob.isValid()) return true;

  return today.month() === dob.month() && today.date() === dob.date();
}
