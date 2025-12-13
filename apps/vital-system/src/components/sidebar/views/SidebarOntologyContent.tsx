"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  BarChart3,
  Bot,
  Building2,
  ClipboardList,
  Database,
  FolderOpen,
  GitBranch,
  LayoutGrid,
  Layers,
  Layers as LayersIcon,
  Network,
  Puzzle,
  Table as TableIcon,
  Target,
  TrendingUp,
  User,
  Users,
  Workflow,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

// Ontology node type definitions
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

// 8-layer ontology structure
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

/**
 * Ontology Explorer sidebar content.
 * Displays 8-layer enterprise ontology navigation with node types, layers, and views.
 * [PROD] - Production ready
 */
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
      {/* Title - VITAL Brand v6.0: Purple accent */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          <span className="text-base font-semibold text-stone-800">Ontology Explorer</span>
        </div>
        <p className="text-xs text-stone-500 mt-1 ml-7">8-layer enterprise ontology</p>
      </div>

      {/* Views */}
      <SidebarCollapsibleSection title="Views" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Node Types */}
      <SidebarCollapsibleSection
        title="Node Types"
        defaultOpen
        badge={currentNodeType !== "all" ? 1 : undefined}
      >
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
      </SidebarCollapsibleSection>

      {/* Ontology Layers */}
      <SidebarCollapsibleSection
        title="Ontology Layers"
        defaultOpen={false}
        badge={currentLayer ? 1 : undefined}
      >
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
      </SidebarCollapsibleSection>

      {/* Quick Actions */}
      <SidebarCollapsibleSection title="Quick Actions" defaultOpen>
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
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarOntologyContent
