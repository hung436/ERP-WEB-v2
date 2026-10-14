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
        className={`duty-box-leader-btn ${isOpen ? 'is-active' : ''}`}
        onClick={onToggle}
        type="button"
      >
        <div className="duty-leader-info">
          <span className="duty-leader-prefix">TRỰC</span>
          <span className="duty-leader-name">{duty.leader}</span>
        </div>
        <ChevronDown
          className={`duty-chevron-icon ${isOpen ? 'is-open' : ''}`}
          size={13}
        />
      </button>

      {/* Danh sách ca trực - Mặc định đóng, mở khi bấm mũi tên */}
      {isOpen && (
        <div className="duty-box-shifts">
          {duty.shifts.map((shift, idx) => (
            <div className="timeline-duty-shift-card" key={idx}>
              <div className="shift-card-header">
                <span className="duty-shift-badge">{shift.name}:</span>
              </div>
              <div className="duty-shift-details">
                {shift.tkts && (
                  <div className="duty-role-segment">
                    <span className="duty-role-label">TKTS:</span>{' '}
                    <span className="duty-role-value">{shift.tkts}</span>
                  </div>
                )}
                {shift.btv && (
                  <div className="duty-role-segment">
                    <span className="duty-role-label">BTV:</span>{' '}
                    <span className="duty-role-value">{shift.btv}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
