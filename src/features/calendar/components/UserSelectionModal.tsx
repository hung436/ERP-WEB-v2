import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Modal, Input, Checkbox, Button } from 'antd';
import { SearchOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';

import { directoryContacts } from '@/mocks/fixtures';
import { avatarTone, nameInitials } from '@/utils/avatar';

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

function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export interface UserSelectionModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (selectedNames: string[]) => void;
  title?: string;
  initialSelected?: string[];
  excludeNames?: string[];
  helperText?: string;
}

export const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  open,
  onCancel,
  onOk,
  title = 'Chọn thành phần',
  initialSelected = [],
  excludeNames = [],
  helperText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState<string[]>(initialSelected);

  // Sync state whenever modal opens or initialSelected changes
  useEffect(() => {
    if (open) {
      setSelectedList(initialSelected || []);
      setSearchTerm('');
    }
  }, [open, initialSelected]);

  // Danh sách nhân sự loại trừ các tên không hợp lệ
  const availableUsers = useMemo(() => {
    const excludeSet = new Set(excludeNames || []);
    return directoryContacts
      .filter((c) => !excludeSet.has(c.fullName))
      .map((c) => {
        const pos = POSITION_MAP[c.fullName] || (c as unknown as { position?: string }).position || 'Nhân sự';
        const searchStr = `${c.fullName} ${c.penName || ''} ${c.department || ''} ${pos}`.toLowerCase();
        return {
          id: c.id,
          fullName: c.fullName,
          penName: c.penName,
          department: c.department,
          position: pos,
          searchStr,
        };
      });
  }, [excludeNames]);

  // Lọc theo search input
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return availableUsers;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const cleanNoDiacritics = removeDiacritics(cleanSearch);
    return availableUsers.filter(
      (u) =>
        u.searchStr.includes(cleanSearch) ||
        removeDiacritics(u.searchStr).includes(cleanNoDiacritics),
    );
  }, [availableUsers, searchTerm]);

  // Toggle chọn hoặc bỏ chọn một nhân sự (đồng bộ hai chiều với tag và checkbox)
  const handleToggle = useCallback((name: string) => {
    setSelectedList((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      }
      return [...prev, name];
    });
  }, []);

  // Xóa trực tiếp từ tag đã chọn
  const handleRemoveTag = useCallback((name: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedList((prev) => prev.filter((item) => item !== name));
  }, []);

  const handleConfirm = () => {
    onOk(selectedList);
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
          <UserOutlined style={{ color: '#d92d20' }} />
          <span>{title}</span>
        </div>
      }
      width={560}
      destroyOnHidden
      centered
      footer={
        <div className="jt-user-modal-footer">
          <div className="jt-user-modal-actions">
            <Button onClick={onCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              style={{
                backgroundColor: '#d92d20',
                borderColor: '#d92d20',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      }
      className="jt-user-selection-modal-root"
    >
      {helperText && (
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12, marginTop: -4 }}>
          {helperText}
        </p>
      )}

      {/* 1. Thanh tìm kiếm (Search bar) */}
      <div style={{ marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Tìm theo họ tên, bút danh, phòng ban..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          className="jt-user-search-input"
          style={{ height: 38, borderRadius: 6 }}
        />
      </div>

      {/* 2. Danh sách Tag đã chọn kèm nút xóa 'x' (đồng bộ 2 chiều với checkbox) */}
      {selectedList.length > 0 && (
        <div className="jt-user-selected-tags-container">
          <div className="jt-user-selected-tags-label">
            Đã chọn ({selectedList.length}):
          </div>
          <div className="jt-user-selected-tags-list">
            {selectedList.map((name) => {
              const toneClass = avatarTone(name);
              const initials = nameInitials(name);
              return (
                <span key={name} className="jt-user-selected-tag">
                  <span className={`jt-user-tag-avatar ${toneClass}`}>{initials}</span>
                  <span className="jt-user-tag-name">{name}</span>
                  <button
                    type="button"
                    className="jt-user-tag-close-btn"
                    onClick={(e) => handleRemoveTag(name, e)}
                    title={`Bỏ chọn ${name}`}
                    aria-label={`Bỏ chọn ${name}`}
                  >
                    <CloseOutlined style={{ fontSize: 10 }} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Danh sách nhân sự kèm Checkbox */}
      <div className="jt-user-list-scroll-box">
        {filteredUsers.length === 0 ? (
          <div className="jt-user-list-empty">
            <span>Không tìm thấy nhân sự phù hợp</span>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isChecked = selectedList.includes(user.fullName);
            const toneClass = avatarTone(user.fullName);
            const initials = nameInitials(user.fullName);

            return (
              <div
                key={user.id}
                className={`jt-user-list-item ${isChecked ? 'is-checked' : ''}`}
                onClick={() => handleToggle(user.fullName)}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(user.fullName);
                  }
                }}
              >
                <div className="jt-user-item-left">
                  <span className={`jt-user-avatar-circle ${toneClass}`}>{initials}</span>
                  <div className="jt-user-item-info">
                    <span className="jt-user-item-name">
                      {user.fullName}
                      {user.penName ? ` (${user.penName})` : ''}
                    </span>
                    <span className="jt-user-item-meta">
                      {user.position} • {user.department}
                    </span>
                  </div>
                </div>

                <div
                  className="jt-user-item-checkbox"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleToggle(user.fullName)}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
