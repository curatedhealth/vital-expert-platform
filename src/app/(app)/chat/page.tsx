'use client';

// Prevent pre-rendering for client-side only page
export const dynamic = 'force-dynamic';

/**
 * VITAL Expert Chat Page
 * 
 * Supports two interaction modes:
 * 1. **Manual Mode**: User selects AI agent from left panel
 * 2. **Automatic Mode**: System selects best agent via LangGraph workflow
 * 
 * Agent Selection:
 * - All agent routing happens through LangGraph StateGraph
 * - Uses AutomaticAgentOrchestrator for intelligent selection
 * - No hardcoded agent lists - all from database
 * 
 * Validation:
 * - Three-layer validation: Store, UI, Backend
 * - Manual mode requires agent selection before sending messages
 * - Automatic mode works without user intervention
 * 
 * Components:
 * - AgentSelectionPanel: Left sidebar for manual agent selection
 * - ChatHeader: Shows current agent and mode indicators
 * - ChatContainer: Main message display area
 * - ChatInput: Smart input with validation
 * 
 * State Management:
 * - useChatStore: Zustand store for chat state
 * - Async acknowledgment pattern for agent selection
 * - Proper cleanup on unmount
 */

import { useState, useEffect, useRef } from 'react';

import { ClientAuthWrapper } from '@/components/auth/client-auth-wrapper';
import { ErrorBoundary } from '@/components/error-boundary';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { RedesignedChatContainer } from '@/components/chat/redesigned-chat-container';
import { useChatStore } from '@/lib/stores/chat-store';


function ChatPageContent() {
  const {
    loadAgentsFromDatabase,
    syncWithGlobalStore,
    subscribeToGlobalChanges,
  } = useChatStore();

  const [showAgentCreator, setShowAgentCreator] = useState(false);

  // Load agents from database on component mount and sync with global store
  useEffect(() => {
    loadAgentsFromDatabase();
    syncWithGlobalStore();

    // Subscribe to global changes
    const unsubscribe = subscribeToGlobalChanges();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [loadAgentsFromDatabase, syncWithGlobalStore, subscribeToGlobalChanges]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Container with integrated agent panel */}
      <RedesignedChatContainer className="h-full" />

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