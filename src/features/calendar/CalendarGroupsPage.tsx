import { Button, Empty, Input, Popconfirm, Segmented, Space, Table, Tag, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { CreateRecipientGroupModal } from '@/features/calendar/components/CreateRecipientGroupModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { calendarGroupApi } from '@/services/api';
import type { CalendarRecipientGroup, GroupStatus } from '@/types/calendar';
import './calendar-notifications.css';

export function CalendarGroupsPage() {
  const state = useAsyncData(async () => (await calendarGroupApi.list()).data);
  const [filterStatus, setFilterStatus] = useState<'all' | GroupStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CalendarRecipientGroup | null>(null);

  const allGroups = state.data ?? [];

  const filteredGroups = useMemo(() => {
    return allGroups.filter((g) => {
      if (filterStatus !== 'all' && g.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          g.name.toLowerCase().includes(q) ||
          g.members.join(' ').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allGroups, filterStatus, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await calendarGroupApi.delete(id);
      message.success('Đã xóa nhóm nhận thông báo');
      await state.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể xóa nhóm');
    }
  };

  const handleToggleStatus = async (group: CalendarRecipientGroup) => {
    const nextStatus: GroupStatus = group.status === 'active' ? 'closed' : 'active';
    try {
      await calendarGroupApi.update(group.id, { status: nextStatus });
      message.success(
        nextStatus === 'active'
          ? `Đã mở lại nhóm: ${group.name}`
          : `Đã đóng nhóm: ${group.name}`
      );
      await state.reload();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const columns: ColumnsType<CalendarRecipientGroup> = [
    {
      title: 'Tên nhóm',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (name: string) => (
        <strong className="group-title-text">{name}</strong>
      ),
    },
    {
      title: 'Thành viên',
      dataIndex: 'members',
      key: 'members',
      render: (members: string[]) => {
        return (
          <div className="group-members-list">
            <span className="members-count-badge">{members.length} thành viên:</span>
            <div className="recipient-tags-wrap">
              {members.slice(0, 5).map((m) => (
                <Tag className="recipient-tag" color="purple" key={m}>
                  {m}
                </Tag>
              ))}
              {members.length > 5 && (
                <Tooltip title={members.slice(5).join(', ')}>
                  <Tag className="recipient-tag recipient-more">+{members.length - 5} người</Tag>
                </Tooltip>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: GroupStatus) => {
        const isOpen = status === 'active';
        return (
          <span className={`status-badge-pill ${isOpen ? 'status-sent' : 'status-closed'}`}>
            <i className="status-indicator-dot" />
            {isOpen ? 'Đang mở' : 'Đã đóng'}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size={4}>
          <Button
            className="action-link-btn"
            onClick={() => {
              setEditingGroup(record);
              setCreateModalOpen(true);
            }}
            size="small"
            type="link"
          >
            Sửa
          </Button>

          <Button
            className="action-link-btn"
            onClick={() => void handleToggleStatus(record)}
            size="small"
            type="link"
          >
            {record.status === 'active' ? 'Đóng nhóm' : 'Mở lại'}
          </Button>

          <Popconfirm
            cancelText="Hủy"
            okText="Xóa"
            onConfirm={() => void handleDelete(record.id)}
            title="Xóa nhóm nhận thông báo này?"
          >
            <Button
              className="action-link-btn btn-delete-row"
              danger
              size="small"
              type="link"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="calendar-groups-page module-page">
      {/* PAGE HEADER */}
      <div className="calendar-page-header surface-panel">
        <div className="header-left">
          <div className="header-icon-container">
            <ModuleIcon module="calendar" size={26} />
          </div>
          <div className="header-title-row">
            <h1>Lịch làm việc · Quản lý nhóm</h1>
          </div>
        </div>

        <div className="header-action-buttons">
          <Button
            className="btn-create-meeting-main"
            icon={<span className="btn-icon">➕</span>}
            onClick={() => {
              setEditingGroup(null);
              setCreateModalOpen(true);
            }}
            size="middle"
            type="primary"
          >
            Tạo nhóm mới
          </Button>
        </div>
      </div>

      {/* MAIN TABLE PANEL */}
      <div className="calendar-table-panel surface-panel">
        <div className="calendar-table-toolbar">
          <div className="toolbar-left-filters">
            <Segmented
              className="calendar-status-segmented"
              onChange={(val) => setFilterStatus(val as 'all' | GroupStatus)}
              options={[
                { label: `Tất cả (${allGroups.length})`, value: 'all' },
                {
                  label: `● Đang mở (${allGroups.filter((g) => g.status === 'active').length})`,
                  value: 'active',
                },
                {
                  label: `○ Đã đóng (${allGroups.filter((g) => g.status === 'closed').length})`,
                  value: 'closed',
                },
              ]}
              value={filterStatus}
            />
          </div>

          <div className="toolbar-right-search">
            <Input
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhóm, thành viên..."
              prefix={<span className="search-icon">🔍</span>}
              style={{ width: 280 }}
              value={searchQuery}
            />
          </div>
        </div>

        {state.loading ? (
          <ContentSkeleton rows={5} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : (
          <Table
            className="calendar-groups-table"
            columns={columns}
            dataSource={filteredGroups}
            locale={{
              emptyText: <Empty description="Không tìm thấy nhóm nhận thông báo nào" />,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} nhóm`,
            }}
            rowKey="id"
          />
        )}
      </div>

      {/* MODAL TẠO & SỬA NHÓM */}
      <CreateRecipientGroupModal
        editingGroup={editingGroup}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingGroup(null);
        }}
        onSaved={async () => {
          await state.reload();
        }}
        open={createModalOpen}
      />
    </div>
  );
}
