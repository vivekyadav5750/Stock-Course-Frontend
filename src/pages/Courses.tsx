
import React, { useState, useEffect } from 'react';
import { CourseLevel } from '@/lib/constants';
import CourseCard from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { getCourse } from '@/redux/slice/course';

const Courses = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>('all');
  const { courses, status, message } = useAppSelector((state) => state.course);

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(getCourse({ 
      page: 0, 
      limit: 100,
      category: activeTab !== 'all' ? activeTab : undefined
    }));
  }, [dispatch, activeTab]);

  // Filter courses based on active tab
  const filteredCourses = activeTab === 'all' 
    ? courses 
    : courses.filter(course => course.level?.toLowerCase() === activeTab);
  
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Explore Our Courses
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Comprehensive learning paths designed to take you from beginner to professional trader.
          </motion.p>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        )}

        {/* Error State */}
        {status === 'failed' && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{message || 'Failed to load courses'}</p>
            <Button onClick={() => dispatch(getCourse({ page: 0, limit: 100 }))}>
              Try Again
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        {status === 'success' && (
          <>
            <div className="mb-8">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center">
                  <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="beginner">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="mt-8">
                  <TabsContent value="all" className="mt-0">
                    {filteredCourses.length > 0 ? (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      >
                        {filteredCourses.map(course => (
                          <motion.div key={course._id || course.id} variants={itemVariants}>
                            <CourseCard course={course} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No courses available</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="beginner" className="mt-0">
                    {filteredCourses.length > 0 ? (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      >
                        {filteredCourses.map(course => (
                          <motion.div key={course._id || course.id} variants={itemVariants}>
                            <CourseCard course={course} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No basic courses available</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="intermediate" className="mt-0">
                    {filteredCourses.length > 0 ? (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      >
                        {filteredCourses.map(course => (
                          <motion.div key={course._id || course.id} variants={itemVariants}>
                            <CourseCard course={course} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No intermediate courses available</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="mt-0">
                    {filteredCourses.length > 0 ? (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      >
                        {filteredCourses.map(course => (
                          <motion.div key={course._id || course.id} variants={itemVariants}>
                            <CourseCard course={course} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No advanced courses available</p>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
