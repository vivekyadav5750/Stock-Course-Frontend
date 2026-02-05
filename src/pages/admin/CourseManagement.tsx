import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
} from "@/redux/slice/course";
import {
  getAllModules,
  createModule,
  updateModule,
  deleteModule,
  togglePublishModule,
} from "@/redux/slice/module";
import {
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  togglePublishLesson,
} from "@/redux/slice/lesson";
import { CONTENT_TYPES, Course_Types } from "@/types";
import { CourseForm } from "@/components/CourseForm";
import { ModuleForm } from "@/components/ModuleForm";
import { LessonForm } from "@/components/LessonForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Video,
  FileText,
} from "lucide-react";

const CourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { courses, status: courseStatus } = useAppSelector(
    (state) => state.course,
  );
  const { modules, status: moduleStatus } = useAppSelector(
    (state) => state.module,
  );
  const { lessons, status: lessonStatus } = useAppSelector(
    (state) => state.lesson,
  );

  // Local state
  const [selectedCourse, setSelectedCourse] = useState<Course_Types | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [newCourseDialog, setNewCourseDialog] = useState(false);
  const [editCourseDialog, setEditCourseDialog] = useState(false);
  const [newModuleDialog, setNewModuleDialog] = useState(false);
  const [editModuleDialog, setEditModuleDialog] = useState(false);
  const [newLessonDialog, setNewLessonDialog] = useState(false);
  const [editLessonDialog, setEditLessonDialog] = useState(false);

  // Filter states
  const [courseFilter, setCourseFilter] = useState({ category: "" });
  const [moduleFilter, setModuleFilter] = useState({
    courseId: "",
    category: "",
  });
  const [lessonFilter, setLessonFilter] = useState({
    courseId: "",
    moduleId: "",
    category: "",
  });

  // Form states for course
  const [courseForm, setCourseForm] = useState<any>({
    title: "",
    description: "",
    category: "",
    level: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    price: "",
    duration: 0,
    thumbnail: "",
  });

  // Form states for module
  const [moduleForm, setModuleForm] = useState<any>({
    title: "",
    description: "",
    category: "",
    courseId: "",
    order: "",
  });

  // Form states for lesson
  const [lessonForm, setLessonForm] = useState<any>({
    moduleId: "",
    courseId: "",
    title: "",
    description: "",
    category: "",
    contentType: "video" as "video" | "pdf" | "text",
    videoUrl: "",
    pdfUrl: "",
    textContent: "",
    duration: 0,
    order: 0,
    isPreview: false,
    resources: [] as { title: string; url: string; type: string }[],
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
      setCourseFilter({ category: firstCategory });
      setModuleFilter({ courseId: "", category: firstCategory });
      setLessonFilter({ courseId: "", moduleId: "", category: firstCategory });
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
            category: courseFilter.category || undefined,
          }),
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseFilter.category) {
      fetchCourses();
    }
  }, [user?.isAdmin, courseFilter.category, dispatch]);

  // Fetch all modules based on filter
  useEffect(() => {
    const fetchModules = async () => {
      if (!user?.isAdmin) return;

      try {
        await dispatch(
          getAllModules({
            courseId: moduleFilter.courseId || undefined,
            category: moduleFilter.category || undefined,
          }),
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching modules:", error);
        toast.error("Failed to load modules");
      }
    };

    if (moduleFilter.category) {
      fetchModules();
    }
  }, [user?.isAdmin, moduleFilter.courseId, moduleFilter.category, dispatch]);

  // Fetch all lessons based on filter
  useEffect(() => {
    const fetchLessons = async () => {
      if (!user?.isAdmin) return;

      try {
        await dispatch(
          getAllLessons({
            courseId: lessonFilter.courseId || undefined,
            moduleId: lessonFilter.moduleId || undefined,
            category: lessonFilter.category || undefined,
          }),
        ).unwrap();
      } catch (error: any) {
        console.error("Error fetching lessons:", error);
        toast.error("Failed to load lessons");
      }
    };

    if (lessonFilter.category) {
      fetchLessons();
    }
  }, [
    user?.isAdmin,
    lessonFilter.courseId,
    lessonFilter.moduleId,
    lessonFilter.category,
    dispatch,
  ]);

  //Handle selected course

  const handleCourseSelect = (course: Course_Types) => {
    const courseId = course._id;

    if (!courseId) return;

    setSelectedCourse(course);

    setModuleFilter((prev) => ({
      ...prev,
      courseId,
    }));

    setLessonFilter((prev) => ({
      ...prev,
      courseId,
      moduleId: "",
    }));
  };

  // Handle create course
  const handleCreateCourse = async (formData: any) => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await dispatch(
        createCourse({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          level: formData.level,
          price: parseFloat(formData.price) || 0,
          thumbnail: formData.thumbnail,
        }),
      ).unwrap();

      setNewCourseDialog(false);
      resetCourseForm();
      toast.success("Course created successfully");
    } catch (error: any) {
      toast.error(error || "Failed to create course");
    }
  };

  // Handle update course
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) return;

    try {
      const courseId = selectedCourse._id;
      if (!courseId) return;

      const updatedCourse = await dispatch(
        updateCourse({
          courseId: courseId,
          data: {
            title: courseForm.title,
            description: courseForm.description,
            category: courseForm.category,
            level: courseForm.level,
            price: parseFloat(courseForm.price) || 0,
            thumbnail: courseForm.thumbnail,
          },
        }),
      ).unwrap();

      setEditCourseDialog(false);
      setSelectedCourse(updatedCourse);
      toast.success("Course updated successfully");
    } catch (error: any) {
      toast.error(error || "Failed to update course");
    }
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await dispatch(deleteCourse(courseId)).unwrap();
      if (selectedCourse?._id === courseId) {
        setSelectedCourse(null);
      }
      toast.success("Course deleted successfully");
    } catch (error: any) {
      toast.error(error || "Failed to delete course");
    }
  };

  // Handle toggle publish course
  const handleTogglePublishCourse = async (courseId: string) => {
    try {
      await dispatch(togglePublishCourse(courseId)).unwrap();
      toast.success("Course publish status toggled successfully");
    } catch (error: any) {
      toast.error(error || "Failed to toggle publish status");
    }
  };

  // Handle create module
  const handleCreateModule = async (formData: any) => {
    if (!formData.title || !formData.category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const courseId = formData.courseId;
      if (!courseId) {
        toast.error("Please select a course");
        return;
      }

      await dispatch(
        createModule({
          courseId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          order: parseInt(formData.order) || modules.length + 1,
        }),
      ).unwrap();

      setNewModuleDialog(false);
      resetModuleForm();
      toast.success("Module created successfully");
    } catch (error: any) {
      toast.error(error || "Failed to create module");
    }
  };

  // Handle update module
  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moduleForm.title || !moduleForm.category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const moduleId = moduleForm._id;
      if (!moduleId) return;

      await dispatch(
        updateModule({
          moduleId,
          data: {
            title: moduleForm.title,
            description: moduleForm.description,
            category: moduleForm.category,
            order: parseInt(moduleForm.order),
          },
        }),
      ).unwrap();

      setEditModuleDialog(false);
      resetModuleForm();
      toast.success("Module updated successfully");
    } catch (error: any) {
      toast.error(error || "Failed to update module");
    }
  };

  // Handle delete module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      await dispatch(deleteModule(moduleId)).unwrap();
      toast.success("Module deleted successfully");
    } catch (error: any) {
      toast.error(error || "Failed to delete module");
    }
  };

  // Handle toggle publish module
  const handleTogglePublishModule = async (moduleId: string) => {
    try {
      await dispatch(togglePublishModule(moduleId)).unwrap();
      toast.success("Module publish status toggled successfully");
    } catch (error: any) {
      toast.error(error || "Failed to toggle publish status");
    }
  };

  // Handle create lesson
  const handleCreateLesson = async (formData: any) => {
    console.log("Creating lesson with data:", formData);

    if (
      !formData.moduleId ||
      !formData.courseId ||
      !formData.title ||
      !formData.category
    ) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await dispatch(
        createLesson({
          moduleId: formData.moduleId,
          courseId: formData.courseId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          contentType: formData.contentType,
          videoUrl: formData.videoUrl,
          pdfUrl: formData.pdfUrl,
          textContent: formData.textContent,
          order: parseInt(formData.order) || 1,
          isPreview: formData.isPreview,
        }),
      ).unwrap();

      setNewLessonDialog(false);
      resetLessonForm();
      toast.success("Lesson created successfully");
    } catch (error: any) {
      toast.error(error || "Failed to create lesson");
    }
  };

  // Handle update lesson
  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonForm.title || !lessonForm.category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const lessonId = lessonForm._id;
      if (!lessonId) return;

      await dispatch(
        updateLesson({
          lessonId,
          data: {
            title: lessonForm.title,
            description: lessonForm.description,
            contentType: lessonForm.contentType,
            videoUrl: lessonForm.videoUrl,
            pdfUrl: lessonForm.pdfUrl,
            textContent: lessonForm.textContent,
            order: lessonForm.order,
            isPreview: lessonForm.isPreview,
          },
        }),
      ).unwrap();

      setEditLessonDialog(false);
      resetLessonForm();
      toast.success("Lesson updated successfully");
    } catch (error: any) {
      toast.error(error || "Failed to update lesson");
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await dispatch(deleteLesson(lessonId)).unwrap();
      toast.success("Lesson deleted successfully");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to delete lesson";
      toast.error(message);
    }
  };

  // Handle toggle publish lesson
  const handleTogglePublishLesson = async (lessonId: string) => {
    try {
      await dispatch(togglePublishLesson(lessonId)).unwrap();
      toast.success("Lesson publish status toggled successfully");
    } catch (error: any) {
      toast.error(error || "Failed to toggle publish status");
    }
  };

  // Reset form functions
  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      level: "Beginner",
      price: "",
      duration: 0,
      thumbnail: "",
    });
  };

  const resetModuleForm = () => {
    setModuleForm({
      title: "",
      description: "",
      category: "",
      courseId: "",
      order: "",
    });
  };

  const resetLessonForm = () => {
    setLessonForm({
      moduleId: "",
      courseId: "",
      title: "",
      description: "",
      category: "",
      contentType: "video",
      videoUrl: "",
      pdfUrl: "",
      textContent: "",
      duration: 0,
      order: 0,
      isPreview: false,
      resources: [],
    });
  };

  // Open edit dialogs
  const openEditCourseDialog = (course: Course_Types) => {
    setCourseForm({
      ...courseForm,
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category || "",
      level: course.level || "Beginner",
      price: course.price.toString(),
      duration: course.duration || 0,
      thumbnail: course.thumbnail || "",
    });
    setEditCourseDialog(true);
  };

  const openEditModuleDialog = (module: any) => {
    setModuleForm({
      _id: module._id || module.id,
      courseId: module.courseId,
      title: module.title,
      description: module.description || "",
      category: module.category || "",
      order: module.order?.toString() || "",
    });
    setEditModuleDialog(true);
  };

  const openEditLessonDialog = (lesson: any) => {
    setLessonForm({
      _id: lesson._id || lesson.id,
      moduleId: lesson.moduleId,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description || "",
      category: lesson.category || "",
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl || "",
      pdfUrl: lesson.pdfUrl || "",
      textContent: lesson.textContent || "",
      duration: lesson.duration || 0,
      order: lesson.order || 0,
      isPreview: lesson.isPreview || false,
      resources: lesson.resources || [],
    });
    setEditLessonDialog(true);
  };

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Course Management</h1>
            <p className="text-muted-foreground">
              Create and manage your courses, modules, and lessons
            </p>
          </div>
          <Dialog open={newCourseDialog} onOpenChange={setNewCourseDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your platform
                </DialogDescription>
              </DialogHeader>
              <CourseForm
                userCategories={user?.category || []}
                onSubmit={handleCreateCourse}
                onCancel={() => {
                  setNewCourseDialog(false);
                  resetCourseForm();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            {selectedCourse && (
              <>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            {/* Category Filter */}
            <div className="mb-6 flex gap-4 items-end">
              <div className="w-64">
                <Label htmlFor="courseCategory">Filter by Category</Label>
                <Select
                  value={courseFilter.category}
                  onValueChange={(value) =>
                    setCourseFilter({ category: value })
                  }
                >
                  <SelectTrigger id="courseCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.category &&
                      user?.category?.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {courses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No courses yet. Create your first course to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const courseId = course._id;
                  const selectedId = selectedCourse?._id;
                  return (
                    <motion.div
                      key={courseId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${selectedId === courseId ? "ring-2 ring-primary" : ""
                          }`}
                        onClick={() => handleCourseSelect(course)}
                      >
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-40 object-cover rounded-t-lg"
                          />
                        )}
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {course.title}
                            </CardTitle>
                            <Badge
                              variant={
                                course.isPublished ? "default" : "secondary"
                              }
                            >
                              {course.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant="outline">{course.level}</Badge>
                            <span className="font-semibold">
                              ${course.price}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditCourseDialog(course);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (courseId) handleTogglePublishCourse(courseId);
                            }}
                          >
                            {course.isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (courseId) handleDeleteCourse(courseId);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {selectedCourse && (
            <>
              <TabsContent value="modules" className="mt-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      Modules for {selectedCourse.title}
                    </h2>
                    <Dialog
                      open={newModuleDialog}
                      onOpenChange={(open) => {
                        setNewModuleDialog(open);

                        if (open && selectedCourse) {
                          const courseId = selectedCourse._id;

                          setModuleForm((prev) => ({
                            ...prev,
                            courseId,
                            category: selectedCourse.category || "",
                          }));
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          New Module
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Module</DialogTitle>
                        </DialogHeader>
                        <ModuleForm
                          module={null}
                          courses={courses}
                          selectedCourse={selectedCourse}
                          userCategories={user?.category || []}
                          modulesCount={modules.length}
                          onSubmit={handleCreateModule}
                          onCancel={() => {
                            setNewModuleDialog(false);
                            resetModuleForm();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Module Filters */}
                  <div className="flex gap-4 items-end">
                    <div className="w-64">
                      <Label htmlFor="moduleCourse">
                        Filter by Course (Optional)
                      </Label>
                      <Select
                        value={moduleFilter.courseId || "none"}
                        onValueChange={(value) =>
                          setModuleFilter({
                            ...moduleFilter,
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
                    <div className="w-64">
                      <Label htmlFor="moduleCategory">Filter by Category</Label>
                      <Select
                        value={moduleFilter.category}
                        onValueChange={(value) =>
                          setModuleFilter({ ...moduleFilter, category: value })
                        }
                      >
                        <SelectTrigger id="moduleCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {user?.category &&
                            user?.category?.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Edit Module Dialog */}
                <Dialog
                  open={editModuleDialog}
                  onOpenChange={setEditModuleDialog}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Module</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateModule}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="editModuleTitle">Title *</Label>
                          <Input
                            id="editModuleTitle"
                            value={moduleForm.title}
                            onChange={(e) =>
                              setModuleForm({
                                ...moduleForm,
                                title: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="editModuleDescription">
                            Description
                          </Label>
                          <Textarea
                            id="editModuleDescription"
                            value={moduleForm.description}
                            onChange={(e) =>
                              setModuleForm({
                                ...moduleForm,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editModuleCategory">Category *</Label>
                          <Select
                            value={moduleForm.category}
                            onValueChange={(value) =>
                              setModuleForm({ ...moduleForm, category: value })
                            }
                          >
                            <SelectTrigger id="editModuleCategory">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {user?.category &&
                                user?.category?.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="editModuleCourseId">Course *</Label>
                          <Select
                            value={moduleForm.courseId}
                            onValueChange={(value) =>
                              setModuleForm({ ...moduleForm, courseId: value })
                            }
                          >
                            <SelectTrigger id="editModuleCourseId">
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses
                                .filter(
                                  (course) =>
                                    !moduleForm.category ||
                                    course.category === moduleForm.category,
                                )
                                .map((course) => {
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
                          <Label htmlFor="editModuleOrder">Order</Label>
                          <Input
                            id="editModuleOrder"
                            type="number"
                            value={moduleForm.order}
                            onChange={(e) =>
                              setModuleForm({
                                ...moduleForm,
                                order: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditModuleDialog(false);
                            resetModuleForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Update Module</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {modules.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        No modules yet. Create a module to organize your
                        lessons.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {[...modules]
                      .sort((a, b) => a.order - b.order)
                      .map((module, index) => {
                        const moduleId = module._id;
                        return (
                          <Card key={moduleId}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">
                                    Module {module.order}: {module.title}
                                  </CardTitle>
                                  {module.description && (
                                    <CardDescription className="mt-2">
                                      {module.description}
                                    </CardDescription>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      variant={
                                        module.isPublished
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {module.isPublished
                                        ? "Published"
                                        : "Draft"}
                                    </Badge>
                                    {module.category && (
                                      <Badge variant="outline">
                                        {module.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditModuleDialog(module)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      moduleId &&
                                      handleTogglePublishModule(moduleId)
                                    }
                                  >
                                    {module.isPublished ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      moduleId && handleDeleteModule(moduleId)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lessons" className="mt-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      Lessons for {selectedCourse.title}
                    </h2>
                    <Dialog
                      open={newLessonDialog}
                      onOpenChange={setNewLessonDialog}
                    >
                      <DialogTrigger asChild>
                        <Button disabled={modules.length === 0}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Lesson
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Lesson</DialogTitle>
                        </DialogHeader>
                        <LessonForm
                          modules={modules}
                          courses={courses}
                          userCategories={user?.category || []}
                          lessonsCount={lessons.length}
                          onSubmit={handleCreateLesson}
                          onCancel={() => {
                            setNewLessonDialog(false);
                            resetLessonForm();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Lesson Filters */}
                <div className="flex gap-4 items-end mb-6">
                  <div className="w-64">
                    <Label htmlFor="lessonCourse">
                      Filter by Course (Optional)
                    </Label>
                    <Select
                      value={lessonFilter.courseId || "none"}
                      onValueChange={(value) =>
                        setLessonFilter({
                          ...lessonFilter,
                          courseId: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger id="lessonCourse">
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
                  <div className="w-64">
                    <Label htmlFor="lessonModule">
                      Filter by Module (Optional)
                    </Label>
                    <Select
                      value={lessonFilter.moduleId || "none"}
                      onValueChange={(value) =>
                        setLessonFilter({
                          ...lessonFilter,
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
                  <div className="w-64">
                    <Label htmlFor="lessonCategory">Filter by Category</Label>
                    <Select
                      value={lessonFilter.category}
                      onValueChange={(value) =>
                        setLessonFilter({ ...lessonFilter, category: value })
                      }
                    >
                      <SelectTrigger id="lessonCategory">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.category &&
                          user?.category?.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {modules.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        Create modules first before adding lessons.
                      </p>
                    </CardContent>
                  </Card>
                ) : lessons.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        No lessons yet. Create a lesson to add content.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {[...lessons]
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const lessonId = lesson._id;
                        return (
                          <Card key={lessonId}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    {lesson.title}
                                  </CardTitle>
                                  <CardDescription className="mt-2">
                                    {lesson.description}
                                  </CardDescription>
                                  <div className="flex items-center gap-2 mt-2">
                                    {lesson.duration && (
                                      <span className="text-sm text-muted-foreground">
                                        Duration: {lesson.duration} min
                                      </span>
                                    )}
                                    {lesson.isPreview && (
                                      <Badge variant="outline">Preview</Badge>
                                    )}
                                    <Badge
                                      variant={
                                        lesson.isPublished
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {lesson.isPublished
                                        ? "Published"
                                        : "Draft"}
                                    </Badge>
                                    {lesson.category && (
                                      <Badge variant="outline">
                                        {lesson.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditLessonDialog(lesson)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      lesson._id &&
                                      handleTogglePublishLesson(lesson._id)
                                    }
                                  >
                                    {lesson.isPublished ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      lesson._id && handleDeleteLesson(lesson._id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Edit Course Dialog */}
        <Dialog open={editCourseDialog} onOpenChange={setEditCourseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCourse}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editTitle">Title *</Label>
                  <Input
                    id="editTitle"
                    value={courseForm.title}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description *</Label>
                  <Textarea
                    id="editDescription"
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editCategory">Category *</Label>
                    <Select
                      value={courseForm.category}
                      onValueChange={(value) =>
                        setCourseForm({ ...courseForm, category: value })
                      }
                    >
                      <SelectTrigger id="editCategory">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.category &&
                          user?.category?.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editLevel">Level</Label>
                    <Select
                      value={courseForm.level}
                      onValueChange={(value: any) =>
                        setCourseForm({ ...courseForm, level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPrice">Price ($)</Label>
                    <Input
                      id="editPrice"
                      type="number"
                      step="0.01"
                      value={courseForm.price}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, price: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editThumbnail">Thumbnail URL</Label>
                  <Input
                    id="editThumbnail"
                    type="url"
                    value={courseForm.thumbnail}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        thumbnail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditCourseDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Course</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Lesson Dialog */}
        <Dialog open={editLessonDialog} onOpenChange={setEditLessonDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lesson</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateLesson}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editLessonTitle">Title *</Label>
                  <Input
                    id="editLessonTitle"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editLessonDescription">Description</Label>
                  <Textarea
                    id="editLessonDescription"
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="editLessonCategory">Category *</Label>
                  <Select
                    value={lessonForm.category}
                    onValueChange={(value) =>
                      setLessonForm({ ...lessonForm, category: value })
                    }
                  >
                    <SelectTrigger id="editLessonCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {user?.category &&
                        user?.category?.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editContentType">Content Type *</Label>
                  <Select
                    value={lessonForm.contentType}
                    onValueChange={(value: any) =>
                      setLessonForm({ ...lessonForm, contentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CONTENT_TYPES.VIDEO}>Video</SelectItem>
                      <SelectItem value={CONTENT_TYPES.PDF}>PDF</SelectItem>
                      <SelectItem value={CONTENT_TYPES.TEXT}>Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {lessonForm.contentType === CONTENT_TYPES.VIDEO && (
                  <div>
                    <Label htmlFor="editVideoUrl">Video URL *</Label>
                    <Input
                      id="editVideoUrl"
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          videoUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      required
                    />
                  </div>
                )}
                {lessonForm.contentType === CONTENT_TYPES.PDF && (
                  <div>
                    <Label htmlFor="editPdfUrl">PDF URL *</Label>
                    <Input
                      id="editPdfUrl"
                      type="url"
                      value={lessonForm.pdfUrl}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          pdfUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      required
                    />
                  </div>
                )}
                {lessonForm.contentType === CONTENT_TYPES.TEXT && (
                  <div>
                    <Label htmlFor="editTextContent">Text Content *</Label>
                    <Textarea
                      id="editTextContent"
                      value={lessonForm.textContent}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          textContent: e.target.value,
                        })
                      }
                      rows={6}
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="editOrder">Order</Label>
                  <Input
                    id="editOrder"
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsPreview"
                    checked={lessonForm.isPreview}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        isPreview: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="editIsPreview">Allow as preview (free)</Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditLessonDialog(false);
                    resetLessonForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Lesson</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseManagement;
