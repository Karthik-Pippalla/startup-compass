import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile, RegisterData, UpdateProfileData } from '../types/user';
import { authAPI, getToken, removeToken } from '../lib/authApi';

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (data: RegisterData & { password: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: UpdateProfileData) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      const userProfile = await authAPI.getProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setIsAuthenticated(false);
      removeToken();
    }
  };

  // Unified register
  const register = async (data: RegisterData & { password: string }) => {
    try {
      const result = await authAPI.register(data);
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authAPI.login(email, password);
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      removeToken();
    }
  };

  const updateUserProfile = async (data: UpdateProfileData) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (isAuthenticated) {
      await fetchUserProfile();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = getToken();
      if (token) {
        await fetchUserProfile();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile: user,
    loading,
    isAuthenticated,
    register,
    signIn,
    logout,
    updateUserProfile,
    changePassword,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

