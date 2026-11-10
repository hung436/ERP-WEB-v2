import { describe, expect, it } from 'vitest';

import { demoUsers } from '@/mocks/usersFixtures';

import { filterCalendarPeople, matchesCalendarPerson, resolveCalendarUserId } from '../calendarMembership';

describe('Định danh tài khoản trong Lịch làm việc', () => {
  const minhAnh = demoUsers.find((user) => user.username === 'minhanh')!;

  it('ưu tiên ID tài khoản và nhận cả ID danh bạ cũ', () => {
    expect(matchesCalendarPerson({ id: 'contact-user-001', name: 'Tên cũ' }, minhAnh)).toBe(true);
    expect(matchesCalendarPerson({ id: 'user-anhtu', name: minhAnh.fullName }, minhAnh)).toBe(false);
  });

  it('nhận tên khớp duy nhất trên phiếu cũ và bỏ qua liên hệ không có tài khoản', () => {
    expect(matchesCalendarPerson({ id: 'exec-0', name: 'Đ/c Nguyễn Minh Anh (Ban Thời sự)' }, minhAnh)).toBe(true);
    expect(resolveCalendarUserId('Tạ Minh Châu')).toBeUndefined();
  });

  it('loại người tạo, người ở nhóm kia và tên trùng theo cùng một ID', () => {
    const candidates = ['Nguyễn Minh Anh', 'Trần Thu Hà', 'Bùi Anh Tú', 'anhtu'];
    expect(filterCalendarPeople(candidates, (name) => name, ['nhanvien', 'Trần Thu Hà (Ban Nội dung)']))
      .toEqual(['Bùi Anh Tú']);
  });
});
