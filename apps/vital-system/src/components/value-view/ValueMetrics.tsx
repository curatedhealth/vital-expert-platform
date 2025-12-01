'use client'

/**
 * ValueMetrics - Dashboard KPI Cards
 *
 * Displays key value metrics for the VITAL platform including:
 * - Total JTBDs and coverage statistics
 * - ODI opportunity tier distribution
 * - Agent and workflow coverage
 * - VPANES composite scores
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Target,
  BarChart3,
  Bot,
  GitBranch,
  Building2,
  Users,
  Layers,
  Sparkles,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type ValueMetrics as Metrics, type VPANESScores } from '@/stores/valueViewStore'

// ═══════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  bgClass: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  progress?: {
    value: number
    max: number
    label?: string
  }
  delay?: number
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  bgClass,
  trend,
  progress,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={cn('relative overflow-hidden', bgClass, 'border-0')}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </p>
              <p className={cn('text-3xl font-bold mt-1', colorClass)}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
              {trend && (
                <div
                  className={cn(
                    'flex items-center gap-1 mt-2 text-sm',
                    trend.direction === 'up' && 'text-green-600',
                    trend.direction === 'down' && 'text-red-600',
                    trend.direction === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  <TrendingUp
                    className={cn(
                      'h-4 w-4',
                      trend.direction === 'down' && 'rotate-180'
                    )}
                  />
                  <span>
                    {trend.value > 0 ? '+' : ''}
                    {trend.value}%
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                'p-3 rounded-xl',
                bgClass.replace('bg-', 'bg-').replace('/10', '/20')
              )}
            >
              <Icon className={cn('h-6 w-6', colorClass)} />
            </div>
          </div>

          {progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {progress.label || 'Progress'}
                </span>
                <span className={cn('font-medium', colorClass)}>
                  {Math.round((progress.value / progress.max) * 100)}%
                </span>
              </div>
              <Progress
                value={(progress.value / progress.max) * 100}
                className="h-2"
              />
            </div>
          )}
        </CardContent>

        {/* Decorative gradient */}
        <div
          className={cn(
            'absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2',
            colorClass.replace('text-', 'bg-')
          )}
        />
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ODI DISTRIBUTION CARD
// ═══════════════════════════════════════════════════════════════════

interface ODIDistributionProps {
  extreme: number
  high: number
  moderate: number
  tableStakes: number
  total: number
}

function ODIDistributionCard({
  extreme,
  high,
  moderate,
  tableStakes,
  total,
}: ODIDistributionProps) {
  const tiers = [
    { label: 'Extreme', value: extreme, color: '#DC2626', bgColor: 'rgba(220,38,38,0.1)' },
    { label: 'High', value: high, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)' },
    { label: 'Moderate', value: moderate, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.1)' },
    { label: 'Table Stakes', value: tableStakes, color: '#6B7280', bgColor: 'rgba(107,114,128,0.1)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-0">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ODI Distribution
              </p>
              <p className="text-2xl font-bold text-pink-600">
                {total} Opportunities
              </p>
            </div>
            <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30">
              <Target className="h-6 w-6 text-pink-600" />
            </div>
          </div>

          <div className="space-y-3">
            {tiers.map((tier) => {
              const percent = total > 0 ? (tier.value / total) * 100 : 0
              return (
                <div key={tier.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{tier.label}</span>
                    <span className="font-medium" style={{ color: tier.color }}>
                      {tier.value}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VPANES SCORE CARD
// ═══════════════════════════════════════════════════════════════════

interface VPANESCardProps {
  scores: VPANESScores | null
}

function VPANESCard({ scores }: VPANESCardProps) {
  if (!scores) return null

  const factors = [
    { key: 'value', label: 'Value', weight: '20%', color: '#8B5CF6' },
    { key: 'pain', label: 'Pain', weight: '15%', color: '#EF4444' },
    { key: 'adoption', label: 'Adoption', weight: '15%', color: '#10B981' },
    { key: 'network', label: 'Network', weight: '15%', color: '#06B6D4' },
    { key: 'ease', label: 'Ease', weight: '15%', color: '#F59E0B' },
    { key: 'strategic', label: 'Strategic', weight: '20%', color: '#2563EB' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 border-0">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                VPANES Score
              </p>
              <p className="text-3xl font-bold text-violet-600">
                {scores.composite.toFixed(1)}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 cursor-help">
                    <Sparkles className="h-6 w-6 text-violet-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="font-medium mb-2">VPANES Framework</p>
                  <p className="text-sm text-muted-foreground">
                    Composite prioritization score combining Value (20%), Pain (15%),
                    Adoption (15%), Network (15%), Ease (15%), and Strategic (20%) factors.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {factors.map((factor) => {
              const score = scores[factor.key as keyof VPANESScores] as number
              return (
                <div
                  key={factor.key}
                  className="p-2 rounded-lg bg-white/50 dark:bg-black/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {factor.label}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0"
                    >
                      {factor.weight}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold" style={{ color: factor.color }}>
                    {score.toFixed(1)}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN VALUE METRICS COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface ValueMetricsProps {
  metrics: Metrics
  vpanes: VPANESScores | null
  className?: string
}

export function ValueMetrics({ metrics, vpanes, className }: ValueMetricsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total JTBDs"
          value={metrics.totalJTBDs}
          subtitle="Jobs-to-be-Done"
          icon={Briefcase}
          colorClass="text-cyan-600"
          bgClass="bg-cyan-50 dark:bg-cyan-950/20"
          delay={0}
        />
        <MetricCard
          title="Functions"
          value={metrics.totalFunctions}
          subtitle="Business areas"
          icon={Building2}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50 dark:bg-emerald-950/20"
          delay={0.05}
        />
        <MetricCard
          title="Roles"
          value={metrics.totalRoles}
          subtitle="Job positions"
          icon={Users}
          colorClass="text-orange-600"
          bgClass="bg-orange-50 dark:bg-orange-950/20"
          delay={0.1}
        />
        <MetricCard
          title="AI Agents"
          value={metrics.totalAgents}
          subtitle={`${metrics.agentCoverage.toFixed(0)}% coverage`}
          icon={Bot}
          colorClass="text-purple-600"
          bgClass="bg-purple-50 dark:bg-purple-950/20"
          progress={{
            value: metrics.agentCoverage,
            max: 100,
            label: 'Coverage',
          }}
          delay={0.15}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ODIDistributionCard
          extreme={metrics.extremeOpportunities}
          high={metrics.highOpportunities}
          moderate={metrics.moderateOpportunities}
          tableStakes={metrics.tableStakes}
          total={
            metrics.extremeOpportunities +
            metrics.highOpportunities +
            metrics.moderateOpportunities +
            metrics.tableStakes
          }
        />

        <MetricCard
          title="Avg ODI Score"
          value={metrics.avgODIScore.toFixed(1)}
          subtitle="Opportunity-Driven Innovation"
          icon={Target}
          colorClass="text-pink-600"
          bgClass="bg-pink-50 dark:bg-pink-950/20"
          delay={0.25}
        />

        {vpanes ? (
          <VPANESCard scores={vpanes} />
        ) : (
          <MetricCard
            title="Workflow Coverage"
            value={`${metrics.workflowCoverage.toFixed(0)}%`}
            subtitle="JTBDs with workflows"
            icon={GitBranch}
            colorClass="text-indigo-600"
            bgClass="bg-indigo-50 dark:bg-indigo-950/20"
            progress={{
              value: metrics.workflowCoverage,
              max: 100,
              label: 'Coverage',
            }}
            delay={0.3}
          />
        )}
      </div>
    </div>
  )
}

export default ValueMetrics
