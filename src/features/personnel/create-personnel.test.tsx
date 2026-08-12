import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { personnelApi } from '@/services/api';
import { renderApp } from '@/test/testUtils';

describe('Module Nhân sự - Tạo hồ sơ mới', () => {
  it('mock API tạo hồ sơ hoạt động chính xác với payload hợp lệ', async () => {
    const response = await personnelApi.create({
      fullName: 'Trần Văn Nam',
      employmentType: 'Biên chế chính thức',
      phone: '0909123456',
      department: 'Ban Biên tập',
      position: 'Phóng viên',
      isPrimaryAssignment: true,
      email: 'nam.tran@tuoitre.com.vn',
      participateEvaluation: true,
      isYouthUnionMember: true,
      isPartyMember: false,
      action: 'complete',
    });

    expect(response.success).toBe(true);
    expect(response.data?.code).toMatch(/^NV-2026-\d{3}$/);
    expect(response.data?.message).toContain('Trần Văn Nam');
  });

  it('báo lỗi nếu thiếu thông tin bắt buộc trong mock API', async () => {
    await expect(
      personnelApi.create({
        fullName: '',
        employmentType: '',
        phone: '',
        department: '',
        position: '',
        isPrimaryAssignment: true,
        email: '',
        participateEvaluation: false,
        isYouthUnionMember: false,
        isPartyMember: false,
        action: 'submit',
      })
    ).rejects.toThrow('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
  });

  it('render trang Tạo hồ sơ mới với đầy đủ các khối nhập liệu và nút tác vụ', async () => {
    renderApp('/personnel/create', true);

    expect(await screen.findByRole('heading', { name: /Tạo hồ sơ nhân sự mới/ })).toBeInTheDocument();
    expect(screen.getByText('Ảnh thẻ 3x4 & Thông tin cơ bản')).toBeInTheDocument();
    expect(screen.getByText('Đơn vị & Chức danh công tác')).toBeInTheDocument();
    expect(screen.getByText('Đối tượng lao động & Chế độ đoàn thể')).toBeInTheDocument();
    expect(screen.getByText('Chuyên môn & Căn cước công dân')).toBeInTheDocument();
    expect(screen.getByText('Thông tin liên hệ & Ghi chú')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Gửi hồ sơ' });
    const completeBtn = screen.getByRole('button', { name: 'Hoàn tất hồ sơ' });

    expect(submitBtn).toBeInTheDocument();
    expect(completeBtn).toBeInTheDocument();
  });
});
