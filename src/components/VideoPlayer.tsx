
import React, { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/axios';

interface VideoPlayerProps {
  src: string;
  title: string;
  lessonId?: string;
  onClose?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, lessonId, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [videoBlobUrl, setVideoBlobUrl] = useState<string>('');

  // Fetch video with authorization and create blob URL
  useEffect(() => {
    const fetchVideo = async () => {
      if (src.startsWith('/uploads/') && lessonId) {
        try {
          // Local upload - use protected streaming endpoint
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:2000/api';
          const token = getAccessToken();

          const response = await fetch(`${baseUrl}/lesson/stream/${lessonId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to load video');
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setVideoBlobUrl(blobUrl);
          setVideoSrc(blobUrl);
        } catch (error) {
          console.error('Error loading video:', error);
          toast.error('Failed to load video');
        }
      } else {
        // External URL - use as is
        setVideoSrc(src);
      }
    };

    fetchVideo();

    // Cleanup blob URL when component unmounts
    return () => {
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [src, lessonId]);

  // Handle protection against screenshots and recording
  useEffect(() => {
    // Detect context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-clicking is disabled for video protection');
      return false;
    };

    // Detect keyboard shortcuts for screenshots and recording
    const handleKeyDown = (e: KeyboardEvent) => {
      // Common screenshot key combinations
      const isScreenshotAttempt = 
        (e.key === 'PrintScreen') || 
        (e.ctrlKey && e.key === 'p') || 
        (e.ctrlKey && e.shiftKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 's') ||
        (e.metaKey && e.shiftKey && e.key === '3') || // Mac screenshot
        (e.metaKey && e.shiftKey && e.key === '4'); // Mac area screenshot
    
      if (isScreenshotAttempt) {
        e.preventDefault();
        toast.error('Screenshots are not allowed for this content');
        
        // Pause video temporarily when screenshot attempt is detected
        if (videoRef.current && !isPaused) {
          videoRef.current.pause();
          setIsPaused(true);
          
          // Resume after a short delay
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play();
              setIsPaused(false);
            }
          }, 1000);
        }
        
        return false;
      }
    };
    
    // Detect when user switches tabs or windows
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPaused(true);
        toast.info('Video paused - please stay on this tab to continue watching');
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused]);

  return (
    <div 
      ref={containerRef}
      className="bg-black relative w-full aspect-video rounded-lg overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/50 to-transparent p-4 flex justify-between items-center">
        <h3 className="text-white font-medium truncate">{title}</h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        )}
      </div>

      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full"
        controls
        controlsList="nodownload nofullscreen"
        disablePictureInPicture
        onContextMenu={e => e.preventDefault()}
      />
      
      {/* Overlay to prevent easy screen recording */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0">
        Student ID: {Math.random().toString(36).substring(2, 8)}
        Timestamp: {new Date().toISOString()}
      </div>
    </div>
  );
};

export default VideoPlayer;
