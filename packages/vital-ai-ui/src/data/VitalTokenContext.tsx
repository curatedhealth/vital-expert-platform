'use client';

/**
 * VitalTokenContext - AI Model Token Usage Display
 * 
 * A comprehensive compound component system for displaying AI model usage through:
 * - Context window utilization with circular progress indicator
 * - Token consumption breakdown (input, output, reasoning, cache)
 * - Cost estimation using the tokenlens library
 * - Interactive hover card interface
 * 
 * Features:
 * - Compound Component Architecture with React Context
 * - Visual Progress Indicator (circular SVG progress ring)
 * - Token Breakdown with automatic formatting (K, M, B suffixes)
 * - Cost Estimation with USD currency formatting
 * - Interactive Hover Card
 * - Theme Integration using currentColor
 * - Full TypeScript support
 * 
 * @example
 * ```tsx
 * <VitalTokenContext
 *   maxTokens={128000}
 *   usedTokens={32000}
 *   usage={{
 *     inputTokens: 20000,
 *     outputTokens: 10000,
 *     reasoningTokens: 2000,
 *     cachedInputTokens: 5000,
 *   }}
 *   modelId="anthropic:claude-3-opus"
 * >
 *   <VitalTokenContextTrigger />
 *   <VitalTokenContextContent>
 *     <VitalTokenContextContentHeader />
 *     <VitalTokenContextContentBody>
 *       <VitalTokenContextInputUsage />
 *       <VitalTokenContextOutputUsage />
 *       <VitalTokenContextReasoningUsage />
 *       <VitalTokenContextCacheUsage />
 *     </VitalTokenContextContentBody>
 *     <VitalTokenContextContentFooter />
 *   </VitalTokenContextContent>
 * </VitalTokenContext>
 * ```
 */

import { cn } from '../lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext } from 'react';

// ============================================================================
// Constants
// ============================================================================

const PERCENT_MAX = 100;
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;

// ============================================================================
// Types - Compatible with Vercel AI SDK LanguageModelUsage
// ============================================================================

/**
 * Language model usage from AI SDK
 */
export interface LanguageModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  totalTokens?: number;
}

/**
 * Model identifier for cost calculation
 * Format: "provider:model" (e.g., "openai:gpt-4", "anthropic:claude-3-opus")
 */
export type ModelId = string;

// ============================================================================
// Context
// ============================================================================

interface TokenContextSchema {
  usedTokens: number;
  maxTokens: number;
  usage?: LanguageModelUsage;
  modelId?: ModelId;
}

const TokenContextContext = createContext<TokenContextSchema | null>(null);

const useTokenContext = () => {
  const context = useContext(TokenContextContext);

  if (!context) {
    throw new Error('TokenContext components must be used within VitalTokenContext');
  }

  return context;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format token count with compact notation (K, M, B)
 */
function formatTokens(tokens: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
  }).format(tokens);
}

/**
 * Format percentage
 */
function formatPercent(ratio: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(ratio);
}

/**
 * Format currency (USD)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Calculate cost based on model and usage
 * NOTE: In production, use the `tokenlens` library for accurate pricing
 */
function calculateCost(modelId: string, usage: { input?: number; output?: number; reasoning?: number; cache?: number }): number {
  // Simplified cost calculation - replace with tokenlens in production
  // These are approximate rates per 1K tokens
  const rates: Record<string, { input: number; output: number }> = {
    'openai:gpt-4': { input: 0.03, output: 0.06 },
    'openai:gpt-4-turbo': { input: 0.01, output: 0.03 },
    'openai:gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'anthropic:claude-3-opus': { input: 0.015, output: 0.075 },
    'anthropic:claude-3-sonnet': { input: 0.003, output: 0.015 },
    'anthropic:claude-3-haiku': { input: 0.00025, output: 0.00125 },
  };

  const rate = rates[modelId] || { input: 0.001, output: 0.002 };
  const inputCost = ((usage.input || 0) / 1000) * rate.input;
  const outputCost = ((usage.output || 0) / 1000) * rate.output;
  const reasoningCost = ((usage.reasoning || 0) / 1000) * rate.output;
  const cacheCost = ((usage.cache || 0) / 1000) * rate.input * 0.25; // Cache typically cheaper

  return inputCost + outputCost + reasoningCost + cacheCost;
}

// ============================================================================
// Types for Components
// ============================================================================

export type VitalTokenContextProps = ComponentProps<'div'> & TokenContextSchema & {
  /** Hover card open delay */
  openDelay?: number;
  /** Hover card close delay */
  closeDelay?: number;
};

export type VitalTokenContextTriggerProps = ComponentProps<'button'> & {
  children?: ReactNode;
};

export type VitalTokenContextContentProps = ComponentProps<'div'>;
export type VitalTokenContextContentHeaderProps = ComponentProps<'div'>;
export type VitalTokenContextContentBodyProps = ComponentProps<'div'>;
export type VitalTokenContextContentFooterProps = ComponentProps<'div'>;
export type VitalTokenContextInputUsageProps = ComponentProps<'div'>;
export type VitalTokenContextOutputUsageProps = ComponentProps<'div'>;
export type VitalTokenContextReasoningUsageProps = ComponentProps<'div'>;
export type VitalTokenContextCacheUsageProps = ComponentProps<'div'>;

// ============================================================================
// Circular Progress Icon
// ============================================================================

const TokenContextIcon = () => {
  const { usedTokens, maxTokens } = useTokenContext();
  const circumference = 2 * Math.PI * ICON_RADIUS;
  const usedPercent = usedTokens / maxTokens;
  const dashOffset = circumference * (1 - usedPercent);

  return (
    <svg
      aria-label="Model context usage"
      height="20"
      role="img"
      style={{ color: 'currentcolor' }}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      width="20"
    >
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.25"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeWidth={ICON_STROKE_WIDTH}
      />
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.7"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={ICON_STROKE_WIDTH}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
    </svg>
  );
};

// ============================================================================
// Token with Cost Display
// ============================================================================

const TokensWithCost = ({
  tokens,
  costText,
}: {
  tokens?: number;
  costText?: string;
}) => (
  <span>
    {tokens === undefined ? '—' : formatTokens(tokens)}
    {costText && (
      <span className="ml-2 text-muted-foreground">• {costText}</span>
    )}
  </span>
);

// ============================================================================
// Components
// ============================================================================

/**
 * Root provider - wraps children in HoverCard with context
 */
export const VitalTokenContext = ({
  usedTokens,
  maxTokens,
  usage,
  modelId,
  openDelay = 0,
  closeDelay = 0,
  className,
  children,
  ...props
}: VitalTokenContextProps) => {
  return (
    <TokenContextContext.Provider
      value={{ usedTokens, maxTokens, usage, modelId }}
    >
      <div className={cn('relative inline-block', className)} {...props}>
        {children}
      </div>
    </TokenContextContext.Provider>
  );
};

/**
 * Trigger button with percentage and circular icon
 */
export const VitalTokenContextTrigger = ({
  children,
  className,
  ...props
}: VitalTokenContextTriggerProps) => {
  const { usedTokens, maxTokens } = useTokenContext();
  const usedPercent = usedTokens / maxTokens;
  const renderedPercent = formatPercent(usedPercent);

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-2',
        'bg-transparent hover:bg-accent transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="font-medium text-muted-foreground">
            {renderedPercent}
          </span>
          <TokenContextIcon />
        </>
      )}
    </button>
  );
};

/**
 * Content container
 */
export const VitalTokenContextContent = ({
  className,
  children,
  ...props
}: VitalTokenContextContentProps) => (
  <div
    className={cn(
      'absolute top-full left-0 z-50 mt-2',
      'min-w-60 rounded-md border bg-popover shadow-md',
      'divide-y overflow-hidden',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * Header with progress visualization
 */
export const VitalTokenContextContentHeader = ({
  children,
  className,
  ...props
}: VitalTokenContextContentHeaderProps) => {
  const { usedTokens, maxTokens } = useTokenContext();
  const usedPercent = usedTokens / maxTokens;
  const displayPct = formatPercent(usedPercent);
  const used = formatTokens(usedTokens);
  const total = formatTokens(maxTokens);

  return (
    <div className={cn('w-full space-y-2 p-3', className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            <p>{displayPct}</p>
            <p className="font-mono text-muted-foreground">
              {used} / {total}
            </p>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${usedPercent * PERCENT_MAX}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Body container for usage breakdowns
 */
export const VitalTokenContextContentBody = ({
  children,
  className,
  ...props
}: VitalTokenContextContentBodyProps) => (
  <div className={cn('w-full space-y-1 p-3', className)} {...props}>
    {children}
  </div>
);

/**
 * Footer with total cost
 */
export const VitalTokenContextContentFooter = ({
  children,
  className,
  ...props
}: VitalTokenContextContentFooterProps) => {
  const { modelId, usage } = useTokenContext();
  
  let totalCost = '$0.00';
  if (modelId && usage) {
    const cost = calculateCost(modelId, {
      input: usage.inputTokens,
      output: usage.outputTokens,
      reasoning: usage.reasoningTokens,
      cache: usage.cachedInputTokens,
    });
    totalCost = formatCurrency(cost);
  }

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="text-muted-foreground">Total cost</span>
          <span>{totalCost}</span>
        </>
      )}
    </div>
  );
};

/**
 * Input token usage display
 */
export const VitalTokenContextInputUsage = ({
  className,
  children,
  ...props
}: VitalTokenContextInputUsageProps) => {
  const { usage, modelId } = useTokenContext();
  const inputTokens = usage?.inputTokens ?? 0;

  if (children) return <>{children}</>;
  if (!inputTokens) return null;

  let inputCostText: string | undefined;
  if (modelId) {
    const cost = calculateCost(modelId, { input: inputTokens });
    inputCostText = formatCurrency(cost);
  }

  return (
    <div
      className={cn('flex items-center justify-between text-xs', className)}
      {...props}
    >
      <span className="text-muted-foreground">Input</span>
      <TokensWithCost costText={inputCostText} tokens={inputTokens} />
    </div>
  );
};

/**
 * Output token usage display
 */
export const VitalTokenContextOutputUsage = ({
  className,
  children,
  ...props
}: VitalTokenContextOutputUsageProps) => {
  const { usage, modelId } = useTokenContext();
  const outputTokens = usage?.outputTokens ?? 0;

  if (children) return <>{children}</>;
  if (!outputTokens) return null;

  let outputCostText: string | undefined;
  if (modelId) {
    const cost = calculateCost(modelId, { output: outputTokens });
    outputCostText = formatCurrency(cost);
  }

  return (
    <div
      className={cn('flex items-center justify-between text-xs', className)}
      {...props}
    >
      <span className="text-muted-foreground">Output</span>
      <TokensWithCost costText={outputCostText} tokens={outputTokens} />
    </div>
  );
};

/**
 * Reasoning token usage display
 */
export const VitalTokenContextReasoningUsage = ({
  className,
  children,
  ...props
}: VitalTokenContextReasoningUsageProps) => {
  const { usage, modelId } = useTokenContext();
  const reasoningTokens = usage?.reasoningTokens ?? 0;

  if (children) return <>{children}</>;
  if (!reasoningTokens) return null;

  let reasoningCostText: string | undefined;
  if (modelId) {
    const cost = calculateCost(modelId, { reasoning: reasoningTokens });
    reasoningCostText = formatCurrency(cost);
  }

  return (
    <div
      className={cn('flex items-center justify-between text-xs', className)}
      {...props}
    >
      <span className="text-muted-foreground">Reasoning</span>
      <TokensWithCost costText={reasoningCostText} tokens={reasoningTokens} />
    </div>
  );
};

/**
 * Cached token usage display
 */
export const VitalTokenContextCacheUsage = ({
  className,
  children,
  ...props
}: VitalTokenContextCacheUsageProps) => {
  const { usage, modelId } = useTokenContext();
  const cacheTokens = usage?.cachedInputTokens ?? 0;

  if (children) return <>{children}</>;
  if (!cacheTokens) return null;

  let cacheCostText: string | undefined;
  if (modelId) {
    const cost = calculateCost(modelId, { cache: cacheTokens });
    cacheCostText = formatCurrency(cost);
  }

  return (
    <div
      className={cn('flex items-center justify-between text-xs', className)}
      {...props}
    >
      <span className="text-muted-foreground">Cache</span>
      <TokensWithCost costText={cacheCostText} tokens={cacheTokens} />
    </div>
  );
};

// ============================================================================
// Display Names
// ============================================================================

VitalTokenContext.displayName = 'VitalTokenContext';
VitalTokenContextTrigger.displayName = 'VitalTokenContextTrigger';
VitalTokenContextContent.displayName = 'VitalTokenContextContent';
VitalTokenContextContentHeader.displayName = 'VitalTokenContextContentHeader';
VitalTokenContextContentBody.displayName = 'VitalTokenContextContentBody';
VitalTokenContextContentFooter.displayName = 'VitalTokenContextContentFooter';
VitalTokenContextInputUsage.displayName = 'VitalTokenContextInputUsage';
VitalTokenContextOutputUsage.displayName = 'VitalTokenContextOutputUsage';
VitalTokenContextReasoningUsage.displayName = 'VitalTokenContextReasoningUsage';
VitalTokenContextCacheUsage.displayName = 'VitalTokenContextCacheUsage';

// ============================================================================
// Aliases (matching ai-elements naming)
// ============================================================================

export const Context = VitalTokenContext;
export const ContextTrigger = VitalTokenContextTrigger;
export const ContextContent = VitalTokenContextContent;
export const ContextContentHeader = VitalTokenContextContentHeader;
export const ContextContentBody = VitalTokenContextContentBody;
export const ContextContentFooter = VitalTokenContextContentFooter;
export const ContextInputUsage = VitalTokenContextInputUsage;
export const ContextOutputUsage = VitalTokenContextOutputUsage;
export const ContextReasoningUsage = VitalTokenContextReasoningUsage;
export const ContextCacheUsage = VitalTokenContextCacheUsage;

// Hook export
export { useTokenContext };

export default VitalTokenContext;
