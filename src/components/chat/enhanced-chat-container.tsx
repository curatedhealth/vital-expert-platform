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

interface ReasoningStep {
  id: string;
  text: string;
  completed: boolean;
  active: boolean;
  timestamp?: number;
}

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
    suggestedAgents,
    showAgentSelection,
    selectAgentFromSuggestions,
    hideAgentSelection
  } = useChatStore();

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize reasoning steps based on LangGraph workflow
  const initializeReasoningSteps = () => {
    const steps: ReasoningStep[] = [
      { id: 'routing', text: 'Analyzing query and determining workflow mode...', completed: false, active: false },
      { id: 'agent_selection', text: 'Selecting the most appropriate expert agent...', completed: false, active: false },
      { id: 'tool_selection', text: 'Configuring tools for your request...', completed: false, active: false },
      { id: 'context_retrieval', text: 'Retrieving relevant context and knowledge...', completed: false, active: false },
      { id: 'response_generation', text: 'Generating comprehensive response...', completed: false, active: false },
    ];
    setReasoningSteps(steps);
  };

  // Update reasoning steps based on workflow progress
  useEffect(() => {
    if (isReasoningActive) {
      initializeReasoningSteps();
      setCurrentStep(0);
      setProgress(0);
    }
  }, [isReasoningActive]);

  // Simulate step progression (in real implementation, this would come from LangGraph events)
  useEffect(() => {
    if (!isReasoningActive || reasoningSteps.length === 0) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep < reasoningSteps.length) {
          setProgress((nextStep / reasoningSteps.length) * 100);
          setReasoningSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              completed: index < nextStep,
              active: index === nextStep
            }))
          );
          return nextStep;
        } else {
          setProgress(100);
          setReasoningSteps(prevSteps => 
            prevSteps.map(step => ({
              ...step,
              completed: true,
              active: false
            }))
          );
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1000); // Progress every 1 second

    return () => clearInterval(stepInterval);
  }, [isReasoningActive, reasoningSteps.length]);

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

  const getStepIcon = (step: ReasoningStep) => {
    if (step.completed) {
      return <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>;
    }
    if (step.active) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    return <div className="w-4 h-4 rounded-full bg-gray-300" />;
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

          {/* Reasoning Component */}
          {isReasoningActive && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="font-medium text-blue-700">Reasoning...</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Reasoning Steps */}
                {isExpanded && (
                  <div className="space-y-2">
                    {reasoningSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                          step.completed ? 'bg-green-50 text-green-700' :
                          step.active ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
                        )}
                      >
                        {getStepIcon(step)}
                        <span className={cn(
                          "text-sm",
                          step.completed ? 'font-medium' :
                          step.active ? 'font-medium' : 'font-normal'
                        )}>
                          {step.text}
                        </span>
                        {step.active && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

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
