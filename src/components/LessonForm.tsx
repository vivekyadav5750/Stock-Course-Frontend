import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DialogFooter } from '@/components/ui/dialog';
import { CONTENT_TYPES } from '@/types';

interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  moduleId: string;
  courseId: string;
  contentType: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  order: number;
  duration: number;
  isPreview: boolean;
}

interface Module {
  _id?: string;
  id?: string;
  title: string;
  courseId?: string;
  course?: any;
  category?: string;
}

interface Course {
  _id?: string;
  id?: string;
  title: string;
  category?: string;
}

interface LessonFormProps {
  lesson?: Lesson | null;
  modules: Module[];
  courses: Course[];
  userCategories: string[];
  lessonsCount: number;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export const LessonForm = ({ lesson, modules, courses, userCategories, lessonsCount, onSubmit, onCancel }: LessonFormProps) => {
  const [formData, setFormData] = useState<{
    moduleId: string;
    courseId: string;
    title: string;
    description: string;
    category: string;
    contentType: typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
    videoUrl: string;
    pdfUrl: string;
    textContent: string;
    order: string;
    duration: string;
    isPreview: boolean;
  }>({
    moduleId: '',
    courseId: '',
    title: '',
    description: '',
    category: '',
    contentType: CONTENT_TYPES.VIDEO,
    videoUrl: '',
    pdfUrl: '',
    textContent: '',
    order: '',
    duration: '',
    isPreview: false,
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        moduleId: lesson.moduleId || '',
        courseId: lesson.courseId || '',
        title: lesson.title || '',
        description: lesson.description || '',
        category: lesson.category || '',
        contentType: (lesson.contentType || CONTENT_TYPES.VIDEO) as typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES],
        videoUrl: lesson.videoUrl || '',
        pdfUrl: lesson.pdfUrl || '',
        textContent: lesson.textContent || '',
        order: lesson.order?.toString() || '',
        duration: lesson.duration?.toString() || '',
        isPreview: lesson.isPreview || false,
      });
    }
  }, [lesson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.moduleId || !formData.courseId || !formData.category || !formData.contentType) {
      return;
    }

    // Validate content based on type
    if (formData.contentType === CONTENT_TYPES.VIDEO && !formData.videoUrl) {
      return;
    }
    if (formData.contentType === CONTENT_TYPES.PDF && !formData.pdfUrl) {
      return;
    }
    if (formData.contentType === CONTENT_TYPES.TEXT && !formData.textContent) {
      return;
    }
    
    onSubmit(formData);
  };

  // Filter modules by category only
  const filteredModules = modules.filter((module) => {
    if (formData.category) {
      return module.category === formData.category;
    }
    return true;
  });

  return (
    <form onSubmit={handleSubmit}>
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
              {userCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lessonModule">Module *</Label>
          <Select
            value={formData.moduleId}
            onValueChange={(value) => {
              // Extract courseId from selected module
              const selectedModule = modules.find(m => (m.id || m._id) === value);
              const courseId = selectedModule?.courseId || (selectedModule?.course as any)?._id || (selectedModule?.course as any)?.id || '';
              setFormData({ ...formData, moduleId: value, courseId });
            }}
            required
          >
            <SelectTrigger id="lessonModule">
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {filteredModules.map((module) => {
                const moduleId = module.id || module._id;
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
            placeholder={`${lessonsCount + 1}`}
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
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{lesson ? 'Update' : 'Create'} Lesson</Button>
      </DialogFooter>
    </form>
  );
};
