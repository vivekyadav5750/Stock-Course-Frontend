# Frontend OTP Implementation - Quick Reference

## ✅ Implementation Complete

All frontend code has been updated to match your backend API structure.

## Key Changes Made

### 1. Service Layer (`auth.service.ts`)
- ✅ OTP endpoints: `/otp/send` and `/otp/verify` (not `/auth/send-otp`)
- ✅ Change password: No OTP required, uses `PUT /auth/change-password`
- ✅ Reset password: No OTP in body, backend checks verification status
- ✅ Removed `forgotPassword()` method (use `sendOTP()` directly)

### 2. Types (`types.ts`)
- ✅ Updated `SendOTPRequest` purpose: `"signup" | "forgot-password" | "change-password"`
- ✅ Simplified `SendOTPResponse`: `{ message: string }`
- ✅ Simplified `VerifyOTPResponse`: `{ message: string }`
- ✅ Removed `otp` field from `ChangePasswordRequest`
- ✅ Removed `otp` field from `ResetPasswordRequest`

### 3. Pages Updated

#### Register (`Register_New.tsx`) ✅
- Sends OTP using `/api/otp/send` with `purpose: "signup"`
- Verifies OTP using `/api/otp/verify`
- Completes registration with `/api/auth/signup`

#### Forgot Password (`ForgotPassword.tsx`) ✅
- Step 1: Send OTP via `/api/otp/send` with `purpose: "forgot-password"`
- Step 2: Verify OTP via `/api/otp/verify`
- Step 3: Reset password via `/api/auth/reset-password` (email + newPassword only)

#### Change Password (`ChangePassword.tsx`) ✅
- **Simplified**: No OTP steps
- Direct form: current password + new password
- Sends `PUT /api/auth/change-password`

#### Profile (`Profile.tsx`) ✅
- Added "Change Password" button with navigation

#### Login (`Login.tsx`) ✅
- Already has "Forgot Password" link

### 4. Routing (`App.tsx`) ✅
- `/register` → Register page
- `/login` → Login page
- `/forgot-password` → Forgot password flow (public)
- `/change-password` → Change password (protected)

## API Flow Summary

### Signup with Email Verification
```
1. POST /api/otp/send { email, purpose: "signup" }
2. POST /api/otp/verify { email, otp, purpose: "signup" }
3. POST /api/auth/signup { firstName, lastName, email, password, mobile }
```

### Forgot Password
```
1. POST /api/otp/send { email, purpose: "forgot-password" }
2. POST /api/otp/verify { email, otp, purpose: "forgot-password" }
3. POST /api/auth/reset-password { email, newPassword }
   (Backend checks OTP was verified)
```

### Change Password (No OTP)
```
PUT /api/auth/change-password
Authorization: Bearer {token}
{ currentPassword, newPassword }
```

## Testing URLs

- **Register:** http://localhost:5173/register
- **Login:** http://localhost:5173/login
- **Forgot Password:** http://localhost:5173/forgot-password
- **Change Password:** http://localhost:5173/change-password (must be logged in)
- **Profile:** http://localhost:5173/profile (must be logged in)

## Environment Setup

Create `.env` in frontend root:
```env
VITE_API_URL=http://localhost:2000/api
```

## Backend Requirements

Your backend should be running at `http://localhost:2000` with these endpoints:
- `POST /api/otp/send` - Arcjet rate limited (5/hour)
- `POST /api/otp/verify` - Arcjet rate limited (10/15min)
- `POST /api/auth/signup` - After OTP verification
- `POST /api/auth/login`
- `POST /api/auth/reset-password` - After OTP verification
- `PUT /api/auth/change-password` - Protected, no OTP
- `GET /api/auth/profile` - Protected
- `PUT /api/auth/profile` - Protected
- `POST /api/auth/logout` - Protected
- `POST /api/auth/refresh-token` - Refresh access token

## File Manifest

### Created Files
- ✅ `src/pages/ForgotPassword.tsx` - Complete forgot password flow
- ✅ `src/pages/ChangePassword.tsx` - Simple password change (no OTP)
- ✅ `src/pages/Register_New.tsx` - Registration with OTP
- ✅ `OTP_IMPLEMENTATION.md` - Full documentation
- ✅ `FRONTEND_OTP_SUMMARY.md` - This file

### Updated Files
- ✅ `src/services/auth.service.ts` - All endpoints aligned
- ✅ `src/services/types.ts` - Types match backend
- ✅ `src/pages/Profile.tsx` - Added change password button
- ✅ `src/App.tsx` - Routes configured

### Unchanged (Already Correct)
- ✅ `src/pages/Login.tsx` - Has forgot password link
- ✅ `src/lib/axios.ts` - Properly configured
- ✅ `src/context/AuthContext.tsx` - Works as is

## Next Steps

1. **Start Backend:** Ensure your backend is running on port 2000
2. **Start Frontend:** Run `npm run dev` in frontend directory
3. **Test Flows:**
   - Register a new account (requires OTP)
   - Login
   - Try forgot password (requires OTP)
   - Try change password (no OTP, must be logged in)
4. **Check Email:** Verify OTP emails are delivered (check spam folder)
5. **Monitor:** Check Arcjet dashboard for rate limiting

## Security Features

- ✅ Arcjet rate limiting on OTP endpoints
- ✅ OTP expiry (10 minutes)
- ✅ One-time use OTPs
- ✅ Resend email integration with HTML templates
- ✅ JWT with refresh tokens
- ✅ Protected routes for authenticated features
- ✅ Password validation (6+ characters)
- ✅ Error handling with user-friendly messages

## Common Issues & Solutions

### OTP Not Received
- Check spam/junk folder
- Verify Resend API key in backend
- Check Resend dashboard for delivery status

### Rate Limited
- Wait for cooldown period
- Check Arcjet dashboard
- Verify rate limits aren't too strict

### 401 Unauthorized
- Check access token in localStorage/memory
- Verify refresh token in cookies
- Check token expiry

### CORS Errors
- Ensure backend has CORS enabled
- Check `withCredentials: true` in axios
- Verify backend allows credentials

## Additional Documentation

See `OTP_IMPLEMENTATION.md` for:
- Detailed API documentation
- Complete flow diagrams
- TypeScript type definitions
- Backend technology stack
- Security considerations
- Testing checklist

---

**Status:** ✅ Ready for testing with backend
**Last Updated:** January 24, 2026
