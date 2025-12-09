'use client';

import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import {
  Users,
  Brain,
  Loader2,
  CheckCircle,
  ChevronRight,
  Zap,
  Star,
  BarChart3,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type AssemblyPhase = 'analyzing' | 'scoring' | 'selecting' | 'assembling' | 'ready';

export interface AgentCandidate {
  id: string;
  name: string;
  level: 'L2' | 'L3' | 'L4';
  domain: string;
  avatar?: string;
  rrfScore?: number;
  selected?: boolean;
  skills?: string[];
  specialty?: string;
}

export interface VitalTeamAssemblyViewProps {
  /** Current assembly phase */
  phase: AssemblyPhase;
  /** Progress within current phase (0-100) */
  progress?: number;
  /** Agent candidates being considered */
  candidates: AgentCandidate[];
  /** Final selected team */
  selectedTeam?: AgentCandidate[];
  /** L1 Master orchestrator info */
  orchestrator?: {
    name: string;
    avatar?: string;
  };
  /** RRF scores being calculated */
  rrfScores?: {
    vector: number;
    graph: number;
    relational: number;
    fused: number;
  };
  /** Estimated assembly time */
  estimatedTime?: string;
  /** Callback when assembly complete */
  onComplete?: () => void;
  /** Callback to start mission */
  onStartMission?: () => void;
  /** Custom class name */
  className?: string;
}

const phaseConfig: Record<AssemblyPhase, { label: string; description: string; icon: typeof Brain }> = {
  analyzing: {
    label: 'Analyzing Query',
    description: 'Understanding mission requirements...',
    icon: Brain,
  },
  scoring: {
    label: 'Scoring Agents',
    description: 'Calculating Hybrid RRF scores...',
    icon: BarChart3,
  },
  selecting: {
    label: 'Selecting Team',
    description: 'Choosing optimal agent configuration...',
    icon: Star,
  },
  assembling: {
    label: 'Assembling Team',
    description: 'Initializing agent connections...',
    icon: Users,
  },
  ready: {
    label: 'Team Ready',
    description: 'Your expert team is assembled!',
    icon: CheckCircle,
  },
};

/**
 * VitalTeamAssemblyView - Agent Team Selection Visualization
 * 
 * Visualizes the AI selecting and assembling the L2 Expert Team.
 * Shows "Drafting" animation with the L1 Master picking agents based on Hybrid RRF scores.
 * Layout: Parallel execution grid (3-4 columns).
 * 
 * @example
 * ```tsx
 * <VitalTeamAssemblyView
 *   phase="selecting"
 *   progress={65}
 *   candidates={agentCandidates}
 *   rrfScores={{ vector: 0.35, graph: 0.28, relational: 0.22, fused: 0.85 }}
 *   onComplete={() => teamAssembled()}
 * />
 * ```
 */
export function VitalTeamAssemblyView({
  phase,
  progress = 0,
  candidates,
  selectedTeam,
  orchestrator,
  rrfScores,
  estimatedTime,
  onComplete,
  onStartMission,
  className,
}: VitalTeamAssemblyViewProps) {
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});
  const phaseInfo = phaseConfig[phase];
  const PhaseIcon = phaseInfo.icon;

  // Animate RRF scores during scoring phase
  useEffect(() => {
    if (phase === 'scoring' && candidates.length > 0) {
      const interval = setInterval(() => {
        setAnimatedScores(prev => {
          const updated = { ...prev };
          candidates.forEach(candidate => {
            const target = candidate.rrfScore || Math.random() * 100;
            const current = prev[candidate.id] || 0;
            updated[candidate.id] = current + (target - current) * 0.1;
          });
          return updated;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [phase, candidates]);

  // Call onComplete when ready
  useEffect(() => {
    if (phase === 'ready') {
      onComplete?.();
    }
  }, [phase, onComplete]);

  const renderAgentCard = (agent: AgentCandidate, isSelecting: boolean) => {
    const score = animatedScores[agent.id] || agent.rrfScore || 0;
    const isSelected = agent.selected || selectedTeam?.some(a => a.id === agent.id);

    return (
      <Card
        key={agent.id}
        className={cn(
          'transition-all duration-500',
          isSelected && 'ring-2 ring-primary bg-primary/5',
          isSelecting && !isSelected && 'opacity-50',
          phase === 'selecting' && !isSelected && 'animate-pulse'
        )}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent.avatar} />
              <AvatarFallback className="text-xs">
                {agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">{agent.name}</CardTitle>
              <CardDescription className="text-xs">
                {agent.level} • {agent.domain}
              </CardDescription>
            </div>
            {isSelected && (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {/* RRF Score */}
          {(phase === 'scoring' || phase === 'selecting') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">RRF Score</span>
                <span className="font-mono font-medium">{Math.round(score)}%</span>
              </div>
              <Progress value={score} className="h-1" />
            </div>
          )}

          {/* Skills */}
          {agent.skills && phase === 'ready' && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Phase Info */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className={cn(
            'p-3 rounded-full',
            phase === 'ready' ? 'bg-green-100' : 'bg-primary/10'
          )}>
            {phase === 'ready' ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <PhaseIcon className={cn(
                'h-6 w-6 text-primary',
                phase !== 'ready' && 'animate-pulse'
              )} />
            )}
          </div>
        </div>
        <h2 className="text-xl font-semibold">{phaseInfo.label}</h2>
        <p className="text-sm text-muted-foreground">{phaseInfo.description}</p>

        {/* Overall Progress */}
        {phase !== 'ready' && (
          <div className="max-w-xs mx-auto space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              {estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {estimatedTime}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* L1 Orchestrator */}
      {orchestrator && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
          <Avatar className="h-12 w-12 ring-2 ring-purple-500 ring-offset-2">
            <AvatarImage src={orchestrator.avatar} />
            <AvatarFallback>L1</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="font-medium">{orchestrator.name}</span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              L1 Master Orchestrator
            </p>
          </div>
          {phase !== 'ready' && (
            <Loader2 className="h-5 w-5 animate-spin text-purple-500 ml-auto" />
          )}
        </div>
      )}

      {/* RRF Scores Display */}
      {rrfScores && (phase === 'scoring' || phase === 'selecting') && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Vector', value: rrfScores.vector, color: 'text-blue-600' },
            { label: 'Graph', value: rrfScores.graph, color: 'text-purple-600' },
            { label: 'Relational', value: rrfScores.relational, color: 'text-amber-600' },
            { label: 'Fused', value: rrfScores.fused, color: 'text-green-600' },
          ].map((score) => (
            <div key={score.label} className="text-center p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">{score.label}</p>
              <p className={cn('text-lg font-bold', score.color)}>
                {Math.round(score.value * 100)}%
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Agent Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {phase === 'ready' ? 'Selected Team' : 'Agent Candidates'}
          </h3>
          <Badge variant="outline">
            {selectedTeam?.length || candidates.filter(c => c.selected).length} / {candidates.length}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(selectedTeam || candidates).map((agent) =>
            renderAgentCard(agent, phase === 'selecting')
          )}
        </div>
      </div>

      {/* Action Button */}
      {phase === 'ready' && onStartMission && (
        <div className="text-center">
          <Button size="lg" onClick={onStartMission}>
            <Zap className="h-5 w-5 mr-2" />
            Start Mission
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default VitalTeamAssemblyView;
