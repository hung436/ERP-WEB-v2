import React, { useMemo, useCallback, useState } from 'react';
import { Select } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';

import { avatarTone, nameInitials } from '@/utils/avatar';
import { directoryContacts } from '@/mocks/fixtures';

import type {
  ParticipantItem,
  SmartParticipantPickerProps,
} from '../types/timeConflict';

import './smartPickers.css';

const POSITION_MAP: Record<string, string> = {
  'Nguyễn Minh Anh': 'Phóng viên',
  'Trần Thu Hà': 'Phó Trưởng ban',
  'Phạm Đức Long': 'Quản trị viên hệ thống',
  'Nguyễn Hoài Nam': 'Phóng viên chuyên đề',
  'Lê Thanh Vân': 'Thư ký điều phối',
  'Đỗ Quang Huy': 'Trưởng ban',
  'Mai Phương Thảo': 'Chuyên viên lưu trữ',
  'Vũ Minh Khôi': 'Chuyên viên',
  'Hoàng Tuấn Anh': 'Thư ký biên tập',
  'Ngô Mỹ Linh': 'Chuyên viên văn thư',
  'Bùi Anh Tú': 'Phóng viên thời sự',
  'Phan Thùy Dung': 'Chuyên viên tư liệu',
  'Đặng Quốc Bảo': 'Kỹ sư phần mềm',
  'Tạ Minh Châu': 'Kỹ sư hệ thống',
  'Đinh Gia Hân': 'Phóng viên',
  'Lương Hải Đăng': 'Phóng viên',
  'Cao Thanh Tâm': 'Kế toán viên',
  'Trịnh Khánh Vy': 'Chuyên viên nhân sự',
  'Nguyễn Tấn Đạt': 'Phó Tổng Biên tập',
  'Lê Văn Tuấn': 'Trưởng ban Thư ký',
};

// Helper: remove diacritics for flexible search
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

interface CustomOptionType extends DefaultOptionType {
  value: string;
  label: string;
  penName?: string;
  department?: string;
  email?: string;
  position?: string;
  searchStr?: string;
}

/**
 * SmartParticipantPicker - Tuổi Trẻ ERP Participant Selector
 * Đơn giản, trực quan, dễ sử dụng: chọn trực tiếp cá nhân nhân sự, KHÔNG CẦN NHÓM.
 * Danh sách phẳng hiển thị rõ ràng: Avatar, Họ tên, Bút danh, Chức danh, Phòng ban.
 */
export const SmartParticipantPicker: React.FC<SmartParticipantPickerProps> = ({
  value = [],
  onChange,
  placeholder = 'Chọn hoặc tìm kiếm nhân sự tham gia...',
  maxCount,
  maxSelected,
  targetRole = 'participants',
  role,
  disabled = false,
  status,
  className = '',
  style,
}) => {
  const effectiveMax = maxCount || maxSelected;
  const effectiveRole = role || targetRole;

  const [open, setOpen] = useState(false);

  // Normalise value array
  const selectedValues = useMemo<string[]>(() => {
    if (!value) return [];
    const list = Array.isArray(value) ? value : [value];
    return list
      .map((item) => {
        if (!item) return '';
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object') {
          return String((item as any).name || (item as any).value || (item as any).id || '').trim();
        }
        return String(item).trim();
      })
      .filter((n) => n.length > 0);
  }, [value]);

  // Build directory contacts items (chỉ cá nhân, không có nhóm)
  const contactOptions = useMemo<CustomOptionType[]>(() => {
    const contacts: CustomOptionType[] = directoryContacts.map((c) => {
      const fullName = c.fullName;
      const penName = c.penName;
      const department = c.department;
      const email = c.email;
      const position = POSITION_MAP[fullName] || 'Cán bộ / Phóng viên';

      return {
        value: fullName,
        label: fullName,
        penName,
        department,
        email,
        position,
        searchStr: `${fullName} ${penName || ''} ${department} ${email || ''} ${position} ${removeDiacritics(
          fullName,
        )} ${removeDiacritics(department)}`.toLowerCase(),
      };
    });

    if (effectiveRole === 'approvers') {
      // Prioritize leadership & department heads
      return contacts.sort((a, b) => {
        const isLeadA =
          (a.position && (a.position.includes('Tổng Biên tập') || a.position.includes('Trưởng ban'))) ||
          a.department === 'Ban Biên tập';
        const isLeadB =
          (b.position && (b.position.includes('Tổng Biên tập') || b.position.includes('Trưởng ban'))) ||
          b.department === 'Ban Biên tập';
        if (isLeadA && !isLeadB) return -1;
        if (!isLeadA && isLeadB) return 1;
        return a.label.localeCompare(b.label, 'vi');
      });
    }

    return contacts;
  }, [effectiveRole]);

  // Handle Select Change
  const handleChange = useCallback(
    (newVals: any[]) => {
      if (!onChange) return;

      const cleanNames: string[] = (newVals || [])
        .map((v) => {
          if (!v) return '';
          if (typeof v === 'string') return v.trim();
          if (typeof v === 'object') {
            return String(v.value || v.name || v.label || v.id || '').trim();
          }
          return String(v).trim();
        })
        .filter((n) => n.length > 0);

      // De-duplicate items
      let finalVals = Array.from(new Set(cleanNames));

      // Enforce max count if specified
      if (effectiveMax && finalVals.length > effectiveMax) {
        finalVals = finalVals.slice(0, effectiveMax);
      }

      // Map back to ParticipantItem list if needed
      const resultItems: ParticipantItem[] = finalVals.map((name) => {
        const found = contactOptions.find((c) => c.value === name || c.label === name);
        return {
          id: name,
          name,
          penName: found?.penName,
          department: found?.department || 'Tòa soạn',
          position: found?.position,
          email: found?.email,
          type: 'person',
        };
      });

      onChange(finalVals, resultItems);
    },
    [onChange, contactOptions, effectiveMax],
  );

  return (
    <div className={`jt-participant-select-wrapper ${className}`} style={{ width: '100%', ...style }}>
      <Select
        mode="multiple"
        open={open}
        onOpenChange={setOpen}
        value={selectedValues}
        onChange={handleChange}
        options={contactOptions}
        placeholder={placeholder}
        disabled={disabled}
        status={status}
        allowClear
        showSearch
        maxTagCount={effectiveMax || (import.meta.env?.MODE === 'test' ? undefined : 'responsive')}
        popupMatchSelectWidth={false}
        className="jt-participant-select"
        classNames={{ popup: { root: 'jt-participant-popup' } }}
        popupRender={(menu) => (
          <div className="jt-participant-dropdown-container">
            {menu}
            <div className="jt-participant-dropdown-footer" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="jt-participant-confirm-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}
        style={{
          width: '100%',
          minHeight: 38,
          borderRadius: 6,
        }}
        filterOption={(input, option) => {
          if (!input) return true;
          const opt = (option as any)?.data || option || {};
          const searchStr = opt.searchStr || `${opt.label || ''} ${opt.value || ''}`.toLowerCase();
          const cleanInput = input.trim().toLowerCase();
          const cleanInputNoDiacritics = removeDiacritics(cleanInput);
          return searchStr.includes(cleanInput) || searchStr.includes(cleanInputNoDiacritics);
        }}
        tagRender={(tagProps) => {
          const { label, value: tagVal, closable, onClose } = tagProps;
          const isRest = !tagVal || (typeof label === 'string' && label.startsWith('+'));
          if (isRest) {
            return (
              <span className="jt-participant-tag jt-tag-rest">
                {label}
              </span>
            );
          }

          const rawStr = typeof tagVal === 'string' ? tagVal : (typeof label === 'string' ? label : String(tagVal || ''));
          const toneClass = avatarTone(rawStr);
          const initials = nameInitials(rawStr);

          const handleClose = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            if (onClose) {
              onClose(e);
            }
          };

          return (
            <span className="jt-participant-tag">
              <span className={`jt-tag-avatar ${toneClass}`}>
                {initials}
              </span>
              <span className="jt-tag-label">{typeof label === 'string' || typeof label === 'number' ? label : rawStr}</span>
              {closable && (
                <span
                  role="button"
                  tabIndex={0}
                  className="jt-tag-close-btn"
                  onClick={handleClose}
                  aria-label={`Xóa ${rawStr}`}
                >
                  ✕
                </span>
              )}
            </span>
          );
        }}
        optionRender={(option) => {
          const data = ((option && (option as any).data) || option || {}) as CustomOptionType;
          const labelStr = String(data.label || data.value || '');
          const initials = nameInitials(labelStr);
          const toneClass = avatarTone(labelStr);

          return (
            <div className="jt-option-contact-item">
              <div className={`jt-option-contact-avatar ${toneClass}`}>
                {initials}
              </div>
              <div className="jt-option-text">
                <div className="jt-option-title">
                  {labelStr}
                  {data.penName && (
                    <span className="jt-option-penname">({data.penName})</span>
                  )}
                </div>
                <div className="jt-option-subtitle">
                  {data.position ? `${data.position} · ` : ''}
                  {data.department || 'Tòa soạn'}
                  {data.email ? ` · ${data.email}` : ''}
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
