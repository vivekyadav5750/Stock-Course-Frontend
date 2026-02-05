import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllCourses } from "@/redux/slice/course";
import { getAllModules } from "@/redux/slice/module";
import { getAllLessons } from "@/redux/slice/lesson";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Course from "./Course";
import Module from "./Module";
import Lesson from "./Lesson";

const CourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { courses } = useAppSelector(
    (state) => state.course,
  );
  const { modules } = useAppSelector(
    (state) => state.module,
  );
  const { lessons } = useAppSelector(
    (state) => state.lesson,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState({
    category: user?.category && user?.category.length > 0 ? user.category[0] : "",
    courseId: null as string | null,
    moduleId: null as string | null,
  });


  // Check admin permission and set initial filters
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error("You do not have permission to access this page");
      navigate("/");
      return;
    }

    // Set initial category filter from user's first category
    if (user?.category && user?.category?.length > 0) {
      const firstCategory = user?.category[0];
      setFilter((prev) => ({
        ...prev,
        category: firstCategory,
      }));
    } else if (user) {
      // If user is loaded but has no categories, stop loading
      setIsLoading(false);
    }
  }, [user, navigate]);

  // Fetch all courses based on filter
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.isAdmin) return;

      try {
        setIsLoading(true);
        await dispatch(
          getAllCourses({
            category: filter.category || undefined,
          }),
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    if (filter.category) {
      fetchCourses();
    }
  }, [user?.isAdmin, filter.category, dispatch]);

  // Fetch all modules based on filter
  useEffect(() => {
    const fetchModules = async () => {
      if (!user?.isAdmin) return;

      try {
        await dispatch(
          getAllModules({
            courseId: filter.courseId || undefined,
            category: filter.category || undefined,
          }),
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching modules:", error);
        toast.error("Failed to load modules");
      }
    };

    if (filter.category) {
      fetchModules();
    }
  }, [user?.isAdmin, filter.courseId, filter.category, dispatch]);

  // Fetch all lessons based on filter
  useEffect(() => {
    const fetchLessons = async () => {
      if (!user?.isAdmin) return;

      try {
        await dispatch(
          getAllLessons({
            courseId: filter.courseId || undefined,
            moduleId: filter.moduleId || undefined,
            category: filter.category || undefined,
          }),
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching lessons:", error);
        toast.error("Failed to load lessons");
      }
    };

    if (filter.category) {
      fetchLessons();
    }
  }, [
    user?.isAdmin,
    filter.courseId,
    filter.moduleId,
    filter.category,
    dispatch,
  ]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Course Management</h1>
            <p className="text-muted-foreground">
              Create and manage your courses, modules, and lessons
            </p>
          </div>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 items-end">
            <div>
              <Label htmlFor="courseCategory">Filter by Category</Label>
              <Select
                value={filter.category}
                onValueChange={(value) =>
                  setFilter({ ...filter, category: value, courseId: null, moduleId: null })
                }
              >
                <SelectTrigger id="courseCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {user?.category?.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="moduleCourse">Filter by Course (Optional)</Label>
              <Select
                value={filter.courseId || "none"}
                onValueChange={(value) =>
                  setFilter({
                    ...filter,
                    courseId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="moduleCourse">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All courses</SelectItem>
                  {courses.map((course) => {
                    const courseId = course._id;
                    if (!courseId) return null;
                    return (
                      <SelectItem key={courseId} value={courseId}>
                        {course.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lessonModule">Filter by Module (Optional)</Label>
              <Select
                value={filter.moduleId || "none"}
                onValueChange={(value) =>
                  setFilter({
                    ...filter,
                    moduleId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="lessonModule">
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All modules</SelectItem>
                  {modules.map((module) => {
                    const moduleId = module._id;
                    if (!moduleId) return null;
                    return (
                      <SelectItem key={moduleId} value={moduleId}>
                        {module.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>



          {/* Tab 1 */}
          <TabsContent value="courses" className="mt-6">
            <Course courses={courses} filter={filter} setFilter={setFilter} />
          </TabsContent>

          {/* Tab 2 */}
          <TabsContent value="modules" className="mt-6">
            <Module modules={modules} courses={courses} filter={filter} />
          </TabsContent>

          {/* Tab 3 lesson */}
          <TabsContent value="lessons" className="mt-6">
            <Lesson lessons={lessons} modules={modules} courses={courses} filter={filter} />

          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default CourseManagement;
