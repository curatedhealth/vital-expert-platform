/**
 * Enhanced Chat Sidebar with Comprehensive Chat and Agent Management
 * Following leading practices for modern chat interfaces
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  User,
  MoreHorizontal,
  Trash2,
  Edit3,
  Star,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Check,
  Sparkles,
  Users,
  Bot,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { EnhancedAgentCard } from '@/components/ui/enhanced-agent-card';
import type { Agent } from '@/types/agent.types';

interface EnhancedChatSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  messageCount: number;
}

export function EnhancedChatSidebar({ 
  className, 
  isCollapsed = false, 
  onToggleCollapse 
}: EnhancedChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'conversations' | 'agents' | 'settings'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'unread'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const {
    chats,
    currentChat,
    selectedAgent,
    interactionMode,
    autonomousMode,
    setInteractionMode,
    setAutonomousMode,
    createNewChat,
    selectChat,
    deleteChat,
    pinChat,
    archiveChat,
    getAgents,
    selectAgent
  } = useChatStore();

  const { agents: globalAgents, loadAgents } = useAgentsStore();

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Mock conversations data - in real app, this would come from the chat store
  const conversations: Conversation[] = useMemo(() => {
    return chats.map(chat => ({
      id: chat.id,
      title: chat.title || 'New Chat',
      lastMessage: chat.messages[chat.messages.length - 1]?.content || 'No messages yet',
      timestamp: new Date(chat.updatedAt),
      agentId: chat.agentId,
      agentName: chat.agentName,
      unreadCount: 0, // This would be calculated from unread messages
      isPinned: false, // This would come from chat metadata
      isArchived: false, // This would come from chat metadata
      messageCount: chat.messages.length
    }));
  }, [chats]);

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.agentName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'pinned':
        filtered = filtered.filter(conv => conv.isPinned);
        break;
      case 'archived':
        filtered = filtered.filter(conv => conv.isArchived);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'unread':
        filtered.sort((a, b) => b.unreadCount - a.unreadCount);
        break;
    }

    return filtered;
  }, [conversations, searchQuery, filterBy, sortBy]);

  // Get available agents
  const availableAgents = useMemo(() => {
    return getAgents().filter(agent => 
      !selectedAgents.includes(agent.id)
    );
  }, [getAgents, selectedAgents]);

  const handleNewChat = () => {
    createNewChat();
    setActiveTab('conversations');
  };

  const handleSelectAgent = async (agent: Agent) => {
    try {
      await selectAgent(agent.id);
      setSelectedAgents(prev => [...prev, agent.id]);
    } catch (error) {
      console.error('Failed to select agent:', error);
    }
  };

  const handleRemoveAgent = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(id => id !== agentId));
  };

  if (isCollapsed) {
    return (
      <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 space-y-2 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'conversations' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('conversations')}
                  className="w-full justify-center"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Conversations</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'agents' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('agents')}
                  className="w-full justify-center"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Agents</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('settings')}
                  className="w-full justify-center"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200 w-80", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-semibold text-gray-900">VITAL</h2>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-lg font-semibold text-gray-900">expert</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Mode Toggles */}
      <div className="p-4 space-y-4 border-b">
        {/* Auto/Manual Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Auto</span>
          </div>
          <Switch
            checked={interactionMode === 'automatic'}
            onCheckedChange={(checked) => setInteractionMode(checked ? 'automatic' : 'manual')}
          />
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Manual</span>
          </div>
        </div>

        {/* Autonomous Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Autonomous</span>
          </div>
          <Switch
            checked={autonomousMode}
            onCheckedChange={setAutonomousMode}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="flex-1 flex flex-col mt-0">
          {/* New Chat Button */}
          <div className="p-4 border-b">
            <Button onClick={handleNewChat} className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 space-y-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    {filterBy === 'all' ? 'All' : filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterBy('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('unread')}>Unread</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('pinned')}>Pinned</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('archived')}>Archived</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('recent')}>Recent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('unread')}>Unread</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                    currentChat?.id === conversation.id && "bg-blue-50 border border-blue-200"
                  )}
                  onClick={() => selectChat(conversation.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{conversation.title}</h4>
                      {conversation.isPinned && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {conversation.timestamp.toLocaleTimeString()}
                      </span>
                      {conversation.agentName && (
                        <Badge variant="secondary" className="text-xs">
                          {conversation.agentName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="agents" className="flex-1 flex flex-col mt-0">
          {/* Add Agents Panel */}
          {showAgentPanel && (
            <Card className="m-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Add agents to chat</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAgentPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {availableAgents.length} of {globalAgents.length} agents available
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search agents by name..."
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {availableAgents.slice(0, 5).map((agent) => (
                      <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium truncate">
                              {agent.display_name || agent.name}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              Tier {agent.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {agent.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectAgent(agent)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Selected Agents */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Selected Agents</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgentPanel(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>

            {selectedAgents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No agents added yet. Click + to add some.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedAgents.map((agentId) => {
                  const agent = getAgents().find(a => a.id === agentId);
                  if (!agent) return null;
                  
                  return (
                    <div key={agentId} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {agent.display_name || agent.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {agent.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAgent(agentId)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agent Store Link */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Agent Store
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 flex flex-col mt-0">
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Chat Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-save conversations</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show typing indicators</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable notifications</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3">Agent Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-select best agent</span>
                  <Switch checked={interactionMode === 'automatic'} onCheckedChange={(checked) => setInteractionMode(checked ? 'automatic' : 'manual')} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable autonomous mode</span>
                  <Switch checked={autonomousMode} onCheckedChange={setAutonomousMode} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
