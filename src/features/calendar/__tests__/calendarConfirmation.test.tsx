import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useCalendarConfirmation } from '../useCalendarConfirmation';

function ConfirmationExample({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const { confirm, confirmationHolder } = useCalendarConfirmation();
  return (
    <>
      {confirmationHolder}
      <button onClick={() => confirm({ title: 'Xóa nhóm?', content: 'Nhóm thử nghiệm', onConfirm })}>
        Xóa nhóm
      </button>
    </>
  );
}

describe('Popup xác nhận Lịch làm việc', () => {
  it('focus Hủy và đóng bằng Escape mà không gọi thao tác', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(async () => {});
    render(<ConfirmationExample onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Xóa nhóm' }));
    const popup = await screen.findByRole('dialog');
    expect(within(popup).getByText('Nhóm thử nghiệm')).toBeInTheDocument();
    await waitFor(() => expect(within(popup).getByRole('button', { name: 'Hủy' })).toHaveFocus());
    fireEvent.keyDown(within(popup).getByRole('button', { name: 'Hủy' }), { key: 'Escape', keyCode: 27 });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('chặn gửi lặp trong lúc lưu và giữ popup để thử lại khi lưu lỗi', async () => {
    const user = userEvent.setup();
    let rejectFirst!: (error: Error) => void;
    const onConfirm = vi.fn<() => Promise<void>>()
      .mockImplementationOnce(() => new Promise((_, reject) => { rejectFirst = reject; }))
      .mockResolvedValueOnce(undefined);
    render(<ConfirmationExample onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Xóa nhóm' }));
    const popup = await screen.findByRole('dialog');
    const confirm = within(popup).getByRole('button', { name: 'Xóa' });
    await user.dblClick(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(within(popup).getByRole('button', { name: 'Hủy' })).toBeDisabled();
    await act(async () => rejectFirst(new Error('Lỗi lưu')));
    expect(popup).toBeInTheDocument();
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
