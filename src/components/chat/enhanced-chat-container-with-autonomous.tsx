'use client';

import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, RefreshCw, Bot, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { useChatSync } from '@/hooks/use-chat-sync';
import { useAutonomousMode } from '@/hooks/use-autonomous-mode';
import { MessageBubble } from './message-bubble';
import { ReasoningDisplay } from './reasoning-display';
import { AgentSelectionPanel } from './agent-selection-panel';
import { ChatInput } from './chat-input';
import { AgentPromptStarters } from './agent-prompt-starters';
import { AutonomousModeToggle } from './autonomous-mode-toggle';
import { AutonomousTaskProgress } from './autonomous-task-progress';
import { StateDebugger } from '@/components/debug/state-debugger';
import { ReasoningMessage } from '@/features/expert-consultation/components/ReasoningMessage';

export function EnhancedChatContainerWithAutonomous({ className }: { className?: string }) {
  // Use the sync hook to ensure state consistency
  useChatSync();
  
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    clearError,
    selectedAgent,
    selectedAgents,
    activeAgentId,
    selectedModel,
    setSelectedModel,
    currentChat,
    getCurrentChatModes,
    updateChatMode,
    getAgents,
    selectAgent,
    cleanup,
    isHydrated,
    reasoningEvents,
    isReasoningActive,
  } = useChatStore();

  // Autonomous mode state
  const {
    isAutonomousMode,
    isRunning,
    goal,
    tasks,
    currentTask,
    progress,
    metrics,
    evidence,
    settings,
    toggleAutonomousMode,
    startAutonomousExecution,
    pauseAutonomousExecution,
    stopAutonomousExecution,
    updateSettings
  } = useAutonomousMode();

  const [autonomousGoal, setAutonomousGoal] = useState('');

  // Wait for hydration before accessing modes
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  const currentModes = getCurrentChatModes();
  const isManualMode = currentModes?.interactionMode === 'manual';

  const handleAutonomousStart = async () => {
    if (!autonomousGoal.trim()) return;
    
    try {
      await startAutonomousExecution(autonomousGoal);
    } catch (error) {
      console.error('Failed to start autonomous execution:', error);
    }
  };

  const handleSendMessage = async () => {
    console.log('🚀 [handleSendMessage] Called with:', {
      input: input.trim(),
      isLoading,
      isAutonomousMode,
      isRunning,
      selectedAgent: selectedAgent?.name
    });

    if (!input.trim() || isLoading) {
      console.log('❌ [handleSendMessage] Blocked:', { 
        hasInput: !!input.trim(), 
        isLoading 
      });
      return;
    }

    const message = input.trim();
    setInput('');

    // If in autonomous mode, treat as goal
    if (isAutonomousMode && !isRunning) {
      console.log('🎯 [handleSendMessage] Setting autonomous goal:', message);
      setAutonomousGoal(message);
      return;
    }

    // Regular chat message
    console.log('💬 [handleSendMessage] Sending regular message:', message);
    try {
      await sendMessage(message);
      console.log('✅ [handleSendMessage] Message sent successfully');
    } catch (error) {
      console.error('❌ [handleSendMessage] Failed to send message:', error);
    }
  };

  return (
    <div className={cn("flex h-full", className)}>
      {/* Main Chat Area - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">VITAL Expert</h2>
              <p className="text-sm text-muted-foreground">
                {isManualMode ? 'Manual Mode' : 'Automatic Mode'}
                {isAutonomousMode && ' • Autonomous'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedAgent && (
                <div className="text-sm text-muted-foreground">
                  Agent: {selectedAgent.display_name || selectedAgent.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {(!messages || messages.length === 0) ? (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Welcome to VITAL Expert</h3>
                        <p className="text-muted-foreground mb-4">
                          Select an agent and start a conversation, or try autonomous mode for complex tasks.
                        </p>
                        {selectedAgent && (
                          <AgentPromptStarters 
                            agent={selectedAgent} 
                            onPromptSelect={(prompt) => setInput(prompt)}
                          />
                        )}
                      </div>
                    ) : (
                      (messages || []).map((message, index) => {
                        const isLastMessage = message.id === (messages || [])[(messages || []).length - 1]?.id;
                        const hasReasoning = message.role === 'assistant' && reasoningEvents.length > 0;
                        
                        return (
                          <div key={message.id} className="space-y-2">
                            <MessageBubble
                              message={message}
                              isLast={isLastMessage}
                            />
                            
                            {/* Show reasoning steps directly after assistant messages */}
                            {hasReasoning && (
                              <div className="ml-12 mr-4">
                                <ReasoningMessage
                                  steps={reasoningEvents.map(event => {
                                    // Handle both old and new reasoning event formats
                                    let stepData;
                                    if (event.data && event.data.content) {
                                      // New enhanced reasoning step format
                                      stepData = {
                                        id: event.data.id || event.id,
                                        timestamp: event.data.timestamp || event.timestamp,
                                        iteration: event.data.iteration || 1,
                                        phase: event.data.phase || event.step || 'processing',
                                        content: {
                                          description: event.data.content.description || event.description || 'Processing...',
                                          reasoning: event.data.content.reasoning,
                                          insights: event.data.content.insights || [],
                                          questions: event.data.content.questions || [],
                                          decisions: event.data.content.decisions || [],
                                          evidence: event.data.content.evidence || []
                                        },
                                        metadata: {
                                          confidence: event.data.metadata?.confidence,
                                          estimatedDuration: event.data.metadata?.estimatedDuration,
                                          toolsUsed: event.data.metadata?.toolsUsed || [],
                                          cost: event.data.metadata?.cost,
                                          tokensUsed: event.data.metadata?.tokensUsed,
                                          priority: event.data.metadata?.priority
                                        },
                                        status: event.data.status || (event.type === 'complete' ? 'completed' : 
                                               event.type === 'error' ? 'failed' : 'in_progress')
                                      };
                                    } else {
                                      // Legacy reasoning event format
                                      stepData = {
                                        id: event.id,
                                        timestamp: event.timestamp,
                                        iteration: 1,
                                        phase: event.step || 'processing',
                                        content: {
                                          description: event.description || 'Processing...',
                                          reasoning: event.data?.reasoning,
                                          insights: event.data?.insights || [],
                                          questions: event.data?.questions || [],
                                          decisions: event.data?.decisions || [],
                                          evidence: event.data?.evidence || []
                                        },
                                        metadata: {
                                          confidence: event.data?.confidence,
                                          estimatedDuration: event.data?.estimatedDuration,
                                          toolsUsed: event.data?.toolsUsed || [],
                                          cost: event.data?.cost,
                                          tokensUsed: event.data?.tokensUsed,
                                          priority: event.data?.priority
                                        },
                                        status: event.type === 'complete' ? 'completed' : 
                                               event.type === 'error' ? 'failed' : 'in_progress'
                                      };
                                    }
                                    return stepData;
                                  })}
                                  isStreaming={isReasoningActive && isLastMessage}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    
                    {isLoading && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Reasoning is now integrated into the chat flow above */}

                {/* Error Display */}
                {error && (
                  <div className="border-t p-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearError}
                        className="mt-2"
                      >
                        Dismiss
                      </Button>
                    </Alert>
                  </div>
                )}

                {/* Chat Input */}
                <div className="border-t p-4">
                  <ChatInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSendMessage}
                    isLoading={isLoading}
                    interactionMode={isManualMode ? 'manual' : 'automatic'}
                    hasSelectedAgent={!!selectedAgent}
                    selectedAgent={selectedAgent}
                    selectedModel={selectedModel?.id || 'gpt-4o'}
                    onModelChange={(model) => setSelectedModel({ id: model, name: model })}
                    currentChat={currentChat}
                    onUpdateChatMode={updateChatMode}
                    disabled={isLoading}
                    className="border-t"
                    isCentered={false}
                  />
                </div>
              </div>
        </div>
      </div>

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-80 border-l bg-muted/50">
          <StateDebugger />
        </div>
      )}
    </div>
  );
}
