'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReasoningStep {
  step: string;
  content: string;
}

interface ReasoningDisplayProps {
  reasoning: ReasoningStep[] | string[];
  className?: string;
}

export function ReasoningDisplay({ reasoning, className }: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!reasoning || reasoning.length === 0) return null;

  // Normalize reasoning to array of steps
  const steps: ReasoningStep[] = reasoning.map((item, index) => {
    if (typeof item === 'string') {
      return { step: `Step ${index + 1}`, content: item };
    }
    return item;
  });

  return (
    <Card className={cn("mt-3 border-blue-200 bg-blue-50/50", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left group"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Reasoning Process
            </span>
            <Badge variant="secondary" className="text-xs">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
          )}
        </button>

        {/* Reasoning Steps */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex gap-3 p-3 bg-white rounded-lg border border-blue-100"
              >
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {step.step}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

