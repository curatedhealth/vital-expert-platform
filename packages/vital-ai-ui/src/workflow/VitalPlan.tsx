'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
  SkipForward,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';

export type TaskStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';

export interface PlanTask {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  agent?: {
    id: string;
    name: string;
    level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  };
  estimatedDuration?: string;
  actualDuration?: string;
  children?: PlanTask[];
  output?: string;
  error?: string;
}

export interface VitalPlanProps {
  /** Plan title */
  title?: string;
  /** Array of tasks in the plan */
  tasks: PlanTask[];
  /** Whether plan is currently executing */
  isExecuting?: boolean;
  /** Current progress percentage (0-100) */
  progress?: number;
  /** Whether to show task details */
  showDetails?: boolean;
  /** Whether tasks are collapsible */
  collapsible?: boolean;
  /** Callback when task is clicked */
  onTaskClick?: (task: PlanTask) => void;
  /** Callback to retry failed task */
  onRetryTask?: (taskId: string) => void;
  /** Callback to skip task */
  onSkipTask?: (taskId: string) => void;
  /** Custom class name */
  className?: string;
}

const statusConfig: Record<TaskStatus, { icon: typeof Circle; color: string; bg: string; label: string }> = {
  pending: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pending' },
  active: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
  skipped: { icon: SkipForward, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Skipped' },
};

/**
 * VitalPlan - Mission Roadmap
 * 
 * Visualizes the tree of tasks for Mode 3/4 missions.
 * Shows vertical stepper with Pending, Active, Completed, Failed, Skipped states.
 * 
 * Used with Vercel AI SDK for streaming task status updates.
 * 
 * @example
 * ```tsx
 * <VitalPlan
 *   title="Drug Interaction Analysis"
 *   tasks={missionTasks}
 *   isExecuting={true}
 *   progress={45}
 *   onTaskClick={(task) => viewTaskDetails(task)}
 * />
 * ```
 */
export function VitalPlan({
  title = 'Mission Plan',
  tasks,
  isExecuting = false,
  progress,
  showDetails = true,
  collapsible = true,
  onTaskClick,
  onRetryTask,
  onSkipTask,
  className,
}: VitalPlanProps) {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const calculatedProgress = progress ?? Math.round((completedCount / tasks.length) * 100);

  const renderTask = (task: PlanTask, depth: number = 0, isLast: boolean = false) => {
    const config = statusConfig[task.status];
    const StatusIcon = config.icon;
    const hasChildren = task.children && task.children.length > 0;

    const TaskContent = (
      <div
        className={cn(
          'relative flex items-start gap-3 py-3 px-4 rounded-lg',
          'transition-colors cursor-pointer',
          task.status === 'active' && 'bg-blue-50 dark:bg-blue-950/30',
          task.status === 'failed' && 'bg-red-50 dark:bg-red-950/30',
          'hover:bg-muted/50'
        )}
        onClick={() => onTaskClick?.(task)}
      >
        {/* Timeline connector */}
        {depth === 0 && !isLast && (
          <div className="absolute left-[27px] top-[48px] bottom-0 w-0.5 bg-border" />
        )}

        {/* Status Icon */}
        <div className={cn('flex-shrink-0 p-1.5 rounded-full', config.bg)}>
          <StatusIcon
            className={cn(
              'h-4 w-4',
              config.color,
              task.status === 'active' && 'animate-spin'
            )}
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-medium text-sm',
              task.status === 'completed' && 'text-muted-foreground line-through'
            )}>
              {task.name}
            </span>
            {task.agent && (
              <Badge variant="outline" className="text-xs">
                {task.agent.level} • {task.agent.name}
              </Badge>
            )}
          </div>

          {showDetails && task.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {task.description}
            </p>
          )}

          {/* Duration */}
          {(task.estimatedDuration || task.actualDuration) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {task.estimatedDuration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Est: {task.estimatedDuration}
                </span>
              )}
              {task.actualDuration && (
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Actual: {task.actualDuration}
                </span>
              )}
            </div>
          )}

          {/* Error message */}
          {task.status === 'failed' && task.error && (
            <div className="flex items-start gap-2 mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300">{task.error}</p>
            </div>
          )}

          {/* Actions for failed tasks */}
          {task.status === 'failed' && (onRetryTask || onSkipTask) && (
            <div className="flex items-center gap-2 mt-2">
              {onRetryTask && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetryTask(task.id);
                  }}
                >
                  Retry
                </Button>
              )}
              {onSkipTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkipTask(task.id);
                  }}
                >
                  Skip
                </Button>
              )}
            </div>
          )}

          {/* Output preview */}
          {task.status === 'completed' && task.output && showDetails && (
            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded line-clamp-2">
              {task.output}
            </p>
          )}
        </div>
      </div>
    );

    if (hasChildren && collapsible) {
      return (
        <Collapsible key={task.id} defaultOpen={task.status === 'active'}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 mr-1 transition-transform group-data-[state=open]:rotate-90" />
              {TaskContent}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-8 border-l-2 border-muted pl-4">
              {task.children!.map((child, idx) => 
                renderTask(child, depth + 1, idx === task.children!.length - 1)
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return <div key={task.id}>{TaskContent}</div>;
  };

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">{title}</h3>
          <div className="flex items-center gap-2">
            {isExecuting && (
              <Badge variant="outline" className="text-xs animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Executing
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {completedCount}/{tasks.length} tasks
            </span>
          </div>
        </div>
        <Progress value={calculatedProgress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {calculatedProgress}% complete
        </p>
      </div>

      {/* Task List */}
      <div className="p-2">
        {tasks.map((task, index) => renderTask(task, 0, index === tasks.length - 1))}
      </div>
    </div>
  );
}

export default VitalPlan;
