'use client';

import { FileText, ExternalLink } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@vital/ui/lib/utils';

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

  if (!sources || sources.length === 0) return null;

  // Get the source matching this citation number (citationNumber 1 = sources[0])
  const sourceIndex = citationNumber - 1;
  if (sourceIndex < 0 || sourceIndex >= sources.length) return null;

  const currentSource = sources[sourceIndex];

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
                Citation [{citationNumber}]
              </span>
            </div>
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

// Utility function to parse citations in text and render them with markdown support
export function renderTextWithCitations(
  text: string,
  sources: CitationSource[]
): React.ReactNode {
  if (!text || !sources || sources.length === 0) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
  }

  // Helper function to process text nodes and replace citation patterns
  const processCitations = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        // Match citation patterns like [1], [2], etc.
        const citationRegex = /\[(\d+)\]/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = citationRegex.exec(child)) !== null) {
          // Add text before citation
          if (match.index > lastIndex) {
            parts.push(child.slice(lastIndex, match.index));
          }

          // Add citation component
          const citationNum = parseInt(match[1], 10);

          if (citationNum > 0 && citationNum <= sources.length) {
            parts.push(
              <InlineCitation
                key={`citation-${match.index}`}
                sources={sources}
                citationNumber={citationNum}
              />
            );
          } else {
            parts.push(match[0]);
          }

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < child.length) {
          parts.push(child.slice(lastIndex));
        }

        return parts.length > 0 ? parts : child;
      }
      return child;
    });
  };

  // Create a custom component to handle citations within markdown
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          return <p>{processCitations(children)}</p>;
        },
        h1({ children }) {
          return <h1>{processCitations(children)}</h1>;
        },
        h2({ children }) {
          return <h2 className="mt-8">{processCitations(children)}</h2>;
        },
        h3({ children }) {
          return <h3>{processCitations(children)}</h3>;
        },
        h4({ children }) {
          return <h4>{processCitations(children)}</h4>;
        },
        h5({ children }) {
          return <h5>{processCitations(children)}</h5>;
        },
        h6({ children }) {
          return <h6>{processCitations(children)}</h6>;
        },
        strong({ children }) {
          return <strong>{processCitations(children)}</strong>;
        },
        em({ children }) {
          return <em>{processCitations(children)}</em>;
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {processCitations(children)}
            </a>
          );
        },
        li({ children }) {
          return <li className="ml-6">{processCitations(children)}</li>;
        },
        ul({ children }) {
          return <ul className="list-disc list-outside ml-4">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-outside ml-4 space-y-2">{children}</ol>;
        },
        blockquote({ children }) {
          return <blockquote>{processCitations(children)}</blockquote>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}