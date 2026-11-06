import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/services/api';
import { clearSessionToken, getSessionToken, SESSION_KEY, setSessionToken } from '@/services/authSession';

import { AuthProvider, useAuth } from './AuthContext';

function SessionProbe() {
  const { user, isInitializing, logout } = useAuth();
  if (isInitializing) return <span>Đang tải phiên</span>;
  return <><span>{user ? `Người dùng: ${user.id}` : 'Chưa đăng nhập'}</span><button onClick={() => void logout()}>Đăng xuất</button></>;
}

describe('Phiên đăng nhập giữa các tab', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('khôi phục đúng tài khoản admin ở tab mới không có sessionStorage', async () => {
    setSessionToken('mock-admin-token');
    window.sessionStorage.clear();
    render(<AuthProvider><SessionProbe /></AuthProvider>);
    expect(await screen.findByText('Người dùng: user-admin')).toBeInTheDocument();
  });

  it('chuyển phiên cũ sang bộ nhớ dùng chung', () => {
    window.sessionStorage.setItem(SESSION_KEY, 'mock-token');
    expect(getSessionToken()).toBe('mock-token');
    expect(window.localStorage.getItem(SESSION_KEY)).toBe('mock-token');
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('đăng xuất xóa phiên ở cả hai bộ nhớ', async () => {
    setSessionToken('mock-token');
    render(<AuthProvider><SessionProbe /></AuthProvider>);
    await screen.findByText('Người dùng: user-001');
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    await screen.findByText('Chưa đăng nhập');
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('nhận đăng xuất từ tab khác', async () => {
    setSessionToken('mock-token');
    render(<AuthProvider><SessionProbe /></AuthProvider>);
    await screen.findByText('Người dùng: user-001');
    clearSessionToken();
    fireEvent(window, new StorageEvent('storage', { key: SESSION_KEY, newValue: null, storageArea: window.localStorage }));
    expect(await screen.findByText('Chưa đăng nhập')).toBeInTheDocument();
  });

  it('API từ chối phiên không hợp lệ', async () => {
    setSessionToken('invalid-token');
    await expect(authApi.me()).rejects.toThrow('Phiên đăng nhập không hợp lệ');
  });
});
