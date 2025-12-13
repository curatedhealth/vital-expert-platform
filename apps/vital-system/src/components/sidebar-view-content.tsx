"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  BarChart,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  Cpu,
  Database,
  DollarSign,
  FileText,
  FolderOpen,
  Heart,
  History,
  Home,
  Kanban,
  Laptop,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  List,
  Lock,
  MessageSquare,
  Network,
  Pen,
  Pill,
  Puzzle,
  SearchIcon,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Table,
  Table as TableIcon,
  Target,
  TrendingUp,
  Upload,
  User,
  Users,
  Wand2,
  Workflow,
  Zap,
  Palette,
  GitBranch,
  Stethoscope,
  FlaskConical,
  UserCog,
  HeartPulse,
  Layers as LayersIcon,
  Plus,
  Sparkles,
  Briefcase,
  ClipboardList,
  X,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@vital/sdk/client"
import { useSavedPanels } from "@/contexts/ask-panel-context"
import { useDesigner } from "@/contexts/designer-context"
import { PANEL_TEMPLATES } from "@/features/ask-panel/constants/panel-templates"
import { ScrollArea } from "@/components/ui/scroll-area"

// Map category to icon
const CATEGORY_ICONS: Record<string, any> = {
  'clinical': Stethoscope,
  'clinical-trials': Stethoscope,
  'research': FlaskConical,
  'regulatory': Shield,
  'patient-care': HeartPulse,
  'operations': UserCog,
  'default': Users,
};

function getCategoryIcon(category: string) {
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_ICONS[key] || CATEGORY_ICONS['default'];
}

export function SidebarDashboardContent() {
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Overview
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <BarChart className="h-4 w-4" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Activity className="h-4 w-4" />
                    <span>Recent Activity</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <LineChart className="h-4 w-4" />
                    <span>Usage Trends</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Quick Actions
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/ask-expert">
                      <Bot className="h-4 w-4" />
                      <span>Start Conversation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/knowledge/upload">
                      <Cloud className="h-4 w-4" />
                      <span>Upload Knowledge</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents/create">
                      <Wand2 className="h-4 w-4" />
                      <span>Create Agent</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Recent
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <History className="h-4 w-4" />
                    <span>Recent Chats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText className="h-4 w-4" />
                    <span>Latest Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Star className="h-4 w-4" />
                    <span>Favorites</span>
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

export function SidebarAskPanelContent() {
  const { savedPanels } = useSavedPanels()

  return (
    <>
      {/* My Panels */}
      {savedPanels.length > 0 && (
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                <span>My Panels ({savedPanels.length})</span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {savedPanels.slice(0, 5).map((panel) => {
                    const IconComponent = panel.IconComponent || Users;
                    return (
                      <SidebarMenuItem key={panel.id}>
                        <SidebarMenuButton className="w-full">
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mr-2">
                            <IconComponent className="h-3 w-3 text-white" />
                          </div>
                          <span className="flex-1 text-sm truncate">{panel.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      )}

      {/* Panel Workflows */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Panel Workflows
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <SidebarMenu>
                  {PANEL_TEMPLATES.map((template) => {
                    const IconComponent = getCategoryIcon(template.category);
                    
                    return (
                      <SidebarMenuItem key={template.id}>
                        <SidebarMenuButton
                          asChild
                          className="h-auto py-2 px-3 flex-col items-start gap-1"
                        >
                          <Link href={`/ask-panel?panelId=${template.id}`}>
                            <div className="flex items-center gap-2 w-full">
                              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {template.name}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {template.description}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 capitalize">
                                    {template.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                                    {template.mode}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    <Bot className="w-2.5 h-2.5 mr-0.5" />
                                    {template.suggestedAgents.length}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Resources */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Resources
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <BookOpen className="h-4 w-4" />
                    <span>Guidelines</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Pen className="h-4 w-4" />
                    <span>Templates</span>
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

  // Views for agents page
  const AGENT_VIEWS = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "grid", label: "Grid", icon: LayoutGrid },
    { id: "list", label: "List", icon: List },
    { id: "table", label: "Table", icon: TableIcon },
    { id: "graph", label: "Knowledge Graph", icon: Network },
    { id: "compare", label: "Compare", icon: ArrowRightLeft },
  ] as const

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

export function SidebarKnowledgeContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "overview"
  const currentDomain = searchParams.get("domain") || ""
  const currentCategory = searchParams.get("category") || ""
  const currentStatus = searchParams.get("status") || ""
  const currentAccess = searchParams.get("access") || ""
  const currentTherapeutic = searchParams.get("therapeutic") || ""

  // Build URL with params (preserves existing params)
  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/knowledge${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isDomainActive = (domain: string) => currentDomain === domain
  const isCategoryActive = (category: string) => currentCategory === category
  const isStatusActive = (status: string) => currentStatus === status
  const isAccessActive = (access: string) => currentAccess === access
  const isTherapeuticActive = (therapeutic: string) => currentTherapeutic === therapeutic

  // Knowledge domain categories with their domains
  const KNOWLEDGE_DOMAIN_CATEGORIES = {
    regulatory: {
      label: 'Regulatory',
      icon: Shield,
      color: 'text-blue-500',
      domains: [
        { value: 'regulatory', label: 'Regulatory Affairs' },
        { value: 'fda-guidance', label: 'FDA Guidance' },
        { value: 'ema-guidance', label: 'EMA Guidance' },
        { value: 'ich-guidelines', label: 'ICH Guidelines' },
        { value: 'compliance', label: 'Compliance' },
      ]
    },
    clinical: {
      label: 'Clinical',
      icon: Stethoscope,
      color: 'text-green-500',
      domains: [
        { value: 'clinical-trials', label: 'Clinical Trials' },
        { value: 'protocols', label: 'Protocols' },
        { value: 'clinical-data', label: 'Clinical Data' },
        { value: 'biostatistics', label: 'Biostatistics' },
        { value: 'endpoints', label: 'Clinical Endpoints' },
      ]
    },
    safety: {
      label: 'Safety',
      icon: AlertTriangle,
      color: 'text-red-500',
      domains: [
        { value: 'pharmacovigilance', label: 'Pharmacovigilance' },
        { value: 'adverse-events', label: 'Adverse Events' },
        { value: 'safety-reporting', label: 'Safety Reporting' },
        { value: 'risk-management', label: 'Risk Management' },
      ]
    },
    scientific: {
      label: 'Scientific',
      icon: FlaskConical,
      color: 'text-purple-500',
      domains: [
        { value: 'drug-development', label: 'Drug Development' },
        { value: 'pharmacology', label: 'Pharmacology' },
        { value: 'toxicology', label: 'Toxicology' },
        { value: 'biomarkers', label: 'Biomarkers' },
        { value: 'genomics', label: 'Genomics' },
      ]
    },
    commercial: {
      label: 'Commercial',
      icon: BarChart,
      color: 'text-orange-500',
      domains: [
        { value: 'market-access', label: 'Market Access' },
        { value: 'health-economics', label: 'Health Economics' },
        { value: 'pricing-reimbursement', label: 'Pricing & Reimbursement' },
        { value: 'competitive-intelligence', label: 'Competitive Intelligence' },
      ]
    },
    quality: {
      label: 'Quality',
      icon: CheckCircle2,
      color: 'text-teal-500',
      domains: [
        { value: 'quality-assurance', label: 'Quality Assurance' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'gmp', label: 'GMP' },
        { value: 'labeling', label: 'Labeling' },
      ]
    },
    devices: {
      label: 'Medical Devices',
      icon: Cpu,
      color: 'text-cyan-500',
      domains: [
        { value: 'medical-devices', label: 'Medical Devices' },
        { value: '510k', label: '510(k)' },
        { value: 'pma', label: 'PMA' },
        { value: 'companion-diagnostics', label: 'Companion Diagnostics' },
      ]
    },
    digital: {
      label: 'Digital Health',
      icon: Laptop,
      color: 'text-indigo-500',
      domains: [
        { value: 'digital-therapeutics', label: 'Digital Therapeutics' },
        { value: 'real-world-evidence', label: 'Real-World Evidence' },
        { value: 'ai-ml', label: 'AI/ML' },
      ]
    },
  }

  // Therapeutic areas for filtering
  const THERAPEUTIC_AREAS = [
    { value: 'oncology', label: 'Oncology' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'immunology', label: 'Immunology' },
    { value: 'infectious-disease', label: 'Infectious Disease' },
    { value: 'endocrinology', label: 'Endocrinology' },
    { value: 'respiratory', label: 'Respiratory' },
    { value: 'gastroenterology', label: 'Gastroenterology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'rare-diseases', label: 'Rare Diseases' },
  ]

  // Lifecycle status options
  const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { value: 'active', label: 'Active', color: 'bg-green-500' },
    { value: 'review', label: 'Under Review', color: 'bg-yellow-500' },
    { value: 'deprecated', label: 'Deprecated', color: 'bg-orange-500' },
    { value: 'archived', label: 'Archived', color: 'bg-red-500' },
  ]

  // Access level options
  const ACCESS_OPTIONS = [
    { value: 'public', label: 'Public' },
    { value: 'organization', label: 'Organization' },
    { value: 'private', label: 'Private' },
    { value: 'confidential', label: 'Confidential' },
  ]

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Knowledge Bases</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">RAG knowledge management</p>
      </div>

      {/* Views */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Views
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("overview")}>
                    <Link href={buildUrl({ view: "overview" })}>
                      <BarChart3 className="h-4 w-4" />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("grid")}>
                    <Link href={buildUrl({ view: "grid" })}>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("list")}>
                    <Link href={buildUrl({ view: "list" })}>
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("table")}>
                    <Link href={buildUrl({ view: "table" })}>
                      <Table className="h-4 w-4" />
                      <span>Table</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("kanban")}>
                    <Link href={buildUrl({ view: "kanban" })}>
                      <Kanban className="h-4 w-4" />
                      <span>Kanban</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Browse */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5" />
                Browse
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentDomain && !currentCategory && !currentStatus}>
                    <Link href={buildUrl({ domain: null, category: null, status: null, access: null, therapeutic: null })}>
                      <BookOpen className="h-4 w-4" />
                      <span>All Knowledge Bases</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Domain Category */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" />
                Domain Categories
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentCategory}>
                    <Link href={buildUrl({ category: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Categories</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {Object.entries(KNOWLEDGE_DOMAIN_CATEGORIES).map(([key, cat]) => {
                  const Icon = cat.icon
                  return (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton asChild data-active={isCategoryActive(key)}>
                        <Link href={buildUrl({ category: key })}>
                          <Icon className={`h-4 w-4 ${cat.color}`} />
                          <span>{cat.label}</span>
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

      {/* Knowledge Domains (All 50+) */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5" />
                Knowledge Domains
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="max-h-[400px] overflow-y-auto">
                {Object.entries(KNOWLEDGE_DOMAIN_CATEGORIES).map(([catKey, cat]) => (
                  <div key={catKey} className="mb-3">
                    <div className="px-3 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <cat.icon className={`h-3 w-3 ${cat.color}`} />
                      {cat.label}
                    </div>
                    <SidebarMenu>
                      {cat.domains.map((domain) => (
                        <SidebarMenuItem key={domain.value}>
                          <SidebarMenuButton asChild data-active={isDomainActive(domain.value)} className="h-7 text-xs">
                            <Link href={buildUrl({ domain: domain.value })}>
                              <span className="truncate">{domain.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Therapeutic Areas */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5" />
                Therapeutic Areas
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentTherapeutic}>
                    <Link href={buildUrl({ therapeutic: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Areas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {THERAPEUTIC_AREAS.map((area) => (
                  <SidebarMenuItem key={area.value}>
                    <SidebarMenuButton asChild data-active={isTherapeuticActive(area.value)}>
                      <Link href={buildUrl({ therapeutic: area.value })}>
                        <Pill className="h-4 w-4 text-pink-500" />
                        <span>{area.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Lifecycle Status */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Lifecycle Status
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentStatus}>
                    <Link href={buildUrl({ status: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Status</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <SidebarMenuItem key={status.value}>
                    <SidebarMenuButton asChild data-active={isStatusActive(status.value)}>
                      <Link href={buildUrl({ status: status.value })}>
                        <div className="h-4 w-4 flex items-center justify-center">
                          <div className={`h-2 w-2 rounded-full ${status.color}`} />
                        </div>
                        <span>{status.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Access Level */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Access Level
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentAccess}>
                    <Link href={buildUrl({ access: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Levels</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {ACCESS_OPTIONS.map((access) => (
                  <SidebarMenuItem key={access.value}>
                    <SidebarMenuButton asChild data-active={isAccessActive(access.value)}>
                      <Link href={buildUrl({ access: access.value })}>
                        <Lock className="h-4 w-4 text-amber-500" />
                        <span>{access.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
                    <Link href="/knowledge/upload">
                      <Upload className="h-4 w-4" />
                      <span>Upload Content</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/knowledge?tab=search">
                      <SearchIcon className="h-4 w-4" />
                      <span>Search Library</span>
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

export function SidebarWorkflowsContent() {
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Workflow Status
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Workflow className="h-4 w-4" />
                    <span>Active</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Clock className="h-4 w-4" />
                    <span>Scheduled</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completed</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Integration
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Layers className="h-4 w-4" />
                    <span>Connected Systems</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Configuration</span>
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

export function SidebarSolutionBuilderContent() {
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Builder
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Wand2 className="h-4 w-4" />
                    <span>Templates</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Puzzle className="h-4 w-4" />
                    <span>Components</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Configuration</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

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
                  <SidebarMenuButton>
                    <ArrowRight className="h-4 w-4" />
                    <span>Preview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Cloud className="h-4 w-4" />
                    <span>Deploy</span>
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

export function SidebarPromptPrismContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "overview"
  const currentSuite = searchParams.get("suite") || ""
  const currentSubSuite = searchParams.get("subSuite") || ""
  const currentComplexity = searchParams.get("complexity") || ""

  // PRISM Suites configuration
  const PRISM_SUITES = [
    { code: 'RULES', name: 'RULES™', icon: Shield, color: 'text-blue-600' },
    { code: 'TRIALS', name: 'TRIALS™', icon: FlaskConical, color: 'text-violet-600' },
    { code: 'GUARD', name: 'GUARD™', icon: ShieldCheck, color: 'text-red-600' },
    { code: 'VALUE', name: 'VALUE™', icon: DollarSign, color: 'text-emerald-600' },
    { code: 'BRIDGE', name: 'BRIDGE™', icon: Users, color: 'text-orange-600' },
    { code: 'PROOF', name: 'PROOF™', icon: BarChart3, color: 'text-cyan-600' },
    { code: 'CRAFT', name: 'CRAFT™', icon: Pen, color: 'text-purple-600' },
    { code: 'SCOUT', name: 'SCOUT™', icon: Target, color: 'text-lime-600' },
    { code: 'PROJECT', name: 'PROJECT™', icon: ClipboardList, color: 'text-indigo-600' },
    { code: 'FORGE', name: 'FORGE™', icon: Zap, color: 'text-amber-600' },
  ]

  // Build URL with params
  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/prompts${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isSuiteActive = (suite: string) => currentSuite === suite
  const isComplexityActive = (complexity: string) => currentComplexity === complexity

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Prompts</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">Healthcare prompt templates</p>
      </div>

      {/* Views */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Views
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("overview")}>
                    <Link href={buildUrl({ view: "overview" })}>
                      <BarChart3 className="h-4 w-4" />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("grid")}>
                    <Link href={buildUrl({ view: "grid" })}>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("list")}>
                    <Link href={buildUrl({ view: "list" })}>
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("table")}>
                    <Link href={buildUrl({ view: "table" })}>
                      <Table className="h-4 w-4" />
                      <span>Table</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("kanban")}>
                    <Link href={buildUrl({ view: "kanban" })}>
                      <Kanban className="h-4 w-4" />
                      <span>Kanban</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Browse Hierarchy */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5" />
                Browse
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentSuite && !currentComplexity}>
                    <Link href={buildUrl({ suite: null, subSuite: null, complexity: null })}>
                      <BookOpen className="h-4 w-4" />
                      <span>All Prompts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/prompts/suites">
                      <LayersIcon className="h-4 w-4" />
                      <span>Browse Suites</span>
                      <ArrowRight className="h-3 w-3 ml-auto opacity-50" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* PRISM Suites Filter */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                PRISM™ Suites
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <ScrollArea className="h-auto max-h-[280px]">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild data-active={!currentSuite}>
                      <Link href={buildUrl({ suite: null, subSuite: null })}>
                        <CheckCircle2 className="h-4 w-4 text-gray-500" />
                        <span>All Suites</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {PRISM_SUITES.map((suite) => {
                    const Icon = suite.icon
                    return (
                      <SidebarMenuItem key={suite.code}>
                        <SidebarMenuButton
                          asChild
                          data-active={isSuiteActive(suite.code)}
                        >
                          <Link href={buildUrl({ suite: suite.code, subSuite: null })}>
                            <Icon className={`h-4 w-4 ${suite.color}`} />
                            <span>{suite.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Complexity Filter */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Complexity
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentComplexity}>
                    <Link href={buildUrl({ complexity: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Levels</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("basic")}>
                    <Link href={buildUrl({ complexity: "basic" })}>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Basic</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("intermediary")}>
                    <Link href={buildUrl({ complexity: "intermediary" })}>
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Intermediary</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("advanced")}>
                    <Link href={buildUrl({ complexity: "advanced" })}>
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span>Advanced</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("expert")}>
                    <Link href={buildUrl({ complexity: "expert" })}>
                      <Star className="h-4 w-4 text-red-500" />
                      <span>Expert</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Wand2 className="h-3.5 w-3.5" />
                Actions
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/prompts?action=create">
                      <Plus className="h-4 w-4" />
                      <span>Create Prompt</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/prompts/suites">
                      <FolderOpen className="h-4 w-4" />
                      <span>Manage Suites</span>
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

export function SidebarPersonasContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "grid"
  const currentArchetype = searchParams.get("archetype") || ""
  const currentSeniority = searchParams.get("seniority") || ""
  const currentFunction = searchParams.get("function") || ""

  // Build URL with params (preserves existing params)
  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/optimize/personas${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isArchetypeActive = (archetype: string) => currentArchetype === archetype
  const isSeniorityActive = (seniority: string) => currentSeniority === seniority

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Personas</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">MECE user archetypes</p>
      </div>

      {/* Views */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Views
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("grid")}>
                    <Link href={buildUrl({ view: "grid" })}>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("list")}>
                    <Link href={buildUrl({ view: "list" })}>
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("archetypes")}>
                    <Link href={buildUrl({ view: "archetypes" })}>
                      <LayersIcon className="h-4 w-4" />
                      <span>By Archetype</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("departments")}>
                    <Link href={buildUrl({ view: "departments" })}>
                      <Building2 className="h-4 w-4" />
                      <span>By Department</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("focus")}>
                    <Link href={buildUrl({ view: "focus" })}>
                      <Target className="h-4 w-4" />
                      <span>Focus Mode</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Archetypes Filter */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Archetypes
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentArchetype}>
                    <Link href={buildUrl({ archetype: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Archetypes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isArchetypeActive("AUTOMATOR")}>
                    <Link href={buildUrl({ archetype: "AUTOMATOR" })}>
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Automator</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isArchetypeActive("ORCHESTRATOR")}>
                    <Link href={buildUrl({ archetype: "ORCHESTRATOR" })}>
                      <Network className="h-4 w-4 text-purple-500" />
                      <span>Orchestrator</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isArchetypeActive("LEARNER")}>
                    <Link href={buildUrl({ archetype: "LEARNER" })}>
                      <BookOpen className="h-4 w-4 text-green-500" />
                      <span>Learner</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isArchetypeActive("SKEPTIC")}>
                    <Link href={buildUrl({ archetype: "SKEPTIC" })}>
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>Skeptic</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Seniority Filter */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Seniority
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentSeniority}>
                    <Link href={buildUrl({ seniority: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Levels</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isSeniorityActive("executive")}>
                    <Link href={buildUrl({ seniority: "executive" })}>
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>Executive</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isSeniorityActive("director")}>
                    <Link href={buildUrl({ seniority: "director" })}>
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Director</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isSeniorityActive("senior")}>
                    <Link href={buildUrl({ seniority: "senior" })}>
                      <User className="h-4 w-4 text-green-500" />
                      <span>Senior</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isSeniorityActive("mid")}>
                    <Link href={buildUrl({ seniority: "mid" })}>
                      <User className="h-4 w-4 text-purple-500" />
                      <span>Mid-Level</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isSeniorityActive("entry")}>
                    <Link href={buildUrl({ seniority: "entry" })}>
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Entry</span>
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

export function SidebarJTBDContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "grid"
  const currentPriority = searchParams.get("priority") || ""
  const currentCategory = searchParams.get("category") || ""
  const currentStatus = searchParams.get("status") || ""

  // Build URL with params (preserves existing params)
  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/optimize/jobs-to-be-done${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isPriorityActive = (priority: string) => currentPriority === priority
  const isStatusActive = (status: string) => currentStatus === status

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Jobs-to-Be-Done</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">ODI-scored job statements</p>
      </div>

      {/* Views */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Views
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("grid")}>
                    <Link href={buildUrl({ view: "grid" })}>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("list")}>
                    <Link href={buildUrl({ view: "list" })}>
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("categories")}>
                    <Link href={buildUrl({ view: "categories" })}>
                      <LayersIcon className="h-4 w-4" />
                      <span>By Category</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* ODI Priority Filter */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                ODI Priority
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentPriority}>
                    <Link href={buildUrl({ priority: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Priorities</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isPriorityActive("extreme")}>
                    <Link href={buildUrl({ priority: "extreme" })}>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Extreme (≥15)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isPriorityActive("high")}>
                    <Link href={buildUrl({ priority: "high" })}>
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span>High (12-14.9)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isPriorityActive("medium")}>
                    <Link href={buildUrl({ priority: "medium" })}>
                      <BarChart3 className="h-4 w-4 text-yellow-500" />
                      <span>Medium (10-11.9)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isPriorityActive("low")}>
                    <Link href={buildUrl({ priority: "low" })}>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Low (&lt;10)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Status Filter */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Status
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentStatus}>
                    <Link href={buildUrl({ status: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Statuses</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isStatusActive("active")}>
                    <Link href={buildUrl({ status: "active" })}>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Active</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isStatusActive("planned")}>
                    <Link href={buildUrl({ status: "planned" })}>
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Planned</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isStatusActive("completed")}>
                    <Link href={buildUrl({ status: "completed" })}>
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span>Completed</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isStatusActive("draft")}>
                    <Link href={buildUrl({ status: "draft" })}>
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>Draft</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Job Type Filter */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" />
                Job Type
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentCategory}>
                    <Link href={buildUrl({ category: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Types</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={currentCategory === "functional"}>
                    <Link href={buildUrl({ category: "functional" })}>
                      <Settings className="h-4 w-4 text-blue-500" />
                      <span>Functional</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={currentCategory === "emotional"}>
                    <Link href={buildUrl({ category: "emotional" })}>
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span>Emotional</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={currentCategory === "social"}>
                    <Link href={buildUrl({ category: "social" })}>
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>Social</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={currentCategory === "consumption"}>
                    <Link href={buildUrl({ category: "consumption" })}>
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span>Consumption</span>
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

// ═══════════════════════════════════════════════════════════════════
// VALUE VIEW - VIEWS SECTION (URL-BASED)
// ═══════════════════════════════════════════════════════════════════

const VALUE_VIEW_MODES = [
  { id: 'stack', label: 'Stack', icon: Layers, description: '8-Layer Ontology' },
  { id: 'radar', label: 'Radar', icon: Target, description: 'ODI Opportunities' },
  { id: 'heatmap', label: 'Heatmap', icon: LayoutGrid, description: 'Coverage Matrix' },
  { id: 'flow', label: 'Flow', icon: Workflow, description: 'Workflow Flows' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, description: 'KPI Dashboard' },
  { id: 'list', label: 'List', icon: List, description: 'Table View' },
] as const

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

// ═══════════════════════════════════════════════════════════════════
// ONTOLOGY EXPLORER SIDEBAR
// ═══════════════════════════════════════════════════════════════════

const ONTOLOGY_NODE_TYPES = [
  { id: 'all', label: 'All Nodes', icon: Network, color: 'text-slate-500' },
  { id: 'function', label: 'Functions', icon: Building2, color: 'text-violet-500' },
  { id: 'department', label: 'Departments', icon: FolderOpen, color: 'text-blue-500' },
  { id: 'role', label: 'Roles', icon: User, color: 'text-emerald-500' },
  { id: 'jtbd', label: 'JTBDs', icon: Target, color: 'text-amber-500' },
  { id: 'value', label: 'Value Categories', icon: TrendingUp, color: 'text-cyan-500' },
  { id: 'agent', label: 'AI Agents', icon: Bot, color: 'text-yellow-500' },
  { id: 'persona', label: 'Personas', icon: Users, color: 'text-gray-500' },
  { id: 'workflow', label: 'Workflows', icon: Workflow, color: 'text-pink-500' },
] as const

const ONTOLOGY_LAYERS = [
  { id: 'L0', label: 'L0: Domain', icon: Database },
  { id: 'L1', label: 'L1: Strategy', icon: Target },
  { id: 'L2', label: 'L2: Organization', icon: Building2 },
  { id: 'L3', label: 'L3: Personas', icon: Users },
  { id: 'L4', label: 'L4: JTBDs', icon: ClipboardList },
  { id: 'L5', label: 'L5: Outcomes', icon: TrendingUp },
  { id: 'L6', label: 'L6: Workflows', icon: Workflow },
  { id: 'L7', label: 'L7: Agents', icon: Bot },
] as const

export function SidebarOntologyContent() {
  const searchParams = useSearchParams()
  const currentNodeType = searchParams.get("nodeType") || "all"
  const currentLayer = searchParams.get("layer") || ""
  const currentView = searchParams.get("view") || "graph"

  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/optimize/ontology${queryString ? '?' + queryString : ''}`
  }

  return (
    <>
      {/* Views */}
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={currentView === "graph"}>
                    <Link href={buildUrl({ view: null })}>
                      <Network className="h-4 w-4" />
                      <span>Graph View</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={currentView === "tree"}>
                    <Link href={buildUrl({ view: "tree" })}>
                      <GitBranch className="h-4 w-4" />
                      <span>Tree View</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={currentView === "table"}>
                    <Link href={buildUrl({ view: "table" })}>
                      <TableIcon className="h-4 w-4" />
                      <span>Table View</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Node Types */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Puzzle className="h-3.5 w-3.5" />
                Node Types
                {currentNodeType !== "all" && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <ScrollArea className="h-56">
                <SidebarMenu>
                  {ONTOLOGY_NODE_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <SidebarMenuItem key={type.id}>
                        <SidebarMenuButton asChild data-active={currentNodeType === type.id}>
                          <Link href={buildUrl({ nodeType: type.id })}>
                            <Icon className={`h-4 w-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Ontology Layers */}
      <Collapsible defaultOpen={false} className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" />
                Ontology Layers
                {currentLayer && <Badge variant="secondary" className="text-[10px] h-4 px-1">1</Badge>}
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentLayer}>
                    <Link href={buildUrl({ layer: null })}>
                      <LayersIcon className="h-4 w-4" />
                      <span>All Layers</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {ONTOLOGY_LAYERS.map((layer) => {
                  const Icon = layer.icon
                  return (
                    <SidebarMenuItem key={layer.id}>
                      <SidebarMenuButton asChild data-active={currentLayer === layer.id}>
                        <Link href={buildUrl({ layer: layer.id })}>
                          <Icon className="h-4 w-4" />
                          <span className="text-xs">{layer.label}</span>
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
                    <Link href="/value">
                      <BarChart3 className="h-4 w-4" />
                      <span>Value Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/optimize/personas">
                      <Users className="h-4 w-4" />
                      <span>View Personas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/optimize/jobs-to-be-done">
                      <Target className="h-4 w-4" />
                      <span>View JTBDs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents">
                      <Bot className="h-4 w-4" />
                      <span>View Agents</span>
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

export function SidebarValueContent() {
  const [filters, setFilters] = useState({
    industry: 'all',  // Changed from tenant_id to industry
    function_id: 'all',
    department_id: 'all',
    role_id: 'all',
    jtbd_id: 'all',
    persona_archetype: 'all',
    agent_status: 'all',
  });

  const [filterData, setFilterData] = useState<{
    industries: Array<{ id: string; name: string }>;  // Changed from tenants to industries
    functions: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; count?: number }>;
    roles: Array<{ id: string; name: string; count?: number }>;
    jtbds: Array<{ id: string; name: string }>;
  }>({
    industries: [],  // Changed from tenants to industries
    functions: [],
    departments: [],
    roles: [],
    jtbds: [],
  });

  const [stats, setStats] = useState({
    functions: 0,
    departments: 0,
    roles: 0,
    personas: 0,
    agents: 0,
    jtbds: 0,
    coverage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    industries: false,  // Changed from tenants to industries
    functions: true,
    departments: false,
    roles: false,
    jtbds: false,
    archetypes: false,
    suggestions: true,
  });

  const personaArchetypes = [
    { id: 'AUTOMATOR', name: 'Automator', color: 'bg-green-100 text-green-700' },
    { id: 'ORCHESTRATOR', name: 'Orchestrator', color: 'bg-blue-100 text-blue-700' },
    { id: 'LEARNER', name: 'Learner', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'SKEPTIC', name: 'Skeptic', color: 'bg-red-100 text-red-700' },
  ];

  // Fetch hierarchy data (with optional industry filter)
  const fetchHierarchyData = async (industry?: string) => {
    try {
      const queryParams = industry && industry !== 'all' ? `?industry=${industry}` : '';
      const res = await fetch(`/api/ontology-investigator/hierarchy${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          functions: data.summary?.total_functions || data.layers?.L1_functions?.count || 0,
          departments: data.layers?.L2_departments?.count || 0,
          roles: data.summary?.total_roles || data.layers?.L3_roles?.count || 0,
          personas: data.summary?.total_personas || data.layers?.L4_personas?.count || 0,
          agents: data.summary?.total_agents || data.layers?.L7_agents?.count || 0,
          jtbds: data.layers?.L5_jtbds?.count || 0,
          coverage: data.summary?.coverage_percentage || 0,
        });

        if (data.functions && Array.isArray(data.functions)) {
          setFilterData(prev => ({
            ...prev,
            functions: data.functions.map((f: any) => ({
              id: f.id || f.slug || '',
              name: f.name || 'Unknown'
            })),
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching hierarchy data:', err);
    }
  };

  // Track if initial load is done (declared before useEffect that uses it)
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch hierarchy (functions and stats)
        await fetchHierarchyData();

        // Fetch industries
        const industriesRes = await fetch('/api/ontology-investigator/industries');
        if (industriesRes.ok) {
          const industriesData = await industriesRes.json();
          setFilterData(prev => ({
            ...prev,
            industries: (industriesData.industries || []).map((i: any) => ({
              id: i.id || i.slug,
              name: i.name || 'Unknown',
            })),
          }));
        }
      } catch (err) {
        console.error('Error fetching ontology data:', err);
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };
    fetchData();
  }, []);

  // Re-fetch functions and stats when industry changes (cascading filter)
  useEffect(() => {
    // Skip the very first render before initial data is loaded
    if (!initialLoadDone) {
      return;
    }
    // When industry changes, re-fetch hierarchy (filtered or all)
    // This updates: functions list, stats (roles, personas, etc.)
    fetchHierarchyData(filters.industry === 'all' ? undefined : filters.industry);
  }, [filters.industry, initialLoadDone]);

  // Fetch departments when function changes
  useEffect(() => {
    if (filters.function_id === 'all') {
      setFilterData(prev => ({ ...prev, departments: [], roles: [] }));
      return;
    }
    const fetchDepts = async () => {
      const res = await fetch(`/api/ontology-investigator/departments?function_id=${filters.function_id}`);
      if (res.ok) {
        const data = await res.json();
        setFilterData(prev => ({
          ...prev,
          departments: (data.departments || []).map((d: any) => ({
            id: d.id,
            name: d.name || 'Unknown',
            count: d.role_count,
          })),
        }));
      }
    };
    fetchDepts();
  }, [filters.function_id]);

  // Fetch roles when department changes
  useEffect(() => {
    if (filters.department_id === 'all') {
      setFilterData(prev => ({ ...prev, roles: [] }));
      return;
    }
    const fetchRoles = async () => {
      const res = await fetch(`/api/ontology-investigator/roles?department_id=${filters.department_id}`);
      if (res.ok) {
        const data = await res.json();
        setFilterData(prev => ({
          ...prev,
          roles: (data.roles || []).map((r: any) => ({
            id: r.id,
            name: r.name || r.title || 'Unknown',
            count: r.agent_count,
          })),
        }));
      }
    };
    fetchRoles();
  }, [filters.department_id]);

  // Fetch JTBDs based on filters
  useEffect(() => {
    const fetchJTBDs = async () => {
      let url = '/api/ontology-investigator/jtbds?limit=30';
      if (filters.function_id !== 'all') url += `&function_id=${filters.function_id}`;
      if (filters.role_id !== 'all') url += `&role_id=${filters.role_id}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFilterData(prev => ({
          ...prev,
          jtbds: (data.jtbds || []).slice(0, 30).map((j: any) => ({
            id: j.id,
            name: j.name || j.job_statement?.substring(0, 40) + '...' || 'Unknown',
          })),
        }));
      }
    };
    fetchJTBDs();
  }, [filters.function_id, filters.role_id]);

  // Handle filter change with cascade reset
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Cascade reset
      if (key === 'tenant_id') {
        newFilters.function_id = 'all';
        newFilters.department_id = 'all';
        newFilters.role_id = 'all';
        newFilters.jtbd_id = 'all';
      } else if (key === 'function_id') {
        newFilters.department_id = 'all';
        newFilters.role_id = 'all';
        newFilters.jtbd_id = 'all';
      } else if (key === 'department_id') {
        newFilters.role_id = 'all';
        newFilters.jtbd_id = 'all';
      } else if (key === 'role_id') {
        newFilters.jtbd_id = 'all';
      }
      return newFilters;
    });
  };

  // Get human-readable labels for active filters
  const getFilterLabels = () => {
    const labels: Record<string, string> = {};

    if (filters.industry !== 'all') {
      const industry = filterData.industries.find(i => i.id === filters.industry);
      if (industry) labels.industry = industry.name;
    }
    if (filters.function_id !== 'all') {
      const func = filterData.functions.find(f => f.id === filters.function_id);
      if (func) labels.function = func.name;
    }
    if (filters.department_id !== 'all') {
      const dept = filterData.departments.find(d => d.id === filters.department_id);
      if (dept) labels.department = dept.name;
    }
    if (filters.role_id !== 'all') {
      const role = filterData.roles.find(r => r.id === filters.role_id);
      if (role) labels.role = role.name;
    }
    if (filters.jtbd_id !== 'all') {
      const jtbd = filterData.jtbds.find(j => j.id === filters.jtbd_id);
      if (jtbd) labels.jtbd = jtbd.name;
    }
    if (filters.persona_archetype !== 'all') {
      const archetype = personaArchetypes.find(a => a.id === filters.persona_archetype);
      if (archetype) labels.archetype = archetype.name;
    }

    return labels;
  };

  // Dispatch filter change event
  useEffect(() => {
    const labels = getFilterLabels();
    window.dispatchEvent(new CustomEvent('ontology-filter-change', {
      detail: { filters, stats, labels }
    }));
  }, [filters, stats, filterData]);

  // Listen for clear filter events from Value page
  useEffect(() => {
    const handleClearFilter = (e: CustomEvent) => {
      const { filterKey, filters: newFilters } = e.detail;
      console.log('Clearing filter:', filterKey, newFilters);
      setFilters(newFilters);
    };

    const handleClearAllFilters = () => {
      console.log('Clearing all filters');
      setFilters({
        industry: 'all',
        function_id: 'all',
        department_id: 'all',
        role_id: 'all',
        jtbd_id: 'all',
        persona_archetype: 'all',
        agent_status: 'all',
      });
    };

    window.addEventListener('value-clear-filter' as any, handleClearFilter);
    window.addEventListener('value-clear-all-filters' as any, handleClearAllFilters);

    return () => {
      window.removeEventListener('value-clear-filter' as any, handleClearFilter);
      window.removeEventListener('value-clear-all-filters' as any, handleClearAllFilters);
    };
  }, []);

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
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

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
                        <LayersIcon className="h-4 w-4" />
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
                      <LayersIcon className="h-4 w-4" />
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
                        <LayersIcon className="h-4 w-4" />
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
                        <LayersIcon className="h-4 w-4" />
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
                        <LayersIcon className="h-4 w-4" />
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
                    <LayersIcon className="h-4 w-4" />
                    <span>All Archetypes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {personaArchetypes.map(a => (
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
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={idx}
                      className="w-full text-left p-2 text-xs bg-muted/50 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('value-ai-suggestion', {
                          detail: { question: suggestion.text, filters }
                        }));
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{suggestion.text}</span>
                    </button>
                  );
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

export function SidebarMedicalStrategyContent() {
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Evidence Synthesis
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/medical-strategy">
                      <Target className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/medical-strategy?tab=evidence">
                      <FileText className="h-4 w-4" />
                      <span>Evidence Synthesis</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/medical-strategy?tab=competitive">
                      <Target className="h-4 w-4" />
                      <span>Competitive Intel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/medical-strategy?tab=kol">
                      <Users className="h-4 w-4" />
                      <span>KOL Network</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Strategic Analytics
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/medical-strategy?tab=insights">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Insights</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/value">
                      <TrendingUp className="h-4 w-4" />
                      <span>Value View</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/ontology-explorer">
                      <Layers className="h-4 w-4" />
                      <span>Ontology Explorer</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Quick Actions
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/ask-expert">
                      <Bot className="h-4 w-4" />
                      <span>Ask Expert</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents">
                      <Users className="h-4 w-4" />
                      <span>Browse Agents</span>
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

export function SidebarAdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'overview'

  const handleNavigation = (view: string) => {
    router.push(`/admin?view=${view}`)
  }

  const isActive = (view: string) => currentView === view

  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Overview
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('executive')}
                    isActive={isActive('executive')}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Executive Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('overview')}
                    isActive={isActive('overview')}
                  >
                    <Home className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              User & Access
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('users')}
                    isActive={isActive('users')}
                  >
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              AI Resources
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('agents')}
                    isActive={isActive('agents')}
                  >
                    <Bot className="h-4 w-4" />
                    <span>Agents</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('prompts')}
                    isActive={isActive('prompts')}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Prompts</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('tools')}
                    isActive={isActive('tools')}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Tools</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Analytics & Monitoring
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('agent-analytics')}
                    isActive={isActive('agent-analytics')}
                  >
                    <Activity className="h-4 w-4" />
                    <span>Agent Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('feedback-analytics')}
                    isActive={isActive('feedback-analytics')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Feedback Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('usage-analytics')}
                    isActive={isActive('usage-analytics')}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Usage Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('services-analytics')}
                    isActive={isActive('services-analytics')}
                  >
                    <Cloud className="h-4 w-4" />
                    <span>Services Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('system-monitoring')}
                    isActive={isActive('system-monitoring')}
                  >
                    <Zap className="h-4 w-4" />
                    <span>System Monitoring</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              LLM Management
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('llm-providers')}
                    isActive={isActive('llm-providers')}
                  >
                    <Server className="h-4 w-4" />
                    <span>Providers</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('llm-cost-tracking')}
                    isActive={isActive('llm-cost-tracking')}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Cost Tracking</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Capabilities & Skills
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('capabilities')}
                    isActive={isActive('capabilities')}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Capabilities</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('skills')}
                    isActive={isActive('skills')}
                  >
                    <Star className="h-4 w-4" />
                    <span>Skills</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Panel Management
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('ask-panel')}
                    isActive={isActive('ask-panel')}
                  >
                    <Users className="h-4 w-4" />
                    <span>Ask Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('expert-panel')}
                    isActive={isActive('expert-panel')}
                  >
                    <User className="h-4 w-4" />
                    <span>Expert Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Organization
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('organizations')}
                    isActive={isActive('organizations')}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Organizations</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('functions')}
                    isActive={isActive('functions')}
                  >
                    <Layers className="h-4 w-4" />
                    <span>Functions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('roles')}
                    isActive={isActive('roles')}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Roles</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('personas')}
                    isActive={isActive('personas')}
                  >
                    <User className="h-4 w-4" />
                    <span>Personas</span>
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

export function SidebarDesignerContent() {
  const { onPanelSelect } = useDesigner();

  return (
    <>
      {/* Workflow Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Workflow Actions
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('new')}>
                    <Palette className="h-4 w-4" />
                    <span>New Workflow</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('import')}>
                    <Upload className="h-4 w-4" />
                    <span>Import Workflow</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('templates')}>
                    <FileText className="h-4 w-4" />
                    <span>Templates</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Panel Workflows (6 types) */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Panel Workflows
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('structured_panel')}>
                    <Users className="h-4 w-4" />
                    <span>Structured Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('open_panel')}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Open Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('socratic_panel')}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Socratic Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('adversarial_panel')}>
                    <GitBranch className="h-4 w-4" />
                    <span>Adversarial Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('delphi_panel')}>
                    <LayersIcon className="h-4 w-4" />
                    <span>Delphi Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('hybrid_panel')}>
                    <Users className="h-4 w-4" />
                    <span>Hybrid Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Ask Expert Modes (4 modes) */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Expert Modes
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('mode1_ask_expert')}>
                    <Zap className="h-4 w-4" />
                    <span>Mode 1: Quick Response</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('mode2_ask_expert')}>
                    <LayersIcon className="h-4 w-4" />
                    <span>Mode 2: Context + RAG</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('mode3_ask_expert')}>
                    <GitBranch className="h-4 w-4" />
                    <span>Mode 3: Multi-Agent</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onPanelSelect('mode4_ask_expert')}>
                    <Bot className="h-4 w-4" />
                    <span>Mode 4: Agent + Tools</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Recent Workflows */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Recent Workflows
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <History className="h-4 w-4" />
                    <span>Last Edited</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Star className="h-4 w-4" />
                    <span>Favorites</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Clock className="h-4 w-4" />
                    <span>Recent Runs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Workflow Components */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Components
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Bot className="h-4 w-4" />
                    <span>Agent Nodes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Puzzle className="h-4 w-4" />
                    <span>Task Nodes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Tool Nodes</span>
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

// Knowledge Builder Sidebar Content
export function SidebarKnowledgeBuilderContent() {
  return (
    <>
      {/* Navigation */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Knowledge Builder
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/knowledge?tab=overview">
                      <BarChart className="h-4 w-4" />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/knowledge?tab=domains">
                      <FolderOpen className="h-4 w-4" />
                      <span>Domains</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/knowledge?tab=upload">
                      <Upload className="h-4 w-4" />
                      <span>Upload Documents</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/knowledge?tab=embeddings">
                      <Layers className="h-4 w-4" />
                      <span>Embeddings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/knowledge?tab=connections">
                      <Puzzle className="h-4 w-4" />
                      <span>Connections</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
              Quick Actions
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/knowledge?tab=upload">
                      <Plus className="h-4 w-4" />
                      <span>New Upload</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/knowledge">
                      <BookOpen className="h-4 w-4" />
                      <span>Browse Library</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/knowledge?tab=search">
                      <SearchIcon className="h-4 w-4" />
                      <span>Search Knowledge</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Other Builders */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Other Builders
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/agent">
                      <Bot className="h-4 w-4" />
                      <span>Agent Builder</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer/panel">
                      <Users className="h-4 w-4" />
                      <span>Panel Builder</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/designer">
                      <GitBranch className="h-4 w-4" />
                      <span>Process Builder</span>
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

// ============================================================================
// TOOLS SIDEBAR CONTENT - Context-specific for /discover/tools
// ============================================================================

export function SidebarToolsContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "overview"
  const currentCategory = searchParams.get("category") || ""
  const currentStatus = searchParams.get("status") || ""
  const currentType = searchParams.get("type") || ""

  // Build URL with params (preserves existing params)
  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/discover/tools${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isCategoryActive = (category: string) => currentCategory === category
  const isStatusActive = (status: string) => currentStatus === status
  const isTypeActive = (type: string) => currentType === type

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Tools</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">Healthcare AI tools registry</p>
      </div>

      {/* Views */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Views
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("overview")}>
                    <Link href={buildUrl({ view: "overview" })}>
                      <BarChart3 className="h-4 w-4" />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("grid")}>
                    <Link href={buildUrl({ view: "grid" })}>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("list")}>
                    <Link href={buildUrl({ view: "list" })}>
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("table")}>
                    <Link href={buildUrl({ view: "table" })}>
                      <Table className="h-4 w-4" />
                      <span>Table</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("kanban")}>
                    <Link href={buildUrl({ view: "kanban" })}>
                      <Kanban className="h-4 w-4" />
                      <span>Kanban</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Browse */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5" />
                Browse
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentCategory && !currentStatus && !currentType}>
                    <Link href={buildUrl({ category: null, status: null, type: null })}>
                      <BookOpen className="h-4 w-4" />
                      <span>All Tools</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Category */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5" />
                Categories
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentCategory}>
                    <Link href={buildUrl({ category: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Categories</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("healthcare")}>
                    <Link href={buildUrl({ category: "healthcare" })}>
                      <HeartPulse className="h-4 w-4 text-red-500" />
                      <span>Healthcare</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("research")}>
                    <Link href={buildUrl({ category: "research" })}>
                      <FlaskConical className="h-4 w-4 text-cyan-500" />
                      <span>Research</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("fhir")}>
                    <Link href={buildUrl({ category: "fhir" })}>
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span>FHIR/Interop</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("clinical-nlp")}>
                    <Link href={buildUrl({ category: "clinical-nlp" })}>
                      <Stethoscope className="h-4 w-4 text-purple-500" />
                      <span>Clinical NLP</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("deidentification")}>
                    <Link href={buildUrl({ category: "deidentification" })}>
                      <ShieldCheck className="h-4 w-4 text-orange-500" />
                      <span>De-identification</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Lifecycle */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Lifecycle
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentStatus}>
                    <Link href={buildUrl({ status: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Statuses</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isStatusActive("production")}>
                    <Link href={buildUrl({ status: "production" })}>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Production</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isStatusActive("testing")}>
                    <Link href={buildUrl({ status: "testing" })}>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>Testing</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isStatusActive("development")}>
                    <Link href={buildUrl({ status: "development" })}>
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Development</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Type */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5" />
                Tool Type
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentType}>
                    <Link href={buildUrl({ type: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Types</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isTypeActive("langchain")}>
                    <Link href={buildUrl({ type: "langchain" })}>
                      <Zap className="h-4 w-4 text-purple-500" />
                      <span>LangChain Tools</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isTypeActive("api")}>
                    <Link href={buildUrl({ type: "api" })}>
                      <Cloud className="h-4 w-4 text-blue-500" />
                      <span>API Tools</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isTypeActive("function")}>
                    <Link href={buildUrl({ type: "function" })}>
                      <Workflow className="h-4 w-4 text-green-500" />
                      <span>Function Tools</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Wand2 className="h-3.5 w-3.5" />
                Actions
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/discover/tools?action=create">
                      <Plus className="h-4 w-4" />
                      <span>Create Tool</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Related */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5" />
                Related
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/discover/skills">
                      <Sparkles className="h-4 w-4" />
                      <span>Skills Registry</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents">
                      <Bot className="h-4 w-4" />
                      <span>Agents</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/workflows">
                      <Workflow className="h-4 w-4" />
                      <span>Workflows</span>
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

// ============================================================================
// SKILLS SIDEBAR CONTENT - Context-specific for /discover/skills
// ============================================================================

export function SidebarSkillsContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "overview"
  const currentCategory = searchParams.get("category") || ""
  const currentComplexity = searchParams.get("complexity") || ""
  const currentType = searchParams.get("type") || ""

  // Build URL with params (preserves existing params)
  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/discover/skills${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isCategoryActive = (category: string) => currentCategory === category
  const isComplexityActive = (complexity: string) => currentComplexity === complexity
  const isTypeActive = (type: string) => currentType === type

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Skills</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">AI agent capabilities</p>
      </div>

      {/* Views */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Views
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("overview")}>
                    <Link href={buildUrl({ view: "overview" })}>
                      <BarChart3 className="h-4 w-4" />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("grid")}>
                    <Link href={buildUrl({ view: "grid" })}>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("list")}>
                    <Link href={buildUrl({ view: "list" })}>
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("table")}>
                    <Link href={buildUrl({ view: "table" })}>
                      <Table className="h-4 w-4" />
                      <span>Table</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isViewActive("kanban")}>
                    <Link href={buildUrl({ view: "kanban" })}>
                      <Kanban className="h-4 w-4" />
                      <span>Kanban</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Browse */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5" />
                Browse
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentCategory && !currentComplexity && !currentType}>
                    <Link href={buildUrl({ category: null, complexity: null, type: null })}>
                      <BookOpen className="h-4 w-4" />
                      <span>All Skills</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Category */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5" />
                Categories
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentCategory}>
                    <Link href={buildUrl({ category: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Categories</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("analysis")}>
                    <Link href={buildUrl({ category: "analysis" })}>
                      <BarChart className="h-4 w-4 text-blue-500" />
                      <span>Analysis</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("research")}>
                    <Link href={buildUrl({ category: "research" })}>
                      <FlaskConical className="h-4 w-4 text-cyan-500" />
                      <span>Research</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("communication")}>
                    <Link href={buildUrl({ category: "communication" })}>
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span>Communication</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("reasoning")}>
                    <Link href={buildUrl({ category: "reasoning" })}>
                      <Stethoscope className="h-4 w-4 text-purple-500" />
                      <span>Reasoning</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isCategoryActive("automation")}>
                    <Link href={buildUrl({ category: "automation" })}>
                      <Workflow className="h-4 w-4 text-orange-500" />
                      <span>Automation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Complexity */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Complexity
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentComplexity}>
                    <Link href={buildUrl({ complexity: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Levels</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("basic")}>
                    <Link href={buildUrl({ complexity: "basic" })}>
                      <div className="h-4 w-4 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                      <span>Basic (1-3)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("intermediate")}>
                    <Link href={buildUrl({ complexity: "intermediate" })}>
                      <div className="h-4 w-4 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                      <span>Intermediate (4-6)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("advanced")}>
                    <Link href={buildUrl({ complexity: "advanced" })}>
                      <div className="h-4 w-4 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                      </div>
                      <span>Advanced (7-8)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isComplexityActive("expert")}>
                    <Link href={buildUrl({ complexity: "expert" })}>
                      <div className="h-4 w-4 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      </div>
                      <span>Expert (9-10)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Filter by Implementation */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5" />
                Implementation
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={!currentType}>
                    <Link href={buildUrl({ type: null })}>
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span>All Types</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isTypeActive("prompt")}>
                    <Link href={buildUrl({ type: "prompt" })}>
                      <Pen className="h-4 w-4 text-blue-500" />
                      <span>Prompt-based</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isTypeActive("tool")}>
                    <Link href={buildUrl({ type: "tool" })}>
                      <Settings className="h-4 w-4 text-purple-500" />
                      <span>Tool-based</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isTypeActive("workflow")}>
                    <Link href={buildUrl({ type: "workflow" })}>
                      <Workflow className="h-4 w-4 text-green-500" />
                      <span>Workflow-based</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-active={isTypeActive("agent_graph")}>
                    <Link href={buildUrl({ type: "agent_graph" })}>
                      <GitBranch className="h-4 w-4 text-orange-500" />
                      <span>Agent Graph</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Actions */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Wand2 className="h-3.5 w-3.5" />
                Actions
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/discover/skills?action=create">
                      <Plus className="h-4 w-4" />
                      <span>Create Skill</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Related */}
      <Collapsible className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5" />
                Related
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/discover/tools">
                      <Settings className="h-4 w-4" />
                      <span>Tools Registry</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/agents">
                      <Bot className="h-4 w-4" />
                      <span>Agents</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/prompts">
                      <FileText className="h-4 w-4" />
                      <span>Prompts Library</span>
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
