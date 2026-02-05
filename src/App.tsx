
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hook";
import { getUser, logoutUser } from "@/redux/slice/user";
import { useAuth } from "./hooks/useAuth";
import AdminSetup from "./components/AdminSetup";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Purchase from "./pages/Purchase";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/admin/Dashboard";
import CourseManagement from "./pages/admin/CourseManagement";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, status } = useAuth();

  if (status === 'loading' || status === 'idle') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user && (status === 'success' || status === 'failed')) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, status } = useAuth();

  if (status === 'loading' || status === 'idle') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if ((!user || !user.isAdmin) && (status === 'success' || status === 'failed')) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Main App with auth initialization
const AppContent = () => {
  const dispatch = useAppDispatch();

  // Initialize auth once when app loads
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  // Listen for logout events from axios interceptor (only once)
  useEffect(() => {
    const handleLogout = () => {
      dispatch(logoutUser());
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="courses" element={<Courses />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route 
            path="purchase/:id" 
            element={
              <ProtectedRoute>
                <Purchase />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="admin/courses" 
            element={
              <AdminRoute>
                <CourseManagement />
              </AdminRoute>
            } 
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AdminSetup />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
