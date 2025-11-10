/**
 * VirtualizedSourceList Component
 *
 * Efficient rendering of large source lists using virtual scrolling
 * Only renders visible items to improve performance
 */

import React, { useRef, useState, useEffect } from 'react';
import { Badge } from '@vital/ui';
import { motion } from 'framer-motion';

interface Source {
  number?: number;
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  domain?: string;
  url?: string;
  metadata?: Record<string, any>;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D';
  sourceType?: 'fda_guidance' | 'clinical_trial' | 'research_paper' | 'regulatory_filing' | 'company_document' | 'other';
  organization?: string;
  similarity?: number;
  author?: string;
  publicationDate?: Date | string;
}

export interface VirtualizedSourceListProps {
  sources: Source[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  renderSource: (source: Source, index: number) => React.ReactNode;
  className?: string;
}

/**
 * Virtualized source list with efficient rendering
 * Only renders items that are currently visible in the viewport
 */
export const VirtualizedSourceList: React.FC<VirtualizedSourceListProps> = ({
  sources,
  itemHeight = 100,
  containerHeight = 600,
  overscan = 3,
  renderSource,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    sources.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleSources = sources.slice(startIndex, endIndex);
  const totalHeight = sources.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`virtual-source-list overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleSources.map((source, idx) => {
            const actualIndex = startIndex + idx;
            return (
              <div
                key={source.id || actualIndex}
                style={{ height: itemHeight }}
              >
                {renderSource(source, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Smart source list that switches between normal and virtualized rendering
 * based on the number of sources
 */
export interface SmartSourceListProps {
  sources: Source[];
  renderSource: (source: Source, index: number) => React.ReactNode;
  virtualizationThreshold?: number;
  className?: string;
}

export const SmartSourceList: React.FC<SmartSourceListProps> = ({
  sources,
  renderSource,
  virtualizationThreshold = 15,
  className = '',
}) => {
  const shouldVirtualize = sources.length > virtualizationThreshold;

  if (!shouldVirtualize) {
    // Normal rendering for small lists
    return (
      <div className={`space-y-3 ${className}`}>
        {sources.map((source, idx) => (
          <React.Fragment key={source.id || idx}>
            {renderSource(source, idx)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Virtualized rendering for large lists
  return (
    <VirtualizedSourceList
      sources={sources}
      renderSource={renderSource}
      itemHeight={100}
      containerHeight={600}
      overscan={3}
      className={className}
    />
  );
};

export default VirtualizedSourceList;
