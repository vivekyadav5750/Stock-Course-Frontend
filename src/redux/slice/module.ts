import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";

export type Module = {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  lessons?: string[];
  duration?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ModuleState = {
  modules: Module[];
  currentModule: Module | null;
  status: "idle" | "loading" | "success" | "failed";
  message: string;
};

type CreateModuleData = {
  title: string;
  description?: string;
  courseId: string;
  order: number;
};

type UpdateModuleData = Partial<Omit<CreateModuleData, 'courseId'>>;

const initialState: ModuleState = {
  modules: [],
  currentModule: null,
  status: "idle",
  message: "",
};

// Helper to normalize module data
const normalizeModule = (module: any): Module => {
  if (!module) return module;
  return {
    ...module,
    id: module._id || module.id,
  };
};

// Get all modules for a course
export const getModulesByCourse = createAsyncThunk(
  "module/getByCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/modules`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch modules");
      }

      return response.data.data.map(normalizeModule);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch modules");
      return rejectWithValue(message);
    }
  }
);

// Get single module by ID
export const getModuleById = createAsyncThunk(
  "module/getById",
  async (moduleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/modules/${moduleId}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch module");
      }

      return normalizeModule(response.data.data);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch module");
      return rejectWithValue(message);
    }
  }
);

// Create new module (admin)
export const createModule = createAsyncThunk(
  "module/create",
  async (data: CreateModuleData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/modules", data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to create module");
      }

      return normalizeModule(response.data.data);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create module");
      return rejectWithValue(message);
    }
  }
);

// Update module (admin)
export const updateModule = createAsyncThunk(
  "module/update",
  async ({ moduleId, data }: { moduleId: string; data: UpdateModuleData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/modules/${moduleId}`, data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to update module");
      }

      return normalizeModule(response.data.data);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update module");
      return rejectWithValue(message);
    }
  }
);

// Delete module (admin)
export const deleteModule = createAsyncThunk(
  "module/delete",
  async (moduleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/modules/${moduleId}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to delete module");
      }

      return moduleId;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to delete module");
      return rejectWithValue(message);
    }
  }
);

// Reorder modules
export const reorderModules = createAsyncThunk(
  "module/reorder",
  async ({ courseId, moduleIds }: { courseId: string; moduleIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/modules/reorder`, { moduleIds });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to reorder modules");
      }

      return response.data.data.map(normalizeModule);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to reorder modules");
      return rejectWithValue(message);
    }
  }
);

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    clearModuleError(state) {
      state.message = "";
      state.status = "idle";
    },
    clearCurrentModule(state) {
      state.currentModule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Modules By Course
      .addCase(getModulesByCourse.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getModulesByCourse.fulfilled, (state, action) => {
        state.status = "success";
        state.modules = action.payload;
      })
      .addCase(getModulesByCourse.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Get Module By ID
      .addCase(getModuleById.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getModuleById.fulfilled, (state, action) => {
        state.status = "success";
        state.currentModule = action.payload;
      })
      .addCase(getModuleById.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Create Module
      .addCase(createModule.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.status = "success";
        state.modules.push(action.payload);
        state.message = "Module created successfully";
      })
      .addCase(createModule.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Update Module
      .addCase(updateModule.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.modules.findIndex(m => m.id === action.payload.id || m._id === action.payload._id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.currentModule?.id === action.payload.id) {
          state.currentModule = action.payload;
        }
        state.message = "Module updated successfully";
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Delete Module
      .addCase(deleteModule.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.status = "success";
        state.modules = state.modules.filter(m => m.id !== action.payload && m._id !== action.payload);
        state.message = "Module deleted successfully";
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Reorder Modules
      .addCase(reorderModules.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(reorderModules.fulfilled, (state, action) => {
        state.status = "success";
        state.modules = action.payload;
        state.message = "Modules reordered successfully";
      })
      .addCase(reorderModules.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      });
  },
});

export const moduleReducer = moduleSlice.reducer;
export const { clearModuleError, clearCurrentModule } = moduleSlice.actions;
