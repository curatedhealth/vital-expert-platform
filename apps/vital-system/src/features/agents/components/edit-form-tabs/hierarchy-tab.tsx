/**
 * Hierarchy Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles agent relationships and spawning capabilities:
 * - Reports to / escalates to selection
 * - Spawning permissions (L2, L3, L4, worker pool)
 * - SubagentSelector for L4/L5 configuration
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubagentSelector } from '../subagent-selector';
import type { Agent, SubagentHierarchyConfig } from '../../types/agent.types';
import type { EditFormTabProps } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface HierarchyTabProps extends EditFormTabProps {
  /** Available agents for parent/escalation selection */
  availableAgents: Array<{ id: string; name: string; agent_level_id?: string }>;
}

// ============================================================================
// HIERARCHY TAB COMPONENT
// ============================================================================

export function HierarchyTab({
  formState,
  updateField,
  agent,
  availableAgents,
}: HierarchyTabProps) {
  // Handle hierarchy config save from SubagentSelector
  const handleHierarchyConfigSave = React.useCallback(
    (config: SubagentHierarchyConfig) => {
      updateField('metadata', {
        ...formState.metadata,
        hierarchy: config,
      });
    },
    [formState.metadata, updateField]
  );

  return (
    <div className="space-y-4">
      {/* Reporting Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reporting Structure</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Reports To</Label>
            <Select
              value={formState.reports_to_agent_id}
              onValueChange={(value) => updateField('reports_to_agent_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent agent..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Escalates To</Label>
            <Select
              value={formState.can_escalate_to}
              onValueChange={(value) => updateField('can_escalate_to', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select escalation target..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="HITL">Human in the Loop</SelectItem>
                <SelectItem value="L1">L1 Master</SelectItem>
                <SelectItem value="L2">L2 Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Spawning Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spawning Capabilities</CardTitle>
          <CardDescription>What lower-level agents can this agent spawn?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SpawnToggle
            label="Can Spawn L2 (Expert)"
            description="Spawn domain expert agents"
            checked={formState.can_spawn_l2}
            onCheckedChange={(checked) => updateField('can_spawn_l2', checked)}
          />

          <SpawnToggle
            label="Can Spawn L3 (Specialist)"
            description="Spawn task specialists"
            checked={formState.can_spawn_l3}
            onCheckedChange={(checked) => updateField('can_spawn_l3', checked)}
          />

          <SpawnToggle
            label="Can Spawn L4 (Worker)"
            description="Spawn worker agents for data tasks"
            checked={formState.can_spawn_l4}
            onCheckedChange={(checked) => updateField('can_spawn_l4', checked)}
          />

          <SpawnToggle
            label="Can Use Worker Pool"
            description="Access shared worker pool for parallel tasks"
            checked={formState.can_use_worker_pool}
            onCheckedChange={(checked) => updateField('can_use_worker_pool', checked)}
          />
        </CardContent>
      </Card>

      {/* L4/L5 Agent Selection - Only show for agents that can spawn */}
      {(formState.can_spawn_l4 || formState.can_spawn_l3) && agent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configure L4/L5 Agents</CardTitle>
            <CardDescription>
              Select specific L4 Workers and L5 Tools this agent can spawn. AI will recommend
              agents based on domain expertise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubagentSelector agent={agent} onSave={handleHierarchyConfigSave} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface SpawnToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SpawnToggle({ label, description, checked, onCheckedChange }: SpawnToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
