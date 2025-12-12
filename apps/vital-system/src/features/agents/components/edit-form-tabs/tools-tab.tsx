/**
 * Tools Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles tools and integrations selection:
 * - Tool category filter badges
 * - Tools multi-select with filtering
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import type { EditFormTabProps, DropdownOption } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const TOOL_CATEGORIES = [
  'All Tools',
  'Data',
  'Analysis',
  'Communication',
  'Integration',
  'Search',
  'Automation',
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

// ============================================================================
// TYPES
// ============================================================================

export interface ToolsTabProps extends EditFormTabProps {
  /** Available tools from database */
  tools: DropdownOption[];
  /** Whether dropdown data is loading */
  loadingDropdowns?: boolean;
  /** Multi-select dropdown component (passed from parent) */
  MultiSelectDropdown: React.ComponentType<{
    options: DropdownOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    loading?: boolean;
    emptyMessage?: string;
  }>;
}

// ============================================================================
// TOOLS TAB COMPONENT
// ============================================================================

export function ToolsTab({
  formState,
  updateField,
  tools,
  loadingDropdowns = false,
  MultiSelectDropdown,
}: ToolsTabProps) {
  // Category filter state
  const [toolFilter, setToolFilter] = React.useState<ToolCategory>('All Tools');

  // Filter tools by category
  const filteredTools = React.useMemo(() => {
    if (toolFilter === 'All Tools') return tools;
    return tools.filter(
      (tool) =>
        tool.category?.toLowerCase().includes(toolFilter.toLowerCase()) ||
        tool.name?.toLowerCase().includes(toolFilter.toLowerCase())
    );
  }, [tools, toolFilter]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools & Integrations
            {formState.tools.length > 0 && (
              <Badge variant="outline" className="ml-auto text-xs">
                {formState.tools.length} selected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Filter and select tools this agent can use from the registry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {TOOL_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={toolFilter === category ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setToolFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <MultiSelectDropdown
            options={filteredTools}
            selected={formState.tools}
            onChange={(selected) => updateField('tools', selected)}
            placeholder="Search tools..."
            loading={loadingDropdowns}
            emptyMessage={
              toolFilter !== 'All Tools'
                ? `No tools found for "${toolFilter}"`
                : 'No tools found in database'
            }
          />

          {formState.tools.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {formState.tools.length} tool(s) selected
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
