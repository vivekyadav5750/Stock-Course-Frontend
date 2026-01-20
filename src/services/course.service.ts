import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  Course,
  CreateCourseRequest,
} from "./types";

export const courseService = {
  /**
   * Get all published courses (public)
   */
  async getPublishedCourses(): Promise<ApiResponse<Course[]>> {
    const response = await axiosInstance.get<ApiResponse<Course[]>>("/api/course");
    return response.data;
  },

  /**
   * Get all courses including unpublished (admin only)
   */
  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    const response = await axiosInstance.get<ApiResponse<Course[]>>("/course/all");
    return response.data;
  },

  /**
   * Get course by ID
   */
  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const response = await axiosInstance.get<ApiResponse<Course>>(`/course/${id}`);
    return response.data;
  },

  /**
   * Create new course (admin only)
   */
  async createCourse(data: CreateCourseRequest): Promise<ApiResponse<Course>> {
    const response = await axiosInstance.post<ApiResponse<Course>>("/course", data);
    return response.data;
  },

  /**
   * Update course (admin only)
   */
  async updateCourse(id: string, data: Partial<CreateCourseRequest>): Promise<ApiResponse<Course>> {
    const response = await axiosInstance.put<ApiResponse<Course>>(`/course/${id}`, data);
    return response.data;
  },

  /**
   * Delete course (admin only)
   */
  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/course/${id}`);
    return response.data;
  },

  /**
   * Toggle course publish status (admin only)
   */
  async togglePublish(id: string): Promise<ApiResponse<Course>> {
    const response = await axiosInstance.patch<ApiResponse<Course>>(`/course/${id}/publish`);
    return response.data;
  },
};
