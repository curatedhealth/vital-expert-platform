'use client';

/**
 * @fileoverview Claude.ai-Inspired Expert Consultation Interface
 * @description Clean, minimal prompt composer with 2 simple toggles
 *
 * Features:
 * - Claude.ai-style prompt composer
 * - 2 simple toggles: Automatic (on/off), Autonomous (on/off)
 * - Clean attachment UI
 * - Real-time streaming responses
 * - Conversation sidebar
 * - Dark/light mode
 * - Token counter
 *
 * @author VITAL AI Platform Team
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Sparkles,
  Send,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  Copy,
  Check,
  Bot,
  User,
  FileText,
  Brain,
  Paperclip,
  BookOpen,
  AlertCircle,
  Image as ImageIcon,
  Zap,
  Settings2,
  Wrench,
  MessageSquare,
} from 'lucide-react';
import { PromptInput } from '@/components/prompt-input';
import { type Agent as SidebarAgent } from '@/components/ask-expert-sidebar';
import { AskExpertProvider, useAskExpert } from '@/contexts/ask-expert-context';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/chat-history-context';
import { PromptStarters, type PromptStarter } from '@/components/prompt-starters';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useConversations } from '@/lib/hooks/use-conversations';
import { ChatHistorySidebar } from '@/components/chat-history-sidebar';
import { SelectedAgentsList } from '@/components/selected-agent-card';
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ui/shadcn-io/ai/reasoning';
import {
  __Conversation as Conversation,
  __ConversationContent as ConversationContent,
} from '@/components/ui/shadcn-io/ai/conversation';
import { EnhancedMessageDisplay } from '@/features/ask-expert/components/EnhancedMessageDisplay';
import { InlineArtifactGenerator } from '@/features/ask-expert/components/InlineArtifactGenerator';
import { AdvancedStreamingWindow } from '@/features/ask-expert/components/AdvancedStreamingWindow';
import { AgentAvatar, Button } from '@vital/ui';
import { Suggestions, Suggestion } from '@/components/ai/suggestion';
import { useAgentWithStats } from '@/features/ask-expert/hooks/useAgentWithStats';
import { WorkflowSelector } from '@/components/ask-expert/WorkflowSelector';
import { useAgentsStore } from '@/lib/stores/agents-store';

// ============================================================================
// TYPES
// ============================================================================

interface Source {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  excerpt?: string;
  similarity?: number;
  domain?: string;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D' | 'Unknown';
  organization?: string;
  reliabilityScore?: number;
  lastUpdated?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: AttachmentInfo[];
  reasoning?: string[];
  sources?: Source[];
  selectedAgent?: {
    id: string;
    name: string;
    display_name: string;
  };
  selectionReason?: string;
  confidence?: number;
  autonomousMetadata?: {
    goalUnderstanding?: string;
    executionPlan?: string;
    currentIteration?: number;
    currentThought?: string;
    currentAction?: string;
    currentObservation?: string;
    currentReflection?: string;
    finalAnswer?: string;
    finalConfidence?: number;
    totalIterations?: number;
  };
  branches?: Array<{
    id: string;
    content: string;
    confidence?: number;
    citations?: {
      number: number;
      text: string;
      sourceId?: string;
    }[];
    sources?: Source[];
    createdAt?: Date;
    reasoning?: string | string[];
  }>;
  currentBranch?: number;
  metadata?: {
    ragSummary?: {
      totalSources: number;
      strategy?: string;
      domains?: string[];
      cacheHit?: boolean;
      warning?: string;
      retrievalTimeMs?: number;
    };
    toolSummary?: {
      allowed: string[];
      used: string[];
      totals: {
        calls: number;
        success: number;
        failure: number;
        totalTimeMs: number;
      };
    };
    sources?: Source[];
    reasoning?: string[];
    confidence?: number;
    citations?: {
      number: number;
      text: string;
      sourceId?: string;
    }[];
  };
}

interface AttachmentInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

// ============================================================================
// GOLD STANDARD: Additional Interfaces from page-complete.tsx
// ============================================================================

interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  startTime?: Date;
  endTime?: Date;
}

interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  confidence?: number;
  timestamp: Date;
}

interface StreamingMetrics {
  tokensGenerated: number;
  tokensPerSecond: number;
  elapsedTime: number;
  estimatedTimeRemaining?: number;
}

interface SessionStats {
  totalConversations: number;
  totalMessages: number;
  avgSessionDuration: string;
  mostUsedMode: string;
  mostUsedAgent: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AskExpertPageContent() {
  // Get agents and selection from context (loaded by layout sidebar)
  const { selectedAgents, agents, setSelectedAgents, refreshAgents } = useAskExpert();
  const { user } = useAuth();
  
  // Also use agents store directly to ensure we have access to all experts
  const { agents: storeAgents, loadAgents: loadStoreAgents, isLoading: isLoadingStoreAgents } = useAgentsStore();
  
  // Load agents from store on mount
  useEffect(() => {
    if (storeAgents.length === 0 && !isLoadingStoreAgents) {
      console.log('🔄 [AskExpert] Loading agents from store...');
      loadStoreAgents();
    }
  }, [loadStoreAgents, storeAgents.length, isLoadingStoreAgents]);
  
  // Merge store agents with context agents (prefer store agents as they're more up-to-date)
  const allAvailableAgents = useMemo(() => {
    const storeAgentMap = new Map(storeAgents.map(a => [a.id, a]));
    const contextAgentMap = new Map(agents.map(a => [a.id, a]));
    
    // Start with store agents, then add any context agents not in store
    const merged = [...storeAgents];
    agents.forEach(contextAgent => {
      if (!storeAgentMap.has(contextAgent.id)) {
        merged.push(contextAgent);
      }
    });
    
    console.log(`📦 [AskExpert] Merged ${merged.length} agents (${storeAgents.length} from store, ${agents.length} from context)`);
    return merged;
  }, [storeAgents, agents]);

  // Theme hook (global dark/light mode)
  const { theme } = useTheme();

  // Chat history context
  const {
    currentSession,
    messages: chatMessages,
    addMessage,
    createSession,
    updateSession
  } = useChatHistory();

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState<string>('');
  const [isStreamingReasoning, setIsStreamingReasoning] = useState(false);
  const [recentReasoning, setRecentReasoning] = useState<string[]>([]);
  const [recentReasoningTimestamp, setRecentReasoningTimestamp] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  // Simple toggles (like Claude.ai)
  // Default: Both OFF → Mode 1: Manual Interactive
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [enableRAG, setEnableRAG] = useState(false); // RAG disabled by default - user must enable
  const [enableTools, setEnableTools] = useState(false); // Tools disabled by default - user must enable
  const [hasManualToolsToggle, setHasManualToolsToggle] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [showArtifactGenerator, setShowArtifactGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedRagDomains, setSelectedRagDomains] = useState<string[]>([]);
  const [allAvailableTools, setAllAvailableTools] = useState<string[]>([]);
  const [allAvailableRagDomains, setAllAvailableRagDomains] = useState<string[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [loadingRagDomains, setLoadingRagDomains] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [streamingMeta, setStreamingMeta] = useState<{
    ragSummary?: NonNullable<Message['metadata']>['ragSummary'];
    toolSummary?: NonNullable<Message['metadata']>['toolSummary'];
    sources?: Source[];
    reasoning: string[];
  } | null>(null);

  // ============================================================================
  // GOLD STANDARD: Advanced Streaming State
  // ============================================================================
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics>({
    tokensGenerated: 0,
    tokensPerSecond: 0,
    elapsedTime: 0,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalConversations: 0,
    totalMessages: 0,
    avgSessionDuration: '0m',
    mostUsedMode: 'Mode 1',
    mostUsedAgent: '',
  });


  const formatReasoningTimestamp = useCallback((value: number | null) => {
    if (!value) {
      return '';
    }
    try {
      return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, []);

  // ============================================================================
  // GOLD STANDARD: Pause/Resume Handlers
  // ============================================================================
  const handlePauseStreaming = useCallback(() => {
    setIsPaused(true);
    // Note: Full pause support requires backend implementation
    // For now, updates UI state only
  }, []);

  const handleResumeStreaming = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleBranchChange = useCallback((messageId: string, branchIndex: number) => {
    let updatedMessage: Message | undefined;

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        const selectedBranch = message.branches?.[branchIndex];
        const branchReasoning = selectedBranch?.reasoning
          ? Array.isArray(selectedBranch.reasoning)
            ? selectedBranch.reasoning
            : [selectedBranch.reasoning]
          : message.metadata?.reasoning ?? message.reasoning ?? [];
        const branchSources = selectedBranch?.sources && selectedBranch.sources.length > 0
          ? selectedBranch.sources.map((src) => ({ ...src }))
          : message.sources;

        const nextMessage: Message = {
          ...message,
          currentBranch: branchIndex,
          content: selectedBranch?.content ?? message.content,
          sources: branchSources,
          metadata: message.metadata
            ? {
                ...message.metadata,
                sources: branchSources,
                reasoning: branchReasoning,
              }
            : message.metadata,
        };

        updatedMessage = nextMessage;
        return nextMessage;
      })
    );

    if (updatedMessage) {
      setRecentReasoning(
        updatedMessage.metadata?.reasoning ?? updatedMessage.reasoning ?? []
      );
      setRecentReasoningTimestamp(Date.now());

      if (activeConversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((message) =>
                    message.id === updatedMessage!.id
                      ? { ...message, ...updatedMessage }
                      : message
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          )
        );
      }
    }
  }, [activeConversationId, setConversations, setMessages, setRecentReasoning, setRecentReasoningTimestamp]);

  const submitFeedbackForMessage = useCallback(
    async (message: Message, type: 'positive' | 'negative', previousUserMessage?: Message) => {
      const vote = type === 'positive' ? 'up' : 'down';
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId: message.id,
            vote,
            rating: vote === 'up' ? 5 : 1,
            queryText: previousUserMessage?.content ?? '',
            responseText: message.content,
            agentId: message.selectedAgent?.id,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    },
    []
  );

  // Fetch all available tools from database
  useEffect(() => {
    const fetchAllTools = async () => {
      try {
        setLoadingTools(true);
        const response = await fetch('/api/tools-crud?limit=10000');
        if (response.ok) {
          const data = await response.json();
          const toolNames = (data.tools || []).map((tool: any) => tool.name || tool.slug).filter(Boolean);
          setAllAvailableTools(toolNames);
        } else {
          // API returns empty array on error, so just log and continue
          const errorText = await response.text();
          console.warn('Failed to fetch tools, using empty list:', errorText);
          setAllAvailableTools([]);
        }
      } catch (error) {
        console.warn('Error fetching tools, using empty list:', error);
        setAllAvailableTools([]);
      } finally {
        setLoadingTools(false);
      }
    };

    fetchAllTools();
  }, []);

  // Fetch all available RAG domains from database
  useEffect(() => {
    const fetchAllRagDomains = async () => {
      try {
        setLoadingRagDomains(true);
        const response = await fetch('/api/knowledge-domains');
        if (response.ok) {
          const data = await response.json();
          const domainNames = (data.domains || []).map((domain: any) => domain.name).filter(Boolean);
          setAllAvailableRagDomains(domainNames);
        } else {
          // API returns empty array on error, so just log and continue
          const errorText = await response.text();
          console.warn('Failed to fetch RAG domains, using empty list:', errorText);
          setAllAvailableRagDomains([]);
        }
      } catch (error) {
        console.warn('Error fetching RAG domains, using empty list:', error);
        setAllAvailableRagDomains([]);
      } finally {
        setLoadingRagDomains(false);
      }
    };

    fetchAllRagDomains();
  }, []);

  // Use merged agents list (from store + context)
  const effectiveAgents = allAvailableAgents.length > 0 ? allAvailableAgents : agents;
  
  // Use all available tools from database (not just from selected agents)
  const availableTools = useMemo(() => {
    // Return all tools from database, sorted
    return Array.from(new Set(allAvailableTools)).sort((a, b) => a.localeCompare(b));
  }, [allAvailableTools]);

  useEffect(() => {
    // Update selected tools to only include valid ones (remove invalid selections)
    setSelectedTools((prev) => {
      const valid = prev.filter((tool) => availableTools.includes(tool));
      return valid;
    });
  }, [availableTools]);

  const currentMode = useMemo(() => {
    if (isAutonomous && isAutomatic) {
      return { id: 3, name: 'Autonomous Automatic', description: 'AI selects agent + autonomous reasoning', color: 'purple' };
    }
    if (isAutonomous && !isAutomatic) {
      return { id: 4, name: 'Autonomous Manual', description: 'You select agent + autonomous reasoning', color: 'green' };
    }
    if (!isAutonomous && isAutomatic) {
      return { id: 2, name: 'Automatic Selection', description: 'AI selects best agent for you', color: 'blue' };
    }
    return { id: 1, name: 'Manual Interactive', description: 'You select agent + interactive chat', color: 'gray' };
  }, [isAutonomous, isAutomatic]);

  const primarySelectedAgent = useMemo(() => {
  if (!selectedAgents.length) {
    return null;
  }
  const agent = effectiveAgents.find((a) => a.id === selectedAgents[0]);
    if (!agent) {
      return null;
    }

    const displayName =
      (agent as any).displayName ||
      (agent as any).display_name ||
      agent.name;

  return {
    id: agent.id,
    avatar: agent.avatar,
    displayName,
  };
  }, [effectiveAgents, selectedAgents]);

  const primaryAgentId = selectedAgents.length ? selectedAgents[0] : null;
  const {
    stats: primaryAgentStats,
    memory: primaryAgentMemory,
    isLoadingMemory: isLoadingPrimaryMemory,
  } = useAgentWithStats(primaryAgentId, user?.id ?? null);

  const latestAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role === 'assistant' && message.content?.trim()) {
        return message;
      }
    }
    return undefined;
  }, [messages]);

  const followUpSuggestions = useMemo(() => {
    return generateFollowUpSuggestions(
      latestAssistantMessage,
      streamingMessage,
      currentMode.name
    );
  }, [latestAssistantMessage, streamingMessage, currentMode]);

  const artifactConversationContext = useMemo(() => {
    if (messages.length === 0) {
      return '';
    }
    return messages
      .slice(-6)
      .map((message) => {
        const speaker = message.role === 'user' ? 'User' : 'Expert';
        const text = message.content?.trim() ?? '';
        return text.length > 0 ? `${speaker}: ${text}` : '';
      })
      .filter((line) => line.length > 0)
      .join('\n');
  }, [messages]);

  const handleArtifactGenerate = useCallback(
    async (templateId: string, artifactInputs: Record<string, string>) => {
      try {
        console.debug('[AskExpert] Artifact generation requested', {
          templateId,
          artifactInputs,
        });
      } catch (error) {
        console.error('[AskExpert] Artifact generation hook failed', error);
      }
    },
    []
  );

  const hasAssistantResponse = useMemo(
    () => messages.some((message) => message.role === 'assistant' && message.content?.trim()),
    [messages]
  );

  const shouldShowSuggestions =
    followUpSuggestions.length > 0 &&
    (hasAssistantResponse || Boolean(streamingMessage && streamingMessage.trim().length > 0));

  // Use all available RAG domains from database (not just from selected agents)
  const availableRagDomains = useMemo(() => {
    // Return all RAG domains from database, sorted
    return Array.from(new Set(allAvailableRagDomains)).sort((a, b) => a.localeCompare(b));
  }, [allAvailableRagDomains]);

  useEffect(() => {
    // Update selected RAG domains to only include valid ones (remove invalid selections)
    setSelectedRagDomains((prev) => {
      const valid = prev.filter((domain) => availableRagDomains.includes(domain));
      return valid;
    });
  }, [availableRagDomains]);

  useEffect(() => {
    if (messages.length === 0 && showArtifactGenerator) {
      setShowArtifactGenerator(false);
    }
  }, [messages.length, showArtifactGenerator]);

  const handleEnableToolsChange = useCallback((value: boolean) => {
    if (enableTools === value) {
      return;
    }
    setHasManualToolsToggle(true);
    setEnableTools(value);
  }, [enableTools]);

  // Prompt starters
  const [promptStarters, setPromptStarters] = useState<PromptStarter[]>([]);
  const [loadingPromptStarters, setLoadingPromptStarters] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estimate token count
  useEffect(() => {
    const estimated = Math.ceil((inputValue.length + messages.reduce((acc, m) => acc + m.content.length, 0)) / 4);
    setTokenCount(estimated);
  }, [inputValue, messages]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  // Conversations management with database (replaces localStorage)
  const {
    conversations: dbConversations,
    isLoading: conversationsLoading,
    createMutation,
    updateMutation,
    deleteMutation,
    migrateMutation,
  } = useConversations(user?.id || null);
  const migrationCompleted = useRef(false);
  const conversationsInitialized = useRef(false);

  // Migrate from localStorage on mount (one-time)
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined' && !migrationCompleted.current) {
      const hasLocalStorage = localStorage.getItem('vital-conversations');
      if (hasLocalStorage && !migrationCompleted.current) {
        migrateMutation.mutate(undefined, {
          onSuccess: () => {
            migrationCompleted.current = true;
          },
        });
      }
    }
  }, [user?.id, migrateMutation]);

  // Load conversations from database
  useEffect(() => {
    // Skip if already initialized or if we have an active conversation
    if (conversationsInitialized.current || activeConversationId) {
      return;
    }

    if (dbConversations && dbConversations.length > 0) {
      setConversations(dbConversations);
      // Only set active conversation if we don't have one
      if (dbConversations[0]) {
        setActiveConversationId(dbConversations[0].id);
        setMessages(dbConversations[0].messages);
        conversationsInitialized.current = true;
      }
    } else if (!conversationsLoading && (!dbConversations || dbConversations.length === 0)) {
      // Create first conversation if none exist
      conversationsInitialized.current = true; // Set early to prevent re-running
      const newConv: Conversation = {
        id: `temp_${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (user?.id) {
        createMutation.mutate({
          title: newConv.title,
          messages: newConv.messages,
          createdAt: newConv.createdAt,
          updatedAt: newConv.updatedAt,
        }, {
          onSuccess: (created) => {
            setConversations([created]);
            setActiveConversationId(created.id);
          },
        });
      } else {
        setConversations([newConv]);
        setActiveConversationId(newConv.id);
      }
    }
  }, [dbConversations, conversationsLoading, user?.id, createMutation, activeConversationId]);

  // Save conversation updates to database
  useEffect(() => {
    if (conversations.length > 0 && user?.id && !conversationsLoading && conversationsInitialized.current) {
      const activeConv = conversations.find(c => c.id === activeConversationId);
      if (activeConv && activeConv.id && !activeConv.id.startsWith('temp_')) {
        // Only update existing conversations (not temp ones)
        // Debounce updates to prevent excessive API calls
        const timeoutId = setTimeout(() => {
          updateMutation.mutate({
            conversationId: activeConv.id,
            updates: {
              messages: activeConv.messages,
              title: activeConv.title,
              isPinned: activeConv.isPinned,
            },
          });
        }, 500); // Wait 500ms before saving
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [conversations, activeConversationId, user?.id, conversationsLoading, updateMutation]);

  // Fetch prompt starters when selected agents change
  useEffect(() => {
    if (selectedAgents.length === 0) {
      setPromptStarters([]);
      return;
    }

    const fetchPromptStarters = async () => {
      setLoadingPromptStarters(true);
      try {
        const response = await fetch('/api/prompt-starters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentIds: selectedAgents }),
        });

        if (response.ok) {
          const data = await response.json();
          setPromptStarters(data.prompts || []);
        } else {
          console.error('Failed to fetch prompt starters');
          setPromptStarters([]);
        }
      } catch (error) {
        console.error('Error fetching prompt starters:', error);
        setPromptStarters([]);
      } finally {
        setLoadingPromptStarters(false);
      }
    };

    fetchPromptStarters();
  }, [selectedAgents]);

  // File upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSend = async ({
    promptText,
    attachmentsOverride,
    existingUserMessage,
    skipUserMessageAppend = false,
    conversationOverride,
  }: {
    promptText?: string;
    attachmentsOverride?: File[];
    existingUserMessage?: Message;
    skipUserMessageAppend?: boolean;
    conversationOverride?: Message[];
  } = {}) => {
    const pendingPrompt = promptText ?? inputValue;
    if (!pendingPrompt.trim() || isLoading) return;

    // ============================================================================
    // GOLD STANDARD: Reset streaming state for new message
    // ============================================================================
    setWorkflowSteps([]);
    setReasoningSteps([]);
    setStreamingMetrics({
      tokensGenerated: 0,
      tokensPerSecond: 0,
      elapsedTime: 0,
    });
    setIsPaused(false);

    const messageContent = pendingPrompt.trim();
    const effectiveAttachments = attachmentsOverride ?? attachments;
    const conversationContext = conversationOverride ?? messages;

    // Determine mode based on UI toggles (Mode 1-4 system)
    let mode: 'manual' | 'automatic' | 'autonomous' | 'multi-expert' = 'manual';

    if (isAutonomous && isAutomatic) {
      mode = 'autonomous'; // Mode 3: Autonomous-Automatic (orchestrator selects agent + autonomous reasoning)
    } else if (isAutonomous && !isAutomatic) {
      mode = 'multi-expert'; // Mode 4: Autonomous-Manual (user selects agent + autonomous reasoning)
    } else if (!isAutonomous && isAutomatic) {
      mode = 'automatic'; // Mode 2: Automatic Agent Selection (orchestrator selects agent)
    } else {
      mode = 'manual'; // Mode 1: Manual Interactive (user selects agent)
    }

    // For Mode 1 and Mode 4, we need a single selected agent
    const agentId = selectedAgents.length > 0 ? selectedAgents[0] : undefined;

    // Check if Mode 1 or Mode 4 requires an agent but none is selected
    if ((mode === 'manual' || mode === 'multi-expert') && !agentId) {
      console.log('❌ [Mode Check] No agent selected for mode:', mode, 'selectedAgents:', selectedAgents);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Please select an agent from the sidebar before sending a message. Click on an agent to add it to your chat.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    console.log('✅ [Mode Check] Mode:', mode, 'Agent ID:', agentId, 'Selected Agents:', selectedAgents);

    const userMessage: Message = existingUserMessage ?? {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      attachments: (effectiveAttachments ?? []).map((file, i) => ({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
    };

    if (!existingUserMessage && !skipUserMessageAppend) {
      setMessages(prev => [...prev, userMessage]);
    }
    if (!skipUserMessageAppend) {
      setInputValue('');
      setAttachments([]);
    }
    
    // Show reasoning component immediately when starting a request
    setStreamingReasoning('Thinking...');
    setIsStreamingReasoning(true);
    setIsLoading(true);
    setRecentReasoning([]);
    setRecentReasoningTimestamp(null);
    
    // Reset streaming message
    setStreamingMessage('');

    try {
      console.log('[AskExpert] Sending request to /api/ask-expert/orchestrate', {
        mode,
        agentId,
        messageLength: messageContent.length,
        enableRAG,
        enableTools,
      });
      
      // Build request body
      const requestBody: any = {
        mode: mode,
        agentId: (mode === 'manual' || mode === 'multi-expert') ? agentId : undefined, // For manual and multi-expert modes
        message: messageContent,
        conversationHistory: conversationContext.map(m => ({
          role: m.role,
          content: m.content
        })),
        // Optional settings
        enableRAG: enableRAG,
        enableTools: enableTools,
        requestedTools: enableTools ? selectedTools : undefined,
        selectedRagDomains: enableRAG ? selectedRagDomains : undefined,
        model: selectedModel,
        temperature: 0.7,
        maxTokens: 2000,
        userId: user?.id, // For Mode 2 and Mode 3 agent selection
        // Autonomous mode settings
        maxIterations: (mode === 'autonomous' || mode === 'multi-expert') ? 10 : undefined,
        confidenceThreshold: (mode === 'autonomous' || mode === 'multi-expert') ? 0.95 : undefined,
      };

      // If workflow is selected, include workflow definition
      if (selectedWorkflowId && selectedWorkflow) {
        requestBody.workflowId = selectedWorkflowId;
        requestBody.workflow = selectedWorkflow.workflow_definition;
        requestBody.workflowFramework = selectedWorkflow.framework;
        console.log('[AskExpert] Using workflow:', selectedWorkflow.name, 'Framework:', selectedWorkflow.framework);
      }

      const response = await fetch('/api/ask-expert/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let errorText = '';
        let errorData: any = {};
        
        try {
          if (contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorText = await response.text();
            
            // Check if it's an HTML error page (Next.js error page)
            if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
              // Try to extract error message from Next.js error page JSON
              try {
                const jsonMatch = errorText.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
                if (jsonMatch && jsonMatch[1]) {
                  const nextData = JSON.parse(jsonMatch[1]);
                  const errorMessage = nextData?.props?.pageProps?.err?.message || 
                                     nextData?.err?.message || 
                                     'Server error occurred';
                  errorData = { 
                    message: errorMessage,
                    statusCode: nextData?.props?.pageProps?.statusCode || response.status,
                  };
                } else {
                  // Fallback: extract from error message in HTML
                  const errorMatch = errorText.match(/message["']:\s*["']([^"']+)["']/);
                  if (errorMatch) {
                    errorData = { message: errorMatch[1] };
                  } else {
                    errorData = { 
                      message: `Server error (${response.status}): ${response.statusText}`,
                      html: true,
                    };
                  }
                }
              } catch (parseError) {
                errorData = { 
                  message: `Server error (${response.status}): ${response.statusText}. The server returned an HTML error page.`,
                  html: true,
                };
              }
            } else {
              // Try to parse as JSON even if content-type doesn't say so
              try {
                errorData = JSON.parse(errorText);
              } catch {
                errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
              }
            }
          }
        } catch (readError) {
          console.error('[AskExpert] Failed to read error response:', readError);
          errorData = { 
            message: `HTTP ${response.status}: ${response.statusText}`,
            readError: readError instanceof Error ? readError.message : String(readError),
          };
        }
        
        const errorMessage = errorData?.message || 
                           errorData?.error || 
                           errorText || 
                           `HTTP ${response.status}: ${response.statusText}`;
        
        console.error('[AskExpert] Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          errorData,
          errorText: errorText.substring(0, 200), // Limit log size
        });
        
        throw new Error(errorMessage);
      }
      
      console.log('[AskExpert] Response OK, starting stream processing');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let fullResponse = '';
      let reasoning: string[] = [];
      let sources: Source[] = [];
      let selectedAgent: Message['selectedAgent'] = undefined;
      let selectionReason: string | undefined = undefined;
      let confidence: number | undefined = undefined;
      let autonomousMetadata: any = {};
      let ragSummary = {
        totalSources: 0,
        strategy: undefined as string | undefined,
        domains: enableRAG ? [...selectedRagDomains] : [],
        cacheHit: false,
        warning: undefined as string | undefined,
        retrievalTimeMs: undefined as number | undefined,
      };
      let toolSummary = {
        allowed: enableTools ? [...selectedTools] : [],
        used: [] as string[],
        totals: { calls: 0, success: 0, failure: 0, totalTimeMs: 0 },
      };
      let finalMeta: any = null;
      let branches: Message['branches'];
      let currentBranch = 0;

      // ============================================================================
      // GOLD STANDARD: Streaming metrics tracking
      // ============================================================================
      const streamStartTime = Date.now();
      let totalTokens = 0;

      const updateStreamingMeta = () => {
        setStreamingMeta({
          ragSummary: { ...ragSummary },
          toolSummary: {
            ...toolSummary,
            totals: { ...toolSummary.totals },
          },
          sources: [...sources],
          reasoning: [...reasoning],
        });
      };

      updateStreamingMeta();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              // Handle different chunk types based on mode
              if (data.type === 'chunk' && data.content) {
                if (typeof data.content === 'string' && data.content.startsWith('__mode1_meta__')) {
                  try {
                    const meta = JSON.parse(data.content.slice('__mode1_meta__'.length));
                    switch (meta?.event) {
                      case 'rag_sources': {
                        const incomingSources = Array.isArray(meta.sources) ? meta.sources : [];
                        sources = incomingSources.map((source: any, idx: number) => ({
                          id: source.id || `source-${idx + 1}`,
                          url: source.url || '#',
                          title: source.title || `Source ${idx + 1}`,
                          excerpt: source.excerpt || source.description,
                          similarity: typeof source.similarity === 'number' ? source.similarity : undefined,
                          domain: source.domain,
                          evidenceLevel: source.evidenceLevel || 'Unknown',
                          organization: source.organization,
                          reliabilityScore: typeof source.reliabilityScore === 'number' ? source.reliabilityScore : undefined,
                          lastUpdated: source.lastUpdated,
                        }));
                        ragSummary = {
                          totalSources: typeof meta.total === 'number' ? meta.total : sources.length,
                          strategy: meta.strategy || ragSummary.strategy,
                          domains: Array.isArray(meta.domains) ? meta.domains : ragSummary.domains,
                          cacheHit: typeof meta.cacheHit === 'boolean' ? meta.cacheHit : ragSummary.cacheHit,
                          warning: undefined,
                          retrievalTimeMs: typeof meta.retrievalTimeMs === 'number' ? meta.retrievalTimeMs : ragSummary.retrievalTimeMs,
                        };
                        setStreamingReasoning(prev => {
                          const base = `📚 Retrieved ${sources.length} evidence source${sources.length === 1 ? '' : 's'}${meta.strategy ? ` (${meta.strategy})` : ''}`;
                          return prev ? `${base}\n\n${prev}` : base;
                        });
                        setIsStreamingReasoning(true);
                        reasoning.push(`Retrieved ${sources.length} evidence source${sources.length === 1 ? '' : 's'}${meta.strategy ? ` (${meta.strategy})` : ''}.`);
                        updateStreamingMeta();
                        break;
                      }
                      case 'rag_warning': {
                        ragSummary.warning = meta.message;
                        setStreamingReasoning(prev => {
                          const base = `⚠️ ${meta.message || 'Evidence could not be retrieved.'}`;
                          return prev ? `${base}\n\n${prev}` : base;
                        });
                        setIsStreamingReasoning(true);
                        if (meta.message) {
                          reasoning.push(meta.message);
                        }
                        updateStreamingMeta();
                        break;
                      }
                      case 'reasoning': {
                        const message =
                          typeof meta.message === 'string'
                            ? meta.message
                            : Array.isArray(meta.message)
                              ? meta.message.join('\n')
                              : '';
                        if (message && message.trim().length > 0) {
                          setStreamingReasoning(prev => {
                            return prev ? `${prev}\n\n${message}` : message;
                          });
                          setIsStreamingReasoning(true);
                          reasoning.push(message);
                          updateStreamingMeta();
                        }
                        break;
                      }
                      case 'tool_execution': {
                        const tool = meta.tool ?? {};
                        const toolName = typeof tool.name === 'string' ? tool.name : 'unknown tool';
                        const durationMs = typeof tool.durationMs === 'number' ? tool.durationMs : 0;
                        const success = typeof tool.success === 'boolean' ? tool.success : true;
                        const errorMessage = typeof tool.error === 'string' ? tool.error : undefined;
                        const outputPreview = typeof tool.outputPreview === 'string' ? tool.outputPreview : undefined;

                        const allowed = toolName && !toolSummary.allowed.includes(toolName)
                          ? [...toolSummary.allowed, toolName]
                          : toolSummary.allowed;

                        toolSummary = {
                          ...toolSummary,
                          allowed,
                          used: success && toolName
                            ? Array.from(new Set([...toolSummary.used, toolName]))
                            : toolSummary.used,
                          totals: {
                            calls: toolSummary.totals.calls + 1,
                            success: toolSummary.totals.success + (success ? 1 : 0),
                            failure: toolSummary.totals.failure + (success ? 0 : 1),
                            totalTimeMs: toolSummary.totals.totalTimeMs + durationMs,
                          },
                        };

                        const previewText = outputPreview
                          ? outputPreview.length > 160
                            ? `${outputPreview.slice(0, 157)}...`
                            : outputPreview
                          : undefined;

                        const base = success
                          ? `🛠️ Tool ${toolName} succeeded${previewText ? ` → ${previewText}` : ''}`
                          : `⚠️ Tool ${toolName} failed${errorMessage ? `: ${errorMessage}` : ''}`;

                        setStreamingReasoning(prev => {
                          return prev ? `${base}\n\n${prev}` : base;
                        });
                        setIsStreamingReasoning(true);
                        reasoning.push(base);
                        updateStreamingMeta();
                        break;
                      }
                      case 'final': {
                        finalMeta = meta;
                        if (meta.rag) {
                          ragSummary = {
                            totalSources: meta.rag.totalSources ?? ragSummary.totalSources,
                            strategy: meta.rag.strategy ?? ragSummary.strategy,
                            domains: Array.isArray(meta.rag.domains) ? meta.rag.domains : ragSummary.domains,
                            cacheHit: typeof meta.rag.cacheHit === 'boolean' ? meta.rag.cacheHit : ragSummary.cacheHit,
                            warning: meta.rag.warning ?? ragSummary.warning,
                            retrievalTimeMs: typeof meta.rag.retrievalTimeMs === 'number' ? meta.rag.retrievalTimeMs : ragSummary.retrievalTimeMs,
                          };
                        }
                        if (meta.tools) {
                          toolSummary = {
                            allowed: Array.isArray(meta.tools.allowed) ? meta.tools.allowed : toolSummary.allowed,
                            used: Array.isArray(meta.tools.used) ? meta.tools.used : toolSummary.used,
                            totals: {
                              calls: meta.tools.totals?.calls ?? toolSummary.totals.calls,
                              success: meta.tools.totals?.success ?? toolSummary.totals.success,
                              failure: meta.tools.totals?.failure ?? toolSummary.totals.failure,
                              totalTimeMs: meta.tools.totals?.totalTimeMs ?? toolSummary.totals.totalTimeMs,
                            },
                          };
                        }
                        if (Array.isArray(meta.branches) && meta.branches.length > 0) {
                          branches = meta.branches.map((branch: any, idx: number) => ({
                            id: branch.id || `branch-${idx + 1}`,
                            content: typeof branch.content === 'string' ? branch.content : '',
                            confidence: typeof branch.confidence === 'number' ? branch.confidence : 0,
                            citations: Array.isArray(branch.citations) ? branch.citations : [],
                            sources: Array.isArray(branch.sources)
                              ? branch.sources.map((src: any, sourceIdx: number) => ({
                                  id: src.id || `branch-${idx + 1}-source-${sourceIdx + 1}`,
                                  url: src.url || src.link || '#',
                                  title: src.title || src.name || `Source ${sourceIdx + 1}`,
                                  excerpt: src.excerpt || src.summary || src.description,
                                  similarity: typeof src.similarity === 'number' ? src.similarity : undefined,
                                  domain: src.domain,
                                  evidenceLevel: src.evidenceLevel || src.level || 'Unknown',
                                  organization: src.organization,
                                  reliabilityScore: typeof src.reliabilityScore === 'number' ? src.reliabilityScore : undefined,
                                  lastUpdated: src.lastUpdated,
                                }))
                              : [],
                            createdAt: branch.createdAt ? new Date(branch.createdAt) : new Date(),
                            reasoning: Array.isArray(branch.reasoning)
                              ? branch.reasoning.join('\n')
                              : branch.reasoning || undefined,
                          }));
                          currentBranch = typeof meta.currentBranch === 'number' ? meta.currentBranch : 0;
                        }
                        if (typeof meta.confidence === 'number') {
                          confidence = meta.confidence;
                        }
                        updateStreamingMeta();
                        break;
                      }
                      default:
                        break;
                    }
                  } catch (metaError) {
                    console.warn('[AskExpert] Failed to parse metadata chunk', metaError);
                  }
                  continue;
                }

                // Mode 1: Simple chunk
                // Skip error messages that start with "Error:"
                if (typeof data.content === 'string' && data.content.startsWith('Error:')) {
                  const errorMessage = data.content.replace(/^Error:\s*/, '');
                  setStreamingReasoning(prev => `❌ Error: ${errorMessage}`);
                  setIsStreamingReasoning(true);
                  fullResponse += data.content;
                } else {
                  fullResponse += data.content;
                  setStreamingMessage(fullResponse);

                  // GOLD STANDARD: Update streaming metrics
                  totalTokens += (data.content?.length || 0);
                  const elapsedSeconds = (Date.now() - streamStartTime) / 1000;
                  setStreamingMetrics({
                    tokensGenerated: totalTokens,
                    tokensPerSecond: elapsedSeconds > 0 ? totalTokens / elapsedSeconds : 0,
                    elapsedTime: elapsedSeconds,
                  });

                  // GOLD STANDARD: Add/update response generation workflow step
                  if (fullResponse.length > 0) {
                    setWorkflowSteps(prev => {
                      const hasResponseStep = prev.some(s => s.id === 'response-generation');
                      if (!hasResponseStep) {
                        return [
                          ...prev.map(s => s.id === 'rag-retrieval' && s.status === 'running' ? {...s, status: 'completed', endTime: new Date()} : s),
                          {
                            id: 'response-generation',
                            name: 'Response Generation',
                            description: `${totalTokens} tokens generated`,
                            status: 'running',
                            startTime: new Date()
                          }
                        ];
                      }
                      return prev.map(s => s.id === 'response-generation' ? {...s, description: `${totalTokens} tokens generated`} : s);
                    });
                  }

                  if (!streamingReasoning || streamingReasoning === 'Thinking...' || streamingReasoning.startsWith('❌')) {
                    setStreamingReasoning('Processing your request...');
                    setIsStreamingReasoning(true);
                  }
                }
              } else if (data.type === 'agent_selection' && data.agent) {
                // Mode 2 & Mode 3: Agent selection info
                selectedAgent = {
                  id: data.agent.id,
                  name: data.agent.name,
                  display_name: data.agent.display_name || data.agent.name
                };
                confidence = data.confidence;

                // GOLD STANDARD: Add workflow step for agent selection
                setWorkflowSteps(prev => [
                  ...prev.filter(s => s.id !== 'agent-selection'),
                  {
                    id: 'agent-selection',
                    name: 'Agent Selection',
                    description: `Selected: ${selectedAgent.display_name}`,
                    status: 'completed',
                    startTime: new Date(),
                    endTime: new Date()
                  }
                ]);

                // Add agent selection to reasoning
                setStreamingReasoning(prev => {
                  const agentInfo = `🤖 Selected Agent: ${data.agent.display_name || data.agent.name}`;
                  return prev && prev !== 'Thinking...' && prev !== 'Processing your request...'
                    ? `${prev}\n\n${agentInfo}`
                    : agentInfo;
                });
                setIsStreamingReasoning(true);
              } else if (data.type === 'selection_reason' && data.selectionReason) {
                // Mode 2 & Mode 3: Selection reason
                selectionReason = data.selectionReason;
                // Add selection reason to reasoning
                setStreamingReasoning(prev => {
                  const reasonText = `💡 Selection Reason: ${data.selectionReason}`;
                  return prev ? `${prev}\n\n${reasonText}` : reasonText;
                });
                setIsStreamingReasoning(true);
              } else if (data.type === 'goal_understanding') {
                // Mode 3 & Mode 4: Goal understanding
                autonomousMetadata.goalUnderstanding = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => `🎯 Goal Understanding: ${data.content}` + (prev ? '\n\n' + prev : ''));
                setIsStreamingReasoning(true);
                console.log('🎯 Goal Understanding:', data.content);
              } else if (data.type === 'execution_plan') {
                // Mode 3 & Mode 4: Execution plan
                autonomousMetadata.executionPlan = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `📋 Execution Plan: ${data.content}`);
                setIsStreamingReasoning(true);
                console.log('📋 Execution Plan:', data.content);
              } else if (data.type === 'iteration_start') {
                // Mode 3 & Mode 4: ReAct iteration start
                autonomousMetadata.currentIteration = data.metadata?.iteration;
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `🔄 Iteration ${data.metadata?.iteration + 1}: Starting`);
                setIsStreamingReasoning(true);
                console.log(`🔄 Iteration ${data.metadata?.iteration}: Starting`);
              } else if (data.type === 'thinking_start') {
                // Detailed step: Starting thinking
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `🧠 Analyzing current state...`);
                setIsStreamingReasoning(true);
              } else if (data.type === 'thought') {
                // Mode 3 & Mode 4: ReAct thought
                autonomousMetadata.currentThought = data.content;

                // GOLD STANDARD: Add reasoning step
                setReasoningSteps(prev => [
                  ...prev,
                  {
                    id: `thought-${Date.now()}`,
                    type: 'thought',
                    content: data.content,
                    confidence: data.metadata?.confidence,
                    timestamp: new Date()
                  }
                ]);

                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `🧠 Thought: ${data.content}`);
                setIsStreamingReasoning(true);
                console.log('🧠 Thought:', data.content);
              } else if (data.type === 'action_decision_start') {
                // Detailed step: Starting action decision
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `🎯 Deciding on next action...`);
                setIsStreamingReasoning(true);
              } else if (data.type === 'action_decided') {
                // Detailed step: Action decided
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `✅ Action Decided: ${data.content}`);
                setIsStreamingReasoning(true);
              } else if (data.type === 'action_execution_start') {
                // Detailed step: Starting action execution
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `⚙️ Executing action...`);
                setIsStreamingReasoning(true);
              } else if (data.type === 'action_executed') {
                // Detailed step: Action executed
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `✅ Action Executed: ${data.content}`);
                setIsStreamingReasoning(true);
              } else if (data.type === 'action') {
                // Mode 3 & Mode 4: ReAct action (fallback for old format)
                autonomousMetadata.currentAction = data.content;

                // GOLD STANDARD: Add reasoning step
                setReasoningSteps(prev => [
                  ...prev,
                  {
                    id: `action-${Date.now()}`,
                    type: 'action',
                    content: data.content,
                    timestamp: new Date()
                  }
                ]);

                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `⚡ Action: ${data.content}`);
                setIsStreamingReasoning(true);
                console.log('⚡ Action:', data.content);
              } else if (data.type === 'observation_start') {
                // Detailed step: Starting observation
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `🔍 Processing action results...`);
                setIsStreamingReasoning(true);
              } else if (data.type === 'observation') {
                // Mode 3 & Mode 4: ReAct observation
                autonomousMetadata.currentObservation = data.content;

                // GOLD STANDARD: Add reasoning step
                setReasoningSteps(prev => [
                  ...prev,
                  {
                    id: `observation-${Date.now()}`,
                    type: 'observation',
                    content: data.content,
                    timestamp: new Date()
                  }
                ]);

                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `👁️ Observation: ${data.content}`);
                setIsStreamingReasoning(true);
                console.log('👁️ Observation:', data.content);
              } else if (data.type === 'reflection_start') {
                // Detailed step: Starting reflection
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `💭 Reflecting on what we learned...`);
                setIsStreamingReasoning(true);
              } else if (data.type === 'reflection') {
                // Mode 3 & Mode 4: ReAct reflection
                autonomousMetadata.currentReflection = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? '\n\n' : '') + `🤔 Reflection: ${data.content}`);
                setIsStreamingReasoning(true);
                console.log('🤔 Reflection:', data.content);
              } else if (data.type === 'final_answer') {
                // Mode 3 & Mode 4: Final answer
                fullResponse = data.content;
                setStreamingMessage(fullResponse);
                autonomousMetadata.finalAnswer = data.content;
                autonomousMetadata.finalConfidence = data.metadata?.confidence;
                autonomousMetadata.totalIterations = data.metadata?.iterations;
                console.log('✅ Final Answer:', data.content);
              } else if (data.type === 'sources' && data.sources) {
                // RAG sources from the API
                sources = data.sources.map((src: any) => ({
                  id: src.id,
                  url: src.url || src.link || '#',
                  title: src.title || src.name || 'Source',
                  description: src.description || src.excerpt || src.summary,
                  excerpt: src.excerpt || src.content?.substring(0, 200),
                  similarity: src.similarity || src.score,
                }));
                console.log('📚 Sources received:', sources.length);
                updateStreamingMeta();
              } else if (data.type === 'done') {
                reasoning = data.reasoning || [];
                // Sources might also come in the done event
                if (data.sources) {
                  sources = data.sources.map((src: any) => ({
                    id: src.id,
                    url: src.url || src.link || '#',
                    title: src.title || src.name || 'Source',
                    description: src.description || src.excerpt || src.summary,
                    excerpt: src.excerpt || src.content?.substring(0, 200),
                    similarity: src.similarity || src.score,
                  }));
                }
                console.log('✅ Execution completed');
                updateStreamingMeta();
              } else if (data.type === 'error') {
                // Handle structured error events from backend
                const errorCode = data.code || 'UNKNOWN_ERROR';
                const errorMessage = data.message || data.content || `Unknown error from ${mode}`;
                console.error(`[${mode}] Error (${errorCode}):`, errorMessage);
                console.error(`[${mode}] Full error data:`, JSON.stringify(data, null, 2));
                if (data.stack) {
                  console.error(`[${mode}] Error stack:`, data.stack);
                }
                
                // Map error codes to user-friendly messages
                let userFriendlyMessage = errorMessage;
                if (errorCode === 'TIMEOUT_ERROR') {
                  userFriendlyMessage = 'The request took too long to complete. Please try again with a shorter message.';
                } else if (errorCode === 'AGENT_NOT_FOUND') {
                  userFriendlyMessage = 'The selected expert agent could not be found. Please select a different agent.';
                } else if (errorCode === 'LLM_TIMEOUT' || errorCode === 'LLM_RATE_LIMIT') {
                  userFriendlyMessage = 'The AI service is temporarily unavailable. Please try again in a moment.';
                } else if (errorCode === 'RAG_TIMEOUT' || errorCode === 'RAG_SERVICE_UNAVAILABLE') {
                  userFriendlyMessage = 'The knowledge base search is temporarily unavailable. The response may be less detailed.';
                } else if (errorCode === 'RAG_NO_RESULTS') {
                  userFriendlyMessage = 'We could not find supporting evidence in the knowledge base. Please broaden your query, select additional knowledge domains, enable evidence tools, or explicitly permit answers without evidence.';
                } else if (errorCode === 'NETWORK_ERROR') {
                  userFriendlyMessage = 'Network connection issue. Please check your internet connection and try again.';
                } else if (errorCode === 'DATABASE_CONNECTION_ERROR') {
                  userFriendlyMessage = 'Database service is temporarily unavailable. Please try again in a moment.';
                } else if (errorMessage.includes('Failed to connect to API Gateway') || errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')) {
                  userFriendlyMessage = 'Unable to connect to the AI service. Please ensure the API Gateway server is running on port 3001 and try again.';
                }

                // Update streaming message with error
                if (fullResponse.trim() === '') {
                  fullResponse = userFriendlyMessage;
                  setStreamingMessage(fullResponse);
                }
                
                setStreamingReasoning(prev => {
                  const errorText = `❌ ${userFriendlyMessage}`;
                  return prev ? `${prev}\n\n${errorText}` : errorText;
                });
                setIsStreamingReasoning(true);
                
                // Don't throw - let the stream complete to show the error message
                // The error will be shown in the final message
              }
              // Handle generic reasoning events
              else if (data.type === 'reasoning' || data.reasoning) {
                // Generic reasoning data
                const reasoningText = data.content || data.reasoning || '';
                if (reasoningText) {
                  setStreamingReasoning(prev => {
                    return prev && prev !== 'Thinking...' && prev !== 'Processing your request...'
                      ? `${prev}\n\n${reasoningText}`
                      : reasoningText;
                  });
                  setIsStreamingReasoning(true);
                  // Also accumulate into reasoning array
                  if (typeof reasoningText === 'string') {
                    reasoning.push(reasoningText);
                  } else if (Array.isArray(reasoningText)) {
                    reasoning = [...reasoning, ...reasoningText];
                  }
                  updateStreamingMeta();
                }
              }
              // Fallback: Support old format for backward compatibility
              else if (data.token) {
                fullResponse += data.token;
                setStreamingMessage(fullResponse);
                // Show reasoning during token streaming
                if (!isStreamingReasoning || streamingReasoning === 'Thinking...' || streamingReasoning === 'Processing your request...') {
                  setStreamingReasoning('Generating response...');
                  setIsStreamingReasoning(true);
                }
              } else if (data.done && !data.type) {
                reasoning = data.reasoning || [];
                // If reasoning was provided, show it
                if (reasoning && reasoning.length > 0) {
                  setStreamingReasoning(reasoning.join('\n\n'));
                  setIsStreamingReasoning(true);
                }
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) {
                // Ignore JSON parse errors
              } else {
                throw e; // Re-throw other errors
              }
            }
          }
        }
      }

      const assistantMessageId = (Date.now() + 1).toString();
      const messageBranches =
        branches && branches.length > 0
          ? branches
          : [
              {
                id: `${assistantMessageId}-branch-0`,
                content: fullResponse,
                confidence: typeof confidence === 'number' ? confidence : 0,
                citations: Array.isArray(finalMeta?.citations) ? finalMeta.citations : [],
                sources: sources.map((src, idx) => ({ ...src, id: src.id || `fallback-source-${idx + 1}` })),
                createdAt: new Date(),
                reasoning: reasoning.length > 0 ? reasoning.join('\n') : undefined,
              },
            ];
      const activeBranchIndex = Math.min(currentBranch, messageBranches.length - 1);
      const activeBranch = messageBranches[activeBranchIndex];

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: activeBranch?.content ?? fullResponse,
        timestamp: Date.now(),
        reasoning,
        sources: activeBranch?.sources && activeBranch.sources.length > 0 ? activeBranch.sources : sources,
        selectedAgent,
        selectionReason,
        confidence,
        branches: messageBranches,
        currentBranch: activeBranchIndex,
        // Add autonomous metadata for Mode 3 & Mode 4
        ...(Object.keys(autonomousMetadata).length > 0 && { autonomousMetadata }),
        metadata: {
          ragSummary,
          toolSummary,
          sources: activeBranch?.sources && activeBranch.sources.length > 0 ? activeBranch.sources : sources,
          reasoning,
          confidence,
          citations: Array.isArray(finalMeta?.citations) ? finalMeta.citations : undefined,
        },
      };

      const resolvedAgentId = selectedAgent?.id || agentId || undefined;

      if (
        user?.id &&
        resolvedAgentId &&
        assistantMessage.content &&
        assistantMessage.content.trim().length > 0
      ) {
        void fetch('/api/memory/long-term', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            agentId: resolvedAgentId,
            userMessage: messageContent,
            assistantMessage: assistantMessage.content,
          }),
        }).catch((error) => {
          console.error('[LongTermMemory] Failed to persist memory', error);
        });
      }

      // Debug: Log message creation for Mode 3
      console.group('📝 [Mode 3 Debug] Creating Assistant Message');
      console.log('Mode:', mode);
      console.log('Content length:', fullResponse.length);
      console.log('Content preview:', fullResponse.substring(0, 100));
      console.log('Selected agent:', selectedAgent);
      console.log('Sources count:', sources.length);
      console.log('Reasoning steps:', reasoning.length);
      console.log('Autonomous metadata keys:', Object.keys(autonomousMetadata));
      console.log('Confidence:', confidence);
      console.log('Message ID:', assistantMessage.id);
      console.log('Full message object:', assistantMessage);
      console.groupEnd();

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        console.log('📊 [Mode 3 Debug] Messages array updated. Total messages:', updated.length);
        console.log('📊 [Mode 3 Debug] Last message role:', updated[updated.length - 1].role);
        console.log('📊 [Mode 3 Debug] Last message agent:', updated[updated.length - 1].selectedAgent);
        return updated;
      });
      const branchReasoning = activeBranch?.reasoning;
      const normalizedRecentReasoning = branchReasoning
        ? Array.isArray(branchReasoning)
          ? branchReasoning
          : [branchReasoning]
        : reasoning;
      setRecentReasoning(normalizedRecentReasoning);
      setRecentReasoningTimestamp(Date.now());
      setStreamingMessage('');
      setStreamingReasoning('');
      setIsStreamingReasoning(false);
      setStreamingMeta(null);

      if (activeConversationId) {
        setConversations(prev =>
          prev.map(conv =>
                  conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: skipUserMessageAppend
                    ? [...conv.messages, assistantMessage]
                    : [...conv.messages, userMessage, assistantMessage],
                  title: conv.messages.length === 0 ? messageContent.substring(0, 50) : conv.title,
                  updatedAt: Date.now(),
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('[AskExpert] Error:', error);
      
      // Handle fetch failures specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[AskExpert] Fetch failed - network or server error:', error.message);
        const networkErrorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Network error: Unable to connect to the server. Please check your internet connection and try again.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, networkErrorMessage]);
      } else if (error instanceof Error) {
        console.error('[AskExpert] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        console.error('[AskExpert] Unknown error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an unknown error. Please try again.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
      setStreamingMessage('');
      setStreamingReasoning('');
      setIsStreamingReasoning(false);
      setStreamingMeta(null);
    } finally {
      setIsLoading(false);
      setStreamingMeta(null);
    }
  };

  const handleRegenerate = async (assistantMessageId: string) => {
    const assistantIndex = messages.findIndex((msg) => msg.id === assistantMessageId);
    if (assistantIndex === -1) {
      return;
    }

    let previousUserMessage: Message | null = null;
    for (let idx = assistantIndex - 1; idx >= 0; idx--) {
      if (messages[idx].role === 'user') {
        previousUserMessage = messages[idx];
        break;
      }
    }

    if (!previousUserMessage) {
      console.warn('[AskExpert] Regenerate requested but no preceding user message found.');
      return;
    }

    const conversationWithoutAssistant = messages.filter((msg) => msg.id !== assistantMessageId);
    setMessages(conversationWithoutAssistant);
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: conv.messages.filter((msg) => msg.id !== assistantMessageId),
              }
            : conv
        )
      );
    }

    try {
      await handleSend({
        promptText: previousUserMessage.content,
        existingUserMessage: previousUserMessage,
        skipUserMessageAppend: true,
        conversationOverride: conversationWithoutAssistant,
      });
    } catch (error) {
      console.error('[AskExpert] Regenerate failed:', error);
    }
  };

  // New conversation
  const handleNewConversation = useCallback(
    (options?: { id?: string; title?: string }) => {
      const conversationId = options?.id ?? Date.now().toString();
      const newConv: Conversation = {
        id: conversationId,
        title: options?.title || 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(conversationId);
      setMessages([]);
    },
    []
  );

  // Conversation management handlers
  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter(c => c.id !== id);
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
          setMessages(remaining[0].messages);
        } else {
          handleNewConversation();
        }
      }
    },
    [activeConversationId, conversations, handleNewConversation]
  );

  const handleRenameConversation = useCallback((id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  }, []);

  const handleConversationSelect = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      const conv = conversations.find(c => c.id === id);
      setMessages(conv ? conv.messages : []);
    },
    [conversations]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInputValue(suggestion);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(suggestion.length, suggestion.length);
      });
    },
    []
  );

  // Copy message
  const handleCopy = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewConversation]);

  useEffect(() => {
    const handleNewChatEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string; title?: string }>).detail;
      handleNewConversation({
        id: detail?.sessionId,
        title: detail?.title,
      });
    };

    const handleOpenChatEvent = async (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string; title?: string }>).detail;
      if (detail?.sessionId) {
        const exists = conversations.some((conv) => conv.id === detail.sessionId);
        if (!exists) {
          // Fetch conversation data from database
          try {
            const response = await fetch(`/api/ask-expert?conversationId=${encodeURIComponent(detail.sessionId)}`);
            if (response.ok) {
              const data = await response.json();
              if (data.conversation) {
                // Extract messages from context
                const contextMessages = data.conversation.context?.messages || [];
                const loadedMessages: Message[] = contextMessages.map((msg: { role: string; content: string }, idx: number) => ({
                  id: `${detail.sessionId}-msg-${idx}`,
                  role: msg.role === 'user' ? 'user' : 'assistant',
                  content: msg.content,
                  timestamp: Date.now(),
                }));

                // Add to local conversations state with loaded messages
                const newConv: Conversation = {
                  id: detail.sessionId,
                  title: data.conversation.title || detail.title || 'Conversation',
                  messages: loadedMessages,
                  createdAt: new Date(data.conversation.created_at).getTime(),
                  updatedAt: new Date(data.conversation.updated_at || data.conversation.created_at).getTime(),
                  isPinned: false,
                };
                setConversations(prev => [newConv, ...prev.filter(c => c.id !== detail.sessionId)]);
                setActiveConversationId(detail.sessionId);
                setMessages(loadedMessages);
                return;
              }
            }
          } catch (error) {
            console.error('Failed to load conversation:', error);
          }
          // Fallback: create new empty conversation
          handleNewConversation({ id: detail.sessionId, title: detail.title || 'Conversation' });
        } else {
          handleConversationSelect(detail.sessionId);
        }
      }
    };

    window.addEventListener('ask-expert:new-chat', handleNewChatEvent);
    window.addEventListener('ask-expert:open-chat', handleOpenChatEvent);

    return () => {
      window.removeEventListener('ask-expert:new-chat', handleNewChatEvent);
      window.removeEventListener('ask-expert:open-chat', handleOpenChatEvent);
    };
  }, [conversations, handleConversationSelect, handleNewConversation]);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-950">
      {/* Top Bar - Clean like Claude */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3 flex-wrap">
          <Brain className="w-5 h-5 text-blue-500" />
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Ask the Experts
          </h1>
          {/* Current Mode Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentMode.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
            currentMode.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            currentMode.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            Mode {currentMode.id}: {currentMode.name}
          </div>
          {primarySelectedAgent && (
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm dark:bg-purple-900/30 dark:text-purple-200">
              <AgentAvatar
                avatar={primarySelectedAgent.avatar}
                name={primarySelectedAgent.displayName}
                size="list"
                className="rounded-full"
              />
              <span>{primarySelectedAgent.displayName}</span>
            </div>
          )}
        </div>

          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Settings2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </header>

        {/* Settings Panel (slides down when opened) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Workflow Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workflow (Optional)
                  </label>
                  <WorkflowSelector
                    selectedWorkflowId={selectedWorkflowId}
                    onWorkflowChange={(workflowId) => {
                      setSelectedWorkflowId(workflowId);
                      if (workflowId) {
                        // Fetch workflow details
                        fetch(`/api/workflows/${workflowId}`)
                          .then(res => res.json())
                          .then(data => {
                            if (data.workflow) {
                              setSelectedWorkflow(data.workflow);
                            }
                          })
                          .catch(err => console.error('Error fetching workflow:', err));
                      } else {
                        setSelectedWorkflow(null);
                      }
                    }}
                  />
                </div>

                {/* Model Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <optgroup label="OpenAI">
                      <option value="gpt-4">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </optgroup>
                    <optgroup label="Medical AI">
                      <option value="llama-medical">Llama 3.2 Medical (3B)</option>
                      <option value="llama-clinical">Llama 3.2 Clinical (1B)</option>
                      <option value="biogpt">BioGPT Research</option>
                    </optgroup>
                  </select>
                </div>

                {/* Test Interface - Quick Mode Testing */}
                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Quick Test
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Test all 4 modes with sample queries to verify deep agents (5-level hierarchy) and hybrid search (Neo4j + Pinecone + Supabase)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAutomatic(false);
                        setIsAutonomous(false);
                        setInputValue("What are the FDA requirements for IND submission?");
                        setEnableRAG(true);
                      }}
                      className="text-xs h-8"
                    >
                      Test Mode 1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAutomatic(true);
                        setIsAutonomous(false);
                        setInputValue("Explain the clinical trial design process");
                        setEnableRAG(true);
                      }}
                      className="text-xs h-8"
                    >
                      Test Mode 2
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAutomatic(true);
                        setIsAutonomous(true);
                        setInputValue("Analyze the regulatory pathway for a new drug");
                        setEnableRAG(true);
                      }}
                      className="text-xs h-8"
                    >
                      Test Mode 3
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAutomatic(false);
                        setIsAutonomous(true);
                        setInputValue("Deep analysis of market access strategy");
                        setEnableRAG(true);
                      }}
                      className="text-xs h-8"
                    >
                      Test Mode 4
                    </Button>
                  </div>
                </div>

                {/* Mode Selector Grid - Large Quadrant Style */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Mode 1 */}
                    <button
                      onClick={() => {
                        setIsAutomatic(false);
                        setIsAutonomous(false);
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        currentMode.id === 1
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Mode 1: Manual Interactive
                        </span>
                        {currentMode.id === 1 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        You select agent + interactive chat
                      </p>
                    </button>

                    {/* Mode 2 */}
                    <button
                      onClick={() => {
                        setIsAutomatic(true);
                        setIsAutonomous(false);
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        currentMode.id === 2
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Mode 2: Automatic Selection
                        </span>
                        {currentMode.id === 2 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        AI selects best agent for you
                      </p>
                    </button>

                    {/* Mode 3 */}
                    <button
                      onClick={() => {
                        setIsAutomatic(true);
                        setIsAutonomous(true);
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        currentMode.id === 3
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Mode 3: Autonomous Automatic
                        </span>
                        {currentMode.id === 3 && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        AI selects agent + autonomous reasoning
                      </p>
                    </button>

                    {/* Mode 4 */}
                    <button
                      onClick={() => {
                        setIsAutomatic(false);
                        setIsAutonomous(true);
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        currentMode.id === 4
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Mode 4: Autonomous Manual
                        </span>
                        {currentMode.id === 4 && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        You select agent + autonomous reasoning
                      </p>
                    </button>
                  </div>
                </div>

                {/* Current Mode Display */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Active Mode
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        Mode {currentMode.id}: {currentMode.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {currentMode.description}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentMode.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                      currentMode.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      currentMode.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {currentMode.id}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <Conversation className="flex-1">
          <ConversationContent className="max-w-3xl mx-auto px-4 py-6">
            {/* GOLD STANDARD: Advanced Streaming Window */}
            {isLoading && (workflowSteps.length > 0 || reasoningSteps.length > 0) && (
              <div className="mb-6">
                <AdvancedStreamingWindow
                  workflowSteps={workflowSteps}
                  reasoningSteps={reasoningSteps}
                  metrics={streamingMetrics}
                  isStreaming={isLoading}
                  canPause={true}
                  onPause={handlePauseStreaming}
                  onResume={handleResumeStreaming}
                />
              </div>
            )}

            {/* Selected Agents Display (for multiple selections) */}
            {selectedAgents.length > 1 && (
              <div className="mb-6">
                <SelectedAgentsList
                  compact
                  agents={agents.filter((agent) => selectedAgents.includes(agent.id))}
                  selectedAgentIds={selectedAgents}
                  onAgentClick={(agentId) => {
                    setSelectedAgents(
                      selectedAgents.includes(agentId)
                        ? selectedAgents.filter((id) => id !== agentId)
                        : [...selectedAgents, agentId]
                    );
                  }}
                  onAgentRemove={(agentId) => {
                    setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
                  }}
                />
              </div>
            )}

            {primaryAgentId && (
              <div className="mb-6 space-y-4">
                {(isLoadingPrimaryMemory || (primaryAgentMemory?.facts?.length ?? 0) > 0) && (
                  <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 dark:border-blue-800/50 dark:bg-blue-900/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          Memory Insights
                        </span>
                      </div>
                      {isLoadingPrimaryMemory && (
                        <span className="text-xs text-blue-600 dark:text-blue-200 animate-pulse">
                          Updating…
                        </span>
                      )}
                    </div>
                    {isLoadingPrimaryMemory ? (
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-10 bg-white/60 dark:bg-blue-900/40 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      primaryAgentMemory?.facts &&
                      primaryAgentMemory.facts.length > 0 && (
                        <ul className="space-y-2">
                          {primaryAgentMemory.facts.slice(0, 3).map((fact) => (
                            <li
                              key={fact.id}
                              className="rounded-lg bg-white dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 p-2 text-xs text-blue-900 dark:text-blue-100"
                            >
                              <p className="font-medium text-blue-800 dark:text-blue-100">{fact.fact}</p>
                              <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-blue-600 dark:text-blue-300">
                                <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                                  {fact.category}
                                </span>
                                <span>Confidence {(fact.confidence * 100).toFixed(0)}%</span>
                                <span>{new Date(fact.createdAt).toLocaleDateString()}</span>
                              </div>
                            </li>
                          ))}
                          {primaryAgentMemory.facts.length > 3 && (
                            <li className="text-[11px] text-blue-600 dark:text-blue-300">
                              +{primaryAgentMemory.facts.length - 3} more memorized facts
                            </li>
                          )}
                        </ul>
                      )
                    )}
                  </div>
                )}

                {primaryAgentStats?.recentFeedback && primaryAgentStats.recentFeedback.length > 0 && (
                  <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-900/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Recent User Feedback
                      </span>
                    </div>
                    <div className="space-y-2">
                      {primaryAgentStats.recentFeedback.slice(0, 3).map((feedback) => (
                        <div
                          key={feedback.id}
                          className="rounded-lg bg-white dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-2 text-xs text-amber-900 dark:text-amber-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">Rating {feedback.rating.toFixed(1)}/5</span>
                            <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            {feedback.comment ? `“${feedback.comment}”` : 'No comment provided'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Sparkles className="w-12 h-12 text-blue-500 mb-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-8">
                  Ask anything and get expert answers powered by advanced AI
                </p>

                {/* Show agent selection prompt for Mode 1 and Mode 4 */}
                {selectedAgents.length === 0 && (currentMode.id === 1 || currentMode.id === 4) && (
                  <div className="w-full max-w-md mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Select an Expert
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Choose an expert from the sidebar to get started with {currentMode.name}.
                    </p>
                  </div>
                )}

                {/* Prompt Starters - Show when agents are selected */}
                {selectedAgents.length > 0 && (
                  <div className="w-full max-w-4xl mt-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-left">
                      Suggested prompts for your selected expert{selectedAgents.length > 1 ? 's' : ''}:
                    </h3>
                    <PromptStarters
                      prompts={promptStarters}
                      onSelectPrompt={(promptText) => setInputValue(promptText)}
                      isLoading={loadingPromptStarters}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {recentReasoning.length > 0 && (
                  <div className="mb-4">
                    <Reasoning defaultOpen={false}>
                      <ReasoningTrigger
                        title={`Latest AI Reasoning${formatReasoningTimestamp(recentReasoningTimestamp) ? ` • ${formatReasoningTimestamp(recentReasoningTimestamp)}` : ''}`}
                      />
                      <ReasoningContent>
                        <div className="space-y-2 text-xs text-muted-foreground">
                      {recentReasoning.map((step, idx) => (
                        <div
                          key={`${idx}-${step.slice(0, 20)}`}
                          className="flex items-start gap-2 rounded-lg bg-muted/30 p-2"
                        >
                          <Sparkles className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                          <span className="whitespace-pre-wrap">{step}</span>
                        </div>
                      ))}
                        </div>
                      </ReasoningContent>
                    </Reasoning>
                  </div>
                )}

                {messages.map((msg, index) => {
                  const agentInfo =
                    msg.role === 'assistant' && msg.selectedAgent
                      ? agents.find((a) => a.id === msg.selectedAgent?.id)
                      : null;
                  const avatarValue =
                    msg.role === 'assistant'
                      ? agentInfo?.avatar
                      : undefined;

                  const previousUserMessage =
                    index > 0 && messages[index - 1].role === 'user'
                      ? messages[index - 1]
                      : undefined;

                  const allowRegenerate =
                    msg.role === 'assistant' && index === messages.length - 1;

                  return (
                    <EnhancedMessageDisplay
                      key={msg.id}
                      id={msg.id}
                      role={msg.role}
                      content={msg.content}
                      timestamp={new Date(msg.timestamp)}
                      metadata={msg.metadata}
                      agentName={agentInfo?.displayName || (agentInfo as any)?.display_name || agentInfo?.name}
                      agentAvatar={avatarValue}
                      branches={msg.branches}
                      currentBranch={msg.currentBranch ?? 0}
                      onBranchChange={
                        msg.branches && msg.branches.length > 1
                          ? (branchIndex) => handleBranchChange(msg.id, branchIndex)
                          : undefined
                      }
                      onCopy={() => handleCopy(msg.content, msg.id)}
                      onFeedback={
                        msg.role === 'assistant'
                          ? (type) => submitFeedbackForMessage(msg, type, previousUserMessage)
                          : undefined
                      }
                      onRegenerate={
                        allowRegenerate
                          ? () => handleRegenerate(msg.id)
                          : undefined
                      }
                      allowRegenerate={allowRegenerate}
                    />
                  );
                })}


                {/* Show reasoning and streaming response as soon as loading starts */}
                {(isLoading || streamingMessage || isStreamingReasoning) && (
                  <EnhancedMessageDisplay
                    id="streaming-assistant"
                    role="assistant"
                    content={streamingMessage || ''}
                    timestamp={new Date()}
                    isStreaming
                    metadata={streamingMeta || (streamingReasoning ? { reasoning: [streamingReasoning] } : undefined)}
                    agentName={(() => {
                      const agent = selectedAgents.length > 0
                        ? agents.find((a) => selectedAgents.includes(a.id))
                        : null;
                      if (!agent) {
                        return 'Expert';
                      }
                      return (agent as any).displayName || (agent as any).display_name || agent.name || 'Expert';
                    })()}
                    agentAvatar={(() => {
                      const agent = selectedAgents.length > 0
                        ? agents.find((a) => selectedAgents.includes(a.id))
                        : null;
                      return agent?.avatar || 'avatar_0001';
                    })()}
                  />
                )}
                      
              </>
            )}
            {messages.length > 0 && (
              <div className="mt-8 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArtifactGenerator((prev) => !prev)}
                  className="inline-flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  {showArtifactGenerator ? 'Hide Document Generator' : 'Generate Document'}
                </Button>

                {showArtifactGenerator && (
                  <InlineArtifactGenerator
                    conversationContext={artifactConversationContext}
                    onGenerate={handleArtifactGenerate}
                    onClose={() => setShowArtifactGenerator(false)}
                    className="mt-2"
                  />
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ConversationContent>
        </Conversation>

        {shouldShowSuggestions && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2">
            <Suggestions layout="wrap">
              {followUpSuggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={handleSuggestionClick}
                />
              ))}
            </Suggestions>
          </div>
        )}

        {/* Enhanced Prompt Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sticky bottom-0">
          <PromptInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSend}
            isLoading={isLoading}
            placeholder="How can I help you today?"
            textareaRef={inputRef}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isAutomatic={isAutomatic}
            onAutomaticChange={setIsAutomatic}
            isAutonomous={isAutonomous}
            onAutonomousChange={setIsAutonomous}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            tokenCount={tokenCount}
            enableRAG={enableRAG}
            onEnableRAGChange={setEnableRAG}
            enableTools={enableTools}
            onEnableToolsChange={handleEnableToolsChange}
            availableTools={availableTools}
            selectedTools={selectedTools}
            onSelectedToolsChange={setSelectedTools}
            availableRagDomains={availableRagDomains}
            selectedRagDomains={selectedRagDomains}
            onSelectedRagDomainsChange={setSelectedRagDomains}
          />
        </div>
    </div>
  );
}

// Default export - no provider needed (provided by layout sidebar)
export default function AskExpertPage() {
  return (
    <ChatHistoryProvider>
      <AskExpertPageContent />
    </ChatHistoryProvider>
  );
}

function generateFollowUpSuggestions(
  message: Message | undefined,
  streamingMessage: string | undefined,
  modeName: string
): string[] {
  const suggestions = new Set<string>();

  if (streamingMessage && streamingMessage.trim().length > 0) {
    suggestions.add('What other details should we explore about this?');
  }

  if (!message || !message.content) {
    suggestions.add(`What should I do next in ${modeName.toLowerCase()} mode?`);
    suggestions.add('Suggest actionable next steps.');
    suggestions.add('Flag potential risks I should know about.');
    return Array.from(suggestions).slice(0, 4);
  }

  const content = message.content.replace(/\s+/g, ' ').trim();
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 40)
    .slice(0, 3);

  sentences.forEach((sentence) => {
    const topic = extractTopic(sentence);
    if (topic) {
      suggestions.add(`Can you expand on ${topic}?`);
    }
  });

  const bulletTopics = message.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*•]/.test(line))
    .slice(0, 2);

  bulletTopics.forEach((line) => {
    const cleaned = line.replace(/^[-*•]\s*/, '');
    const topic = extractTopic(cleaned);
    if (topic) {
      suggestions.add(`What are the implications of ${topic}?`);
    }
  });

  if (message.metadata?.ragSummary?.warning) {
    suggestions.add('How can we resolve the evidence gaps you mentioned?');
  }

  const domains = message.metadata?.ragSummary?.domains;
  if (domains && domains.length > 0) {
    suggestions.add(`Share more insights on ${domains[0]}.`);
  }

  const usedTools = message.metadata?.toolSummary?.used;
  if (usedTools && usedTools.length > 0) {
    suggestions.add(`What did the ${usedTools[0]} tool uncover?`);
  }

  suggestions.add('What concrete steps should we prioritize next?');
  suggestions.add('Are there risks or blockers we should anticipate?');

  return Array.from(suggestions).slice(0, 4);
}

function extractTopic(sentence: string): string | null {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return null;
  }

  const separators = [trimmed.indexOf(':'), trimmed.indexOf('—'), trimmed.indexOf('- ')].filter(
    (index) => index > 0
  );
  const cutoff = separators.length ? Math.min(...separators) : Math.min(trimmed.length, 80);
  let candidate = trimmed.slice(0, cutoff).replace(/^[^A-Za-z0-9]+/, '').trim();
  if (!candidate) {
    return null;
  }

  if (candidate.length > 60) {
    candidate = `${candidate.slice(0, 57)}...`;
  }

  return candidate;
}
