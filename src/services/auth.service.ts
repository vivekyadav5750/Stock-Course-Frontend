import axiosInstance, { setAccessToken } from "@/lib/axios";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResponse,
} from "./types";

/**
 * Normalize user data from backend (converts _id to id)
 */
const normalizeUser = (user: any): User => {
  if (!user) return user;
  
  return {
    ...user,
    id: user._id || user.id,
  };
};

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(
      "/auth/signup",
      data
    );
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data
    );

    // Store access token
    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }

    // Normalize user data
    if (response.data.data?.user) {
      response.data.data.user = normalizeUser(response.data.data.user);
    }

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>("/auth/logout");
    
    // Clear access token
    setAccessToken(null);
    
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await axiosInstance.get<ApiResponse<User>>("/auth/profile");
    
    // Normalize user data
    if (response.data.data) {
      response.data.data = normalizeUser(response.data.data);
    }
    
    return response.data;
  },

  /**
   * Refresh access token using refresh token cookie
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh-token"
    );

    // Store new access token
    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }

    return response.data;
  },

  /**
   * Verify if user is authenticated
   */
  async verifyAuth(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Send OTP for verification (signup, forgot password, change password)
   */
  async sendOTP(data: SendOTPRequest): Promise<ApiResponse<SendOTPResponse>> {
    const response = await axiosInstance.post<ApiResponse<SendOTPResponse>>(
      "/otp/send",
      data
    );
    return response.data;
  },

  /**
   * Verify OTP code
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse>> {
    const response = await axiosInstance.post<ApiResponse<VerifyOTPResponse>>(
      "/otp/verify",
      data
    );
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse>> {
    const response = await axiosInstance.put<ApiResponse<UpdateProfileResponse>>(
      "/auth/profile",
      data
    );

    // Normalize user data
    if (response.data.data?.user) {
      response.data.data.user = normalizeUser(response.data.data.user);
    }

    return response.data;
  },

  /**
   * Change password (requires current password, no OTP needed)
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<PasswordResponse>> {
    const response = await axiosInstance.put<ApiResponse<PasswordResponse>>(
      "/auth/change-password",
      data
    );
    return response.data;
  },

  /**
   * Reset password (after OTP verification)
   * Note: OTP must be verified first using sendOTP and verifyOTP
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<PasswordResponse>> {
    const response = await axiosInstance.post<ApiResponse<PasswordResponse>>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },
};
