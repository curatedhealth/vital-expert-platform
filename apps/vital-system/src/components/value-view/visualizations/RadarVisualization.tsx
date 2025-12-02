'use client'

/**
 * RadarVisualization - ODI Opportunity Scatter Plot
 *
 * Displays opportunities on an Importance vs Satisfaction chart
 * with subtle, professional styling using shadcn charts.
 */

import React, { useMemo, useState } from 'react'
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Cell,
  ZAxis,
} from 'recharts'
import { type ODIOpportunity, type ODITier } from '@/stores/valueViewStore'

// Subtle tier colors - muted palette
const TIER_COLORS: Record<ODITier, { fill: string; label: string }> = {
  extreme: { fill: 'hsl(0, 45%, 55%)', label: 'Extreme' },
  high: { fill: 'hsl(35, 45%, 55%)', label: 'High' },
  moderate: { fill: 'hsl(220, 25%, 55%)', label: 'Moderate' },
  'table-stakes': { fill: 'hsl(220, 10%, 65%)', label: 'Table Stakes' },
}

// Quadrant definitions
const QUADRANTS = [
  { id: 'prioritize', label: 'Prioritize', icon: AlertTriangle, desc: 'High importance, low satisfaction' },
  { id: 'maintain', label: 'Maintain', icon: CheckCircle, desc: 'High importance, high satisfaction' },
  { id: 'deprioritize', label: 'Deprioritize', icon: Info, desc: 'Low importance, low satisfaction' },
  { id: 'monitor', label: 'Monitor', icon: TrendingUp, desc: 'Low importance, high satisfaction' },
]

interface RadarVisualizationProps {
  opportunities: ODIOpportunity[]
  selectedOpportunity: ODIOpportunity | null
  onSelectOpportunity: (opp: ODIOpportunity | null) => void
  tierFilter?: ODITier | 'all'
  className?: string
}

export function RadarVisualization({
  opportunities,
  selectedOpportunity,
  onSelectOpportunity,
  tierFilter = 'all',
  className,
}: RadarVisualizationProps) {
  const [hoveredOpp, setHoveredOpp] = useState<string | null>(null)

  // Filter opportunities
  const filteredOpps = useMemo(() => {
    if (tierFilter === 'all') return opportunities
    return opportunities.filter(o => o.tier === tierFilter)
  }, [opportunities, tierFilter])

  // Transform data for scatter chart
  const chartData = useMemo(() => {
    return filteredOpps.map(opp => ({
      ...opp,
      x: opp.satisfaction,
      y: opp.importance,
      z: opp.opportunity_score,
      fill: TIER_COLORS[opp.tier].fill,
    }))
  }, [filteredOpps])

  // Calculate statistics
  const stats = useMemo(() => {
    const quadrantCounts = {
      prioritize: 0,
      maintain: 0,
      deprioritize: 0,
      monitor: 0,
    }

    filteredOpps.forEach(opp => {
      const highImportance = opp.importance >= 7
      const highSatisfaction = opp.satisfaction >= 5

      if (highImportance && !highSatisfaction) quadrantCounts.prioritize++
      else if (highImportance && highSatisfaction) quadrantCounts.maintain++
      else if (!highImportance && !highSatisfaction) quadrantCounts.deprioritize++
      else quadrantCounts.monitor++
    })

    return quadrantCounts
  }, [filteredOpps])

  const chartConfig = {
    satisfaction: {
      label: 'Satisfaction',
      color: 'hsl(220, 13%, 50%)',
    },
    importance: {
      label: 'Importance',
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
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">ODI Scatter Plot</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {filteredOpps.length} opportunities plotted
                </p>
              </div>
            </div>
          </div>

          {/* Quadrant Summary */}
          <div className="flex flex-wrap gap-2 mt-3">
            {QUADRANTS.map(q => {
              const count = stats[q.id as keyof typeof stats] || 0
              return (
                <Tooltip key={q.id}>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs gap-1 font-normal">
                      <q.icon className="h-3 w-3" />
                      {q.label}: {count}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {q.desc}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </CardHeader>

        <CardContent>
          {/* Scatter Chart */}
          <div className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 30 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  label={{
                    value: 'Satisfaction →',
                    position: 'bottom',
                    offset: 10,
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  label={{
                    value: '← Importance',
                    angle: -90,
                    position: 'left',
                    offset: 10,
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[40, 200]} />

                {/* Reference lines for quadrants */}
                <ReferenceLine
                  x={5}
                  stroke="hsl(var(--border))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.8}
                />
                <ReferenceLine
                  y={7}
                  stroke="hsl(var(--border))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.8}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="space-y-1">
                          <p className="font-medium text-xs">{item.payload.jtbd_name}</p>
                          <div className="text-[10px] text-muted-foreground space-y-0.5">
                            <p>Importance: {item.payload.importance?.toFixed(1)}</p>
                            <p>Satisfaction: {item.payload.satisfaction?.toFixed(1)}</p>
                            <p>ODI Score: {item.payload.opportunity_score?.toFixed(1)}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] mt-1"
                            style={{ backgroundColor: item.payload.fill, color: 'white' }}
                          >
                            {TIER_COLORS[item.payload.tier as ODITier]?.label}
                          </Badge>
                        </div>
                      )}
                    />
                  }
                />

                <Scatter
                  data={chartData}
                  cursor="pointer"
                  onClick={(data) => {
                    if (data) onSelectOpportunity(
                      selectedOpportunity?.id === data.id ? null : data as ODIOpportunity
                    )
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      opacity={selectedOpportunity?.id === entry.id ? 1 : 0.6}
                      stroke={selectedOpportunity?.id === entry.id ? 'hsl(var(--foreground))' : 'none'}
                      strokeWidth={selectedOpportunity?.id === entry.id ? 2 : 0}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ChartContainer>
          </div>

          {/* Tier Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            {(['extreme', 'high', 'moderate', 'table-stakes'] as ODITier[]).map(tier => {
              const count = filteredOpps.filter(o => o.tier === tier).length
              const config = TIER_COLORS[tier]
              return (
                <div key={tier} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: config.fill }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {config.label}: {count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default RadarVisualization
