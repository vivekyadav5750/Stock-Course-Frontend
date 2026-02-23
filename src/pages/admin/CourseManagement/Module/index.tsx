import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hook";
import { deleteModule, togglePublishModule } from "@/redux/slice/module";
import { toast } from "sonner";
import { ModuleDialog } from "./ModuleDialog";
import { MetadataInfo } from "@/components/MetadataInfo";

export default function Module({ modules, courses, filter }) {
    console.log("Modules:", modules);
    const dispatch = useAppDispatch();
    const [moduleDialog, setModuleDialog] = useState({ open: false, data: null });

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


    return (
        <>
            <div className='mt-6'>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Modules for
                        {/* {selectedCourse.title} */}
                    </h2>
                    <Button onClick={() => { setModuleDialog({ open: true, data: null }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Module
                    </Button>
                </div>

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
                            .map((module) => {
                                return (
                                    <Card key={module._id}>
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
                                                    <div className="mt-3">
                                                        <MetadataInfo
                                                            createdBy={module.createdBy}
                                                            updatedBy={module.updatedBy}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setModuleDialog({ open: true, data: module })}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleTogglePublishModule(module._id)}
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
                                                        onClick={() => handleDeleteModule(module._id)}
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
            </div>

            {moduleDialog.open && (
                <ModuleDialog
                    data={moduleDialog.data}
                    courses={courses}
                    filter={filter}
                    onSubmit={() => { }}
                    onClose={() => setModuleDialog({ open: false, data: null })}
                />
            )}
        </>
    )
}
