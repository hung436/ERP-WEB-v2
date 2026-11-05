import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { AuthProvider } from '@/features/auth/AuthContext';

import { CreatePersonalMeetingModal } from '../components/CreatePersonalMeetingModal';

describe('CreatePersonalMeetingModal Person Selection Flow', () => {
  it('cho phép chọn người qua popup modal khi tạo phiếu mà không bị lỗi', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <AuthProvider>
        <CreatePersonalMeetingModal
          open={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
          initialTicketType="TASK"
          existingEvents={[]}
        />
      </AuthProvider>
    );

    // Ở step 0, click chọn loại phiếu để vào form (step 1)
    const taskCard = screen.getByText('Phiếu công việc');
    await user.click(taskCard);

    // Tìm nút mở popup chọn thành phần
    const trigger = screen.getByRole('button', { name: /Chọn thành phần/i });
    expect(trigger).toBeTruthy();

    await user.click(trigger);

    // Popup UserSelectionModal mở ra
    expect(await screen.findByText('Chọn thành phần thực hiện')).toBeInTheDocument();

    // Tìm danh sách checkbox nhân sự
    const checkboxes = document.querySelectorAll('.jt-user-item-checkbox input');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Chọn người thứ 1
    await user.click(checkboxes[0]);

    // Chọn người thứ 2
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]);
    }

    // Bỏ chọn người thứ 1 (click lại checkbox để bỏ chọn)
    await user.click(checkboxes[0]);

    // Bấm Xác nhận
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận/i });
    await user.click(confirmBtn);

    // Modal vẫn tồn tại bình thường, không crash
    expect(screen.getByText('Tạo mới')).toBeInTheDocument();
  });

  it('hỗ trợ chọn thành phần cuộc họp với SmartParticipantPicker', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <AuthProvider>
        <CreatePersonalMeetingModal
          open={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
          initialTicketType="MEETING"
          existingEvents={[]}
        />
      </AuthProvider>
    );

    // Vào form cuộc họp
    const meetingCard = screen.getByText('Lịch họp');
    await user.click(meetingCard);

    const participantSelect = document.body.querySelector('.jt-participant-select .ant-select-selector') as HTMLElement;
    expect(participantSelect).toBeTruthy();

    await user.click(participantSelect);

    const options = document.querySelectorAll('.jt-participant-popup .ant-select-item-option');
    expect(options.length).toBeGreaterThan(0);

    await user.click(options[0]);

    expect(screen.getByText('Tạo mới')).toBeInTheDocument();
  });
});
