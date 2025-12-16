'use client';

/**
 * VITAL Platform - Panel Autonomous View Component
 *
 * Mode 4: Autonomous Panel Discussion
 * Displays the panel mission progress, expert responses,
 * consensus building, and HITL checkpoints.
 */

import { useCallback, useState } from 'react';
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
  DollarSign,
  Sparkles,
  Vote,
  Swords,
  Target,
  HelpCircle,
} from 'lucide-react';

import { Button } from '@/lib/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shared/components/ui/card';
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
} from '../hooks/panelStreamReducer';
import type { PanelType } from '@/lib/api/panel-client';

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
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }
  > = {
    pending: { label: 'Pending', variant: 'outline', icon: Clock },
    planning: { label: 'Planning', variant: 'secondary', icon: Brain },
    selecting: { label: 'Selecting Experts', variant: 'secondary', icon: Users },
    executing: { label: 'In Discussion', variant: 'default', icon: MessageSquare },
    consensus: { label: 'Building Consensus', variant: 'default', icon: BarChart3 },
    checkpoint: { label: 'Awaiting Review', variant: 'outline', icon: AlertTriangle },
    synthesizing: { label: 'Synthesizing', variant: 'default', icon: Sparkles },
    completed: { label: 'Completed', variant: 'secondary', icon: CheckCircle2 },
    failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
    cancelled: { label: 'Cancelled', variant: 'outline', icon: XCircle },
    paused: { label: 'Paused', variant: 'outline', icon: Pause },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function ExpertCard({ expert, responses }: { expert: { id: string; name: string }; responses: ExpertResponse[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expertResponses = responses.filter((r) => r.expertId === expert.id);
  const latestResponse = expertResponses[expertResponses.length - 1];

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-sm">{expert.name}</CardTitle>
              <CardDescription className="text-xs">
                {expertResponses.length} response{expertResponses.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {latestResponse && (
              <Badge variant="outline" className="text-xs">
                {Math.round(latestResponse.confidence * 100)}% confidence
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 border-t">
          <div className="space-y-3 mt-3">
            {expertResponses.map((response, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span>Round {response.round}</span>
                  {response.position && (
                    <Badge variant="outline" className="text-xs">
                      {response.position}
                    </Badge>
                  )}
                </div>
                <p className="text-foreground whitespace-pre-wrap">{response.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ConsensusDisplay({ consensus }: { consensus: ConsensusState }) {
  const levelColors = {
    high: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    low: 'text-red-600 bg-red-100',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Consensus Analysis
          </CardTitle>
          <Badge className={cn('capitalize', levelColors[consensus.consensusLevel])}>
            {consensus.consensusLevel} ({Math.round(consensus.consensusScore * 100)}%)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-green-600 mb-2">Agreement Points</h4>
          <ul className="space-y-1">
            {consensus.agreementPoints.map((point, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {consensus.divergentPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-amber-600 mb-2">Divergent Points</h4>
            <ul className="space-y-1">
              {consensus.divergentPoints.map((point, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {consensus.keyThemes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Key Themes</h4>
            <div className="flex flex-wrap gap-1">
              {consensus.keyThemes.map((theme, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {consensus.recommendation && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Recommendation</h4>
            <p className="text-sm text-muted-foreground">{consensus.recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
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
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base">{checkpoint.title}</CardTitle>
        </div>
        <CardDescription>{checkpoint.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          <div className="p-2 bg-white rounded-lg">
            <div className="font-medium">{checkpoint.expertCount}</div>
            <div className="text-xs text-muted-foreground">Experts</div>
          </div>
          <div className="p-2 bg-white rounded-lg">
            <div className="font-medium">{checkpoint.roundCount}</div>
            <div className="text-xs text-muted-foreground">Rounds</div>
          </div>
          <div className="p-2 bg-white rounded-lg">
            <div className="font-medium">{Math.round(checkpoint.consensusScore * 100)}%</div>
            <div className="text-xs text-muted-foreground">Consensus</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedAction === 'approve' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setSelectedAction('approve')}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant={selectedAction === 'modify' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setSelectedAction('modify')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Modify
          </Button>
          <Button
            variant={selectedAction === 'reject' ? 'destructive' : 'outline'}
            className="flex-1"
            onClick={() => setSelectedAction('reject')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>

        {(selectedAction === 'modify' || selectedAction === 'reject') && (
          <div>
            <Textarea
              placeholder="Provide feedback or instructions..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}

        {selectedAction && (
          <Button onClick={handleSubmit} className="w-full">
            Submit Response
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FinalOutputDisplay({ output }: { output: FinalOutput }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Final Synthesis
        </CardTitle>
        <CardDescription>
          Based on {output.expertCount} experts over {output.roundCount} rounds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{output.content}</p>
        </div>

        {output.artifacts && output.artifacts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Artifacts</h4>
            <div className="space-y-2">
              {output.artifacts.map((artifact) => (
                <Card key={artifact.id} className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">{artifact.type}</div>
                  <div className="font-medium text-sm">{artifact.title}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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

  // Control buttons
  const showPause = isStreaming && state.status !== 'checkpoint';
  const showResume = state.status === 'paused';
  const showCancel =
    state.status !== 'completed' && state.status !== 'failed' && state.status !== 'cancelled';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <PanelIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {PANEL_TYPE_LABELS[state.panelType]}
                </CardTitle>
                <CardDescription className="line-clamp-1">{state.goal}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={state.status} />
              {showPause && (
                <Button variant="outline" size="sm" onClick={onPause}>
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              {showResume && (
                <Button variant="outline" size="sm" onClick={onResume}>
                  <Play className="h-4 w-4" />
                </Button>
              )}
              {showCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span>{state.progress}%</span>
            </div>
            <Progress value={state.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Round {state.currentRound}/{state.maxRounds}
              </span>
              <span>{state.expertCount} experts</span>
              {state.totalCost > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {state.totalCost.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoint (if pending) */}
      {state.checkpoint && (
        <CheckpointDialog checkpoint={state.checkpoint} onResolve={onResolveCheckpoint} />
      )}

      {/* Expert Responses */}
      {state.experts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Expert Responses ({allResponses.length})
          </h3>
          <div className="grid gap-2">
            {state.experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} responses={allResponses} />
            ))}
          </div>
        </div>
      )}

      {/* Consensus */}
      {state.consensus && <ConsensusDisplay consensus={state.consensus} />}

      {/* Final Output */}
      {state.finalOutput && <FinalOutputDisplay output={state.finalOutput} />}

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{state.error.message}</p>
            {state.error.recoverable && (
              <p className="text-xs text-muted-foreground mt-2">
                This error may be recoverable. Try resuming or starting a new panel.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PanelAutonomousView;
