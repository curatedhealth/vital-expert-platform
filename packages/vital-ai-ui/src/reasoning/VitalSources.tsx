'use client';

/**
 * VitalSources - VITAL Platform Fusion Intelligence Source Display
 * 
 * A comprehensive component for displaying sources from VITAL's Triple Retrieval
 * system (Vector + Graph + Relational) with Reciprocal Rank Fusion (RRF) scoring.
 * 
 * ## Fusion Intelligence Integration:
 * - **Vector Search**: Semantic similarity from embeddings (Pinecone/Supabase pgvector)
 * - **Graph Search**: Relationship-based retrieval (Neo4j/GraphRAG)
 * - **Relational Search**: Structured data queries (Supabase/PostgreSQL)
 * - **RRF Scoring**: Normalized confidence scores (0-100 scale)
 * 
 * ## VITAL-Specific Features:
 * - **Retriever Type**: Visual indicators for Vector/Graph/Relational sources
 * - **RRF Scores**: Normalized confidence display (0-100)
 * - **Raw Scores**: Optional display of pre-normalized RRF scores
 * - **Source Categories**: Medical literature, drug databases, clinical data
 * - **Verification Status**: Trusted/Unverified source indicators
 * - **L5 Tool Attribution**: Which tool retrieved each source
 * 
 * @example Basic Fusion Sources Display
 * ```tsx
 * <VitalSources defaultOpen>
 *   <VitalSourcesTrigger count={5} fusionBreakdown={{ vector: 2, graph: 2, relational: 1 }} />
 *   <VitalSourcesContent>
 *     <VitalSource 
 *       href="https://pubmed.ncbi.nlm.nih.gov/12345"
 *       title="Drug Interaction Study 2024"
 *       retrieverType="vector"
 *       confidence={95}
 *       rawScore={0.0325}
 *       category="Medical Literature"
 *       tool="pubmed_search"
 *       verified
 *     />
 *     <VitalSource 
 *       href="https://drugbank.com/DB00123"
 *       title="Metformin Drug Profile"
 *       retrieverType="graph"
 *       confidence={87}
 *       rawScore={0.0298}
 *       category="Drug Database"
 *       tool="drugbank_lookup"
 *       verified
 *     />
 *   </VitalSourcesContent>
 * </VitalSources>
 * ```
 * 
 * @example With RRF Explanation
 * ```tsx
 * <VitalSources>
 *   <VitalSourcesTrigger count={8} />
 *   <VitalSourcesContent>
 *     <VitalSourcesRRFExplanation
 *       retrievers={['vector', 'graph', 'relational']}
 *       fusionMethod="RRF"
 *       k={60}
 *     />
 *     {sources.map(source => (
 *       <VitalSource key={source.id} {...source} />
 *     ))}
 *   </VitalSourcesContent>
 * </VitalSources>
 * ```
 */

import { cn } from '../lib/utils';
import { 
  BookIcon, 
  CheckCircle, 
  ChevronDownIcon, 
  Database, 
  FileSearch, 
  Globe, 
  Network, 
  Shield, 
  Table2 
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useState } from 'react';

// ============================================================================
// VITAL Types - Fusion Intelligence
// ============================================================================

/** Retriever type in Triple Retrieval */
export type RetrieverType = 'vector' | 'graph' | 'relational' | 'web' | 'hybrid';

/** Source category */
export type SourceCategory = 
  | 'Medical Literature'
  | 'Drug Database'
  | 'Clinical Data'
  | 'Regulatory'
  | 'Guidelines'
  | 'Knowledge Base'
  | 'Web'
  | 'Internal';

/** Fusion breakdown by retriever */
export interface FusionBreakdown {
  vector?: number;
  graph?: number;
  relational?: number;
  web?: number;
}

// ============================================================================
// Component Props
// ============================================================================

export type VitalSourcesProps = ComponentProps<'div'> & {
  /** Default open state */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Langfuse trace ID (VITAL-specific) */
  traceId?: string;
};

export type VitalSourcesTriggerProps = ComponentProps<'button'> & {
  /** The number of sources to display in the trigger */
  count: number;
  /** Breakdown by retriever type (VITAL-specific) */
  fusionBreakdown?: FusionBreakdown;
  /** Average confidence score (VITAL-specific) */
  avgConfidence?: number;
};

export type VitalSourcesContentProps = ComponentProps<'div'>;

export type VitalSourceProps = ComponentProps<'a'> & {
  /** URL of the source */
  href?: string;
  /** Title of the source */
  title?: string;
  /** Retriever type (VITAL-specific) */
  retrieverType?: RetrieverType;
  /** Normalized confidence score 0-100 (VITAL-specific) */
  confidence?: number;
  /** Raw RRF score (VITAL-specific) */
  rawScore?: number;
  /** Source category (VITAL-specific) */
  category?: SourceCategory;
  /** L5 Tool that retrieved this source (VITAL-specific) */
  tool?: string;
  /** Whether source is verified/trusted (VITAL-specific) */
  verified?: boolean;
  /** Snippet/excerpt from the source (VITAL-specific) */
  snippet?: string;
};

export type VitalSourcesRRFExplanationProps = ComponentProps<'div'> & {
  /** Retrievers used in fusion */
  retrievers: RetrieverType[];
  /** Fusion method name */
  fusionMethod?: string;
  /** RRF k parameter */
  k?: number;
};

// ============================================================================
// Utility Constants
// ============================================================================

const retrieverIcons: Record<RetrieverType, ReactNode> = {
  vector: <FileSearch className="size-3.5 text-blue-500" />,
  graph: <Network className="size-3.5 text-purple-500" />,
  relational: <Table2 className="size-3.5 text-green-500" />,
  web: <Globe className="size-3.5 text-orange-500" />,
  hybrid: <Database className="size-3.5 text-cyan-500" />,
};

const retrieverColors: Record<RetrieverType, string> = {
  vector: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  graph: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  relational: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  web: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  hybrid: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

const retrieverLabels: Record<RetrieverType, string> = {
  vector: 'Vector',
  graph: 'Graph',
  relational: 'SQL',
  web: 'Web',
  hybrid: 'Hybrid',
};

const categoryIcons: Record<SourceCategory, ReactNode> = {
  'Medical Literature': <BookIcon className="size-3.5" />,
  'Drug Database': <Database className="size-3.5" />,
  'Clinical Data': <FileSearch className="size-3.5" />,
  'Regulatory': <Shield className="size-3.5" />,
  'Guidelines': <BookIcon className="size-3.5" />,
  'Knowledge Base': <Database className="size-3.5" />,
  'Web': <Globe className="size-3.5" />,
  'Internal': <Table2 className="size-3.5" />,
};

// ============================================================================
// Context
// ============================================================================

interface SourcesContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const SourcesContext = createContext<SourcesContextValue | null>(null);

const useSourcesContext = () => {
  const context = useContext(SourcesContext);
  if (!context) {
    throw new Error('Sources components must be used within VitalSources');
  }
  return context;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root sources container
 */
export const VitalSources = forwardRef<HTMLDivElement, VitalSourcesProps>(
  (
    {
      className,
      defaultOpen = false,
      open: controlledOpen,
      onOpenChange,
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
      <SourcesContext.Provider value={{ isOpen, toggle }}>
        <div
          ref={ref}
          data-state={isOpen ? 'open' : 'closed'}
          data-trace-id={traceId}
          className={cn('not-prose mb-4 text-primary text-xs', className)}
          {...props}
        >
          {children}
        </div>
      </SourcesContext.Provider>
    );
  }
);

/**
 * Sources trigger button with fusion breakdown
 */
export const VitalSourcesTrigger = forwardRef<HTMLButtonElement, VitalSourcesTriggerProps>(
  ({ className, count, fusionBreakdown, avgConfidence, children, ...props }, ref) => {
    const { isOpen, toggle } = useSourcesContext();

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className={cn(
          'flex items-center gap-2 text-sm',
          'transition-colors hover:text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded',
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <span className="font-medium">Used {count} sources</span>
            
            {/* Fusion breakdown badges */}
            {fusionBreakdown && (
              <span className="flex items-center gap-1">
                {fusionBreakdown.vector && (
                  <span className={cn('px-1.5 py-0.5 rounded text-xs', retrieverColors.vector)}>
                    {retrieverIcons.vector} {fusionBreakdown.vector}
                  </span>
                )}
                {fusionBreakdown.graph && (
                  <span className={cn('px-1.5 py-0.5 rounded text-xs', retrieverColors.graph)}>
                    {retrieverIcons.graph} {fusionBreakdown.graph}
                  </span>
                )}
                {fusionBreakdown.relational && (
                  <span className={cn('px-1.5 py-0.5 rounded text-xs', retrieverColors.relational)}>
                    {retrieverIcons.relational} {fusionBreakdown.relational}
                  </span>
                )}
                {fusionBreakdown.web && (
                  <span className={cn('px-1.5 py-0.5 rounded text-xs', retrieverColors.web)}>
                    {retrieverIcons.web} {fusionBreakdown.web}
                  </span>
                )}
              </span>
            )}
            
            {/* Average confidence */}
            {avgConfidence !== undefined && (
              <span className="text-xs text-muted-foreground">
                Avg: {avgConfidence}%
              </span>
            )}
            
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </button>
    );
  }
);

/**
 * Sources content container
 */
export const VitalSourcesContent = forwardRef<HTMLDivElement, VitalSourcesContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useSourcesContext();

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'mt-3 flex w-full flex-col gap-2',
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
 * RRF Fusion explanation component (VITAL-specific)
 */
export const VitalSourcesRRFExplanation = forwardRef<HTMLDivElement, VitalSourcesRRFExplanationProps>(
  ({ className, retrievers, fusionMethod = 'RRF', k = 60, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'p-3 rounded-lg bg-muted/50 border text-xs space-y-2 mb-3',
        className
      )}
      {...props}
    >
      <div className="font-medium text-foreground">
        {fusionMethod} Fusion (k={k})
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted-foreground">Retrievers:</span>
        {retrievers.map((type) => (
          <span 
            key={type}
            className={cn('px-2 py-0.5 rounded flex items-center gap-1', retrieverColors[type])}
          >
            {retrieverIcons[type]}
            {retrieverLabels[type]}
          </span>
        ))}
      </div>
      <div className="text-muted-foreground text-xs">
        Scores normalized to 0-100 scale using theoretical maximum.
      </div>
    </div>
  )
);

/**
 * Individual source with VITAL metadata
 */
export const VitalSource = forwardRef<HTMLAnchorElement, VitalSourceProps>(
  ({ 
    href, 
    title, 
    retrieverType,
    confidence,
    rawScore,
    category,
    tool,
    verified,
    snippet,
    children, 
    className, 
    ...props 
  }, ref) => (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex flex-col gap-1 p-3 rounded-lg border bg-card',
        'text-foreground hover:bg-muted/50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Retriever type badge */}
              {retrieverType && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-xs flex items-center gap-1 shrink-0',
                  retrieverColors[retrieverType]
                )}>
                  {retrieverIcons[retrieverType]}
                  {retrieverLabels[retrieverType]}
                </span>
              )}
              
              {/* Category icon */}
              {category && !retrieverType && (
                <span className="text-muted-foreground shrink-0">
                  {categoryIcons[category]}
                </span>
              )}
              
              {/* Title */}
              <span className="font-medium truncate">{title}</span>
              
              {/* Verified badge */}
              {verified && (
                <CheckCircle className="size-3.5 text-green-500 shrink-0" />
              )}
            </div>
            
            {/* Confidence score */}
            {confidence !== undefined && (
              <div className="text-right shrink-0">
                <span className={cn(
                  'font-semibold text-sm',
                  confidence >= 80 && 'text-green-600',
                  confidence >= 50 && confidence < 80 && 'text-amber-600',
                  confidence < 50 && 'text-red-600',
                )}>
                  {confidence}%
                </span>
                {rawScore !== undefined && (
                  <span className="block text-xs text-muted-foreground">
                    raw: {rawScore.toFixed(4)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Metadata row */}
          {(category || tool) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {category && <span>{category}</span>}
              {category && tool && <span>•</span>}
              {tool && <span>via {tool}</span>}
            </div>
          )}
          
          {/* Snippet */}
          {snippet && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {snippet}
            </p>
          )}
        </>
      )}
    </a>
  )
);

// ============================================================================
// Display Names
// ============================================================================

VitalSources.displayName = 'VitalSources';
VitalSourcesTrigger.displayName = 'VitalSourcesTrigger';
VitalSourcesContent.displayName = 'VitalSourcesContent';
VitalSourcesRRFExplanation.displayName = 'VitalSourcesRRFExplanation';
VitalSource.displayName = 'VitalSource';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const Sources = VitalSources;
export const SourcesTrigger = VitalSourcesTrigger;
export const SourcesContent = VitalSourcesContent;
export const SourcesRRFExplanation = VitalSourcesRRFExplanation;
export const Source = VitalSource;

// Export VITAL utilities
export { retrieverIcons, retrieverColors, retrieverLabels, categoryIcons };

export default VitalSources;
