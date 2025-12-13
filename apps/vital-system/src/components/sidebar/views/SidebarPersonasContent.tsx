"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  LayoutGrid,
  Layers as LayersIcon,
  List,
  Network,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Personas sidebar content.
 * Displays MECE persona archetypes with filtering by view, archetype, and seniority.
 * [PROD] - Production ready
 */
export function SidebarPersonasContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "grid"
  const currentArchetype = searchParams.get("archetype") || ""
  const currentSeniority = searchParams.get("seniority") || ""

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
      {/* Title - VITAL Brand v6.0: Purple accent */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          <span className="text-base font-semibold text-stone-800">Personas</span>
        </div>
        <p className="text-xs text-stone-500 mt-1 ml-7">MECE user archetypes</p>
      </div>

      {/* Views */}
      <SidebarCollapsibleSection title="Views" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Archetypes Filter */}
      <SidebarCollapsibleSection title="Archetypes" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentArchetype}>
              <Link href={buildUrl({ archetype: null })}>
                <CheckCircle2 className="h-4 w-4 text-stone-500" />
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
      </SidebarCollapsibleSection>

      {/* Seniority Filter */}
      <SidebarCollapsibleSection title="Seniority" defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentSeniority}>
              <Link href={buildUrl({ seniority: null })}>
                <CheckCircle2 className="h-4 w-4 text-stone-500" />
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
                <User className="h-4 w-4 text-stone-500" />
                <span>Entry</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarPersonasContent
