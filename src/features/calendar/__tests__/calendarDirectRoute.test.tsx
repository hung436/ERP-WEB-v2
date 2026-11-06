import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Calendar Direct Route Test - /calendar/:id', () => {
  it('truy cập trực tiếp /calendar/psn-task-wed-appr-20261104 sẽ render trang chi tiết, không bị 404 Không tìm thấy trang', async () => {
    renderApp('/calendar/psn-task-wed-appr-20261104', true);

    // Chờ tải xong trang chi tiết sự kiện
    await waitFor(() => {
      // Tuyệt đối không hiển thị trang 404
      expect(screen.queryByText('Không tìm thấy trang')).toBeNull();
      // Phải hiển thị tiêu đề của phiếu đề xuất
      expect(
        screen.getByText(/Tuyến bài kỷ niệm 50 năm Ngày Giải phóng miền Nam/i)
      ).toBeInTheDocument();
    });
  });
});
