
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MOCK_COURSES, Course, Topic } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TopicItem from '@/components/TopicItem';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Topic | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get course data
  useEffect(() => {
    const fetchCourse = async () => {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundCourse = MOCK_COURSES.find(c => c.id === id);
      setCourse(foundCourse || null);
      setLoading(false);
    };
    
    fetchCourse();
  }, [id]);
  
  // Function to check if user can access this course
  // For now, let's make Basic course free and others paid
  const canAccessCourse = () => {
    if (!course) return false;
    
    // If user is not logged in and course is not free, redirect to login
    if (!user && course.price > 0) {
      return false;
    }
    
    // For simplicity, let's allow access to all courses when logged in (in a real app, would check payment status)
    return true;
  };
  
  const handleBuyNow = () => {
    if (!user) {
      toast.info('Please log in to purchase this course');
      navigate('/login');
      return;
    }
    
    toast.success('Purchase functionality coming soon!');
  };
  
  const handlePlayVideo = (topic: Topic) => {
    setActiveVideo(topic);
    setVideoModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses">
          <Button>Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  const isCourseFree = course.price === 0;
  const hasAccess = canAccessCourse();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="rounded-full">
                {course.level}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {course.topics.length} Topics
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {Math.round(course.topics.reduce((total, topic) => total + topic.duration, 0) / 60)} Hours
              </Badge>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              {course.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-6"
            >
              {course.description}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              {isCourseFree ? (
                <div className="text-xl font-bold text-green-600">Free</div>
              ) : (
                <div className="text-xl font-bold">₹{course.price}</div>
              )}
              
              {!hasAccess && (
                <Button onClick={handleBuyNow} size="lg">
                  {isCourseFree ? 'Enroll Now' : 'Buy Now'}
                </Button>
              )}
              
              {hasAccess && (
                <Button 
                  onClick={() => handlePlayVideo(course.topics[0])} 
                  size="lg"
                >
                  Start Learning
                </Button>
              )}
            </motion.div>
          </div>
          
          {/* Course Image */}
          <div className="mb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-lg overflow-hidden"
            >
              <img 
                src={course.imageUrl} 
                alt={course.title} 
                className="w-full h-auto object-cover aspect-video" 
              />
            </motion.div>
          </div>
          
          {/* Topics List */}
          <div className="mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold mb-6"
            >
              Course Content
            </motion.h2>
            
            <div className="space-y-2">
              {course.topics.map((topic, index) => (
                <TopicItem 
                  key={topic.id}
                  topic={topic}
                  index={index}
                  isUnlocked={hasAccess}
                  onPlayVideo={handlePlayVideo}
                />
              ))}
            </div>
          </div>
          
          {!hasAccess && (
            <div className="text-center p-6 bg-secondary/30 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Ready to start learning?</h3>
              <p className="text-muted-foreground mb-4">
                Unlock this course to get access to all topics and materials.
              </p>
              <Button onClick={handleBuyNow} size="lg">
                {isCourseFree ? 'Enroll Now' : 'Buy Now'}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black">
          <DialogHeader className="p-4">
            <DialogTitle className="text-white">{activeVideo?.title}</DialogTitle>
            <DialogDescription className="text-white/70">
              {activeVideo?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-black flex items-center justify-center">
            <div className="text-white/80 text-center p-8">
              <p className="text-lg mb-4">Video player would be integrated here</p>
              <p className="text-sm">In production, this would use secure HLS streaming with DRM protection</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetail;
