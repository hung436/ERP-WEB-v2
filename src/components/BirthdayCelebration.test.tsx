import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BirthdayCelebrationModal } from '@/components/BirthdayCelebrationModal';
import type { User } from '@/types/domain';

const mockUser: User = {
  id: 'user-001',
  username: 'nhanvien',
  fullName: 'Nguyễn Minh Anh',
  email: 'minhanh@noibo.vn',
  department: 'Ban Nội dung',
  position: 'Phóng viên',
  role: 'employee',
  birthDate: '1995-08-14',
};

describe('Birthday Celebration Feature', () => {
  it('hiển thị modal chúc mừng sinh nhật cá nhân hóa với lời chúc từ hệ thống', () => {
    render(
      <BirthdayCelebrationModal
        onClose={() => {}}
        open={true}
        user={mockUser}
      />
    );

    expect(screen.getByRole('heading', { name: /Chúc mừng sinh nhật/i })).toBeInTheDocument();
    expect(screen.getByText(/Kính chúc/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hệ thống kính chúc/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lời chúc từ Ban Biên tập/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hộp quà tòa soạn/i)).not.toBeInTheDocument();
  });

  it('cho phép tương tác thổi nến sinh nhật', () => {
    render(
      <BirthdayCelebrationModal
        onClose={() => {}}
        open={true}
        user={mockUser}
      />
    );

    // Initial state: Candle is burning
    const blowBtn = screen.getByRole('button', { name: /Thổi nến & Nhận điều ước/i });
    expect(blowBtn).toBeInTheDocument();

    // Click blow candle
    fireEvent.click(blowBtn);
    expect(screen.getByText(/Điều ước đã được gửi đi!/i)).toBeInTheDocument();
  });
});
