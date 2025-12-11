'use client';

/**
 * Message bubble component stub
 * TODO: Implement full message display when chat feature is developed
 */

import React from 'react';
import type { Message } from '../types/conversation.types';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  message: Message;
  isCurrentUser?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showTimestamp = true,
  className,
}) => {
  const isUser = isCurrentUser ?? message.role === 'user';

  return (
    <div
      className={cn(
        'flex flex-col max-w-[80%]',
        isUser ? 'items-end ml-auto' : 'items-start mr-auto',
        className
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {showTimestamp && (
        <span className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default MessageBubble;
