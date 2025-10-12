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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EnhancedAgentCard, AgentCardGrid } from '@/components/ui/enhanced-agent-card';
import {
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { ChatInput } from '@/features/chat/components/chat-input';
import { ChatMessages } from '@/features/chat/components/chat-messages';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { useAuth } from '@/supabase-auth-context';
import { __useAgentsStore as useAgentsStore } from '@/agents-store';
import { useChatStore } from '@/lib/stores/chat-store';
import { Agent } from '@/types/agent';
import { IconService } from '@/shared/services/icon-service';

// Mock data for testing
const mockAgents = [
  {
    id: '1',
    name: 'Test Agent',
    description: 'A test agent for development',
    avatar: '🤖',
    businessFunction: 'Testing',
    category: 'Tier 1',
    capabilities: ['Testing'],
    specialties: ['Development'],
    tier: 'Tier 1',
    isActive: true,
    ragEnabled: true,
    isCustom: false,
    metadata: {}
  }
];

function ChatPageContent() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading, signOut } = useAuth();
  const { createUserCopy, canEditAgent } = useAgentsStore();

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
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
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
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user-chat-agents');
      if (saved) {
        try {
          const agents = JSON.parse(saved);
          const markedAgents = agents.map((agent: Agent) => ({
            ...agent,
            is_user_copy: true,
            isCustom: true,
          }));
          setUserAgents(markedAgents);
        } catch (error) {
          console.error('Failed to parse user agents from localStorage:', error);
          setUserAgents([]);
        }
      }
    }
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
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setHasUserSelectedAgent(true);
      createNewChat();
    }
  };

  const handleAgentRemove = (agentId: string) => {
    setUserAgents(prev => prev.filter(agent => agent.id !== agentId));
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
      setHasUserSelectedAgent(false);
    }
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <SidebarProvider defaultOpen={sidebarOpen}>
        <ChatSidebar
          chats={filteredChats}
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
          selectedAgentId={selectedAgent?.id}
          agents={mounted ? userAgents : []}
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
                <div className="flex flex-col items-center justify-center h-full px-6">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-normal text-gray-900 mb-4">
                      What's on the agenda today?
                    </h1>
                    <p className="text-gray-600 mb-6">
                      Ask me anything about digital health, clinical trials, regulatory compliance, and more.
                    </p>
                  </div>

                  {/* Single chat input - always visible */}
                  <div className="w-full max-w-3xl">
                    <ChatInput
                      value={input}
                      onChange={setInput}
                      onSend={handleSendMessage}
                      onKeyPress={handleKeyPress}
                      isLoading={isLoading || isSelectingAgent}
                      selectedAgent={null}
                      enableVoice={true}
                      selectedModel={selectedModel || undefined}
                      onModelChange={setSelectedModel}
                      onStop={stopGeneration}
                    />
                  </div>
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
    <ClientAuthWrapper requireAuth={true}>
      <ChatPageContent />
    </ClientAuthWrapper>
  );
}