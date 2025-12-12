'use client';

/**
 * VITAL Platform - Tool Execution Feedback
 *
 * Displays real-time feedback during tool/API execution.
 * Shows tool name, input parameters, execution progress, and results.
 *
 * Used in Interactive Mode to provide visibility into what the AI
 * is doing behind the scenes - building trust and enabling intervention.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Code2,
  Database,
  Search,
  Globe,
  FileText,
  Calculator,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type ToolCategory =
  | 'search'
  | 'database'
  | 'api'
  | 'computation'
  | 'file'
  | 'web'
  | 'custom';

export type ToolExecutionStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ToolExecution {
  id: string;
  toolName: string;
  displayName: string;
  category: ToolCategory;
  description?: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  status: ToolExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  cost?: number;
}

export interface ToolExecutionFeedbackProps {
  /** List of tool executions to display */
  executions: ToolExecution[];
  /** Whether to show in compact mode (single line per tool) */
  compact?: boolean;
  /** Maximum number of executions to show (default: all) */
  maxVisible?: number;
  /** Whether to allow cancellation of running tools */
  allowCancel?: boolean;
  /** Called when user cancels a tool execution */
  onCancel?: (executionId: string) => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getCategoryIcon(category: ToolCategory) {
  const icons: Record<ToolCategory, React.ReactNode> = {
    search: <Search className="w-4 h-4" />,
    database: <Database className="w-4 h-4" />,
    api: <Globe className="w-4 h-4" />,
    computation: <Calculator className="w-4 h-4" />,
    file: <FileText className="w-4 h-4" />,
    web: <Globe className="w-4 h-4" />,
    custom: <Wrench className="w-4 h-4" />,
  };
  return icons[category] || icons.custom;
}

function getCategoryColor(category: ToolCategory) {
  const colors: Record<ToolCategory, string> = {
    search: 'bg-blue-100 text-blue-600',
    database: 'bg-green-100 text-green-600',
    api: 'bg-purple-100 text-purple-600',
    computation: 'bg-amber-100 text-amber-600',
    file: 'bg-slate-100 text-slate-600',
    web: 'bg-indigo-100 text-indigo-600',
    custom: 'bg-pink-100 text-pink-600',
  };
  return colors[category] || colors.custom;
}

function getStatusInfo(status: ToolExecutionStatus) {
  const statuses: Record<ToolExecutionStatus, {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
  }> = {
    queued: {
      label: 'Queued',
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    running: {
      label: 'Running',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    completed: {
      label: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    failed: {
      label: 'Failed',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
  };
  return statuses[status] || statuses.queued;
}

function formatDuration(ms?: number): string {
  if (ms === undefined) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function truncateJson(obj: unknown, maxLength = 100): string {
  const str = JSON.stringify(obj, null, 2);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ExecutionCardProps {
  execution: ToolExecution;
  compact: boolean;
  allowCancel: boolean;
  onCancel?: (id: string) => void;
}

function ExecutionCard({ execution, compact, allowCancel, onCancel }: ExecutionCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const statusInfo = getStatusInfo(execution.status);
  const isRunning = execution.status === 'running';

  const handleCopyInput = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(execution.input, null, 2));
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  }, [execution.input]);

  const handleCopyOutput = useCallback(async () => {
    if (execution.output) {
      await navigator.clipboard.writeText(JSON.stringify(execution.output, null, 2));
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  }, [execution.output]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm',
          isRunning && 'bg-blue-50'
        )}
      >
        <span className={cn('p-1 rounded', getCategoryColor(execution.category))}>
          {getCategoryIcon(execution.category)}
        </span>
        <span className="font-medium text-slate-700 truncate flex-1">
          {execution.displayName}
        </span>
        <span className={cn('flex items-center gap-1', statusInfo.color)}>
          {statusInfo.icon}
        </span>
        {execution.durationMs !== undefined && (
          <span className="text-xs text-slate-400">
            {formatDuration(execution.durationMs)}
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border overflow-hidden',
        isRunning ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'
      )}
    >
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg', getCategoryColor(execution.category))}>
          {getCategoryIcon(execution.category)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">
              {execution.displayName}
            </span>
            <span className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded',
              statusInfo.bgColor,
              statusInfo.color
            )}>
              {statusInfo.icon}
              <span className="hidden sm:inline">{statusInfo.label}</span>
            </span>
          </div>
          {execution.description && (
            <p className="text-sm text-slate-500 truncate">
              {execution.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {execution.durationMs !== undefined && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(execution.durationMs)}
            </span>
          )}
          {execution.cost !== undefined && (
            <span>${execution.cost.toFixed(4)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {allowCancel && isRunning && onCancel && (
            <button
              onClick={() => onCancel(execution.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
              title="Cancel execution"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-3 space-y-3 bg-slate-50">
              {/* Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    Input Parameters
                  </label>
                  <button
                    onClick={handleCopyInput}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title="Copy input"
                  >
                    {copiedInput ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <pre className="p-2 bg-white rounded border border-slate-200 text-xs text-slate-700 overflow-x-auto max-h-32">
                  {JSON.stringify(execution.input, null, 2)}
                </pre>
              </div>

              {/* Output */}
              {execution.status === 'completed' && execution.output !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Output
                    </label>
                    <button
                      onClick={handleCopyOutput}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Copy output"
                    >
                      {copiedOutput ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <pre className="p-2 bg-white rounded border border-green-200 text-xs text-slate-700 overflow-x-auto max-h-32">
                    {typeof execution.output === 'string'
                      ? execution.output
                      : JSON.stringify(execution.output, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {execution.status === 'failed' && execution.error && (
                <div>
                  <label className="text-xs font-medium text-red-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    Error
                  </label>
                  <pre className="p-2 bg-red-50 rounded border border-red-200 text-xs text-red-700 overflow-x-auto">
                    {execution.error}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ToolExecutionFeedback({
  executions,
  compact = false,
  maxVisible,
  allowCancel = false,
  onCancel,
  className,
}: ToolExecutionFeedbackProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleExecutions = useMemo(() => {
    if (!maxVisible || showAll) return executions;
    return executions.slice(0, maxVisible);
  }, [executions, maxVisible, showAll]);

  const hasMore = maxVisible && executions.length > maxVisible;
  const runningCount = executions.filter((e) => e.status === 'running').length;
  const completedCount = executions.filter((e) => e.status === 'completed').length;
  const failedCount = executions.filter((e) => e.status === 'failed').length;

  if (executions.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Summary header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Wrench className="w-4 h-4" />
          <span className="font-medium">Tool Executions</span>
          <span className="text-slate-400">({executions.length})</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {runningCount > 0 && (
            <span className="flex items-center gap-1 text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              {runningCount} running
            </span>
          )}
          {completedCount > 0 && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              {completedCount} completed
            </span>
          )}
          {failedCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="w-3 h-3" />
              {failedCount} failed
            </span>
          )}
        </div>
      </div>

      {/* Execution list */}
      <div className={cn('space-y-2', compact && 'space-y-1')}>
        {visibleExecutions.map((execution) => (
          <ExecutionCard
            key={execution.id}
            execution={execution}
            compact={compact}
            allowCancel={allowCancel}
            onCancel={onCancel}
          />
        ))}
      </div>

      {/* Show more/less */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {executions.length - maxVisible} more
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default ToolExecutionFeedback;
