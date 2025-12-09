'use client';

/**
 * VitalTask - VITAL Platform L4 Worker Task Display
 * 
 * A collapsible task component for displaying **L4 Context Worker** execution.
 * Part of the 5-Level Agent OS Architecture where L4 Workers handle
 * context-specific operations delegated by L3 Specialists.
 * 
 * ## 5-Level Agent Hierarchy Mapping:
 * - L1 Master Orchestrator → VitalPlanCard (mission planning)
 * - L2 Domain Experts → VitalMessage (expert conversations)
 * - L3 Task Specialists → VitalMessage (specialist conversations)
 * - **L4 Context Workers → VitalTask** (worker task execution)
 * - L5 Tools/APIs → VitalTool (tool execution)
 * 
 * ## L4 Worker Categories (from VITAL registry):
 * - **Clinical Workers**: Evidence synthesis, guideline extraction
 * - **Regulatory Workers**: Submission prep, compliance checking
 * - **Safety Workers**: Signal detection, risk assessment
 * - **Medical Affairs Workers**: Publication prep, content review
 * - **Commercial Workers**: Market analysis, competitive intel
 * - **HEOR Workers**: Cost-effectiveness, outcomes research
 * - **Innovation Workers**: Trend analysis, opportunity mapping
 * 
 * ## VITAL-Specific Features:
 * - **L4 Worker Context**: Shows worker category, capabilities
 * - **Delegation Chain**: Who delegated this task (L3 Specialist)
 * - **Status Tracking**: Visual progress indicators
 * - **Duration Display**: Time spent on task
 * - **Langfuse Integration**: Trace ID for observability
 * - **Cost Tracking**: Token usage per task
 * - **Tool Invocations**: Which L5 tools were called
 * 
 * @example L4 Clinical Worker Task
 * ```tsx
 * <VitalTask 
 *   defaultOpen
 *   worker={{
 *     name: 'Evidence Synthesizer',
 *     level: 'L4',
 *     category: 'Clinical',
 *     delegatedBy: { name: 'Clinical Expert', level: 'L2' }
 *   }}
 *   status="in_progress"
 *   duration="12.5s"
 *   tokenUsage={8500}
 *   toolsInvoked={['pubmed_search', 'cochrane_search']}
 * >
 *   <VitalTaskTrigger title="Synthesizing clinical evidence" />
 *   <VitalTaskContent>
 *     <VitalTaskItem status="completed">
 *       Retrieved 45 studies from PubMed
 *     </VitalTaskItem>
 *     <VitalTaskItem status="completed">
 *       Filtered to 12 relevant RCTs
 *     </VitalTaskItem>
 *     <VitalTaskItem status="in_progress">
 *       Extracting key findings...
 *     </VitalTaskItem>
 *   </VitalTaskContent>
 * </VitalTask>
 * ```
 * 
 * @example L4 Regulatory Worker Task
 * ```tsx
 * <VitalTask
 *   worker={{
 *     name: 'Compliance Checker',
 *     level: 'L4',
 *     category: 'Regulatory',
 *     delegatedBy: { name: 'Regulatory Specialist', level: 'L3' }
 *   }}
 *   status="completed"
 *   duration="8.2s"
 * >
 *   <VitalTaskTrigger title="Checking regulatory compliance" />
 *   <VitalTaskContent>
 *     <VitalTaskItem status="completed">FDA guidelines verified</VitalTaskItem>
 *     <VitalTaskItem status="completed">EMA requirements checked</VitalTaskItem>
 *     <VitalTaskResult confidence={0.95} source="FDA 21 CFR Part 11">
 *       All compliance requirements met
 *     </VitalTaskResult>
 *   </VitalTaskContent>
 * </VitalTask>
 * ```
 */

import { cn } from '../lib/utils';
import { 
  CheckCircle, 
  ChevronDownIcon, 
  Circle, 
  Clock, 
  FileText, 
  Loader2, 
  SearchIcon,
  XCircle 
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

// ============================================================================
// VITAL Types - L4 Worker Context
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
  | 'Operations'
  | 'Communication'
  | 'Design';

/** Task status */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/** Agent reference (for delegation chain) */
export interface AgentRef {
  name: string;
  level: AgentLevel;
}

/** L4 Worker executing the task */
export interface TaskWorker {
  name: string;
  level: 'L4'; // Always L4 for workers
  category?: WorkerCategory;
  icon?: ReactNode;
  /** Which L3 Specialist delegated this task */
  delegatedBy?: AgentRef;
  /** Worker capabilities */
  capabilities?: string[];
}

/** Legacy: Agent executing the task (kept for backward compatibility) */
export interface TaskAgent {
  name: string;
  level: AgentLevel;
  icon?: ReactNode;
}

// ============================================================================
// Component Types
// ============================================================================

export type VitalTaskProps = ComponentProps<'div'> & {
  /** Whether task is expanded by default */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** L4 Worker executing the task (VITAL L4 Worker context) */
  worker?: TaskWorker;
  /** @deprecated Use `worker` instead. Agent executing the task */
  agent?: TaskAgent;
  /** Task status */
  status?: TaskStatus;
  /** Duration/time taken */
  duration?: string;
  /** Token usage */
  tokenUsage?: number;
  /** L5 Tools invoked during this task */
  toolsInvoked?: string[];
  /** Langfuse trace ID */
  traceId?: string;
};

export type VitalTaskTriggerProps = ComponentProps<'button'> & {
  /** Task title */
  title: string;
  /** Custom icon */
  icon?: ReactNode;
  /** Show status indicator */
  showStatus?: boolean;
};

export type VitalTaskContentProps = ComponentProps<'div'>;

export type VitalTaskItemProps = ComponentProps<'div'> & {
  /** Item status */
  status?: TaskStatus;
};

export type VitalTaskItemFileProps = ComponentProps<'span'> & {
  /** File type for icon selection */
  fileType?: 'pdf' | 'doc' | 'data' | 'image' | 'generic';
};

// ============================================================================
// Utility Constants
// ============================================================================

const levelColors: Record<AgentLevel, string> = {
  L1: 'text-purple-600 dark:text-purple-400',
  L2: 'text-blue-600 dark:text-blue-400',
  L3: 'text-cyan-600 dark:text-cyan-400',
  L4: 'text-green-600 dark:text-green-400',
  L5: 'text-gray-600 dark:text-gray-400',
};

const statusIcons: Record<TaskStatus, ReactNode> = {
  pending: <Circle className="size-3.5 text-muted-foreground" />,
  in_progress: <Loader2 className="size-3.5 text-blue-500 animate-spin" />,
  completed: <CheckCircle className="size-3.5 text-green-500" />,
  failed: <XCircle className="size-3.5 text-red-500" />,
  skipped: <Circle className="size-3.5 text-muted-foreground/50" />,
};

const statusColors: Record<TaskStatus, string> = {
  pending: 'text-muted-foreground',
  in_progress: 'text-blue-600 dark:text-blue-400',
  completed: 'text-green-600 dark:text-green-400',
  failed: 'text-red-600 dark:text-red-400',
  skipped: 'text-muted-foreground/50',
};

// ============================================================================
// Utility Constants - L4 Worker Categories
// ============================================================================

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
  'Communication': 'text-teal-600 dark:text-teal-400',
  'Design': 'text-rose-600 dark:text-rose-400',
};

// ============================================================================
// Context
// ============================================================================

interface TaskContextValue {
  isOpen: boolean;
  toggle: () => void;
  status?: TaskStatus;
  worker?: TaskWorker;
  agent?: TaskAgent; // Legacy support
  toolsInvoked?: string[];
}

const TaskContext = createContext<TaskContextValue | null>(null);

const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('Task components must be used within VitalTask');
  }
  return context;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root task container - L4 Worker Task Display
 */
export const VitalTask = ({
  className,
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  worker,
  agent, // Legacy support
  status,
  duration,
  tokenUsage,
  toolsInvoked,
  traceId,
  ...props
}: VitalTaskProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

  const toggle = () => {
    const newValue = !isOpen;
    setInternalOpen(newValue);
    onOpenChange?.(newValue);
  };

  // Use worker if provided, fall back to legacy agent
  const effectiveAgent = worker ?? agent;

  return (
    <TaskContext.Provider value={{ isOpen, toggle, status, worker, agent: effectiveAgent, toolsInvoked }}>
      <div 
        className={cn('rounded-md', className)} 
        data-trace-id={traceId}
        data-status={status}
        data-worker-category={worker?.category}
        {...props}
      >
        {/* VITAL Metadata (shown inline with trigger when compact) */}
        {children}
        
        {/* Footer metadata when expanded */}
        {isOpen && (worker || effectiveAgent || duration || tokenUsage || toolsInvoked) && (
          <div className="flex flex-wrap items-center gap-3 mt-2 pl-6 text-xs text-muted-foreground">
            {/* L4 Worker info */}
            {worker && (
              <span className={cn(
                'font-medium',
                worker.category ? workerCategoryColors[worker.category] : levelColors['L4']
              )}>
                L4 {worker.category && `${worker.category} • `}{worker.name}
              </span>
            )}
            {/* Legacy agent info (if no worker) */}
            {!worker && effectiveAgent && (
              <span className={cn('font-medium', levelColors[effectiveAgent.level])}>
                {effectiveAgent.level} • {effectiveAgent.name}
              </span>
            )}
            {/* Delegation chain */}
            {worker?.delegatedBy && (
              <span className="text-muted-foreground/70">
                ← delegated by {worker.delegatedBy.level} {worker.delegatedBy.name}
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {duration}
              </span>
            )}
            {tokenUsage && (
              <span>
                {tokenUsage.toLocaleString()} tokens
              </span>
            )}
            {/* L5 Tools invoked */}
            {toolsInvoked && toolsInvoked.length > 0 && (
              <span className="text-gray-500">
                L5: {toolsInvoked.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>
    </TaskContext.Provider>
  );
};

/**
 * Task trigger/header - Shows L4 Worker badge
 */
export const VitalTaskTrigger = ({
  className,
  title,
  icon,
  showStatus = true,
  children,
  ...props
}: VitalTaskTriggerProps) => {
  const { isOpen, toggle, status, worker, agent } = useTaskContext();
  const effectiveAgent = worker ?? agent;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-2',
        'text-sm transition-colors hover:text-foreground',
        status ? statusColors[status] : 'text-muted-foreground',
        className
      )}
      aria-expanded={isOpen}
      {...props}
    >
      {children ?? (
        <>
          {/* Status icon or custom icon */}
          {showStatus && status ? (
            statusIcons[status]
          ) : (
            icon ?? <SearchIcon className="size-4" />
          )}
          
          {/* L4 Worker badge (compact) */}
          {worker && (
            <span className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              'bg-green-100 dark:bg-green-900/30',
              worker.category ? workerCategoryColors[worker.category] : 'text-green-700 dark:text-green-300'
            )}>
              L4{worker.category && ` • ${worker.category}`}
            </span>
          )}
          {/* Legacy agent badge (if no worker) */}
          {!worker && effectiveAgent && (
            <span className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              'bg-muted',
              levelColors[effectiveAgent.level]
            )}>
              {effectiveAgent.level}
            </span>
          )}
          
          {/* Title */}
          <span className="text-sm flex-1 text-left">{title}</span>
          
          {/* Expand/collapse icon */}
          <ChevronDownIcon
            className={cn(
              'size-4 transition-transform duration-200',
              isOpen ? 'rotate-0' : '-rotate-90'
            )}
          />
        </>
      )}
    </button>
  );
};

/**
 * Task content container
 */
export const VitalTaskContent = ({
  className,
  children,
  ...props
}: VitalTaskContentProps) => {
  const { isOpen } = useTaskContext();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-top-2 duration-200',
        className
      )}
      {...props}
    >
      <div className="mt-3 space-y-1.5 border-muted border-l-2 pl-4 ml-1.5">
        {children}
      </div>
    </div>
  );
};

/**
 * Task item
 */
export const VitalTaskItem = ({
  className,
  status,
  children,
  ...props
}: VitalTaskItemProps) => (
  <div
    className={cn(
      'flex items-start gap-2 text-sm py-1',
      status ? statusColors[status] : 'text-muted-foreground',
      className
    )}
    data-status={status}
    {...props}
  >
    {status && (
      <span className="flex-shrink-0 mt-0.5">
        {statusIcons[status]}
      </span>
    )}
    <span className="flex-1">{children}</span>
  </div>
);

/**
 * Task item file badge
 */
export const VitalTaskItemFile = ({
  className,
  fileType = 'generic',
  children,
  ...props
}: VitalTaskItemFileProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-md border bg-secondary px-2 py-0.5 text-foreground text-xs',
      className
    )}
    {...props}
  >
    <FileText className="size-3" />
    {children}
  </span>
);

/**
 * Task result/finding item (VITAL-specific)
 */
export const VitalTaskResult = ({
  className,
  children,
  confidence,
  source,
  ...props
}: ComponentProps<'div'> & {
  confidence?: number;
  source?: string;
}) => (
  <div
    className={cn(
      'py-2 px-3 rounded-md bg-muted/50 text-sm',
      className
    )}
    {...props}
  >
    <div>{children}</div>
    {(confidence !== undefined || source) && (
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        {confidence !== undefined && (
          <span>Confidence: {Math.round(confidence * 100)}%</span>
        )}
        {source && (
          <span>Source: {source}</span>
        )}
      </div>
    )}
  </div>
);

// ============================================================================
// Display Names
// ============================================================================

VitalTask.displayName = 'VitalTask';
VitalTaskTrigger.displayName = 'VitalTaskTrigger';
VitalTaskContent.displayName = 'VitalTaskContent';
VitalTaskItem.displayName = 'VitalTaskItem';
VitalTaskItemFile.displayName = 'VitalTaskItemFile';
VitalTaskResult.displayName = 'VitalTaskResult';

// ============================================================================
// Aliases
// ============================================================================

export const Task = VitalTask;
export const TaskTrigger = VitalTaskTrigger;
export const TaskContent = VitalTaskContent;
export const TaskItem = VitalTaskItem;
export const TaskItemFile = VitalTaskItemFile;
export const TaskResult = VitalTaskResult;

// Export utility for external use
export { workerCategoryColors };

export default VitalTask;
