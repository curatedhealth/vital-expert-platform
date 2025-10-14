'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from '@/components/ui/chat-container';
import { useChatStore } from '@/lib/stores/chat-store';
import { DynamicReasoning } from '@/components/ai/dynamic-reasoning';


interface EnhancedChatContainerProps {
  className?: string;
}

export function EnhancedChatContainer({ className }: EnhancedChatContainerProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    liveReasoning,
    isReasoningActive,
    reasoningEvents,
    suggestedAgents,
    showAgentSelection,
    selectAgentFromSuggestions,
    hideAgentSelection
  } = useChatStore();

  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (date: Date | string | number) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid time';
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">VITAL Expert Chat</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Auto Mode</Badge>
          <Badge variant="secondary">Normal</Badge>
        </div>
      </div>

      {/* Chat Container */}
      <ChatContainerRoot className="flex-1 overflow-hidden">
        <ChatContainerContent className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <Card className={cn(
                "max-w-[80%] p-4",
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-50 text-gray-900'
              )}>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {message.role === 'user' ? 'You' : 'Assistant'} • {formatTimestamp(message.timestamp)}
                  </div>
                  
                  {message.isLoading && !message.content ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  )}
                </div>
              </Card>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Dynamic Reasoning Component */}
          <DynamicReasoning 
            isStreaming={isReasoningActive}
            reasoningEvents={reasoningEvents}
            className="mb-4"
          />

          {/* Agent Selection */}
          {showAgentSelection && suggestedAgents.length > 0 && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="space-y-3">
                <h3 className="font-medium text-yellow-800">Select an Expert Agent</h3>
                <div className="grid gap-2">
                  {suggestedAgents.slice(0, 3).map((agent) => (
                    <Button
                      key={agent.id}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => selectAgentFromSuggestions(agent)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{agent.display_name || agent.name}</div>
                        <div className="text-sm text-gray-500">{agent.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <ChatContainerScrollAnchor />
        </ChatContainerContent>
      </ChatContainerRoot>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about digital health, reimbursement, clinical research..."
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
