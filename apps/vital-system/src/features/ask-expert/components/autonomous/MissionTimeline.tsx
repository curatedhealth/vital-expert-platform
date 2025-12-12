'use client';

/**
 * VITAL Platform - MissionTimeline Component
 *
 * Visual timeline showing mission progress through tasks and checkpoints.
 * Provides a bird's-eye view of:
 * - Task progression (pending, active, complete, failed)
 * - Checkpoint locations
 * - Estimated vs actual timing
 * - Agent delegations between tasks
 *
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  XCircle,
  Flag,
  Clock,
  Zap,
  Users,
  ArrowRight,
  AlertOctagon,
} from 'lucide-react';

import type {
  MissionTask,
  Checkpoint,
  CheckpointType,
  AgentLevel,
} from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

export interface TimelineStep {
  id: string;
  type: 'task' | 'checkpoint';
  name: string;
  description?: string;
  status: 'pending' | 'active' | 'complete' | 'failed' | 'skipped';
  level?: AgentLevel;
  checkpointType?: CheckpointType;
  estimatedMinutes?: number;
  actualMinutes?: number;
  delegatedFrom?: string;
  delegatedTo?: string;
  tools?: string[];
}

export interface MissionTimelineProps {
  /** Mission tasks */
  tasks: MissionTask[];
  /** Mission checkpoints */
  checkpoints: Checkpoint[];
  /** Currently active task ID */
  currentTaskId?: string;
  /** IDs of completed tasks */
  completedTasks: string[];
  /** IDs of failed tasks */
  failedTasks: string[];
  /** ID of pending checkpoint (if any) */
  pendingCheckpointId?: string;
  /** Delegations that occurred */
  delegations?: Array<{ from: string; to: string; taskId: string }>;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Show time estimates */
  showEstimates?: boolean;
  /** Compact mode (less detail) */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getTaskStatus = (
  taskId: string,
  currentTaskId?: string,
  completedTasks: string[] = [],
  failedTasks: string[] = []
): TimelineStep['status'] => {
  if (completedTasks.includes(taskId)) return 'complete';
  if (failedTasks.includes(taskId)) return 'failed';
  if (taskId === currentTaskId) return 'active';
  return 'pending';
};

const getCheckpointStatus = (
  checkpointId: string,
  afterTaskId: string,
  completedTasks: string[],
  pendingCheckpointId?: string
): TimelineStep['status'] => {
  if (pendingCheckpointId === checkpointId) return 'active';
  if (completedTasks.includes(afterTaskId)) return 'complete';
  return 'pending';
};

const getStatusIcon = (status: TimelineStep['status'], type: TimelineStep['type']) => {
  if (type === 'checkpoint') {
    switch (status) {
      case 'complete':
        return <Flag className="w-4 h-4 text-green-500" />;
      case 'active':
        return <AlertOctagon className="w-4 h-4 text-amber-500 animate-pulse" />;
      default:
        return <Flag className="w-4 h-4 text-neutral-500" />;
    }
  }

  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'active':
      return <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'skipped':
      return <Circle className="w-4 h-4 text-neutral-500 opacity-50" />;
    default:
      return <Circle className="w-4 h-4 text-neutral-500" />;
  }
};

const getStatusColor = (status: TimelineStep['status']) => {
  switch (status) {
    case 'complete':
      return 'bg-green-500';
    case 'active':
      return 'bg-purple-500';
    case 'failed':
      return 'bg-red-500';
    case 'skipped':
      return 'bg-neutral-600';
    default:
      return 'bg-neutral-600';
  }
};

const getLevelColor = (level?: AgentLevel) => {
  switch (level) {
    case 'L1':
      return 'text-blue-400 bg-blue-400/10';
    case 'L2':
      return 'text-purple-400 bg-purple-400/10';
    case 'L3':
      return 'text-amber-400 bg-amber-400/10';
    case 'L4':
      return 'text-emerald-400 bg-emerald-400/10';
    case 'L5':
      return 'text-pink-400 bg-pink-400/10';
    default:
      return 'text-neutral-400 bg-neutral-400/10';
  }
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TimelineNodeProps {
  step: TimelineStep;
  isLast: boolean;
  showEstimates: boolean;
  compact: boolean;
  orientation: 'horizontal' | 'vertical';
  delegation?: { from: string; to: string };
}

const TimelineNode: React.FC<TimelineNodeProps> = ({
  step,
  isLast,
  showEstimates,
  compact,
  orientation,
  delegation,
}) => {
  const isVertical = orientation === 'vertical';
  const isCheckpoint = step.type === 'checkpoint';

  return (
    <div
      className={cn(
        'flex',
        isVertical ? 'flex-row' : 'flex-col items-center',
        isVertical ? 'gap-3' : 'gap-2'
      )}
    >
      {/* Node */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'rounded-full flex items-center justify-center transition-all',
            isCheckpoint ? 'w-8 h-8' : 'w-10 h-10',
            step.status === 'active' && 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-neutral-950',
            step.status === 'complete' && !isCheckpoint && 'bg-green-500/20',
            step.status === 'failed' && 'bg-red-500/20',
            step.status === 'pending' && 'bg-neutral-800'
          )}
        >
          {getStatusIcon(step.status, step.type)}
        </motion.div>

        {/* Delegation indicator */}
        {delegation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-1 -right-1 p-0.5 bg-cyan-500 rounded-full"
          >
            <Users className="w-2.5 h-2.5 text-white" />
          </motion.div>
        )}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div
          className={cn(
            'flex-shrink-0',
            isVertical ? 'w-0.5 h-full min-h-[40px] ml-5' : 'h-0.5 w-full min-w-[40px]',
            step.status === 'complete' ? 'bg-green-500/50' : 'bg-neutral-700'
          )}
        />
      )}

      {/* Content */}
      {!compact && (
        <div
          className={cn(
            'flex-1 min-w-0',
            isVertical ? 'pb-4' : 'text-center max-w-[120px]'
          )}
        >
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm font-medium truncate',
                step.status === 'active' ? 'text-purple-300' :
                step.status === 'complete' ? 'text-green-300' :
                step.status === 'failed' ? 'text-red-300' :
                'text-neutral-400'
              )}
            >
              {step.name}
            </p>
            {step.level && (
              <span className={cn('text-xs px-1.5 py-0.5 rounded', getLevelColor(step.level))}>
                {step.level}
              </span>
            )}
          </div>

          {step.description && isVertical && (
            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
              {step.description}
            </p>
          )}

          {showEstimates && step.estimatedMinutes && (
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
              <Clock className="w-3 h-3" />
              <span>
                {step.actualMinutes
                  ? `${step.actualMinutes}m / ${step.estimatedMinutes}m`
                  : `~${step.estimatedMinutes}m`
                }
              </span>
            </div>
          )}

          {delegation && isVertical && (
            <div className="flex items-center gap-1 mt-1 text-xs text-cyan-400">
              <span>{delegation.from}</span>
              <ArrowRight className="w-3 h-3" />
              <span>{delegation.to}</span>
            </div>
          )}

          {step.tools && step.tools.length > 0 && isVertical && (
            <div className="flex flex-wrap gap-1 mt-1">
              {step.tools.slice(0, 2).map(tool => (
                <span
                  key={tool}
                  className="px-1.5 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded"
                >
                  {tool}
                </span>
              ))}
              {step.tools.length > 2 && (
                <span className="text-xs text-neutral-500">+{step.tools.length - 2}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MissionTimeline: React.FC<MissionTimelineProps> = ({
  tasks,
  checkpoints,
  currentTaskId,
  completedTasks = [],
  failedTasks = [],
  pendingCheckpointId,
  delegations = [],
  orientation = 'vertical',
  showEstimates = true,
  compact = false,
  className,
}) => {
  // Build timeline steps from tasks and checkpoints
  const timelineSteps: TimelineStep[] = useMemo(() => {
    const steps: TimelineStep[] = [];

    // Sort tasks by order (assuming they're in order)
    tasks.forEach((task, index) => {
      // Add task
      steps.push({
        id: task.id,
        type: 'task',
        name: task.name,
        description: task.description,
        status: getTaskStatus(task.id, currentTaskId, completedTasks, failedTasks),
        level: task.assignedLevel,
        estimatedMinutes: task.estimatedMinutes,
        tools: task.tools,
      });

      // Check for checkpoint after this task
      const checkpoint = checkpoints.find(cp => cp.afterTask === task.id);
      if (checkpoint) {
        steps.push({
          id: checkpoint.id,
          type: 'checkpoint',
          name: checkpoint.name,
          description: checkpoint.description,
          status: getCheckpointStatus(checkpoint.id, task.id, completedTasks, pendingCheckpointId),
          checkpointType: checkpoint.type,
        });
      }
    });

    return steps;
  }, [tasks, checkpoints, currentTaskId, completedTasks, failedTasks, pendingCheckpointId]);

  // Map delegations to tasks
  const taskDelegations = useMemo(() => {
    const map: Record<string, { from: string; to: string }> = {};
    delegations.forEach(d => {
      map[d.taskId] = { from: d.from, to: d.to };
    });
    return map;
  }, [delegations]);

  // Calculate progress
  const progress = useMemo(() => {
    const taskSteps = timelineSteps.filter(s => s.type === 'task');
    const completed = taskSteps.filter(s => s.status === 'complete').length;
    return Math.round((completed / taskSteps.length) * 100);
  }, [timelineSteps]);

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn('relative', className)}>
      {/* Progress Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Mission Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">
            {completedTasks.length}/{tasks.length} tasks
          </span>
          <span className={cn(
            'text-sm font-medium',
            progress === 100 ? 'text-green-400' : 'text-purple-400'
          )}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-neutral-800 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timeline */}
      <div
        className={cn(
          'flex',
          isVertical ? 'flex-col' : 'flex-row items-start overflow-x-auto pb-4'
        )}
      >
        {timelineSteps.map((step, index) => (
          <TimelineNode
            key={step.id}
            step={step}
            isLast={index === timelineSteps.length - 1}
            showEstimates={showEstimates}
            compact={compact}
            orientation={orientation}
            delegation={step.type === 'task' ? taskDelegations[step.id] : undefined}
          />
        ))}
      </div>

      {/* Legend */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Complete
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Loader2 className="w-3 h-3 text-purple-500" />
            Active
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Circle className="w-3 h-3 text-neutral-500" />
            Pending
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <XCircle className="w-3 h-3 text-red-500" />
            Failed
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Flag className="w-3 h-3 text-amber-500" />
            Checkpoint
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Users className="w-3 h-3 text-cyan-500" />
            Delegated
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionTimeline;
