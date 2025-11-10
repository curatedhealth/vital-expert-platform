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

import { useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Eye, Search, Lightbulb, Circle, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@vital/ui/components/shadcn-io/ai/reasoning';

import type { ModelReasoningPart, ReasoningStep } from '../types';

export interface AIReasoningProps {
  /**
   * Array of reasoning steps from LangGraph workflow
   */
  reasoningSteps?: ReasoningStep[];
  
  /**
   * Optional reasoning parts streamed from reasoning-capable models (Vercel AI SDK)
   */
  modelReasoningParts?: ModelReasoningPart[];
  
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
  
  /**
   * Additional sections rendered under the reasoning steps (e.g., workflow progress, metrics)
   */
  supplementalContent?: ReactNode;
}

const reasoningThemes: Record<string, { icon: JSX.Element; gradient: string; label: string }> = {
  thought: {
    icon: <Brain className="h-4 w-4 text-purple-600" />,
    gradient: 'from-purple-400/80 to-purple-100/80',
    label: 'text-purple-700 dark:text-purple-200',
  },
  action: {
    icon: <Zap className="h-4 w-4 text-blue-500" />,
    gradient: 'from-blue-400/80 to-blue-100/80',
    label: 'text-blue-700 dark:text-blue-200',
  },
  observation: {
    icon: <Eye className="h-4 w-4 text-emerald-600" />,
    gradient: 'from-emerald-500/80 to-emerald-200/80',
    label: 'text-emerald-700 dark:text-emerald-200',
  },
  search: {
    icon: <Search className="h-4 w-4 text-orange-500" />,
    gradient: 'from-orange-400/70 to-orange-100/70',
    label: 'text-orange-700 dark:text-orange-200',
  },
  reflection: {
    icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
    gradient: 'from-amber-400/70 to-amber-100/70',
    label: 'text-amber-700 dark:text-amber-200',
  },
  default: {
    icon: <Circle className="h-4 w-4 text-gray-400" />,
    gradient: 'from-gray-300/70 to-gray-100/70',
    label: 'text-gray-700 dark:text-gray-200',
  },
};

const getReasoningVisuals = (type: string) => reasoningThemes[type] ?? reasoningThemes.default;

/**
 * AIReasoning Component
 * 
 * Displays AI reasoning steps with progressive disclosure and professional styling.
 */
export function AIReasoning({
  reasoningSteps = [],
  modelReasoningParts,
  isStreaming = false,
  defaultOpen = true,
  keepOpen = true,
  title = "AI Reasoning",
  className,
  open,
  onOpenChange,
  supplementalContent,
}: AIReasoningProps) {
  const normalizedSteps = useMemo<ReasoningStep[]>(() => {
    const baseSteps = Array.isArray(reasoningSteps) ? reasoningSteps : [];
    const modelSteps =
      modelReasoningParts?.map((part, idx) => ({
        id: part.id || `model-reasoning-${idx}`,
        type: part.type || 'thought',
        content: part.text,
        confidence: part.confidence,
      })) ?? [];
    return [...baseSteps, ...modelSteps];
  }, [reasoningSteps, modelReasoningParts]);

  if (!normalizedSteps.length && !supplementalContent) {
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
        {/* Progress indicator when streaming */}
        {isStreaming && normalizedSteps.length > 0 && (
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span>Processing step {normalizedSteps.length}...</span>
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
          </div>
        )}
        
        {normalizedSteps.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {normalizedSteps.map((step, idx) => {
                const visuals = getReasoningVisuals(step.type || '');
                const isLast = idx === normalizedSteps.length - 1;
                return (
                  <motion.div
                    key={step.id || `step-${idx}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'w-1 rounded-full block',
                          'bg-gradient-to-b',
                          visuals.gradient
                        )}
                        style={{ minHeight: '32px' }}
                      />
                      {!isLast && (
                        <span className="w-px flex-1 bg-gradient-to-b from-transparent via-gray-200/70 to-transparent dark:via-gray-700/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{visuals.icon}</span>
                        {step.type && (
                          <span
                            className={cn(
                              'text-xs font-semibold tracking-wide uppercase',
                              visuals.label
                            )}
                          >
                            {step.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {step.content}
                      </p>
                      {step.confidence !== undefined && (
                        <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0.5">
                          {Math.round(step.confidence * 100)}% confident
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {supplementalContent && (
          <div className={cn(normalizedSteps.length > 0 && 'mt-3')}>
            {supplementalContent}
          </div>
        )}
      </ReasoningContent>
    </Reasoning>
  );
}

export default AIReasoning;
