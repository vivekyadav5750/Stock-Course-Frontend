import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { Lesson_Types } from "@/types";

type LessonState = {
  lessons: Lesson_Types[];
  currentLesson: Lesson_Types | null;
  status: "idle" | "loading" | "success" | "failed";
  message: string;
};

export type UpdateLessonData = Partial<Omit<Lesson_Types, 'moduleId' | 'courseId'>>;

const initialState: LessonState = {
  lessons: [],
  currentLesson: null,
  status: "idle",
  message: "",
};

// admin 
// Get all lessons for a module
export const getAllLessons = createAsyncThunk(
  "lesson/getAllLessons",
  async (params: { page?: number, limit?: number, search?: string, category?: string, courseId?: string, moduleId: string }, { rejectWithValue }) => {
    try {
      const { page = 0, limit = 10, search, category, courseId, moduleId } = params;
      const queryParams = new URLSearchParams({
        // page: page.toString(),
        // limit: limit.toString(),
        // ...(search && { search }),
        ...(category && { category }),
        ...(courseId && { courseId }),
        ...(moduleId && { moduleId }),
      });
      const response = await axiosInstance.get(`/lesson/all?${queryParams.toString()}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch lessons");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch lessons");
      return rejectWithValue(message);
    }
  }
);

// Get single lesson by ID
// export const getLessonById = createAsyncThunk(
//   "lesson/getById",
//   async (lessonId: string, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(`/lessons/${lessonId}`);

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to fetch lesson");
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to fetch lesson");
//       return rejectWithValue(message);
//     }
//   }
// );

// Create new lesson (admin)
export const createLesson = createAsyncThunk(
  "lesson/create",
  async (data: Lesson_Types, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/lesson", data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to create lesson");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create lesson");
      return rejectWithValue(message);
    }
  }
);

// Update lesson (admin)
export const updateLesson = createAsyncThunk(
  "lesson/update",
  async ({ lessonId, data }: { lessonId: string; data: UpdateLessonData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/lesson/${lessonId}`, data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to update lesson");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update lesson");
      return rejectWithValue(message);
    }
  }
);

// Delete lesson (admin)
export const deleteLesson = createAsyncThunk(
  "lesson/delete",
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/lesson/${lessonId}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to delete lesson");
      }

      return lessonId;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to delete lesson");
      return rejectWithValue(message);
    }
  }
);

// router.patch("/:id/publish", protect, allowRoles("admin", "superadmin"), togglePublishController);
export const togglePublishLesson = createAsyncThunk(
  "lesson/togglePublish",
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/lesson/${lessonId}/publish`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to toggle publish status");
      }

      return response.data.data?.lesson;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to toggle publish status");
      return rejectWithValue(message);
    }
  }
);

// Mark lesson as completed
// export const markLessonComplete = createAsyncThunk(
//   "lesson/markComplete",
//   async (lessonId: string, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post(`/lessons/${lessonId}/complete`);

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to mark lesson as complete");
//       }

//       return lessonId;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to mark lesson as complete");
//       return rejectWithValue(message);
//     }
//   }
// );

// Get lesson progress
// export const getLessonProgress = createAsyncThunk(
//   "lesson/getProgress",
//   async (courseId: string, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(`/course/${courseId}/progress`);

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to fetch progress");
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to fetch progress");
//       return rejectWithValue(message);
//     }
//   }
// );

// Reorder lessons
// export const reorderLessons = createAsyncThunk(
//   "lesson/reorder",
//   async ({ moduleId, lessonIds }: { moduleId: string; lessonIds: string[] }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put(`/modules/${moduleId}/lessons/reorder`, { lessonIds });

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to reorder lessons");
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to reorder lessons");
//       return rejectWithValue(message);
//     }
//   }
// );

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    clearLessonError(state) {
      state.message = "";
      state.status = "idle";
    },
    clearCurrentLesson(state) {
      state.currentLesson = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Lessons
      .addCase(getAllLessons.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getAllLessons.fulfilled, (state, action) => {
        state.status = "success";
        state.lessons = action.payload;
      })
      .addCase(getAllLessons.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Get Lesson By ID
      // .addCase(getLessonById.pending, (state) => {
      //   state.status = "loading";
      //   state.message = "";
      // })
      // .addCase(getLessonById.fulfilled, (state, action) => {
      //   state.status = "success";
      //   state.currentLesson = action.payload;
      // })
      // .addCase(getLessonById.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.message = action.payload as string;
      // })

      // Create Lesson
      .addCase(createLesson.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        state.status = "success";
        state.lessons.push(action.payload);
        state.message = "Lesson created successfully";
      })
      .addCase(createLesson.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Update Lesson
      .addCase(updateLesson.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.lessons.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.lessons[index] = action.payload;
        }
        if (state.currentLesson?._id === action.payload._id) {
          state.currentLesson = action.payload;
        }
        state.message = "Lesson updated successfully";
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Delete Lesson
      .addCase(deleteLesson.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.status = "success";
        state.lessons = state.lessons.filter(l => l._id !== action.payload);
        if (state.currentLesson?._id === action.payload) {
          state.currentLesson = null;
        }
        state.message = "Lesson deleted successfully";
      })
      .addCase(deleteLesson.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Toggle Publish Lesson
      .addCase(togglePublishLesson.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(togglePublishLesson.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.lessons.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.lessons[index] = action.payload;
        }
        if (state.currentLesson?._id === action.payload._id) {
          state.currentLesson = action.payload;
        }
        state.message = "Lesson publish status toggled successfully";
      })
      .addCase(togglePublishLesson.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

    // Mark Lesson Complete
    // .addCase(markLessonComplete.pending, (state) => {
    //   state.status = "loading";
    //   state.message = "";
    // })
    // .addCase(markLessonComplete.fulfilled, (state, action) => {
    //   state.status = "success";
    //   state.message = "Lesson marked as complete";
    // })
    // .addCase(markLessonComplete.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.message = action.payload as string;
    // })

    // Get Lesson Progress
    // .addCase(getLessonProgress.pending, (state) => {
    //   state.status = "loading";
    //   state.message = "";
    // })
    // .addCase(getLessonProgress.fulfilled, (state, action) => {
    //   state.status = "success";
    // })
    // .addCase(getLessonProgress.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.message = action.payload as string;
    // })

    // Reorder Lessons
    // .addCase(reorderLessons.pending, (state) => {
    //   state.status = "loading";
    //   state.message = "";
    // })
    // .addCase(reorderLessons.fulfilled, (state, action) => {
    //   state.status = "success";
    //   state.lessons = action.payload;
    //   state.message = "Lessons reordered successfully";
    // })
    // .addCase(reorderLessons.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.message = action.payload as string;
    // });
  },
});

export const lessonReducer = lessonSlice.reducer;
export const { clearLessonError, clearCurrentLesson } = lessonSlice.actions;
