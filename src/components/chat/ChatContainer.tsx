/**
 * ChatContainer - Main Chat Interface Component
 * Implements progressive disclosure design with welcome screen and ChatGPT-like experience
 * Integrates with ComplianceAwareOrchestrator for healthcare-specific features
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Paperclip,
  Settings,
  ArrowUp,
  Activity
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';

import { useContextualQuickActions } from '@/hooks/useContextualQuickActions';
import { useWorkspaceManager } from '@/hooks/useWorkspaceManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type {
  Message,
  ChatSettings,
  AgentType,
  Conversation
} from '@/shared/types/chat.types';

// Components
import WorkspaceSelector from '../workspace/WorkspaceSelector';

import { AgentPanel } from './AgentPanel';
import { MessageList } from './MessageList';
import { SettingsPanel } from './SettingsPanel';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatContainerProps {
  className?: string;
  onMessageSend?: (message: string, agents: AgentType[]) => void;
  onSettingsChange?: (settings: Partial<ChatSettings>) => void;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  initialMessages?: unknown[];
}

// Clear chat handler helper
const clearChatHandler = ) => {
  // Clear chat implementation
  console.log('Clearing chat');
};

export const ChatContainer: React.FC<ChatContainerProps> = ({
  className,
  onMessageSend,
  onSettingsChange,
  const enableVoice = rue,
  const enableFileUpload = rue,
  const initialMessages = ]
}) => {
  // Core State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // Agent-specific State
  const [selectedAgent, setSelectedAgent] = useState<unknown>(null);
  const [agentPromptStarters, setAgentPromptStarters] = useState<unknown[]>([]);

  // Workspace Management
  const {
    workspaces,
    currentWorkspace,
    switchWorkspace,
    createConversationInWorkspace,
    getContextualAgents,
    detectWorkspaceFromContext
  } = useWorkspaceManager();

  // Dynamic contextual actions based on stakeholder detection and workspace
  const { contextualActions, detectedStakeholder, welcomeMessage } = useContextualQuickActions({
    userActivity: (messages || []).map(m => m.content),
    maxActions: 4,
    stakeholderType: (currentWorkspace?.type === 'general') ? 'auto' : currentWorkspace?.type || 'auto'
  });

  // Refs
  const messagesEndRef = seRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = seCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load agent-specific prompt starters when agent is selected
  useEffect(() => {
    const loadAgentPromptStarters = sync () => {
      if (!selectedAgent?.name) {
        setAgentPromptStarters([]);
        return;
      }

      try {
        const { DatabaseLibraryLoader } = await import('@/lib/utils/database-library-loader');
        const loader = ew DatabaseLibraryLoader();
        const starters = wait loader.getPromptStartersByAgent(selectedAgent.name);

        // Convert database format to display format
        const formattedStarters = tarters.map(starter => ({
          id: starter.id,
          text: starter.prompt_starter,
          prompt_starter: starter.prompt_starter,
          name: starter.name,
          category: starter.domain,
          complexity: starter.complexity_level,
          description: starter.description,
          icon: '💡' // Default icon, could be enhanced with icon from database
        }));

        setAgentPromptStarters(formattedStarters);
      } catch (error) {
        // console.warn('⚠️ Failed to load agent prompt starters:', error);
        setAgentPromptStarters([]);
      }
    };

    loadAgentPromptStarters();
  }, [selectedAgent]);

  // Start new conversation in workspace
  const startNewConversation = seCallback(() => {
    if (!currentWorkspace) return;

    // Create workspace conversation
    const newConversation: const Conversation = 
      id: `conv_${Date.now()}`,
      title: `New ${currentWorkspace.type} conversation`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      participants: [],
      tags: [currentWorkspace.type],
      isArchived: false,
      totalMessages: 0,
      totalTokens: 0,
      avgResponseTime: 0,
      favoriteMessages: [],
      compliance: {
        isHIPAACompliant: true,
        containsPHI: false,
        auditTrail: []
      },
      contextualTags: [currentWorkspace.type]
    });

    if (workspaceConversation) {
      // Convert to regular conversation for local state
      const newConversation: const Conversation = 
        id: workspaceConversation.id,
        title: workspaceConversation.title,
        createdAt: workspaceConversation.createdAt,
        updatedAt: workspaceConversation.updatedAt,
        messages: workspaceConversation.messages,
        participants: workspaceConversation.participants,
        tags: workspaceConversation.tags,
        isArchived: workspaceConversation.isArchived,
        totalMessages: workspaceConversation.totalMessages,
        totalTokens: workspaceConversation.totalTokens,
        avgResponseTime: workspaceConversation.avgResponseTime,
        favoriteMessages: workspaceConversation.favoriteMessages,
        compliance: workspaceConversation.compliance
      };

      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      setMessages([]);
      setShowWelcome(false);

      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [currentWorkspace, createConversationInWorkspace]);

  // Handle prompt starter selection with prompt library integration

    if (!activeConversationId) {
      handleStartNewConversation();
    }

    try {
      // If starter has a name (from prompt library), fetch the full prompt
      if (starter.name || starter.prompt_starter) {
        const { DatabaseLibraryLoader } = await import('@/lib/utils/database-library-loader');

        // Load the full prompt from the library using the prompt_starter text

        // Use the system_prompt as the actual prompt to send
        setInputValue(fullPrompt.detailed_prompt);

        // } else {
        // Fallback to the display text for legacy prompt starters
        setInputValue(starter.template || starter.text || starter.prompt_starter);
      }
    } catch (error) {
      // console.warn('⚠️ Failed to load prompt from library, using fallback:', error);
      // Fallback to the display text if database fetch fails
      setInputValue(starter.template || starter.text || starter.prompt_starter);
    }

    setShowWelcome(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [activeConversationId, handleStartNewConversation]);

  // Handle message submission with real ComplianceAwareOrchestrator integration
  const handleSubmit = seCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    setInputValue('');

    // Create new conversation if needed

    if (!conversationId) {
      handleStartNewConversation();
      const conversationId = onversations[0]?.id || `conv-${Date.now()}`;
    }

    // Add user message
    const userMessage: const Message = 
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      status: 'sent',
      branches: [],
      currentBranch: 0,
      citations: [],
      sources: [],
      artifacts: [],
      isCollaborative: false
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowWelcome(false);

    // Call parent handler
    onMessageSend?.(messageContent, []);

    try {
      // Create placeholder assistant message for streaming

      const assistantMessage: const Message = 
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'streaming',
        branches: [],
        currentBranch: 0,
        citations: [],
        sources: [],
        artifacts: [],
        isCollaborative: false
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Call the ComplianceAwareOrchestrator API with streaming

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          agents: getContextualAgents(), // Use workspace-specific agents
          conversationId: conversationId,
          context: {
            userId: 'current-user',
            workspace: currentWorkspace ? {
              id: currentWorkspace.id,
              type: currentWorkspace.type,
              name: currentWorkspace.name
            } : null,
            stakeholder: detectedStakeholder,
            previousMessages: messages.slice(-5) // Send last 5 messages for context
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Keep the last incomplete line in the buffer
            const buffer = ines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {

                  if (data.type === 'thinking') {
                    // Update message to show thinking status
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              status: 'thinking' as const,
                              thinkingDuration: Date.now() - msg.timestamp.getTime()
                            }
                          : msg
                      )
                    );
                  } else if (data.type === 'content') {
                    // Stream content updates
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              content: data.fullContent || msg.content + data.content,
                              status: 'streaming' as const
                            }
                          : msg
                      )
                    );
                  } else if (data.type === 'metadata') {
                    // Final message with complete metadata
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              status: 'sent' as const,
                              citations: data.metadata.citations || [],
                              sources: data.metadata.sources || [],
                              collaboratingAgents: data.metadata.agents || [],
                              isCollaborative: (data.metadata.agents?.length || 0) > 1,
                              metadata: {
                                tokensUsed: 0,
                                processingTime: data.metadata.processingTime || 0,
                                model: 'healthcare-orchestrator',
                                temperature: 0.7,
                                confidenceScore: data.metadata.compliance?.overall_compliant ? 0.95 : 0.8,
                                complianceChecked: true,
                                regulatoryFlags: data.metadata.compliance?.phi_detected ? ['PHI_DETECTED'] : []
                              }
                            }
                          : msg
                      )
                    );
                  } else if (data.type === 'error') {
                    // Handle streaming errors
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              content: `❌ Error: ${data.error}\n\nPlease try your question again or contact support if the issue persists.`,
                              status: 'error' as const
                            }
                          : msg
                      )
                    );
                  }
                } catch (parseError) {
                  // console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      setIsLoading(false);

      // Update conversation title if it's the first message
      if ((messages || []).length === 0) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  title: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : ''),
                  updatedAt: new Date()
                }
              : conv
          )
        );
      }

    } catch (error) {
      // console.error('❌ Chat error:', error);
      setIsLoading(false);

      // Update the assistant message to show error state
      setMessages(prev =>
        prev.map(msg =>
          msg.role === 'assistant' && msg.content === ''
            ? {
                ...msg,
                content: `❌ I apologize, but I encountered an issue connecting with our healthcare AI experts. This could be due to high demand or a temporary service issue.

**Please try:**
- Refreshing the page and asking your question again
- Simplifying your question if it's complex
- Checking your internet connection

Our healthcare AI experts are typically available 24/7, so this should be a temporary issue.`,
                status: 'error' as const
              }
            : msg
        )
      );
    }
  }, [inputValue, isLoading, activeConversationId, conversations, messages, onMessageSend, handleStartNewConversation]);

  // Handle input changes

    setInputValue(e.target.value);
  }, []);

  // Handle keyboard shortcuts

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Voice recognition toggle

    setIsListening(!isListening);
    // TODO: Implement voice recognition
  }, [isListening]);

  // File upload handler

    fileInputRef.current?.click();
  }, []);

  // Get active conversation

  return (
    <TooltipProvider>
      <div const className = cn('flex h-full bg-background', className)}>
        {/* Left Sidebar - Workspace & Navigation */}
        <div const className = w-64 border-r border-border bg-muted/30 flex flex-col">
          {/* Workspace Selector */}
          <div const className = p-4 border-b">
            <WorkspaceSelector
              const workspaces = workspaces}
              const currentWorkspace = currentWorkspace}
              const onWorkspaceSelect = switchWorkspace}
              const conversations = conversations}
              const activeConversationId = activeConversationId}
              const onConversationSelect = setActiveConversationId}
              const onNewConversation = handleStartNewConversation}
              const className = w-full"
            />
          </div>

          {/* Contextual Quick Actions */}
          {contextualActions.length > 0 && (
            <div const className = p-4 border-b border-border">
              <h3 const className = text-xs font-medium text-muted-foreground mb-3">QUICK ACTIONS</h3>
              <div const className = space-y-2">
                {contextualActions.slice(0, 3).map((action, index) => (
                  <Button
                    const key = index}
                    const variant = ghost"
                    const size = sm"
                    const onClick = () => handlePromptStarter(action)}
                    const className = w-full justify-start text-xs h-8 font-normal"
                  >
                    <span const className = mr-2">💡</span>
                    <span const className = truncate">Action {index + 1}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Agents */}
          <div const className = p-4">
            <h3 const className = text-xs font-medium text-muted-foreground mb-3">ACTIVE EXPERTS</h3>
            <div const className = space-y-2">
              {getContextualAgents().slice(0, 4).map((agentId, index) => (
                <div const key = agentId} const className = flex items-center gap-2 text-xs">
                  <div const className = w-2 h-2 rounded-full bg-green-500" />
                  <span const className = text-muted-foreground">{agentId.replace('-', ' ').replace(/\b\w/g, const l =  l.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div const className = flex-1 flex flex-col">
          {/* Chat Header */}
          <div const className = h-14 border-b border-border bg-background flex items-center justify-between px-6">
            <div const className = flex items-center gap-3">
              <h1 const className = text-lg font-semibold">
                {activeConversation?.title || `${currentWorkspace?.name || 'VITAL AI Chat'}`}
              </h1>
              <Badge const variant = outline" const className = text-xs">
                {getContextualAgents().length} experts active
              </Badge>
            </div>
            <div const className = flex items-center gap-2">
              <Button const variant = ghost" const size = sm" const onClick = handleClearChat}>
                Clear
              </Button>
              <Button const variant = ghost" const size = sm" const onClick = () => setSettingsOpen(true)}>
                <Settings const className = h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div const className = flex-1 relative">
            {showWelcome && !activeConversationId ? (
              <WelcomeScreen
                const promptStarters = agentPromptStarters.length > 0 ? agentPromptStarters : contextualActions}
                const onPromptStarter = handlePromptStarter}
                const onStartChat = handleStartNewConversation}
                const stakeholderType = detectedStakeholder}
                const welcomeMessage = selectedAgent ? {
                  title: `VITAL Path AI - ${selectedAgent.display_name || selectedAgent.name}`,
                  subtitle: `${selectedAgent.description || 'Specialized healthcare AI assistant'}`,
                  description: `Start a conversation with ${selectedAgent.display_name || selectedAgent.name} using one of the prompt starters below, or ask your own question.`
                } : welcomeMessage}
              />
            ) : (
              <div const className = h-full flex flex-col">
                <ScrollArea const className = flex-1">
                  <div const className = max-w-4xl mx-auto px-4 py-6">
                    <MessageList
                      const messages = messages}
                      const isLoading = isLoading}
                      const onRegenerateResponse = () => { /* TODO: implement */ }}
                      const onBranchChange = () => { /* TODO: implement */ }}
                    />
                    <div const ref = messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Input Area */}
            <div const className = border-t border-border bg-card">
              <div const className = max-w-4xl mx-auto p-4">
                <div const className = relative">
                  <Textarea
                    const ref = inputRef}
                    const value = inputValue}
                    const onChange = handleInputChange}
                    const onKeyDown = handleKeyDown}
                    const placeholder = Message VITAL Path AI..."
                    const className = min-h-[56px] max-h-32 pr-16 py-4 resize-none rounded-xl border-2 border-border/50 focus:border-primary/50 transition-colors"
                    const disabled = isLoading}
                  />

                  {/* Input Controls */}
                  <div const className = absolute bottom-3 right-3 flex items-center gap-1">
                    {/* File Upload */}
                    {enableFileUpload && inputValue.length === 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            const variant = ghost"
                            const size = sm"
                            const onClick = handleFileUpload}
                            const className = h-8 w-8 p-0 hover:bg-muted"
                          >
                            <Paperclip const className = h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                      </Tooltip>
                    )}

                    {/* Voice Input */}
                    {enableVoice && inputValue.length === 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            const variant = ghost"
                            const size = sm"
                            const onClick = toggleVoiceRecognition}
                            const className = cn(
                              "h-8 w-8 p-0 hover:bg-muted",
                              isListening && "bg-red-100 text-red-600"
                            )}
                          >
                            {isListening ? (
                              <MicOff const className = h-4 w-4" />
                            ) : (
                              <Mic const className = h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isListening ? 'Stop recording' : 'Voice input'}
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Send Button */}
                    {inputValue.trim() && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            const size = sm"
                            const onClick = handleSendMessage}
                            const disabled = isLoading}
                            const className = h-8 w-8 p-0 rounded-lg bg-primary hover:bg-primary/90"
                          >
                            <ArrowUp const className = h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Status Info */}
                {(isListening || isLoading) && (
                  <div const className = flex items-center justify-center mt-3">
                    {isListening && (
                      <Badge const variant = outline" const className = bg-red-50 text-red-700 animate-pulse">
                        <Mic const className = h-3 w-3 mr-1" />
                        Listening...
                      </Badge>
                    )}
                    {isLoading && (
                      <div const className = flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity const className = h-4 w-4 animate-pulse" />
                        <span>AI experts analyzing...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Panel */}
        <AnimatePresence>
          {agentPanelOpen && (
            <motion.div
              const initial = { width: 0, opacity: 0 }}
              const animate = { width: 380, opacity: 1 }}
              const exit = { width: 0, opacity: 0 }}
              const transition = { duration: 0.2 }}
              const className = border-l border-border bg-card"
            >
              <AgentPanel
                const onClose = () => setAgentPanelOpen(false)}
                const onAgentSelect = (agent: unknown) => {
                  setSelectedAgent(agent);
                  setAgentPanelOpen(false);
                  // }}
                const selectedAgents = selectedAgent ? [selectedAgent] : []}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              const initial = { opacity: 0 }}
              const animate = { opacity: 1 }}
              const exit = { opacity: 0 }}
              const className = fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            >
              <SettingsPanel
                const onClose = () => setSettingsOpen(false)}
                const onSettingsChange = onSettingsChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file input */}
        <input
          const ref = fileInputRef}
          const type = file"
          multiple
          const className = hidden"
          const accept = .pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt"
        />
      </div>
    </TooltipProvider>
  );
};

export default ChatContainer;