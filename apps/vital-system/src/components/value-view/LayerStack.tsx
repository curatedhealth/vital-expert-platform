'use client'

/**
 * LayerStack - 8-Layer Semantic Ontology Visualization
 *
 * Interactive visualization of VITAL's 8-layer ontology model:
 * L0: Domain Knowledge (Therapeutic Areas, Products, Diseases, Evidence)
 * L1: Strategic Pillars (SP01-SP07, OKRs, Themes)
 * L2: Organizational Structure (Functions, Departments)
 * L3: Personas (43 profiles, 4 archetypes)
 * L4: Jobs-to-be-Done (700+ jobs)
 * L5: Outcomes/ODI (Importance/Satisfaction scoring)
 * L6: Workflows (400+ processes with HITL)
 * L7: Value Metrics (Time, Cost, Quality, Risk)
 */

import React, { useState, useMemo } from 'react'
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
  Info,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type LayerKey, type LayerData, type LayerItem } from '@/stores/valueViewStore'

// ═══════════════════════════════════════════════════════════════════
// LAYER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const LAYER_CONFIG: Record<LayerKey, {
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  bgClass: string
  borderClass: string
  hoverBgClass: string
}> = {
  L0: {
    icon: Database,
    colorClass: 'text-[#7C3AED]',
    bgClass: 'bg-[rgba(124,58,237,0.1)]',
    borderClass: 'border-[#7C3AED]',
    hoverBgClass: 'hover:bg-[rgba(124,58,237,0.15)]',
  },
  L1: {
    icon: Target,
    colorClass: 'text-[#2563EB]',
    bgClass: 'bg-[rgba(37,99,235,0.1)]',
    borderClass: 'border-[#2563EB]',
    hoverBgClass: 'hover:bg-[rgba(37,99,235,0.15)]',
  },
  L2: {
    icon: Building2,
    colorClass: 'text-[#059669]',
    bgClass: 'bg-[rgba(5,150,105,0.1)]',
    borderClass: 'border-[#059669]',
    hoverBgClass: 'hover:bg-[rgba(5,150,105,0.15)]',
  },
  L3: {
    icon: Users,
    colorClass: 'text-[#EA580C]',
    bgClass: 'bg-[rgba(234,88,12,0.1)]',
    borderClass: 'border-[#EA580C]',
    hoverBgClass: 'hover:bg-[rgba(234,88,12,0.15)]',
  },
  L4: {
    icon: Briefcase,
    colorClass: 'text-[#0891B2]',
    bgClass: 'bg-[rgba(8,145,178,0.1)]',
    borderClass: 'border-[#0891B2]',
    hoverBgClass: 'hover:bg-[rgba(8,145,178,0.15)]',
  },
  L5: {
    icon: BarChart3,
    colorClass: 'text-[#DB2777]',
    bgClass: 'bg-[rgba(219,39,119,0.1)]',
    borderClass: 'border-[#DB2777]',
    hoverBgClass: 'hover:bg-[rgba(219,39,119,0.15)]',
  },
  L6: {
    icon: GitBranch,
    colorClass: 'text-[#4F46E5]',
    bgClass: 'bg-[rgba(79,70,229,0.1)]',
    borderClass: 'border-[#4F46E5]',
    hoverBgClass: 'hover:bg-[rgba(79,70,229,0.15)]',
  },
  L7: {
    icon: DollarSign,
    colorClass: 'text-[#D97706]',
    bgClass: 'bg-[rgba(217,119,6,0.1)]',
    borderClass: 'border-[#D97706]',
    hoverBgClass: 'hover:bg-[rgba(217,119,6,0.15)]',
  },
}

// ═══════════════════════════════════════════════════════════════════
// LAYER ROW COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface LayerRowProps {
  layer: LayerData
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  onItemClick: (item: LayerItem) => void
}

function LayerRow({
  layer,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onItemClick,
}: LayerRowProps) {
  const config = LAYER_CONFIG[layer.key]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Main Layer Bar */}
      <div
        className={cn(
          'relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
          config.bgClass,
          config.borderClass,
          config.hoverBgClass,
          isSelected && 'ring-2 ring-offset-2 ring-offset-background',
          isSelected && config.borderClass.replace('border-', 'ring-')
        )}
        onClick={onSelect}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            config.hoverBgClass
          )}
        >
          {isExpanded ? (
            <ChevronDown className={cn('h-5 w-5', config.colorClass)} />
          ) : (
            <ChevronRight className={cn('h-5 w-5', config.colorClass)} />
          )}
        </button>

        {/* Layer Icon */}
        <div
          className={cn(
            'p-2.5 rounded-xl',
            config.bgClass,
            'border',
            config.borderClass
          )}
        >
          <Icon className={cn('h-5 w-5', config.colorClass)} />
        </div>

        {/* Layer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('font-bold text-sm', config.colorClass)}>
              {layer.key}
            </span>
            <span className="font-semibold text-foreground truncate">
              {layer.fullName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {layer.description}
          </p>
        </div>

        {/* Count Badge */}
        <Badge
          variant="secondary"
          className={cn(
            'text-lg font-bold px-4 py-1.5 rounded-full',
            config.bgClass,
            config.colorClass,
            'border',
            config.borderClass
          )}
        >
          {layer.count.toLocaleString()}
        </Badge>

        {/* Info Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-semibold mb-1">{layer.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {layer.description}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">{layer.count}</span> items in this
                layer
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Expanded Items */}
      <AnimatePresence>
        {isExpanded && layer.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-14 space-y-1.5">
              {layer.items.slice(0, 8).map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onItemClick(item)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                    'bg-card hover:bg-muted/50',
                    'group'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        config.bgClass.replace('bg-', 'bg-').replace('0.1', '1')
                      )}
                      style={{
                        backgroundColor: config.colorClass.includes('#')
                          ? config.colorClass.replace('text-[', '').replace(']', '')
                          : undefined,
                      }}
                    />
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ))}
              {layer.items.length > 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  View all {layer.items.length} items
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Line to Next Layer */}
      <div
        className={cn(
          'absolute left-[2.25rem] top-full w-0.5 h-4',
          config.bgClass.replace('0.1', '0.3')
        )}
        style={{
          backgroundColor: config.colorClass.includes('#')
            ? config.colorClass.replace('text-[', '').replace(']', '').replace(')', ', 0.3)')
            : undefined,
        }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LAYER STACK COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface LayerStackProps {
  layers: Record<LayerKey, LayerData>
  expandedLayers: LayerKey[]
  selectedLayer: LayerKey | null
  onToggleLayer: (key: LayerKey) => void
  onSelectLayer: (key: LayerKey) => void
  onItemClick: (layer: LayerKey, item: LayerItem) => void
  className?: string
  compact?: boolean
}

export function LayerStack({
  layers,
  expandedLayers,
  selectedLayer,
  onToggleLayer,
  onSelectLayer,
  onItemClick,
  className,
  compact = false,
}: LayerStackProps) {
  const layerOrder: LayerKey[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const totalItems = layerOrder.reduce(
      (sum, key) => sum + (layers[key]?.count || 0),
      0
    )
    const populatedLayers = layerOrder.filter(
      (key) => (layers[key]?.count || 0) > 0
    ).length

    return { totalItems, populatedLayers }
  }, [layers])

  return (
    <div className={cn('relative', className)}>
      {/* Summary Header */}
      {!compact && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">8-Layer Semantic Ontology</h3>
            <p className="text-sm text-muted-foreground">
              {metrics.totalItems.toLocaleString()} total items across{' '}
              {metrics.populatedLayers} layers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {metrics.populatedLayers}/8 Layers Active
            </Badge>
          </div>
        </div>
      )}

      {/* Layer Stack */}
      <div className="relative space-y-4">
        {/* Vertical Connection Line */}
        <div className="absolute left-[2.25rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7C3AED] via-[#0891B2] to-[#D97706] opacity-20" />

        {layerOrder.map((key) => (
          <LayerRow
            key={key}
            layer={layers[key]}
            isExpanded={expandedLayers.includes(key)}
            isSelected={selectedLayer === key}
            onToggle={() => onToggleLayer(key)}
            onSelect={() => onSelectLayer(key)}
            onItemClick={(item) => onItemClick(key, item)}
          />
        ))}
      </div>

      {/* Legend */}
      {!compact && (
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border">
          <h4 className="text-sm font-medium mb-3">Layer Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#7C3AED]" />
              <span>Domain (L0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
              <span>Strategy (L1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#059669]" />
              <span>Org (L2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EA580C]" />
              <span>Personas (L3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0891B2]" />
              <span>JTBDs (L4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#DB2777]" />
              <span>Outcomes (L5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
              <span>Workflows (L6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D97706]" />
              <span>Value (L7)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LayerStack
