import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  Module,
  CreateModuleRequest,
} from "./types";

export const moduleService = {
  /**
   * Get modules by course ID
   */
  async getModulesByCourse(courseId: string): Promise<ApiResponse<Module[]>> {
    const response = await axiosInstance.get<ApiResponse<Module[]>>(`/module/course/${courseId}`);
    return response.data;
  },

  /**
   * Get module by ID
   */
  async getModuleById(id: string): Promise<ApiResponse<Module>> {
    const response = await axiosInstance.get<ApiResponse<Module>>(`/module/${id}`);
    return response.data;
  },

  /**
   * Create new module (admin only)
   */
  async createModule(data: CreateModuleRequest): Promise<ApiResponse<Module>> {
    const response = await axiosInstance.post<ApiResponse<Module>>("/module", data);
    return response.data;
  },

  /**
   * Update module (admin only)
   */
  async updateModule(id: string, data: Partial<CreateModuleRequest>): Promise<ApiResponse<Module>> {
    const response = await axiosInstance.put<ApiResponse<Module>>(`/module/${id}`, data);
    return response.data;
  },

  /**
   * Delete module (admin only)
   */
  async deleteModule(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/module/${id}`);
    return response.data;
  },
};
