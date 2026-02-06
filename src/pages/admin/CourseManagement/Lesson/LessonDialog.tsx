import { useState } from 'react';
import { Box, Dialog, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Button } from '@/components/ui/button';
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
      console.log("heyy", error)
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
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="md" key={data?._id ?? 'new'}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <CustomDialogHeader
          title={data ? 'Update Lesson' : 'Create Lesson'}
          onClose={onClose}
        />
        <CustomDialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} margin="normal">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required variant="outlined" margin="normal">
                <InputLabel id="lessonCategory-label">Category</InputLabel>
                <Select
                  labelId="lessonCategory-label"
                  id="lessonCategory"
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, moduleId: '' })}
                >
                  {user?.category.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required variant="outlined" margin="normal">
                <InputLabel id="lessonCourse-label">Course</InputLabel>
                <Select
                  labelId="lessonCourse-label"
                  id="lessonCourse"
                  value={formData.courseId}
                  label="Course"
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value, moduleId: '' })}
                >
                  {courses
                    .filter((course) => !formData.category || course.category === formData.category)
                    .map((course) => {
                      const courseId = course._id;
                      if (!courseId) return null;
                      return (
                        <MenuItem key={courseId} value={courseId}>
                          {course.title}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="lessonModule-label">Module</InputLabel>
                <Select
                  labelId="lessonModule-label"
                  id="lessonModule"
                  value={formData.moduleId}
                  label="Module"
                  onChange={(e) => {
                    const selectedModule = modules.find((m) => m._id === e.target.value);
                    const courseId = selectedModule?.courseId || (selectedModule?.courseId as any)?._id || '';
                    setFormData({ ...formData, moduleId: e.target.value, courseId });
                  }}
                >
                  {filteredModules.map((module) => {
                    const moduleId = module._id;
                    if (!moduleId) return null;
                    return (
                      <MenuItem key={moduleId} value={moduleId}>
                        {module.title}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                id="lessonTitle"
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
              />
            </Box>
            <TextField
              id="lessonDescription"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              multiline
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel id="lessonContentType-label">Content Type</InputLabel>
              <Select
                labelId="lessonContentType-label"
                id="lessonContentType"
                value={formData.contentType}
                label="Content Type"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contentType: e.target.value as typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES],
                  })
                }
              >
                <MenuItem value={CONTENT_TYPES.VIDEO}>Video</MenuItem>
                <MenuItem value={CONTENT_TYPES.PDF}>PDF</MenuItem>
                <MenuItem value={CONTENT_TYPES.TEXT}>Text</MenuItem>
              </Select>
            </FormControl>
            {formData.contentType === CONTENT_TYPES.VIDEO && (
              <TextField
                id="lessonVideoUrl"
                label="Video URL"
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://..."
                required
                fullWidth
              />
            )}
            {formData.contentType === CONTENT_TYPES.PDF && (
              <TextField
                id="lessonPdfUrl"
                label="PDF URL"
                type="url"
                value={formData.pdfUrl}
                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                placeholder="https://..."
                required
                fullWidth
              />
            )}
            {formData.contentType === CONTENT_TYPES.TEXT && (
              <TextField
                id="lessonTextContent"
                label="Text Content"
                value={formData.textContent}
                onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                rows={6}
                multiline
                required
                fullWidth
              />
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                id="lessonOrder"
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder={`1...`}
                fullWidth
              />
              <TextField
                id="lessonDuration"
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="0"
                fullWidth
              />
            </Box>
            <div className="flex items-center space-x-2">
              <Switch
                id="lessonPreview"
                checked={formData.isPreview}
                onCheckedChange={(checked) => setFormData({ ...formData, isPreview: checked })}
              />
              <label htmlFor="lessonPreview">Is Preview Lesson</label>
            </div>
          </Box>
        </CustomDialogContent>
        <CustomDialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{data ? 'Update' : 'Create'} Lesson</Button>
        </CustomDialogFooter>
      </Box>
    </Dialog>
  );
};
