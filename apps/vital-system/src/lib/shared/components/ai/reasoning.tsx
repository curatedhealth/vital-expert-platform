'use client';

import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@vital/ui/lib/utils';

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  startTime: number;
  duration: number;
}

const ReasoningContext = React.createContext<ReasoningContextValue>({
  isStreaming: false,
  isOpen: false,
  setIsOpen: () => {},
  startTime: 0,
  duration: 0,
});

interface ReasoningProps {
  children: React.ReactNode;
  isStreaming?: boolean;
  className?: string;
}

export function Reasoning({ children, isStreaming = false, className }: ReasoningProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [startTime] = React.useState(Date.now());
  const [duration, setDuration] = React.useState(0);

  // Auto-open when streaming starts
  React.useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  // Update duration while streaming
  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setDuration(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isStreaming, startTime]);

  // Don't auto-close - let user manually collapse
  // React.useEffect(() => {
  //   if (!isStreaming && isOpen) {
  //     // Delay close slightly to allow user to see final state
  //     const timeout = setTimeout(() => {
  //       setIsOpen(false);
  //     }, 1000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [isStreaming, isOpen]);

  const value = React.useMemo(
    () => ({
      isStreaming,
      isOpen,
      setIsOpen,
      startTime,
      duration,
    }),
    [isStreaming, isOpen, startTime, duration]
  );

  return (
    <ReasoningContext.Provider value={value}>
      <div
        className={cn(
          'rounded-lg border border-neutral-200 bg-neutral-50/50 overflow-hidden transition-all',
          className
        )}
      >
        {children}
      </div>
    </ReasoningContext.Provider>
  );
}

interface ReasoningTriggerProps {
  title?: string;
  className?: string;
}

export function ReasoningTrigger({ title = 'Thinking', className }: ReasoningTriggerProps) {
  const { isStreaming, isOpen, setIsOpen, duration } = React.useContext(ReasoningContext);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-neutral-100/50',
        className
      )}
      aria-expanded={isOpen}
      aria-controls="reasoning-content"
    >
      <div className="flex items-center gap-2">
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : (
          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <span className="text-neutral-700">
          {title}
          {isStreaming ? '...' : ''}
        </span>
        {duration > 0 && (
          <span className="text-xs text-neutral-500">
            {formatDuration(duration)}
          </span>
        )}
      </div>
      {isOpen ? (
        <ChevronUp className="h-4 w-4 text-neutral-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-neutral-500" />
      )}
    </button>
  );
}

interface ReasoningContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ReasoningContent({ children, className }: ReasoningContentProps) {
  const { isOpen } = React.useContext(ReasoningContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(0);

  React.useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setHeight(entries[0].contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div
      id="reasoning-content"
      style={{
        maxHeight: isOpen ? height : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
      }}
    >
      <div ref={contentRef}>
        <div
          className={cn(
            'px-4 py-3 text-sm text-neutral-600 border-t border-neutral-200 bg-white',
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Convenience component for step-by-step reasoning
interface ReasoningStepProps {
  step: number;
  children: React.ReactNode;
  className?: string;
}

export function ReasoningStep({ step, children, className }: ReasoningStepProps) {
  return (
    <div className={cn('flex gap-3 mb-3 last:mb-0', className)}>
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
        {step}
      </div>
      <div className="flex-1 pt-0.5">{children}</div>
    </div>
  );
}

// Convenience component for reasoning with markdown-style formatting
interface ReasoningTextProps {
  children: React.ReactNode;
  className?: string;
}

export function ReasoningText({ children, className }: ReasoningTextProps) {
  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      {children}
    </div>
  );
}