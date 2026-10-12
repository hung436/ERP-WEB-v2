import { ChevronDown } from 'lucide-react';
import type { DayDutyInfo } from '../dutySchedule';

interface DayDutyCardProps {
  duty: DayDutyInfo;
  isOpen: boolean;
  onToggle: () => void;
}

export function DayDutyCard({ duty, isOpen, onToggle }: DayDutyCardProps) {
  return (
    <div className={`week-day-duty-box ${isOpen ? 'is-open' : ''}`}>
      {/* Người trực + Mũi tên mở xuống */}
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Thu gọn các ca trực tuần' : 'Mở rộng các ca trực tuần'}
        className="duty-box-leader-btn"
        onClick={onToggle}
        type="button"
      >
        <div className="duty-leader-info">
          <span className="duty-leader-prefix">Trực:</span>
          <span className="duty-leader-name">{duty.leader}</span>
        </div>
        <ChevronDown
          className={`duty-chevron-icon ${isOpen ? 'is-open' : ''}`}
          size={14}
        />
      </button>

      {/* Danh sách ca trực - Mặc định đóng, mở khi bấm mũi tên */}
      {isOpen && (
        <div className="duty-box-shifts">
          {duty.shifts.map((shift, idx) => (
            <div className="duty-shift-item" key={idx}>
              <span className="duty-shift-badge">{shift.name}:</span>
              <span className="duty-shift-details">
                {shift.tkts && (
                  <span className="duty-role-segment">
                    <span className="duty-role-label">TKTS:</span> {shift.tkts}
                  </span>
                )}
                {shift.tkts && shift.btv && <span className="duty-role-dot">·</span>}
                {shift.btv && (
                  <span className="duty-role-segment">
                    <span className="duty-role-label">BTV:</span> {shift.btv}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
