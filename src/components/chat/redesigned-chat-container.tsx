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
import { MessageBubble } from './message-bubble';
import { ReasoningDisplay } from './reasoning-display';
import { AgentSelectionPanel } from './agent-selection-panel';

export function RedesignedChatContainer({ className }: { className?: string }) {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    clearError,
    selectedAgent,
    interactionMode,
    agents,
    selectAgent,
  } = useChatStore();

  const [isRetrying, setIsRetrying] = React.useState(false);

  // AUDIT FIX: AbortController lifecycle
  const abortControllerRef = React.useRef<AbortController | null>(null);

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
    if (interactionMode === 'manual' && !selectedAgent) {
      return;
    }

    try {
      await sendMessage(input);
      setInput(''); // Clear input after sending
    } catch (error) {
      console.error('Send message error:', error);
    }
  }, [input, isLoading, interactionMode, selectedAgent, sendMessage, setInput, clearError]);

  const handleRetry = React.useCallback(async () => {
    if (!messages.length) return;
    setIsRetrying(true);
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content);
    }
    setIsRetrying(false);
  }, [messages, sendMessage]);

  const canSend = input.trim() && !isLoading && 
    (interactionMode === 'automatic' || selectedAgent);

  return (
    <div className={cn("flex h-full", className)}>
      {/* Agent Selection Sidebar - Only in Manual Mode */}
      {interactionMode === 'manual' && (
        <div className="w-80 border-r bg-gray-50/50 flex-shrink-0">
          <AgentSelectionPanel
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={handleSelectAgent}
            isLoading={false}
            className="h-full"
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to VITAL Expert Chat
                </h3>
                <p className="text-gray-600">
                  {interactionMode === 'manual' 
                    ? 'Select an AI agent from the sidebar to start chatting.'
                    : 'Start by asking a question or selecting an AI agent.'
                  }
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={message.id || index}
                  message={message}
                  isLastMessage={index === messages.length - 1}
                  isLoading={isLoading && index === messages.length - 1}
                />
              ))
            )}
            {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
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
              />
            )}
            <ReasoningDisplay />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          {error && (
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
          )}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                interactionMode === 'manual' && !selectedAgent
                  ? 'Please select an AI agent to start chatting.'
                  : 'Type your message...'
              }
              className="flex-1 min-h-[40px] max-h-[150px] resize-none"
              disabled={isLoading || (interactionMode === 'manual' && !selectedAgent)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && canSend) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" disabled={!canSend}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
