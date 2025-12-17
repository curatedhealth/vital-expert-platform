'use client';

/**
 * VITAL Platform - Panel Autonomous View Component
 *
 * Mode 4: Autonomous Panel Discussion
 * Clean, minimal UI for displaying panel mission progress,
 * expert responses, consensus building, and HITL checkpoints.
 */

import { useState } from 'react';
import {
  Users,
  Brain,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  BarChart3,
  Clock,
  Sparkles,
  Vote,
  Swords,
  Target,
  HelpCircle,
  LayoutList,
  Network,
  MessageCircle,
  Loader2,
} from 'lucide-react';

import { Button } from '@/lib/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shared/components/ui/card';
import { Badge } from '@/lib/shared/components/ui/badge';
import { Progress } from '@/lib/shared/components/ui/progress';
import { Textarea } from '@/lib/shared/components/ui/textarea';
import { cn } from '@/lib/shared/utils';

import type {
  PanelStreamState,
  ExpertResponse,
  ConsensusState,
  PanelCheckpoint,
  FinalOutput,
  OrchestratorMessage,
  OrchestratorState,
  TopicAnalysis,
} from '../hooks/panelStreamReducer';
import type { PanelType } from '@/lib/api/panel-client';
import { DebateNetworkView } from './DebateNetworkView';
import { DebateExchangeView } from './DebateExchangeView';

// View mode type - 'debate' is the new turn-by-turn view
type ViewMode = 'list' | 'network' | 'debate';

// =============================================================================
// TYPES
// =============================================================================

interface PanelAutonomousViewProps {
  state: PanelStreamState;
  isLoading: boolean;
  isStreaming: boolean;
  onResolveCheckpoint: (action: 'approve' | 'reject' | 'modify', feedback?: string) => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  className?: string;
}

// Panel type icons
const PANEL_TYPE_ICONS: Record<PanelType, React.ElementType> = {
  structured: Users,
  open: Sparkles,
  socratic: Brain,
  adversarial: Swords,
  delphi: Vote,
  hybrid: Target,
};

const PANEL_TYPE_LABELS: Record<PanelType, string> = {
  structured: 'Structured Panel',
  open: 'Open Discussion',
  socratic: 'Socratic Dialogue',
  adversarial: 'Adversarial Debate',
  delphi: 'Delphi Consensus',
  hybrid: 'Hybrid Panel',
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StatusBadge({ status }: { status: PanelStreamState['status'] }) {
  const statusConfig: Record<
    PanelStreamState['status'],
    { label: string; color: string; icon: React.ElementType; animate?: boolean }
  > = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600', icon: Clock },
    planning: { label: 'Planning', color: 'bg-blue-100 text-blue-700', icon: Brain, animate: true },
    selecting: { label: 'Selecting', color: 'bg-indigo-100 text-indigo-700', icon: Users, animate: true },
    executing: { label: 'Running', color: 'bg-emerald-100 text-emerald-700', icon: Loader2, animate: true },
    consensus: { label: 'Analyzing', color: 'bg-amber-100 text-amber-700', icon: BarChart3, animate: true },
    checkpoint: { label: 'Review', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    synthesizing: { label: 'Synthesizing', color: 'bg-purple-100 text-purple-700', icon: Sparkles, animate: true },
    completed: { label: 'Complete', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500', icon: XCircle },
    paused: { label: 'Paused', color: 'bg-slate-100 text-slate-600', icon: Pause },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
      <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />
      {config.label}
    </span>
  );
}

function ExpertCard({ expert, responses }: { expert: { id: string; name: string }; responses: ExpertResponse[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expertResponses = responses.filter((r) => r.expertId === expert.id);
  const latestResponse = expertResponses[expertResponses.length - 1];

  // Position colors
  const positionColors: Record<string, string> = {
    pro: 'bg-emerald-500',
    con: 'bg-rose-500',
    moderator: 'bg-violet-500',
  };
  const position = latestResponse?.position;
  const avatarColor = position ? positionColors[position] : 'bg-slate-400';

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium', avatarColor)}>
            {expert.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">{expert.name}</p>
            <p className="text-xs text-muted-foreground">
              {expertResponses.length} response{expertResponses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {latestResponse && (
            <span className="text-xs text-muted-foreground">
              {Math.round(latestResponse.confidence * 100)}%
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t bg-muted/20">
          <div className="space-y-3 pt-3">
            {expertResponses.map((response, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Round {response.round}</span>
                  {response.position && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded uppercase font-medium',
                      response.position === 'pro' && 'bg-emerald-100 text-emerald-700',
                      response.position === 'con' && 'bg-rose-100 text-rose-700',
                      response.position === 'moderator' && 'bg-violet-100 text-violet-700'
                    )}>
                      {response.position}
                    </span>
                  )}
                  {response.isStreaming && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 flex items-center gap-1">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      streaming
                    </span>
                  )}
                </div>
                <p className="text-foreground/90 leading-relaxed">
                  {response.content}
                  {response.isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConsensusDisplay({ consensus }: { consensus: ConsensusState }) {
  const levelConfig = {
    high: { color: 'bg-emerald-500', label: 'Strong' },
    medium: { color: 'bg-amber-500', label: 'Moderate' },
    low: { color: 'bg-rose-500', label: 'Weak' },
  };
  const config = levelConfig[consensus.consensusLevel];
  const scorePercent = Math.round(consensus.consensusScore * 100);

  return (
    <div className="rounded-lg border bg-card">
      {/* Header with score */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Consensus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', config.color)} style={{ width: `${scorePercent}%` }} />
          </div>
          <span className="text-sm font-medium">{scorePercent}%</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Agreement Points */}
        {consensus.agreementPoints.length > 0 && (
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Agreed</p>
            <ul className="space-y-1.5">
              {consensus.agreementPoints.map((point, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 text-foreground/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divergent Points */}
        {consensus.divergentPoints.length > 0 && (
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">Divergent</p>
            <ul className="space-y-1.5">
              {consensus.divergentPoints.map((point, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 text-foreground/80">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Themes */}
        {consensus.keyThemes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Themes</p>
            <div className="flex flex-wrap gap-1.5">
              {consensus.keyThemes.map((theme, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {consensus.recommendation && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Recommendation</p>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{consensus.recommendation}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckpointDialog({
  checkpoint,
  onResolve,
}: {
  checkpoint: PanelCheckpoint;
  onResolve: (action: 'approve' | 'reject' | 'modify', feedback?: string) => void;
}) {
  const [feedback, setFeedback] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'modify' | null>(null);

  const handleSubmit = () => {
    if (selectedAction) {
      onResolve(selectedAction, feedback || undefined);
    }
  };

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50/80 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-100/50 border-b border-amber-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-amber-900">{checkpoint.title}</p>
          <p className="text-xs text-amber-700">{checkpoint.description}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-white/80">
            <p className="text-lg font-semibold text-foreground">{checkpoint.expertCount}</p>
            <p className="text-xs text-muted-foreground">Experts</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/80">
            <p className="text-lg font-semibold text-foreground">{checkpoint.roundCount}</p>
            <p className="text-xs text-muted-foreground">Rounds</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/80">
            <p className="text-lg font-semibold text-foreground">{Math.round(checkpoint.consensusScore * 100)}%</p>
            <p className="text-xs text-muted-foreground">Consensus</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
              selectedAction === 'approve'
                ? 'bg-emerald-500 text-white'
                : 'bg-white border hover:bg-emerald-50 text-emerald-700 border-emerald-200'
            )}
            onClick={() => setSelectedAction('approve')}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </button>
          <button
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
              selectedAction === 'modify'
                ? 'bg-blue-500 text-white'
                : 'bg-white border hover:bg-blue-50 text-blue-700 border-blue-200'
            )}
            onClick={() => setSelectedAction('modify')}
          >
            <MessageSquare className="h-4 w-4" />
            Modify
          </button>
          <button
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
              selectedAction === 'reject'
                ? 'bg-rose-500 text-white'
                : 'bg-white border hover:bg-rose-50 text-rose-700 border-rose-200'
            )}
            onClick={() => setSelectedAction('reject')}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>

        {/* Feedback area */}
        {(selectedAction === 'modify' || selectedAction === 'reject') && (
          <Textarea
            placeholder="Provide feedback or instructions..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[80px] bg-white"
          />
        )}

        {/* Submit */}
        {selectedAction && (
          <Button onClick={handleSubmit} className="w-full">
            Submit Response
          </Button>
        )}
      </div>
    </div>
  );
}

function FinalOutputDisplay({ output }: { output: FinalOutput }) {
  return (
    <div className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-emerald-100/50 border-b border-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-emerald-900">Final Synthesis</p>
            <p className="text-xs text-emerald-700">{output.expertCount} experts • {output.roundCount} rounds</p>
          </div>
        </div>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{output.content}</p>

        {output.artifacts && output.artifacts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-2">Artifacts</p>
            <div className="space-y-2">
              {output.artifacts.map((artifact) => (
                <div key={artifact.id} className="p-3 rounded-lg bg-white/80 border border-emerald-100">
                  <span className="text-xs text-muted-foreground">{artifact.type}</span>
                  <p className="font-medium text-sm">{artifact.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Orchestrator Message Display
 * Shows orchestrator thinking, messages, decisions, and interventions
 */
function OrchestratorMessageCard({ orchestrator }: { orchestrator: OrchestratorState }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const latestMessages = orchestrator.messages.slice(-3); // Show last 3 messages
  const hasMoreMessages = orchestrator.messages.length > 3;

  if (orchestrator.messages.length === 0 && !orchestrator.isThinking) {
    return null;
  }

  const messageTypeStyles: Record<OrchestratorMessage['type'], { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
    thinking: { bg: 'bg-blue-50/80', border: 'border-blue-200', icon: Brain, iconColor: 'text-blue-500' },
    message: { bg: 'bg-slate-50/80', border: 'border-slate-200', icon: MessageSquare, iconColor: 'text-slate-500' },
    decision: { bg: 'bg-violet-50/80', border: 'border-violet-200', icon: Target, iconColor: 'text-violet-500' },
    intervention: { bg: 'bg-amber-50/80', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <button
        className="w-full px-4 py-3 border-b bg-gradient-to-r from-violet-50/50 to-indigo-50/50 flex items-center justify-between hover:bg-violet-50/80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center relative">
            <Brain className="h-4 w-4 text-white" />
            {orchestrator.isThinking && (
              <span className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">{orchestrator.name}</p>
            <p className="text-xs text-muted-foreground">
              {orchestrator.isThinking ? orchestrator.currentPhase || 'Analyzing...' : `${orchestrator.messages.length} updates`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {orchestrator.isThinking && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Messages */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-3">
          {/* Topic Analysis Summary */}
          {orchestrator.topicAnalysis && (
            <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-700">Topic Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Domain:</span>
                  <span className="ml-1 font-medium">{orchestrator.topicAnalysis.domain}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Complexity:</span>
                  <span className={cn(
                    'ml-1 font-medium',
                    orchestrator.topicAnalysis.complexity === 'High' && 'text-rose-600',
                    orchestrator.topicAnalysis.complexity === 'Medium' && 'text-amber-600',
                    orchestrator.topicAnalysis.complexity === 'Low' && 'text-emerald-600',
                  )}>
                    {orchestrator.topicAnalysis.complexity}
                  </span>
                </div>
              </div>
              {orchestrator.topicAnalysis.discussionFocus && (
                <p className="mt-2 text-xs text-muted-foreground italic">
                  Focus: {orchestrator.topicAnalysis.discussionFocus}
                </p>
              )}
            </div>
          )}

          {/* Show more button */}
          {hasMoreMessages && (
            <button className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 flex items-center justify-center gap-1 rounded hover:bg-muted/50 transition-colors">
              <span>{orchestrator.messages.length - 3} earlier messages</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          )}

          {/* Latest messages */}
          {latestMessages.map((message) => {
            const styles = messageTypeStyles[message.type];
            const Icon = styles.icon;
            return (
              <div
                key={message.id}
                className={cn('p-3 rounded-lg border', styles.bg, styles.border)}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', styles.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {message.phase && (
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {message.phase}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{message.message}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current thinking state */}
          {orchestrator.isThinking && (
            <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-700">
                  {orchestrator.currentPhase || 'Processing...'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PanelAutonomousView({
  state,
  isLoading,
  isStreaming,
  onResolveCheckpoint,
  onPause,
  onResume,
  onCancel,
  className,
}: PanelAutonomousViewProps) {
  const PanelIcon = PANEL_TYPE_ICONS[state.panelType] || Users;
  const allResponses = state.roundResponses.flat();

  // View mode state - default to debate view for adversarial panels
  const isDebateTopology = state.topology === 'debate' || state.panelType === 'adversarial';
  const [viewMode, setViewMode] = useState<ViewMode>(
    isDebateTopology ? 'debate' : 'list'
  );

  // Control buttons
  const showPause = isStreaming && state.status !== 'checkpoint';
  const showResume = state.status === 'paused';
  const showCancel =
    state.status !== 'completed' && state.status !== 'failed' && state.status !== 'cancelled';

  // Show view toggle for debates (adversarial or debate topology)
  const hasDebatePositions = allResponses.some((r) => r.position === 'pro' || r.position === 'con');
  const showViewToggle = isDebateTopology || hasDebatePositions;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Top bar */}
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center',
              isDebateTopology ? 'bg-gradient-to-br from-rose-500 to-violet-500' : 'bg-gradient-to-br from-violet-500 to-indigo-500'
            )}>
              <PanelIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">{PANEL_TYPE_LABELS[state.panelType]}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{state.goal}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {showViewToggle && (
              <div className="flex items-center rounded-lg p-0.5 bg-muted">
                <button
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'debate' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  )}
                  onClick={() => setViewMode('debate')}
                  title="Debate View"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
                <button
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'network' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  )}
                  onClick={() => setViewMode('network')}
                  title="Network View"
                >
                  <Network className="h-3.5 w-3.5" />
                </button>
                <button
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  )}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <StatusBadge status={state.status} />
            {showPause && (
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" onClick={onPause} title="Pause">
                <Pause className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {showResume && (
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" onClick={onResume} title="Resume">
                <Play className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {showCancel && (
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" onClick={onCancel} title="Cancel">
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Progress section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Progress bar */}
            <div className="flex-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    state.status === 'completed' ? 'bg-emerald-500' :
                    state.status === 'failed' ? 'bg-rose-500' :
                    'bg-violet-500'
                  )}
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{state.progress}%</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {state.expertCount} experts
            </span>
            <span>Round {state.currentRound}/{state.maxRounds}</span>
            {isDebateTopology && (
              <span className="flex items-center gap-1">
                <Swords className="h-3 w-3" />
                {state.topology === 'debate' ? 'Turn-Based' : 'Debate'}
              </span>
            )}
          </div>

          {/* Active turn indicator */}
          {isDebateTopology && state.currentTurn && (
            <div className="mt-3 flex justify-center">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white animate-pulse',
                state.currentTurn.position === 'pro' && 'bg-emerald-500',
                state.currentTurn.position === 'con' && 'bg-rose-500',
                state.currentTurn.position === 'moderator' && 'bg-violet-500'
              )}>
                <Loader2 className="h-3 w-3 animate-spin" />
                {state.currentTurn.position.toUpperCase()} is speaking...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Orchestrator Messages */}
      <OrchestratorMessageCard orchestrator={state.orchestrator} />

      {/* Checkpoint (if pending) */}
      {state.checkpoint && (
        <CheckpointDialog checkpoint={state.checkpoint} onResolve={onResolveCheckpoint} />
      )}

      {/* Debate View - Turn-by-Turn Exchange Display */}
      {viewMode === 'debate' && isDebateTopology && (
        <DebateExchangeView state={state} />
      )}

      {/* Network View - Debate Visualization */}
      {viewMode === 'network' && showViewToggle && (
        <DebateNetworkView
          experts={state.experts}
          roundResponses={state.roundResponses}
          consensus={state.consensus}
          currentRound={state.currentRound}
          maxRounds={state.maxRounds}
          panelType={state.panelType}
          goal={state.goal}
        />
      )}

      {/* List View - Traditional Card Display */}
      {viewMode === 'list' && state.experts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Expert Responses
            </p>
            <span className="text-xs text-muted-foreground">{allResponses.length} total</span>
          </div>
          <div className="grid gap-2">
            {state.experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} responses={allResponses} />
            ))}
          </div>
        </div>
      )}

      {/* Consensus - Show in list view */}
      {state.consensus && viewMode === 'list' && <ConsensusDisplay consensus={state.consensus} />}

      {/* Final Output */}
      {state.finalOutput && <FinalOutputDisplay output={state.finalOutput} />}

      {/* Error Display */}
      {state.error && (
        <div className="rounded-lg border-2 border-rose-200 bg-rose-50/80 overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-rose-900 text-sm">Error</p>
              <p className="text-sm text-rose-700">{state.error.message}</p>
              {state.error.recoverable && (
                <p className="text-xs text-rose-600 mt-1">
                  This error may be recoverable. Try resuming or starting a new panel.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelAutonomousView;
