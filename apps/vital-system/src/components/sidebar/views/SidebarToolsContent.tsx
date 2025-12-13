"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Cloud,
  FlaskConical,
  FolderOpen,
  HeartPulse,
  Kanban,
  LayoutDashboard,
  LayoutGrid,
  List,
  Plus,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Table,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Tools sidebar content.
 * Displays healthcare AI tools registry with filtering by category, lifecycle, and type.
 * [PROD] - Production ready
 */
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
            <SidebarMenuButton asChild data-active={!currentCategory && !currentStatus && !currentType}>
              <Link href={buildUrl({ category: null, status: null, type: null })}>
                <BookOpen className="h-4 w-4" />
                <span>All Tools</span>
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
      </SidebarCollapsibleSection>

      {/* Filter by Lifecycle */}
      <SidebarCollapsibleSection title="Lifecycle" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Filter by Type */}
      <SidebarCollapsibleSection title="Tool Type" defaultOpen={false}>
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
      </SidebarCollapsibleSection>

      {/* Actions */}
      <SidebarCollapsibleSection title="Actions" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Related */}
      <SidebarCollapsibleSection title="Related" defaultOpen={false}>
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
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarToolsContent
