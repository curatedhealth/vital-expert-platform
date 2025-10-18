'use client';

/**
 * Unified Chat Sidebar - Single Sidebar for All Chat Functionality
 * Consolidates: Conversations, Agents, Mode Selection, Settings
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Plus, Search, Settings, ChevronLeft, ChevronRight,
  Bot, Users, Zap, Target, Filter, X, Check, Star, Sparkles,
  Activity, AlertCircle, CheckCircle, ChevronDown, Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { useAgentsStore } from '@/lib/stores/agents-store';
import type { Agent } from '@/types/agent.types';

interface UnifiedChatSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function UnifiedChatSidebar({ 
  className, 
  isCollapsed = false, 
  onToggleCollapse 
}: UnifiedChatSidebarProps) {
  // State
  const [activeTab, setActiveTab] = useState<'chats' | 'agents'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [addingAgent, setAddingAgent] = useState<string | null>(null);

  // Chat Store
  const {
    chats,
    currentChat,
    selectedAgent,
    selectedAgents,
    activeAgentId,
    createNewChat,
    selectChat,
    deleteChat,
    addSelectedAgent,
    removeSelectedAgent,
    setActiveAgent,
    getCurrentChatModes,
    updateChatMode,
  } = useChatStore();

  // Agents Store
  const { agents: globalAgents, loadAgents } = useAgentsStore();

  // Load agents
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Get current modes
  const currentModes = getCurrentChatModes();
  const isAutomaticMode = currentModes?.interactionMode === 'automatic';
  const isAutonomousMode = currentModes?.autonomousMode === true;

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => 
      chat.title?.toLowerCase().includes(query) ||
      chat.agentName?.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  // Filter agents
  const availableAgents = useMemo(() => {
    let agents = globalAgents.filter(agent => 
      !selectedAgents.some(selected => selected.id === agent.id)
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      agents = agents.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.display_name?.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query)
      );
    }

    return agents;
  }, [globalAgents, selectedAgents, searchQuery]);

  // Handlers
  const handleNewChat = () => {
    createNewChat();
    setSearchQuery('');
  };

  const handleSelectAgent = async (agent: Agent) => {
    try {
      setAddingAgent(agent.id);
      addSelectedAgent(agent);
      setTimeout(() => {
        setAddingAgent(null);
        setShowAgentSelector(false);
      }, 800);
    } catch (error) {
      console.error('Error selecting agent:', error);
      setAddingAgent(null);
    }
  };

  const handleToggleMode = (mode: 'manual' | 'automatic' | 'autonomous') => {
    if (mode === 'autonomous') {
      updateChatMode({ autonomousMode: !isAutonomousMode });
    } else {
      updateChatMode({ 
        interactionMode: mode,
        autonomousMode: false 
      });
    }
  };

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className={cn("flex flex-col h-full bg-white border-r border-gray-200 w-16", className)}>
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
        
        <div className="flex-1 flex flex-col items-center gap-2 py-4">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chats')}
            className="h-10 w-10 p-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTab === 'agents' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('agents')}
            className="h-10 w-10 p-0"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200 w-80", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold text-gray-900">VITAL</h2>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-bold text-blue-600">expert</span>
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

      {/* Mode Selector */}
      <div className="p-4 border-b bg-gray-50">
        <div className="text-xs font-semibold text-gray-500 mb-2">Interaction Mode</div>
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-gray-200">
          <Button
            variant={!isAutomaticMode && !isAutonomousMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleToggleMode('manual')}
            className={cn(
              "text-xs h-8",
              !isAutomaticMode && !isAutonomousMode && "bg-blue-600 text-white shadow-sm"
            )}
          >
            <Zap className="h-3 w-3 mr-1" />
            Manual
          </Button>
          <Button
            variant={isAutomaticMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleToggleMode('automatic')}
            className={cn(
              "text-xs h-8",
              isAutomaticMode && "bg-green-600 text-white shadow-sm"
            )}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Auto
          </Button>
          <Button
            variant={isAutonomousMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleToggleMode('autonomous')}
            className={cn(
              "text-xs h-8",
              isAutonomousMode && "bg-purple-600 text-white shadow-sm"
            )}
          >
            <Target className="h-3 w-3 mr-1" />
            Goal
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
          <TabsTrigger value="chats" className="rounded-none">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chats
            {chats.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {chats.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="agents" className="rounded-none">
            <Bot className="h-4 w-4 mr-2" />
            Agents
            {selectedAgents.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {selectedAgents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Chats Tab */}
        <TabsContent value="chats" className="flex-1 flex flex-col m-0 overflow-hidden">
          {/* New Chat Button */}
          <div className="p-3 border-b">
            <Button 
              onClick={handleNewChat} 
              className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                filteredConversations.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      "hover:bg-gray-50 border border-transparent",
                      currentChat?.id === chat.id && "bg-blue-50 border-blue-200"
                    )}
                    onClick={() => selectChat(chat.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate text-gray-900">
                        {chat.title || 'New Chat'}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.messages?.[chat.messages.length - 1]?.content || 'No messages'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </span>
                        {chat.agentName && (
                          <Badge variant="secondary" className="text-xs">
                            {chat.agentName}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="flex-1 flex flex-col m-0 overflow-hidden">
          {/* Add Agent Button */}
          <div className="p-3 border-b">
            <Button 
              onClick={() => setShowAgentSelector(!showAgentSelector)} 
              className="w-full justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {showAgentSelector ? 'Close Selector' : 'Add Agent'}
            </Button>
          </div>

          {/* Agent Selector Panel */}
          {showAgentSelector && (
            <Card className="m-3 border-2 border-blue-200">
              <CardContent className="p-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {availableAgents.slice(0, 10).map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 border cursor-pointer"
                        onClick={() => handleSelectAgent(agent)}
                      >
                        <AgentAvatar agent={agent} size="sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {agent.display_name || agent.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {agent.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={addingAgent === agent.id}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          {addingAgent === agent.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Selected Agents */}
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              Selected Agents ({selectedAgents.length})
            </div>
          </div>

          <ScrollArea className="flex-1 px-3">
            {selectedAgents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No agents selected</p>
                <p className="text-xs text-gray-400 mt-1">Add agents to start chatting</p>
              </div>
            ) : (
              <div className="space-y-2 pb-3">
                {selectedAgents.map((agent) => {
                  const isActive = activeAgentId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isActive 
                          ? "bg-blue-50 border-blue-300 shadow-sm" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      )}
                      onClick={() => setActiveAgent(agent.id)}
                    >
                      <AgentAvatar agent={agent} size="sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {agent.display_name || agent.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {agent.description}
                        </p>
                        {isActive && (
                          <Badge className="mt-1 text-xs bg-blue-100 text-blue-700">
                            Active
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedAgent(agent.id);
                        }}
                        className="h-8 w-8 p-0 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}
