'use client';

/**
 * VitalToolApproval - AI SDK Tool Approval Workflow
 * 
 * A context-based component system for displaying tool approval requests
 * and their outcomes when working with Vercel AI SDK's tool approval workflow.
 * 
 * This is specifically designed for the AI SDK's `requireApproval: true` pattern
 * where dangerous tools need user confirmation before execution.
 * 
 * Features:
 * - Context-based state management for approval workflow
 * - Conditional rendering based on approval state
 * - Support for approval-requested, approval-responded, output-denied, and output-available states
 * - Built on shadcn/ui Alert and Button components
 * - TypeScript support with comprehensive type definitions
 * - Keyboard navigation and accessibility support
 * - Theme-aware with automatic dark mode support
 * 
 * @example
 * ```tsx
 * import { useChat } from '@ai-sdk/react';
 * import type { ToolUIPart } from 'ai';
 * 
 * const deleteTool = message.parts?.find(
 *   (part) => part.type === 'tool-delete_file'
 * ) as ToolUIPart | undefined;
 * 
 * {deleteTool?.approval && (
 *   <VitalToolApproval approval={deleteTool.approval} state={deleteTool.state}>
 *     <VitalToolApprovalRequest>
 *       This tool wants to delete: <code>{deleteTool.input?.filePath}</code>
 *       <br />
 *       Do you approve this action?
 *     </VitalToolApprovalRequest>
 *     <VitalToolApprovalAccepted>
 *       <CheckIcon className="size-4" />
 *       <span>You approved this tool execution</span>
 *     </VitalToolApprovalAccepted>
 *     <VitalToolApprovalRejected>
 *       <XIcon className="size-4" />
 *       <span>You rejected this tool execution</span>
 *     </VitalToolApprovalRejected>
 *     <VitalToolApprovalActions>
 *       <VitalToolApprovalAction
 *         variant="outline"
 *         onClick={() => respondToConfirmationRequest({
 *           approvalId: deleteTool.approval!.id,
 *           approved: false,
 *         })}
 *       >
 *         Reject
 *       </VitalToolApprovalAction>
 *       <VitalToolApprovalAction
 *         onClick={() => respondToConfirmationRequest({
 *           approvalId: deleteTool.approval!.id,
 *           approved: true,
 *         })}
 *       >
 *         Approve
 *       </VitalToolApprovalAction>
 *     </VitalToolApprovalActions>
 *   </VitalToolApproval>
 * )}
 * ```
 */

import { cn } from '../lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext } from 'react';

// ============================================================================
// Types - Compatible with Vercel AI SDK ToolUIPart
// ============================================================================

/**
 * Tool approval object from AI SDK
 */
export type ToolUIPartApproval =
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
 * Tool state from AI SDK
 */
export type ToolUIPartState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-denied'
  | 'output-available';

// ============================================================================
// Context
// ============================================================================

interface ToolApprovalContextValue {
  approval: ToolUIPartApproval;
  state: ToolUIPartState;
}

const ToolApprovalContext = createContext<ToolApprovalContextValue | null>(null);

const useToolApproval = () => {
  const context = useContext(ToolApprovalContext);

  if (!context) {
    throw new Error('ToolApproval components must be used within VitalToolApproval');
  }

  return context;
};

// ============================================================================
// Types for Components
// ============================================================================

export type VitalToolApprovalProps = ComponentProps<'div'> & {
  /** The approval object containing the approval ID and status */
  approval?: ToolUIPartApproval;
  /** The current state of the tool */
  state: ToolUIPartState;
  /** Custom Alert variant */
  variant?: 'default' | 'destructive' | 'warning';
};

export type VitalToolApprovalTitleProps = ComponentProps<'div'>;

export type VitalToolApprovalRequestProps = {
  children?: ReactNode;
};

export type VitalToolApprovalAcceptedProps = {
  children?: ReactNode;
};

export type VitalToolApprovalRejectedProps = {
  children?: ReactNode;
};

export type VitalToolApprovalActionsProps = ComponentProps<'div'>;

export type VitalToolApprovalActionProps = ComponentProps<'button'> & {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root container - Provides context for approval state
 */
export const VitalToolApproval = ({
  className,
  approval,
  state,
  variant = 'default',
  children,
  ...props
}: VitalToolApprovalProps) => {
  // Don't render for input states or when no approval
  if (!approval || state === 'input-streaming' || state === 'input-available') {
    return null;
  }

  const variantStyles = {
    default: 'border-border bg-background',
    destructive: 'border-destructive/50 bg-destructive/5',
    warning: 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20',
  };

  return (
    <ToolApprovalContext.Provider value={{ approval, state }}>
      <div
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          'flex flex-col gap-2',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ToolApprovalContext.Provider>
  );
};

/**
 * Title/description text
 */
export const VitalToolApprovalTitle = ({
  className,
  ...props
}: VitalToolApprovalTitleProps) => (
  <div
    className={cn('text-sm font-medium leading-relaxed', className)}
    {...props}
  />
);

/**
 * Content shown when approval is requested
 */
export const VitalToolApprovalRequest = ({
  children,
}: VitalToolApprovalRequestProps) => {
  const { state } = useToolApproval();

  // Only show when approval is requested
  if (state !== 'approval-requested') {
    return null;
  }

  return <>{children}</>;
};

/**
 * Content shown when approval was accepted
 */
export const VitalToolApprovalAccepted = ({
  children,
}: VitalToolApprovalAcceptedProps) => {
  const { approval, state } = useToolApproval();

  // Only show when approved and in response states
  const showStates: ToolUIPartState[] = [
    'approval-responded',
    'output-denied',
    'output-available',
  ];

  if (!approval?.approved || !showStates.includes(state)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
      {children}
    </div>
  );
};

/**
 * Content shown when approval was rejected
 */
export const VitalToolApprovalRejected = ({
  children,
}: VitalToolApprovalRejectedProps) => {
  const { approval, state } = useToolApproval();

  // Only show when rejected and in response states
  const showStates: ToolUIPartState[] = [
    'approval-responded',
    'output-denied',
    'output-available',
  ];

  if (approval?.approved !== false || !showStates.includes(state)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
      {children}
    </div>
  );
};

/**
 * Actions container - only shown during approval-requested state
 */
export const VitalToolApprovalActions = ({
  className,
  ...props
}: VitalToolApprovalActionsProps) => {
  const { state } = useToolApproval();

  // Only show when approval is requested
  if (state !== 'approval-requested') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 self-end mt-2',
        className
      )}
      {...props}
    />
  );
};

/**
 * Action button
 */
export const VitalToolApprovalAction = ({
  className,
  variant = 'default',
  ...props
}: VitalToolApprovalActionProps) => {
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

// ============================================================================
// Display Names
// ============================================================================

VitalToolApproval.displayName = 'VitalToolApproval';
VitalToolApprovalTitle.displayName = 'VitalToolApprovalTitle';
VitalToolApprovalRequest.displayName = 'VitalToolApprovalRequest';
VitalToolApprovalAccepted.displayName = 'VitalToolApprovalAccepted';
VitalToolApprovalRejected.displayName = 'VitalToolApprovalRejected';
VitalToolApprovalActions.displayName = 'VitalToolApprovalActions';
VitalToolApprovalAction.displayName = 'VitalToolApprovalAction';

// ============================================================================
// Aliases (matching ai-elements naming)
// ============================================================================

export const Confirmation = VitalToolApproval;
export const ConfirmationTitle = VitalToolApprovalTitle;
export const ConfirmationRequest = VitalToolApprovalRequest;
export const ConfirmationAccepted = VitalToolApprovalAccepted;
export const ConfirmationRejected = VitalToolApprovalRejected;
export const ConfirmationActions = VitalToolApprovalActions;
export const ConfirmationAction = VitalToolApprovalAction;

// Hook export
export { useToolApproval };

export default VitalToolApproval;
