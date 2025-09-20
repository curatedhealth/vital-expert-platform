'use client';

import * as React from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavAskExpert } from './nav-ask-expert';
import { NavAiAgents } from './nav-ai-agents';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
}

interface ChatSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats: Chat[];
  currentChat: Chat | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onAgentStoreClick: () => void;
  onCreateAgentClick: () => void;
  onAgentSelect?: (agentId: string) => void;
  selectedAgentId?: string;
  agents?: Agent[];
  formatDate: (date: string) => string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mounted?: boolean;
}

export function ChatSidebar({
  chats,
  currentChat,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectChat,
  onAgentStoreClick,
  onCreateAgentClick,
  onAgentSelect,
  selectedAgentId,
  agents = [],
  formatDate,
  isCollapsed = false,
  onToggleCollapse,
  mounted = true,
  ...props
}: ChatSidebarProps) {
  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={cn("px-3 py-2", isCollapsed && "px-1")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package2 className="h-6 w-6" />
              {!isCollapsed && (
                <h2 className="text-lg font-semibold tracking-tight">
                  Context Menu
                </h2>
              )}
            </div>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-4 py-4">
        <NavAskExpert
          chats={chats}
          currentChat={currentChat}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onNewChat={onNewChat}
          onSelectChat={onSelectChat}
          formatDate={formatDate}
          isCollapsed={isCollapsed}
        />
        <NavAiAgents
          onAgentStoreClick={onAgentStoreClick}
          onCreateAgentClick={onCreateAgentClick}
          onAgentSelect={onAgentSelect}
          selectedAgentId={selectedAgentId}
          agents={agents}
          isCollapsed={isCollapsed}
          mounted={mounted}
        />
      </SidebarContent>
    </Sidebar>
  );
}