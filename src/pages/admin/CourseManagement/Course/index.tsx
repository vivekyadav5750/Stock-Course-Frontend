import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hook";
import { deleteCourse, togglePublishCourse } from "@/redux/slice/course";
import { Course_Types } from "@/types";
import { toast } from "sonner";
import { CourseDialog } from "./CourseDialog";

export default function Course({ courses, filter, setFilter }) {
    const dispatch = useAppDispatch();

    const [selectedCourse, setSelectedCourse] = useState<Course_Types | null>(null);
    const [courseDialog, setCourseDialog] = useState({ open: false, data: null });

    // Handle toggle publish course
    const handleTogglePublishCourse = async (courseId: string) => {
        try {
            await dispatch(togglePublishCourse(courseId)).unwrap();
            toast.success("Course publish status toggled successfully");
        } catch (error: any) {
            toast.error(error || "Failed to toggle publish status");
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

    return (
        <>
            <div className='mt-6'>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Course for
                        {/* {selectedCourse.title} category */}
                    </h2>
                    <Button onClick={() => { setCourseDialog({ open: true, data: null }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Course
                    </Button>
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
                        return (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-all ${selectedCourse?._id === course._id ? "ring-2 ring-primary" : ""
                                        }`}
                                    onClick={() => {
                                        setSelectedCourse(course);
                                        setFilter({ ...filter, courseId: course._id, moduleId: null });
                                    }}
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
                                                setCourseDialog({ open: true, data: course });
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTogglePublishCourse(course._id);
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
                                                handleDeleteCourse(course._id);
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
            {/* Course Dialog */}
            {courseDialog.open && (
                <CourseDialog
                    data={courseDialog.data}
                    filter={filter}
                    onClose={() => setCourseDialog({ open: false, data: null })}
                    onSubmit={() => {
                        //reload the course ...api call
                    }}
                />
            )}
        </>
    )
}
