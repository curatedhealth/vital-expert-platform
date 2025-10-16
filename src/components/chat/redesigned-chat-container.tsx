'use client';

import React from 'react';
import { Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { useChatSync } from '@/hooks/use-chat-sync';
import { MessageBubble } from './message-bubble';
import { ReasoningDisplay } from './reasoning-display';
import { AgentSelectionPanel } from './agent-selection-panel';
import { ChatInput } from './chat-input';
import { AgentPromptStarters } from './agent-prompt-starters';
import { StateDebugger } from '@/components/debug/state-debugger';

export function RedesignedChatContainer({ className }: { className?: string }) {
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
  } = useChatStore();

  // Wait for hydration before accessing modes
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading chat...</p>
          <p className="text-xs text-gray-500 mt-2">If this takes too long, try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Get current chat modes (safe to access now)
  const { isAutomaticMode, isAutonomousMode } = getCurrentChatModes();

  // Get agents from global store
  const agents = getAgents();

  const [isRetrying, setIsRetrying] = React.useState(false);
  const [hydrationTimeout, setHydrationTimeout] = React.useState(false);

  // AUDIT FIX: AbortController lifecycle
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Timeout protection for hydration
  React.useEffect(() => {
    if (!isHydrated) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Hydration timeout - forcing hydration');
        setHydrationTimeout(true);
        // Force hydration by clearing storage and reloading
        localStorage.removeItem('chat-store');
        window.location.reload();
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isHydrated]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Force re-render when selectedAgent changes
  React.useEffect(() => {
    console.log('🔄 [RedesignedChatContainer] selectedAgent changed:', {
      selectedAgent: selectedAgent?.name,
      selectedAgentId: selectedAgent?.id,
      selectedAgentDisplayName: selectedAgent?.display_name
    });
  }, [selectedAgent]);

  // AUDIT FIX: Async acknowledgment pattern
  const handleSelectAgent = React.useCallback(async (agent: any) => {
    try {
      await selectAgent(agent.id);
      return 'ack'; // Acknowledgment
    } catch (error) {
      console.error('Agent selection failed:', error);
      return 'nack'; // Negative acknowledgment
    }
  }, [selectAgent]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Clear any previous errors when sending a new message
    clearError();

    // If in manual mode and no agent is selected, prevent sending message
    if (!isAutomaticMode && !selectedAgent) {
      return;
    }

    try {
      await sendMessage(input);
      setInput(''); // Clear input after sending
    } catch (error) {
      console.error('Send message error:', error);
    }
  }, [input, isLoading, isAutomaticMode, selectedAgent, sendMessage, setInput, clearError]);

  const handleRetry = React.useCallback(async () => {
    if (!(messages || []).length) return;
    setIsRetrying(true);
    const lastUserMessage = (messages || []).filter(msg => msg.role === 'user').pop();
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content);
    }
    setIsRetrying(false);
  }, [messages, sendMessage]);

  // Always allow sending (unconditional)
  const canSend = input.trim() && !isLoading;

  // Debug logging
  console.log('RedesignedChatContainer Debug:', {
    input: input.trim(),
    isLoading,
    isAutomaticMode,
    isAutonomousMode,
    selectedAgent: selectedAgent,
    selectedAgentId: selectedAgent?.id,
    selectedAgentName: selectedAgent?.name,
    selectedAgentDisplayName: selectedAgent?.display_name,
    selectedAgentType: typeof selectedAgent,
    selectedAgentsCount: selectedAgents.length,
    activeAgentId,
    canSend
  });

  return (
    <div className={cn("flex h-full", className)}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {(messages || []).length === 0 ? (
          // Empty state with centered input (ChatGPT style)
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {selectedAgent ? (
              // Show prompt starters when agent is selected
              <AgentPromptStarters
                key={selectedAgent.id} // Force re-render when agent changes
                selectedAgent={selectedAgent}
                onPromptSelect={(prompt) => {
                  setInput(prompt);
                  // Auto-send the selected prompt
                  setTimeout(() => {
                    if (canSend) {
                      handleSubmit(new Event('submit') as any);
                    }
                  }, 100);
                }}
                className="mb-8"
              />
            ) : (
              // Show welcome message when no agent selected
              <div className="text-center mb-8 max-w-2xl">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Welcome to VITAL Expert Chat
                </h3>
                <p className="text-gray-600 text-lg">
                  {!isAutomaticMode 
                    ? 'Select an AI agent from the sidebar to start chatting.'
                    : 'Start by asking a question or selecting an AI agent.'
                  }
                </p>
              </div>
            )}

            {/* Enhanced Input - Always use enhanced version */}
            <div className="w-full max-w-3xl">
              <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={() => {
                  if (canSend) {
                    handleSubmit(new Event('submit') as any);
                  }
                }}
                isLoading={isLoading}
                interactionMode={isAutomaticMode ? 'automatic' : 'manual'}
                hasSelectedAgent={!!selectedAgent}
                selectedAgent={selectedAgent}
                selectedModel={selectedModel?.id || 'gpt-4o'}
                onModelChange={(model) => setSelectedModel({ id: model, name: model })}
                className="border-0 bg-transparent"
                isCentered={false}
                currentChat={currentChat}
                onUpdateChatMode={updateChatMode}
              />
            </div>
          </div>
        ) : (
          // Messages view with input at bottom
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {(messages || []).map((message, index) => (
                  <MessageBubble
                    key={message.id || index}
                    message={message}
                    isLastMessage={index === (messages || []).length - 1}
                    isLoading={isLoading && index === (messages || []).length - 1}
                    agent={message.role === 'assistant' ? selectedAgent : undefined}
                  />
                ))}
                {isLoading && (messages || []).length > 0 && (messages || [])[(messages || []).length - 1]?.role === 'user' && (
                  <MessageBubble
                    message={{
                      id: 'loading',
                      role: 'assistant',
                      content: '',
                      isLoading: true,
                      createdAt: new Date().toISOString(),
                    }}
                    isLastMessage={true}
                    isLoading={true}
                    agent={selectedAgent}
                  />
                )}
                <ReasoningDisplay />
              </div>
            </ScrollArea>

            {/* Error Display */}
            {error && (
              <div className="border-t bg-white p-4">
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="ml-auto"
                    disabled={isRetrying}
                  >
                    {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Retry</span>
                  </Button>
                </Alert>
              </div>
            )}

            {/* Input Area at Bottom */}
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={() => {
                if (canSend) {
                  handleSubmit(new Event('submit') as any);
                }
              }}
              isLoading={isLoading}
              interactionMode={isAutomaticMode ? 'automatic' : 'manual'}
              hasSelectedAgent={!!selectedAgent}
              selectedAgent={selectedAgent}
              selectedModel={selectedModel?.id || 'gpt-4o'}
              onModelChange={(model) => setSelectedModel({ id: model, name: model })}
              className="border-t"
              isCentered={false}
              currentChat={currentChat}
              onUpdateChatMode={updateChatMode}
            />
          </>
        )}
      </div>
      
      {/* Debug component - only in development */}
      <StateDebugger />
    </div>
  );
}
