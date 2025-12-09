'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  ExternalLink,
  FileText,
  Book,
  Globe,
  Database,
  X,
  Maximize2,
  Copy,
  Check,
  Calendar,
  User,
  Building,
  Tag,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui/tooltip';
import { Separator } from '../../ui/separator';

type SourceType =
  | 'pubmed'
  | 'fda'
  | 'ema'
  | 'clinical_trial'
  | 'web'
  | 'document'
  | 'rag'
  | 'arxiv'
  | 'who';

interface SourceMetadata {
  title: string;
  authors?: string[];
  journal?: string;
  year?: number;
  pmid?: string;
  nctId?: string;
  doi?: string;
  organization?: string;
  documentType?: string;
  keywords?: string[];
  abstract?: string;
}

interface VitalSourcePreviewProps {
  id: string;
  type: SourceType;
  url?: string;
  excerpt: string;
  fullContent?: string;
  metadata: SourceMetadata;
  confidence: number;
  highlightedTerms?: string[];
  variant?: 'inline' | 'card' | 'modal';
  onClose?: () => void;
  className?: string;
}

const sourceConfig: Record<
  SourceType,
  { icon: typeof FileText; color: string; bgColor: string; label: string }
> = {
  pubmed: {
    icon: Book,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'PubMed',
  },
  fda: {
    icon: Building,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    label: 'FDA',
  },
  ema: {
    icon: Building,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    label: 'EMA',
  },
  clinical_trial: {
    icon: FileText,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200',
    label: 'Clinical Trial',
  },
  web: {
    icon: Globe,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Web',
  },
  document: {
    icon: FileText,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200',
    label: 'Document',
  },
  rag: {
    icon: Database,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    label: 'Knowledge Base',
  },
  arxiv: {
    icon: Book,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: 'arXiv',
  },
  who: {
    icon: Globe,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    label: 'WHO',
  },
};

export function VitalSourcePreview({
  id,
  type,
  url,
  excerpt,
  fullContent,
  metadata,
  confidence,
  highlightedTerms = [],
  variant = 'card',
  onClose,
  className,
}: VitalSourcePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const config = sourceConfig[type];
  const Icon = config.icon;

  const copyContent = async () => {
    const textToCopy = fullContent || excerpt;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightText = (text: string): React.ReactNode => {
    if (highlightedTerms.length === 0) return text;

    const regex = new RegExp(`(${highlightedTerms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      highlightedTerms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'text-green-600 bg-green-50';
    if (conf >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const PreviewContent = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base line-clamp-2">{metadata.title}</h3>
          {metadata.authors && metadata.authors.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <User className="h-3 w-3 inline mr-1" />
              {metadata.authors.slice(0, 3).join(', ')}
              {metadata.authors.length > 3 && ` +${metadata.authors.length - 3} more`}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn('shrink-0', getConfidenceColor(confidence))}
        >
          {Math.round(confidence * 100)}%
        </Badge>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className={cn('text-xs', config.bgColor)}>
          {config.label}
        </Badge>
        {metadata.year && (
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {metadata.year}
          </Badge>
        )}
        {metadata.journal && (
          <Badge variant="outline" className="text-xs">
            {metadata.journal}
          </Badge>
        )}
        {metadata.pmid && (
          <Badge variant="outline" className="text-xs font-mono">
            PMID: {metadata.pmid}
          </Badge>
        )}
        {metadata.nctId && (
          <Badge variant="outline" className="text-xs font-mono">
            {metadata.nctId}
          </Badge>
        )}
        {metadata.doi && (
          <Badge variant="outline" className="text-xs font-mono">
            DOI: {metadata.doi}
          </Badge>
        )}
      </div>

      {/* Keywords */}
      {metadata.keywords && metadata.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {metadata.keywords.slice(0, 5).map((keyword, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              <Tag className="h-2.5 w-2.5 mr-1" />
              {keyword}
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {fullContent ? 'Full Content' : 'Excerpt'}
          </span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyContent}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy text</TooltipContent>
            </Tooltip>
            {fullContent && variant !== 'modal' && (
              <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>{metadata.title}</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh]">
                    <div className="prose prose-sm max-w-none">
                      {highlightText(fullContent)}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div
          className={cn(
            'text-sm text-muted-foreground bg-muted/50 rounded-lg p-3',
            variant === 'modal' ? '' : 'line-clamp-6'
          )}
        >
          {highlightText(fullContent || excerpt)}
        </div>
      </div>

      {/* Abstract (if available) */}
      {metadata.abstract && variant === 'modal' && (
        <>
          <Separator />
          <div className="space-y-2">
            <span className="text-sm font-medium">Abstract</span>
            <p className="text-sm text-muted-foreground">{metadata.abstract}</p>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {url && (
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View source
            </a>
          </Button>
        )}
        {onClose && variant === 'inline' && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-3.5 w-3.5 mr-1.5" />
            Close
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'border rounded-lg p-4 shadow-lg bg-background',
          className
        )}
      >
        <PreviewContent />
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <Dialog open onOpenChange={() => onClose?.()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <PreviewContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn(config.bgColor, className)}>
      <CardContent className="pt-4">
        <PreviewContent />
      </CardContent>
    </Card>
  );
}

// Compact inline trigger for citations
export function VitalSourceTrigger({
  type,
  title,
  confidence,
  onClick,
  className,
}: {
  type: SourceType;
  title: string;
  confidence: number;
  onClick: () => void;
  className?: string;
}) {
  const config = sourceConfig[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded border',
        'text-xs hover:bg-muted/50 transition-colors',
        config.bgColor,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.color)} />
      <span className="truncate max-w-[150px]">{title}</span>
      <span className="text-muted-foreground">{Math.round(confidence * 100)}%</span>
    </button>
  );
}

export type { SourceType, SourceMetadata, VitalSourcePreviewProps };
