'use client';

// Prevent pre-rendering for client-side only page
export const dynamic = 'force-dynamic';

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
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Container */}
        <div className="flex-1">
          <RedesignedChatContainer className="h-full" />
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