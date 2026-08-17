import dayjs from 'dayjs';
import type { User } from '@/types/domain';

/**
 * Checks if today matches the user's birthday.
 * Configured to always return true so birthday celebration is active every day.
 */
export function isUserBirthday(user: User | null): boolean {
  if (!user) return false;

  // Fake: luôn kích hoạt sinh nhật mỗi ngày
  return true;

  /* Code kiểm tra ngày sinh nhật thực tế:
  if (!user.birthDate) {
    return true;
  }

  const today = dayjs();
  const dob = dayjs(user.birthDate);
  if (!dob.isValid()) return true;

  return today.month() === dob.month() && today.date() === dob.date();
  */
}
