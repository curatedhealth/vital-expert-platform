'use client';

/**
 * VITAL Platform - Stage Progress Card
 *
 * Displays detailed progress for a single mission stage/step.
 * Shows elapsed time, status, sub-tasks, and resource usage.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  Brain,
  FileText,
  Search,
  Database,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type StageStatus = 'pending' | 'running' | 'complete' | 'error' | 'skipped';

export interface SubTask {
  id: string;
  name: string;
  status: StageStatus;
  duration?: number; // milliseconds
  output?: string;
}

export interface StageProgressCardProps {
  /** Stage ID */
  id: string;
  /** Stage name */
  name: string;
  /** Stage description */
  description?: string;
  /** Current status */
  status: StageStatus;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Start time (ISO string or timestamp) */
  startTime?: string | number;
  /** End time (ISO string or timestamp) */
  endTime?: string | number;
  /** Estimated duration in milliseconds */
  estimatedDuration?: number;
  /** Sub-tasks within this stage */
  subTasks?: SubTask[];
  /** Tools being used */
  activeTools?: string[];
  /** Token usage */
  tokenUsage?: {
    input: number;
    output: number;
  };
  /** Error message if status is 'error' */
  errorMessage?: string;
  /** Whether to show expanded by default */
  defaultExpanded?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function getToolIcon(tool: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    'web_search': <Search className="w-3 h-3" />,
    'pubmed_search': <Search className="w-3 h-3" />,
    'database_query': <Database className="w-3 h-3" />,
    'document_analysis': <FileText className="w-3 h-3" />,
    'reasoning': <Brain className="w-3 h-3" />,
    'llm_query': <MessageSquare className="w-3 h-3" />,
  };
  return icons[tool] || <Zap className="w-3 h-3" />;
}

function getStatusColor(status: StageStatus): string {
  const colors: Record<StageStatus, string> = {
    pending: 'text-slate-400',
    running: 'text-purple-500',
    complete: 'text-green-500',
    error: 'text-red-500',
    skipped: 'text-slate-300',
  };
  return colors[status];
}

function getStatusBgColor(status: StageStatus): string {
  const colors: Record<StageStatus, string> = {
    pending: 'bg-slate-100',
    running: 'bg-purple-100',
    complete: 'bg-green-100',
    error: 'bg-red-100',
    skipped: 'bg-slate-50',
  };
  return colors[status];
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StageProgressCard({
  id,
  name,
  description,
  status,
  progress,
  startTime,
  endTime,
  estimatedDuration,
  subTasks = [],
  activeTools = [],
  tokenUsage,
  errorMessage,
  defaultExpanded = false,
  className,
}: StageProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || status === 'running');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate elapsed time for running stages
  useEffect(() => {
    if (status !== 'running' || !startTime) return;

    const startMs = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startMs);
    }, 100);

    return () => clearInterval(interval);
  }, [status, startTime]);

  // Calculate actual duration for completed stages
  const actualDuration = useMemo(() => {
    if (status === 'running') return elapsedTime;
    if (startTime && endTime) {
      const start = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;
      const end = typeof endTime === 'string' ? new Date(endTime).getTime() : endTime;
      return end - start;
    }
    return 0;
  }, [status, startTime, endTime, elapsedTime]);

  // Calculate progress bar width
  const progressWidth = useMemo(() => {
    if (progress !== undefined) return progress;
    if (status === 'complete') return 100;
    if (status === 'pending' || status === 'skipped') return 0;
    if (estimatedDuration && actualDuration) {
      return Math.min(100, (actualDuration / estimatedDuration) * 100);
    }
    return 50; // Default for running without estimate
  }, [progress, status, estimatedDuration, actualDuration]);

  const completedSubTasks = subTasks.filter(t => t.status === 'complete').length;

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-all',
        status === 'running' && 'border-purple-300 shadow-md shadow-purple-100',
        status === 'complete' && 'border-green-200',
        status === 'error' && 'border-red-200',
        status === 'pending' && 'border-slate-200',
        status === 'skipped' && 'border-slate-100 opacity-60',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 p-3 text-left transition-colors',
          getStatusBgColor(status)
        )}
      >
        {/* Status Icon */}
        <div className={cn('flex-shrink-0', getStatusColor(status))}>
          {status === 'pending' && <Clock className="w-5 h-5" />}
          {status === 'running' && <Loader2 className="w-5 h-5 animate-spin" />}
          {status === 'complete' && <CheckCircle2 className="w-5 h-5" />}
          {status === 'error' && <AlertCircle className="w-5 h-5" />}
          {status === 'skipped' && <Clock className="w-5 h-5" />}
        </div>

        {/* Title and Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900 truncate">{name}</span>
            {actualDuration > 0 && (
              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                {formatDuration(actualDuration)}
              </span>
            )}
          </div>

          {/* Progress bar for running stages */}
          {status === 'running' && (
            <div className="mt-1.5 h-1.5 bg-purple-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressWidth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Sub-task count */}
          {subTasks.length > 0 && status !== 'running' && (
            <span className="text-xs text-slate-500">
              {completedSubTasks}/{subTasks.length} tasks
            </span>
          )}
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 text-slate-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-3">
              {/* Description */}
              {description && (
                <p className="text-sm text-slate-600">{description}</p>
              )}

              {/* Error message */}
              {status === 'error' && errorMessage && (
                <div className="p-2 bg-red-50 rounded text-sm text-red-700 border border-red-100">
                  {errorMessage}
                </div>
              )}

              {/* Active tools */}
              {activeTools.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeTools.map((tool) => (
                    <span
                      key={tool}
                      className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                        status === 'running'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {getToolIcon(tool)}
                      {tool.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Sub-tasks */}
              {subTasks.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Sub-tasks
                  </span>
                  <div className="space-y-1">
                    {subTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full flex-shrink-0',
                          task.status === 'complete' && 'bg-green-500',
                          task.status === 'running' && 'bg-purple-500 animate-pulse',
                          task.status === 'pending' && 'bg-slate-300',
                          task.status === 'error' && 'bg-red-500'
                        )} />
                        <span className={cn(
                          'flex-1 truncate',
                          task.status === 'complete' && 'text-slate-600',
                          task.status === 'running' && 'text-purple-700 font-medium',
                          task.status === 'pending' && 'text-slate-400',
                          task.status === 'error' && 'text-red-600'
                        )}>
                          {task.name}
                        </span>
                        {task.duration && (
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {formatDuration(task.duration)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Token usage */}
              {tokenUsage && (
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Input: {tokenUsage.input.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Output: {tokenUsage.output.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Time estimate */}
              {status === 'running' && estimatedDuration && (
                <div className="text-xs text-slate-500">
                  Estimated: {formatDuration(estimatedDuration)} •
                  Elapsed: {formatDuration(actualDuration)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StageProgressCard;
