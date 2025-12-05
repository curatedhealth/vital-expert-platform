'use client'

/**
 * OpportunityDetailPanel - Evidence-Based Deep Dive for ODI Opportunities
 *
 * Shows detailed information when an opportunity is selected including:
 * - ODI Score breakdown with visual gauge
 * - Evidence sources with confidence levels
 * - AI-generated recommendations
 * - Related agents and workflows
 * - Pain points and desired outcomes
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Target,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  FileText,
  Bot,
  GitBranch,
  Lightbulb,
  Shield,
  Clock,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Gauge,
  BookOpen,
  FlaskConical,
  MessageSquare,
  LineChart,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  type ODIOpportunity,
  type ODITier,
  type EvidenceSource,
  type AIRecommendation,
  type RelatedAgent,
  type RelatedWorkflow,
} from '@/stores/valueViewStore'

// ═══════════════════════════════════════════════════════════════════
// ODI TIER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const ODI_TIER_CONFIG: Record<ODITier, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  extreme: {
    label: 'Extreme',
    color: '#DC2626',
    bgColor: 'rgba(220,38,38,0.1)',
    borderColor: 'rgba(220,38,38,0.3)',
    icon: AlertTriangle,
  },
  high: {
    label: 'High',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.3)',
    icon: TrendingUp,
  },
  moderate: {
    label: 'Moderate',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.3)',
    icon: Target,
  },
  'table-stakes': {
    label: 'Table Stakes',
    color: '#6B7280',
    bgColor: 'rgba(107,114,128,0.1)',
    borderColor: 'rgba(107,114,128,0.3)',
    icon: BarChart3,
  },
}

const EVIDENCE_TYPE_CONFIG = {
  survey: { icon: MessageSquare, label: 'Survey', color: 'text-blue-600' },
  interview: { icon: Users, label: 'Interview', color: 'text-green-600' },
  analytics: { icon: LineChart, label: 'Analytics', color: 'text-purple-600' },
  research: { icon: BookOpen, label: 'Research', color: 'text-amber-600' },
  benchmark: { icon: Award, label: 'Benchmark', color: 'text-cyan-600' },
}

const CONFIDENCE_CONFIG = {
  high: { label: 'High Confidence', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { label: 'Medium Confidence', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  low: { label: 'Low Confidence', color: 'text-red-600', bgColor: 'bg-red-100' },
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' },
  high: { label: 'High', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  medium: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  low: { label: 'Low', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
}

// ═══════════════════════════════════════════════════════════════════
// ODI SCORE GAUGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface ODIGaugeProps {
  score: number
  importance: number
  satisfaction: number
  gap: number
  tier: ODITier
}

function ODIGauge({ score, importance, satisfaction, gap, tier }: ODIGaugeProps) {
  const config = ODI_TIER_CONFIG[tier]
  const TierIcon = config.icon

  // Calculate gauge percentage (max score is 20)
  const gaugePercent = Math.min((score / 20) * 100, 100)

  return (
    <div className="relative">
      {/* Main Score Display */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div
          className="relative w-32 h-32 rounded-full flex items-center justify-center"
          style={{ backgroundColor: config.bgColor, border: `3px solid ${config.color}` }}
        >
          <div className="text-center">
            <TierIcon className="h-6 w-6 mx-auto mb-1" style={{ color: config.color }} />
            <span className="text-3xl font-bold" style={{ color: config.color }}>
              {score.toFixed(1)}
            </span>
            <p className="text-xs text-muted-foreground">ODI Score</p>
          </div>

          {/* Gauge Arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/20"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke={config.color}
              strokeWidth="4"
              strokeDasharray={`${gaugePercent * 3.64} 364`}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Importance</span>
              <span className="font-medium">{importance}/10</span>
            </div>
            <Progress value={importance * 10} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Satisfaction</span>
              <span className="font-medium">{satisfaction}/10</span>
            </div>
            <Progress value={satisfaction * 10} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Gap</span>
              <span className="font-medium" style={{ color: config.color }}>
                {gap.toFixed(1)}
              </span>
            </div>
            <Progress
              value={Math.min(gap * 10, 100)}
              className="h-2"
              style={{ backgroundColor: config.bgColor }}
            />
          </div>
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="p-3 rounded-lg bg-muted/30 text-center">
        <code className="text-xs">
          ODI = {importance} + MAX({importance} - {satisfaction}, 0) = {score.toFixed(1)}
        </code>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// EVIDENCE SOURCE CARD
// ═══════════════════════════════════════════════════════════════════

interface EvidenceCardProps {
  evidence: EvidenceSource
}

function EvidenceCard({ evidence }: EvidenceCardProps) {
  const typeConfig = EVIDENCE_TYPE_CONFIG[evidence.source_type]
  const confConfig = CONFIDENCE_CONFIG[evidence.confidence_level]
  const TypeIcon = typeConfig.icon

  return (
    <Card className="border-l-4" style={{ borderLeftColor: typeConfig.color.replace('text-', '').replace('-600', '') }}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', confConfig.bgColor)}>
            <TypeIcon className={cn('h-4 w-4', typeConfig.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{evidence.title}</h4>
              <Badge
                variant="outline"
                className={cn('text-xs', confConfig.color)}
              >
                {confConfig.label}
              </Badge>
            </div>

            {evidence.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {evidence.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {typeConfig.label}
              </span>
              {evidence.sample_size && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  n={evidence.sample_size}
                </span>
              )}
              {evidence.date && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {evidence.date}
                </span>
              )}
            </div>

            {evidence.citation && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                "{evidence.citation}"
              </p>
            )}

            {evidence.url && (
              <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                  View Source <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AI RECOMMENDATION CARD
// ═══════════════════════════════════════════════════════════════════

interface RecommendationCardProps {
  recommendation: AIRecommendation
  index: number
}

function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const priorityConfig = PRIORITY_CONFIG[recommendation.priority]
  const [expanded, setExpanded] = useState(false)

  const categoryIcons = {
    automation: Zap,
    augmentation: Lightbulb,
    redesign: FlaskConical,
    insight: Info,
  }
  const CategoryIcon = categoryIcons[recommendation.category]

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className={cn('transition-all', expanded && 'ring-2 ring-purple-200')}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{recommendation.title}</h4>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', priorityConfig.color)}
                  >
                    {priorityConfig.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {recommendation.category}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {recommendation.description}
                </p>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8">
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">
                  Expected Impact
                </h5>
                <p className="text-sm">{recommendation.expected_impact}</p>
              </div>

              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">
                  Effort Estimate
                </h5>
                <Badge
                  variant={recommendation.effort_estimate === 'low' ? 'default' : 'outline'}
                  className="capitalize"
                >
                  {recommendation.effort_estimate} effort
                </Badge>
              </div>

              {recommendation.timeframe && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">
                    Timeframe
                  </h5>
                  <p className="text-sm">{recommendation.timeframe}</p>
                </div>
              )}

              {recommendation.prerequisites && recommendation.prerequisites.length > 0 && (
                <div className="col-span-2">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">
                    Prerequisites
                  </h5>
                  <ul className="text-sm space-y-1">
                    {recommendation.prerequisites.map((prereq, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RELATED CONTENT SECTION
// ═══════════════════════════════════════════════════════════════════

interface RelatedAgentCardProps {
  agent: RelatedAgent
}

function RelatedAgentCard({ agent }: RelatedAgentCardProps) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          {agent.avatar_url ? (
            <img src={agent.avatar_url} alt={agent.name} className="w-8 h-8 rounded" />
          ) : (
            <Bot className="h-5 w-5 text-purple-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{agent.name}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Tier {agent.tier}
            </Badge>
            <Badge
              variant={agent.status === 'active' ? 'default' : 'secondary'}
              className="text-xs capitalize"
            >
              {agent.status}
            </Badge>
          </div>
        </div>

        {agent.coverage_score !== undefined && (
          <div className="text-right">
            <span className="text-lg font-bold text-purple-600">
              {agent.coverage_score}%
            </span>
            <p className="text-xs text-muted-foreground">Coverage</p>
          </div>
        )}
      </div>
    </Card>
  )
}

interface RelatedWorkflowCardProps {
  workflow: RelatedWorkflow
}

function RelatedWorkflowCard({ workflow }: RelatedWorkflowCardProps) {
  const statusColors = {
    production: 'text-green-600',
    development: 'text-amber-600',
    planned: 'text-blue-600',
  }

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
          <GitBranch className="h-5 w-5 text-cyan-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{workflow.name}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-xs capitalize', statusColors[workflow.status])}>
              {workflow.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {workflow.stage_count} stages
            </span>
          </div>
        </div>

        {workflow.automation_level !== undefined && (
          <div className="text-right">
            <span className="text-lg font-bold text-cyan-600">
              {workflow.automation_level}%
            </span>
            <p className="text-xs text-muted-foreground">Automated</p>
          </div>
        )}
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface OpportunityDetailPanelProps {
  opportunity: ODIOpportunity
  onClose: () => void
  className?: string
}

export function OpportunityDetailPanel({
  opportunity,
  onClose,
  className,
}: OpportunityDetailPanelProps) {
  const config = ODI_TIER_CONFIG[opportunity.tier]
  const TierIcon = config.icon

  // Generate mock evidence if not provided
  const evidenceSources = opportunity.evidence_sources || generateMockEvidence(opportunity)
  const recommendations = opportunity.ai_recommendations || generateMockRecommendations(opportunity)
  const relatedAgents = opportunity.related_agents || []
  const relatedWorkflows = opportunity.related_workflows || []

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn('flex flex-col h-full', className)}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                style={{ backgroundColor: config.bgColor, color: config.color, borderColor: config.color }}
                className="text-xs"
              >
                <TierIcon className="h-3 w-3 mr-1" />
                {config.label} Priority
              </Badge>
              {opportunity.confidence_score && (
                <Badge variant="outline" className="text-xs">
                  {opportunity.confidence_score}% Confidence
                </Badge>
              )}
            </div>

            <h2 className="text-lg font-semibold line-clamp-2">
              {opportunity.jtbd_name}
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              {opportunity.function_name}
              {opportunity.department_name && ` > ${opportunity.department_name}`}
              {opportunity.role_name && ` > ${opportunity.role_name}`}
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Job Statement */}
          {(opportunity.job_statement || opportunity.jtbd_description) && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-purple-600 mb-2">Job Statement</h3>
                <p className="text-sm italic">
                  "{opportunity.job_statement || opportunity.jtbd_description}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* ODI Score Breakdown */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-pink-500" />
              ODI Score Analysis
            </h3>
            <Card>
              <CardContent className="p-4">
                <ODIGauge
                  score={opportunity.opportunity_score}
                  importance={opportunity.importance}
                  satisfaction={opportunity.satisfaction}
                  gap={opportunity.gap}
                  tier={opportunity.tier}
                />
              </CardContent>
            </Card>
          </div>

          {/* AI Suitability */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-500" />
              AI Transformation Potential
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {opportunity.ai_suitability.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">AI Suitability</p>
                    <Progress
                      value={opportunity.ai_suitability * 10}
                      className="h-1.5 mt-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      {opportunity.automation_potential || Math.round(opportunity.ai_suitability * 8)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Automation</p>
                    <Progress
                      value={opportunity.automation_potential || opportunity.ai_suitability * 8}
                      className="h-1.5 mt-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {opportunity.augmentation_potential || Math.round(opportunity.ai_suitability * 9)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Augmentation</p>
                    <Progress
                      value={opportunity.augmentation_potential || opportunity.ai_suitability * 9}
                      className="h-1.5 mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="evidence" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="evidence" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Evidence
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs">
                <Lightbulb className="h-3 w-3 mr-1" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="related" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                Related
              </TabsTrigger>
              <TabsTrigger value="context" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Context
              </TabsTrigger>
            </TabsList>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="mt-4 space-y-3">
              {evidenceSources.length > 0 ? (
                evidenceSources.map((evidence) => (
                  <EvidenceCard key={evidence.id} evidence={evidence} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No evidence sources available</p>
                  <p className="text-sm">Data will be enriched over time</p>
                </div>
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="mt-4 space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <RecommendationCard key={rec.id} recommendation={rec} index={index} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No recommendations generated yet</p>
                  <p className="text-sm">AI analysis pending</p>
                </div>
              )}
            </TabsContent>

            {/* Related Tab */}
            <TabsContent value="related" className="mt-4 space-y-4">
              {relatedAgents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Assigned Agents ({relatedAgents.length})
                  </h4>
                  <div className="space-y-2">
                    {relatedAgents.map((agent) => (
                      <RelatedAgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                </div>
              )}

              {relatedWorkflows.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Related Workflows ({relatedWorkflows.length})
                  </h4>
                  <div className="space-y-2">
                    {relatedWorkflows.map((workflow) => (
                      <RelatedWorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                  </div>
                </div>
              )}

              {relatedAgents.length === 0 && relatedWorkflows.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No related resources found</p>
                  <p className="text-sm">Agents and workflows will be linked over time</p>
                </div>
              )}
            </TabsContent>

            {/* Context Tab */}
            <TabsContent value="context" className="mt-4 space-y-4">
              {/* Pain Points */}
              {opportunity.pain_points && opportunity.pain_points.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Pain Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {opportunity.pain_points.map((pain, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-red-500">•</span>
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Desired Outcomes */}
              {opportunity.desired_outcomes && opportunity.desired_outcomes.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Desired Outcomes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {opportunity.desired_outcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Success Criteria */}
              {opportunity.success_criteria && opportunity.success_criteria.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      Success Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {opportunity.success_criteria.map((criteria, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-500">✓</span>
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Risk Factors */}
              {opportunity.risk_factors && opportunity.risk_factors.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {opportunity.risk_factors.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Stakeholders */}
              {opportunity.stakeholders && opportunity.stakeholders.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Key Stakeholders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {opportunity.stakeholders.map((stakeholder, i) => (
                        <Badge key={i} variant="secondary">
                          {stakeholder}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!opportunity.pain_points?.length &&
                !opportunity.desired_outcomes?.length &&
                !opportunity.success_criteria?.length &&
                !opportunity.risk_factors?.length &&
                !opportunity.stakeholders?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No additional context available</p>
                    <p className="text-sm">This information will be enriched over time</p>
                  </div>
                )}
            </TabsContent>
          </Tabs>

          {/* Data Freshness Footer */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            {opportunity.last_validated && (
              <p>Last validated: {opportunity.last_validated}</p>
            )}
            {opportunity.data_freshness && (
              <p>Data freshness: {opportunity.data_freshness}</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS (for demo purposes)
// ═══════════════════════════════════════════════════════════════════

function generateMockEvidence(opportunity: ODIOpportunity): EvidenceSource[] {
  return [
    {
      id: '1',
      source_type: 'survey',
      title: 'Annual Role Satisfaction Survey 2024',
      description: 'Enterprise-wide survey measuring task importance and satisfaction levels across all functions.',
      citation: 'Based on 2,500+ respondents across 15 departments',
      date: '2024-Q3',
      confidence_level: 'high',
      sample_size: 2500,
      methodology: 'Stratified random sampling with ODI methodology',
    },
    {
      id: '2',
      source_type: 'analytics',
      title: 'Process Mining Analysis',
      description: 'Automated analysis of workflow patterns and bottlenecks.',
      date: '2024-11',
      confidence_level: 'high',
      methodology: 'Event log analysis using process mining algorithms',
    },
    {
      id: '3',
      source_type: 'benchmark',
      title: 'Industry AI Maturity Benchmark',
      description: `AI suitability score of ${opportunity.ai_suitability.toFixed(1)} based on task characteristics.`,
      citation: 'Compared against 500+ similar roles in pharmaceutical industry',
      date: '2024',
      confidence_level: 'medium',
    },
  ]
}

function generateMockRecommendations(opportunity: ODIOpportunity): AIRecommendation[] {
  const isHighPriority = opportunity.tier === 'extreme' || opportunity.tier === 'high'

  return [
    {
      id: '1',
      priority: isHighPriority ? 'critical' : 'high',
      category: 'automation',
      title: 'Implement AI-Assisted Task Automation',
      description: 'Deploy intelligent automation to handle repetitive aspects of this job, reducing manual effort by 40-60%.',
      expected_impact: `Reduce time-to-completion by ${Math.round(opportunity.ai_suitability * 5)}%`,
      effort_estimate: 'medium',
      timeframe: '3-6 months',
      prerequisites: ['Data integration layer', 'Process documentation'],
    },
    {
      id: '2',
      priority: 'high',
      category: 'augmentation',
      title: 'Deploy Expert AI Assistant',
      description: 'Provide AI-powered recommendations and insights to support decision-making in real-time.',
      expected_impact: 'Improve accuracy by 25% and reduce cognitive load',
      effort_estimate: 'low',
      timeframe: '1-2 months',
    },
    {
      id: '3',
      priority: 'medium',
      category: 'insight',
      title: 'Implement Predictive Analytics Dashboard',
      description: 'Create visibility into key metrics and predictive indicators for proactive management.',
      expected_impact: 'Enable proactive issue detection and faster response',
      effort_estimate: 'medium',
      timeframe: '2-4 months',
      prerequisites: ['Data warehouse access', 'KPI definitions'],
    },
  ]
}

export default OpportunityDetailPanel
