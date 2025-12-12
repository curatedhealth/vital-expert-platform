'use client';

import { cn } from '../lib/utils';
import { DollarSign, TrendingUp, AlertTriangle, Clock, Zap } from 'lucide-react';
import { Progress } from '@vital/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@vital/ui';

interface CostBreakdown {
  llmCalls: number;
  llmCost: number;
  toolCalls: number;
  toolCost: number;
  embeddingCalls: number;
  embeddingCost: number;
}

interface VitalCostTrackerProps {
  currentCost: number;
  budgetLimit?: number;
  breakdown?: CostBreakdown;
  estimatedTotal?: number;
  elapsedTimeMs?: number;
  variant?: 'compact' | 'detailed';
  className?: string;
}

/**
 * VitalCostTracker - Real-time cost monitoring component
 * 
 * Displays current session cost with budget tracking,
 * cost breakdown by category, and budget warnings.
 */
export function VitalCostTracker({
  currentCost,
  budgetLimit,
  breakdown,
  estimatedTotal,
  elapsedTimeMs,
  variant = 'compact',
  className
}: VitalCostTrackerProps) {
  const budgetPercentage = budgetLimit ? (currentCost / budgetLimit) * 100 : 0;
  const isOverBudget = budgetLimit && currentCost > budgetLimit;
  const isNearBudget = budgetLimit && budgetPercentage > 80;
  
  const formatCost = (cost: number) => {
    return cost < 0.01 
      ? `$${cost.toFixed(4)}` 
      : cost < 1 
        ? `$${cost.toFixed(3)}`
        : `$${cost.toFixed(2)}`;
  };
  
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };
  
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
              isOverBudget 
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : isNearBudget
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  : "bg-muted text-muted-foreground",
              className
            )}>
              <DollarSign className="h-3 w-3" />
              <span>{formatCost(currentCost)}</span>
              {budgetLimit && (
                <span className="text-muted-foreground/70">
                  / {formatCost(budgetLimit)}
                </span>
              )}
              {isNearBudget && !isOverBudget && (
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium">Cost Breakdown</div>
              {breakdown && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>LLM Calls ({breakdown.llmCalls})</span>
                    <span>{formatCost(breakdown.llmCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tool Calls ({breakdown.toolCalls})</span>
                    <span>{formatCost(breakdown.toolCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Embeddings ({breakdown.embeddingCalls})</span>
                    <span>{formatCost(breakdown.embeddingCost)}</span>
                  </div>
                </div>
              )}
              {budgetLimit && (
                <div className="pt-1 border-t text-xs">
                  Budget utilization: {budgetPercentage.toFixed(0)}%
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Detailed variant
  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-4",
      isOverBudget && "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
      isNearBudget && !isOverBudget && "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            isOverBudget 
              ? "bg-red-100 dark:bg-red-900" 
              : "bg-green-100 dark:bg-green-900"
          )}>
            <DollarSign className={cn(
              "h-4 w-4",
              isOverBudget 
                ? "text-red-600 dark:text-red-400" 
                : "text-green-600 dark:text-green-400"
            )} />
          </div>
          <div>
            <div className="text-sm font-medium">Session Cost</div>
            <div className="text-xs text-muted-foreground">Real-time tracking</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={cn(
            "text-2xl font-bold",
            isOverBudget && "text-red-600"
          )}>
            {formatCost(currentCost)}
          </div>
          {budgetLimit && (
            <div className="text-xs text-muted-foreground">
              of {formatCost(budgetLimit)} budget
            </div>
          )}
        </div>
      </div>
      
      {/* Budget progress */}
      {budgetLimit && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Budget Utilization</span>
            <span className={cn(
              "font-medium",
              isOverBudget && "text-red-600",
              isNearBudget && !isOverBudget && "text-yellow-600"
            )}>
              {Math.min(budgetPercentage, 100).toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={Math.min(budgetPercentage, 100)} 
            className={cn(
              "h-2",
              isOverBudget && "[&>div]:bg-red-500",
              isNearBudget && !isOverBudget && "[&>div]:bg-yellow-500"
            )}
          />
        </div>
      )}
      
      {/* Breakdown */}
      {breakdown && (
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">LLM</div>
            <div className="text-sm font-medium">{formatCost(breakdown.llmCost)}</div>
            <div className="text-xs text-muted-foreground">{breakdown.llmCalls} calls</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Tools</div>
            <div className="text-sm font-medium">{formatCost(breakdown.toolCost)}</div>
            <div className="text-xs text-muted-foreground">{breakdown.toolCalls} calls</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Embeddings</div>
            <div className="text-sm font-medium">{formatCost(breakdown.embeddingCost)}</div>
            <div className="text-xs text-muted-foreground">{breakdown.embeddingCalls} calls</div>
          </div>
        </div>
      )}
      
      {/* Footer metrics */}
      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
        {elapsedTimeMs && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Elapsed: {formatTime(elapsedTimeMs)}</span>
          </div>
        )}
        {estimatedTotal && estimatedTotal > currentCost && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Est. total: {formatCost(estimatedTotal)}</span>
          </div>
        )}
        {breakdown && (
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>
              {breakdown.llmCalls + breakdown.toolCalls + breakdown.embeddingCalls} total ops
            </span>
          </div>
        )}
      </div>
      
      {/* Budget warning */}
      {isNearBudget && (
        <div className={cn(
          "flex items-center gap-2 p-2 rounded text-xs",
          isOverBudget 
            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
        )}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {isOverBudget 
              ? `Budget exceeded by ${formatCost(currentCost - budgetLimit!)}`
              : `Approaching budget limit (${(100 - budgetPercentage).toFixed(0)}% remaining)`
            }
          </span>
        </div>
      )}
    </div>
  );
}

export default VitalCostTracker;
