/**
 * ChatSidebar - Conversation Management Sidebar
 * Clean, ChatGPT-style sidebar with conversation history and management
 */

'use client';

import { motion } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Search,
  MoreHorizontal,
  Trash2,
  Archive,
  Star,
  StarOff,
  Edit3,
  Calendar,
  PanelLeftClose
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
import type { Conversation } from '@/types/chat.types';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onToggleSidebar: () => void;
}

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString();
};

  const groups: { [key: string]: Conversation[] } = {
    Today: [],
    Yesterday: [],
    'Past 7 Days': [],
    'Past 30 Days': [],
    Older: []
  };

  conversations.forEach(conv => {

    if (diffDays === 0) groups.Today.push(conv);
    else if (diffDays === 1) groups.Yesterday.push(conv);
    else if (diffDays < 7) groups['Past 7 Days'].push(conv);
    else if (diffDays < 30) groups['Past 30 Days'].push(conv);
    else groups.Older.push(conv);
  });

  return groups;
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onToggleSidebar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingConversation, setEditingConversation] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Filter conversations based on search

    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

    setEditingConversation(conv.id);
    setEditingTitle(conv.title);
  };

    // TODO: Update conversation title
    // setEditingConversation(null);
    setEditingTitle('');
  };

    // TODO: Delete conversation
    // };

    // TODO: Toggle conversation star
    // };

    // TODO: Archive conversation
    // };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold">Conversations</span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNewConversation}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New conversation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="h-8 w-8 p-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close sidebar</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9 bg-muted/30"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedConversations).map(([period, convs]) => {
            if (convs.length === 0) return null;

            return (
              <div key={period} className="mb-6">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {period}
                </div>

                <div className="space-y-1">
                  {convs.map((conversation) => {

                    return (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group relative"
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150",
                            isActive
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted/50"
                          )}
                          onClick=() => !isEditing && onConversationSelect(conversation.id) onKeyDown=() => !isEditing && onConversationSelect(conversation.id) role="button" tabIndex={0}
                        >
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditSave(conversation.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingConversation(null);
                                  }
                                }}
                                onBlur={() => handleEditSave(conversation.id)}
                                className="h-7 text-sm"
                                autoFocus
                              />
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={cn(
                                    "font-medium text-sm truncate",
                                    isActive ? "text-primary" : "text-foreground"
                                  )}>
                                    {conversation.title}
                                  </h3>
                                  {conversation.favoriteMessages?.length > 0 && (
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  )}
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {conversation.messages?.length || 0} messages
                                    </span>
                                    {conversation.tags.length > 0 && (
                                      <Badge variant="secondary" className="text-xs h-4">
                                        {conversation.tags[0]}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(new Date(conversation.updatedAt))}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          {!isEditing && (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleEditStart(conversation)}>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleStar(conversation.id)}>
                                    {conversation.starred ? (
                                      <>
                                        <StarOff className="h-4 w-4 mr-2" />
                                        Unstar
                                      </>
                                    ) : (
                                      <>
                                        <Star className="h-4 w-4 mr-2" />
                                        Star
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleArchiveConversation(conversation.id)}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteConversation(conversation.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Start a new conversation to begin'
                }
              </p>
              {!searchQuery && (
                <Button size="sm" onClick={onNewConversation}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{conversations.length} total</span>
            <span>{conversations.filter(c => c.starred).length} starred</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};