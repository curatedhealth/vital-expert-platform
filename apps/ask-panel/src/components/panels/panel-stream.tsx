/**
 * Panel Stream Component
 * Real-time display of expert panel discussions with SSE
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, Users, Brain, TrendingUp, TrendingDown,
  Download, Share2, Pause, Play, Loader2
} from 'lucide-react';
import { usePanelStream, type PanelStreamEvent } from '@/hooks/use-sse';
import { useTenant } from '@/hooks/use-tenant';
import type { PanelResponse, PanelConsensus } from '@/types/database.types';
import { cn } from '@/lib/utils';
import { renderTextWithCitations, type CitationSource } from './inline-citation';
import { ReasoningDisplay } from './reasoning-display';
import { SourcesPanel } from './sources-panel';
import { StreamingWindow } from './streaming-window';

interface PanelStreamProps {
  panelId: string;
}

interface ExpertMessage {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_avatar?: string;
  round_number: number;
  response_type: string;
  content: string;
  confidence_score: number | null;
  created_at: string;
  metadata?: {
    sources?: CitationSource[];
    reasoning?: Array<{ step: string; content: string }> | string[];
    confidence?: number;
  };
}

interface ConsensusData {
  level: number;
  agreement_points: string[];
  disagreement_points: string[];
  round_number: number;
}

export function PanelStream({ panelId }: PanelStreamProps) {
  const { tenantId, db } = useTenant();
  const [messages, setMessages] = useState<ExpertMessage[]>([]);
  const [consensus, setConsensus] = useState<ConsensusData | null>(null);
  const [panelStatus, setPanelStatus] = useState<'connecting' | 'running' | 'completed' | 'error'>('connecting');
  const [currentRound, setCurrentRound] = useState(1);
  const [activeExpert, setActiveExpert] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<Array<{step: string; status: 'pending' | 'active' | 'complete' | 'error'}>>([]);
  const [currentReasoningSteps, setCurrentReasoningSteps] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial panel data
  useEffect(() => {
    const loadPanelData = async () => {
      if (!db) return;

      try {
        // Load existing responses
        const { data: responses } = await db.panelResponses(panelId);
        if (responses) {
          setMessages(responses.map(r => ({
            ...r,
            agent_avatar: `/avatars/${r.agent_id}.png`,
          })));
        }

        // Load latest consensus
        const consensusData = await db.getConsensus(panelId);
        if (consensusData) {
          setConsensus({
            level: consensusData.consensus_level,
            agreement_points: consensusData.agreement_points as string[],
            disagreement_points: consensusData.disagreement_points as string[],
            round_number: consensusData.round_number,
          });
          setCurrentRound(consensusData.round_number + 1);
        }
      } catch (error) {
        console.error('Failed to load panel data:', error);
      }
    };

    loadPanelData();
  }, [panelId, db]);

  // Handle SSE events
  const handleStreamEvent = (event: PanelStreamEvent) => {
    if (isPaused) return;

    switch (event.type) {
      case 'started':
        setPanelStatus('running');
        setWorkflowSteps([
          { step: 'Panel Initialized', status: 'complete' },
          { step: 'Experts Selected', status: 'active' },
          { step: 'Discussion Started', status: 'pending' },
        ]);
        break;

      case 'expert_speaking':
        const response = event.data as ExpertMessage;
        setActiveExpert(response.agent_id);
        setMessages(prev => [...prev, {
          ...response,
          agent_avatar: `/avatars/${response.agent_id}.png`,
        }]);
        setWorkflowSteps([
          { step: 'Panel Initialized', status: 'complete' },
          { step: 'Experts Selected', status: 'complete' },
          { step: `${response.agent_name} Responding`, status: 'active' },
        ]);
        // Clear active expert after 2 seconds
        setTimeout(() => setActiveExpert(null), 2000);
        break;

      case 'round_started':
        const roundNum = (event.data as any).round_number;
        setCurrentRound(roundNum);
        setWorkflowSteps([
          { step: 'Panel Initialized', status: 'complete' },
          { step: 'Experts Selected', status: 'complete' },
          { step: `Round ${roundNum} Started`, status: 'active' },
        ]);
        break;

      case 'round_complete':
        setCurrentRound(prev => prev + 1);
        setWorkflowSteps([
          { step: 'Panel Initialized', status: 'complete' },
          { step: 'Experts Selected', status: 'complete' },
          { step: `Round ${currentRound} Complete`, status: 'complete' },
        ]);
        break;

      case 'consensus':
        const consensusUpdate = event.data as ConsensusData;
        setConsensus(consensusUpdate);
        break;

      case 'complete':
        setPanelStatus('completed');
        setWorkflowSteps([
          { step: 'Panel Initialized', status: 'complete' },
          { step: 'Experts Selected', status: 'complete' },
          { step: 'Discussion Complete', status: 'complete' },
          { step: 'Consensus Reached', status: 'complete' },
        ]);
        break;

      case 'error':
        setPanelStatus('error');
        console.error('Panel error:', event.data);
        break;
    }
  };

  // Connect to SSE stream
  const { isConnected, disconnect } = usePanelStream({
    panelId,
    tenantId: tenantId || '',
    enabled: !isPaused && panelStatus !== 'completed',
    onEvent: handleStreamEvent,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isPaused]);

  // Status indicator
  const StatusIndicator = () => (
    <div className="flex items-center gap-2">
      {isConnected && panelStatus === 'running' && (
        <>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
        </>
      )}
      {panelStatus === 'connecting' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Connecting...</span>
        </>
      )}
      {panelStatus === 'completed' && (
        <>
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Completed</span>
        </>
      )}
      {panelStatus === 'error' && (
        <>
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">Error</span>
        </>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Discussion Area */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Panel Discussion
              </CardTitle>

              <div className="flex items-center gap-3">
                <StatusIndicator />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>

                <Badge variant="outline">Round {currentRound}</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Streaming Window */}
            {panelStatus === 'running' && (
              <div className="mb-4">
                <StreamingWindow
                  workflowSteps={workflowSteps}
                  reasoningSteps={currentReasoningSteps}
                  isStreaming={panelStatus === 'running'}
                  canPause={true}
                  onPause={() => setIsPaused(true)}
                  onResume={() => setIsPaused(false)}
                />
              </div>
            )}

            <div className="h-[600px] overflow-y-auto scrollbar-hide">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 p-4 rounded-lg transition-all",
                      activeExpert === message.agent_id
                        ? "bg-primary/5 border border-primary/20 animate-pulse-ring"
                        : "bg-muted/50"
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {message.agent_name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{message.agent_name}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {message.response_type}
                            </Badge>

                            {message.confidence_score && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(message.confidence_score * 100)}% confident
                              </span>
                            )}

                            <span className="text-xs text-muted-foreground">
                              Round {message.round_number}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Enhanced Message Content with Citations */}
                      <div className="text-sm leading-relaxed">
                        {message.metadata?.sources && message.metadata.sources.length > 0 ? (
                          renderTextWithCitations(message.content, message.metadata.sources)
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                      </div>

                      {/* Reasoning Display */}
                      {message.metadata?.reasoning && message.metadata.reasoning.length > 0 && (
                        <ReasoningDisplay reasoning={message.metadata.reasoning} />
                      )}

                      {/* Sources Panel */}
                      {message.metadata?.sources && message.metadata.sources.length > 0 && (
                        <SourcesPanel 
                          sources={message.metadata.sources.map((source, idx) => ({
                            ...source,
                            similarity: source.score
                          }))} 
                        />
                      )}

                      {activeExpert === message.agent_id && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Activity className="w-3 h-3 animate-pulse" />
                          Speaking...
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {messages.length === 0 && panelStatus === 'running' && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                    <p>Panel is starting...</p>
                    <p className="text-sm mt-1">Expert responses will appear here</p>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Consensus & Stats */}
      <div className="space-y-4">
        {/* Consensus Meter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Consensus Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConsensusMeter
              level={consensus?.level || 0}
              animated={panelStatus === 'running'}
            />

            {consensus && (
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-green-600 dark:text-green-400">
                    Agreement ({consensus.agreement_points.length})
                  </h4>
                  <ul className="text-xs space-y-1">
                    {consensus.agreement_points.slice(0, 3).map((point, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="flex-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {consensus.disagreement_points.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">
                      Discussion ({consensus.disagreement_points.length})
                    </h4>
                    <ul className="text-xs space-y-1">
                      {consensus.disagreement_points.slice(0, 3).map((point, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-amber-500 mt-0.5">!</span>
                          <span className="flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Messages</span>
              <span className="font-medium">{messages.length}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Experts</span>
              <span className="font-medium">
                {new Set(messages.map(m => m.agent_id)).size}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Round</span>
              <span className="font-medium">{currentRound}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Confidence</span>
              <span className="font-medium">
                {messages.length > 0
                  ? Math.round(
                      messages.reduce((sum, m) => sum + (m.confidence_score || 0), 0) /
                      messages.filter(m => m.confidence_score).length * 100
                    )
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {panelStatus === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Export & Share</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>

              <Button className="w-full" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CONSENSUS METER COMPONENT
// ============================================================================

interface ConsensusMeterProps {
  level: number;
  animated?: boolean;
}

function ConsensusMeter({ level, animated = true }: ConsensusMeterProps) {
  const percentage = Math.round(level * 100);

  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getLabel = () => {
    if (percentage >= 80) return 'Strong Consensus';
    if (percentage >= 60) return 'Moderate Consensus';
    if (percentage >= 40) return 'Mixed Opinions';
    return 'Low Agreement';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{percentage}%</span>
      </div>

      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", getColor())}
          style={{ width: `${percentage}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white mix-blend-difference">
            {getLabel()}
          </span>
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="grid grid-cols-4 gap-1">
        {[80, 60, 40, 20].map((threshold) => (
          <div
            key={threshold}
            className={cn(
              "h-1 rounded-full transition-colors",
              percentage >= threshold ? getColor() : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

