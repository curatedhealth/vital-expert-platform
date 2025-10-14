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
// import { useToast } from '@/hooks/use-toast';

export function ChatContainer({ className }: { className?: string }) {
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

  // const { toast } = useToast();
  const [isRetrying, setIsRetrying] = React.useState(false);

  // AUDIT FIX: AbortController lifecycle
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // AUDIT FIX: Async acknowledgment pattern
  const handleSelectAgent = React.useCallback(async (agent: any) => {
    try {
      await selectAgent(agent.id);
      // toast({
      //   title: 'Agent Selected',
      //   description: `Now chatting with ${agent.display_name || agent.name}`,
      // });
      return 'ack'; // Acknowledgment
    } catch (error) {
      // toast({
      //   title: 'Selection Failed',
      //   description: 'Failed to select agent. Please try again.',
      //   variant: 'destructive',
      // });
      throw error;
    }
  }, [selectAgent]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // AUDIT FIX: Manual mode validation
    if (interactionMode === 'manual' && !selectedAgent) {
      // toast({
      //   title: 'No Agent Selected',
      //   description: 'Please select an AI agent before sending a message in Manual Mode.',
      //   variant: 'destructive',
      // });
      console.warn('No agent selected in manual mode');
      return;
    }

    // AUDIT FIX: Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      await sendMessage(input, [], abortControllerRef.current.signal);
      setInput('');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // User cancelled
      }
      console.error('Send message error:', error);
    }
  }, [input, isLoading, interactionMode, selectedAgent, sendMessage, setInput, toast]);

  const handleRetry = React.useCallback(async () => {
    if (!messages.length) return;
    
    setIsRetrying(true);
    try {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        await sendMessage(lastUserMessage.content);
      }
    } finally {
      setIsRetrying(false);
    }
  }, [messages, sendMessage]);

  // AUDIT FIX: Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
            isLoading={agents.length === 0}
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
                <p className="text-gray-600 mb-6">
                  {interactionMode === 'manual' 
                    ? 'Select an AI agent to start chatting'
                    : 'Ask about digital health, reimbursement, clinical research...'
                  }
                </p>
                {interactionMode === 'automatic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {[
                      'What are the latest digital health trends?',
                      'How does reimbursement work for telemedicine?',
                      'What clinical trials are available for diabetes?',
                      'Explain the FDA approval process for medical devices'
                    ].map((suggestion, i) => (
                      <Card 
                        key={i}
                        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setInput(suggestion)}
                      >
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <ReasoningDisplay />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="ml-2"
                  >
                    {isRetrying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  interactionMode === 'manual' && !selectedAgent
                    ? "Please select an AI agent first..."
                    : "Ask about digital health, reimbursement, clinical research..."
                }
                className="min-h-[40px] max-h-[120px] resize-none"
                disabled={!canSend}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!canSend}
                className="px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
