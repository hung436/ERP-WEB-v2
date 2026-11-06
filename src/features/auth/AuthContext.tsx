import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi } from '@/services/api';
import { clearSessionToken, getSessionToken, SESSION_KEY, setSessionToken } from '@/services/authSession';
import type { User } from '@/types/domain';

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
    const session = getSessionToken();
    if (!session) {
      setIsInitializing(false);
      return;
    }
    authApi.me().then((response) => setUser(response.data)).catch(clearSessionToken).finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    const syncSession = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || (event.key !== SESSION_KEY && event.key !== null)) return;
      window.sessionStorage.removeItem(SESSION_KEY);
      if (!window.localStorage.getItem(SESSION_KEY)) {
        setUser(null);
      } else {
        authApi.me().then((response) => setUser(response.data)).catch(() => {
          clearSessionToken();
          setUser(null);
        });
      }
    };
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isInitializing,
    login: async (username, password) => {
      const response = await authApi.login(username, password);
      setSessionToken(response.data.token);
      setUser(response.data.user);
    },
    logout: async () => {
      await authApi.logout();
      clearSessionToken();
      setUser(null);
    },
    updateUser,
  }), [isInitializing, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng trong AuthProvider');
  return context;
}
