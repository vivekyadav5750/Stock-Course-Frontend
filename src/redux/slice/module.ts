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
  category?: string;
};

type ModuleState = {
  modules: Module[];
  currentModule: Module | null;
  status: "idle" | "loading" | "success" | "failed";
  message: string;
};

export type CreateModuleData = {
  title: string;
  description?: string;
  courseId: string;
  category?: string;
  order: number;
};

export type UpdateModuleData = Partial<Omit<CreateModuleData, 'courseId'>>;

const initialState: ModuleState = {
  modules: [],
  currentModule: null,
  status: "idle",
  message: "",
};

// admin
// Get all modules for a course
export const getAllModules = createAsyncThunk(
  "module/getAllModules",
  async (params: { page?: number, limit?: number, search?: string, category?: string, courseId?: string }, { rejectWithValue }) => {
    try {
      const { page = 0, limit = 10, search, category, courseId } = params;
      const queryParams = new URLSearchParams({
        // page: page.toString(),
        // limit: limit.toString(),
        // ...(search && { search }),
        ...(category && { category }),
        ...(courseId && { courseId }),
      });
      const response = await axiosInstance.get(`/module/all?${queryParams.toString()}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch modules");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch modules");
      return rejectWithValue(message);
    }
  }
);

// Get single module by ID
// export const getModuleById = createAsyncThunk(
//   "module/getById",
//   async (moduleId: string, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(`/modules/${moduleId}`);

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to fetch module");
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to fetch module");
//       return rejectWithValue(message);
//     }
//   }
// );

// Create new module (admin)
export const createModule = createAsyncThunk(
  "module/create",
  async (data: CreateModuleData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/module", data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to create module");
      }

      return response.data.data;
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
      const response = await axiosInstance.put(`/module/${moduleId}`, data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to update module");
      }

      return response.data.data;
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
      const response = await axiosInstance.delete(`/module/${moduleId}`);

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

// router.patch("/:id/publish", protect, allowRoles("admin", "superadmin"), togglePublishController);
export const togglePublishModule = createAsyncThunk(
  "module/togglePublish",
  async (moduleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/module/${moduleId}/publish`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to toggle publish status");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to toggle publish status");
      return rejectWithValue(message);
    }
  }
);

// Reorder modules
// export const reorderModules = createAsyncThunk(
//   "module/reorder",
//   async ({ courseId, moduleIds }: { courseId: string; moduleIds: string[] }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put(`/course/${courseId}/modules/reorder`, { moduleIds });

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to reorder modules");
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to reorder modules");
//       return rejectWithValue(message);
//     }
//   }
// );

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
      .addCase(getAllModules.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getAllModules.fulfilled, (state, action) => {
        state.status = "success";
        state.modules = action.payload;
      })
      .addCase(getAllModules.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // // Get Module By ID
      // .addCase(getModuleById.pending, (state) => {
      //   state.status = "loading";
      //   state.message = "";
      // })
      // .addCase(getModuleById.fulfilled, (state, action) => {
      //   state.status = "success";
      //   state.currentModule = action.payload;
      // })
      // .addCase(getModuleById.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.message = action.payload as string;
      // })

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

      // Toggle Publish Module
      .addCase(togglePublishModule.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(togglePublishModule.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.modules.findIndex(m => m.id === action.payload.id || m._id === action.payload._id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.currentModule?.id === action.payload.id) {
          state.currentModule = action.payload;
        }
        state.message = "Module publish status toggled successfully";
      })
      .addCase(togglePublishModule.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      });

    // // Reorder Modules
    // .addCase(reorderModules.pending, (state) => {
    //   state.status = "loading";
    //   state.message = "";
    // })
    // .addCase(reorderModules.fulfilled, (state, action) => {
    //   state.status = "success";
    //   state.modules = action.payload;
    //   state.message = "Modules reordered successfully";
    // })
    // .addCase(reorderModules.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.message = action.payload as string;
    // });
  },
});

export const moduleReducer = moduleSlice.reducer;
export const { clearModuleError, clearCurrentModule } = moduleSlice.actions;
