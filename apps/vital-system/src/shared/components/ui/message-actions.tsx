'use client';

import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Share,
  Bookmark,
  RefreshCw,
  CheckIcon
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';

// 🎯 Action Component Interfaces
interface ActionsProps {
  children: React.ReactNode;
  className?: string;
}

interface ActionProps {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

interface MessageActionsProps {
  content: string;
  messageId?: string;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
  className?: string;
}

// 🎭 Generic Actions Container
export const Actions: React.FC<ActionsProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      className
    )}>
      {children}
    </div>
  );
};

// 🎯 Individual Action Button
export const Action: React.FC<ActionProps> = ({
  label,
  children,
  onClick,
  className,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "h-7 w-7 p-0 hover:bg-neutral-100 transition-colors",
              className
            )}
          >
            {children}
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// 📋 Copy Action with State
export const CopyAction: React.FC<{ content: string; className?: string }> = ({
  content,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Action
      label={copied ? "Copied!" : "Copy message"}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <CheckIcon className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Action>
  );
};

// 👍 Like Action with State
export const LikeAction: React.FC<{
  onLike?: () => void;
  isLiked?: boolean;
  className?: string;
}> = ({
  onLike,
  isLiked = false,
  className,
}) => {
  const [liked, setLiked] = useState(isLiked);

  const handleLike = () => {
    setLiked(!liked);
    onLike?.();
  };

  return (
    <Action
      label={liked ? "Remove like" : "Like message"}
      onClick={handleLike}
      className={cn(
        liked && "text-blue-600 bg-blue-50 hover:bg-blue-100",
        className
      )}
    >
      <ThumbsUp className={cn("h-3 w-3", liked && "fill-current")} />
    </Action>
  );
};

// 👎 Dislike Action with State
export const DislikeAction: React.FC<{
  onDislike?: () => void;
  isDisliked?: boolean;
  className?: string;
}> = ({
  onDislike,
  isDisliked = false,
  className,
}) => {
  const [disliked, setDisliked] = useState(isDisliked);

  const handleDislike = () => {
    setDisliked(!disliked);
    onDislike?.();
  };

  return (
    <Action
      label={disliked ? "Remove dislike" : "Dislike message"}
      onClick={handleDislike}
      className={cn(
        disliked && "text-red-600 bg-red-50 hover:bg-red-100",
        className
      )}
    >
      <ThumbsDown className={cn("h-3 w-3", disliked && "fill-current")} />
    </Action>
  );
};

// 🚀 Complete Message Actions Component
export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  messageId,
  onLike,
  onDislike,
  onShare,
  onBookmark,
  onRegenerate,
  showRegenerate = false,
  className,
}) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Response',
        text: content,
      }).catch(console.error);
    } else {
      // Fallback to copying link
      const url = window.location.href;
      navigator.clipboard.writeText(url).catch(console.error);
    }
    onShare?.();
  };

  const handleBookmark = () => {
    // Implement bookmark functionality
    onBookmark?.();
  };

  const handleRegenerate = () => {
    onRegenerate?.();
  };

  return (
    <Actions className={cn("group-hover:opacity-100", className)}>
      <CopyAction content={content} />

      <LikeAction onLike={onLike} />

      <DislikeAction onDislike={onDislike} />

      <Action label="Share message" onClick={handleShare}>
        <Share className="h-3 w-3" />
      </Action>

      <Action label="Bookmark message" onClick={handleBookmark}>
        <Bookmark className="h-3 w-3" />
      </Action>

      {showRegenerate && (
        <Action label="Regenerate response" onClick={handleRegenerate}>
          <RefreshCw className="h-3 w-3" />
        </Action>
      )}

      <Action label="More options">
        <MoreHorizontal className="h-3 w-3" />
      </Action>
    </Actions>
  );
};

// Export all components
export default MessageActions;