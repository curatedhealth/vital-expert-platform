'use client';

import React, { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Source {
  id?: string;
  number?: string | number;
  title: string;
  url?: string;
  domain?: string;
  metadata?: {
    author?: string;
    date?: string;
    publisher?: string;
    year?: string;
    accessDate?: string;
  };
  description?: string;
  excerpt?: string;
  quote?: string;
}

interface CollapsibleSourcesProps {
  sources: Source[];
  className?: string;
  defaultExpanded?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a source in Chicago citation style
 * Author Last Name, First Name. "Title of Source." Publisher, Date. URL.
 */
const formatChicagoCitation = (source: Source): string => {
  const parts: string[] = [];
  
  // Author
  if (source.metadata?.author) {
    parts.push(`${source.metadata.author}.`);
  }
  
  // Title (in quotes for articles/web pages)
  if (source.title) {
    parts.push(`"${source.title}."`);
  }
  
  // Publisher
  if (source.metadata?.publisher || source.domain) {
    parts.push(`${source.metadata?.publisher || source.domain},`);
  }
  
  // Date
  if (source.metadata?.date || source.metadata?.year) {
    parts.push(`${source.metadata?.date || source.metadata?.year}.`);
  }
  
  // URL
  if (source.url) {
    parts.push(source.url);
  }
  
  // Access date (for web sources)
  if (source.metadata?.accessDate) {
    parts.push(`Accessed ${source.metadata.accessDate}.`);
  }
  
  return parts.join(' ');
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CollapsibleSources: React.FC<CollapsibleSourcesProps> = ({
  sources,
  className,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={cn('border-t border-gray-200 dark:border-gray-700 mt-4', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Used {sources.length} {sources.length === 1 ? 'source' : 'sources'}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform duration-200',
            isExpanded && 'transform rotate-180'
          )}
        />
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="pb-4 space-y-3">
          {sources.map((source, index) => {
            const citation = formatChicagoCitation(source);
            const sourceNumber = source.number || index + 1;
            
            return (
              <div
                key={source.id || `source-${index}`}
                className="flex items-start gap-3 group/item"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-1 rounded-md transition-colors"
                    >
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                        {source.title}
                      </h4>
                      {citation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {citation}
                        </p>
                      )}
                    </a>
                  ) : (
                    <div className="block -mx-2 px-2 py-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {source.title}
                      </h4>
                      {citation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {citation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSources;

