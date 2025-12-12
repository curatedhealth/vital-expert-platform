/**
 * Organization Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles organizational hierarchy selection with cascading dropdowns:
 * - Tenant (top-level) → Function → Department → Role
 * - Selection at parent level clears child selections
 * - Uses function_tenants junction table for tenant→function filtering
 * - Shows selection breadcrumb summary
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, Building2, Info, Loader2 } from 'lucide-react';
import type { EditFormTabProps, DropdownOption } from './types';

// ============================================================================
// TYPES
// ============================================================================

interface TenantOption {
  id: string;
  name: string;
  tenant_key?: string;
  is_active?: boolean;
}

interface FunctionTenantMapping {
  id: string;
  function_id: string;
  tenant_id: string;
}

export interface OrgTabProps extends EditFormTabProps {
  /** Tenant organizations */
  tenants: TenantOption[];
  /** Junction table for tenant→function relationships */
  functionTenants: FunctionTenantMapping[];
  /** Whether dropdown data is loading */
  loadingDropdowns?: boolean;
}

// ============================================================================
// ORG TAB COMPONENT
// ============================================================================

export function OrgTab({
  formState,
  updateField,
  updateMultipleFields,
  options,
  tenants,
  functionTenants,
  loadingDropdowns = false,
}: OrgTabProps) {
  // Count functions available for selected tenant
  const functionsForTenant = React.useMemo(() => {
    if (!formState.tenant_id) return options.functions;
    return options.functions.filter((f) =>
      functionTenants.some((ft) => ft.function_id === f.id && ft.tenant_id === formState.tenant_id)
    );
  }, [formState.tenant_id, options.functions, functionTenants]);

  // Filter departments by selected function
  const departmentsForFunction = React.useMemo(() => {
    if (!formState.function_id) return [];
    return options.departments.filter((d) => d.function_id === formState.function_id);
  }, [formState.function_id, options.departments]);

  // Filter roles by selected department
  const rolesForDepartment = React.useMemo(() => {
    if (!formState.department_id) return [];
    return options.roles.filter((r) => r.department_id === formState.department_id);
  }, [formState.department_id, options.roles]);

  // Handle tenant change - clears all child selections
  const handleTenantChange = React.useCallback(
    (value: string) => {
      const newTenantId = value === 'none' ? '' : value;
      updateMultipleFields({
        tenant_id: newTenantId,
        function_id: '',
        department_id: '',
        role_id: '',
      });
    },
    [updateMultipleFields]
  );

  // Handle function change - clears department and role
  const handleFunctionChange = React.useCallback(
    (value: string) => {
      const newFunctionId = value === 'none' ? '' : value;
      updateMultipleFields({
        function_id: newFunctionId,
        department_id: '',
        role_id: '',
      });
    },
    [updateMultipleFields]
  );

  // Handle department change - clears role
  const handleDepartmentChange = React.useCallback(
    (value: string) => {
      const newDepartmentId = value === 'none' ? '' : value;
      updateMultipleFields({
        department_id: newDepartmentId,
        role_id: '',
      });
    },
    [updateMultipleFields]
  );

  // Handle role change
  const handleRoleChange = React.useCallback(
    (value: string) => {
      updateField('role_id', value === 'none' ? '' : value);
    },
    [updateField]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building className="h-4 w-4" />
          Organizational Context
        </CardTitle>
        <CardDescription>
          Define where this agent fits in the organizational structure. Select Tenant first, then
          Function, Department, and Role.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* TENANT - Top level of hierarchy */}
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-500" />
            Tenant Organization
            <Badge variant="outline" className="text-xs">
              {tenants.length} available
            </Badge>
          </Label>
          {loadingDropdowns ? (
            <LoadingPlaceholder text="Loading tenants..." />
          ) : (
            <Select value={formState.tenant_id || 'none'} onValueChange={handleTenantChange}>
              <SelectTrigger className={formState.tenant_id ? 'border-purple-500/50' : ''}>
                <SelectValue placeholder="Select tenant organization..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">All Tenants</span>
                </SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {tenant.name}
                      {tenant.tenant_key && (
                        <span className="text-xs text-muted-foreground capitalize">
                          ({tenant.tenant_key.replace(/-/g, ' ')})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* FUNCTION - Filtered by Tenant via junction table */}
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            Business Function
            {formState.tenant_id ? (
              <Badge variant="secondary" className="text-xs">
                {functionsForTenant.length} for selected tenant
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                {options.functions.length} available
              </Badge>
            )}
          </Label>
          {loadingDropdowns ? (
            <LoadingPlaceholder text="Loading functions..." />
          ) : (
            <Select value={formState.function_id || 'none'} onValueChange={handleFunctionChange}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    formState.tenant_id
                      ? 'Select function...'
                      : 'Select a tenant first or choose from all...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">All Functions</span>
                </SelectItem>
                {functionsForTenant.map((func) => (
                  <SelectItem key={func.id} value={func.id}>
                    {func.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!formState.tenant_id && (
            <p className="text-xs text-amber-600">Select a tenant to filter functions</p>
          )}
        </div>

        {/* DEPARTMENT - Filtered by Function */}
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            Department
            {formState.function_id ? (
              <Badge variant="secondary" className="text-xs">
                {departmentsForFunction.length} for selected function
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Select function first
              </Badge>
            )}
          </Label>
          {loadingDropdowns ? (
            <LoadingPlaceholder text="Loading departments..." />
          ) : (
            <Select
              value={formState.department_id || 'none'}
              onValueChange={handleDepartmentChange}
              disabled={!formState.function_id}
            >
              <SelectTrigger
                className={!formState.function_id ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <SelectValue
                  placeholder={
                    formState.function_id ? 'Select department...' : 'Select a function first...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">No Department (Skip)</span>
                </SelectItem>
                {departmentsForFunction.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!formState.function_id && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Select a function first to unlock department selection
            </p>
          )}
        </div>

        {/* ROLE - Filtered by Department */}
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            Role
            {formState.department_id ? (
              <Badge variant="secondary" className="text-xs">
                {rolesForDepartment.length} for selected department
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Select department first
              </Badge>
            )}
          </Label>
          {loadingDropdowns ? (
            <LoadingPlaceholder text="Loading roles..." />
          ) : (
            <Select
              value={formState.role_id || 'none'}
              onValueChange={handleRoleChange}
              disabled={!formState.department_id}
            >
              <SelectTrigger
                className={!formState.department_id ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <SelectValue
                  placeholder={
                    formState.department_id ? 'Select role...' : 'Select a department first...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">No Role (Skip)</span>
                </SelectItem>
                {rolesForDepartment.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!formState.department_id && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Select a department first to unlock role selection
            </p>
          )}
        </div>

        {/* Selection Summary */}
        {(formState.tenant_id ||
          formState.function_id ||
          formState.department_id ||
          formState.role_id) && (
          <SelectionSummary
            tenantId={formState.tenant_id}
            functionId={formState.function_id}
            departmentId={formState.department_id}
            roleId={formState.role_id}
            tenants={tenants}
            functions={options.functions}
            departments={options.departments}
            roles={options.roles}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function LoadingPlaceholder({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

interface SelectionSummaryProps {
  tenantId?: string;
  functionId?: string;
  departmentId?: string;
  roleId?: string;
  tenants: TenantOption[];
  functions: DropdownOption[];
  departments: DropdownOption[];
  roles: DropdownOption[];
}

function SelectionSummary({
  tenantId,
  functionId,
  departmentId,
  roleId,
  tenants,
  functions,
  departments,
  roles,
}: SelectionSummaryProps) {
  const tenantName = tenants.find((t) => t.id === tenantId)?.name;
  const functionName = functions.find((f) => f.id === functionId)?.name;
  const departmentName = departments.find((d) => d.id === departmentId)?.name;
  const roleName = roles.find((r) => r.id === roleId)?.name;

  return (
    <div className="p-3 bg-muted/50 rounded-lg space-y-1">
      <Label className="text-xs text-muted-foreground">Current Selection:</Label>
      <div className="flex flex-wrap gap-2 items-center">
        {tenantId && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Building2 className="h-3 w-3 mr-1" />
            {tenantName || 'Unknown'}
          </Badge>
        )}
        {functionId && (
          <Badge variant="outline">
            {tenantId && '→ '}
            {functionName || 'Unknown'}
          </Badge>
        )}
        {departmentId && (
          <Badge variant="outline">→ {departmentName || 'Unknown'}</Badge>
        )}
        {roleId && (
          <Badge variant="default">→ {roleName || 'Unknown'}</Badge>
        )}
      </div>
    </div>
  );
}
