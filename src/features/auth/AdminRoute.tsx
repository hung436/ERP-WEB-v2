import { Navigate, Outlet } from 'react-router-dom';

import { FullPageLoading } from '@/components/AsyncState';
import { useAuth } from '@/features/auth/AuthContext';

export function AdminRoute({ fallback = '/calendar/week' }: { fallback?: string }) {
  const { user, isInitializing } = useAuth();
  if (isInitializing) {
    return <FullPageLoading label="Đang kiểm tra quyền truy cập" />;
  }
  if (user?.role !== 'admin') {
    return <Navigate replace to={fallback} />;
  }
  return <Outlet />;
}
