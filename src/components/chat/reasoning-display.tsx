'use client';

import React from 'react';
import { Brain, ChevronDown, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';

export function ReasoningDisplay() {
  const { currentReasoning } = useChatStore();
  const [isOpen, setIsOpen] = React.useState(true);

  if (!currentReasoning || currentReasoning.length === 0) {
    return null;
  }

  const getStepIcon = (step: any) => {
    if (step.status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (step.status === 'error') return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (step.status === 'running') return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStepColor = (step: any) => {
    if (step.status === 'completed') return 'bg-green-50 border-green-200';
    if (step.status === 'error') return 'bg-red-50 border-red-200';
    if (step.status === 'running') return 'bg-blue-50 border-blue-200';
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
                {currentReasoning.length} steps
              </Badge>
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
              {currentReasoning.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    getStepColor(step)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {step.title || `Step ${index + 1}`}
                        </h4>
                        <Badge 
                          variant={step.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {step.status || 'pending'}
                        </Badge>
                      </div>
                      
                      {step.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {step.description}
                        </p>
                      )}
                      
                      {step.details && (
                        <div className="text-xs text-gray-500 bg-white/50 p-2 rounded border">
                          <pre className="whitespace-pre-wrap font-mono">
                            {typeof step.details === 'string' 
                              ? step.details 
                              : JSON.stringify(step.details, null, 2)
                            }
                          </pre>
                        </div>
                      )}
                      
                      {step.tools && step.tools.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Tools used:</p>
                          <div className="flex flex-wrap gap-1">
                            {step.tools.map((tool: any, toolIndex: number) => (
                              <Badge key={toolIndex} variant="outline" className="text-xs">
                                {tool.name || tool}
                              </Badge>
                            ))}
                          </div>
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
