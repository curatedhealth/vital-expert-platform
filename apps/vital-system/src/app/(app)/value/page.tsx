'use client'

/**
 * Value View - Enterprise Ontology Dashboard
 *
 * Gold standard implementation of VITAL's 8-layer semantic ontology visualization.
 * Features:
 * - Multiple visualization modes: Stack, Radar, Heatmap, Flow, Metrics
 * - ODI Opportunity Analysis with quadrant visualization
 * - AI Companion for intelligent queries
 * - Cascading filters with global state management
 *
 * Based on VITAL Enterprise OS Ontology Handbook specifications.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  Target,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Filter,
  Download,
  LayoutGrid,
  SlidersHorizontal,
  Workflow,
  Grid3X3,
  BarChart3,
  List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PageHeader } from '@/components/page-header'

// Import Value View components
import { OntologyFilterStack, OpportunityRadar, OpportunityDetailPanel, ValueMetrics } from '@/components/value-view'
import {
  StackVisualization,
  RadarVisualization,
  HeatmapVisualization,
  FlowVisualization,
  WorkflowsVisualization,
} from '@/components/value-view/visualizations'
import {
  useValueViewStore,
  type LayerKey,
  type LayerItem,
  type ODIOpportunity,
  type ODITier,
  type ViewMode,
} from '@/stores/valueViewStore'

// View mode icons
const VIEW_MODE_ICONS: Record<ViewMode, React.ComponentType<{ className?: string }>> = {
  stack: Layers,
  radar: Target,
  heatmap: Grid3X3,
  flow: Workflow,
  metrics: BarChart3,
  list: List,
}

// ═══════════════════════════════════════════════════════════════════
// AI COMPANION TYPES
// ═══════════════════════════════════════════════════════════════════

interface AICompanionMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  analysis_type?: string
  confidence?: number
  recommendations?: Array<{
    priority: string
    category: string
    text: string
    impact: string
  }>
}

// ═══════════════════════════════════════════════════════════════════
// MAIN VALUE PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function ValuePage() {
  // Zustand store
  const {
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    isLoading,
    setLoading,
    error,
    setError,
    filters,
    resetFilters,
    filterOptions,
    setFilterOptions,
    filterLabels,
    layers,
    updateLayerData,
    selectedLayer,
    selectLayer,
    opportunities,
    setOpportunities,
    selectedOpportunity,
    selectOpportunity,
    opportunitySortBy,
    opportunitySortOrder,
    sortOpportunities,
    metrics,
    setMetrics,
    vpanes,
    getActiveFilterCount,
  } = useValueViewStore()

  // URL params for bookmarkable view mode
  const searchParams = useSearchParams()

  // Sync URL params to Zustand on mount and URL change
  useEffect(() => {
    const urlView = searchParams.get('view')
    if (urlView && ['stack', 'radar', 'heatmap', 'flow', 'metrics', 'list'].includes(urlView)) {
      if (urlView !== viewMode) {
        setViewMode(urlView as ViewMode)
      }
    }
  }, [searchParams, viewMode, setViewMode])

  // Local state for AI Companion
  const [messages, setMessages] = useState<AICompanionMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ question: string; category: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ODI tier filter for radar
  const [odiTierFilter, setOdiTierFilter] = useState<ODITier | 'all'>('all')

  // Filter sheet state
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ═══════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════

  const loadAllData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Local variables to collect metrics from both hierarchy and opportunities
      let hierarchyMetrics: Partial<typeof metrics> = {}
      let opportunityMetrics: Partial<typeof metrics> = {}

      // Build query params from filters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== 'all') params.append(key, value)
      })
      const queryPart = params.toString() ? `?${params.toString()}` : ''

      // Parallel data fetching
      const [hierarchyRes, opportunitiesRes, suggestionsRes, tenantsRes] = await Promise.all([
        fetch(`/api/ontology-investigator/hierarchy${queryPart}`),
        fetch(`/api/ontology-investigator/opportunities${queryPart}`, { method: 'POST' }),
        fetch('/api/ontology-investigator/suggestions'),
        fetch('/api/ontology-investigator/tenants'),
      ])

      // Process hierarchy data
      if (hierarchyRes.ok) {
        const data = await hierarchyRes.json()

        // Update layer counts
        const layerUpdates: Partial<Record<LayerKey, { count: number; items: LayerItem[] }>> = {
          L0: {
            count: data.layers?.L0_tenants?.count || 0,
            items: (data.tenants || []).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
          },
          L1: {
            count: data.layers?.L1_functions?.count || 0,
            items: (data.functions || []).map((f: any) => ({
              id: f.id || f.slug,
              name: f.name,
              slug: f.slug,
              count: f.department_count,
            })),
          },
          L2: {
            count: data.layers?.L2_departments?.count || 0,
            items: [],
          },
          L3: {
            count: data.summary?.total_personas || data.layers?.L4_personas?.count || 0,
            items: [],
          },
          L4: {
            count: data.layers?.L5_jtbds?.count || 0,
            items: [],
          },
          L5: {
            count: data.layers?.L5_jtbds?.count || 0,
            items: [],
          },
          L6: {
            count: data.layers?.L6_mappings?.count || 0,
            items: [],
          },
          L7: {
            count: data.summary?.total_agents || data.layers?.L7_agents?.count || 0,
            items: [],
          },
        }

        Object.entries(layerUpdates).forEach(([key, data]) => {
          if (data) updateLayerData(key as LayerKey, data)
        })

        // Store metrics from hierarchy
        hierarchyMetrics = {
          totalJTBDs: data.layers?.L5_jtbds?.count || 0,
          agentCoverage: data.summary?.coverage_percentage || 0,
          totalFunctions: data.summary?.total_functions || 0,
          totalRoles: data.summary?.total_roles || 0,
          totalPersonas: data.summary?.total_personas || 0,
          totalAgents: data.summary?.total_agents || 0,
        }

        // Extract functions for filter options
        if (data.functions) {
          setFilterOptions({
            functions: data.functions.map((f: any) => ({
              id: f.id || f.slug,
              name: f.name,
              slug: f.slug,
            })),
          })
        }
      }

      // Process opportunities
      if (opportunitiesRes.ok) {
        const oppData = await opportunitiesRes.json()
        const opps: ODIOpportunity[] = (oppData.opportunities || oppData || []).map((o: any, i: number) => ({
          id: o.id || `opp-${i}`,
          jtbd_id: o.jtbd_id || o.role_id,
          jtbd_name: o.jtbd_name || o.role_name || 'Unknown',
          role_id: o.role_id,
          role_name: o.role_name,
          function_name: o.function || o.function_name,
          department_name: o.department,
          importance: o.importance || Math.random() * 3 + 7,
          satisfaction: o.satisfaction || Math.random() * 4 + 4,
          opportunity_score: o.opportunity_score || o.opportunity || Math.random() * 6 + 10,
          tier: getODITier(o.opportunity_score || o.opportunity || 12),
          gap: o.gap || (o.importance || 8) - (o.satisfaction || 5),
          ai_suitability: o.ai_suitability || Math.random() * 3 + 6,
          workflow_count: o.workflow_count || 0,
          agent_assigned: o.has_agent || o.agent_assigned || false,
        }))

        setOpportunities(opps)

        // Update ODI tier counts
        const tierCounts = opps.reduce(
          (acc, opp) => {
            acc[opp.tier]++
            return acc
          },
          { extreme: 0, high: 0, moderate: 0, 'table-stakes': 0 } as Record<ODITier, number>
        )

        const avgScore = opps.length > 0
          ? opps.reduce((sum, o) => sum + o.opportunity_score, 0) / opps.length
          : 0

        opportunityMetrics = {
          extremeOpportunities: tierCounts.extreme,
          highOpportunities: tierCounts.high,
          moderateOpportunities: tierCounts.moderate,
          tableStakes: tierCounts['table-stakes'],
          avgODIScore: avgScore,
        }
      }

      // Process suggestions
      if (suggestionsRes.ok) {
        const suggestData = await suggestionsRes.json()
        setSuggestions(suggestData.suggestions || [])
      }

      // Process tenants for filter options
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json()
        setFilterOptions({
          tenants: (tenantsData.tenants || []).map((t: any) => ({
            id: t.id,
            name: t.name || t.display_name,
          })),
        })
      }

      // Combine all metrics
      setMetrics({
        totalJTBDs: hierarchyMetrics.totalJTBDs || 0,
        agentCoverage: hierarchyMetrics.agentCoverage || 0,
        workflowCoverage: 0,
        totalFunctions: hierarchyMetrics.totalFunctions || 0,
        totalRoles: hierarchyMetrics.totalRoles || 0,
        totalPersonas: hierarchyMetrics.totalPersonas || 0,
        totalAgents: hierarchyMetrics.totalAgents || 0,
        extremeOpportunities: opportunityMetrics.extremeOpportunities || 0,
        highOpportunities: opportunityMetrics.highOpportunities || 0,
        moderateOpportunities: opportunityMetrics.moderateOpportunities || 0,
        tableStakes: opportunityMetrics.tableStakes || 0,
        avgODIScore: opportunityMetrics.avgODIScore || 0,
      })
    } catch (err) {
      console.error('Error loading Value data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Track if component has mounted
  const hasMountedRef = useRef(false)
  const previousFiltersRef = useRef<string>('')

  // Initial data load
  useEffect(() => {
    loadAllData()
    hasMountedRef.current = true
    previousFiltersRef.current = JSON.stringify(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reload when filters change
  const filtersString = JSON.stringify(filters)
  useEffect(() => {
    if (hasMountedRef.current && filtersString !== previousFiltersRef.current) {
      previousFiltersRef.current = filtersString
      loadAllData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersString])

  // ═══════════════════════════════════════════════════════════════════
  // AI COMPANION HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAILoading) return

    const userMessage: AICompanionMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsAILoading(true)

    try {
      const response = await fetch('/api/ontology-investigator/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: AICompanionMessage = {
          role: 'assistant',
          content: data.response || 'I could not process that query.',
          timestamp: new Date(),
          analysis_type: data.analysis_type,
          confidence: data.confidence,
          recommendations: data.recommendations,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (err) {
      const errorMessage: AICompanionMessage = {
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsAILoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  function getODITier(score: number): ODITier {
    if (score >= 15) return 'extreme'
    if (score >= 12) return 'high'
    if (score >= 10) return 'moderate'
    return 'table-stakes'
  }

  const activeFilterCount = getActiveFilterCount()
  const ViewModeIcon = VIEW_MODE_ICONS[viewMode]

  // ═══════════════════════════════════════════════════════════════════
  // RENDER VIEW MODE CONTENT
  // ═══════════════════════════════════════════════════════════════════

  const renderViewModeContent = () => {
    switch (viewMode) {
      case 'stack':
        return (
          <StackVisualization
            layers={layers}
            selectedLayer={selectedLayer}
            onSelectLayer={selectLayer}
          />
        )
      case 'radar':
        return (
          <RadarVisualization
            opportunities={opportunities}
            selectedOpportunity={selectedOpportunity}
            onSelectOpportunity={selectOpportunity}
            tierFilter={odiTierFilter}
          />
        )
      case 'heatmap':
        return (
          <HeatmapVisualization
            layers={layers}
            opportunities={opportunities}
          />
        )
      case 'flow':
        return (
          <FlowVisualization
            layers={layers}
            opportunities={opportunities}
          />
        )
      case 'list':
        return (
          <div className="flex h-[calc(100vh-340px)] gap-4">
            <div className={cn(
              'transition-all duration-300',
              selectedOpportunity ? 'w-1/2' : 'w-full'
            )}>
              <OpportunityRadar
                opportunities={opportunities}
                selectedOpportunity={selectedOpportunity}
                onSelectOpportunity={selectOpportunity}
                sortBy={opportunitySortBy}
                sortOrder={opportunitySortOrder}
                onSort={sortOpportunities}
                tierFilter={odiTierFilter}
                onTierFilter={setOdiTierFilter}
              />
            </div>
            <AnimatePresence mode="wait">
              {selectedOpportunity && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '50%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-l overflow-hidden"
                >
                  <Card className="h-full border-0 rounded-l-none">
                    <OpportunityDetailPanel
                      opportunity={selectedOpportunity}
                      onClose={() => selectOpportunity(null)}
                      className="h-full"
                    />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      case 'metrics':
      default:
        return <ValueMetrics metrics={metrics} vpanes={vpanes} />
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  if (isLoading && Object.values(layers).every((l) => l.count === 0)) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={Layers}
          title="Value View"
          description="Loading enterprise ontology..."
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            <p className="text-muted-foreground">Loading 8-layer ontology data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50/50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      {/* Header */}
      <PageHeader
        icon={Layers}
        title="Value View"
        description="8-Layer Semantic Ontology & AI Transformation Opportunities"
        actions={
          <div className="flex items-center gap-2">
            {/* Filter Sheet Trigger */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative bg-white/80 backdrop-blur-sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
                <SheetHeader className="p-6 pb-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-purple-600" />
                    Ontology Filters
                  </SheetTitle>
                  <SheetDescription>
                    Filter by layer to drill down into specific areas
                  </SheetDescription>
                </SheetHeader>
                <div className="p-0 h-[calc(100vh-140px)]">
                  <OntologyFilterStack
                    className="h-full"
                    onFilterChange={() => {
                      loadAllData()
                      setFilterSheetOpen(false)
                    }}
                    onClose={() => setFilterSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm" onClick={() => loadAllData()} className="bg-white/80 backdrop-blur-sm">
              <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Active Filters Indicator */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b flex items-center gap-3"
          >
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-purple-600" />
              <span className="text-muted-foreground">Active filters:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(filterLabels).slice(0, 4).map(([key, label]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="text-xs bg-white dark:bg-slate-900"
                >
                  {label}
                </Badge>
              ))}
              {Object.keys(filterLabels).length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(filterLabels).length - 4} more
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Tab Navigation with View Mode Selector */}
          <div className="flex items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full max-w-xl grid-cols-4 bg-white/80 backdrop-blur-sm shadow-sm">
                <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                  <LayoutGrid className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="gap-2 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
                  <Target className="h-4 w-4" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="workflows" className="gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                  <Workflow className="h-4 w-4" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* View Mode Selector */}
            <Select value={viewMode} onValueChange={(v: ViewMode) => setViewMode(v)}>
              <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm shadow-sm">
                <ViewModeIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stack">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Stack
                  </div>
                </SelectItem>
                <SelectItem value="radar">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Radar
                  </div>
                </SelectItem>
                <SelectItem value="heatmap">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Heatmap
                  </div>
                </SelectItem>
                <SelectItem value="flow">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Flow
                  </div>
                </SelectItem>
                <SelectItem value="metrics">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Metrics
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab Content */}
          <Tabs value={activeTab} className="space-y-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="m-0 space-y-6">
              {/* Visualization Section */}
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderViewModeContent()}
              </motion.div>
            </TabsContent>

            {/* Opportunities Tab */}
            <TabsContent value="opportunities" className="m-0 space-y-4">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === 'list' && (
                  <div className="flex h-[calc(100vh-340px)] gap-4">
                    {/* Opportunity List */}
                    <div className={cn(
                      'transition-all duration-300',
                      selectedOpportunity ? 'w-1/2' : 'w-full'
                    )}>
                      <OpportunityRadar
                        opportunities={opportunities}
                        selectedOpportunity={selectedOpportunity}
                        onSelectOpportunity={selectOpportunity}
                        sortBy={opportunitySortBy}
                        sortOrder={opportunitySortOrder}
                        onSort={sortOpportunities}
                        tierFilter={odiTierFilter}
                        onTierFilter={setOdiTierFilter}
                      />
                    </div>

                    {/* Detail Panel */}
                    <AnimatePresence mode="wait">
                      {selectedOpportunity && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: '50%', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-l overflow-hidden"
                        >
                          <Card className="h-full border-0 rounded-l-none">
                            <OpportunityDetailPanel
                              opportunity={selectedOpportunity}
                              onClose={() => selectOpportunity(null)}
                              className="h-full"
                            />
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {viewMode === 'radar' && (
                  <RadarVisualization
                    opportunities={opportunities}
                    selectedOpportunity={selectedOpportunity}
                    onSelectOpportunity={selectOpportunity}
                    tierFilter={odiTierFilter}
                  />
                )}

                {viewMode === 'heatmap' && (
                  <HeatmapVisualization
                    layers={layers}
                    opportunities={opportunities}
                  />
                )}

                {/* For other view modes, show the same visualization as Overview */}
                {(viewMode === 'stack' || viewMode === 'flow' || viewMode === 'metrics') && (
                  renderViewModeContent()
                )}
              </motion.div>
            </TabsContent>

            {/* Workflows Tab */}
            <TabsContent value="workflows" className="m-0">
              <motion.div
                key="workflows"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <WorkflowsVisualization className="min-h-[600px]" />
              </motion.div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="m-0">
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      AI-Powered Insights
                    </CardTitle>
                    <CardDescription>
                      Ask questions about your enterprise ontology and AI transformation opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex flex-col">
                      <ScrollArea className="flex-1 p-4 border rounded-xl bg-white/50 dark:bg-black/20 mb-4">
                        {messages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground mb-4">
                              Ask about your ontology, opportunities, or get recommendations
                            </p>
                            {suggestions.length > 0 && (
                              <div className="space-y-2 max-w-md">
                                {suggestions.slice(0, 4).map((s, i) => (
                                  <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-left bg-white/80 hover:bg-white"
                                    onClick={() => setInputMessage(s.question)}
                                  >
                                    <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0 text-purple-500" />
                                    <span className="truncate">{s.question}</span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((m, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'flex',
                                  m.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                              >
                                <div
                                  className={cn(
                                    'max-w-[80%] p-3 rounded-xl shadow-sm',
                                    m.role === 'user'
                                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                      : 'bg-white dark:bg-slate-800'
                                  )}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                  {m.recommendations && (
                                    <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                                      {m.recommendations.slice(0, 3).map((r, j) => (
                                        <div key={j} className="text-xs bg-white/10 p-2 rounded">
                                          <Badge variant="outline" className="mb-1 text-[10px]">
                                            {r.priority}
                                          </Badge>
                                          <p>{r.text}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isAILoading && (
                              <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>

                      <div className="flex gap-2">
                        <Textarea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Ask about opportunities, coverage gaps, recommendations..."
                          className="resize-none min-h-[48px] max-h-[120px] bg-white/80"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isAILoading}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
