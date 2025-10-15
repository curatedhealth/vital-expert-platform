'use client';

import React from 'react';
import { Brain, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';

export function ReasoningDisplay() {
  const { reasoningEvents, isReasoningActive, liveReasoning } = useChatStore();
  const [isOpen, setIsOpen] = React.useState(true);

  // Debug logging
  React.useEffect(() => {
    console.log('🧠 [ReasoningDisplay] State update:', {
      reasoningEventsCount: reasoningEvents?.length || 0,
      isReasoningActive,
      liveReasoningLength: liveReasoning?.length || 0,
      events: reasoningEvents?.map(e => ({ type: e.type, step: e.step, description: e.description?.substring(0, 50) }))
    });
  }, [reasoningEvents, isReasoningActive, liveReasoning]);

  // Show reasoning display if we have events OR if we're actively reasoning
  if ((!reasoningEvents || reasoningEvents.length === 0) && !isReasoningActive && !liveReasoning) {
    return null;
  }

  // Check if workflow is complete
  const isComplete = reasoningEvents?.some(event => event.type === 'complete') || false;
  const hasError = reasoningEvents?.some(event => event.type === 'error') || false;

  const getStepIcon = (event: any) => {
    if (event.type === 'complete') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (event.type === 'error') return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (isReasoningActive && event.type === 'reasoning') return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStepColor = (event: any) => {
    if (event.type === 'complete') return 'bg-green-50 border-green-200';
    if (event.type === 'error') return 'bg-red-50 border-red-200';
    if (isReasoningActive && event.type === 'reasoning') return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <Card className="mt-4 border-l-4 border-l-blue-500">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              AI Reasoning Process
              <Badge variant="outline" className="text-xs">
                {reasoningEvents.length} steps
              </Badge>
              {isComplete && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Complete
                </Badge>
              )}
              {hasError && (
                <Badge variant="destructive" className="text-xs">
                  Error
                </Badge>
              )}
              {isReasoningActive && !isComplete && !hasError && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 animate-pulse">
                  Processing...
                </Badge>
              )}
              {isOpen ? (
                <ChevronDown className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {reasoningEvents.map((event, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    getStepColor(event)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {event.step || `Step ${index + 1}`}
                        </h4>
                        <Badge 
                          variant={event.type === 'complete' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {event.type}
                        </Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>
                      )}
                      
                      {event.data && Object.keys(event.data).length > 0 && (
                        <div className="text-xs text-gray-500 bg-white/50 p-2 rounded border">
                          <pre className="whitespace-pre-wrap font-mono">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}