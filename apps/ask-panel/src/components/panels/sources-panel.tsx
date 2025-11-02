'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  title: string;
  excerpt?: string;
  similarity?: number;
  domain?: string;
  url?: string;
}

interface SourcesPanelProps {
  sources: Source[];
  className?: string;
}

export function SourcesPanel({ sources, className }: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <Card className={cn("mt-3 border-purple-200 bg-purple-50/50", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left group"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Sources
            </span>
            <Badge variant="secondary" className="text-xs">
              {sources.length} {sources.length === 1 ? 'source' : 'sources'}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
          )}
        </button>

        {/* Sources List */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {sources.map((source, index) => (
              <div
                key={source.id}
                className="p-3 bg-white rounded-lg border border-purple-100"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {source.title}
                    </h4>
                    
                    {source.domain && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {source.domain}
                        </Badge>
                        {source.similarity && (
                          <span className="text-xs text-gray-500">
                            {Math.round(source.similarity * 100)}% relevant
                          </span>
                        )}
                      </div>
                    )}
                    
                    {source.excerpt && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                        {source.excerpt}
                      </p>
                    )}
                    
                    {source.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View source
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

