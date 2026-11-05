import React, { useEffect, useRef } from 'react';

/**
 * TimePickerStabilizer - Triệt tiêu lỗi của Ant Design / rc-picker:
 *
 * 1. Triệt tiêu lỗi "click giờ tự động nhảy lên đầu" của rc-picker:
 *    Khi người dùng click chọn giờ hoặc phút, hook `useScrollTo` bên trong rc-picker tự động
 *    gọi `raf(doScroll)` và liên tục gán `ul.scrollTop = targetTop` để đưa item được chọn lên đỉnh cột.
 *    Điều này làm cả cột trượt giật dữ dội, khiến người dùng chóng mặt và mất dấu vị trí đang chọn.
 *    Giải pháp: Chặn setter `col.scrollTop` của animation trượt giật, giữ nguyên vị trí scroll hiện tại (đứng yên).
 *    Khi `useScrollTo` đọc `col.scrollTop`, trả về `targetOffset` để `dist <= 1`, khiến `rc-picker`
 *    lập tức gọi `stopScroll()` và hủy RAF ngay ở frame đầu tiên mà không tạo thêm bất kỳ bước cuộn nào.
 *
 * 2. Triệt tiêu lỗi "tràn popup ra ngoài màn hình trên laptop/màn hình nhỏ":
 *    rc-trigger tự động flip lên phía trên input khi không đủ khoảng trống bên dưới,
 *    nhưng nếu phía trên cũng hẹp thì đỉnh popup (Month/Year header) sẽ bị đẩy lên tọa độ âm (< 0),
 *    bị che khuất sau bookmark bar của trình duyệt.
 *    TimePickerStabilizer tự động đo getBoundingClientRect() và clamp tọa độ popup trong phạm vi viewport:
 *    - Đảm bảo rect.top >= 8px (luôn nhìn thấy đầy đủ header, mũi tên chuyển tháng, năm).
 *    - Đảm bảo rect.bottom <= window.innerHeight - 8px.
 *    - Tự động clamp lại khi resize, scroll hoặc khi rc-trigger cập nhật inline style.
 */
export const TimePickerStabilizer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    if (!originalDescriptor) return;

    const attachedCols = new WeakSet<HTMLElement>();
    const cleanups: Array<() => void> = [];

    const attachToColumn = (col: HTMLElement) => {
      if (attachedCols.has(col)) return;
      attachedCols.add(col);

      let isLocked = false;
      let unlockTimer: ReturnType<typeof setTimeout> | null = null;
      let targetOffset = 0;

      // Define instance property on col
      Object.defineProperty(col, 'scrollTop', {
        configurable: true,
        get() {
          if (isLocked) {
            return targetOffset;
          }
          return originalDescriptor.get!.call(this);
        },
        set(val: number) {
          if (isLocked) {
            // Block the programmatic scroll animation from jumping the column
            return;
          }
          originalDescriptor.set!.call(this, val);
        },
      });

      // When user clicks/mouses down on any time item:
      const handlePointerDown = (e: MouseEvent | PointerEvent) => {
        const target = e.target as HTMLElement;
        const cell = target.closest('li.ant-picker-time-panel-cell');
        if (!cell) return;

        // Calculate target offset relative to first item
        const firstLi = col.querySelector<HTMLElement>('li');
        if (cell && firstLi) {
          targetOffset = (cell as HTMLElement).offsetTop - firstLi.offsetTop;
        }

        isLocked = true;
        if (unlockTimer) clearTimeout(unlockTimer);
        unlockTimer = setTimeout(() => {
          isLocked = false;
        }, 400);
      };

      // If user scrolls using wheel, unlock immediately
      const handleWheel = () => {
        isLocked = false;
        if (unlockTimer) clearTimeout(unlockTimer);
      };

      col.addEventListener('pointerdown', handlePointerDown as EventListener, { capture: true, passive: true });
      col.addEventListener('mousedown', handlePointerDown as EventListener, { capture: true, passive: true });
      col.addEventListener('wheel', handleWheel, { passive: true });

      cleanups.push(() => {
        col.removeEventListener('pointerdown', handlePointerDown as EventListener, { capture: true });
        col.removeEventListener('mousedown', handlePointerDown as EventListener, { capture: true });
        col.removeEventListener('wheel', handleWheel);
        if (unlockTimer) clearTimeout(unlockTimer);
        try {
          delete (col as any).scrollTop;
        } catch {}
      });
    };

    // Scan existing columns
    root.querySelectorAll<HTMLElement>('.ant-picker-time-panel-column').forEach(attachToColumn);

    // Observe for new columns (e.g. RangePicker second panel, mode changes)
    const colObserver = new MutationObserver(() => {
      root.querySelectorAll<HTMLElement>('.ant-picker-time-panel-column').forEach(attachToColumn);
    });
    colObserver.observe(root, { childList: true, subtree: true });
    cleanups.push(() => colObserver.disconnect());

    // ─────────────────────────────────────────────────────────────
    // Viewport Boundary Clamping for the Popup Dropdown
    // ─────────────────────────────────────────────────────────────
    const getDropdown = (): HTMLElement | null =>
      (root.closest('.ant-picker-dropdown') ||
        document.querySelector('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)')) as HTMLElement | null;

    let attachedDropdown: HTMLElement | null = null;
    let styleObserver: MutationObserver | null = null;
    let isAdjusting = false;

    const clampPosition = () => {
      const dd = attachedDropdown || getDropdown();
      if (!dd || isAdjusting) return;
      const rect = dd.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const minTop = 8;
      const maxBottom = vh - 8;
      const minLeft = 8;
      const maxRight = vw - 8;

      let deltaY = 0;
      let deltaX = 0;

      // Clamp Y: Ưu tiên bảo đảm không bị khuất phần đỉnh header
      if (rect.top < minTop) {
        deltaY = minTop - rect.top;
      } else if (rect.bottom > maxBottom) {
        deltaY = maxBottom - rect.bottom;
        // Không đẩy lên nếu làm đỉnh bị vượt quá minTop
        if (rect.top + deltaY < minTop) {
          deltaY = minTop - rect.top;
        }
      }

      // Clamp X
      if (rect.left < minLeft) {
        deltaX = minLeft - rect.left;
      } else if (rect.right > maxRight) {
        deltaX = maxRight - rect.right;
        if (rect.left + deltaX < minLeft) {
          deltaX = minLeft - rect.left;
        }
      }

      if (Math.abs(deltaY) > 1 || Math.abs(deltaX) > 1) {
        isAdjusting = true;
        const currentTop = parseFloat(dd.style.top) || dd.offsetTop || 0;
        const currentLeft = parseFloat(dd.style.left) || dd.offsetLeft || 0;
        dd.style.top = `${Math.round(currentTop + deltaY)}px`;
        dd.style.left = `${Math.round(currentLeft + deltaX)}px`;
        requestAnimationFrame(() => {
          isAdjusting = false;
        });
      }
    };

    const attachDropdown = () => {
      const dd = getDropdown();
      if (!dd || dd === attachedDropdown) return;
      attachedDropdown = dd;

      clampPosition();

      styleObserver = new MutationObserver(() => {
        clampPosition();
      });
      styleObserver.observe(dd, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    };

    attachDropdown();
    const rafId = requestAnimationFrame(attachDropdown);
    const tId1 = setTimeout(attachDropdown, 30);
    const tId2 = setTimeout(attachDropdown, 120);

    window.addEventListener('resize', clampPosition, { passive: true });
    window.addEventListener('scroll', clampPosition, { passive: true, capture: true });

    cleanups.push(() => {
      cancelAnimationFrame(rafId);
      clearTimeout(tId1);
      clearTimeout(tId2);
      window.removeEventListener('resize', clampPosition);
      window.removeEventListener('scroll', clampPosition, true);
      if (styleObserver) styleObserver.disconnect();
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <div ref={wrapperRef} className="jt-time-picker-stabilizer" style={{ display: 'contents' }}>
      {children}
    </div>
  );
};
