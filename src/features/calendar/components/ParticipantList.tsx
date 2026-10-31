import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface ParticipantListProps {
  text?: string;
  children?: ReactNode;
  lines?: number;
  scrollExpanded?: boolean;
}

export function ParticipantList({ text, children, lines = 3, scrollExpanded = false }: ParticipantListProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [selection, setSelection] = useState({ text, expanded: false });
  const expanded = selection.text === text && selection.expanded;

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;
    const measure = () => {
      const style = window.getComputedStyle(element);
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
      setOverflowing(element.scrollHeight > lineHeight * lines + 1);
    };
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, [text, lines]);

  return (
    <span
      className={`booking-week-participants ${expanded ? 'booking-week-participants-expanded' : ''} ${scrollExpanded ? 'booking-week-participants-scroll' : ''}`}
      style={{ ['--booking-week-participant-lines' as any]: lines }}
    >
      <span ref={textRef} className="booking-week-participants-text">
        {children || text || '—'}
      </span>
      {overflowing && (
        <button
          type="button"
          className="booking-week-participants-toggle"
          aria-expanded={expanded}
          aria-label={expanded ? 'Thu gọn danh sách thành phần tham gia' : 'Xem thêm thành phần tham gia'}
          onKeyDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            setSelection({ text, expanded: !expanded });
          }}
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </span>
  );
}

export default ParticipantList;
