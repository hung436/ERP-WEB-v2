import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/testUtils';

describe('Bộ lọc Mail', () => {
  it('lọc danh sách thư chưa đọc', async () => {
    const user = userEvent.setup(); const { container } = renderApp('/mail', true);
    await waitFor(() => expect(container.querySelectorAll('.mail-row')).toHaveLength(15));
    await user.click(screen.getByText('Chưa đọc'));
    await waitFor(() => expect(container.querySelectorAll('.mail-row')).toHaveLength(10));
  });
});
