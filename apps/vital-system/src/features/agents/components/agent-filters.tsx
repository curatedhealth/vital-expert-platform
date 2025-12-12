/**
 * AgentFilters Component
 * Multi-select filters for agents (levels, functions, departments, roles)
 *
 * Uses shadcn/ui Popover + Command for searchable multi-select
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  __Popover as Popover,
  __PopoverContent as PopoverContent,
  __PopoverTrigger as PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { LevelBadge } from './level-badge';
import { useAgentStore } from '../stores/agent-store';
import type { AgentLevelNumber } from '../types/agent.types';
import { Filter, X, CheckCircle2 } from 'lucide-react';

// ============================================================================
// FILTER OPTIONS DERIVATION
// ============================================================================

/**
 * Derive unique filter options from agent data
 */
const useFilterOptions = () => {
  const agents = useAgentStore((state) => state.agents);

  return React.useMemo(() => {
    const levels = new Set<AgentLevelNumber>();
    const functions = new Set<string>();
    const departments = new Set<string>();
    const roles = new Set<string>();

    agents.forEach((agent) => {
      // Levels
      if (agent.agent_levels?.level_number) {
        levels.add(agent.agent_levels.level_number);
      }

      // Functions
      if (agent.function_name) {
        functions.add(agent.function_name);
      }

      // Departments
      if (agent.department_name) {
        departments.add(agent.department_name);
      }

      // Roles
      if (agent.role_name) {
        roles.add(agent.role_name);
      }
    });

    return {
      levels: Array.from(levels).sort((a, b) => a - b),
      functions: Array.from(functions).sort(),
      departments: Array.from(departments).sort(),
      roles: Array.from(roles).sort(),
    };
  }, [agents]);
};

// ============================================================================
// AGENT FILTERS COMPONENT
// ============================================================================

export interface AgentFiltersProps {
  className?: string;
}

/**
 * AgentFilters - Multi-select filters with searchable dropdowns
 *
 * @example
 * <AgentFilters />
 */
export const AgentFilters: React.FC<AgentFiltersProps> = ({ className }) => {
  const [open, setOpen] = React.useState(false);
  const filters = useAgentStore((state) => state.filters);
  const updateFilters = useAgentStore((state) => state.updateFilters);
  const resetFilters = useAgentStore((state) => state.resetFilters);

  const filterOptions = useFilterOptions();

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.levels && filters.levels.length > 0) count++;
    if (filters.functions && filters.functions.length > 0) count++;
    if (filters.departments && filters.departments.length > 0) count++;
    if (filters.roles && filters.roles.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    return count;
  }, [filters]);

  // Toggle level filter
  const toggleLevel = (level: AgentLevelNumber) => {
    const currentLevels = filters.levels || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];
    updateFilters({ levels: newLevels.length > 0 ? newLevels : undefined });
  };

  // Toggle function filter
  const toggleFunction = (func: string) => {
    const currentFunctions = filters.functions || [];
    const newFunctions = currentFunctions.includes(func)
      ? currentFunctions.filter((f) => f !== func)
      : [...currentFunctions, func];
    updateFilters({
      functions: newFunctions.length > 0 ? newFunctions : undefined,
    });
  };

  // Toggle department filter
  const toggleDepartment = (dept: string) => {
    const currentDepartments = filters.departments || [];
    const newDepartments = currentDepartments.includes(dept)
      ? currentDepartments.filter((d) => d !== dept)
      : [...currentDepartments, dept];
    updateFilters({
      departments: newDepartments.length > 0 ? newDepartments : undefined,
    });
  };

  // Toggle role filter
  const toggleRole = (role: string) => {
    const currentRoles = filters.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    updateFilters({
      roles: newRoles.length > 0 ? newRoles : undefined,
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    resetFilters();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('relative', className)}
          aria-label="Filter agents"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search filters..." />
          <CommandList>
            <CommandEmpty>No filters found.</CommandEmpty>

            {/* LEVEL FILTERS */}
            {filterOptions.levels.length > 0 && (
              <>
                <CommandGroup heading="Agent Level">
                  {filterOptions.levels.map((level) => {
                    const isSelected = filters.levels?.includes(level);
                    return (
                      <CommandItem
                        key={level}
                        onSelect={() => toggleLevel(level)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleLevel(level)}
                            aria-label={`Filter by level ${level}`}
                          />
                          <LevelBadge level={level} size="sm" showLabel />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* FUNCTION FILTERS */}
            {filterOptions.functions.length > 0 && (
              <>
                <CommandGroup heading="Function">
                  {filterOptions.functions.map((func) => {
                    const isSelected = filters.functions?.includes(func);
                    return (
                      <CommandItem
                        key={func}
                        onSelect={() => toggleFunction(func)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleFunction(func)}
                            aria-label={`Filter by function ${func}`}
                          />
                          <span className="text-sm">{func}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* DEPARTMENT FILTERS */}
            {filterOptions.departments.length > 0 && (
              <>
                <CommandGroup heading="Department">
                  {filterOptions.departments.map((dept) => {
                    const isSelected = filters.departments?.includes(dept);
                    return (
                      <CommandItem
                        key={dept}
                        onSelect={() => toggleDepartment(dept)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDepartment(dept)}
                            aria-label={`Filter by department ${dept}`}
                          />
                          <span className="text-sm">{dept}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* ROLE FILTERS */}
            {filterOptions.roles.length > 0 && (
              <>
                <CommandGroup heading="Role">
                  {filterOptions.roles.map((role) => {
                    const isSelected = filters.roles?.includes(role);
                    return (
                      <CommandItem
                        key={role}
                        onSelect={() => toggleRole(role)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRole(role)}
                            aria-label={`Filter by role ${role}`}
                          />
                          <span className="text-sm">{role}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>

          {/* FOOTER WITH CLEAR ALL */}
          {activeFilterCount > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

AgentFilters.displayName = 'AgentFilters';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentFilters;
