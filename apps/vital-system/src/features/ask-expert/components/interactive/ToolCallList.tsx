'use client';

/**
 * VITAL Platform - ToolCallList Component
 *
 * Displays tool/function calls executed by AI agents.
 * Shows status, inputs, outputs, and timing information.
 *
 * Features:
 * - Status indicators (pending, running, completed, failed)
 * - Animated progress for running tools
 * - Collapsible input/output details
 * - Duration tracking
 * - Tool type icons
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Database,
  Calculator,
  FileText,
  Code,
  Globe,
  MessageSquare,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ChevronDown,
  Terminal,
  Wrench,
  Workflow,
} from 'lucide-react';

// Note: ToolCallEvent type from useSSEStream has different status values
// (calling/success/error) than our UI ToolCall interface (pending/running/completed/failed)

// =============================================================================
// TYPES
// =============================================================================

/**
 * ToolCall interface for UI display.
 * Note: This is intentionally NOT extending ToolCallEvent because
 * the status values differ (UI: pending/running/completed/failed vs SSE: calling/success/error)
 * and we need different optional/required field semantics.
 */
export interface ToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: Record<string, any>;
  output?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  // Optional fields from ToolCallEvent for compatibility
  toolId?: string;
  toolName?: string;
  toolType?: string;
  durationMs?: number;
}

export interface ToolCallListProps {
  /** Tool calls to display */
  calls: ToolCall[];
  /** ID of the currently active/running tool */
  activeToolId?: string;
  /** Whether streaming is in progress */
  isStreaming?: boolean;
  /** Show compact mode */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// TOOL TYPE CONFIG
// =============================================================================

const TOOL_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  search: { icon: Search, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Search' },
  database: { icon: Database, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Database' },
  calculate: { icon: Calculator, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Calculator' },
  document: { icon: FileText, color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'Document' },
  code: { icon: Code, color: 'text-slate-600', bgColor: 'bg-slate-50', label: 'Code' },
  web: { icon: Globe, color: 'text-cyan-600', bgColor: 'bg-cyan-50', label: 'Web' },
  chat: { icon: MessageSquare, color: 'text-rose-600', bgColor: 'bg-rose-50', label: 'Chat' },
  api: { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'API' },
  workflow: { icon: Workflow, color: 'text-indigo-600', bgColor: 'bg-indigo-50', label: 'Workflow' },
  default: { icon: Wrench, color: 'text-slate-600', bgColor: 'bg-slate-50', label: 'Tool' },
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  pending: { icon: Clock, color: 'text-slate-500', bgColor: 'bg-slate-100', label: 'Pending' },
  running: { icon: Loader2, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Running' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Failed' },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ToolCallList({
  calls,
  activeToolId,
  isStreaming = false,
  compact = false,
  className,
}: ToolCallListProps) {
  if (calls.length === 0) {
    return null;
  }

  // =========================================================================
  // COMPACT MODE
  // =========================================================================

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        <AnimatePresence mode="popLayout">
          {calls.map((call, index) => (
            <ToolCallBadge
              key={call.id}
              call={call}
              isActive={call.id === activeToolId}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // FULL MODE
  // =========================================================================

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Terminal className="h-4 w-4" />
        <span className="font-medium">Tools Used ({calls.length})</span>
      </div>

      {/* Tool List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {calls.map((call, index) => (
            <ToolCallCard
              key={call.id}
              call={call}
              isActive={call.id === activeToolId}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ToolCallBadgeProps {
  call: ToolCall;
  isActive: boolean;
  index: number;
}

function ToolCallBadge({ call, isActive, index }: ToolCallBadgeProps) {
  const toolConfig = getToolConfig(call.name);
  const statusConfig = STATUS_CONFIG[call.status];
  const StatusIcon = statusConfig.icon;
  const ToolIcon = toolConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs',
        'border transition-all',
        statusConfig.bgColor,
        isActive && 'ring-2 ring-blue-400 ring-offset-1'
      )}
    >
      <ToolIcon className={cn('h-3 w-3', toolConfig.color)} />
      <span className="font-medium text-slate-700">{formatToolName(call.name)}</span>
      <StatusIcon className={cn(
        'h-3 w-3',
        statusConfig.color,
        call.status === 'running' && 'animate-spin'
      )} />
    </motion.div>
  );
}

interface ToolCallCardProps {
  call: ToolCall;
  isActive: boolean;
  index: number;
}

function ToolCallCard({ call, isActive, index }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toolConfig = getToolConfig(call.name);
  const statusConfig = STATUS_CONFIG[call.status];
  const StatusIcon = statusConfig.icon;
  const ToolIcon = toolConfig.icon;

  const hasDetails = call.input || call.output || call.error;

  const handleToggle = useCallback(() => {
    if (hasDetails) {
      setIsExpanded(prev => !prev);
    }
  }, [hasDetails]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-lg border overflow-hidden',
        call.status === 'failed' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white',
        isActive && 'ring-2 ring-blue-400'
      )}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        disabled={!hasDetails}
        className={cn(
          'w-full px-3 py-2 flex items-center gap-3',
          'text-left transition-colors',
          hasDetails && 'hover:bg-slate-50 cursor-pointer',
          !hasDetails && 'cursor-default'
        )}
      >
        {/* Tool icon */}
        <div className={cn(
          'p-1.5 rounded-md',
          toolConfig.bgColor
        )}>
          <ToolIcon className={cn('h-4 w-4', toolConfig.color)} />
        </div>

        {/* Tool name and status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-slate-900">
              {formatToolName(call.name)}
            </span>
            <Badge
              variant="outline"
              className={cn('text-xs', statusConfig.color, statusConfig.bgColor)}
            >
              <StatusIcon className={cn(
                'h-3 w-3 mr-1',
                call.status === 'running' && 'animate-spin'
              )} />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Duration */}
          {call.duration !== undefined && (
            <span className="text-xs text-slate-500">
              {call.duration < 1000
                ? `${call.duration}ms`
                : `${(call.duration / 1000).toFixed(1)}s`}
            </span>
          )}
        </div>

        {/* Expand chevron */}
        {hasDetails && (
          <ChevronDown className={cn(
            'h-4 w-4 text-slate-400 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        )}
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-slate-100">
              {/* Input */}
              {call.input && Object.keys(call.input).length > 0 && (
                <div className="pt-3">
                  <h4 className="text-xs font-medium text-slate-500 mb-1">Input</h4>
                  <pre className="text-xs bg-slate-100 rounded-md p-2 overflow-x-auto">
                    {JSON.stringify(call.input, null, 2)}
                  </pre>
                </div>
              )}

              {/* Output */}
              {call.output && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-1">Output</h4>
                  <pre className="text-xs bg-slate-100 rounded-md p-2 overflow-x-auto max-h-[200px]">
                    {typeof call.output === 'string'
                      ? call.output
                      : JSON.stringify(call.output, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {call.error && (
                <div>
                  <h4 className="text-xs font-medium text-red-600 mb-1">Error</h4>
                  <pre className="text-xs bg-red-100 text-red-700 rounded-md p-2 overflow-x-auto">
                    {call.error}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Running progress bar */}
      {call.status === 'running' && (
        <motion.div
          className="h-0.5 bg-blue-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 10, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getToolConfig(toolName: string): typeof TOOL_TYPE_CONFIG[string] {
  const name = toolName.toLowerCase();

  if (name.includes('search') || name.includes('query')) {
    return TOOL_TYPE_CONFIG.search;
  }
  if (name.includes('database') || name.includes('db') || name.includes('sql')) {
    return TOOL_TYPE_CONFIG.database;
  }
  if (name.includes('calculate') || name.includes('math') || name.includes('compute')) {
    return TOOL_TYPE_CONFIG.calculate;
  }
  if (name.includes('document') || name.includes('file') || name.includes('read')) {
    return TOOL_TYPE_CONFIG.document;
  }
  if (name.includes('code') || name.includes('execute') || name.includes('run')) {
    return TOOL_TYPE_CONFIG.code;
  }
  if (name.includes('web') || name.includes('http') || name.includes('fetch')) {
    return TOOL_TYPE_CONFIG.web;
  }
  if (name.includes('chat') || name.includes('message') || name.includes('llm')) {
    return TOOL_TYPE_CONFIG.chat;
  }
  if (name.includes('api') || name.includes('request')) {
    return TOOL_TYPE_CONFIG.api;
  }
  if (name.includes('workflow') || name.includes('process')) {
    return TOOL_TYPE_CONFIG.workflow;
  }

  return TOOL_TYPE_CONFIG.default;
}

function formatToolName(name: string): string {
  // Convert snake_case or camelCase to readable format
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\s+/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default ToolCallList;
