/**
 * Message Actions Component
 * Quick action buttons for messages (copy, share, edit, etc.)
 */

import {
  Copy,
  Share,
  Edit3,
  Bookmark,
  Link,
  Download
} from 'lucide-react';
import React from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import type { Message } from '@/types/chat.types';

interface MessageActionsProps {
  message: Message;
  onCopy?: () => void;
  onShare?: () => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onBookmark?: (messageId: string) => void;
  onCopyLink?: () => void;
  onDownload?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onCopy,
  onShare,
  onEdit,
  onBookmark,
  onCopyLink,
  onDownload
}) => {

    {
      icon: Copy,
      tooltip: 'Copy message',
      onClick: onCopy,
      show: true
    },
    {
      icon: Share,
      tooltip: 'Share message',
      onClick: onShare,
      show: true
    },
    {
      icon: Edit3,
      tooltip: 'Edit message',
      onClick: () => onEdit?.(message.id, message.content),
      show: isUser
    },
    {
      icon: Bookmark,
      tooltip: 'Bookmark message',
      onClick: () => onBookmark?.(message.id),
      show: !isUser
    },
    {
      icon: Link,
      tooltip: 'Copy link',
      onClick: onCopyLink,
      show: true
    },
    {
      icon: Download,
      tooltip: 'Download artifacts',
      onClick: onDownload,
      show: hasArtifacts
    }
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {actions
          .filter(action => action.show)
          .map((action, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className="h-6 w-6 p-0 hover:bg-muted/80"
                >
                  <action.icon className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {action.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
      </div>
    </TooltipProvider>
  );
};