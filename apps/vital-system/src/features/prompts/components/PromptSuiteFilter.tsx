/**
 * PromptSuiteFilter - Shared component for filtering by PRISM suites
 *
 * This component can be used in any view that needs to filter prompts by suite.
 * Supports both sidebar and inline modes.
 */
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Landmark,
  Microscope,
  Shield,
  Gem,
  Network,
  BarChart3,
  PenTool,
  Radar,
  ClipboardList,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// PRISM Suite configuration
export interface SuiteConfig {
  code: string;
  name: string;
  fullName: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const PRISM_SUITES: SuiteConfig[] = [
  {
    code: 'RULES',
    name: 'RULES™',
    fullName: 'Regulatory Intelligence',
    description: 'FDA, EMA, compliance, regulatory affairs',
    icon: Landmark,
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    code: 'TRIALS',
    name: 'TRIALS™',
    fullName: 'Clinical Development',
    description: 'Clinical trials, protocols, investigators',
    icon: Microscope,
    color: 'violet',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    textColor: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  {
    code: 'GUARD',
    name: 'GUARD™',
    fullName: 'Safety Framework',
    description: 'Pharmacovigilance, adverse events, safety',
    icon: Shield,
    color: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    code: 'VALUE',
    name: 'VALUE™',
    fullName: 'Market Access',
    description: 'HEOR, pricing, reimbursement, payer',
    icon: Gem,
    color: 'emerald',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    code: 'BRIDGE',
    name: 'BRIDGE™',
    fullName: 'Stakeholder Engagement',
    description: 'MSL, KOL, medical affairs',
    icon: Network,
    color: 'orange',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  {
    code: 'PROOF',
    name: 'PROOF™',
    fullName: 'Evidence Analytics',
    description: 'Real-world evidence, data analysis',
    icon: BarChart3,
    color: 'cyan',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  {
    code: 'CRAFT',
    name: 'CRAFT™',
    fullName: 'Medical Writing',
    description: 'Publications, manuscripts, medical content',
    icon: PenTool,
    color: 'purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    code: 'SCOUT',
    name: 'SCOUT™',
    fullName: 'Competitive Intelligence',
    description: 'Market research, competitive analysis',
    icon: Radar,
    color: 'lime',
    bgColor: 'bg-lime-100 dark:bg-lime-900/30',
    textColor: 'text-lime-700 dark:text-lime-300',
    borderColor: 'border-lime-200 dark:border-lime-800',
  },
  {
    code: 'PROJECT',
    name: 'PROJECT™',
    fullName: 'Project Management',
    description: 'Project coordination, operations',
    icon: ClipboardList,
    color: 'indigo',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    code: 'FORGE',
    name: 'FORGE™',
    fullName: 'Digital Health',
    description: 'Digital therapeutics, AI, software',
    icon: Zap,
    color: 'amber',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
];

// Helper to get suite by code
export function getSuiteByCode(code: string | null): SuiteConfig | undefined {
  if (!code) return undefined;
  const normalizedCode = code.replace('™', '').toUpperCase();
  return PRISM_SUITES.find(s => s.code === normalizedCode);
}

// Helper to get suite icon
export function getSuiteIcon(suiteCode: string): LucideIcon {
  const suite = getSuiteByCode(suiteCode);
  return suite?.icon || Landmark;
}

export interface PromptSuiteFilterProps {
  /** Currently selected suite code (e.g., 'RULES', 'TRIALS') */
  selectedSuite: string | null;
  /** Callback when suite selection changes */
  onSuiteChange: (suiteCode: string | null) => void;
  /** Optional counts per suite for display */
  suiteCounts?: Record<string, number>;
  /** Display mode: 'sidebar' (vertical list) or 'inline' (horizontal chips) */
  mode?: 'sidebar' | 'inline';
  /** Show 'All' option */
  showAll?: boolean;
  /** Custom class name */
  className?: string;
}

export function PromptSuiteFilter({
  selectedSuite,
  onSuiteChange,
  suiteCounts = {},
  mode = 'sidebar',
  showAll = true,
  className = '',
}: PromptSuiteFilterProps) {
  if (mode === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {showAll && (
          <Button
            variant={!selectedSuite ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSuiteChange(null)}
            className="rounded-full"
          >
            All
            {Object.values(suiteCounts).length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.values(suiteCounts).reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        )}
        {PRISM_SUITES.map((suite) => {
          const isActive = selectedSuite === suite.code;
          const Icon = suite.icon;
          const count = suiteCounts[suite.name] || suiteCounts[suite.code] || 0;

          return (
            <Button
              key={suite.code}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSuiteChange(isActive ? null : suite.code)}
              className={`rounded-full gap-1 ${isActive ? '' : suite.textColor}`}
            >
              <Icon className="h-3 w-3" />
              {suite.name}
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
      <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
        PRISM Suites
      </div>
      <ScrollArea className="h-auto max-h-[400px]">
        <div className="space-y-1 pr-2">
          {showAll && (
            <button
              onClick={() => onSuiteChange(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border ${
                !selectedSuite
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span>All Suites</span>
              {Object.values(suiteCounts).length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  {Object.values(suiteCounts).reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          )}

          {PRISM_SUITES.map((suite) => {
            const isActive = selectedSuite === suite.code;
            const Icon = suite.icon;
            const count = suiteCounts[suite.name] || suiteCounts[suite.code] || 0;

            return (
              <button
                key={suite.code}
                onClick={() => onSuiteChange(isActive ? null : suite.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border ${
                  isActive
                    ? `${suite.bgColor} ${suite.borderColor} ${suite.textColor}`
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {suite.name}
                </span>
                {count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/50 dark:bg-black/20'
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default PromptSuiteFilter;
