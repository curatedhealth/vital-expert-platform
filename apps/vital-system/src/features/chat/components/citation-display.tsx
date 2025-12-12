'use client';

/**
 * Citation Display component stub
 * TODO: Implement full citation display when needed
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

export interface Citation {
  id: string;
  title: string;
  authors?: string[];
  source?: string;
  url?: string;
  year?: number;
  relevance?: number;
}

export interface CitationDisplayProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
  className?: string;
}

export function CitationDisplay({
  citations,
  onCitationClick,
  className,
}: CitationDisplayProps) {
  if (citations.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">No citations available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      {citations.map((citation) => (
        <Card
          key={citation.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onCitationClick?.(citation)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium line-clamp-2">
                {citation.title}
              </CardTitle>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {citation.authors && citation.authors.length > 0 && (
              <p className="text-xs text-muted-foreground mb-1">
                {citation.authors.slice(0, 3).join(', ')}
                {citation.authors.length > 3 && ' et al.'}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {citation.source && (
                <Badge variant="secondary" className="text-xs">
                  {citation.source}
                </Badge>
              )}
              {citation.year && (
                <Badge variant="outline" className="text-xs">
                  {citation.year}
                </Badge>
              )}
              {citation.relevance !== undefined && (
                <Badge
                  variant={citation.relevance > 0.8 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {Math.round(citation.relevance * 100)}% relevant
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CitationDisplay;
