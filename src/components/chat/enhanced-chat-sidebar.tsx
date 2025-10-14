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
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
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
    selectAgent,
    clearSelectedAgent
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

  // Get available agents with search filtering
  const availableAgents = useMemo(() => {
    let agents = getAgents().filter(agent => 
      !selectedAgents.includes(agent.id)
    );

    // Apply search filter
    if (agentSearchQuery.trim()) {
      const query = agentSearchQuery.toLowerCase();
      agents = agents.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.display_name?.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query) ||
        agent.businessFunction?.toLowerCase().includes(query) ||
        agent.knowledgeDomains?.some(domain => domain.toLowerCase().includes(query))
      );
    }

    return agents;
  }, [getAgents, selectedAgents, agentSearchQuery]);

  const handleNewChat = () => {
    createNewChat();
    setActiveTab('conversations');
  };

  const handleSelectAgent = async (agent: Agent) => {
    try {
      await selectAgent(agent.id);
      setSelectedAgents(prev => [...prev, agent.id]);
      setShowAgentPanel(false); // Close the panel after selection
    } catch (error) {
      console.error('Failed to select agent:', error);
    }
  };

  const handleRemoveAgent = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(id => id !== agentId));
    // If this was the currently selected agent, clear it
    if (selectedAgent?.id === agentId) {
      clearSelectedAgent();
    }
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
    <div className={cn("flex flex-col h-full bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 w-80 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold text-gray-900">VITAL</h2>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-bold text-gray-900">expert</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Mode Toggles */}
      <div className="p-4 space-y-4 border-b border-gray-200 bg-gray-50/50">
        {/* Auto/Manual Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Auto</span>
          </div>
          <Switch
            checked={interactionMode === 'automatic'}
            onCheckedChange={(checked) => {
              setInteractionMode(checked ? 'automatic' : 'manual');
              if (checked) {
                clearSelectedAgent(); // Clear selected agent when switching to auto mode
              }
            }}
            className="data-[state=checked]:bg-blue-600"
          />
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Manual</span>
          </div>
        </div>

        {/* Autonomous Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Autonomous</span>
          </div>
          <Switch
            checked={autonomousMode}
            onCheckedChange={setAutonomousMode}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="conversations" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-medium"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Chats
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-medium"
            >
              <Users className="h-3 w-3 mr-1" />
              Agents
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-medium"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="conversations" className="flex-1 flex flex-col mt-0">
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200">
            <Button 
              onClick={handleNewChat} 
              className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 space-y-3 border-b border-gray-200 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-white border-gray-200 hover:bg-gray-50">
                    <Filter className="h-3 w-3 mr-2" />
                    <span className="text-xs">{filterBy === 'all' ? 'All' : filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32">
                  <DropdownMenuItem onClick={() => setFilterBy('all')} className="text-xs">All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('unread')} className="text-xs">Unread</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('pinned')} className="text-xs">Pinned</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('archived')} className="text-xs">Archived</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-white border-gray-200 hover:bg-gray-50">
                    <SortAsc className="h-3 w-3 mr-2" />
                    <span className="text-xs">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32">
                  <DropdownMenuItem onClick={() => setSortBy('recent')} className="text-xs">Recent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')} className="text-xs">Name</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('unread')} className="text-xs">Unread</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm border border-transparent",
                      currentChat?.id === conversation.id && "bg-blue-50 border-blue-200 shadow-sm"
                    )}
                    onClick={() => selectChat(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate text-gray-900">{conversation.title}</h4>
                        {conversation.isPinned && <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {conversation.timestamp.toLocaleTimeString()}
                        </span>
                        {conversation.agentName && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            {conversation.agentName}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs bg-red-500 text-white">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="agents" className="flex-1 flex flex-col mt-0">
          {/* Add Agents Panel */}
          {showAgentPanel && (
            <Card className="m-4 border-gray-200 shadow-sm">
              <CardHeader className="pb-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900">Add agents to chat</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAgentPanel(false)}
                    className="h-6 w-6 p-0 hover:bg-gray-200"
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
                    value={agentSearchQuery}
                    onChange={(e) => setAgentSearchQuery(e.target.value)}
                    className="pl-10 pr-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {agentSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAgentSearchQuery('')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {availableAgents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bot className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No agents found</p>
                      </div>
                    ) : (
                      availableAgents.slice(0, 5).map((agent) => (
                        <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium truncate text-gray-900">
                                {agent.display_name || agent.name}
                              </h4>
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
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
                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Selected Agents */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Selected Agents</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgentPanel(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>

            {selectedAgents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No agents added yet</p>
                <p className="text-xs text-gray-400">Click + to add some</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedAgents.map((agentId) => {
                  const agent = getAgents().find(a => a.id === agentId);
                  if (!agent) return null;
                  
                  return (
                    <div key={agentId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate text-gray-900">
                            {agent.display_name || agent.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Active
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {agent.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAgent(agentId)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
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
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 text-gray-700">
              <Users className="h-4 w-4 mr-2" />
              Agent Store
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 flex flex-col mt-0">
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Chat Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Auto-save conversations</span>
                    <p className="text-xs text-gray-500">Automatically save chat history</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Show typing indicators</span>
                    <p className="text-xs text-gray-500">Display when agents are typing</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Enable notifications</span>
                    <p className="text-xs text-gray-500">Get notified of new messages</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-600" />
                Agent Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Auto-select best agent</span>
                    <p className="text-xs text-gray-500">Let AI choose the optimal agent</p>
                  </div>
                  <Switch 
                    checked={interactionMode === 'automatic'} 
                    onCheckedChange={(checked) => {
                      setInteractionMode(checked ? 'automatic' : 'manual');
                      if (checked) clearSelectedAgent();
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Enable autonomous mode</span>
                    <p className="text-xs text-gray-500">Allow agents to work independently</p>
                  </div>
                  <Switch 
                    checked={autonomousMode} 
                    onCheckedChange={setAutonomousMode}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
