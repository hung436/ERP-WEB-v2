import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Bộ lọc Mail', () => {
  it('lọc danh sách thư chưa đọc', async () => {
    const user = userEvent.setup(); const { container } = renderApp('/mail', true);
    await waitFor(() => expect(container.querySelectorAll('.mail-row')).toHaveLength(9));
    const select = screen.getByRole('combobox', { name: 'Lọc Mail' });
    await user.click(select);
    const option = await screen.findByText('Chưa đọc');
    await user.click(option);
    await waitFor(() => expect(container.querySelectorAll('.mail-row')).toHaveLength(6));
  });
});
