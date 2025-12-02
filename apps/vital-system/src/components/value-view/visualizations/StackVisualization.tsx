'use client'

/**
 * StackVisualization - 8-Layer Ontology Stack View
 *
 * Displays the VITAL 8-layer semantic ontology as an interactive
 * vertical stack with subtle, professional styling.
 */

import React, { useState, useMemo } from 'react'
import {
  Layers,
  ChevronRight,
  Database,
  Building2,
  Users,
  Briefcase,
  GitBranch,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts'
import { type LayerKey, type LayerData } from '@/stores/valueViewStore'

// Layer configuration with subtle monochrome colors
const LAYER_CONFIG: Record<LayerKey, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
}> = {
  L0: {
    icon: Database,
    color: 'hsl(220, 13%, 75%)',
    description: 'Tenants - Enterprise instances',
  },
  L1: {
    icon: Building2,
    color: 'hsl(220, 13%, 70%)',
    description: 'Functions - Business areas',
  },
  L2: {
    icon: Building2,
    color: 'hsl(220, 13%, 65%)',
    description: 'Departments - Organizational units',
  },
  L3: {
    icon: Users,
    color: 'hsl(220, 13%, 60%)',
    description: 'Roles - Job positions',
  },
  L4: {
    icon: Users,
    color: 'hsl(220, 13%, 55%)',
    description: 'Personas - User archetypes',
  },
  L5: {
    icon: Briefcase,
    color: 'hsl(220, 13%, 50%)',
    description: 'JTBDs - Jobs-to-be-Done',
  },
  L6: {
    icon: GitBranch,
    color: 'hsl(220, 13%, 45%)',
    description: 'Workflows - Process automation',
  },
  L7: {
    icon: Bot,
    color: 'hsl(220, 13%, 40%)',
    description: 'AI Agents - Intelligent assistants',
  },
}

const LAYER_ORDER: LayerKey[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']

interface StackVisualizationProps {
  layers: Record<LayerKey, LayerData>
  selectedLayer: LayerKey | null
  onSelectLayer: (key: LayerKey | null) => void
  onDrillDown?: (key: LayerKey) => void
  className?: string
}

export function StackVisualization({
  layers,
  selectedLayer,
  onSelectLayer,
  className,
}: StackVisualizationProps) {
  const [hoveredLayer, setHoveredLayer] = useState<LayerKey | null>(null)

  const totalItems = Object.values(layers).reduce((sum, l) => sum + l.count, 0)
  const maxCount = Math.max(...Object.values(layers).map(l => l.count), 1)

  // Prepare chart data
  const chartData = useMemo(() => {
    return LAYER_ORDER.map((key) => ({
      layer: layers[key]?.fullName || key,
      shortName: key,
      count: layers[key]?.count || 0,
      key,
      fill: LAYER_CONFIG[key].color,
    }))
  }, [layers])

  const chartConfig = {
    count: {
      label: 'Count',
      color: 'hsl(220, 13%, 50%)',
    },
  }

  return (
    <TooltipProvider>
      <Card className={cn('h-full border-border/40', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/50">
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Ontology Stack</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {totalItems.toLocaleString()} entities across 8 layers
                </p>
              </div>
            </div>
            {selectedLayer && (
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => onSelectLayer(null)}
              >
                Clear
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Horizontal Bar Chart */}
          <div className="h-52">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 70 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  width={65}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">
                            {item.payload.layer}
                          </span>
                          <span className="font-medium">{value} items</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(data) => onSelectLayer(data.key)}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.fill}
                      opacity={selectedLayer === entry.key ? 1 : 0.7}
                      stroke={selectedLayer === entry.key ? 'hsl(var(--foreground))' : 'none'}
                      strokeWidth={selectedLayer === entry.key ? 1 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          {/* Layer List */}
          <div className="space-y-1">
            {LAYER_ORDER.map((key) => {
              const config = LAYER_CONFIG[key]
              const data = layers[key]
              const Icon = config.icon
              const isSelected = selectedLayer === key
              const isHovered = hoveredLayer === key
              const percentage = maxCount > 0 ? ((data?.count || 0) / maxCount) * 100 : 0

              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectLayer(isSelected ? null : key)}
                      onMouseEnter={() => setHoveredLayer(key)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      className={cn(
                        'w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors text-left',
                        'hover:bg-muted/50',
                        isSelected && 'bg-muted'
                      )}
                    >
                      <div className="p-1 rounded bg-muted/50">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn(
                            'font-medium truncate',
                            isSelected && 'text-foreground'
                          )}>
                            {data?.fullName || key}
                          </span>
                          <span className="text-muted-foreground font-mono ml-2">
                            {data?.count || 0}
                          </span>
                        </div>
                        <Progress
                          value={percentage}
                          className="h-0.5 mt-1"
                        />
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 text-muted-foreground/30 transition-transform',
                          (isSelected || isHovered) && 'text-muted-foreground rotate-90'
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    <p className="font-medium">{data?.fullName || key}</p>
                    <p className="text-muted-foreground">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground text-center">
              L0 → L7 hierarchical relationships
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default StackVisualization
