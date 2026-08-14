import { Button, Dropdown, Input, MenuProps, Segmented, message } from 'antd';
import { useMemo, useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { MeetingQuickView } from '@/features/dashboard/quickViews/MeetingQuickView';
import { CreateMeetingModal } from '@/features/meeting/components/CreateMeetingModal';
import { ActiveMeetingRoomModal } from '@/features/meeting/components/ActiveMeetingRoomModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { meetingApi } from '@/services/api';
import type { MeetingEvent } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

const initials = (value: string) => value.split(' ').slice(-2).map((word) => word[0]).join('').toUpperCase();

export function MeetingPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming'>('all');
  const [search, setSearch] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<MeetingEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const state = useAsyncData(async () => (await meetingApi.list()).data);
  const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

  const allMeetings = state.data ?? [];
  const todayMeetings = useMemo(() => allMeetings.filter((event) => event.startAt.startsWith(currentDate)), [allMeetings, currentDate]);
  const upcomingMeetings = useMemo(() => allMeetings.filter((event) => new Date(event.startAt) >= new Date()), [allMeetings]);

  const rows = useMemo(() => {
    let list = allMeetings;
    if (activeTab === 'today') list = todayMeetings;
    if (activeTab === 'upcoming') list = upcomingMeetings;
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return list;
    return list.filter((event) => `${event.title} ${event.organizer} ${event.agenda} ${event.meetingId}`.toLocaleLowerCase('vi').includes(keyword));
  }, [activeTab, allMeetings, search, todayMeetings, upcomingMeetings]);

  const handleInstantMeeting = async () => {
    try {
      const roomCode = `TT-INSTANT-${Math.floor(1000 + Math.random() * 9000)}`;
      const created = (await meetingApi.create({
        title: 'Cuộc họp video tức thì',
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600000).toISOString(),
        platform: 'Phòng họp ứng dụng Tuổi Trẻ',
        location: 'In-App Video Engine',
        type: 'meeting',
        meetingId: roomCode,
        recordingAvailable: true,
        agenda: 'Phòng họp video trực tiếp khởi tạo ngay trên ứng dụng ERP Tuổi Trẻ.',
        participants: ['Nguyễn Minh Anh (Bạn)', 'Trần Thu Hà', 'Lê Thanh Vân'],
      })).data;
      await state.reload();
      setActiveMeetingRoom(created);
      message.success(`Đã khởi tạo phòng họp video: ${roomCode}`);
    } catch {
      message.error('Không thể tạo cuộc họp tức thì');
    }
  };

  const handleQuickJoin = () => {
    if (!joinCode.trim()) return;
    const targetRoom: MeetingEvent = allMeetings.find((m) => m.meetingId === joinCode.trim() || m.title.includes(joinCode.trim())) || {
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
  };

  const createMenuItems: MenuProps['items'] = [
    {
      key: 'instant',
      icon: <ModuleIcon module="meetings" size={16} />,
      label: 'Bắt đầu cuộc họp tức thì',
      onClick: () => void handleInstantMeeting(),
    },
    {
      key: 'schedule',
      icon: <ModuleIcon module="calendar" size={16} />,
      label: 'Lên lịch họp mới',
      onClick: () => setCreateOpen(true),
    },
  ];

  return (
    <div className="module-page online-meetings-page meet-wow-page">
      {/* HERO SECTION */}
      <section className="meet-wow-hero surface-panel">
        <div className="meet-wow-left">
          <h1>Họp trực tuyến</h1>
          <p>Tạo phòng họp trực tuyến tức thì, lên lịch họp hoặc nhập mã phòng họp để vào họp ngay trên ứng dụng ERP Tuổi Trẻ.</p>

          <div className="meet-wow-actions">
            <Dropdown menu={{ items: createMenuItems }} placement="bottomLeft">
              <Button className="meet-wow-create-btn" icon={<ModuleIcon module="meetings" size={18} />} type="primary">
                Cuộc họp mới ▾
              </Button>
            </Dropdown>

            <div className="meet-wow-join-box">
              <Input
                allowClear
                onChange={(e) => setJoinCode(e.target.value)}
                onPressEnter={handleQuickJoin}
                placeholder="Nhập mã phòng họp (VD: TT-482-193)"
                prefix={<span className="meet-kbd-icon">⌨</span>}
                value={joinCode}
              />
              <Button disabled={!joinCode.trim()} onClick={handleQuickJoin} type="text">
                Vào họp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULED MEETINGS LIST */}
      <section className="meet-wow-schedule surface-panel">
        <header className="schedule-header">
          <div className="schedule-controls">
            <Segmented
              onChange={(val) => setActiveTab(val as 'all' | 'today' | 'upcoming')}
              options={[
                { label: `Tất cả (${allMeetings.length})`, value: 'all' },
                { label: `Hôm nay (${todayMeetings.length})`, value: 'today' },
                { label: `Sắp tới (${upcomingMeetings.length})`, value: 'upcoming' },
              ]}
              value={activeTab}
            />
            <Input
              allowClear
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên cuộc họp, người chủ trì..."
              prefix={<ModuleIcon module="meetings" size={16} />}
              style={{ width: 240 }}
              value={search}
            />
          </div>
        </header>

        {state.loading ? (
          <ContentSkeleton rows={4} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : !rows.length ? (
          <EmptyState description="Không có cuộc họp phù hợp" />
        ) : (
          <div className="meet-cards-feed">
            {rows.map((event) => (
              <article className="meet-wow-item-card" key={event.id}>
                <div className="item-time-col">
                  <strong>{new Date(event.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
                  <span>{new Date(event.startAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                  <small>{Math.round((new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) / 60000)} phút</small>
                </div>

                <div className="item-main-col" onClick={() => setSelectedEvent(event)} role="button" tabIndex={0}>
                  <div className="item-title-row">
                    <h3>{event.title}</h3>
                    <span className="item-id-badge">ID: {event.meetingId ?? 'TT-ROOM'}</span>
                  </div>
                  <p className="item-meta-text">
                    Chủ trì: <strong>{event.organizer}</strong>
                  </p>
                  <p className="item-agenda-text">{event.agenda}</p>
                </div>

                <div className="item-people-col">
                  <div className="avatar-group">
                    {event.participants?.slice(0, 3).map((person) => (
                      <i className={avatarTone(person)} key={person} title={person}>
                        {initials(person)}
                      </i>
                    ))}
                  </div>
                  <small>{event.participants?.length ?? 0} thành viên</small>
                </div>

                <div className="item-action-col">
                  <Button
                    className="item-join-btn"
                    icon={<ModuleIcon module="meetings" size={16} />}
                    onClick={() => setActiveMeetingRoom(event)}
                    type="primary"
                  >
                    Vào họp ngay
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* IN-APP ACTIVE VIDEO ROOM MODAL */}
      {activeMeetingRoom && (
        <ActiveMeetingRoomModal event={activeMeetingRoom} onClose={() => setActiveMeetingRoom(null)} />
      )}

      {/* QUICK VIEW & CREATION MODALS */}
      {selectedEvent && <MeetingQuickView event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
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
