import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken } from '../lib/api';
import type { User, UserRole } from '../lib/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, mfa?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole[]) => boolean;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!getToken()) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await api.me();
        setUser(response.user);
      } catch {
        await api.logout();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    void bootstrap();
  }, []);

  const login = async (username: string, password: string, mfa?: string): Promise<boolean> => {
    const response = await api.login(username, password, mfa);
    setUser(response.user);
    return true;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasPermission, authLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
