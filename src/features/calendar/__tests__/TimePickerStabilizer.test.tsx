import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TimePickerStabilizer } from '../components/TimePickerStabilizer';

describe('TimePickerStabilizer', () => {
  it('ngăn chặn hiệu ứng giật/nhảy lên đầu (auto-scroll) khi click chọn mốc thời gian', () => {
    let mockScrollVal = 50;
    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    
    Object.defineProperty(Element.prototype, 'scrollTop', {
      configurable: true,
      get() { return mockScrollVal; },
      set(val: number) { mockScrollVal = val; },
    });

    try {
      const { container } = render(
        <TimePickerStabilizer>
          <div className="ant-picker-panel">
            <ul className="ant-picker-time-panel-column">
              <li className="ant-picker-time-panel-cell" data-value="0">00</li>
              <li className="ant-picker-time-panel-cell" data-value="1">01</li>
              <li className="ant-picker-time-panel-cell" data-value="2">02</li>
            </ul>
          </div>
        </TimePickerStabilizer>
      );

      const col = container.querySelector('.ant-picker-time-panel-column') as HTMLElement;
      const targetCell = col.children[1] as HTMLElement;

      // Click mousedown vào ô giờ
      act(() => {
        targetCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      // useScrollTo của rc-picker cố gắng gán scrollTop = 120
      act(() => {
        col.scrollTop = 120;
      });

      // Giá trị scroll thực tế không bị gán (vẫn giữ nguyên 50, đứng yên hoàn toàn)
      expect(mockScrollVal).toBe(50);

      // Khi người dùng lăn chuột (wheel), khóa được giải phóng
      act(() => {
        col.dispatchEvent(new WheelEvent('wheel', { bubbles: true }));
      });

      act(() => {
        col.scrollTop = 80;
      });

      // Scroll bình thường trở lại
      expect(mockScrollVal).toBe(80);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(Element.prototype, 'scrollTop', originalDescriptor);
      }
    }
  });

  it('tự động clamp popup vào trong màn hình khi bị tràn ra ngoài trên laptop (rect.top < 8)', () => {
    // Giả lập dropdown nằm trong container với top âm (-25px) giống ảnh chụp lỗi của người dùng
    const dropdownDiv = document.createElement('div');
    dropdownDiv.className = 'ant-picker-dropdown';
    dropdownDiv.style.top = '-25px';
    dropdownDiv.style.left = '100px';

    // Mock getBoundingClientRect trả về rect.top = -25px
    const simulatedTop = -25;
    dropdownDiv.getBoundingClientRect = () => ({
      top: simulatedTop,
      bottom: simulatedTop + 300,
      left: 100,
      right: 400,
      width: 300,
      height: 300,
      x: 100,
      y: simulatedTop,
      toJSON: () => {},
    });

    document.body.appendChild(dropdownDiv);

    try {
      render(
        <TimePickerStabilizer>
          <div className="ant-picker-panel">Panel Content</div>
        </TimePickerStabilizer>,
        { container: dropdownDiv }
      );

      // Sau khi TimePickerStabilizer mount, style.top phải được điều chỉnh để không bị âm
      // -25px + (8 - (-25)) = 8px
      const currentTop = parseFloat(dropdownDiv.style.top);
      expect(currentTop).toBeGreaterThanOrEqual(8);
    } finally {
      dropdownDiv.remove();
    }
  });
});

