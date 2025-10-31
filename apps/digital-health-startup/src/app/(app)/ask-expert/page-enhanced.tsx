'use client';

import {
  MessageSquare,
  Send,
  Loader2,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Progress } from '@vital/ui';
import { Textarea } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useAgentsStore, Agent } from '@/lib/stores/agents-store';
import { useAgentWithStats } from '@/features/ask-expert/hooks/useAgentWithStats';
import { EnhancedModeSelector, ExpertAgentCard } from '@/features/ask-expert/components';

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
  selectedMode: string;
  selectedAgent: Agent | null;
  messages: Message[];
  input: string;
  isLoading: boolean;
  sessionId: string;
  workflowSteps: any[];
  currentStep: string;
  progress: number;
}

// Mode configuration mapping to backend search strategies
// All modes search across all domains (Digital Health + Regulatory Affairs)
const MODE_CONFIG = {
  'mode-1-query-automatic': {
    searchFunction: 'search_knowledge_by_embedding',
    params: { domain_filter: null, max_results: 10, similarity_threshold: 0.7 } // null = all domains
  },
  'mode-2-query-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 15 } // Uses agent's assigned domains
  },
  'mode-3-chat-automatic': {
    searchFunction: 'hybrid_search',
    params: { domain_filter: null, semantic_weight: 0.7, keyword_weight: 0.3, max_results: 12 } // null = all domains
  },
  'mode-4-chat-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 20 }
  },
  'mode-5-agent-autonomous': {
    searchFunction: 'search_knowledge_base',
    params: { filters: { domain: 'all' }, match_count: 25 }
  }
} as const;

function AgentCardWithStats({
  agent,
  isSelected,
  onSelect,
  userId,
}: {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agentId: string) => void;
  userId?: string | null;
}) {
  const { stats, isLoadingStats, memory, isLoadingMemory } = useAgentWithStats(agent.id, userId);
  const mergedAgent = stats ? { ...agent, ...stats } : agent;

  return (
    <ExpertAgentCard
      agent={mergedAgent}
      isSelected={isSelected}
      onSelect={onSelect}
      variant="detailed"
      showStats
      isLoadingStats={isLoadingStats || isLoadingMemory}
      memory={memory}
    />
  );
}

export default function AskExpertPageEnhanced() {
  const router = useRouter();
  const { user } = useAuth();
  const { agents, loadAgents } = useAgentsStore();

  const [state, setState] = useState<AskExpertState>({
    selectedMode: 'mode-1-query-automatic',
    selectedAgent: null,
    messages: [],
    input: '',
    isLoading: false,
    sessionId: `ask-expert-${Date.now()}`,
    workflowSteps: [],
    currentStep: '',
    progress: 0,
  });

  const [activeTab, setActiveTab] = useState<'setup' | 'chat'>('setup');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const {
    agent: selectedAgentFromStore,
    stats: selectedAgentStats,
    isLoadingStats: isLoadingSelectedAgentStats,
    memory: selectedAgentMemory,
    isLoadingMemory: isLoadingSelectedAgentMemory,
  } = useAgentWithStats(state.selectedAgent?.id ?? null, user?.id ?? null);

  const selectedAgentDisplay = useMemo(() => {
    if (!state.selectedAgent) {
      return null;
    }

    return {
      ...state.selectedAgent,
      ...(selectedAgentFromStore ?? {}),
      ...(selectedAgentStats ?? {}),
    };
  }, [state.selectedAgent, selectedAgentFromStore, selectedAgentStats, selectedAgentMemory]);

  const handleModeChange = (modeId: string) => {
    setState(prev => ({ ...prev, selectedMode: modeId }));
  };

  const handleAgentSelect = (agentId: string) => {
    const agent = agents.find((a: any) => a.id === agentId);
    setState(prev => ({ ...prev, selectedAgent: agent || null }));

    // Auto-switch to chat tab when agent is selected
    if (agent && activeTab === 'setup') {
      setActiveTab('chat');
    }
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
      const modeConfig = MODE_CONFIG[state.selectedMode as keyof typeof MODE_CONFIG];

      const response = await fetch('/api/ask-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: state.input,
          agent: state.selectedAgent,
          mode: state.selectedMode,
          searchConfig: modeConfig,
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

    if (
      user?.id &&
      (selectedAgentDisplay?.id || state.selectedAgent?.id) &&
      fullContent.trim().length > 0
    ) {
      void fetch('/api/memory/long-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          agentId: selectedAgentDisplay?.id ?? state.selectedAgent?.id,
          userMessage: userMessage.content,
          assistantMessage: fullContent,
        }),
      }).catch((error) => {
        console.error('[LongTermMemory] Failed to persist memory (enhanced page)', error);
      });
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
    if (!selectedAgentDisplay) return [];

    const prompts = [
      {
        text: `What are the key regulatory considerations for ${selectedAgentDisplay.name.toLowerCase()}?`,
        description: 'Get regulatory guidance',
        icon: '📋',
      },
      {
        text: `How can I optimize my ${selectedAgentDisplay.name.toLowerCase()} strategy?`,
        description: 'Strategic optimization',
        icon: '🎯',
      },
      {
        text: `What are the latest trends in ${selectedAgentDisplay.name.toLowerCase()}?`,
        description: 'Industry trends',
        icon: '📈',
      },
      {
        text: `What are the common challenges in ${selectedAgentDisplay.name.toLowerCase()}?`,
        description: 'Challenge analysis',
        icon: '⚠️',
      },
    ];

    return prompts;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-semibold">Ask Expert</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Get expert guidance from specialized AI agents
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedAgentDisplay && (
                  <Badge variant="outline" className="px-3 py-1">
                    <ExpertAgentCard
                      agent={selectedAgentDisplay}
                      variant="minimal"
                      isSelected={true}
                      isLoadingStats={isLoadingSelectedAgentStats || isLoadingSelectedAgentMemory}
                      memory={selectedAgentMemory}
                    />
                    <span className="ml-2">{selectedAgentDisplay.name}</span>
                  </Badge>
                )}
                <Badge variant="secondary">LangGraph</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'setup' | 'chat')}>
              <TabsList className="mb-6">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="chat" disabled={!state.selectedAgent}>
                  Chat {state.messages.length > 0 && `(${state.messages.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-8">
                {/* Mode Selection */}
                <div>
                  <EnhancedModeSelector
                    selectedMode={state.selectedMode}
                    onModeChange={handleModeChange}
                  />
                </div>

                {/* Expert Selection */}
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Select Your Expert</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose the AI expert that best matches your needs
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.slice(0, 9).map((agent) => (
                      <AgentCardWithStats
                        key={agent.id}
                        agent={agent}
                        isSelected={state.selectedAgent?.id === agent.id}
                        onSelect={handleAgentSelect}
                        userId={user?.id}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                {/* Workflow Progress */}
                {state.isLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">{state.currentStep}</p>
                        <Progress value={state.progress} className="mt-2" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto space-y-4">
                  {state.messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Ask {selectedAgentDisplay?.name || 'your selected expert'} anything about their expertise
                      </p>

                      {/* Quick Prompts */}
                      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getExpertPrompts().map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left h-auto p-3"
                            onClick={() => setState(prev => ({ ...prev, input: prompt.text }))}
                          >
                            <div className="w-full">
                              <div className="flex items-center space-x-2 mb-1">
                                <span>{prompt.icon}</span>
                                <span className="font-medium text-xs">{prompt.description}</span>
                              </div>
                              <p className="text-xs text-gray-600">{prompt.text}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
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
                              : 'bg-gray-50 border border-gray-200'
                          } rounded-lg p-4`}
                        >
                          <div className="flex items-start space-x-3">
                            {message.role === 'assistant' && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={selectedAgentDisplay?.avatar} />
                                <AvatarFallback>{selectedAgentDisplay?.name?.[0]}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1 prose prose-sm max-w-none">
                              <ReactMarkdown>
                                {message.content}
                              </ReactMarkdown>

                              {/* Sources and Citations */}
                              {message.metadata?.sources && message.metadata.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-300">
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
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex space-x-3">
                    <Textarea
                      value={state.input}
                      onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                      placeholder={`Ask ${selectedAgentDisplay?.name || 'your expert'} anything...`}
                      disabled={state.isLoading}
                      className="flex-1 min-h-[80px] max-h-[200px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!state.input.trim() || state.isLoading}
                        size="lg"
                        className="px-6"
                      >
                        {state.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('setup')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Mode: <Badge variant="outline" className="text-xs ml-1">{state.selectedMode.split('-').slice(0, 2).join(' ')}</Badge>
                    </span>
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
