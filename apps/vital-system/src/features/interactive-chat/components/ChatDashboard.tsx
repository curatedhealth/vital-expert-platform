'use client';

/**
 * VITAL Platform - Chat Dashboard (Mode 1/2 Interactive)
 *
 * REWIRED Dec 2025: Now uses useMode1Chat (→ useBaseInteractive → useSSEStream)
 * instead of legacy useExpertChat → useAIStream → stream-mapper
 *
 * This fixes:
 * - Full 12-event SSE handling (token, reasoning, citation, tool_call, etc.)
 * - Proper streaming without 90s delays
 * - Web search fallback sources displayed
 * - Expert selection from sidebar via custom events
 */

import { useEffect, useMemo, useCallback } from 'react';

import { useInteractiveStore } from '../stores/interactive-store';
import { ChatPane } from './panes/ChatPane';
import { ContextRail } from './panes/ContextRail';

// NEW: Use the proper Mode 1 hook with full SSE support
import { useMode1Chat } from '@/features/ask-expert/hooks/useMode1Chat';

type ChatDashboardProps = {
  tenantId?: string;
  conversationId?: string;
  /** Agent ID for the selected expert */
  agentId?: string;
  /** @deprecated Use agentId instead */
  expertId?: string;
  /** When true, uses Mode 2 (auto expert selection via Fusion Intelligence) */
  autoSelectExpert?: boolean;
};

export function ChatDashboard({ tenantId, conversationId, agentId, expertId, autoSelectExpert = false }: ChatDashboardProps) {
  // Resolve effective agent ID (agentId takes precedence over deprecated expertId)
  const effectiveAgentId = agentId || expertId;
  // Legacy store for ContextRail compatibility (will deprecate)
  const {
    mode,
    setMode,
    setActiveAgent,
    setThinking,
    railMode,
    activeSource,
    focusCitation,
  } = useInteractiveStore();

  // Sync external autoSelectExpert prop to internal mode store
  useEffect(() => {
    setMode(autoSelectExpert ? 'mode_2' : 'mode_1');
  }, [autoSelectExpert, setMode]);

  // NEW: Use the proper streaming hook with full event support
  const {
    messages,
    currentContent,
    currentReasoning,
    currentCitations,
    currentCost,
    isStreaming,
    selectedExpert,
    sendMessage,
    selectExpert,
    stopGeneration,
    isExpertSelected,
    error,
  } = useMode1Chat({
    conversationId,
    agentId: effectiveAgentId, // Primary standardized field
    tenantId,
    baseUrl: '/api/expert',
    onError: (err) => console.error('Mode 1 Chat Error:', err),
    onMessageComplete: (msg) => {
      console.log('Message complete:', msg.id, 'citations:', msg.citations?.length || 0);
    },
  });

  // Listen for expert selection events from sidebar (Mode 1)
  // Immediately call selectExpert on the hook so it's ready when sending messages
  useEffect(() => {
    // Skip if autoSelectExpert is true (Mode 2 uses Fusion Intelligence)
    if (autoSelectExpert) return;

    interface ExpertSelectedEvent {
      agentId: string;          // Primary field name (standardized)
      expertId?: string;        // Backwards compatibility
      expert: { id: string; name: string; level: string; specialty: string };
    }

    const handleExpertSelected = (event: CustomEvent<ExpertSelectedEvent>) => {
      const { agentId, expertId: legacyExpertId, expert } = event.detail;
      // Use agentId if available, fall back to expertId for backwards compat
      const resolvedAgentId = agentId || legacyExpertId || expert.id;

      // Immediately register expert with the hook
      selectExpert({
        id: expert.id,
        name: expert.name,
        domain: expert.specialty || '',
        level: (expert.level as 'L1' | 'L2' | 'L3') || 'L2',
        specialty: expert.specialty,
      });
    };

    window.addEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);

    // On mount, request current selection from sidebar (in case it was set before we mounted)
    window.dispatchEvent(new CustomEvent('ask-expert:request-selection'));

    return () => {
      window.removeEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);
    };
  }, [selectExpert, autoSelectExpert]);

  // Sync selectedExpert to legacy store for ContextRail
  useEffect(() => {
    if (selectedExpert) {
      setActiveAgent({
        id: selectedExpert.id,
        name: selectedExpert.name,
        avatar: selectedExpert.avatar,
        capabilities: [],
        level: selectedExpert.level,
      });
    }
  }, [selectedExpert, setActiveAgent]);

  // Sync thinking state to legacy store for ContextRail
  useEffect(() => {
    setThinking({
      isThinking: isStreaming && currentReasoning.length > 0,
      steps: currentReasoning.map((r) => r.content || r.step),
      logs: [],
    });
  }, [isStreaming, currentReasoning, setThinking]);

  // Sync citations to legacy store for ContextRail
  useEffect(() => {
    if (currentCitations.length > 0) {
      const latest = currentCitations[currentCitations.length - 1];
      focusCitation({
        id: latest.id,
        title: latest.title,
        url: latest.url,
        abstract: latest.excerpt,
      });
    }
  }, [currentCitations, focusCitation]);

  // Map messages to legacy format for ChatPane
  const mappedMessages = useMemo(() => {
    const result = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      agentId: msg.expertId,
      agentName: msg.expertName,
      citations: msg.citations?.map((c) => ({
        id: c.id,
        title: c.title,
        url: c.url,
        abstract: c.excerpt,
      })),
      type: 'message' as const,
    }));

    // Add streaming content if we're currently receiving tokens
    if (isStreaming && currentContent) {
      result.push({
        id: 'streaming',
        role: 'assistant' as const,
        content: currentContent,
        timestamp: new Date(),
        agentId: selectedExpert?.id,
        agentName: selectedExpert?.name,
        citations: currentCitations.map((c) => ({
          id: c.id,
          title: c.title,
          url: c.url,
          abstract: c.excerpt,
        })),
        type: 'message' as const,
      });
    }

    return result;
  }, [messages, isStreaming, currentContent, currentCitations, selectedExpert]);

  // Build thinking state for ChatPane
  const thinkingState = useMemo(
    () => ({
      isThinking: isStreaming && (currentReasoning.length > 0 || !currentContent),
      steps: currentReasoning.map((r) => r.content || r.step),
      logs: [],
    }),
    [isStreaming, currentReasoning, currentContent]
  );

  // Build active agent for ChatPane
  const activeAgent = useMemo(
    () =>
      selectedExpert
        ? {
            id: selectedExpert.id,
            name: selectedExpert.name,
            avatar: selectedExpert.avatar,
            capabilities: [],
            level: selectedExpert.level,
          }
        : null,
    [selectedExpert]
  );

  const handleSend = (content: string) => {
    if (!isExpertSelected && !effectiveAgentId) {
      console.warn('No expert selected - message will fail');
    }
    sendMessage(content, {
      enableRag: true,
      enableWebSearch: true,
      responseDepth: 'standard',
    });
  };

  const toggleMode = () => setMode(mode === 'mode_1' ? 'mode_2' : 'mode_1');

  // Default suggestions for new conversations
  const defaultSuggestions = useMemo(() => {
    if (messages.length > 0) return [];
    return [
      'What are the latest treatment guidelines for Type 2 Diabetes?',
      'Explain the mechanism of action of GLP-1 agonists',
      'Compare SGLT2 inhibitors vs DPP-4 inhibitors',
    ];
  }, [messages.length]);

  // Map current citations to the expected format
  const mappedCitations = useMemo(() =>
    currentCitations.map((c) => ({
      id: c.id,
      title: c.title,
      url: c.url,
      abstract: c.excerpt,
    })),
    [currentCitations]
  );

  return (
    <div className="h-full w-full bg-background grid grid-cols-12 overflow-hidden">
      <main className="col-span-8 flex flex-col border-r relative">
        <ChatPane
          mode={mode}
          onSend={handleSend}
          messages={mappedMessages}
          activeAgent={activeAgent}
          thinkingState={thinkingState}
          onToggleMode={toggleMode}
          isStreaming={isStreaming}
          currentContent={currentContent}
          currentCitations={mappedCitations}
          suggestions={defaultSuggestions}
        />
        {isStreaming && (
          <button
            type="button"
            onClick={stopGeneration}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-destructive text-destructive-foreground rounded-full text-sm shadow-lg hover:bg-destructive/90 transition"
          >
            Stop Generation
          </button>
        )}
        {error && (
          <div className="absolute top-16 left-4 right-4 bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded text-sm">
            {error.message}
          </div>
        )}
      </main>

      <aside className="col-span-4 bg-muted/5">
        <ContextRail />
      </aside>
    </div>
  );
}
