import { useMemo, useState } from 'react';
import { Box, Dialog, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Button } from '@/components/ui/button';
import CustomDialogContent from '@/components/CustomDialog/CustomDialogContent';
import CustomDialogFooter from '@/components/CustomDialog/CustomDialogFooter';
import CustomDialogHeader from '@/components/CustomDialog/CustomDialogHeader';
import { Course_Types, Module_Types } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { toast } from 'sonner';
import { createModule, updateModule } from '@/redux/slice/module';

interface ModuleDialogProps {
  data: Module_Types | null;
  courses: Course_Types[];
  filter: any
  onSubmit: () => void;
  onClose: () => void;
}

export const ModuleDialog = ({ data, courses, filter, onSubmit, onClose }: ModuleDialogProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    category: data?.category || filter?.category || '',
    courseId: data?.courseId || filter?.courseId || '',
    order: data?.order?.toString() || '',
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      courseId: formData.courseId,
      order: parseInt(formData.order),
    }

    try {
      if (data?._id) {
        await dispatch(updateModule({ moduleId: data._id, data: payload, })).unwrap();
      }
      else {
        await dispatch(createModule(payload)).unwrap();
      }
      toast.success(`Module ${data?._id ? 'updated' : 'created'} successfully`);
    }
    catch (error: any) {
      toast.error(error || `Failed to ${data?._id ? 'update' : 'create'} module`);
      return;
    }

    onClose();
    onSubmit();
  };

  const filteredCourses = useMemo(
    () => courses.filter((course) => !formData.category || course.category === formData.category),
    [courses, formData.category]
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" disableEnforceFocus key={data?._id ?? 'new'}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <CustomDialogHeader
          title={data?._id ? 'Update Module' : 'Create Module'}
          onClose={onClose}
        />
        <CustomDialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required variant="outlined" margin="normal">
                <InputLabel id="moduleCategory-label">Category</InputLabel>
                <Select
                  labelId="moduleCategory-label"
                  id="moduleCategory"
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, courseId: '' })}
                >
                  {user?.category.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required variant="outlined" margin="normal">
                <InputLabel id="moduleCourse-label">Course</InputLabel>
                <Select
                  labelId="moduleCourse-label"
                  id="moduleCourseId"
                  value={formData.courseId}
                  label="Course"
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  {filteredCourses.map((course) => {
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
              <TextField
                id="moduleTitle"
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
              />
              <TextField
                id="moduleOrder"
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder="1.."
                fullWidth
              />
            </Box>
            <TextField
              id="moduleDescription"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              multiline
              fullWidth
            />
          </Box>
        </CustomDialogContent>
        <CustomDialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{data?._id ? 'Update' : 'Create'} Module</Button>
        </CustomDialogFooter>
      </Box>
    </Dialog>
  );
};
