# OTP Verification Implementation Guide - UPDATED FOR BACKEND

This document describes the OTP verification flows implemented in the application, **now aligned with the actual backend API structure**.

## Overview

All sensitive operations (signup, forgot password) now require OTP verification for enhanced security. OTPs are sent to the user's email address and must be verified before completing the action.

**Note:** Change password does NOT require OTP in the current backend implementation.

## Backend API Endpoints

### OTP Endpoints (Public)

#### 1. Send OTP
**Endpoint:** `POST /api/otp/send`

**Request Body:**
```json
{
  "email": "user@example.com",
  "purpose": "signup" | "forgot-password" | "change-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Rate Limiting:** 5 requests per hour per IP (Arcjet protection)

---

#### 2. Verify OTP
**Endpoint:** `POST /api/otp/verify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "signup" | "forgot-password" | "change-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Rate Limiting:** 10 requests per 15 minutes per IP (Arcjet protection)

**Note:** Backend marks OTP as verified in database. Subsequent operations check this verification status.

---

### Authentication Endpoints

#### 3. Complete Signup (After OTP Verification)
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "mobile": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Prerequisites:** OTP must be verified first using `/api/otp/verify` with `purpose: "signup"`

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "isAdmin": false
    },
    "accessToken": "jwt-token",
    "refreshToken": "set-in-cookie"
  }
}
```

---

#### 4. Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt-token"
  }
}
```

---

#### 5. Reset Password (After OTP Verification)
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123"
}
```

**Prerequisites:** OTP must be verified first using `/api/otp/verify` with `purpose: "forgot-password"`

**Backend Logic:** Server checks `isOtpVerified()` status before allowing password reset

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

#### 6. Change Password (NO OTP Required)
**Endpoint:** `PUT /api/auth/change-password`  
**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Note:** Backend does NOT require OTP for password changes when user is already authenticated.

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### 7. Update Profile
**Endpoint:** `PUT /api/auth/profile`  
**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "avatar": "https://example.com/new-avatar.jpg",
  "notifications": {
    "email": true,
    "sms": false
  }
}
```

**Note:** Profile updates are for avatar and notification settings only.

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

---

## User Flows

### 1. Signup Flow with OTP Verification ✅

**Frontend Page:** `/register`

**Steps:**
1. User fills registration form (firstName, lastName, email, password, mobile)
2. Frontend sends `POST /api/otp/send` with `purpose: "signup"`
3. User receives OTP via email (Resend API with beautiful HTML template)
4. User enters OTP
5. Frontend sends `POST /api/otp/verify` with OTP and `purpose: "signup"`
6. Backend verifies OTP and marks it as verified
7. Frontend sends `POST /api/auth/signup` to complete registration
8. Backend checks OTP verification status, creates user, returns tokens
9. User is redirected to login page

**Components:** `Register_New.tsx`

---

### 2. Forgot Password Flow ✅

**Frontend Page:** `/forgot-password`

**Steps:**
1. User enters email address
2. Frontend sends `POST /api/otp/send` with `purpose: "forgot-password"`
3. User receives OTP via email
4. User enters OTP
5. Frontend sends `POST /api/otp/verify` with OTP and `purpose: "forgot-password"`
6. Backend verifies OTP and marks it as verified
7. User enters new password
8. Frontend sends `POST /api/auth/reset-password` with email and newPassword
9. Backend checks OTP verification status (`isOtpVerified()`), resets password
10. User is redirected to login page

**Components:** `ForgotPassword.tsx`

---

### 3. Change Password Flow ✅ (NO OTP)

**Frontend Page:** `/change-password` (Protected route)

**Steps:**
1. User navigates to change password page (must be logged in)
2. User enters current password and new password
3. Frontend sends `PUT /api/auth/change-password` with passwords
4. Backend verifies current password and updates to new password
5. User sees success message

**Note:** Backend does NOT require OTP for this flow as user is already authenticated.

**Components:** `ChangePassword.tsx`

---

### 4. Profile Update Flow

**Frontend Page:** `/profile`

**Steps:**
1. User updates avatar or notification settings
2. Frontend sends `PUT /api/auth/profile` with updated data
3. Backend updates user profile
4. User sees updated profile

**Note:** No OTP required for avatar/notification updates.

---

## Frontend Service Methods

All methods are available in `authService` from `@/services`:

```typescript
// Send OTP (signup, forgot password)
await authService.sendOTP({
  email: "user@example.com",
  purpose: "signup" | "forgot-password" | "change-password"
});

// Verify OTP
await authService.verifyOTP({
  email: "user@example.com",
  otp: "123456",
  purpose: "signup" | "forgot-password" | "change-password"
});

// Complete Signup (after OTP verification)
await authService.register({
  firstName: "John",
  lastName: "Doe",
  email: "user@example.com",
  password: "password123",
  mobile: "+1234567890"
});

// Reset Password (after OTP verification)
await authService.resetPassword({
  email: "user@example.com",
  newPassword: "newpassword123"
});

// Change Password (NO OTP, requires authentication)
await authService.changePassword({
  currentPassword: "oldpassword123",
  newPassword: "newpassword123"
});

// Update Profile
await authService.updateProfile({
  avatar: "https://example.com/avatar.jpg",
  notifications: { email: true, sms: false }
});
```

---

## TypeScript Types

All types are defined in `src/services/types.ts`:

```typescript
// OTP Verification
interface SendOTPRequest {
  email: string;
  purpose: "signup" | "forgot-password" | "change-password";
}

interface SendOTPResponse {
  message: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose: "signup" | "forgot-password" | "change-password";
}

interface VerifyOTPResponse {
  message: string;
}

// Registration
interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile?: string;
}

// Profile Update
interface UpdateProfileRequest {
  avatar?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
  };
}

// Password Management
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  // NO OTP FIELD
}

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  // NO OTP FIELD - backend checks verification status
}
```

---

## Security Considerations

1. **OTP Expiration:** OTPs should expire after a certain time (e.g., 10 minutes)
2. **Rate Limiting:** Implement rate limiting on OTP sending to prevent spam
3. **OTP Attempts:** Limit the number of OTP verification attempts
4. **HTTPS Only:** All OTP-related endpoints must use HTTPS
5. **Password Strength:** Enforce minimum password requirements (6+ characters)
6. **Session Management:** Clear sessions appropriately after password changes

---

## Routes

### Public Routes
- `/register` - Registration with OTP verification
- `/login` - Login page (includes "Forgot Password" link)
- `/forgot-password` - Password reset with OTP verification

### Protected Routes (Require Authentication)
- `/profile` - User profile page
- `/change-password` - Change password with OTP verification

---

## Testing Checklist

- [ ] Signup with valid email sends OTP
- [ ] OTP verification works correctly
- [ ] Registration completes after OTP verification
- [ ] Forgot password sends OTP
- [ ] Password reset works with valid OTP
- [ ] Change password requires OTP verification
- [ ] Invalid OTP shows error message
- [ ] Resend OTP functionality works
- [ ] Profile update with email change requires OTP
- [ ] All error messages are user-friendly

---

## Backend Requirements

The backend must implement these endpoints:

1. `POST /auth/send-otp` - Send OTP to email
2. `POST /auth/verify-otp` - Verify OTP code
3. `POST /auth/signup` - Register new user
4. `PUT /auth/profile` - Update user profile
5. `POST /auth/forgot-password` - Request password reset OTP
6. `POST /auth/reset-password` - Reset password with OTP
7. `POST /auth/change-password` - Change password with OTP

All endpoints should return consistent response format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null
}
```

---

## Notes

- The old `Register.tsx` page still exists but should be replaced with `Register_New.tsx`
- Login page already has "Forgot Password" link pointing to `/forgot-password`
- Profile page includes "Change Password" button that navigates to `/change-password`
- All forms include loading states and error handling
- All flows use toast notifications for user feedback
