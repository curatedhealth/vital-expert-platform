'use client';

/**
 * VITAL Platform - Interactive Panel Chat
 *
 * This page provides an Ask Expert-like chat experience for panel discussions.
 * Features streaming responses from multiple experts in a chat-style interface.
 *
 * Query params:
 * - type: Panel type (structured, open, socratic, adversarial, delphi, hybrid)
 * - panelId: Optional panel ID to load existing panel configuration
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  Users,
  Bot,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Brain,
  Swords,
  Vote,
  Target,
  Send,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Circle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedAgentCard, AgentCardGrid, type Agent as UIAgent } from '@vital/ui';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { useTenant } from '@/contexts/tenant-context';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useHeaderActions } from '@/contexts/header-actions-context';
import { createClient } from '@/lib/supabase/client';
import { VitalPromptInput } from '@/components/vital-ai-ui/conversation/VitalPromptInput';
import {
  useExecuteUnifiedPanelStreaming,
  type UnifiedPanelAgent,
  type UnifiedExpertResponse,
  type UnifiedConsensusResult,
} from '@/hooks/usePanelAPI';

// Panel type metadata
const PANEL_TYPE_META: Record<string, {
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}> = {
  structured: {
    title: 'Structured Panel',
    icon: <Users className="h-5 w-5" />,
    color: 'purple',
    description: 'Sequential moderated discussion',
  },
  open: {
    title: 'Open Panel',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'violet',
    description: 'Free-form brainstorming',
  },
  socratic: {
    title: 'Socratic Panel',
    icon: <Brain className="h-5 w-5" />,
    color: 'fuchsia',
    description: 'Dialectical questioning',
  },
  adversarial: {
    title: 'Adversarial Panel',
    icon: <Swords className="h-5 w-5" />,
    color: 'pink',
    description: 'Pro/con debate format',
  },
  delphi: {
    title: 'Delphi Panel',
    icon: <Vote className="h-5 w-5" />,
    color: 'indigo',
    description: 'Consensus with voting',
  },
  hybrid: {
    title: 'Hybrid Panel',
    icon: <Target className="h-5 w-5" />,
    color: 'cyan',
    description: 'Human-AI collaboration',
  },
};

// Message type for chat display
interface ChatMessage {
  id: string;
  role: 'user' | 'expert' | 'system' | 'consensus';
  content: string;
  timestamp: Date;
  expert?: {
    id: string;
    name: string;
    avatar?: string;
    confidence?: number;
  };
  isStreaming?: boolean;
}

// Expert Message Component (like VitalMessage)
function ExpertMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isConsensus = message.role === 'consensus';
  const isSystem = message.role === 'system';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-4"
      >
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>
    );
  }

  if (isConsensus) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <BarChart3 className="w-5 h-5" />
              Panel Consensus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-green-900" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-4"
      >
        <div className="bg-muted/50 rounded-full px-4 py-2 text-xs text-muted-foreground">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // Expert message
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mb-4"
    >
      {/* Expert Avatar */}
      <Avatar className="w-9 h-9 border-2 border-purple-200">
        <AvatarImage src={message.expert?.avatar} alt={message.expert?.name} />
        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xs">
          {message.expert?.name?.charAt(0) || 'E'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 max-w-[85%]">
        {/* Expert Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{message.expert?.name || 'Expert'}</span>
          {message.expert?.confidence !== undefined && (
            <Badge variant="outline" className="text-xs py-0">
              {Math.round(message.expert.confidence * 100)}% conf
            </Badge>
          )}
          {message.isStreaming && (
            <span className="flex items-center gap-1 text-xs text-purple-600">
              <Circle className="w-2 h-2 fill-purple-600 animate-pulse" />
              typing
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {!message.isStreaming && (
            <p className="text-xs text-muted-foreground mt-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Streaming indicator for thinking state
function ThinkingIndicator({ expertName }: { expertName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
          <span className="text-sm text-muted-foreground">
            {expertName ? `${expertName} is thinking...` : 'Panel is analyzing...'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Main Interactive Panel Content
function PanelInteractiveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const panelType = searchParams.get('type') || 'structured';
  const customPanelId = searchParams.get('panelId');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPhase, setExecutionPhase] = useState<string>('idle');
  const [currentThinkingExpert, setCurrentThinkingExpert] = useState<string | null>(null);
  const [consensus, setConsensus] = useState<UnifiedConsensusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState(true);

  // Hooks
  const { agents: storeAgents, loadAgents, isLoading: loadingAgents } = useAgentsStore();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { setActions: setHeaderActions } = useHeaderActions();

  // Get panel metadata
  const meta = PANEL_TYPE_META[panelType] || PANEL_TYPE_META.structured;

  // Load agents on mount
  useEffect(() => {
    if (storeAgents.length === 0) {
      loadAgents(false);
    }
  }, [storeAgents.length, loadAgents]);

  // Load preselected agents from sessionStorage
  useEffect(() => {
    const preselectedAgents = sessionStorage.getItem('preselectedAgents');
    if (preselectedAgents) {
      try {
        const agentIds = JSON.parse(preselectedAgents);
        if (Array.isArray(agentIds) && agentIds.length > 0) {
          setSelectedAgentIds(new Set(agentIds));
          setShowAgentSelector(false);
        }
      } catch (err) {
        console.error('Failed to parse preselected agents:', err);
      }
      sessionStorage.removeItem('preselectedAgents');
    }
    sessionStorage.removeItem('preselectedPanelName');
  }, []);

  // Set header actions with panel info
  useEffect(() => {
    if (selectedAgentIds.size > 0) {
      setHeaderActions(
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600`}>
            {meta.icon}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">{meta.title}</span>
            <Badge variant="outline" className="text-xs">
              {selectedAgentIds.size} experts
            </Badge>
          </div>
        </div>
      );
    } else {
      setHeaderActions(null);
    }

    return () => setHeaderActions(null);
  }, [selectedAgentIds.size, meta, setHeaderActions]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Filter valid agents
  const validAgents = storeAgents
    .filter((agent) => agent.id && !agent.id.startsWith('fallback-') && !agent.id.startsWith('agent-'))
    .map((agent) => ({
      ...agent,
      business_function: (agent as any).business_function ?? undefined,
      function_name: (agent as any).function_name ?? undefined,
      department_name: (agent as any).department_name ?? undefined,
    })) as unknown as UIAgent[];

  // Get selected agents
  const selectedAgents = validAgents.filter((a) => selectedAgentIds.has(a.id));

  // Streaming mutation
  const streamingMutation = useExecuteUnifiedPanelStreaming({
    onPanelStarted: () => {
      setExecutionPhase('Panel started');
      setMessages((prev) => [...prev, {
        id: uuidv4(),
        role: 'system',
        content: `${meta.title} session started with ${selectedAgentIds.size} experts`,
        timestamp: new Date(),
      }]);
    },
    onExpertsLoaded: (data) => {
      setExecutionPhase(`${data.experts?.length || 0} experts loaded`);
    },
    onExpertThinking: (data) => {
      setCurrentThinkingExpert(data.expert_name || null);
      setExecutionPhase(`${data.expert_name} is analyzing...`);
    },
    onExpertResponse: (data) => {
      setCurrentThinkingExpert(null);

      // Find agent info
      const agent = validAgents.find((a) => a.id === data.expert_id);

      setMessages((prev) => [...prev, {
        id: uuidv4(),
        role: 'expert',
        content: data.content || '',
        timestamp: new Date(),
        expert: {
          id: data.expert_id || '',
          name: data.expert_name || 'Expert',
          avatar: agent?.avatar_url,
          confidence: data.confidence,
        },
      }]);
    },
    onCalculatingConsensus: () => {
      setExecutionPhase('Calculating consensus...');
      setCurrentThinkingExpert(null);
      setMessages((prev) => [...prev, {
        id: uuidv4(),
        role: 'system',
        content: 'Analyzing expert responses and building consensus...',
        timestamp: new Date(),
      }]);
    },
    onConsensusComplete: (data) => {
      setConsensus(data as UnifiedConsensusResult);

      // Build consensus message
      const consensusData = data as UnifiedConsensusResult;
      const consensusContent = `
**Consensus Score: ${Math.round(consensusData.consensus_score * 100)}%**

**Recommendation:** ${consensusData.recommendation || 'No specific recommendation'}

${consensusData.agreement_points?.length ? `**Agreement Points:**\n${consensusData.agreement_points.map(p => `- ${p}`).join('\n')}` : ''}

${consensusData.divergent_points?.length ? `**Divergent Points:**\n${consensusData.divergent_points.map(p => `- ${p}`).join('\n')}` : ''}

${consensusData.key_themes?.length ? `**Key Themes:** ${consensusData.key_themes.join(', ')}` : ''}
      `.trim();

      setMessages((prev) => [...prev, {
        id: uuidv4(),
        role: 'consensus',
        content: consensusContent,
        timestamp: new Date(),
      }]);
    },
    onPanelComplete: (data) => {
      setExecutionPhase('Complete');
      setIsExecuting(false);
      setCurrentThinkingExpert(null);

      // Save to conversations
      savePanelToConversations(data.panel_id, data.execution_time_ms);
    },
    onError: (data) => {
      setError(data.error || 'An error occurred');
      setIsExecuting(false);
      setCurrentThinkingExpert(null);
    },
  });

  // Save panel to conversations (like ask-expert)
  const savePanelToConversations = useCallback(async (panelId: string, executionTimeMs?: number) => {
    if (!user?.id || messages.length === 0) return;

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      // Convert messages to storage format
      const storedMessages = messages.map((m) => ({
        role: m.role === 'expert' ? 'assistant' : m.role,
        content: m.role === 'expert' && m.expert
          ? `**${m.expert.name}** (${Math.round((m.expert.confidence || 0) * 100)}% confidence):\n\n${m.content}`
          : m.content,
        timestamp: m.timestamp.getTime(),
      }));

      // Get first user message for title
      const firstUserMessage = messages.find((m) => m.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'Panel Discussion';

      const { error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: `[${meta.title}] ${title}`,
          context: {
            messages: storedMessages,
            panel_result: {
              panel_id: panelId,
              panel_type: panelType,
              consensus_score: consensus?.consensus_score,
              execution_time_ms: executionTimeMs,
              expert_count: selectedAgentIds.size,
            },
          },
          metadata: {
            mode: 'panel',
            panel_type: panelType,
            agent_ids: Array.from(selectedAgentIds),
            agent_names: selectedAgents.map((a) => a.display_name || a.name),
            consensus_score: consensus?.consensus_score,
            is_pinned: false,
          },
          created_at: now,
          updated_at: now,
        });

      if (error) {
        console.error('Failed to save panel to conversations:', error);
      }
    } catch (err) {
      console.error('Error saving panel:', err);
    }
  }, [user?.id, messages, panelType, meta.title, consensus, selectedAgentIds, selectedAgents]);

  // Handle sending a message (starting panel)
  const handleSend = useCallback(async (content: string) => {
    if (!content.trim() || selectedAgentIds.size < 2) {
      if (selectedAgentIds.size < 2) {
        setError('Please select at least 2 experts before asking a question');
      }
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Reset state and start execution
    setError(null);
    setConsensus(null);
    setIsExecuting(true);
    setExecutionPhase('Starting...');
    setShowAgentSelector(false);

    // Build agent configs
    const agents: UnifiedPanelAgent[] = selectedAgents.map((a) => ({
      id: a.id,
      name: a.display_name || a.name,
      model: 'gpt-4-turbo',
      system_prompt: a.system_prompt || `You are ${a.name}, an expert in your field.`,
      role: 'expert' as const,
    }));

    // Execute panel
    streamingMutation.mutate({
      question: content.trim(),
      panel_type: panelType as any,
      agents,
      context: `Panel type: ${meta.title}. ${meta.description}.`,
      tenant_id: tenant?.id,
      user_id: user?.id,
    });
  }, [selectedAgentIds, selectedAgents, panelType, meta, tenant?.id, user?.id, streamingMutation]);

  // Handle stop
  const handleStop = useCallback(() => {
    // TODO: Implement stream cancellation
    setIsExecuting(false);
    setCurrentThinkingExpert(null);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Agent Selection Section (collapsible) */}
      <AnimatePresence>
        {showAgentSelector && messages.length === 0 && (
          <motion.div
            initial={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b overflow-hidden"
          >
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => router.push('/ask-panel')}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600`}>
                      {meta.icon}
                    </div>
                    <div>
                      <h1 className="font-semibold">{meta.title}</h1>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={selectedAgentIds.size >= 2 ? "default" : "secondary"}
                    className={selectedAgentIds.size >= 2 ? "bg-green-600" : ""}
                  >
                    {selectedAgentIds.size >= 2
                      ? `${selectedAgentIds.size} experts ready`
                      : `${selectedAgentIds.size}/2 experts (select ${2 - selectedAgentIds.size} more)`
                    }
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAgentSelector(false)}
                  >
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Collapse
                  </Button>
                </div>
              </div>

              {/* Selection Progress Indicator */}
              <div className="mb-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-3 h-3 rounded-full transition-colors",
                          i < selectedAgentIds.size ? "bg-purple-600" : "bg-purple-200"
                        )}
                      />
                    ))}
                    {selectedAgentIds.size > 2 && (
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <p className="text-sm text-purple-700">
                    {selectedAgentIds.size === 0 && "Click on experts below to add them to your panel"}
                    {selectedAgentIds.size === 1 && "Great! Select one more expert to start"}
                    {selectedAgentIds.size >= 2 && `Panel ready with ${selectedAgentIds.size} experts. Type your question below!`}
                  </p>
                </div>
              </div>

              {/* Agent Grid */}
              {loadingAgents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2 text-muted-foreground">Loading experts...</span>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <AgentCardGrid columns={3} className="gap-3 pr-4">
                    {validAgents.map((agent) => {
                      const isSelected = selectedAgentIds.has(agent.id);
                      return (
                        <div key={agent.id} className="relative">
                          <EnhancedAgentCard
                            agent={agent}
                            isSelected={isSelected}
                            onClick={() => {
                              setSelectedAgentIds((prev) => {
                                const next = new Set(prev);
                                if (isSelected) {
                                  next.delete(agent.id);
                                } else {
                                  next.add(agent.id);
                                }
                                return next;
                              });
                            }}
                            showLevel={true}
                            size="sm"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </AgentCardGrid>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Experts Bar (when collapsed) */}
      {!showAgentSelector && messages.length === 0 && (
        <div className="border-b px-4 py-2 bg-muted/30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/ask-panel')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className={`w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600`}>
                {meta.icon}
              </div>
              <span className="text-sm font-medium">{meta.title}</span>
              {selectedAgents.length > 0 && (
                <div className="flex -space-x-2 ml-2">
                  {selectedAgents.slice(0, 4).map((agent) => (
                    <Avatar key={agent.id} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={agent.avatar_url} alt={agent.name} />
                      <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                        {agent.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {selectedAgents.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                      +{selectedAgents.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAgentSelector(true)}
              disabled={isExecuting}
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              {selectedAgentIds.size > 0 ? `${selectedAgentIds.size} experts` : 'Select Experts'}
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-2">
          {/* Empty State */}
          {messages.length === 0 && !showAgentSelector && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ready for Panel Discussion</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {selectedAgentIds.size} experts are ready. Ask your question and they&apos;ll discuss and provide consensus.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ExpertMessage key={message.id} message={message} />
          ))}

          {/* Thinking Indicator */}
          {isExecuting && currentThinkingExpert && (
            <ThinkingIndicator expertName={currentThinkingExpert} />
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Always visible */}
      <div className="border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          {selectedAgentIds.size < 2 ? (
            <div className="relative">
              {/* Disabled input overlay */}
              <div className="opacity-50 pointer-events-none">
                <VitalPromptInput
                  onSubmit={() => {}}
                  isLoading={false}
                  placeholder="Select at least 2 experts to ask a question..."
                  showAttachments={false}
                  showEnhance={false}
                  maxLength={4000}
                />
              </div>
              {/* Helper text below */}
              <p className="text-xs text-center text-muted-foreground mt-2">
                {selectedAgentIds.size === 0
                  ? "Select 2 or more experts above to begin"
                  : `Select ${2 - selectedAgentIds.size} more expert to start the panel`
                }
              </p>
            </div>
          ) : (
            <VitalPromptInput
              onSubmit={handleSend}
              isLoading={isExecuting}
              onStop={handleStop}
              placeholder={
                isExecuting
                  ? 'Panel discussion in progress...'
                  : `Ask your question to ${selectedAgentIds.size} experts...`
              }
              showAttachments={false}
              showEnhance={false}
              maxLength={4000}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Export with Suspense wrapper
export default function PanelInteractivePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <PanelInteractiveContent />
    </Suspense>
  );
}
