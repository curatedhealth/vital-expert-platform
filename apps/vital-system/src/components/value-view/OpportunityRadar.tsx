'use client'

/**
 * OpportunityRadar - ODI-Based Opportunity Visualization
 *
 * Visualizes AI transformation opportunities using the ODI (Opportunity-Driven Innovation) formula:
 * Opportunity Score = Importance + MAX(Importance - Satisfaction, 0)
 *
 * Tiers:
 * - Extreme (15+): Red - High priority, immediate action
 * - High (12-14.9): Amber - Strong candidates for AI intervention
 * - Moderate (10-11.9): Blue - Worth investigating
 * - Table Stakes (<10): Gray - Low priority
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Bot,
  ArrowRight,
  BarChart3,
  Info,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type ODIOpportunity, type ODITier } from '@/stores/valueViewStore'

// ═══════════════════════════════════════════════════════════════════
// ODI TIER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const ODI_TIER_CONFIG: Record<ODITier, {
  label: string
  description: string
  colorClass: string
  bgClass: string
  borderClass: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  extreme: {
    label: 'Extreme',
    description: 'Score 15+: High priority opportunities requiring immediate attention',
    colorClass: 'text-[#DC2626]',
    bgClass: 'bg-[rgba(220,38,38,0.1)]',
    borderClass: 'border-[#DC2626]',
    icon: AlertTriangle,
  },
  high: {
    label: 'High',
    description: 'Score 12-14.9: Strong candidates for AI transformation',
    colorClass: 'text-[#F59E0B]',
    bgClass: 'bg-[rgba(245,158,11,0.1)]',
    borderClass: 'border-[#F59E0B]',
    icon: TrendingUp,
  },
  moderate: {
    label: 'Moderate',
    description: 'Score 10-11.9: Worth investigating for potential value',
    colorClass: 'text-[#3B82F6]',
    bgClass: 'bg-[rgba(59,130,246,0.1)]',
    borderClass: 'border-[#3B82F6]',
    icon: Target,
  },
  'table-stakes': {
    label: 'Table Stakes',
    description: 'Score <10: Lower priority, basic expectations',
    colorClass: 'text-[#6B7280]',
    bgClass: 'bg-[rgba(107,114,128,0.1)]',
    borderClass: 'border-[#6B7280]',
    icon: BarChart3,
  },
}

// ═══════════════════════════════════════════════════════════════════
// OPPORTUNITY CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface OpportunityCardProps {
  opportunity: ODIOpportunity
  rank: number
  onClick: () => void
  isSelected: boolean
}

function OpportunityCard({ opportunity, rank, onClick, isSelected }: OpportunityCardProps) {
  const config = ODI_TIER_CONFIG[opportunity.tier]
  const TierIcon = config.icon

  // Calculate the gap percentage for visualization
  const gapPercent = Math.min((opportunity.gap / 10) * 100, 100)
  const aiSuitabilityPercent = opportunity.ai_suitability * 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: rank * 0.03 }}
      whileHover={{ scale: 1.01 }}
      className="relative"
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200',
          config.bgClass,
          isSelected && 'ring-2 ring-offset-2',
          isSelected && config.borderClass.replace('border-', 'ring-')
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Rank Badge */}
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg',
                config.bgClass,
                config.colorClass,
                'border',
                config.borderClass
              )}
            >
              #{rank}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{opportunity.jtbd_name}</h4>
                <Badge
                  variant="outline"
                  className={cn('text-xs', config.colorClass, config.borderClass)}
                >
                  <TierIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              {/* Context */}
              <p className="text-sm text-muted-foreground truncate">
                {opportunity.function_name}
                {opportunity.role_name && ` / ${opportunity.role_name}`}
              </p>

              {/* Metrics Row */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                {/* Importance */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Importance</span>
                    <span className="font-medium">{opportunity.importance}/10</span>
                  </div>
                  <Progress
                    value={opportunity.importance * 10}
                    className="h-1.5"
                  />
                </div>

                {/* Satisfaction Gap */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Gap</span>
                    <span className={cn('font-medium', config.colorClass)}>
                      {opportunity.gap.toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={gapPercent}
                    className={cn('h-1.5', config.bgClass)}
                  />
                </div>

                {/* AI Suitability */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">AI Fit</span>
                    <span className="font-medium">
                      {opportunity.ai_suitability.toFixed(1)}/10
                    </span>
                  </div>
                  <Progress
                    value={aiSuitabilityPercent}
                    className="h-1.5 bg-purple-100"
                  />
                </div>
              </div>
            </div>

            {/* ODI Score */}
            <div className="flex flex-col items-end gap-2">
              <div
                className={cn(
                  'text-2xl font-bold px-3 py-1 rounded-lg',
                  config.bgClass,
                  config.colorClass,
                  'border',
                  config.borderClass
                )}
              >
                {opportunity.opportunity_score.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {opportunity.agent_assigned ? (
                  <>
                    <Bot className="h-3 w-3 text-green-500" />
                    <span>Agent</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>No Agent</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TIER SUMMARY CARD
// ═══════════════════════════════════════════════════════════════════

interface TierSummaryProps {
  tier: ODITier
  count: number
  total: number
  onClick: () => void
  isActive: boolean
}

function TierSummary({ tier, count, total, onClick, isActive }: TierSummaryProps) {
  const config = ODI_TIER_CONFIG[tier]
  const TierIcon = config.icon
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200',
              config.bgClass,
              config.borderClass,
              isActive && 'ring-2 ring-offset-2',
              isActive && config.borderClass.replace('border-', 'ring-'),
              'hover:scale-105'
            )}
          >
            <TierIcon className={cn('h-6 w-6 mb-2', config.colorClass)} />
            <span className={cn('text-2xl font-bold', config.colorClass)}>
              {count}
            </span>
            <span className="text-xs text-muted-foreground">{config.label}</span>
            <span className="text-xs text-muted-foreground mt-1">{percentage}%</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{config.label} Opportunities</p>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN OPPORTUNITY RADAR COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface OpportunityRadarProps {
  opportunities: ODIOpportunity[]
  selectedOpportunity: ODIOpportunity | null
  onSelectOpportunity: (opp: ODIOpportunity | null) => void
  sortBy: 'score' | 'importance' | 'gap' | 'ai_suitability'
  sortOrder: 'asc' | 'desc'
  onSort: (by: 'score' | 'importance' | 'gap' | 'ai_suitability') => void
  tierFilter: ODITier | 'all'
  onTierFilter: (tier: ODITier | 'all') => void
  className?: string
}

export function OpportunityRadar({
  opportunities,
  selectedOpportunity,
  onSelectOpportunity,
  sortBy,
  sortOrder,
  onSort,
  tierFilter,
  onTierFilter,
  className,
}: OpportunityRadarProps) {
  // Calculate tier counts
  const tierCounts = useMemo(() => {
    const counts: Record<ODITier | 'all', number> = {
      extreme: 0,
      high: 0,
      moderate: 0,
      'table-stakes': 0,
      all: opportunities.length,
    }

    opportunities.forEach((opp) => {
      counts[opp.tier]++
    })

    return counts
  }, [opportunities])

  // Filter opportunities by tier
  const filteredOpportunities = useMemo(() => {
    if (tierFilter === 'all') return opportunities
    return opportunities.filter((opp) => opp.tier === tierFilter)
  }, [opportunities, tierFilter])

  // Calculate average ODI score
  const avgScore = useMemo(() => {
    if (opportunities.length === 0) return 0
    const sum = opportunities.reduce((acc, opp) => acc + opp.opportunity_score, 0)
    return sum / opportunities.length
  }, [opportunities])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-pink-500" />
              Opportunity Radar
            </h3>
            <p className="text-sm text-muted-foreground">
              ODI-scored AI transformation opportunities
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="font-medium mb-2">ODI Scoring Formula</p>
                <code className="text-xs bg-muted p-2 rounded block mb-2">
                  ODI = Importance + MAX(Importance - Satisfaction, 0)
                </code>
                <p className="text-sm text-muted-foreground">
                  Higher scores indicate greater opportunity for AI-driven improvement
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Tier Summary Cards */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <button
            onClick={() => onTierFilter('all')}
            className={cn(
              'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200',
              'bg-muted/30 border-muted-foreground/20',
              tierFilter === 'all' && 'ring-2 ring-offset-2 ring-muted-foreground/50',
              'hover:scale-105'
            )}
          >
            <Filter className="h-6 w-6 mb-2 text-muted-foreground" />
            <span className="text-2xl font-bold">{tierCounts.all}</span>
            <span className="text-xs text-muted-foreground">All</span>
          </button>

          {(['extreme', 'high', 'moderate', 'table-stakes'] as ODITier[]).map((tier) => (
            <TierSummary
              key={tier}
              tier={tier}
              count={tierCounts[tier]}
              total={tierCounts.all}
              onClick={() => onTierFilter(tier)}
              isActive={tierFilter === tier}
            />
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(v) => onSort(v as typeof sortBy)}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">ODI Score</SelectItem>
                <SelectItem value="importance">Importance</SelectItem>
                <SelectItem value="gap">Gap</SelectItem>
                <SelectItem value="ai_suitability">AI Fit</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onSort(sortBy)}
            >
              {sortOrder === 'desc' ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Badge variant="outline" className="text-sm">
            Avg Score: <span className="font-bold ml-1">{avgScore.toFixed(1)}</span>
          </Badge>
        </div>
      </div>

      {/* Opportunity List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No opportunities found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            filteredOpportunities.map((opp, index) => (
              <OpportunityCard
                key={opp.id || index}
                opportunity={opp}
                rank={index + 1}
                onClick={() => onSelectOpportunity(opp)}
                isSelected={selectedOpportunity?.id === opp.id}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default OpportunityRadar
