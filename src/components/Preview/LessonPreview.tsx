import axiosInstance from '@/lib/axios';
import { useEffect, useRef, useState } from 'react';
import { Download, File } from 'lucide-react';
import { renderTextFileFromUrl } from './utils';
import { Button } from '@mui/material';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { Lesson_Types } from '@/types';
import { buildAuthenticatedVideoUrl } from '@/utils';

function isImageFile(filename: string): boolean {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.webp', '.heic'];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

function isPdf(fileName: string): boolean {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith('.pdf');
}

function isTextFile(fileName: string): boolean {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith('.txt');
}

function isVideoFile(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some((ext) => fileName?.toLowerCase().endsWith(ext));
}

function isAudioFile(fileName: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.ogg'];
    return audioExtensions.some((ext) => fileName?.toLowerCase().endsWith(ext));
}

interface LessonPreviewProps {
    lesson: Lesson_Types;
}

const LessonPreview = ({ lesson }: LessonPreviewProps) => {
    const [url, setUrl] = useState<string | null>(null);
    const textFileDiv = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fileName = lesson.fileUrl || lesson.title || '';

        if (!isImageFile(fileName) && !isPdf(fileName) && !isTextFile(fileName) && !isVideoFile(fileName) && !isAudioFile(fileName)) {
            setUrl('undefined');
            return;
        }

        // For video files, use direct streaming URL instead of blob
        if (isVideoFile(fileName)) {
            setUrl(buildAuthenticatedVideoUrl(lesson._id));
            return;
        }

        setUrl(null);
        let blobUrl = '';

        const link = `/lesson/preview/${lesson._id}`;

        axiosInstance
            .get(link, { responseType: 'blob' })
            .then((response: any) => {
                const blob = response.data || response;
                const isPDFFile = isPdf(fileName);
                const finalBlob = isPDFFile && !blob.type.includes('pdf')
                    ? new Blob([blob], { type: isPDFFile ? 'application/pdf' : 'text/plain' })
                    : blob;
                blobUrl = URL.createObjectURL(finalBlob);
                setUrl(blobUrl);
            })
            .catch((error) => {
                const errorMessage = getErrorMessage(error, 'Failed to load lesson preview');
                toast.error(errorMessage);
                setUrl('undefined');
            });

        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [lesson._id, lesson.fileUrl, lesson.title]);

    useEffect(() => {
        if (!textFileDiv.current) return;
        const fileName = lesson.fileUrl || lesson.title || '';
        if (isTextFile(fileName)) {
            renderTextFileFromUrl(url, textFileDiv.current);
        }
    }, [lesson.fileUrl, lesson.title, url]);

    // Video protection handlers
    useEffect(() => {
        if (!url || !isVideoFile(lesson.fileUrl || lesson.title || '')) return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.error('Right-clicking is disabled for video protection');
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const isScreenshotAttempt =
                (e.key === 'PrintScreen') ||
                (e.ctrlKey && e.key === 'p') ||
                (e.ctrlKey && e.shiftKey && e.key === 'p') ||
                (e.ctrlKey && e.key === 's') ||
                (e.metaKey && e.shiftKey && e.key === '3') ||
                (e.metaKey && e.shiftKey && e.key === '4');

            if (isScreenshotAttempt) {
                e.preventDefault();
                toast.error('Screenshots are not allowed for this content');

                if (videoRef.current && !isPaused) {
                    videoRef.current.pause();
                    setIsPaused(true);

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

        const handleVisibilityChange = () => {
            if (document.hidden && videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
                setIsPaused(true);
                toast.info('Video paused - please stay on this tab to continue watching');
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [url, isPaused, lesson.fileUrl, lesson.title]);

    const fileName = lesson.fileUrl || lesson.title || '';

    return (
        <div className="relative isolate flex h-full flex-grow items-center justify-center">
            {!url ? (
                <p className="text-2xl font-semibold">Loading...</p>
            ) : isImageFile(fileName) ? (
                <img src={url} className="max-h-[calc(100vh-100px)] max-w-full object-contain" alt={lesson.title} />
            ) : isPdf(fileName) ? (
                <>
                    <p className="absolute inset-0 -z-[1] m-auto flex items-center justify-center text-2xl font-semibold">Loading...</p>
                    <iframe key={url} src={url} height="100%" width="100%" className="h-[calc(100vh-100px)] w-full"></iframe>
                </>
            ) : isTextFile(fileName) ? (
                <div className="mb-1 flex h-full w-full flex-grow flex-col overflow-auto pb-1">
                    <h6 className="mb-2 text-center font-medium text-gray-500">{lesson.title}</h6>
                    <div className="max-h-[calc(100vh-135px)] rounded-md border p-2" ref={textFileDiv} />
                </div>
            ) : isVideoFile(fileName) ? (
                <div className="relative w-full h-full bg-black rounded-md overflow-hidden">
                    <video
                        ref={videoRef}
                        controls
                        preload="metadata"
                        className="w-full h-full object-contain"
                        src={url}
                        controlsList="nodownload"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        Your browser does not support the video preview.
                    </video>
                    {/* Overlay to prevent easy screen recording */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0">
                        Student ID: {Math.random().toString(36).substring(2, 8)}
                        Timestamp: {new Date().toISOString()}
                    </div>
                </div>
            ) : isAudioFile(fileName) ? (
                <audio
                    controls
                    className="w-3/5 rounded-md"
                    src={url}
                    controlsList="nodownload"
                >
                    Your browser does not support the audio preview.
                </audio>
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="mx-auto text-center">
                        <File className="mx-auto mb-2 h-20 w-20" />
                        <p className="mb-2 text-sm">
                            This preview didn't load because the file type is unsupported. Please try to open or download the file to view.
                        </p>
                        <Button variant="contained" endIcon={<Download />} disabled>
                            Download
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPreview;
