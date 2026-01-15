
import React from 'react';
import { Link } from 'react-router-dom';
import { Course, CourseLevel } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Choose badge color based on course level
  const getBadgeVariant = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BASIC:
        return 'secondary';
      case CourseLevel.INTERMEDIATE:
        return 'default';
      case CourseLevel.ADVANCED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Link to={`/courses/${course.id}`} className="block h-full">
        <Card className="h-full overflow-hidden border group hover:shadow-md transition-all duration-300">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3">
              <Badge variant={getBadgeVariant(course.level)}>
                {course.level}
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
              {course.topics.length} topics
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
