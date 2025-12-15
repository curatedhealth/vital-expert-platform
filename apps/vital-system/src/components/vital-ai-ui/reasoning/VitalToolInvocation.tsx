'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ChevronDown,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

type ToolStatus = 'pending' | 'running' | 'success' | 'error' | 'timeout';

interface ToolInvocation {
  id: string;
  name: string;
  description?: string;
  status: ToolStatus;
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

interface VitalToolInvocationProps {
  invocation: ToolInvocation;
  showInput?: boolean;
  showOutput?: boolean;
  isExpanded?: boolean;
  className?: string;
}

const statusConfig: Record<ToolStatus, { 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}> = {
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  running: { icon: Loader2, color: 'text-blue-500', label: 'Running' },
  success: { icon: CheckCircle, color: 'text-green-500', label: 'Success' },
  error: { icon: XCircle, color: 'text-red-500', label: 'Error' },
  timeout: { icon: AlertTriangle, color: 'text-orange-500', label: 'Timeout' },
};

/**
 * VitalToolInvocation - Tool call display component
 * 
 * Displays tool invocations with status, input/output data,
 * execution time, and error handling.
 */
export function VitalToolInvocation({
  invocation,
  showInput = true,
  showOutput = true,
  isExpanded: defaultExpanded = false,
  className
}: VitalToolInvocationProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const config = statusConfig[invocation.status];
  const Icon = config.icon;
  const isRunning = invocation.status === 'running';
  const hasDetails = (showInput && invocation.input) || 
                     (showOutput && invocation.output) || 
                     invocation.error;
  
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        "border rounded-lg overflow-hidden",
        invocation.status === 'error' && "border-red-200 dark:border-red-800",
        invocation.status === 'success' && "border-green-200 dark:border-green-800",
        className
      )}
    >
      <CollapsibleTrigger 
        className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
        disabled={!hasDetails}
      >
        <div className="flex items-center gap-3">
          {/* Tool icon */}
          <div className={cn(
            "p-1.5 rounded",
            invocation.status === 'success' && "bg-green-100 dark:bg-green-900",
            invocation.status === 'error' && "bg-red-100 dark:bg-red-900",
            invocation.status === 'running' && "bg-blue-100 dark:bg-blue-900",
            invocation.status === 'pending' && "bg-muted",
            invocation.status === 'timeout' && "bg-orange-100 dark:bg-orange-900"
          )}>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Tool info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{invocation.name}</span>
              <Badge variant="outline" className={cn("text-xs", config.color)}>
                <Icon className={cn(
                  "h-3 w-3 mr-1",
                  isRunning && "animate-spin"
                )} />
                {config.label}
              </Badge>
            </div>
            {invocation.description && (
              <p className="text-xs text-muted-foreground truncate">
                {invocation.description}
              </p>
            )}
          </div>
          
          {/* Duration */}
          {invocation.duration !== undefined && (
            <span className="text-xs text-muted-foreground">
              {invocation.duration}ms
            </span>
          )}
          
          {/* Expand icon */}
          {hasDetails && (
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )} />
          )}
        </div>
      </CollapsibleTrigger>
      
      {hasDetails && (
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* Input */}
            {(showInput && invocation.input) ? (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Input
                </span>
                <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
                  {JSON.stringify(invocation.input, null, 2)}
                </pre>
              </div>
            ) : null}
            
            {/* Output */}
            {(showOutput && invocation.output) ? (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Output
                </span>
                <pre className="text-xs bg-muted rounded p-2 overflow-x-auto max-h-40">
                  {typeof invocation.output === 'string' 
                    ? invocation.output 
                    : JSON.stringify(invocation.output, null, 2)
                  }
                </pre>
              </div>
            ) : null}
            
            {/* Error */}
            {invocation.error && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-red-600">Error</span>
                <div className="text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded p-2">
                  {invocation.error}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

/**
 * VitalToolInvocationList - List of tool invocations
 */
export function VitalToolInvocationList({ 
  invocations,
  className 
}: { 
  invocations: ToolInvocation[];
  className?: string;
}) {
  const runningCount = invocations.filter(i => i.status === 'running').length;
  const successCount = invocations.filter(i => i.status === 'success').length;
  const errorCount = invocations.filter(i => i.status === 'error').length;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Tool Calls
        </h4>
        <div className="flex items-center gap-2 text-xs">
          {runningCount > 0 && (
            <Badge variant="outline" className="text-blue-600">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {runningCount} running
            </Badge>
          )}
          {successCount > 0 && (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              {successCount}
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="outline" className="text-red-600">
              <XCircle className="h-3 w-3 mr-1" />
              {errorCount}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {invocations.map((invocation) => (
          <VitalToolInvocation key={invocation.id} invocation={invocation} />
        ))}
      </div>
    </div>
  );
}

export default VitalToolInvocation;
