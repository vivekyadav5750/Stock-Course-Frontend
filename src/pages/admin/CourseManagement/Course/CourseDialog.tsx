import { useState } from 'react';
import { Box, Dialog, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Button } from '@/components/ui/button';
import CustomDialogContent from '@/components/CustomDialog/CustomDialogContent';
import CustomDialogFooter from '@/components/CustomDialog/CustomDialogFooter';
import CustomDialogHeader from '@/components/CustomDialog/CustomDialogHeader';
import { Course_Types } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { toast } from "sonner";
import { createCourse, updateCourse } from '@/redux/slice/course';

interface CourseDialogProps {
  data?: Course_Types | null;
  filter: any;
  onSubmit: () => void;
  onClose: () => void;
}

export const CourseDialog = ({ data, filter, onSubmit, onClose }: CourseDialogProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    category: data?.category || filter?.category || '',
    level: data?.level || '',
    price: data?.price || '',
    duration: data?.duration || '',
    thumbnail: data?.thumbnail || '',
    discount: data?.discount || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      level: formData.level as 'Beginner' | 'Intermediate' | 'Advanced',
      price: parseFloat(String(formData.price)) || 0,
      duration: parseFloat(String(formData.duration)) || 0,
      thumbnail: formData.thumbnail,
      discount: parseFloat(String(formData.discount)) || 0,
    }

    try {
      if (data?._id) {
        await dispatch(updateCourse({ courseId: data._id, data: payload })).unwrap();
      } else {
        await dispatch(createCourse(payload)).unwrap();
      }
      toast.success(`Course ${data?._id ? 'updated' : 'created'} successfully`);
    }
    catch (error: any) {
      toast.error(error || `Failed to ${data?._id ? 'update' : 'create'} course`);
      return;
    }

    onClose();
    onSubmit();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" disableEnforceFocus key={data?._id ?? 'new'}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <CustomDialogHeader
          title={data?._id ? 'Update Course' : 'Create Course'}
          onClose={onClose}
        />
        <CustomDialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                id="courseTitle"
                label="Title"
                variant="outlined"
                margin="normal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
              />
              <FormControl fullWidth required variant="outlined" margin="normal">
                <InputLabel id="courseCategory-label">Category</InputLabel>
                <Select
                  labelId="courseCategory-label"
                  id="courseCategory"
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {user?.category.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              id="courseDescription"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              multiline
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="courseLevel-label">Level</InputLabel>
                <Select
                  labelId="courseLevel-label"
                  id="courseLevel"
                  value={formData.level}
                  label="Level"
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
              <TextField
                id="coursePrice"
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                id="courseDuration"
                label="Duration (hours)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
                fullWidth
              />
              <TextField
                id="courseDiscount"
                label="Discount (%)"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="0"
                fullWidth
              />
            </Box>
            <TextField
              id="courseThumbnail"
              label="Thumbnail URL"
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://..."
              fullWidth
            />
          </Box>
        </CustomDialogContent>
        <CustomDialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{data?._id ? 'Update' : 'Create'} Course</Button>
        </CustomDialogFooter>
      </Box>
    </Dialog>
  );
};
