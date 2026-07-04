import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        localStorage.removeItem('token');
        setUser(null);
        showToast('Session expired. Please log in again.', 'warning');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [showToast]);

  // Register User
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        createdAt: data.createdAt,
      });
      showToast('Registration successful! Welcome to CodeJourney.', 'success');
      return data;
    } catch (error) {
      let msg = error.response?.data?.message || 'Registration failed';
      if (error.message === 'Network Error') {
        msg = 'Network Error: Cannot connect to backend. Please check VITE_API_URL environment variable on Vercel.';
      }
      showToast(msg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        createdAt: data.createdAt,
      });
      showToast('Logged in successfully!', 'success');
      return data;
    } catch (error) {
      let msg = error.response?.data?.message || 'Invalid email or password';
      if (error.message === 'Network Error') {
        msg = 'Network Error: Cannot connect to backend. Please check VITE_API_URL environment variable on Vercel.';
      }
      showToast(msg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  // Update Profile Name/Email
  const updateProfile = async (name, email) => {
    try {
      const { data } = await api.put('/auth/profile', { name, email });
      setUser((prev) => ({ ...prev, name: data.name, email: data.email }));
      showToast('Profile updated successfully!', 'success');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  // Change Password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      showToast(data.message || 'Password updated successfully!', 'success');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Password update failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  // Seeding/Loading Demo Data
  const seedDemoData = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/problems/demo');
      
      // Reload profile to refresh streaks
      const profileRes = await api.get('/auth/profile');
      setUser(profileRes.data);
      
      showToast('Realistic demo data and streaks successfully generated!', 'success');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to load demo data';
      showToast(msg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        seedDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
