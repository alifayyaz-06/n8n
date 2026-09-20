import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authService.getMe();
      if (data) {
        setUser(data.user);
        setRestaurant(data.restaurant);
        setRole(data.role);
      } else {
        // Default initial session for immediate preview
        try {
          const defaultDemo = await authService.login('03001234567', '');
          setUser(defaultDemo.user);
          setRestaurant(defaultDemo.restaurant);
          setRole(defaultDemo.role);
        } catch (demoErr) {
          console.warn('Demo login fallback warning:', demoErr.message);
        }
      }
    } catch (err) {
      console.warn('Auth init failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setRestaurant(data.restaurant);
      setRole(data.role);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const data = await authService.register(registerData);
      setUser(data.user);
      setRestaurant(data.restaurant);
      setRole(data.role);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRestaurant(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        role,
        loading,
        login,
        register,
        logout,
        token: authService.getToken(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
