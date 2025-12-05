'use client'

/**
 * HeatmapVisualization - Function/Department Coverage Matrix
 *
 * Displays a heatmap showing AI agent coverage across functions
 * with subtle, professional styling.
 */

import React, { useMemo, useState } from 'react'
import {
  Grid3X3,
  Bot,
  Building2,
  CheckCircle,
  AlertCircle,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type LayerData, type LayerKey, type ODIOpportunity } from '@/stores/valueViewStore'

// Subtle coverage color scale - monochrome with single accent
function getCoverageColor(coverage: number): string {
  if (coverage >= 90) return 'bg-slate-700 dark:bg-slate-300'
  if (coverage >= 70) return 'bg-slate-600 dark:bg-slate-400'
  if (coverage >= 50) return 'bg-slate-500 dark:bg-slate-500'
  if (coverage >= 30) return 'bg-slate-400 dark:bg-slate-600'
  if (coverage > 0) return 'bg-slate-300 dark:bg-slate-700'
  return 'bg-slate-100 dark:bg-slate-900'
}

function getCoverageTextColor(coverage: number): string {
  if (coverage >= 50) return 'text-white dark:text-slate-900'
  return 'text-slate-700 dark:text-slate-300'
}

interface HeatmapCell {
  functionName: string
  departmentName?: string
  roleName?: string
  coverage: number
  agentCount: number
  totalRoles: number
  opportunities: number
}

interface HeatmapVisualizationProps {
  layers: Record<LayerKey, LayerData>
  opportunities: ODIOpportunity[]
  className?: string
}

export function HeatmapVisualization({
  layers,
  opportunities,
  className,
}: HeatmapVisualizationProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // Build heatmap data from functions and opportunities
  const heatmapData = useMemo(() => {
    const functionLayer = layers.L1
    const functions = functionLayer.items || []

    // Group opportunities by function
    const functionGroups: Record<string, ODIOpportunity[]> = {}
    opportunities.forEach(opp => {
      const funcName = opp.function_name || 'Unknown'
      if (!functionGroups[funcName]) functionGroups[funcName] = []
      functionGroups[funcName].push(opp)
    })

    // Create cells
    const cells: HeatmapCell[] = []

    functions.forEach(func => {
      const funcOpps = functionGroups[func.name] || []
      const agentsAssigned = funcOpps.filter(o => o.agent_assigned).length
      const coverage = funcOpps.length > 0 ? (agentsAssigned / funcOpps.length) * 100 : 0

      cells.push({
        functionName: func.name,
        coverage,
        agentCount: agentsAssigned,
        totalRoles: funcOpps.length,
        opportunities: funcOpps.filter(o => o.tier === 'extreme' || o.tier === 'high').length,
      })
    })

    // Add remaining functions from opportunities that aren't in the layer
    Object.entries(functionGroups).forEach(([funcName, funcOpps]) => {
      if (!functions.find(f => f.name === funcName)) {
        const agentsAssigned = funcOpps.filter(o => o.agent_assigned).length
        const coverage = funcOpps.length > 0 ? (agentsAssigned / funcOpps.length) * 100 : 0
        cells.push({
          functionName: funcName,
          coverage,
          agentCount: agentsAssigned,
          totalRoles: funcOpps.length,
          opportunities: funcOpps.filter(o => o.tier === 'extreme' || o.tier === 'high').length,
        })
      }
    })

    return cells.sort((a, b) => b.totalRoles - a.totalRoles)
  }, [layers, opportunities])

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalFunctions = heatmapData.length
    const fullCoverage = heatmapData.filter(c => c.coverage === 100).length
    const partialCoverage = heatmapData.filter(c => c.coverage > 0 && c.coverage < 100).length
    const noCoverage = heatmapData.filter(c => c.coverage === 0).length
    const avgCoverage = totalFunctions > 0
      ? heatmapData.reduce((sum, c) => sum + c.coverage, 0) / totalFunctions
      : 0

    return { totalFunctions, fullCoverage, partialCoverage, noCoverage, avgCoverage }
  }, [heatmapData])

  return (
    <TooltipProvider>
      <Card className={cn('h-full border-border/40', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/50">
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Coverage Heatmap</CardTitle>
                <p className="text-xs text-muted-foreground">
                  AI agent coverage by function
                </p>
              </div>
            </div>
          </div>

          {/* Coverage Legend */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[10px] text-muted-foreground">Coverage:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-900" />
              <span className="text-[10px] text-muted-foreground">0%</span>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={cn(
                    'w-3 h-3 rounded-sm',
                    i === 1 && 'bg-slate-300 dark:bg-slate-700',
                    i === 2 && 'bg-slate-400 dark:bg-slate-600',
                    i === 3 && 'bg-slate-500',
                    i === 4 && 'bg-slate-600 dark:bg-slate-400',
                    i === 5 && 'bg-slate-700 dark:bg-slate-300'
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">100%</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-md bg-muted/30 text-center">
              <p className="text-xl font-semibold text-foreground">
                {stats.avgCoverage.toFixed(0)}%
              </p>
              <p className="text-[10px] text-muted-foreground">Avg Coverage</p>
            </div>
            <div className="p-2.5 rounded-md bg-muted/30 text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xl font-semibold text-foreground">{stats.fullCoverage}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Full</p>
            </div>
            <div className="p-2.5 rounded-md bg-muted/30 text-center">
              <div className="flex items-center justify-center gap-1">
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xl font-semibold text-foreground">{stats.partialCoverage}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Partial</p>
            </div>
            <div className="p-2.5 rounded-md bg-muted/30 text-center">
              <div className="flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xl font-semibold text-foreground">{stats.noCoverage}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">None</p>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
            {heatmapData.map((cell, index) => {
              const isHovered = hoveredCell === cell.functionName
              const coverageColor = getCoverageColor(cell.coverage)
              const textColor = getCoverageTextColor(cell.coverage)

              return (
                <Tooltip key={`${cell.functionName}-${index}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'relative p-2.5 rounded-md cursor-pointer transition-all',
                        coverageColor,
                        isHovered && 'ring-1 ring-foreground/20 scale-105'
                      )}
                      onMouseEnter={() => setHoveredCell(cell.functionName)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className={cn('text-center', textColor)}>
                        <p className="text-lg font-semibold">
                          {cell.coverage.toFixed(0)}%
                        </p>
                        <p className="text-[10px] truncate font-medium opacity-80">
                          {cell.functionName.split(' ')[0]}
                        </p>
                        <p className="text-[9px] opacity-60 mt-0.5">
                          {cell.agentCount}/{cell.totalRoles}
                        </p>
                      </div>

                      {/* High-priority opportunity indicator */}
                      {cell.opportunities > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-foreground text-background flex items-center justify-center">
                          <span className="text-[8px] font-medium">
                            {cell.opportunities > 9 ? '9+' : cell.opportunities}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        <p className="font-medium">{cell.functionName}</p>
                      </div>
                      <div className="text-muted-foreground space-y-0.5">
                        <p>Coverage: {cell.coverage.toFixed(1)}%</p>
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          <span>{cell.agentCount} agents assigned</span>
                        </div>
                        <p>Total roles: {cell.totalRoles}</p>
                        {cell.opportunities > 0 && (
                          <Badge variant="secondary" className="text-[9px] mt-1">
                            {cell.opportunities} high-priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          {/* Empty state */}
          {heatmapData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Grid3X3 className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No coverage data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default HeatmapVisualization
