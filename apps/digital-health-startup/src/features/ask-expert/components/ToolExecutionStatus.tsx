/**
 * Tool Execution Status Component
 * 
 * Shows real-time status of tool execution with progress indicators.
 * 
 * Features:
 * - Animated execution indicator
 * - Progress tracking
 * - Multiple tool support
 * - Status badges
 * - Estimated time remaining
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Globe,
  BookOpen,
  Shield,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tool icon mapping
const TOOL_ICONS: Record<string, React.ElementType> = {
  web_search: Globe,
  pubmed_search: BookOpen,
  fda_database: Shield,
  calculator: Calculator,
};

// Tool execution status
export type ToolExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'timeout';

export interface ExecutingTool {
  tool_name: string;
  display_name: string;
  status: ToolExecutionStatus;
  progress?: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number; // seconds
  error?: string;
}

export interface ToolExecutionStatusProps {
  /** List of tools being executed */
  tools: ExecutingTool[];
  
  /** Show detailed progress */
  showProgress?: boolean;
  
  /** Compact mode (smaller display) */
  compact?: boolean;
  
  /** Additional className */
  className?: string;
}

export function ToolExecutionStatusComponent({
  tools,
  showProgress = true,
  compact = false,
  className,
}: ToolExecutionStatusProps) {
  // Calculate overall progress
  const overallProgress = tools.length > 0
    ? tools.reduce((sum, tool) => sum + (tool.progress || 0), 0) / tools.length
    : 0;
  
  // Get status icon
  const getStatusIcon = (status: ToolExecutionStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'timeout':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };
  
  // Get status color
  const getStatusColor = (status: ToolExecutionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'running':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'success':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'error':
      case 'timeout':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Calculate elapsed time
  const getElapsedTime = (tool: ExecutingTool) => {
    if (!tool.startedAt) return null;
    
    const start = new Date(tool.startedAt).getTime();
    const end = tool.completedAt 
      ? new Date(tool.completedAt).getTime()
      : Date.now();
    
    const elapsed = Math.floor((end - start) / 1000);
    return elapsed;
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };
  
  if (tools.length === 0) return null;
  
  // Compact mode - single line
  if (compact) {
    const runningTools = tools.filter(t => t.status === 'running');
    const completedTools = tools.filter(t => t.status === 'success');
    
    if (runningTools.length === 0 && completedTools.length === tools.length) {
      return null; // All done, hide
    }
    
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        <span className="text-muted-foreground">
          {runningTools.length > 0
            ? `Executing ${runningTools.map(t => t.display_name).join(', ')}...`
            : `Processing ${tools.length} tool${tools.length !== 1 ? 's' : ''}...`}
        </span>
      </div>
    );
  }
  
  // Full display mode
  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <h4 className="font-medium text-sm">Executing Tools</h4>
          </div>
          
          <Badge variant="secondary">
            {tools.filter(t => t.status === 'success').length} / {tools.length}
          </Badge>
        </div>
        
        {/* Overall Progress */}
        {showProgress && (
          <div className="space-y-1">
            <Progress value={overallProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(overallProgress)}% complete
            </p>
          </div>
        )}
        
        {/* Individual Tools */}
        <div className="space-y-2">
          {tools.map((tool, index) => {
            const Icon = TOOL_ICONS[tool.tool_name] || Zap;
            const elapsed = getElapsedTime(tool);
            
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                {/* Tool Icon */}
                <div className="flex-shrink-0">
                  <div className="p-1.5 rounded bg-background">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                {/* Tool Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">
                      {tool.display_name}
                    </span>
                    
                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getStatusColor(tool.status))}
                    >
                      {tool.status}
                    </Badge>
                  </div>
                  
                  {/* Progress Bar for Running Tools */}
                  {tool.status === 'running' && tool.progress !== undefined && (
                    <Progress value={tool.progress} className="h-1" />
                  )}
                  
                  {/* Error Message */}
                  {tool.status === 'error' && tool.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {tool.error}
                    </p>
                  )}
                </div>
                
                {/* Status Icon & Time */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Time */}
                  {elapsed !== null && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(elapsed)}
                      {tool.estimatedDuration && tool.status === 'running' && (
                        <span className="opacity-60">
                          {' '}/ {formatTime(tool.estimatedDuration)}
                        </span>
                      )}
                    </span>
                  )}
                  
                  {/* Status Icon */}
                  {getStatusIcon(tool.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// Hook for managing tool execution status
export function useToolExecutionStatus() {
  const [tools, setTools] = React.useState<ExecutingTool[]>([]);
  
  const startExecution = React.useCallback((toolsToExecute: Array<{
    tool_name: string;
    display_name: string;
    estimatedDuration?: number;
  }>) => {
    setTools(
      toolsToExecute.map(tool => ({
        ...tool,
        status: 'pending' as ToolExecutionStatus,
        progress: 0,
        startedAt: new Date().toISOString(),
      }))
    );
  }, []);
  
  const updateToolStatus = React.useCallback((
    toolName: string,
    updates: Partial<ExecutingTool>
  ) => {
    setTools(prev =>
      prev.map(tool =>
        tool.tool_name === toolName
          ? { ...tool, ...updates }
          : tool
      )
    );
  }, []);
  
  const completeExecution = React.useCallback(() => {
    setTools([]);
  }, []);
  
  return {
    tools,
    startExecution,
    updateToolStatus,
    completeExecution,
  };
}

