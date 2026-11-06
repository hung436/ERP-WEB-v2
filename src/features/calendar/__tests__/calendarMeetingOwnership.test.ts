import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

afterEach(() => localStorage.clear());

describe('Quyền sửa và xóa lịch họp cá nhân', () => {
  it('cho người tạo sửa xóa, chặn người tham gia và người duyệt sửa nội dung', async () => {
    const { authApi, calendarApi } = await import('@/services/api');
    await authApi.login('minhanh', '123456');
    const { data: meeting } = await calendarApi.create({
      title: 'Lịch kiểm tra quyền', ticketType: 'MEETING', scope: 'personal',
      participants: ['Bùi Anh Tú'],
      approvers: [{ id: 'user-xuantrung', name: 'Lê Xuân Trung', status: 'PENDING' }],
    });
    expect(meeting.organizerId).toBe('user-001');

    await authApi.login('anhtu', '123456');
    await expect(calendarApi.update(meeting.id, { title: 'Sửa trái quyền' })).rejects.toThrow('Chỉ người tạo');
    await expect(calendarApi.delete(meeting.id)).rejects.toThrow('Chỉ người tạo');

    await authApi.login('xuantrung', '123456');
    await expect(calendarApi.update(meeting.id, { title: 'Sửa trái quyền', approvalStatus: 'APPROVED' })).rejects.toThrow('Chỉ người tạo');
    await expect(calendarApi.update(meeting.id, { approvalStatus: 'APPROVED' })).resolves.toMatchObject({ data: { approvalStatus: 'APPROVED' } });

    await authApi.login('minhanh', '123456');
    await expect(calendarApi.update(meeting.id, { title: 'Lịch đã sửa' })).resolves.toMatchObject({ data: { title: 'Lịch đã sửa' } });
    await calendarApi.delete(meeting.id);
    await expect(calendarApi.get(meeting.id)).rejects.toThrow('Không tìm thấy sự kiện');
  });
});
