import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance, { setAccessToken } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";

export type User = {
    _id?: string;
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    avatar?: string;
    isAdmin: boolean;
    isSuperAdmin?: boolean;
    isVerified?: boolean;
    isBlocked?: boolean;
    courses?: string[];
    transactions?: string[];
    createdAt?: string;
    updatedAt?: string;
    notifications?: {
        email: boolean;
        sms: boolean;
    },
    category?: string[];
};

type UserState = {
    user: User | null;
    status: "idle" | "loading" | "success" | "failed";
    message: string;
    isAuthenticated: boolean;
    // categories?: string[];
};

type LoginData = {
    email: string;
    password: string;
};

type RegisterData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
};

const initialState: UserState = {
    user: null,
    status: "idle",
    message: "",
    isAuthenticated: false,
    // categories: [],
};  

export const userLogin = createAsyncThunk(
    "user/login",
    async (data: LoginData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/login", data);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "Login failed");
            }

            // Store access token
            if (response.data.data?.accessToken) {
                setAccessToken(response.data.data.accessToken);
            }

            return response.data.data;
        } catch (error: any) {
            const message = getErrorMessage(error, "Login failed. Please try again.");
            return rejectWithValue(message);
        }
    }
);

export const userRegister = createAsyncThunk(
    "user/register",
    async (data: RegisterData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/signup", data);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "Registration failed");
            }

            return response.data.data;
        } catch (error: any) {
            const message = getErrorMessage(error, "Registration failed. Please try again.");
            return rejectWithValue(message);
        }
    }
);

export const getUser = createAsyncThunk(
    "user/getUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/auth/profile");

            if (!response.data.success || !response.data.data) {
                return rejectWithValue("Failed to get user profile");
            }

            return response.data.data;
        } catch (error: any) {
            const message = getErrorMessage(error, "Failed to get user profile");
            return rejectWithValue(message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    "user/updateProfile",
    async (data: Partial<User>, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put("/auth/profile", data);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "Update failed");
            }

            //   return normalizeUser(response.data.data?.user || response.data.data);
            return response.data.data;
        } catch (error: any) {
            const message = getErrorMessage(error, "Failed to update profile");
            return rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    "user/logout",
    async (_, { rejectWithValue }) => {
        try {
            // Try to call logout API, but don't fail if it errors
            await axiosInstance.post("/auth/logout");
        } catch (error: any) {
            // Ignore logout API errors - user should be logged out locally anyway
            console.log("Logout API failed (ignored):", error);
        } finally {
            // Always clear token locally, regardless of API result
            // TODOS: if need clear the cookies
            setAccessToken(null);
        }
    }
);

// Send OTP for email verification or password reset
export const sendOTP = createAsyncThunk(
    "user/sendOTP",
    async (data: { email: string; purpose: "signup" | "forgot-password" | "change-password" }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/otp/send", data);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "Failed to send OTP");
            }

            return response.data.message || "OTP sent successfully";
        } catch (error: any) {
            const message = getErrorMessage(error, "Failed to send OTP");
            return rejectWithValue(message);
        }
    }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
    "user/verifyOTP",
    async (data: { email: string; otp: string; purpose: "signup" | "forgot-password" | "change-password" }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/otp/verify", data);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "OTP verification failed");
            }

            return response.data.message || "OTP verified successfully";
        } catch (error: any) {
            const message = getErrorMessage(error, "OTP verification failed");
            return rejectWithValue(message);
        }
    }
);

// Forgot Password - Request OTP
export const forgotPassword = createAsyncThunk(
    "user/forgotPassword",
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/forgot-password", { email });

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "Failed to send reset email");
            }

            return response.data.message || "Reset email sent successfully";
        } catch (error: any) {
            const message = getErrorMessage(error, "Failed to send reset email");
            return rejectWithValue(message);
        }
    }
);

// Reset Password with OTP
export const resetPassword = createAsyncThunk(
    "user/resetPassword",
    async (data: { email: string; otp: string; newPassword: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/reset-password", data);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "Password reset failed");
            }

            return response.data.message || "Password reset successfully";
        } catch (error: any) {
            const message = getErrorMessage(error, "Password reset failed");
            return rejectWithValue(message);
        }
    }
);

// Change Password (when logged in)
export const changePassword = createAsyncThunk(
    "user/changePassword",
    async (data: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put("/auth/change-password", data);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || "Password change failed");
            }

            return response.data.message || "Password changed successfully";
        } catch (error: any) {
            const message = getErrorMessage(error, "Password change failed");
            return rejectWithValue(message);
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearError(state) {
            state.message = "";
            state.status = "idle";
        },
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.status = "idle";
            setAccessToken(null);
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(userLogin.pending, (state) => {
                state.status = "loading";
                state.message = "";
            })
            .addCase(userLogin.fulfilled, (state, action) => {
                state.status = "success";
                state.user = action.payload?.user || null;
                state.isAuthenticated = true;
                state.message = "Logged in successfully";
            })
            .addCase(userLogin.rejected, (state, action) => {
                state.status = "failed";
                state.message = action.payload as string;
                state.isAuthenticated = false;
            })

            // Register
            .addCase(userRegister.pending, (state) => {
                state.status = "loading";
                state.message = "";
            })
            .addCase(userRegister.fulfilled, (state) => {
                state.status = "success";
                state.message = "Registration successful! Please verify your email.";
            })
            .addCase(userRegister.rejected, (state, action) => {
                state.status = "failed";
                state.message = action.payload as string;
            })

            // Get User
            .addCase(getUser.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.status = "success";
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.status = "failed";
                state.message = action.payload as string;
                state.user = null;
                state.isAuthenticated = false;
            })

            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateUserProfile.fulfilled, (state) => {
                state.status = "success";
                // state.user = action.payload;
                state.message = "Profile updated successfully";
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.status = "failed";
                state.message = action.payload as string;
            })

            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.status = "loading";
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.status = "idle";
                state.user = null;
                state.isAuthenticated = false;
                state.message = "Logged out successfully";
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.status = "failed";
                state.message = action.payload as string;
                // Still clear user on logout even if API call fails
                state.user = null;
                state.isAuthenticated = false;
            })
    },
});

export const userReducer = userSlice.reducer;
export const { clearError, setUser, clearUser } = userSlice.actions;