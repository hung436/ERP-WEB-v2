import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullPageLoading } from '@/components/AsyncState';
import { useAuth } from '@/features/auth/AuthContext';

export function ProtectedRoute() {
  const { user, isInitializing } = useAuth();
  const location = useLocation();
  if (isInitializing) return <FullPageLoading label="Đang kiểm tra phiên đăng nhập" />;
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  return <Outlet />;
}
