'use client'

/**
 * GlobalFilters - Cascading Filter Sidebar for Value View
 *
 * Hierarchical filters following the VITAL ontology structure:
 * Tenant → Industry → Function → Department → Role → JTBD → Persona Archetype
 *
 * Features:
 * - Cascading filter logic (selecting parent resets children)
 * - Dynamic option loading based on parent selection
 * - Filter badge display
 * - Quick reset functionality
 */

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building,
  Building2,
  Factory,
  Users,
  Briefcase,
  Target,
  UserCircle,
  ChevronDown,
  ChevronRight,
  X,
  RotateCcw,
  Filter,
  Search,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useValueViewStore,
  type FilterState,
  type FilterOption,
} from '@/stores/valueViewStore'

// ═══════════════════════════════════════════════════════════════════
// FILTER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

interface FilterConfig {
  key: keyof FilterState
  label: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  bgClass: string
  description: string
  parentKey?: keyof FilterState
  apiEndpoint?: string
}

const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'tenant_id',
    label: 'Tenant',
    icon: Building,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Organization or client',
  },
  {
    key: 'function_id',
    label: 'Function',
    icon: Factory,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    description: 'Business function (Medical Affairs, R&D, etc.)',
    parentKey: 'tenant_id',
  },
  {
    key: 'department_id',
    label: 'Department',
    icon: Building2,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Department within function',
    parentKey: 'function_id',
  },
  {
    key: 'role_id',
    label: 'Role',
    icon: Briefcase,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'Job role or position',
    parentKey: 'department_id',
  },
  {
    key: 'jtbd_id',
    label: 'JTBD',
    icon: Target,
    colorClass: 'text-cyan-600',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
    description: 'Job-to-be-Done',
    parentKey: 'role_id',
  },
  {
    key: 'persona_archetype',
    label: 'Archetype',
    icon: UserCircle,
    colorClass: 'text-pink-600',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    description: 'Persona archetype (Automator, Orchestrator, etc.)',
  },
  {
    key: 'odi_tier',
    label: 'ODI Tier',
    icon: Sparkles,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Opportunity score tier',
  },
]

// ═══════════════════════════════════════════════════════════════════
// FILTER SELECT COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface FilterSelectProps {
  config: FilterConfig
  value: string
  options: FilterOption[]
  isLoading: boolean
  isDisabled: boolean
  onChange: (value: string) => void
  onClear: () => void
}

function FilterSelect({
  config,
  value,
  options,
  isLoading,
  isDisabled,
  onChange,
  onClear,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = config.icon
  const hasValue = value !== 'all'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <div className={cn('p-1.5 rounded-md', config.bgClass)}>
            <Icon className={cn('h-3.5 w-3.5', config.colorClass)} />
          </div>
          {config.label}
        </Label>
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Select
        value={value}
        onValueChange={onChange}
        disabled={isDisabled || isLoading}
      >
        <SelectTrigger
          className={cn(
            'w-full transition-all duration-200',
            hasValue && 'border-2',
            hasValue && config.colorClass.replace('text-', 'border-')
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder={`All ${config.label}s`} />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="text-muted-foreground">All {config.label}s</span>
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <div className="flex items-center justify-between w-full">
                <span>{option.name}</span>
                {option.count !== undefined && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {option.count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">{config.description}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVE FILTERS SUMMARY
// ═══════════════════════════════════════════════════════════════════

interface ActiveFiltersSummaryProps {
  filters: FilterState
  filterLabels: Record<string, string>
  onClearFilter: (key: keyof FilterState) => void
  onClearAll: () => void
}

function ActiveFiltersSummary({
  filters,
  filterLabels,
  onClearFilter,
  onClearAll,
}: ActiveFiltersSummaryProps) {
  const activeFilters = FILTER_CONFIGS.filter(
    (config) => filters[config.key] !== 'all'
  )

  if (activeFilters.length === 0) return null

  return (
    <div className="p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Active Filters ({activeFilters.length})
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onClearAll}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset All
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {activeFilters.map((config) => {
          const Icon = config.icon
          const label = filterLabels[config.key.replace('_id', '')] || filters[config.key]
          return (
            <Badge
              key={config.key}
              variant="secondary"
              className={cn(
                'pr-1 gap-1',
                config.bgClass,
                config.colorClass
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="max-w-[100px] truncate">{label}</span>
              <button
                onClick={() => onClearFilter(config.key)}
                className="ml-1 p-0.5 rounded hover:bg-white/50 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN GLOBAL FILTERS COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface GlobalFiltersProps {
  className?: string
  onFilterChange?: () => void
}

export function GlobalFilters({ className, onFilterChange }: GlobalFiltersProps) {
  const {
    filters,
    setFilter,
    resetFilters,
    filterOptions,
    setFilterOptions,
    filterLabels,
    setFilterLabel,
    getActiveFilterCount,
  } = useValueViewStore()

  // Loading states for dynamic options
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // Fetch options for a specific filter
  const fetchFilterOptions = useCallback(
    async (filterKey: keyof FilterState, parentValue?: string) => {
      setLoadingStates((prev) => ({ ...prev, [filterKey]: true }))

      try {
        let endpoint = ''
        let params = new URLSearchParams()

        switch (filterKey) {
          case 'tenant_id':
            endpoint = '/api/ontology-investigator/tenants'
            break
          case 'function_id':
            endpoint = '/api/ontology-investigator/hierarchy'
            break
          case 'department_id':
            endpoint = '/api/ontology-investigator/departments'
            if (filters.function_id !== 'all') {
              params.append('function_id', filters.function_id)
            }
            break
          case 'role_id':
            endpoint = '/api/ontology-investigator/roles'
            if (filters.department_id !== 'all') {
              params.append('department_id', filters.department_id)
            }
            break
          case 'jtbd_id':
            endpoint = '/api/ontology-investigator/jtbds'
            if (filters.role_id !== 'all') {
              params.append('role_id', filters.role_id)
            }
            if (filters.function_id !== 'all') {
              params.append('function_id', filters.function_id)
            }
            break
          default:
            return
        }

        const queryString = params.toString()
        const url = queryString ? `${endpoint}?${queryString}` : endpoint

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()

          // Map response to options
          let options: FilterOption[] = []
          switch (filterKey) {
            case 'tenant_id':
              options = (data.tenants || []).map((t: any) => ({
                id: t.id,
                name: t.name || t.display_name,
              }))
              break
            case 'function_id':
              options = (data.functions || []).map((f: any) => ({
                id: f.id || f.slug,
                name: f.name,
                slug: f.slug,
                count: f.department_count,
              }))
              break
            case 'department_id':
              options = (data.departments || []).map((d: any) => ({
                id: d.id,
                name: d.name,
                count: d.role_count,
              }))
              break
            case 'role_id':
              options = (data.roles || []).map((r: any) => ({
                id: r.id,
                name: r.name || r.title,
                count: r.agent_count,
              }))
              break
            case 'jtbd_id':
              options = (data.jtbds || []).slice(0, 50).map((j: any) => ({
                id: j.id,
                name: j.name || j.job_statement?.substring(0, 50) || 'Unknown',
              }))
              break
          }

          setFilterOptions({ [filterKey.replace('_id', 's')]: options })
        }
      } catch (err) {
        console.error(`Error fetching ${filterKey} options:`, err)
      } finally {
        setLoadingStates((prev) => ({ ...prev, [filterKey]: false }))
      }
    },
    [filters, setFilterOptions]
  )

  // Initial load of top-level options
  useEffect(() => {
    fetchFilterOptions('tenant_id')
    fetchFilterOptions('function_id')
  }, [])

  // Fetch dependent options when parent changes
  useEffect(() => {
    if (filters.function_id !== 'all') {
      fetchFilterOptions('department_id')
    }
  }, [filters.function_id])

  useEffect(() => {
    if (filters.department_id !== 'all') {
      fetchFilterOptions('role_id')
    }
  }, [filters.department_id])

  useEffect(() => {
    if (filters.role_id !== 'all' || filters.function_id !== 'all') {
      fetchFilterOptions('jtbd_id')
    }
  }, [filters.role_id, filters.function_id])

  // Handle filter change
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string, label?: string) => {
      setFilter(key, value)
      if (label && value !== 'all') {
        setFilterLabel(key.replace('_id', ''), label)
      }
      onFilterChange?.()
    },
    [setFilter, setFilterLabel, onFilterChange]
  )

  // Handle clear single filter
  const handleClearFilter = useCallback(
    (key: keyof FilterState) => {
      setFilter(key, 'all')
      onFilterChange?.()
    },
    [setFilter, onFilterChange]
  )

  // Handle clear all
  const handleClearAll = useCallback(() => {
    resetFilters()
    onFilterChange?.()
  }, [resetFilters, onFilterChange])

  // Get options for each filter
  const getOptions = (key: keyof FilterState): FilterOption[] => {
    switch (key) {
      case 'tenant_id':
        return filterOptions.tenants
      case 'function_id':
        return filterOptions.functions
      case 'department_id':
        return filterOptions.departments
      case 'role_id':
        return filterOptions.roles
      case 'jtbd_id':
        return filterOptions.jtbds
      case 'persona_archetype':
        return filterOptions.archetypes
      case 'odi_tier':
        return filterOptions.odiTiers
      default:
        return []
    }
  }

  // Check if filter should be disabled
  const isFilterDisabled = (config: FilterConfig): boolean => {
    if (!config.parentKey) return false
    return filters[config.parentKey] === 'all'
  }

  const activeCount = getActiveFilterCount()

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeCount}
              </Badge>
            )}
          </h3>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeCount > 0 && (
        <div className="flex-shrink-0 p-4 border-b">
          <ActiveFiltersSummary
            filters={filters}
            filterLabels={filterLabels}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAll}
          />
        </div>
      )}

      {/* Filter Controls */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {FILTER_CONFIGS.map((config) => (
            <FilterSelect
              key={config.key}
              config={config}
              value={filters[config.key]}
              options={getOptions(config.key)}
              isLoading={loadingStates[config.key] || false}
              isDisabled={isFilterDisabled(config)}
              onChange={(value) => {
                const option = getOptions(config.key).find((o) => o.id === value)
                handleFilterChange(config.key, value, option?.name)
              }}
              onClear={() => handleClearFilter(config.key)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Filters apply to all tabs: Overview, Opportunities, and Insights
        </p>
      </div>
    </div>
  )
}

export default GlobalFilters
