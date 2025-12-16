"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  Eye,
  FileEdit,
  FlaskConical,
  Kanban,
  LayoutGrid,
  Lightbulb,
  List,
  Plus,
  Search,
  Settings,
  Table,
  Target,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Missions sidebar content.
 * Displays mission templates with filtering by family, complexity, and view mode.
 * [PROD] - Production ready
 */
export function SidebarMissionsContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "grid"
  const currentFamily = searchParams.get("family") || ""
  const currentComplexity = searchParams.get("complexity") || ""

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
    return `/missions${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isFamilyActive = (family: string) => currentFamily === family
  const isComplexityActive = (complexity: string) => currentComplexity === complexity

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Missions</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">AI mission templates</p>
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
            <SidebarMenuButton asChild data-active={isViewActive("table")}>
              <Link href={buildUrl({ view: "table" })}>
                <Table className="h-4 w-4" />
                <span>Table</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Browse */}
      <SidebarCollapsibleSection title="Browse" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentFamily && !currentComplexity}>
              <Link href={buildUrl({ family: null, complexity: null })}>
                <BookOpen className="h-4 w-4" />
                <span>All Missions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Filter by Family */}
      <SidebarCollapsibleSection title="Families" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentFamily}>
              <Link href={buildUrl({ family: null })}>
                <CheckCircle2 className="h-4 w-4 text-stone-500" />
                <span>All Families</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("DEEP_RESEARCH")}>
              <Link href={buildUrl({ family: "DEEP_RESEARCH" })}>
                <FlaskConical className="h-4 w-4 text-purple-500" />
                <span>Deep Research</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("EVALUATION")}>
              <Link href={buildUrl({ family: "EVALUATION" })}>
                <BarChart3 className="h-4 w-4 text-violet-500" />
                <span>Evaluation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("INVESTIGATION")}>
              <Link href={buildUrl({ family: "INVESTIGATION" })}>
                <Search className="h-4 w-4 text-red-500" />
                <span>Investigation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("STRATEGY")}>
              <Link href={buildUrl({ family: "STRATEGY" })}>
                <Target className="h-4 w-4 text-amber-500" />
                <span>Strategy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("PREPARATION")}>
              <Link href={buildUrl({ family: "PREPARATION" })}>
                <FileEdit className="h-4 w-4 text-indigo-500" />
                <span>Preparation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("MONITORING")}>
              <Link href={buildUrl({ family: "MONITORING" })}>
                <Eye className="h-4 w-4 text-cyan-500" />
                <span>Monitoring</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("PROBLEM_SOLVING")}>
              <Link href={buildUrl({ family: "PROBLEM_SOLVING" })}>
                <Lightbulb className="h-4 w-4 text-emerald-500" />
                <span>Problem Solving</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isFamilyActive("GENERIC")}>
              <Link href={buildUrl({ family: "GENERIC" })}>
                <Settings className="h-4 w-4 text-stone-500" />
                <span>Generic</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Filter by Complexity */}
      <SidebarCollapsibleSection title="Complexity" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentComplexity}>
              <Link href={buildUrl({ complexity: null })}>
                <CheckCircle2 className="h-4 w-4 text-stone-500" />
                <span>All Levels</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isComplexityActive("low")}>
              <Link href={buildUrl({ complexity: "low" })}>
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <span>Low</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isComplexityActive("medium")}>
              <Link href={buildUrl({ complexity: "medium" })}>
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                </div>
                <span>Medium</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isComplexityActive("high")}>
              <Link href={buildUrl({ complexity: "high" })}>
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                <span>High</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isComplexityActive("critical")}>
              <Link href={buildUrl({ complexity: "critical" })}>
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <span>Critical</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Related */}
      <SidebarCollapsibleSection title="Related" defaultOpen={false}>
        <SidebarMenu>
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
              <Link href="/discover/skills">
                <Settings className="h-4 w-4" />
                <span>Skills Registry</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarMissionsContent
