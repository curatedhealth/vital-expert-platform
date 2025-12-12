/**
 * PromptSubSuiteFilter - Shared component for filtering by prompt sub-suites
 *
 * This component cascades from PromptSuiteFilter - it shows sub-suites
 * based on the currently selected parent suite.
 */
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers } from 'lucide-react';

export interface SubSuite {
  id: string;
  code: string;
  name: string;
  fullName?: string;
  description?: string;
  suiteId: string;
  suiteCode?: string;
  promptCount?: number;
  sortOrder?: number;
}

export interface PromptSubSuiteFilterProps {
  /** List of sub-suites to display (should be pre-filtered by parent suite) */
  subSuites: SubSuite[];
  /** Currently selected sub-suite code */
  selectedSubSuite: string | null;
  /** Callback when sub-suite selection changes */
  onSubSuiteChange: (subSuiteCode: string | null) => void;
  /** Optional counts per sub-suite for display */
  subSuiteCounts?: Record<string, number>;
  /** Display mode: 'sidebar' (vertical list) or 'inline' (horizontal chips) */
  mode?: 'sidebar' | 'inline';
  /** Show 'All' option */
  showAll?: boolean;
  /** Label for the section */
  label?: string;
  /** Custom class name */
  className?: string;
  /** Show even if no sub-suites available */
  showEmpty?: boolean;
}

export function PromptSubSuiteFilter({
  subSuites,
  selectedSubSuite,
  onSubSuiteChange,
  subSuiteCounts = {},
  mode = 'sidebar',
  showAll = true,
  label = 'Sub-suites',
  className = '',
  showEmpty = false,
}: PromptSubSuiteFilterProps) {
  // Don't render if no sub-suites and not showing empty
  if (subSuites.length === 0 && !showEmpty) {
    return null;
  }

  if (mode === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {showAll && (
          <Button
            variant={!selectedSubSuite ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSubSuiteChange(null)}
            className="rounded-full"
          >
            <Layers className="h-3 w-3 mr-1" />
            All
          </Button>
        )}
        {subSuites.map((subSuite) => {
          const isActive = selectedSubSuite === subSuite.code;
          const count = subSuiteCounts[subSuite.code] || subSuiteCounts[subSuite.name] || subSuite.promptCount || 0;

          return (
            <Button
              key={subSuite.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSubSuiteChange(isActive ? null : subSuite.code)}
              className="rounded-full"
            >
              {subSuite.name || subSuite.code}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  // Sidebar mode (default)
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2 flex items-center gap-2">
        <Layers className="h-4 w-4" />
        {label}
      </div>

      {subSuites.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 px-3 py-2">
          Select a suite to see sub-suites
        </p>
      ) : (
        <ScrollArea className="h-auto max-h-[200px]">
          <div className="flex flex-wrap gap-2 pr-2">
            {showAll && (
              <button
                onClick={() => onSubSuiteChange(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedSubSuite
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                All
              </button>
            )}

            {subSuites.map((subSuite) => {
              const isActive = selectedSubSuite === subSuite.code;
              const count = subSuiteCounts[subSuite.code] || subSuiteCounts[subSuite.name] || subSuite.promptCount || 0;

              return (
                <button
                  key={subSuite.id}
                  onClick={() => onSubSuiteChange(isActive ? null : subSuite.code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  {subSuite.name || subSuite.code}
                  {count > 0 && (
                    <span className={`ml-1 text-xs ${isActive ? 'text-blue-200' : 'text-neutral-500'}`}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default PromptSubSuiteFilter;
