import { Layout, Tooltip } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';

import { ModuleIcon, type ModuleName } from '@/components/ModuleIcon';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { collapsedLogo } from '@/assets/collapsedLogo';
import { useAsyncData } from '@/hooks/useAsyncData';
import { calendarApi, chatApi, documentApi, mailApi, taskApi } from '@/services/api';

const navItems: { path: string; module: ModuleName; label: string }[] = [
  { path: '/', module: 'home', label: 'Trang chủ' },
  { path: '/tasks', module: 'tasks', label: 'Công việc' },
  { path: '/documents', module: 'documents', label: 'Tài liệu' },
  { path: '/evaluations', module: 'evaluations', label: 'Đánh giá lao động' },
  { path: '/personnel/profile', module: 'personnel', label: 'Nhân sự' },
  { path: '/calendar', module: 'meetings', label: 'Họp trực tuyến' },
  { path: '/chat', module: 'chat', label: 'Chat' },
  { path: '/mail', module: 'mail', label: 'Mail' },
  { path: '/directory', module: 'directory', label: 'Danh bạ' },
];

export function AppSidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (value: boolean) => void }) {
  const { pathname } = useLocation();
  const badgeState = useAsyncData<Record<string, number>>(async () => {
    const [tasks, documents, meetings, chats, mails] = await Promise.all([taskApi.list(), documentApi.submissions(), calendarApi.list(), chatApi.conversations(), mailApi.list()]);
    const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
    return {
      '/tasks': tasks.data.filter((item) => item.status !== 'completed').length,
      '/documents': documents.data.filter((item) => item.viewScope === 'pending_review').length,
      '/calendar': meetings.data.filter((item) => item.startAt.startsWith(currentDate)).length,
      '/chat': chats.data.reduce((total, item) => total + item.unreadCount, 0),
      '/mail': mails.data.filter((item) => (item.folder ?? 'inbox') === 'inbox' && !item.isRead).length,
    } satisfies Record<string, number>;
  }, pathname);

  return <Layout.Sider breakpoint="lg" collapsed={collapsed} collapsedWidth={76} onCollapse={onCollapse} theme="light" width={244} className="app-sidebar">
    <div className="sidebar-head"><button aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} className="sidebar-top-collapse" onClick={() => onCollapse(!collapsed)} title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} type="button"><span aria-hidden>{collapsed ? '›' : '‹'}</span></button><NavLink aria-label="Về trang chủ" className="brand" onClick={() => onCollapse(true)} to="/"><img alt="Tuổi Trẻ" className={collapsed ? 'brand-logo collapsed-brand-logo' : 'brand-logo'} src={collapsed ? collapsedLogo : tuoiTreLogo} /></NavLink></div>
    <nav aria-label="Điều hướng chính" className="sidebar-nav"><ul>{navItems.map((item) => { const count = badgeState.data?.[item.path] ?? 0; return <li key={item.path}><Tooltip mouseEnterDelay={0.15} placement="right" title={collapsed ? `${item.label}${count ? ` · ${count}` : ''}` : null}><NavLink aria-label={`${item.label}${count ? `, ${count} mục cần chú ý` : ''}`} className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`} end={item.path === '/'} onClick={() => onCollapse(true)} to={item.path}><span className="sidebar-module-icon"><ModuleIcon module={item.module} /></span>{!collapsed && <span className="sidebar-nav-copy"><strong>{item.label}</strong></span>}{count > 0 && <span className="sidebar-count">{count > 99 ? '99+' : count}</span>}</NavLink></Tooltip></li>; })}</ul></nav>
  </Layout.Sider>;
}
