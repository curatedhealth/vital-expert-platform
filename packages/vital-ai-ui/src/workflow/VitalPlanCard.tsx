'use client';

/**
 * VitalPlanCard - VITAL Platform Plan Display
 * 
 * A flexible compound component system for displaying AI-generated execution plans
 * with collapsible content. Extended for VITAL platform with agent hierarchy,
 * mode awareness, cost tracking, and approval workflow integration.
 * 
 * ## VITAL-Specific Features:
 * - **Agent Context**: Shows which agent (L1-L5) created/executes the plan
 * - **Mode Awareness**: Visual indicators for Mode 1-4
 * - **Risk Level**: Color-coded risk assessment
 * - **Cost Estimation**: Token/USD cost before execution
 * - **Progress Tracking**: Step completion with percentage
 * - **HITL Integration**: Links to approval workflow
 * - **Langfuse Tracing**: Built-in observability hooks
 * 
 * ## Use Cases:
 * - Mode 3: Manual plan review and approval
 * - Mode 4: Autonomous mission roadmap display
 * - L1 Orchestrator: Task delegation visualization
 * - L2 Expert: Analysis plan breakdown
 * 
 * @example Mode 3 - Plan Approval
 * ```tsx
 * <VitalPlanCard 
 *   isStreaming={false}
 *   agent={{ name: 'Clinical Expert', level: 'L2' }}
 *   mode={3}
 *   riskLevel="medium"
 *   estimatedCost={{ tokens: 75000, usd: 0.22 }}
 *   progress={{ completed: 0, total: 5 }}
 *   requiresApproval
 *   defaultOpen
 * >
 *   <VitalPlanCardHeader>
 *     <div>
 *       <VitalPlanCardTitle>Drug Interaction Analysis</VitalPlanCardTitle>
 *       <VitalPlanCardDescription>5-step comprehensive review</VitalPlanCardDescription>
 *     </div>
 *     <VitalPlanCardTrigger />
 *   </VitalPlanCardHeader>
 *   <VitalPlanCardContent>
 *     <VitalPlanCardStep status="pending" agent="L3 Safety Analyst">
 *       Literature review
 *     </VitalPlanCardStep>
 *     <VitalPlanCardStep status="pending" agent="L5 PubMed">
 *       Database search
 *     </VitalPlanCardStep>
 *   </VitalPlanCardContent>
 *   <VitalPlanCardFooter>
 *     <VitalPlanCardAction variant="outline">Modify Plan</VitalPlanCardAction>
 *     <VitalPlanCardAction>Approve & Execute</VitalPlanCardAction>
 *   </VitalPlanCardFooter>
 * </VitalPlanCard>
 * ```
 */

import { cn } from '../lib/utils';
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown,
  ChevronsUpDown, 
  Circle, 
  Clock, 
  Loader2, 
  Shield,
  XCircle 
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useState, forwardRef } from 'react';

// ============================================================================
// VITAL Types
// ============================================================================

/** Agent level in VITAL hierarchy */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** Risk level for the plan */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** VITAL mode (1-4) */
export type VitalMode = 1 | 2 | 3 | 4;

/** Plan step status */
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/** Agent executing the plan */
export interface PlanAgent {
  name: string;
  level: AgentLevel;
  icon?: ReactNode;
}

/** Cost estimation */
export interface PlanCost {
  tokens?: number;
  usd?: number;
  duration?: string;
}

/** Progress tracking */
export interface PlanProgress {
  completed: number;
  total: number;
}

// ============================================================================
// Component Types
// ============================================================================

export type VitalPlanCardProps = ComponentProps<'div'> & {
  /** Whether content is currently streaming */
  isStreaming?: boolean;
  /** Whether the plan is expanded by default */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Agent creating/executing the plan (VITAL-specific) */
  agent?: PlanAgent;
  /** Current VITAL mode 1-4 (VITAL-specific) */
  mode?: VitalMode;
  /** Risk level for the plan (VITAL-specific) */
  riskLevel?: RiskLevel;
  /** Estimated cost (VITAL-specific) */
  estimatedCost?: PlanCost;
  /** Progress tracking (VITAL-specific) */
  progress?: PlanProgress;
  /** Whether plan requires HITL approval (VITAL-specific) */
  requiresApproval?: boolean;
  /** Langfuse trace ID (VITAL-specific) */
  traceId?: string;
};

export type VitalPlanCardHeaderProps = ComponentProps<'div'>;

export type VitalPlanCardTitleProps = Omit<ComponentProps<'h3'>, 'children'> & {
  /** The title text */
  children: string;
};

export type VitalPlanCardDescriptionProps = Omit<ComponentProps<'p'>, 'children'> & {
  /** The description text */
  children: string;
};

export type VitalPlanCardTriggerProps = ComponentProps<'button'>;

export type VitalPlanCardContentProps = ComponentProps<'div'>;

export type VitalPlanCardFooterProps = ComponentProps<'div'>;

export type VitalPlanCardActionProps = ComponentProps<'button'> & {
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  /** Loading state */
  isLoading?: boolean;
};

export type VitalPlanCardStepProps = ComponentProps<'div'> & {
  /** Step status */
  status: StepStatus;
  /** Agent assigned to this step */
  agent?: string;
  /** Step number (optional, for display) */
  stepNumber?: number;
};

// ============================================================================
// Utility Constants
// ============================================================================

const levelColors: Record<AgentLevel, string> = {
  L1: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  L2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  L3: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  L4: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  L5: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300',
};

const riskColors: Record<RiskLevel, string> = {
  low: 'border-green-500/30',
  medium: 'border-amber-500/30',
  high: 'border-orange-500/30',
  critical: 'border-red-500/30',
};

const riskIcons: Record<RiskLevel, ReactNode> = {
  low: <Shield className="h-3 w-3 text-green-600" />,
  medium: <AlertTriangle className="h-3 w-3 text-amber-600" />,
  high: <AlertTriangle className="h-3 w-3 text-orange-600" />,
  critical: <XCircle className="h-3 w-3 text-red-600" />,
};

const modeLabels: Record<VitalMode, string> = {
  1: 'Manual + Interactive',
  2: 'Auto + Interactive',
  3: 'Manual + Autonomous',
  4: 'Auto + Autonomous',
};

const statusIcons: Record<StepStatus, ReactNode> = {
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  skipped: <Circle className="h-4 w-4 text-muted-foreground/50" />,
};

// ============================================================================
// Context
// ============================================================================

interface PlanCardContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  agent?: PlanAgent;
  mode?: VitalMode;
  riskLevel?: RiskLevel;
  progress?: PlanProgress;
}

const PlanCardContext = createContext<PlanCardContextValue | null>(null);

const usePlanCard = () => {
  const context = useContext(PlanCardContext);
  if (!context) {
    throw new Error('PlanCard components must be used within VitalPlanCard');
  }
  return context;
};

// ============================================================================
// Shimmer Component (inline for self-contained)
// ============================================================================

const Shimmer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn(
      'inline-block animate-pulse bg-gradient-to-r from-muted via-muted-foreground/20 to-muted',
      'bg-[length:200%_100%] rounded',
      className
    )}
  >
    <span className="invisible">{children}</span>
  </span>
);

// ============================================================================
// Components
// ============================================================================

/**
 * Root plan card container with context and collapsible state
 */
export const VitalPlanCard = forwardRef<HTMLDivElement, VitalPlanCardProps>(
  (
    {
      className,
      isStreaming = false,
      defaultOpen = false,
      open: controlledOpen,
      onOpenChange,
      agent,
      mode,
      riskLevel,
      estimatedCost,
      progress,
      requiresApproval,
      traceId,
      children,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = controlledOpen ?? internalOpen;

    const setIsOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    const progressPercent = progress 
      ? Math.round((progress.completed / progress.total) * 100) 
      : undefined;

    return (
      <PlanCardContext.Provider value={{ isStreaming, isOpen, setIsOpen, agent, mode, riskLevel, progress }}>
        <div
          ref={ref}
          data-slot="plan"
          data-state={isOpen ? 'open' : 'closed'}
          data-trace-id={traceId}
          className={cn(
            'rounded-lg border bg-card text-card-foreground shadow-sm',
            riskLevel && riskColors[riskLevel],
            className
          )}
          {...props}
        >
          {/* VITAL Metadata Bar */}
          {(agent || mode || riskLevel || estimatedCost || progress) && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b bg-muted/30 text-xs">
              <div className="flex items-center gap-2">
                {agent && (
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                    levelColors[agent.level]
                  )}>
                    {agent.icon}
                    <span>{agent.level}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{agent.name}</span>
                  </span>
                )}
                {mode && (
                  <span className="text-muted-foreground">
                    Mode {mode}: {modeLabels[mode]}
                  </span>
                )}
                {riskLevel && (
                  <span className="inline-flex items-center gap-1">
                    {riskIcons[riskLevel]}
                    <span className="capitalize">{riskLevel}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {estimatedCost && (
                  <span className="text-muted-foreground">
                    {estimatedCost.tokens && `~${(estimatedCost.tokens / 1000).toFixed(1)}k tokens`}
                    {estimatedCost.usd && ` • $${estimatedCost.usd.toFixed(2)}`}
                    {estimatedCost.duration && ` • ${estimatedCost.duration}`}
                  </span>
                )}
                {progress && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-muted-foreground">
                      {progress.completed}/{progress.total}
                    </span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground">{progressPercent}%</span>
                  </span>
                )}
                {requiresApproval && (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3" />
                    <span>Requires Approval</span>
                  </span>
                )}
              </div>
            </div>
          )}
          {children}
        </div>
      </PlanCardContext.Provider>
    );
  }
);

/**
 * Plan header with title, description, and trigger
 */
export const VitalPlanCardHeader = forwardRef<HTMLDivElement, VitalPlanCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="plan-header"
      className={cn('flex items-start justify-between gap-4 p-4', className)}
      {...props}
    />
  )
);

/**
 * Plan title with streaming shimmer support
 */
export const VitalPlanCardTitle = forwardRef<HTMLHeadingElement, VitalPlanCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    const { isStreaming } = usePlanCard();

    return (
      <h3
        ref={ref}
        data-slot="plan-title"
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
      >
        {isStreaming ? <Shimmer>{children}</Shimmer> : children}
      </h3>
    );
  }
);

/**
 * Plan description with streaming shimmer support
 */
export const VitalPlanCardDescription = forwardRef<HTMLParagraphElement, VitalPlanCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    const { isStreaming } = usePlanCard();

    return (
      <p
        ref={ref}
        data-slot="plan-description"
        className={cn('text-sm text-muted-foreground text-balance mt-1.5', className)}
        {...props}
      >
        {isStreaming ? <Shimmer>{children}</Shimmer> : children}
      </p>
    );
  }
);

/**
 * Collapsible trigger button
 */
export const VitalPlanCardTrigger = forwardRef<HTMLButtonElement, VitalPlanCardTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = usePlanCard();

    return (
      <button
        ref={ref}
        type="button"
        data-slot="plan-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md',
          'text-muted-foreground hover:bg-muted hover:text-foreground',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
          className
        )}
        {...props}
      >
        {children ?? (
          <ChevronDown className={cn(
            'size-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        )}
        <span className="sr-only">Toggle plan</span>
      </button>
    );
  }
);

/**
 * Collapsible content container
 */
export const VitalPlanCardContent = forwardRef<HTMLDivElement, VitalPlanCardContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = usePlanCard();

    return (
      <div
        ref={ref}
        data-slot="plan-content"
        data-state={isOpen ? 'open' : 'closed'}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
          className
        )}
        {...props}
      >
        <div className="px-4 pb-4 space-y-2">{children}</div>
      </div>
    );
  }
);

/**
 * Plan step item with status indicator (VITAL-specific)
 */
export const VitalPlanCardStep = forwardRef<HTMLDivElement, VitalPlanCardStepProps>(
  ({ className, status, agent, stepNumber, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="plan-step"
      data-status={status}
      className={cn(
        'flex items-start gap-3 py-2 px-3 rounded-md',
        status === 'in_progress' && 'bg-blue-50 dark:bg-blue-950/20',
        status === 'completed' && 'bg-green-50/50 dark:bg-green-950/10',
        status === 'failed' && 'bg-red-50 dark:bg-red-950/20',
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">
        {statusIcons[status]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{children}</div>
        {agent && (
          <div className="text-xs text-muted-foreground mt-0.5">
            → {agent}
          </div>
        )}
      </div>
      {stepNumber !== undefined && (
        <span className="text-xs text-muted-foreground">#{stepNumber}</span>
      )}
    </div>
  )
);

/**
 * Plan footer container
 */
export const VitalPlanCardFooter = forwardRef<HTMLDivElement, VitalPlanCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="plan-footer"
      className={cn('flex items-center justify-end gap-2 p-4 pt-0', className)}
      {...props}
    />
  )
);

/**
 * Plan action button
 */
export const VitalPlanCardAction = forwardRef<HTMLButtonElement, VitalPlanCardActionProps>(
  ({ className, variant = 'default', isLoading, children, disabled, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="plan-action"
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

// ============================================================================
// Display Names
// ============================================================================

VitalPlanCard.displayName = 'VitalPlanCard';
VitalPlanCardHeader.displayName = 'VitalPlanCardHeader';
VitalPlanCardTitle.displayName = 'VitalPlanCardTitle';
VitalPlanCardDescription.displayName = 'VitalPlanCardDescription';
VitalPlanCardTrigger.displayName = 'VitalPlanCardTrigger';
VitalPlanCardContent.displayName = 'VitalPlanCardContent';
VitalPlanCardStep.displayName = 'VitalPlanCardStep';
VitalPlanCardFooter.displayName = 'VitalPlanCardFooter';
VitalPlanCardAction.displayName = 'VitalPlanCardAction';

// ============================================================================
// Aliases (for compatibility with ai-elements naming)
// ============================================================================

export const Plan = VitalPlanCard;
export const PlanHeader = VitalPlanCardHeader;
export const PlanTitle = VitalPlanCardTitle;
export const PlanDescription = VitalPlanCardDescription;
export const PlanTrigger = VitalPlanCardTrigger;
export const PlanContent = VitalPlanCardContent;
export const PlanStep = VitalPlanCardStep;
export const PlanFooter = VitalPlanCardFooter;
export const PlanAction = VitalPlanCardAction;

export default VitalPlanCard;
