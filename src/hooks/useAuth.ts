import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  initializeAuth, 
  userLogin, 
  userRegister, 
  logoutUser, 
  refreshUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  changePassword
} from '@/redux/slice/user';
import { toast } from 'sonner';

/**
 * Custom hook to use Redux auth state and actions
 * This replaces the old AuthContext
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, status, message, isAuthenticated } = useAppSelector((state) => state.user);

  // Initialize auth on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleLogout = () => {
      dispatch(logoutUser());
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    try {
      const result = await dispatch(userLogin({ email, password })).unwrap();
      toast.success('Logged in successfully');
      return result;
    } catch (error: any) {
      toast.error(error || 'Login failed. Please try again.');
      throw error;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    mobile?: string
  ) => {
    try {
      await dispatch(userRegister({ firstName, lastName, email, password, mobile })).unwrap();
      toast.success('Registration successful! Please verify your email.');
    } catch (error: any) {
      toast.error(error || 'Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error || 'Logout failed');
    }
  };

  const refresh = async () => {
    try {
      await dispatch(refreshUser()).unwrap();
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // OTP and password methods
  const sendOTPCode = async (email: string, purpose: "signup" | "reset-password") => {
    try {
      const result = await dispatch(sendOTP({ email, purpose })).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const verifyOTPCode = async (email: string, otp: string, purpose: "signup" | "reset-password") => {
    try {
      const result = await dispatch(verifyOTP({ email, otp, purpose })).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const result = await dispatch(forgotPassword(email)).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const resetUserPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const result = await dispatch(resetPassword({ email, otp, newPassword })).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const changeUserPassword = async (oldPassword: string, newPassword: string) => {
    try {
      const result = await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser: refresh,
    sendOTP: sendOTPCode,
    verifyOTP: verifyOTPCode,
    forgotPassword: requestPasswordReset,
    resetPassword: resetUserPassword,
    changePassword: changeUserPassword,
  };
};
