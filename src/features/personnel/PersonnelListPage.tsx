import { Avatar, Dropdown, Input, Select, Table, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { personnelApi } from '@/services/api';
import type { PersonnelRecordItem } from '@/types/personnel';
import './personnel-list.css';

const { Option } = Select;

const departmentOptions = [
  'Ban Biên tập',
  'Ban Thư ký toà soạn',
  'Ban Công nghệ thông tin',
  'Ban Tài chính - Kế toán',
  'Ban Tổ chức - Nhân sự',
  'Ban Quảng cáo & Phát hành',
  'Ban Thời sự - Chính trị',
  'Ban Vấn đề - Sự kiện',
  'Ban Văn hóa - Giải trí',
  'Ban Bạn đọc',
];

const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();

const avatarColors = [
  { bg: '#EFF6FF', color: '#1D4ED8' }, // Blue
  { bg: '#ECFDF5', color: '#047857' }, // Emerald
  { bg: '#F5F3FF', color: '#6D28D9' }, // Purple
  { bg: '#FFFBEB', color: '#B45309' }, // Amber
  { bg: '#FFF1F2', color: '#BE123C' }, // Rose
  { bg: '#F0FDFA', color: '#0F766E' }, // Teal
  { bg: '#EEF2FF', color: '#4338CA' }, // Indigo
  { bg: '#FEF3F2', color: '#D92D20' }, // Red
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}

function SimpleImportIcon() {
  return (
    <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
      <path
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function PersonnelListPage() {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('');

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    record: PersonnelRecordItem | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    record: null,
  });

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('search', searchText.trim());
    if (selectedDept) params.set('department', selectedDept);
    const q = params.toString();
    return q ? `?${q}` : '';
  };

  const state = useAsyncData(
    async () => (await personnelApi.list(buildQuery())).data,
    buildQuery()
  );

  const listData = state.data ?? [];

  const handleImportAction = (title: string) => {
    message.info(`Đang mở giao diện nhập dữ liệu: ${title}`);
  };

  const importResumeMenuItems: MenuProps['items'] = [
    {
      key: '2A',
      label: 'Import Lý lịch 2A',
      onClick: () => handleImportAction('Lý lịch 2A'),
    },
    {
      key: '2B',
      label: 'Import Lý lịch 2B',
      onClick: () => handleImportAction('Lý lịch 2B'),
    },
    {
      key: '2C',
      label: 'Import Lý lịch 2C',
      onClick: () => handleImportAction('Lý lịch 2C'),
    },
  ];

  const columns: ColumnsType<PersonnelRecordItem> = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 240,
      render: (_, record) => {
        const color = getAvatarColor(record.fullName);
        return (
          <div className="personnel-name-cell">
            <Avatar
              shape="circle"
              size={38}
              src={record.photoUrl}
              style={{ backgroundColor: color.bg, color: color.color, fontWeight: 700, flexShrink: 0 }}
            >
              {initials(record.fullName)}
            </Avatar>
            <div className="personnel-name-text">
              <strong>{record.fullName}</strong>
              {record.penName && <span className="personnel-penname">« {record.penName} »</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Đơn vị & Chức danh công tác',
      key: 'assignments',
      width: 340,
      render: (_, record) => {
        const list = record.assignments && record.assignments.length > 0
          ? record.assignments
          : [{ department: record.department, position: record.position, specialty: record.specialty, isPrimary: true }];

        const hasMultiple = list.length > 1;

        return (
          <div className="personnel-assignments-cell-list">
            {list.map((item, idx) => (
              <div className="personnel-assignment-line" key={idx}>
                <strong>{item.department}</strong> — {item.position}
                {hasMultiple && item.isPrimary && (
                  <span className="personnel-primary-tag-text">(Chính)</span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialty',
      key: 'specialty',
      width: 190,
      render: (spec?: string) => (spec ? <span>{spec}</span> : <span style={{ color: '#98a2b3' }}>--</span>),
    },
    {
      title: 'Đối tượng lao động',
      dataIndex: 'employmentType',
      key: 'employmentType',
      width: 200,
      render: (type: string) => <span>{type}</span>,
    },
    {
      title: 'Tình trạng hồ sơ',
      dataIndex: 'profileType',
      key: 'profileType',
      width: 170,
      render: (type?: string) => (
        <span>Lý lịch {type || '2A'}</span>
      ),
    },
  ];

  return (
    <div className="module-page personnel-list-page">
      <header className="personnel-list-header">
        <h1>Danh sách hồ sơ nhân sự</h1>
        <div className="personnel-header-actions">
          <button
            className="btn-import-secondary"
            onClick={() => handleImportAction('Import ngày nghỉ phép')}
            type="button"
          >
            <SimpleImportIcon />
            Import ngày nghỉ phép
          </button>

          <button
            className="btn-import-secondary"
            onClick={() => handleImportAction('Import sinh viên')}
            type="button"
          >
            <SimpleImportIcon />
            Import sinh viên
          </button>

          <Dropdown menu={{ items: importResumeMenuItems }} placement="bottomRight">
            <button className="btn-import-secondary" type="button">
              <SimpleImportIcon />
              Import hồ sơ ▾
            </button>
          </Dropdown>

          <button
            className="btn-create-personnel-primary"
            onClick={() => navigate('/personnel/create')}
            type="button"
          >
            <span>+</span> Tạo hồ sơ mới
          </button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="personnel-list-toolbar">
        <Input.Search
          allowClear
          onSearch={(val) => setSearchText(val)}
          placeholder="Tìm theo Họ và tên, Đơn vị công tác, Chức danh..."
          style={{ maxWidth: 360 }}
        />
        <Select
          allowClear
          onChange={(val) => setSelectedDept(val || '')}
          placeholder="Tất cả Đơn vị công tác"
          style={{ width: 220 }}
          value={selectedDept || undefined}
        >
          {departmentOptions.map((dept) => (
            <Option key={dept} value={dept}>{dept}</Option>
          ))}
        </Select>
      </div>

      {/* Main Table */}
      <div className="personnel-list-card">
        {state.loading ? (
          <ContentSkeleton rows={8} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : listData.length === 0 ? (
          <EmptyState description="Không tìm thấy hồ sơ nhân sự nào" />
        ) : (
          <Table
            className="personnel-table"
            columns={columns}
            dataSource={listData}
            onRow={(record) => ({
              onClick: () => navigate(`/personnel/edit/${record.id}`),
              onContextMenu: (e) => {
                e.preventDefault();
                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  record,
                });
              },
              style: { cursor: 'pointer' },
            })}
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `Tổng ${t} hồ sơ` }}
            rowKey="id"
          />
        )}
      </div>

      {/* Streamlined Right-Click Context Menu (No Subtitle Content) */}
      {contextMenu.visible && contextMenu.record && (
        <div
          className="personnel-context-menu"
          onClick={(e) => e.stopPropagation()}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="personnel-context-menu-header">
            {contextMenu.record.fullName}
          </div>
          <div
            className="personnel-context-menu-item"
            onClick={() => {
              navigate(`/personnel/edit/${contextMenu.record?.id}`);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            <span className="personnel-context-icon">📝</span>
            <span>Xem Hồ sơ nhân sự</span>
          </div>
          <div
            className="personnel-context-menu-item"
            onClick={() => {
              navigate(`/personnel/resume/${contextMenu.record?.id}`);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            <span className="personnel-context-icon">📄</span>
            <span>Xem Lý lịch {contextMenu.record.profileType || '2A'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
