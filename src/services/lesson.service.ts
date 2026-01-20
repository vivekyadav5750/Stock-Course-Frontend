import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  Lesson,
  CreateLessonRequest,
} from "./types";

export const lessonService = {
  /**
   * Get lessons by module ID
   */
  async getLessonsByModule(moduleId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await axiosInstance.get<ApiResponse<Lesson[]>>(`/lesson/module/${moduleId}`);
    return response.data;
  },

  /**
   * Get lesson by ID (with access check)
   */
  async getLessonById(id: string): Promise<ApiResponse<Lesson>> {
    const response = await axiosInstance.get<ApiResponse<Lesson>>(`/lesson/${id}`);
    return response.data;
  },

  /**
   * Create new lesson (admin only)
   */
  async createLesson(data: CreateLessonRequest): Promise<ApiResponse<Lesson>> {
    const response = await axiosInstance.post<ApiResponse<Lesson>>("/lesson", data);
    return response.data;
  },

  /**
   * Update lesson (admin only)
   */
  async updateLesson(id: string, data: Partial<CreateLessonRequest>): Promise<ApiResponse<Lesson>> {
    const response = await axiosInstance.put<ApiResponse<Lesson>>(`/lesson/${id}`, data);
    return response.data;
  },

  /**
   * Delete lesson (admin only)
   */
  async deleteLesson(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/lesson/${id}`);
    return response.data;
  },
};
