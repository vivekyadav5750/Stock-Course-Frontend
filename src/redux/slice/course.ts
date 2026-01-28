import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { Course_Types } from "@/types";


type CourseState = {
  courses: Course_Types[];
  currentCourse: Course_Types | null;
  status: "idle" | "loading" | "success" | "failed";
  message: string;
  totalPages: number;
  currentPage: number;
};

type CreateCourseData = {
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  language?: string;
};

type UpdateCourseData = Partial<CreateCourseData>;

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  status: "idle",
  message: "",
  totalPages: 1,
  currentPage: 1,
};

// Helper to normalize course data
// const normalizeCourse = (course: any): Course_Types => {
//   if (!course) return course;
//   return {
//     ...course,
//     id: course._id || course.id,
//   };
// };

// admin
// Get all courses with pagination and filters
export const getAllCourses = createAsyncThunk(
  "course/getAll",
  async (params: { page?: number; limit?: number; search?: string; category?: string }, { rejectWithValue }) => {
    try {
      const { page = 0, limit = 10, search, category } = params;
      const queryParams = new URLSearchParams({
        // page: page.toString(),
        // limit: limit.toString(),
        // ...(search && { search }),
        ...(category && { category }),
      });

      const response = await axiosInstance.get(`/course/all?${queryParams.toString()}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch courses");
      }

      return {
        courses: response.data.data,
        totalPages: response.data.data.totalPages || 1,
        currentPage: response.data.data.currentPage || 1,
      };
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch courses");
      return rejectWithValue(message);
    }
  }
);

// only published courses for user/students /public use 
export const getCourse = createAsyncThunk(
  "course/get",
  async (params: { page?: number; limit?: number; search?: string; category?: string }, { rejectWithValue }) => {
    try {
      const { page = 0, limit = 10, search, category } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(category && { category }),
      });

      const response = await axiosInstance.get(`/course?${queryParams.toString()}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch courses");
      }

      return {
        courses: response.data.data,
        totalPages: response.data.data.totalPages || 1,
        currentPage: response.data.data.currentPage || 1,
      };
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch courses");
      return rejectWithValue(message);
    }
  }
);

// Get single course by ID
export const getCourseById = createAsyncThunk(
  "course/getById",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/course/${courseId}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch course");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch course");
      return rejectWithValue(message);
    }
  }
);

// Create new course (admin)
export const createCourse = createAsyncThunk(
  "course/create",
  async (data: CreateCourseData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/course", data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to create course");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create course");
      return rejectWithValue(message);
    }
  }
);

// Update course (admin)
export const updateCourse = createAsyncThunk(
  "course/update",
  async ({ courseId, data }: { courseId: string; data: UpdateCourseData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/course/${courseId}`, data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to update course");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update course");
      return rejectWithValue(message);
    }
  }
);

// Delete course (admin)
export const deleteCourse = createAsyncThunk(
  "course/delete",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/course/${courseId}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to delete course");
      }

      return courseId;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to delete course");
      return rejectWithValue(message);
    }
  }
);

// router.patch("/:id/publish", protect, allowRoles("admin", "superadmin"), togglePublishController);
export const togglePublishCourse = createAsyncThunk(
  "course/togglePublish",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/course/${courseId}/publish`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to toggle publish status");
      }
      return response.data.data?.course;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to toggle publish status");
      return rejectWithValue(message);
    }
  }
);

// Enroll in course
// export const enrollInCourse = createAsyncThunk(
//   "course/enroll",
//   async (courseId: string, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post(`/course/${courseId}/enroll`);

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to enroll in course");
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to enroll in course");
//       return rejectWithValue(message);
//     }
//   }
// );

// Get enrolled courses
// export const getEnrolledCourses = createAsyncThunk(
//   "course/getEnrolled",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get("/course/enrolled");

//       if (!response.data.success) {
//         return rejectWithValue(response.data.message || "Failed to fetch enrolled courses");
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message = getErrorMessage(error, "Failed to fetch enrolled courses");
//       return rejectWithValue(message);
//     }
//   }
// );

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    clearCourseError(state) {
      state.message = "";
      state.status = "idle";
    },
    clearCurrentCourse(state) {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Courses
      .addCase(getAllCourses.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getAllCourses.fulfilled, (state, action) => {
        state.status = "success";
        state.courses = action.payload.courses;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAllCourses.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // get published course
      .addCase(getCourse.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getCourse.fulfilled, (state, action) => {
        state.status = "success";
        state.courses = action.payload.courses;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getCourse.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Get Course By ID
      .addCase(getCourseById.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.status = "success";
        state.currentCourse = action.payload;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.status = "success";
        state.courses.unshift(action.payload);
        state.message = "Course created successfully";
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
        state.message = "Course updated successfully";
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.status = "success";
        state.courses = state.courses.filter(c => c._id !== action.payload);
        state.message = "Course deleted successfully";
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })

      // Toggle Publish Course
      .addCase(togglePublishCourse.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(togglePublishCourse.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.courses.findIndex(c => c._id === action.payload._id );
        console.log("index found:", index);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
        state.message = "Course publish status toggled successfully";
      })
      .addCase(togglePublishCourse.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      });

    // Enroll in Course
    // .addCase(enrollInCourse.pending, (state) => {
    //   state.status = "loading";
    //   state.message = "";
    // })
    // .addCase(enrollInCourse.fulfilled, (state, action) => {
    //   state.status = "success";
    //   state.message = "Successfully enrolled in course";
    // })
    // .addCase(enrollInCourse.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.message = action.payload as string;
    // })

    // // Get Enrolled Courses
    // .addCase(getEnrolledCourses.pending, (state) => {
    //   state.status = "loading";
    //   state.message = "";
    // })
    // .addCase(getEnrolledCourses.fulfilled, (state, action) => {
    //   state.status = "success";
    //   state.courses = action.payload;
    // })
    // .addCase(getEnrolledCourses.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.message = action.payload as string;
    // });
  },
});

export const courseReducer = courseSlice.reducer;
export const { clearCourseError, clearCurrentCourse } = courseSlice.actions;
