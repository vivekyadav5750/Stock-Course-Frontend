import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CourseLevel } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Topic {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration: number;
  course_id: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  imageUrl: string;
  price: number;
  topics: Topic[];
}

const CourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourseDialog, setNewCourseDialog] = useState(false);
  const [newTopicDialog, setNewTopicDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formCourseTitle, setFormCourseTitle] = useState('');
  const [formCourseDesc, setFormCourseDesc] = useState('');
  const [formCourseLevel, setFormCourseLevel] = useState(CourseLevel.BASIC);
  const [formCoursePrice, setFormCoursePrice] = useState('');
  const [formCourseImage, setFormCourseImage] = useState('');
  
  const [formTopicTitle, setFormTopicTitle] = useState('');
  const [formTopicDesc, setFormTopicDesc] = useState('');
  const [formTopicDuration, setFormTopicDuration] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');

  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        
        const coursesResponse = await supabase.from('courses').select('*');
        
        type CourseResponseData = {
          id: string;
          title: string;
          description: string;
          level: CourseLevel;
          image_url: string;
          price: number;
        }[];
        
        const { data: coursesData, error: coursesError } = coursesResponse as unknown as {
          data: CourseResponseData | null;
          error: Error | null;
        };

        if (coursesError) throw coursesError;

        const coursesWithTopics = await Promise.all(
          coursesData ? coursesData.map(async (course) => {
            const topicsResponse = await supabase
              .from('topics')
              .select('*')
              .eq('course_id', course.id);
              
            type TopicResponseData = {
              id: string;
              course_id: string;
              title: string;
              description: string;
              video_url: string;
              duration: number;
            }[];
            
            const { data: topicsData, error: topicsError } = topicsResponse as unknown as {
              data: TopicResponseData | null;
              error: Error | null;
            };

            if (topicsError) throw topicsError;

            return {
              id: course.id,
              title: course.title,
              description: course.description,
              level: course.level as CourseLevel,
              imageUrl: course.image_url,
              price: course.price,
              topics: topicsData || []
            };
          }) : []
        );

        setCourses(coursesWithTopics);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchCourses();
    }
  }, [user]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formCourseTitle || !formCourseDesc || !formCourseLevel || !formCourseImage || !formCoursePrice) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const response = await supabase
        .from('courses')
        .insert({
          title: formCourseTitle,
          description: formCourseDesc,
          level: formCourseLevel,
          image_url: formCourseImage,
          price: parseFloat(formCoursePrice)
        })
        .select();
        
      const { data, error } = response as unknown as {
        data: {
          id: string;
          title: string;
          description: string;
          level: CourseLevel;
          image_url: string;
          price: number;
        }[] | null;
        error: Error | null;
      };

      if (error) throw error;

      if (data && data[0]) {
        const newCourse: Course = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          level: data[0].level as CourseLevel,
          imageUrl: data[0].image_url,
          price: data[0].price,
          topics: []
        };
        
        setCourses([...courses, newCourse]);
        
        setFormCourseTitle('');
        setFormCourseDesc('');
        setFormCourseLevel(CourseLevel.BASIC);
        setFormCoursePrice('');
        setFormCourseImage('');
        
        setNewCourseDialog(false);
        
        toast.success('Course added successfully');
      }
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast.error(error.message || 'Failed to add course');
    }
  };
  
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('No course selected');
      return;
    }
    
    if (!formTopicTitle || !formTopicDesc || !formTopicDuration || !formVideoUrl) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const response = await supabase
        .from('topics')
        .insert({
          course_id: selectedCourse.id,
          title: formTopicTitle,
          description: formTopicDesc,
          video_url: formVideoUrl,
          duration: parseInt(formTopicDuration, 10)
        })
        .select();
        
      const { data, error } = response as unknown as {
        data: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          video_url: string;
          duration: number;
        }[] | null;
        error: Error | null;
      };

      if (error) throw error;

      if (data && data[0]) {
        const newTopic: Topic = {
          id: data[0].id,
          course_id: data[0].course_id,
          title: data[0].title,
          description: data[0].description,
          video_url: data[0].video_url,
          duration: data[0].duration
        };
        
        const updatedCourses = courses.map(course => {
          if (course.id === selectedCourse.id) {
            return {
              ...course,
              topics: [...course.topics, newTopic]
            };
          }
          return course;
        });
        
        setCourses(updatedCourses);
        
        const updatedCourse = updatedCourses.find(c => c.id === selectedCourse.id);
        if (updatedCourse) {
          setSelectedCourse(updatedCourse);
        }
        
        setFormTopicTitle('');
        setFormTopicDesc('');
        setFormTopicDuration('');
        setFormVideoUrl('');
        
        setNewTopicDialog(false);
        
        toast.success('Topic added successfully');
      }
    } catch (error: any) {
      console.error('Error adding topic:', error);
      toast.error(error.message || 'Failed to add topic');
    }
  };
  
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId) as unknown as { error: Error | null };
      
      if (error) throw error;
      
      const updatedCourses = courses.filter(course => course.id !== courseId);
      setCourses(updatedCourses);
      
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
      
      toast.success('Course deleted successfully');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Failed to delete course');
    }
  };
  
  const handleDeleteTopic = async (topicId: string) => {
    if (!selectedCourse) return;
    
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId) as unknown as { error: Error | null };
      
      if (error) throw error;
      
      const updatedCourses = courses.map(course => {
        if (course.id === selectedCourse.id) {
          return {
            ...course,
            topics: course.topics.filter(topic => topic.id !== topicId)
          };
        }
        return course;
      });
      
      setCourses(updatedCourses);
      
      const updatedCourse = updatedCourses.find(c => c.id === selectedCourse.id);
      if (updatedCourse) {
        setSelectedCourse(updatedCourse);
      }
      
      toast.success('Topic deleted successfully');
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      toast.error(error.message || 'Failed to delete topic');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold"
          >
            Course Management
          </motion.h1>
          
          <div className="flex gap-3">
            <Button onClick={() => setNewCourseDialog(true)}>
              Add New Course
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Courses</CardTitle>
                <CardDescription>
                  {courses.length} courses available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map(course => (
                    <div 
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                        selectedCourse?.id === course.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                      }`}
                    >
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {course.topics.length} topics
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedCourse ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedCourse.title}</CardTitle>
                      <CardDescription>
                        {selectedCourse.level} level • ₹{selectedCourse.price}
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => setNewTopicDialog(true)}
                      variant="outline"
                      size="sm"
                    >
                      Add Topic
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="topics">
                    <TabsList className="mb-4">
                      <TabsTrigger value="topics">Topics</TabsTrigger>
                      <TabsTrigger value="details">Course Details</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="topics" className="space-y-4">
                      {selectedCourse.topics.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">No topics added to this course yet.</p>
                          <Button onClick={() => setNewTopicDialog(true)}>
                            Add First Topic
                          </Button>
                        </div>
                      ) : (
                        selectedCourse.topics.map((topic) => (
                          <div 
                            key={topic.id}
                            className="p-4 border rounded-md"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">{topic.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {topic.description}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                  <span>{topic.duration} min</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-50 hover:opacity-100"
                                onClick={() => handleDeleteTopic(topic.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>
                    
                    <TabsContent value="details">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                          <p>{selectedCourse.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Course Image</h3>
                          <div className="aspect-video rounded-md overflow-hidden">
                            <img 
                              src={selectedCourse.imageUrl} 
                              alt={selectedCourse.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Level</h3>
                            <p>{selectedCourse.level}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Price</h3>
                            <p>₹{selectedCourse.price}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-medium mb-2">No Course Selected</h3>
                    <p className="text-muted-foreground mb-6">
                      Select a course from the list or create a new one to manage its content.
                    </p>
                    <Button onClick={() => setNewCourseDialog(true)}>
                      Create New Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
      
      <Dialog open={newCourseDialog} onOpenChange={setNewCourseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Create a new course to add to your platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCourse}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input 
                  id="title" 
                  value={formCourseTitle}
                  onChange={(e) => setFormCourseTitle(e.target.value)}
                  placeholder="e.g. Stock Market Fundamentals"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formCourseDesc}
                  onChange={(e) => setFormCourseDesc(e.target.value)}
                  placeholder="Describe the course content and benefits"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select 
                    value={formCourseLevel} 
                    onValueChange={(value) => setFormCourseLevel(value as CourseLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CourseLevel.BASIC}>Basic</SelectItem>
                      <SelectItem value={CourseLevel.INTERMEDIATE}>Intermediate</SelectItem>
                      <SelectItem value={CourseLevel.ADVANCED}>Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    value={formCoursePrice}
                    onChange={(e) => setFormCoursePrice(e.target.value)}
                    placeholder="e.g. 499"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input 
                  id="imageUrl" 
                  value={formCourseImage}
                  onChange={(e) => setFormCourseImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={newTopicDialog} onOpenChange={setNewTopicDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
            <DialogDescription>
              Add a new topic to {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTopic}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topicTitle">Topic Title</Label>
                <Input 
                  id="topicTitle" 
                  value={formTopicTitle}
                  onChange={(e) => setFormTopicTitle(e.target.value)}
                  placeholder="e.g. Understanding Stock Markets"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topicDescription">Description</Label>
                <Textarea 
                  id="topicDescription" 
                  value={formTopicDesc}
                  onChange={(e) => setFormTopicDesc(e.target.value)}
                  placeholder="Describe the topic content"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input 
                  id="videoUrl" 
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input 
                  id="duration" 
                  type="number"
                  value={formTopicDuration}
                  onChange={(e) => setFormTopicDuration(e.target.value)}
                  placeholder="e.g. 15"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Topic</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;

