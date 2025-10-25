'use client';

import { ChevronLeft, ChevronRight, Zap, User } from 'lucide-react';
import * as React from 'react';

import { Button } from '@vital/ui/components/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@vital/ui/components/sidebar';
import { Switch } from '@vital/ui/components/switch';
import { cn } from '@vital/ui/lib/utils';
import { VitalLogo } from '@/shared/components/vital-logo';

import { NavAiAgents } from './nav-ai-agents';
import { NavAskExpert } from './nav-ask-expert';

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
  onAgentRemove?: (agentId: string) => void;
  selectedAgentId?: string;
  agents?: Agent[];
  formatDate: (date: string) => string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mounted?: boolean;
  interactionMode?: 'automatic' | 'manual';
  onToggleMode?: (mode: 'automatic' | 'manual') => void;
  autonomousMode?: boolean;
  onToggleAutonomous?: (enabled: boolean) => void;
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
  onAgentRemove,
  selectedAgentId,
  agents = [],
  formatDate,
  isCollapsed = false,
  onToggleCollapse,
  mounted = true,
  interactionMode,
  onToggleMode,
  autonomousMode = false,
  onToggleAutonomous,
  ...props
}: ChatSidebarProps) {
  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border bg-vital-gray-95">
        <div className={cn("px-3 py-2", isCollapsed && "px-1")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isCollapsed && (
                <VitalLogo size="sm" serviceLine="regulatory" animated="pulse" />
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

          {/* Interaction Mode Toggles */}
          {!isCollapsed && (
            <div className="mt-3 space-y-2">
              {/* Agent Selection: Auto vs Manual */}
              {onToggleMode && (
                <div className="flex items-center gap-2 px-2 py-1.5 border border-vital-gray-80 rounded-lg bg-vital-gray-95">
                  <div className="flex items-center gap-1">
                    <Zap className={`h-3 w-3 ${interactionMode === 'automatic' ? 'text-clinical-green' : 'text-vital-gray-60'}`} />
                    <span className="text-xs font-medium text-vital-black">Auto</span>
                  </div>
                  <Switch
                    checked={interactionMode === 'manual'}
                    onCheckedChange={(checked) => onToggleMode(checked ? 'manual' : 'automatic')}
                  />
                  <div className="flex items-center gap-1">
                    <User className={`h-3 w-3 ${interactionMode === 'manual' ? 'text-data-purple' : 'text-vital-gray-60'}`} />
                    <span className="text-xs font-medium text-vital-black">Manual</span>
                  </div>
                </div>
              )}

              {/* Autonomous Mode Toggle */}
              {onToggleAutonomous && (
                <div className="flex items-center justify-between px-2 py-1.5 border border-vital-gray-80 rounded-lg bg-vital-gray-95">
                  <div className="flex items-center gap-1">
                    <Zap className={`h-3 w-3 ${autonomousMode ? 'text-blue-500' : 'text-vital-gray-60'}`} />
                    <span className="text-xs font-medium text-vital-black">Autonomous</span>
                  </div>
                  <Switch
                    checked={autonomousMode}
                    onCheckedChange={onToggleAutonomous}
                  />
                </div>
              )}
            </div>
          )}
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
          onAgentRemove={onAgentRemove}
          selectedAgentId={selectedAgentId}
          agents={agents}
          isCollapsed={isCollapsed}
          mounted={mounted}
        />
      </SidebarContent>
    </Sidebar>
  );
}