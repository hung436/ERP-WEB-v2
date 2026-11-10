import { Button } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { useOptionalAuth } from '@/features/auth/AuthContext';
import { calendarApi } from '@/services/api';
import type { CalendarEvent } from '@/types/domain';

import { getCalendarMembership } from './calendarMembership';
import { CalendarEventDetailModal } from './components/CalendarEventDetailModal';
import { getEventsForWeek } from './mockCalendarData';

import './CalendarEventDetailPage.css';

export function CalendarEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const user = useOptionalAuth()?.user;
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    document.body.classList.add('calendar-detail-page-open');
    return () => {
      document.body.classList.remove('calendar-detail-page-open');
    };
  }, []);
  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!id) throw new Error('Không tìm thấy sự kiện');
      let found: CalendarEvent | null = null;
      try {
        found = (await calendarApi.get(id)).data;
      } catch (apiError) {
        const dateMatch = id.match(/\b(20\d{2})(\d{2})(\d{2})\b/);
        const targetDate = dateMatch ? dayjs(dateMatch[1] + '-' + dateMatch[2] + '-' + dateMatch[3]) : dayjs();
        found = getEventsForWeek(targetDate.startOf('isoWeek')).find((item) => item.id === id) || null;
        if (!found) throw apiError;
      }
      setEvent(found);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải thông tin sự kiện');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchEvent(); }, [fetchEvent]);
  const goBack = () => {
    const date = new URLSearchParams(search).get('date') ||
      (event?.startAt && dayjs(event.startAt).format('YYYY-MM-DD'));
    navigate({ pathname: '/calendar/week', search: date ? `?${new URLSearchParams({ date })}` : '' }, { replace: true });
  };
  const membership = event && user ? getCalendarMembership(event, user) : null;
  const canViewDetail = !membership || membership.isUserParticipant || membership.isUserWatcher;

  return (
    <div className="event-detail-page">
      {loading ? (
        <div style={{ padding: '24px 16px' }}>
          <ContentSkeleton rows={8} />
        </div>
      ) : error || !event ? (
        <div style={{ padding: '24px 16px' }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="text" icon={<ArrowLeft size={16} />} onClick={goBack}>
              Quay lại Lịch làm việc tuần
            </Button>
          </div>
          <ErrorState message={error || 'Không tìm thấy sự kiện'} onRetry={fetchEvent} />
        </div>
      ) : !canViewDetail ? (
        <div style={{ padding: '24px 16px' }}>
          <ErrorState message="Bạn không có quyền xem chi tiết lịch này." />
          <Button type="link" onClick={goBack}>Quay lại Lịch làm việc tuần</Button>
        </div>
      ) : (
        <div className={panelOpen ? 'event-detail-original-host' : 'event-detail-original-host is-panel-collapsed'}>
          <CalendarEventDetailModal
            event={event}
            open
            presentation="page"
            onClose={goBack}
            onUpdateEvent={setEvent}
            onDeleteEvent={goBack}
            panelOpen={panelOpen}
            onTogglePanel={() => setPanelOpen((value) => !value)}
          />
        </div>
      )}
    </div>
  );
}

export default CalendarEventDetailPage;
