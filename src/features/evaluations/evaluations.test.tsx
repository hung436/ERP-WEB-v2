import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

const selectMode = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  const radio = screen.queryByRole('radio', { name: new RegExp(label) });
  if (radio) {
    await user.click(radio);
  } else {
    await user.click(screen.getByRole('combobox', { name: 'Chế độ đánh giá' }));
    await user.click(await screen.findByText(label));
  }
};

describe('Workspace Đánh giá lao động', () => {
  it('chấm liên tục, cập nhật tổng điểm tức thì và ghi chú bằng modal', async () => {
    const user = userEvent.setup();
    renderApp('/evaluations', true);
    expect(await screen.findByRole('heading', { name: 'Đánh giá lao động' })).toBeInTheDocument();
    const stream = await screen.findByRole('region', { name: 'Danh sách tiêu chí đánh giá' });
    const rows = within(stream).getAllByRole('article');
    expect(rows).toHaveLength(30);

    const firstRow = rows[0];
    const initialTotal = Number(document.querySelector('.live-score')?.textContent ?? 0);
    const levels = within(firstRow).getByRole('radiogroup', { name: /Mức đánh giá: Thực hiện nhiệm vụ chuyên môn/ });
    await user.click(within(levels).getByRole('radio', { name: /Hoàn thành tốt/ }));
    const score = within(firstRow).getByLabelText(/Nhập điểm: Thực hiện nhiệm vụ chuyên môn/);
    await user.clear(score);
    await user.type(score, '40');
    expect(score).toHaveValue('40');
    expect(document.querySelector('.live-score')).toHaveTextContent(String(initialTotal + 2));

    await user.click(within(firstRow).getByRole('button', { name: 'Ghi chú' }));
    const dialog = await screen.findByRole('dialog', { name: 'Ghi chú tiêu chí' });
    await user.type(within(dialog).getByLabelText('Nội dung ghi chú'), 'Hoàn thành đúng tiến độ, có số liệu đối chiếu.');
    await user.click(within(dialog).getByRole('button', { name: 'Lưu ghi chú' }));
    expect(within(firstRow).getByRole('button', { name: 'Đã ghi chú' })).toBeInTheDocument();
  });

  it('chuyển sang chấm nhân viên trong cùng workspace và xem nhanh lịch sử điểm', async () => {
    const user = userEvent.setup();
    renderApp('/evaluations', true);
    await screen.findByRole('heading', { name: 'Đánh giá lao động' });
    await selectMode(user, 'Chấm nhân viên');
    await user.click(await screen.findByText(/Đỗ Quang Huy/));
    const firstRow = (await screen.findAllByRole('article'))[0];
    const history = within(firstRow).getByLabelText(/Bảng tổng hợp điểm các cấp: Thực hiện nhiệm vụ chuyên môn/);
    expect(within(history).getByText('Tự đánh giá')).toBeInTheDocument();
    expect(within(history).getByText('Phó phòng/ban')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hoàn tất chấm điểm' })).toBeInTheDocument();
  });

  it('Hội đồng xem lịch sử các cấp và chốt ngay trên cùng trang', async () => {
    const user = userEvent.setup();
    renderApp('/evaluations', true);
    await screen.findByRole('heading', { name: 'Đánh giá lao động' });
    await selectMode(user, 'Hội đồng đánh giá');
    await user.click((await screen.findAllByText(/Chấm điểm|Xem phiếu/))[0]);
    const firstRow = (await screen.findAllByRole('article'))[0];
    const history = within(firstRow).getByLabelText(/Bảng tổng hợp điểm các cấp: Thực hiện nhiệm vụ chuyên môn/);
    expect(within(history).getByText('Tự đánh giá')).toBeInTheDocument();
    expect(within(history).getByText('Phó phòng/ban')).toBeInTheDocument();
    expect(within(history).getByText('Trưởng phòng/ban')).toBeInTheDocument();
    expect(within(history).getByText('Ban biên tập')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chốt kết quả' })).toBeInTheDocument();
  });

  it('tài khoản admin có giao diện trang riêng không dùng popup', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'admin');
    await user.type(screen.getByLabelText('Mật khẩu'), '123456');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await user.click(await screen.findByRole('link', { name: /Đánh giá/i }));

    expect(await screen.findByText(/Quản trị viên/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Quản lý Kỳ & Mốc thời gian/i }));
    expect(await screen.findByText(/Khởi tạo Kỳ đánh giá & Thiết lập mốc thời gian/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Import Dữ liệu Excel\/CSV/i }));
    expect(await screen.findByText(/Import Danh sách Nhân viên/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Nhóm tiêu chí & Flowchart/i }));
    expect(await screen.findByText(/Sơ đồ Flow tiến trình chấm chi tiết theo cá nhân/i)).toBeInTheDocument();
  });

  it('Phiếu của tôi khi đã công bố sẽ xem được chi tiết điểm từng câu của từng cấp chấm, phương án chọn và ghi chú các cấp', async () => {
    renderApp('/evaluations?sheetId=eval-self-q2', true);
    await screen.findByRole('heading', { name: /Đánh giá lao động/i });
    const stream = await screen.findByRole('region', { name: 'Danh sách tiêu chí đánh giá' });
    const firstRow = (await within(stream).findAllByRole('article'))[0];

    // Verify History Header
    const history = within(firstRow).getByLabelText(/Bảng tổng hợp điểm các cấp: Thực hiện nhiệm vụ chuyên môn/);
    expect(within(history).getByText('Tự đánh giá')).toBeInTheDocument();
    expect(within(history).getByText('Phó phòng/ban')).toBeInTheDocument();
    expect(within(history).getByText('Trưởng phòng/ban')).toBeInTheDocument();
    expect(within(history).getByText('Ban biên tập')).toBeInTheDocument();
    expect(within(history).getByText('Hội đồng')).toBeInTheDocument();

    // Verify Option levels are visible
    const radioGroup = within(firstRow).getByRole('radiogroup', { name: /Mức đánh giá: Thực hiện nhiệm vụ chuyên môn/ });
    expect(within(radioGroup).getByText(/Hoàn thành tốt toàn bộ nhiệm vụ/i)).toBeInTheDocument();

    // Verify Stage Review Feed Card is displayed
    const auditFeed = within(firstRow).getByLabelText(/Chi tiết đánh giá các cấp: Thực hiện nhiệm vụ chuyên môn/);
    expect(within(auditFeed).getByText(/Đã hoàn thành 15 bài xuất bản/i)).toBeInTheDocument();
  });
});
