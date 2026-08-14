import { Badge, Button, Dropdown, Layout, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';

import { AppSidebar } from '@/layouts/AppSidebar';
import { BirthdayCelebrationModal } from '@/components/BirthdayCelebrationModal';
import { useAuth } from '@/features/auth/AuthContext';
import { ContactQuickView } from '@/features/directory/components/ContactQuickView';
import { HeaderDirectorySearch } from '@/features/directory/components/HeaderDirectorySearch';
import { ModuleIcon } from '@/components/ModuleIcon';
import { useAsyncData } from '@/hooks/useAsyncData';
import { announcementApi, chatApi } from '@/services/api';
import type { DirectoryContact } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';
import { isUserBirthday } from '@/utils/birthday';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedContact, setSelectedContact] = useState<DirectoryContact | null>(null);
  const [contactChatting, setContactChatting] = useState(false);
  const { user, logout } = useAuth();
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const isBirthday = isUserBirthday(user);

  const announcementsState = useAsyncData(async () => (await announcementApi.list()).data);
  const unreadAnnouncements = (announcementsState.data ?? []).filter((item) => !item.isRead).length;
  const navigate = useNavigate();
  const location = useLocation();
  const isPersonnelPage = location.pathname.startsWith('/personnel');

  useEffect(() => {
    document.body.classList.toggle('personnel-page-open', isPersonnelPage);
    return () => document.body.classList.remove('personnel-page-open');
  }, [isPersonnelPage]);

  // Auto-open birthday celebration card once per session if today is user's birthday
  useEffect(() => {
    if (isBirthday && user) {
      const storageKey = `tuoitre_bday_welcomed_${user.id}_${new Date().toDateString()}`;
      if (!sessionStorage.getItem(storageKey)) {
        setBirthdayModalOpen(true);
        sessionStorage.setItem(storageKey, 'true');
      }
    }
  }, [isBirthday, user]);

  const startContactChat = async (contact: DirectoryContact) => {
    setContactChatting(true);
    try {
      const conversation = (await chatApi.startDirect(contact)).data;
      setSelectedContact(null);
      navigate(`/chat?conversation=${encodeURIComponent(conversation.id)}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể mở cuộc trò chuyện.');
    } finally {
      setContactChatting(false);
    }
  };

  const accountMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0', minWidth: 180 }}>
          <strong style={{ display: 'block', fontSize: 14, color: '#101828' }}>{user?.fullName}</strong>
          <small style={{ color: '#667085', fontSize: 12 }}>{user?.position} · {user?.department}</small>
        </div>
      ),
    },
    ...(isBirthday
      ? [
          {
            key: 'birthday-card',
            icon: <span style={{ fontSize: 15 }}>🎂</span>,
            label: 'Xem thiệp mừng sinh nhật',
            onClick: () => setBirthdayModalOpen(true),
          },
        ]
      : []),
    { type: 'divider' as const },
    {
      key: 'profile',
      icon: <UserIcon color="#d92d20" size={16} />,
      label: 'Thông tin tài khoản',
      onClick: () => navigate('/account'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogOut color="#d92d20" size={16} />,
      label: 'Đăng xuất',
      danger: true,
      onClick: async () => {
        await logout();
        navigate('/login', { replace: true });
      },
    },
  ];

  return (
    <Layout className="min-h-screen">
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout className={`app-frame${collapsed ? ' app-frame-collapsed' : ''}${isPersonnelPage ? ' app-frame-personnel' : ''}`}>
        <header className="app-header">
          <HeaderDirectorySearch onSelect={setSelectedContact} />
          <div className="app-header-account">
            {isBirthday && (
              <button
                className="header-birthday-badge"
                onClick={() => setBirthdayModalOpen(true)}
                title="Hôm nay là sinh nhật bạn! Nhấn để xem thiệp chúc mừng"
                type="button"
              >
                <span className="birthday-badge-icon">🎂</span>
                <span>Sinh nhật vui vẻ! ✨</span>
              </button>
            )}

            <Tooltip title="Thông báo">
              <Badge count={unreadAnnouncements} size="small">
                <Button aria-label="Mở Thông báo" className="header-notification-button" icon={<ModuleIcon module="announcements" size={20} />} onClick={() => navigate('/announcements')} />
              </Badge>
            </Tooltip>
            <Dropdown menu={{ items: accountMenuItems }} placement="bottomRight">
              <Button aria-label="Mở menu tài khoản" className="account-button">
                <div className="account-avatar-wrapper">
                  {user?.avatarUrl ? (
                    <img alt={user.fullName} src={user.avatarUrl} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span className={`avatar ${avatarTone(user?.fullName ?? 'Người dùng')}`}>{user?.fullName?.slice(0, 2).toUpperCase() || 'MA'}</span>
                  )}
                  {isBirthday && <span className="avatar-party-hat" title="Chúc mừng sinh nhật!">🥳</span>}
                </div>
                <span className="account-name">{user?.fullName}</span>
                <span aria-hidden>⌄</span>
              </Button>
            </Dropdown>
          </div>
        </header>
        <main className={isPersonnelPage ? 'app-content app-content-personnel' : 'app-content'}><Outlet /></main>
        <ContactQuickView chatting={contactChatting} contact={selectedContact} onChat={startContactChat} onClose={() => { setSelectedContact(null); setContactChatting(false); }} />
        
        {/* BIRTHDAY CELEBRATION MODAL */}
        <BirthdayCelebrationModal
          onClose={() => setBirthdayModalOpen(false)}
          open={birthdayModalOpen}
          user={user}
        />
      </Layout>
    </Layout>
  );
}
