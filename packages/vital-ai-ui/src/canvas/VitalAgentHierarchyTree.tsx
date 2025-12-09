'use client';

import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  Zap,
  Brain,
  Users,
  Wrench,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export type AgentStatus = 'idle' | 'active' | 'waiting' | 'done' | 'error';
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface AgentNode {
  id: string;
  name: string;
  level: AgentLevel;
  status: AgentStatus;
  domain?: string;
  task?: string;
  startTime?: Date;
  endTime?: Date;
  tokensUsed?: number;
  cost?: number;
  children?: AgentNode[];
  toolCalls?: number;
}

export interface VitalAgentHierarchyTreeProps {
  /** Root agent (L1 Master) */
  root: AgentNode;
  /** Whether to show timing information */
  showTiming?: boolean;
  /** Whether to show cost information */
  showCost?: boolean;
  /** Whether to animate active agents */
  animate?: boolean;
  /** Default expanded depth */
  defaultExpandedDepth?: number;
  /** Callback when agent clicked */
  onAgentClick?: (agent: AgentNode) => void;
  /** Custom class name */
  className?: string;
}

const levelConfig: Record<AgentLevel, { icon: typeof Brain; color: string; bg: string; label: string }> = {
  L1: { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Master Orchestrator' },
  L2: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Domain Expert' },
  L3: { icon: Zap, color: 'text-cyan-600', bg: 'bg-cyan-100', label: 'Task Specialist' },
  L4: { icon: Database, color: 'text-green-600', bg: 'bg-green-100', label: 'Context Worker' },
  L5: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Tool' },
};

const statusConfig: Record<AgentStatus, { color: string; pulseColor: string; label: string }> = {
  idle: { color: 'bg-gray-400', pulseColor: '', label: 'Idle' },
  active: { color: 'bg-blue-500', pulseColor: 'animate-pulse', label: 'Active' },
  waiting: { color: 'bg-amber-500', pulseColor: 'animate-pulse', label: 'Waiting' },
  done: { color: 'bg-green-500', pulseColor: '', label: 'Done' },
  error: { color: 'bg-red-500', pulseColor: '', label: 'Error' },
};

/**
 * VitalAgentHierarchyTree - Agent Team Observability
 * 
 * Visualizes the active L1->L5 agent team structure in real-time.
 * Dynamic tree graph showing L1 Master spawning L2 Experts and L3 Specialists.
 * Nodes pulse "Active", "Waiting", or "Done".
 * 
 * @example
 * ```tsx
 * <VitalAgentHierarchyTree
 *   root={{
 *     id: 'l1',
 *     name: 'Master Orchestrator',
 *     level: 'L1',
 *     status: 'active',
 *     children: [
 *       {
 *         id: 'l2-clinical',
 *         name: 'Clinical Expert',
 *         level: 'L2',
 *         status: 'active',
 *         children: [...]
 *       }
 *     ]
 *   }}
 *   showTiming
 *   showCost
 * />
 * ```
 */
export function VitalAgentHierarchyTree({
  root,
  showTiming = false,
  showCost = false,
  animate = true,
  defaultExpandedDepth = 3,
  onAgentClick,
  className,
}: VitalAgentHierarchyTreeProps) {
  // Count total agents and active agents
  const stats = useMemo(() => {
    let total = 0;
    let active = 0;
    let done = 0;
    let totalCost = 0;
    let totalTokens = 0;

    const countAgents = (node: AgentNode) => {
      total++;
      if (node.status === 'active' || node.status === 'waiting') active++;
      if (node.status === 'done') done++;
      if (node.cost) totalCost += node.cost;
      if (node.tokensUsed) totalTokens += node.tokensUsed;
      node.children?.forEach(countAgents);
    };

    countAgents(root);
    return { total, active, done, totalCost, totalTokens };
  }, [root]);

  const renderAgent = (agent: AgentNode, depth: number = 0) => {
    const levelCfg = levelConfig[agent.level];
    const statusCfg = statusConfig[agent.status];
    const LevelIcon = levelCfg.icon;
    const hasChildren = agent.children && agent.children.length > 0;
    const isExpanded = depth < defaultExpandedDepth;

    const duration = agent.startTime && agent.endTime
      ? Math.round((agent.endTime.getTime() - agent.startTime.getTime()) / 1000)
      : agent.startTime
      ? Math.round((Date.now() - agent.startTime.getTime()) / 1000)
      : null;

    const AgentContent = (
      <div
        className={cn(
          'flex items-center gap-3 py-2 px-3 rounded-lg',
          'hover:bg-muted/50 transition-colors cursor-pointer',
          agent.status === 'active' && animate && 'bg-blue-50 dark:bg-blue-950/30'
        )}
        onClick={() => onAgentClick?.(agent)}
      >
        {/* Status Indicator */}
        <div className="relative">
          <span
            className={cn(
              'block w-2.5 h-2.5 rounded-full',
              statusCfg.color,
              animate && statusCfg.pulseColor
            )}
          />
          {agent.status === 'active' && animate && (
            <span
              className={cn(
                'absolute inset-0 w-2.5 h-2.5 rounded-full',
                statusCfg.color,
                'animate-ping opacity-75'
              )}
            />
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={cn('p-1 rounded', levelCfg.bg)}>
              <LevelIcon className={cn('h-3.5 w-3.5', levelCfg.color)} />
            </div>
            <span className="font-medium text-sm truncate">{agent.name}</span>
            <Badge variant="outline" className="text-[10px]">
              {agent.level}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-1">
            {agent.domain && (
              <span className="text-xs text-muted-foreground">{agent.domain}</span>
            )}
            {agent.task && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                → {agent.task}
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {showTiming && duration !== null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {duration}s
                  </span>
                </TooltipTrigger>
                <TooltipContent>Duration</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {showCost && agent.cost !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="text-[10px]">
                    ${agent.cost.toFixed(4)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Cost: ${agent.cost.toFixed(4)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {agent.toolCalls !== undefined && agent.toolCalls > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {agent.toolCalls}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{agent.toolCalls} tool calls</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Status Icon */}
          {agent.status === 'active' && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
          {agent.status === 'done' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {agent.status === 'error' && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
    );

    if (!hasChildren) {
      return <div key={agent.id} className="ml-4">{AgentContent}</div>;
    }

    return (
      <Collapsible key={agent.id} defaultOpen={isExpanded}>
        <div className="ml-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-6 w-6 mr-1">
                <ChevronRight className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
              </Button>
              <div className="flex-1">{AgentContent}</div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-3 border-l-2 border-muted pl-2 mt-1 space-y-1">
              {agent.children!.map((child) => renderAgent(child, depth + 1))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium text-sm">Agent Hierarchy</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {stats.total} agents
          </Badge>
          {stats.active > 0 && (
            <Badge className="text-xs animate-pulse">
              {stats.active} active
            </Badge>
          )}
          {showCost && stats.totalCost > 0 && (
            <Badge variant="secondary" className="text-xs">
              ${stats.totalCost.toFixed(4)}
            </Badge>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="p-2">
        {renderAgent(root)}
      </div>

      {/* Legend */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', config.color)} />
              <span className="capitalize">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VitalAgentHierarchyTree;
