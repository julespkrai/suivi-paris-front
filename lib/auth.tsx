'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken, clearToken, getToken } from './api';

interface User { id: number; email: string; pseudo?: string }
interface AuthCtx {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, pseudo?: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get<User>('/me').then(setUser).catch(() => clearToken()).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string }>('/login_check', { email, password });
    setToken(data.token);
    const me = await api.get<User>('/me');
    setUser(me);
  };

  const register = async (email: string, password: string, pseudo?: string) => {
    await api.post('/register', { email, password, pseudo });
    await login(email, password);
  };

  const logout = () => { clearToken(); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
