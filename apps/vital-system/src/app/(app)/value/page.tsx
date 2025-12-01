'use client'

/**
 * Value View - Immersive Enterprise Ontology Dashboard
 *
 * Gold standard implementation of VITAL's 8-layer semantic ontology visualization.
 * Features:
 * - 8-Layer Stack visualization with drill-down
 * - ODI Opportunity Radar for AI transformation prioritization
 * - Value Metrics dashboard with VPANES scoring
 * - Cascading filters with global state management
 * - AI Companion for intelligent queries
 *
 * Based on VITAL Enterprise OS Ontology Handbook specifications.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  Target,
  BarChart3,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  ChevronRight,
  Filter,
  X,
  Settings2,
  Download,
  Maximize2,
  LayoutGrid,
  GitBranch,
  Bot,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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

// Import our new Value View components
import { OntologyFilterStack, OpportunityRadar, OpportunityDetailPanel, ValueMetrics } from '@/components/value-view'
import {
  useValueViewStore,
  type LayerKey,
  type LayerItem,
  type ODIOpportunity,
  type ODITier,
} from '@/stores/valueViewStore'

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
    sidebarOpen,
    toggleSidebar,
    isLoading,
    setLoading,
    error,
    setError,
    filters,
    setFilter,
    resetFilters,
    filterOptions,
    setFilterOptions,
    filterLabels,
    setFilterLabel,
    layers,
    updateLayerData,
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
    setVPANES,
    getActiveFilterCount,
  } = useValueViewStore()

  // Local state for AI Companion
  const [messages, setMessages] = useState<AICompanionMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ question: string; category: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ODI tier filter for radar
  const [odiTierFilter, setOdiTierFilter] = useState<ODITier | 'all'>('all')

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

        // Update metrics
        setMetrics({
          totalJTBDs: data.layers?.L5_jtbds?.count || 0,
          extremeOpportunities: 0,
          highOpportunities: 0,
          moderateOpportunities: 0,
          tableStakes: 0,
          avgODIScore: 0,
          agentCoverage: data.summary?.coverage_percentage || 0,
          workflowCoverage: 0,
          totalFunctions: data.summary?.total_functions || 0,
          totalRoles: data.summary?.total_roles || 0,
          totalPersonas: data.summary?.total_personas || 0,
          totalAgents: data.summary?.total_agents || 0,
        })

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

        // Update ODI tier counts in metrics
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

        setMetrics({
          ...metrics,
          extremeOpportunities: tierCounts.extreme,
          highOpportunities: tierCounts.high,
          moderateOpportunities: tierCounts.moderate,
          tableStakes: tierCounts['table-stakes'],
          avgODIScore: avgScore,
        })
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
    } catch (err) {
      console.error('Error loading Value data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial data load
  useEffect(() => {
    loadAllData()
  }, [])

  // Reload when filters change
  useEffect(() => {
    const hasActiveFilters = getActiveFilterCount() > 0
    if (hasActiveFilters) {
      loadAllData()
    }
  }, [filters])

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
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      {/* Header */}
      <PageHeader
        icon={Layers}
        title="Value View"
        description="8-Layer Semantic Ontology & AI Transformation Opportunities"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadAllData()}>
              <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Compact Active Filters Indicator - Shows in header when sidebar is closed */}
      {!sidebarOpen && activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b flex items-center gap-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-purple-600" />
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(filterLabels).slice(0, 3).map(([key, label]) => (
              <Badge
                key={key}
                variant="outline"
                className="text-xs"
              >
                {label}
              </Badge>
            ))}
            {Object.keys(filterLabels).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{Object.keys(filterLabels).length - 3} more
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto text-xs text-purple-600"
          >
            Edit Filters
          </Button>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Unified 8-Layer Filter Stack */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r bg-card overflow-hidden flex flex-col"
            >
              <OntologyFilterStack
                className="flex-1"
                onFilterChange={loadAllData}
                onClose={toggleSidebar}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Tab Navigation */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              {!sidebarOpen && (
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <PanelLeft className="h-4 w-4" />
                </Button>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="overview" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="opportunities" className="gap-2">
                    <Target className="h-4 w-4" />
                    Opportunities
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Insights
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stack">Stack</SelectItem>
                    <SelectItem value="radar">Radar</SelectItem>
                    <SelectItem value="heatmap">Heatmap</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="metrics">Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <ScrollArea className="flex-1 px-6 pb-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Value Metrics Dashboard */}
                  <ValueMetrics metrics={metrics} vpanes={vpanes} />

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                            <Layers className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-600">8</p>
                            <p className="text-sm text-muted-foreground">Layers</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/50">
                            <Target className="h-5 w-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-pink-600">
                              {opportunities.length}
                            </p>
                            <p className="text-sm text-muted-foreground">Opportunities</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border-cyan-200 dark:border-cyan-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/50">
                            <GitBranch className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-cyan-600">
                              {metrics.totalJTBDs}
                            </p>
                            <p className="text-sm text-muted-foreground">JTBDs</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                            <Bot className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-amber-600">
                              {metrics.agentCoverage.toFixed(0)}%
                            </p>
                            <p className="text-sm text-muted-foreground">AI Coverage</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'opportunities' && (
                <motion.div
                  key="opportunities"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-[calc(100vh-280px)]"
                >
                  <div className="flex h-full gap-4">
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

                    {/* Detail Panel - Shows when opportunity is selected */}
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
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI-Powered Insights
                      </CardTitle>
                      <CardDescription>
                        Ask questions about your enterprise ontology and AI transformation opportunities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] flex flex-col">
                        <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20 mb-4">
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
                                      className="w-full justify-start text-left"
                                      onClick={() => setInputMessage(s.question)}
                                    >
                                      <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
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
                                      'max-w-[80%] p-3 rounded-xl',
                                      m.role === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-muted'
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
                                  <div className="bg-muted p-3 rounded-xl">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
                            className="resize-none min-h-[48px] max-h-[120px]"
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
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
