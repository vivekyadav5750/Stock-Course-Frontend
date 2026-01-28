
import React from 'react';
import { Link } from 'react-router-dom';
import { Course, CourseLevel } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Course_Types } from '@/types';

interface CourseCardProps {
  course: Course | Course_Types;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Choose badge color based on course level
  const getBadgeVariant = (level: string | CourseLevel | undefined) => {
    const levelStr = String(level || '').toLowerCase();
    if (levelStr === 'beginner' || level === CourseLevel.BEGINNER) return 'secondary';
    if (levelStr === 'intermediate' || level === CourseLevel.INTERMEDIATE) return 'default';
    if (levelStr === 'advanced' || level === CourseLevel.ADVANCED) return 'destructive';
    return 'outline';
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Link to={`/course/${(course as any)._id || (course as any).id}`} className="block h-full">
        <Card className="h-full overflow-hidden border group hover:shadow-md transition-all duration-300">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={(course as any).imageUrl || (course as any).thumbnail || 'https://via.placeholder.com/400x300'}
              alt={course.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3">
              <Badge variant={getBadgeVariant(course.level)}>
                {course.level || 'Basic'}
              </Badge>
            </div>
          </div>
          <CardHeader className="pb-2">
            <h3 className="text-xl font-semibold tracking-tight">{course.title}</h3>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-muted-foreground text-sm line-clamp-2">
              {course.description}
            </p>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {((course as any).topics?.length || 0)} topics
            </div>
            <p className="font-semibold">
              ₹{course.price}
            </p>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
