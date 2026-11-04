import type { Dayjs } from 'dayjs';

export interface DutyShift {
  name: string; // 'Ca 0', 'Ca 1', 'Ca 2'
  tkts?: string;
  btv?: string;
}

export interface DayDutyInfo {
  leader: string;
  shifts: DutyShift[];
}

export const WEEKLY_DUTY_SCHEDULE: Record<number, DayDutyInfo> = {
  // 1: Thứ Hai (02-11-2026)
  1: {
    leader: 'Anh Nguyễn Hoàng Nguyên',
    shifts: [
      { name: 'Ca 0', tkts: 'Nguyễn Văn Hải' },
      { name: 'Ca 1', tkts: 'Nguyễn Viễn Sự, Lê Thanh Liêm', btv: 'Võ Thị Kim Nhung, Đỗ Thị Hồng Điệp' },
      { name: 'Ca 2', tkts: 'Nguyễn Thanh Liêm', btv: 'Phạm Nguyễn Hoài Trang, Dương Kim Thoa' },
    ],
  },
  // 2: Thứ Ba (03-11-2026)
  2: {
    leader: 'Nguyễn Thái Bình',
    shifts: [
      { name: 'Ca 0', tkts: 'Trương Bảo Châu' },
      { name: 'Ca 1', tkts: 'Võ Minh Luận, Phạm Văn Quen', btv: 'Đào Như Thùy Mai, Lê Trung Kiên' },
      { name: 'Ca 2', tkts: 'Nguyễn Văn Hải', btv: 'Nguyễn Hữu Khá, Nguyễn Đức Tuyên' },
    ],
  },
  // 3: Thứ Tư (04-11-2026)
  3: {
    leader: 'Lê Cao Cường',
    shifts: [
      { name: 'Ca 0', tkts: 'Nguyễn Thanh Liêm' },
      { name: 'Ca 1', tkts: 'Dương Đức Đà Trang, Lê Thanh Liêm', btv: 'Phạm Nguyễn Hoài Trang, Đào Thị Bích Dậu' },
      { name: 'Ca 2', tkts: 'Võ Minh Luận', btv: 'Nguyễn Thị Lan Anh, Nguyễn Thị Quý' },
    ],
  },
  // 4: Thứ Năm (05-11-2026)
  4: {
    leader: 'Nguyễn Hồng Minh',
    shifts: [
      { name: 'Ca 0', tkts: 'Cầm Văn Kình' },
      { name: 'Ca 1', tkts: 'Trương Bảo Châu, Phạm Quỳnh Trung', btv: 'Lê Thị Thái Hòa, Đào Như Thùy Mai' },
      { name: 'Ca 2', tkts: 'Dương Đức Đà Trang', btv: 'Nguyễn Duy Thanh, Phạm Nguyễn Hoài Trang' },
    ],
  },
  // 5: Thứ Sáu (06-11-2026)
  5: {
    leader: 'Đinh Đức Thọ',
    shifts: [
      { name: 'Ca 0', tkts: 'Nguyễn Thanh Liêm' },
      { name: 'Ca 1', tkts: 'Phạm Văn Quen, Lê Thanh Liêm', btv: 'Đỗ Thị Hồng Điệp, Trần Thị Hồng Tươi' },
      { name: 'Ca 2', tkts: 'Cầm Văn Kình', btv: 'Nguyễn Thị Lan Anh, Nguyễn Hữu Khá' },
    ],
  },
  // 6: Thứ Bảy (07-11-2026)
  6: {
    leader: 'Nguyễn Hồng Minh',
    shifts: [
      { name: 'Ca 0', tkts: 'Dương Đức Đà Trang' },
      { name: 'Ca 1', tkts: 'Nguyễn Văn Hải', btv: 'Đào Như Thùy Mai, Võ Thị Kim Nhung' },
      { name: 'Ca 2', tkts: 'Trương Bảo Châu', btv: 'Trần Thị Hồng Tươi, Đào Thị Bích Dậu' },
    ],
  },
  // 0: Chủ Nhật (08-11-2026)
  0: {
    leader: 'Lê Xuân Trung',
    shifts: [
      { name: 'Ca 0', tkts: 'Võ Minh Luận' },
      { name: 'Ca 1', tkts: 'Nguyễn Thanh Liêm', btv: 'Nguyễn Thị Quý, Nguyễn Thị Lan Anh' },
      { name: 'Ca 2', tkts: 'Cầm Văn Kình', btv: 'Đoàn Từ Duy, Đỗ Thị Hồng Điệp' },
    ],
  },
};

// Tra cứu lịch trực cụ thể theo ngày (hỗ trợ cả tuần 05/10 và tuần 02/11)
export const DATE_DUTY_SCHEDULE: Record<string, DayDutyInfo> = {
  // Tuần 05/10/2026 - 11/10/2026 (Tuần 41)
  '2026-10-05': {
    leader: 'Anh Hoàng Nguyên',
    shifts: [
      { name: 'Ca 0', tkts: 'Đà Trang' },
      { name: 'Ca 1', tkts: 'Viễn Sự, N.V.Hải', btv: 'Lan Anh, H.Điệp' },
      { name: 'Ca 2', tkts: 'M.Luận', btv: 'K.Thoa, T.Mai' },
    ],
  },
  '2026-10-06': {
    leader: 'Anh Lê Xuân Trung',
    shifts: [
      { name: 'Ca 0', tkts: 'Quốc Thắng' },
      { name: 'Ca 1', tkts: 'Đức Thọ, Minh Cường', btv: 'Hải Triều, Văn Nam' },
      { name: 'Ca 2', tkts: 'Thành Luân', btv: 'Bích Ngọc, Tuyết Mai' },
    ],
  },
  '2026-10-07': {
    leader: 'Chị Đinh Thị Thảo',
    shifts: [
      { name: 'Ca 0', tkts: 'Quang Định' },
      { name: 'Ca 1', tkts: 'Đà Trang, Hoài Nam', btv: 'Lan Anh, Thu Hà' },
      { name: 'Ca 2', tkts: 'Viễn Sự', btv: 'H.Điệp, K.Thoa' },
    ],
  },
  '2026-10-08': {
    leader: 'Anh Bùi Thanh Liêm',
    shifts: [
      { name: 'Ca 0', tkts: 'Viễn Sự' },
      { name: 'Ca 1', tkts: 'N.V.Hải, M.Luận', btv: 'Văn Nam, Bích Ngọc' },
      { name: 'Ca 2', tkts: 'Quốc Thắng', btv: 'Tuyết Mai, Hải Triều' },
    ],
  },
  '2026-10-09': {
    leader: 'Anh Trần Xuân Toàn',
    shifts: [
      { name: 'Ca 0', tkts: 'M.Luận' },
      { name: 'Ca 1', tkts: 'Thành Luân, Đà Trang', btv: 'H.Điệp, Lan Anh' },
      { name: 'Ca 2', tkts: 'Đức Thọ', btv: 'K.Thoa, Thu Hà' },
    ],
  },
  '2026-10-10': {
    leader: 'Anh Đức Thọ',
    shifts: [
      { name: 'Ca 0', tkts: 'Hoài Nam' },
      { name: 'Ca 1', tkts: 'Quang Định, N.V.Hải', btv: 'Văn Nam, Hải Triều' },
      { name: 'Ca 2', tkts: 'Viễn Sự', btv: 'Bích Ngọc, Tuyết Mai' },
    ],
  },
  '2026-10-11': {
    leader: 'Anh Xuân Trung',
    shifts: [
      { name: 'Ca 0', tkts: 'Đà Trang' },
      { name: 'Ca 1', tkts: 'Quốc Thắng, M.Luận', btv: 'Lan Anh, H.Điệp' },
      { name: 'Ca 2', tkts: 'Thành Luân', btv: 'K.Thoa, T.Mai' },
    ],
  },

  // Tuần 02/11/2026 - 08/11/2026 (Lịch làm việc Ban Biên tập - Lịch điều chỉnh)
  '2026-11-02': WEEKLY_DUTY_SCHEDULE[1],
  '2026-11-03': WEEKLY_DUTY_SCHEDULE[2],
  '2026-11-04': WEEKLY_DUTY_SCHEDULE[3],
  '2026-11-05': WEEKLY_DUTY_SCHEDULE[4],
  '2026-11-06': WEEKLY_DUTY_SCHEDULE[5],
  '2026-11-07': WEEKLY_DUTY_SCHEDULE[6],
  '2026-11-08': WEEKLY_DUTY_SCHEDULE[0],
};

export function getDayDutyInfo(date: Dayjs): DayDutyInfo {
  const dateStr = date.format('YYYY-MM-DD');
  if (DATE_DUTY_SCHEDULE[dateStr]) {
    return DATE_DUTY_SCHEDULE[dateStr];
  }
  const dayOfWeek = date.day();
  return WEEKLY_DUTY_SCHEDULE[dayOfWeek];
}

/**
 * Kiểm tra xem ca trực đã kết thúc hay chưa.
 * Chỉ áp dụng theo ngày đã qua (day.isBefore(now, 'day')), không giảm riêng lẻ từng ca trong ngày.
 */
export function isShiftPast(day: Dayjs, _shiftName: string, now: Dayjs, isCurrentWeek: boolean): boolean {
  if (!isCurrentWeek) return false;
  return day.isBefore(now, 'day');
}

/**
 * Kiểm tra xem ngày trực lãnh đạo đã kết thúc hay chưa (chỉ áp dụng trong tuần hiện tại)
 */
export function isDayDutyPast(day: Dayjs, now: Dayjs, isCurrentWeek: boolean): boolean {
  if (!isCurrentWeek) return false;
  return day.isBefore(now, 'day');
}
