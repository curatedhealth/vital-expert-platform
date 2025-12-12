'use client';

/**
 * AgentQuickFilters - Simplified filter controls for agent views
 *
 * Provides search, status, and tier filtering with @vital/ui components.
 * Used in Agent Builder sidebar and can be reused in Agents view.
 */

import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../input';
import { Label } from '../label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { Button } from '../button';

export type QuickStatusFilter = 'all' | 'active' | 'inactive' | 'draft';
/** @deprecated Use QuickLevelFilter instead */
export type QuickTierFilter = 'all' | '1' | '2' | '3' | '4' | '5';
export type QuickLevelFilter = 'all' | '1' | '2' | '3' | '4' | '5';
export type ViewMode = 'grid' | 'list';

export interface AgentQuickFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: QuickStatusFilter;
  onStatusChange: (status: QuickStatusFilter) => void;
  /** Agent level filter (1-5) */
  levelFilter: QuickLevelFilter;
  onLevelChange: (level: QuickLevelFilter) => void;
  /** @deprecated Use levelFilter/onLevelChange */
  tierFilter?: QuickTierFilter;
  /** @deprecated Use levelFilter/onLevelChange */
  onTierChange?: (tier: QuickTierFilter) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  className?: string;
}

/**
 * AgentQuickFilters - Search, status, level, and view mode controls
 *
 * @example
 * <AgentQuickFilters
 *   searchQuery={search}
 *   onSearchChange={setSearch}
 *   statusFilter={status}
 *   onStatusChange={setStatus}
 *   levelFilter={level}
 *   onLevelChange={setLevel}
 *   viewMode={view}
 *   onViewModeChange={setView}
 *   showViewToggle
 * />
 */
export const AgentQuickFilters: React.FC<AgentQuickFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  levelFilter,
  onLevelChange,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = false,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 bg-white"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-1.5">
        <Label className="text-xs text-stone-600">Status</Label>
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as QuickStatusFilter)}
        >
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Level Filter */}
      <div className="space-y-1.5">
        <Label className="text-xs text-stone-600">Level</Label>
        <Select
          value={levelFilter}
          onValueChange={(v) => onLevelChange(v as QuickLevelFilter)}
        >
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="1">L1 Master</SelectItem>
            <SelectItem value="2">L2 Expert</SelectItem>
            <SelectItem value="3">L3 Specialist</SelectItem>
            <SelectItem value="4">L4 Worker</SelectItem>
            <SelectItem value="5">L5 Tool</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Mode Toggle */}
      {showViewToggle && onViewModeChange && (
        <div className="space-y-1.5">
          <Label className="text-xs text-stone-600">View</Label>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="flex-1"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="flex-1"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

AgentQuickFilters.displayName = 'AgentQuickFilters';

export default AgentQuickFilters;
