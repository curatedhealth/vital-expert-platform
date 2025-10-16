import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Loader2, 
  ChevronDown, 
  User, 
  Wrench, 
  CheckCircle, 
  AlertCircle, 
  Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReasoningEvent {
  id: string;
  type: 'reasoning' | 'agent_selection' | 'tool_execution' | 'complete' | 'error';
  step: string;
  description: string;
  timestamp: Date;
  data?: Record<string, any>;
}

interface ReasoningDisplayProps {
  reasoningEvents: ReasoningEvent[];
  isActive: boolean;
  className?: string;
}

export function ReasoningDisplay({
  reasoningEvents,
  isActive,
  className
}: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Safety check for reasoningEvents array
  const safeReasoningEvents = Array.isArray(reasoningEvents) ? reasoningEvents : [];
  
  if (safeReasoningEvents.length === 0 && !isActive) {
    return null;
  }
  
  return (
    <Card className={cn(
      "mt-4 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
      "animate-pulse-subtle",
      className
    )}>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-sm">AI Reasoning Process</CardTitle>
            {isActive && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              !isExpanded && "rotate-180"
            )}
          />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
        <div className="space-y-3">
          {safeReasoningEvents.map((event, index) => (
              <ReasoningStep
                key={index}
                event={event}
                isLast={index === safeReasoningEvents.length - 1}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ReasoningStep({ event, isLast }: { event: ReasoningEvent; isLast: boolean }) {
  const getIcon = () => {
    switch (event.type) {
      case 'agent_selection':
        return <User className="h-4 w-4" />;
      case 'tool_execution':
        return <Wrench className="h-4 w-4" />;
      case 'reasoning':
        return <Brain className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{event.step}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        {event.data && (
          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}