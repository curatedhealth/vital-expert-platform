"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRightLeft,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Layers,
  LayoutGrid,
  List,
  Network,
  Plus,
  SearchIcon,
  Sparkles,
  Star,
  Table as TableIcon,
  User,
  Users,
  Wand2,
  X,
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
import { createClient } from "@vital/sdk/client"

// Interface for agent filter data (for cascading filters)
interface AgentFilterData {
  function_name: string | null
  department_name: string | null
  role_name: string | null
}

// Interface for capabilities, skills, responsibilities
interface FilterItem {
  id: string
  name: string
}

// Views for agents page
const AGENT_VIEWS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "list", label: "List", icon: List },
  { id: "table", label: "Table", icon: TableIcon },
  { id: "graph", label: "Knowledge Graph", icon: Network },
  { id: "compare", label: "Compare", icon: ArrowRightLeft },
] as const

/**
 * Agents sidebar content.
 * Displays AI expert agents with cascading filters and multi-select capabilities.
 * Features: Level → Function → Department → Role filtering with search.
 * Multi-select: Capabilities, Skills, Responsibilities with inline add.
 * [PROD] - Production ready
 */
export function SidebarAgentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // View state from URL
  const currentView = searchParams.get("view") || "overview"

  // Filter state from URL
  const selectedFunction = searchParams.get("function") || ""
  const selectedDepartment = searchParams.get("department") || ""
  const selectedRole = searchParams.get("role") || ""
  const selectedLevel = searchParams.get("level") || ""

  // Multi-select filters from URL (comma-separated)
  const selectedCapabilities = searchParams.get("capabilities")?.split(",").filter(Boolean) || []
  const selectedSkills = searchParams.get("skills")?.split(",").filter(Boolean) || []
  const selectedResponsibilities = searchParams.get("responsibilities")?.split(",").filter(Boolean) || []

  // Search state for each filter
  const [levelSearch, setLevelSearch] = useState("")
  const [functionSearch, setFunctionSearch] = useState("")
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [roleSearch, setRoleSearch] = useState("")
  const [capabilitySearch, setCapabilitySearch] = useState("")
  const [skillSearch, setSkillSearch] = useState("")
  const [responsibilitySearch, setResponsibilitySearch] = useState("")

  // New item input state
  const [newCapability, setNewCapability] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newResponsibility, setNewResponsibility] = useState("")
  const [addingCapability, setAddingCapability] = useState(false)
  const [addingSkill, setAddingSkill] = useState(false)
  const [addingResponsibility, setAddingResponsibility] = useState(false)

  // Raw data for cascading filters
  const [agentData, setAgentData] = useState<AgentFilterData[]>([])
  const [levels, setLevels] = useState<{ id: string; name: string; level_number: number }[]>([])
  const [capabilities, setCapabilities] = useState<FilterItem[]>([])
  const [skills, setSkills] = useState<FilterItem[]>([])
  const [responsibilities, setResponsibilities] = useState<FilterItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all agent data for cascading filters
  useEffect(() => {
    async function fetchFilterData() {
      try {
        setLoading(true)

        // Fetch all active agents with their org fields
        const { data: agents } = await supabase
          .from("agents")
          .select("function_name, department_name, role_name")
          .eq("status", "active")

        // Fetch agent levels
        const { data: levelsData } = await supabase
          .from("agent_levels")
          .select("id, name, level_number")
          .order("level_number", { ascending: true })

        // Fetch capabilities
        const { data: capabilitiesData } = await supabase
          .from("capabilities")
          .select("id, name")
          .order("name", { ascending: true })

        // Fetch skills
        const { data: skillsData } = await supabase
          .from("skills")
          .select("id, name")
          .order("name", { ascending: true })

        // Fetch responsibilities
        const { data: responsibilitiesData } = await supabase
          .from("responsibilities")
          .select("id, name")
          .order("name", { ascending: true })

        setAgentData(agents || [])
        setLevels(levelsData || [])
        setCapabilities(capabilitiesData || [])
        setSkills(skillsData || [])
        setResponsibilities(responsibilitiesData || [])
      } catch (error) {
        console.error("Error fetching filter data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterData()
  }, [supabase])

  // Compute available functions (all unique functions)
  const availableFunctions = React.useMemo(() => {
    const funcs = [...new Set(agentData.map(a => a.function_name).filter(Boolean))] as string[]
    return funcs.sort()
  }, [agentData])

  // Compute available departments (cascaded from selected function)
  const availableDepartments = React.useMemo(() => {
    let filtered = agentData
    if (selectedFunction) {
      filtered = filtered.filter(a => a.function_name === selectedFunction)
    }
    const depts = [...new Set(filtered.map(a => a.department_name).filter(Boolean))] as string[]
    return depts.sort()
  }, [agentData, selectedFunction])

  // Compute available roles (cascaded from selected function and department)
  const availableRoles = React.useMemo(() => {
    let filtered = agentData
    if (selectedFunction) {
      filtered = filtered.filter(a => a.function_name === selectedFunction)
    }
    if (selectedDepartment) {
      filtered = filtered.filter(a => a.department_name === selectedDepartment)
    }
    const roles = [...new Set(filtered.map(a => a.role_name).filter(Boolean))] as string[]
    return roles.sort()
  }, [agentData, selectedFunction, selectedDepartment])

  // Filter lists by search
  const filteredLevels = levels.filter(l =>
    levelSearch === "" ||
    l.name.toLowerCase().includes(levelSearch.toLowerCase()) ||
    `L${l.level_number}`.toLowerCase().includes(levelSearch.toLowerCase())
  )

  const filteredFunctions = availableFunctions.filter(fn =>
    functionSearch === "" || fn.toLowerCase().includes(functionSearch.toLowerCase())
  )

  const filteredDepartments = availableDepartments.filter(dept =>
    departmentSearch === "" || dept.toLowerCase().includes(departmentSearch.toLowerCase())
  )

  const filteredRoles = availableRoles.filter(role =>
    roleSearch === "" || role.toLowerCase().includes(roleSearch.toLowerCase())
  )

  // Filter capabilities, skills, responsibilities by search
  const filteredCapabilities = capabilities.filter(cap =>
    capabilitySearch === "" || cap.name.toLowerCase().includes(capabilitySearch.toLowerCase())
  )

  const filteredSkills = skills.filter(skill =>
    skillSearch === "" || skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  )

  const filteredResponsibilities = responsibilities.filter(resp =>
    responsibilitySearch === "" || resp.name.toLowerCase().includes(responsibilitySearch.toLowerCase())
  )

  // Update URL with filter (with cascading clear logic)
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Cascading clear: when clearing a parent filter, clear children
    if (key === "function" && !value) {
      params.delete("department")
      params.delete("role")
      setDepartmentSearch("")
      setRoleSearch("")
    }
    if (key === "department" && !value) {
      params.delete("role")
      setRoleSearch("")
    }

    // When selecting a new function, clear department and role if they don't exist in new function
    if (key === "function" && value) {
      const deptInFunction = agentData.some(a => a.function_name === value && a.department_name === selectedDepartment)
      if (!deptInFunction) {
        params.delete("department")
        params.delete("role")
      }
    }

    // When selecting a new department, clear role if it doesn't exist in new department
    if (key === "department" && value) {
      const roleInDept = agentData.some(a =>
        (!selectedFunction || a.function_name === selectedFunction) &&
        a.department_name === value &&
        a.role_name === selectedRole
      )
      if (!roleInDept) {
        params.delete("role")
      }
    }

    router.push(`/agents?${params.toString()}`)
  }

  // Toggle multi-select filter (capabilities, skills, responsibilities)
  const toggleMultiSelect = (key: string, id: string, currentSelected: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSelected = currentSelected.includes(id)
      ? currentSelected.filter(item => item !== id)
      : [...currentSelected, id]

    if (newSelected.length > 0) {
      params.set(key, newSelected.join(","))
    } else {
      params.delete(key)
    }

    router.push(`/agents?${params.toString()}`)
  }

  // Add new capability
  const handleAddCapability = async () => {
    if (!newCapability.trim()) return
    try {
      const slug = newCapability.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const { data, error } = await supabase
        .from("capabilities")
        .insert({ name: newCapability.trim(), slug })
        .select("id, name")
        .single()

      if (error) throw error
      if (data) {
        setCapabilities(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setNewCapability("")
        setAddingCapability(false)
      }
    } catch (error) {
      console.error("Error adding capability:", error)
    }
  }

  // Add new skill
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    try {
      const slug = newSkill.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const { data, error } = await supabase
        .from("skills")
        .insert({ name: newSkill.trim(), slug })
        .select("id, name")
        .single()

      if (error) throw error
      if (data) {
        setSkills(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setNewSkill("")
        setAddingSkill(false)
      }
    } catch (error) {
      console.error("Error adding skill:", error)
    }
  }

  // Add new responsibility
  const handleAddResponsibility = async () => {
    if (!newResponsibility.trim()) return
    try {
      const { data, error } = await supabase
        .from("responsibilities")
        .insert({ name: newResponsibility.trim(), category: "general" })
        .select("id, name")
        .single()

      if (error) throw error
      if (data) {
        setResponsibilities(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setNewResponsibility("")
        setAddingResponsibility(false)
      }
    } catch (error) {
      console.error("Error adding responsibility:", error)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setLevelSearch("")
    setFunctionSearch("")
    setDepartmentSearch("")
    setRoleSearch("")
    setCapabilitySearch("")
    setSkillSearch("")
    setResponsibilitySearch("")
    router.push("/agents")
  }

  // Count active filters (including multi-select counts)
  const activeFilterCount = [
    selectedFunction,
    selectedDepartment,
    selectedRole,
    selectedLevel,
    ...selectedCapabilities,
    ...selectedSkills,
    ...selectedResponsibilities,
  ].filter(Boolean).length

  // Build URL preserving existing params
  const buildViewUrl = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (view && view !== "overview") {
      params.set("view", view)
    } else {
      params.delete("view")
    }
    const queryString = params.toString()
    return `/agents${queryString ? `?${queryString}` : ""}`
  }

  return (
    <>
      {/* Title */}
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Agents
        </h2>
        <p className="text-xs text-muted-foreground mt-1">AI expert agents</p>
      </div>

      {/* Views */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Views
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {AGENT_VIEWS.map((view) => {
                  const Icon = view.icon
                  const isActive = currentView === view.id
                  return (
                    <SidebarMenuItem key={view.id}>
                      <SidebarMenuButton
                        asChild
                        className={isActive ? "bg-primary/10 text-primary font-medium" : ""}
                      >
                        <Link href={buildViewUrl(view.id)}>
                          <Icon className="h-4 w-4" />
                          <span>{view.label}</span>
                          {isActive && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
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

      {/* Quick Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Actions
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents/create">
                      <Wand2 className="h-4 w-4" />
                      <span>Create Agent</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents">
                      <Star className="h-4 w-4" />
                      <span>All Agents</span>
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {activeFilterCount > 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Clear Filters</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Level */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Agent Level
              {selectedLevel && <Badge variant="secondary" className="ml-2 text-xs">1</Badge>}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search levels..."
                    value={levelSearch}
                    onChange={(e) => setLevelSearch(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-[200px] overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground">Loading...</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : filteredLevels.length === 0 ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground text-xs">No matches</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    filteredLevels.map((level) => (
                      <SidebarMenuItem key={level.id}>
                        <SidebarMenuButton
                          onClick={() => updateFilter("level", selectedLevel === level.id ? "" : level.id)}
                          className={selectedLevel === level.id ? "bg-primary/10 text-primary" : ""}
                        >
                          <Layers className="h-4 w-4" />
                          <span>L{level.level_number} - {level.name}</span>
                          {selectedLevel === level.id && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Function */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Function
              {selectedFunction && <Badge variant="secondary" className="ml-2 text-xs">1</Badge>}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search functions..."
                    value={functionSearch}
                    onChange={(e) => setFunctionSearch(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-[250px] overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground">Loading...</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : filteredFunctions.length === 0 ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground text-xs">No matches</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    filteredFunctions.map((fn) => (
                      <SidebarMenuItem key={fn}>
                        <SidebarMenuButton
                          onClick={() => updateFilter("function", selectedFunction === fn ? "" : fn)}
                          className={selectedFunction === fn ? "bg-primary/10 text-primary" : ""}
                        >
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{fn}</span>
                          {selectedFunction === fn && <CheckCircle2 className="ml-auto h-4 w-4 text-primary flex-shrink-0" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </ScrollArea>
              {selectedFunction && (
                <div className="px-2 pt-1">
                  <span className="text-[10px] text-muted-foreground">{availableDepartments.length} departments available</span>
                </div>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Department */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Department
              {selectedDepartment && <Badge variant="secondary" className="ml-2 text-xs">1</Badge>}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search departments..."
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-[250px] overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground">Loading...</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : filteredDepartments.length === 0 ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground text-xs">
                          {selectedFunction ? "No departments in this function" : "No matches"}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <SidebarMenuItem key={dept}>
                        <SidebarMenuButton
                          onClick={() => updateFilter("department", selectedDepartment === dept ? "" : dept)}
                          className={selectedDepartment === dept ? "bg-primary/10 text-primary" : ""}
                        >
                          <Users className="h-4 w-4" />
                          <span className="truncate">{dept}</span>
                          {selectedDepartment === dept && <CheckCircle2 className="ml-auto h-4 w-4 text-primary flex-shrink-0" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </ScrollArea>
              {selectedDepartment && (
                <div className="px-2 pt-1">
                  <span className="text-[10px] text-muted-foreground">{availableRoles.length} roles available</span>
                </div>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Role */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Role
              {selectedRole && <Badge variant="secondary" className="ml-2 text-xs">1</Badge>}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-[250px] overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground">Loading...</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : filteredRoles.length === 0 ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground text-xs">
                          {selectedDepartment ? "No roles in this department" : selectedFunction ? "No roles in this function" : "No matches"}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    filteredRoles.map((role) => (
                      <SidebarMenuItem key={role}>
                        <SidebarMenuButton
                          onClick={() => updateFilter("role", selectedRole === role ? "" : role)}
                          className={selectedRole === role ? "bg-primary/10 text-primary" : ""}
                        >
                          <User className="h-4 w-4" />
                          <span className="truncate">{role}</span>
                          {selectedRole === role && <CheckCircle2 className="ml-auto h-4 w-4 text-primary flex-shrink-0" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Capabilities (Multi-select) */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Capabilities
              {selectedCapabilities.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{selectedCapabilities.length}</Badge>
              )}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search capabilities..."
                    value={capabilitySearch}
                    onChange={(e) => setCapabilitySearch(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              {/* Selected capabilities badges */}
              {selectedCapabilities.length > 0 && (
                <div className="px-2 pb-2 flex flex-wrap gap-1">
                  {selectedCapabilities.map(id => {
                    const cap = capabilities.find(c => c.id === id)
                    return cap ? (
                      <Badge key={id} variant="default" className="text-[10px] py-0.5 px-1.5 cursor-pointer" onClick={() => toggleMultiSelect("capabilities", id, selectedCapabilities)}>
                        {cap.name.length > 20 ? cap.name.substring(0, 20) + "..." : cap.name}
                        <X className="ml-1 h-2.5 w-2.5" />
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
              <ScrollArea className="max-h-[250px] overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground">Loading...</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : filteredCapabilities.length === 0 ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground text-xs">No matches</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    filteredCapabilities.map((cap) => (
                      <SidebarMenuItem key={cap.id}>
                        <SidebarMenuButton
                          onClick={() => toggleMultiSelect("capabilities", cap.id, selectedCapabilities)}
                          className={selectedCapabilities.includes(cap.id) ? "bg-primary/10 text-primary" : ""}
                        >
                          <Sparkles className="h-4 w-4" />
                          <span className="truncate">{cap.name}</span>
                          {selectedCapabilities.includes(cap.id) && <CheckCircle2 className="ml-auto h-4 w-4 text-primary flex-shrink-0" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </ScrollArea>
              {/* Add new capability */}
              <div className="px-2 pt-2 border-t border-border/50 mt-2">
                {addingCapability ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="New capability name..."
                      value={newCapability}
                      onChange={(e) => setNewCapability(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCapability()}
                      className="h-7 flex-1 rounded border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                    <button onClick={handleAddCapability} className="h-7 px-2 rounded bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                      Add
                    </button>
                    <button onClick={() => { setAddingCapability(false); setNewCapability("") }} className="h-7 px-2 rounded border border-input text-xs hover:bg-accent">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAddingCapability(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Plus className="h-3 w-3" /> Add new capability
                  </button>
                )}
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Skills (Multi-select) */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Skills
              {selectedSkills.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{selectedSkills.length}</Badge>
              )}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              {/* Selected skills badges */}
              {selectedSkills.length > 0 && (
                <div className="px-2 pb-2 flex flex-wrap gap-1">
                  {selectedSkills.map(id => {
                    const skill = skills.find(s => s.id === id)
                    return skill ? (
                      <Badge key={id} variant="default" className="text-[10px] py-0.5 px-1.5 cursor-pointer" onClick={() => toggleMultiSelect("skills", id, selectedSkills)}>
                        {skill.name.length > 20 ? skill.name.substring(0, 20) + "..." : skill.name}
                        <X className="ml-1 h-2.5 w-2.5" />
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
              <ScrollArea className="max-h-[250px] overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground">Loading...</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : filteredSkills.length === 0 ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground text-xs">No matches</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    filteredSkills.map((skill) => (
                      <SidebarMenuItem key={skill.id}>
                        <SidebarMenuButton
                          onClick={() => toggleMultiSelect("skills", skill.id, selectedSkills)}
                          className={selectedSkills.includes(skill.id) ? "bg-primary/10 text-primary" : ""}
                        >
                          <Briefcase className="h-4 w-4" />
                          <span className="truncate">{skill.name}</span>
                          {selectedSkills.includes(skill.id) && <CheckCircle2 className="ml-auto h-4 w-4 text-primary flex-shrink-0" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </ScrollArea>
              {/* Add new skill */}
              <div className="px-2 pt-2 border-t border-border/50 mt-2">
                {addingSkill ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="New skill name..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                      className="h-7 flex-1 rounded border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                    <button onClick={handleAddSkill} className="h-7 px-2 rounded bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                      Add
                    </button>
                    <button onClick={() => { setAddingSkill(false); setNewSkill("") }} className="h-7 px-2 rounded border border-input text-xs hover:bg-accent">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAddingSkill(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Plus className="h-3 w-3" /> Add new skill
                  </button>
                )}
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Responsibilities (Multi-select) */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Responsibilities
              {selectedResponsibilities.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{selectedResponsibilities.length}</Badge>
              )}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search responsibilities..."
                    value={responsibilitySearch}
                    onChange={(e) => setResponsibilitySearch(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              {/* Selected responsibilities badges */}
              {selectedResponsibilities.length > 0 && (
                <div className="px-2 pb-2 flex flex-wrap gap-1">
                  {selectedResponsibilities.map(id => {
                    const resp = responsibilities.find(r => r.id === id)
                    return resp ? (
                      <Badge key={id} variant="default" className="text-[10px] py-0.5 px-1.5 cursor-pointer" onClick={() => toggleMultiSelect("responsibilities", id, selectedResponsibilities)}>
                        {resp.name.length > 20 ? resp.name.substring(0, 20) + "..." : resp.name}
                        <X className="ml-1 h-2.5 w-2.5" />
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
              <ScrollArea className="max-h-[250px] overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground">Loading...</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : filteredResponsibilities.length === 0 ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <span className="text-muted-foreground text-xs">No matches</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    filteredResponsibilities.map((resp) => (
                      <SidebarMenuItem key={resp.id}>
                        <SidebarMenuButton
                          onClick={() => toggleMultiSelect("responsibilities", resp.id, selectedResponsibilities)}
                          className={selectedResponsibilities.includes(resp.id) ? "bg-primary/10 text-primary" : ""}
                        >
                          <ClipboardList className="h-4 w-4" />
                          <span className="truncate">{resp.name}</span>
                          {selectedResponsibilities.includes(resp.id) && <CheckCircle2 className="ml-auto h-4 w-4 text-primary flex-shrink-0" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </ScrollArea>
              {/* Add new responsibility */}
              <div className="px-2 pt-2 border-t border-border/50 mt-2">
                {addingResponsibility ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="New responsibility name..."
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddResponsibility()}
                      className="h-7 flex-1 rounded border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                    <button onClick={handleAddResponsibility} className="h-7 px-2 rounded bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                      Add
                    </button>
                    <button onClick={() => { setAddingResponsibility(false); setNewResponsibility("") }} className="h-7 px-2 rounded border border-input text-xs hover:bg-accent">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAddingResponsibility(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Plus className="h-3 w-3" /> Add new responsibility
                  </button>
                )}
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </>
  )
}

export default SidebarAgentsContent
