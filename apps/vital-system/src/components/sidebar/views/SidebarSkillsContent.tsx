"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  BarChart,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  FileText,
  FlaskConical,
  FolderOpen,
  GitBranch,
  Kanban,
  LayoutDashboard,
  LayoutGrid,
  List,
  MessageSquare,
  Pen,
  Plus,
  Server,
  Settings,
  Sparkles,
  Stethoscope,
  Table,
  TrendingUp,
  Wand2,
  Workflow,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Skills sidebar content.
 * Displays AI agent capabilities with filtering by category, complexity, and implementation.
 * [PROD] - Production ready
 */
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
      <SidebarCollapsibleSection title="Views" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Browse */}
      <SidebarCollapsibleSection title="Browse" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Filter by Category */}
      <SidebarCollapsibleSection title="Categories" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Filter by Complexity */}
      <SidebarCollapsibleSection title="Complexity" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Filter by Implementation */}
      <SidebarCollapsibleSection title="Implementation" defaultOpen={false}>
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
      </SidebarCollapsibleSection>

      {/* Actions */}
      <SidebarCollapsibleSection title="Actions" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Related */}
      <SidebarCollapsibleSection title="Related" defaultOpen={false}>
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
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarSkillsContent
