'use client';

/**
 * VitalTool - VITAL Platform L5 Tool Execution Display
 * 
 * A collapsible interface for showing/hiding L5 tool execution details.
 * Designed to work with the ToolUIPart type from Vercel AI SDK and
 * extended for VITAL's L5 tool hierarchy.
 * 
 * ## VITAL-Specific Features:
 * - **L5 Tool Context**: Shows tool category, registry info, API source
 * - **Execution Tracking**: Duration, token usage, retry count
 * - **Approval Integration**: Links to HITL approval workflow
 * - **Error Handling**: Detailed error display with recovery options
 * - **Langfuse Tracing**: Built-in observability hooks
 * - **Rate Limiting**: Visual indicator for API limits
 * 
 * ## L5 Tool Categories (from VITAL registry):
 * - Medical Literature (PubMed, Arxiv, Google Scholar)
 * - Drug Databases (DrugBank, RxNorm, WHO ATC)
 * - Clinical Data (ClinicalTrials.gov, OpenFDA FAERS)
 * - Knowledge Retrieval (RAG, Vector, Graph)
 * 
 * @example L5 PubMed Search
 * ```tsx
 * <VitalTool 
 *   defaultOpen={true}
 *   tool={{ name: 'pubmed_search', category: 'Medical Literature', source: 'NCBI' }}
 *   executionTime="1.2s"
 *   tokenUsage={850}
 * >
 *   <VitalToolHeader type="tool-pubmed_search" state="output-available" />
 *   <VitalToolContent>
 *     <VitalToolInput input={{ query: 'metformin drug interactions', limit: 10 }} />
 *     <VitalToolOutput output={results} />
 *   </VitalToolContent>
 * </VitalTool>
 * ```
 * 
 * @example L5 Tool with Approval
 * ```tsx
 * <VitalTool
 *   tool={{ name: 'external_api_call', category: 'External', requiresApproval: true }}
 *   approval={{ id: 'approval-123', approved: undefined }}
 * >
 *   <VitalToolHeader type="tool-external_api" state="approval-requested" />
 *   <VitalToolContent>
 *     <VitalToolApprovalRequest>
 *       This tool will call an external API. Approve?
 *     </VitalToolApprovalRequest>
 *   </VitalToolContent>
 * </VitalTool>
 * ```
 */

import { cn } from '../lib/utils';
import {
  AlertTriangle,
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  Database,
  FileSearch,
  Globe,
  RefreshCw,
  Search,
  WrenchIcon,
  XCircleIcon,
  Zap,
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, forwardRef, isValidElement, useContext, useState } from 'react';

// ============================================================================
// VITAL Types
// ============================================================================

/** L5 Tool category */
export type ToolCategory = 
  | 'Medical Literature'
  | 'Drug Databases'
  | 'Clinical Data'
  | 'Knowledge Retrieval'
  | 'Web Search'
  | 'External API'
  | 'Internal';

/** Tool execution state */
export type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-error'
  | 'output-denied';

/** L5 Tool metadata */
export interface L5Tool {
  name: string;
  category?: ToolCategory;
  source?: string;
  description?: string;
  requiresApproval?: boolean;
  rateLimit?: {
    remaining: number;
    total: number;
    resetIn?: string;
  };
}

/** Tool approval object */
export interface ToolApproval {
  id: string;
  approved?: boolean;
  reason?: string;
}

// ============================================================================
// Component Types
// ============================================================================

export type VitalToolProps = ComponentProps<'div'> & {
  /** Default open state */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** L5 Tool metadata (VITAL-specific) */
  tool?: L5Tool;
  /** Execution time (VITAL-specific) */
  executionTime?: string;
  /** Token usage (VITAL-specific) */
  tokenUsage?: number;
  /** Retry count (VITAL-specific) */
  retryCount?: number;
  /** Approval object (VITAL-specific) */
  approval?: ToolApproval;
  /** Langfuse trace ID (VITAL-specific) */
  traceId?: string;
};

export type VitalToolHeaderProps = ComponentProps<'button'> & {
  /** Custom title for the tool */
  title?: string;
  /** The type/name of the tool (e.g., "tool-fetch_weather") */
  type: string;
  /** The current state of the tool */
  state: ToolState;
};

export type VitalToolContentProps = ComponentProps<'div'>;

export type VitalToolInputProps = ComponentProps<'div'> & {
  /** The input parameters passed to the tool */
  input: unknown;
  /** Show raw JSON or formatted */
  format?: 'raw' | 'formatted';
};

export type VitalToolOutputProps = ComponentProps<'div'> & {
  /** The output/result of the tool execution */
  output?: ReactNode;
  /** An error message if the tool execution failed */
  errorText?: string;
  /** Error details for debugging */
  errorDetails?: Record<string, unknown>;
};

// ============================================================================
// Utility Constants
// ============================================================================

const categoryIcons: Record<ToolCategory, ReactNode> = {
  'Medical Literature': <FileSearch className="size-4" />,
  'Drug Databases': <Database className="size-4" />,
  'Clinical Data': <Search className="size-4" />,
  'Knowledge Retrieval': <Database className="size-4" />,
  'Web Search': <Globe className="size-4" />,
  'External API': <Zap className="size-4" />,
  'Internal': <WrenchIcon className="size-4" />,
};

const categoryColors: Record<ToolCategory, string> = {
  'Medical Literature': 'text-blue-600 dark:text-blue-400',
  'Drug Databases': 'text-purple-600 dark:text-purple-400',
  'Clinical Data': 'text-cyan-600 dark:text-cyan-400',
  'Knowledge Retrieval': 'text-green-600 dark:text-green-400',
  'Web Search': 'text-orange-600 dark:text-orange-400',
  'External API': 'text-amber-600 dark:text-amber-400',
  'Internal': 'text-stone-600 dark:text-stone-400',
};

// ============================================================================
// Context
// ============================================================================

interface ToolContextValue {
  isOpen: boolean;
  toggle: () => void;
  tool?: L5Tool;
  executionTime?: string;
  tokenUsage?: number;
}

const ToolContext = createContext<ToolContextValue | null>(null);

const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('Tool components must be used within VitalTool');
  }
  return context;
};

// ============================================================================
// Helper Components
// ============================================================================

/** Status badge for tool state */
const ToolStatusBadge = ({ state }: { state: ToolState }) => {
  const labels: Record<ToolState, string> = {
    'input-streaming': 'Pending',
    'input-available': 'Running',
    'approval-requested': 'Awaiting Approval',
    'approval-responded': 'Responded',
    'output-available': 'Completed',
    'output-error': 'Error',
    'output-denied': 'Denied',
  };

  const icons: Record<ToolState, ReactNode> = {
    'input-streaming': <CircleIcon className="size-3.5" />,
    'input-available': <ClockIcon className="size-3.5 animate-pulse" />,
    'approval-requested': <AlertTriangle className="size-3.5 text-amber-600" />,
    'approval-responded': <CheckCircleIcon className="size-3.5 text-blue-600" />,
    'output-available': <CheckCircleIcon className="size-3.5 text-green-600" />,
    'output-error': <XCircleIcon className="size-3.5 text-red-600" />,
    'output-denied': <XCircleIcon className="size-3.5 text-orange-600" />,
  };

  const colors: Record<ToolState, string> = {
    'input-streaming': 'bg-muted text-muted-foreground',
    'input-available': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'approval-requested': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'approval-responded': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'output-available': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'output-error': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'output-denied': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      colors[state]
    )}>
      {icons[state]}
      {labels[state]}
    </span>
  );
};

/** Simple code block for JSON display */
const SimpleCodeBlock = ({ code, language = 'json' }: { code: string; language?: string }) => (
  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
    <code>{code}</code>
  </pre>
);

// ============================================================================
// Components
// ============================================================================

/**
 * Root tool container
 */
export const VitalTool = forwardRef<HTMLDivElement, VitalToolProps>(
  (
    {
      className,
      defaultOpen = true,
      open: controlledOpen,
      onOpenChange,
      tool,
      executionTime,
      tokenUsage,
      retryCount,
      approval,
      traceId,
      children,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = controlledOpen ?? internalOpen;

    const toggle = () => {
      const newOpen = !isOpen;
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <ToolContext.Provider value={{ isOpen, toggle, tool, executionTime, tokenUsage }}>
        <div
          ref={ref}
          data-state={isOpen ? 'open' : 'closed'}
          data-trace-id={traceId}
          className={cn('not-prose mb-4 w-full rounded-md border', className)}
          {...props}
        >
          {/* VITAL Metadata Bar */}
          {(tool || executionTime || tokenUsage || retryCount) && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border-b bg-muted/30 text-xs">
              <div className="flex items-center gap-2">
                {tool?.category && (
                  <span className={cn(
                    'inline-flex items-center gap-1',
                    categoryColors[tool.category]
                  )}>
                    {categoryIcons[tool.category]}
                    <span>{tool.category}</span>
                  </span>
                )}
                {tool?.source && (
                  <span className="text-muted-foreground">
                    via {tool.source}
                  </span>
                )}
                {tool?.rateLimit && (
                  <span className={cn(
                    'text-xs',
                    tool.rateLimit.remaining < 10 ? 'text-amber-600' : 'text-muted-foreground'
                  )}>
                    {tool.rateLimit.remaining}/{tool.rateLimit.total} calls
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                {executionTime && (
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    {executionTime}
                  </span>
                )}
                {tokenUsage && (
                  <span>{tokenUsage.toLocaleString()} tokens</span>
                )}
                {retryCount !== undefined && retryCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <RefreshCw className="size-3" />
                    {retryCount} retries
                  </span>
                )}
              </div>
            </div>
          )}
          {children}
        </div>
      </ToolContext.Provider>
    );
  }
);

/**
 * Tool header with title and status
 */
export const VitalToolHeader = forwardRef<HTMLButtonElement, VitalToolHeaderProps>(
  ({ className, title, type, state, ...props }, ref) => {
    const { isOpen, toggle, tool } = useToolContext();

    // Parse tool name from type (e.g., "tool-fetch_weather" -> "fetch_weather")
    const toolName = title ?? tool?.name ?? type.split('-').slice(1).join('-');
    const toolDescription = tool?.description;

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center justify-between gap-4 p-3',
          'hover:bg-muted/50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
          'group',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 min-w-0">
          <WrenchIcon className="size-4 text-muted-foreground flex-shrink-0" />
          <div className="text-left min-w-0">
            <span className="font-medium text-sm block truncate">{toolName}</span>
            {toolDescription && (
              <span className="text-xs text-muted-foreground block truncate">
                {toolDescription}
              </span>
            )}
          </div>
          <ToolStatusBadge state={state} />
        </div>
        <ChevronDownIcon
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>
    );
  }
);

/**
 * Tool content container
 */
export const VitalToolContent = forwardRef<HTMLDivElement, VitalToolContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useToolContext();

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'animate-in fade-in-0 slide-in-from-top-2 duration-200',
          'border-t',
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
 * Tool input parameters display
 */
export const VitalToolInput = forwardRef<HTMLDivElement, VitalToolInputProps>(
  ({ className, input, format = 'raw', ...props }, ref) => {
    const formattedInput = typeof input === 'object' 
      ? JSON.stringify(input, null, 2)
      : String(input);

    return (
      <div
        ref={ref}
        className={cn('space-y-2 overflow-hidden p-4', className)}
        {...props}
      >
        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Parameters
        </h4>
        <div className="rounded-md bg-muted/50">
          <SimpleCodeBlock code={formattedInput} language="json" />
        </div>
      </div>
    );
  }
);

/**
 * Tool output/result display
 */
export const VitalToolOutput = forwardRef<HTMLDivElement, VitalToolOutputProps>(
  ({ className, output, errorText, errorDetails, ...props }, ref) => {
    if (!output && !errorText) {
      return null;
    }

    let OutputContent: ReactNode = <div>{output as ReactNode}</div>;

    if (typeof output === 'object' && output !== null && !isValidElement(output)) {
      OutputContent = (
        <SimpleCodeBlock code={JSON.stringify(output, null, 2)} language="json" />
      );
    } else if (typeof output === 'string') {
      OutputContent = <SimpleCodeBlock code={output} language="json" />;
    }

    return (
      <div ref={ref} className={cn('space-y-2 p-4 border-t', className)} {...props}>
        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {errorText ? 'Error' : 'Result'}
        </h4>
        <div
          className={cn(
            'overflow-x-auto rounded-md text-xs [&_table]:w-full',
            errorText
              ? 'bg-destructive/10 text-destructive p-3'
              : 'bg-muted/50 text-foreground'
          )}
        >
          {errorText && (
            <div className="space-y-2">
              <div className="font-medium">{errorText}</div>
              {errorDetails && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Show details
                  </summary>
                  <SimpleCodeBlock 
                    code={JSON.stringify(errorDetails, null, 2)} 
                    language="json" 
                  />
                </details>
              )}
            </div>
          )}
          {!errorText && OutputContent}
        </div>
      </div>
    );
  }
);

/**
 * Tool retry action (VITAL-specific)
 */
export const VitalToolRetry = ({
  className,
  onRetry,
  disabled,
  ...props
}: ComponentProps<'button'> & {
  onRetry?: () => void;
}) => (
  <button
    type="button"
    onClick={onRetry}
    disabled={disabled}
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
      'rounded-md border bg-background hover:bg-muted',
      'transition-colors disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RefreshCw className="size-3" />
    Retry
  </button>
);

// ============================================================================
// Display Names
// ============================================================================

VitalTool.displayName = 'VitalTool';
VitalToolHeader.displayName = 'VitalToolHeader';
VitalToolContent.displayName = 'VitalToolContent';
VitalToolInput.displayName = 'VitalToolInput';
VitalToolOutput.displayName = 'VitalToolOutput';
VitalToolRetry.displayName = 'VitalToolRetry';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const Tool = VitalTool;
export const ToolHeader = VitalToolHeader;
export const ToolContent = VitalToolContent;
export const ToolInput = VitalToolInput;
export const ToolOutput = VitalToolOutput;
export const ToolRetry = VitalToolRetry;

export default VitalTool;
