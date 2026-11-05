import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartParticipantPicker } from '../components/SmartParticipantPicker';

function Wrapper() {
  const [val, setVal] = useState<string[]>([]);
  return (
    <SmartParticipantPicker
      value={val}
      onChange={(newVal) => setVal(newVal)}
      placeholder="Chọn người..."
    />
  );
}

describe('SmartParticipantPicker Selection Stability', () => {
  it('không bị trắng trang (crash) khi chọn một người rồi chọn tiếp người khác', async () => {
    const user = userEvent.setup();
    const { container } = render(<Wrapper />);

    // Click select to open dropdown
    const select = container.querySelector('.ant-select-selector') as HTMLElement;
    expect(select).toBeTruthy();

    await user.click(select);

    // Find options in dropdown
    const options = document.querySelectorAll('.ant-select-item-option');
    expect(options.length).toBeGreaterThan(0);

    // Click first option
    await user.click(options[0]);

    // Click second option
    const optionsAfter = document.querySelectorAll('.ant-select-item-option');
    if (optionsAfter.length > 1) {
      await user.click(optionsAfter[1]);
    }

    // Verify both tags are present
    const tags = container.querySelectorAll('.jt-participant-tag:not(.jt-tag-rest)');
    expect(tags.length).toBe(2);
  });

  it('hiển thị nút Xác nhận/OK trong dropdown và đóng dropdown khi bấm', async () => {
    const user = userEvent.setup();
    const { container } = render(<Wrapper />);

    const select = container.querySelector('.ant-select-selector') as HTMLElement;
    await user.click(select);

    // Dropdown footer has confirm button
    const confirmBtn = document.querySelector('.jt-participant-confirm-btn') as HTMLElement;
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.textContent).toContain('Xác nhận');

    // Click confirm button to close dropdown
    await user.click(confirmBtn);

    // Dropdown should be closed (hidden)
    const hiddenDropdown = document.querySelector('.ant-select-dropdown-hidden');
    expect(hiddenDropdown).toBeTruthy();
  });
});
