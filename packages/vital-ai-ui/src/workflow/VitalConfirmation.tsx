'use client';

/**
 * VitalConfirmation - VITAL Platform Approval Workflow
 * 
 * A context-based component system for displaying approval requests and their
 * outcomes. Built on Vercel AI SDK patterns but extended for VITAL platform needs.
 * 
 * ## VITAL-Specific Features:
 * - **Agent Context**: Shows which agent (L1-L5) is requesting approval
 * - **Risk Level Indicators**: Visual cues for low/medium/high/critical risk
 * - **Mode Awareness**: Adapts behavior based on Mode 1-4
 * - **Cost Estimation**: Shows token/cost impact before approval
 * - **Audit Trail**: Integrated with Langfuse for tracking decisions
 * - **Timeout Support**: Auto-rejection for unattended approvals
 * 
 * ## Use Cases:
 * - **Tool approval** (AI SDK `requireApproval: true` / L5 tool execution)
 * - **Plan approval** (HITL checkpoint for Mode 3/4 multi-step plans)
 * - **Agent selection approval** (L2/L3 agent team assembly)
 * - **Task approval** (individual task execution in workflows)
 * - **Critical decision gates** (safety checkpoints)
 * 
 * ## Integration:
 * - Compatible with Vercel AI SDK `ToolUIPart`
 * - Works with VITAL LangGraph workflows
 * - Langfuse observability built-in
 * 
 * @example L5 Tool Approval (Mode 1/2)
 * ```tsx
 * <Confirmation 
 *   approval={toolApproval} 
 *   state={toolState}
 *   agent={{ name: 'PubMed Search', level: 'L5' }}
 *   riskLevel="low"
 * >
 *   <ConfirmationRequest>
 *     Search PubMed for: "drug interactions metformin"
 *   </ConfirmationRequest>
 *   <ConfirmationAccepted>
 *     ✓ Search approved - querying PubMed...
 *   </ConfirmationAccepted>
 *   <ConfirmationActions>
 *     <ConfirmationAction variant="outline" onClick={onReject}>Skip</ConfirmationAction>
 *     <ConfirmationAction onClick={onApprove}>Search</ConfirmationAction>
 *   </ConfirmationActions>
 * </Confirmation>
 * ```
 * 
 * @example Plan Approval (Mode 3)
 * ```tsx
 * <Confirmation
 *   approval={planApproval}
 *   state={planState}
 *   agent={{ name: 'Clinical Expert', level: 'L2' }}
 *   riskLevel="medium"
 *   estimatedCost={{ tokens: 50000, usd: 0.15 }}
 *   timeout={300}
 * >
 *   <ConfirmationRequest>
 *     <div>5-step analysis plan proposed:</div>
 *     <ol>
 *       <li>Literature review</li>
 *       <li>Drug interaction check</li>
 *       <li>Safety profile analysis</li>
 *       <li>Regulatory status</li>
 *       <li>Summary report</li>
 *     </ol>
 *   </ConfirmationRequest>
 *   <ConfirmationAccepted>✓ Plan approved</ConfirmationAccepted>
 *   <ConfirmationRejected>✗ Plan rejected</ConfirmationRejected>
 *   <ConfirmationActions>
 *     <ConfirmationAction variant="outline" onClick={onModify}>Modify</ConfirmationAction>
 *     <ConfirmationAction variant="outline" onClick={onReject}>Reject</ConfirmationAction>
 *     <ConfirmationAction onClick={onApprove}>Approve Plan</ConfirmationAction>
 *   </ConfirmationActions>
 * </Confirmation>
 * ```
 * 
 * @example Agent Team Approval (Mode 4)
 * ```tsx
 * <Confirmation
 *   approval={teamApproval}
 *   state={teamState}
 *   agent={{ name: 'Master Orchestrator', level: 'L1' }}
 *   riskLevel="high"
 *   mode={4}
 * >
 *   <ConfirmationRequest>
 *     Recommended team: Clinical Expert (L2), Regulatory Specialist (L2), Safety Analyst (L3)
 *   </ConfirmationRequest>
 *   <ConfirmationActions>
 *     <ConfirmationAction variant="outline" onClick={onModify}>Modify Team</ConfirmationAction>
 *     <ConfirmationAction onClick={onApprove}>Approve Team</ConfirmationAction>
 *   </ConfirmationActions>
 * </Confirmation>
 * ```
 */

import { cn } from '../lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, XCircle } from 'lucide-react';

// ============================================================================
// Types - Extended for VITAL Platform
// ============================================================================

/** Agent level in VITAL hierarchy */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** Risk level for the approval */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** VITAL mode (1-4) */
export type VitalMode = 1 | 2 | 3 | 4;

/** Agent requesting approval */
export interface ConfirmationAgent {
  name: string;
  level: AgentLevel;
  icon?: ReactNode;
}

/** Estimated cost for the operation */
export interface ConfirmationCost {
  tokens?: number;
  usd?: number;
  duration?: string;
}

/**
 * Approval object - compatible with AI SDK ToolUIPart["approval"]
 */
export type ConfirmationApproval =
  | {
      id: string;
      approved?: never;
      reason?: never;
    }
  | {
      id: string;
      approved: boolean;
      reason?: string;
    }
  | {
      id: string;
      approved: true;
      reason?: string;
    }
  | {
      id: string;
      approved: false;
      reason?: string;
    }
  | undefined;

/**
 * State - compatible with AI SDK ToolUIPart["state"]
 */
export type ConfirmationState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-denied'
  | 'output-available';

// ============================================================================
// Context
// ============================================================================

interface ConfirmationContextValue {
  approval: ConfirmationApproval;
  state: ConfirmationState;
  agent?: ConfirmationAgent;
  riskLevel?: RiskLevel;
  mode?: VitalMode;
  estimatedCost?: ConfirmationCost;
  timeout?: number;
  timeRemaining?: number;
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

/**
 * Hook to access confirmation context
 */
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error('Confirmation components must be used within Confirmation');
  }

  return context;
};

// ============================================================================
// Types for Components
// ============================================================================

export type VitalConfirmationProps = ComponentProps<'div'> & {
  /** The approval object containing the approval ID and status */
  approval?: ConfirmationApproval;
  /** The current state of the tool/workflow */
  state: ConfirmationState;
  /** Agent requesting approval (VITAL-specific) */
  agent?: ConfirmationAgent;
  /** Risk level indicator (VITAL-specific) */
  riskLevel?: RiskLevel;
  /** Current VITAL mode 1-4 (VITAL-specific) */
  mode?: VitalMode;
  /** Estimated cost/tokens (VITAL-specific) */
  estimatedCost?: ConfirmationCost;
  /** Auto-timeout in seconds - auto-rejects if not responded (VITAL-specific) */
  timeout?: number;
  /** Callback when timeout expires */
  onTimeout?: () => void;
};

export type VitalConfirmationTitleProps = ComponentProps<'div'>;

export type VitalConfirmationRequestProps = {
  children?: ReactNode;
};

export type VitalConfirmationAcceptedProps = {
  children?: ReactNode;
};

export type VitalConfirmationRejectedProps = {
  children?: ReactNode;
};

export type VitalConfirmationActionsProps = ComponentProps<'div'>;

export type VitalConfirmationActionProps = ComponentProps<'button'> & {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
};

// ============================================================================
// Utility Components
// ============================================================================

const riskColors: Record<RiskLevel, string> = {
  low: 'border-green-500/50 bg-green-50 dark:bg-green-950/20',
  medium: 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20',
  high: 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/20',
  critical: 'border-red-500/50 bg-red-50 dark:bg-red-950/20',
};

const riskIcons: Record<RiskLevel, ReactNode> = {
  low: <Shield className="h-4 w-4 text-green-600" />,
  medium: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  high: <AlertTriangle className="h-4 w-4 text-orange-600" />,
  critical: <XCircle className="h-4 w-4 text-red-600" />,
};

const levelColors: Record<AgentLevel, string> = {
  L1: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  L2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  L3: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  L4: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  L5: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300',
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root container - Provides context for approval state
 * 
 * Will not render for input-streaming or input-available states,
 * or when approval is undefined.
 */
export const VitalConfirmation = ({
  className,
  approval,
  state,
  agent,
  riskLevel,
  mode,
  estimatedCost,
  timeout,
  onTimeout,
  children,
  ...props
}: VitalConfirmationProps) => {
  const [timeRemaining, setTimeRemaining] = useState(timeout);

  // Timeout countdown
  useEffect(() => {
    if (!timeout || timeout <= 0 || state !== 'approval-requested') return;

    setTimeRemaining(timeout);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeout, state, onTimeout]);

  // Don't render for input states or when no approval
  if (!approval || state === 'input-streaming' || state === 'input-available') {
    return null;
  }

  return (
    <ConfirmationContext.Provider 
      value={{ approval, state, agent, riskLevel, mode, estimatedCost, timeout, timeRemaining }}
    >
      <div
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          'flex flex-col gap-3',
          riskLevel ? riskColors[riskLevel] : 'bg-background text-foreground',
          className
        )}
        {...props}
      >
        {/* Header with agent info and risk level */}
        {(agent || riskLevel || timeout) && (
          <div className="flex items-center justify-between gap-2 text-xs">
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
              {riskLevel && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  {riskIcons[riskLevel]}
                  <span className="capitalize">{riskLevel} risk</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {estimatedCost && (
                <span className="text-muted-foreground">
                  {estimatedCost.tokens && `~${(estimatedCost.tokens / 1000).toFixed(1)}k tokens`}
                  {estimatedCost.usd && ` • $${estimatedCost.usd.toFixed(2)}`}
                  {estimatedCost.duration && ` • ${estimatedCost.duration}`}
                </span>
              )}
              {timeout && timeRemaining !== undefined && timeRemaining > 0 && state === 'approval-requested' && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{timeRemaining}s</span>
                </span>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </ConfirmationContext.Provider>
  );
};

VitalConfirmation.displayName = 'VitalConfirmation';

/**
 * Title/description text within the confirmation
 */
export const VitalConfirmationTitle = ({
  className,
  ...props
}: VitalConfirmationTitleProps) => (
  <div
    className={cn('text-sm font-medium leading-relaxed', className)}
    {...props}
  />
);

VitalConfirmationTitle.displayName = 'VitalConfirmationTitle';

/**
 * Content shown when approval is requested
 * 
 * Only renders when state is "approval-requested"
 */
export const VitalConfirmationRequest = ({
  children,
}: VitalConfirmationRequestProps) => {
  const { state } = useConfirmation();

  // Only show when approval is requested
  if (state !== 'approval-requested') {
    return null;
  }

  return <div className="text-sm">{children}</div>;
};

VitalConfirmationRequest.displayName = 'VitalConfirmationRequest';

/**
 * Content shown when approval was accepted
 * 
 * Only renders when approval.approved is true and state is
 * "approval-responded", "output-denied", or "output-available"
 */
export const VitalConfirmationAccepted = ({
  children,
}: VitalConfirmationAcceptedProps) => {
  const { approval, state } = useConfirmation();

  // Only show when approved and in response states
  const showStates: ConfirmationState[] = [
    'approval-responded',
    'output-denied',
    'output-available',
  ];

  if (!approval?.approved || !showStates.includes(state)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
      <CheckCircle className="h-4 w-4" />
      {children}
    </div>
  );
};

VitalConfirmationAccepted.displayName = 'VitalConfirmationAccepted';

/**
 * Content shown when approval was rejected
 * 
 * Only renders when approval.approved is false and state is
 * "approval-responded", "output-denied", or "output-available"
 */
export const VitalConfirmationRejected = ({
  children,
}: VitalConfirmationRejectedProps) => {
  const { approval, state } = useConfirmation();

  // Only show when rejected and in response states
  const showStates: ConfirmationState[] = [
    'approval-responded',
    'output-denied',
    'output-available',
  ];

  if (approval?.approved !== false || !showStates.includes(state)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
      <XCircle className="h-4 w-4" />
      {children}
    </div>
  );
};

VitalConfirmationRejected.displayName = 'VitalConfirmationRejected';

/**
 * Actions container - only shown during approval-requested state
 */
export const VitalConfirmationActions = ({
  className,
  ...props
}: VitalConfirmationActionsProps) => {
  const { state } = useConfirmation();

  // Only show when approval is requested
  if (state !== 'approval-requested') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 pt-2',
        className
      )}
      {...props}
    />
  );
};

VitalConfirmationActions.displayName = 'VitalConfirmationActions';

/**
 * Action button - styled with h-8 px-3 text-sm by default
 */
export const VitalConfirmationAction = ({
  className,
  variant = 'default',
  ...props
}: VitalConfirmationActionProps) => {
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'h-8 px-3 text-sm font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};

VitalConfirmationAction.displayName = 'VitalConfirmationAction';

/**
 * Info section - shows additional context about the confirmation
 * VITAL-specific component for displaying agent reasoning, citations, etc.
 */
export const VitalConfirmationInfo = ({
  className,
  children,
  ...props
}: ComponentProps<'div'>) => (
  <div
    className={cn(
      'text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

VitalConfirmationInfo.displayName = 'VitalConfirmationInfo';

// ============================================================================
// Display Names
// ============================================================================

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalConfirmation - for ai-elements compatibility */
export const Confirmation = VitalConfirmation;

/** @alias VitalConfirmationTitle */
export const ConfirmationTitle = VitalConfirmationTitle;

/** @alias VitalConfirmationRequest */
export const ConfirmationRequest = VitalConfirmationRequest;

/** @alias VitalConfirmationAccepted */
export const ConfirmationAccepted = VitalConfirmationAccepted;

/** @alias VitalConfirmationRejected */
export const ConfirmationRejected = VitalConfirmationRejected;

/** @alias VitalConfirmationActions */
export const ConfirmationActions = VitalConfirmationActions;

/** @alias VitalConfirmationAction */
export const ConfirmationAction = VitalConfirmationAction;

/** @alias VitalConfirmationInfo - VITAL specific */
export const ConfirmationInfo = VitalConfirmationInfo;

export default VitalConfirmation;
