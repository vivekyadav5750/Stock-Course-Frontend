import { MetadataInfo as MetadataInfoType } from "@/types";
import { Clock, User } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetadataInfoProps {
    createdBy?: MetadataInfoType;
    updatedBy?: MetadataInfoType;
    className?: string;
}

export function MetadataInfo({ createdBy, updatedBy, className = "" }: MetadataInfoProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            return "Just now";
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    const formatFullDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <TooltipProvider>
            <div className={`flex items-center flex-wrap gap-2 text-xs ${className}`}>
                {/* Created By */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted cursor-help transition-colors">
                            <User className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                <strong className="text-foreground">{createdBy?.user?.concatedName || "Unknown"}</strong>
                                {createdBy?.date && (
                                    <span className="text-muted-foreground"> {formatDate(createdBy.date)}</span>
                                )}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">
                            {createdBy ? (
                                <>
                                    Created by <strong>{createdBy?.user?.concatedName || "Unknown"}</strong>
                                    <br />
                                    {formatFullDate(createdBy?.date)}
                                </>
                            ) : (
                                "Creator information not available"
                            )}
                        </p>
                    </TooltipContent>
                </Tooltip>

                {/* Updated By */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted cursor-help transition-colors">
                            <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Updated {updatedBy?.date && formatDate(updatedBy.date)}
                                {updatedBy?.user && (
                                    <> by <strong className="text-foreground">{updatedBy.user.concatedName || "Unknown"}</strong></>
                                )}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">
                            {updatedBy ? (
                                <>
                                    Updated by <strong>{updatedBy?.user?.concatedName || "Unknown"}</strong>
                                    <br />
                                    {formatFullDate(updatedBy?.date)}
                                </>
                            ) : (
                                "Update information not available"
                            )}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
