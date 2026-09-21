import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('r2c_token'));

  const fetchUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchUser();
    else setLoading(false);
  }, [token, fetchUser]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { user, token: newToken } = res.data;
    localStorage.setItem('r2c_token', newToken);
    localStorage.setItem('r2c_user', JSON.stringify(user));
    setToken(newToken);
    setUser(user);
    return res;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user, token: newToken } = res.data;
    localStorage.setItem('r2c_token', newToken);
    localStorage.setItem('r2c_user', JSON.stringify(user));
    setToken(newToken);
    setUser(user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('r2c_token');
    localStorage.removeItem('r2c_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
