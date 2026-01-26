export const CONTENT_TYPES = {
    VIDEO: "video",
    PDF: "pdf",
    TEXT: "text",
} as const;

export type Course_Types = {
  _id?: string;
  id?: string;
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
