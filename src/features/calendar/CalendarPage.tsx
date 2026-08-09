import { Input, Segmented, Select } from 'antd';
import { useMemo, useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { CountedTabLabel } from '@/components/CountedTabLabel';
import { ModuleIcon } from '@/components/ModuleIcon';
import { CalendarQuickView } from '@/features/dashboard/quickViews/CalendarQuickView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { calendarApi } from '@/services/api';
import type { CalendarEvent } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

const responseLabel = { pending: 'Chưa phản hồi', accepted: 'Sẽ tham gia', declined: 'Không tham gia' } as const;
const initials = (value: string) => value.split(' ').slice(-2).map((word) => word[0]).join('').toUpperCase();

export function CalendarPage() {
  const [view, setView] = useState<'today'|'week'>('today');
  const [response, setResponse] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const state = useAsyncData(async () => (await calendarApi.list()).data);
  const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  const rows = useMemo(() => (state.data ?? []).filter((event) => (view === 'week' || event.startAt.startsWith(currentDate)) && (!response || (event.responseStatus ?? 'pending') === response) && `${event.title} ${event.organizer} ${event.platform} ${event.agenda}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))), [currentDate, response, search, state.data, view]);
  const todayMeetings = (state.data ?? []).filter((event) => event.startAt.startsWith(currentDate));
  const accepted = (state.data ?? []).filter((event) => event.responseStatus === 'accepted').length;
  const nextMeeting = todayMeetings[0] ?? state.data?.[0];

  return <div className="module-page online-meetings-page">
    <section className="meeting-overview"><div className="meeting-overview-main"><span className="meeting-overview-icon"><ModuleIcon module="meetings" size={24} /></span><span><small>Cuộc họp tiếp theo</small><strong>{nextMeeting?.title ?? 'Chưa có cuộc họp'}</strong><em>{nextMeeting ? `${new Date(nextMeeting.startAt).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })} · ${nextMeeting.platform}` : 'Lịch trống'}</em></span></div><div><small>Hôm nay</small><strong>{todayMeetings.length}</strong><em>Cuộc họp</em></div><div><small>Tuần này</small><strong>{state.data?.length ?? 0}</strong><em>Đã lên lịch</em></div><div><small>Sẽ tham gia</small><strong>{accepted}</strong><em>Đã xác nhận</em></div></section>
    <div className="meeting-toolbar surface-panel"><Input aria-label="Tìm cuộc họp" allowClear onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên cuộc họp, người tổ chức, nền tảng…" prefix={<ModuleIcon module="meetings" size={18} />} value={search} /><Segmented aria-label="Khoảng thời gian" onChange={(value) => setView(value as 'today'|'week')} options={[{label:<CountedTabLabel count={todayMeetings.length} label="Hôm nay" />,value:'today'},{label:<CountedTabLabel count={state.data?.length ?? 0} label="Tuần này" />,value:'week'}]} value={view} /><Select aria-label="Lọc trạng thái tham gia" onChange={setResponse} options={[{value:'',label:'Tất cả trạng thái'},{value:'pending',label:'Chưa phản hồi'},{value:'accepted',label:'Sẽ tham gia'},{value:'declined',label:'Không tham gia'}]} value={response} /></div>
    {state.loading ? <ContentSkeleton rows={7} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : !rows.length ? <EmptyState description="Không có cuộc họp trực tuyến phù hợp" /> : <section aria-label="Danh sách họp trực tuyến" className="meeting-list">{rows.map((event) => <article className="meeting-card surface-panel" key={event.id}><div className="meeting-time"><strong>{new Date(event.startAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</strong><span>{new Date(event.startAt).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})}</span><small>{Math.round((new Date(event.endAt).getTime()-new Date(event.startAt).getTime())/60000)} phút</small></div><span className="meeting-video-icon"><ModuleIcon module="meetings" size={22} /></span><button className="meeting-card-main" onClick={() => setSelectedEvent(event)} type="button"><span><strong>{event.title}</strong><i className={`meeting-response ${event.responseStatus ?? 'pending'}`}>{responseLabel[event.responseStatus ?? 'pending']}</i></span><small>{event.platform} · ID {event.meetingId}</small><p>{event.agenda}</p></button><div className="meeting-people"><span>{event.participants?.slice(0,3).map((person) => <i className={avatarTone(person)} key={person} title={person}>{initials(person)}</i>)}</span><small>{event.participants?.length ?? 0} người tham gia</small></div><button className="meeting-detail-link" onClick={() => setSelectedEvent(event)} type="button">Xem chi tiết</button></article>)}</section>}
    {selectedEvent && <CalendarQuickView event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
  </div>;
}
