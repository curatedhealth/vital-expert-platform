'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  User,
  Zap,
  GitBranch,
  Loader2,
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui/tooltip';
import { Progress } from '../../ui/progress';

type DelegationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

interface Agent {
  id: string;
  name: string;
  level: AgentLevel;
  domain?: string;
  avatar?: string;
}

interface DelegationNode {
  id: string;
  from: Agent;
  to: Agent;
  task: string;
  reason?: string;
  status: DelegationStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  result?: string;
  error?: string;
  children?: DelegationNode[];
  metadata?: {
    tokensUsed?: number;
    cost?: number;
    toolsCalled?: string[];
  };
}

interface VitalDelegationTraceProps {
  delegations: DelegationNode[];
  showTiming?: boolean;
  showCost?: boolean;
  expandAll?: boolean;
  className?: string;
}

const statusConfig: Record<
  DelegationStatus,
  { icon: typeof Clock; color: string; bgColor: string; label: string }
> = {
  pending: {
    icon: Clock,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    label: 'Pending',
  },
  in_progress: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'In Progress',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Completed',
  },
  failed: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Failed',
  },
  skipped: {
    icon: ArrowRight,
    color: 'text-slate-400',
    bgColor: 'bg-slate-50',
    label: 'Skipped',
  },
};

const levelColors: Record<AgentLevel, string> = {
  L1: 'bg-purple-100 text-purple-700 border-purple-200',
  L2: 'bg-blue-100 text-blue-700 border-blue-200',
  L3: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  L4: 'bg-green-100 text-green-700 border-green-200',
  L5: 'bg-orange-100 text-orange-700 border-orange-200',
};

export function VitalDelegationTrace({
  delegations,
  showTiming = true,
  showCost = false,
  expandAll = false,
  className,
}: VitalDelegationTraceProps) {
  const totalDelegations = countDelegations(delegations);
  const completedDelegations = countByStatus(delegations, 'completed');
  const failedDelegations = countByStatus(delegations, 'failed');
  const progress = (completedDelegations / totalDelegations) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Delegation Trace</h3>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {completedDelegations}/{totalDelegations} complete
          </span>
          {failedDelegations > 0 && (
            <Badge variant="destructive" className="text-xs">
              {failedDelegations} failed
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5" />

      {/* Delegation tree */}
      <div className="space-y-2">
        {delegations.map((delegation) => (
          <DelegationNodeCard
            key={delegation.id}
            node={delegation}
            depth={0}
            showTiming={showTiming}
            showCost={showCost}
            defaultExpanded={expandAll}
          />
        ))}
      </div>
    </div>
  );
}

function DelegationNodeCard({
  node,
  depth,
  showTiming,
  showCost,
  defaultExpanded,
}: {
  node: DelegationNode;
  depth: number;
  showTiming: boolean;
  showCost: boolean;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const config = statusConfig[node.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn('relative', depth > 0 && 'ml-6')}
      style={{ marginLeft: depth > 0 ? depth * 24 : 0 }}
    >
      {/* Connector line */}
      {depth > 0 && (
        <div className="absolute left-[-12px] top-0 bottom-0 w-px bg-border" />
      )}

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div
          className={cn(
            'border rounded-lg overflow-hidden',
            node.status === 'failed' && 'border-red-200',
            node.status === 'in_progress' && 'border-blue-200 shadow-sm'
          )}
        >
          {/* Main content */}
          <CollapsibleTrigger asChild>
            <button className="w-full text-left p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className={cn('p-1.5 rounded', config.bgColor)}>
                  <StatusIcon
                    className={cn(
                      'h-4 w-4',
                      config.color,
                      node.status === 'in_progress' && 'animate-spin'
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Agent delegation flow */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <AgentBadge agent={node.from} />
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <AgentBadge agent={node.to} />
                  </div>

                  {/* Task */}
                  <p className="text-sm mt-1 line-clamp-2">{node.task}</p>

                  {/* Reason */}
                  {node.reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {node.reason}
                    </p>
                  )}

                  {/* Metadata row */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {showTiming && node.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(node.duration)}
                      </span>
                    )}
                    {showCost && node.metadata?.cost && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        ${node.metadata.cost.toFixed(4)}
                      </span>
                    )}
                    {node.metadata?.toolsCalled && node.metadata.toolsCalled.length > 0 && (
                      <span className="flex items-center gap-1">
                        Tools: {node.metadata.toolsCalled.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand indicator */}
                {hasChildren && (
                  <div className="shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          {/* Result or error */}
          {(node.result || node.error) && (
            <div
              className={cn(
                'px-3 pb-3 pt-0',
                node.error ? 'text-red-600' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'text-xs p-2 rounded',
                  node.error ? 'bg-red-50' : 'bg-muted/50'
                )}
              >
                {node.error || node.result}
              </div>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && (
          <CollapsibleContent>
            <div className="mt-2 space-y-2">
              {node.children!.map((child) => (
                <DelegationNodeCard
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  showTiming={showTiming}
                  showCost={showCost}
                  defaultExpanded={defaultExpanded}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

function AgentBadge({ agent }: { agent: Agent }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={cn('text-xs', levelColors[agent.level])}>
          <span className="font-mono mr-1">{agent.level}</span>
          {agent.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <div className="font-medium">{agent.name}</div>
          <div className="text-muted-foreground">
            {agent.level} Agent
            {agent.domain && ` • ${agent.domain}`}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Helper functions
function countDelegations(nodes: DelegationNode[]): number {
  return nodes.reduce((count, node) => {
    return count + 1 + (node.children ? countDelegations(node.children) : 0);
  }, 0);
}

function countByStatus(nodes: DelegationNode[], status: DelegationStatus): number {
  return nodes.reduce((count, node) => {
    const nodeCount = node.status === status ? 1 : 0;
    const childCount = node.children ? countByStatus(node.children, status) : 0;
    return count + nodeCount + childCount;
  }, 0);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export type {
  DelegationStatus,
  AgentLevel,
  Agent,
  DelegationNode,
  VitalDelegationTraceProps,
};
