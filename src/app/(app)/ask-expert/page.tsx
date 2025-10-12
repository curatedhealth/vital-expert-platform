'use client';

import {
  MessageSquare,
  Send,
  Loader2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAgentsStore, Agent } from '@/lib/stores/agents-store';
import { useChatStore } from '@/lib/stores/chat-store';
import { useAuth } from '@/supabase-auth-context';


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
    console.log('🔄 Loading agents on mount...');
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    console.log('📊 Agents state changed:', {
      agentsCount: agents.length,
      firstAgent: agents[0] ? { id: agents[0].id, name: agents[0].display_name || agents[0].name } : null
    });
  }, [agents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleAgentSelect = (agentId: string) => {
    console.log('🎯 Agent selection:', {
      agentId,
      agentsCount: agents.length,
      availableAgents: agents.slice(0, 3).map(a => ({ id: a.id, name: a.name }))
    });
    const agent = agents.find(a => a.id === agentId);
    console.log('🎯 Selected agent:', agent ? { id: agent.id, name: agent.name } : 'NOT FOUND');
    setState(prev => ({ ...prev, selectedAgent: agent || null }));
  };

  const handleSendMessage = async () => {
    console.log('📤 Send message check:', {
      hasInput: !!state.input.trim(),
      hasSelectedAgent: !!state.selectedAgent,
      isLoading: state.isLoading,
      selectedAgent: state.selectedAgent ? { id: state.selectedAgent.id, name: state.selectedAgent.name } : null
    });
    
    if (!state.input.trim()) {
      console.warn('❌ No input provided');
      return;
    }
    
    if (!state.selectedAgent) {
      console.warn('❌ No agent selected');
      alert('Please select an agent first');
      return;
    }
    
    if (state.isLoading) {
      console.warn('❌ Already loading');
      return;
    }

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
          agent: {
            id: state.selectedAgent.id,
            display_name: state.selectedAgent.display_name || state.selectedAgent.name,
            business_function: state.selectedAgent.business_function || 'General',
            system_prompt: state.selectedAgent.system_prompt || '',
            model: state.selectedAgent.model || 'gpt-4',
            temperature: state.selectedAgent.temperature || 0.7,
            max_tokens: state.selectedAgent.max_tokens || 2000,
            capabilities: state.selectedAgent.capabilities || [],
            specializations: state.selectedAgent.knowledge_domains || []
          },
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

      console.log('🤖 Creating assistant message:', {
        messageId: assistantMessage.id,
        currentMessagesCount: state.messages.length
      });

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
              
              if (data.type === 'content') {
                fullContent += data.content;
                console.log('📝 Updating message content:', {
                  messageId: assistantMessage.id,
                  contentLength: fullContent.length,
                  content: fullContent.substring(0, 100) + '...'
                });
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: fullContent }
                      : msg
                  ),
                }));
              } else if (data.type === 'final') {
                // Use the final content if provided, otherwise keep accumulated content
                if (data.content) {
                  fullContent = data.content;
                }
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { 
                          ...msg, 
                          content: fullContent,
                          isLoading: false,
                          metadata: data.metadata || metadata
                        }
                      : msg
                  ),
                  progress: 100,
                  currentStep: 'Complete',
                }));
                break;
              } else if (data.type === 'metadata') {
                metadata = data.metadata;
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, metadata: data.metadata }
                      : msg
                  ),
                  progress: 100,
                  currentStep: 'Complete',
                }));
              } else if (data.type === 'error') {
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
                      : msg
                  ),
                  progress: 100,
                  currentStep: 'Error',
                }));
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
              // Continue processing other lines even if one fails
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
        {(
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
                        <AvatarFallback>{(agent.display_name || agent.name)[0]}</AvatarFallback>
                      </Avatar>
                      <span>{agent.display_name || agent.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Agent Info */}
        {state.selectedAgent && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={state.selectedAgent.avatar} />
                <AvatarFallback>{(state.selectedAgent.display_name || state.selectedAgent.name)[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{state.selectedAgent.display_name || state.selectedAgent.name}</h4>
                <p className="text-sm text-gray-600">{state.selectedAgent.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(state.selectedAgent.capabilities || [])?.slice(0, 3).map((cap) => (
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
        <div className="p-6 flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Prompts</h3>
          <div className="space-y-2">
            {state.selectedAgent ? (
              getExpertPrompts().map((prompt, index) => (
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
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                Select an expert agent to see quick prompts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {state.selectedAgent 
                  ? `Chat with ${state.selectedAgent.display_name || state.selectedAgent.name}` 
                  : 'Select an Expert'
                }
              </h2>
              <p className="text-sm text-gray-600">
                {state.selectedAgent 
                  ? state.selectedAgent.description 
                  : 'Choose an expert to get started'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Ask Expert
              </Badge>
              <Badge variant="secondary">
                LangGraph
              </Badge>
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
            state.messages.map((message) => {
              console.log('🎨 Rendering message:', {
                id: message.id,
                role: message.role,
                contentLength: message.content.length,
                content: message.content.substring(0, 50) + '...'
              });
              return (
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
                        <AvatarFallback>
                          {(state.selectedAgent?.display_name || state.selectedAgent?.name)?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
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
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Textarea
              value={state.input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setState(prev => ({ ...prev, input: e.target.value }))}
              placeholder={
                state.selectedAgent
                  ? `Ask ${state.selectedAgent.name} anything...`
                  : 'Select an expert first'
              }
              disabled={!state.selectedAgent || state.isLoading}
              className="flex-1 min-h-[60px] max-h-[120px]"
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
