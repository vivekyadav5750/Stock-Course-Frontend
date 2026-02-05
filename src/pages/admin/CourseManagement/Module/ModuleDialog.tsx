import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
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

  const filteredCourses = courses.filter((course) =>
    !formData.category || course.category === formData.category
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="moduleCategory">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value, courseId: '' })}
            required
          >
            <SelectTrigger id="moduleCategory">
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
          <Label htmlFor="moduleCourseId">Course *</Label>
          <Select
            value={formData.courseId}
            onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            required
          >
            <SelectTrigger id="moduleCourseId">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {filteredCourses.map((course) => {
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
          <Label htmlFor="moduleTitle">Title *</Label>
          <Input
            id="moduleTitle"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="moduleDescription">Description</Label>
          <Textarea
            id="moduleDescription"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="moduleOrder">Order</Label>
          <Input
            id="moduleOrder"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            placeholder={`1..`}
          />
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{data?._id ? 'Update' : 'Create'} Module</Button>
      </DialogFooter>
    </form>
  );
};
