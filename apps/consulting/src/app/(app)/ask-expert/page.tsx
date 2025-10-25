'use client';

import {
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui/components/avatar';
import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Progress } from '@vital/ui/components/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui/components/select';
import { Textarea } from '@vital/ui/components/textarea';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useAgentsStore, Agent } from '@/lib/stores/agents-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    sources?: any[];
    citations?: string[];
    tokenUsage?: any;
    workflowSteps?: any[];
  };
}

interface AskExpertState {
  selectedAgent: Agent | null;
  messages: Message[];
  input: string;
  isLoading: boolean;
  sessionId: string;
  workflowSteps: any[];
  currentStep: string;
  progress: number;
}

export default function AskExpertPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { agents, loadAgents } = useAgentsStore();
  
  const [state, setState] = useState<AskExpertState>({
    selectedAgent: null,
    messages: [],
    input: '',
    isLoading: false,
    sessionId: `ask-expert-${Date.now()}`,
    workflowSteps: [],
    currentStep: '',
    progress: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleAgentSelect = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    setState(prev => ({ ...prev, selectedAgent: agent || null }));
  };

  const handleSendMessage = async () => {
    if (!state.input.trim() || !state.selectedAgent || state.isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: state.input,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      input: '',
      isLoading: true,
      workflowSteps: [],
      currentStep: 'Starting Ask Expert workflow...',
      progress: 0,
    }));

    try {
      const response = await fetch('/api/ask-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: state.input,
          agent: state.selectedAgent,
          userId: user?.id || 'anonymous',
          sessionId: state.sessionId,
          chatHistory: state.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          ragEnabled: true,
          useEnhancedWorkflow: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let metadata: any = {};

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      // Create placeholder assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        metadata: {},
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'workflow_step') {
                setState(prev => ({
                  ...prev,
                  currentStep: data.step,
                  workflowSteps: [...prev.workflowSteps, data],
                  progress: Math.min(prev.progress + 10, 90),
                }));
              } else if (data.type === 'output') {
                fullContent += data.content;
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: fullContent }
                      : msg
                  ),
                }));
              } else if (data.type === 'metadata') {
                metadata = data.data;
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, metadata: data.data }
                      : msg
                  ),
                }));
              } else if (data.type === 'done') {
                setState(prev => ({
                  ...prev,
                  progress: 100,
                  currentStep: 'Complete',
                }));
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Ask Expert error:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false,
        currentStep: '',
        progress: 0,
      }));
    }
  };

  const getExpertPrompts = () => {
    if (!state.selectedAgent) return [];
    
    const prompts = [
      {
        text: `What are the key regulatory considerations for ${state.selectedAgent.name.toLowerCase()}?`,
        description: 'Get regulatory guidance',
        icon: '📋',
      },
      {
        text: `How can I optimize my ${state.selectedAgent.name.toLowerCase()} strategy?`,
        description: 'Strategic optimization',
        icon: '🎯',
      },
      {
        text: `What are the latest trends in ${state.selectedAgent.name.toLowerCase()}?`,
        description: 'Industry trends',
        icon: '📈',
      },
      {
        text: `What are the common challenges in ${state.selectedAgent.name.toLowerCase()}?`,
        description: 'Challenge analysis',
        icon: '⚠️',
      },
    ];

    return prompts;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Ask Expert</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Get expert guidance from specialized AI agents
          </p>
        </div>

        {/* Agent Selection */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Select Expert</h3>
          <Select onValueChange={handleAgentSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an expert agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback>{agent.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{agent.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Agent Info */}
        {state.selectedAgent && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={state.selectedAgent.avatar} />
                <AvatarFallback>{state.selectedAgent.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{state.selectedAgent.name}</h4>
                <p className="text-sm text-gray-600">{state.selectedAgent.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {state.selectedAgent.capabilities?.slice(0, 3).map((cap) => (
                    <Badge key={cap} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Prompts */}
        {state.selectedAgent && (
          <div className="p-6 flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Prompts</h3>
            <div className="space-y-2">
              {getExpertPrompts().map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setState(prev => ({ ...prev, input: prompt.text }))}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span>{prompt.icon}</span>
                      <span className="font-medium">{prompt.text}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{prompt.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {state.selectedAgent ? `Chat with ${state.selectedAgent.name}` : 'Select an Expert'}
              </h2>
              <p className="text-sm text-gray-600">
                {state.selectedAgent ? state.selectedAgent.description : 'Choose an expert to get started'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Ask Expert</Badge>
              <Badge variant="secondary">LangGraph</Badge>
            </div>
          </div>
        </div>

        {/* Workflow Progress */}
        {state.isLoading && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{state.currentStep}</p>
                <Progress value={state.progress} className="mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {state.messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {state.selectedAgent ? 'Start a conversation' : 'Select an Expert'}
              </h3>
              <p className="text-gray-600">
                {state.selectedAgent 
                  ? `Ask ${state.selectedAgent.name} anything about their expertise`
                  : 'Choose an expert agent to begin your consultation'
                }
              </p>
            </div>
          ) : (
            state.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  } rounded-lg p-4`}
                >
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={state.selectedAgent?.avatar} />
                        <AvatarFallback>{state.selectedAgent?.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <ReactMarkdown className="prose prose-sm max-w-none">
                        {message.content}
                      </ReactMarkdown>
                      
                      {/* Sources and Citations */}
                      {message.metadata?.sources && message.metadata.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Sources:</h4>
                          <div className="space-y-1">
                            {message.metadata.sources.slice(0, 3).map((source: any, index: number) => (
                              <div key={index} className="text-xs text-gray-600">
                                <span className="font-medium">[{index + 1}]</span> {source.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Textarea
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              placeholder={
                state.selectedAgent
                  ? `Ask ${state.selectedAgent.name} anything...`
                  : 'Select an expert first'
              }
              disabled={!state.selectedAgent || state.isLoading}
              className="flex-1 min-h-[60px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!state.input.trim() || !state.selectedAgent || state.isLoading}
              size="lg"
              className="px-6"
            >
              {state.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
