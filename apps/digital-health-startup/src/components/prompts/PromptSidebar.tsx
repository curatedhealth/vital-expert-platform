'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { Separator } from '@vital/ui';
import type { PromptSuite, PromptSubsuite, PromptPattern, ComplexityLevel } from '@/types/prompts';
import { PROMPT_PATTERNS, COMPLEXITY_LEVELS } from '@/types/prompts';

interface PromptSidebarProps {
  suites: PromptSuite[];
  selectedSuite?: string;
  selectedSubsuite?: string;
  selectedPattern: PromptPattern | 'all';
  selectedComplexity: ComplexityLevel | 'all';
  onSuiteChange: (suiteId: string | undefined) => void;
  onSubsuiteChange: (subsuiteId: string | undefined) => void;
  onPatternChange: (pattern: PromptPattern | 'all') => void;
  onComplexityChange: (complexity: ComplexityLevel | 'all') => void;
  onReset: () => void;
}

export default function PromptSidebar({
  suites,
  selectedSuite,
  selectedSubsuite,
  selectedPattern,
  selectedComplexity,
  onSuiteChange,
  onSubsuiteChange,
  onPatternChange,
  onComplexityChange,
  onReset,
}: PromptSidebarProps) {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [subsuites, setSubsuites] = useState<Record<string, PromptSubsuite[]>>({});

  const toggleSuite = async (suiteId: string) => {
    const newExpanded = new Set(expandedSuites);

    if (newExpanded.has(suiteId)) {
      newExpanded.delete(suiteId);
    } else {
      newExpanded.add(suiteId);

      // Fetch subsuites if not already loaded
      if (!subsuites[suiteId]) {
        const suite = suites.find(s => s.id === suiteId);
        if (suite?.metadata?.uniqueId) {
          try {
            const response = await fetch(`/api/prompts/suites/${suite.metadata.uniqueId}/subsuites`);
            const data = await response.json();

            if (data.success) {
              setSubsuites(prev => ({
                ...prev,
                [suiteId]: data.subsuites,
              }));
            }
          } catch (error) {
            console.error('Error fetching subsuites:', error);
          }
        }
      }
    }

    setExpandedSuites(newExpanded);
  };

  const hasActiveFilters = selectedSuite || selectedSubsuite || selectedPattern !== 'all' || selectedComplexity !== 'all';

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filters</h2>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="text-xs text-gray-600">
            {[selectedSuite, selectedSubsuite, selectedPattern !== 'all' && selectedPattern, selectedComplexity !== 'all' && selectedComplexity]
              .filter(Boolean).length} filter(s) applied
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Suites & Subsuites */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Suites & Sub-Suites</h3>
            <div className="space-y-1">
              {suites.map((suite) => {
                const isExpanded = expandedSuites.has(suite.id);
                const isSelected = selectedSuite === suite.id;
                const suiteSubsuites = subsuites[suite.id] || [];
                const hasSubsuites = suite.statistics.subsuites > 0;

                return (
                  <div key={suite.id}>
                    <button
                      onClick={() => {
                        if (isSelected) {
                          onSuiteChange(undefined);
                          onSubsuiteChange(undefined);
                        } else {
                          onSuiteChange(suite.id);
                          onSubsuiteChange(undefined);
                        }
                        if (hasSubsuites) {
                          toggleSuite(suite.id);
                        }
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm
                        transition-colors
                        ${isSelected
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {hasSubsuites && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSuite(suite.id);
                          }}
                          className="cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                      {!hasSubsuites && <div className="w-4" />}

                      <div className={`w-3 h-3 rounded ${suite.color}`}></div>
                      <span className="flex-1 truncate">{suite.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {suite.statistics.totalPrompts}
                      </Badge>
                    </button>

                    {/* Subsuites */}
                    {isExpanded && suiteSubsuites.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {suiteSubsuites.map((subsuite) => {
                          const isSubsuiteSelected = selectedSubsuite === subsuite.id;

                          return (
                            <button
                              key={subsuite.id}
                              onClick={() => {
                                if (isSubsuiteSelected) {
                                  onSubsuiteChange(undefined);
                                } else {
                                  onSuiteChange(suite.id);
                                  onSubsuiteChange(subsuite.id);
                                }
                              }}
                              className={`
                                w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs
                                transition-colors
                                ${isSubsuiteSelected
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'hover:bg-gray-100 text-gray-600'
                                }
                              `}
                            >
                              <span className="flex-1 truncate">{subsuite.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {subsuite.statistics.promptCount}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Pattern Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Prompt Pattern</h3>
            <div className="space-y-1">
              <button
                onClick={() => onPatternChange('all')}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm
                  transition-colors
                  ${selectedPattern === 'all'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span>All Patterns</span>
              </button>

              {PROMPT_PATTERNS.map((pattern) => (
                <button
                  key={pattern}
                  onClick={() => onPatternChange(pattern)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm
                    transition-colors
                    ${selectedPattern === pattern
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <span>{pattern}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Complexity Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Complexity Level</h3>
            <div className="space-y-1">
              <button
                onClick={() => onComplexityChange('all')}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm
                  transition-colors
                  ${selectedComplexity === 'all'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span>All Levels</span>
              </button>

              {COMPLEXITY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => onComplexityChange(level)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm
                    transition-colors
                    ${selectedComplexity === level
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <span>{level}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
