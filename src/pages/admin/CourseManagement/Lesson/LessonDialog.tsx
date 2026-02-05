import { useEffect, useState } from 'react';
import { Box, Dialog } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import CustomDialogContent from '@/components/CustomDialog/CustomDialogContent';
import CustomDialogFooter from '@/components/CustomDialog/CustomDialogFooter';
import CustomDialogHeader from '@/components/CustomDialog/CustomDialogHeader';
import { CONTENT_TYPES, Lesson_Types, Module_Types, Course_Types } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { createLesson, updateLesson } from '@/redux/slice/lesson';
import { toast } from "sonner";

interface LessonDialogProps {
  data: Lesson_Types | null;
  courses: Course_Types[];
  modules: Module_Types[];
  filter: any
  onSubmit: () => void;
  onClose: () => void;
}

export const LessonDialog = ({ data, modules, courses, filter, onSubmit, onClose }: LessonDialogProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  // const normalizeId = (value?: string | { _id?: string } | null) => {
  //   console.log("normalizeId", value)
  //   if (typeof value === 'string') return value;
  //   return value?._id || '';
  // };

  const [formData, setFormData] = useState({
    category: data?.category || filter?.category || '',
    moduleId: data?.moduleId || filter?.moduleId || '',
    courseId: data?.courseId || filter?.courseId || '',
    title: data?.title || '',
    description: data?.description || '',
    contentType: data?.contentType || CONTENT_TYPES.VIDEO,
    videoUrl: data?.videoUrl || '',
    pdfUrl: data?.pdfUrl || '',
    textContent: data?.textContent || '',
    order: data?.order?.toString() || '',
    duration: data?.duration?.toString() || '',
    isPreview: data?.isPreview || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      category: formData.category,
      moduleId: formData.moduleId,
      courseId: formData.courseId,
      title: formData.title,
      description: formData.description,
      contentType: formData.contentType,
      videoUrl: formData.videoUrl,
      pdfUrl: formData.pdfUrl,
      textContent: formData.textContent,
      order: parseInt(formData.order) || 1,
      isPreview: formData.isPreview,
      duration: parseInt(formData.duration) || 0,
    }

    try {
      if (data?._id) {
        await dispatch(updateLesson({ lessonId: data._id, data: payload })).unwrap();
      } else {
        await dispatch(createLesson(payload)).unwrap();
      }
      toast.success(`Lesson ${data?._id ? 'updated' : 'created'} successfully`);
    }
    catch (error: any) {
      toast.error(error || `Failed to ${data?._id ? 'update' : 'create'} lesson`);
      return;
    }

    onClose();
    onSubmit();
  };


  // Filter modules by category only
  const filteredModules = modules.filter((module) => {
    if (formData.category) {
      return module.category === formData.category;
    }
    return true;
  });

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus key={data?._id ?? 'new'}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <CustomDialogHeader
          title={data ? 'Update Lesson' : 'Create Lesson'}
          onClose={onClose}
        />
        <CustomDialogContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lessonCategory">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value, moduleId: '' })}
                required
              >
                <SelectTrigger id="lessonCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {user?.category.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lessonCourse">Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData({ ...formData, courseId: value, moduleId: '' })}
                required
              >
                <SelectTrigger id="lessonCourse">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses
                    .filter((course) => !formData.category || course.category === formData.category)
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
              <Label htmlFor="lessonModule">Module *</Label>
              <Select
                value={formData.moduleId}
                onValueChange={(value) => {
                  // Extract courseId from selected module
                  const selectedModule = modules.find(m => (m._id) === value);
                  const courseId = selectedModule?.courseId || (selectedModule?.courseId as any)?._id || '';
                  setFormData({ ...formData, moduleId: value, courseId });
                }}
                required
              >
                <SelectTrigger id="lessonModule">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {filteredModules.map((module) => {
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
            <div>
              <Label htmlFor="lessonTitle">Title *</Label>
              <Input
                id="lessonTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lessonDescription">Description</Label>
              <Textarea
                id="lessonDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="lessonContentType">Content Type *</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value: typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES]) => setFormData({ ...formData, contentType: value })}
                required
              >
                <SelectTrigger id="lessonContentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CONTENT_TYPES.VIDEO}>Video</SelectItem>
                  <SelectItem value={CONTENT_TYPES.PDF}>PDF</SelectItem>
                  <SelectItem value={CONTENT_TYPES.TEXT}>Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.contentType === CONTENT_TYPES.VIDEO && (
              <div>
                <Label htmlFor="lessonVideoUrl">Video URL *</Label>
                <Input
                  id="lessonVideoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
            )}
            {formData.contentType === CONTENT_TYPES.PDF && (
              <div>
                <Label htmlFor="lessonPdfUrl">PDF URL *</Label>
                <Input
                  id="lessonPdfUrl"
                  type="url"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
            )}
            {formData.contentType === CONTENT_TYPES.TEXT && (
              <div>
                <Label htmlFor="lessonTextContent">Text Content *</Label>
                <Textarea
                  id="lessonTextContent"
                  value={formData.textContent}
                  onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                  rows={6}
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="lessonOrder">Order</Label>
              <Input
                id="lessonOrder"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder={`1...`}
              />
            </div>
            <div>
              <Label htmlFor="lessonDuration">Duration (minutes)</Label>
              <Input
                id="lessonDuration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="lessonPreview"
                checked={formData.isPreview}
                onCheckedChange={(checked) => setFormData({ ...formData, isPreview: checked })}
              />
              <Label htmlFor="lessonPreview">Is Preview Lesson</Label>
            </div>
          </div>
        </CustomDialogContent>
        <CustomDialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{data ? 'Update' : 'Create'} Lesson</Button>
        </CustomDialogFooter>
      </Box>
    </Dialog>
  );
};
