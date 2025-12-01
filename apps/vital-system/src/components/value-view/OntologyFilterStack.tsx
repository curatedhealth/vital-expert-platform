'use client'

/**
 * OntologyFilterStack - Unified 8-Layer Filter & Navigation System
 *
 * Combines the 8-layer semantic ontology visualization WITH cascading filters.
 * Each layer acts as both a visualization AND a filter selector.
 *
 * Layer Mapping to Filters:
 * - L0: Industry/Tenant (top-level context)
 * - L1: Strategic Pillars (optional)
 * - L2: Functions → Departments
 * - L3: Roles → Personas
 * - L4: Jobs-to-be-Done
 * - L5: Outcomes/ODI Scoring
 * - L6: Workflows
 * - L7: Value Metrics / Agents
 *
 * Selection cascades downward - selecting a Function filters Departments, etc.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronDown,
  Database,
  Target,
  Building2,
  Users,
  Briefcase,
  BarChart3,
  GitBranch,
  DollarSign,
  Check,
  X,
  RotateCcw,
  Loader2,
  Search,
  Factory,
  Bot,
  PanelLeftClose,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useValueViewStore,
  type LayerKey,
  type FilterState,
  type FilterOption,
} from '@/stores/valueViewStore'

// ═══════════════════════════════════════════════════════════════════
// LAYER CONFIGURATION WITH FILTER MAPPING
// ═══════════════════════════════════════════════════════════════════

interface LayerConfig {
  key: LayerKey
  filterKey?: keyof FilterState
  fullName: string
  shortName: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  description: string
  parentFilterKey?: keyof FilterState
  isFilterable: boolean
}

const LAYER_CONFIGS: LayerConfig[] = [
  {
    key: 'L0',
    filterKey: 'tenant_id',
    fullName: 'Domain Knowledge',
    shortName: 'Industry',
    icon: Database,
    color: '#7C3AED',
    bgColor: 'rgba(124,58,237,0.1)',
    borderColor: 'rgba(124,58,237,0.3)',
    description: 'Industry, Therapeutic Areas, Products',
    isFilterable: true,
  },
  {
    key: 'L1',
    fullName: 'Strategic Pillars',
    shortName: 'Strategy',
    icon: Target,
    color: '#2563EB',
    bgColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.3)',
    description: 'OKRs, Strategic Themes',
    isFilterable: false,
  },
  {
    key: 'L2',
    filterKey: 'function_id',
    fullName: 'Functions',
    shortName: 'Functions',
    icon: Factory,
    color: '#059669',
    bgColor: 'rgba(5,150,105,0.1)',
    borderColor: 'rgba(5,150,105,0.3)',
    description: 'Business Functions & Departments',
    parentFilterKey: 'tenant_id',
    isFilterable: true,
  },
  {
    key: 'L3',
    filterKey: 'role_id',
    fullName: 'Roles & Personas',
    shortName: 'Roles',
    icon: Users,
    color: '#EA580C',
    bgColor: 'rgba(234,88,12,0.1)',
    borderColor: 'rgba(234,88,12,0.3)',
    description: 'Job Roles & Persona Archetypes',
    parentFilterKey: 'function_id',
    isFilterable: true,
  },
  {
    key: 'L4',
    filterKey: 'jtbd_id',
    fullName: 'Jobs-to-be-Done',
    shortName: 'JTBDs',
    icon: Briefcase,
    color: '#0891B2',
    bgColor: 'rgba(8,145,178,0.1)',
    borderColor: 'rgba(8,145,178,0.3)',
    description: 'Tasks, Goals, Workflows',
    parentFilterKey: 'role_id',
    isFilterable: true,
  },
  {
    key: 'L5',
    filterKey: 'odi_tier',
    fullName: 'Outcomes / ODI',
    shortName: 'ODI',
    icon: BarChart3,
    color: '#DB2777',
    bgColor: 'rgba(219,39,119,0.1)',
    borderColor: 'rgba(219,39,119,0.3)',
    description: 'Importance, Satisfaction, Opportunity Score',
    isFilterable: true,
  },
  {
    key: 'L6',
    fullName: 'Workflows',
    shortName: 'Workflows',
    icon: GitBranch,
    color: '#4F46E5',
    bgColor: 'rgba(79,70,229,0.1)',
    borderColor: 'rgba(79,70,229,0.3)',
    description: 'Process Flows with Human-in-the-Loop',
    isFilterable: false,
  },
  {
    key: 'L7',
    filterKey: 'agent_status',
    fullName: 'AI Agents',
    shortName: 'Agents',
    icon: Bot,
    color: '#D97706',
    bgColor: 'rgba(217,119,6,0.1)',
    borderColor: 'rgba(217,119,6,0.3)',
    description: 'Coverage, Value Metrics',
    isFilterable: true,
  },
]

// ═══════════════════════════════════════════════════════════════════
// FILTER LAYER ROW COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface FilterLayerRowProps {
  config: LayerConfig
  count: number
  selectedValue: string
  selectedLabel: string | null
  options: FilterOption[]
  isLoading: boolean
  isDisabled: boolean
  isExpanded: boolean
  onToggle: () => void
  onSelect: (value: string, label: string) => void
  onClear: () => void
}

function FilterLayerRow({
  config,
  count,
  selectedValue,
  selectedLabel,
  options,
  isLoading,
  isDisabled,
  isExpanded,
  onToggle,
  onSelect,
  onClear,
}: FilterLayerRowProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const Icon = config.icon
  const hasSelection = selectedValue !== 'all'

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    const term = searchTerm.toLowerCase()
    return options.filter((opt) => opt.name.toLowerCase().includes(term))
  }, [options, searchTerm])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Main Layer Bar */}
      <div
        className={cn(
          'relative flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
          'cursor-pointer',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          backgroundColor: config.bgColor,
          borderColor: hasSelection ? config.color : config.borderColor,
          boxShadow: hasSelection ? `0 0 0 2px ${config.bgColor}` : 'none',
        }}
        onClick={() => !isDisabled && config.isFilterable && onToggle()}
      >
        {/* Expand/Collapse Indicator */}
        {config.isFilterable ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!isDisabled) onToggle()
            }}
            className={cn(
              'p-1 rounded transition-colors',
              !isDisabled && 'hover:bg-black/5'
            )}
            disabled={isDisabled}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" style={{ color: config.color }} />
            ) : (
              <ChevronRight className="h-4 w-4" style={{ color: config.color }} />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Layer Icon */}
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color: config.color }} />
        </div>

        {/* Layer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold"
              style={{ color: config.color }}
            >
              {config.key}
            </span>
            <span className="text-sm font-medium truncate">
              {config.shortName}
            </span>
          </div>
          {hasSelection ? (
            <p
              className="text-xs font-medium truncate"
              style={{ color: config.color }}
            >
              {selectedLabel}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground truncate">
              {config.description}
            </p>
          )}
        </div>

        {/* Count / Selection Indicator */}
        <div className="flex items-center gap-2">
          {hasSelection ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClear()
                    }}
                    className="p-1.5 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Clear filter</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Badge
              variant="secondary"
              className="text-sm font-bold px-2.5 py-0.5"
              style={{
                backgroundColor: `${config.color}15`,
                color: config.color,
              }}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                count.toLocaleString()
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Expanded Options Panel */}
      <AnimatePresence>
        {isExpanded && config.isFilterable && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 p-3 rounded-lg border"
              style={{ borderColor: config.borderColor }}
            >
              {/* Search Input */}
              {options.length > 5 && (
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${config.shortName.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              )}

              {/* Options List */}
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-1">
                  {/* All option */}
                  <button
                    onClick={() => onSelect('all', 'All')}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors',
                      selectedValue === 'all'
                        ? 'bg-muted font-medium'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    {selectedValue === 'all' && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    <span className={selectedValue === 'all' ? '' : 'ml-7'}>
                      All {config.shortName}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {options.length}
                    </Badge>
                  </button>

                  {/* Filtered Options */}
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No {config.shortName.toLowerCase()} found
                    </p>
                  ) : (
                    filteredOptions.slice(0, 20).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => onSelect(option.id, option.name)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors',
                          selectedValue === option.id
                            ? 'font-medium'
                            : 'hover:bg-muted/50'
                        )}
                        style={{
                          backgroundColor:
                            selectedValue === option.id
                              ? `${config.color}15`
                              : undefined,
                        }}
                      >
                        {selectedValue === option.id ? (
                          <Check
                            className="h-4 w-4"
                            style={{ color: config.color }}
                          />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full border-2"
                            style={{ borderColor: config.borderColor }}
                          />
                        )}
                        <span className="flex-1 text-left truncate">
                          {option.name}
                        </span>
                        {option.count !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {option.count}
                          </Badge>
                        )}
                      </button>
                    ))
                  )}

                  {filteredOptions.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Showing 20 of {filteredOptions.length} results
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Line to Next Layer */}
      <div
        className="absolute left-[1.75rem] top-full w-0.5 h-3"
        style={{ backgroundColor: `${config.color}30` }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ONTOLOGY FILTER STACK COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface OntologyFilterStackProps {
  className?: string
  onFilterChange?: () => void
  onClose?: () => void
}

export function OntologyFilterStack({
  className,
  onFilterChange,
  onClose,
}: OntologyFilterStackProps) {
  const {
    filters,
    setFilter,
    resetFilters,
    filterOptions,
    setFilterOptions,
    filterLabels,
    setFilterLabel,
    layers,
    getActiveFilterCount,
  } = useValueViewStore()

  // Track expanded layers
  const [expandedLayers, setExpandedLayers] = useState<LayerKey[]>([])
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // Toggle layer expansion
  const toggleLayer = useCallback((key: LayerKey) => {
    setExpandedLayers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }, [])

  // Fetch options for a filter layer
  const fetchOptions = useCallback(
    async (filterKey: keyof FilterState) => {
      setLoadingStates((prev) => ({ ...prev, [filterKey]: true }))

      try {
        let endpoint = ''
        const params = new URLSearchParams()

        switch (filterKey) {
          case 'tenant_id':
            endpoint = '/api/ontology-investigator/tenants'
            break
          case 'function_id':
            endpoint = '/api/ontology-investigator/hierarchy'
            break
          case 'role_id':
            endpoint = '/api/ontology-investigator/roles'
            if (filters.function_id !== 'all') {
              params.append('function_id', filters.function_id)
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

          const optionKey = filterKey.replace('_id', 's')
          setFilterOptions({ [optionKey]: options })
        }
      } catch (err) {
        console.error(`Error fetching ${filterKey} options:`, err)
      } finally {
        setLoadingStates((prev) => ({ ...prev, [filterKey]: false }))
      }
    },
    [filters, setFilterOptions]
  )

  // Initial load
  useEffect(() => {
    fetchOptions('tenant_id')
    fetchOptions('function_id')
  }, [])

  // Cascading fetch when parent changes
  useEffect(() => {
    if (filters.function_id !== 'all') {
      fetchOptions('role_id')
    }
  }, [filters.function_id])

  useEffect(() => {
    if (filters.role_id !== 'all' || filters.function_id !== 'all') {
      fetchOptions('jtbd_id')
    }
  }, [filters.role_id, filters.function_id])

  // Handle selection
  const handleSelect = useCallback(
    (config: LayerConfig, value: string, label: string) => {
      if (!config.filterKey) return

      setFilter(config.filterKey, value)
      if (value !== 'all') {
        setFilterLabel(config.filterKey.replace('_id', ''), label)
      }

      // Close the expanded panel after selection
      setExpandedLayers((prev) => prev.filter((k) => k !== config.key))

      onFilterChange?.()
    },
    [setFilter, setFilterLabel, onFilterChange]
  )

  // Handle clear
  const handleClear = useCallback(
    (config: LayerConfig) => {
      if (!config.filterKey) return
      setFilter(config.filterKey, 'all')
      onFilterChange?.()
    },
    [setFilter, onFilterChange]
  )

  // Get options for a layer
  const getOptions = (filterKey?: keyof FilterState): FilterOption[] => {
    if (!filterKey) return []
    switch (filterKey) {
      case 'tenant_id':
        return filterOptions.tenants
      case 'function_id':
        return filterOptions.functions
      case 'role_id':
        return filterOptions.roles
      case 'jtbd_id':
        return filterOptions.jtbds
      case 'odi_tier':
        return filterOptions.odiTiers
      case 'agent_status':
        return [
          { id: 'active', name: 'Active Agents' },
          { id: 'inactive', name: 'Inactive' },
          { id: 'no_agent', name: 'No Agent Assigned' },
        ]
      default:
        return []
    }
  }

  // Check if layer is disabled (parent not selected)
  const isLayerDisabled = (config: LayerConfig): boolean => {
    if (!config.parentFilterKey) return false
    return filters[config.parentFilterKey] === 'all'
  }

  const activeFilterCount = getActiveFilterCount()

  // Calculate total items
  const totalItems = LAYER_CONFIGS.reduce(
    (sum, config) => sum + (layers[config.key]?.count || 0),
    0
  )

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {totalItems.toLocaleString()} items
            </p>
            {activeFilterCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        resetFilters()
                        onFilterChange?.()
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {activeFilterCount}
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear all filters</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex-shrink-0 p-3 bg-muted/30 border-b">
          <div className="flex flex-wrap gap-1.5">
            {LAYER_CONFIGS.filter(
              (c) => c.filterKey && filters[c.filterKey] !== 'all'
            ).map((config) => (
              <Badge
                key={config.key}
                variant="secondary"
                className="pr-1 gap-1 text-xs"
                style={{
                  backgroundColor: `${config.color}15`,
                  color: config.color,
                }}
              >
                <span className="font-bold">{config.key}:</span>
                <span className="max-w-[80px] truncate">
                  {filterLabels[config.filterKey!.replace('_id', '')] ||
                    filters[config.filterKey!]}
                </span>
                <button
                  onClick={() => handleClear(config)}
                  className="ml-1 p-0.5 rounded hover:bg-white/50 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Layer Stack */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {/* Gradient Connection Line */}
          <div className="absolute left-[2.25rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7C3AED] via-[#0891B2] to-[#D97706] opacity-20" />

          {LAYER_CONFIGS.map((config) => {
            const layerData = layers[config.key]
            const selectedValue = config.filterKey
              ? filters[config.filterKey]
              : 'all'
            const selectedLabel = config.filterKey
              ? filterLabels[config.filterKey.replace('_id', '')] || null
              : null

            return (
              <FilterLayerRow
                key={config.key}
                config={config}
                count={layerData?.count || 0}
                selectedValue={selectedValue}
                selectedLabel={selectedLabel}
                options={getOptions(config.filterKey)}
                isLoading={
                  config.filterKey ? loadingStates[config.filterKey] : false
                }
                isDisabled={isLayerDisabled(config)}
                isExpanded={expandedLayers.includes(config.key)}
                onToggle={() => toggleLayer(config.key)}
                onSelect={(value, label) => handleSelect(config, value, label)}
                onClear={() => handleClear(config)}
              />
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer Legend */}
      <div className="flex-shrink-0 p-3 border-t bg-muted/10">
        <p className="text-[10px] text-muted-foreground text-center">
          Click layers to filter • Selections cascade downward
        </p>
      </div>
    </div>
  )
}

export default OntologyFilterStack
