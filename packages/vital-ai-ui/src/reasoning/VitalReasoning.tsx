'use client';

/**
 * VitalReasoning - AI Reasoning Display Component Suite
 * 
 * Displays AI reasoning content, automatically opening during streaming
 * and closing when finished. Uses Radix Collapsible for smooth animations.
 * 
 * Features:
 * - Automatically opens when streaming content and closes when finished
 * - Manual toggle control for user interaction
 * - Smooth animations and transitions powered by Radix UI
 * - Visual streaming indicator with pulsing animation
 * - Composable architecture with separate trigger and content components
 * - Built with accessibility in mind including keyboard navigation
 * - Responsive design that works across different screen sizes
 * - Seamlessly integrates with both light and dark themes
 * - TypeScript support with proper type definitions
 * 
 * @example
 * ```tsx
 * <VitalReasoning isStreaming={status === 'streaming'}>
 *   <VitalReasoningTrigger />
 *   <VitalReasoningContent>{reasoningText}</VitalReasoningContent>
 * </VitalReasoning>
 * ```
 */

import { cn } from '../lib/utils';
import { BrainIcon, ChevronDownIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, forwardRef, memo, useContext, useEffect, useState, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
}

export type VitalReasoningProps = ComponentProps<'div'> & {
  /** Whether the reasoning is currently streaming (auto-opens and closes the panel) */
  isStreaming?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Duration in seconds (for display purposes) */
  duration?: number;
};

export type VitalReasoningTriggerProps = ComponentProps<'button'> & {
  /** Optional title to display in the trigger */
  title?: string;
  /** Optional function to customize the thinking message */
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

export type VitalReasoningContentProps = ComponentProps<'div'> & {
  /** Content to display (typically reasoning text) */
  children: string | ReactNode;
};

// ============================================================================
// Constants
// ============================================================================

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

// ============================================================================
// Context
// ============================================================================

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error('Reasoning components must be used within VitalReasoning');
  }
  return context;
};

// ============================================================================
// Shimmer Effect Component (inline for streaming text)
// ============================================================================

const Shimmer = ({ children, duration = 1 }: { children: ReactNode; duration?: number }) => (
  <span
    className="inline-block animate-pulse"
    style={{ animationDuration: `${duration}s` }}
  >
    {children}
  </span>
);

// ============================================================================
// Components
// ============================================================================

/**
 * Root reasoning container
 */
export const VitalReasoning = memo(forwardRef<HTMLDivElement, VitalReasoningProps>(
  (
    {
      className,
      isStreaming = false,
      open: controlledOpen,
      defaultOpen = true,
      onOpenChange,
      duration: durationProp,
      children,
      ...props
    },
    ref
  ) => {
    // State management
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = controlledOpen ?? internalOpen;
    const setIsOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    const [duration, setDuration] = useState<number | undefined>(durationProp);
    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Track duration when streaming starts and ends
    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          setStartTime(Date.now());
        }
      } else if (startTime !== null) {
        setDuration(Math.ceil((Date.now() - startTime) / MS_IN_S));
        setStartTime(null);
      }
    }, [isStreaming, startTime]);

    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    useEffect(() => {
      if (defaultOpen && !isStreaming && isOpen && !hasAutoClosed) {
        // Add a small delay before closing to allow user to see the content
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosed(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, defaultOpen, hasAutoClosed]);

    return (
      <ReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen, duration }}>
        <div
          ref={ref}
          data-state={isOpen ? 'open' : 'closed'}
          className={cn('not-prose mb-4', className)}
          {...props}
        >
          {children}
        </div>
      </ReasoningContext.Provider>
    );
  }
));

/**
 * Default thinking message generator
 */
const defaultGetThinkingMessage = (isStreaming: boolean, duration?: number): ReactNode => {
  if (isStreaming || duration === 0) {
    return <Shimmer duration={1}>Thinking...</Shimmer>;
  }
  if (duration === undefined) {
    return <span>Thought for a few seconds</span>;
  }
  return <span>Thought for {duration} seconds</span>;
};

/**
 * Reasoning trigger button
 */
export const VitalReasoningTrigger = memo(forwardRef<HTMLButtonElement, VitalReasoningTriggerProps>(
  (
    {
      className,
      title = 'Reasoning',
      getThinkingMessage = defaultGetThinkingMessage,
      children,
      ...props
    },
    ref
  ) => {
    const { isStreaming, isOpen, setIsOpen, duration } = useReasoning();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center gap-2 text-muted-foreground text-sm',
          'transition-colors hover:text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded',
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <BrainIcon className="size-4" />
            {getThinkingMessage(isStreaming, duration)}
            <ChevronDownIcon
              className={cn(
                'size-4 transition-transform duration-200',
                isOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </>
        )}
      </button>
    );
  }
));

/**
 * Reasoning content container
 */
export const VitalReasoningContent = memo(forwardRef<HTMLDivElement, VitalReasoningContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useReasoning();

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'mt-4 text-sm text-muted-foreground',
          'animate-in fade-in-0 slide-in-from-top-2 duration-200',
          className
        )}
        {...props}
      >
        <div className="whitespace-pre-wrap">{children}</div>
      </div>
    );
  }
));

// ============================================================================
// Display Names
// ============================================================================

VitalReasoning.displayName = 'VitalReasoning';
VitalReasoningTrigger.displayName = 'VitalReasoningTrigger';
VitalReasoningContent.displayName = 'VitalReasoningContent';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const Reasoning = VitalReasoning;
export const ReasoningTrigger = VitalReasoningTrigger;
export const ReasoningContent = VitalReasoningContent;

export default VitalReasoning;
