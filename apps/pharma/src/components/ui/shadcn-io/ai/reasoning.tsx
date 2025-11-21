'use client';

import { Brain, ChevronRight } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as React from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@vital/ui';
import { cn } from '@/lib/utils';

import type { ComponentProps, HTMLAttributes } from 'react';

const AUTO_CLOSE_DELAY = 1000; // 1 second delay before auto-closing

// Context for sharing duration between components
interface ReasoningContextValue {
  duration: number;
}

const ReasoningContext = createContext<ReasoningContextValue | undefined>(undefined);

const useReasoningContext = () => {
  const context = useContext(ReasoningContext);
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  duration?: number;
};

export const Reasoning = ({
  isStreaming = false,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  duration: controlledDuration = 0,
  className,
  children,
  ...props
}: ReasoningProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [elapsedDuration, setElapsedDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamingStartRef = useRef<number | null>(null);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const handleOpenChange = onOpenChange || setUncontrolledOpen;

  // Handle auto-open/close based on streaming
  useEffect(() => {
    if (isStreaming) {
      // Start streaming - open reasoning
      if (!open) {
        handleOpenChange(true);
      }
      
      // Start duration tracking
      if (streamingStartRef.current === null) {
        streamingStartRef.current = Date.now();
        setElapsedDuration(0);
      }

      // Clear any pending auto-close
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    } else {
      // Streaming stopped - start auto-close timer
      if (streamingStartRef.current !== null) {
        const streamDuration = Date.now() - streamingStartRef.current;
        setElapsedDuration(Math.floor(streamDuration / 1000));
        streamingStartRef.current = null;
      }

      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Auto-close after delay if open
      if (open && !autoCloseTimeoutRef.current) {
        autoCloseTimeoutRef.current = setTimeout(() => {
          handleOpenChange(false);
          autoCloseTimeoutRef.current = null;
        }, AUTO_CLOSE_DELAY);
      }
    }
  }, [isStreaming, open, handleOpenChange]);

  // Update duration while streaming
  useEffect(() => {
    if (isStreaming && streamingStartRef.current !== null) {
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - streamingStartRef.current!) / 1000);
        setElapsedDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const displayDuration = controlledDuration || elapsedDuration;

  return (
    <ReasoningContext.Provider value={{ duration: displayDuration }}>
      <Collapsible
        open={open}
        onOpenChange={handleOpenChange}
        defaultOpen={defaultOpen}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
};

Reasoning.displayName = 'Reasoning';

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title?: string;
};

export const ReasoningTrigger = ({
  title = 'Reasoning',
  className,
  children,
  ...props
}: ReasoningTriggerProps) => {
  const context = useReasoningContext();
  const duration = context?.duration || 0;
  
  return (
    <CollapsibleTrigger
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 shrink-0" />
        <span>{title}</span>
        {duration > 0 && (
          <span className="text-xs text-muted-foreground">
            Thought for {duration}s
          </span>
        )}
      </div>
      {children || (
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
      )}
    </CollapsibleTrigger>
  );
};

ReasoningTrigger.displayName = 'ReasoningTrigger';

export type ReasoningContentProps = HTMLAttributes<HTMLDivElement>;

export const ReasoningContent = ({
  children,
  className,
  ...props
}: ReasoningContentProps) => {
  return (
    <CollapsibleContent
      className={cn(
        'overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      <div className="rounded-b-lg border-x border-b border-border bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {children}
      </div>
    </CollapsibleContent>
  );
};

ReasoningContent.displayName = 'ReasoningContent';

