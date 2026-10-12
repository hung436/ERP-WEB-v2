import { Button, DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Check, ChevronLeft, ChevronRight, Filter, Plus, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { calendarApi } from '@/services/api';
import type { CalendarEvent } from '@/types/domain';
import { CalendarEventDetailModal } from './components/CalendarEventDetailModal';
import { CreatePersonalMeetingModal } from './components/CreatePersonalMeetingModal';
import { WeekTimelineGrid } from './components/WeekTimelineGrid';
import './calendar-week.css';

dayjs.extend(isoWeek);

export function CalendarWeekPage() {
  // Tuần đang hiện hành (Mặc định Thứ Hai của tuần hiện tại)
  const [currentWeekStart, setCurrentWeekStart] = useState<Dayjs>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('date');
      if (dateParam && dayjs(dateParam).isValid()) {
        return dayjs(dateParam).startOf('isoWeek').startOf('day');
      }
    }
    return dayjs().startOf('isoWeek').startOf('day');
  });

  // Filters
  const [filterEditorial, setFilterEditorial] = useState(true);
  const [filterPersonal, setFilterPersonal] = useState(true);
  const [filterOnlyMyEvents, setFilterOnlyMyEvents] = useState(false);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch calendar events
  const state = useAsyncData(async () => (await calendarApi.list()).data);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (state.data) {
      setLocalEvents(state.data);
    }
  }, [state.data]);

  const allEvents = localEvents.length ? localEvents : (state.data ?? []);

  // Compute Week range string
  const currentWeekEnd = currentWeekStart.add(6, 'day');
  const weekLabel = `Tuần ${currentWeekStart.isoWeek()} (${currentWeekStart.format('DD/MM')} - ${currentWeekEnd.format('DD/MM/YYYY')})`;

  // Navigation handlers
  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => prev.subtract(7, 'day'));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => prev.add(7, 'day'));
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      // Find Monday of the selected date's week
      const dayOfWeek = date.day(); // 0 is Sunday, 1 is Monday
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      setCurrentWeekStart(date.add(diffToMonday, 'day').startOf('day'));
    }
  };

  // Event selection handler
  const handleSelectEvent = (event: CalendarEvent) => {
    // Business rule: Lịch BBT user KHÔNG tham dự thì KHÔNG mở modal xem chi tiết
    if (event.scope === 'editorial' && !event.isUserParticipant) {
      return;
    }
    setSelectedEvent(event);
    setDetailModalOpen(true);
  };

  // Event update handler (when comment or file is added)
  const handleUpdateEvent = (updated: CalendarEvent) => {
    setSelectedEvent(updated);
    setLocalEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  // Create personal meeting success handler
  const handleCreateSuccess = (newEvent: CalendarEvent) => {
    setLocalEvents((prev) => [newEvent, ...prev]);
    // Select the new event to open details
    setSelectedEvent(newEvent);
    setDetailModalOpen(true);
  };

  // Count events in current week
  const weekStats = useMemo(() => {
    const startStr = currentWeekStart.format('YYYY-MM-DD');
    const endStr = currentWeekEnd.format('YYYY-MM-DD');

    const inWeek = allEvents.filter((ev) => {
      const d = dayjs(ev.startAt).format('YYYY-MM-DD');
      return d >= startStr && d <= endStr;
    });

    return {
      editorial: inWeek.filter((e) => e.scope === 'editorial').length,
      personal: inWeek.filter((e) => e.scope === 'personal').length,
      attending: inWeek.filter((e) => e.isUserParticipant).length,
    };
  }, [allEvents, currentWeekStart, currentWeekEnd]);

  if (state.loading) return <ContentSkeleton />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;

  return (
    <div className="calendar-week-page">
      {/* 3 Distinct Clusters Toolbar */}
      <header className="calendar-week-header">
        {/* 1. Cụm Trái: Tinh giản bộ điều hướng thời gian */}
        <div className="header-cluster-left">
          <div className="calendar-week-nav-group">
            <Button
              aria-label="Tuần trước"
              icon={<ChevronLeft size={16} />}
              onClick={handlePrevWeek}
              size="middle"
              type="text"
            />
            <span className="current-week-label">{weekLabel}</span>
            <Button
              aria-label="Tuần sau"
              icon={<ChevronRight size={16} />}
              onClick={handleNextWeek}
              size="middle"
              type="text"
            />
          </div>

          <DatePicker
            allowClear={false}
            format="DD/MM/YYYY"
            onChange={handleDateChange}
            placeholder="Chọn ngày..."
            size="middle"
            style={{ width: 130 }}
            value={currentWeekStart}
          />
        </div>

        <div className="calendar-header-divider" />

        {/* 2. Cụm Giữa: Bộ lọc trực quan, dễ nhận biết và sử dụng */}
        <div className="header-cluster-middle">
          <div className="filter-lead-label">
            <Filter size={13} />
            <span>Lọc:</span>
          </div>

          <button
            aria-pressed={filterEditorial}
            className={`calendar-filter-btn editorial ${filterEditorial ? 'is-active' : 'is-inactive'}`}
            onClick={() => setFilterEditorial((prev) => !prev)}
            type="button"
          >
            {filterEditorial ? (
              <Check className="filter-check-icon" size={13} />
            ) : (
              <span className="filter-dot editorial" />
            )}
            <span className="filter-name">Ban biên tập</span>
            <span className="filter-counter">{weekStats.editorial}</span>
          </button>

          <button
            aria-pressed={filterPersonal}
            className={`calendar-filter-btn personal ${filterPersonal ? 'is-active' : 'is-inactive'}`}
            onClick={() => setFilterPersonal((prev) => !prev)}
            type="button"
          >
            {filterPersonal ? (
              <Check className="filter-check-icon" size={13} />
            ) : (
              <span className="filter-dot personal" />
            )}
            <span className="filter-name">Cá nhân</span>
            <span className="filter-counter">{weekStats.personal}</span>
          </button>

          <span className="filter-mini-divider" />

          <button
            aria-pressed={filterOnlyMyEvents}
            className={`calendar-filter-btn attending ${filterOnlyMyEvents ? 'is-active' : 'is-inactive'}`}
            onClick={() => setFilterOnlyMyEvents((prev) => !prev)}
            type="button"
          >
            {filterOnlyMyEvents ? (
              <Check className="filter-check-icon" size={13} />
            ) : (
              <User className="filter-user-icon" size={13} />
            )}
            <span className="filter-name">Chỉ hiện lịch có mặt tôi</span>
            <span className="filter-counter">{weekStats.attending}</span>
          </button>
        </div>

        {/* 3. Cụm Phải: Nút hành động chính */}
        <div className="header-cluster-right">
          <Button
            className="btn-create-meeting"
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            size="middle"
            type="primary"
          >
            Tạo lịch họp
          </Button>
        </div>
      </header>

      {/* 3. Google Calendar Weekly Timeline Grid */}
      <WeekTimelineGrid
        currentWeekStart={currentWeekStart}
        events={allEvents}
        filterEditorial={filterEditorial}
        filterOnlyMyEvents={filterOnlyMyEvents}
        filterPersonal={filterPersonal}
        onSelectEvent={handleSelectEvent}
      />

      {/* 4. Event Detail Modal (for participating events & personal meetings) */}
      <CalendarEventDetailModal
        event={selectedEvent}
        onClose={() => setDetailModalOpen(false)}
        onUpdateEvent={handleUpdateEvent}
        open={detailModalOpen}
      />

      {/* 5. Create Personal Meeting Modal */}
      <CreatePersonalMeetingModal
        initialDate={currentWeekStart.add(4, 'day')} // Default Friday
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        open={createModalOpen}
      />
    </div>
  );
}
