import { Badge, Button, Dropdown, Layout, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppSidebar } from '@/layouts/AppSidebar';
import { useAuth } from '@/features/auth/AuthContext';
import { ContactQuickView } from '@/features/directory/components/ContactQuickView';
import { HeaderDirectorySearch } from '@/features/directory/components/HeaderDirectorySearch';
import { ModuleIcon } from '@/components/ModuleIcon';
import { useAsyncData } from '@/hooks/useAsyncData';
import { announcementApi, chatApi } from '@/services/api';
import type { DirectoryContact } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedContact, setSelectedContact] = useState<DirectoryContact | null>(null);
  const [contactChatting, setContactChatting] = useState(false);
  const { user, logout } = useAuth();
  const announcementsState = useAsyncData(async () => (await announcementApi.list()).data);
  const unreadAnnouncements = (announcementsState.data ?? []).filter((item) => !item.isRead).length;
  const navigate = useNavigate();
  const location = useLocation();
  const isPersonnelProfile = location.pathname.startsWith('/personnel/profile');

  useEffect(() => {
    document.body.classList.toggle('personnel-page-open', isPersonnelProfile);
    return () => document.body.classList.remove('personnel-page-open');
  }, [isPersonnelProfile]);

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

  return <Layout className="min-h-screen">
    <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
    <Layout className={`${collapsed ? 'app-frame app-frame-collapsed' : 'app-frame'}${isPersonnelProfile ? ' app-frame-personnel' : ''}`}>
      <header className="app-header">
        <HeaderDirectorySearch onSelect={setSelectedContact} />
        <div className="app-header-account"><Tooltip title="Thông báo"><Badge count={unreadAnnouncements} size="small"><Button aria-label="Mở Thông báo" className="header-notification-button" icon={<ModuleIcon module="announcements" size={20} />} onClick={() => navigate('/announcements')} /></Badge></Tooltip><Dropdown menu={{ items: [{ key: 'profile', label: `${user?.position} · ${user?.department}`, disabled: true }, { type: 'divider' }, { key: 'logout', label: 'Đăng xuất', onClick: async () => { await logout(); navigate('/login', { replace: true }); } }] }} placement="bottomRight">
          <Button aria-label="Mở menu tài khoản" className="account-button"><span className={`avatar ${avatarTone(user?.fullName ?? 'Người dùng')}`}>MA</span><span className="account-name">{user?.fullName}</span><span aria-hidden>⌄</span></Button>
        </Dropdown></div>
      </header>
      <main className={`app-content${isPersonnelProfile ? ' app-content-personnel' : ''}`}><Outlet /></main>
      <ContactQuickView chatting={contactChatting} contact={selectedContact} onChat={startContactChat} onClose={() => { setSelectedContact(null); setContactChatting(false); }} />
    </Layout>
  </Layout>;
}
