/**
 * AI Reasoning Component
 * 
 * TAG: SHARED_AI_REASONING_COMPONENT
 * 
 * Displays AI reasoning steps from LangGraph workflows with:
 * - Progressive disclosure (Framer Motion animations)
 * - Professional Lucide React icons (no emojis)
 * - Support for multiple reasoning types (thought, action, observation, search, reflection)
 * - Streaming state support
 * - Reusable across all modes (Mode 1-4)
 * 
 * Usage:
 *   import { AIReasoning } from '@vital/ai-components';
 *   
 *   <AIReasoning
 *     reasoningSteps={metadata.reasoningSteps}
 *     isStreaming={isStreaming}
 *     defaultOpen={true}
 *     keepOpen={true}
 *   />
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Eye, Search, Lightbulb, Circle } from 'lucide-react';
import { Badge } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@vital/ui/shadcn-io/ai/reasoning';

// Import Response component for markdown rendering
// Note: This should be available from your AI components or UI library
// Adjust the import path as needed
import { Response as AIResponse } from '@vital/ui/ai/response';

export interface ReasoningStep {
  id?: string;
  type: 'thought' | 'action' | 'observation' | 'search' | 'reflection' | string;
  content: string;
  confidence?: number;
  timestamp?: string;
  metadata?: Record<string, any>;
  node?: string;
}

export interface AIReasoningProps {
  /**
   * Array of reasoning steps from LangGraph workflow
   */
  reasoningSteps: ReasoningStep[];
  
  /**
   * Whether AI is currently streaming
   */
  isStreaming?: boolean;
  
  /**
   * Whether to show reasoning by default
   */
  defaultOpen?: boolean;
  
  /**
   * Whether to keep reasoning open after streaming completes
   */
  keepOpen?: boolean;
  
  /**
   * Custom title for the reasoning section
   */
  title?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Controlled open state
   */
  open?: boolean;
  
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Get the appropriate icon for a reasoning step type
 */
function getReasoningIcon(type: string) {
  switch (type) {
    case 'thought':
      return <Brain className="h-4 w-4 text-purple-600" />;
    case 'action':
      return <Zap className="h-4 w-4 text-blue-600" />;
    case 'observation':
      return <Eye className="h-4 w-4 text-green-600" />;
    case 'search':
      return <Search className="h-4 w-4 text-orange-600" />;
    case 'reflection':
      return <Lightbulb className="h-4 w-4 text-yellow-600" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
}

/**
 * Get the appropriate background and border classes for a reasoning step type
 */
function getReasoningStyles(type: string): string {
  switch (type) {
    case 'thought':
      return "bg-purple-50/50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800";
    case 'action':
      return "bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
    case 'observation':
      return "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    case 'search':
      return "bg-orange-50/50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800";
    case 'reflection':
      return "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
    default:
      return "bg-gray-50/50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700";
  }
}

/**
 * AIReasoning Component
 * 
 * Displays AI reasoning steps with progressive disclosure and professional styling.
 */
export function AIReasoning({
  reasoningSteps,
  isStreaming = false,
  defaultOpen = true,
  keepOpen = true,
  title = "AI Reasoning",
  className,
  open,
  onOpenChange,
}: AIReasoningProps) {
  // Don't render if no reasoning steps
  if (!reasoningSteps || reasoningSteps.length === 0) {
    return null;
  }

  return (
    <Reasoning
      isStreaming={isStreaming}
      defaultOpen={defaultOpen}
      keepOpen={keepOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("mt-3", className)}
    >
      <ReasoningTrigger title={title} />
      <ReasoningContent>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {reasoningSteps.map((step, idx) => (
              <motion.div
                key={step.id || `step-${idx}`}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.05, // Stagger by 50ms per step
                }}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-3 border",
                  getReasoningStyles(step.type)
                )}
              >
                <div className="mt-0.5">
                  {getReasoningIcon(step.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {step.type && (
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1.5 uppercase tracking-wide">
                      {step.type}
                    </div>
                  )}
                  <AIResponse className="text-sm text-gray-700 dark:text-gray-200 [&>p]:my-0 [&>p]:leading-relaxed">
                    {step.content}
                  </AIResponse>
                  {step.confidence !== undefined && (
                    <Badge variant="secondary" className="mt-2 text-[10px] px-2 py-0.5">
                      {Math.round(step.confidence * 100)}% confident
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ReasoningContent>
    </Reasoning>
  );
}

export default AIReasoning;

