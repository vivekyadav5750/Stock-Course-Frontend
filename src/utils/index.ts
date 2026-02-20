import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';
import { getAccessToken } from '@/lib/axios';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


/**
 * Builds an authenticated video streaming URL for a lesson
 * @param lessonId - The lesson ID to stream
 * @returns The full streaming URL with authentication token
 */
export function buildAuthenticatedVideoUrl(lessonId: string): string {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:2000/api';
    const token = getAccessToken();
    const streamUrl = `/lesson/preview/${lessonId}`;

    return token
        ? `${apiBaseUrl}${streamUrl}?token=${encodeURIComponent(token)}`
        : `${apiBaseUrl}${streamUrl}`;
}
