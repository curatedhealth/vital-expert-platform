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
import { ChatHistoryProvider, useChatHistory } from '@/contexts/chat-history-context';
import { PromptStarters, type PromptStarter } from '@/components/prompt-starters';
import { ThumbsUpDown } from '@/components/feedback/ThumbsUpDown';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { ChatHistorySidebar } from '@/components/chat-history-sidebar';
import { SelectedAgentsList } from '@/components/selected-agent-card';
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ui/shadcn-io/ai/reasoning';
import { 
  __Message as Message, 
  __MessageContent as MessageContent, 
  __MessageAvatar as MessageAvatar 
} from '@/components/ui/shadcn-io/ai/message';
import { CitedResponse } from '@/components/ui/shadcn-io/ai/cited-response';
import { __Response as Response } from '@/components/ui/shadcn-io/ai/response';
import { __Conversation as Conversation, __ConversationContent as ConversationContent } from '@/components/ui/shadcn-io/ai/conversation';
import { AgentAvatar } from '@/components/ui/agent-avatar';

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
  const { selectedAgents, agents, setSelectedAgents } = useAskExpert();
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
    
    // Show reasoning component immediately when starting a request
    setStreamingReasoning('Thinking...');
    setIsStreamingReasoning(true);
    setIsLoading(true);
    
    // Reset streaming message
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
      let sources: Source[] = [];
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
                // Skip error messages that start with "Error:"
                if (data.content.startsWith('Error:')) {
                  // Extract error message for display
                  const errorMessage = data.content.replace(/^Error:\s*/, '');
                  setStreamingReasoning(prev => `❌ Error: ${errorMessage}`);
                  setIsStreamingReasoning(true);
                  // Still accumulate for final error message
                  fullResponse += data.content;
                } else {
                  fullResponse += data.content;
                  setStreamingMessage(fullResponse);
                  // Update reasoning to show we're processing
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
              } else if (data.type === 'error') {
                // Handle structured error events from backend
                const errorCode = data.code || 'UNKNOWN_ERROR';
                const errorMessage = data.message || data.content || `Unknown error from ${mode}`;
                console.error(`[${mode}] Error (${errorCode}):`, errorMessage);
                console.error(`[${mode}] Full error data:`, data);
                
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
                } else if (errorCode === 'NETWORK_ERROR') {
                  userFriendlyMessage = 'Network connection issue. Please check your internet connection and try again.';
                } else if (errorCode === 'DATABASE_CONNECTION_ERROR') {
                  userFriendlyMessage = 'Database service is temporarily unavailable. Please try again in a moment.';
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
        reasoning,
        sources,
        selectedAgent,
        selectionReason,
        confidence,
        // Add autonomous metadata for Mode 3 & Mode 4
        ...(Object.keys(autonomousMetadata).length > 0 && { autonomousMetadata }),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');
      setStreamingReasoning('');
      setIsStreamingReasoning(false);

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
          {/* Current Mode Badge */}
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
            {/* Selected Agents Display */}
            {selectedAgents.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Selected Expert{selectedAgents.length > 1 ? 's' : ''}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedAgents.length} selected
                  </span>
                </div>
                <SelectedAgentsList
                  agents={agents.filter((agent) => selectedAgents.includes(agent.id))}
                  selectedAgentIds={selectedAgents}
                  onAgentClick={(agentId) => {
                    // Toggle selection on click
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
                {messages.map(msg => {
                  // Get agent info for assistant messages
                  const agentInfo = msg.role === 'assistant' && msg.selectedAgent 
                    ? agents.find(a => a.id === msg.selectedAgent?.id)
                    : null;

                  // Get avatar URL
                  const avatarUrl = msg.role === 'user' 
                    ? undefined 
                    : agentInfo?.avatar 
                      ? `/icons/png/avatars/${agentInfo.avatar}.png`
                      : undefined;

                  return (
                    <Message key={msg.id} from={msg.role}>
                      <MessageAvatar
                        src={avatarUrl || (msg.role === 'user' ? undefined : '/icons/png/avatars/avatar_0001.png')}
                        name={msg.role === 'user' ? 'You' : (agentInfo?.display_name || agentInfo?.name || 'Expert')}
                      />
                      <MessageContent>
                        {/* Show selected agent info for Mode 2 & Mode 3 */}
                        {msg.selectedAgent && (
                          <div className="mb-3 text-xs text-muted-foreground p-2 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Bot className="w-3 h-3" />
                              <span className="font-medium">Selected Agent:</span>
                              <span className="text-primary">
                                {msg.selectedAgent.display_name || msg.selectedAgent.name}
                              </span>
                              {msg.confidence && (
                                <span className="text-green-600 dark:text-green-400">
                                  ({(msg.confidence * 100).toFixed(1)}% confidence)
                                </span>
                              )}
                            </div>
                            {msg.selectionReason && (
                              <div className="mt-1">
                                {msg.selectionReason}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Response content with markdown support and inline citations */}
                        {msg.sources && msg.sources.length > 0 ? (
                          <CitedResponse 
                            content={msg.content} 
                            sources={msg.sources}
                          />
                        ) : (
                          <Response>
                            {msg.content}
                          </Response>
                        )}

                        {/* Reasoning Component - Show LangGraph reasoning steps */}
                        {(msg.reasoning && msg.reasoning.length > 0) || (msg.autonomousMetadata && Object.keys(msg.autonomousMetadata).length > 0) ? (
                          <div className="mt-3">
                            <Reasoning isStreaming={false} defaultOpen={false}>
                              <ReasoningTrigger title="Thinking Process" />
                              <ReasoningContent>
                                {/* Show reasoning steps from reasoning array */}
                                {msg.reasoning && msg.reasoning.length > 0 && (
                                  <div className="space-y-2 mb-4">
                                    {msg.reasoning.map((step, idx) => (
                                      <div key={idx} className="text-xs text-muted-foreground pb-2 border-b border-border/50 last:border-0">
                                        <span className="font-semibold">Step {idx + 1}:</span> {step}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Show autonomous metadata reasoning steps (Mode 3 & Mode 4) */}
                                {msg.autonomousMetadata && (
                                  <div className="space-y-3">
                                    {msg.autonomousMetadata.goalUnderstanding && (
                                      <div>
                                        <div className="font-semibold text-sm mb-1 flex items-center gap-1">
                                          🎯 Goal Understanding
                                        </div>
                                        <div className="text-xs text-muted-foreground pl-4">
                                          {msg.autonomousMetadata.goalUnderstanding}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {msg.autonomousMetadata.executionPlan && (
                                      <div>
                                        <div className="font-semibold text-sm mb-1 flex items-center gap-1">
                                          📋 Execution Plan
                                        </div>
                                        <div className="text-xs text-muted-foreground pl-4">
                                          {msg.autonomousMetadata.executionPlan}
                                        </div>
                                      </div>
                                    )}

                                    {/* ReAct Loop Steps */}
                                    {(msg.autonomousMetadata.currentThought || 
                                      msg.autonomousMetadata.currentAction || 
                                      msg.autonomousMetadata.currentObservation ||
                                      msg.autonomousMetadata.currentReflection) && (
                                      <div>
                                        <div className="font-semibold text-sm mb-2 flex items-center gap-1">
                                          🔄 ReAct Reasoning Loop
                                        </div>
                                        <div className="space-y-2 pl-4">
                                          {msg.autonomousMetadata.currentIteration && (
                                            <div className="text-xs">
                                              <span className="font-medium">Iteration {msg.autonomousMetadata.currentIteration}</span>
                                            </div>
                                          )}
                                          {msg.autonomousMetadata.currentThought && (
                                            <div className="text-xs text-muted-foreground">
                                              <span className="font-medium text-purple-500">🧠 Thought:</span> {msg.autonomousMetadata.currentThought}
                                            </div>
                                          )}
                                          {msg.autonomousMetadata.currentAction && (
                                            <div className="text-xs text-muted-foreground">
                                              <span className="font-medium text-blue-500">⚡ Action:</span> {msg.autonomousMetadata.currentAction}
                                            </div>
                                          )}
                                          {msg.autonomousMetadata.currentObservation && (
                                            <div className="text-xs text-muted-foreground">
                                              <span className="font-medium text-green-500">👁️ Observation:</span> {msg.autonomousMetadata.currentObservation}
                                            </div>
                                          )}
                                          {msg.autonomousMetadata.currentReflection && (
                                            <div className="text-xs text-muted-foreground">
                                              <span className="font-medium text-orange-500">🤔 Reflection:</span> {msg.autonomousMetadata.currentReflection}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {msg.autonomousMetadata.totalIterations && (
                                      <div className="text-xs">
                                        <span className="font-semibold">Total Iterations:</span> {msg.autonomousMetadata.totalIterations} ReAct cycles
                                      </div>
                                    )}
                                    
                                    {msg.autonomousMetadata.finalConfidence && (
                                      <div className="text-xs">
                                        <span className="font-semibold">Final Confidence:</span>{' '}
                                        <span className="text-green-600 dark:text-green-400">
                                          {(msg.autonomousMetadata.finalConfidence * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </ReasoningContent>
                            </Reasoning>
                          </div>
                        ) : null}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.attachments.map(att => (
                              <div
                                key={att.id}
                                className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-md text-xs"
                              >
                                {att.type.startsWith('image/') ? (
                                  <ImageIcon className="w-3 h-3 text-primary" />
                                ) : (
                                  <FileText className="w-3 h-3 text-primary" />
                                )}
                                <span>{att.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        {msg.role === 'assistant' && (
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="p-1.5 hover:bg-muted rounded transition-colors"
                              aria-label="Copy message"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
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
                      </MessageContent>
                    </Message>
                  );
                })}

                {/* Show reasoning and streaming response as soon as loading starts */}
                {(isLoading || streamingMessage || isStreamingReasoning) && (
                  <Message from="assistant">
                    <MessageAvatar
                      src={selectedAgents.length > 0 && agents.find(a => selectedAgents.includes(a.id))
                        ? `/icons/png/avatars/${agents.find(a => selectedAgents.includes(a.id))?.avatar || 'avatar_0001'}.png`
                        : '/icons/png/avatars/avatar_0001.png'}
                      name="Expert"
                    />
                    <MessageContent>
                      {/* Reasoning during streaming - Show immediately when loading starts */}
                      {(isLoading || isStreamingReasoning) && (
                        <div className="mb-3">
                          <Reasoning isStreaming={isLoading} defaultOpen={true}>
                            <ReasoningTrigger title="Thinking..." />
                            <ReasoningContent>
                              <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                                {streamingReasoning || 'Processing your request...'}
                              </div>
                            </ReasoningContent>
                          </Reasoning>
                        </div>
                      )}
                      
                      {/* Streaming response - Show when we have content */}
                      {streamingMessage && (
                        <div className="inline-flex items-baseline gap-1">
                          <Response>
                            {streamingMessage}
                          </Response>
                          {isLoading && (
                            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse" />
                          )}
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </ConversationContent>
        </Conversation>

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
  return (
    <ChatHistoryProvider>
      <AskExpertPageContent />
    </ChatHistoryProvider>
  );
}

