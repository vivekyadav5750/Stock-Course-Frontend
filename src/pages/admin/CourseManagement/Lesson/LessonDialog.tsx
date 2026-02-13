import { useState, useRef } from 'react';
import { Box, Dialog, FormControl, InputLabel, MenuItem, Select, TextField, LinearProgress, Typography } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import CustomDialogContent from '@/components/CustomDialog/CustomDialogContent';
import CustomDialogFooter from '@/components/CustomDialog/CustomDialogFooter';
import CustomDialogHeader from '@/components/CustomDialog/CustomDialogHeader';
import { CONTENT_TYPES, Lesson_Types, Module_Types, Course_Types } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { createLesson, updateLesson } from '@/redux/slice/lesson';
import { toast } from "sonner";
import axiosInstance from '@/lib/axios';
import { validateFileUpload } from '@/utils/fileUploadValidation';
import { Upload, X, FileText } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store the file for upload
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    category: data?.category || filter?.category || '',
    moduleId: data?.moduleId || filter?.moduleId || '',
    courseId: data?.courseId || filter?.courseId || '',
    title: data?.title || '',
    description: data?.description || '',
    contentType: data?.contentType || CONTENT_TYPES.FILE,
    fileUrl: data?.fileUrl || '',
    textContent: data?.textContent || '',
    order: data?.order?.toString() || '',
    duration: data?.duration?.toString() || '',
    isPreview: data?.isPreview || false,
  });

  // Handle file selection (video, PDF, or image)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const isVideo = selectedFile.type.startsWith('video/');
    const isPdf = selectedFile.type === 'application/pdf';
    const isImage = selectedFile.type.startsWith('image/');

    if (!isVideo && !isPdf && !isImage) {
      toast.error('Please select a valid video, PDF, or image file');
      return;
    }

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    const maxSizeMB = isVideo ? 500 : isPdf ? 50 : 10; // 500MB for video, 50MB for PDF, 10MB for images
    
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB} MB`);
      return;
    }

    setFile(selectedFile);
    setFormData({ ...formData, fileUrl: '' });
    toast.success(`File "${selectedFile.name}" selected`);
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData({ ...formData, fileUrl: '' });
  };

  // Handle file update (for existing lessons)
  const handleUpdateFile = async () => {
    if (!file || !data?._id) return;

    try {
      setIsUploading(true);

      // Validate file
      const isValid = validateFileUpload(file, user, dispatch, (message: string) => toast.error(message));
      if (!isValid) {
        setIsUploading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      // Simulate progress
      let fakeProgress = 0;
      const progressInterval = setInterval(() => {
        fakeProgress = Math.min(fakeProgress + Math.random() * 15, 90);
        setUploadProgress(Math.round(fakeProgress));
      }, 200);

      await axiosInstance.post(`/lesson/update-file/${data._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('File updated successfully');
      setFile(null);
      onSubmit();
    } catch (error: any) {
      console.error('File update error:', error);
      toast.error(error?.message || 'Failed to update file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUploading(true);

      // Validate required fields
      if (!formData.category || !formData.courseId || !formData.moduleId || !formData.title.trim() || !formData.description.trim()) {
        toast.error('Please fill all required fields');
        setIsUploading(false);
        return;
      }

      // Validate content
      if (formData.contentType === CONTENT_TYPES.FILE && !file && !formData.fileUrl) {
        toast.error('Please select a file');
        setIsUploading(false);
        return;
      }

      if (formData.contentType === CONTENT_TYPES.TEXT && !formData.textContent.trim()) {
        toast.error('Please enter text content');
        setIsUploading(false);
        return;
      }

      // Validate file
      if (file && !validateFileUpload(file, user, dispatch, (message: string) => toast.error(message))) {
        setIsUploading(false);
        return;
      }

      const payload = {
        category: formData.category,
        moduleId: formData.moduleId,
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description,
        contentType: formData.contentType,
        fileUrl: formData.fileUrl,
        textContent: formData.textContent,
        order: parseInt(formData.order) || 1,
        isPreview: formData.isPreview,
        duration: parseInt(formData.duration) || 0,
      };

      // If there's a file to upload, use FormData
      if (file) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);
        formDataToSend.append('data', JSON.stringify(payload));

        // Simulate progress for better UX
        let fakeProgress = 0;
        const progressInterval = setInterval(() => {
          fakeProgress = Math.min(fakeProgress + Math.random() * 15, 90);
          setUploadProgress(Math.round(fakeProgress));
        }, 200);

        const endpoint = data?._id ? `/lesson/${data._id}` : '/lesson';
        const method = data?._id ? 'put' : 'post';

        await axiosInstance[method](endpoint, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        clearInterval(progressInterval);
        setUploadProgress(100);
      } else {
        // No file upload, use regular dispatch
        if (data?._id) {
          await dispatch(updateLesson({ lessonId: data._id, data: payload })).unwrap();
        } else {
          await dispatch(createLesson(payload)).unwrap();
        }
      }

      toast.success(`Lesson ${data?._id ? 'updated' : 'created'} successfully`);
      onClose();
      onSubmit();
    } catch (error: any) {
      console.error('Lesson submission error:', error);
      toast.error(error?.message || `Failed to ${data?._id ? 'update' : 'create'} lesson`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="lessonContentType-label">Content Type</InputLabel>
              <Select
                labelId="lessonContentType-label"
                id="lessonContentType"
                value={formData.contentType}
                label="Content Type"
                onChange={(e) => {
                  const newContentType = e.target.value as typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
                  setFormData({
                    ...formData,
                    contentType: newContentType,
                  });
                  // Clear file when switching content type
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <MenuItem value={CONTENT_TYPES.FILE}>File (Video/PDF/Image)</MenuItem>
                <MenuItem value={CONTENT_TYPES.TEXT}>Text</MenuItem>
              </Select>
            </FormControl>
            {formData.contentType === CONTENT_TYPES.FILE && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,application/pdf,image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />

                {/* Show existing file info when editing */}
                {data?.fileUrl && !file ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FileText style={{ width: 32, height: 32, color: '#3b82f6' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Current File
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {data.fileUrl.split('/').pop()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button type="button" onClick={() => fileInputRef.current?.click()} size="sm" variant="outline" disabled={isUploading}>
                      Change File
                    </Button>
                  </Box>
                ) : file ? (
                  /* Show selected file preview */
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FileText style={{ width: 32, height: 32, color: '#3b82f6' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </Typography>
                        </Box>
                      </Box>
                      <Button type="button" onClick={handleRemoveFile} size="sm" variant="outline" disabled={isUploading}>
                        <X style={{ width: 16, height: 16 }} />
                      </Button>
                    </Box>

                    {/* Show update button for existing lessons */}
                    {data?._id && (
                      <Button
                        type="button"
                        onClick={handleUpdateFile}
                        disabled={isUploading}
                        className="w-full mt-2"
                      >
                        {isUploading ? `Updating... ${uploadProgress}%` : 'Update File Now'}
                      </Button>
                    )}
                  </Box>
                ) : (
                  /* Upload Area */
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'grey.400',
                        bgcolor: 'grey.50',
                      },
                    }}
                  >
                    <Upload style={{ margin: '0 auto', width: 48, height: 48, color: '#9ca3af' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click to select file
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports Video, PDF, and Image files
                    </Typography>
                  </Box>
                )}

                {/* Upload progress */}
                {isUploading && uploadProgress > 0 && (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {data?._id && file ? 'Updating file...' : 'Uploading...'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {uploadProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}
              </Box>
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading...' : `${data ? 'Update' : 'Create'} Lesson`}
          </Button>
        </CustomDialogFooter>
      </Box>
    </Dialog>
  );
};
