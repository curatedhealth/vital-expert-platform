/**
 * Value View State Management Store
 *
 * Central state management for the Value View using Zustand.
 * Implements the 8-layer semantic ontology model with ODI scoring,
 * VPANES framework, and persona archetypes.
 *
 * Based on VITAL Enterprise OS Ontology Handbook specifications.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

export type LayerKey = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7'

export type ArchetypeKey = 'AUTOMATOR' | 'ORCHESTRATOR' | 'LEARNER' | 'SKEPTIC'

export type ODITier = 'extreme' | 'high' | 'moderate' | 'table-stakes'

export type ViewMode = 'stack' | 'radar' | 'heatmap' | 'flow' | 'metrics'

export interface LayerData {
  key: LayerKey
  name: string
  fullName: string
  count: number
  description: string
  color: string
  items: LayerItem[]
  expanded: boolean
}

export interface LayerItem {
  id: string
  name: string
  slug?: string
  count?: number
  children?: LayerItem[]
  metadata?: Record<string, unknown>
}

export interface EvidenceSource {
  id: string
  source_type: 'survey' | 'interview' | 'analytics' | 'research' | 'benchmark'
  title: string
  description?: string
  citation?: string
  url?: string
  date?: string
  confidence_level: 'high' | 'medium' | 'low'
  sample_size?: number
  methodology?: string
}

export interface AIRecommendation {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'automation' | 'augmentation' | 'redesign' | 'insight'
  title: string
  description: string
  expected_impact: string
  effort_estimate: 'low' | 'medium' | 'high'
  timeframe?: string
  prerequisites?: string[]
}

export interface RelatedAgent {
  id: string
  name: string
  avatar_url?: string
  tier: number
  status: 'active' | 'draft' | 'inactive'
  coverage_score?: number
}

export interface RelatedWorkflow {
  id: string
  name: string
  status: 'production' | 'development' | 'planned'
  stage_count: number
  automation_level?: number
}

export interface ODIOpportunity {
  id: string
  jtbd_id: string
  jtbd_name: string
  jtbd_description?: string
  job_statement?: string
  role_id?: string
  role_name?: string
  function_name?: string
  department_name?: string
  tenant_name?: string
  importance: number
  satisfaction: number
  opportunity_score: number  // ODI = Importance + MAX(Importance - Satisfaction, 0)
  tier: ODITier
  gap: number
  ai_suitability: number
  workflow_count: number
  agent_assigned: boolean

  // Evidence-based fields
  evidence_sources?: EvidenceSource[]
  confidence_score?: number
  data_freshness?: string

  // AI Analysis
  ai_recommendations?: AIRecommendation[]
  automation_potential?: number
  augmentation_potential?: number
  risk_factors?: string[]

  // Related content
  related_agents?: RelatedAgent[]
  related_workflows?: RelatedWorkflow[]
  similar_opportunities?: string[]

  // Context
  pain_points?: string[]
  desired_outcomes?: string[]
  success_criteria?: string[]
  stakeholders?: string[]

  // Metadata
  created_at?: string
  updated_at?: string
  last_validated?: string
}

export interface VPANESScores {
  value: number        // 20% weight
  pain: number         // 15% weight
  adoption: number     // 15% weight
  network: number      // 15% weight
  ease: number         // 15% weight
  strategic: number    // 20% weight
  composite: number    // Weighted total
}

export interface PersonaArchetype {
  key: ArchetypeKey
  name: string
  description: string
  count: number
  color: string
  aiMaturity: 'high' | 'low'
  workComplexity: 'high' | 'low'
}

export interface FilterState {
  tenant_id: string
  function_id: string
  department_id: string
  role_id: string
  jtbd_id: string
  persona_archetype: string
  odi_tier: string
  agent_status: string
}

export interface FilterOption {
  id: string
  name: string
  count?: number
  slug?: string
  parent_id?: string
}

export interface FilterOptions {
  tenants: FilterOption[]
  functions: FilterOption[]
  departments: FilterOption[]
  roles: FilterOption[]
  jtbds: FilterOption[]
  archetypes: FilterOption[]
  odiTiers: FilterOption[]
  agentStatuses: FilterOption[]
}

export interface ValueMetrics {
  totalJTBDs: number
  extremeOpportunities: number
  highOpportunities: number
  moderateOpportunities: number
  tableStakes: number
  avgODIScore: number
  agentCoverage: number
  workflowCoverage: number
  totalFunctions: number
  totalRoles: number
  totalPersonas: number
  totalAgents: number
}

export interface SelectedItem {
  layer: LayerKey
  item: LayerItem
}

// ═══════════════════════════════════════════════════════════════════
// STORE STATE INTERFACE
// ═══════════════════════════════════════════════════════════════════

interface ValueViewState {
  // View state
  viewMode: ViewMode
  activeTab: string
  sidebarOpen: boolean
  filtersExpanded: boolean

  // Loading states
  isLoading: boolean
  isLoadingFilters: boolean
  isLoadingOpportunities: boolean
  error: string | null

  // Filter state
  filters: FilterState
  filterOptions: FilterOptions
  filterLabels: Record<string, string>

  // Layer data (8 layers)
  layers: Record<LayerKey, LayerData>
  selectedLayer: LayerKey | null
  expandedLayers: LayerKey[]

  // ODI opportunities
  opportunities: ODIOpportunity[]
  selectedOpportunity: ODIOpportunity | null
  opportunitySortBy: 'score' | 'importance' | 'gap' | 'ai_suitability'
  opportunitySortOrder: 'asc' | 'desc'

  // Persona archetypes
  archetypes: PersonaArchetype[]
  selectedArchetype: ArchetypeKey | null

  // Value metrics
  metrics: ValueMetrics
  vpanes: VPANESScores | null

  // Selection/drill-down
  selectedItems: SelectedItem[]
  breadcrumbs: { layer: LayerKey; item: LayerItem }[]

  // Actions
  setViewMode: (mode: ViewMode) => void
  setActiveTab: (tab: string) => void
  toggleSidebar: () => void
  toggleFiltersExpanded: () => void

  setFilter: (key: keyof FilterState, value: string) => void
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  setFilterOptions: (options: Partial<FilterOptions>) => void
  setFilterLabel: (key: string, label: string) => void

  setLayers: (layers: Record<LayerKey, LayerData>) => void
  updateLayerData: (key: LayerKey, data: Partial<LayerData>) => void
  selectLayer: (key: LayerKey | null) => void
  toggleLayerExpanded: (key: LayerKey) => void

  setOpportunities: (opportunities: ODIOpportunity[]) => void
  selectOpportunity: (opportunity: ODIOpportunity | null) => void
  sortOpportunities: (sortBy: ValueViewState['opportunitySortBy']) => void

  setArchetypes: (archetypes: PersonaArchetype[]) => void
  selectArchetype: (key: ArchetypeKey | null) => void

  setMetrics: (metrics: ValueMetrics) => void
  setVPANES: (vpanes: VPANESScores | null) => void

  selectItem: (layer: LayerKey, item: LayerItem) => void
  clearSelection: () => void
  drillDown: (layer: LayerKey, item: LayerItem) => void
  drillUp: () => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed getters
  getActiveFilterCount: () => number
  getOpportunitiesByTier: (tier: ODITier) => ODIOpportunity[]
  getFilteredOpportunities: () => ODIOpportunity[]
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_FILTERS: FilterState = {
  tenant_id: 'all',
  function_id: 'all',
  department_id: 'all',
  role_id: 'all',
  jtbd_id: 'all',
  persona_archetype: 'all',
  odi_tier: 'all',
  agent_status: 'all',
}

const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  tenants: [],
  functions: [],
  departments: [],
  roles: [],
  jtbds: [],
  archetypes: [
    { id: 'AUTOMATOR', name: 'Automator' },
    { id: 'ORCHESTRATOR', name: 'Orchestrator' },
    { id: 'LEARNER', name: 'Learner' },
    { id: 'SKEPTIC', name: 'Skeptic' },
  ],
  odiTiers: [
    { id: 'extreme', name: 'Extreme (15+)' },
    { id: 'high', name: 'High (12-14.9)' },
    { id: 'moderate', name: 'Moderate (10-11.9)' },
    { id: 'table-stakes', name: 'Table Stakes (<10)' },
  ],
  agentStatuses: [
    { id: 'active', name: 'Active' },
    { id: 'draft', name: 'Draft' },
    { id: 'deprecated', name: 'Deprecated' },
  ],
}

const DEFAULT_LAYERS: Record<LayerKey, LayerData> = {
  L0: {
    key: 'L0',
    name: 'Domain',
    fullName: 'Domain Knowledge',
    count: 0,
    description: 'Therapeutic Areas, Products, Diseases, Evidence',
    color: 'var(--layer-0)',
    items: [],
    expanded: false,
  },
  L1: {
    key: 'L1',
    name: 'Strategy',
    fullName: 'Strategic Pillars',
    count: 0,
    description: 'SP01-SP07, OKRs, Themes',
    color: 'var(--layer-1)',
    items: [],
    expanded: false,
  },
  L2: {
    key: 'L2',
    name: 'Org',
    fullName: 'Organizational Structure',
    count: 0,
    description: 'Functions, Departments',
    color: 'var(--layer-2)',
    items: [],
    expanded: true,
  },
  L3: {
    key: 'L3',
    name: 'Personas',
    fullName: 'Personas',
    count: 0,
    description: '43 profiles, 4 archetypes',
    color: 'var(--layer-3)',
    items: [],
    expanded: false,
  },
  L4: {
    key: 'L4',
    name: 'JTBDs',
    fullName: 'Jobs-to-be-Done',
    count: 0,
    description: '700+ Jobs-to-be-Done',
    color: 'var(--layer-4)',
    items: [],
    expanded: true,
  },
  L5: {
    key: 'L5',
    name: 'Outcomes',
    fullName: 'Outcomes/ODI',
    count: 0,
    description: 'Importance/Satisfaction scoring',
    color: 'var(--layer-5)',
    items: [],
    expanded: true,
  },
  L6: {
    key: 'L6',
    name: 'Workflows',
    fullName: 'Workflows',
    count: 0,
    description: '400+ processes with HITL',
    color: 'var(--layer-6)',
    items: [],
    expanded: false,
  },
  L7: {
    key: 'L7',
    name: 'Value',
    fullName: 'Value Metrics',
    count: 0,
    description: 'Time, Cost, Quality, Risk',
    color: 'var(--layer-7)',
    items: [],
    expanded: false,
  },
}

const DEFAULT_METRICS: ValueMetrics = {
  totalJTBDs: 0,
  extremeOpportunities: 0,
  highOpportunities: 0,
  moderateOpportunities: 0,
  tableStakes: 0,
  avgODIScore: 0,
  agentCoverage: 0,
  workflowCoverage: 0,
  totalFunctions: 0,
  totalRoles: 0,
  totalPersonas: 0,
  totalAgents: 0,
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function getODITier(score: number): ODITier {
  if (score >= 15) return 'extreme'
  if (score >= 12) return 'high'
  if (score >= 10) return 'moderate'
  return 'table-stakes'
}

function calculateODIScore(importance: number, satisfaction: number): number {
  return importance + Math.max(importance - satisfaction, 0)
}

// ═══════════════════════════════════════════════════════════════════
// ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

export const useValueViewStore = create<ValueViewState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        viewMode: 'stack',
        activeTab: 'ontology',
        sidebarOpen: true,
        filtersExpanded: true,

        isLoading: false,
        isLoadingFilters: false,
        isLoadingOpportunities: false,
        error: null,

        filters: DEFAULT_FILTERS,
        filterOptions: DEFAULT_FILTER_OPTIONS,
        filterLabels: {},

        layers: DEFAULT_LAYERS,
        selectedLayer: null,
        expandedLayers: ['L2', 'L4', 'L5'],

        opportunities: [],
        selectedOpportunity: null,
        opportunitySortBy: 'score',
        opportunitySortOrder: 'desc',

        archetypes: [],
        selectedArchetype: null,

        metrics: DEFAULT_METRICS,
        vpanes: null,

        selectedItems: [],
        breadcrumbs: [],

        // Actions
        setViewMode: (mode) => set({ viewMode: mode }),

        setActiveTab: (tab) => set({ activeTab: tab }),

        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        toggleFiltersExpanded: () => set((state) => ({ filtersExpanded: !state.filtersExpanded })),

        setFilter: (key, value) => {
          set((state) => {
            const newFilters = { ...state.filters, [key]: value }

            // Cascade reset: when parent filter changes, reset child filters
            if (key === 'tenant_id') {
              newFilters.function_id = 'all'
              newFilters.department_id = 'all'
              newFilters.role_id = 'all'
              newFilters.jtbd_id = 'all'
            } else if (key === 'function_id') {
              newFilters.department_id = 'all'
              newFilters.role_id = 'all'
              newFilters.jtbd_id = 'all'
            } else if (key === 'department_id') {
              newFilters.role_id = 'all'
              newFilters.jtbd_id = 'all'
            } else if (key === 'role_id') {
              newFilters.jtbd_id = 'all'
            }

            return { filters: newFilters }
          })

          // Dispatch global event for other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('value-view-filter-change', {
              detail: { filters: get().filters }
            }))
          }
        },

        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        resetFilters: () => {
          set({ filters: DEFAULT_FILTERS, filterLabels: {} })
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('value-view-filters-reset'))
          }
        },

        setFilterOptions: (options) => set((state) => ({
          filterOptions: { ...state.filterOptions, ...options }
        })),

        setFilterLabel: (key, label) => set((state) => ({
          filterLabels: { ...state.filterLabels, [key]: label }
        })),

        setLayers: (layers) => set({ layers }),

        updateLayerData: (key, data) => set((state) => ({
          layers: {
            ...state.layers,
            [key]: { ...state.layers[key], ...data }
          }
        })),

        selectLayer: (key) => set({ selectedLayer: key }),

        toggleLayerExpanded: (key) => set((state) => {
          const expanded = state.expandedLayers.includes(key)
          return {
            expandedLayers: expanded
              ? state.expandedLayers.filter(k => k !== key)
              : [...state.expandedLayers, key]
          }
        }),

        setOpportunities: (opportunities) => {
          // Calculate tier for each opportunity
          const enriched = opportunities.map(opp => ({
            ...opp,
            tier: getODITier(opp.opportunity_score),
          }))
          set({ opportunities: enriched })
        },

        selectOpportunity: (opportunity) => set({ selectedOpportunity: opportunity }),

        sortOpportunities: (sortBy) => set((state) => {
          const newOrder = state.opportunitySortBy === sortBy && state.opportunitySortOrder === 'desc'
            ? 'asc'
            : 'desc'

          const sorted = [...state.opportunities].sort((a, b) => {
            const aVal = sortBy === 'score' ? a.opportunity_score
              : sortBy === 'importance' ? a.importance
              : sortBy === 'gap' ? a.gap
              : a.ai_suitability
            const bVal = sortBy === 'score' ? b.opportunity_score
              : sortBy === 'importance' ? b.importance
              : sortBy === 'gap' ? b.gap
              : b.ai_suitability

            return newOrder === 'desc' ? bVal - aVal : aVal - bVal
          })

          return {
            opportunities: sorted,
            opportunitySortBy: sortBy,
            opportunitySortOrder: newOrder,
          }
        }),

        setArchetypes: (archetypes) => set({ archetypes }),

        selectArchetype: (key) => set({ selectedArchetype: key }),

        setMetrics: (metrics) => set({ metrics }),

        setVPANES: (vpanes) => set({ vpanes }),

        selectItem: (layer, item) => set((state) => ({
          selectedItems: [...state.selectedItems, { layer, item }]
        })),

        clearSelection: () => set({ selectedItems: [], breadcrumbs: [] }),

        drillDown: (layer, item) => set((state) => ({
          breadcrumbs: [...state.breadcrumbs, { layer, item }],
          selectedLayer: layer,
        })),

        drillUp: () => set((state) => {
          const newBreadcrumbs = state.breadcrumbs.slice(0, -1)
          return {
            breadcrumbs: newBreadcrumbs,
            selectedLayer: newBreadcrumbs.length > 0
              ? newBreadcrumbs[newBreadcrumbs.length - 1].layer
              : null,
          }
        }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        // Computed getters
        getActiveFilterCount: () => {
          const { filters } = get()
          return Object.values(filters).filter(v => v !== 'all').length
        },

        getOpportunitiesByTier: (tier) => {
          return get().opportunities.filter(opp => opp.tier === tier)
        },

        getFilteredOpportunities: () => {
          const { filters, opportunities } = get()

          return opportunities.filter(opp => {
            if (filters.function_id !== 'all' && opp.function_name !== filters.function_id) return false
            if (filters.odi_tier !== 'all' && opp.tier !== filters.odi_tier) return false
            if (filters.agent_status !== 'all') {
              if (filters.agent_status === 'active' && !opp.agent_assigned) return false
              if (filters.agent_status === 'draft' && opp.agent_assigned) return false
            }
            return true
          })
        },
      }),
      {
        name: 'value-view-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          filtersExpanded: state.filtersExpanded,
          expandedLayers: state.expandedLayers,
        }),
      }
    ),
    { name: 'ValueViewStore' }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SELECTOR HOOKS
// ═══════════════════════════════════════════════════════════════════

export const useValueViewFilters = () => useValueViewStore((state) => ({
  filters: state.filters,
  filterOptions: state.filterOptions,
  filterLabels: state.filterLabels,
  setFilter: state.setFilter,
  resetFilters: state.resetFilters,
  activeCount: state.getActiveFilterCount(),
}))

export const useValueViewLayers = () => useValueViewStore((state) => ({
  layers: state.layers,
  selectedLayer: state.selectedLayer,
  expandedLayers: state.expandedLayers,
  selectLayer: state.selectLayer,
  toggleLayerExpanded: state.toggleLayerExpanded,
}))

export const useValueViewOpportunities = () => useValueViewStore((state) => ({
  opportunities: state.opportunities,
  selectedOpportunity: state.selectedOpportunity,
  sortBy: state.opportunitySortBy,
  sortOrder: state.opportunitySortOrder,
  selectOpportunity: state.selectOpportunity,
  sortOpportunities: state.sortOpportunities,
  getByTier: state.getOpportunitiesByTier,
  getFiltered: state.getFilteredOpportunities,
}))

export const useValueViewMetrics = () => useValueViewStore((state) => ({
  metrics: state.metrics,
  vpanes: state.vpanes,
}))

export default useValueViewStore
