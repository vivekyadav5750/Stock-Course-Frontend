
import React from 'react';
import { Topic } from '@/lib/constants';
import { PlayCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TopicItemProps {
  topic: Topic;
  index: number;
  isUnlocked: boolean;
  onPlayVideo: (topic: Topic) => void;
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, index, isUnlocked, onPlayVideo }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`p-4 rounded-lg mb-4 border ${
        isUnlocked 
          ? 'hover:bg-secondary/50 cursor-pointer' 
          : 'bg-muted/30 cursor-not-allowed'
      }`}
      onClick={() => isUnlocked && onPlayVideo(topic)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {isUnlocked ? (
              <PlayCircle className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">{topic.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <span>{topic.duration} min</span>
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          variant={isUnlocked ? "outline" : "ghost"} 
          disabled={!isUnlocked}
          onClick={(e) => {
            e.stopPropagation();
            isUnlocked && onPlayVideo(topic);
          }}
        >
          {isUnlocked ? "Watch" : "Locked"}
        </Button>
      </div>
    </motion.div>
  );
};

export default TopicItem;
