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

  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load agents from database on component mount and sync with global store
  useEffect(() => {
    loadAgentsFromDatabase();
    syncWithGlobalStore();

    // Subscribe to global changes
    const unsubscribe = subscribeToGlobalChanges();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [loadAgentsFromDatabase, syncWithGlobalStore, subscribeToGlobalChanges]);


  // Debug logging for messages and selected agent
  console.log('🔍 [ChatPage] State check:', {
    selectedAgent: selectedAgent ? {
      id: selectedAgent.id,
      name: selectedAgent.name,
      display_name: selectedAgent.display_name
    } : null,
    interactionMode,
    messagesLength: messages.length
  });

  return (
    <div className="flex h-screen bg-gray-50">
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