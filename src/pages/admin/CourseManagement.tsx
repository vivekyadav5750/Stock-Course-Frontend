import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '@/redux/slice/course';
import { getModulesByCourse, createModule, updateModule, deleteModule, reorderModules } from '@/redux/slice/module';
import { getLessonsByModule, createLesson, updateLesson, deleteLesson, reorderLessons } from '@/redux/slice/lesson';
import type { Course } from '@/redux/slice/course';
import type { Module } from '@/redux/slice/module';
import type { Lesson } from '@/redux/slice/lesson';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Video,
  FileText,
} from 'lucide-react';

const CourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { courses, status: courseStatus } = useAppSelector((state) => state.course);
  const { modules, status: moduleStatus } = useAppSelector((state) => state.module);
  const { lessons, status: lessonStatus } = useAppSelector((state) => state.lesson);

  // Local state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [newCourseDialog, setNewCourseDialog] = useState(false);
  const [editCourseDialog, setEditCourseDialog] = useState(false);
  const [newModuleDialog, setNewModuleDialog] = useState(false);
  const [newLessonDialog, setNewLessonDialog] = useState(false);

  // Form states for course
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: '',
    duration: 0,
    thumbnail: '',
  });

  // Form states for module
  const [moduleForm, setModuleForm] = useState({
    title: '',
    order: '',
  });

  // Form states for lesson
  const [lessonForm, setLessonForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    order: 0,
    isFree: false,
    resources: [] as { title: string; url: string; type: string }[],
  });

  // Check admin permission
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        await dispatch(getAllCourses({})).unwrap();
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchCourses();
    }
  }, [user, dispatch]);

  // Fetch modules when a course is selected
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedCourse) return;

      try {
        const courseId = selectedCourse.id || selectedCourse._id;
        if (courseId) {
          await dispatch(getModulesByCourse(courseId)).unwrap();
        }
      } catch (error: any) {
        console.error('Error fetching modules:', error);
        toast.error('Failed to load modules');
      }
    };

    fetchModules();
  }, [selectedCourse, dispatch]);

  // Handle create course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title || !courseForm.description) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await dispatch(createCourse({
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        level: courseForm.level,
        price: parseFloat(courseForm.price) || 0,
        thumbnail: courseForm.thumbnail,
      })).unwrap();

      setNewCourseDialog(false);
      resetCourseForm();
      toast.success('Course created successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to create course');
    }
  };

  // Handle update course
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) return;

    try {
      const courseId = selectedCourse.id || selectedCourse._id;
      if (!courseId) return;

      const updatedCourse = await dispatch(updateCourse({
        courseId: courseId,
        data: {
          title: courseForm.title,
          description: courseForm.description,
          category: courseForm.category,
          level: courseForm.level,
          price: parseFloat(courseForm.price) || 0,
          thumbnail: courseForm.thumbnail,
        },
      })).unwrap();

      setEditCourseDialog(false);
      setSelectedCourse(updatedCourse);
      toast.success('Course updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update course');
    }
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await dispatch(deleteCourse(courseId)).unwrap();
      if (selectedCourse?.id === courseId || selectedCourse?._id === courseId) {
        setSelectedCourse(null);
      }
      toast.success('Course deleted successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to delete course');
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (courseId: string) => {
    // Note: Toggle publish endpoint needs to be added to Redux slice
    toast.info('Toggle publish feature needs to be implemented in Redux');
  };

  // Handle create module
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !moduleForm.title) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const courseId = selectedCourse.id || selectedCourse._id;
      if (!courseId) return;

      await dispatch(createModule({
        courseId,
        title: moduleForm.title,
        description: '',
        order: parseInt(moduleForm.order) || modules.length + 1,
      })).unwrap();

      setNewModuleDialog(false);
      resetModuleForm();
      toast.success('Module created successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to create module');
    }
  };

  // Handle delete module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      await dispatch(deleteModule(moduleId)).unwrap();
      toast.success('Module deleted successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to delete module');
    }
  };

  // Handle create lesson
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !lessonForm.moduleId || !lessonForm.title) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const courseId = selectedCourse.id || selectedCourse._id;
      if (!courseId) return;

      await dispatch(createLesson({
        moduleId: lessonForm.moduleId,
        courseId,
        title: lessonForm.title,
        description: lessonForm.description,
        videoUrl: lessonForm.videoUrl,
        order: lessonForm.order || 1,
        isFree: lessonForm.isFree,
      })).unwrap();

      // Refresh lessons for the selected module
      await dispatch(getLessonsByModule(lessonForm.moduleId)).unwrap();

      setNewLessonDialog(false);
      resetLessonForm();
      toast.success('Lesson created successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to create lesson');
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await dispatch(deleteLesson(lessonId)).unwrap();
      toast.success('Lesson deleted successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete lesson';
      toast.error(message);
    }
  };

  // Reset form functions
  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      price: '',
      duration: 0,
      thumbnail: '',
    });
  };

  const resetModuleForm = () => {
    setModuleForm({
      title: '',
      order: '',
    });
  };

  const resetLessonForm = () => {
    setLessonForm({
      moduleId: '',
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: 0,
      isFree: false,
      resources: [],
    });
  };

  // Open edit dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price.toString(),
      duration: course.duration || 0,
      thumbnail: course.thumbnail || '',
    });
    setEditCourseDialog(true);
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
              <form onSubmit={handleCreateCourse}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={courseForm.title}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
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
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={courseForm.category}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            category: e.target.value,
                          })
                        }
                        placeholder="e.g., Stock Market, Trading"
                      />
                    </div>
                    <div>
                      <Label htmlFor="level">Level</Label>
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
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={courseForm.price}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, price: e.target.value })
                        }
                        placeholder="99.99"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      type="url"
                      value={courseForm.thumbnail}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          thumbnail: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNewCourseDialog(false);
                      resetCourseForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Course</Button>
                </DialogFooter>
              </form>
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
                  const courseId = course.id || course._id;
                  const selectedId = selectedCourse?.id || selectedCourse?._id;
                  return (
                  <motion.div
                    key={courseId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedId === courseId
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedCourse(course)}
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
                            variant={course.isPublished ? 'default' : 'secondary'}
                          >
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{course.level}</Badge>
                          <span className="font-semibold">${course.price}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(course);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (courseId) handleTogglePublish(courseId);
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
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Modules for {selectedCourse.title}
                  </h2>
                  <Dialog
                    open={newModuleDialog}
                    onOpenChange={setNewModuleDialog}
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
                      <form onSubmit={handleCreateModule}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="moduleTitle">Title *</Label>
                            <Input
                              id="moduleTitle"
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
                            <Label htmlFor="moduleOrder">Order</Label>
                            <Input
                              id="moduleOrder"
                              type="number"
                              value={moduleForm.order}
                              onChange={(e) =>
                                setModuleForm({
                                  ...moduleForm,
                                  order: e.target.value,
                                })
                              }
                              placeholder={`${modules.length + 1}`}
                            />
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setNewModuleDialog(false);
                              resetModuleForm();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create Module</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {modules.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        No modules yet. Create a module to organize your lessons.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {modules
                      .sort((a, b) => a.order - b.order)
                      .map((module, index) => {
                        const moduleId = module.id || module._id;
                        return (
                        <Card key={moduleId}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  Module {module.order}: {module.title}
                                </CardTitle>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => moduleId && handleDeleteModule(moduleId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                        </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lessons" className="mt-6">
                <div className="mb-4 flex justify-between items-center">
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
                      <form onSubmit={handleCreateLesson}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="moduleSelect">Module *</Label>
                            <Select
                              value={lessonForm.moduleId}
                              onValueChange={(value) =>
                                setLessonForm({
                                  ...lessonForm,
                                  moduleId: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a module" />
                              </SelectTrigger>
                              <SelectContent>
                                {modules.map((module) => {
                                  const moduleId = module.id || module._id;
                                  return (
                                  <SelectItem key={moduleId} value={moduleId || ''}>
                                    {module.title}
                                  </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="lessonTitle">Title *</Label>
                            <Input
                              id="lessonTitle"
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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
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
                            <Label htmlFor="videoUrl">Video URL</Label>
                            <Input
                              id="videoUrl"
                              type="url"
                              value={lessonForm.videoUrl}
                              onChange={(e) =>
                                setLessonForm({
                                  ...lessonForm,
                                  videoUrl: e.target.value,
                                })
                              }
                              placeholder="https://..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="lessonOrder">Order</Label>
                              <Input
                                id="lessonOrder"
                                type="number"
                                value={lessonForm.order}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    order: parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="1"
                              />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                              <input
                                type="checkbox"
                                id="isFree"
                                checked={lessonForm.isFree}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    isFree: e.target.checked,
                                  })
                                }
                                className="rounded"
                              />
                              <Label htmlFor="isFree">
                                Free lesson
                              </Label>
                            </div>
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setNewLessonDialog(false);
                              resetLessonForm();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create Lesson</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                    {lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const lessonId = lesson.id || lesson._id;
                        return (
                        <Card key={lessonId}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  {lesson.title}
                                </CardTitle>
                                <CardDescription>
                                  {lesson.duration && `Duration: ${lesson.duration} min`}
                                  {lesson.isFree && (
                                    <Badge variant="outline" className="ml-2">
                                      Free
                                    </Badge>
                                  )}
                                </CardDescription>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => lessonId && handleDeleteLesson(lessonId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                      setCourseForm({ ...courseForm, description: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editCategory">Category</Label>
                    <Input
                      id="editCategory"
                      value={courseForm.category}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, category: e.target.value })
                      }
                    />
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
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
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
                      setCourseForm({ ...courseForm, thumbnail: e.target.value })
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
      </div>
    </div>
  );
};

export default CourseManagement;
