'use client';

import { FileText, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface CitationSource {
  id: string;
  title: string;
  category?: string;
  excerpt?: string;
  score?: number;
  url?: string;
}

interface InlineCitationProps {
  sources: CitationSource[];
  citationNumber: number;
  className?: string;
}

export function InlineCitation({ sources, citationNumber, className }: InlineCitationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!sources || sources.length === 0) return null;

  const currentSource = sources[currentIndex];

  return (
    <span className="relative inline-block">
      {/* Citation Badge */}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center",
          "w-5 h-5 text-[10px] font-semibold",
          "bg-trust-blue/10 text-trust-blue",
          "rounded-full border border-trust-blue/30",
          "hover:bg-trust-blue/20 hover:border-trust-blue/50",
          "transition-all duration-200",
          "cursor-help mx-0.5",
          className
        )}
        aria-label={`Citation ${citationNumber}: ${sources.length} source${sources.length > 1 ? 's' : ''}`}
      >
        {citationNumber}
      </button>

      {/* Hover Card */}
      {isOpen && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
            "w-80 p-4 bg-white rounded-lg shadow-xl border border-gray-200",
            "z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          )}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-trust-blue" />
              <span className="text-xs font-semibold text-gray-900">
                Source {currentIndex + 1} of {sources.length}
              </span>
            </div>
            {sources.length > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sources.length - 1));
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  aria-label="Previous source"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev < sources.length - 1 ? prev + 1 : 0));
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  aria-label="Next source"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
              {currentSource.title}
            </h4>

            {currentSource.category && (
              <div className="flex items-center gap-1">
                <span className="text-xs px-2 py-0.5 bg-trust-blue/10 text-trust-blue rounded-full">
                  {currentSource.category}
                </span>
                {currentSource.score && (
                  <span className="text-xs text-gray-500">
                    {Math.round(currentSource.score * 100)}% match
                  </span>
                )}
              </div>
            )}

            {currentSource.excerpt && (
              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                {currentSource.excerpt}
              </p>
            )}

            {currentSource.url && (
              <a
                href={currentSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-trust-blue hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View full document
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      )}
    </span>
  );
}

// Utility function to parse citations in text and render them
export function renderTextWithCitations(
  text: string,
  sources: CitationSource[]
): React.ReactNode[] {
  if (!text || !sources || sources.length === 0) {
    return [text];
  }

  // Match citation patterns like [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    // Add text before citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add citation component
    const citationNum = parseInt(match[1], 10);
    const citationSources = sources.filter((s, idx) => idx + 1 === citationNum);

    if (citationSources.length > 0) {
      parts.push(
        <InlineCitation
          key={`citation-${match.index}`}
          sources={citationSources}
          citationNumber={citationNum}
        />
      );
    } else {
      // If no matching source, keep the original text
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}