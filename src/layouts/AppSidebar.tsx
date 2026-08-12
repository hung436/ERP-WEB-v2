import { Layout, Tooltip } from 'antd';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { ModuleIcon, type ModuleName } from '@/components/ModuleIcon';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { collapsedLogo } from '@/assets/collapsedLogo';
import { useAsyncData } from '@/hooks/useAsyncData';
import { calendarApi, chatApi, documentApi, evaluationApi, mailApi, taskApi } from '@/services/api';

interface NavItem {
  path: string;
  module: ModuleName;
  label: string;
  children?: { path: string; label: string }[];
}

const navItems: NavItem[] = [
  { path: '/', module: 'home', label: 'Trang chủ' },
  { path: '/tasks', module: 'tasks', label: 'Công việc' },
  { path: '/documents', module: 'documents', label: 'Tài liệu' },
  { path: '/evaluations', module: 'evaluations', label: 'Đánh giá lao động' },
  {
    path: '/personnel/list',
    module: 'personnel',
    label: 'Nhân sự',
    children: [
      { path: '/personnel/list', label: 'Danh sách hồ sơ' },
      { path: '/personnel/change-requests', label: 'Yêu cầu thay đổi' },
      { path: '/personnel/profile', label: 'Hồ sơ cá nhân' },
      { path: '/personnel/create', label: 'Tạo hồ sơ mới' },
    ],
  },
  { path: '/calendar', module: 'meetings', label: 'Họp trực tuyến' },
  { path: '/chat', module: 'chat', label: 'Chat' },
  { path: '/mail', module: 'mail', label: 'Mail' },
  { path: '/directory', module: 'directory', label: 'Danh bạ' },
];

export function AppSidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (value: boolean) => void }) {
  const { pathname } = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const badgeState = useAsyncData<Record<string, number>>(async () => {
    const [tasks, documents, evaluations, meetings, chats, mails] = await Promise.all([
      taskApi.list(),
      documentApi.submissions(),
      evaluationApi.sheets(),
      calendarApi.list(),
      chatApi.conversations(),
      mailApi.list(),
    ]);
    const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
    return {
      '/tasks': tasks.data.filter((item) => item.status !== 'completed').length,
      '/documents': documents.data.filter((item) => item.viewScope === 'pending_review' && item.status === 'pending').length,
      '/evaluations': evaluations.data.filter((item) => item.status === 'draft' || item.status === 'waiting' || item.status === 'in_review').length,
      '/calendar': meetings.data.filter((item) => item.startAt.startsWith(currentDate)).length,
      '/chat': chats.data.reduce((total, item) => total + item.unreadCount, 0),
      '/mail': mails.data.filter((item) => (item.folder ?? 'inbox') === 'inbox' && !item.isRead).length,
    } satisfies Record<string, number>;
  }, pathname);

  // Collapse sidebar — only called when navigating to a leaf page
  const handleNavClick = () => {
    onCollapse(true);
  };

  // Toggle submenu open/closed WITHOUT collapsing the sidebar
  const handleGroupClick = (path: string) => {
    setOpenGroup((prev) => (prev === path ? null : path));
  };

  return (
    <Layout.Sider collapsed={collapsed} collapsedWidth={76} onCollapse={onCollapse} theme="light" width={244} className="app-sidebar">
      <div className="sidebar-head">
        <button aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} className="sidebar-top-collapse" onClick={() => onCollapse(!collapsed)} title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} type="button">
          <span aria-hidden>{collapsed ? '›' : '‹'}</span>
        </button>
        <NavLink aria-label="Về trang chủ" className="brand" onClick={handleNavClick} to="/">
          <img alt="Tuổi Trẻ" className={collapsed ? 'brand-logo collapsed-brand-logo' : 'brand-logo'} src={collapsed ? collapsedLogo : tuoiTreLogo} />
        </NavLink>
      </div>
      <nav aria-label="Điều hướng chính" className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const count = badgeState.data?.[item.path] ?? 0;
            const hasChildren = Boolean(item.children?.length);
            const isSubActive = hasChildren ? item.children!.some((child) => pathname.startsWith(child.path)) : false;
            const isParentActive = pathname === item.path || isSubActive;
            // Submenu is open when: has children AND (route is active under this group OR user manually opened it)
            const isSubOpen = hasChildren && !collapsed && (isSubActive || openGroup === item.path);

            return (
              <li key={item.path} className={hasChildren ? 'sidebar-group' : ''}>
                <Tooltip mouseEnterDelay={0.15} placement="right" title={collapsed ? `${item.label}${count ? ` · ${count}` : ''}` : null}>
                  {hasChildren ? (
                    // Parent with children: button that toggles the subnav open/closed
                    // Does NOT navigate and does NOT collapse the sidebar
                    <button
                      aria-expanded={isSubOpen}
                      aria-label={item.label}
                      className={`sidebar-nav-link sidebar-group-btn${isParentActive ? ' active' : ''}`}
                      onClick={() => handleGroupClick(item.path)}
                      type="button"
                    >
                      <span className="sidebar-module-icon">
                        <ModuleIcon module={item.module} size={26} />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="sidebar-nav-copy">
                            <strong>{item.label}</strong>
                          </span>
                          <span className={`sidebar-chevron${isSubOpen ? ' open' : ''}`} aria-hidden>›</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <NavLink
                      aria-label={`${item.label}${count ? `, ${count} mục cần chú ý` : ''}`}
                      className={`sidebar-nav-link${isParentActive ? ' active' : ''}`}
                      end={item.path === '/'}
                      onClick={handleNavClick}
                      to={item.path}
                    >
                      <span className="sidebar-module-icon">
                        <ModuleIcon module={item.module} size={26} />
                      </span>
                      {!collapsed && (
                        <span className="sidebar-nav-copy">
                          <strong>{item.label}</strong>
                        </span>
                      )}
                      {count > 0 && <span className="sidebar-count">{count > 99 ? '99+' : count}</span>}
                    </NavLink>
                  )}
                </Tooltip>

                {/* Submenu — always rendered for groups; CSS animates open/close */}
                {hasChildren && !collapsed && (
                  <ul className={`sidebar-subnav${isSubOpen ? ' open' : ''}`}>
                    {item.children!.map((child) => (
                      <li key={child.path}>
                        <NavLink
                          className={({ isActive }) => `sidebar-subnav-link${isActive ? ' active' : ''}`}
                          onClick={handleNavClick}
                          to={child.path}
                          tabIndex={isSubOpen ? 0 : -1}
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </Layout.Sider>
  );
}
