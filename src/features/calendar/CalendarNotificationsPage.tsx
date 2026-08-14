import { Button, DatePicker, Empty, Input, Segmented, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { CreateBroadcastNoticeModal } from '@/features/calendar/components/CreateBroadcastNoticeModal';
import { CreateEditorialMeetingModal } from '@/features/calendar/components/CreateEditorialMeetingModal';
import { NotificationDetailModal } from '@/features/calendar/components/NotificationDetailModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { calendarNotificationApi } from '@/services/api';
import type { CalendarNotificationItem, CalendarNotificationType } from '@/types/calendar';
import './calendar-notifications.css';

export function CalendarNotificationsPage() {
  const state = useAsyncData(async () => (await calendarNotificationApi.list()).data);
  const [filterType, setFilterType] = useState<'all' | CalendarNotificationType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [createNoticeOpen, setCreateNoticeOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<CalendarNotificationItem | null>(null);

  const allItems = state.data ?? [];

  // Filtered rows
  const filteredData = useMemo(() => {
    return allItems.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;

      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemDate = dayjs(item.sentAt || item.scheduledAt || item.createdAt);
        if (itemDate.isBefore(dateRange[0].startOf('day')) || itemDate.isAfter(dateRange[1].endOf('day'))) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const groupNames = item.recipients.groupNames?.join(' ').toLowerCase() ?? '';
        const indivs = item.recipients.individuals?.join(' ').toLowerCase() ?? '';
        const match =
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          groupNames.includes(q) ||
          indivs.includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allItems, filterType, filterStatus, dateRange, searchQuery]);

  // EXACTLY 3 COLUMNS: Thời gian gửi, Tiêu đề, Trạng thái (Bỏ cột Thao tác)
  const columns: ColumnsType<CalendarNotificationItem> = [
    {
      title: 'Thời gian gửi',
      dataIndex: 'scheduledAt',
      key: 'time',
      width: 180,
      render: (_, record) => {
        const timeToShow = record.sentAt || record.scheduledAt || record.createdAt;
        return (
          <span className="clean-time-text">
            {dayjs(timeToShow).format('DD/MM/YYYY HH:mm')}
          </span>
        );
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => {
        const isMeeting = record.type === 'editorial_meeting';
        return (
          <div className="table-title-simple-row">
            <Tag
              className="notif-type-tag"
              color={isMeeting ? '#7f56d9' : '#1570ef'}
            >
              {isMeeting ? 'Lịch họp Ban Biên tập' : 'Thông báo'}
            </Tag>
            <button
              className="notif-simple-title-link"
              onClick={() => setDetailItem(record)}
              type="button"
            >
              {text}
            </button>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const isSent = status === 'sent';
        return (
          <span className={`status-badge-pill ${isSent ? 'status-sent' : 'status-pending'}`}>
            <i className="status-indicator-dot" />
            {isSent ? 'Đã gửi' : 'Chưa gửi'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="calendar-notifications-page module-page">
      {/* PAGE HEADER */}
      <div className="calendar-page-header surface-panel">
        <div className="header-left">
          <div className="header-icon-container">
            <ModuleIcon module="calendar" size={26} />
          </div>
          <div className="header-title-row">
            <h1>Lịch làm việc · Quản lý thông báo</h1>
          </div>
        </div>

        {/* 2 ACTION BUTTONS */}
        <div className="header-action-buttons">
          <Button
            className="btn-create-meeting-main"
            icon={<span className="btn-icon">🏛️</span>}
            onClick={() => setCreateMeetingOpen(true)}
            size="middle"
            type="primary"
          >
            Tạo Lịch họp ban biên tập
          </Button>

          <Button
            className="btn-create-notice-main"
            icon={<span className="btn-icon">📢</span>}
            onClick={() => setCreateNoticeOpen(true)}
            size="middle"
            type="default"
          >
            Tạo thông báo
          </Button>
        </div>
      </div>

      {/* MAIN TOOLBAR & TABLE PANEL */}
      <div className="calendar-table-panel surface-panel">
        <div className="calendar-table-toolbar">
          <div className="toolbar-left-filters">
            <Segmented
              className="calendar-filter-segmented"
              onChange={(val) => setFilterType(val as 'all' | CalendarNotificationType)}
              options={[
                { label: `Tất cả (${allItems.length})`, value: 'all' },
                {
                  label: `Lịch họp BBT (${allItems.filter((i) => i.type === 'editorial_meeting').length})`,
                  value: 'editorial_meeting',
                },
                {
                  label: `Thông báo (${allItems.filter((i) => i.type === 'general_announcement').length})`,
                  value: 'general_announcement',
                },
              ]}
              value={filterType}
            />

            <Segmented
              className="calendar-status-segmented"
              onChange={(val) => setFilterStatus(val as 'all' | 'sent' | 'pending')}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: '✓ Đã gửi', value: 'sent' },
                { label: '⏳ Chưa gửi', value: 'pending' },
              ]}
              value={filterStatus}
            />
          </div>

          <div className="toolbar-right-search">
            <DatePicker.RangePicker
              format="DD/MM/YYYY"
              onChange={(dates) => setDateRange(dates as any)}
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 230 }}
            />

            <Input
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề..."
              prefix={<span className="search-icon">🔍</span>}
              style={{ width: 220 }}
              value={searchQuery}
            />
          </div>
        </div>

        {/* CLEAN TABLE WITH 3 COLUMNS ONLY */}
        {state.loading ? (
          <ContentSkeleton rows={6} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : (
          <Table
            className="calendar-notifications-table"
            columns={columns}
            dataSource={filteredData}
            locale={{
              emptyText: <Empty description="Không có thông báo hoặc lịch họp nào phù hợp" />,
            }}
            onRow={(record) => ({
              onClick: () => setDetailItem(record),
              style: { cursor: 'pointer' },
            })}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} mục`,
            }}
            rowKey="id"
          />
        )}
      </div>

      {/* MODAL 1: TẠO LỊCH HỌP BAN BIÊN TẬP */}
      <CreateEditorialMeetingModal
        onClose={() => setCreateMeetingOpen(false)}
        onCreated={async () => {
          await state.reload();
        }}
        open={createMeetingOpen}
      />

      {/* MODAL 2: TẠO THÔNG BÁO */}
      <CreateBroadcastNoticeModal
        onClose={() => setCreateNoticeOpen(false)}
        onCreated={async () => {
          await state.reload();
        }}
        open={createNoticeOpen}
      />

      {/* MODAL 3: XEM CHI TIẾT */}
      <NotificationDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onUpdated={async () => {
          await state.reload();
        }}
      />
    </div>
  );
}

export { CalendarNotificationsPage as CalendarPage };
