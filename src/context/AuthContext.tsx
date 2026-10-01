import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  apiFetch,
  getStoredAccessToken,
  setStoredTokens,
  clearStoredTokens
} from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ user: UserProfile }>('/api/auth/me');
      setUser(data.user);
    } catch (err: any) {
      const isNetworkError =
        err?.message?.includes('Unable to connect to server') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError');

      if (!isNetworkError) {
        clearStoredTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ user: UserProfile; accessToken: string; refreshToken: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      }
    );
    setStoredTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await apiFetch<{ user: UserProfile; accessToken: string; refreshToken: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
        skipAuth: true
      }
    );
    setStoredTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
