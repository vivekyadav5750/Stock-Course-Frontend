import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

interface Module {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  courseId: string;
  order: number;
}

interface Course {
  _id?: string;
  id?: string;
  title: string;
  category?: string;
}

interface ModuleFormProps {
  module?: Module | null;
  courses: Course[];
  selectedCourse?: Course | null;
  userCategories: string[];
  modulesCount: number;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export const ModuleForm = ({ module, courses,selectedCourse, userCategories, modulesCount, onSubmit, onCancel }: ModuleFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    courseId: '',
    order: '',
  });

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        description: module.description || '',
        category: module.category || '',
        courseId: module.courseId || '',
        order: module.order?.toString() || '',
      });
    }
  }, [module]);

  useEffect(() => {
  if (selectedCourse) {
    const courseId = selectedCourse.id || selectedCourse._id || '';

    setFormData((prev) => ({
      ...prev,
      courseId,
      category: selectedCourse.category || '',
    }));
  }
}, [selectedCourse]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.category || !formData.courseId) {
      return;
    }
    
    onSubmit(formData);
  };

  const filteredCourses = courses.filter((course) => 
    !formData.category || course.category === formData.category
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
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
              {userCategories.map((cat) => (
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
                const courseId = course.id || course._id;
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
          <Label htmlFor="moduleOrder">Order</Label>
          <Input
            id="moduleOrder"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            placeholder={`${modulesCount + 1}`}
          />
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{module ? 'Update' : 'Create'} Module</Button>
      </DialogFooter>
    </form>
  );
};
