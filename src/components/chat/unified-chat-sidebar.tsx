'use client';

/**
 * Unified Chat Sidebar - Single Sidebar for All Chat Functionality
 * Consolidates: Conversations, Agents, Mode Selection, Settings
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState<string>('');

  // Focus management refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const addAgentButtonRef = useRef<HTMLButtonElement>(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = (e.target as HTMLElement).tagName === 'INPUT' || 
                       (e.target as HTMLElement).tagName === 'TEXTAREA';
      
      // Cmd/Ctrl + K: Focus search (works anywhere)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      
      // Cmd/Ctrl + N: New chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNewChat();
        return;
      }
      
      // Cmd/Ctrl + B: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        onToggleCollapse?.();
        return;
      }
      
      // Escape: Close agent selector
      if (e.key === 'Escape' && showAgentSelector) {
        e.preventDefault();
        setShowAgentSelector(false);
        addAgentButtonRef.current?.focus();
        return;
      }
      
      if (isTyping) return;
      
      // Tab switching: 1 for Chats, 2 for Agents
      if (e.key === '1') {
        e.preventDefault();
        setActiveTab('chats');
      }
      if (e.key === '2') {
        e.preventDefault();
        setActiveTab('agents');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAgentSelector, onToggleCollapse]);

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
  const handleCreateNewChat = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setLoadingOperation('Creating new chat...');
      
      await createNewChat();
      setSearchQuery('');
      
      // Auto-focus search after creation
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } catch (err) {
      setError('Failed to create new chat. Please try again.');
      console.error('Create chat error:', err);
    } finally {
      setIsLoading(false);
      setLoadingOperation('');
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      setError(null);
      await selectChat(chatId);
    } catch (err) {
      setError('Failed to select chat. Please try again.');
      console.error('Select chat error:', err);
    }
  };

  const handleDeleteChat = async (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      setLoadingOperation('Deleting chat...');
      
      await deleteChat(chatId);
    } catch (err) {
      setError('Failed to delete chat. Please try again.');
      console.error('Delete chat error:', err);
    } finally {
      setIsLoading(false);
      setLoadingOperation('');
    }
  };

  const handleSelectAgent = async (agent: Agent) => {
    try {
      setError(null);
      setAddingAgent(agent.id);
      
      await addSelectedAgent(agent);
      
      // Success animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setShowAgentSelector(false);
      setSearchQuery('');
    } catch (err) {
      setError(`Failed to add ${agent.name}. Please try again.`);
      console.error('Add agent error:', err);
    } finally {
      setAddingAgent(null);
    }
  };

  const handleRemoveAgent = async (agentId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      setError(null);
      await removeSelectedAgent(agentId);
    } catch (err) {
      setError('Failed to remove agent. Please try again.');
      console.error('Remove agent error:', err);
    }
  };

  const handleActivateAgent = async (agentId: string) => {
    try {
      setError(null);
      await setActiveAgent(agentId);
    } catch (err) {
      setError('Failed to activate agent. Please try again.');
      console.error('Activate agent error:', err);
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
    <div
      ref={sidebarRef}
      role="navigation"
      aria-label="Chat sidebar navigation"
      className={cn("flex flex-col h-full bg-white border-r border-gray-200 relative transition-all duration-200", isCollapsed ? "w-16" : "w-80", className)}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
          role="alert"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm font-medium text-gray-900">
              {loadingOperation || 'Loading...'}
            </p>
          </div>
        </div>
      )}

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
          aria-label={isCollapsed ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expand (Cmd+B)" : "Collapse (Cmd+B)"}
          className="h-8 w-8 p-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Mode Selector */}
      <div 
        role="radiogroup" 
        aria-label="Interaction mode selection"
        className="p-4 border-b bg-gray-50"
      >
        <div className="text-xs font-semibold text-gray-500 mb-2">Interaction Mode</div>
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-gray-200">
          <Button
            role="radio"
            aria-checked={!isAutomaticMode && !isAutonomousMode}
            aria-label="Manual mode - Direct control over interactions"
            title="Manual mode (direct control)"
            variant={!isAutomaticMode && !isAutonomousMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleToggleMode('manual')}
            className={cn(
              "text-xs h-8 focus:outline-none focus:ring-2 focus:ring-blue-500",
              !isAutomaticMode && !isAutonomousMode && "bg-blue-600 text-white shadow-sm"
            )}
          >
            <Zap className="h-3 w-3 mr-1" />
            Manual
          </Button>
          <Button
            role="radio"
            aria-checked={isAutomaticMode}
            aria-label="Auto mode - Automatic responses with approval"
            title="Auto mode (automatic with approval)"
            variant={isAutomaticMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleToggleMode('automatic')}
            className={cn(
              "text-xs h-8 focus:outline-none focus:ring-2 focus:ring-green-500",
              isAutomaticMode && "bg-green-600 text-white shadow-sm"
            )}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Auto
          </Button>
          <Button
            role="radio"
            aria-checked={isAutonomousMode}
            aria-label="Goal mode - Fully autonomous AI agent"
            title="Goal mode (autonomous)"
            variant={isAutonomousMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleToggleMode('autonomous')}
            className={cn(
              "text-xs h-8 focus:outline-none focus:ring-2 focus:ring-purple-500",
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
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b" role="tablist">
          <TabsTrigger 
            value="chats" 
            role="tab"
            aria-selected={activeTab === 'chats'}
            aria-controls="chats-panel"
            id="chats-tab"
            className="rounded-none focus:ring-2 focus:ring-blue-500"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chats
            {chats.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs" aria-label={`${chats.length} conversations`}>
                {chats.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="agents" 
            role="tab"
            aria-selected={activeTab === 'agents'}
            aria-controls="agents-panel"
            id="agents-tab"
            className="rounded-none focus:ring-2 focus:ring-blue-500"
          >
            <Bot className="h-4 w-4 mr-2" />
            Agents
            {selectedAgents.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700" aria-label={`${selectedAgents.length} agents selected`}>
                {selectedAgents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Error banner */}
        {error && (
          <div 
            className="mx-3 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <X className="h-3 w-3 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Chats Tab */}
        <TabsContent value="chats" className="flex-1 flex flex-col m-0 overflow-hidden">
          {/* New Chat Button */}
          <div className="p-3 border-b">
            <Button 
              onClick={handleCreateNewChat} 
              disabled={isLoading}
              aria-label="Create new chat (Cmd+N)"
              title="New chat (Cmd+N)"
              className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder={`Search ${activeTab}... (Cmd+K)`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white focus:ring-2 focus:ring-blue-500"
                aria-label={`Search ${activeTab}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">No results found</p>
                    <p className="text-xs text-gray-500">Try different keywords</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSearchQuery('')}
                      className="mt-3"
                    >
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                      <MessageSquare className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      No conversations yet
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Start a new chat to begin asking questions
                    </p>
                    <Button size="sm" onClick={handleCreateNewChat} disabled={isLoading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Chat
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <ul role="list" aria-label="Chat conversations" className="px-3 space-y-2 pb-4">
                {filteredConversations.map((chat) => {
                  const isActive = currentChat?.id === chat.id;
                  return (
                    <li key={chat.id} role="listitem">
                      <button
                        onClick={() => handleSelectChat(chat.id)}
                        aria-label={`Select conversation: ${chat.title || 'Untitled'}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all border group",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500",
                          isActive 
                            ? "bg-blue-50 border-blue-200 shadow-sm" 
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex-shrink-0 pt-1">
                          <MessageSquare className={cn(
                            "h-5 w-5",
                            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={cn(
                              "text-sm font-medium truncate",
                              isActive ? "text-blue-900" : "text-gray-900"
                            )}>
                              {chat.title || 'New Conversation'}
                            </h3>
                            <button
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              aria-label={`Delete conversation: ${chat.title || 'Untitled'}`}
                              className={cn(
                                "flex-shrink-0 p-1 opacity-0 group-hover:opacity-100",
                                "hover:bg-red-50 rounded transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-red-500 focus:opacity-100"
                              )}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </button>
                          </div>
                          {chat.agentName && (
                            <Badge variant="outline" className="mb-1 text-xs">
                              {chat.agentName}
                            </Badge>
                          )}
                          <p className={cn(
                            "text-xs truncate",
                            isActive ? "text-blue-700" : "text-gray-500"
                          )}>
                            {chat.messages?.[chat.messages.length - 1]?.content || 'No messages yet'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="flex-1 flex flex-col m-0 overflow-hidden">
          {/* Add Agent Button */}
          <div className="p-3 border-b">
            <Button 
              ref={addAgentButtonRef}
              onClick={() => setShowAgentSelector(!showAgentSelector)} 
              disabled={isLoading}
              aria-label={showAgentSelector ? 'Close agent selector' : 'Add agent'}
              id="add-agent-btn"
              className="w-full justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm focus:ring-2 focus:ring-purple-500"
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No agents selected</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Add agents to start chatting</p>
                <Button 
                  size="sm" 
                  onClick={() => setShowAgentSelector(true)}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Agent
                </Button>
              </div>
            ) : (
              <ul role="list" aria-label="Selected agents" className="space-y-2 pb-3">
                {selectedAgents.map((agent) => {
                  const isActive = activeAgentId === agent.id;
                  return (
                    <li key={agent.id} role="listitem">
                      <button
                        onClick={() => handleActivateAgent(agent.id)}
                        aria-label={`Activate agent: ${agent.display_name || agent.name}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                          "focus:outline-none focus:ring-2 focus:ring-purple-500",
                          isActive 
                            ? "bg-blue-50 border-blue-300 shadow-sm" 
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        )}
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
                        <button
                          onClick={(e) => handleRemoveAgent(agent.id, e)}
                          aria-label={`Remove agent: ${agent.display_name || agent.name}`}
                          className={cn(
                            "flex-shrink-0 p-1 hover:bg-red-50 rounded transition-all",
                            "focus:outline-none focus:ring-2 focus:ring-red-500"
                          )}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                      </button>
                    </li>
                  );
                })}
              </ul>
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
