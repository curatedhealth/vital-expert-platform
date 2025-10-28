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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Image as ImageIcon,
  Zap,
  Settings2,
} from 'lucide-react';
import { PromptInput } from '@/components/prompt-input';
import { type Agent as SidebarAgent } from '@/components/ask-expert-sidebar';
import { AskExpertProvider, useAskExpert } from '@/contexts/ask-expert-context';
import { PromptStarters, type PromptStarter } from '@/components/prompt-starters';
import { ThumbsUpDown } from '@/components/feedback/ThumbsUpDown';
import { useAuth } from '@/lib/auth/supabase-auth-context';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: AttachmentInfo[];
  reasoning?: string[];
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

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AskExpertPageContent() {
  // Get agents and selection from context (loaded by layout sidebar)
  const { selectedAgents } = useAskExpert();
  const { user } = useAuth();

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vital-conversations');
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
      localStorage.setItem('vital-conversations', JSON.stringify(conversations));
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

  // File upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSend = async () => {
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

    const userMessage: Message = {
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
    setInputValue('');
    setAttachments([]);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const response = await fetch('/api/ask-expert/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          agentId: (mode === 'manual' || mode === 'multi-expert') ? agentId : undefined, // For manual and multi-expert modes
          message: inputValue,
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
          userId: user?.id, // For Mode 2 and Mode 3 agent selection
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
      let selectedAgent: Message['selectedAgent'] = undefined;
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

              // Handle different chunk types based on mode
              if (data.type === 'chunk' && data.content) {
                // Mode 1: Simple chunk
                fullResponse += data.content;
                setStreamingMessage(fullResponse);
              } else if (data.type === 'agent_selection' && data.agent) {
                // Mode 2 & Mode 3: Agent selection info
                selectedAgent = {
                  id: data.agent.id,
                  name: data.agent.name,
                  display_name: data.agent.display_name || data.agent.name
                };
                confidence = data.confidence;
              } else if (data.type === 'selection_reason' && data.selectionReason) {
                // Mode 2 & Mode 3: Selection reason
                selectionReason = data.selectionReason;
              } else if (data.type === 'goal_understanding') {
                // Mode 3 & Mode 4: Goal understanding
                autonomousMetadata.goalUnderstanding = data.content;
                console.log('🎯 Goal Understanding:', data.content);
              } else if (data.type === 'execution_plan') {
                // Mode 3 & Mode 4: Execution plan
                autonomousMetadata.executionPlan = data.content;
                console.log('📋 Execution Plan:', data.content);
              } else if (data.type === 'iteration_start') {
                // Mode 3 & Mode 4: ReAct iteration start
                autonomousMetadata.currentIteration = data.metadata?.iteration;
                console.log(`🔄 Iteration ${data.metadata?.iteration}: Starting`);
              } else if (data.type === 'thought') {
                // Mode 3 & Mode 4: ReAct thought
                autonomousMetadata.currentThought = data.content;
                console.log('🧠 Thought:', data.content);
              } else if (data.type === 'action') {
                // Mode 3 & Mode 4: ReAct action
                autonomousMetadata.currentAction = data.content;
                console.log('⚡ Action:', data.content);
              } else if (data.type === 'observation') {
                // Mode 3 & Mode 4: ReAct observation
                autonomousMetadata.currentObservation = data.content;
                console.log('👁️ Observation:', data.content);
              } else if (data.type === 'reflection') {
                // Mode 3 & Mode 4: ReAct reflection
                autonomousMetadata.currentReflection = data.content;
                console.log('🤔 Reflection:', data.content);
              } else if (data.type === 'final_answer') {
                // Mode 3 & Mode 4: Final answer
                fullResponse = data.content;
                setStreamingMessage(fullResponse);
                autonomousMetadata.finalAnswer = data.content;
                autonomousMetadata.finalConfidence = data.metadata?.confidence;
                autonomousMetadata.totalIterations = data.metadata?.iterations;
                console.log('✅ Final Answer:', data.content);
              } else if (data.type === 'done') {
                reasoning = data.reasoning || [];
                console.log('✅ Execution completed');
              } else if (data.type === 'error') {
                console.error(`[${mode}] Error:`, data.message);
                throw new Error(data.message || `Unknown error from ${mode}`);
              }
              // Fallback: Support old format for backward compatibility
              else if (data.token) {
                fullResponse += data.token;
                setStreamingMessage(fullResponse);
              } else if (data.done && !data.type) {
                reasoning = data.reasoning || [];
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
        reasoning,
        selectedAgent,
        selectionReason,
        confidence,
        // Add autonomous metadata for Mode 3 & Mode 4
        ...(Object.keys(autonomousMetadata).length > 0 && { autonomousMetadata }),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');

      if (activeConversationId) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, userMessage, assistantMessage],
                  title: conv.messages.length === 0 ? inputValue.substring(0, 50) : conv.title,
                  updatedAt: Date.now(),
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
      {/* Top Bar - Clean like Claude */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-blue-500" />
          <h1 className="text-sm font-medium text-gray-900 dark:text-white">
            Ask the Experts
          </h1>
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

                {/* Mode Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Automatic Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Automatic
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        AI selects best agent
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAutomatic(!isAutomatic)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        isAutomatic ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: isAutomatic ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>

                  {/* Autonomous Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Autonomous
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        ReAct + Chain-of-Thought reasoning
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAutonomous(!isAutonomous)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        isAutonomous ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: isAutonomous ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>
                </div>

                {/* RAG and Tools Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  {/* RAG Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Knowledge Base
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Use RAG context
                      </div>
                    </div>
                    <button
                      onClick={() => setEnableRAG(!enableRAG)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        enableRAG ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: enableRAG ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>

                  {/* Tools Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Tools
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Enable tool usage
                      </div>
                    </div>
                    <button
                      onClick={() => setEnableTools(!enableTools)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        enableTools ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: enableTools ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
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
                {selectedAgents.length === 0 && !isAutomatic && (
                  <div className="w-full max-w-md mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Select an Expert
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Choose an expert from the sidebar to get started with Mode 1 (Manual Interactive) or Mode 4 (Autonomous Manual).
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
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : 'bg-blue-500'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {msg.role === 'user' ? 'You' : 'Expert'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Show selected agent info for Mode 2 & Mode 3 */}
                      {msg.selectedAgent && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Bot className="w-3 h-3" />
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
                            <div className="mt-1 text-gray-600 dark:text-gray-300">
                              {msg.selectionReason}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show autonomous metadata for Mode 3 & Mode 4 */}
                      {msg.autonomousMetadata && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span className="font-medium text-purple-700 dark:text-purple-300">
                              Autonomous Reasoning Process
                            </span>
                          </div>
                          
                          {msg.autonomousMetadata.goalUnderstanding && (
                            <div className="mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">🎯 Goal:</span>
                              <div className="mt-1 text-gray-600 dark:text-gray-300">
                                {msg.autonomousMetadata.goalUnderstanding}
                              </div>
                            </div>
                          )}
                          
                          {msg.autonomousMetadata.executionPlan && (
                            <div className="mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">📋 Plan:</span>
                              <div className="mt-1 text-gray-600 dark:text-gray-300">
                                {msg.autonomousMetadata.executionPlan}
                              </div>
                            </div>
                          )}
                          
                          {msg.autonomousMetadata.totalIterations && (
                            <div className="mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">🔄 Iterations:</span>
                              <span className="ml-1 text-gray-600 dark:text-gray-300">
                                {msg.autonomousMetadata.totalIterations} ReAct cycles completed
                              </span>
                            </div>
                          )}
                          
                          {msg.autonomousMetadata.finalConfidence && (
                            <div className="mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">🎯 Final Confidence:</span>
                              <span className="ml-1 text-green-600 dark:text-green-400">
                                {(msg.autonomousMetadata.finalConfidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {msg.attachments.map(att => (
                            <div
                              key={att.id}
                              className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs"
                            >
                              {att.type.startsWith('image/') ? (
                                <ImageIcon className="w-3 h-3 text-blue-500" />
                              ) : (
                                <FileText className="w-3 h-3 text-blue-500" />
                              )}
                              <span className="text-gray-700 dark:text-gray-300">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 pt-1">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </button>
                          <ThumbsUpDown
                            messageId={msg.id}
                            queryText={(() => {
                              // Find the previous user message
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
                  </motion.div>
                ))}

                {streamingMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Expert
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        {streamingMessage}
                        <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Prompt Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <PromptInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSend}
            isLoading={isLoading}
            placeholder="How can I help you today?"
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isAutomatic={isAutomatic}
            onAutomaticChange={setIsAutomatic}
            isAutonomous={isAutonomous}
            onAutonomousChange={setIsAutonomous}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            tokenCount={tokenCount}
          />
        </div>
    </div>
  );
}

// Default export - no provider needed (provided by layout sidebar)
export default function AskExpertPage() {
  return <AskExpertPageContent />;
}
