'use client';

import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import {
  FileText,
  X,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export interface HighlightedSection {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  type: 'exact' | 'paraphrase' | 'inferred';
  confidence: number;
}

export interface SourceDocument {
  id: string;
  title: string;
  content: string;
  url?: string;
  author?: string;
  date?: string;
  type: string;
}

export interface VitalRedPenPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback to close panel */
  onClose: () => void;
  /** Source document being verified */
  source: SourceDocument | null;
  /** AI-cited text sections highlighted in the source */
  highlights: HighlightedSection[];
  /** The AI's claim/statement being verified */
  aiClaim?: string;
  /** Overall confidence score (0-100) */
  confidenceScore: number;
  /** Whether verification is in progress */
  isVerifying?: boolean;
  /** Callback to re-run retrieval verification */
  onVerify?: () => void;
  /** Callback when navigation between highlights */
  onNavigateHighlight?: (highlightId: string) => void;
  /** Custom class name */
  className?: string;
}

/**
 * VitalRedPenPanel - Evidence Chain Verification
 * 
 * Side-panel displaying the original source document with AI-cited text
 * highlighted in yellow/red. Features "Verify" button to re-run retrieval.
 * 
 * Uses color coding:
 * - Yellow: Exact match found
 * - Orange: Paraphrased content
 * - Red: Inferred/uncertain
 * 
 * @example
 * ```tsx
 * <VitalRedPenPanel
 *   isOpen={isPanelOpen}
 *   onClose={() => setPanelOpen(false)}
 *   source={selectedSource}
 *   highlights={citedSections}
 *   confidenceScore={87}
 *   onVerify={() => reVerifySource()}
 * />
 * ```
 */
export function VitalRedPenPanel({
  isOpen,
  onClose,
  source,
  highlights,
  aiClaim,
  confidenceScore,
  isVerifying = false,
  onVerify,
  onNavigateHighlight,
  className,
}: VitalRedPenPanelProps) {
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const navigateHighlight = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? Math.min(currentHighlightIndex + 1, highlights.length - 1)
      : Math.max(currentHighlightIndex - 1, 0);
    setCurrentHighlightIndex(newIndex);
    if (highlights[newIndex]) {
      onNavigateHighlight?.(highlights[newIndex].id);
    }
  }, [currentHighlightIndex, highlights, onNavigateHighlight]);

  const getHighlightColor = (type: HighlightedSection['type']) => {
    switch (type) {
      case 'exact':
        return 'bg-yellow-200 dark:bg-yellow-900/50';
      case 'paraphrase':
        return 'bg-orange-200 dark:bg-orange-900/50';
      case 'inferred':
        return 'bg-red-200 dark:bg-red-900/50';
    }
  };

  const getConfidenceStatus = () => {
    if (confidenceScore >= 80) return { icon: CheckCircle, color: 'text-green-500', label: 'High Confidence' };
    if (confidenceScore >= 60) return { icon: Shield, color: 'text-amber-500', label: 'Medium Confidence' };
    return { icon: AlertTriangle, color: 'text-red-500', label: 'Low Confidence' };
  };

  const status = getConfidenceStatus();
  const StatusIcon = status.icon;

  // Render content with highlights
  const renderHighlightedContent = () => {
    if (!source) return null;
    
    let content = source.content;
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    // Sort highlights by start index
    const sortedHighlights = [...highlights].sort((a, b) => a.startIndex - b.startIndex);

    sortedHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {content.slice(lastIndex, highlight.startIndex)}
          </span>
        );
      }

      // Add highlighted text
      parts.push(
        <mark
          key={`highlight-${highlight.id}`}
          id={`highlight-${highlight.id}`}
          className={cn(
            'px-0.5 rounded cursor-pointer transition-all',
            getHighlightColor(highlight.type),
            currentHighlightIndex === idx && 'ring-2 ring-primary ring-offset-1'
          )}
          onClick={() => {
            setCurrentHighlightIndex(idx);
            onNavigateHighlight?.(highlight.id);
          }}
        >
          {highlight.text}
          <sup className="ml-0.5 text-xs font-medium text-muted-foreground">
            [{idx + 1}]
          </sup>
        </mark>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">{content.slice(lastIndex)}</span>
      );
    }

    return parts;
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-[450px] z-50',
        'bg-background border-l shadow-xl',
        'flex flex-col',
        'animate-in slide-in-from-right duration-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Highlighter className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold">Evidence Verification</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Source Info */}
      {source && (
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{source.title}</h3>
              {(source.author || source.date) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {source.author}
                  {source.author && source.date && ' • '}
                  {source.date}
                </p>
              )}
              <Badge variant="outline" className="mt-2 text-xs">
                {source.type}
              </Badge>
            </div>
            {source.url && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={() => window.open(source.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-4 w-4', status.color)} />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
          <span className="text-2xl font-bold">{confidenceScore}%</span>
        </div>
        <Progress value={confidenceScore} className="h-2" />
        
        {/* Verify Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={onVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-verify Source
            </>
          )}
        </Button>
      </div>

      {/* AI Claim */}
      {aiClaim && (
        <div className="p-4 border-b bg-blue-50 dark:bg-blue-950/30">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
            AI Statement Being Verified
          </p>
          <p className="text-sm italic">"{aiClaim}"</p>
        </div>
      )}

      {/* Highlight Navigation */}
      {highlights.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {highlights.length} citation{highlights.length !== 1 ? 's' : ''} found
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateHighlight('prev')}
              disabled={currentHighlightIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2">
              {currentHighlightIndex + 1} / {highlights.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateHighlight('next')}
              disabled={currentHighlightIndex === highlights.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Source Content with Highlights */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">
              {renderHighlightedContent()}
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-900/50" />
            <span>Exact match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-900/50" />
            <span>Paraphrased</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-200 dark:bg-red-900/50" />
            <span>Inferred</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitalRedPenPanel;
