'use client';

// Prevent pre-rendering for client-side only page
export const dynamic = 'force-dynamic';

/**
 * VITAL Expert Chat Page
 * 
 * Supports three interaction modes:
 * 1. **Manual Mode**: User selects AI agent from left panel
 * 2. **Automatic Mode**: System selects best agent via LangGraph workflow
 * 3. **Autonomous Mode**: AI agents work independently to achieve complex goals
 * 
 * Agent Selection:
 * - All agent routing happens through LangGraph StateGraph
 * - Uses AutomaticAgentOrchestrator for intelligent selection
 * - No hardcoded agent lists - all from database
 * 
 * Autonomous Mode Features:
 * - Goal-based task generation and execution
 * - Real-time progress tracking with task visualization
 * - VERIFY protocol integration for medical-grade validation
 * - Configurable safety limits and supervision levels
 * - Evidence collection and verification
 * 
 * Validation:
 * - Three-layer validation: Store, UI, Backend
 * - Manual mode requires agent selection before sending messages
 * - Automatic mode works without user intervention
 * - Autonomous mode requires goal setting and safety configuration
 * 
 * Components:
 * - AgentSelectionPanel: Left sidebar for manual agent selection
 * - AutonomousModeToggle: Controls for autonomous mode activation
 * - AutonomousTaskProgress: Real-time task progress visualization
 * - ChatContainer: Main message display area
 * - ChatInput: Smart input with validation
 * 
 * State Management:
 * - useChatStore: Zustand store for chat state
 * - useAutonomousMode: Custom hook for autonomous mode state
 * - Async acknowledgment pattern for agent selection
 * - Proper cleanup on unmount
 */

import { useState, useEffect, useRef } from 'react';

import { ClientAuthWrapper } from '@/components/auth/client-auth-wrapper';
import { ChatErrorBoundary } from '@/components/error-boundary';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { EnhancedChatContainerWithAutonomous } from '@/components/chat/enhanced-chat-container-with-autonomous';
import { EnhancedChatSidebar } from '@/components/chat/enhanced-chat-sidebar';
import { useChatStore } from '@/lib/stores/chat-store';


function ChatPageContent() {
  const {
    syncWithGlobalStore,
    subscribeToGlobalChanges,
  } = useChatStore();

  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync with global store on component mount
  useEffect(() => {
    syncWithGlobalStore();

    // Subscribe to global changes
    const unsubscribe = subscribeToGlobalChanges();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [syncWithGlobalStore, subscribeToGlobalChanges]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <EnhancedChatSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <EnhancedChatContainerWithAutonomous className="h-full" />
      </div>

      {/* Agent Creator Modal */}
      {showAgentCreator && (
        <AgentCreator
          onClose={() => setShowAgentCreator(false)}
          onAgentCreated={() => {
            setShowAgentCreator(false);
            // Note: loadAgentsFromDatabase is no longer available, agents are loaded via global store
          }}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
      <ChatErrorBoundary>
      <ClientAuthWrapper requireAuth={true}>
        <ChatPageContent />
      </ClientAuthWrapper>
    </ChatErrorBoundary>
  );
}