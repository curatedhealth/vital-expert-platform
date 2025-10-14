'use client';

// Prevent pre-rendering for client-side only page
export const dynamic = 'force-dynamic';

import {
  MessageSquare,
  Users,
  Workflow,
  Home,
  Database,
  Zap,
  ChevronLeft,
  ChevronRight,
  Search,
  UserPlus,
  ShoppingCart,
  User
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';

import { ClientAuthWrapper } from '@/components/auth/client-auth-wrapper';
import { ErrorBoundary } from '@/components/error-boundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { EnhancedAgentCard, AgentCardGrid } from '@/components/ui/enhanced-agent-card';
import {
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { ChatContainer } from '@/components/chat/chat-container';
// Removed ChatSidebar - consolidating into global sidebar
import { useAuth } from '@/supabase-auth-context';
import { __useAgentsStore as useAgentsStore } from '@/agents-store';
import { useChatStore } from '@/lib/stores/chat-store';
import { Agent } from '../../../types/agent.types';
import { IconService } from '@/shared/services/icon-service';


function ChatPageContent() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading, signOut } = useAuth();
  // const { createUserCopy, canEditAgent } = useAgentsStore(); // Not used

  const {
    chats,
    currentChat,
    messages,
    selectedAgent,
    selectedModel,
    agents,
    isLoading,
    isLoadingAgents,
    liveReasoning,
    isReasoningActive,
    interactionMode,
    autonomousMode,
    currentTier,
    escalationHistory,
    selectedExpert,
    libraryAgents,
    setInteractionMode,
    setAutonomousMode,
    setSelectedExpert,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    stopGeneration,
    setSelectedAgent,
    setSelectedModel,
    loadAgentsFromDatabase,
    syncWithGlobalStore,
    subscribeToGlobalChanges,
    addAgentToLibrary,
    removeAgentFromLibrary,
    getLibraryAgents,
  } = useChatStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const [promptIcons, setPromptIcons] = useState<any[]>([]);
  const [iconService] = useState(() => new IconService());
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [isSelectingAgent, setIsSelectingAgent] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [recommendedAgents, setRecommendedAgents] = useState<any[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    chatManagement: false,
    ragCategories: false,
    aiAgents: false,
  });
  const [hasUserSelectedAgent, setHasUserSelectedAgent] = useState(false);
  const [useDirectLLM, setUseDirectLLM] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load userAgents from localStorage after component mounts to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load agents from database on component mount and sync with global store
  useEffect(() => {
    loadAgentsFromDatabase();
    syncWithGlobalStore();

    // Subscribe to global changes
    const unsubscribe = subscribeToGlobalChanges();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [loadAgentsFromDatabase, syncWithGlobalStore, subscribeToGlobalChanges]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  // Safe wrapper for getLibraryAgents with dependency on agents
  const safeGetLibraryAgents = useMemo(() => {
    try {
      return getLibraryAgents ? getLibraryAgents() : [];
    } catch (error) {
      console.error('Error getting library agents:', error);
      return [];
    }
  }, [agents, libraryAgents, getLibraryAgents]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return dateObj.toLocaleDateString();
  };

  const handleAgentStoreClick = () => {
    router.push('/agents');
  };

  const handleCreateAgentClick = () => {
    setShowAgentCreator(true);
  };

  const handleAgentSelect = (agentId: string) => {
    console.log('🎯 Agent selection triggered:', { agentId, agentsCount: agents.length });
    const agent = agents.find(a => a.id === agentId);
    console.log('🔍 Found agent:', agent);
    
    if (agent) {
      // Ensure the agent has all required fields
      const completeAgent = {
        ...agent,
        display_name: agent.display_name || agent.name,
        description: agent.description || 'AI Assistant',
        business_function: agent.business_function || 'General Purpose',
        capabilities: agent.capabilities || [],
        color: agent.color || 'text-blue-600',
        avatar: agent.avatar || '🤖'
      };
      
      console.log('✅ Setting selected agent:', completeAgent);
      setSelectedAgent(completeAgent);
      setHasUserSelectedAgent(true);
      createNewChat();
    } else {
      console.warn('❌ Agent not found:', agentId);
    }
  };

  const handleAgentRemove = (agentId: string) => {
    removeAgentFromLibrary(agentId);
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
      setHasUserSelectedAgent(false);
    }
  };

  const handleAddAgentToLibrary = (agentId: string) => {
    try {
      if (typeof window !== 'undefined' && addAgentToLibrary) {
        addAgentToLibrary(agentId);
        console.log('Agent added to library:', agentId);
      }
    } catch (error) {
      console.error('Error adding agent to library:', error);
    }
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Debug logging for messages and selected agent
  console.log('🔍 [ChatPage] State check:', {
    selectedAgent: selectedAgent ? {
      id: selectedAgent.id,
      name: selectedAgent.name,
      display_name: selectedAgent.display_name
    } : null,
    hasUserSelectedAgent,
    interactionMode,
    messagesLength: messages.length
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Global Sidebar - Enhanced with Agent Selection */}
      <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <span className="font-semibold text-gray-900">VITAL Expert</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Mode Selection */}
          {!isCollapsed && (
            <div className="mt-4 space-y-3">
              <div className="text-sm font-medium text-gray-700">Mode Selection</div>
              
              {/* Auto/Manual Toggle */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className={`h-4 w-4 ${interactionMode === 'automatic' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm">Auto</span>
                </div>
                <Switch
                  checked={interactionMode === 'manual'}
                  onCheckedChange={(checked) => setInteractionMode(checked ? 'manual' : 'automatic')}
                />
                <div className="flex items-center gap-2">
                  <User className={`h-4 w-4 ${interactionMode === 'manual' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm">Manual</span>
                </div>
              </div>

              {/* Autonomous Toggle */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className={`h-4 w-4 ${autonomousMode ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className="text-sm">Autonomous</span>
                </div>
                <Switch
                  checked={autonomousMode}
                  onCheckedChange={setAutonomousMode}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Conversations Section */}
          {!isCollapsed && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Conversations</div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={createNewChat}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                New Chat
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* My Agents Section */}
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">My Agents</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgentCreator(true)}
                  className="h-6 w-6 p-0"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Agent List */}
            <div className="space-y-1">
              {safeGetLibraryAgents.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  {!isCollapsed && "No agents added yet"}
                </div>
              ) : (
                safeGetLibraryAgents.map((agent) => {
                  const isSelected = selectedAgent?.id === agent.id;
                  return (
                    <div
                      key={agent.id}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => handleAgentSelect(agent.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm font-medium">
                          {agent.avatar || agent.name.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{agent.name}</div>
                            {agent.description && (
                              <div className="text-xs text-gray-500 truncate">{agent.description}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Agent Store Link */}
            {!isCollapsed && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleAgentStoreClick}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agent Store
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Selected Agent Info */}
        {selectedAgent && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {(selectedAgent.display_name || selectedAgent.name || 'A')[0]}
              </div>
              <div>
                <h4 className="font-medium">{selectedAgent.display_name || selectedAgent.name}</h4>
                <p className="text-sm text-gray-600">{selectedAgent.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Agent Selection Prompt for Manual Mode */}
        {interactionMode === 'manual' && !selectedAgent && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🤖 Select an AI Agent
              </h3>
              <p className="text-blue-700 mb-4">
                You're in Manual Mode. Please select an AI agent from the sidebar to start chatting.
              </p>
              <Button
                onClick={handleAgentStoreClick}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Visit Agent Store
              </Button>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1">
          <ChatContainer className="h-full" />
        </div>
      </div>

      {/* Agent Creator Modal */}
      {showAgentCreator && (
        <AgentCreator
          onClose={() => setShowAgentCreator(false)}
          onAgentCreated={() => {
            setShowAgentCreator(false);
            loadAgentsFromDatabase();
          }}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ClientAuthWrapper requireAuth={true}>
        <ChatPageContent />
      </ClientAuthWrapper>
    </ErrorBoundary>
  );
}