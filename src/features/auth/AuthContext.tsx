import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi } from '@/services/api';
import type { User } from '@/types/domain';

const SESSION_KEY = 'erp-session';

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const session = window.sessionStorage.getItem(SESSION_KEY);
    if (!session) {
      setIsInitializing(false);
      return;
    }
    authApi.me().then((response) => setUser(response.data)).catch(() => window.sessionStorage.removeItem(SESSION_KEY)).finally(() => setIsInitializing(false));
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isInitializing,
    login: async (username, password) => {
      const response = await authApi.login(username, password);
      window.sessionStorage.setItem(SESSION_KEY, response.data.token);
      setUser(response.data.user);
    },
    logout: async () => {
      await authApi.logout();
      window.sessionStorage.removeItem(SESSION_KEY);
      setUser(null);
    },
    updateUser,
  }), [isInitializing, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng trong AuthProvider');
  return context;
}
