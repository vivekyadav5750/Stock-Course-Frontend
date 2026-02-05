export type User_Types = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  avatar?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  isVerified?: boolean;
  isBlocked?: boolean;
  courses?: Course_Types[];
  purchasedCourses?: Course_Types[];
  transactions?: Transaction_Types[];
  createdAt?: string;
  updatedAt?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
  },
  category?: string[];
};

export type Course_Types = {
  _id?: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  instructor?: string;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  language?: string;
  duration?: number;
  modules?: string[];
  students?: string[];
  rating?: number;
  reviews?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Module_Types = {
  _id?: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  lessons?: string[];
  duration?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
};

export type Lesson_Types = {
  _id?: string;
  title: string;
  description?: string;
  moduleId: string;
  courseId: string;
  category?: string;
  order: number;
  contentType: typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  duration?: number;
  content?: string;
  resources?: {
    title: string;
    url: string;
    type: string;
  }[];
  isPublished?: boolean;
  isPreview?: boolean;
  createdAt?: string;
  updatedAt?: string;

};

export const CONTENT_TYPES = {
  VIDEO: "video",
  PDF: "pdf",
  TEXT: "text",
} as const;

export type Transaction_Types = {
  _id?: string;
  userId: string;
  courseId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  orderId?: string;
  paymentGateway?: "razorpay" | "stripe" | "paypal";
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};