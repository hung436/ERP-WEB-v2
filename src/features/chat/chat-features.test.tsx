import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { chatApi } from '@/services/api';
import { renderApp } from '@/test/testUtils';

describe('Tính năng cộng tác Chat', () => {
  it('soạn và gửi tin nhắn cùng tệp đính kèm trên giao diện', async () => {
    const user = userEvent.setup();
    renderApp('/chat', true);
    await screen.findByText('Tin nhắn');
    const input = await screen.findByLabelText('Soạn tin nhắn');
    await user.type(input, 'Tin nhắn kiểm thử từ giao diện');
    const file = new File(['noi dung tep'], 'ke-hoach.txt', { type: 'text/plain' });
    await user.upload(screen.getByLabelText('Chọn tệp đính kèm'), file);
    expect(await screen.findByText('ke-hoach.txt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Gửi' }));
    await waitFor(async () => expect((await chatApi.messages('chat-01')).data.some((item) => item.content === 'Tin nhắn kiểm thử từ giao diện')).toBe(true));
    expect((await screen.findAllByText('Tin nhắn kiểm thử từ giao diện')).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/text\/plain/)).toBeInTheDocument();
  }, 30000);

  it('hiển thị composer và thao tác reply, reaction, ghim trực tiếp trên giao diện', async () => {
    const user = userEvent.setup();
    renderApp('/chat', true);
    await screen.findByText('Tin nhắn');

    expect(screen.getByLabelText('Soạn tin nhắn')).toBeVisible();
    expect(screen.getAllByRole('button', { name: 'Tạo nhóm' })).toHaveLength(1);

    const pinButton = screen.getByRole('button', { name: /ghim hội thoại/i });
    const initialPinLabel = pinButton.getAttribute('aria-label');
    await user.click(pinButton);
    await waitFor(() => expect(screen.getByRole('button', { name: /ghim hội thoại/i }).getAttribute('aria-label')).not.toBe(initialPinLabel));

    await user.click(screen.getAllByRole('button', { name: /Trả lời tin nhắn của/i })[0]);
    expect(await screen.findByText(/Đang trả lời/)).toBeInTheDocument();
    expect(screen.getByLabelText('Soạn tin nhắn')).toHaveFocus();

    const reactionButton = screen.getAllByRole('button', { name: /Thả cảm xúc 👍/i })[0];
    await user.click(reactionButton);
    await waitFor(() => expect(screen.getByRole('button', { name: /Bỏ cảm xúc 👍/i })).toBeInTheDocument());
  }, 30000);

  it('mock API tạo nhóm, thêm/xóa thành viên và gửi file', async () => {
    const group = (await chatApi.createGroup('Nhóm kiểm thử API', ['user-002'])).data;
    expect(group.isGroup).toBe(true);
    expect(group.members.some((member) => member.id === 'user-002')).toBe(true);

    const added = (await chatApi.addMember(group.id, 'user-005')).data;
    expect(added.members.some((member) => member.id === 'user-005')).toBe(true);
    const removed = (await chatApi.removeMember(group.id, 'user-002')).data;
    expect(removed.members.some((member) => member.id === 'user-002')).toBe(false);

    const attachment = (await chatApi.uploadAttachment(group.id, { name: 'bao-cao.pdf', size: 2048, type: 'application/pdf' })).data;
    const sent = (await chatApi.sendMessage(group.id, 'Gửi báo cáo', attachment)).data;
    await waitFor(async () => expect((await chatApi.messages(group.id)).data.some((item) => item.attachment?.name === 'bao-cao.pdf')).toBe(true));
    const reply = (await chatApi.sendMessage(group.id, 'Đã nhận báo cáo', undefined, { id: sent.id, senderName: sent.senderName, content: sent.content })).data;
    expect(reply.replyTo?.id).toBe(sent.id);
    const reacted = (await chatApi.react(group.id, reply.id, '👍')).data;
    expect(reacted.reactions?.[0]).toMatchObject({ emoji: '👍', count: 1, reacted: true });
    const pinned = (await chatApi.togglePin(group.id)).data;
    expect(pinned.pinned).toBe(true);
    await chatApi.deleteMessage(group.id, reply.id);
    expect((await chatApi.messages(group.id)).data.some((item) => item.id === reply.id)).toBe(false);
  });

  it('mở thông tin nhóm và giao diện tạo nhóm', async () => {
    const user = userEvent.setup(); renderApp('/chat', true);
    await screen.findByText('Tin nhắn');
    await user.click(screen.getByRole('button', { name: /Nhóm Ban Nội dung/ }));
    await user.click(screen.getByRole('button', { name: 'Xem thông tin hội thoại' }));
    expect(await screen.findByText('Thông tin hội thoại')).toBeInTheDocument();
    expect(screen.getByText('Thành viên nhóm')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Đóng thông tin hội thoại' }));
    await user.click(screen.getByRole('button', { name: 'Tạo nhóm' }));
    expect(await screen.findByText('Tạo nhóm mới')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên nhóm')).toBeInTheDocument();
    expect(screen.getByLabelText('Thành viên')).toBeInTheDocument();
  }, 20000);
});
