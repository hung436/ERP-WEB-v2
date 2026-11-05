import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs, { extend, type Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Alert,
  Button,
  ConfigProvider,
  DatePicker,
  Input,
  Popover,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
  FilterOutlined,
  LeftOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import locale from "antd/es/locale/vi_VN";

import { useAsyncData } from "@/hooks/useAsyncData";
import { calendarApi } from "@/services/api";
import type { CalendarEvent } from "@/types/domain";

import {
  collectDuty,
  normalizeMeeting,
  searchText,
  vietnamNow,
  getApprovalStatusMeta,
  type NormalizedMeetingEvent,
} from "./calendarWeekUtils";
import { getEventsForWeek } from "./mockCalendarData";
import { WeekColumns } from "./components/WeekColumns";
import { WeekTimeline } from "./components/WeekTimeline";
import { CalendarEventDetailModal } from "./components/CalendarEventDetailModal";
import { CreatePersonalMeetingModal } from "./components/CreatePersonalMeetingModal";
import { DayScheduleDrawer } from "./components/DayScheduleDrawer";
import "./components/DayScheduleDrawer.css";
import "./calendar-week.css";

extend(isoWeek);

const EVENTS_STORAGE_KEY = "jt_calendar_events_v8";

function ViewIcon({ vertical = false }: { vertical?: boolean }) {
  return (
    <svg
      className="booking-week-view-icon"
      aria-hidden="true"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <path d={vertical ? "M6 3v10M10 3v10" : "M3 6h10M3 10h10"} />
    </svg>
  );
}

export function CalendarWeekPage() {
  const [now, setNow] = useState<Dayjs>(vietnamNow);
  useEffect(() => {
    const timer = setInterval(() => setNow(vietnamNow()), 30000);
    return () => clearInterval(timer);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const requestedDate = new URLSearchParams(location.search).get("date");
  const selectedDate = useMemo(() => {
    if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      const parsed = dayjs(requestedDate);
      return parsed.isValid() ? parsed : vietnamNow();
    }
    return vietnamNow();
  }, [requestedDate]);

  const week = useMemo(() => selectedDate.startOf("isoWeek"), [selectedDate]);
  const end = useMemo(() => week.add(6, "day"), [week]);
  const fromDate = week.format("YYYY-MM-DD");

  // Fetch dữ liệu từ API
  const state = useAsyncData(async () => (await calendarApi.list()).data);
  const [userCreatedEvents, setUserCreatedEvents] = useState<CalendarEvent[]>(
    () => {
      try {
        // Dọn dẹp triệt để dữ liệu mẫu cũ nếu còn tồn tại trong trình duyệt
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("jt_calendar_events_store");
        }
        const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(
              (ev) => !/^(ádasd|đâsdasd|sdasd|abcdefgh|Phiếu công việc ngày.*)$/i.test((ev.title || '').trim())
            );
            return filtered;
          }
        }
      } catch {
        // ignore
      }
      return [];
    },
  );

  const [deletedEventIds, setDeletedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("jt_calendar_deleted_ids_v8");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const saveUserEvents = useCallback((events: CalendarEvent[]) => {
    setUserCreatedEvents(events);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore
    }
  }, []);

  const rawEvents = useMemo(() => {
    const base = state.data ?? [];
    if (userCreatedEvents.length === 0) return base;
    const map = new Map<string, CalendarEvent>();
    base.forEach((ev) => map.set(ev.id, ev));
    userCreatedEvents.forEach((ev) => map.set(ev.id, ev));
    return Array.from(map.values());
  }, [state.data, userCreatedEvents]);

  // Hợp nhất dữ liệu tuần phong phú (loại bỏ các lịch người dùng đã chọn Không tham gia)
  const allEvents = useMemo(() => {
    const eventsInWeek = getEventsForWeek(week, rawEvents);
    if (deletedEventIds.length === 0) return eventsInWeek;
    const deletedSet = new Set(deletedEventIds);
    return eventsInWeek.filter((ev) => !deletedSet.has(ev.id));
  }, [week, rawEvents, deletedEventIds]);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [editorial, setEditorial] = useState(true);
  const [personal, setPersonal] = useState(true);
  const [attending, setAttending] = useState(false);
  const [ticketTypes, setTicketTypes] = useState({
    TASK: true,
    MEETING: true,
    EVENT: true,
  });

  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [createDate, setCreateDate] = useState<Dayjs | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<"vertical" | "horizontal">(
    "vertical",
  );

  const CalendarView = viewMode === "vertical" ? WeekColumns : WeekTimeline;

  const toggleTicketType = (type: "TASK" | "MEETING" | "EVENT") => {
    setTicketTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const selectedTypeLabel = useMemo(() => {
    const selected: string[] = [];
    if (ticketTypes.MEETING) selected.push("Lịch họp");
    if (ticketTypes.EVENT) selected.push("Sự kiện");
    if (ticketTypes.TASK) selected.push("Phiếu công việc");
    if (selected.length === 3) return "Tất cả (3)";
    if (selected.length === 0) return "Chưa chọn (0)";
    if (selected.length === 1) return selected[0];
    return `${selected.length} loại đã chọn`;
  }, [ticketTypes]);

  const isSecondaryFiltered = useMemo(() => {
    return (
      attending ||
      !ticketTypes.MEETING ||
      !ticketTypes.EVENT ||
      !ticketTypes.TASK
    );
  }, [attending, ticketTypes]);

  const secondaryFilterCount = useMemo(() => {
    let count = 0;
    if (attending) count++;
    if (!ticketTypes.MEETING || !ticketTypes.EVENT || !ticketTypes.TASK)
      count++;
    return count;
  }, [attending, ticketTypes]);

  const handleResetSecondaryFilters = useCallback(() => {
    setAttending(false);
    setTicketTypes({ TASK: true, MEETING: true, EVENT: true });
  }, []);

  const changeDate = (date: Dayjs | null) => {
    if (!date) return;
    const params = new URLSearchParams(location.search);
    params.set("date", date.format("YYYY-MM-DD"));
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  // Chuẩn hóa meetings
  const meetings: NormalizedMeetingEvent[] = useMemo(() => {
    return allEvents
      .map((record) => normalizeMeeting(record, "nhanvien"))
      .filter((ev): ev is NormalizedMeetingEvent => ev !== null);
  }, [allEvents]);

  const duties = useMemo(() => collectDuty(allEvents), [allEvents]);

  const isInWeek = useCallback(
    (event: NormalizedMeetingEvent) =>
      event.date >= week.format("YYYY-MM-DD") &&
      event.date <= end.format("YYYY-MM-DD"),
    [week, end],
  );

  const searchedMeetings = useMemo(() => {
    if (!query.trim()) return meetings;
    const q = searchText(query.trim());
    return meetings.filter((event) => {
      const combined = [
        event.title,
        event.content,
        event.participantText,
        event.watcherText,
        event.location,
        event.leader,
      ]
        .filter(Boolean)
        .join(" ");
      return searchText(combined).includes(q);
    });
  }, [meetings, query]);

  const searchedInWeek = useMemo(
    () => searchedMeetings.filter(isInWeek),
    [searchedMeetings, isInWeek],
  );

  const filteredMeetings = useMemo(() => {
    return searchedMeetings.filter((event) => {
      const scopeMatch = attending
        ? event.isUserParticipant || event.isUserWatcher
        : event.scope === "personal"
          ? personal
          : editorial;
      const typeMatch = ticketTypes[event.ticketType || "MEETING"] !== false;
      return scopeMatch && typeMatch;
    });
  }, [searchedMeetings, attending, personal, editorial, ticketTypes]);

  const visible = useMemo(
    () => filteredMeetings.filter(isInWeek),
    [filteredMeetings, isInWeek],
  );

  const stats = useMemo(() => {
    return {
      editorial: searchedInWeek.filter((event) => event.scope === "editorial")
        .length,
      personal: searchedInWeek.filter((event) => event.scope === "personal")
        .length,
      attending: searchedInWeek.filter(
        (event) => event.isUserParticipant || event.isUserWatcher,
      ).length,
      task: searchedInWeek.filter((event) => event.ticketType === "TASK")
        .length,
      meeting: searchedInWeek.filter(
        (event) => (event.ticketType || "MEETING") === "MEETING",
      ).length,
      event: searchedInWeek.filter((event) => event.ticketType === "EVENT")
        .length,
      allStatus: searchedInWeek.length,
      pending: searchedInWeek.filter(
        (ev) => getApprovalStatusMeta(ev.approvalStatus, ev.ticketType, ev.workflowType).value === "PENDING",
      ).length,
      approved: searchedInWeek.filter((ev) => {
        const m = getApprovalStatusMeta(ev.approvalStatus, ev.ticketType, ev.workflowType).value;
        return m === "APPROVED" || m === "SCHEDULED";
      }).length,
      inProgress: searchedInWeek.filter(
        (ev) => getApprovalStatusMeta(ev.approvalStatus, ev.ticketType, ev.workflowType).value === "IN_PROGRESS",
      ).length,
      completed: searchedInWeek.filter(
        (ev) => getApprovalStatusMeta(ev.approvalStatus, ev.ticketType, ev.workflowType).value === "COMPLETED",
      ).length,
      rejected: searchedInWeek.filter(
        (ev) => getApprovalStatusMeta(ev.approvalStatus, ev.ticketType, ev.workflowType).value === "REJECTED",
      ).length,
    };
  }, [searchedInWeek]);

  // Selection handler - Logic từ feature/hang: Sự kiện Ban biên tập mà user KHÔNG tham gia thì không mở drawer chi tiết
  const handleSelectNormalizedEvent = (normalized: NormalizedMeetingEvent) => {
    if (normalized.scope === "editorial" && !normalized.isUserParticipant) {
      return;
    }
    const raw = normalized.raw || allEvents.find((e) => e.id === normalized.id);
    if (raw) {
      setSelectedEvent(raw);
    }
  };

  const handleUpdateEvent = useCallback((updated: CalendarEvent) => {
    setSelectedEvent(updated);
    const updatedList = [
      ...userCreatedEvents.filter((item) => item.id !== updated.id),
      updated,
    ];
    saveUserEvents(updatedList);
  }, [userCreatedEvents, saveUserEvents]);

  const handleToggleInterest = useCallback(
    (event: NormalizedMeetingEvent, nextState: boolean) => {
      const raw = event.raw || allEvents.find((e) => e.id === event.id);
      if (!raw) return;
      const updated: CalendarEvent = { ...raw, isInterested: nextState };
      const updatedList = [
        ...userCreatedEvents.filter((item) => item.id !== updated.id),
        updated,
      ];
      saveUserEvents(updatedList);
      // Chỉ cập nhật selectedEvent nếu drawer đang mở cho sự kiện này, không tự ý mở drawer
      setSelectedEvent((current) => (current?.id === updated.id ? updated : current));
    },
    [allEvents, userCreatedEvents, saveUserEvents],
  );

  const handleDeleteEvent = (eventId: string) => {
    const updatedList = userCreatedEvents.filter((item) => item.id !== eventId);
    saveUserEvents(updatedList);
    setDeletedEventIds((prev) => {
      const next = Array.from(new Set([...prev, eventId]));
      try {
        localStorage.setItem("jt_calendar_deleted_ids_v8", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setSelectedEvent(null);
  };

  const handleCreateSuccess = (newEvent: CalendarEvent) => {
    const updatedList = [
      newEvent,
      ...userCreatedEvents.filter((item) => item.id !== newEvent.id),
    ];
    saveUserEvents(updatedList);
    setDeletedEventIds((prev) => {
      if (!prev.includes(newEvent.id)) return prev;
      const next = prev.filter((id) => id !== newEvent.id);
      try {
        localStorage.setItem("jt_calendar_deleted_ids_v8", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    const evDate = dayjs(newEvent.startAt);
    if (
      evDate.isValid() &&
      (evDate.format("YYYY-MM-DD") < week.format("YYYY-MM-DD") ||
        evDate.format("YYYY-MM-DD") > end.format("YYYY-MM-DD"))
    ) {
      changeDate(evDate);
    }
    setSelectedEvent(newEvent);
    setCreateDate(null);
    setEditingEvent(null);
  };

  const handleResetData = useCallback(() => {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    localStorage.removeItem("jt_calendar_events_store");
    localStorage.removeItem("jt_calendar_deleted_ids_v8");
    setUserCreatedEvents([]);
    setDeletedEventIds([]);
    message.success("Đã khôi phục dữ liệu gốc thành công!");
  }, []);

  useEffect(() => {
    (
      window as unknown as { resetCalendarEvents?: () => void }
    ).resetCalendarEvents = handleResetData;
    return () => {
      delete (window as unknown as { resetCalendarEvents?: () => void })
        .resetCalendarEvents;
    };
  }, [handleResetData]);

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: "#D92D20",
          borderRadius: 10,
          colorBorder: "#E4E7EC",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        },
      }}
    >
      <main className="booking-week-page" aria-label="Lịch họp tuần">
        <header className="booking-week-toolbar">
          <div className="booking-week-nav-group">
            {searchOpen ? (
              <Input
                className="booking-week-search"
                aria-label="Tìm kiếm lịch công tác"
                prefix={<SearchOutlined />}
                value={query}
                placeholder="Tìm công việc, lịch họp, sự kiện..."
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => {
                  if (!query) setSearchOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setQuery("");
                    setSearchOpen(false);
                  }
                }}
                suffix={
                  <Button
                    type="text"
                    size="small"
                    aria-label="Đóng tìm kiếm"
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                    }}
                  />
                }
              />
            ) : (
              <Button
                className="booking-week-search-toggle"
                shape="circle"
                aria-label="Tìm kiếm lịch công tác"
                icon={<SearchOutlined />}
                onClick={() => setSearchOpen(true)}
              />
            )}

            <div className="booking-week-week-nav">
              <Button
                type="text"
                aria-label="Tuần trước"
                icon={<LeftOutlined />}
                onClick={() => changeDate(selectedDate.subtract(7, "day"))}
              />
              <DatePicker
                className="booking-week-label-picker"
                popupClassName="booking-week-picker-popup"
                aria-label="Chọn tuần"
                picker="week"
                inputReadOnly
                bordered={false}
                suffixIcon={null}
                allowClear={false}
                format={() =>
                  `Tuần ${week.isoWeek()} (${week.format("DD/MM")} - ${end.format("DD/MM/YYYY")})`
                }
                value={week}
                onChange={(date) => {
                  if (date) changeDate(date.startOf("isoWeek"));
                }}
              />
              <span
                className="current-week-label"
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              >
                {`Tuần ${week.isoWeek()} (${week.format("DD/MM")} - ${end.format("DD/MM/YYYY")})`}
              </span>
              <Button
                type="text"
                aria-label="Tuần sau"
                icon={<RightOutlined />}
                onClick={() => changeDate(selectedDate.add(7, "day"))}
              />
            </div>

            <Button
              className="booking-week-today-btn"
              onClick={() => changeDate(vietnamNow())}
            >
              Hôm nay
            </Button>
          </div>

          <div className="booking-week-divider booking-week-divider-nav" />

          {/* Cụm Nguồn lịch chính (Ban biên tập & Cá nhân) — LUÔN Ở NGOÀI THANH CÔNG CỤ THEO YÊU CẦU */}
          <div
            className="booking-week-source-group"
            role="group"
            aria-label="Nguồn lịch chính"
          >
            <button
              type="button"
              className={`booking-week-source-btn is-editorial ${editorial ? "is-active" : ""}`}
              aria-pressed={editorial}
              aria-label="Ban biên tập"
              onClick={() => setEditorial((value) => !value)}
            >
              <span
                className="booking-week-semantic-dot dot-editorial"
                aria-hidden="true"
              />
              <span className="booking-week-source-label">Ban biên tập</span>
              <span
                className={`booking-week-source-count ${state.loading ? "booking-week-count-loading" : ""}`}
              >
                {state.loading ? "" : stats.editorial}
              </span>
            </button>

            <button
              type="button"
              className={`booking-week-source-btn is-personal ${personal ? "is-active" : ""}`}
              aria-pressed={personal}
              aria-label="Cá nhân"
              onClick={() => setPersonal((value) => !value)}
            >
              <span
                className="booking-week-semantic-dot dot-personal"
                aria-hidden="true"
              />
              <span className="booking-week-source-label">Cá nhân</span>
              <span
                className={`booking-week-source-count ${state.loading ? "booking-week-count-loading" : ""}`}
              >
                {state.loading ? "" : stats.personal}
              </span>
            </button>
          </div>

          {/* Cụm bộ lọc phụ trải ngang — Hiển thị trên màn hình rộng lớn (>= 1680px) */}
          <div
            className="booking-week-filters-desktop"
            role="group"
            aria-label="Bộ lọc bổ sung"
          >
            <button
              type="button"
              className={`booking-week-modifier-btn ${attending ? "is-active" : ""}`}
              aria-pressed={attending}
              aria-label="Chỉ hiện lịch có mặt tôi"
              onClick={() => setAttending((value) => !value)}
            >
              <UserOutlined
                className="booking-week-modifier-icon"
                aria-hidden="true"
              />
              <span>Chỉ có mặt tôi</span>
              <span className="booking-week-modifier-count">
                {state.loading ? "" : stats.attending}
              </span>
              <span style={{ display: "none" }}>Chỉ hiện lịch có mặt tôi</span>
            </button>

            <div className="booking-week-divider" />

            <Popover
              trigger="click"
              placement="bottomLeft"
              overlayClassName="booking-week-type-popover"
              content={
                <div className="booking-week-type-menu">
                  <div className="booking-week-type-menu-head">
                    <span>Loại mục trên lịch</span>
                    {(!ticketTypes.MEETING ||
                      !ticketTypes.EVENT ||
                      !ticketTypes.TASK) && (
                      <button
                        type="button"
                        className="booking-week-type-reset"
                        onClick={() =>
                          setTicketTypes({
                            TASK: true,
                            MEETING: true,
                            EVENT: true,
                          })
                        }
                      >
                        Chọn tất cả
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`booking-week-type-menu-item ${ticketTypes.MEETING ? "is-checked" : ""}`}
                    aria-pressed={ticketTypes.MEETING}
                    onClick={() => toggleTicketType("MEETING")}
                  >
                    <span className="booking-week-type-menu-left">
                      <span className="booking-week-type-checkbox">
                        {ticketTypes.MEETING && <CheckOutlined />}
                      </span>
                      <span
                        className="booking-week-type-dot dot-meeting"
                        aria-hidden="true"
                      />
                      <span>Lịch họp</span>
                    </span>
                    <span className="booking-week-type-menu-count">
                      {stats.meeting}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`booking-week-type-menu-item ${ticketTypes.EVENT ? "is-checked" : ""}`}
                    aria-pressed={ticketTypes.EVENT}
                    onClick={() => toggleTicketType("EVENT")}
                  >
                    <span className="booking-week-type-menu-left">
                      <span className="booking-week-type-checkbox">
                        {ticketTypes.EVENT && <CheckOutlined />}
                      </span>
                      <span
                        className="booking-week-type-dot dot-event"
                        aria-hidden="true"
                      />
                      <span>Sự kiện</span>
                    </span>
                    <span className="booking-week-type-menu-count">
                      {stats.event}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`booking-week-type-menu-item ${ticketTypes.TASK ? "is-checked" : ""}`}
                    aria-pressed={ticketTypes.TASK}
                    onClick={() => toggleTicketType("TASK")}
                  >
                    <span className="booking-week-type-menu-left">
                      <span className="booking-week-type-checkbox">
                        {ticketTypes.TASK && <CheckOutlined />}
                      </span>
                      <span
                        className="booking-week-type-dot dot-task"
                        aria-hidden="true"
                      />
                      <span>Phiếu công việc</span>
                    </span>
                    <span className="booking-week-type-menu-count">
                      {stats.task}
                    </span>
                  </button>
                </div>
              }
            >
              <button
                type="button"
                className={`booking-week-type-dropdown-btn ${!ticketTypes.MEETING || !ticketTypes.EVENT || !ticketTypes.TASK ? "is-filtered" : ""}`}
                aria-label="Lọc theo loại mục"
              >
                <span className="booking-week-type-prefix">Loại:</span>
                <span className="booking-week-type-value">
                  {selectedTypeLabel}
                </span>
                <DownOutlined className="booking-week-type-arrow" />
              </button>
            </Popover>
          </div>

          {/* Cụm nút Bộ lọc thu gọn — Hiển thị trên laptop/tablet (< 1680px) chứa Chỉ có mặt tôi & Loại mục */}
          <div className="booking-week-filters-compact">
            <Popover
              trigger="click"
              placement="bottomLeft"
              overlayClassName="booking-week-compact-filter-popover"
              content={
                <div className="booking-week-compact-filter-panel">
                  <div className="booking-week-compact-filter-header">
                    <span className="booking-week-compact-filter-title">
                      Bộ lọc lịch làm việc
                    </span>
                    {isSecondaryFiltered && (
                      <button
                        type="button"
                        className="booking-week-compact-filter-reset"
                        onClick={handleResetSecondaryFilters}
                      >
                        Đặt lại
                      </button>
                    )}
                  </div>

                  <div className="booking-week-compact-filter-group">
                    <span className="booking-week-compact-filter-group-title">
                      Tham gia
                    </span>
                    <button
                      type="button"
                      className={`booking-week-modifier-btn ${attending ? "is-active" : ""}`}
                      aria-pressed={attending}
                      aria-label="Chỉ hiện lịch có mặt tôi"
                      onClick={() => setAttending((value) => !value)}
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <UserOutlined
                          className="booking-week-modifier-icon"
                          aria-hidden="true"
                        />
                        <span>Chỉ có mặt tôi</span>
                      </span>
                      <span className="booking-week-modifier-count">
                        {state.loading ? "" : stats.attending}
                      </span>
                    </button>
                  </div>

                  <div className="booking-week-compact-filter-group">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span className="booking-week-compact-filter-group-title">
                        Loại mục
                      </span>
                      {(!ticketTypes.MEETING ||
                        !ticketTypes.EVENT ||
                        !ticketTypes.TASK) && (
                        <button
                          type="button"
                          className="booking-week-type-reset"
                          onClick={() =>
                            setTicketTypes({
                              TASK: true,
                              MEETING: true,
                              EVENT: true,
                            })
                          }
                        >
                          Chọn tất cả
                        </button>
                      )}
                    </div>
                    <div
                      className="booking-week-type-menu"
                      style={{ width: "100%" }}
                    >
                      <button
                        type="button"
                        className={`booking-week-type-menu-item ${ticketTypes.MEETING ? "is-checked" : ""}`}
                        aria-pressed={ticketTypes.MEETING}
                        onClick={() => toggleTicketType("MEETING")}
                      >
                        <span className="booking-week-type-menu-left">
                          <span className="booking-week-type-checkbox">
                            {ticketTypes.MEETING && <CheckOutlined />}
                          </span>
                          <span
                            className="booking-week-type-dot dot-meeting"
                            aria-hidden="true"
                          />
                          <span>Lịch họp</span>
                        </span>
                        <span className="booking-week-type-menu-count">
                          {stats.meeting}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`booking-week-type-menu-item ${ticketTypes.EVENT ? "is-checked" : ""}`}
                        aria-pressed={ticketTypes.EVENT}
                        onClick={() => toggleTicketType("EVENT")}
                      >
                        <span className="booking-week-type-menu-left">
                          <span className="booking-week-type-checkbox">
                            {ticketTypes.EVENT && <CheckOutlined />}
                          </span>
                          <span
                            className="booking-week-type-dot dot-event"
                            aria-hidden="true"
                          />
                          <span>Sự kiện</span>
                        </span>
                        <span className="booking-week-type-menu-count">
                          {stats.event}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`booking-week-type-menu-item ${ticketTypes.TASK ? "is-checked" : ""}`}
                        aria-pressed={ticketTypes.TASK}
                        onClick={() => toggleTicketType("TASK")}
                      >
                        <span className="booking-week-type-menu-left">
                          <span className="booking-week-type-checkbox">
                            {ticketTypes.TASK && <CheckOutlined />}
                          </span>
                          <span
                            className="booking-week-type-dot dot-task"
                            aria-hidden="true"
                          />
                          <span>Phiếu công việc</span>
                        </span>
                        <span className="booking-week-type-menu-count">
                          {stats.task}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              }
            >
              <button
                type="button"
                className={`booking-week-compact-filter-btn ${isSecondaryFiltered ? "is-active" : ""}`}
                aria-label="Bộ lọc lịch"
              >
                <FilterOutlined className="booking-week-filter-icon" />
                <span>Bộ lọc</span>
                {isSecondaryFiltered && secondaryFilterCount > 0 && (
                  <span className="booking-week-filter-badge">
                    {secondaryFilterCount}
                  </span>
                )}
                <DownOutlined className="booking-week-filter-arrow" />
              </button>
            </Popover>
          </div>

          <div className="booking-week-toolbar-actions">
            <Button
              className="booking-week-refresh"
              type="text"
              aria-label="Làm mới lịch họp"
              title="Làm mới lịch tuần"
              loading={state.loading}
              icon={<ReloadOutlined />}
              onClick={() => state.reload()}
            />
            <div
              className="booking-week-view-switch"
              role="group"
              aria-label="Bố cục lịch tuần"
            >
              <button
                type="button"
                className={
                  viewMode === "vertical" ? "booking-week-view-active" : ""
                }
                aria-label="Xem dạng dọc theo từng cột ngày"
                title="Dạng Lưới 7 cột"
                aria-pressed={viewMode === "vertical"}
                onClick={() => setViewMode("vertical")}
              >
                <ViewIcon vertical />
              </button>
              <button
                type="button"
                className={
                  viewMode === "horizontal" ? "booking-week-view-active" : ""
                }
                aria-label="Xem dạng ngang theo dòng thời gian"
                title="Dạng Dòng thời gian (Timeline)"
                aria-pressed={viewMode === "horizontal"}
                onClick={() => setViewMode("horizontal")}
              >
                <ViewIcon />
              </button>
            </div>
            <Button
              type="primary"
              className="booking-week-create"
              aria-label="Tạo"
              icon={<PlusOutlined />}
              onClick={() => setCreateDate(selectedDate)}
            >
              <span>Tạo</span>
            </Button>
          </div>
        </header>

        {state.error && (
          <Alert
            type="error"
            showIcon
            message={state.error}
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => state.reload()}
              >
                Thử lại
              </Button>
            }
          />
        )}

        <div className="booking-week-timeline-wrap">
          {state.loading && (
            <span className="booking-week-loading-label" role="status">
              Đang tải lịch họp...
            </span>
          )}
          <CalendarView
            key={`${viewMode}-${fromDate}`}
            week={week}
            now={now}
            selectedDate={selectedDate}
            events={visible}
            duties={duties}
            showDuty={editorial}
            loading={
              state.loading &&
              (location.search.includes("state=loading") ||
                visible.length === 0)
            }
            disabledHover={Boolean(selectedDay || selectedEvent || createDate)}
            onSelectDay={(day) => {
              setSelectedDay(day);
              changeDate(day);
            }}
            onSelectEvent={handleSelectNormalizedEvent}
            onToggleInterest={handleToggleInterest}
          />
        </div>

        {selectedDay && (
          <DayScheduleDrawer
            open={Boolean(selectedDay)}
            day={selectedDay}
            events={allEvents}
            onClose={() => setSelectedDay(null)}
            onSelectEvent={(ev) => {
              if (ev.scope === "editorial" && !ev.isUserParticipant) {
                return;
              }
              setSelectedEvent(ev);
            }}
            onCreateEvent={(day) => {
              setCreateDate(day);
            }}
            onPrevDay={() => {
              const prev = selectedDay.subtract(1, "day");
              setSelectedDay(prev);
              changeDate(prev);
            }}
            onNextDay={() => {
              const next = selectedDay.add(1, "day");
              setSelectedDay(next);
              changeDate(next);
            }}
          />
        )}

        {selectedEvent && (
          <CalendarEventDetailModal
            key={selectedEvent.id}
            event={selectedEvent}
            open={Boolean(selectedEvent)}
            onClose={() => setSelectedEvent(null)}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {(createDate || editingEvent) && (
          <CreatePersonalMeetingModal
            open={Boolean(createDate || editingEvent)}
            initialDate={createDate}
            editingEvent={editingEvent}
            existingEvents={allEvents}
            onClose={() => {
              setCreateDate(null);
              setEditingEvent(null);
            }}
            onSuccess={(record) => {
              if (editingEvent) {
                handleUpdateEvent(record);
              } else {
                handleCreateSuccess(record);
              }
              setEditingEvent(null);
              setCreateDate(null);
            }}
          />
        )}
      </main>
    </ConfigProvider>
  );
}

export default CalendarWeekPage;
