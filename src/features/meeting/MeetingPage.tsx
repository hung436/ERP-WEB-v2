import { Button, Dropdown, Input, MenuProps, Segmented, Tooltip, message } from 'antd';
import { useMemo, useState } from 'react';
import { Calendar, ChevronDown, Copy, Link as LinkIcon, Plus, Search, Video, Zap } from 'lucide-react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { MeetingQuickView } from '@/features/dashboard/quickViews/MeetingQuickView';
import { ActiveMeetingRoomModal } from '@/features/meeting/components/ActiveMeetingRoomModal';
import { CreateMeetingModal } from '@/features/meeting/components/CreateMeetingModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { meetingApi } from '@/services/api';
import type { MeetingEvent } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

const initials = (value: string) =>
  value
    .split(' ')
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

export function MeetingPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [search, setSearch] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<MeetingEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const state = useAsyncData(async () => (await meetingApi.list()).data);
  const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

  const allMeetings = state.data ?? [];

  const getMeetingStatus = (startAt: string, endAt: string) => {
    const now = Date.now();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    if (now >= start && now <= end) return 'live';
    if (now < start) return 'upcoming';
    return 'past';
  };

  const getPlatformBadge = (platform?: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('google')) return { label: 'Google Meet', color: '#1a73e8', bg: '#e8f0fe', icon: '🟢' };
    if (p.includes('teams')) return { label: 'MS Teams', color: '#464eb8', bg: '#f2f3fd', icon: '🔵' };
    if (p.includes('zoom')) return { label: 'Zoom', color: '#0b5cff', bg: '#edf3ff', icon: '🟣' };
    return null;
  };

  const todayMeetings = useMemo(
    () => allMeetings.filter((event) => event.startAt.startsWith(currentDate)),
    [allMeetings, currentDate]
  );

  const upcomingMeetings = useMemo(
    () => allMeetings.filter((event) => new Date(event.startAt).getTime() > Date.now()),
    [allMeetings]
  );

  const liveMeetings = useMemo(
    () => allMeetings.filter((event) => getMeetingStatus(event.startAt, event.endAt) === 'live'),
    [allMeetings]
  );

  const pastMeetings = useMemo(
    () => allMeetings.filter((event) => new Date(event.endAt).getTime() < Date.now()),
    [allMeetings]
  );

  const rows = useMemo(() => {
    let list = allMeetings;
    if (activeTab === 'today') list = todayMeetings;
    else if (activeTab === 'upcoming') list = upcomingMeetings;
    else if (activeTab === 'past') list = pastMeetings;

    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return list;
    return list.filter((event) =>
      `${event.title} ${event.organizer} ${event.agenda} ${event.meetingId ?? ''} ${event.platform ?? ''}`
        .toLocaleLowerCase('vi')
        .includes(keyword)
    );
  }, [activeTab, allMeetings, pastMeetings, search, todayMeetings, upcomingMeetings]);

  const handleInstantMeeting = async () => {
    try {
      const roomCode = `TT-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
      const created = (
        await meetingApi.create({
          title: 'Cuộc họp tức thì',
          startAt: new Date().toISOString(),
          endAt: new Date(Date.now() + 3600000).toISOString(),
          platform: 'Phòng họp ứng dụng Tuổi Trẻ',
          location: 'Phòng họp trực tuyến',
          type: 'meeting',
          meetingId: roomCode,
          recordingAvailable: true,
          agenda: 'Phòng họp video trực tiếp khởi tạo ngay trên ứng dụng ERP Tuổi Trẻ.',
          participants: ['Nguyễn Minh Anh (Bạn)', 'Trần Thu Hà', 'Lê Thanh Vân'],
        })
      ).data;
      await state.reload();
      setActiveMeetingRoom(created);
      message.success(`Đã khởi tạo phòng họp video: ${roomCode}`);
    } catch {
      message.error('Không thể tạo cuộc họp tức thì');
    }
  };

  const handleCreateForLater = async () => {
    const roomCode = `TT-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    const url = `https://meeting.tuoitre.vn/${roomCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    message.success(`Đã tạo liên kết cuộc họp: ${url} (Đã sao chép vào bộ nhớ tạm)`);
  };

  const handleQuickJoin = () => {
    if (!joinCode.trim()) return;
    const targetRoom: MeetingEvent = allMeetings.find(
      (m) => m.meetingId === joinCode.trim() || m.title.includes(joinCode.trim())
    ) || {
      id: `custom-${Date.now()}`,
      title: `Phòng họp ${joinCode.toUpperCase()}`,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 3600000).toISOString(),
      platform: 'Phòng họp ứng dụng Tuổi Trẻ',
      type: 'meeting',
      organizer: 'Nguyễn Minh Anh',
      meetingId: joinCode.trim().toUpperCase(),
      agenda: `Tham gia phòng họp video nội bộ mã ${joinCode.toUpperCase()}`,
      participants: ['Nguyễn Minh Anh (Bạn)', 'Lê Thanh Vân', 'Nguyễn Hoài Nam'],
    };
    setActiveMeetingRoom(targetRoom);
    message.success(`Đã vào phòng họp trực tiếp: ${joinCode.toUpperCase()}`);
    setJoinCode('');
  };

  const handleCopyLink = (event: MeetingEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = event.meetingUrl || `https://meeting.tuoitre.vn/${event.meetingId || event.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    message.success('Đã sao chép liên kết cuộc họp');
  };

  // Google Meet New Meeting Menu Items
  const newMeetingMenuItems: MenuProps['items'] = [
    {
      key: 'instant',
      icon: <Zap size={16} />,
      label: <span style={{ fontWeight: 600 }}>Bắt đầu một cuộc họp tức thì</span>,
      onClick: () => void handleInstantMeeting(),
    },
    {
      key: 'schedule',
      icon: <Calendar size={16} />,
      label: <span>Lên lịch trong Lịch làm việc</span>,
      onClick: () => setCreateOpen(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'create-later',
      icon: <LinkIcon size={16} />,
      label: <span>Tạo một cuộc họp để sử dụng sau</span>,
      onClick: () => void handleCreateForLater(),
    },
  ];

  return (
    <div className="module-page online-meetings-page simple-meet-page">
      {/* TOP GOOGLE MEET ACTION BAR (HEADER) */}
      <header className="gmeet-top-bar surface-panel">
        <div className="gmeet-top-title-area">
          <span className="gmeet-top-icon">
            <ModuleIcon module="meetings" size={22} />
          </span>
          <div className="gmeet-top-text">
            <h1>Họp trực tuyến</h1>
          </div>
        </div>

        {/* Action Controls: Google Meet styled "Cuộc họp mới" & "Nhập mã hoặc đường liên kết" */}
        <div className="gmeet-action-controls">
          <Dropdown menu={{ items: newMeetingMenuItems }} placement="bottomRight" trigger={['click']}>
            <Button
              className="btn-gmeet-new"
              icon={<Video size={18} />}
              type="primary"
            >
              <span>Cuộc họp mới</span>
              <ChevronDown size={15} style={{ marginLeft: 2 }} />
            </Button>
          </Dropdown>

          <div className="gmeet-join-input-group">
            <Input
              allowClear
              className="gmeet-join-input"
              onChange={(e) => setJoinCode(e.target.value)}
              onPressEnter={handleQuickJoin}
              placeholder="Nhập mã hoặc đường liên kết"
              prefix={<span className="gmeet-kbd">⌨</span>}
              value={joinCode}
            />
            <Button
              className="btn-gmeet-join"
              disabled={!joinCode.trim()}
              onClick={handleQuickJoin}
              type="link"
            >
              Tham gia
            </Button>
          </div>
        </div>
      </header>

      {/* SCHEDULE & MEETING LIST */}
      <section className="meet-schedule-panel surface-panel">
        <div className="schedule-toolbar">
          <div className="toolbar-tabs">
            <Segmented
              className="meet-filter-segmented"
              onChange={(val) => setActiveTab(val as 'all' | 'today' | 'upcoming' | 'past')}
              options={[
                { label: `Tất cả (${allMeetings.length})`, value: 'all' },
                { label: `Hôm nay (${todayMeetings.length})`, value: 'today' },
                { label: `Sắp tới (${upcomingMeetings.length})`, value: 'upcoming' },
                { label: `Đã kết thúc (${pastMeetings.length})`, value: 'past' },
              ]}
              value={activeTab}
            />
          </div>

          <div className="toolbar-search-wrap">
            <Input
              allowClear
              className="meet-search-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên cuộc họp, người chủ trì, mã phòng..."
              prefix={<Search className="search-icon-svg" size={16} />}
              value={search}
            />
          </div>
        </div>

        {state.loading ? (
          <ContentSkeleton rows={5} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : !rows.length ? (
          <div className="meet-empty-box">
            <EmptyState description="Không tìm thấy cuộc họp nào phù hợp với bộ lọc hiện tại" />
            <Button
              className="btn-create-empty"
              icon={<Plus size={16} />}
              onClick={() => setCreateOpen(true)}
              type="primary"
            >
              Tạo cuộc họp mới
            </Button>
          </div>
        ) : (
          <div className="meet-cards-feed">
            {rows.map((event) => {
              const status = getMeetingStatus(event.startAt, event.endAt);
              const platform = getPlatformBadge(event.platform);
              const startTime = new Date(event.startAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const endTime = new Date(event.endAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateStr = new Date(event.startAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const durationMin = Math.round(
                (new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) / 60000
              );

              return (
                <article className={`meet-wow-item-card status-card-${status}`} key={event.id}>
                  {/* TIME & STATUS COLUMN */}
                  <div className="item-time-col">
                    <div className="time-status-row">
                      {status === 'live' ? (
                        <span className="status-chip chip-live">
                          <span className="pulse-dot" /> Đang diễn ra
                        </span>
                      ) : status === 'upcoming' ? (
                        <span className="status-chip chip-upcoming">⏳ Sắp diễn ra</span>
                      ) : (
                        <span className="status-chip chip-past">Đã kết thúc</span>
                      )}
                    </div>
                    <strong className="time-range-text">
                      {startTime} – {endTime}
                    </strong>
                    <span className="time-date-text">{dateStr}</span>
                    <small className="time-duration-text">{durationMin} phút</small>
                  </div>

                  {/* MAIN INFO COLUMN */}
                  <div
                    className="item-main-col"
                    onClick={() => setSelectedEvent(event)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="item-title-row">
                      <h3>{event.title}</h3>
                      {platform && (
                        <span
                          className="platform-badge"
                          style={{ color: platform.color, backgroundColor: platform.bg }}
                        >
                          {platform.icon} {platform.label}
                        </span>
                      )}
                      <span className="item-id-badge">ID: {event.meetingId ?? 'TT-ROOM'}</span>
                      <Tooltip title="Sao chép liên kết phòng họp">
                        <button
                          aria-label="Sao chép link"
                          className="btn-copy-link"
                          onClick={(e) => handleCopyLink(event, e)}
                          type="button"
                        >
                          <Copy size={13} />
                        </button>
                      </Tooltip>
                    </div>

                    <div className="item-organizer-row">
                      <span>
                        👤 Chủ trì: <strong>{event.organizer}</strong>
                      </span>
                      {event.location &&
                        event.location !== event.platform &&
                        event.location !== 'In-App Video Engine' && (
                          <span className="organizer-loc"> · 📍 {event.location}</span>
                        )}
                    </div>

                    {event.agenda && <p className="item-agenda-text">{event.agenda}</p>}
                  </div>

                  {/* PARTICIPANTS AVATAR STACK */}
                  <div className="item-people-col">
                    <div className="avatar-group">
                      {event.participants?.slice(0, 3).map((person) => (
                        <i className={avatarTone(person)} key={person} title={person}>
                          {initials(person)}
                        </i>
                      ))}
                      {(event.participants?.length ?? 0) > 3 && (
                        <span className="avatar-more">
                          +{(event.participants?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                    <small className="people-count">
                      {event.participants?.length ?? 0} người tham gia
                    </small>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="item-action-col">
                    <Button
                      className="item-join-btn"
                      icon={<Video size={15} />}
                      onClick={() => setActiveMeetingRoom(event)}
                      type="primary"
                    >
                      {status === 'live' ? 'Vào họp ngay 🔴' : 'Tham gia'}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* IN-APP ACTIVE VIDEO ROOM MODAL */}
      {activeMeetingRoom && (
        <ActiveMeetingRoomModal
          event={activeMeetingRoom}
          onClose={() => setActiveMeetingRoom(null)}
        />
      )}

      {/* QUICK VIEW & CREATION MODALS */}
      {selectedEvent && (
        <MeetingQuickView event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      <CreateMeetingModal
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          await state.reload();
        }}
        open={createOpen}
      />
    </div>
  );
}

export const CalendarPage = MeetingPage;
