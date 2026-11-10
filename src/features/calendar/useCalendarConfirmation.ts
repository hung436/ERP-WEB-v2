import { Modal } from 'antd';

interface CalendarConfirmation {
  title: string;
  content?: string;
  okText?: string;
  onConfirm: () => void | Promise<void>;
  fallbackFocus?: string;
}

export function useCalendarConfirmation() {
  const [modal, confirmationHolder] = Modal.useModal();

  const confirm = ({ title, content, okText = 'Xóa', onConfirm, fallbackFocus }: CalendarConfirmation) => {
    const trigger = document.activeElement;
    let pending: Promise<void> | undefined;
    const focusFallback = () => {
      const fallback = (fallbackFocus && document.querySelector<HTMLElement>(fallbackFocus))
        || document.querySelector<HTMLElement>('[data-calendar-day]:not(:disabled)');
      fallback?.focus({ preventScroll: true });
    };
    const dialog = modal.confirm({
      title,
      content,
      okText,
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      autoFocusButton: 'cancel',
      centered: true,
      zIndex: 1100,
      maskClosable: false,
      afterClose: () => {
        if (trigger instanceof HTMLElement && trigger.isConnected && trigger.getClientRects().length) {
          trigger.focus({ preventScroll: true });
        } else {
          focusFallback();
        }
      },
      onOk: () => {
        if (pending) return pending;
        dialog.update({ cancelButtonProps: { disabled: true }, keyboard: false });
        pending = Promise.resolve().then(onConfirm).then(() => {
          requestAnimationFrame(() => {
            if (trigger instanceof HTMLElement && !trigger.isConnected && document.activeElement === document.body) {
              focusFallback();
            }
          });
        }).catch((error: unknown) => {
          pending = undefined;
          dialog.update({ cancelButtonProps: { disabled: false }, keyboard: true });
          throw error;
        });
        return pending;
      },
    });
    // Ant Design keeps the dialog open on rejection and leaves error reporting to the caller.
    void Promise.resolve(dialog);
  };

  return { confirm, confirmationHolder };
}
