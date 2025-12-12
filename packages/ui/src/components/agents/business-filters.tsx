'use client';

/**
 * Business Filters
 *
 * Reusable filter components for business context:
 * - Industry Filter
 * - Tenant Filter
 * - Status Filter
 * - Tier Filter
 *
 * Built with @vital/ui components following Brand Guidelines V6.
 */

import React from 'react';
import {
  Factory,
  Building,
  Activity,
  Sparkles,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '../button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../command';
import { cn } from '../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
}

// ============================================================================
// INDUSTRY FILTER
// ============================================================================

export const INDUSTRY_OPTIONS: SelectOption[] = [
  { value: 'pharmaceutical', label: 'Pharmaceutical', icon: Factory },
  { value: 'biotech', label: 'Biotechnology', icon: Factory },
  { value: 'medical_device', label: 'Medical Device', icon: Factory },
  { value: 'healthcare', label: 'Healthcare', icon: Building },
  { value: 'digital_health', label: 'Digital Health', icon: Sparkles },
  { value: 'cro', label: 'CRO', icon: Building },
  { value: 'consulting', label: 'Consulting', icon: Building },
];

export interface IndustryFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  showAll?: boolean;
}

export const IndustryFilter: React.FC<IndustryFilterProps> = ({
  value,
  onChange,
  options = INDUSTRY_OPTIONS,
  placeholder = 'All Industries',
  className,
  showAll = true,
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={cn('w-[180px]', className)}>
      <Factory className="h-4 w-4 mr-2 text-stone-500" />
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {showAll && <SelectItem value="all">All Industries</SelectItem>}
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// ============================================================================
// TENANT FILTER
// ============================================================================

export interface TenantOption {
  id: string;
  name: string;
  industry?: string;
  logo?: string;
}

export interface TenantFilterProps {
  value: string;
  onChange: (value: string) => void;
  tenants: TenantOption[];
  placeholder?: string;
  className?: string;
  showAll?: boolean;
}

export const TenantFilter: React.FC<TenantFilterProps> = ({
  value,
  onChange,
  tenants,
  placeholder = 'Select tenant',
  className,
  showAll = true,
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedTenant = tenants.find((t) => t.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-9 justify-between min-w-[180px]', className)}
        >
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-stone-500" />
            <span className="text-stone-600">
              {selectedTenant?.name || placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-stone-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tenants..." />
          <CommandList>
            <CommandEmpty>No tenants found.</CommandEmpty>
            <CommandGroup>
              {showAll && (
                <CommandItem
                  onSelect={() => {
                    onChange('all');
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <span className="text-sm">All Tenants</span>
                  {value === 'all' && <Check className="h-4 w-4 ml-auto" />}
                </CommandItem>
              )}
              {tenants.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  onSelect={() => {
                    onChange(tenant.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {tenant.logo ? (
                      <img
                        src={tenant.logo}
                        alt={tenant.name}
                        className="h-5 w-5 rounded"
                      />
                    ) : (
                      <Building className="h-4 w-4 text-stone-400" />
                    )}
                    <div>
                      <span className="text-sm">{tenant.name}</span>
                      {tenant.industry && (
                        <span className="text-xs text-stone-400 ml-2">
                          {tenant.industry}
                        </span>
                      )}
                    </div>
                  </div>
                  {value === tenant.id && <Check className="h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ============================================================================
// STATUS FILTER (Enhanced)
// ============================================================================

export type AgentStatus = 'all' | 'active' | 'inactive' | 'draft' | 'error';

export const STATUS_OPTIONS: { value: AgentStatus; label: string; color: string }[] = [
  { value: 'all', label: 'All Statuses', color: 'text-stone-600' },
  { value: 'active', label: 'Active', color: 'text-green-600' },
  { value: 'inactive', label: 'Inactive', color: 'text-stone-400' },
  { value: 'draft', label: 'Draft', color: 'text-amber-600' },
  { value: 'error', label: 'Error', color: 'text-red-600' },
];

export interface StatusFilterProps {
  value: AgentStatus;
  onChange: (value: AgentStatus) => void;
  options?: typeof STATUS_OPTIONS;
  className?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  options = STATUS_OPTIONS,
  className,
}) => (
  <Select value={value} onValueChange={(v) => onChange(v as AgentStatus)}>
    <SelectTrigger className={cn('w-[150px]', className)}>
      <Activity className="h-4 w-4 mr-2 text-stone-500" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          <span className={option.color}>{option.label}</span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// ============================================================================
// TIER FILTER
// ============================================================================

export type AgentTier = 'all' | '1' | '2' | '3';

export const TIER_OPTIONS: { value: AgentTier; label: string; description: string }[] = [
  { value: 'all', label: 'All Tiers', description: 'Show all agents' },
  { value: '1', label: 'Tier 1', description: 'Foundational agents' },
  { value: '2', label: 'Tier 2', description: 'Specialist agents' },
  { value: '3', label: 'Tier 3', description: 'Ultra-specialist agents' },
];

export interface TierFilterProps {
  value: AgentTier;
  onChange: (value: AgentTier) => void;
  options?: typeof TIER_OPTIONS;
  className?: string;
}

export const TierFilter: React.FC<TierFilterProps> = ({
  value,
  onChange,
  options = TIER_OPTIONS,
  className,
}) => (
  <Select value={value} onValueChange={(v) => onChange(v as AgentTier)}>
    <SelectTrigger className={cn('w-[160px]', className)}>
      <Sparkles className="h-4 w-4 mr-2 text-stone-500" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          <div className="flex flex-col">
            <span>{option.label}</span>
            <span className="text-xs text-stone-400">{option.description}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// ============================================================================
// COMBINED BUSINESS FILTER BAR
// ============================================================================

export interface BusinessFilterBarProps {
  // Industry
  industry?: string;
  onIndustryChange?: (value: string) => void;
  industryOptions?: SelectOption[];
  // Tenant
  tenant?: string;
  onTenantChange?: (value: string) => void;
  tenants?: TenantOption[];
  // Status
  status?: AgentStatus;
  onStatusChange?: (value: AgentStatus) => void;
  // Tier
  tier?: AgentTier;
  onTierChange?: (value: AgentTier) => void;
  // General
  onClearAll?: () => void;
  className?: string;
}

export const BusinessFilterBar: React.FC<BusinessFilterBarProps> = ({
  industry,
  onIndustryChange,
  industryOptions,
  tenant,
  onTenantChange,
  tenants = [],
  status,
  onStatusChange,
  tier,
  onTierChange,
  onClearAll,
  className,
}) => {
  const hasActiveFilters =
    (industry && industry !== 'all') ||
    (tenant && tenant !== 'all') ||
    (status && status !== 'all') ||
    (tier && tier !== 'all');

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {onIndustryChange && (
        <IndustryFilter
          value={industry || 'all'}
          onChange={onIndustryChange}
          options={industryOptions}
        />
      )}
      {onTenantChange && tenants.length > 0 && (
        <TenantFilter
          value={tenant || 'all'}
          onChange={onTenantChange}
          tenants={tenants}
        />
      )}
      {onStatusChange && (
        <StatusFilter value={status || 'all'} onChange={onStatusChange} />
      )}
      {onTierChange && (
        <TierFilter value={tier || 'all'} onChange={onTierChange} />
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

export default BusinessFilterBar;
