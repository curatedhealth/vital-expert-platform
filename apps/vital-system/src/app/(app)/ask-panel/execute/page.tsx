'use client';

/**
 * VITAL Platform - Unified Panel Execution
 *
 * This page handles the execution of all 6 panel types using the new
 * UnifiedPanelService backend with real agents from the database.
 *
 * Features:
 * - Real-time streaming responses
 * - Consensus analysis display
 * - Comparison matrix view
 * - Agent selection from database
 * - No mock data, no fallbacks
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import {
  ArrowLeft,
  Play,
  Loader2,
  Users,
  Bot,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  Brain,
  Swords,
  Vote,
  Target,
  RefreshCw,
  Save,
  BookmarkPlus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { EnhancedAgentCard, AgentCardGrid, type Agent as UIAgent } from '@vital/ui';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { useTenant } from '@/contexts/tenant-context';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { createClient } from '@/lib/supabase/client';
import { conversationsService } from '@/lib/services/conversations/conversations-service';
import {
  useExecuteUnifiedPanel,
  useExecuteUnifiedPanelStreaming,
  type UnifiedPanelAgent,
  type ExecuteUnifiedPanelResponse,
  type UnifiedConsensusResult,
  type UnifiedExpertResponse,
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

// Consensus level colors
function getConsensusColor(score: number): string {
  if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (score >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function getConsensusLabel(score: number): string {
  if (score >= 0.8) return 'High Consensus';
  if (score >= 0.6) return 'Moderate Consensus';
  if (score >= 0.4) return 'Low Consensus';
  return 'Divergent';
}

// Main content component
function PanelExecuteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const panelType = searchParams.get('type') || 'structured';

  // State
  const [question, setQuestion] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPhase, setExecutionPhase] = useState<string>('idle');
  const [expertResponses, setExpertResponses] = useState<UnifiedExpertResponse[]>([]);
  const [consensus, setConsensus] = useState<UnifiedConsensusResult | null>(null);
  const [result, setResult] = useState<ExecuteUnifiedPanelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState(true);
  const [streamProgress, setStreamProgress] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [panelName, setPanelName] = useState('');
  const [panelDescription, setPanelDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hooks
  const { agents: storeAgents, loadAgents, isLoading: loadingAgents } = useAgentsStore();
  const { tenant } = useTenant();
  const { user } = useAuth();

  // Get panel metadata
  const meta = PANEL_TYPE_META[panelType] || PANEL_TYPE_META.structured;

  // Save panel result to conversations table (same as ask-expert)
  const savePanelToConversations = useCallback(async (
    panelResult: ExecuteUnifiedPanelResponse,
    panelQuestion: string,
    panelConsensus: UnifiedConsensusResult | null,
    panelExpertResponses: UnifiedExpertResponse[],
    selectedAgents: UIAgent[]
  ) => {
    if (!user?.id) {
      console.warn('Cannot save panel: no user ID');
      return;
    }

    try {
      // Build messages array from expert responses
      const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp?: number }> = [
        { role: 'user', content: panelQuestion, timestamp: Date.now() - (panelResult.execution_time_ms || 0) },
      ];

      // Add each expert response as an assistant message
      panelExpertResponses.forEach((response) => {
        messages.push({
          role: 'assistant',
          content: `**${response.agent_name}** (${Math.round(response.confidence * 100)}% confidence):\n\n${response.content}`,
          timestamp: Date.now(),
        });
      });

      // Add consensus summary as final system message
      if (panelConsensus) {
        const consensusSummary = `## Panel Consensus (${Math.round(panelConsensus.consensus_score * 100)}% agreement)\n\n` +
          `**Recommendation:** ${panelConsensus.recommendation}\n\n` +
          `**Key Themes:** ${panelConsensus.key_themes?.join(', ') || 'N/A'}\n\n` +
          `**Agreement Points:**\n${panelConsensus.agreement_points?.map(p => `- ${p}`).join('\n') || 'None identified'}\n\n` +
          `**Divergent Points:**\n${panelConsensus.divergent_points?.map(p => `- ${p}`).join('\n') || 'None identified'}`;

        messages.push({
          role: 'system',
          content: consensusSummary,
          timestamp: Date.now(),
        });
      }

      // Create title from first ~50 chars of question
      const title = panelQuestion.length > 50
        ? panelQuestion.substring(0, 50) + '...'
        : panelQuestion;

      // Save to conversations using the same service as ask-expert
      const supabase = createClient();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: `[${meta.title}] ${title}`,
          context: {
            messages,
            panel_result: {
              panel_id: panelResult.panel_id,
              panel_type: panelResult.panel_type,
              consensus_score: panelConsensus?.consensus_score,
              execution_time_ms: panelResult.execution_time_ms,
              expert_count: panelExpertResponses.length,
            }
          },
          metadata: {
            mode: 'panel',
            panel_type: panelType,
            panel_id: panelResult.panel_id,
            agent_ids: selectedAgents.map(a => a.id),
            agent_names: selectedAgents.map(a => a.display_name || a.name),
            consensus_score: panelConsensus?.consensus_score,
            is_pinned: false,
          },
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save panel to conversations:', error);
      } else {
        console.log('Panel saved to conversations:', data?.id);
      }
    } catch (err) {
      console.error('Error saving panel to conversations:', err);
    }
  }, [user?.id, panelType, meta.title]);

  // Load agents on mount
  useEffect(() => {
    if (storeAgents.length === 0) {
      loadAgents(false);
    }
  }, [storeAgents.length, loadAgents]);

  // Load preselected agents from sessionStorage (when coming from custom panel)
  useEffect(() => {
    const preselectedAgents = sessionStorage.getItem('preselectedAgents');
    const preselectedPanelName = sessionStorage.getItem('preselectedPanelName');

    if (preselectedAgents) {
      try {
        const agentIds = JSON.parse(preselectedAgents);
        if (Array.isArray(agentIds) && agentIds.length > 0) {
          setSelectedAgentIds(new Set(agentIds));
          // Auto-hide agent selector since we have preselected agents
          setShowAgentSelector(false);
        }
      } catch (err) {
        console.error('Failed to parse preselected agents:', err);
      }
      // Clear after loading
      sessionStorage.removeItem('preselectedAgents');
    }

    if (preselectedPanelName) {
      // Could use this to show which custom panel was loaded
      sessionStorage.removeItem('preselectedPanelName');
    }
  }, []);

  // Filter to only valid agents (real UUIDs) and convert to UI-compatible type
  const validAgents = storeAgents
    .filter((agent) => agent.id && !agent.id.startsWith('fallback-') && !agent.id.startsWith('agent-'))
    .map((agent) => ({
      ...agent,
      // Convert null to undefined for UI compatibility
      business_function: (agent as any).business_function ?? undefined,
      function_name: (agent as any).function_name ?? undefined,
      department_name: (agent as any).department_name ?? undefined,
    })) as unknown as UIAgent[];

  // Get access token for API calls
  const getAccessToken = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  // Streaming mutation with callbacks
  const streamingMutation = useExecuteUnifiedPanelStreaming({
    onPanelStarted: (data) => {
      setExecutionPhase('Panel started');
      setStreamProgress(5);
    },
    onExpertsLoaded: (data) => {
      setExecutionPhase(`${data.experts?.length || 0} experts loaded`);
      setStreamProgress(10);
    },
    onExpertThinking: (data) => {
      setExecutionPhase(`${data.expert_name} is thinking...`);
      const baseProgress = 10 + ((data.position || 0) / (data.total || 1)) * 50;
      setStreamProgress(baseProgress);
    },
    onExpertResponse: (data) => {
      setExpertResponses((prev) => [
        ...prev,
        {
          agent_id: data.expert_id || '',
          agent_name: data.expert_name || 'Expert',
          content: data.content || '',
          confidence: data.confidence || 0,
          round_number: 1,
          response_type: 'analysis',
        },
      ]);
      setStreamProgress((prev) => Math.min(prev + 10, 70));
    },
    onCalculatingConsensus: () => {
      setExecutionPhase('Calculating consensus...');
      setStreamProgress(75);
    },
    onConsensusComplete: (data) => {
      setConsensus(data as UnifiedConsensusResult);
      setStreamProgress(85);
    },
    onBuildingMatrix: () => {
      setExecutionPhase('Building comparison matrix...');
      setStreamProgress(90);
    },
    onMatrixComplete: () => {
      setStreamProgress(95);
    },
    onPanelComplete: (data) => {
      setExecutionPhase('Complete');
      setStreamProgress(100);
      setIsExecuting(false);

      // Build result - get latest values using functional updates
      setExpertResponses((currentResponses) => {
        setConsensus((currentConsensus) => {
          const panelResult: ExecuteUnifiedPanelResponse = {
            panel_id: data.panel_id,
            panel_type: panelType,
            question,
            status: 'completed',
            consensus: currentConsensus || undefined,
            comparison_matrix: undefined,
            expert_responses: currentResponses,
            execution_time_ms: data.execution_time_ms,
            created_at: new Date().toISOString(),
            metadata: {},
          };

          setResult(panelResult);

          // Save to conversations after completion
          const selectedAgents = validAgents.filter((a) => selectedAgentIds.has(a.id));
          savePanelToConversations(panelResult, question, currentConsensus, currentResponses, selectedAgents);

          return currentConsensus;
        });
        return currentResponses;
      });
    },
    onError: (data) => {
      setError(data.error || 'An error occurred');
      setIsExecuting(false);
      setExecutionPhase('Error');
    },
  });

  // Synchronous mutation
  const syncMutation = useExecuteUnifiedPanel({
    onSuccess: (data) => {
      setResult(data);
      setConsensus(data.consensus || null);
      setExpertResponses(data.expert_responses);
      setIsExecuting(false);
      setExecutionPhase('Complete');

      // Save to conversations after completion
      const selectedAgents = validAgents.filter((a) => selectedAgentIds.has(a.id));
      savePanelToConversations(data, question, data.consensus || null, data.expert_responses, selectedAgents);
    },
    onError: (err) => {
      setError(err.message);
      setIsExecuting(false);
      setExecutionPhase('Error');
    },
  });

  // Execute panel
  const handleExecute = async (useStreaming = true) => {
    if (!question.trim()) {
      setError('Please enter a question for the panel');
      return;
    }

    if (selectedAgentIds.size < 2) {
      setError('Please select at least 2 agents');
      return;
    }

    // Reset state
    setError(null);
    setResult(null);
    setConsensus(null);
    setExpertResponses([]);
    setIsExecuting(true);
    setExecutionPhase('Starting...');
    setStreamProgress(0);

    // Build agent configs from selected IDs
    const agents: UnifiedPanelAgent[] = validAgents
      .filter((a) => selectedAgentIds.has(a.id))
      .map((a) => ({
        id: a.id,
        name: a.display_name || a.name,
        model: 'gpt-4-turbo',
        system_prompt: a.system_prompt || `You are ${a.name}, an expert in your field.`,
        role: 'expert' as const,
      }));

    const request = {
      question,
      panel_type: panelType as any,
      agents,
      context: `Panel type: ${meta.title}. ${meta.description}.`,
      tenant_id: tenant?.id,
      user_id: user?.id,
    };

    if (useStreaming) {
      streamingMutation.mutate(request);
    } else {
      syncMutation.mutate({
        ...request,
        save_to_db: true,
        generate_matrix: true,
      });
    }
  };

  // Reset for new consultation
  const handleReset = () => {
    setQuestion('');
    setResult(null);
    setConsensus(null);
    setExpertResponses([]);
    setError(null);
    setIsExecuting(false);
    setExecutionPhase('idle');
    setStreamProgress(0);
    setSaveSuccess(false);
  };

  // Save panel configuration as custom panel
  const handleSavePanel = async () => {
    if (!panelName.trim()) {
      setError('Please enter a panel name');
      return;
    }

    if (selectedAgentIds.size < 2) {
      setError('Please select at least 2 agents to save');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user-panels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: panelName.trim(),
          description: panelDescription.trim() || `${meta.title} with ${selectedAgentIds.size} experts`,
          category: 'panel',
          base_panel_slug: `${panelType}_panel`,
          mode: panelType === 'open' ? 'collaborative' : 'sequential',
          framework: 'langgraph',
          selected_agents: Array.from(selectedAgentIds),
          custom_settings: {
            userGuidance: 'high',
            allowDebate: true,
            maxRounds: 3,
            requireConsensus: true,
          },
          metadata: {
            panel_type: panelType,
            created_from: 'execute_page',
            last_question: question || null,
          },
          icon: meta.icon ? panelType : null,
          tags: [panelType, 'custom', 'user-created'],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to save panel');
      }

      setSaveSuccess(true);
      setShowSaveDialog(false);
      setPanelName('');
      setPanelDescription('');

      // Show success briefly
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save panel');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/ask-panel')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg bg-${meta.color}-500/10 flex items-center justify-center text-${meta.color}-600`}>
                {meta.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold">{meta.title}</h1>
                <p className="text-sm text-muted-foreground">{meta.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Saved!
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={selectedAgentIds.size < 2}
              >
                <BookmarkPlus className="w-4 h-4 mr-1" />
                Save Panel
              </Button>
              <Badge variant="outline">{panelType}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setError(null)}>
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agent Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Select Expert Agents
                  </CardTitle>
                  <CardDescription>
                    Choose at least 2 agents from the {validAgents.length} available experts
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedAgentIds.size} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAgentSelector(!showAgentSelector)}
                  >
                    {showAgentSelector ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {showAgentSelector && (
              <CardContent>
                {loadingAgents ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">Loading agents...</span>
                  </div>
                ) : validAgents.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No agents found in database.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please create agents first in the Agents section.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <AgentCardGrid columns={3} className="gap-4 pr-4">
                      {validAgents.map((agent) => {
                        const isSelected = selectedAgentIds.has(agent.id);
                        return (
                          <div
                            key={agent.id}
                            className="relative"
                          >
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
                              showLevelName={true}
                              size="md"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </AgentCardGrid>
                  </ScrollArea>
                )}
              </CardContent>
            )}
          </Card>

          {/* Selected Agents Preview */}
          {selectedAgentIds.size > 0 && !showAgentSelector && (
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap gap-2">
                  {validAgents
                    .filter((a) => selectedAgentIds.has(a.id))
                    .map((agent) => (
                      <Badge key={agent.id} variant="secondary" className="py-1.5 px-3">
                        <Bot className="w-3 h-3 mr-1" />
                        {agent.display_name || agent.name}
                        <button
                          onClick={() => {
                            setSelectedAgentIds((prev) => {
                              const next = new Set(prev);
                              next.delete(agent.id);
                              return next;
                            });
                          }}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Your Question
              </CardTitle>
              <CardDescription>
                Enter your question for the expert panel to discuss and analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., Should we pursue FDA 510(k) or De Novo pathway for our AI-powered diagnostic device?"
                className="min-h-[120px]"
                disabled={isExecuting}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {question.length} characters • {selectedAgentIds.size} agents selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExecute(false)}
                    disabled={isExecuting || selectedAgentIds.size < 2 || !question.trim()}
                  >
                    {syncMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run (Batch)
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleExecute(true)}
                    disabled={isExecuting || selectedAgentIds.size < 2 || !question.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {streamingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Streaming...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Run (Streaming)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Progress */}
          {isExecuting && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Panel Executing
                </CardTitle>
                <CardDescription>{executionPhase}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={streamProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {Math.round(streamProgress)}% complete
                  </p>

                  {/* Live Expert Responses */}
                  {expertResponses.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <p className="text-sm font-medium">Expert Responses ({expertResponses.length})</p>
                      {expertResponses.map((response, idx) => (
                        <Card key={idx} className="bg-muted/50">
                          <CardContent className="py-3">
                            <div className="flex items-start gap-3">
                              <Bot className="w-5 h-5 text-purple-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{response.agent_name}</p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                  {response.content}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(response.confidence * 100)}%
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !isExecuting && (
            <>
              {/* Consensus Card */}
              {consensus && (
                <Card className={`border-2 ${getConsensusColor(consensus.consensus_score)}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Consensus Analysis
                    </CardTitle>
                    <CardDescription>
                      {getConsensusLabel(consensus.consensus_score)} - {Math.round(consensus.consensus_score * 100)}% agreement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold">{Math.round(consensus.semantic_similarity * 100)}%</p>
                        <p className="text-xs text-muted-foreground">Semantic Similarity</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold">{Math.round(consensus.claim_overlap * 100)}%</p>
                        <p className="text-xs text-muted-foreground">Claim Overlap</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold">{Math.round(consensus.recommendation_alignment * 100)}%</p>
                        <p className="text-xs text-muted-foreground">Recommendation Alignment</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold">{Math.round(consensus.evidence_overlap * 100)}%</p>
                        <p className="text-xs text-muted-foreground">Evidence Overlap</p>
                      </div>
                    </div>

                    {/* Recommendation */}
                    {consensus.recommendation && (
                      <div className="p-4 bg-background rounded-lg border">
                        <p className="font-medium mb-2">Panel Recommendation</p>
                        <p className="text-sm text-muted-foreground">{consensus.recommendation}</p>
                      </div>
                    )}

                    {/* Agreement Points */}
                    {consensus.agreement_points?.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 text-green-700">Agreement Points</p>
                        <ul className="space-y-1">
                          {consensus.agreement_points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Divergent Points */}
                    {consensus.divergent_points?.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 text-orange-700">Divergent Points</p>
                        <ul className="space-y-1">
                          {consensus.divergent_points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Themes */}
                    {consensus.key_themes?.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Key Themes</p>
                        <div className="flex flex-wrap gap-2">
                          {consensus.key_themes.map((theme, idx) => (
                            <Badge key={idx} variant="secondary">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Expert Responses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Expert Responses ({result.expert_responses.length})
                  </CardTitle>
                  <CardDescription>
                    Individual responses from the panel experts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.expert_responses.map((response, idx) => (
                    <Card key={idx} className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-purple-500" />
                            <p className="font-medium">{response.agent_name}</p>
                          </div>
                          <Badge variant="outline">
                            {Math.round(response.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {response.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Consultation
                </Button>
                <Button variant="outline" onClick={() => router.push('/ask-panel')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Panel Types
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Panel Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5" />
              Save Panel Configuration
            </DialogTitle>
            <DialogDescription>
              Save this panel configuration with {selectedAgentIds.size} selected experts as a custom panel template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="panel-name">Panel Name *</Label>
              <Input
                id="panel-name"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                placeholder={`My ${meta.title}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panel-description">Description (optional)</Label>
              <Textarea
                id="panel-description"
                value={panelDescription}
                onChange={(e) => setPanelDescription(e.target.value)}
                placeholder={`Custom ${meta.title} with ${selectedAgentIds.size} experts`}
                rows={3}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Configuration Summary</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Panel Type: {meta.title}</li>
                <li>• Experts: {selectedAgentIds.size} selected</li>
                <li>• Framework: LangGraph</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePanel} disabled={isSaving || !panelName.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Panel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function PanelExecutePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <PanelExecuteContent />
    </Suspense>
  );
}
