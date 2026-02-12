import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TopicItem from "@/components/TopicItem";
import VideoPlayer from "@/components/VideoPlayer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getCourseById } from "@/redux/slice/course";
// import { getLessonById } from "@/redux/slice/lesson";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    currentCourse: course,
    status,
    message,
  } = useAppSelector((state) => state.course);

  const { currentLesson } = useAppSelector((state) => state.lesson);

  // Fetch course data
  useEffect(() => {
    if (id) {
      dispatch(getCourseById(id));
    }
  }, [id, dispatch]);

  // Function to check if user can access this course
  // For now, let's make Basic course free and others paid
  const canAccessCourse = () => {
    if (!course) return false;

    // If user is not logged in and course is not free, redirect to login
    if (!user && course.price > 0) {
      return false;
    }

    // For simplicity, let's allow access to all courses when logged in (in a real app, would check payment status)
    // we have to check is course is in user?.courses array
    if (user && course.price > 0) {
      const hasCourse = user.purchasedCourses?.some(
        (userCourse) => userCourse._id === course._id
      );
      return hasCourse;
    }
    return true;
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.info("Please log in to purchase this course");
      navigate("/login");
      return;
    }

    // Redirect to purchase page
    navigate(`/purchase/${id}`);
  };

  const handlePlayVideo = async (topic: any) => {
    if (!topic._id) {
      toast.error("Invalid lesson");
      return;
    }

    setLoadingLesson(true);
    setVideoModalOpen(true);

    try {
      // Fetch lesson with authorization check
      // await dispatch(getLessonById(topic._id)).unwrap();
      // The lesson will be set in Redux state and we'll get it from currentLesson
    } catch (error: any) {
      console.error("Failed to load lesson:", error);
      toast.error(error || "Failed to load lesson. Please check your access.");
      setVideoModalOpen(false);
    } finally {
      setLoadingLesson(false);
    }
  };

  // Update activeVideo when currentLesson changes
  useEffect(() => {
    if (currentLesson && videoModalOpen) {
      setActiveVideo(currentLesson);
    }
  }, [currentLesson, videoModalOpen]);

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading course...</div>
      </div>
    );
  }

  if (status === "failed" || !course) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {message ||
            "The course you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/courses">
          <Button>Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  const isCourseFree = course.price === 0;
  const hasAccess = canAccessCourse();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="rounded-full">
                {course.level || "Basic"}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {(course as any).modules?.length || 0} Modules
              </Badge>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              {course.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-6"
            >
              {course.description}
            </motion.p>

            <div className="flex items-center gap-4 mb-8">
              <div className="text-xl font-bold">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </div>

              {!canAccessCourse() && (
                <Button onClick={handleBuyNow} size="lg">
                  Buy Now
                </Button>
              )}

              {canAccessCourse() && (
                <Button
                  onClick={() =>
                    handlePlayVideo((course as any).modules?.[0]?.lessons?.[0])
                  }
                  size="lg"
                >
                  Start Learning
                </Button>
              )}
            </div>
          </div>

          {/* Course Image */}
          <div className="mb-10">
            <img
              src={
                (course as any).thumbnail ||
                "https://via.placeholder.com/800x450"
              }
              alt={course.title}
              className="w-full rounded-lg aspect-video object-cover"
            />
          </div>

          {/* Course Content */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>

            <div className="space-y-3">
              {(course as any).modules?.map(
                (module: any, moduleIndex: number) => {
                  const isOpen = openModuleId === module._id;

                  return (
                    <div
                      key={module._id}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() =>
                          setOpenModuleId(isOpen ? null : module._id)
                        }
                        className="w-full flex justify-between items-center px-4 py-3 bg-secondary/30 hover:bg-secondary transition"
                      >
                        <div className="text-left">
                          <p className="font-semibold">
                            Module {moduleIndex + 1}: {module.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons?.length || 0} lessons
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {/* Lessons */}
                      {isOpen && (
                        <div className="divide-y">
                          {module.lessons?.length > 0 ? (
                            module.lessons.map(
                              (lesson: any, lessonIndex: number) => (
                                <TopicItem
                                  key={lesson._id}
                                  topic={lesson}
                                  index={lessonIndex}
                                  isUnlocked={
                                    lesson.isPreview || canAccessCourse()
                                  }
                                  onPlayVideo={handlePlayVideo}
                                />
                              ),
                            )
                          ) : (
                            <p className="px-4 py-3 text-sm text-muted-foreground">
                              No lessons available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black">
          <DialogHeader className="p-4">
            <DialogTitle className="text-white">
              {activeVideo?.title || "Loading..."}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {activeVideo?.description || ""}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {loadingLesson ? (
              <div className="aspect-video flex items-center justify-center text-white/80">
                <div className="animate-pulse">Loading lesson...</div>
              </div>
            ) : activeVideo?.videoUrl ? (
              <VideoPlayer
                src={activeVideo.videoUrl}
                title={activeVideo.title}
                lessonId={activeVideo._id}
                onClose={() => setVideoModalOpen(false)}
              />
            ) : (
              <div className="aspect-video flex items-center justify-center text-white/80">
                No video available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetail;
