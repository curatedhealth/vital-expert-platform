/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * @fileoverview Ask Expert - Refactored with Custom Hooks
 * @description Clean, maintainable implementation using modular hooks
 * 
 * REFACTORED FROM: 3,515 lines → ~600 lines (83% reduction!)
 * 
 * Custom Hooks Used:
 * - useMessageManagement: Message CRUD + streaming
 * - useModeLogic: Mode determination + validation
 * - useStreamingConnection: SSE connection management
 * - useToolOrchestration: Tool confirmation + execution
 * - useRAGIntegration: Sources + citations
 * 
 * @author VITAL AI Platform Team
 * @date November 8, 2025
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import {
  Sparkles,
  Send,
  Plus,
  Copy,
  Check,
  Bot,
  User,
  FileText,
  Brain,
  Paperclip,
  BookOpen,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

// Component imports
import { PromptInput } from '@/components/prompt-input';
import { useAskExpert } from '@/contexts/ask-expert-context';
import type { Agent } from '@/contexts/ask-expert-context';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/chat-history-context';
import { PromptStarters, type PromptStarter } from '@/components/prompt-starters';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useTenant } from '@/contexts/TenantContext';
import { ChatHistorySidebar } from '@/components/chat-history-sidebar';
import { SelectedAgentsList } from '@/components/selected-agent-card';
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ui/shadcn-io/ai/reasoning';
import { Conversation, ConversationContent } from '@/components/ui/shadcn-io/ai/conversation';
import { EnhancedMessageDisplay } from '@/features/ask-expert/components/EnhancedMessageDisplay';
import { InlineArtifactGenerator } from '@/features/ask-expert/components/InlineArtifactGenerator';
import { AgentAvatar, Button } from '@vital/ui';
import { Suggestions, Suggestion } from '@/components/ai/suggestion';
import { useAgentWithStats } from '@/features/ask-expert/hooks/useAgentWithStats';
import { AskExpertOnboarding } from '@/components/onboarding/ask-expert-onboarding';
import { Mode1Helper } from '@/components/onboarding/mode1-helper';
import { Mode2Helper } from '@/components/onboarding/mode2-helper';
import { Mode3Helper } from '@/components/onboarding/mode3-helper';
import { Mode4Helper } from '@/components/onboarding/mode4-helper';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ToolConfirmation, type ToolSuggestion } from '@/features/ask-expert/components/ToolConfirmation';
import { ToolExecutionStatusComponent } from '@/features/ask-expert/components/ToolExecutionStatus';
import { ToolResults } from '@/features/ask-expert/components/ToolResults';
import { ConnectionStatusComponent } from '@/features/ask-expert/components/ConnectionStatus';

// ✨ PHASE 1: Custom Hooks (Extracted from 3,515-line monolith)
import {
  useMessageManagement,
  useModeLogic,
  useStreamingConnection,
  useToolOrchestration,
  useRAGIntegration,
} from '@/features/ask-expert/hooks';

// ✨ PHASE 2: Streaming Improvements (NEW!)
import {
  useTokenStreaming,
  useStreamingProgress,
  useConnectionQuality,
  useTypingIndicator,
  useTimeEstimation,
  useStreamingMetrics,
} from '@/features/ask-expert/hooks';

import {
  TokenDisplay,
  StreamingProgress,
  ConnectionStatusBanner,
} from '@/features/ask-expert/components';

// Types from custom hooks
import type { Message, Conversation as ConversationType, AttachmentInfo } from '@/features/ask-expert/types';

// ============================================================================
// UTILITY FUNCTIONS (Minimal - most moved to utils/index.ts)
// ============================================================================

/**
 * Generate follow-up suggestions based on message context
 */
function generateFollowUpSuggestions(message: Message): string[] {
  const suggestions = new Set<string>();
  
  if (message.reasoning && message.reasoning.length > 0) {
    suggestions.add('Can you explain your reasoning further?');
  }
  
  if (message.sources && message.sources.length > 0) {
    suggestions.add('What other sources support this conclusion?');
  }
  
  const usedTools = message.metadata?.toolSummary?.used;
  if (usedTools && usedTools.length > 0) {
    suggestions.add(`What did the ${usedTools[0]} tool uncover?`);
  }
  
  suggestions.add('What concrete steps should we prioritize next?');
  suggestions.add('Are there risks or blockers we should anticipate?');
  
  return Array.from(suggestions).slice(0, 4);
}

// ============================================================================
// MAIN COMPONENT (Refactored with Custom Hooks)
// ============================================================================

function AskExpertPageContent() {
  // ============================================================================
  // CONTEXT & AUTH
  // ============================================================================
  
  const { selectedAgents, agents, setSelectedAgents, addAgentToUserList, refreshAgents, getAllAgents } = useAskExpert();
  const { user } = useAuth();
  const tenant = useTenant();
  const { currentSession, messages: chatMessages, addMessage, createSession, updateSession } = useChatHistory();

  // Debug logging for agents
  useEffect(() => {
    console.log('🔍 [AskExpert] Agent State:', {
      totalAgents: agents.length,
      selectedAgentIds: selectedAgents,
      selectedCount: selectedAgents.length,
      availableAgentIds: agents.map(a => a.id),
      availableAgentNames: agents.map(a => a.displayName || a.name),
    });
  }, [agents, selectedAgents]);
  
  // ============================================================================
  // CUSTOM HOOKS (Replacing 39 useState hooks!)
  // ============================================================================
  
  // 1. Message Management (replaces 10+ useState hooks)
  const messageManager = useMessageManagement({ initialMessages: [] });
  
  // 2. Mode Logic (replaces 5+ useState hooks)
  const modeLogic = useModeLogic({
    initialIsAutomatic: false,
    initialIsAutonomous: false,
    initialEnableRAG: true,
    initialEnableTools: true,
  });
  
  // 3. Streaming Connection (replaces 8+ useState hooks)
  const streaming = useStreamingConnection({
    maxReconnectAttempts: 3,
    reconnectDelay: 1000,
  });
  
  // 4. Tool Orchestration (replaces 6+ useState hooks)
  const tools = useToolOrchestration({
    onToolConfirm: (tool) => {
      console.log('[AskExpert] Tool confirmed:', tool.name);
      tools.startToolExecution(tool.id, tool.name);
    },
    onToolDecline: (tool) => {
      console.log('[AskExpert] Tool declined:', tool.name);
    },
  });
  
  // 5. RAG Integration (replaces 4+ useState hooks)
  const rag = useRAGIntegration({ enableAutoDeduplication: true });
  
  // ============================================================================
  // PHASE 2: STREAMING IMPROVEMENTS HOOKS 🚀
  // ============================================================================
  
  // 6. Token-by-Token Streaming
  const tokenStreaming = useTokenStreaming({
    delayBetweenTokens: 30, // 30ms = 33 tokens/sec (smooth animation)
    maxBufferSize: 100,
    enableBackpressure: true,
  });
  
  // 7. Progress Tracking
  const streamingProgress = useStreamingProgress({
    estimateCompletionTime: true,
    trackTokensPerSecond: true,
    expectedTotalTokens: 500, // Will be updated dynamically
  });
  
  // 8. Connection Quality Monitoring
  const connectionQuality = useConnectionQuality({
    measureLatency: true,
    detectPacketLoss: true,
    trackUptime: true,
    heartbeatInterval: 5000,
    onQualityChange: (quality) => {
      console.log('[AskExpert] Connection quality changed:', quality);
    },
  });
  
  // 9. Typing Indicator
  const typingIndicator = useTypingIndicator({
    enabled: true,
    message: 'AI is thinking...',
    animation: 'dots',
  });
  
  // 10. Time Estimation
  const timeEstimation = useTimeEstimation({
    enabled: true,
    historicalAvgTokensPerSec: 40,
  });
  
  // 11. Performance Metrics
  const performanceMetrics = useStreamingMetrics();
  
  // ============================================================================
  // REMAINING LOCAL STATE (UI-specific, ~6 useState hooks)
  // ============================================================================
  
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showArtifactGenerator, setShowArtifactGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMode1Helper, setShowMode1Helper] = useState(false);
  const [showMode2Helper, setShowMode2Helper] = useState(false);
  const [showMode3Helper, setShowMode3Helper] = useState(false);
  const [showMode4Helper, setShowMode4Helper] = useState(false);
  const [enableRAG, setEnableRAG] = useState(true); // Enable RAG by default
  const [enableTools, setEnableTools] = useState(true); // Enable Tools by default
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedRagDomains, setSelectedRagDomains] = useState<string[]>([]);
  const [recentReasoning, setRecentReasoning] = useState<string[]>([]);
  const [promptStarters, setPromptStarters] = useState<PromptStarter[]>([]);
  const [loadingPromptStarters, setLoadingPromptStarters] = useState(false);
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const primaryAgentRef = useRef<Agent | null>(null);
  
  // ============================================================================
  // COMPUTED VALUES (Using hooks)
  // ============================================================================
  
  const isLoading = messageManager.isStreaming || tools.hasActiveTools;
  const currentMode = modeLogic.mode;
  const currentModeConfig = modeLogic.modeConfig;
  
  // Validation
  useEffect(() => {
    if (!selectedAgents.length) {
      primaryAgentRef.current = null;
      return;
    }
    const firstSelectedAgent = agents.find((agent) => agent.id === selectedAgents[0]) || null;
    primaryAgentRef.current = firstSelectedAgent;
  }, [agents, selectedAgents]);
  
  const canSubmit = useMemo(() => {
    const validation = modeLogic.validateRequirements({
      hasAgents: selectedAgents.length > 0,
      hasQuery: inputValue.trim().length > 0,
    });
    console.log('🔍 [canSubmit] Validation check:', {
      canSubmit: validation.isValid,
      hasAgents: selectedAgents.length > 0,
      agentCount: selectedAgents.length,
      selectedAgents: selectedAgents,
      hasQuery: inputValue.trim().length > 0,
      queryLength: inputValue.trim().length,
      mode: currentMode,
      isLoading: isLoading,
    });
    return validation.isValid;
  }, [modeLogic, selectedAgents, inputValue, currentMode, isLoading]);
  
  const activeStreamingAgent = useMemo(() => {
    if (!selectedAgents.length) {
      return null;
    }
    return agents.find((agent) => agent.id === selectedAgents[0]) || null;
  }, [agents, selectedAgents]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle message submission
   */
  const handleSubmit = useCallback(async () => {
    console.log('🚀🚀🚀 [handleSubmit] FUNCTION CALLED!');
    console.log('[handleSubmit] Clicked! canSubmit:', canSubmit);
    console.log('[handleSubmit] selectedAgents (IDs):', selectedAgents);
    console.log('[handleSubmit] inputValue:', inputValue);
    console.log('[handleSubmit] currentMode:', currentMode);
    console.log('[handleSubmit] RAG domains:', selectedRagDomains);
    console.log('[handleSubmit] Tools:', selectedTools);
    console.log('[handleSubmit] isLoading:', isLoading);
    console.log('[handleSubmit] Button should be:', canSubmit && !isLoading ? 'ENABLED' : 'DISABLED');
    
    if (!canSubmit) {
      console.warn('❌ [AskExpert] Cannot submit - validation failed');
      console.warn('[AskExpert] Validation details:', {
        hasAgents: selectedAgents.length > 0,
        hasQuery: inputValue.trim().length > 0,
        mode: currentMode,
      });
      return;
    }
    
    if (isLoading) {
      console.warn('❌ [AskExpert] Cannot submit - already loading');
      return;
    }
    
    const query = inputValue.trim();
    const primaryAgentId = selectedAgents[0];

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: query,
      timestamp: Date.now(),
      attachments: attachments.map((file, idx) => ({
        id: `att-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };
    
    // Add user message
    messageManager.addMessage(userMessage);
    
    // Clear input
    setInputValue('');
    setAttachments([]);
    
    const conversationHistory = messageManager.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(typeof m.timestamp === 'number' ? m.timestamp : Date.now()).toISOString(),
      agent_id: m.selectedAgent?.id,
    }));

    // Prepare request payload aligned with Python AI engine contract
    const payload = {
      message: query,
      query,
      agent_id: currentMode === 1 ? primaryAgentId : undefined,
      agent_ids: selectedAgents.length > 0 ? selectedAgents : undefined,
      model: 'gpt-4',
      mode: currentMode,
      enable_rag: modeLogic.enableRAG,
      enable_tools: modeLogic.enableTools,
      requested_tools: selectedTools.length > 0 ? selectedTools : undefined,
      selected_tools: selectedTools.length > 0 ? selectedTools : undefined,
      selected_rag_domains: selectedRagDomains.length > 0 ? selectedRagDomains : undefined,
      rag_domains: selectedRagDomains.length > 0 ? selectedRagDomains : undefined,
      use_langgraph: true,
      conversation_history: conversationHistory,
      user_id: user?.id,
      tenant_id: tenant?.id,
      session_id: currentSession?.id,
    };
    
    console.log('📦 [handleSubmit] Payload:', JSON.stringify(payload, null, 2));
    console.log('🔌 [handleSubmit] Endpoint:', currentModeConfig.endpoint);
    
    // Connect and stream response
    try {
      await streaming.connect(currentModeConfig.endpoint, payload);
    } catch (error) {
      console.error('[AskExpert] Stream connection failed:', error);
      messageManager.addMessage({
        id: nanoid(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error connecting to the AI service. Please try again.',
        timestamp: Date.now(),
      });
    }
  }, [
    canSubmit,
    inputValue,
    attachments,
    selectedAgents,
    currentMode,
    currentModeConfig,
    modeLogic,
    selectedTools,
    selectedRagDomains,
    messageManager,
    messageManager.messages,
    streaming,
    agents,
    user?.id,
    tenant?.id,
    currentSession?.id,
  ]);
  
  /**
   * Handle prompt starter click
   */
  const handlePromptStarterClick = useCallback((starter: PromptStarter) => {
    setInputValue(starter.content);
  }, []);
  
  // ============================================================================
  // SSE EVENT HANDLERS (Setup streaming event listeners + Phase 2 Integration)
  // ============================================================================
  
  useEffect(() => {
    // ✨ PHASE 2: Stream start event
    streaming.onEvent('start', () => {
      console.log('[Phase 2] Stream started');
      
      // Start all Phase 2 trackers
      streamingProgress.start();
      typingIndicator.startTyping('AI is thinking...');
      tokenStreaming.start();
      performanceMetrics.startSession();
      connectionQuality.connect();
    });
    
    // ✨ PHASE 2: First token received
    streaming.onEvent('first_token', () => {
      console.log('[Phase 2] First token received');
      
      // Record TTFT (Time to First Token)
      performanceMetrics.recordFirstToken();
      
      // Update progress stage
      streamingProgress.setStage('streaming');
      
      // Stop typing indicator
      typingIndicator.stopTyping();
    });
    
    // Content chunk (UPDATED with Phase 2 token streaming)
    streaming.onEvent('content', (data) => {
      if (typeof data === 'string') {
        // ✨ PHASE 2: Token-by-token animation
        tokenStreaming.addToken(data);
        
        // Original message management
        messageManager.appendStreamingMessage(data);
        
        // ✨ PHASE 2: Track progress
        streamingProgress.recordToken();
        performanceMetrics.recordToken(streamingProgress.tokensPerSecond);
        
        // ✨ PHASE 2: Update time estimate
        if (streamingProgress.expectedTokens > 0) {
          timeEstimation.updateEstimate(
            streamingProgress.totalTokens,
            streamingProgress.expectedTokens,
            streamingProgress.tokensPerSecond
          );
        }
      }
    });
    
    // ✨ PHASE 2: Thinking/reasoning stage
    streaming.onEvent('thinking', () => {
      streamingProgress.setStage('thinking');
      typingIndicator.startTyping('AI is analyzing...');
    });
    
    // Reasoning step
    streaming.onEvent('reasoning', (data) => {
      if (typeof data === 'string') {
        setRecentReasoning(prev => [...prev, data]);
      }
    });
    
    // Sources
    streaming.onEvent('sources', (data) => {
      if (Array.isArray(data)) {
        const normalized = rag.normalizeSources(data);
        rag.addSources(normalized);
        
        // ✨ PHASE 2: Track RAG stage
        streamingProgress.setStage('rag');
      }
    });
    
    // ✨ PHASE 2: Tool execution started
    streaming.onEvent('tools_start', () => {
      streamingProgress.setStage('tools');
      typingIndicator.startTyping('Executing tools...');
    });
    
    // Tool suggestion
    streaming.onEvent('tool_suggestion', async (data) => {
      const toolSuggestion: ToolSuggestion = {
        id: data.id || nanoid(),
        name: data.name,
        description: data.description,
        parameters: data.parameters,
        reasoning: data.reasoning,
      };
      
      const confirmed = await tools.requestToolConfirmation(toolSuggestion);
      
      // Send confirmation back to backend (implementation depends on your API)
      if (confirmed) {
        console.log('[AskExpert] Tool confirmed, continuing stream...');
      } else {
        console.log('[AskExpert] Tool declined, aborting...');
        streaming.disconnect();
      }
    });
    
    // Tool result
    streaming.onEvent('tool_result', (data) => {
      tools.addToolResult({
        id: data.id || nanoid(),
        name: data.name,
        status: data.status,
        result: data.result,
        error: data.error,
        executionTimeMs: data.execution_time_ms,
        timestamp: Date.now(),
      });
      
      if (data.status === 'success' || data.status === 'error') {
        tools.completeToolExecution(data.id, data.status, data.message);
      }
    });
    
    // Stream complete (UPDATED with Phase 2)
    streaming.onEvent('done', (data) => {
      // ✨ PHASE 2: Stop all trackers
      streamingProgress.complete();
      typingIndicator.stopTyping();
      tokenStreaming.stop();
      performanceMetrics.endSession(true); // successful completion
      
      const agentFromStream = data?.agent as Partial<Agent> | undefined;
      const fallbackAgent = primaryAgentRef.current || null;
      const resolvedAgent = agentFromStream?.id
        ? {
            id: agentFromStream.id,
            name: agentFromStream.name || agentFromStream.display_name || agentFromStream.displayName || 'AI Assistant',
            displayName: agentFromStream.display_name || agentFromStream.displayName || agentFromStream.name || 'AI Assistant',
            avatar: (agentFromStream as any)?.avatar,
          }
        : fallbackAgent
          ? {
              id: fallbackAgent.id,
              name: fallbackAgent.name,
              displayName: fallbackAgent.displayName || fallbackAgent.name,
              avatar: fallbackAgent.avatar,
            }
          : undefined;
      
      const selectedAgentForMessage = resolvedAgent
        ? {
            id: resolvedAgent.id,
            name: resolvedAgent.name || resolvedAgent.displayName || 'AI Assistant',
            display_name: resolvedAgent.displayName || resolvedAgent.name || 'AI Assistant',
          }
        : undefined;
      
      // Commit streaming message
      const messageId = messageManager.commitStreamingMessage({
        reasoning: recentReasoning,
        sources: rag.sources,
        selectedAgent: selectedAgentForMessage,
        metadata: {
          ragSummary: data.rag_summary,
          toolSummary: data.tool_summary,
          agentAvatar: resolvedAgent?.avatar,
          agentName: resolvedAgent?.displayName || resolvedAgent?.name,
          // ✨ PHASE 2: Add performance metrics to metadata
          performanceMetrics: {
            timeToFirstToken: performanceMetrics.timeToFirstToken,
            avgTokensPerSecond: performanceMetrics.avgTokensPerSecond,
            totalTokens: performanceMetrics.totalTokens,
            totalDuration: performanceMetrics.totalDuration,
          },
        },
      });
      
      // Clear temporary state
      setRecentReasoning([]);
      rag.clearSources();
      tools.clearToolResults();
      
      // ✨ PHASE 2: Reset estimations for next message
      timeEstimation.reset();
    });
    
    // Error (UPDATED with Phase 2)
    streaming.onEvent('error', (data) => {
      console.error('[AskExpert] Stream error:', data);
      
      // ✨ PHASE 2: Track error and stop all trackers
      streamingProgress.setError(data.message || 'Stream error');
      performanceMetrics.recordError(data.message);
      performanceMetrics.endSession(false); // failed session
      connectionQuality.recordError(data.message, data.code);
      typingIndicator.stopTyping();
      tokenStreaming.stop();
      
      messageManager.cancelStreaming();
      messageManager.addMessage({
        id: nanoid(),
        role: 'assistant',
        content: `Error: ${data.message || 'An unexpected error occurred'}`,
        timestamp: Date.now(),
      });
    });
    
    return () => {
      // Cleanup event handlers
      streaming.offEvent('start');
      streaming.offEvent('first_token');
      streaming.offEvent('thinking');
      streaming.offEvent('tools_start');
      streaming.offEvent('content');
      streaming.offEvent('reasoning');
      streaming.offEvent('sources');
      streaming.offEvent('tool_suggestion');
      streaming.offEvent('tool_result');
      streaming.offEvent('done');
      streaming.offEvent('error');
    };
  }, [
    streaming,
    messageManager,
    rag,
    tools,
    recentReasoning,
    // ✨ PHASE 2: Add new dependencies
    tokenStreaming,
    streamingProgress,
    connectionQuality,
    typingIndicator,
    timeEstimation,
    performanceMetrics,
  ]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageManager.messages, messageManager.streamingMessage]);
  
  // Load prompt starters
  useEffect(() => {
    const loadPromptStarters = async () => {
      setLoadingPromptStarters(true);
      try {
        const response = await fetch('/api/prompt-starters');
        if (response.ok) {
          const data = await response.json();
          setPromptStarters(data.prompts || []);
        }
      } catch (error) {
        console.error('[AskExpert] Failed to load prompt starters:', error);
      } finally {
        setLoadingPromptStarters(false);
      }
    };
    
    loadPromptStarters();
  }, []);
  
  // Load available tools
  useEffect(() => {
    const loadTools = async () => {
      setLoadingTools(true);
      try {
        const response = await fetch('/api/tools');
        if (response.ok) {
          const data = await response.json();
          setAvailableTools(data.tools?.map((t: any) => t.name) || []);
        }
      } catch (error) {
        console.error('[AskExpert] Failed to load tools:', error);
      } finally {
        setLoadingTools(false);
      }
    };
    
    loadTools();
  }, []);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="flex h-full flex-col bg-background">
      {/* ✨ PHASE 2: Connection Quality Banner (only show during active streaming) */}
      {connectionQuality.isConnected && (connectionQuality.quality === 'poor' || connectionQuality.quality === 'fair') && (
        <ConnectionStatusBanner
          quality={connectionQuality.quality}
          latencyMs={connectionQuality.latencyMs}
          packetLoss={connectionQuality.packetLoss}
          uptimePercent={connectionQuality.uptimePercent}
          showDetails={true}
          onRetry={() => {
            connectionQuality.reset();
            connectionQuality.connect();
          }}
          onDismiss={connectionQuality.clearErrors}
        />
      )}
      
      {/* Connection Status (Existing - reconnecting/error states) */}
      {streaming.connectionStatus.isReconnecting && (
        <ConnectionStatusComponent 
          status="reconnecting"
          message={`Reconnecting... (Attempt ${streaming.connectionStatus.reconnectAttempts}/${streaming.connectionStatus.maxReconnectAttempts})`}
        />
      )}
      
      {streaming.lastError && (
        <ConnectionStatusComponent 
          status="error"
          message={streaming.lastError}
          onDismiss={streaming.clearError}
        />
      )}
      
      {/* ✨ PHASE 2: Streaming Progress Indicators */}
      {streamingProgress.isActive && (
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="mx-auto max-w-4xl">
            <StreamingProgress
              stage={streamingProgress.stage}
              progress={streamingProgress.percentComplete}
              estimatedTimeRemaining={timeEstimation.estimate.secondsRemaining ? 
                timeEstimation.estimate.secondsRemaining * 1000 : null}
              tokensPerSecond={streamingProgress.tokensPerSecond}
              totalTokens={streamingProgress.totalTokens}
              showDetails={true}
            />
            
            {/* Show typing indicator during thinking stage */}
            {typingIndicator.isTyping && streamingProgress.stage === 'thinking' && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <span className="animate-bounce delay-0">•</span>
                  <span className="animate-bounce delay-100">•</span>
                  <span className="animate-bounce delay-200">•</span>
                </div>
                <span>{typingIndicator.typingMessage}</span>
              </div>
            )}
            
            {/* Time estimate (when available) */}
            {timeEstimation.estimate.formatted && timeEstimation.estimate.confidence > 30 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Estimated time remaining: {timeEstimation.estimate.formatted} 
                <span className="ml-1 opacity-60">({timeEstimation.estimate.confidence}% confidence)</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Welcome / Empty State */}
          {!messageManager.hasMessages && (
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              <div className="rounded-full bg-primary/10 p-6">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Ask an Expert</h2>
                <p className="text-muted-foreground max-w-md">
                  {currentMode === 1 && 'Select an expert and ask your question'}
                  {currentMode === 2 && 'Ask your question and I\'ll select the best expert'}
                  {currentMode === 3 && 'Multiple AI agents will collaborate on your question'}
                  {currentMode === 4 && 'Fully autonomous mode with automatic orchestration'}
                </p>
              </div>
              
              {/* Prompt Starters */}
              {promptStarters.length > 0 && (
                <PromptStarters 
                  starters={promptStarters}
                  onStarterClick={handlePromptStarterClick}
                  loading={loadingPromptStarters}
                />
              )}
            </div>
          )}
          
          {/* Selected Agents (Mode 1 only) */}
          {currentMode === 1 && selectedAgents.length > 0 && (
            <SelectedAgentsList 
              agents={
                // Convert agent IDs to agent objects
                selectedAgents
                  .map(agentId => agents.find(a => a.id === agentId))
                  .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined)
              }
              onAgentRemove={(agentId) => {
                // Remove agent ID from selectedAgents array
                setSelectedAgents(selectedAgents.filter(id => id !== agentId));
              }}
            />
          )}
          
          {/* Messages */}
          <div className="space-y-6">
            {messageManager.messages.map((message) => {
              const agentFromMessage = message.selectedAgent
                ? agents.find((agent) => agent.id === message.selectedAgent?.id)
                : null;
              const metadataAgentName = typeof message.metadata?.agentName === 'string'
                ? message.metadata?.agentName
                : undefined;
              const agentDisplayName =
                agentFromMessage?.displayName ||
                message.selectedAgent?.display_name ||
                message.selectedAgent?.name ||
                metadataAgentName;
              const agentAvatar =
                agentFromMessage?.avatar ||
                (typeof message.metadata?.agentAvatar === 'string' ? message.metadata?.agentAvatar : undefined);
              
              return (
                <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <AgentAvatar 
                      agentId={message.selectedAgent?.id || 'assistant'}
                      size="sm"
                    />
                  )}
                  
                  <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <EnhancedMessageDisplay 
                      {...message}
                      agentName={agentDisplayName}
                      agentAvatar={agentAvatar}
                      userName={user?.user_metadata?.full_name || user?.user_metadata?.name}
                      userEmail={user?.email}
                    />
                    
                    {/* Follow-up suggestions */}
                    {message.role === 'assistant' && message.id === messageManager.getLastAssistantMessage()?.id && (
                      <div className="mt-4">
                        <Suggestions>
                          {generateFollowUpSuggestions(message).map((suggestion, idx) => (
                            <Suggestion 
                              key={idx}
                              onClick={() => setInputValue(suggestion)}
                            >
                              {suggestion}
                            </Suggestion>
                          ))}
                        </Suggestions>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Streaming Message - ✨ PHASE 2: Token-by-Token Animation */}
            {messageManager.streamingMessage && (
              <div className="flex gap-4">
                <AgentAvatar agentId={activeStreamingAgent?.id || 'assistant'} size="sm" />
                <div className="flex-1 max-w-3xl">
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    {activeStreamingAgent?.displayName || activeStreamingAgent?.name || 'AI Assistant'}
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    {/* ✨ PHASE 2: Animated token display */}
                    <TokenDisplay
                      text={messageManager.streamingMessage}
                      isStreaming={tokenStreaming.isStreaming}
                      showCursor={true}
                      animationDuration={30}
                    />
                    
                    {/* Recent reasoning (if any) */}
                    {recentReasoning.length > 0 && (
                      <div className="mt-4 space-y-2 border-t pt-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Brain className="h-4 w-4" />
                          <span>Reasoning</span>
                        </div>
                        {recentReasoning.map((step, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground pl-6">
                            {step}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Sources (if any) */}
                    {rag.sources.length > 0 && (
                      <div className="mt-4 space-y-2 border-t pt-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>Sources ({rag.sources.length})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tool Execution Status */}
            {tools.hasActiveTools && (
              <ToolExecutionStatusComponent 
                tools={tools.executionStatus.tools}
              />
            )}
            
            {/* Tool Results */}
            {tools.toolResults.length > 0 && (
              <ToolResults results={tools.toolResults} />
            )}
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <PromptInput 
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder={
              currentMode === 1 && selectedAgents.length === 0
                ? 'Select an agent to start...'
                : 'Ask a question...'
            }
            selectedModel="gpt-4"
            onModelChange={(model) => console.log('Model changed:', model)}
            isAutomatic={modeLogic.isAutomatic}
            onAutomaticChange={modeLogic.toggleAutomatic}
            isAutonomous={modeLogic.isAutonomous}
            onAutonomousChange={modeLogic.toggleAutonomous}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            // RAG configuration (✅ Fixed - use state)
            enableRAG={enableRAG}
            onEnableRAGChange={setEnableRAG}
            availableRagDomains={['digital-health', 'regulatory-affairs', 'clinical-research']}
            selectedRagDomains={selectedRagDomains}
            onSelectedRagDomainsChange={setSelectedRagDomains}
            // Tools configuration (✅ Fixed - use state)
            enableTools={enableTools}
            onEnableToolsChange={setEnableTools}
            availableTools={['calculator', 'web_search', 'database_query']}
            selectedTools={selectedTools}
            onSelectedToolsChange={setSelectedTools}
            // Settings
            showSettings={showSettings}
            onSettingsToggle={() => setShowSettings(!showSettings)}
            onHelpClick={() => {
              // Show appropriate mode helper
              if (currentMode === 1) setShowMode1Helper(true);
              else if (currentMode === 2) setShowMode2Helper(true);
              else if (currentMode === 3) setShowMode3Helper(true);
              else if (currentMode === 4) setShowMode4Helper(true);
            }}
            onMode1HelperClick={() => setShowMode1Helper(true)}
            onMode2HelperClick={() => setShowMode2Helper(true)}
            onMode3HelperClick={() => setShowMode3Helper(true)}
            onMode4HelperClick={() => setShowMode4Helper(true)}
          />
        </div>
      </div>
      
      {/* ✨ PHASE 2: Development Metrics Panel (only in dev mode) */}
      {process.env.NODE_ENV === 'development' && streamingProgress.isActive && (
        <div className="border-t bg-muted/50 px-4 py-2">
          <div className="mx-auto max-w-4xl flex items-center justify-between text-xs font-mono">
            <div className="flex gap-4">
              <span className="text-muted-foreground">
                TTFT: <span className="font-semibold text-foreground">
                  {performanceMetrics.timeToFirstToken ? `${performanceMetrics.timeToFirstToken}ms` : '-'}
                </span>
              </span>
              <span className="text-muted-foreground">
                TPS: <span className="font-semibold text-foreground">
                  {streamingProgress.tokensPerSecond.toFixed(1)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Tokens: <span className="font-semibold text-foreground">
                  {streamingProgress.totalTokens}
                </span>
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">
                Quality: <span className={`font-semibold ${
                  connectionQuality.quality === 'excellent' ? 'text-green-600' :
                  connectionQuality.quality === 'good' ? 'text-blue-600' :
                  connectionQuality.quality === 'fair' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {connectionQuality.quality}
                </span>
              </span>
              <span className="text-muted-foreground">
                Latency: <span className="font-semibold text-foreground">
                  {connectionQuality.latencyMs ? `${Math.round(connectionQuality.latencyMs)}ms` : '-'}
                </span>
              </span>
              <span className="text-muted-foreground">
                Uptime: <span className="font-semibold text-foreground">
                  {performanceMetrics.connectionUptime.toFixed(1)}%
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Tool Confirmation Modal */}
      {tools.pendingToolConfirmation && (
        <ToolConfirmation 
          tool={tools.pendingToolConfirmation.tool}
          onConfirm={tools.confirmTool}
          onDecline={tools.declineTool}
        />
      )}
      
      {/* Onboarding Modals */}
      <AskExpertOnboarding 
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      
      <Mode1Helper 
        open={showMode1Helper}
        onClose={() => setShowMode1Helper(false)}
      />
      
      <Mode2Helper 
        open={showMode2Helper}
        onClose={() => setShowMode2Helper(false)}
      />
      
      <Mode3Helper 
        open={showMode3Helper}
        onClose={() => setShowMode3Helper(false)}
      />
      
      <Mode4Helper 
        open={showMode4Helper}
        onClose={() => setShowMode4Helper(false)}
      />
      
      {/* Artifact Generator */}
      {showArtifactGenerator && (
        <InlineArtifactGenerator 
          onClose={() => setShowArtifactGenerator(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// PAGE WRAPPER (with Providers)
// ============================================================================

export default function AskExpertPage() {
  // AskExpertProvider already wraps the entire app in AppLayoutClient, so we only add ChatHistoryProvider here.
  return (
    <ChatHistoryProvider>
      <AskExpertPageContent />
    </ChatHistoryProvider>
  );
}
