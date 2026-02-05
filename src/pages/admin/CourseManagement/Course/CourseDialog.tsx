import { useState } from 'react';
import { Box, Dialog } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <CustomDialogHeader
          title={data?._id ? 'Update Course' : 'Create Course'}
          onClose={onClose}
        />
        <CustomDialogContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="courseTitle">Title *</Label>
              <Input
                id="courseTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="courseDescription">Description *</Label>
              <Textarea
                id="courseDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="courseCategory">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger id="courseCategory">
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
              <Label htmlFor="courseLevel">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
                required
              >
                <SelectTrigger id="courseLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="coursePrice">Price (₹) *</Label>
              <Input
                id="coursePrice"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="courseDuration">Duration (hours) *</Label>
              <Input
                id="courseDuration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="courseThumbnail">Thumbnail URL</Label>
              <Input
                id="courseThumbnail"
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="courseDiscount">Discount (%)</Label>
              <Input
                id="courseDiscount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
        </CustomDialogContent>
        <CustomDialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{data?._id ? 'Update' : 'Create'} Course</Button>
        </CustomDialogFooter>
      </Box>
    </Dialog>
  );
};
