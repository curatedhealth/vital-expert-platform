"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'

export interface OntologyFilters {
  tenant_id: string
  function_id: string
  department_id: string
  role_id: string
  jtbd_id: string
  persona_archetype: string
  agent_status: string
}

export interface FilterOption {
  id: string
  name: string
  count?: number
  slug?: string
}

export interface OntologyFilterData {
  tenants: FilterOption[]
  functions: FilterOption[]
  departments: FilterOption[]
  roles: FilterOption[]
  jtbds: FilterOption[]
  personaArchetypes: FilterOption[]
  agentStatuses: FilterOption[]
}

const DEFAULT_FILTERS: OntologyFilters = {
  tenant_id: 'all',
  function_id: 'all',
  department_id: 'all',
  role_id: 'all',
  jtbd_id: 'all',
  persona_archetype: 'all',
  agent_status: 'all',
}

const PERSONA_ARCHETYPES: FilterOption[] = [
  { id: 'AUTOMATOR', name: 'Automator', count: 0 },
  { id: 'ORCHESTRATOR', name: 'Orchestrator', count: 0 },
  { id: 'LEARNER', name: 'Learner', count: 0 },
  { id: 'SKEPTIC', name: 'Skeptic', count: 0 },
]

const AGENT_STATUSES: FilterOption[] = [
  { id: 'active', name: 'Active' },
  { id: 'draft', name: 'Draft' },
  { id: 'deprecated', name: 'Deprecated' },
  { id: 'archived', name: 'Archived' },
]

export function useOntologyFilters() {
  const [filters, setFilters] = useState<OntologyFilters>(DEFAULT_FILTERS)
  const [filterData, setFilterData] = useState<OntologyFilterData>({
    tenants: [],
    functions: [],
    departments: [],
    roles: [],
    jtbds: [],
    personaArchetypes: PERSONA_ARCHETYPES,
    agentStatuses: AGENT_STATUSES,
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    functions: 0,
    departments: 0,
    roles: 0,
    personas: 0,
    agents: 0,
    jtbds: 0,
    coverage: 0,
  })

  // Fetch initial filter options
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true)

        // Fetch hierarchy data with all options
        const res = await fetch('/api/ontology-investigator/hierarchy')
        if (res.ok) {
          const data = await res.json()

          // Update stats
          setStats({
            functions: data.summary?.total_functions || data.layers?.L1_functions?.count || 0,
            departments: data.layers?.L2_departments?.count || 0,
            roles: data.summary?.total_roles || data.layers?.L3_roles?.count || 0,
            personas: data.summary?.total_personas || data.layers?.L4_personas?.count || 0,
            agents: data.summary?.total_agents || data.layers?.L7_agents?.count || 0,
            jtbds: data.layers?.L5_jtbds?.count || 0,
            coverage: data.summary?.coverage_percentage || 0,
          })

          // Extract functions
          const functions = (data.functions || []).map((f: any) => ({
            id: f.id || f.slug || '',
            name: f.name || 'Unknown',
            slug: f.slug,
          }))

          setFilterData(prev => ({
            ...prev,
            functions,
          }))
        }

        // Fetch tenants
        const tenantsRes = await fetch('/api/ontology-investigator/tenants')
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json()
          setFilterData(prev => ({
            ...prev,
            tenants: (tenantsData.tenants || []).map((t: any) => ({
              id: t.id,
              name: t.name || t.display_name || 'Unknown',
            })),
          }))
        }
      } catch (err) {
        console.error('Error fetching filter data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterData()
  }, [])

  // Fetch cascading departments when function changes
  useEffect(() => {
    if (filters.function_id === 'all') {
      setFilterData(prev => ({ ...prev, departments: [], roles: [] }))
      return
    }

    const fetchDepartments = async () => {
      try {
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
      } catch (err) {
        console.error('Error fetching departments:', err)
      }
    }

    fetchDepartments()
  }, [filters.function_id])

  // Fetch cascading roles when department changes
  useEffect(() => {
    if (filters.department_id === 'all') {
      setFilterData(prev => ({ ...prev, roles: [] }))
      return
    }

    const fetchRoles = async () => {
      try {
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
      } catch (err) {
        console.error('Error fetching roles:', err)
      }
    }

    fetchRoles()
  }, [filters.department_id])

  // Fetch JTBDs based on current filters
  useEffect(() => {
    const fetchJTBDs = async () => {
      try {
        let url = '/api/ontology-investigator/jtbds?'
        if (filters.function_id !== 'all') url += `function_id=${filters.function_id}&`
        if (filters.role_id !== 'all') url += `role_id=${filters.role_id}&`

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setFilterData(prev => ({
            ...prev,
            jtbds: (data.jtbds || []).slice(0, 50).map((j: any) => ({
              id: j.id,
              name: j.name || j.job_statement?.substring(0, 50) || 'Unknown',
            })),
          }))
        }
      } catch (err) {
        console.error('Error fetching JTBDs:', err)
      }
    }

    fetchJTBDs()
  }, [filters.function_id, filters.role_id])

  // Set a single filter
  const setFilter = useCallback((key: keyof OntologyFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // Cascade reset logic
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

      return newFilters
    })
  }, [])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([_, value]) => value !== 'all')
  }, [filters])

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== 'all').length
  }, [filters])

  // Build query params for API calls
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        params.append(key, value)
      }
    })
    return params.toString()
  }, [filters])

  // Dispatch filter change event for other components
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ontology-filter-change', {
      detail: { filters, stats, queryParams: buildQueryParams() }
    }))
  }, [filters, stats, buildQueryParams])

  return {
    filters,
    filterData,
    stats,
    loading,
    setFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    buildQueryParams,
  }
}
