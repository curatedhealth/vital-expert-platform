'use client'

/**
 * WorkflowsVisualization - Workflow Templates by Industry
 *
 * Displays workflow templates organized by industry category
 * with filtering by Digital Health, Pharmaceuticals, and VITAL System.
 */

import React, { useMemo, useState, useEffect } from 'react'
import {
  Workflow,
  Building2,
  Pill,
  Monitor,
  Clock,
  Layers,
  ListChecks,
  Briefcase,
  RotateCcw,
  Zap,
  ChevronRight,
  Loader2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

// Industry categories
type IndustryCategory = 'all' | 'Digital Health' | 'Pharmaceuticals' | 'VITAL System'

// Workflow template type (matches API response)
interface WorkflowTemplate {
  id: string
  code: string
  name: string
  description: string | null
  work_mode: 'routine' | 'project' | 'adhoc'
  workflow_type: 'standard' | 'conditional' | 'parallel' | 'sequential'
  complexity_level: 'low' | 'medium' | 'high' | 'very_high'
  estimated_duration_hours: number | null
  stage_count: number
  task_count: number
  industry_category: 'Digital Health' | 'Pharmaceuticals' | 'VITAL System'
}

interface WorkflowsSummary {
  total: number
  byIndustry: {
    'Digital Health': number
    'Pharmaceuticals': number
    'VITAL System': number
  }
  byWorkMode: {
    project: number
    routine: number
    adhoc: number
  }
}

// Industry icons and colors
const INDUSTRY_CONFIG: Record<'Digital Health' | 'Pharmaceuticals' | 'VITAL System', {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}> = {
  'Digital Health': {
    icon: Monitor,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  'Pharmaceuticals': {
    icon: Pill,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  'VITAL System': {
    icon: Building2,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
  },
}

// Work mode icons
const WORK_MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  project: Briefcase,
  routine: RotateCcw,
  adhoc: Zap,
}

// Complexity level colors
function getComplexityColor(level: string): string {
  switch (level) {
    case 'very_high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    case 'high':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
  }
}

interface WorkflowsVisualizationProps {
  className?: string
}

export function WorkflowsVisualization({ className }: WorkflowsVisualizationProps) {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([])
  const [summary, setSummary] = useState<WorkflowsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [industryFilter, setIndustryFilter] = useState<IndustryCategory>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null)

  // Fetch workflow data
  useEffect(() => {
    async function fetchWorkflows() {
      try {
        setLoading(true)
        const response = await fetch('/api/workflow-templates')
        if (!response.ok) {
          throw new Error('Failed to fetch workflows')
        }
        const data = await response.json()
        setWorkflows(data.workflows || [])
        setSummary(data.summary || null)
        setError(null)
      } catch (err) {
        console.error('Error fetching workflows:', err)
        setError(err instanceof Error ? err.message : 'Failed to load workflows')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  // Filter workflows by industry
  const filteredWorkflows = useMemo(() => {
    if (industryFilter === 'all') return workflows
    return workflows.filter(wf => wf.industry_category === industryFilter)
  }, [workflows, industryFilter])

  // Group workflows by industry
  const groupedWorkflows = useMemo(() => {
    const groups: Record<string, WorkflowTemplate[]> = {
      'Digital Health': [],
      'Pharmaceuticals': [],
      'VITAL System': [],
    }
    filteredWorkflows.forEach(wf => {
      if (groups[wf.industry_category]) {
        groups[wf.industry_category].push(wf)
      }
    })
    return groups
  }, [filteredWorkflows])

  if (loading) {
    return (
      <Card className={cn('h-full border-border/40', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('h-full border-border/40', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

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
                <CardTitle className="text-base font-medium">Workflow Templates</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {summary?.total || 0} workflows across industries
                </p>
              </div>
            </div>

            {/* Industry Filter */}
            <Select
              value={industryFilter}
              onValueChange={(v: IndustryCategory) => setIndustryFilter(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    All Industries
                  </div>
                </SelectItem>
                <SelectItem value="Digital Health">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    Digital Health
                  </div>
                </SelectItem>
                <SelectItem value="Pharmaceuticals">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-purple-600" />
                    Pharmaceuticals
                  </div>
                </SelectItem>
                <SelectItem value="VITAL System">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-600" />
                    VITAL System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(['Digital Health', 'Pharmaceuticals', 'VITAL System'] as const).map(industry => {
                const config = INDUSTRY_CONFIG[industry]
                const Icon = config.icon
                const count = summary.byIndustry[industry]
                return (
                  <div
                    key={industry}
                    className={cn(
                      'p-2.5 rounded-md text-center cursor-pointer transition-all',
                      config.bgColor,
                      industryFilter === industry && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    onClick={() => setIndustryFilter(industry)}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <p className="text-xl font-semibold text-foreground">{count}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{industry}</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <ScrollArea className="h-[420px] pr-4">
            {industryFilter === 'all' ? (
              // Show grouped by industry
              Object.entries(groupedWorkflows).map(([industry, wfs]) => {
                if (wfs.length === 0) return null
                const config = INDUSTRY_CONFIG[industry as keyof typeof INDUSTRY_CONFIG]
                const Icon = config.icon
                return (
                  <div key={industry} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <h3 className="text-sm font-medium">{industry}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {wfs.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {wfs.map(wf => (
                        <WorkflowCard
                          key={wf.id}
                          workflow={wf}
                          isSelected={selectedWorkflow?.id === wf.id}
                          onSelect={() => setSelectedWorkflow(selectedWorkflow?.id === wf.id ? null : wf)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              // Show filtered list
              <div className="space-y-2">
                {filteredWorkflows.map(wf => (
                  <WorkflowCard
                    key={wf.id}
                    workflow={wf}
                    isSelected={selectedWorkflow?.id === wf.id}
                    onSelect={() => setSelectedWorkflow(selectedWorkflow?.id === wf.id ? null : wf)}
                  />
                ))}
              </div>
            )}

            {filteredWorkflows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Workflow className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No workflows found</p>
              </div>
            )}
          </ScrollArea>

          {/* Work Mode Legend */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Project</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Routine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Ad-hoc</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// Individual workflow card component
function WorkflowCard({
  workflow,
  isSelected,
  onSelect,
}: {
  workflow: WorkflowTemplate
  isSelected: boolean
  onSelect: () => void
}) {
  const WorkModeIcon = WORK_MODE_ICONS[workflow.work_mode] || Briefcase

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'p-3 rounded-lg border cursor-pointer transition-all',
            'hover:border-primary/30 hover:bg-muted/30',
            isSelected && 'border-primary bg-primary/5'
          )}
          onClick={onSelect}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <WorkModeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm font-medium truncate">{workflow.name}</p>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="outline" className="text-[10px] px-1.5">
                  {workflow.code}
                </Badge>
                <Badge className={cn('text-[10px] px-1.5', getComplexityColor(workflow.complexity_level))}>
                  {workflow.complexity_level}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Layers className="h-3 w-3" />
                {workflow.stage_count} stages
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ListChecks className="h-3 w-3" />
                {workflow.task_count} tasks
              </div>
              {workflow.estimated_duration_hours && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {workflow.estimated_duration_hours}h
                </div>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {isSelected && (
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Work Mode</p>
                  <p className="font-medium capitalize">{workflow.work_mode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Workflow Type</p>
                  <p className="font-medium capitalize">{workflow.workflow_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Industry</p>
                  <p className="font-medium">{workflow.industry_category}</p>
                </div>
                {workflow.estimated_duration_hours && (
                  <div>
                    <p className="text-muted-foreground">Est. Duration</p>
                    <p className="font-medium">{workflow.estimated_duration_hours} hours</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">{workflow.name}</p>
          <p className="text-muted-foreground">
            {workflow.stage_count} stages, {workflow.task_count} tasks
          </p>
          {workflow.estimated_duration_hours && (
            <p className="text-muted-foreground">
              Estimated: {workflow.estimated_duration_hours} hours
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default WorkflowsVisualization
