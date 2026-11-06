import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

afterEach(() => localStorage.clear());

describe('Lưu dữ liệu demo Lịch làm việc', () => {
  it('khôi phục phiếu, thảo luận, tệp và trạng thái sau khi nạp lại mock API', async () => {
    const { calendarApi } = await import('@/services/api');
    const id = 'psn-task-mon-20261102';
    const { data: event } = await calendarApi.get(id);
    await calendarApi.addComment(id, 'Ghi chú để demo');
    await calendarApi.addAttachment(id, {
      id: 'demo-file', name: 'demo.txt', size: 4, type: 'text/plain', url: 'data:text/plain;base64,ZGVtbw==',
    });
    calendarApi.saveDemoChanges(event, { approvalStatus: 'APPROVED', isInterested: true });

    vi.resetModules();
    const { calendarApi: reloaded } = await import('@/services/api');
    const { data: saved } = await reloaded.get(id);
    expect(saved.approvalStatus).toBe('APPROVED');
    expect(saved.isInterested).toBe(true);
    expect(saved.comments).toEqual(expect.arrayContaining([expect.objectContaining({ content: 'Ghi chú để demo' })]));
    expect(saved.attachments).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'demo-file', url: 'data:text/plain;base64,ZGVtbw==' })]));

    await reloaded.delete(id);
    vi.resetModules();
    const { calendarApi: afterDelete } = await import('@/services/api');
    await expect(afterDelete.get(id)).rejects.toThrow();
  });

  it('giữ thông báo đã gửi và nhóm người nhận qua lần nạp lại', async () => {
    const { calendarNotificationApi, calendarGroupApi } = await import('@/services/api');
    const { data: notification } = await calendarNotificationApi.create({
      type: 'general_announcement', title: 'Thông báo demo', content: 'Nội dung demo',
      recipients: { targetType: 'all' }, sendMailCopy: false, applyWatermark: false, scheduledAt: '2026-11-08T09:00:00+07:00',
    });
    await calendarNotificationApi.send(notification.id);
    const { data: group } = await calendarGroupApi.create({ name: 'Nhóm demo', members: ['user-001'], status: 'active' });

    vi.resetModules();
    const api = await import('@/services/api');
    expect((await api.calendarNotificationApi.list()).data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: notification.id, status: 'sent' }),
    ]));
    expect((await api.calendarGroupApi.list()).data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: group.id, members: ['user-001'] }),
    ]));
  });
});
