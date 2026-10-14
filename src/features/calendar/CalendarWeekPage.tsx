import { Button, DatePicker, Tooltip } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Check, ChevronLeft, ChevronRight, Filter, Plus, Search, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { calendarApi } from '@/services/api';
import type { CalendarEvent } from '@/types/domain';
import { CalendarEventDetailModal } from './components/CalendarEventDetailModal';
import { CreatePersonalMeetingModal } from './components/CreatePersonalMeetingModal';
import { DayScheduleDrawer } from './components/DayScheduleDrawer';
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

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // Đóng ô tìm kiếm khi click chuột ra ngoài (nếu chưa nhập từ khóa)
  useEffect(() => {
    if (!isSearchOpen || searchQuery) return;
    const handleOutside = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isSearchOpen, searchQuery]);

  // Filters
  const [filterEditorial, setFilterEditorial] = useState(true);
  const [filterPersonal, setFilterPersonal] = useState(true);
  const [filterOnlyMyEvents, setFilterOnlyMyEvents] = useState(false);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createMeetingInitialDate, setCreateMeetingInitialDate] = useState<Dayjs | null>(null);

  // Day Schedule Drawer (Xem lịch trong ngày)
  const [selectedDayForSchedule, setSelectedDayForSchedule] = useState<Dayjs | null>(null);
  const [dayScheduleDrawerOpen, setDayScheduleDrawerOpen] = useState(false);

  // Fetch calendar events
  const state = useAsyncData(async () => (await calendarApi.list()).data);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (state.data) {
      setLocalEvents(state.data);
      setHasLoaded(true);
    }
  }, [state.data]);

  const allEvents = hasLoaded ? localEvents : (state.data ?? []);

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

  // Event selection handler - Các sự kiện không được tham gia thì không được mở drawer sâu chi tiết
  const handleSelectEvent = (event: CalendarEvent) => {
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

  // Event delete handler
  const handleDeleteEvent = (eventId: string) => {
    setLocalEvents((prev) => prev.filter((item) => item.id !== eventId));
    setSelectedEvent(null);
    setDetailModalOpen(false);
  };

  // Create personal meeting success handler
  const handleCreateSuccess = (newEvent: CalendarEvent) => {
    setLocalEvents((prev) => [newEvent, ...prev]);
    // Select the new event to open details
    setSelectedEvent(newEvent);
    setDetailModalOpen(true);
  };

  // Search filter
  const searchedEvents = useMemo(() => {
    if (!searchQuery.trim()) return allEvents;
    const q = searchQuery.toLowerCase().trim();
    return allEvents.filter((ev) => {
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchLocation = ev.location?.toLowerCase().includes(q);
      const matchLeader = ev.leader?.toLowerCase().includes(q);
      const matchParticipants = ev.participantText?.toLowerCase().includes(q);
      return matchTitle || matchLocation || matchLeader || matchParticipants;
    });
  }, [allEvents, searchQuery]);

  // Count events in current week
  const weekStats = useMemo(() => {
    const startStr = currentWeekStart.format('YYYY-MM-DD');
    const endStr = currentWeekEnd.format('YYYY-MM-DD');

    const inWeek = searchedEvents.filter((ev) => {
      const d = dayjs(ev.startAt).format('YYYY-MM-DD');
      return d >= startStr && d <= endStr;
    });

    return {
      editorial: inWeek.filter((e) => e.scope === 'editorial').length,
      personal: inWeek.filter((e) => e.scope === 'personal').length,
      attending: inWeek.filter((e) => e.isUserParticipant).length,
    };
  }, [searchedEvents, currentWeekStart, currentWeekEnd]);

  if (state.loading) return <ContentSkeleton />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;

  // Day selection handler (Xem lịch trong ngày)
  const handleSelectDay = (day: Dayjs) => {
    setSelectedDayForSchedule(day);
    setDayScheduleDrawerOpen(true);
  };

  const handleCreateMeetingForDay = (day: Dayjs) => {
    setCreateMeetingInitialDate(day);
    setCreateModalOpen(true);
  };

  const handlePrevScheduleDay = () => {
    if (selectedDayForSchedule) {
      setSelectedDayForSchedule(selectedDayForSchedule.subtract(1, 'day'));
    }
  };

  const handleNextScheduleDay = () => {
    if (selectedDayForSchedule) {
      setSelectedDayForSchedule(selectedDayForSchedule.add(1, 'day'));
    }
  };

  return (
    <div className="calendar-week-page">
      {/* Toolbar matching mockup */}
      <header className="calendar-week-header">
        {/* Search icon button / expandable search input */}
        <div
          className={`calendar-search-wrap ${isSearchOpen || searchQuery ? 'is-open' : ''}`}
          ref={searchWrapRef}
        >
          {!isSearchOpen && !searchQuery ? (
            <Tooltip title="Tìm kiếm lịch công tác">
              <Button
                aria-label="Tìm kiếm lịch công tác"
                className="calendar-search-toggle-btn"
                icon={<Search size={15} />}
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                shape="circle"
                size="middle"
              />
            </Tooltip>
          ) : (
            <div className="calendar-search-expanded">
              <Search className="calendar-search-icon" size={14} />
              <input
                ref={searchInputRef}
                aria-label="Tìm kiếm lịch công tác"
                className="calendar-search-input"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    if (searchQuery) setSearchQuery('');
                    else setIsSearchOpen(false);
                  }
                }}
                placeholder="Tìm kiếm..."
                type="text"
                value={searchQuery}
              />
              <button
                aria-label="Đóng tìm kiếm"
                className="calendar-search-close-btn"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                title="Đóng tìm kiếm"
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* 1. Cụm điều hướng thời gian */}
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

        {/* 2. Cụm Giữa: Bộ lọc trực quan */}
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

        {/* 3. Cụm Phải: Nút Tạo lịch họp */}
        <div className="header-cluster-right">
          <Button
            className="btn-create-meeting"
            icon={<Plus size={16} />}
            onClick={() => {
              setCreateMeetingInitialDate(null);
              setCreateModalOpen(true);
            }}
            size="middle"
            type="primary"
          >
            Tạo lịch họp
          </Button>
        </div>
      </header>

      {/* Timeline Grid ngang */}
      <WeekTimelineGrid
        currentWeekStart={currentWeekStart}
        events={searchedEvents}
        filterEditorial={filterEditorial}
        filterOnlyMyEvents={filterOnlyMyEvents}
        filterPersonal={filterPersonal}
        onSelectDay={handleSelectDay}
        onSelectEvent={handleSelectEvent}
      />

      {/* 4. Event Detail Modal (for participating events & personal meetings) */}
      <CalendarEventDetailModal
        event={selectedEvent}
        onClose={() => setDetailModalOpen(false)}
        onDeleteEvent={handleDeleteEvent}
        onUpdateEvent={handleUpdateEvent}
        open={detailModalOpen}
      />

      {/* 5. Create Personal Meeting Modal */}
      <CreatePersonalMeetingModal
        initialDate={createMeetingInitialDate || currentWeekStart.add(4, 'day')}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateMeetingInitialDate(null);
        }}
        onSuccess={handleCreateSuccess}
        open={createModalOpen}
      />

      {/* 6. Day Schedule Drawer (Xem lịch trong ngày) */}
      <DayScheduleDrawer
        day={selectedDayForSchedule}
        events={allEvents}
        onClose={() => setDayScheduleDrawerOpen(false)}
        onCreateEvent={handleCreateMeetingForDay}
        onNextDay={handleNextScheduleDay}
        onPrevDay={handlePrevScheduleDay}
        onSelectEvent={handleSelectEvent}
        open={dayScheduleDrawerOpen}
      />
    </div>
  );
}
