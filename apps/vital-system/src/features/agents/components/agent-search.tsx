/**
 * AgentSearch Component
 * Search bar with debounced input and clear button
 *
 * Uses simple text search (ILIKE) across multiple fields
 * Advanced semantic search will be in Knowledge Graph view
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAgentStore } from '../stores/agent-store';
import { PERFORMANCE } from '../constants/design-tokens';
import { Search, X, Loader2 } from 'lucide-react';

// ============================================================================
// DEBOUNCE HOOK
// ============================================================================

/**
 * Custom hook for debouncing values
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// AGENT SEARCH COMPONENT
// ============================================================================

export interface AgentSearchProps {
  placeholder?: string;
  showResultsCount?: boolean;
  className?: string;
  onSearchChange?: (query: string) => void;
}

/**
 * AgentSearch - Debounced search bar for agents
 *
 * Searches across: name, description, function, department, role, tagline
 *
 * @example
 * <AgentSearch placeholder="Search agents..." showResultsCount />
 */
export const AgentSearch: React.FC<AgentSearchProps> = ({
  placeholder = 'Search agents...',
  showResultsCount = true,
  className,
  onSearchChange,
}) => {
  const [localQuery, setLocalQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const filters = useAgentStore((state) => state.filters);
  const updateFilters = useAgentStore((state) => state.updateFilters);
  const filteredAgents = useAgentStore((state) => state.filteredAgents);
  const totalAgents = useAgentStore((state) => state.agents.length);

  // Debounce the search query
  const debouncedQuery = useDebounce(localQuery, PERFORMANCE.searchDebounceMs);

  // Sync debounced query to store
  React.useEffect(() => {
    if (debouncedQuery !== filters.search) {
      updateFilters({ search: debouncedQuery });
      onSearchChange?.(debouncedQuery);
      setIsSearching(false);
    }
  }, [debouncedQuery, filters.search, updateFilters, onSearchChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (value !== '') {
      setIsSearching(true);
    }
  };

  // Clear search
  const handleClear = () => {
    setLocalQuery('');
    updateFilters({ search: '' });
    setIsSearching(false);
    onSearchChange?.('');
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
      e.currentTarget.blur();
    }
  };

  // Determine if search is active
  const hasQuery = localQuery.trim() !== '' || (filters.search?.trim() || '') !== '';
  const resultsCount = filteredAgents.length;

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        {/* Search Icon */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

        {/* Input */}
        <Input
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-20"
          aria-label="Search agents"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Right Side Actions */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Loading Indicator */}
          {isSearching && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          )}

          {/* Results Count */}
          {showResultsCount && hasQuery && !isSearching && (
            <span className="text-xs text-muted-foreground mr-1">
              {resultsCount}/{totalAgents}
            </span>
          )}

          {/* Clear Button */}
          {hasQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-transparent"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Hint (optional) */}
      {hasQuery && (
        <p className="text-xs text-muted-foreground mt-1.5 pl-1">
          {resultsCount === 0 ? (
            <span className="text-yellow-600 dark:text-yellow-400">
              No agents found. Try different keywords.
            </span>
          ) : resultsCount === 1 ? (
            <span>Found {resultsCount} agent</span>
          ) : (
            <span>Found {resultsCount} agents</span>
          )}
        </p>
      )}
    </div>
  );
};

AgentSearch.displayName = 'AgentSearch';

// ============================================================================
// COMPACT SEARCH (Minimal version for toolbars)
// ============================================================================

export interface CompactAgentSearchProps {
  className?: string;
}

/**
 * CompactAgentSearch - Minimal search bar without hints
 *
 * @example
 * <CompactAgentSearch />
 */
export const CompactAgentSearch: React.FC<CompactAgentSearchProps> = ({
  className,
}) => {
  return (
    <AgentSearch
      placeholder="Search..."
      showResultsCount={false}
      className={cn('max-w-xs', className)}
    />
  );
};

CompactAgentSearch.displayName = 'CompactAgentSearch';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentSearch;
