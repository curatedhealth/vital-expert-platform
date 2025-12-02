'use client'

/**
 * FlowVisualization - Sankey-style Relationship Flow
 *
 * Displays the flow of relationships between ontology layers
 * in a Sankey diagram style visualization with subtle, professional styling.
 */

import React, { useMemo, useState } from 'react'
import {
  Workflow,
  ArrowRight,
  Building2,
  Users,
  Briefcase,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type LayerData, type LayerKey, type ODIOpportunity } from '@/stores/valueViewStore'

// Flow stage configuration - subtle monochrome colors
const FLOW_STAGES = [
  { key: 'L1', name: 'Functions', icon: Building2, color: 'bg-slate-600 dark:bg-slate-400' },
  { key: 'L3', name: 'Roles', icon: Users, color: 'bg-slate-500 dark:bg-slate-500' },
  { key: 'L5', name: 'JTBDs', icon: Briefcase, color: 'bg-slate-400 dark:bg-slate-600' },
  { key: 'L7', name: 'Agents', icon: Bot, color: 'bg-slate-700 dark:bg-slate-300' },
]

// Subtle color assignments for flow nodes
function getNodeColor(nodeId: string): string {
  if (nodeId.startsWith('func-')) return 'bg-slate-600 dark:bg-slate-400'
  if (nodeId === 'roles-covered') return 'bg-slate-500 dark:bg-slate-500'
  if (nodeId === 'roles-uncovered') return 'bg-slate-400 dark:bg-slate-600'
  if (nodeId.startsWith('jtbd-extreme')) return 'bg-slate-700 dark:bg-slate-300'
  if (nodeId.startsWith('jtbd-high')) return 'bg-slate-600 dark:bg-slate-400'
  if (nodeId.startsWith('jtbd-moderate')) return 'bg-slate-500 dark:bg-slate-500'
  if (nodeId === 'agents') return 'bg-slate-700 dark:bg-slate-300'
  return 'bg-slate-500'
}

function getNodeTextColor(nodeId: string): string {
  // Dark text for light backgrounds in dark mode, white text for dark backgrounds
  if (nodeId === 'roles-uncovered') return 'text-slate-900 dark:text-slate-100'
  if (nodeId.startsWith('jtbd-moderate')) return 'text-white dark:text-slate-900'
  return 'text-white dark:text-slate-900'
}

interface FlowNode {
  id: string
  name: string
  count: number
  stage: number
  connections?: string[]
}

interface FlowVisualizationProps {
  layers: Record<LayerKey, LayerData>
  opportunities: ODIOpportunity[]
  className?: string
}

export function FlowVisualization({
  layers,
  opportunities,
  className,
}: FlowVisualizationProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Build flow data from layers
  const flowData = useMemo(() => {
    const nodes: FlowNode[] = []
    const flows: { from: string; to: string; value: number }[] = []

    // Group opportunities by function
    const functionGroups: Record<string, ODIOpportunity[]> = {}
    opportunities.forEach(opp => {
      const funcName = opp.function_name || 'Unknown'
      if (!functionGroups[funcName]) functionGroups[funcName] = []
      functionGroups[funcName].push(opp)
    })

    // Get top functions
    const topFunctions = Object.entries(functionGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6)

    // Create function nodes
    topFunctions.forEach(([funcName, opps]) => {
      nodes.push({
        id: `func-${funcName}`,
        name: funcName.split(' ').slice(0, 2).join(' '),
        count: opps.length,
        stage: 0,
      })
    })

    // Create role aggregation nodes
    const rolesWithAgents = opportunities.filter(o => o.agent_assigned).length
    const rolesWithoutAgents = opportunities.filter(o => !o.agent_assigned).length

    nodes.push({
      id: 'roles-covered',
      name: 'Covered Roles',
      count: rolesWithAgents,
      stage: 1,
    })

    nodes.push({
      id: 'roles-uncovered',
      name: 'Uncovered Roles',
      count: rolesWithoutAgents,
      stage: 1,
    })

    // Create JTBD tier nodes
    const tierCounts = {
      extreme: opportunities.filter(o => o.tier === 'extreme').length,
      high: opportunities.filter(o => o.tier === 'high').length,
      moderate: opportunities.filter(o => o.tier === 'moderate').length,
    }

    if (tierCounts.extreme > 0) {
      nodes.push({
        id: 'jtbd-extreme',
        name: 'Extreme ODI',
        count: tierCounts.extreme,
        stage: 2,
      })
    }
    if (tierCounts.high > 0) {
      nodes.push({
        id: 'jtbd-high',
        name: 'High ODI',
        count: tierCounts.high,
        stage: 2,
      })
    }
    if (tierCounts.moderate > 0) {
      nodes.push({
        id: 'jtbd-moderate',
        name: 'Moderate ODI',
        count: tierCounts.moderate,
        stage: 2,
      })
    }

    // Create agent node
    nodes.push({
      id: 'agents',
      name: 'AI Agents',
      count: layers.L7?.count || 0,
      stage: 3,
    })

    // Create flows
    topFunctions.forEach(([funcName, opps]) => {
      const coveredCount = opps.filter(o => o.agent_assigned).length
      const uncoveredCount = opps.length - coveredCount

      if (coveredCount > 0) {
        flows.push({
          from: `func-${funcName}`,
          to: 'roles-covered',
          value: coveredCount,
        })
      }
      if (uncoveredCount > 0) {
        flows.push({
          from: `func-${funcName}`,
          to: 'roles-uncovered',
          value: uncoveredCount,
        })
      }
    })

    // Flows from roles to JTBDs
    flows.push({
      from: 'roles-covered',
      to: 'jtbd-extreme',
      value: Math.floor(rolesWithAgents * 0.3),
    })
    flows.push({
      from: 'roles-covered',
      to: 'jtbd-high',
      value: Math.floor(rolesWithAgents * 0.5),
    })
    flows.push({
      from: 'roles-covered',
      to: 'jtbd-moderate',
      value: Math.floor(rolesWithAgents * 0.2),
    })

    flows.push({
      from: 'roles-uncovered',
      to: 'jtbd-extreme',
      value: tierCounts.extreme - Math.floor(rolesWithAgents * 0.3),
    })
    flows.push({
      from: 'roles-uncovered',
      to: 'jtbd-high',
      value: tierCounts.high - Math.floor(rolesWithAgents * 0.5),
    })

    // Flows from JTBDs to Agents
    if (tierCounts.extreme > 0) {
      flows.push({
        from: 'jtbd-extreme',
        to: 'agents',
        value: Math.floor(tierCounts.extreme * 0.4),
      })
    }
    if (tierCounts.high > 0) {
      flows.push({
        from: 'jtbd-high',
        to: 'agents',
        value: Math.floor(tierCounts.high * 0.6),
      })
    }
    if (tierCounts.moderate > 0) {
      flows.push({
        from: 'jtbd-moderate',
        to: 'agents',
        value: Math.floor(tierCounts.moderate * 0.8),
      })
    }

    return { nodes, flows: flows.filter(f => f.value > 0) }
  }, [layers, opportunities])

  // Group nodes by stage
  const stageNodes = useMemo(() => {
    const grouped: Record<number, FlowNode[]> = { 0: [], 1: [], 2: [], 3: [] }
    flowData.nodes.forEach(node => {
      if (grouped[node.stage]) {
        grouped[node.stage].push(node)
      }
    })
    return grouped
  }, [flowData.nodes])

  return (
    <TooltipProvider>
      <Card className={cn('h-full border-border/40', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/50">
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Ontology Flow</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Relationship flow from Functions to Agents
                </p>
              </div>
            </div>
          </div>

          {/* Stage Legend */}
          <div className="flex items-center justify-between mt-3 gap-2">
            {FLOW_STAGES.map((stage, i) => {
              const Icon = stage.icon
              return (
                <React.Fragment key={stage.key}>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('p-1.5 rounded-md', stage.color)}>
                      <Icon className="h-3 w-3 text-white dark:text-slate-900" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{stage.name}</span>
                  </div>
                  {i < FLOW_STAGES.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative overflow-hidden rounded-lg bg-muted/30 border border-border/40 p-4">
            {/* Flow Visualization */}
            <div className="flex items-stretch justify-between gap-3" style={{ minHeight: 260 }}>
              {/* Stages */}
              {[0, 1, 2, 3].map(stageIndex => (
                <div
                  key={stageIndex}
                  className="flex-1 flex flex-col justify-center gap-1.5"
                >
                  {stageNodes[stageIndex].map((node) => {
                    const isHovered = hoveredNode === node.id
                    const maxCount = Math.max(...flowData.nodes.map(n => n.count))
                    const sizePercent = maxCount > 0 ? (node.count / maxCount) * 100 : 50
                    const minHeight = 36
                    const height = Math.max(minHeight, (sizePercent / 100) * 70)
                    const nodeColor = getNodeColor(node.id)
                    const textColor = getNodeTextColor(node.id)

                    return (
                      <Tooltip key={node.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'relative rounded-md cursor-pointer transition-all',
                              nodeColor,
                              isHovered && 'ring-1 ring-foreground/20 scale-[1.02]'
                            )}
                            style={{ height, minHeight }}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                          >
                            <div className={cn(
                              'absolute inset-0 flex flex-col items-center justify-center p-1.5',
                              textColor
                            )}>
                              <span className="text-base font-semibold">{node.count}</span>
                              <span className="text-[9px] text-center leading-tight opacity-80 truncate max-w-full">
                                {node.name}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          <div className="text-center">
                            <p className="font-medium">{node.name}</p>
                            <p className="text-muted-foreground">{node.count} items</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Connection Lines (simplified) */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              {/* Draw curved paths between stages */}
              {[0, 1, 2].map(stageIndex => {
                const fromStageWidth = 100 / 4
                const startX = (stageIndex + 0.5) * fromStageWidth + 2
                const endX = (stageIndex + 1.5) * fromStageWidth - 2

                return (
                  <path
                    key={stageIndex}
                    d={`M ${startX}% 50% C ${(startX + endX) / 2}% 50%, ${(startX + endX) / 2}% 50%, ${endX}% 50%`}
                    fill="none"
                    stroke="url(#flowGradient)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    opacity={0.4}
                  />
                )
              })}
            </svg>
          </div>

          {/* Flow Summary */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2.5 rounded-md bg-muted/30">
              <p className="text-xl font-semibold text-foreground">{stageNodes[0].length}</p>
              <p className="text-[10px] text-muted-foreground">Functions</p>
            </div>
            <div className="text-center p-2.5 rounded-md bg-muted/30">
              <p className="text-xl font-semibold text-foreground">
                {stageNodes[1].reduce((sum, n) => sum + n.count, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Roles</p>
            </div>
            <div className="text-center p-2.5 rounded-md bg-muted/30">
              <p className="text-xl font-semibold text-foreground">
                {stageNodes[2].reduce((sum, n) => sum + n.count, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">JTBDs</p>
            </div>
            <div className="text-center p-2.5 rounded-md bg-muted/30">
              <p className="text-xl font-semibold text-foreground">
                {stageNodes[3].reduce((sum, n) => sum + n.count, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Agents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default FlowVisualization
