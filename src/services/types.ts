// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
}

// User types
export interface User {
  _id?: string; // MongoDB ID
  id?: string; // Computed from _id
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  avatar?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  courses?: string[];
  transactions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface RegisterResponse {
  user: User;
}

// Course types
export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: "Basic" | "Intermediate" | "Advanced";
  price: number;
  discount?: number;
  duration: string;
  thumbnail?: string;
  isPublished: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  discount?: number;
  duration: string;
  thumbnail?: string;
}

// Module types
export interface Module {
  _id: string;
  course: string | Course;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleRequest {
  course: string;
  title: string;
  order: number;
}

// Lesson types
export interface Lesson {
  _id: string;
  course: string | Course;
  module: string | Module;
  title: string;
  contentType: "video" | "pdf" | "text";
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  duration?: string;
  order: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonRequest {
  course: string;
  module: string;
  title: string;
  contentType: "video" | "pdf" | "text";
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  duration?: string;
  order: number;
  isPreview?: boolean;
}

// Transaction types
export interface Transaction {
  _id: string;
  method: string;
  amount: number;
  user: string | User;
  transactionId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  method: string;
  amount: number;
  transactionId: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
