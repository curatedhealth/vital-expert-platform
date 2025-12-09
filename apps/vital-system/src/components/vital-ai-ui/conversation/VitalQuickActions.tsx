'use client';

import { cn } from '@/lib/utils';
import { 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import { useState } from 'react';

type FeedbackType = 'positive' | 'negative' | null;

interface VitalQuickActionsProps {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: FeedbackType) => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  isBookmarked?: boolean;
  feedback?: FeedbackType;
  showLabels?: boolean;
  variant?: 'default' | 'compact' | 'expanded';
  className?: string;
}

/**
 * VitalQuickActions - Action buttons for messages
 * 
 * Provides quick actions like copy, regenerate, feedback,
 * share, and bookmark for AI responses.
 */
export function VitalQuickActions({
  onCopy,
  onRegenerate,
  onFeedback,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  onReport,
  isBookmarked = false,
  feedback: initialFeedback,
  showLabels = false,
  variant = 'default',
  className
}: VitalQuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>(initialFeedback || null);
  
  const handleCopy = async () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleFeedback = (type: FeedbackType) => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    onFeedback?.(newFeedback);
  };
  
  const primaryActions = [
    onCopy && {
      icon: Copy,
      label: copied ? 'Copied!' : 'Copy',
      onClick: handleCopy,
      active: copied,
    },
    onRegenerate && {
      icon: RotateCcw,
      label: 'Regenerate',
      onClick: onRegenerate,
    },
    onFeedback && {
      icon: ThumbsUp,
      label: 'Helpful',
      onClick: () => handleFeedback('positive'),
      active: feedback === 'positive',
      activeClass: 'text-green-600 bg-green-50 dark:bg-green-950',
    },
    onFeedback && {
      icon: ThumbsDown,
      label: 'Not helpful',
      onClick: () => handleFeedback('negative'),
      active: feedback === 'negative',
      activeClass: 'text-red-600 bg-red-50 dark:bg-red-950',
    },
  ].filter(Boolean) as Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    active?: boolean;
    activeClass?: string;
  }>;
  
  const hasSecondaryActions = onShare || onBookmark || onEdit || onDelete || onReport;
  
  if (variant === 'expanded') {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {primaryActions.map((action, i) => (
          <Button
            key={i}
            variant={action.active ? "secondary" : "outline"}
            size="sm"
            onClick={action.onClick}
            className={cn(
              "h-8",
              action.active && action.activeClass
            )}
          >
            <action.icon className="h-4 w-4 mr-1.5" />
            {action.label}
          </Button>
        ))}
        
        {hasSecondaryActions && (
          <>
            <div className="w-px h-6 bg-border" />
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare} className="h-8">
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            )}
            {onBookmark && (
              <Button 
                variant={isBookmarked ? "secondary" : "outline"} 
                size="sm" 
                onClick={onBookmark}
                className="h-8"
              >
                <Bookmark className={cn(
                  "h-4 w-4 mr-1.5",
                  isBookmarked && "fill-current"
                )} />
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
            )}
          </>
        )}
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center",
        variant === 'compact' ? "gap-0.5" : "gap-1",
        className
      )}>
        {primaryActions.map((action, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={action.onClick}
                className={cn(
                  variant === 'compact' ? "h-7 w-7" : "h-8 w-8",
                  action.active && action.activeClass
                )}
              >
                <action.icon className={cn(
                  variant === 'compact' ? "h-3.5 w-3.5" : "h-4 w-4"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {action.label}
            </TooltipContent>
          </Tooltip>
        ))}
        
        {hasSecondaryActions && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={variant === 'compact' ? "h-7 w-7" : "h-8 w-8"}
                  >
                    <MoreHorizontal className={cn(
                      variant === 'compact' ? "h-3.5 w-3.5" : "h-4 w-4"
                    )} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">More actions</TooltipContent>
            </Tooltip>
            
            <DropdownMenuContent align="end">
              {onShare && (
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              {onBookmark && (
                <DropdownMenuItem onClick={onBookmark}>
                  <Bookmark className={cn(
                    "h-4 w-4 mr-2",
                    isBookmarked && "fill-current"
                  )} />
                  {isBookmarked ? 'Remove from saved' : 'Save'}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {(onShare || onBookmark || onEdit) && (onDelete || onReport) && (
                <DropdownMenuSeparator />
              )}
              {onReport && (
                <DropdownMenuItem onClick={onReport}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report issue
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
}

export default VitalQuickActions;
