import { useMemo } from 'react';
import { Button, Drawer, Empty, Tag, Tooltip } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';


import { getDayDutyInfo } from '../dutySchedule';

import './DayScheduleDrawer.css';

const VI_DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

interface DayScheduleDrawerProps {
  open: boolean;
  onClose: () => void;
  afterOpenChange?: (open: boolean) => void;
  day: Dayjs | null;
  onCreateEvent?: (day: Dayjs) => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
}

export function DayScheduleDrawer({
  open,
  onClose,
  afterOpenChange,
  day,
  onPrevDay,
  onNextDay,
}: DayScheduleDrawerProps) {
  const now = dayjs();
  const currentDay = day || now;
  const dayNameVi = VI_DAY_NAMES[currentDay.day()];
  const isToday = currentDay.isSame(now, 'day');

  // Trực ban & ca trực trong ngày
  const duty = useMemo(() => getDayDutyInfo(currentDay), [currentDay]);

  return (
    <Drawer
      aria-label={`Lịch ca trực ${dayNameVi}, ngày ${currentDay.format('DD/MM/YYYY')}`}
      className="day-schedule-drawer"
      closable={false}
      destroyOnClose={false}
      onClose={onClose}
      afterOpenChange={afterOpenChange}
      open={open}
      placement="right"
      rootClassName="day-schedule-drawer"
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
        },
      }}
      title={null}
      width="min(460px, 100vw)"
    >
      <div className="day-schedule-wrapper">
        {/* Header thứ ngày đơn giản, gọn gàng, cố định ở trên */}
        <header className="day-schedule-simple-header">
          <div className="day-schedule-title-area">
            <div className="day-schedule-heading-row">
              <h3 className="day-heading-text">
                {dayNameVi}, {currentDay.format('DD/MM/YYYY')}
              </h3>

              <div className="day-schedule-nav-inline">
                {onPrevDay && (
                  <Tooltip title="Ngày trước">
                    <Button
                      aria-label="Ngày trước"
                      className="day-nav-btn"
                      icon={<ChevronLeft size={15} />}
                      onClick={onPrevDay}
                      size="small"
                      type="text"
                    />
                  </Tooltip>
                )}
                {onNextDay && (
                  <Tooltip title="Ngày tiếp theo">
                    <Button
                      aria-label="Ngày tiếp theo"
                      className="day-nav-btn"
                      icon={<ChevronRight size={15} />}
                      onClick={onNextDay}
                      size="small"
                      type="text"
                    />
                  </Tooltip>
                )}
              </div>

              {isToday && <Tag className="tag-today-pill" color="blue">Hôm nay</Tag>}
            </div>
            <span className="day-subtitle-count">Lịch trực ban & Ca trực tòa soạn</span>
          </div>

          <div className="day-schedule-header-actions">
            <Button
              aria-label="Đóng"
              className="day-drawer-close-btn"
              icon={<X size={16} />}
              onClick={onClose}
              type="text"
            />
          </div>
        </header>

        {/* Thân cuộn: Trực ban và ca trực */}
        <div className="day-schedule-scroll-body">
          {duty ? (
            <section className="day-schedule-duty-banner">
              <div className="duty-banner-header">
                <ShieldCheck className="duty-banner-icon" size={18} />
                <span className="duty-banner-inline-leader">
                  <strong>Trực:</strong> {duty.leader}
                </span>
              </div>

              {duty.shifts.length > 0 ? (
                <div className="duty-banner-shifts-list">
                  {duty.shifts.map((shift, idx) => (
                    <div className="duty-banner-shift-row" key={idx}>
                      <span className="shift-badge-text">{shift.name}:</span>
                      <span className="shift-body-text">
                        {shift.tkts && (
                          <span>
                            <strong className="sub-lbl">TKTS:</strong> {shift.tkts}
                          </span>
                        )}
                        {shift.tkts && shift.btv && <span className="shift-dot">·</span>}
                        {shift.btv && (
                          <span>
                            <strong className="sub-lbl">BTV:</strong> {shift.btv}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '8px 0', fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
                  Chưa có phân công ca trực cụ thể cho ngày này.
                </div>
              )}
            </section>
          ) : (
            <div className="day-schedule-empty">
              <Empty
                description={`Không có thông tin ca trực trong ${dayNameVi.toLowerCase()}, ngày ${currentDay.format('DD/MM')}.`}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
