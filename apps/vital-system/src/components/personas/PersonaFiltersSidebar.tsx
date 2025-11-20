'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { HierarchicalOrgFilter, type OrgStructure } from './HierarchicalOrgFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PersonaFilters as PersonaFiltersType } from './types';

interface PersonaFiltersSidebarProps {
  filters: PersonaFiltersType;
  onFiltersChange: (filters: PersonaFiltersType) => void;
  filteredCount: number;
  totalCount: number;
}

export function PersonaFiltersSidebar({
  filters,
  onFiltersChange,
  filteredCount,
  totalCount,
}: PersonaFiltersSidebarProps) {
  const [orgStructure, setOrgStructure] = useState<OrgStructure | null>(null);
  const [loadingOrgStructure, setLoadingOrgStructure] = useState(true);
  const [orgStructureError, setOrgStructureError] = useState<string | null>(null);

  useEffect(() => {
    loadOrgStructure();
  }, []);

  const loadOrgStructure = async () => {
    try {
      setLoadingOrgStructure(true);
      setOrgStructureError(null);
      console.log('[PersonaFiltersSidebar] Fetching org structure...');
      const response = await fetch('/api/org-structure');
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg = `Failed to fetch org structure: ${response.status} ${errorText}`;
        console.error('[PersonaFiltersSidebar]', errorMsg);
        setOrgStructureError(errorMsg);
        return;
      }

      const data = await response.json();
      console.log('[PersonaFiltersSidebar] Org structure loaded:', {
        functionsCount: data.data?.functions?.length || 0,
        departmentsCount: data.data?.departments?.length || 0,
        rolesCount: data.data?.roles?.length || 0,
      });

      if (data.success && data.data) {
        // Ensure we have the expected structure
        const orgData = {
          functions: data.data.functions || [],
          departments: data.data.departments || [],
          roles: data.data.roles || [],
          departmentsByFunction: data.data.departmentsByFunction || {},
          rolesByDepartment: data.data.rolesByDepartment || {},
          rolesByFunction: data.data.rolesByFunction || {},
        };
        console.log('[PersonaFiltersSidebar] Org structure set:', {
          functionsCount: orgData.functions.length,
          departmentsCount: orgData.departments.length,
          rolesCount: orgData.roles.length,
        });
        setOrgStructure(orgData);
        setOrgStructureError(null);
      } else {
        const errorMsg = data.error || 'API returned success=false or no data';
        console.warn('[PersonaFiltersSidebar]', errorMsg, data);
        setOrgStructureError(errorMsg);
        // Set empty structure to avoid errors
        setOrgStructure({
          functions: [],
          departments: [],
          roles: [],
          departmentsByFunction: {},
          rolesByDepartment: {},
          rolesByFunction: {},
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error loading org structure';
      console.error('[PersonaFiltersSidebar] Error loading org structure:', error);
      setOrgStructureError(errorMsg);
    } finally {
      setLoadingOrgStructure(false);
    }
  };

  const getUniqueSeniorityLevels = () => {
    // This will be populated from personas data if needed
    // For now, return common seniority levels
    return ['entry', 'mid-level', 'senior', 'director', 'executive', 'c-suite'];
  };

  const handleReset = () => {
    onFiltersChange({
      searchQuery: '',
      selectedRole: 'all',
      selectedDepartment: 'all',
      selectedFunction: 'all',
      selectedSeniority: 'all',
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.selectedRole !== 'all' ||
    filters.selectedDepartment !== 'all' ||
    filters.selectedFunction !== 'all' ||
    filters.selectedSeniority !== 'all';

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Filters</h2>
        <p className="text-sm text-gray-500">
          {filteredCount} of {totalCount} personas
        </p>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search personas..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="pl-10"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hierarchical Org Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Organization</Label>
        {orgStructureError && (
          <div className="text-xs text-red-500 mb-2 p-2 bg-red-50 rounded">
            {orgStructureError}
          </div>
        )}
        <HierarchicalOrgFilter
          selectedFunction={filters.selectedFunction}
          selectedDepartment={filters.selectedDepartment}
          selectedRole={filters.selectedRole}
          onFunctionChange={(value) => onFiltersChange({ ...filters, selectedFunction: value })}
          onDepartmentChange={(value) => onFiltersChange({ ...filters, selectedDepartment: value })}
          onRoleChange={(value) => onFiltersChange({ ...filters, selectedRole: value })}
          orgStructure={orgStructure || undefined}
          loading={loadingOrgStructure}
        />
        {!loadingOrgStructure && orgStructure && (
          <div className="text-xs text-gray-500 mt-2">
            {orgStructure.functions.length} functions, {orgStructure.departments.length} departments, {orgStructure.roles.length} roles
          </div>
        )}
      </div>

      {/* Seniority Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Seniority</Label>
        <Select
          value={filters.selectedSeniority}
          onValueChange={(value) => onFiltersChange({ ...filters, selectedSeniority: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {getUniqueSeniorityLevels().map((level) => (
              <SelectItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="w-full"
          size="sm"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
}

