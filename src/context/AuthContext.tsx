
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authService, User } from '@/services';
import { setAccessToken } from '@/lib/axios';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get user profile using existing refresh token cookie
        const response = await authService.getProfile();
        
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // If profile fetch fails, try to refresh token
        try {
          const refreshResponse = await authService.refreshToken();
          
          if (refreshResponse.success) {
            // Try to get profile again with new access token
            const profileResponse = await authService.getProfile();
            if (profileResponse.success && profileResponse.data) {
              setUser(profileResponse.data);
            }
          }
        } catch (refreshError) {
          // No valid session, user needs to login
          console.log('No valid session found');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for logout events from axios interceptor
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });

      console.log('Login response:', response);

      if (response.success && response.data) {
        console.log('Setting user:', response.data.user);
        setUser(response.data.user);
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ 
        firstName, 
        lastName, 
        email, 
        password 
      });

      if (response.success) {
        toast.success('Registration successful! Please login.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAccessToken(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Logout failed';
      toast.error(message);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
