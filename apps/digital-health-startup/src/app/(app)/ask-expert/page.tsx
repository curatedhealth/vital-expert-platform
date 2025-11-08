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
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
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
  HelpCircle,
  Target,
  UserCheck,
  MessageCircle,
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
import { PageHeaderCompact } from '@/components/page-header';
import {
  Conversation,
  ConversationContent,
} from '@/components/ui/shadcn-io/ai/conversation';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
// [OK] NEW: Tool Orchestration Components
import { ToolConfirmation, useToolConfirmation, type ToolSuggestion } from '@/features/ask-expert/components/ToolConfirmation';
import { ToolExecutionStatusComponent, useToolExecutionStatus, type ExecutingTool, type ToolExecutionStatus } from '@/features/ask-expert/components/ToolExecutionStatus';
import { ToolResults, type ToolResult } from '@/features/ask-expert/components/ToolResults';
// [OK] NEW: Connection Status Component
import { ConnectionStatusComponent, useConnectionStatus, type ConnectionStatus } from '@/features/ask-expert/components/ConnectionStatus';

// ============================================================================
// TYPES
// ============================================================================

interface Source {
  id?: string;
  number?: number;
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
  quote?: string;
  sourceType?: string;
  metadata?: Record<string, any>;
}

interface CitationMeta {
  number: number | string;
  id?: string;
  title?: string;
  url?: string;
  description?: string;
  quote?: string;
  excerpt?: string;
  sources?: Source[];
  sourceId?: string;
  [key: string]: any;
}

const normalizeSourceRecord = (source: any, idx: number): Source => {
  const metadata = source?.metadata ?? {};
  const parsedNumber =
    typeof source?.number === 'string'
      ? parseInt(source.number, 10)
      : source?.number;

  return {
    number: Number.isFinite(parsedNumber) ? parsedNumber : idx + 1,
    id: source?.id || metadata.id || 'source-' + (idx + 1),
    url: source?.url || source?.link || metadata.url || '#',
    title: source?.title || metadata.title || 'Source ' + (idx + 1),
    description: source?.description || source?.summary || metadata.description,
    excerpt: source?.excerpt || metadata.excerpt || source?.quote,
    similarity:
      typeof source?.similarity === 'number'
        ? source.similarity
        : metadata.similarity,
    domain: source?.domain || metadata.domain,
    evidenceLevel: source?.evidenceLevel || metadata.evidenceLevel,
    organization: source?.organization || metadata.organization,
    reliabilityScore:
      typeof source?.reliabilityScore === 'number'
        ? source.reliabilityScore
        : metadata.reliabilityScore,
    lastUpdated: source?.lastUpdated || metadata.lastUpdated,
    quote: source?.quote,
    sourceType: source?.sourceType || metadata.sourceType,
    metadata,
  };
};

const normalizeSourcesFromCitations = (
  citations: any[] | undefined | null
): Source[] => {
  if (!Array.isArray(citations) || citations.length === 0) {
    return [];
  }

  return citations.map((citation, idx) =>
    normalizeSourceRecord(
      {
        ...citation,
        description: citation?.description || citation?.summary,
        excerpt: citation?.excerpt || citation?.quote,
      },
      idx
    )
  );
};

const unwrapLangGraphUpdateState = (
  payload: unknown
): { node?: string; state: Record<string, any> } => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { state: {} };
  }

  const visited = new Set<unknown>();

  const unwrap = (
    value: unknown,
    depth: number
  ): { node?: string; state: Record<string, any> } => {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      visited.has(value) ||
      depth > 5
    ) {
      return { state: {} };
    }

    visited.add(value);
    const recordValue = value as Record<string, any>;

    if (recordValue.state && typeof recordValue.state === 'object') {
      const nodeName = typeof recordValue.node === 'string' ? recordValue.node : undefined;
      const innerState = recordValue.state as Record<string, any>;
      if (innerState.values && typeof innerState.values === 'object') {
        return { node: nodeName, state: innerState.values as Record<string, any> };
      }
      return { node: nodeName, state: innerState };
    }

    if (recordValue.values && typeof recordValue.values === 'object') {
      return { state: recordValue.values as Record<string, any> };
    }

    const keys = Object.keys(recordValue);
    if (keys.length === 1) {
      const [onlyKey] = keys;
      const child = recordValue[onlyKey];
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        const nested = unwrap(child, depth + 1);
        if (!nested.node && typeof onlyKey === 'string') {
          nested.node = onlyKey;
        }
        return nested;
      }
    }

    return { state: recordValue };
  };

  return unwrap(payload, 0);
};

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
    citations?: CitationMeta[];
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
    workflowSteps?: any[];
    reasoningSteps?: any[];
    streamingMetrics?: any;
    modelReasoningParts?: Array<{
      id?: string;
      text: string;
      type?: string;
      confidence?: number;
    }>;
    confidence?: number;
    citations?: CitationMeta[];
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
// HELPER FUNCTIONS (moved before components to avoid Next.js export issues)
// ============================================================================

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AskExpertPageContent() {
  // Get agents and selection from context (loaded by layout sidebar)
  const { selectedAgents, agents, setSelectedAgents, addAgentToUserList, refreshAgents, getAllAgents } = useAskExpert();
  const { user } = useAuth();
  
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
  const [darkMode, setDarkMode] = useState(false);
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
  const [enableRAG, setEnableRAG] = useState(true); // Enable RAG by default
  const [enableTools, setEnableTools] = useState(true); // Tools enabled by default
  const [hasManualToolsToggle, setHasManualToolsToggle] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [showArtifactGenerator, setShowArtifactGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMode1Helper, setShowMode1Helper] = useState(false);
  const [showMode2Helper, setShowMode2Helper] = useState(false);
  const [showMode3Helper, setShowMode3Helper] = useState(false);
  const [showMode4Helper, setShowMode4Helper] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedRagDomains, setSelectedRagDomains] = useState<string[]>([]);
  const [useLangGraph, setUseLangGraph] = useState(true); // [OK] LangGraph enabled by default for quality AI responses, reasoning visibility, memory, and better tools
  const [streamingMeta, setStreamingMeta] = useState<{
    ragSummary?: NonNullable<Message['metadata']>['ragSummary'];
    toolSummary?: NonNullable<Message['metadata']>['toolSummary'];
    sources?: Source[];
    citations?: CitationMeta[];
    finalResponse?: string;
    reasoning: string[];
    // [OK] LangGraph streaming fields (workflowSteps removed - not valuable)
    reasoningSteps?: any[];
    streamingMetrics?: any;
  } | null>(null);

  // [OK] LangGraph Streaming State (workflowSteps removed)
  const [reasoningSteps, setReasoningSteps] = useState<any[]>([]);
  const [streamingMetrics, setStreamingMetrics] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // [OK] NEW: Tool Orchestration State
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [pendingToolConfirmation, setPendingToolConfirmation] = useState<{
    tools: ToolSuggestion[];
    message?: string;
    reasoning?: string;
  } | null>(null);
  const toolConfirmation = useToolConfirmation();
  const toolExecutionStatus = useToolExecutionStatus();

  // [OK] NEW: Connection Status
  const connectionStatus = useConnectionStatus();

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

  // [WARN] FIXED: Fetch tools from database (agent_tools table) instead of agents.tools JSON column
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  useEffect(() => {
    const fetchAgentTools = async () => {
      if (!selectedAgents.length) {
        setAvailableTools([]);
        return;
      }

      setLoadingTools(true);
      try {
        const { createClient } = await import('@vital/sdk/client');
        const supabase = createClient();

        const toolSet = new Set<string>();

        // Fetch tools from agent_tools table for each selected agent
        for (const agentId of selectedAgents) {
          try {
            // Fetch tool assignments from agent_tools table
            const { data: agentToolsData, error: agentToolsError } = await supabase
              .from('agent_tools')
              .select('tool_id')
              .eq('agent_id', agentId);

            if (agentToolsError) {
              console.warn(`[WARN] [Tool Selector] Error loading tools for agent ${agentId}:`, agentToolsError);
              // Fallback to agents.tools JSON column for backward compatibility
              const agent = agents.find((a) => a.id === agentId);
              if (agent?.tools && Array.isArray(agent.tools)) {
                agent.tools.forEach((tool) => {
                  if (typeof tool === 'string' && tool.trim().length > 0) {
                    toolSet.add(tool.trim());
                  }
                });
              }
              continue;
            }

            const toolIds = (agentToolsData || []).map(at => at.tool_id);

            if (toolIds.length === 0) {
              // Fallback to agents.tools JSON column
              const agent = agents.find((a) => a.id === agentId);
              if (agent?.tools && Array.isArray(agent.tools)) {
                agent.tools.forEach((tool) => {
                  if (typeof tool === 'string' && tool.trim().length > 0) {
                    toolSet.add(tool.trim());
                  }
                });
              }
              continue;
            }

            // Fetch tool details from dh_tool table
            const { data: toolsData, error: toolsError } = await supabase
              .from('dh_tool')
              .select('id, name')
              .in('id', toolIds)
              .eq('is_active', true); // Only active tools

            if (toolsError) {
              console.warn(`[WARN] [Tool Selector] Error fetching tool details:`, toolsError);
              continue;
            }

            // Add tool names to set
            (toolsData || []).forEach((tool) => {
              if (tool.name && typeof tool.name === 'string' && tool.name.trim().length > 0) {
                toolSet.add(tool.name.trim());
              }
            });
          } catch (error) {
            console.error(`[ERROR] [Tool Selector] Error processing agent ${agentId}:`, error);
            // Fallback to agents.tools JSON column
            const agent = agents.find((a) => a.id === agentId);
            if (agent?.tools && Array.isArray(agent.tools)) {
              agent.tools.forEach((tool) => {
                if (typeof tool === 'string' && tool.trim().length > 0) {
                  toolSet.add(tool.trim());
                }
              });
            }
          }
        }

        const sortedTools = Array.from(toolSet).sort((a, b) => a.localeCompare(b));
        console.log("[Tool Selector] Loaded " + sortedTools.length + " tools from database for " + selectedAgents.length + " agent(s):", sortedTools);
        setAvailableTools(sortedTools);
      } catch (error) {
        console.error('[ERROR] [Tool Selector] Error fetching tools:', error);
        // Fallback to agents.tools JSON column
        const toolSet = new Set<string>();
        selectedAgents.forEach((agentId) => {
          const agent = agents.find((a) => a.id === agentId);
          if (agent?.tools && Array.isArray(agent.tools)) {
            agent.tools.forEach((tool) => {
              if (typeof tool === 'string' && tool.trim().length > 0) {
                toolSet.add(tool.trim());
              }
            });
          }
        });
        setAvailableTools(Array.from(toolSet).sort((a, b) => a.localeCompare(b)));
      } finally {
        setLoadingTools(false);
      }
    };

    fetchAgentTools();
  }, [selectedAgents, agents]);

  useEffect(() => {
    if (availableTools.length === 0) {
      setSelectedTools([]);
      if (enableTools) {
        setEnableTools(false);
      }
      if (hasManualToolsToggle) {
        setHasManualToolsToggle(false);
      }
      return;
    }

    if (!hasManualToolsToggle && !enableTools) {
      setEnableTools(true);
    }

    setSelectedTools((prev) => {
      const valid = prev.filter((tool) => availableTools.includes(tool));
      if (valid.length > 0) {
        return valid;
      }
      return [...availableTools];
    });
  }, [availableTools, enableTools, hasManualToolsToggle]);

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
  const agent = agents.find((a) => a.id === selectedAgents[0]);
    if (!agent) {
      return null;
    }

    let displayName =
      (agent as any).displayName ||
      (agent as any).display_name ||
      agent.name;

    // Clean up display name - remove malformed prefixes and suffixes
    displayName = String(displayName)
      .replace(/\s*\(My Copy\)\s*/gi, '')
      .replace(/\s*\(Copy\)\s*/gi, '')
      .replace(/\[bea\]d-_agent_avatar_/gi, '')  // Remove malformed prefixes
      .replace(/^[^a-zA-Z]+/, '')                 // Remove leading non-letters
      .trim();
    
    // Capitalize first letter if needed
    if (displayName && displayName.length > 0) {
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }

  return {
    id: agent.id,
    avatar: agent.avatar,
    displayName,
  };
  }, [agents, selectedAgents]);

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
        return text.length > 0 ? `${speaker} + ": ${text}" : '';
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

  const availableRagDomains = useMemo(() => {
    if (!selectedAgents.length) {
      return [] as string[];
    }

    const domainSet = new Set<string>();
    selectedAgents.forEach((agentId) => {
      const agent = agents.find((a) => a.id === agentId);
      if (agent?.knowledge_domains && Array.isArray(agent.knowledge_domains)) {
        agent.knowledge_domains
          .map((domain) => (typeof domain === 'string' ? domain.trim() : ''))
          .filter((domain) => domain.length > 0)
          .forEach((domain) => domainSet.add(domain));
      }
    });

    return Array.from(domainSet).sort((a, b) => a.localeCompare(b));
  }, [agents, selectedAgents]);

  useEffect(() => {
    if (availableRagDomains.length === 0) {
      setSelectedRagDomains([]);
      if (enableRAG) {
        setEnableRAG(false);
      }
      return;
    }

    setSelectedRagDomains((prev) => {
      const valid = prev.filter((domain) => availableRagDomains.includes(domain));
      if (valid.length > 0) {
        return valid;
      }
      return [...availableRagDomains];
    });
  }, [availableRagDomains, enableRAG]);

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
        id: 'temp_' + Date.now().toString(),
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
        console.log('Fetching prompt starters for agents:', selectedAgents);
        
        // Get CSRF token from cookie
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('__Host-csrf-token='))
          ?.split('=')[1];
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add CSRF token if available
        if (csrfToken) {
          headers['x-csrf-token'] = csrfToken;
        }
        
        const response = await fetch('/api/prompt-starters', {
          method: 'POST',
          headers,
          body: JSON.stringify({ agentIds: selectedAgents }),
        });

        const data = await response.json();
        console.log('Prompt starters API response:', {
          status: response.status,
          ok: response.ok,
          data: data,
          prompts: data.prompts?.length || 0
        });

        if (response.ok) {
          if (data.prompts && Array.isArray(data.prompts)) {
            console.log('Setting prompt starters:', data.prompts.length);
            setPromptStarters(data.prompts);
          } else {
            console.warn('No prompts in response:', data);
            setPromptStarters([]);
          }
        } else {
          console.error('Failed to fetch prompt starters:', response.status, data);
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
      console.log('[ERROR] [Mode Check] No agent selected for mode:', mode, 'selectedAgents:', selectedAgents);
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: 'Please select an agent from the sidebar before sending a message. Click on an agent to add it to your chat.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    console.log('[OK] [Mode Check] Mode:', mode, 'Agent ID:', agentId, 'Selected Agents:', selectedAgents);

    const userMessage: Message = existingUserMessage ?? {
      id: nanoid(),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      attachments: (effectiveAttachments ?? []).map((file, i) => ({
        id: `${nanoid()}-${i}`,
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
    
    // [OK] NEW: Initialize streaming state
    setIsStreaming(true);
    setReasoningSteps([]);
    setStreamingMetrics(null);
    
    // [OK] NEW: Reset tool state
    setToolResults([]);
    toolExecutionStatus.completeExecution();
    
    // Reset streaming message
    setStreamingMessage('');

    try {
      // Get the agentId for manual mode BEFORE using it
      const agentId = selectedAgents && selectedAgents.length > 0 ? selectedAgents[0] : undefined;

      console.log('[AskExpert] Sending request to /api/ask-expert/orchestrate', {
        mode,
        agentId,
        messageLength: messageContent.length,
        enableRAG,
        enableTools,
      });

      // [OK] DEBUG LOGGING - Remove after fixing
      console.group('[DEBUG] [Mode 1 Debug] Request Details');
      console.log('Mode:', mode);
      console.log('Agent ID:', agentId);
      console.log('Selected Agents Array:', selectedAgents);
      console.log('Agents List:', agents.map(a => ({ id: a.id, name: a.name })));
      console.log('Enable RAG:', enableRAG);
      console.log('Enable Tools:', enableTools);
      console.log('User ID:', user?.id);
      console.groupEnd();

      // 🔥 NEW: Call Python AI Engine directly for Mode 1 streaming
      // [WARN] CRITICAL: Python AI Engine runs on port 8080 (NOT 8000!)
      // If changing this, also update:
      // - services/ai-engine/src/main.py (uvicorn port - should be 8080)
      // - .env.local (NEXT_PUBLIC_PYTHON_AI_ENGINE_URL=http://localhost:8080)
      const apiEndpoint = mode === 'manual' 
        ? `${process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080'}/api/mode1/manual`
        : '/api/ask-expert/orchestrate';

      console.log('[AskExpert] Calling endpoint:', apiEndpoint);

      // [OK] NEW: Mark connection as connecting
      connectionStatus.connect();

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // [OK] FIX: Use proper UUID format for tenant ID (AI Engine expects UUID)
          'x-tenant-id': user?.user_metadata?.tenant_id || '00000000-0000-0000-0000-000000000001',
        },
        body: JSON.stringify(
          mode === 'manual' 
            ? {
                // 🔥 Mode 1 (Python AI Engine) format - MUST match Mode1ManualRequest
                agent_id: agentId || '',  // [OK] Singular (backend expects agent_id)
                message: messageContent,  // [OK] Renamed from user_query
                enable_rag: enableRAG,
                enable_tools: enableTools,
                selected_rag_domains: enableRAG ? selectedRagDomains : [],
                requested_tools: enableTools ? selectedTools : [],  // [OK] Renamed from selected_tools
                model: selectedModel || 'gpt-4-turbo',
                temperature: 0.7,
                conversation_id: activeConversationId || undefined,
              }
            : {
                // Legacy Node.js API Gateway format
                mode: mode,
                agentId: (mode === 'manual' || mode === 'multi-expert') ? agentId : undefined,
                message: messageContent,
                conversationHistory: conversationContext.map(m => ({
                  role: m.role,
                  content: m.content
                })),
                enableRAG: enableRAG,
                enableTools: enableTools,
                requestedTools: enableTools ? selectedTools : undefined,
                selectedRagDomains: enableRAG ? selectedRagDomains : undefined,
                model: selectedModel,
                temperature: 0.7,
                maxTokens: 2000,
                userId: user?.id,
                maxIterations: (mode === 'autonomous' || mode === 'multi-expert') ? 10 : undefined,
                confidenceThreshold: (mode === 'autonomous' || mode === 'multi-expert') ? 0.95 : undefined,
                useLangGraph: useLangGraph,
              }
        ),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
        console.error('[AskExpert] Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(errorData.message || `HTTP ${response.status} + ": ${response.statusText}");
      }
      
      console.log('[AskExpert] Response OK, starting stream processing');

      // [OK] NEW: Mark connection as connected
      connectionStatus.connected();

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let fullResponse = '';
      let reasoning: string[] = [];
      let sources: Source[] = [];
      let citations: any[] = [];
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
      let reasoningStepsBuffer: any[] = [];

      const normalizeReasoningArray = (incoming: any[]): string[] => {
        return incoming
          .map((step: any) => {
            if (typeof step === 'string') {
              return step;
            }
            if (step && typeof step === 'object') {
              if (typeof step.content === 'string') {
                return step.content;
              }
              if (typeof step.text === 'string') {
                return step.text;
              }
            }
            if (typeof step === 'number') {
              return step.toString();
            }
            return '';
          })
          .filter((value) => Boolean(value && value.trim().length > 0));
      };

      const updateStreamingMeta = () => {
        setStreamingMeta({
          ragSummary: { ...ragSummary },
          toolSummary: {
            ...toolSummary,
            totals: { ...toolSummary.totals },
          },
          sources: [...sources],
          citations: Array.isArray(citations) ? [...citations] : [],
          reasoning: [...reasoning],
          reasoningSteps: reasoningStepsBuffer.length > 0 ? [...reasoningStepsBuffer] : undefined,
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

              // [OK] NEW: Handle LangGraph streaming modes first
              if (data.stream_mode) {
                // This is a proper LangGraph streaming event
                const { stream_mode, data: chunk } = data;
                
                // [DEBUG] DEBUG: Log ALL incoming events
                console.log('[SSE Debug] Received ' + stream_mode + ' event:', {
                  mode: stream_mode,
                  chunkType: typeof chunk,
                  isArray: Array.isArray(chunk),
                  keys: typeof chunk === 'object' ? Object.keys(chunk) : 'N/A',
                  preview: JSON.stringify(chunk).substring(0, 200)
                });
                
                switch (stream_mode) {
                  case 'custom': {
                    // Custom events from get_stream_writer()
                    
                    // [OK] NEW: Handle tool suggestion event
                    if (chunk.type === 'tool_suggestion') {
                      console.log('[TOOL] [Tool Suggestion] Received:', chunk);
                      
                      const toolSuggestions: ToolSuggestion[] = (chunk.suggestions || []).map((tool: any) => ({
                        tool_name: tool.tool_name || tool.name,
                        display_name: tool.display_name || tool.tool_name,
                        description: tool.description,
                        confidence: tool.confidence || 0,
                        reasoning: tool.reasoning || '',
                        parameters: tool.parameters || {},
                        cost_tier: tool.cost_tier,
                        estimated_cost: tool.estimated_cost,
                        estimated_duration: tool.estimated_duration_seconds || tool.estimated_duration,
                      }));
                      
                      if (chunk.needs_confirmation && toolSuggestions.length > 0) {
                        // Show confirmation modal
                        console.log('[TOOL] [Tool Confirmation] Showing modal for', toolSuggestions.length, 'tools');
                        toolConfirmation.showConfirmation(toolSuggestions, {
                          message: chunk.message || 'The following tools require your approval before execution.',
                          reasoning: chunk.reasoning,
                          onApprove: async () => {
                            console.log('[OK] [Tool Confirmation] User approved');
                            // Send approval to backend
                            try {
                              await fetch(`${process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080'}/api/tool/confirm`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  approved: true,
                                  conversation_id: activeConversationId 
                                }),
                              });
                            } catch (error) {
                              console.error('[ERROR] [Tool Confirmation] Failed to send approval:', error);
                            }
                          },
                          onDecline: async () => {
                            console.log('[ERROR] [Tool Confirmation] User declined');
                            // Send decline to backend
                            try {
                              await fetch(`${process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080'}/api/tool/confirm', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  approved: false,
                                  conversation_id: activeConversationId 
                                }),
                              });
                            } catch (error) {
                              console.error('[ERROR] [Tool Confirmation] Failed to send decline:', error);
                            }
                          },
                        });
                      }
                    }
                    // [OK] NEW: Handle tool execution start event
                    else if (chunk.type === 'tool_execution_start') {
                      console.log('[TOOL] [Tool Execution] Starting:', chunk);
                      
                      const executingTools: ExecutingTool[] = (chunk.tools || []).map((tool: any) => ({
                        tool_name: tool.tool_name || tool.name,
                        display_name: tool.display_name || tool.tool_name,
                        status: 'running' as ToolExecutionStatus,
                        progress: 0,
                        startedAt: new Date().toISOString(),
                        estimatedDuration: tool.estimated_duration_seconds || tool.estimated_duration,
                      }));
                      
                      toolExecutionStatus.startExecution(executingTools.map(t => ({
                        tool_name: t.tool_name,
                        display_name: t.display_name,
                        estimatedDuration: t.estimatedDuration,
                      })));
                    }
                    // [OK] NEW: Handle tool execution progress event
                    else if (chunk.type === 'tool_execution_progress') {
                      console.log('[TOOL] [Tool Execution] Progress:', chunk);
                      
                      toolExecutionStatus.updateToolStatus(chunk.tool_name, {
                        status: 'running' as ToolExecutionStatus,
                        progress: chunk.progress || 0,
                      });
                    }
                    // [OK] NEW: Handle tool execution result event
                    else if (chunk.type === 'tool_execution_result') {
                      console.log('[TOOL] [Tool Execution] Result:', chunk);
                      
                      // Update execution status
                      toolExecutionStatus.updateToolStatus(chunk.tool_name, {
                        status: chunk.status === 'success' ? 'success' : 'error' as ToolExecutionStatus,
                        progress: 100,
                        completedAt: new Date().toISOString(),
                        error: chunk.error,
                      });
                      
                      // Store result for display
                      const newResult: ToolResult = {
                        tool_name: chunk.tool_name,
                        display_name: chunk.display_name || chunk.tool_name,
                        status: chunk.status,
                        result: chunk.result,
                        error: chunk.error,
                        duration_seconds: chunk.duration_seconds || 0,
                        cost: chunk.cost || 0,
                      };
                      
                      setToolResults(prev => [...prev, newResult]);
                    }
                    // [OK] NEW: Handle tool execution complete event
                    else if (chunk.type === 'tool_execution_complete') {
                      console.log('[TOOL] [Tool Execution] All tools complete');
                      
                      // Keep results visible, just mark execution as done
                      setTimeout(() => {
                        toolExecutionStatus.completeExecution();
                      }, 2000); // Show completion for 2 seconds
                    }
                    // Existing reasoning event handler
                    else if (chunk.type === 'langgraph_reasoning') {
                      const reasoningStep = chunk.step || {};
                      if (reasoningStep.content) {
                        reasoningStepsBuffer = [...reasoningStepsBuffer, reasoningStep];
                        setReasoningSteps(reasoningStepsBuffer);
                        
                        // [OK] CRITICAL FIX: Also store in streamingMeta for persistence
                        setStreamingMeta(meta => ({
                          ...meta,
                          reasoningSteps: reasoningStepsBuffer,
                          reasoning: meta?.reasoning || []
                        }));
                        
                        setStreamingReasoning(prev => {
                          return prev ? prev + "\n\n" + reasoningStep.content : reasoningStep.content;
                        });
                        setIsStreamingReasoning(true);
                      }
                    } else if (chunk.type === 'final') {
                      // [OK] CRITICAL FIX: Handle final response event from format_output node
                      console.log('[OK] [Custom Mode] Received final event with response');
                      
                      if (chunk.response && typeof chunk.response === 'string') {
                        console.log('[Final Event] Response length: ' + chunk.response.length + ' chars');
                        // Store final response - this is the complete AI response with citations
                        setStreamingMessage(chunk.response);
                        fullResponse = chunk.response;
                        setStreamingMeta(prev => ({
                          ...prev,
                          finalResponse: chunk.response,
                          sources: chunk.sources || chunk.citations || prev?.sources,
                          citations: chunk.citations || prev?.citations,
                          ragSummary: chunk.rag || prev?.ragSummary
                        }));
                      }
                      
                      // Update confidence
                      if (typeof chunk.confidence === 'number') {
                        confidence = chunk.confidence;
                      }
                    } else if (chunk.type === 'rag_sources') {
                      console.log('📥 [DEBUG] Received rag_sources event:', {
                        hasChunk: !!chunk,
                        sourcesCount: chunk.sources?.length || 0,
                        firstSource: chunk.sources?.[0]
                      });
                      
                      const incomingSources = Array.isArray(chunk.sources) ? chunk.sources : [];
                      sources = incomingSources.map((source: any, idx: number) =>
                        normalizeSourceRecord(source, idx)
                      );
                      
                      console.log('[DATA] [DEBUG] After mapping sources:', {
                        sourcesLength: sources.length,
                        firstMapped: sources[0]
                      });
                      
                      citations = Array.isArray(chunk.sources) ? chunk.sources : citations;
                      ragSummary = {
                        totalSources: typeof chunk.total === 'number' ? chunk.total : sources.length,
                        strategy: typeof chunk.strategy === 'string' ? chunk.strategy : ragSummary.strategy,
                        domains: Array.isArray(chunk.domains) ? chunk.domains : ragSummary.domains,
                        cacheHit: typeof chunk.cacheHit === 'boolean' ? chunk.cacheHit : ragSummary.cacheHit,
                        warning: ragSummary.warning,
                        retrievalTimeMs: typeof chunk.retrievalTimeMs === 'number' ? chunk.retrievalTimeMs : ragSummary.retrievalTimeMs,
                      };
                      updateStreamingMeta();
                    } else if (chunk.type === 'final') {
                      const meta = chunk;
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
                      if (meta.sources && Array.isArray(meta.sources)) {
                        sources = meta.sources.map((source: any, idx: number) => ({
                          number: typeof source.number === 'string' ? parseInt(source.number, 10) : source.number ?? idx + 1,
                          id: source.id || 'source-' + (idx + 1),
                          url: source.url || '#',
                          title: source.title || 'Source ' + (idx + 1),
                          description: source.description || source.summary,
                          excerpt: source.excerpt || source.description,
                          quote: source.quote,
                          similarity: typeof source.similarity === 'number' ? source.similarity : undefined,
                          domain: source.domain,
                          evidenceLevel: source.evidenceLevel || 'Unknown',
                          organization: source.organization,
                          reliabilityScore: typeof source.reliabilityScore === 'number' ? source.reliabilityScore : undefined,
                          lastUpdated: source.lastUpdated,
                          sourceType: source.sourceType,
                          metadata: source.metadata,
                        }));
                      }
                      citations = Array.isArray(meta.citations) ? meta.citations : citations;
                      ragSummary = {
                        ...ragSummary,
                        totalSources: sources.length,
                      };
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
                      if (Array.isArray(meta.reasoning) && meta.reasoning.length > 0) {
                        reasoning = normalizeReasoningArray(meta.reasoning);
                        console.log('[Mode1 Final] Extracted ' + reasoning.length + ' reasoning steps from meta');
                      }
                      if (Array.isArray(meta.branches) && meta.branches.length > 0) {
                        branches = meta.branches.map((branch: any, idx: number) => ({
                          id: branch.id || 'branch-' + (idx + 1),
                          content: typeof branch.content === 'string' ? branch.content : '',
                          confidence: typeof branch.confidence === 'number' ? branch.confidence : 0,
                          citations: Array.isArray(branch.citations) ? branch.citations : [],
                          sources: Array.isArray(branch.sources)
                            ? branch.sources.map((src: any, sourceIdx: number) => ({
                                id: src.id || 'branch-' + (idx + 1) + '-source-' + (sourceIdx + 1),
                                url: src.url || src.link || '#',
                                title: src.title || src.name || 'Source ' + (sourceIdx + 1),
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
                    }
                    break;
                  }
                  case 'messages': {
                    // [OK] LangGraph messages mode: chunk is an array of LangChain messages
                    // Format: [HumanMessage(...), AIMessage(content="response")]
                    if (Array.isArray(chunk)) {
                      for (const message of chunk) {
                        // Extract AIMessage content
                        if (message.type === 'ai' || message.constructor?.name === 'AIMessage') {
                          const content = message.content || '';
                          if (typeof content === 'string' && content.trim()) {
                            console.log('[OK] [Messages Mode] Received AIMessage:', content.substring(0, 100));
                            setStreamingMessage(prev => prev + content);
                            fullResponse += content;
                          }
                        }
                      }
                    } else if (chunk.content) {
                      // Fallback: direct content field
                      const content = typeof chunk.content === 'string' ? chunk.content : '';
                      if (content.trim()) {
                        console.log('[OK] [Messages Mode] Received content:', content.substring(0, 100));
                        setStreamingMessage(prev => prev + content);
                        fullResponse += content;
                      }
                    }
                    break;
                  }
                  case 'updates': {
                    // [OK] Node completion updates - extract final state with sources
                    console.log('🔄 [LangGraph Update] Node completed:', chunk);
                    
                    // [OK] DEBUG: Log all keys in the chunk to see what's available
                    if (chunk && typeof chunk === 'object') {
                      console.log('[DEBUG] [Updates Debug] Chunk keys:', Object.keys(chunk));
                      console.log('[DEBUG] [Updates Debug] Chunk preview:', JSON.stringify(chunk).substring(0, 300));
                    }
                    
                    // [OK] CRITICAL FIX: Updates mode can wrap state inside multiple levels (node name, state.values, etc.)
                    const { state: extractedState, node: derivedNode } = unwrapLangGraphUpdateState(chunk);
                    const actualState =
                      extractedState && typeof extractedState === 'object' && !Array.isArray(extractedState)
                        ? extractedState
                        : {};
                    
                    if (derivedNode) {
                      console.log('[DEBUG] [Updates Unwrap] Extracted state from node:', derivedNode);
                    }
                    console.log('[DEBUG] [Updates Debug] actualState keys:', Object.keys(actualState));
                    console.log('[DEBUG] [Updates Debug] has_reasoning_steps:', Array.isArray(actualState?.reasoning_steps) ? actualState.reasoning_steps.length : 0);
                    console.log('[DEBUG] [Updates Debug] has_sources:', Array.isArray(actualState?.sources) ? actualState.sources.length : 0);
                    
                    // Merge metadata for downstream consumers
                    finalMeta = {
                      ...(finalMeta ?? {}),
                      ...actualState,
                    };
                    
                    // Extract sources from final format_output state
                    if (actualState.sources && Array.isArray(actualState.sources)) {
                      console.log('[Updates Mode] Found ' + actualState.sources.length + ' sources');
                      const normalizedSources = actualState.sources.map((source: any, idx: number) =>
                        normalizeSourceRecord(source, idx)
                      );
                      sources = normalizedSources;
                      ragSummary = {
                        ...ragSummary,
                        totalSources: normalizedSources.length,
                      };
                      setStreamingMeta(prev => ({
                        ...(prev ?? {}),
                        sources: normalizedSources,
                        ragSummary: {
                          ...((prev ?? {}).ragSummary ?? ragSummary),
                          totalSources: normalizedSources.length,
                        },
                      }));
                      // Note: sources are stored in streamingMeta, which is used in finalSources
                    }
                    
                    // Extract citations
                    if (actualState.citations && Array.isArray(actualState.citations)) {
                      console.log('[Updates Mode] Found ' + actualState.citations.length + ' citations');
                      citations = actualState.citations;
                      setStreamingMeta(prev => ({
                        ...(prev ?? {}),
                        citations: actualState.citations
                      }));
                    }
                    
                    // Extract confidence
                    if (typeof actualState.confidence === 'number') {
                      console.log('[Updates Mode] Confidence: ' + actualState.confidence);
                      confidence = actualState.confidence;
                    }
                    
                    // [OK] Extract final response content if present
                    const resolvedResponse =
                      typeof actualState.response === 'string' && actualState.response.trim().length > 0
                        ? actualState.response
                        : typeof actualState.agent_response === 'string' && actualState.agent_response.trim().length > 0
                          ? actualState.agent_response
                          : undefined;
                    if (resolvedResponse) {
                      console.log("[Updates Mode] Found final response (" + resolvedResponse.length + " chars)");
                      fullResponse = resolvedResponse;
                      setStreamingMessage(prev => (prev && prev.trim().length > 0 ? prev : resolvedResponse));
                      setStreamingMeta(prev => ({
                        ...(prev ?? {}),
                        finalResponse: resolvedResponse
                      }));
                    }
                    
                    // [OK] FIX: Extract reasoning_steps from LangGraph state
                    if (actualState.reasoning_steps && Array.isArray(actualState.reasoning_steps)) {
                      console.log("[Updates Mode] Found " + actualState.reasoning_steps.length + " reasoning steps from LangGraph");
                      reasoningStepsBuffer = actualState.reasoning_steps;
                      setReasoningSteps(actualState.reasoning_steps);
                      setStreamingMeta(prev => ({
                        ...(prev ?? {}),
                        reasoningSteps: actualState.reasoning_steps
                      }));
                      const normalizedReasoningFromSteps = normalizeReasoningArray(actualState.reasoning_steps);
                      if (normalizedReasoningFromSteps.length > 0) {
                        reasoning = normalizedReasoningFromSteps;
                      }
                    }
                    
                    if (Array.isArray(actualState.reasoning) && actualState.reasoning.length > 0) {
                      const normalizedReasoning = normalizeReasoningArray(actualState.reasoning);
                      if (normalizedReasoning.length > 0) {
                        reasoning = normalizedReasoning;
                        setStreamingMeta(prev => ({
                          ...(prev ?? {}),
                          reasoning: normalizedReasoning
                        }));
                      }
                    }
                    
                    break;
                  }
                }
                
                // Don't process legacy format after handling new format
                continue;
              }

              // Handle different chunk types based on mode (LEGACY FORMAT)
              if (data.type === 'chunk' && data.content) {
                if (typeof data.content === 'string' && (data.content.startsWith('__mode1_meta__') || data.content.startsWith('__mode2_meta__') || data.content.startsWith('__mode3_meta__') || data.content.startsWith('__mode4_meta__'))) {
                  try {
                    // Determine which mode prefix to use
                    let metaPrefix = '';
                    if (data.content.startsWith('__mode1_meta__')) {
                      metaPrefix = '__mode1_meta__';
                    } else if (data.content.startsWith('__mode2_meta__')) {
                      metaPrefix = '__mode2_meta__';
                    } else if (data.content.startsWith('__mode3_meta__')) {
                      metaPrefix = '__mode3_meta__';
                    } else if (data.content.startsWith('__mode4_meta__')) {
                      metaPrefix = '__mode4_meta__';
                    }
                    
                    const meta = JSON.parse(data.content.slice(metaPrefix.length));
                    switch (meta?.event) {
                      case 'rag_sources': {
                        const incomingSources = Array.isArray(meta.sources) ? meta.sources : [];
                        sources = incomingSources.map((source: any, idx: number) => ({
                          id: source.id || 'source-' + (idx + 1),
                          url: source.url || '#',
                          title: source.title || 'Source ' + (idx + 1),
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
                          const base = "Retrieved " + sources.length + " evidence source" + (sources.length === 1 ? "" : "s") + (meta.strategy ? " (" + meta.strategy + ")" : "");
                          return prev ? base + "\n\n" + prev : base;
                        });
                        setIsStreamingReasoning(true);
                        reasoning.push("Retrieved " + sources.length + " evidence source" + (sources.length === 1 ? "" : "s") + (meta.strategy ? " (" + meta.strategy + ")" : "") + ".");
                        updateStreamingMeta();
                        break;
                      }
                      case 'rag_warning': {
                        ragSummary.warning = meta.message;
                        setStreamingReasoning(prev => {
                          const base = "WARNING: " + (meta.message || "Evidence could not be retrieved.");
                          return prev ? base + "\n\n" + prev : base;
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
                            return prev ? prev + "\n\n" + message : message;
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
                            ? outputPreview.slice(0, 157) + '...'
                            : outputPreview
                          : undefined;

                        const base = success
                          ? "Tool " + toolName + " succeeded" + (previewText ? " -> " + previewText : "")
                          : "Tool " + toolName + " failed" + (errorMessage ? ": " + errorMessage : "");

                        setStreamingReasoning(prev => {
                          return prev ? base + "\n\n" + prev : base;
                        });
                        setIsStreamingReasoning(true);
                        reasoning.push(base);
                        updateStreamingMeta();
                        break;
                      }
                      // [OK] NEW: Handle LangGraph reasoning events (Mode 1 doesn't emit workflow_step)
                      case 'langgraph_reasoning': {
                        const reasoningStep = meta.step || {};
                        if (reasoningStep.content) {
                          reasoningStepsBuffer = [...reasoningStepsBuffer, reasoningStep];
                          setReasoningSteps(reasoningStepsBuffer);
                          // Also update the existing reasoning display
                          setStreamingReasoning(prev => {
                            return prev ? prev + '\n\n' + reasoningStep.content : reasoningStep.content;
                          });
                          setIsStreamingReasoning(true);
                        }
                        break;
                      }
                      // [OK] NEW: Handle metrics events
                      case 'metrics': {
                        setStreamingMetrics({
                          tokensGenerated: meta.tokensGenerated,
                          tokensPerSecond: meta.tokensPerSecond,
                          elapsedTime: meta.elapsedTime,
                          estimatedTimeRemaining: meta.estimatedTimeRemaining
                        });
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
                        // [OK] Handle reasoning from API response
                        if (Array.isArray(meta.reasoning) && meta.reasoning.length > 0) {
                          reasoning = normalizeReasoningArray(meta.reasoning);
                          console.log('[Mode1 Final] Extracted ' + reasoning.length + ' reasoning steps from meta');
                        }
                        if (Array.isArray(meta.branches) && meta.branches.length > 0) {
                          branches = meta.branches.map((branch: any, idx: number) => ({
                            id: branch.id || 'branch-' + (idx + 1),
                            content: typeof branch.content === 'string' ? branch.content : '',
                            confidence: typeof branch.confidence === 'number' ? branch.confidence : 0,
                            citations: Array.isArray(branch.citations) ? branch.citations : [],
                            sources: Array.isArray(branch.sources)
                              ? branch.sources.map((src: any, sourceIdx: number) => ({
                                  id: src.id || 'branch-' + (idx + 1) + '-source-' + (sourceIdx + 1),
                                  url: src.url || src.link || '#',
                                  title: src.title || src.name || 'Source ' + (sourceIdx + 1),
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
                  setStreamingReasoning(prev => "ERROR: " + errorMessage);
                  setIsStreamingReasoning(true);
                  fullResponse += data.content;
                } else {
                  fullResponse += data.content;
                  setStreamingMessage(fullResponse);
                  if (!streamingReasoning || streamingReasoning === 'Thinking...' || streamingReasoning.startsWith('[ERROR]')) {
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
                // Add agent selection to reasoning
                setStreamingReasoning(prev => {
                  const agentInfo = "Selected Agent: " + (data.agent.display_name || data.agent.name);
                  return prev && prev !== 'Thinking...' && prev !== 'Processing your request...'
                    ? prev + '\n\n' + agentInfo
                    : agentInfo;
                });
                setIsStreamingReasoning(true);
              } else if (data.type === 'selection_reason' && data.selectionReason) {
                // Mode 2 & Mode 3: Selection reason
                selectionReason = data.selectionReason;
                // Add selection reason to reasoning
                setStreamingReasoning(prev => {
                  const reasonText = "Selection Reason: " + data.selectionReason;
                  return prev ? prev + "\n\n" + reasonText : reasonText;
                });
                setIsStreamingReasoning(true);
              } else if (data.type === 'goal_understanding') {
                // Mode 3 & Mode 4: Goal understanding
                autonomousMetadata.goalUnderstanding = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => "Goal Understanding: " + data.content + (prev ? '\n\n' + prev : ''));
                setIsStreamingReasoning(true);
                console.log('[GOAL] Goal Understanding:', data.content);
              } else if (data.type === 'execution_plan') {
                // Mode 3 & Mode 4: Execution plan
                autonomousMetadata.executionPlan = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Execution Plan: " + data.content);
                setIsStreamingReasoning(true);
                console.log('[PLAN] Execution Plan:', data.content);
              } else if (data.type === 'iteration_start') {
                // Mode 3 & Mode 4: ReAct iteration start
                autonomousMetadata.currentIteration = data.metadata?.iteration;
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Iteration " + (data.metadata?.iteration + 1) + ": Starting");
                setIsStreamingReasoning(true);
                console.log("[Iteration] " + (data.metadata?.iteration || 0) + ": Starting");
              } else if (data.type === 'thinking_start') {
                // Detailed step: Starting thinking
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Analyzing current state...");
                setIsStreamingReasoning(true);
              } else if (data.type === 'thought') {
                // Mode 3 & Mode 4: ReAct thought
                autonomousMetadata.currentThought = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Thought: " + data.content);
                setIsStreamingReasoning(true);
                console.log('[THINK] Thought:', data.content);
              } else if (data.type === 'action_decision_start') {
                // Detailed step: Starting action decision
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Deciding on next action...");
                setIsStreamingReasoning(true);
              } else if (data.type === 'action_decided') {
                // Detailed step: Action decided
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Action Decided: " + data.content);
                setIsStreamingReasoning(true);
              } else if (data.type === 'action_execution_start') {
                // Detailed step: Starting action execution
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Executing action...");
                setIsStreamingReasoning(true);
              } else if (data.type === 'action_executed') {
                // Detailed step: Action executed
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Action Executed: " + data.content);
                setIsStreamingReasoning(true);
              } else if (data.type === 'action') {
                // Mode 3 & Mode 4: ReAct action (fallback for old format)
                autonomousMetadata.currentAction = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Action: " + data.content);
                setIsStreamingReasoning(true);
                console.log('[ACTION] Action:', data.content);
              } else if (data.type === 'observation_start') {
                // Detailed step: Starting observation
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Processing action results...");
                setIsStreamingReasoning(true);
              } else if (data.type === 'observation') {
                // Mode 3 & Mode 4: ReAct observation
                autonomousMetadata.currentObservation = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Observation: " + data.content);
                setIsStreamingReasoning(true);
                console.log('[OBS] Observation:', data.content);
              } else if (data.type === 'reflection_start') {
                // Detailed step: Starting reflection
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Reflecting on what we learned...");
                setIsStreamingReasoning(true);
              } else if (data.type === 'reflection') {
                // Mode 3 & Mode 4: ReAct reflection
                autonomousMetadata.currentReflection = data.content;
                // Accumulate reasoning for display
                setStreamingReasoning(prev => prev + (prev ? "\n\n" : "") + "Reflection: " + data.content);
                setIsStreamingReasoning(true);
                console.log('🤔 Reflection:', data.content);
              } else if (data.type === 'final_answer') {
                // Mode 3 & Mode 4: Final answer
                fullResponse = data.content;
                setStreamingMessage(fullResponse);
                autonomousMetadata.finalAnswer = data.content;
                autonomousMetadata.finalConfidence = data.metadata?.confidence;
                autonomousMetadata.totalIterations = data.metadata?.iterations;
                console.log('[OK] Final Answer:', data.content);
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
                console.log('[INFO] Sources received:', sources.length);
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
                console.log('[OK] Execution completed');
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
                  const errorText = "ERROR: " + userFriendlyMessage;
                  return prev ? prev + "\n\n" + errorText : errorText;
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
                reasoning = Array.isArray(data.reasoning) ? normalizeReasoningArray(data.reasoning) : [];
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

      // [OK] FIX: Use local streaming accumulators to build the final response
      const resolvedFullResponse = fullResponse && fullResponse.trim().length > 0 ? fullResponse : '';
      const finalContent = resolvedFullResponse || streamingMeta?.finalResponse || streamingMessage || '';
      const citationFallbackSources = (() => {
        const primary = normalizeSourcesFromCitations(finalMeta?.citations);
        if (primary.length > 0) {
          return primary;
        }
        return normalizeSourcesFromCitations(streamingMeta?.citations);
      })();

      const finalSources =
        sources.length > 0
          ? sources
          : (streamingMeta?.sources && streamingMeta.sources.length > 0
              ? streamingMeta.sources
              : citationFallbackSources);
      const finalReasoning = reasoning.length > 0 ? reasoning : (streamingMeta?.reasoning || []);
      const finalReasoningSteps =
        reasoningStepsBuffer.length > 0
          ? reasoningStepsBuffer
          : (streamingMeta?.reasoningSteps && streamingMeta.reasoningSteps.length > 0
            ? streamingMeta.reasoningSteps
            : undefined);
      
      console.log('[OK] [DEBUG] Final Message Sources Check:', {
        streamingMetaSources: streamingMeta?.sources?.length || 0,
        localSources: sources.length,
        finalSourcesLength: finalSources.length,
        firstFinalSource: finalSources[0]
      });
      
      // [OK] FIX: Merge backend ragSummary data with local data
      const finalRagSummary = {
        totalSources: finalSources.length,  // [OK] Correct count from final sources
        strategy: ragSummary.strategy ?? streamingMeta?.ragSummary?.strategy ?? 'hybrid',
        domains:
          (ragSummary.domains && ragSummary.domains.length > 0
            ? ragSummary.domains
            : streamingMeta?.ragSummary?.domains) ?? selectedRagDomains ?? [],
        cacheHit: ragSummary.cacheHit ?? streamingMeta?.ragSummary?.cacheHit ?? false,
        warning: ragSummary.warning ?? streamingMeta?.ragSummary?.warning,
        retrievalTimeMs: ragSummary.retrievalTimeMs ?? streamingMeta?.ragSummary?.retrievalTimeMs,
      };
      const finalToolSummary = streamingMeta?.toolSummary
        ? {
            ...toolSummary,
            ...streamingMeta.toolSummary,
            totals: {
              ...toolSummary.totals,
              ...(streamingMeta.toolSummary?.totals ?? {}),
            },
          }
        : toolSummary;

      console.log('[OK] [Final Message] Using accumulated streaming state:', {
        contentLength: finalContent.length,
        sourcesCount: finalSources.length,
        reasoningCount: finalReasoning.length,
        streamingMessageLength: streamingMessage.length,
        fullResponseLength: resolvedFullResponse.length,
        streamingMetaFinalResponse: streamingMeta?.finalResponse?.length || 0,
        streamingMetaSources: streamingMeta?.sources?.length || 0,
        source: resolvedFullResponse
          ? 'fullResponse'
          : streamingMeta?.finalResponse
            ? 'streamingMeta.finalResponse'
            : streamingMessage
              ? 'streamingMessage'
              : 'empty'
      });

      const assistantMessageId = nanoid();
      const messageBranches =
        branches && branches.length > 0
          ? branches
          : [
              {
                id: `${assistantMessageId}-branch-0`,
                content: finalContent,  // [OK] Use accumulated content
                confidence: typeof confidence === 'number' ? confidence : 0,
                citations: Array.isArray(finalMeta?.citations)
                  ? finalMeta.citations
                  : Array.isArray(streamingMeta?.citations)
                    ? streamingMeta.citations
                    : [],
                sources: finalSources.map((src, idx) => ({ ...src, id: src.id || 'fallback-source-' + (idx + 1) })),  // [OK] Use finalSources
                createdAt: new Date(),
                reasoning: finalReasoning.length > 0 ? finalReasoning.join('\n') : undefined,  // [OK] Use finalReasoning
              },
            ];
      const activeBranchIndex = Math.min(currentBranch, messageBranches.length - 1);
      const activeBranch = messageBranches[activeBranchIndex];

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: activeBranch?.content ?? finalContent,  // [OK] Use finalContent
        timestamp: Date.now(),
        reasoning: finalReasoning,  // [OK] Use finalReasoning
        sources: activeBranch?.sources && activeBranch.sources.length > 0 ? activeBranch.sources : finalSources,  // [OK] Use finalSources
        selectedAgent,
        selectionReason,
        confidence,
        branches: messageBranches,
        currentBranch: activeBranchIndex,
        // Add autonomous metadata for Mode 3 & Mode 4
        ...(Object.keys(autonomousMetadata).length > 0 && { autonomousMetadata }),
        metadata: {
          ragSummary: finalRagSummary,  // [OK] Use finalRagSummary
          toolSummary: finalToolSummary,  // [OK] Use finalToolSummary
          sources: activeBranch?.sources && activeBranch.sources.length > 0 ? activeBranch.sources : finalSources,  // [OK] Use finalSources
          reasoning: finalReasoning,  // [OK] Use finalReasoning
          confidence,
          citations: Array.isArray(finalMeta?.citations)
            ? finalMeta.citations
            : Array.isArray(streamingMeta?.citations)
              ? streamingMeta.citations
              : undefined,
          // [OK] Include LangGraph AI reasoning for persistent display
          reasoningSteps: finalReasoningSteps && finalReasoningSteps.length > 0 ? finalReasoningSteps : undefined,
          streamingMetrics: streamingMetrics || streamingMeta?.streamingMetrics || undefined,
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
      console.group('📝 [AskExpert] Creating Assistant Message');
      console.log('Mode:', mode);
      console.log('Content length:', finalContent.length);  // [OK] Use finalContent
      console.log('Content preview:', finalContent.substring(0, 100));
      console.log('Selected agent:', selectedAgent);
      console.log('Sources count:', finalSources.length);  // [OK] Use finalSources
      console.log('Reasoning steps:', finalReasoning.length);  // [OK] Use finalReasoning
      console.log('Autonomous metadata keys:', Object.keys(autonomousMetadata));
      console.log('Confidence:', confidence);
      console.log('Message ID:', assistantMessage.id);
      
      // Enhanced debugging for missing features
      console.log('📦 Metadata structure:', {
        hasRagSummary: !!assistantMessage.metadata?.ragSummary,
        hasToolSummary: !!assistantMessage.metadata?.toolSummary,
        hasSources: !!assistantMessage.metadata?.sources,
        hasReasoning: !!assistantMessage.metadata?.reasoning,
        hasConfidence: !!assistantMessage.metadata?.confidence,
        sourcesLength: assistantMessage.metadata?.sources?.length || 0,
        reasoningLength: assistantMessage.metadata?.reasoning?.length || 0
      });
      
      if (assistantMessage.metadata?.reasoning) {
        console.log('[THINK] Reasoning array:', assistantMessage.metadata.reasoning);
      } else {
        console.warn('[WARN] No reasoning in metadata!');
      }
      
      if (assistantMessage.metadata?.sources) {
        console.log('[INFO] Sources array:', assistantMessage.metadata.sources);
      } else {
        console.warn('[WARN] No sources in metadata!');
      }
      
      console.log('Full message object:', JSON.stringify(assistantMessage, null, 2));
      console.groupEnd();

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        console.log('[DATA] [Mode 3 Debug] Messages array updated. Total messages:', updated.length);
        console.log('[DATA] [Mode 3 Debug] Last message role:', updated[updated.length - 1].role);
        console.log('[DATA] [Mode 3 Debug] Last message agent:', updated[updated.length - 1].selectedAgent);
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
      
      // [OK] Clear all streaming state after adding final message
      setStreamingMessage('');
      setStreamingReasoning('');
      setIsStreamingReasoning(false);
      setStreamingMeta(null);
      setReasoningSteps([]); // [OK] Clear reasoning steps to prevent streaming component from persisting
      setStreamingMetrics(null); // [OK] Clear streaming metrics

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
      
      // [OK] NEW: Mark connection as disconnected/error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        connectionStatus.disconnect('Network error: Unable to connect to the AI engine');
      } else {
        connectionStatus.disconnect(error instanceof Error ? error.message : 'Unknown error occurred');
      }
      
      // Handle fetch failures specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[AskExpert] Fetch failed - network or server error:', error.message);
        const networkErrorMessage: Message = {
          id: nanoid(),
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
          id: nanoid(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        console.error('[AskExpert] Unknown error:', error);
        const errorMessage: Message = {
          id: nanoid(),
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
      // [OK] NEW: Cleanup streaming state
      setIsStreaming(false);
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

    const handleOpenChatEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string; title?: string }>).detail;
      if (detail?.sessionId) {
        const exists = conversations.some((conv) => conv.id === detail.sessionId);
        if (!exists) {
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
    <div className={`flex flex-col h-full w-full ${darkMode ? 'dark bg-gray-950' : 'bg-white'}`}>
      {/* Top Bar - Standardized Compact Header */}
      <PageHeaderCompact
        icon={MessageSquare}
        title="Ask Expert"
        description="1:1 expert consultation with AI agents"
        badge={{
          label: `Mode ${currentMode.id} + ": ${currentMode.name}",
          variant: 'secondary'
        }}
        actions={
          <div className="flex items-center gap-2">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Help & Tutorials"
                >
                  <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowOnboarding(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Ask Expert Tutorial</span>
                </DropdownMenuItem>
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowMode1Helper(true)}>
                    <Target className="h-4 w-4 mr-2" />
                    <span>Mode 1 Helper</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMode2Helper(true)}>
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Mode 2 Helper</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMode3Helper(true)}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    <span>Mode 3 Helper</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMode4Helper(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span>Mode 4 Helper</span>
                  </DropdownMenuItem>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
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

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-gray-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        }
      />

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
          <ConversationContent className="max-w-5xl mx-auto px-4 py-6">
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
                      darkMode={darkMode}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* [OK] Removed top-level Reasoning component - reasoning now only shown per-message */}
                {messages.map((msg, index) => {
                  // Get agent info for assistant messages
                  const agentInfo =
                    msg.role === 'assistant' && msg.selectedAgent
                      ? agents.find((a) => a.id === msg.selectedAgent?.id)
                      : msg.role === 'assistant' && primarySelectedAgent
                      ? agents.find((a) => a.id === primarySelectedAgent.id)
                      : null;
                      
                  const avatarValue =
                    msg.role === 'assistant'
                      ? agentInfo?.avatar
                      : undefined;
                      
                  // Get agent name, prioritize cleaned displayName
                  const agentDisplayName = agentInfo
                    ? (agentInfo.displayName || agentInfo.name)
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
                      agentName={agentDisplayName}
                      agentAvatar={avatarValue}
                      userName={user?.user_metadata?.full_name || user?.user_metadata?.name}
                      userEmail={user?.email}
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
                    metadata={{
                      ...streamingMeta,
                      reasoning: streamingReasoning ? [streamingReasoning] : (streamingMeta?.reasoning || []),
                      // [OK] Add LangGraph AI reasoning data
                      reasoningSteps: reasoningSteps.length > 0 ? reasoningSteps : undefined,
                      streamingMetrics: streamingMetrics || undefined,
                    }}
                    agentName={(() => {
                      const agent = selectedAgents.length > 0
                        ? agents.find((a) => selectedAgents.includes(a.id))
                        : null;
                      if (!agent) {
                        return undefined; // Let it default to "AI Assistant"
                      }
                      return agent.displayName || agent.name;
                    })()}
                    agentAvatar={(() => {
                      const agent = selectedAgents.length > 0
                        ? agents.find((a) => selectedAgents.includes(a.id))
                        : null;
                      return agent?.avatar;
                    })()}
                    userName={user?.user_metadata?.full_name || user?.user_metadata?.name}
                    userEmail={user?.email}
                  />
                )}
                
                {/* [OK] NEW: Tool Execution Status (shown during tool execution) */}
                {toolExecutionStatus.tools.length > 0 && (
                  <div className="mb-4">
                    <ToolExecutionStatusComponent
                      tools={toolExecutionStatus.tools}
                      showProgress={true}
                    />
                  </div>
                )}
                
                {/* [OK] NEW: Tool Results (shown after tools complete) */}
                {toolResults.length > 0 && (
                  <div className="mb-4">
                    <ToolResults
                      results={toolResults}
                      showCost={true}
                      defaultExpanded={false}
                    />
                  </div>
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
            useLangGraph={useLangGraph} // Always true - LangGraph enabled by default
            onUseLangGraphChange={undefined} // Button removed - LangGraph always enabled
          />
        </div>

        {/* Onboarding Popup */}
        <AskExpertOnboarding 
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
          onComplete={() => {
            setShowOnboarding(false);
          }}
        />

        {/* Mode 1 Helper */}
        <Mode1Helper
          open={showMode1Helper}
          onOpenChange={setShowMode1Helper}
          variant="modal"
          showOnFirstVisit={false}
          autoDismiss={false}
          onExampleClick={async (example) => {
            // Step 1: Fill the prompt immediately
            setInputValue(example.question);
            
            // Step 2: Find the agent (from all available agents, not just user's list)
            let selectedAgent = null;
            
            // Get all available agents (not just user's list)
            const allAgents = await getAllAgents();
            
            // Method 1: If agentId is provided, use it directly
            if (example.agentId) {
              selectedAgent = allAgents.find((agent) => agent.id === example.agentId);
            }
            
            // Method 2: If no agentId, use search terms from example
            if (!selectedAgent && example.agentSearchTerms && Array.isArray(example.agentSearchTerms) && example.agentSearchTerms.length > 0) {
              const agentsWithScores = allAgents.map((agent) => {
                const name = String(agent.name || '').toLowerCase();
                const displayName = String(
                  (agent as any).displayName || 
                  (agent as any).display_name || 
                  ''
                ).toLowerCase();
                const description = String(agent.description || '').toLowerCase();
                const specialty = String((agent as any).specialty || '').toLowerCase();
                const searchText = `${name} ${displayName} ${description} ${specialty}`;
                
                const matchCount = (example.agentSearchTerms || []).filter((term) =>
                  searchText.includes(term.toLowerCase())
                ).length;
                
                return { agent, score: matchCount };
              });
              
              const bestMatch = agentsWithScores
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score)[0];
              
              if (bestMatch) {
                selectedAgent = bestMatch.agent;
              }
            }
            
            // Method 3: Fallback to expert name matching
            if (!selectedAgent) {
              const normalizedExpert = example.expert.toLowerCase().replace(/\s*expert\s*$/i, '').trim();
              
              selectedAgent = allAgents.find((agent) => {
                const name = String(agent.name || '').toLowerCase();
                const displayName = String(
                  (agent as any).displayName || 
                  (agent as any).display_name || 
                  ''
                ).toLowerCase();
                const description = String(agent.description || '').toLowerCase();
                
                return (
                  name.includes(normalizedExpert) ||
                  displayName.includes(normalizedExpert) ||
                  description.includes(normalizedExpert)
                );
              });
            }
            
            // Step 3: If agent found, ensure it's in user's list and select it
            if (selectedAgent) {
              const isAgentInUserList = agents.some((a) => a.id === selectedAgent.id);
              
              // If agent not in user's list, add it first
              if (!isAgentInUserList) {
                try {
                  console.log("[Mode 1 Helper] Adding agent "${selectedAgent.name}" to user's list...`);
                  await addAgentToUserList(selectedAgent.id);
                  
                  // Refresh agents list to get the newly added agent
                  // This will update the agents state in context, which will trigger sidebar re-render
                  console.log("[Mode 1 Helper] Refreshing agents list...`);
                  await refreshAgents();
                  
                  // Wait for React to propagate state updates through context to sidebar
                  // This ensures the sidebar component receives the updated agents list
                  await new Promise(resolve => setTimeout(resolve, 300));
                  
                  console.log("[Mode 1 Helper] Agent "${selectedAgent.name}" added and should be visible in sidebar`);
                } catch (error) {
                  console.error(`[ERROR] [Mode 1 Helper] Failed to add agent to user list:`, error);
                  // Still try to select the agent even if adding failed
                }
              }
              
              // Step 4: Select the agent (this makes it appear in chat and available for LangGraph)
              // Use flushSync to ensure immediate UI update
              flushSync(() => {
                setSelectedAgents([selectedAgent.id]);
              });
              
              // Verify the agent is selected and ready for LangGraph
              console.log("[Mode 1 Helper] Agent "${selectedAgent.name}" is now:`);
              console.log(`   - Added to user's list: ${isAgentInUserList || 'yes (just added)'}`);
              console.log(`   - Selected in context: ${selectedAgents.includes(selectedAgent.id) ? 'yes' : 'checking...'}`);
              console.log(`   - Agent ID: ${selectedAgent.id}`);
              console.log(`   - Ready for LangGraph: YES`);
              console.log(`   - Prompt filled: YES`);
              console.log(`   - Just press Enter to send!`);
            } else {
              console.warn(`[WARN] [Mode 1 Helper] Could not find agent for example: ${example.expert}`);
            }
            
            // Close the helper modal after a brief delay to ensure UI updates are visible
            setTimeout(() => {
              setShowMode1Helper(false);
            }, 200);
          }}
        />

        {/* Mode 2 Helper */}
        <Mode2Helper
          open={showMode2Helper}
          onOpenChange={setShowMode2Helper}
          variant="modal"
          showOnFirstVisit={false}
          autoDismiss={false}
          onExampleClick={(example) => {
            // Fill the prompt
            setInputValue(example.question);
            // Close the helper modal
            setTimeout(() => {
              setShowMode2Helper(false);
            }, 200);
          }}
        />

        {/* Mode 3 Helper */}
        <Mode3Helper
          open={showMode3Helper}
          onOpenChange={setShowMode3Helper}
          variant="modal"
          showOnFirstVisit={false}
          autoDismiss={false}
          onExampleClick={async (example) => {
            // Fill the prompt
            setInputValue(example.question);
            
            // Find and select the matching agent (similar to Mode 1)
            let selectedAgent = null;
            
            if (example.agentId) {
              selectedAgent = agents.find((agent) => agent.id === example.agentId);
            }
            
            if (!selectedAgent && example.agentSearchTerms && Array.isArray(example.agentSearchTerms) && example.agentSearchTerms.length > 0) {
              const allAgents = await getAllAgents();
              const agentsWithScores = allAgents.map((agent) => {
                const name = String(agent.name || '').toLowerCase();
                const displayName = String((agent as any).displayName || (agent as any).display_name || '').toLowerCase();
                const description = String(agent.description || '').toLowerCase();
                const specialty = String((agent as any).specialty || '').toLowerCase();
                const searchText = `${name} ${displayName} ${description} ${specialty}`;
                
                const matchCount = (example.agentSearchTerms || []).filter((term) =>
                  searchText.includes(term.toLowerCase())
                ).length;
                
                return { agent, score: matchCount };
              });
              
              const bestMatch = agentsWithScores
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score)[0];
              
              if (bestMatch) {
                selectedAgent = bestMatch.agent;
              }
            }
            
            if (!selectedAgent) {
              const normalizedExpert = example.expert.toLowerCase().replace(/\s*expert\s*$/i, '').trim();
              const allAgents = await getAllAgents();
              selectedAgent = allAgents.find((agent) => {
                const name = String(agent.name || '').toLowerCase();
                const displayName = String((agent as any).displayName || (agent as any).display_name || '').toLowerCase();
                const description = String(agent.description || '').toLowerCase();
                
                return (
                  name.includes(normalizedExpert) ||
                  displayName.includes(normalizedExpert) ||
                  description.includes(normalizedExpert)
                );
              });
            }
            
            if (selectedAgent) {
              const isAgentInUserList = agents.some((a) => a.id === selectedAgent.id);
              
              if (!isAgentInUserList) {
                try {
                  await addAgentToUserList(selectedAgent.id);
                  await refreshAgents();
                  await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                  console.error(`[ERROR] [Mode 3 Helper] Failed to add agent to user list:`, error);
                }
              }
              
              flushSync(() => {
                setSelectedAgents([selectedAgent.id]);
              });
            }
            
            setTimeout(() => {
              setShowMode3Helper(false);
            }, 200);
          }}
        />

        {/* Mode 4 Helper */}
        <Mode4Helper
          open={showMode4Helper}
          onOpenChange={setShowMode4Helper}
          variant="modal"
          showOnFirstVisit={false}
          autoDismiss={false}
          onExampleClick={(example) => {
            // Fill the prompt
            setInputValue(example.question);
            // Close the helper modal
            setTimeout(() => {
              setShowMode4Helper(false);
            }, 200);
          }}
        />
        
        {/* [OK] NEW: Connection Status (shown when not connected) */}
        {connectionStatus.status !== 'connected' && (
          <div className="fixed bottom-20 right-4 z-50 w-80">
            <ConnectionStatusComponent
              status={connectionStatus.status}
              reconnectAttempts={connectionStatus.reconnectAttempts}
              maxReconnectAttempts={connectionStatus.maxReconnectAttempts}
              error={connectionStatus.error}
              onReconnect={() => {
                connectionStatus.reset();
                // Trigger reconnection by refreshing the page or re-sending request
                window.location.reload();
              }}
              showDetails={true}
            />
          </div>
        )}
        
        {/* [OK] NEW: Tool Confirmation Modal */}
        <ToolConfirmation
          open={toolConfirmation.isOpen}
          tools={toolConfirmation.tools}
          message={toolConfirmation.message}
          reasoning={toolConfirmation.reasoning}
          onApprove={toolConfirmation.handleApprove}
          onDecline={toolConfirmation.handleDecline}
        />
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
