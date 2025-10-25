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
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
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

  // Clear chat implementation
};

export const ChatContainer: React.FC<ChatContainerProps> = ({
  className,
  onMessageSend,
  onSettingsChange,
  enableVoice = true,
  enableFileUpload = true,
  initialMessages = []
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
    userActivity: messages.map(m => m.content),
    maxActions: 4,
    stakeholderType: (currentWorkspace?.type === 'general') ? 'auto' : currentWorkspace?.type || 'auto'
  });

  // Refs

  // Auto-scroll to bottom

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load agent-specific prompt starters when agent is selected
  useEffect(() => {

      if (!selectedAgent?.name) {
        setAgentPromptStarters([]);
        return;
      }

      try {
        const { DatabaseLibraryLoader } = await import('@/shared/services/utils/database-library-loader');

        // Convert database format to display format

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
        // } catch (error) {
        // console.warn('⚠️ Failed to load agent prompt starters:', error);
        setAgentPromptStarters([]);
      }
    };

    loadAgentPromptStarters();
  }, [selectedAgent]);

  // Start new conversation in workspace

    if (!currentWorkspace) return;

    // Create workspace conversation

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
      const newConversation: Conversation = {
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
        const { DatabaseLibraryLoader } = await import('@/shared/services/utils/database-library-loader');

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

    if (!inputValue.trim() || isLoading) return;

    setInputValue('');

    // Create new conversation if needed

    if (!conversationId) {
      handleStartNewConversation();
      conversationId = conversations[0]?.id || `conv-${Date.now()}`;
    }

    // Add user message
    const userMessage: Message = {
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

      const assistantMessage: Message = {
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
            buffer = lines.pop() || '';

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
      if (messages.length === 0) {
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
      <div className={cn('flex h-full bg-background', className)}>
        {/* Left Sidebar - Workspace & Navigation */}
        <div className="w-64 border-r border-border bg-muted/30 flex flex-col">
          {/* Workspace Selector */}
          <div className="p-4 border-b">
            <WorkspaceSelector
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
              onWorkspaceSelect={switchWorkspace}
              conversations={conversations}
              activeConversationId={activeConversationId}
              onConversationSelect={setActiveConversationId}
              onNewConversation={handleStartNewConversation}
              className="w-full"
            />
          </div>

          {/* Contextual Quick Actions */}
          {contextualActions.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">QUICK ACTIONS</h3>
              <div className="space-y-2">
                {contextualActions.slice(0, 3).map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePromptStarter(action)}
                    className="w-full justify-start text-xs h-8 font-normal"
                  >
                    <span className="mr-2">💡</span>
                    <span className="truncate">Action {index + 1}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Agents */}
          <div className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">ACTIVE EXPERTS</h3>
            <div className="space-y-2">
              {getContextualAgents().slice(0, 4).map((agentId, index) => (
                <div key={agentId} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">{agentId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">
                {activeConversation?.title || `${currentWorkspace?.name || 'VITAL AI Chat'}`}
              </h1>
              <Badge variant="outline" className="text-xs">
                {getContextualAgents().length} experts active
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClearChat}>
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 relative">
            {showWelcome && !activeConversationId ? (
              <WelcomeScreen
                promptStarters={agentPromptStarters.length > 0 ? agentPromptStarters : contextualActions}
                onPromptStarter={handlePromptStarter}
                onStartChat={handleStartNewConversation}
                stakeholderType={detectedStakeholder}
                welcomeMessage={selectedAgent ? {
                  title: `VITAL Path AI - ${selectedAgent.display_name || selectedAgent.name}`,
                  subtitle: `${selectedAgent.description || 'Specialized healthcare AI assistant'}`,
                  description: `Start a conversation with ${selectedAgent.display_name || selectedAgent.name} using one of the prompt starters below, or ask your own question.`
                } : welcomeMessage}
              />
            ) : (
              <div className="h-full flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="max-w-4xl mx-auto px-4 py-6">
                    <MessageList
                      messages={messages}
                      isLoading={isLoading}
                      onRegenerateResponse={() => { /* TODO: implement */ }}
                      onBranchChange={() => { /* TODO: implement */ }}
                    />
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-border bg-card">
              <div className="max-w-4xl mx-auto p-4">
                <div className="relative">
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message VITAL Path AI..."
                    className="min-h-[56px] max-h-32 pr-16 py-4 resize-none rounded-xl border-2 border-border/50 focus:border-primary/50 transition-colors"
                    disabled={isLoading}
                  />

                  {/* Input Controls */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1">
                    {/* File Upload */}
                    {enableFileUpload && inputValue.length === 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleFileUpload}
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <Paperclip className="h-4 w-4" />
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
                            variant="ghost"
                            size="sm"
                            onClick={toggleVoiceRecognition}
                            className={cn(
                              "h-8 w-8 p-0 hover:bg-muted",
                              isListening && "bg-red-100 text-red-600"
                            )}
                          >
                            {isListening ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
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
                            size="sm"
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 rounded-lg bg-primary hover:bg-primary/90"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Status Info */}
                {(isListening || isLoading) && (
                  <div className="flex items-center justify-center mt-3">
                    {isListening && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 animate-pulse">
                        <Mic className="h-3 w-3 mr-1" />
                        Listening...
                      </Badge>
                    )}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-4 w-4 animate-pulse" />
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
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border bg-card"
            >
              <AgentPanel
                onClose={() => setAgentPanelOpen(false)}
                onAgentSelect={(agent: unknown) => {
                  setSelectedAgent(agent);
                  setAgentPanelOpen(false);
                  // }}
                selectedAgents={selectedAgent ? [selectedAgent] : []}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            >
              <SettingsPanel
                onClose={() => setSettingsOpen(false)}
                onSettingsChange={onSettingsChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt"
        />
      </div>
    </TooltipProvider>
  );
};

export default ChatContainer;