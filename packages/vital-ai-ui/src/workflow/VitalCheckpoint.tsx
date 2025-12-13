'use client';

/**
 * VitalCheckpoint - VITAL Platform HITL Safety Gate
 * 
 * A comprehensive checkpoint component for Human-in-the-Loop (HITL) safety gates.
 * Extended for VITAL platform with mode-aware controls, risk levels, budget tracking,
 * and timeout management for autonomous operations.
 * 
 * ## VITAL 4-Mode Matrix Context:
 * - Mode 1 (Manual + Interactive): Simple restore checkpoints
 * - Mode 2 (Auto + Interactive): Suggestion approval gates
 * - Mode 3 (Manual + Autonomous): Plan approval checkpoints
 * - Mode 4 (Auto + Autonomous): Critical safety gates with budgets
 * 
 * ## VITAL-Specific Features:
 * - **Risk Levels**: Low, Medium, High, Critical with color coding
 * - **Mode Awareness**: Different checkpoint behaviors per mode
 * - **Budget Tracking**: Token/cost limits with warnings
 * - **Timeout Management**: Auto-rejection countdown for Mode 4
 * - **Agent Context**: Shows which agent is requesting approval
 * - **Audit Trail**: Langfuse trace integration
 * 
 * @example Mode 3 - Plan Approval Checkpoint
 * ```tsx
 * <VitalCheckpoint
 *   type="plan-approval"
 *   mode={3}
 *   riskLevel="medium"
 *   agent={{ name: 'Clinical Expert', level: 'L2' }}
 * >
 *   <VitalCheckpointIcon>
 *     <ShieldIcon className="size-4" />
 *   </VitalCheckpointIcon>
 *   <VitalCheckpointContent>
 *     <VitalCheckpointTitle>Approve Analysis Plan</VitalCheckpointTitle>
 *     <VitalCheckpointDescription>
 *       This will execute 5 tasks using ~15,000 tokens
 *     </VitalCheckpointDescription>
 *   </VitalCheckpointContent>
 *   <VitalCheckpointActions>
 *     <VitalCheckpointAction variant="outline" onClick={onReject}>
 *       Modify Plan
 *     </VitalCheckpointAction>
 *     <VitalCheckpointAction onClick={onApprove}>
 *       Approve & Execute
 *     </VitalCheckpointAction>
 *   </VitalCheckpointActions>
 * </VitalCheckpoint>
 * ```
 * 
 * @example Mode 4 - Critical Budget Gate with Timeout
 * ```tsx
 * <VitalCheckpoint
 *   type="budget-gate"
 *   mode={4}
 *   riskLevel="critical"
 *   budget={{ used: 45000, limit: 50000, currency: 'tokens' }}
 *   timeout={30}
 *   onTimeout={handleAutoReject}
 * >
 *   <VitalCheckpointIcon />
 *   <VitalCheckpointContent>
 *     <VitalCheckpointTitle>Budget Limit Warning</VitalCheckpointTitle>
 *     <VitalCheckpointBudget />
 *     <VitalCheckpointTimer />
 *   </VitalCheckpointContent>
 *   <VitalCheckpointActions>
 *     <VitalCheckpointAction variant="destructive" onClick={onAbort}>
 *       Abort Mission
 *     </VitalCheckpointAction>
 *     <VitalCheckpointAction onClick={onContinue}>
 *       Continue (Increase Budget)
 *     </VitalCheckpointAction>
 *   </VitalCheckpointActions>
 * </VitalCheckpoint>
 * ```
 */

import { cn } from '../lib/utils';
import { 
  AlertTriangle, 
  BookmarkIcon, 
  CheckCircle, 
  Clock, 
  Shield, 
  XCircle,
  type LucideProps 
} from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

// ============================================================================
// VITAL Types
// ============================================================================

/** Agent level in VITAL hierarchy */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** Risk level for the checkpoint */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** VITAL mode (1-4) */
export type VitalMode = 1 | 2 | 3 | 4;

/** Checkpoint type */
export type CheckpointType = 
  | 'restore'           // Simple conversation restore (Mode 1)
  | 'suggestion'        // Suggestion approval (Mode 2)
  | 'plan-approval'     // Plan approval gate (Mode 3)
  | 'budget-gate'       // Budget limit checkpoint (Mode 3/4)
  | 'tool-approval'     // Tool execution approval (Mode 3/4)
  | 'critical-decision' // Critical safety gate (Mode 4)
  | 'mission-complete'; // Mission completion checkpoint (Mode 4)

/** Agent reference */
export interface CheckpointAgent {
  name: string;
  level: AgentLevel;
  icon?: ReactNode;
}

/** Budget tracking */
export interface CheckpointBudget {
  used: number;
  limit: number;
  currency: 'tokens' | 'usd';
}

// ============================================================================
// Component Props
// ============================================================================

export type VitalCheckpointProps = HTMLAttributes<HTMLDivElement> & {
  /** Checkpoint type (VITAL-specific) */
  type?: CheckpointType;
  /** VITAL mode 1-4 (VITAL-specific) */
  mode?: VitalMode;
  /** Risk level (VITAL-specific) */
  riskLevel?: RiskLevel;
  /** Agent requesting the checkpoint (VITAL-specific) */
  agent?: CheckpointAgent;
  /** Budget tracking (VITAL-specific) */
  budget?: CheckpointBudget;
  /** Timeout in seconds for auto-rejection (VITAL-specific) */
  timeout?: number;
  /** Callback when timeout expires (VITAL-specific) */
  onTimeout?: () => void;
  /** Langfuse trace ID (VITAL-specific) */
  traceId?: string;
};

export type VitalCheckpointIconProps = LucideProps & {
  /** Custom icon content. If not provided, defaults to risk-appropriate icon */
  children?: ReactNode;
};

export type VitalCheckpointContentProps = HTMLAttributes<HTMLDivElement>;

export type VitalCheckpointTitleProps = HTMLAttributes<HTMLHeadingElement>;

export type VitalCheckpointDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type VitalCheckpointActionsProps = HTMLAttributes<HTMLDivElement>;

export type VitalCheckpointActionProps = ComponentProps<'button'> & {
  /** The button variant style */
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  /** The button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Loading state */
  isLoading?: boolean;
};

export type VitalCheckpointTriggerProps = ComponentProps<'button'> & {
  /** The button variant style */
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  /** The button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Optional tooltip text */
  tooltip?: string;
};

// ============================================================================
// Utility Constants
// ============================================================================

const riskColors: Record<RiskLevel, string> = {
  low: 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20',
  medium: 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20',
  high: 'border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20',
  critical: 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20',
};

const riskIcons: Record<RiskLevel, ReactNode> = {
  low: <Shield className="size-4 text-green-600" />,
  medium: <AlertTriangle className="size-4 text-amber-600" />,
  high: <AlertTriangle className="size-4 text-orange-600" />,
  critical: <XCircle className="size-4 text-red-600" />,
};

const modeLabels: Record<VitalMode, string> = {
  1: 'Manual + Interactive',
  2: 'Auto + Interactive',
  3: 'Manual + Autonomous',
  4: 'Auto + Autonomous',
};

const levelColors: Record<AgentLevel, string> = {
  L1: 'text-purple-600 dark:text-purple-400',
  L2: 'text-blue-600 dark:text-blue-400',
  L3: 'text-cyan-600 dark:text-cyan-400',
  L4: 'text-green-600 dark:text-green-400',
  L5: 'text-stone-600 dark:text-stone-400',
};

// ============================================================================
// Context
// ============================================================================

interface CheckpointContextValue {
  type?: CheckpointType;
  mode?: VitalMode;
  riskLevel?: RiskLevel;
  agent?: CheckpointAgent;
  budget?: CheckpointBudget;
  timeRemaining?: number;
}

const CheckpointContext = createContext<CheckpointContextValue | null>(null);

const useCheckpointContext = () => {
  const context = useContext(CheckpointContext);
  if (!context) {
    throw new Error('Checkpoint components must be used within VitalCheckpoint');
  }
  return context;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root container for checkpoint with VITAL safety context
 */
export const VitalCheckpoint = ({
  className,
  children,
  type = 'restore',
  mode,
  riskLevel,
  agent,
  budget,
  timeout,
  onTimeout,
  traceId,
  ...props
}: VitalCheckpointProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(timeout);

  // Handle timeout countdown
  useEffect(() => {
    if (!timeout || !onTimeout) return;
    
    setTimeRemaining(timeout);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === undefined || prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeout, onTimeout]);

  // Determine if this is a simple restore checkpoint or a VITAL safety gate
  const isSimpleCheckpoint = type === 'restore' && !riskLevel && !agent && !budget;

  return (
    <CheckpointContext.Provider value={{ type, mode, riskLevel, agent, budget, timeRemaining }}>
      <div
        className={cn(
          'flex items-center gap-2 text-muted-foreground overflow-hidden',
          // Apply VITAL styling for safety gates
          !isSimpleCheckpoint && riskLevel && [
            'rounded-lg border p-3',
            riskColors[riskLevel],
          ],
          className
        )}
        role="group"
        aria-label={type === 'restore' ? 'Conversation checkpoint' : `${type} checkpoint`}
        data-type={type}
        data-mode={mode}
        data-risk={riskLevel}
        data-trace-id={traceId}
        {...props}
      >
        {children}
        {/* Separator line for simple checkpoints */}
        {isSimpleCheckpoint && <div className="h-px flex-1 bg-border" />}
      </div>
    </CheckpointContext.Provider>
  );
};

/**
 * Checkpoint icon - risk-aware with custom override
 */
export const VitalCheckpointIcon = ({
  className,
  children,
  ...props
}: VitalCheckpointIconProps) => {
  const { riskLevel } = useCheckpointContext();

  if (children) {
    return <>{children}</>;
  }

  // Return risk-appropriate icon or default
  if (riskLevel) {
    return (
      <span className={cn('shrink-0', className)}>
        {riskIcons[riskLevel]}
      </span>
    );
  }

  return (
    <BookmarkIcon 
      className={cn('size-4 shrink-0', className)} 
      aria-hidden="true"
      {...props} 
    />
  );
};

/**
 * Checkpoint content container
 */
export const VitalCheckpointContent = ({
  className,
  children,
  ...props
}: VitalCheckpointContentProps) => {
  const { mode, agent, riskLevel } = useCheckpointContext();

  return (
    <div className={cn('flex-1 space-y-1', className)} {...props}>
      {/* VITAL metadata header */}
      {(mode || agent) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {agent && (
            <span className={cn('font-medium', levelColors[agent.level])}>
              {agent.level} {agent.name}
            </span>
          )}
          {mode && (
            <span className="text-muted-foreground/70">
              Mode {mode}: {modeLabels[mode]}
            </span>
          )}
          {riskLevel && (
            <span className={cn(
              'capitalize px-1.5 py-0.5 rounded text-xs font-medium',
              riskLevel === 'critical' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
              riskLevel === 'high' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
              riskLevel === 'medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
              riskLevel === 'low' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            )}>
              {riskLevel} risk
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * Checkpoint title
 */
export const VitalCheckpointTitle = ({
  className,
  children,
  ...props
}: VitalCheckpointTitleProps) => (
  <h4 
    className={cn('font-medium text-foreground text-sm', className)} 
    {...props}
  >
    {children}
  </h4>
);

/**
 * Checkpoint description
 */
export const VitalCheckpointDescription = ({
  className,
  children,
  ...props
}: VitalCheckpointDescriptionProps) => (
  <p 
    className={cn('text-sm text-muted-foreground', className)} 
    {...props}
  >
    {children}
  </p>
);

/**
 * Budget display component (VITAL-specific)
 */
export const VitalCheckpointBudget = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { budget } = useCheckpointContext();
  
  if (!budget) return null;

  const percentage = Math.round((budget.used / budget.limit) * 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className={cn('space-y-1', className)} {...props}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {budget.currency === 'tokens' ? 'Token Usage' : 'Cost'}
        </span>
        <span className={cn(
          'font-medium',
          isCritical && 'text-red-600',
          isWarning && !isCritical && 'text-amber-600',
        )}>
          {budget.currency === 'tokens' 
            ? `${(budget.used / 1000).toFixed(1)}k / ${(budget.limit / 1000).toFixed(1)}k`
            : `$${budget.used.toFixed(2)} / $${budget.limit.toFixed(2)}`
          }
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full transition-all duration-300',
            isCritical && 'bg-red-500',
            isWarning && !isCritical && 'bg-amber-500',
            !isWarning && 'bg-primary',
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Timer display component (VITAL-specific)
 */
export const VitalCheckpointTimer = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { timeRemaining } = useCheckpointContext();
  
  if (timeRemaining === undefined) return null;

  const isCritical = timeRemaining <= 10;

  return (
    <div 
      className={cn(
        'flex items-center gap-1.5 text-xs',
        isCritical ? 'text-red-600 animate-pulse' : 'text-muted-foreground',
        className
      )} 
      {...props}
    >
      <Clock className="size-3" />
      <span>
        {timeRemaining > 0 
          ? `Auto-reject in ${timeRemaining}s`
          : 'Time expired'
        }
      </span>
    </div>
  );
};

/**
 * Checkpoint actions container
 */
export const VitalCheckpointActions = ({
  className,
  children,
  ...props
}: VitalCheckpointActionsProps) => (
  <div 
    className={cn('flex items-center gap-2 mt-3', className)} 
    {...props}
  >
    {children}
  </div>
);

/**
 * Checkpoint action button
 */
export const VitalCheckpointAction = ({
  children,
  className,
  variant = 'default',
  size = 'sm',
  isLoading,
  disabled,
  ...props
}: VitalCheckpointActionProps) => {
  // Size classes
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

/**
 * Legacy checkpoint trigger (for simple restore checkpoints)
 */
export const VitalCheckpointTrigger = ({
  children,
  className,
  variant = 'ghost',
  size = 'sm',
  tooltip,
  ...props
}: VitalCheckpointTriggerProps) => {
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
};

// ============================================================================
// Display Names
// ============================================================================

VitalCheckpoint.displayName = 'VitalCheckpoint';
VitalCheckpointIcon.displayName = 'VitalCheckpointIcon';
VitalCheckpointContent.displayName = 'VitalCheckpointContent';
VitalCheckpointTitle.displayName = 'VitalCheckpointTitle';
VitalCheckpointDescription.displayName = 'VitalCheckpointDescription';
VitalCheckpointBudget.displayName = 'VitalCheckpointBudget';
VitalCheckpointTimer.displayName = 'VitalCheckpointTimer';
VitalCheckpointActions.displayName = 'VitalCheckpointActions';
VitalCheckpointAction.displayName = 'VitalCheckpointAction';
VitalCheckpointTrigger.displayName = 'VitalCheckpointTrigger';

// ============================================================================
// Aliases for convenience
// ============================================================================

export const Checkpoint = VitalCheckpoint;
export const CheckpointIcon = VitalCheckpointIcon;
export const CheckpointContent = VitalCheckpointContent;
export const CheckpointTitle = VitalCheckpointTitle;
export const CheckpointDescription = VitalCheckpointDescription;
export const CheckpointBudget = VitalCheckpointBudget;
export const CheckpointTimer = VitalCheckpointTimer;
export const CheckpointActions = VitalCheckpointActions;
export const CheckpointAction = VitalCheckpointAction;
export const CheckpointTrigger = VitalCheckpointTrigger;

// Export VITAL utilities
export { riskColors, riskIcons, modeLabels, levelColors };

export default VitalCheckpoint;
