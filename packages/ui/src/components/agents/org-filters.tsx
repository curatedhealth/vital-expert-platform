'use client';

/**
 * Org Structure Filters
 *
 * Reusable filter components for organizational hierarchy:
 * - Functions (L1)
 * - Departments (L2)
 * - Roles (L3)
 * - Agent Levels (L1-L5)
 *
 * Built with @vital/ui components following Brand Guidelines V6.
 */

import React from 'react';
import { Building2, Users, Briefcase, Layers, Check, X } from 'lucide-react';
import { Button } from '../button';
import { Badge } from '../badge';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Checkbox } from '../checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../command';
import { cn } from '../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface MultiSelectFilterProps {
  label: string;
  icon?: React.ElementType;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

// ============================================================================
// MULTI-SELECT FILTER (Base Component)
// ============================================================================

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const clearAll = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-9 justify-start', className)}
        >
          {Icon && <Icon className="h-4 w-4 mr-2 text-stone-500" />}
          <span className="text-stone-600">{label}</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOption(option.value)}
                      />
                      <span className="text-sm">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-stone-400 ml-auto">
                          ({option.count})
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selected.length > 0 && (
            <>
              <CommandSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="w-full justify-center text-stone-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear selection
                </Button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ============================================================================
// FUNCTION FILTER
// ============================================================================

export interface FunctionFilterProps {
  functions: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export const FunctionFilter: React.FC<FunctionFilterProps> = ({
  functions,
  selected,
  onChange,
  className,
}) => (
  <MultiSelectFilter
    label="Function"
    icon={Building2}
    options={functions}
    selected={selected}
    onChange={onChange}
    searchPlaceholder="Search functions..."
    emptyMessage="No functions found."
    className={className}
  />
);

// ============================================================================
// DEPARTMENT FILTER
// ============================================================================

export interface DepartmentFilterProps {
  departments: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  departments,
  selected,
  onChange,
  className,
}) => (
  <MultiSelectFilter
    label="Department"
    icon={Users}
    options={departments}
    selected={selected}
    onChange={onChange}
    searchPlaceholder="Search departments..."
    emptyMessage="No departments found."
    className={className}
  />
);

// ============================================================================
// ROLE FILTER
// ============================================================================

export interface RoleFilterProps {
  roles: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export const RoleFilter: React.FC<RoleFilterProps> = ({
  roles,
  selected,
  onChange,
  className,
}) => (
  <MultiSelectFilter
    label="Role"
    icon={Briefcase}
    options={roles}
    selected={selected}
    onChange={onChange}
    searchPlaceholder="Search roles..."
    emptyMessage="No roles found."
    className={className}
  />
);

// ============================================================================
// AGENT LEVEL FILTER
// ============================================================================

export type AgentLevelNumber = 1 | 2 | 3 | 4 | 5;

const LEVEL_CONFIG: Record<AgentLevelNumber, { label: string; color: string }> = {
  1: { label: 'L1 Master', color: 'bg-purple-100 text-purple-700' },
  2: { label: 'L2 Expert', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'L3 Specialist', color: 'bg-green-100 text-green-700' },
  4: { label: 'L4 Worker', color: 'bg-amber-100 text-amber-700' },
  5: { label: 'L5 Tool', color: 'bg-stone-100 text-stone-700' },
};

export interface AgentLevelFilterProps {
  selected: AgentLevelNumber[];
  onChange: (selected: AgentLevelNumber[]) => void;
  availableLevels?: AgentLevelNumber[];
  className?: string;
}

export const AgentLevelFilter: React.FC<AgentLevelFilterProps> = ({
  selected,
  onChange,
  availableLevels = [1, 2, 3, 4, 5],
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const toggleLevel = (level: AgentLevelNumber) => {
    const newSelected = selected.includes(level)
      ? selected.filter((l) => l !== level)
      : [...selected, level];
    onChange(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-9 justify-start', className)}
        >
          <Layers className="h-4 w-4 mr-2 text-stone-500" />
          <span className="text-stone-600">Level</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-1">
          {availableLevels.map((level) => {
            const config = LEVEL_CONFIG[level];
            const isSelected = selected.includes(level);
            return (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                  isSelected
                    ? 'bg-purple-50 text-purple-700'
                    : 'hover:bg-stone-100'
                )}
              >
                <Checkbox checked={isSelected} />
                <Badge className={cn('text-xs', config.color)}>
                  {config.label}
                </Badge>
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <div className="pt-2 mt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="w-full text-stone-500"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// ============================================================================
// COMBINED ORG FILTER BAR
// ============================================================================

export interface OrgFilterBarProps {
  functions?: FilterOption[];
  departments?: FilterOption[];
  roles?: FilterOption[];
  availableLevels?: AgentLevelNumber[];
  selectedFunctions?: string[];
  selectedDepartments?: string[];
  selectedRoles?: string[];
  selectedLevels?: AgentLevelNumber[];
  onFunctionsChange?: (selected: string[]) => void;
  onDepartmentsChange?: (selected: string[]) => void;
  onRolesChange?: (selected: string[]) => void;
  onLevelsChange?: (selected: AgentLevelNumber[]) => void;
  onClearAll?: () => void;
  className?: string;
}

export const OrgFilterBar: React.FC<OrgFilterBarProps> = ({
  functions = [],
  departments = [],
  roles = [],
  availableLevels,
  selectedFunctions = [],
  selectedDepartments = [],
  selectedRoles = [],
  selectedLevels = [],
  onFunctionsChange,
  onDepartmentsChange,
  onRolesChange,
  onLevelsChange,
  onClearAll,
  className,
}) => {
  const hasActiveFilters =
    selectedFunctions.length > 0 ||
    selectedDepartments.length > 0 ||
    selectedRoles.length > 0 ||
    selectedLevels.length > 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {functions.length > 0 && onFunctionsChange && (
        <FunctionFilter
          functions={functions}
          selected={selectedFunctions}
          onChange={onFunctionsChange}
        />
      )}
      {departments.length > 0 && onDepartmentsChange && (
        <DepartmentFilter
          departments={departments}
          selected={selectedDepartments}
          onChange={onDepartmentsChange}
        />
      )}
      {roles.length > 0 && onRolesChange && (
        <RoleFilter
          roles={roles}
          selected={selectedRoles}
          onChange={onRolesChange}
        />
      )}
      {onLevelsChange && (
        <AgentLevelFilter
          selected={selectedLevels}
          onChange={onLevelsChange}
          availableLevels={availableLevels}
        />
      )}
      {hasActiveFilters && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-stone-500 hover:text-stone-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
};

export default OrgFilterBar;
