import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, EyeOff, Plus, Trash2, Video } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hook";
import { deleteLesson, togglePublishLesson } from "@/redux/slice/lesson";
import { toast } from "sonner";
import { LessonDialog } from "./LessonDialog";
import { MetadataInfo } from "@/components/MetadataInfo";

export default function Lesson({ lessons, modules, courses, filter }) {
    const dispatch = useAppDispatch();
    const [lessonDialog, setLessonDialog] = useState({ open: false, data: null });

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


    return (
        <>
            <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Lessons for
                        {/* {selectedCourse.title} */}
                    </h2>
                    <Button onClick={() => { setLessonDialog({ open: true, data: null }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Lesson
                    </Button>
                </div>
            </div>

            {
                // modules.length === 0 ? (
                //     <Card>
                //         <CardContent className="pt-6 text-center">
                //             <p className="text-muted-foreground">
                //                 Create modules first before adding lessons.
                //             </p>
                //         </CardContent>
                //     </Card>
                // ) : 
                lessons.length === 0 ? (
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
                                                    <div className="mt-3">
                                                        <MetadataInfo
                                                            createdBy={lesson.createdBy}
                                                            updatedBy={lesson.updatedBy}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setLessonDialog({ open: true, data: lesson })}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleTogglePublishLesson(lesson._id)}
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
                                                        onClick={() => handleDeleteLesson(lesson._id)}
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

            {lessonDialog.open && (
                <LessonDialog
                    data={lessonDialog.data}
                    modules={modules}
                    courses={courses}
                    filter={filter}
                    onSubmit={() => { }}
                    onClose={() => setLessonDialog({ open: false, data: null })}
                />
            )}
        </>
    )
}
