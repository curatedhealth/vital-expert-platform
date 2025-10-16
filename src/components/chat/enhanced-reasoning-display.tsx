'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  User, 
  Wrench, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ReasoningEvent {
  id: string;
  type: 'reasoning' | 'agent_selection' | 'tool_execution' | 'complete' | 'error';
  step: string;
  description: string;
  timestamp: Date;
  data?: Record<string, any>;
  status?: 'running' | 'completed' | 'error';
}

interface EnhancedReasoningDisplayProps {
  reasoningEvents: ReasoningEvent[];
  isActive: boolean;
  className?: string;
  showProgress?: boolean;
  autoCollapse?: boolean;
}

export function EnhancedReasoningDisplay({
  reasoningEvents,
  isActive,
  className,
  showProgress = true,
  autoCollapse = true
}: EnhancedReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Safety check for reasoningEvents array
  const safeReasoningEvents = Array.isArray(reasoningEvents) ? reasoningEvents : [];

  // Debug logging
  console.log('🧠 [EnhancedReasoningDisplay] Props received:', {
    reasoningEventsCount: safeReasoningEvents.length,
    isActive,
    showProgress,
    autoCollapse,
    willRender: !(safeReasoningEvents.length === 0 && !isActive)
  });
  
  // Calculate progress based on events
  useEffect(() => {
    if (safeReasoningEvents.length === 0) {
      setProgress(0);
      return;
    }
    
    const completedEvents = safeReasoningEvents.filter(event => 
      event.status === 'completed' || event.type === 'complete'
    ).length;
    
    const totalEvents = safeReasoningEvents.length;
    const progressPercent = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
    setProgress(progressPercent);
  }, [safeReasoningEvents]);

  // Auto-collapse when reasoning is complete
  useEffect(() => {
    if (autoCollapse && !isActive && safeReasoningEvents.length > 0) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 2000); // Auto-collapse after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isActive, safeReasoningEvents.length, autoCollapse]);

  if (safeReasoningEvents.length === 0 && !isActive) {
    return null;
  }
  
  const getStatusColor = (event: ReasoningEvent) => {
    switch (event.status) {
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'running':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (event: ReasoningEvent) => {
    if (event.status === 'running') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
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
    <Card className={cn(
      "mt-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50",
      isActive && "shadow-lg ring-2 ring-blue-200",
      className
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="h-5 w-5 text-blue-500" />
                  {isActive && (
                    <div className="absolute -top-1 -right-1">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-blue-900">
                    AI Reasoning Process
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      {isActive ? 'Thinking...' : `${safeReasoningEvents.length} steps completed`}
                    </span>
                    {!isActive && safeReasoningEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showProgress && safeReasoningEvents.length > 0 && (
                  <div className="w-20">
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-blue-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {safeReasoningEvents.map((event, index) => (
                <ReasoningStep
                  key={event.id || index}
                  event={event}
                  isLast={index === safeReasoningEvents.length - 1}
                  isActive={isActive && index === safeReasoningEvents.length - 1}
                />
              ))}
              
              {isActive && safeReasoningEvents.length === 0 && (
                <div className="flex items-center gap-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-blue-600">Initializing reasoning process...</span>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function ReasoningStep({ 
  event, 
  isLast, 
  isActive 
}: { 
  event: ReasoningEvent; 
  isLast: boolean; 
  isActive: boolean;
}) {
  const getStatusColor = (event: ReasoningEvent) => {
    switch (event.status) {
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'running':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (event: ReasoningEvent) => {
    if (event.status === 'running' || isActive) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (event.type) {
      case 'agent_selection':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'tool_execution':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'reasoning':
        return <Brain className="h-4 w-4 text-blue-500" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-lg transition-all duration-200",
      isActive && "bg-blue-50 border border-blue-200",
      event.status === 'completed' && "bg-green-50 border border-green-200",
      event.status === 'error' && "bg-red-50 border border-red-200"
    )}>
      <div className="flex-shrink-0 mt-1">
        {getStatusIcon(event)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {event.step}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
          {event.status && (
            <Badge 
              variant={event.status === 'completed' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {event.status}
            </Badge>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {event.description}
          </p>
        )}
        {event.data && Object.keys(event.data).length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              View details
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
