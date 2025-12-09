'use client';

import { cn } from '@/lib/utils';
import { ExternalLink, FileText, Book, Globe, Database, Beaker, Scale } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type SourceType = 'pubmed' | 'fda' | 'clinical_trial' | 'web' | 'document' | 'rag' | 'cochrane' | 'drugbank';

interface CitationMetadata {
  authors?: string[];
  journal?: string;
  year?: number;
  pmid?: string;
  nctId?: string;
  doi?: string;
}

interface Citation {
  id: string;
  index: number;
  title: string;
  source: SourceType;
  url?: string;
  excerpt: string;
  confidence: number;
  metadata?: CitationMetadata;
}

interface VitalCitationProps {
  citation: Citation;
  variant?: 'inline' | 'card';
  className?: string;
}

const sourceIcons: Record<SourceType, React.ComponentType<{ className?: string }>> = {
  pubmed: Book,
  fda: Scale,
  clinical_trial: Beaker,
  web: Globe,
  document: FileText,
  rag: Database,
  cochrane: Book,
  drugbank: Database,
};

const sourceLabels: Record<SourceType, string> = {
  pubmed: 'PubMed',
  fda: 'FDA',
  clinical_trial: 'ClinicalTrials.gov',
  web: 'Web',
  document: 'Document',
  rag: 'Knowledge Base',
  cochrane: 'Cochrane',
  drugbank: 'DrugBank',
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
};

/**
 * VitalCitation - Interactive citation display component
 * 
 * Supports inline numbered badges with popover details,
 * or full card display with source preview.
 */
export function VitalCitation({
  citation,
  variant = 'inline',
  className
}: VitalCitationProps) {
  const colors = sourceColors[citation.source] || sourceColors.document;
  
  if (variant === 'inline') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center justify-center",
              "h-5 min-w-5 px-1.5 rounded text-xs font-medium",
              "cursor-pointer transition-all hover:scale-105",
              colors.bg, colors.text,
              className
            )}
            aria-label={`Citation ${citation.index}: ${citation.title}`}
          >
            {citation.index}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <CitationDetail citation={citation} />
        </PopoverContent>
      </Popover>
    );
  }
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      colors.border,
      className
    )}>
      <CitationDetail citation={citation} />
    </div>
  );
}

/**
 * CitationDetail - Full citation details display
 */
function CitationDetail({ citation }: { citation: Citation }) {
  const Icon = sourceIcons[citation.source] || FileText;
  const colors = sourceColors[citation.source] || sourceColors.document;
  const label = sourceLabels[citation.source] || 'Source';
  
  const confidenceColor = citation.confidence >= 0.8 
    ? 'bg-green-500' 
    : citation.confidence >= 0.5 
      ? 'bg-yellow-500' 
      : 'bg-red-500';
  
  return (
    <div className="space-y-3 p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded", colors.bg)}>
          <Icon className={cn("h-4 w-4", colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", colors.bg, colors.text)}>
              {label}
            </span>
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
      
      {/* Excerpt */}
      <div className="bg-muted/50 rounded p-2">
        <p className="text-sm text-muted-foreground line-clamp-3 italic">
          "{citation.excerpt}"
        </p>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <Progress 
            value={citation.confidence * 100} 
            className={cn("h-1.5 flex-1", confidenceColor)}
          />
          <span className="text-xs font-medium">
            {Math.round(citation.confidence * 100)}%
          </span>
        </div>
        
        {citation.url && (
          <Button variant="ghost" size="sm" asChild className="h-7">
            <a href={citation.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * CitationList - Grid of citation cards
 */
export function CitationList({ 
  citations, 
  className 
}: { 
  citations: Citation[]; 
  className?: string;
}) {
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

export default VitalCitation;
