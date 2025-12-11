'use client';

/**
 * Chat history component stub
 * TODO: Implement chat history when chat feature is developed
 */

import React from 'react';
import type { Conversation } from '../types/conversation.types';

export interface ChatHistoryProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  className,
}) => {
  if (conversations.length === 0) {
    return (
      <div className={className}>
        <p className="text-muted-foreground text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ul className="space-y-2">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className={`p-2 rounded cursor-pointer ${
              activeId === conversation.id ? 'bg-accent' : 'hover:bg-muted'
            }`}
            onClick={() => onSelect?.(conversation.id)}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm truncate">
                {conversation.messages[0]?.content.slice(0, 30) || 'New conversation'}
              </span>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conversation.id);
                  }}
                  className="text-muted-foreground hover:text-destructive text-xs"
                >
                  Delete
                </button>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {conversation.updatedAt.toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatHistory;
