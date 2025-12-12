/**
 * Safety Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles compliance flags and expertise profile:
 * - HIPAA compliance toggle
 * - Audit trail toggle
 * - Data classification dropdown
 * - Expertise level, years, geographic scope, industry
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DataClassification, ExpertiseLevel, GeographicScope } from '../../types/agent.types';
import type { EditFormTabProps } from './types';

// ============================================================================
// SAFETY TAB COMPONENT
// ============================================================================

export function SafetyTab({ formState, updateField }: EditFormTabProps) {
  return (
    <div className="space-y-4">
      {/* Compliance Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ComplianceToggle
            label="HIPAA Compliant"
            description="Agent handles PHI according to HIPAA regulations"
            checked={formState.hipaa_compliant}
            onCheckedChange={(checked) => updateField('hipaa_compliant', checked)}
          />

          <ComplianceToggle
            label="Audit Trail Enabled"
            description="All interactions are logged for compliance"
            checked={formState.audit_trail_enabled}
            onCheckedChange={(checked) => updateField('audit_trail_enabled', checked)}
          />

          <div className="grid gap-2">
            <Label>Data Classification</Label>
            <Select
              value={formState.data_classification}
              onValueChange={(value) => updateField('data_classification', value as DataClassification)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expertise Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expertise Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Expertise Level</Label>
              <Select
                value={formState.expertise_level}
                onValueChange={(value) => updateField('expertise_level', value as ExpertiseLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="thought_leader">Thought Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expertise_years">Years of Experience</Label>
              <Input
                id="expertise_years"
                type="number"
                min="0"
                max="50"
                value={formState.expertise_years}
                onChange={(e) => updateField('expertise_years', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Geographic Scope</Label>
              <Select
                value={formState.geographic_scope}
                onValueChange={(value) => updateField('geographic_scope', value as GeographicScope)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="industry">Industry Specialization</Label>
              <Input
                id="industry"
                value={formState.industry_specialization}
                onChange={(e) => updateField('industry_specialization', e.target.value)}
                placeholder="e.g., pharmaceuticals"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ComplianceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ComplianceToggle({ label, description, checked, onCheckedChange }: ComplianceToggleProps) {
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
