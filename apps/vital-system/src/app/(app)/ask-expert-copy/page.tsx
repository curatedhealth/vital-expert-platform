'use client';

/**
 * @fileoverview Ask Expert Copy - Using shadcn AI Chatbot Block
 * @description New chat interface using shadcn AI components while preserving all features
 *
 * Features preserved:
 * - 4 modes (Manual Interactive, Automatic Selection, Autonomous Automatic, Autonomous Manual)
 * - LLM model selection (GPT-4, GPT-3.5, Claude, etc.)
 * - RAG toggle
 * - Tools toggle
 * - Attachments
 * - Real-time streaming responses
 * - Conversation sidebar
 * - Dark/light mode
 * - Token counter
 * - Reasoning display
 * - Sources display
 *
 * @author VITAL AI Platform Team
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Moon,
  Sun,
  Settings2,
  Brain,
  Paperclip,
  Zap,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { type Agent as SidebarAgent } from '@/components/ask-expert-sidebar';
import { AskExpertProvider, useAskExpert } from '@/contexts/ask-expert-context';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/chat-history-context';
import { PromptStarters, type PromptStarter } from '@/components/prompt-starters';
import { ThumbsUpDown } from '@/components/feedback/ThumbsUpDown';
import { useAuth } from '@/lib/auth/supabase-auth-context';

// Import shadcn AI components
import {
  __Conversation as Conversation,
  __ConversationContent as ConversationContent,
  __ConversationScrollButton as ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation';
import {
  __Message as Message,
  __MessageContent as MessageContent,
  __MessageAvatar as MessageAvatar,
} from '@/components/ui/shadcn-io/ai/message';
import {
  __PromptInput as PromptInputForm,
  __PromptInputTextarea as PromptInputTextarea,
  __PromptInputToolbar as PromptInputToolbar,
  __PromptInputSubmit as PromptInputSubmit,
  __PromptInputButton as PromptInputButton,
  __PromptInputTools as PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';
import { Reasoning, ReasoningTrigger, ReasoningContent, ReasoningStep } from '@/components/ai/reasoning';
import { Sources, SourcesTrigger, SourcesContent } from '@/components/ai/sources';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage {
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
}

interface AttachmentInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Source {
  id: string;
  title: string;
  url?: string;
  excerpt?: string;
  similarity?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AskExpertCopyPageContent() {
  // Get agents and selection from context (loaded by layout sidebar)
  const { selectedAgents } = useAskExpert();
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  // Simple toggles (like Claude.ai)
  // Default: Both OFF → Mode 1: Manual Interactive
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [enableRAG, setEnableRAG] = useState(true); // Enable RAG by default
  const [enableTools, setEnableTools] = useState(false); // Tools disabled by default
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Determine current mode based on toggles
  const getCurrentMode = () => {
    if (isAutonomous && isAutomatic) {
      return { id: 3, name: 'Autonomous Automatic', description: 'AI selects agent + autonomous reasoning', color: 'purple' };
    } else if (isAutonomous && !isAutomatic) {
      return { id: 4, name: 'Autonomous Manual', description: 'You select agent + autonomous reasoning', color: 'green' };
    } else if (!isAutonomous && isAutomatic) {
      return { id: 2, name: 'Automatic Selection', description: 'AI selects best agent for you', color: 'blue' };
    } else {
      return { id: 1, name: 'Manual Interactive', description: 'You select agent + interactive chat', color: 'gray' };
    }
  };

  const currentMode = getCurrentMode();

  // Prompt starters
  const [promptStarters, setPromptStarters] = useState<PromptStarter[]>([]);
  const [loadingPromptStarters, setLoadingPromptStarters] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estimate token count
  useEffect(() => {
    const estimated = Math.ceil((inputValue.length + messages.reduce((acc, m) => acc + m.content.length, 0)) / 4);
    setTokenCount(estimated);
  }, [inputValue, messages]);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vital-conversations-copy');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0) {
        setActiveConversationId(parsed[0].id);
        setMessages(parsed[0].messages);
      }
    } else {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations([newConv]);
      setActiveConversationId(newConv.id);
    }
  }, []);

  // Save conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('vital-conversations-copy', JSON.stringify(conversations));
    }
  }, [conversations]);

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

  // Send message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!inputValue.trim() || isLoading) return;

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
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Please select an agent from the sidebar before sending a message. Click on an agent to add it to your chat.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    console.log('✅ [Mode Check] Mode:', mode, 'Agent ID:', agentId, 'Selected Agents:', selectedAgents);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
      attachments: attachments.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setAttachments([]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const response = await fetch('/api/ask-expert/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          agentId: (mode === 'manual' || mode === 'multi-expert') ? agentId : undefined,
          message: currentInput,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          // Optional settings
          enableRAG: enableRAG,
          enableTools: enableTools,
          model: selectedModel,
          temperature: 0.7,
          maxTokens: 2000,
          userId: user?.id,
          // Autonomous mode settings
          maxIterations: (mode === 'autonomous' || mode === 'multi-expert') ? 10 : undefined,
          confidenceThreshold: (mode === 'autonomous' || mode === 'multi-expert') ? 0.95 : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let fullResponse = '';
      let reasoning: string[] = [];
      let sources: Source[] = [];
      let selectedAgent: ChatMessage['selectedAgent'] = undefined;
      let selectionReason: string | undefined = undefined;
      let confidence: number | undefined = undefined;
      let autonomousMetadata: any = {};

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              // Handle different chunk types from all 4 modes
              
              // Mode 1: Simple chunk streaming
              if (data.type === 'chunk' && data.content) {
                fullResponse += data.content;
                setStreamingMessage(fullResponse);
              }
              // Mode 2: Agent selection events
              else if (data.type === 'agent_selection' && (data.agent || data.metadata?.agent)) {
                const agent = data.agent || data.metadata?.agent;
                if (agent) {
                  selectedAgent = {
                    id: agent.id,
                    name: agent.name || agent.display_name || '',
                    display_name: agent.display_name || agent.name || ''
                  };
                  confidence = data.confidence || data.metadata?.confidence;
                  // Also capture selection reason if provided in same event
                  if (data.selectionReason) {
                    selectionReason = data.selectionReason;
                  }
                  console.log('✅ [Mode 2] Agent selected:', selectedAgent.display_name, 'Confidence:', confidence);
                }
              }
              // Mode 2: Selection reason (can come as separate event or with agent_selection)
              else if (data.type === 'selection_reason' || data.selectionReason) {
                selectionReason = data.selectionReason || data.content;
                console.log('✅ [Mode 2] Selection reason:', selectionReason);
              }
              // Mode 3 & 4: Autonomous reasoning events
              else if (data.type === 'goal_understanding') {
                autonomousMetadata.goalUnderstanding = data.content;
                console.log('🎯 [Mode 3/4] Goal understanding:', data.content);
              }
              else if (data.type === 'execution_plan') {
                autonomousMetadata.executionPlan = data.content;
                console.log('📋 [Mode 3/4] Execution plan:', data.content);
              }
              // Mode 3: Agent selection (for autonomous automatic)
              else if (data.type === 'agent_selection' && data.metadata?.agent) {
                selectedAgent = {
                  id: data.metadata.agent.id,
                  name: data.metadata.agent.name || '',
                  display_name: data.metadata.agent.display_name || data.metadata.agent.name || ''
                };
                confidence = data.metadata.confidence;
                console.log('✅ [Mode 3] Agent selected:', selectedAgent.display_name);
              }
              else if (data.type === 'phase_start') {
                autonomousMetadata.currentPhase = data.metadata?.phase || data.content;
                console.log('🚀 [Mode 3/4] Phase start:', autonomousMetadata.currentPhase);
              }
              else if (data.type === 'iteration_start') {
                autonomousMetadata.currentIteration = data.metadata?.iteration;
                autonomousMetadata.currentPhase = 'reasoning';
                console.log(`🔄 [Mode 3/4] Iteration ${data.metadata?.iteration} starting`);
              }
              else if (data.type === 'thought') {
                autonomousMetadata.currentThought = data.content;
                autonomousMetadata.currentPhase = 'reasoning';
                console.log('🧠 [Mode 3/4] Thought:', data.content);
              }
              else if (data.type === 'action') {
                autonomousMetadata.currentAction = data.content;
                autonomousMetadata.currentPhase = 'action';
                console.log('⚡ [Mode 3/4] Action:', data.content);
              }
              else if (data.type === 'observation') {
                autonomousMetadata.currentObservation = data.content;
                autonomousMetadata.currentPhase = 'observation';
                console.log('👁️ [Mode 3/4] Observation:', data.content);
              }
              else if (data.type === 'reflection') {
                autonomousMetadata.currentReflection = data.content;
                autonomousMetadata.currentPhase = 'reflection';
                console.log('🤔 [Mode 3/4] Reflection:', data.content);
              }
              else if (data.type === 'phase_complete') {
                autonomousMetadata.currentPhase = 'completed';
                console.log('✅ [Mode 3/4] Phase complete:', data.metadata?.phase);
              }
              else if (data.type === 'final_answer') {
                fullResponse = data.content || fullResponse;
                setStreamingMessage(fullResponse);
                autonomousMetadata.finalAnswer = data.content;
                autonomousMetadata.finalConfidence = data.metadata?.confidence;
                autonomousMetadata.totalIterations = data.metadata?.iterations;
                console.log('✅ [Mode 3/4] Final answer received, confidence:', data.metadata?.confidence);
              }
              // Sources (from RAG)
              else if (data.type === 'sources' && data.sources) {
                sources = data.sources;
                console.log('📚 Sources found:', sources.length);
              }
              // Completion
              else if (data.type === 'done') {
                reasoning = data.reasoning || [];
                console.log('✅ Execution completed for mode:', mode);
              }
              // Errors
              else if (data.type === 'error') {
                const errorMessage = data.message || data.content || `Unknown error from ${mode}`;
                console.error(`❌ [${mode}] Error:`, errorMessage);
                throw new Error(errorMessage);
              }
              // Fallback: Support old format for backward compatibility
              else if (data.token) {
                fullResponse += data.token;
                setStreamingMessage(fullResponse);
              }
              else if (data.done && !data.type) {
                reasoning = data.reasoning || [];
              }
              else if (data.error) {
                throw new Error(data.error);
              }
              // Log unhandled chunk types for debugging
              else if (data.type) {
                console.log('⚠️ Unhandled chunk type:', data.type, data);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) {
                throw e;
              }
            }
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse || streamingMessage,
        timestamp: Date.now(),
        reasoning,
        sources,
        selectedAgent,
        selectionReason,
        confidence,
        ...(Object.keys(autonomousMetadata).length > 0 && { autonomousMetadata }),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');
      setIsStreaming(false);

      if (activeConversationId) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, userMessage, assistantMessage],
                  title: conv.messages.length === 0 ? currentInput.substring(0, 50) : conv.title,
                  updatedAt: Date.now(),
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy message
  const handleCopy = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  // Get all available models
  const availableModels = [
    { value: 'gpt-4', label: 'GPT-4 Turbo', group: 'OpenAI' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', group: 'OpenAI' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus', group: 'Anthropic' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', group: 'Anthropic' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku', group: 'Anthropic' },
    { value: 'llama-medical', label: 'Llama 3.2 Medical', group: 'Medical AI' },
    { value: 'llama-clinical', label: 'Llama 3.2 Clinical', group: 'Medical AI' },
    { value: 'biogpt', label: 'BioGPT Research', group: 'Medical AI' },
  ];

  return (
    <div className={`flex flex-col h-full w-full ${darkMode ? 'dark bg-gray-950' : 'bg-white'}`}>
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-blue-500" />
          <h1 className="text-sm font-medium text-gray-900 dark:text-white">
            Ask the Experts (New Chat Interface)
          </h1>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentMode.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
            currentMode.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            currentMode.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            Mode {currentMode.id}: {currentMode.name}
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </header>

      {/* Settings Panel */}
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
                  <optgroup label="Anthropic">
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </optgroup>
                  <optgroup label="Medical AI">
                    <option value="llama-medical">Llama 3.2 Medical (3B)</option>
                    <option value="llama-clinical">Llama 3.2 Clinical (1B)</option>
                    <option value="biogpt">BioGPT Research</option>
                  </optgroup>
                </select>
              </div>

              {/* RAG and Tools Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableRAG}
                    onChange={(e) => setEnableRAG(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable RAG</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableTools}
                    onChange={(e) => setEnableTools(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable Tools</span>
                </label>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsAutomatic(false);
                      setIsAutonomous(false);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      currentMode.id === 1
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Mode 1: Manual Interactive
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      You select agent + interactive chat
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setIsAutomatic(true);
                      setIsAutonomous(false);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      currentMode.id === 2
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Mode 2: Automatic Selection
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      AI selects best agent for you
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setIsAutomatic(true);
                      setIsAutonomous(true);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      currentMode.id === 3
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Mode 3: Autonomous Automatic
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      AI selects agent + autonomous reasoning
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setIsAutomatic(false);
                      setIsAutonomous(true);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      currentMode.id === 4
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Mode 4: Autonomous Manual
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      You select agent + autonomous reasoning
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface using shadcn AI components */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <Sparkles className="w-12 h-12 text-blue-500 mb-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-8">
                  Ask anything and get expert answers powered by advanced AI
                </p>

                {selectedAgents.length === 0 && (currentMode.id === 1 || currentMode.id === 4) && (
                  <div className="w-full max-w-md mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Select an Expert
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Choose an expert from the sidebar to get started with {currentMode.name}.
                    </p>
                  </div>
                )}

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
                {messages.map((msg) => (
                  <Message key={msg.id} from={msg.role}>
                    <MessageContent>
                      <div className="space-y-2">
                        <div className="text-sm leading-relaxed">
                          {msg.content}
                        </div>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {msg.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs"
                              >
                                <span className="text-gray-700 dark:text-gray-300">{att.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Selected Agent Info */}
                        {msg.selectedAgent && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Selected Agent:</span>
                              <span className="text-blue-600 dark:text-blue-400">
                                {msg.selectedAgent.display_name || msg.selectedAgent.name}
                              </span>
                              {msg.confidence && (
                                <span className="text-green-600 dark:text-green-400">
                                  ({(msg.confidence * 100).toFixed(1)}% confidence)
                                </span>
                              )}
                            </div>
                            {msg.selectionReason && (
                              <div className="mt-1">{msg.selectionReason}</div>
                            )}
                          </div>
                        )}

                        {/* Autonomous Metadata */}
                        {msg.autonomousMetadata && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span className="font-medium text-purple-700 dark:text-purple-300">
                                Autonomous Reasoning Process
                              </span>
                            </div>
                            {msg.autonomousMetadata.goalUnderstanding && (
                              <div className="mb-2">
                                <span className="font-medium">🎯 Goal:</span>
                                <div className="mt-1">{msg.autonomousMetadata.goalUnderstanding}</div>
                              </div>
                            )}
                            {msg.autonomousMetadata.executionPlan && (
                              <div className="mb-2">
                                <span className="font-medium">📋 Plan:</span>
                                <div className="mt-1">{msg.autonomousMetadata.executionPlan}</div>
                              </div>
                            )}
                            {msg.autonomousMetadata.totalIterations && (
                              <div className="mb-2">
                                <span className="font-medium">🔄 Iterations:</span>
                                <span className="ml-1">
                                  {msg.autonomousMetadata.totalIterations} ReAct cycles completed
                                </span>
                              </div>
                            )}
                            {msg.autonomousMetadata.finalConfidence && (
                              <div className="mb-2">
                                <span className="font-medium">🎯 Final Confidence:</span>
                                <span className="ml-1 text-green-600 dark:text-green-400">
                                  {(msg.autonomousMetadata.finalConfidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reasoning */}
                        {msg.reasoning && msg.reasoning.length > 0 && (
                          <Reasoning isStreaming={false} className="mt-2">
                            <ReasoningTrigger title="Reasoning Steps" />
                            <ReasoningContent>
                              {msg.reasoning.map((step, idx) => (
                                <ReasoningStep key={idx} step={idx + 1}>
                                  {step}
                                </ReasoningStep>
                              ))}
                            </ReasoningContent>
                          </Reasoning>
                        )}

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <Sources sources={msg.sources} className="mt-2">
                            <SourcesTrigger />
                            <SourcesContent />
                          </Sources>
                        )}

                        {/* Message Actions */}
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {copiedId === msg.id ? 'Copied!' : 'Copy'}
                            </button>
                            <ThumbsUpDown
                              messageId={msg.id}
                              queryText={(() => {
                                const msgIndex = messages.findIndex(m => m.id === msg.id);
                                const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
                                return userMsg?.role === 'user' ? userMsg.content : '';
                              })()}
                              responseText={msg.content}
                              onFeedbackSubmitted={(feedback) => {
                                console.log('Feedback submitted:', feedback);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </MessageContent>
                    <MessageAvatar
                      src=""
                      name={msg.role === 'user' ? 'You' : msg.selectedAgent?.display_name || 'Expert'}
                    />
                  </Message>
                ))}

                {/* Streaming Message */}
                {streamingMessage && (
                  <Message from="assistant">
                    <MessageContent>
                      <div className="text-sm leading-relaxed">
                        {streamingMessage}
                        <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse" />
                      </div>
                    </MessageContent>
                    <MessageAvatar
                      src=""
                      name="Expert"
                    />
                  </Message>
                )}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Enhanced Prompt Input using shadcn AI components with all features */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs border border-blue-200 dark:border-blue-800"
                >
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                    {file.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    ({Math.round(file.size / 1024)}KB)
                  </span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Model & Mode Controls Bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="llama-medical">Llama 3.2 Medical</SelectItem>
                <SelectItem value="llama-clinical">Llama 3.2 Clinical</SelectItem>
                <SelectItem value="biogpt">BioGPT Research</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Automatic Toggle */}
            <button
              onClick={() => setIsAutomatic(!isAutomatic)}
              className={`flex items-center gap-1.5 px-2.5 py-1 h-8 text-xs font-medium rounded-md transition-all ${
                isAutomatic
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Zap className="w-3 h-3" />
              Automatic
            </button>

            {/* Autonomous Toggle */}
            <button
              onClick={() => setIsAutonomous(!isAutonomous)}
              className={`flex items-center gap-1.5 px-2.5 py-1 h-8 text-xs font-medium rounded-md transition-all ${
                isAutonomous
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Brain className="w-3 h-3" />
              Autonomous
            </button>

            {/* Token Count */}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {tokenCount > 0 && <span>~{tokenCount} tokens</span>}
            </div>
          </div>

          {/* Main Input Form */}
          <PromptInputForm onSubmit={handleSend} className="rounded-none border-0">
            <PromptInputTextarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="How can I help you today?"
              minHeight={56}
              maxHeight={200}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                {/* File Attachment */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachments(prev => [...prev, ...files]);
                  }}
                  className="hidden"
                />
                <PromptInputButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!inputValue.trim() || isLoading}
                status={isLoading ? 'submitted' : undefined}
              />
            </PromptInputToolbar>
          </PromptInputForm>
        </div>
      </div>
    </div>
  );
}

// Default export
export default function AskExpertCopyPage() {
  return (
    <ChatHistoryProvider>
      <AskExpertCopyPageContent />
    </ChatHistoryProvider>
  );
}

