import React, { createContext, useState, useEffect, useCallback } from 'react';
import { userAPI, setAuthToken, clearAuth } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        if (storedUser && token) {
          setAuthToken(token);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        clearAuth();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register function
  const register = useCallback(
    async (name, email, password, address, role = 'customer', phone = '') => {
      setLoading(true);
      setError('');
      try {
        const res = await userAPI.register({
          name,
          email,
          password,
          address,
          role,
          phone,
        });

        if (res?.data?.success) {
          const userData = res.data.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
          setLoading(false);
          return { success: true, data: userData };
        } else {
          const errorMsg = res?.data?.message || 'Registration failed';
          setError(errorMsg);
          setLoading(false);
          return { success: false, message: errorMsg };
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Registration error';
        setError(errorMsg);
        setLoading(false);
        return { success: false, message: errorMsg };
      }
    },
    []
  );

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await userAPI.login(email, password);

      if (res?.data?.success) {
        const { token, data } = res.data;
        if (token) {
          setAuthToken(token);
        }
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, data };
      } else {
        const errorMsg = res?.data?.message || 'Login failed';
        setError(errorMsg);
        setLoading(false);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login error';
      setError(errorMsg);
      setLoading(false);
      return { success: false, message: errorMsg };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    setError('');
  }, []);

  // Update user function
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    logout,
    register,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
