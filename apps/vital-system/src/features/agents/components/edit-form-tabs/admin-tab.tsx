/**
 * Admin Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles administrative controls (Super Admin Only):
 * - Tenant assignment
 * - Visibility & access controls (public, allow duplicate)
 * - Agent metadata display
 * - Status management
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
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
import { Building2, Globe, Copy, UserCog } from 'lucide-react';
import { AgentStatus, type Agent } from '../../types/agent.types';
import type { EditFormTabProps, DropdownOption } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface TenantOption extends DropdownOption {
  tenant_key?: string;
  is_active?: boolean;
}

export interface AdminTabProps extends EditFormTabProps {
  /** Current agent being edited (for displaying ID, etc.) */
  agent?: Agent | null;
  /** Available tenants for assignment */
  tenants: TenantOption[];
}

// ============================================================================
// ADMIN TAB COMPONENT
// ============================================================================

export function AdminTab({ formState, updateField, agent, tenants }: AdminTabProps) {
  // Find current tenant name for display
  const currentTenant = React.useMemo(() => {
    return tenants.find((t) => t.id === formState.tenant_id);
  }, [tenants, formState.tenant_id]);

  return (
    <div className="space-y-4">
      {/* Tenant Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Tenant Assignment
          </CardTitle>
          <CardDescription>Assign this agent to a specific tenant organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tenant_id">Assigned Tenant</Label>
            <Select
              value={formState.tenant_id || 'none'}
              onValueChange={(value) => updateField('tenant_id', value === 'none' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tenant..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">No tenant (Platform-wide)</span>
                </SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center gap-2">
                      <span>{tenant.name}</span>
                      {tenant.tenant_key && (
                        <span className="text-xs text-muted-foreground">({tenant.tenant_key})</span>
                      )}
                      {tenant.is_active === false && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Agents can be tenant-specific or platform-wide (no tenant assigned)
            </p>
          </div>

          {formState.tenant_id && currentTenant && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                This agent is assigned to: <strong>{currentTenant.name}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visibility & Access Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Visibility & Access
          </CardTitle>
          <CardDescription>Control who can see and interact with this agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="is_public" className="font-medium">
                  Public Access
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, this agent is visible to all users in the agent store
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formState.is_public}
              onCheckedChange={(checked) => updateField('is_public', checked)}
            />
          </div>

          {/* Duplicate Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="allow_duplicate" className="font-medium">
                  Allow Duplication
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, users can create their own copy of this agent
              </p>
            </div>
            <Switch
              id="allow_duplicate"
              checked={formState.allow_duplicate}
              onCheckedChange={(checked) => updateField('allow_duplicate', checked)}
            />
          </div>

          {/* Status Summary */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <Label className="text-xs text-muted-foreground mb-2 block">Current Visibility:</Label>
            <div className="flex gap-2 flex-wrap">
              {formState.is_public ? (
                <Badge variant="default" className="bg-green-600">
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary">Private</Badge>
              )}
              {formState.allow_duplicate ? (
                <Badge variant="outline">Duplicatable</Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-300">
                  No Duplication
                </Badge>
              )}
              {formState.tenant_id ? (
                <Badge variant="outline">Tenant-specific</Badge>
              ) : (
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  Platform-wide
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Agent Metadata
          </CardTitle>
          <CardDescription>Additional administrative information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <Label className="text-xs text-muted-foreground">Agent ID</Label>
              <p className="font-mono text-xs mt-1 truncate">{agent?.id || 'Not saved yet'}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="font-medium text-sm mt-1 capitalize">{formState.status}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Label className="text-xs text-muted-foreground">Validation</Label>
              <p className="font-medium text-sm mt-1 capitalize">{formState.validation_status}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Label className="text-xs text-muted-foreground">Personality Type ID</Label>
              <p className="font-mono text-xs mt-1 truncate">
                {formState.personality_type_id || 'None'}
              </p>
            </div>
          </div>

          {/* Status Change */}
          <div className="grid gap-2">
            <Label htmlFor="status">Agent Status</Label>
            <Select
              value={formState.status}
              onValueChange={(value) => updateField('status', value as AgentStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="active">Active (Production)</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
