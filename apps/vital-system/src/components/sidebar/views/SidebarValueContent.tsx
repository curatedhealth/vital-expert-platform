"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BarChart,
  BarChart3,
  Bot,
  Building2,
  ChevronDown,
  FolderOpen,
  Layers,
  LayoutGrid,
  List,
  Shield,
  Target,
  TrendingUp,
  User,
  Users,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Value View modes for URL-based navigation
const VALUE_VIEW_MODES = [
  { id: 'stack', label: 'Stack', icon: Layers, description: '8-Layer Ontology' },
  { id: 'radar', label: 'Radar', icon: Target, description: 'ODI Opportunities' },
  { id: 'heatmap', label: 'Heatmap', icon: LayoutGrid, description: 'Coverage Matrix' },
  { id: 'flow', label: 'Flow', icon: Workflow, description: 'Workflow Flows' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, description: 'KPI Dashboard' },
  { id: 'list', label: 'List', icon: List, description: 'Table View' },
] as const

// Persona archetypes (MECE 2x2 matrix)
const PERSONA_ARCHETYPES = [
  { id: 'AUTOMATOR', name: 'Automator', color: 'bg-green-100 text-green-700' },
  { id: 'ORCHESTRATOR', name: 'Orchestrator', color: 'bg-blue-100 text-blue-700' },
  { id: 'LEARNER', name: 'Learner', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'SKEPTIC', name: 'Skeptic', color: 'bg-red-100 text-red-700' },
] as const

/**
 * Helper component for Value Views section (URL-based navigation)
 */
function SidebarValueViewsSection() {
  const searchParams = useSearchParams()
  const currentView = searchParams.get("view") || "stack"

  const buildUrl = (view: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (view === "stack") {
      newParams.delete("view")
    } else {
      newParams.set("view", view)
    }
    const queryString = newParams.toString()
    return `/value${queryString ? '?' + queryString : ''}`
  }

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
            <span className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5" />
              Views
            </span>
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {VALUE_VIEW_MODES.map((mode) => {
                const Icon = mode.icon
                return (
                  <SidebarMenuItem key={mode.id}>
                    <SidebarMenuButton asChild data-active={currentView === mode.id}>
                      <Link href={buildUrl(mode.id)}>
                        <Icon className="h-4 w-4" />
                        <span className="flex flex-col">
                          <span>{mode.label}</span>
                          <span className="text-[10px] text-muted-foreground">{mode.description}</span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

/**
 * Value sidebar content.
 * Displays 8-layer ontology explorer with cascading filters.
 * Features: Industry → Function → Department → Role → JTBD filtering
 * [PROD] - Production ready
 */
export function SidebarValueContent() {
  const [filters, setFilters] = useState({
    industry: 'all',
    function_id: 'all',
    department_id: 'all',
    role_id: 'all',
    jtbd_id: 'all',
    persona_archetype: 'all',
    agent_status: 'all',
  })

  const [filterData, setFilterData] = useState<{
    industries: Array<{ id: string; name: string }>;
    functions: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; count?: number }>;
    roles: Array<{ id: string; name: string; count?: number }>;
    jtbds: Array<{ id: string; name: string }>;
  }>({
    industries: [],
    functions: [],
    departments: [],
    roles: [],
    jtbds: [],
  })

  const [stats, setStats] = useState({
    functions: 0,
    departments: 0,
    roles: 0,
    personas: 0,
    agents: 0,
    jtbds: 0,
    coverage: 0,
  })

  const [loading, setLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Fetch hierarchy data (with optional industry filter)
  const fetchHierarchyData = async (industry?: string) => {
    try {
      const queryParams = industry && industry !== 'all' ? `?industry=${industry}` : ''
      const res = await fetch(`/api/ontology-investigator/hierarchy${queryParams}`)
      if (res.ok) {
        const data = await res.json()
        setStats({
          functions: data.summary?.total_functions || data.layers?.L1_functions?.count || 0,
          departments: data.layers?.L2_departments?.count || 0,
          roles: data.summary?.total_roles || data.layers?.L3_roles?.count || 0,
          personas: data.summary?.total_personas || data.layers?.L4_personas?.count || 0,
          agents: data.summary?.total_agents || data.layers?.L7_agents?.count || 0,
          jtbds: data.layers?.L5_jtbds?.count || 0,
          coverage: data.summary?.coverage_percentage || 0,
        })

        if (data.functions && Array.isArray(data.functions)) {
          setFilterData(prev => ({
            ...prev,
            functions: data.functions.map((f: any) => ({
              id: f.id || f.slug || '',
              name: f.name || 'Unknown'
            })),
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching hierarchy data:', err)
    }
  }

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch hierarchy (functions and stats)
        await fetchHierarchyData()

        // Fetch industries
        const industriesRes = await fetch('/api/ontology-investigator/industries')
        if (industriesRes.ok) {
          const industriesData = await industriesRes.json()
          setFilterData(prev => ({
            ...prev,
            industries: (industriesData.industries || []).map((i: any) => ({
              id: i.id || i.slug,
              name: i.name || 'Unknown',
            })),
          }))
        }
      } catch (err) {
        console.error('Error fetching ontology data:', err)
      } finally {
        setLoading(false)
        setInitialLoadDone(true)
      }
    }
    fetchData()
  }, [])

  // Re-fetch functions and stats when industry changes (cascading filter)
  useEffect(() => {
    if (!initialLoadDone) return
    fetchHierarchyData(filters.industry === 'all' ? undefined : filters.industry)
  }, [filters.industry, initialLoadDone])

  // Fetch departments when function changes
  useEffect(() => {
    if (filters.function_id === 'all') {
      setFilterData(prev => ({ ...prev, departments: [], roles: [] }))
      return
    }
    const fetchDepts = async () => {
      const res = await fetch(`/api/ontology-investigator/departments?function_id=${filters.function_id}`)
      if (res.ok) {
        const data = await res.json()
        setFilterData(prev => ({
          ...prev,
          departments: (data.departments || []).map((d: any) => ({
            id: d.id,
            name: d.name || 'Unknown',
            count: d.role_count,
          })),
        }))
      }
    }
    fetchDepts()
  }, [filters.function_id])

  // Fetch roles when department changes
  useEffect(() => {
    if (filters.department_id === 'all') {
      setFilterData(prev => ({ ...prev, roles: [] }))
      return
    }
    const fetchRoles = async () => {
      const res = await fetch(`/api/ontology-investigator/roles?department_id=${filters.department_id}`)
      if (res.ok) {
        const data = await res.json()
        setFilterData(prev => ({
          ...prev,
          roles: (data.roles || []).map((r: any) => ({
            id: r.id,
            name: r.name || r.title || 'Unknown',
            count: r.agent_count,
          })),
        }))
      }
    }
    fetchRoles()
  }, [filters.department_id])

  // Fetch JTBDs based on filters
  useEffect(() => {
    const fetchJTBDs = async () => {
      let url = '/api/ontology-investigator/jtbds?limit=30'
      if (filters.function_id !== 'all') url += `&function_id=${filters.function_id}`
      if (filters.role_id !== 'all') url += `&role_id=${filters.role_id}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setFilterData(prev => ({
          ...prev,
          jtbds: (data.jtbds || []).slice(0, 30).map((j: any) => ({
            id: j.id,
            name: j.name || j.job_statement?.substring(0, 40) + '...' || 'Unknown',
          })),
        }))
      }
    }
    fetchJTBDs()
  }, [filters.function_id, filters.role_id])

  // Handle filter change with cascade reset
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      // Cascade reset
      if (key === 'tenant_id' || key === 'industry') {
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
      return newFilters
    })
  }

  // Get human-readable labels for active filters
  const getFilterLabels = () => {
    const labels: Record<string, string> = {}

    if (filters.industry !== 'all') {
      const industry = filterData.industries.find(i => i.id === filters.industry)
      if (industry) labels.industry = industry.name
    }
    if (filters.function_id !== 'all') {
      const func = filterData.functions.find(f => f.id === filters.function_id)
      if (func) labels.function = func.name
    }
    if (filters.department_id !== 'all') {
      const dept = filterData.departments.find(d => d.id === filters.department_id)
      if (dept) labels.department = dept.name
    }
    if (filters.role_id !== 'all') {
      const role = filterData.roles.find(r => r.id === filters.role_id)
      if (role) labels.role = role.name
    }
    if (filters.jtbd_id !== 'all') {
      const jtbd = filterData.jtbds.find(j => j.id === filters.jtbd_id)
      if (jtbd) labels.jtbd = jtbd.name
    }
    if (filters.persona_archetype !== 'all') {
      const archetype = PERSONA_ARCHETYPES.find(a => a.id === filters.persona_archetype)
      if (archetype) labels.archetype = archetype.name
    }

    return labels
  }

  // Dispatch filter change event
  useEffect(() => {
    const labels = getFilterLabels()
    window.dispatchEvent(new CustomEvent('ontology-filter-change', {
      detail: { filters, stats, labels }
    }))
  }, [filters, stats, filterData])

  // Listen for clear filter events from Value page
  useEffect(() => {
    const handleClearFilter = (e: CustomEvent) => {
      const { filterKey, filters: newFilters } = e.detail
      console.log('Clearing filter:', filterKey, newFilters)
      setFilters(newFilters)
    }

    const handleClearAllFilters = () => {
      console.log('Clearing all filters')
      setFilters({
        industry: 'all',
        function_id: 'all',
        department_id: 'all',
        role_id: 'all',
        jtbd_id: 'all',
        persona_archetype: 'all',
        agent_status: 'all',
      })
    }

    window.addEventListener('value-clear-filter' as any, handleClearFilter)
    window.addEventListener('value-clear-all-filters' as any, handleClearAllFilters)

    return () => {
      window.removeEventListener('value-clear-filter' as any, handleClearFilter)
      window.removeEventListener('value-clear-all-filters' as any, handleClearAllFilters)
    }
  }, [])

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      industry: 'all',
      function_id: 'all',
      department_id: 'all',
      role_id: 'all',
      jtbd_id: 'all',
      persona_archetype: 'all',
      agent_status: 'all',
    })
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <>
      {/* Quick Stats */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <BarChart className="h-3.5 w-3.5" />
                Quick Stats
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-3 py-2 space-y-3">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading stats...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{stats.functions}</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-500">Functions</p>
                      </div>
                      <div className="p-1.5 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg text-center">
                        <p className="text-sm font-bold text-cyan-700 dark:text-cyan-400">{stats.departments}</p>
                        <p className="text-[10px] text-cyan-600 dark:text-cyan-500">Depts</p>
                      </div>
                      <div className="p-1.5 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                        <p className="text-sm font-bold text-green-700 dark:text-green-400">{stats.roles}</p>
                        <p className="text-[10px] text-green-600 dark:text-green-500">Roles</p>
                      </div>
                      <div className="p-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-center">
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-400">{stats.personas}</p>
                        <p className="text-[10px] text-purple-600 dark:text-purple-500">Personas</p>
                      </div>
                      <div className="p-1.5 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-center">
                        <p className="text-sm font-bold text-orange-700 dark:text-orange-400">{stats.agents}</p>
                        <p className="text-[10px] text-orange-600 dark:text-orange-500">Agents</p>
                      </div>
                      <div className="p-1.5 bg-pink-50 dark:bg-pink-950/30 rounded-lg text-center">
                        <p className="text-sm font-bold text-pink-700 dark:text-pink-400">{stats.jtbds}</p>
                        <p className="text-[10px] text-pink-600 dark:text-pink-500">JTBDs</p>
                      </div>
                    </div>
                    {/* Coverage Bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">AI Coverage</span>
                        <span className="font-medium">{stats.coverage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(stats.coverage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Views Section - URL-based navigation */}
      <SidebarValueViewsSection />

      {/* Active Filters Badge */}
      {activeFilterCount > 0 && (
        <div className="px-3 py-2">
          <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2">
            <span className="text-xs font-medium">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            <button
              onClick={resetFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Filter by Industry */}
      {filterData.industries.length > 0 && (
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Industry
                  {filters.industry !== 'all' && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ScrollArea className="h-32">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => handleFilterChange('industry', 'all')} isActive={filters.industry === 'all'}>
                        <Layers className="h-4 w-4" />
                        <span>All Industries</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {filterData.industries.map(ind => (
                      <SidebarMenuItem key={ind.id}>
                        <SidebarMenuButton onClick={() => handleFilterChange('industry', ind.id)} isActive={filters.industry === ind.id}>
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{ind.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      )}

      {/* Filter by Function */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" />
                Function
                {filters.function_id !== 'all' && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <ScrollArea className="h-48">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleFilterChange('function_id', 'all')} isActive={filters.function_id === 'all'}>
                      <Layers className="h-4 w-4" />
                      <span>All Functions</span>
                      <Badge variant="outline" className="ml-auto text-[10px]">{stats.functions}</Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {filterData.functions.map(f => (
                    <SidebarMenuItem key={f.id}>
                      <SidebarMenuButton onClick={() => handleFilterChange('function_id', f.id)} isActive={filters.function_id === f.id}>
                        <Building2 className="h-4 w-4" />
                        <span className="truncate text-xs">{f.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Department (cascading) */}
      {filterData.departments.length > 0 && (
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Department
                  {filters.department_id !== 'all' && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ScrollArea className="h-40">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => handleFilterChange('department_id', 'all')} isActive={filters.department_id === 'all'}>
                        <Layers className="h-4 w-4" />
                        <span>All Departments</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">{filterData.departments.length}</Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {filterData.departments.map(d => (
                      <SidebarMenuItem key={d.id}>
                        <SidebarMenuButton onClick={() => handleFilterChange('department_id', d.id)} isActive={filters.department_id === d.id}>
                          <FolderOpen className="h-4 w-4" />
                          <span className="truncate text-xs">{d.name}</span>
                          {d.count && <Badge variant="outline" className="ml-auto text-[10px]">{d.count}</Badge>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      )}

      {/* Filter by Role (cascading) */}
      {filterData.roles.length > 0 && (
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Role
                  {filters.role_id !== 'all' && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ScrollArea className="h-40">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => handleFilterChange('role_id', 'all')} isActive={filters.role_id === 'all'}>
                        <Layers className="h-4 w-4" />
                        <span>All Roles</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">{filterData.roles.length}</Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {filterData.roles.map(r => (
                      <SidebarMenuItem key={r.id}>
                        <SidebarMenuButton onClick={() => handleFilterChange('role_id', r.id)} isActive={filters.role_id === r.id}>
                          <User className="h-4 w-4" />
                          <span className="truncate text-xs">{r.name}</span>
                          {r.count !== undefined && <Badge variant="outline" className="ml-auto text-[10px]">{r.count}</Badge>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      )}

      {/* Filter by JTBD */}
      {filterData.jtbds.length > 0 && (
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" />
                  JTBD
                  {filters.jtbd_id !== 'all' && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ScrollArea className="h-40">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => handleFilterChange('jtbd_id', 'all')} isActive={filters.jtbd_id === 'all'}>
                        <Layers className="h-4 w-4" />
                        <span>All JTBDs</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">{stats.jtbds}</Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {filterData.jtbds.map(j => (
                      <SidebarMenuItem key={j.id}>
                        <SidebarMenuButton onClick={() => handleFilterChange('jtbd_id', j.id)} isActive={filters.jtbd_id === j.id}>
                          <Target className="h-4 w-4" />
                          <span className="truncate text-xs">{j.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      )}

      {/* Filter by Persona Archetype */}
      <Collapsible defaultOpen={false} className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Persona Archetype
                {filters.persona_archetype !== 'all' && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => handleFilterChange('persona_archetype', 'all')} isActive={filters.persona_archetype === 'all'}>
                    <Layers className="h-4 w-4" />
                    <span>All Archetypes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {PERSONA_ARCHETYPES.map(a => (
                  <SidebarMenuItem key={a.id}>
                    <SidebarMenuButton onClick={() => handleFilterChange('persona_archetype', a.id)} isActive={filters.persona_archetype === a.id}>
                      <span className={`w-2 h-2 rounded-full ${a.color.split(' ')[0]}`} />
                      <span>{a.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* AI Companion Suggestions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Wand2 className="h-3.5 w-3.5" />
                AI Suggestions
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-3 py-2 space-y-1.5">
                {[
                  { text: 'What roles need AI agents?', icon: Target },
                  { text: 'Show coverage gaps', icon: Shield },
                  { text: 'Top AI opportunities', icon: TrendingUp },
                  { text: 'Persona distribution', icon: Users },
                ].map((suggestion, idx) => {
                  const Icon = suggestion.icon
                  return (
                    <button
                      key={idx}
                      className="w-full text-left p-2 text-xs bg-muted/50 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('value-ai-suggestion', {
                          detail: { question: suggestion.text, filters }
                        }))
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{suggestion.text}</span>
                    </button>
                  )
                })}
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Quick Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Quick Actions
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents/create">
                      <Bot className="h-4 w-4" />
                      <span>Create AI Agent</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin?view=personas">
                      <Users className="h-4 w-4" />
                      <span>Manage Personas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin?view=roles">
                      <Shield className="h-4 w-4" />
                      <span>Manage Roles</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </>
  )
}

export default SidebarValueContent
