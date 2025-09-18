'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { useChatStore } from '@/lib/stores/chat-store';
import { AgentSelector } from './agent-selector';
import { AgentCreator } from './agent-creator';
import {
  Plus,
  Search,
  MessageSquare,
  MoreHorizontal,
  Settings,
  Trash2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const {
    chats,
    currentChat,
    selectedAgent,
    agents,
    createNewChat,
    selectChat,
    deleteChat,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if dateObj is valid
    if (isNaN(dateObj.getTime())) {
      return 'Unknown';
    }

    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return dateObj.toLocaleDateString();
  };

  const groupChatsByDate = (chats: typeof filteredChats) => {
    const groups: Record<string, typeof filteredChats> = {};

    chats.forEach((chat) => {
      const dateKey = formatDate(chat.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(chat);
    });

    return groups;
  };

  const groupedChats = groupChatsByDate(filteredChats);

  return (
    <>
      <div
        className={cn(
          'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
          isOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-trust-blue" />
              <h2 className="font-semibold text-deep-charcoal">AI Chat</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={createNewChat}
            className="w-full bg-progress-teal hover:bg-progress-teal/90 mb-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-gray" />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Agent Selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-deep-charcoal">Current Agent</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAgentCreator(true)}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create
            </Button>
          </div>
          <AgentSelector compact onEditAgent={(agent) => {
            setEditingAgent(agent);
            setShowAgentCreator(true);
          }} />
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {Object.entries(groupedChats).length === 0 ? (
                <div className="text-center py-8 text-medical-gray">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Start a new chat to begin</p>
                </div>
              ) : (
                Object.entries(groupedChats).map(([dateGroup, chats]) => (
                  <div key={dateGroup}>
                    <h4 className="text-xs font-medium text-medical-gray uppercase tracking-wider mb-2">
                      {dateGroup}
                    </h4>
                    <div className="space-y-1">
                      {chats.map((chat) => {
                        const agent = agents.find((a) => a.id === chat.agentId);
                        const isActive = currentChat?.id === chat.id;

                        return (
                          <div
                            key={chat.id}
                            className={cn(
                              'group relative p-3 rounded-lg cursor-pointer transition-colors',
                              isActive
                                ? 'bg-progress-teal/10 border border-progress-teal/20'
                                : 'hover:bg-background-gray'
                            )}
                            onClick={() => selectChat(chat.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <AgentAvatar
                                    avatar={agent?.avatar || ''}
                                    name={agent?.name || ''}
                                    size="sm"
                                  />
                                  <span className="text-xs text-medical-gray">
                                    {agent?.name}
                                  </span>
                                </div>
                                <h5 className="text-sm font-medium text-deep-charcoal line-clamp-1 mb-1">
                                  {chat.title}
                                </h5>
                                {chat.lastMessage && (
                                  <p className="text-xs text-medical-gray line-clamp-2">
                                    {chat.lastMessage}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {chat.messageCount} messages
                                  </Badge>
                                  <span className="text-xs text-medical-gray">
                                    {chat.updatedAt.toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChat(chat.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <Settings className="mr-2 h-4 w-4" />
            Chat Settings
          </Button>
        </div>
      </div>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute left-4 top-4 z-10 bg-white border border-gray-200 shadow-md"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Agent Creator Modal */}
      {showAgentCreator && (
        <AgentCreator
          isOpen={showAgentCreator}
          onClose={() => {
            setShowAgentCreator(false);
            setEditingAgent(null);
          }}
          onSave={() => {
            setShowAgentCreator(false);
            setEditingAgent(null);
          }}
          editingAgent={editingAgent}
        />
      )}
    </>
  );
}