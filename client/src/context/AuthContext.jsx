import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchMe() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setEmployee(data.employee);
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }

  async function signin(login, password) {
    const { data } = await api.post('/auth/signin', { login, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    await fetchMe();
    return data;
  }

  async function signup(formData) {
    const { data } = await api.post('/auth/signup', formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    await fetchMe();
    return data;
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    setEmployee(null);
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, employee, loading, signin, signup, logout, isAdmin, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
