/**
 * ActiveFiltersBar - Shared active filters display component
 *
 * Used by: Tools, Skills, Prompts, Workflows pages
 */
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

export interface ActiveFiltersBarProps {
  filters: ActiveFilter[];
  filteredCount: number;
  totalCount: number;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange';
}

const COLOR_SCHEMES = {
  blue: {
    bar: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
    button: 'text-blue-600 hover:text-blue-800',
  },
  purple: {
    bar: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
    button: 'text-purple-600 hover:text-purple-800',
  },
  green: {
    bar: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
    button: 'text-green-600 hover:text-green-800',
  },
  orange: {
    bar: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200',
    button: 'text-orange-600 hover:text-orange-800',
  },
};

export function ActiveFiltersBar({
  filters,
  filteredCount,
  totalCount,
  onRemoveFilter,
  onClearAll,
  colorScheme = 'blue',
}: ActiveFiltersBarProps) {
  if (filters.length === 0) return null;

  const colors = COLOR_SCHEMES[colorScheme];

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${colors.bar}`}>
      <span className={`text-sm font-medium ${colors.text}`}>
        Filters ({filteredCount} of {totalCount}):
      </span>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className={`flex items-center gap-1 ${colors.badge}`}
          >
            {filter.label}
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className={`ml-1 hover:opacity-80`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className={`ml-auto ${colors.button}`}
      >
        Clear all
      </Button>
    </div>
  );
}

export default ActiveFiltersBar;
