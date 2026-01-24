# Stock Course Platform - Documentation

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🏗️ Architecture

### **Tech Stack**
- React + TypeScript + Vite
- Redux Toolkit (State Management)
- Tailwind CSS + shadcn/ui
- Axios (API Client)

### **Authentication**
- JWT Access Token (30 min, in memory)
- Refresh Token (7 days, HttpOnly cookie)
- Auto-refresh via Axios interceptor

### **State Management**
Redux slices with direct API calls (no service layer):
- **user** - Authentication & profile
- **course** - Course CRUD & enrollment
- **module** - Course modules
- **lesson** - Lessons & progress
- **transaction** - Payments

## 📁 Project Structure

```
src/
├── redux/
│   ├── store.ts          # Redux store
│   ├── hooks.ts          # Typed hooks
│   └── slice/            # Redux slices
├── pages/                # Page components
├── components/           # Reusable components
├── hooks/                # Custom hooks
│   └── useAuth.ts        # Auth hook wrapper
└── lib/
    ├── axios.ts          # Axios config
    └── utils.ts          # Error handlers
```

## 🔐 Authentication Flow

### **OTP Verification**
**Endpoints:** `/api/otp/send`, `/api/otp/verify`

**Purposes:** `signup`, `forgot-password`

**Flow:**
1. Send OTP → `/api/otp/send` with purpose
2. Verify OTP → `/api/otp/verify`
3. Complete action (signup/reset password)

### **Password Operations**
- **Change Password** (logged in): `PUT /auth/change-password` - No OTP needed
- **Reset Password** (forgot): Requires OTP verification first

## 🛠️ Redux Usage

### **Dispatch Actions**
```typescript
import { useAppDispatch } from '@/redux/hooks';
import { userLogin } from '@/redux/slice/user';

const dispatch = useAppDispatch();
await dispatch(userLogin({ email, password })).unwrap();
```

### **Access State**
```typescript
import { useAppSelector } from '@/redux/hooks';

const { user, status } = useAppSelector(state => state.user);
```

### **Use Auth Hook (Recommended)**
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, sendOTP, verifyOTP } = useAuth();
```

## 🔍 Error Handling

```typescript
import { getErrorMessage } from '@/lib/utils';

try {
  await dispatch(action()).unwrap();
} catch (error) {
  const message = getErrorMessage(error, 'Fallback message');
  toast.error(message); // Shows specific validation errors
}
```

## 📝 API Patterns

All Redux slices use direct API calls:

```typescript
export const createCourse = createAsyncThunk(
  "course/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/courses", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed"));
    }
  }
);
```

## 🎯 Key Features

- ✅ JWT + HttpOnly cookies authentication
- ✅ OTP verification for sensitive operations
- ✅ Redux Toolkit state management
- ✅ Automatic token refresh
- ✅ Direct API calls in Redux slices
- ✅ Specific error messages from backend
- ✅ TypeScript throughout

## 🔄 Recent Migration

**Completed:** Context API → Redux Toolkit
- Removed all service files
- Removed AuthContext
- All API calls now in Redux slices
- Components use Redux dispatch directly

## 📦 Main Dependencies

```json
{
  "@reduxjs/toolkit": "^2.x",
  "react-redux": "^9.x",
  "axios": "^1.x",
  "react-router-dom": "^6.x",
  "tailwindcss": "^3.x",
  "sonner": "^1.x"
}
```

## 🎨 UI Components

Using shadcn/ui components in `src/components/ui/`:
- Forms, Dialogs, Cards, Buttons
- Tables, Tabs, Select, Input
- Toast notifications (sonner)

## 🔧 Environment

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Backend base URL is set in `src/lib/axios.ts`

## 📚 Additional Notes

- All user IDs normalized from `_id` to `id` in Redux
- Course levels: `beginner`, `intermediate`, `advanced`
- Lesson type: video-based with optional free preview
- Admin features in `/admin/*` routes
