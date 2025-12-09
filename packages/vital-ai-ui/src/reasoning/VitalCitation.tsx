'use client';

/**
 * VitalCitation - VITAL Platform Inline Citation with RRF Confidence
 * 
 * Interactive citation display component for VITAL's Fusion Intelligence system.
 * Shows inline numbered badges with popover details including RRF scores,
 * retriever type, and full citation metadata.
 * 
 * ## Fusion Intelligence Integration:
 * - **Retriever Type**: Visual indicator for Vector/Graph/Relational source
 * - **RRF Confidence**: Normalized score display (0-100)
 * - **Raw RRF Score**: Pre-normalized fusion score
 * - **Source Verification**: Trusted/verified badge
 * - **L5 Tool Attribution**: Which tool retrieved the citation
 * 
 * ## Source Types:
 * - Medical Literature: PubMed, Cochrane, Google Scholar
 * - Drug Databases: DrugBank, RxNorm, WHO ATC
 * - Clinical Data: ClinicalTrials.gov, OpenFDA FAERS
 * - Regulatory: FDA, EMA
 * - Internal: RAG, Knowledge Base
 * 
 * @example Inline Citation with RRF
 * ```tsx
 * <p>
 *   Drug interactions were analyzed 
 *   <VitalCitation 
 *     citation={{
 *       id: 'cit-1',
 *       index: 1,
 *       title: 'Metformin-Warfarin Interaction Study',
 *       source: 'pubmed',
 *       url: 'https://pubmed.ncbi.nlm.nih.gov/12345',
 *       excerpt: 'Co-administration showed significant...',
 *       confidence: 95,
 *       rawRRFScore: 0.0325,
 *       retrieverType: 'vector',
 *       tool: 'pubmed_search',
 *       verified: true,
 *       metadata: {
 *         authors: ['Smith J', 'Jones M'],
 *         journal: 'NEJM',
 *         year: 2024,
 *         pmid: '12345678'
 *       }
 *     }}
 *   />
 *   in multiple clinical settings.
 * </p>
 * ```
 */

import { cn } from '../lib/utils';
import { 
  Beaker, 
  Book, 
  CheckCircle, 
  Database, 
  ExternalLink, 
  FileSearch, 
  FileText, 
  Globe, 
  Network, 
  Scale, 
  Shield,
  Table2 
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { forwardRef, useState } from 'react';

// ============================================================================
// VITAL Types - Fusion Intelligence
// ============================================================================

/** Retriever type in Triple Retrieval */
export type RetrieverType = 'vector' | 'graph' | 'relational' | 'web' | 'hybrid';

/** Source type for citations */
export type SourceType = 
  | 'pubmed' 
  | 'fda' 
  | 'ema'
  | 'clinical_trial' 
  | 'web' 
  | 'document' 
  | 'rag' 
  | 'cochrane' 
  | 'drugbank'
  | 'rxnorm'
  | 'who_atc'
  | 'openfda'
  | 'arxiv'
  | 'google_scholar';

/** Citation metadata */
export interface CitationMetadata {
  authors?: string[];
  journal?: string;
  year?: number;
  pmid?: string;
  nctId?: string;
  doi?: string;
  drugbankId?: string;
  arxivId?: string;
}

/** Full citation object */
export interface Citation {
  id: string;
  index: number;
  title: string;
  source: SourceType;
  url?: string;
  excerpt: string;
  /** Normalized confidence 0-100 (VITAL RRF) */
  confidence: number;
  /** Raw RRF score before normalization (VITAL-specific) */
  rawRRFScore?: number;
  /** Retriever type (VITAL-specific) */
  retrieverType?: RetrieverType;
  /** L5 Tool that retrieved this (VITAL-specific) */
  tool?: string;
  /** Whether source is verified (VITAL-specific) */
  verified?: boolean;
  metadata?: CitationMetadata;
}

// ============================================================================
// Component Props
// ============================================================================

export interface VitalCitationProps {
  citation: Citation;
  variant?: 'inline' | 'card';
  className?: string;
  /** Show retriever badge (VITAL-specific) */
  showRetriever?: boolean;
  /** Show raw RRF score (VITAL-specific) */
  showRawScore?: boolean;
}

export interface CitationListProps {
  citations: Citation[];
  className?: string;
  /** Group by retriever type (VITAL-specific) */
  groupByRetriever?: boolean;
}

// ============================================================================
// Utility Constants
// ============================================================================

const sourceIcons: Record<SourceType, React.ComponentType<{ className?: string }>> = {
  pubmed: Book,
  fda: Scale,
  ema: Shield,
  clinical_trial: Beaker,
  web: Globe,
  document: FileText,
  rag: Database,
  cochrane: Book,
  drugbank: Database,
  rxnorm: Database,
  who_atc: Shield,
  openfda: Scale,
  arxiv: FileText,
  google_scholar: Book,
};

const sourceLabels: Record<SourceType, string> = {
  pubmed: 'PubMed',
  fda: 'FDA',
  ema: 'EMA',
  clinical_trial: 'ClinicalTrials.gov',
  web: 'Web',
  document: 'Document',
  rag: 'Knowledge Base',
  cochrane: 'Cochrane',
  drugbank: 'DrugBank',
  rxnorm: 'RxNorm',
  who_atc: 'WHO ATC',
  openfda: 'OpenFDA',
  arxiv: 'arXiv',
  google_scholar: 'Google Scholar',
};

const sourceColors: Record<SourceType, { bg: string; text: string; border: string }> = {
  pubmed: { 
    bg: 'bg-blue-50 dark:bg-blue-950', 
    text: 'text-blue-700 dark:text-blue-300', 
    border: 'border-blue-200 dark:border-blue-800' 
  },
  fda: { 
    bg: 'bg-green-50 dark:bg-green-950', 
    text: 'text-green-700 dark:text-green-300', 
    border: 'border-green-200 dark:border-green-800' 
  },
  ema: { 
    bg: 'bg-emerald-50 dark:bg-emerald-950', 
    text: 'text-emerald-700 dark:text-emerald-300', 
    border: 'border-emerald-200 dark:border-emerald-800' 
  },
  clinical_trial: { 
    bg: 'bg-purple-50 dark:bg-purple-950', 
    text: 'text-purple-700 dark:text-purple-300', 
    border: 'border-purple-200 dark:border-purple-800' 
  },
  web: { 
    bg: 'bg-orange-50 dark:bg-orange-950', 
    text: 'text-orange-700 dark:text-orange-300', 
    border: 'border-orange-200 dark:border-orange-800' 
  },
  document: { 
    bg: 'bg-slate-50 dark:bg-slate-900', 
    text: 'text-slate-700 dark:text-slate-300', 
    border: 'border-slate-200 dark:border-slate-700' 
  },
  rag: { 
    bg: 'bg-cyan-50 dark:bg-cyan-950', 
    text: 'text-cyan-700 dark:text-cyan-300', 
    border: 'border-cyan-200 dark:border-cyan-800' 
  },
  cochrane: { 
    bg: 'bg-amber-50 dark:bg-amber-950', 
    text: 'text-amber-700 dark:text-amber-300', 
    border: 'border-amber-200 dark:border-amber-800' 
  },
  drugbank: { 
    bg: 'bg-pink-50 dark:bg-pink-950', 
    text: 'text-pink-700 dark:text-pink-300', 
    border: 'border-pink-200 dark:border-pink-800' 
  },
  rxnorm: { 
    bg: 'bg-indigo-50 dark:bg-indigo-950', 
    text: 'text-indigo-700 dark:text-indigo-300', 
    border: 'border-indigo-200 dark:border-indigo-800' 
  },
  who_atc: { 
    bg: 'bg-teal-50 dark:bg-teal-950', 
    text: 'text-teal-700 dark:text-teal-300', 
    border: 'border-teal-200 dark:border-teal-800' 
  },
  openfda: { 
    bg: 'bg-lime-50 dark:bg-lime-950', 
    text: 'text-lime-700 dark:text-lime-300', 
    border: 'border-lime-200 dark:border-lime-800' 
  },
  arxiv: { 
    bg: 'bg-red-50 dark:bg-red-950', 
    text: 'text-red-700 dark:text-red-300', 
    border: 'border-red-200 dark:border-red-800' 
  },
  google_scholar: { 
    bg: 'bg-blue-50 dark:bg-blue-950', 
    text: 'text-blue-700 dark:text-blue-300', 
    border: 'border-blue-200 dark:border-blue-800' 
  },
};

const retrieverIcons: Record<RetrieverType, ReactNode> = {
  vector: <FileSearch className="size-3 text-blue-500" />,
  graph: <Network className="size-3 text-purple-500" />,
  relational: <Table2 className="size-3 text-green-500" />,
  web: <Globe className="size-3 text-orange-500" />,
  hybrid: <Database className="size-3 text-cyan-500" />,
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

// ============================================================================
// Components
// ============================================================================

/**
 * VitalCitation - Interactive citation display component
 * 
 * Supports inline numbered badges with popover details,
 * or full card display with source preview.
 */
export function VitalCitation({
  citation,
  variant = 'inline',
  showRetriever = true,
  showRawScore = false,
  className
}: VitalCitationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = sourceColors[citation.source] || sourceColors.document;
  
  if (variant === 'inline') {
    return (
      <span className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className={cn(
            "inline-flex items-center justify-center",
            "h-5 min-w-5 px-1.5 rounded text-xs font-medium",
            "cursor-pointer transition-all hover:scale-105",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            colors.bg, colors.text,
            className
          )}
          aria-label={`Citation ${citation.index}: ${citation.title}`}
        >
          {citation.index}
          {citation.verified && (
            <CheckCircle className="size-2.5 ml-0.5 text-green-500" />
          )}
        </button>
        
        {/* Popover */}
        {isOpen && (
          <div className="absolute z-50 w-80 mt-1 left-0 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="rounded-lg border bg-popover p-0 shadow-md">
              <CitationDetail 
                citation={citation} 
                showRetriever={showRetriever}
                showRawScore={showRawScore}
              />
            </div>
          </div>
        )}
      </span>
    );
  }
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      colors.border,
      className
    )}>
      <CitationDetail 
        citation={citation} 
        showRetriever={showRetriever}
        showRawScore={showRawScore}
      />
    </div>
  );
}

/**
 * CitationDetail - Full citation details display with VITAL metadata
 */
function CitationDetail({ 
  citation,
  showRetriever = true,
  showRawScore = false,
}: { 
  citation: Citation;
  showRetriever?: boolean;
  showRawScore?: boolean;
}) {
  const Icon = sourceIcons[citation.source] || FileText;
  const colors = sourceColors[citation.source] || sourceColors.document;
  const label = sourceLabels[citation.source] || 'Source';
  
  // Confidence color based on score
  const confidenceColor = citation.confidence >= 80 
    ? 'text-green-600' 
    : citation.confidence >= 50 
      ? 'text-amber-600' 
      : 'text-red-600';

  const progressColor = citation.confidence >= 80 
    ? 'bg-green-500' 
    : citation.confidence >= 50 
      ? 'bg-amber-500' 
      : 'bg-red-500';
  
  return (
    <div className="space-y-3 p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded shrink-0", colors.bg)}>
          <Icon className={cn("h-4 w-4", colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Source badge */}
            <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", colors.bg, colors.text)}>
              {label}
            </span>
            
            {/* Retriever badge (VITAL) */}
            {showRetriever && citation.retrieverType && (
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1",
                retrieverColors[citation.retrieverType]
              )}>
                {retrieverIcons[citation.retrieverType]}
                {retrieverLabels[citation.retrieverType]}
              </span>
            )}
            
            {/* Verified badge */}
            {citation.verified && (
              <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
                <CheckCircle className="size-3" />
                Verified
              </span>
            )}
            
            {/* IDs */}
            {citation.metadata?.pmid && (
              <span className="text-xs text-muted-foreground">
                PMID: {citation.metadata.pmid}
              </span>
            )}
            {citation.metadata?.nctId && (
              <span className="text-xs text-muted-foreground">
                {citation.metadata.nctId}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium line-clamp-2">
            {citation.title}
          </h4>
        </div>
      </div>
      
      {/* Authors & Journal */}
      {citation.metadata?.authors && citation.metadata.authors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {citation.metadata.authors.slice(0, 3).join(', ')}
          {citation.metadata.authors.length > 3 && ' et al.'}
          {citation.metadata.journal && (
            <>
              {' · '}
              <span className="italic">{citation.metadata.journal}</span>
            </>
          )}
          {citation.metadata.year && ` (${citation.metadata.year})`}
        </p>
      )}
      
      {/* Tool attribution (VITAL) */}
      {citation.tool && (
        <p className="text-xs text-muted-foreground">
          Retrieved via <span className="font-mono text-xs">{citation.tool}</span>
        </p>
      )}
      
      {/* Excerpt */}
      <div className="bg-muted/50 rounded p-2">
        <p className="text-sm text-muted-foreground line-clamp-3 italic">
          "{citation.excerpt}"
        </p>
      </div>
      
      {/* Footer with confidence */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground">RRF Confidence:</span>
          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", progressColor)}
              style={{ width: `${citation.confidence}%` }}
            />
          </div>
          <span className={cn("text-xs font-semibold", confidenceColor)}>
            {Math.round(citation.confidence)}%
          </span>
        </div>
        
        {/* Raw RRF score (VITAL) */}
        {showRawScore && citation.rawRRFScore !== undefined && (
          <span className="text-xs text-muted-foreground font-mono">
            raw: {citation.rawRRFScore.toFixed(4)}
          </span>
        )}
        
        {citation.url && (
          <a 
            href={citation.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1 h-7 px-2 rounded text-xs font-medium",
              "hover:bg-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * CitationList - Grid of citation cards with optional grouping
 */
export function CitationList({ 
  citations, 
  groupByRetriever = false,
  className 
}: CitationListProps) {
  if (groupByRetriever) {
    // Group citations by retriever type
    const grouped = citations.reduce((acc, citation) => {
      const type = citation.retrieverType || 'hybrid';
      if (!acc[type]) acc[type] = [];
      acc[type].push(citation);
      return acc;
    }, {} as Record<RetrieverType, Citation[]>);

    return (
      <div className={cn("space-y-4", className)}>
        <h4 className="text-sm font-medium">Sources ({citations.length})</h4>
        {Object.entries(grouped).map(([type, typeCitations]) => (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1",
                retrieverColors[type as RetrieverType]
              )}>
                {retrieverIcons[type as RetrieverType]}
                {retrieverLabels[type as RetrieverType]} ({typeCitations.length})
              </span>
            </div>
            <div className="grid gap-2 pl-2">
              {typeCitations.map((citation) => (
                <VitalCitation 
                  key={citation.id} 
                  citation={citation} 
                  variant="card" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium">Sources ({citations.length})</h4>
      <div className="grid gap-2">
        {citations.map((citation) => (
          <VitalCitation 
            key={citation.id} 
            citation={citation} 
            variant="card" 
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Display Names
// ============================================================================

VitalCitation.displayName = 'VitalCitation';
CitationList.displayName = 'CitationList';

// ============================================================================
// Aliases
// ============================================================================

export const Citation = VitalCitation;
export const InlineCitation = VitalCitation;

// Export VITAL utilities
export { 
  sourceIcons, 
  sourceLabels, 
  sourceColors, 
  retrieverIcons, 
  retrieverColors, 
  retrieverLabels 
};

export default VitalCitation;
