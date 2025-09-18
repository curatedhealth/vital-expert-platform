'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Agent } from '@/lib/stores/chat-store';
import {
  Menu,
  Plus,
  MoreHorizontal,
  Share,
  Download,
  Settings,
  Zap,
  Brain,
  Users,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  selectedAgent: Agent | null;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onEditAgent?: (agent: Agent) => void;
}

export function ChatHeader({
  selectedAgent,
  onToggleSidebar,
  onNewChat,
  onEditAgent,
}: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {selectedAgent && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-trust-blue/10 to-progress-teal/10 flex items-center justify-center">
                <AgentAvatar
                  avatar={selectedAgent.avatar}
                  name={selectedAgent.name}
                  size="lg"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-deep-charcoal">
                    {selectedAgent.name}
                  </h1>
                  {selectedAgent.ragEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      RAG
                    </Badge>
                  )}
                  {selectedAgent.isCustom && (
                    <Badge variant="outline" className="text-xs bg-market-purple/10 text-market-purple">
                      Custom
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-medical-gray">
                  {selectedAgent.description}
                </p>
              </div>
            </div>
          )}

          {!selectedAgent && (
            <div>
              <h1 className="text-lg font-semibold text-deep-charcoal">
                VITALpath AI Chat
              </h1>
              <p className="text-sm text-medical-gray">
                Choose an AI expert to start your conversation
              </p>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Stats */}
          {selectedAgent && (
            <div className="hidden md:flex items-center gap-4 text-xs text-medical-gray mr-4">
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {selectedAgent.model}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~2s response
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Online
              </div>
            </div>
          )}

          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            variant="outline"
            size="sm"
            className="hidden sm:flex"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Chat Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share Conversation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Chat Settings
              </DropdownMenuItem>
              {selectedAgent && onEditAgent && (
                <DropdownMenuItem onClick={() => onEditAgent(selectedAgent)}>
                  <Brain className="mr-2 h-4 w-4" />
                  Agent Settings
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Agent Capabilities Bar */}
      {selectedAgent && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-medical-gray whitespace-nowrap">
            Capabilities:
          </span>
          {selectedAgent.capabilities.map((capability) => (
            <Badge
              key={capability}
              variant="secondary"
              className="text-xs whitespace-nowrap bg-background-gray"
            >
              {capability}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}