'use client';

/**
 * VitalChainOfThought - VITAL Platform Agent Reasoning Visualization
 * 
 * A visual representation of the 5-Level Agent OS reasoning process, showing
 * step-by-step thinking with L1-L5 hierarchy, delegation chains, and tool calls.
 * 
 * ## 5-Level Agent Hierarchy Integration:
 * - **L1 Master Orchestrator**: Mission planning, strategy steps (Bold, Purple)
 * - **L2 Domain Experts**: Expert analysis, coordination (Blue)
 * - **L3 Task Specialists**: Specialized processing (Cyan)
 * - **L4 Context Workers**: Task execution (Green)
 * - **L5 Tools/APIs**: Tool calls, data retrieval (Gray, Small)
 * 
 * ## VITAL-Specific Features:
 * - **Agent-Aware Steps**: Visual hierarchy for L1-L5 levels
 * - **Delegation Chains**: Show task flow between agents
 * - **Tool Invocations**: L5 tool call visualization
 * - **Confidence Scores**: Per-step confidence indicators
 * - **Langfuse Integration**: Trace ID linking
 * - **Mode Context**: Different visualizations per mode
 * 
 * @example L1-L5 Reasoning Chain
 * ```tsx
 * <VitalChainOfThought defaultOpen={true} mode={3}>
 *   <VitalChainOfThoughtHeader>Agent Reasoning</VitalChainOfThoughtHeader>
 *   <VitalChainOfThoughtContent>
 *     <VitalChainOfThoughtStep 
 *       agent={{ name: 'Master Orchestrator', level: 'L1' }}
 *       label="Planning drug interaction analysis"
 *       status="complete"
 *     />
 *     <VitalChainOfThoughtStep 
 *       agent={{ name: 'Clinical Expert', level: 'L2' }}
 *       label="Delegating literature review"
 *       status="complete"
 *       delegatedTo={{ name: 'Evidence Synthesizer', level: 'L4' }}
 *     />
 *     <VitalChainOfThoughtStep 
 *       agent={{ name: 'PubMed Search', level: 'L5' }}
 *       label="Searching medical databases"
 *       status="active"
 *       isToolCall
 *     >
 *       <VitalChainOfThoughtSearchResults>
 *         <VitalChainOfThoughtSearchResult>PubMed: 12 results</VitalChainOfThoughtSearchResult>
 *       </VitalChainOfThoughtSearchResults>
 *     </VitalChainOfThoughtStep>
 *   </VitalChainOfThoughtContent>
 * </VitalChainOfThought>
 * ```
 */

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { cn } from '../lib/utils';
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronRight,
  DotIcon,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, memo, useContext, useMemo } from 'react';

// ============================================================================
// VITAL Types
// ============================================================================

/** Agent level in VITAL hierarchy */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** VITAL mode (1-4) */
export type VitalMode = 1 | 2 | 3 | 4;

/** Step status */
export type StepStatus = 'complete' | 'active' | 'pending' | 'failed';

/** Agent reference */
export interface StepAgent {
  name: string;
  level: AgentLevel;
  icon?: ReactNode;
}

// ============================================================================
// Utility Constants
// ============================================================================

const levelStyles: Record<AgentLevel, { color: string; weight: string; size: string }> = {
  L1: { color: 'text-purple-600 dark:text-purple-400', weight: 'font-semibold', size: 'text-sm' },
  L2: { color: 'text-blue-600 dark:text-blue-400', weight: 'font-medium', size: 'text-sm' },
  L3: { color: 'text-cyan-600 dark:text-cyan-400', weight: 'font-medium', size: 'text-sm' },
  L4: { color: 'text-green-600 dark:text-green-400', weight: 'font-normal', size: 'text-sm' },
  L5: { color: 'text-stone-500 dark:text-stone-400', weight: 'font-normal', size: 'text-xs' },
};

const levelIcons: Record<AgentLevel, LucideIcon> = {
  L1: BrainIcon,
  L2: Users,
  L3: Sparkles,
  L4: DotIcon,
  L5: Wrench,
};

const levelBadgeColors: Record<AgentLevel, string> = {
  L1: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  L2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  L3: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  L4: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  L5: 'bg-stone-100 text-stone-700 dark:bg-stone-800/50 dark:text-stone-300',
};

// ============================================================================
// Context
// ============================================================================

type ChainOfThoughtContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mode?: VitalMode;
};

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null);

const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error(
      'ChainOfThought components must be used within VitalChainOfThought'
    );
  }
  return context;
};

// ============================================================================
// Types
// ============================================================================

export type VitalChainOfThoughtProps = ComponentProps<'div'> & {
  /** Controlled open state of the collapsible */
  open?: boolean;
  /** Default open state when uncontrolled */
  defaultOpen?: boolean;
  /** Callback when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** VITAL mode for context (VITAL-specific) */
  mode?: VitalMode;
  /** Langfuse trace ID (VITAL-specific) */
  traceId?: string;
};

export type VitalChainOfThoughtHeaderProps = ComponentProps<'button'> & {
  /** Custom header text (defaults to "Chain of Thought") */
  children?: ReactNode;
  /** Show agent count summary */
  agentSummary?: { l1?: number; l2?: number; l3?: number; l4?: number; l5?: number };
};

export type VitalChainOfThoughtStepProps = ComponentProps<'div'> & {
  /** Icon to display for the step */
  icon?: LucideIcon;
  /** The main text label for the step */
  label: ReactNode;
  /** Optional description text shown below the label */
  description?: ReactNode;
  /** Visual status of the step */
  status?: StepStatus;
  /** Agent executing this step (VITAL-specific) */
  agent?: StepAgent;
  /** Agent this task was delegated to (VITAL-specific) */
  delegatedTo?: StepAgent;
  /** Whether this is an L5 tool call (VITAL-specific) */
  isToolCall?: boolean;
  /** Confidence score 0-100 (VITAL-specific) */
  confidence?: number;
  /** Duration of this step (VITAL-specific) */
  duration?: string;
  /** Token usage (VITAL-specific) */
  tokenUsage?: number;
};

export type VitalChainOfThoughtSearchResultsProps = ComponentProps<'div'>;

export type VitalChainOfThoughtSearchResultProps = ComponentProps<'span'> & {
  /** Source type for styling */
  sourceType?: 'vector' | 'graph' | 'relational' | 'web';
};

export type VitalChainOfThoughtContentProps = ComponentProps<'div'>;

export type VitalChainOfThoughtImageProps = ComponentProps<'div'> & {
  /** Optional caption text displayed below the image */
  caption?: string;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root component for Chain of Thought visualization
 */
export const VitalChainOfThought = memo(
  ({
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    mode,
    traceId,
    children,
    ...props
  }: VitalChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    const chainOfThoughtContext = useMemo(
      () => ({ isOpen: isOpen ?? false, setIsOpen, mode }),
      [isOpen, setIsOpen, mode]
    );

    return (
      <ChainOfThoughtContext.Provider value={chainOfThoughtContext}>
        <div
          className={cn('not-prose max-w-prose space-y-4', className)}
          data-trace-id={traceId}
          data-mode={mode}
          {...props}
        >
          {children}
        </div>
      </ChainOfThoughtContext.Provider>
    );
  }
);

/**
 * Header with collapsible trigger and agent summary
 */
export const VitalChainOfThoughtHeader = memo(
  ({ className, children, agentSummary, ...props }: VitalChainOfThoughtHeaderProps) => {
    const { isOpen, setIsOpen, mode } = useChainOfThought();

    return (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground',
          className
        )}
        aria-expanded={isOpen}
        {...props}
      >
        <BrainIcon className="size-4" />
        <span className="flex-1 text-left">
          {children ?? 'Agent Reasoning'}
        </span>
        {/* Agent summary badges */}
        {agentSummary && (
          <div className="flex items-center gap-1 mr-2">
            {agentSummary.l1 && (
              <span className={cn('px-1.5 py-0.5 rounded text-xs', levelBadgeColors.L1)}>
                L1:{agentSummary.l1}
              </span>
            )}
            {agentSummary.l2 && (
              <span className={cn('px-1.5 py-0.5 rounded text-xs', levelBadgeColors.L2)}>
                L2:{agentSummary.l2}
              </span>
            )}
            {agentSummary.l3 && (
              <span className={cn('px-1.5 py-0.5 rounded text-xs', levelBadgeColors.L3)}>
                L3:{agentSummary.l3}
              </span>
            )}
            {agentSummary.l4 && (
              <span className={cn('px-1.5 py-0.5 rounded text-xs', levelBadgeColors.L4)}>
                L4:{agentSummary.l4}
              </span>
            )}
            {agentSummary.l5 && (
              <span className={cn('px-1.5 py-0.5 rounded text-xs', levelBadgeColors.L5)}>
                L5:{agentSummary.l5}
              </span>
            )}
          </div>
        )}
        {mode && (
          <span className="text-xs text-muted-foreground/70 mr-2">
            Mode {mode}
          </span>
        )}
        <ChevronDownIcon
          className={cn(
            'size-4 transition-transform duration-200',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>
    );
  }
);

/**
 * Individual step in the reasoning chain with L1-L5 hierarchy
 */
export const VitalChainOfThoughtStep = memo(
  ({
    className,
    icon,
    label,
    description,
    status = 'complete',
    agent,
    delegatedTo,
    isToolCall,
    confidence,
    duration,
    tokenUsage,
    children,
    ...props
  }: VitalChainOfThoughtStepProps) => {
    // Get level-appropriate styling
    const level = agent?.level ?? 'L4';
    const styles = levelStyles[level];
    const LevelIcon = icon ?? levelIcons[level];

    const statusStyles: Record<StepStatus, string> = {
      complete: 'opacity-100',
      active: 'opacity-100',
      pending: 'opacity-50',
      failed: 'opacity-100 text-red-600',
    };

    return (
      <div
        className={cn(
          'flex gap-2',
          styles.size,
          statusStyles[status],
          // Indent L4 and L5 steps
          level === 'L4' && 'ml-4',
          level === 'L5' && 'ml-8',
          'fade-in-0 slide-in-from-top-2 animate-in',
          className
        )}
        data-level={level}
        data-status={status}
        {...props}
      >
        {/* Icon column with connecting line */}
        <div className="relative mt-0.5">
          <div className={cn(
            'flex items-center justify-center',
            isToolCall && 'p-1 rounded bg-muted',
          )}>
            <LevelIcon className={cn('size-4', styles.color)} />
          </div>
          {/* Connecting line */}
          <div className="-mx-px absolute top-7 bottom-0 left-1/2 w-px bg-border" />
        </div>
        
        {/* Content column */}
        <div className="flex-1 space-y-1 pb-3">
          {/* Agent badge + label row */}
          <div className="flex items-center gap-2 flex-wrap">
            {agent && (
              <span className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                levelBadgeColors[agent.level]
              )}>
                {agent.level}
              </span>
            )}
            <span className={cn(styles.weight, styles.color)}>
              {label}
            </span>
            {status === 'active' && (
              <span className="inline-flex size-2 rounded-full bg-blue-500 animate-pulse" />
            )}
            {status === 'failed' && (
              <span className="text-xs text-red-600">Failed</span>
            )}
          </div>
          
          {/* Agent name if provided */}
          {agent && (
            <div className="text-xs text-muted-foreground">
              {agent.name}
            </div>
          )}
          
          {/* Delegation indicator */}
          {delegatedTo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronRight className="size-3" />
              <span>Delegated to</span>
              <span className={cn(
                'px-1 py-0.5 rounded',
                levelBadgeColors[delegatedTo.level]
              )}>
                {delegatedTo.level} {delegatedTo.name}
              </span>
            </div>
          )}
          
          {/* Description */}
          {description && (
            <div className="text-muted-foreground text-xs">{description}</div>
          )}
          
          {/* Metadata row */}
          {(confidence !== undefined || duration || tokenUsage) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
              {confidence !== undefined && (
                <span>Confidence: {confidence}%</span>
              )}
              {duration && (
                <span>{duration}</span>
              )}
              {tokenUsage && (
                <span>{tokenUsage.toLocaleString()} tokens</span>
              )}
            </div>
          )}
          
          {/* Children (search results, etc.) */}
          {children}
        </div>
      </div>
    );
  }
);

/**
 * Container for search results within a step
 */
export const VitalChainOfThoughtSearchResults = memo(
  ({ className, ...props }: VitalChainOfThoughtSearchResultsProps) => (
    <div className={cn('flex flex-wrap items-center gap-2 mt-2', className)} {...props} />
  )
);

/**
 * Individual search result badge with source type
 */
export const VitalChainOfThoughtSearchResult = memo(
  ({ className, sourceType, children, ...props }: VitalChainOfThoughtSearchResultProps) => {
    const sourceColors = {
      vector: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      graph: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      relational: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      web: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-normal',
          sourceType ? sourceColors[sourceType] : 'bg-secondary text-secondary-foreground',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

/**
 * Collapsible content container
 */
export const VitalChainOfThoughtContent = memo(
  ({ className, children, ...props }: VitalChainOfThoughtContentProps) => {
    const { isOpen } = useChainOfThought();

    if (!isOpen) return null;

    return (
      <div
        className={cn(
          'mt-2 space-y-1',
          'animate-in fade-in-0 slide-in-from-top-2 duration-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * Image with optional caption
 */
export const VitalChainOfThoughtImage = memo(
  ({ className, children, caption, ...props }: VitalChainOfThoughtImageProps) => (
    <div className={cn('mt-2 space-y-2', className)} {...props}>
      <div className="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-muted p-3">
        {children}
      </div>
      {caption && <p className="text-muted-foreground text-xs">{caption}</p>}
    </div>
  )
);

// ============================================================================
// Display Names
// ============================================================================

VitalChainOfThought.displayName = 'VitalChainOfThought';
VitalChainOfThoughtHeader.displayName = 'VitalChainOfThoughtHeader';
VitalChainOfThoughtStep.displayName = 'VitalChainOfThoughtStep';
VitalChainOfThoughtSearchResults.displayName = 'VitalChainOfThoughtSearchResults';
VitalChainOfThoughtSearchResult.displayName = 'VitalChainOfThoughtSearchResult';
VitalChainOfThoughtContent.displayName = 'VitalChainOfThoughtContent';
VitalChainOfThoughtImage.displayName = 'VitalChainOfThoughtImage';

// ============================================================================
// Aliases for convenience
// ============================================================================

export const ChainOfThought = VitalChainOfThought;
export const ChainOfThoughtHeader = VitalChainOfThoughtHeader;
export const ChainOfThoughtStep = VitalChainOfThoughtStep;
export const ChainOfThoughtSearchResults = VitalChainOfThoughtSearchResults;
export const ChainOfThoughtSearchResult = VitalChainOfThoughtSearchResult;
export const ChainOfThoughtContent = VitalChainOfThoughtContent;
export const ChainOfThoughtImage = VitalChainOfThoughtImage;

// Export VITAL utilities
export { levelStyles, levelIcons, levelBadgeColors };

export default VitalChainOfThought;
