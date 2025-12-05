'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface OrgStructure {
  functions: Array<{ id: string; name: string; function_code?: string; description?: string }>;
  departments: Array<{ id: string; name: string; department_code?: string; function_id?: string; description?: string }>;
  roles: Array<{ id: string; name: string; role_code?: string; department_id?: string; function_id?: string; level?: string; description?: string }>;
  departmentsByFunction: Record<string, Array<{ id: string; name: string; department_code?: string; function_id?: string }>>;
  rolesByDepartment: Record<string, Array<{ id: string; name: string; role_code?: string; department_id?: string; function_id?: string }>>;
  rolesByFunction: Record<string, Array<{ id: string; name: string; role_code?: string; department_id?: string; function_id?: string }>>;
}

interface HierarchicalOrgFilterProps {
  selectedFunction: string;
  selectedDepartment: string;
  selectedRole: string;
  onFunctionChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  orgStructure?: OrgStructure;
  loading?: boolean;
}

export function HierarchicalOrgFilter({
  selectedFunction,
  selectedDepartment,
  selectedRole,
  onFunctionChange,
  onDepartmentChange,
  onRoleChange,
  orgStructure,
  loading = false,
}: HierarchicalOrgFilterProps) {
  // Debug logging - must be before any conditional returns
  React.useEffect(() => {
    if (orgStructure) {
      console.log('[HierarchicalOrgFilter] Org structure received:', {
        functionsCount: orgStructure.functions?.length || 0,
        departmentsCount: orgStructure.departments?.length || 0,
        rolesCount: orgStructure.roles?.length || 0,
      });
    }
  }, [orgStructure]);

  // Get available departments based on selected function
  const availableDepartments = React.useMemo(() => {
    if (!orgStructure || selectedFunction === 'all') {
      return orgStructure?.departments || [];
    }
    // Use function_id directly to get departments
    return orgStructure.departmentsByFunction[selectedFunction] || [];
  }, [orgStructure, selectedFunction]);

  // Get available roles based on selected department
  const availableRoles = React.useMemo(() => {
    if (!orgStructure) return [];
    
    if (selectedDepartment !== 'all') {
      // Use department_id directly to get roles
      return orgStructure.rolesByDepartment[selectedDepartment] || [];
    }
    
    // If no department selected but function is selected, show roles from that function
    if (selectedFunction !== 'all') {
      return orgStructure.rolesByFunction[selectedFunction] || [];
    }
    
    return orgStructure.roles || [];
  }, [orgStructure, selectedDepartment, selectedFunction]);

  // Reset dependent filters when parent changes
  const handleFunctionChange = (value: string) => {
    onFunctionChange(value);
    if (value === 'all' || !orgStructure?.departmentsByFunction[value]?.some(d => d.id === selectedDepartment)) {
      onDepartmentChange('all');
      onRoleChange('all');
    }
  };

  const handleDepartmentChange = (value: string) => {
    onDepartmentChange(value);
    if (value === 'all' || !orgStructure?.rolesByDepartment[value]?.some(r => r.id === selectedRole)) {
      onRoleChange('all');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Function</Label>
          <div className="h-10 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <div className="h-10 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <div className="h-10 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Function Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Function</Label>
        <Select value={selectedFunction} onValueChange={handleFunctionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Functions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Functions</SelectItem>
            {(orgStructure?.functions || []).map((func) => (
              <SelectItem key={func.id} value={func.id}>
                {func.name || func.function_code || 'Unnamed Function'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {orgStructure && orgStructure.functions && orgStructure.functions.length === 0 && (
          <p className="text-xs text-neutral-500">No functions available</p>
        )}
      </div>

      {/* Department Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Department</Label>
        <Select 
          value={selectedDepartment} 
          onValueChange={handleDepartmentChange}
          disabled={selectedFunction === 'all' && (orgStructure?.departments || []).length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {availableDepartments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Role Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Role</Label>
        <Select 
          value={selectedRole} 
          onValueChange={onRoleChange}
          disabled={selectedDepartment === 'all' && selectedFunction === 'all' && (orgStructure?.roles || []).length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {availableRoles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

