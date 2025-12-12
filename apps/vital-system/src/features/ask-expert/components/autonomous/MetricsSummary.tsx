'use client';

/**
 * VITAL Platform - Metrics Summary
 *
 * Displays real-time metrics summary during mission execution.
 * Shows cost, duration, token usage, agent activity, and quality scores.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Clock,
  Zap,
  Users,
  Brain,
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface MetricsSummaryProps {
  /** Current cost in dollars */
  cost: number;
  /** Budget limit (optional) */
  budgetLimit?: number;
  /** Elapsed time in milliseconds */
  elapsedTime: number;
  /** Time limit in milliseconds (optional) */
  timeLimit?: number;
  /** Token usage */
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  /** Number of active agents */
  activeAgents: number;
  /** Total agents involved */
  totalAgents: number;
  /** Number of completed stages */
  completedStages: number;
  /** Total number of stages */
  totalStages: number;
  /** Quality/confidence score (0-100) */
  qualityScore?: number;
  /** Number of sources cited */
  sourcesCount?: number;
  /** Warnings or alerts */
  warnings?: string[];
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical' | 'compact';
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDuration(ms: number): string {
  if (ms < 1000) return '< 1s';
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return '< $0.01';
  return `$${cost.toFixed(2)}`;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(2)}M`;
}

function getProgressColor(current: number, limit: number): string {
  const ratio = current / limit;
  if (ratio < 0.5) return 'text-green-500';
  if (ratio < 0.8) return 'text-amber-500';
  return 'text-red-500';
}

function getProgressBgColor(current: number, limit: number): string {
  const ratio = current / limit;
  if (ratio < 0.5) return 'bg-green-500';
  if (ratio < 0.8) return 'bg-amber-500';
  return 'bg-red-500';
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  progress?: number;
  progressColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  warning?: boolean;
  compact?: boolean;
}

function MetricCard({
  icon,
  label,
  value,
  subValue,
  progress,
  progressColor,
  warning,
  compact,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-white border',
        warning ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200',
        compact && 'p-2'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          warning ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600',
          compact && 'w-8 h-8'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
        <div className={cn('font-semibold text-slate-900', compact ? 'text-sm' : 'text-lg')}>
          {value}
        </div>
        {subValue && <div className="text-xs text-slate-400">{subValue}</div>}
        {progress !== undefined && (
          <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', progressColor || 'bg-purple-500')}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MetricsSummary({
  cost,
  budgetLimit,
  elapsedTime,
  timeLimit,
  tokenUsage,
  activeAgents,
  totalAgents,
  completedStages,
  totalStages,
  qualityScore,
  sourcesCount,
  warnings = [],
  layout = 'horizontal',
  className,
}: MetricsSummaryProps) {
  const costProgress = useMemo(() => {
    if (!budgetLimit) return undefined;
    return (cost / budgetLimit) * 100;
  }, [cost, budgetLimit]);

  const timeProgress = useMemo(() => {
    if (!timeLimit) return undefined;
    return (elapsedTime / timeLimit) * 100;
  }, [elapsedTime, timeLimit]);

  const stageProgress = useMemo(() => {
    return (completedStages / totalStages) * 100;
  }, [completedStages, totalStages]);

  const isCompact = layout === 'compact';

  return (
    <div className={cn('space-y-3', className)}>
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Warnings</span>
          </div>
          <ul className="mt-1 space-y-0.5">
            {warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-600">• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics Grid */}
      <div
        className={cn(
          'grid gap-3',
          layout === 'horizontal' && 'grid-cols-2 md:grid-cols-4',
          layout === 'vertical' && 'grid-cols-1',
          layout === 'compact' && 'grid-cols-2'
        )}
      >
        {/* Cost */}
        <MetricCard
          icon={<DollarSign className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />}
          label="Cost"
          value={formatCost(cost)}
          subValue={budgetLimit ? `of ${formatCost(budgetLimit)} budget` : undefined}
          progress={costProgress}
          progressColor={
            budgetLimit ? getProgressBgColor(cost, budgetLimit) : undefined
          }
          warning={budgetLimit ? cost / budgetLimit > 0.8 : false}
          compact={isCompact}
        />

        {/* Time */}
        <MetricCard
          icon={<Clock className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />}
          label="Duration"
          value={formatDuration(elapsedTime)}
          subValue={timeLimit ? `of ${formatDuration(timeLimit)} limit` : undefined}
          progress={timeProgress}
          progressColor={
            timeLimit ? getProgressBgColor(elapsedTime, timeLimit) : undefined
          }
          warning={timeLimit ? elapsedTime / timeLimit > 0.8 : false}
          compact={isCompact}
        />

        {/* Tokens */}
        <MetricCard
          icon={<Zap className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />}
          label="Tokens"
          value={formatTokens(tokenUsage.total)}
          subValue={`${formatTokens(tokenUsage.input)} in / ${formatTokens(tokenUsage.output)} out`}
          compact={isCompact}
        />

        {/* Agents */}
        <MetricCard
          icon={<Users className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />}
          label="Agents"
          value={`${activeAgents}/${totalAgents}`}
          subValue={`${activeAgents} active`}
          compact={isCompact}
        />

        {/* Progress */}
        <MetricCard
          icon={<Target className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />}
          label="Progress"
          value={`${completedStages}/${totalStages}`}
          subValue="stages complete"
          progress={stageProgress}
          compact={isCompact}
        />

        {/* Quality Score */}
        {qualityScore !== undefined && (
          <MetricCard
            icon={<Brain className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />}
            label="Quality"
            value={`${qualityScore}%`}
            subValue="confidence"
            progress={qualityScore}
            progressColor={
              qualityScore >= 80
                ? 'bg-green-500'
                : qualityScore >= 60
                ? 'bg-amber-500'
                : 'bg-red-500'
            }
            compact={isCompact}
          />
        )}

        {/* Sources */}
        {sourcesCount !== undefined && (
          <MetricCard
            icon={<Shield className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />}
            label="Sources"
            value={sourcesCount.toString()}
            subValue="citations"
            compact={isCompact}
          />
        )}
      </div>

      {/* Summary Bar (for horizontal layout) */}
      {layout === 'horizontal' && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Mission efficiency: {((stageProgress / Math.max(1, (elapsedTime / 60000))) || 0).toFixed(1)} stages/min
          </span>
          <span>
            Cost efficiency: {cost > 0 ? formatCost(cost / completedStages) : '$0'}/stage
          </span>
        </div>
      )}
    </div>
  );
}

export default MetricsSummary;
