import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../utils/apiClient';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data?.user ?? null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await apiClient.post('/auth/logout');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, refreshUser }), [user, loading, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
