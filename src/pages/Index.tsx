
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/CourseCard';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { getCourse } from '@/redux/slice/course';
import { useEffect } from 'react';

const Index = () => {
  const dispatch = useAppDispatch();
  const { courses, status } = useAppSelector((state) => state.course);
  const { user } = useAuth();

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(getCourse({ page: 0, limit: 100 }));
  }, [dispatch]);

  // Filter to show only one course from each level
  const featuredCourses = [
    courses.find(c => c.level?.toLowerCase() === 'beginner'),
    courses.find(c => c.level?.toLowerCase() === 'intermediate'),
    courses.find(c => c.level?.toLowerCase() === 'advanced'),
  ].filter(Boolean);

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
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Master the Stock Market with Confidence
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Learn essential investment strategies from industry experts and transform your financial future.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/courses">
                <Button size="lg" className="px-8">
                  Explore Courses
                </Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="px-8">
                    Sign Up Free
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive courses tailored for every skill level, from beginners to advanced traders.
            </p>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Loading featured courses...</p>
            </div>
          )}

          {/* Error State */}
          {status === 'failed' && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Failed to load featured courses</p>
              <Button onClick={() => dispatch(getCourse({ page: 0, limit: 100 }))}>
                Try Again
              </Button>
            </div>
          )}

          {/* Featured Courses Grid */}
          {status === 'success' && (
            <>
              {featuredCourses.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {featuredCourses.map((course) => (
                    course && (
                      <motion.div key={(course as any)._id || (course as any).id} variants={itemVariants}>
                        <CourseCard course={course} />
                      </motion.div>
                    )
                  ))}
                </motion.div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No courses available</p>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn from industry experts and gain practical knowledge that you can apply immediately.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-lg border bg-card"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path><path d="M2 20h20"></path><path d="M14 12v.01"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Structured Learning</h3>
              <p className="text-muted-foreground">
                Follow a proven curriculum designed to build your knowledge progressively from the fundamentals to advanced concepts.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 rounded-lg border bg-card"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
              <p className="text-muted-foreground">
                Learn from seasoned traders who share practical insights and real-world applications of investment strategies.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 rounded-lg border bg-card"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
              <p className="text-muted-foreground">
                Monitor your learning journey with our progress tracking system that guides you through each step of the curriculum.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Investment Skills?</h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of successful traders who have mastered the market with our comprehensive courses.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
