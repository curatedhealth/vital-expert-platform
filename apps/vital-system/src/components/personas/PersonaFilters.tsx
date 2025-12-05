'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import type { PersonaFilters as PersonaFiltersType, Persona } from './types';

interface PersonaFiltersProps {
  filters: PersonaFiltersType;
  onFiltersChange: (filters: PersonaFiltersType) => void;
  personas: Persona[];
  filteredCount: number;
  totalCount: number;
}

export function PersonaFilters({
  filters,
  onFiltersChange,
  personas,
  filteredCount,
  totalCount,
}: PersonaFiltersProps) {
  const getUniqueRoles = () => {
    const roles = new Set(personas.map(p => p.role_slug).filter(Boolean));
    return Array.from(roles).sort();
  };

  const getUniqueDepartments = () => {
    const departments = new Set(personas.map(p => p.department_slug).filter(Boolean));
    return Array.from(departments).sort();
  };

  const getUniqueFunctions = () => {
    const functions = new Set(personas.map(p => p.function_slug).filter(Boolean));
    return Array.from(functions).sort();
  };

  const getUniqueSeniorityLevels = () => {
    const levels = new Set(personas.map(p => p.seniority_level).filter(Boolean));
    return Array.from(levels).sort();
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

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search personas by name, title, tagline, role, function, or tags..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={filters.selectedRole}
                onChange={(e) => onFiltersChange({ ...filters, selectedRole: e.target.value })}
                className="w-full px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
              >
                <option value="all">All Roles</option>
                {getUniqueRoles().map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                value={filters.selectedDepartment}
                onChange={(e) => onFiltersChange({ ...filters, selectedDepartment: e.target.value })}
                className="w-full px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
              >
                <option value="all">All Departments</option>
                {getUniqueDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Function Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Function</label>
              <select
                value={filters.selectedFunction}
                onChange={(e) => onFiltersChange({ ...filters, selectedFunction: e.target.value })}
                className="w-full px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
              >
                <option value="all">All Functions</option>
                {getUniqueFunctions().map(func => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </select>
            </div>

            {/* Seniority Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Seniority</label>
              <select
                value={filters.selectedSeniority}
                onChange={(e) => onFiltersChange({ ...filters, selectedSeniority: e.target.value })}
                className="w-full px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
              >
                <option value="all">All Levels</option>
                {getUniqueSeniorityLevels().map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-neutral-500">
          Showing {filteredCount} of {totalCount} personas
        </div>
      </CardContent>
    </Card>
  );
}

