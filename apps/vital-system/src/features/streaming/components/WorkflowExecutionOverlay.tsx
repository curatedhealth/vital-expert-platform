/**
 * WorkflowExecutionOverlay Component
 * 
 * Overlay showing real-time workflow execution status.
 * Highlights nodes as they execute.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Square,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { NodeExecution, ExecutionProgress, ExecutionResult } from '../hooks/useWorkflowExecution';

interface WorkflowExecutionOverlayProps {
  isExecuting: boolean;
  executionId: string | null;
  progress: ExecutionProgress | null;
  nodeExecutions: Map<string, NodeExecution>;
  result: ExecutionResult | null;
  error: Error | null;
  currentTokens: string;
  onCancel: () => void;
  className?: string;
}

const nodeStatusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
};

export function WorkflowExecutionOverlay({
  isExecuting,
  executionId,
  progress,
  nodeExecutions,
  result,
  error,
  currentTokens,
  onCancel,
  className,
}: WorkflowExecutionOverlayProps) {
  const nodes = Array.from(nodeExecutions.values());
  const runningNodes = nodes.filter(n => n.status === 'running');
  const completedNodes = nodes.filter(n => n.status === 'completed');
  const failedNodes = nodes.filter(n => n.status === 'failed');

  if (!isExecuting && !result && !error) {
    return null;
  }

  return (
    <Card className={cn(
      'fixed bottom-4 right-4 w-96 shadow-xl z-50',
      'border-2',
      isExecuting ? 'border-blue-500' : result?.status === 'completed' ? 'border-green-500' : 'border-red-500',
      className
    )}>
      {/* Header */}
      <div className={cn(
        'p-4 border-b flex items-center justify-between',
        isExecuting ? 'bg-blue-50 dark:bg-blue-950/30' : 
        result?.status === 'completed' ? 'bg-green-50 dark:bg-green-950/30' :
        'bg-red-50 dark:bg-red-950/30'
      )}>
        <div className="flex items-center gap-2">
          {isExecuting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="font-semibold">Executing Workflow</span>
            </>
          ) : result?.status === 'completed' ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Execution Complete</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-semibold">Execution Failed</span>
            </>
          )}
        </div>
        
        {isExecuting && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <Square className="h-4 w-4 mr-1" />
            Stop
          </Button>
        )}
      </div>

      {/* Progress */}
      {progress && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {progress.description || 'Processing...'}
            </span>
            {progress.percentComplete !== undefined && (
              <span className="font-medium">
                {Math.round(progress.percentComplete)}%
              </span>
            )}
          </div>
          <Progress value={progress.percentComplete} className="h-2" />
        </div>
      )}

      {/* Node Executions */}
      <ScrollArea className="h-64">
        <div className="p-4 space-y-2">
          {/* Summary Stats */}
          <div className="flex items-center gap-4 text-sm mb-3">
            <Badge variant="outline" className="gap-1">
              <Play className="h-3 w-3" />
              {runningNodes.length} running
            </Badge>
            <Badge variant="outline" className="gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              {completedNodes.length} done
            </Badge>
            {failedNodes.length > 0 && (
              <Badge variant="outline" className="gap-1 text-red-600">
                <XCircle className="h-3 w-3" />
                {failedNodes.length} failed
              </Badge>
            )}
          </div>

          {/* Node List */}
          {nodes.map((node) => {
            const config = nodeStatusConfig[node.status];
            const Icon = config.icon;
            
            return (
              <div
                key={node.nodeId}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg text-sm',
                  config.bg
                )}
              >
                <Icon className={cn(
                  'h-4 w-4',
                  config.color,
                  node.status === 'running' && 'animate-spin'
                )} />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{node.nodeId}</div>
                  <div className="text-xs text-muted-foreground">
                    {node.nodeType}
                    {node.endTime && node.startTime && (
                      <span className="ml-2">
                        • {((node.endTime.getTime() - node.startTime.getTime()) / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>

                {node.status === 'failed' && node.error && (
                  <div className="text-xs text-red-600 truncate max-w-24">
                    {node.error}
                  </div>
                )}
              </div>
            );
          })}

          {/* Streaming Output */}
          {currentTokens && (
            <div className="mt-3 p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Sparkles className="h-3 w-3" />
                Streaming Output
              </div>
              <div className="text-sm whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                {currentTokens}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - Results */}
      {result && (
        <div className="p-4 border-t">
          {result.status === 'completed' && result.metrics && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{result.metrics.nodesExecuted} nodes executed</span>
              <span>{(result.metrics.durationMs / 1000).toFixed(1)}s</span>
              <span>{result.metrics.totalTokens} tokens</span>
            </div>
          )}
          
          {result.status === 'failed' && result.error && (
            <div className="text-sm text-red-600">
              Error: {result.error}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && !result && (
        <div className="p-4 border-t bg-red-50 dark:bg-red-950/30">
          <div className="text-sm text-red-600">
            {error.message}
          </div>
        </div>
      )}
    </Card>
  );
}






