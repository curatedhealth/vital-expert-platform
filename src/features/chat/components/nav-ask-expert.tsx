'use client';

import * as React from 'react';
import { MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

interface NavAskExpertProps {
  chats: Chat[];
  currentChat: Chat | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  formatDate: (date: string) => string;
  isCollapsed?: boolean;
}

export function NavAskExpert({
  chats,
  currentChat,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectChat,
  formatDate,
  isCollapsed = false,
}: NavAskExpertProps) {
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-3">
      <div className="space-y-1">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          {!isCollapsed && "Ask Expert"}
        </h2>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              'w-full',
              isCollapsed ? 'justify-center px-2' : 'justify-start',
            )}
            onClick={onNewChat}
          >
            <MessageSquare className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">New Chat</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'w-full',
              isCollapsed ? 'justify-center px-2' : 'justify-start',
            )}
          >
            <FileText className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Manage Chats</span>}
          </Button>
        </div>

        {/* Search input */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <Input
              type="search"
              placeholder="Search Chats"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Chat History */}
        {!isCollapsed && filteredChats.length > 0 && (
          <div className="px-4 pb-2">
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {filteredChats.slice(0, 8).map((chat) => (
                  <Button
                    key={chat.id}
                    variant={currentChat?.id === chat.id ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      "w-full justify-start h-auto p-2 text-left text-xs",
                      currentChat?.id === chat.id && "bg-muted"
                    )}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-muted-foreground">{formatDate(chat.updatedAt)}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}