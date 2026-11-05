import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs, { isDayjs } from 'dayjs';
import { DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

import type {
  ConflictCheckResult,
  SmartTimePickerProps,
  TimeSlotValue,
} from '../types/timeConflict';
import { detectEventConflicts } from '../conflictUtils';

import { TimePickerStabilizer } from './TimePickerStabilizer';

import './smartPickers.css';

/**
 * SmartTimePicker - Tuổi Trẻ ERP Unified DatePicker with Anti-Jump Stabilizer
 *
 * Tính năng chính:
 * 1. Sử dụng DatePicker (hoặc DatePicker.RangePicker) đồng nhất một ô, chuẩn Inter / Design System.
 * 2. Tích hợp TimePickerStabilizer: triệt tiêu hoàn toàn lỗi "click giờ tự động nhảy lên đầu" của rc-picker.
 *    Khi người dùng click chọn giờ/phút, cột thời gian ĐỨNG YÊN HOÀN TOÀN, chỉ đổi màu highlight.
 * 3. Bước nhảy phút: 5 phút (00, 05, 10, 15, 20... 55) - gọn gàng, bao phủ tất cả mốc giờ họp và hạn chót.
 * 4. Phát hiện trùng lịch chạy ngầm thông minh (conflict detection).
 */
export const SmartTimePicker: React.FC<SmartTimePickerProps> = ({
  value,
  onChange,
  ticketType = 'MEETING',
  existingEvents = [],
  currentUserName = 'Nguyễn Minh Anh',
  selectedParticipants = [],
  selectedLocation = '',
  excludeEventId,
  onConflictChange,
  disabled = false,
  className = '',
  style,
  placeholder,
  mode,
  allowPast = false,
}) => {
  const isRangeMode = mode === 'range' || (!mode && ticketType === 'MEETING');

  // Parse initial values: Mặc định là thời gian hiện tại (làm tròn lên mốc 5 phút gần nhất)
  const initialValues = useMemo(() => {
    const now = dayjs();
    const remainder = now.minute() % 5;
    const roundedNow =
      remainder === 0
        ? now.second(0).millisecond(0)
        : now.add(5 - remainder, 'minute').second(0).millisecond(0);

    let start = roundedNow;
    let end = start.add(1, 'hour');

    if (value) {
      if (Array.isArray(value) && value.length >= 2) {
        const s = dayjs(dayjs(value[0]).valueOf());
        const e = dayjs(dayjs(value[1]).valueOf());
        if (s.isValid()) start = s;
        if (e.isValid()) end = e;
      } else if (isDayjs(value)) {
        if (value.isValid()) {
          start = dayjs(value.valueOf());
          const customEnd = (value as unknown as { endAt?: unknown })?.endAt;
          if (customEnd && isDayjs(customEnd) && customEnd.isValid()) {
            end = dayjs(customEnd.valueOf());
          } else if (customEnd && typeof customEnd === 'string' && dayjs(customEnd).isValid()) {
            end = dayjs(customEnd);
          } else {
            end = start.add(1, 'hour');
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const obj = value as unknown as Record<string, unknown>;
        const rawStart = obj.startAt || obj['0'] || obj.time || (typeof obj.date !== 'function' ? obj.date : undefined);
        const rawEnd = obj.endAt || obj['1'];
        if (rawStart && dayjs(rawStart as string | number | Date | Dayjs).isValid()) {
          start = dayjs(dayjs(rawStart as string | number | Date | Dayjs).valueOf());
        }
        if (rawEnd && dayjs(rawEnd as string | number | Date | Dayjs).isValid()) {
          end = dayjs(dayjs(rawEnd as string | number | Date | Dayjs).valueOf());
        } else {
          end = start.add(1, 'hour');
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        const s = dayjs(value);
        if (s.isValid()) {
          start = s;
          end = s.add(1, 'hour');
        }
      }
    }

    // Luôn đảm bảo start và end là thực thể Dayjs nguyên bản, không bao giờ bị đè hàm date()
    const cleanStart = dayjs(start.valueOf());
    const cleanEnd = dayjs(end.valueOf());

    return { start: cleanStart, end: cleanEnd };
  }, [value, isRangeMode, ticketType]);

  const [currentVal, setCurrentVal] = useState<Dayjs>(initialValues.start);
  const [rangeStart, setRangeStart] = useState<Dayjs>(initialValues.start);
  const [rangeEnd, setRangeEnd] = useState<Dayjs>(initialValues.end);

  useEffect(() => {
    setCurrentVal(initialValues.start);
    setRangeStart(initialValues.start);
    setRangeEnd(initialValues.end);
  }, [initialValues]);

  // Conflict detection
  useEffect(() => {
    if (!onConflictChange || !existingEvents || existingEvents.length === 0) return;
    const start = isRangeMode ? rangeStart : currentVal;
    const end = isRangeMode ? rangeEnd : currentVal.add(1, 'hour');

    const result: ConflictCheckResult = detectEventConflicts({
      proposedStart: start,
      proposedEnd: end,
      currentUserName,
      selectedParticipants,
      selectedLocation,
      existingEvents,
      excludeEventId,
    });

    onConflictChange(result);
  }, [
    currentVal,
    rangeStart,
    rangeEnd,
    isRangeMode,
    currentUserName,
    selectedParticipants,
    selectedLocation,
    existingEvents,
    excludeEventId,
    onConflictChange,
  ]);

  // Single mode handler
  const handleSingleChange = useCallback(
    (d: Dayjs | null) => {
      if (!d) return;
      const cleanDate = dayjs(d.valueOf());
      setCurrentVal(cleanDate);

      if (!onChange) return;

      // TUYỆT ĐỐI KHÔNG đè thuộc tính 'date' lên Dayjs vì Dayjs.prototype.date là function getter/setter ngày trong tháng!
      // Việc đè 'date' bằng Object sẽ làm rc-picker ném lỗi: date4.date is not a function
      const payload = dayjs(cleanDate.valueOf());
      (payload as unknown as { startAt?: Dayjs; endAt?: Dayjs; durationMinutes?: number; isAllDay?: boolean; slotDate?: Dayjs }).startAt = cleanDate;
      (payload as unknown as { startAt?: Dayjs; endAt?: Dayjs; durationMinutes?: number; isAllDay?: boolean; slotDate?: Dayjs }).endAt = cleanDate;
      (payload as unknown as { startAt?: Dayjs; endAt?: Dayjs; durationMinutes?: number; isAllDay?: boolean; slotDate?: Dayjs }).durationMinutes = 0;
      (payload as unknown as { startAt?: Dayjs; endAt?: Dayjs; durationMinutes?: number; isAllDay?: boolean; slotDate?: Dayjs }).isAllDay = false;
      (payload as unknown as { startAt?: Dayjs; endAt?: Dayjs; durationMinutes?: number; isAllDay?: boolean; slotDate?: Dayjs }).slotDate = cleanDate.startOf('day');

      onChange(payload);
    },
    [onChange],
  );

  // Range mode handler
  const handleRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (!dates || !dates[0] || !dates[1]) return;
      const start = dayjs(dates[0].valueOf());
      const end = dayjs(dates[1].valueOf());
      setRangeStart(start);
      setRangeEnd(end);

      if (!onChange) return;
      const dur = Math.max(15, end.diff(start, 'minute'));

      // Trả về mảng [start, end] chuẩn của RangePicker cùng các helper properties
      const rangePayload = [start, end] as unknown as [Dayjs, Dayjs] & {
        startAt?: Dayjs;
        endAt?: Dayjs;
        durationMinutes?: number;
        isAllDay?: boolean;
        slotDate?: Dayjs;
      };
      rangePayload.startAt = start;
      rangePayload.endAt = end;
      rangePayload.durationMinutes = dur;
      rangePayload.isAllDay = false;
      rangePayload.slotDate = start.startOf('day');

      onChange(rangePayload as unknown as Dayjs);
    },
    [onChange],
  );

  // Validate chỉ cho chọn ngày hiện tại và tương lai
  const disabledDate = useCallback(
    (current: Dayjs) => {
      if (allowPast) return false;
      if (!current) return false;
      return current.isBefore(dayjs().startOf('day'));
    },
    [allowPast],
  );

  // Validate chỉ cho chọn giờ/phút hiện tại và tương lai (khi ngày chọn là hôm nay)
  const disabledSingleDateTime = useCallback(
    (selectedDate: Dayjs | null) => {
      if (allowPast) return {};
      const now = dayjs();
      if (!selectedDate || !selectedDate.isSame(now, 'day')) {
        return {};
      }
      const currentHour = now.hour();
      const currentMinute = now.minute();

      return {
        disabledHours: () => {
          const hours: number[] = [];
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour: number) => {
          const minutes: number[] = [];
          if (selectedHour === currentHour) {
            for (let m = 0; m < currentMinute; m++) {
              minutes.push(m);
            }
          } else if (selectedHour < currentHour) {
            for (let m = 0; m < 60; m++) {
              minutes.push(m);
            }
          }
          return minutes;
        },
      };
    },
    [allowPast],
  );

  // Validate RangePicker: bắt đầu & kết thúc không nằm trong quá khứ
  const disabledRangeDateTime = useCallback(
    (date: Dayjs | null, type: 'start' | 'end') => {
      if (allowPast) return {};
      const now = dayjs();
      const compareTarget =
        type === 'end' && rangeStart && date && date.isSame(rangeStart, 'day')
          ? rangeStart.isAfter(now)
            ? rangeStart
            : now
          : now;

      if (!date || !date.isSame(compareTarget, 'day')) {
        return {};
      }

      const minHour = compareTarget.hour();
      const minMinute = compareTarget.minute();

      return {
        disabledHours: () => {
          const hours: number[] = [];
          for (let i = 0; i < minHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour: number) => {
          const minutes: number[] = [];
          if (selectedHour === minHour) {
            for (let m = 0; m < minMinute; m++) {
              minutes.push(m);
            }
          } else if (selectedHour < minHour) {
            for (let m = 0; m < 60; m++) {
              minutes.push(m);
            }
          }
          return minutes;
        },
      };
    },
    [allowPast, rangeStart],
  );

  return (
    <div className={`jt-custom-datepicker-wrapper ${className}`} style={{ width: '100%', ...style }}>
      {isRangeMode ? (
        /* LỊCH HỌP (MEETING): DatePicker.RangePicker hiển thị thời gian bắt đầu & kết thúc */
        <DatePicker.RangePicker
          placement="bottomLeft"
          value={[rangeStart, rangeEnd]}
          onChange={handleRangeChange}
          disabledDate={disabledDate}
          disabledTime={disabledRangeDateTime}
          onOk={(dates) => {
            if (dates && dates[0] && dates[1]) {
              handleRangeChange(dates as [Dayjs | null, Dayjs | null]);
            }
          }}
          showTime={{
            format: 'HH:mm',
            minuteStep: 5,
            hideDisabledOptions: false,
          }}
          format="HH:mm DD/MM/YYYY"
          placeholder={['Thời gian bắt đầu...', 'Thời gian kết thúc...']}
          allowClear={false}
          disabled={disabled}
          suffixIcon={<CalendarOutlined style={{ color: '#667085' }} />}
          className="jt-custom-datepicker jt-custom-rangepicker"
          classNames={{ popup: { root: 'jt-calendar-popup' } }}
          panelRender={(panelNode) => (
            <TimePickerStabilizer>{panelNode}</TimePickerStabilizer>
          )}
          style={{ width: '100%', height: 38, borderRadius: 6 }}
        />
      ) : (
        /* CÔNG VIỆC / SỰ KIỆN: DatePicker đơn với thời gian giờ & ngày */
        <DatePicker
          placement="bottomLeft"
          value={currentVal}
          onChange={handleSingleChange}
          disabledDate={disabledDate}
          disabledTime={disabledSingleDateTime}
          onOk={(date) => {
            if (date) handleSingleChange(date);
          }}
          showTime={{
            format: 'HH:mm',
            minuteStep: 5,
            hideDisabledOptions: false,
          }}
          format="HH:mm DD/MM/YYYY"
          placeholder={
            placeholder ||
            (ticketType === 'TASK' ? 'Chọn thời gian hạn chót...' : 'Chọn thời gian diễn ra...')
          }
          allowClear={false}
          disabled={disabled}
          suffixIcon={<CalendarOutlined style={{ color: '#667085' }} />}
          className="jt-custom-datepicker"
          classNames={{ popup: { root: 'jt-calendar-popup' } }}
          panelRender={(panelNode) => (
            <TimePickerStabilizer>{panelNode}</TimePickerStabilizer>
          )}
          style={{ width: '100%', height: 38, borderRadius: 6 }}
        />
      )}
    </div>
  );
};
