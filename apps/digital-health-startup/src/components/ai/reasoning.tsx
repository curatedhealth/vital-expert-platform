'use client'

import * as React from 'react'
import { Brain, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const AUTO_CLOSE_DELAY = 1_000
const DURATION_TICK_MS = 120

interface ReasoningContextValue {
  isStreaming: boolean
  isOpen: boolean
  setOpen: (open: boolean) => void
  durationMs: number
}

const ReasoningContext = React.createContext<ReasoningContextValue | null>(null)

function useReasoningContext(component: string): ReasoningContextValue {
  const context = React.useContext(ReasoningContext)
  if (!context) {
    throw new Error(`${component} must be used within <Reasoning>`)
  }
  return context
}

export interface ReasoningProps {
  children: React.ReactNode
  isStreaming?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number
  className?: string
}

export function Reasoning({
  children,
  isStreaming = false,
  open,
  defaultOpen = false,
  onOpenChange,
  duration,
  className,
}: ReasoningProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const effectiveOpen = isControlled ? Boolean(open) : internalOpen

  const [internalDuration, setInternalDuration] = React.useState(0)
  const effectiveDuration = duration ?? internalDuration

  const startTimeRef = React.useRef<number | null>(null)
  const autoCloseTimeoutRef = React.useRef<number | null>(null)
  const tickerRef = React.useRef<number | null>(null)

  const clearAutoCloseTimeout = () => {
    if (autoCloseTimeoutRef.current !== null) {
      window.clearTimeout(autoCloseTimeoutRef.current)
      autoCloseTimeoutRef.current = null
    }
  }

  const clearTicker = () => {
    if (tickerRef.current !== null) {
      window.clearInterval(tickerRef.current)
      tickerRef.current = null
    }
  }

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  React.useEffect(() => {
    if (isStreaming) {
      startTimeRef.current = Date.now()
      clearAutoCloseTimeout()
      setOpen(true)
      if (duration === undefined) {
        clearTicker()
        tickerRef.current = window.setInterval(() => {
          if (startTimeRef.current) {
            setInternalDuration(Date.now() - startTimeRef.current)
          }
        }, DURATION_TICK_MS)
      }
    } else {
      clearTicker()
      if (startTimeRef.current && duration === undefined) {
        setInternalDuration(Date.now() - startTimeRef.current)
      }
      if (!isControlled) {
        clearAutoCloseTimeout()
        autoCloseTimeoutRef.current = window.setTimeout(() => {
          setInternalOpen(false)
          onOpenChange?.(false)
        }, AUTO_CLOSE_DELAY)
      }
    }

    return () => {
      clearAutoCloseTimeout()
      clearTicker()
    }
  }, [isStreaming, isControlled, duration, setOpen, onOpenChange])

  React.useEffect(() => {
    return () => {
      clearAutoCloseTimeout()
      clearTicker()
    }
  }, [])

  const contextValue = React.useMemo<ReasoningContextValue>(
    () => ({
      isStreaming,
      isOpen: effectiveOpen,
      setOpen,
      durationMs: effectiveDuration,
    }),
    [effectiveDuration, effectiveOpen, isStreaming, setOpen]
  )

  return (
    <ReasoningContext.Provider value={contextValue}>
      <div
        data-state={effectiveOpen ? 'open' : 'closed'}
        className={cn(
          'rounded-lg border border-muted bg-muted/40 shadow-sm transition-colors',
          className
        )}
      >
        {children}
      </div>
    </ReasoningContext.Provider>
  )
}

export interface ReasoningTriggerProps
  extends React.ComponentPropsWithoutRef<'button'> {
  title?: string
}

export function ReasoningTrigger({
  title = 'Reasoning',
  className,
  ...triggerProps
}: ReasoningTriggerProps) {
  const { isStreaming, isOpen, setOpen, durationMs } = useReasoningContext(
    'ReasoningTrigger'
  )

  const formatDuration = React.useCallback((ms: number) => {
    if (ms <= 0) return null
    if (ms < 1_000) return `${Math.round(ms)} ms`
    if (ms < 60_000) return `${(ms / 1_000).toFixed(1)} s`
    const seconds = Math.round(ms / 1_000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  const durationLabel = formatDuration(durationMs)

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls="ai-reasoning-content"
      onClick={() => setOpen(!isOpen)}
      className={cn(
        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      {...triggerProps}
    >
      <span className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isStreaming ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Brain className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="text-muted-foreground">
          {title}
          {isStreaming ? '…' : ''}
        </span>
        {durationLabel && (
          <span className="text-xs text-muted-foreground">
            Thought for {durationLabel}
          </span>
        )}
      </span>
      {isOpen ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )
}

export interface ReasoningContentProps
  extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode
}

const isBrowser = typeof window !== 'undefined'

export function ReasoningContent({
  children,
  className,
  ...contentProps
}: ReasoningContentProps) {
  const { isOpen } = useReasoningContext('ReasoningContent')
  const containerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number>(isOpen ? undefined : 0)

  React.useEffect(() => {
    if (!isBrowser || !contentRef.current) {
      return
    }

    const updateHeight = () => {
      if (contentRef.current) {
        const nextHeight = contentRef.current.getBoundingClientRect().height
        setHeight(nextHeight)
      }
    }

    updateHeight()

    const observer = new ResizeObserver(() => updateHeight())
    observer.observe(contentRef.current)

    return () => observer.disconnect()
  }, [children])

  React.useEffect(() => {
    if (!isBrowser) {
      return
    }

    if (isOpen) {
      if (contentRef.current) {
        const measuredHeight = contentRef.current.getBoundingClientRect().height
        setHeight(measuredHeight)
      }
    } else {
      setHeight(0)
    }
  }, [isOpen])

  return (
    <div
      id="ai-reasoning-content"
      ref={containerRef}
      style={{
        maxHeight: height === undefined ? 'none' : `${height}px`,
      }}
      className={cn(
        'overflow-hidden transition-[max-height] duration-300 ease-in-out',
        className
      )}
      {...contentProps}
    >
      <div
        ref={contentRef}
        className="space-y-3 border-t border-muted px-4 py-3 text-sm text-muted-foreground"
      >
        {children}
      </div>
    </div>
  )
}

interface ReasoningStepProps {
  step: number
  children: React.ReactNode
  className?: string
}

export function ReasoningStep({
  step,
  children,
  className,
}: ReasoningStepProps) {
  return (
    <div className={cn('flex items-start gap-3 text-sm', className)}>
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {step}
      </span>
      <div className="flex-1 space-y-1 text-muted-foreground">{children}</div>
    </div>
  )
}

interface ReasoningTextProps {
  children: React.ReactNode
  className?: string
}

export function ReasoningText({ children, className }: ReasoningTextProps) {
  return <div className={cn('prose prose-sm max-w-none', className)}>{children}</div>
}
