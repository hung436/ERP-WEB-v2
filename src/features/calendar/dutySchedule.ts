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
  // 1: Thứ Hai (12-10-2026)
  1: {
    leader: 'Anh Hoàng Nguyên',
    shifts: [
      { name: 'Ca 0', tkts: 'Bảo Châu' },
      { name: 'Ca 1', tkts: 'H.T.Hãn, Viễn Sự', btv: 'B.Dậu, K.Thoa' },
      { name: 'Ca 2', tkts: 'Minh Luận', btv: 'L.Anh, T.Mai' },
    ],
  },
  // 2: Thứ Ba (13-10-2026)
  2: {
    leader: 'Anh Đức Thọ',
    shifts: [
      { name: 'Ca 0', tkts: 'C.V.Kình' },
      { name: 'Ca 1', tkts: 'N.V.Hải, P.Huy', btv: 'H.Điệp, Ng.Quý' },
      { name: 'Ca 2', tkts: 'Đà Trang', btv: 'H.Trang, K.Nhung' },
    ],
  },
  // 3: Thứ Tư (14-10-2026)
  3: {
    leader: 'Anh Thái Bình',
    shifts: [
      { name: 'Ca 0', tkts: 'T.Liêm' },
      { name: 'Ca 1', tkts: 'Minh Luận, Q.Trung', btv: 'Cát Khuê, L.Anh' },
      { name: 'Ca 2', tkts: 'H.T.Hãn', btv: 'D.Thanh, B.Dậu' },
    ],
  },
  // 4: Thứ Năm (15-10-2026)
  4: {
    leader: 'Chị Ng.T.Hương',
    shifts: [
      { name: 'Ca 0', tkts: 'Đà Trang' },
      { name: 'Ca 1', tkts: 'M.Luận, Q.Trung', btv: 'T.Mai, H.Trang' },
      { name: 'Ca 2', tkts: 'Bảo Châu', btv: 'K.Nhung, H.Tươi' },
    ],
  },
  // 5: Thứ Sáu (16-10-2026)
  5: {
    leader: 'Anh Lê Cường',
    shifts: [
      { name: 'Ca 0', tkts: 'Ng.V.Hải' },
      { name: 'Ca 1', tkts: 'Phúc Huy, H.T.Hãn', btv: 'H.Điệp, L.Anh' },
      { name: 'Ca 2', tkts: 'C.V.Kình', btv: 'Đ.Tuyên, Hữu Khá' },
    ],
  },
  // 6: Thứ Bảy (17-10-2026)
  6: {
    leader: 'Anh Nguyễn Phan',
    shifts: [
      { name: 'Ca 0', tkts: 'T.Liêm' },
      { name: 'Ca 1', tkts: 'Ng.V.Hải', btv: 'Bích Dậu, Như Bình' },
      { name: 'Ca 2', tkts: 'Thanh Liêm', btv: 'Lan Anh, Đ.Tuyên' },
    ],
  },
  // 0: Chủ Nhật (18-10-2026)
  0: {
    leader: 'Anh Xuân Trung',
    shifts: [
      { name: 'Ca 0', tkts: 'Đà Trang' },
      { name: 'Ca 1', tkts: 'C.V.Kình', btv: 'Thùy Mai, Nguyễn Quý' },
      { name: 'Ca 2', tkts: 'Đà Trang', btv: 'H.Điệp, H.Trang' },
    ],
  },
};

// Tra cứu lịch trực cụ thể theo ngày (hỗ trợ cả tuần 05/10 và tuần 12/10)
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

  // Tuần 12/10/2026 - 18/10/2026 (Tuần 42 - theo 10.12.md)
  '2026-10-12': WEEKLY_DUTY_SCHEDULE[1],
  '2026-10-13': WEEKLY_DUTY_SCHEDULE[2],
  '2026-10-14': WEEKLY_DUTY_SCHEDULE[3],
  '2026-10-15': WEEKLY_DUTY_SCHEDULE[4],
  '2026-10-16': WEEKLY_DUTY_SCHEDULE[5],
  '2026-10-17': WEEKLY_DUTY_SCHEDULE[6],
  '2026-10-18': WEEKLY_DUTY_SCHEDULE[0],
};

export function getDayDutyInfo(date: Dayjs): DayDutyInfo {
  const dateStr = date.format('YYYY-MM-DD');
  if (DATE_DUTY_SCHEDULE[dateStr]) {
    return DATE_DUTY_SCHEDULE[dateStr];
  }
  const dayOfWeek = date.day();
  return WEEKLY_DUTY_SCHEDULE[dayOfWeek];
}
