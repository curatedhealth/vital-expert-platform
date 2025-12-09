'use client';

/**
 * VitalQueue - VITAL Platform Task Queue Display
 * 
 * A comprehensive queue component for displaying L4 Worker tasks, agent assignments,
 * and batch operations. Extended for VITAL platform with priority management,
 * agent hierarchy tracking, and batch execution support.
 * 
 * ## 5-Level Agent Hierarchy Context:
 * - Queue displays tasks delegated from L1-L3 agents
 * - Tasks assigned to L4 Workers for execution
 * - L5 Tool calls visualized within task items
 * 
 * ## VITAL-Specific Features:
 * - **Priority Levels**: Critical, High, Medium, Low task priorities
 * - **Agent Assignment**: Shows which L4 Worker handles each task
 * - **Delegation Chain**: Track which agent delegated the task
 * - **Batch Operations**: Group related tasks for parallel execution
 * - **Cost Tracking**: Token usage and estimated costs per batch
 * - **Status Indicators**: Pending, Running, Completed, Failed states
 * - **HITL Integration**: Approval gates for critical tasks
 * 
 * @example L4 Worker Task Queue
 * ```tsx
 * <VitalQueue 
 *   batchId="batch-123"
 *   estimatedCost={{ tokens: 45000, usd: 0.15 }}
 * >
 *   <VitalQueueSection defaultOpen priority="high">
 *     <VitalQueueSectionTrigger>
 *       <VitalQueueSectionLabel 
 *         count={3} 
 *         label="Clinical Analysis Tasks"
 *         worker={{ name: 'Evidence Synthesizer', level: 'L4', category: 'Clinical' }}
 *       />
 *     </VitalQueueSectionTrigger>
 *     <VitalQueueSectionContent>
 *       <VitalQueueList>
 *         <VitalQueueItem 
 *           status="completed"
 *           delegatedBy={{ name: 'Clinical Expert', level: 'L2' }}
 *         >
 *           <VitalQueueItemIndicator status="completed" />
 *           <VitalQueueItemContent>Literature review complete</VitalQueueItemContent>
 *           <VitalQueueItemDescription>
 *             12 sources analyzed • 850 tokens
 *           </VitalQueueItemDescription>
 *         </VitalQueueItem>
 *       </VitalQueueList>
 *     </VitalQueueSectionContent>
 *   </VitalQueueSection>
 * </VitalQueue>
 * ```
 */

import { cn } from '../lib/utils';
import { 
  AlertTriangle,
  CheckCircle,
  ChevronDownIcon, 
  Circle,
  Clock,
  Loader2,
  PaperclipIcon,
  XCircle 
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useState } from 'react';

// ============================================================================
// VITAL Types
// ============================================================================

/** Agent level in VITAL hierarchy */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** L4 Worker category */
export type WorkerCategory = 
  | 'Clinical'
  | 'Regulatory'
  | 'Safety'
  | 'Medical Affairs'
  | 'Commercial'
  | 'HEOR'
  | 'Bioinformatics'
  | 'Digital Health'
  | 'Innovation'
  | 'Operations';

/** Task priority level */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

/** Queue item status */
export type QueueItemStatus = 'pending' | 'running' | 'completed' | 'failed' | 'blocked';

/** Agent reference */
export interface AgentRef {
  name: string;
  level: AgentLevel;
}

/** L4 Worker reference */
export interface WorkerRef {
  name: string;
  level: 'L4';
  category?: WorkerCategory;
}

/** Cost estimation */
export interface QueueCost {
  tokens?: number;
  usd?: number;
}

/** Part of a queue message */
export type QueueMessagePart = {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
};

/** Queue message structure */
export type QueueMessage = {
  id: string;
  parts: QueueMessagePart[];
};

/** Queue todo item structure */
export type QueueTodo = {
  id: string;
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
};

// ============================================================================
// Component Props
// ============================================================================

export type VitalQueueProps = ComponentProps<'div'> & {
  /** Batch ID for grouped tasks (VITAL-specific) */
  batchId?: string;
  /** Estimated cost for the batch (VITAL-specific) */
  estimatedCost?: QueueCost;
  /** Total tasks in queue */
  totalTasks?: number;
  /** Completed tasks count */
  completedTasks?: number;
  /** Langfuse trace ID */
  traceId?: string;
};

export type VitalQueueSectionProps = ComponentProps<'div'> & {
  /** Whether the section is open by default */
  defaultOpen?: boolean;
  /** Section priority (VITAL-specific) */
  priority?: TaskPriority;
};

export type VitalQueueSectionTriggerProps = ComponentProps<'button'>;

export type VitalQueueSectionLabelProps = ComponentProps<'span'> & {
  /** The label text to display */
  label: string;
  /** The count to display before the label */
  count?: number;
  /** An optional icon to display before the count */
  icon?: ReactNode;
  /** L4 Worker assigned to this section (VITAL-specific) */
  worker?: WorkerRef;
};

export type VitalQueueSectionContentProps = ComponentProps<'div'>;

export type VitalQueueListProps = ComponentProps<'div'>;

export type VitalQueueItemProps = ComponentProps<'li'> & {
  /** Item status (VITAL-specific) */
  status?: QueueItemStatus;
  /** Agent who delegated this task (VITAL-specific) */
  delegatedBy?: AgentRef;
  /** Token usage for this item (VITAL-specific) */
  tokenUsage?: number;
};

export type VitalQueueItemIndicatorProps = ComponentProps<'span'> & {
  /** Whether the item is completed (legacy) */
  completed?: boolean;
  /** Item status (VITAL-specific) */
  status?: QueueItemStatus;
};

export type VitalQueueItemContentProps = ComponentProps<'span'> & {
  /** Whether the item is completed. Affects text styling with strikethrough and opacity */
  completed?: boolean;
};

export type VitalQueueItemDescriptionProps = ComponentProps<'div'> & {
  /** Whether the item is completed. Affects text styling */
  completed?: boolean;
};

export type VitalQueueItemActionsProps = ComponentProps<'div'>;

export type VitalQueueItemActionProps = ComponentProps<'button'>;

export type VitalQueueItemAttachmentProps = ComponentProps<'div'>;

export type VitalQueueItemImageProps = ComponentProps<'img'>;

export type VitalQueueItemFileProps = ComponentProps<'span'>;

// ============================================================================
// Utility Constants
// ============================================================================

const priorityColors: Record<TaskPriority, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-green-500',
};

const statusIcons: Record<QueueItemStatus, ReactNode> = {
  pending: <Circle className="size-3.5 text-muted-foreground" />,
  running: <Loader2 className="size-3.5 text-blue-500 animate-spin" />,
  completed: <CheckCircle className="size-3.5 text-green-500" />,
  failed: <XCircle className="size-3.5 text-red-500" />,
  blocked: <AlertTriangle className="size-3.5 text-amber-500" />,
};

const workerCategoryColors: Record<WorkerCategory, string> = {
  'Clinical': 'text-blue-600 dark:text-blue-400',
  'Regulatory': 'text-purple-600 dark:text-purple-400',
  'Safety': 'text-red-600 dark:text-red-400',
  'Medical Affairs': 'text-cyan-600 dark:text-cyan-400',
  'Commercial': 'text-amber-600 dark:text-amber-400',
  'HEOR': 'text-green-600 dark:text-green-400',
  'Bioinformatics': 'text-pink-600 dark:text-pink-400',
  'Digital Health': 'text-indigo-600 dark:text-indigo-400',
  'Innovation': 'text-orange-600 dark:text-orange-400',
  'Operations': 'text-slate-600 dark:text-slate-400',
};

// ============================================================================
// Context
// ============================================================================

interface QueueSectionContextValue {
  isOpen: boolean;
  toggle: () => void;
  state: 'open' | 'closed';
  priority?: TaskPriority;
}

const QueueSectionContext = createContext<QueueSectionContextValue | null>(null);

const useQueueSectionContext = () => {
  const context = useContext(QueueSectionContext);
  if (!context) {
    throw new Error('QueueSection components must be used within VitalQueueSection');
  }
  return context;
};

// ============================================================================
// Root Component
// ============================================================================

/**
 * Root queue container with batch tracking
 */
export const VitalQueue = forwardRef<HTMLDivElement, VitalQueueProps>(
  ({ 
    className, 
    batchId, 
    estimatedCost, 
    totalTasks, 
    completedTasks,
    traceId,
    children,
    ...props 
  }, ref) => {
    const progressPercent = totalTasks && completedTasks !== undefined
      ? Math.round((completedTasks / totalTasks) * 100)
      : undefined;

    return (
      <div
        ref={ref}
        data-batch-id={batchId}
        data-trace-id={traceId}
        className={cn(
          'flex flex-col gap-2 rounded-xl border border-border bg-background px-3 pt-2 pb-2 shadow-xs',
          className
        )}
        {...props}
      >
        {/* VITAL Batch Header */}
        {(batchId || estimatedCost || totalTasks) && (
          <div className="flex items-center justify-between gap-2 pb-2 border-b text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {batchId && (
                <span className="font-mono text-xs">{batchId}</span>
              )}
              {totalTasks && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {completedTasks ?? 0}/{totalTasks} tasks
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {estimatedCost && (
                <span>
                  {estimatedCost.tokens && `~${(estimatedCost.tokens / 1000).toFixed(1)}k tokens`}
                  {estimatedCost.usd && ` • $${estimatedCost.usd.toFixed(2)}`}
                </span>
              )}
              {progressPercent !== undefined && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span>{progressPercent}%</span>
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }
);

// ============================================================================
// Section Components (Collapsible)
// ============================================================================

/**
 * Collapsible section container with priority indicator
 */
export const VitalQueueSection = forwardRef<HTMLDivElement, VitalQueueSectionProps>(
  ({ className, children, defaultOpen = true, priority, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const toggle = () => setIsOpen((prev) => !prev);
    const state = isOpen ? 'open' : 'closed';

    return (
      <QueueSectionContext.Provider value={{ isOpen, toggle, state, priority }}>
        <div
          ref={ref}
          data-state={state}
          data-priority={priority}
          className={cn(
            priority && `border-l-2 ${priorityColors[priority]} pl-2`,
            className
          )}
          {...props}
        >
          {children}
        </div>
      </QueueSectionContext.Provider>
    );
  }
);

/**
 * Section trigger/header button
 */
export const VitalQueueSectionTrigger = forwardRef<HTMLButtonElement, VitalQueueSectionTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { toggle, state } = useQueueSectionContext();

    return (
      <button
        ref={ref}
        type="button"
        data-state={state}
        onClick={(e) => {
          toggle();
          onClick?.(e);
        }}
        className={cn(
          'group flex w-full items-center justify-between rounded-md',
          'bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground text-sm',
          'transition-colors hover:bg-muted',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

/**
 * Section label with optional count, icon, and L4 worker badge
 */
export const VitalQueueSectionLabel = forwardRef<HTMLSpanElement, VitalQueueSectionLabelProps>(
  ({ count, label, icon, worker, className, ...props }, ref) => {
    const { state } = useQueueSectionContext();

    return (
      <span
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        <ChevronDownIcon
          className={cn(
            'size-4 transition-transform duration-200',
            state === 'closed' && '-rotate-90'
          )}
        />
        {icon}
        <span>
          {count !== undefined && `${count} `}{label}
        </span>
        {/* L4 Worker badge */}
        {worker && (
          <span className={cn(
            'text-xs font-medium px-1.5 py-0.5 rounded',
            'bg-green-100 dark:bg-green-900/30',
            worker.category ? workerCategoryColors[worker.category] : 'text-green-700 dark:text-green-300'
          )}>
            L4{worker.category && ` • ${worker.category}`}
          </span>
        )}
      </span>
    );
  }
);

/**
 * Collapsible content area with smooth animation
 */
export const VitalQueueSectionContent = forwardRef<HTMLDivElement, VitalQueueSectionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, state } = useQueueSectionContext();

    return (
      <div
        ref={ref}
        data-state={state}
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen
            ? 'animate-in fade-in-0 slide-in-from-top-2'
            : 'hidden',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// ============================================================================
// List Components
// ============================================================================

/**
 * Scrollable queue list container
 */
export const VitalQueueList = forwardRef<HTMLDivElement, VitalQueueListProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mb-1 mt-2 overflow-auto', className)}
      {...props}
    >
      <div className="max-h-40 pr-4">
        <ul className="space-y-1">{children}</ul>
      </div>
    </div>
  )
);

/**
 * Individual queue item with delegation info
 */
export const VitalQueueItem = forwardRef<HTMLLIElement, VitalQueueItemProps>(
  ({ className, status, delegatedBy, tokenUsage, children, ...props }, ref) => (
    <li
      ref={ref}
      data-status={status}
      className={cn(
        'group flex flex-col gap-1 rounded-md px-3 py-1 text-sm transition-colors hover:bg-muted',
        className
      )}
      {...props}
    >
      {children}
      {/* VITAL metadata footer */}
      {(delegatedBy || tokenUsage) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70 ml-6">
          {delegatedBy && (
            <span>← {delegatedBy.level} {delegatedBy.name}</span>
          )}
          {tokenUsage && (
            <span>{tokenUsage.toLocaleString()} tokens</span>
          )}
        </div>
      )}
    </li>
  )
);

/**
 * Status indicator with VITAL states
 */
export const VitalQueueItemIndicator = forwardRef<HTMLSpanElement, VitalQueueItemIndicatorProps>(
  ({ completed = false, status, className, ...props }, ref) => {
    // If status is provided, use it; otherwise fall back to completed boolean
    if (status) {
      return (
        <span ref={ref} className={cn('mt-0.5 shrink-0', className)} {...props}>
          {statusIcons[status]}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          'mt-0.5 inline-block size-2.5 shrink-0 rounded-full border',
          completed
            ? 'border-muted-foreground/20 bg-muted-foreground/10'
            : 'border-muted-foreground/50',
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * Item content text
 */
export const VitalQueueItemContent = forwardRef<HTMLSpanElement, VitalQueueItemContentProps>(
  ({ completed = false, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'line-clamp-1 grow break-words',
        completed
          ? 'text-muted-foreground/50 line-through'
          : 'text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);

/**
 * Item description text
 */
export const VitalQueueItemDescription = forwardRef<HTMLDivElement, VitalQueueItemDescriptionProps>(
  ({ completed = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'ml-6 text-xs',
        completed
          ? 'text-muted-foreground/40 line-through'
          : 'text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);

// ============================================================================
// Action Components
// ============================================================================

/**
 * Action buttons container (hover-revealed)
 */
export const VitalQueueItemActions = forwardRef<HTMLDivElement, VitalQueueItemActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex gap-1', className)}
      {...props}
    />
  )
);

/**
 * Individual action button (hidden until hover)
 */
export const VitalQueueItemAction = forwardRef<HTMLButtonElement, VitalQueueItemActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded p-1',
        'size-auto text-muted-foreground',
        'opacity-0 transition-opacity group-hover:opacity-100',
        'hover:bg-muted-foreground/10 hover:text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
      {...props}
    />
  )
);

// ============================================================================
// Attachment Components
// ============================================================================

/**
 * Attachments container
 */
export const VitalQueueItemAttachment = forwardRef<HTMLDivElement, VitalQueueItemAttachmentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-1 flex flex-wrap gap-2', className)}
      {...props}
    />
  )
);

/**
 * Image attachment thumbnail
 */
export const VitalQueueItemImage = forwardRef<HTMLImageElement, VitalQueueItemImageProps>(
  ({ className, alt = '', ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn('h-8 w-8 rounded border object-cover', className)}
      height={32}
      width={32}
      {...props}
    />
  )
);

/**
 * File attachment badge
 */
export const VitalQueueItemFile = forwardRef<HTMLSpanElement, VitalQueueItemFileProps>(
  ({ children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs',
        className
      )}
      {...props}
    >
      <PaperclipIcon size={12} />
      <span className="max-w-[100px] truncate">{children}</span>
    </span>
  )
);

// ============================================================================
// Display Names
// ============================================================================

VitalQueue.displayName = 'VitalQueue';
VitalQueueSection.displayName = 'VitalQueueSection';
VitalQueueSectionTrigger.displayName = 'VitalQueueSectionTrigger';
VitalQueueSectionLabel.displayName = 'VitalQueueSectionLabel';
VitalQueueSectionContent.displayName = 'VitalQueueSectionContent';
VitalQueueList.displayName = 'VitalQueueList';
VitalQueueItem.displayName = 'VitalQueueItem';
VitalQueueItemIndicator.displayName = 'VitalQueueItemIndicator';
VitalQueueItemContent.displayName = 'VitalQueueItemContent';
VitalQueueItemDescription.displayName = 'VitalQueueItemDescription';
VitalQueueItemActions.displayName = 'VitalQueueItemActions';
VitalQueueItemAction.displayName = 'VitalQueueItemAction';
VitalQueueItemAttachment.displayName = 'VitalQueueItemAttachment';
VitalQueueItemImage.displayName = 'VitalQueueItemImage';
VitalQueueItemFile.displayName = 'VitalQueueItemFile';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const Queue = VitalQueue;
export const QueueSection = VitalQueueSection;
export const QueueSectionTrigger = VitalQueueSectionTrigger;
export const QueueSectionLabel = VitalQueueSectionLabel;
export const QueueSectionContent = VitalQueueSectionContent;
export const QueueList = VitalQueueList;
export const QueueItem = VitalQueueItem;
export const QueueItemIndicator = VitalQueueItemIndicator;
export const QueueItemContent = VitalQueueItemContent;
export const QueueItemDescription = VitalQueueItemDescription;
export const QueueItemActions = VitalQueueItemActions;
export const QueueItemAction = VitalQueueItemAction;
export const QueueItemAttachment = VitalQueueItemAttachment;
export const QueueItemImage = VitalQueueItemImage;
export const QueueItemFile = VitalQueueItemFile;

// Export VITAL utilities
export { priorityColors, statusIcons, workerCategoryColors };

export default VitalQueue;
