'use client';

// Prevent pre-rendering for client-side only page
export const dynamic = 'force-dynamic';

import {
  MessageSquare,
  Users,
  Workflow,
  Home,
  Database,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';

import { ClientAuthWrapper } from '@/components/auth/client-auth-wrapper';
import { ErrorBoundary } from '@/components/error-boundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EnhancedAgentCard, AgentCardGrid } from '@/components/ui/enhanced-agent-card';
import {
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { EnhancedChatContainer } from '@/components/chat/enhanced-chat-container';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
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
    <div className="flex flex-col h-full">
      <SidebarProvider defaultOpen={sidebarOpen}>
        <ChatSidebar
          chats={filteredChats.map(chat => ({
            ...chat,
            updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : chat.updatedAt
          }))}
          currentChat={currentChat ? {
            ...currentChat,
            updatedAt: currentChat.updatedAt instanceof Date ? currentChat.updatedAt.toISOString() : currentChat.updatedAt
          } : null}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewChat={createNewChat}
          onSelectChat={selectChat}
          onAgentStoreClick={handleAgentStoreClick}
          onCreateAgentClick={handleCreateAgentClick}
          onAgentSelect={handleAgentSelect}
          onAgentRemove={handleAgentRemove}
          onAddAgentToLibrary={handleAddAgentToLibrary}
          selectedAgentId={selectedAgent?.id}
            agents={safeGetLibraryAgents}
          allAgents={agents}
          formatDate={formatDate}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          mounted={mounted}
          interactionMode={interactionMode}
          onToggleMode={setInteractionMode}
          autonomousMode={autonomousMode}
          onToggleAutonomous={setAutonomousMode}
        />

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col h-full bg-white">
              <div className="flex-1 overflow-y-auto">
                {/* Selected Agent Info */}
                {selectedAgent && (
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {(selectedAgent.display_name || selectedAgent.name || 'A')[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{selectedAgent.display_name || selectedAgent.name}</h4>
                        <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.isArray(selectedAgent.capabilities) && selectedAgent.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* Enhanced Chat Container with Dynamic Reasoning */}
                <div className="flex-1">
                  <EnhancedChatContainer className="h-full" />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
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