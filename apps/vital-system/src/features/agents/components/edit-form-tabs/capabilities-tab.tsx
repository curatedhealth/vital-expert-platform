/**
 * Capabilities Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles capabilities and skills selection:
 * - Capability category filter badges
 * - Capabilities multi-select with filtering
 * - Skills multi-select filtered by selected capabilities
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import type { EditFormTabProps, DropdownOption } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const CAPABILITY_CATEGORIES = [
  'All',
  'Clinical',
  'Regulatory',
  'Commercial',
  'Medical Affairs',
  'Data & Analytics',
  'Communication',
  'Research',
] as const;

export type CapabilityCategory = (typeof CAPABILITY_CATEGORIES)[number];

// ============================================================================
// TYPES
// ============================================================================

export interface CapabilitiesTabProps extends EditFormTabProps {
  /** Available capabilities from database */
  capabilities: DropdownOption[];
  /** Available skills from database (may have capability_id for filtering) */
  skills: (DropdownOption & { capability_id?: string })[];
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
// CAPABILITIES TAB COMPONENT
// ============================================================================

export function CapabilitiesTab({
  formState,
  updateField,
  capabilities,
  skills,
  loadingDropdowns = false,
  MultiSelectDropdown,
}: CapabilitiesTabProps) {
  // Category filter state
  const [capabilityFilter, setCapabilityFilter] = React.useState<CapabilityCategory>('All');

  // Filter capabilities by category
  const filteredCapabilities = React.useMemo(() => {
    if (capabilityFilter === 'All') return capabilities;
    return capabilities.filter(
      (cap) =>
        cap.category?.toLowerCase().includes(capabilityFilter.toLowerCase()) ||
        cap.name?.toLowerCase().includes(capabilityFilter.toLowerCase())
    );
  }, [capabilities, capabilityFilter]);

  // Filter skills by selected capabilities
  const filteredSkills = React.useMemo(() => {
    if (formState.capabilities.length === 0) return skills;
    return skills.filter(
      (skill) =>
        // If skill has capability_id, filter by selected capabilities
        // Otherwise show all skills
        !skill.capability_id || formState.capabilities.includes(skill.capability_id)
    );
  }, [skills, formState.capabilities]);

  return (
    <div className="space-y-4">
      {/* Capabilities Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Capabilities
            <Badge variant="outline" className="ml-auto text-xs">
              {formState.capabilities.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Select capabilities this agent possesses. Skills will filter based on selected
            capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Capability Category Filter Badges */}
          <div className="flex gap-2 flex-wrap">
            {CAPABILITY_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={capabilityFilter === category ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setCapabilityFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="w-full max-w-full overflow-hidden">
            <MultiSelectDropdown
              options={filteredCapabilities}
              selected={formState.capabilities}
              onChange={(selected) => {
                updateField('capabilities', selected);
                // Note: Could clear skills that don't belong to selected capabilities if needed
              }}
              placeholder="Search capabilities..."
              loading={loadingDropdowns}
              emptyMessage={
                capabilityFilter !== 'All'
                  ? `No capabilities found for "${capabilityFilter}"`
                  : 'No capabilities found in database'
              }
            />
          </div>
          {formState.capabilities.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {formState.capabilities.length} capability(ies) selected - skills below are filtered
              accordingly
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Skills
            {formState.capabilities.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Filtered by {formState.capabilities.length} capabilities
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {formState.capabilities.length > 0
              ? 'Showing skills related to selected capabilities'
              : 'Select capabilities first to filter skills, or choose from all skills'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-full overflow-hidden">
            <MultiSelectDropdown
              options={filteredSkills}
              selected={formState.skills}
              onChange={(selected) => updateField('skills', selected)}
              placeholder="Search skills..."
              loading={loadingDropdowns}
              emptyMessage={
                formState.capabilities.length > 0
                  ? 'No skills found for selected capabilities'
                  : 'No skills found in database'
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
