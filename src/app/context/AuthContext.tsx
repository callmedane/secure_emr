import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Doctor' | 'Nurse' | 'Admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole, mfa?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string, role: UserRole, mfa?: string): Promise<boolean> => {
    // Mock authentication
    // In a real system, this would call an API
    if (password.length >= 6) {
      const mockUser: User = {
        id: '1',
        username,
        email: `${username}@hospital.com`,
        role,
        firstName: username.split('.')[0] || 'vboxuser',
        lastName: username.split('.')[1] || '',
      };
      setUser(mockUser);
      
      // Log the login attempt
      const loginLog = {
        timestamp: new Date().toISOString(),
        action: 'Login',
        user: username,
        role,
        status: 'Success',
        ip: '192.168.1.100',
      };
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      logs.unshift(loginLog);
      localStorage.setItem('auditLogs', JSON.stringify(logs));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      const logoutLog = {
        timestamp: new Date().toISOString(),
        action: 'Logout',
        user: user.username,
        role: user.role,
        status: 'Success',
        ip: '192.168.1.100',
      };
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      logs.unshift(logoutLog);
      localStorage.setItem('auditLogs', JSON.stringify(logs));
    }
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
