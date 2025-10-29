'use client';

import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface Source {
  id: string;
  title: string;
  url?: string;
  excerpt?: string;
  similarity?: number;
}

interface SourcesContextValue {
  sources: Source[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SourcesContext = React.createContext<SourcesContextValue>({
  sources: [],
  isOpen: false,
  setIsOpen: () => {},
});

interface SourcesProps {
  children: React.ReactNode;
  sources?: Source[];
  className?: string;
}

export function Sources({ children, sources = [], className }: SourcesProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      sources,
      isOpen,
      setIsOpen,
    }),
    [sources, isOpen]
  );

  // Auto-open if there are sources
  React.useEffect(() => {
    if (sources.length > 0) {
      setIsOpen(true);
    }
  }, [sources.length]);

  return (
    <SourcesContext.Provider value={value}>
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-gray-50/50 overflow-hidden transition-all',
          className
        )}
      >
        {children}
      </div>
    </SourcesContext.Provider>
  );
}

interface SourcesTriggerProps {
  className?: string;
}

export function SourcesTrigger({ className }: SourcesTriggerProps) {
  const { sources, isOpen, setIsOpen } = React.useContext(SourcesContext);

  if (sources.length === 0) return null;

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100/50',
        className
      )}
      aria-expanded={isOpen}
      aria-controls="sources-content"
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-700">
          Used {sources.length} source{sources.length !== 1 ? 's' : ''}
        </span>
      </div>
      {isOpen ? (
        <ChevronUp className="h-4 w-4 text-gray-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500" />
      )}
    </button>
  );
}

interface SourcesContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function SourcesContent({ children, className }: SourcesContentProps) {
  const { sources, isOpen } = React.useContext(SourcesContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(0);

  React.useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setHeight(entries[0].contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div
      id="sources-content"
      style={{
        maxHeight: isOpen ? height : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
      }}
    >
      <div ref={contentRef}>
        <div
          className={cn(
            'px-4 py-3 border-t border-gray-200 bg-white',
            className
          )}
        >
          {children || (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {source.title}
                      </h4>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {source.excerpt && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {source.excerpt}
                      </p>
                    )}
                    {source.similarity && (
                      <span className="text-xs text-gray-500 mt-1">
                        {(source.similarity * 100).toFixed(1)}% match
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

