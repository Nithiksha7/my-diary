import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import type { UserSettings } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  settings?: UserSettings;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  migrateFromLocalStorage: (localEntries: Record<string, any>, localSettings?: any) => Promise<number>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await api.auth.getMe();
        if (isMounted && res.success && res.user) {
          setUser(res.user);
        }
      } catch {
        // Not logged in or guest mode
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid credentials' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await api.auth.register({ name, email, password });
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  }, []);

  const updateUserSettings = useCallback(async (settings: Partial<UserSettings>) => {
    try {
      const res = await api.auth.updateSettings(settings);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to update user settings:', err);
    }
  }, []);

  const migrateFromLocalStorage = useCallback(
    async (localEntries: Record<string, any>, localSettings?: any): Promise<number> => {
      try {
        const res = await api.auth.migrateLocalData({
          entries: localEntries,
          settings: localSettings,
        });
        return res.migratedCount || 0;
      } catch (err) {
        console.error('Failed to migrate local data:', err);
        return 0;
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        updateUserSettings,
        migrateFromLocalStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
