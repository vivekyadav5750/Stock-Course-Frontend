# Stock Course Frontend - MongoDB Backend Migration

## ✅ Refactoring Complete

This frontend has been successfully refactored to work with the MongoDB/Express backend instead of Supabase.

---

## 🏗️ Architecture Overview

### **Authentication Flow**
- **JWT Access Token**: 30 minutes validity, stored in memory
- **Refresh Token**: 7 days validity, stored in httpOnly cookie
- **Auto-refresh**: Axios interceptor automatically refreshes expired tokens

### **Project Structure**
```
src/
├── lib/
│   ├── axios.ts              # Axios instance with JWT interceptors
│   ├── constants.ts          # App constants
│   └── utils.ts              # Utility functions
├── services/                 # API Service Layer
│   ├── types.ts             # TypeScript interfaces
│   ├── auth.service.ts      # Authentication APIs
│   ├── course.service.ts    # Course management APIs
│   ├── module.service.ts    # Module APIs
│   ├── lesson.service.ts    # Lesson APIs
│   ├── transaction.service.ts # Payment APIs
│   └── index.ts             # Barrel exports
├── context/
│   └── AuthContext.tsx      # Auth state management (JWT-based)
├── pages/
│   ├── Login.tsx            # Login page (JWT auth)
│   ├── Register.tsx         # Registration page
│   ├── Profile.tsx          # User profile
│   ├── Courses.tsx          # Course listing
│   ├── CourseDetail.tsx     # Single course view
│   └── admin/
│       ├── Dashboard.tsx
│       └── CourseManagement.tsx  # Full CRUD for courses/modules/lessons
└── components/
    ├── Layout.tsx
    ├── Navbar.tsx
    └── ui/                  # Shadcn components
```

---

## 🔑 Key Changes

### 1. **Removed Supabase**
- ❌ Deleted `@supabase/supabase-js` dependency
- ❌ Removed `src/integrations/` folder
- ❌ Removed all Supabase client imports

### 2. **Added Axios with JWT Handling**
- ✅ Created `lib/axios.ts` with interceptors
- ✅ Automatic token refresh on 401 errors
- ✅ Request queuing during token refresh
- ✅ Cookies enabled for refresh token

### 3. **API Service Layer**
All API calls are abstracted into service files:

```typescript
// Example usage in components
import { authService, courseService } from '@/services';

// Login
const response = await authService.login({ email, password });

// Get courses
const courses = await courseService.getPublishedCourses();

// Create course (admin)
const newCourse = await courseService.createCourse(data);
```

### 4. **Updated AuthContext**
- Uses JWT access + refresh tokens
- Auto-initializes from refresh token cookie
- Listens for logout events from axios interceptor

### 5. **Updated All Pages**
- **Login/Register**: JWT-based authentication
- **Profile**: Uses user data from backend
- **CourseManagement**: Full CRUD for courses, modules, lessons
- **Protected Routes**: Check JWT token validity

### 6. **Removed OAuth**
- Removed Google/Facebook OAuth buttons (can be added to backend later)

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ installed
- Backend server running on `http://localhost:2000`

### **Installation**

1. **Clone and install:**
```bash
npm install
```

2. **Configure environment:**
```bash
# Copy .env.example to .env
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:2000/api
NODE_ENV=development
```

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

---

## 🔐 Authentication Guide

### **How It Works**

1. **Login** → Backend returns:
   - Access token (stored in memory)
   - Refresh token (httpOnly cookie)

2. **API Requests** → Axios adds `Authorization: Bearer {accessToken}` header

3. **Token Expires (401)** → Axios interceptor:
   - Calls `/auth/refresh-token` with cookie
   - Gets new access token
   - Retries original request

4. **Refresh Fails** → User logged out automatically

### **Making Authenticated Requests**

```typescript
// Services handle tokens automatically
const profile = await authService.getProfile(); // ✅ Token added

// Manual axios calls also work
import axiosInstance from '@/lib/axios';
const response = await axiosInstance.get('/some-endpoint');
```

---

## 📋 API Endpoints

### **Auth**
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login (returns access token)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile (protected)

### **Courses**
- `GET /api/course` - Get published courses (public)
- `GET /api/course/all` - Get all courses (admin)
- `GET /api/course/:id` - Get course by ID
- `POST /api/course` - Create course (admin)
- `PUT /api/course/:id` - Update course (admin)
- `DELETE /api/course/:id` - Delete course (admin)
- `PATCH /api/course/:id/publish` - Toggle publish (admin)

### **Modules**
- `GET /api/module/course/:courseId` - Get course modules
- `GET /api/module/:id` - Get module by ID
- `POST /api/module` - Create module (admin)
- `PUT /api/module/:id` - Update module (admin)
- `DELETE /api/module/:id` - Delete module (admin)

### **Lessons**
- `GET /api/lesson/module/:moduleId` - Get module lessons
- `GET /api/lesson/:id` - Get lesson (with access check)
- `POST /api/lesson` - Create lesson (admin)
- `PUT /api/lesson/:id` - Update lesson (admin)
- `DELETE /api/lesson/:id` - Delete lesson (admin)

### **Transactions**
- `POST /api/transaction` - Create transaction
- `GET /api/transaction/my-transactions` - User transactions
- `GET /api/transaction/:id` - Get transaction
- `GET /api/transaction/all` - All transactions (admin)

---

## 🛠️ Development Notes

### **Service Files Pattern**

The service files provide a clean API abstraction:

```typescript
// services/course.service.ts
export const courseService = {
  async getPublishedCourses() {
    const response = await axiosInstance.get('/course');
    return response.data;
  },
  // ... more methods
};
```

**Benefits:**
- ✅ Single source of truth for API calls
- ✅ Easy to mock for testing
- ✅ Type-safe with TypeScript
- ✅ Works perfectly with Redux (call from thunks)

### **If Using Redux**

You can integrate Redux by calling services from thunks:

```typescript
// redux/slices/courseSlice.ts
export const fetchCourses = createAsyncThunk(
  'courses/fetch',
  async () => {
    const response = await courseService.getPublishedCourses();
    return response.data;
  }
);
```

---

## 🎯 Admin Setup

To make a user admin:

1. Register a user via frontend
2. In MongoDB, update the user document:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```
3. Refresh browser to see admin routes

---

## 📦 Dependencies

### **Added**
- `axios@^1.6.0` - HTTP client with interceptors

### **Removed**
- `@supabase/supabase-js` - No longer needed

### **Kept**
- `react-router-dom` - Routing
- `@tanstack/react-query` - Server state management (optional)
- `framer-motion` - Animations
- `sonner` - Toast notifications
- Shadcn UI components

---

## 🐛 Troubleshooting

### **401 Unauthorized Error**
- Check backend is running on `http://localhost:2000`
- Verify `VITE_API_URL` in `.env`
- Check refresh token cookie is being sent

### **CORS Errors**
Backend must allow:
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true // Important for cookies
}));
```

### **Token Not Refreshing**
- Ensure backend sends refresh token as httpOnly cookie
- Check axios instance has `withCredentials: true`
- Verify backend `/auth/refresh-token` endpoint works

---

## 📝 TODO

- [ ] Add Redux/Redux Toolkit (if needed for complex state)
- [ ] Add React Query for server state caching
- [ ] Implement actual course enrollment logic
- [ ] Add payment gateway integration
- [ ] Implement video player for lessons
- [ ] Add progress tracking
- [ ] Implement search and filters

---

## 👥 Team Notes

### **For Backend Developers**
- All API responses must follow format:
  ```json
  {
    "success": true,
    "message": "Success message",
    "data": { ... }
  }
  ```
- Refresh token must be httpOnly cookie
- CORS must allow credentials

### **For Frontend Developers**
- Always use service files for API calls
- Never store sensitive data in localStorage
- Let axios interceptor handle token refresh
- Use TypeScript interfaces from `services/types.ts`

---

## 📄 License

This is a private project.

---

**Last Updated:** January 2026
**Migration Status:** ✅ Complete
