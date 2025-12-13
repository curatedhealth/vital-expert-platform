"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  Layers as LayersIcon,
  List,
  Settings,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Jobs-to-Be-Done sidebar content.
 * Displays ODI-scored job statements with filtering by priority, status, and job type.
 * [PROD] - Production ready
 */
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
      {/* Title - VITAL Brand v6.0: Purple accent */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <span className="text-base font-semibold text-stone-800">Jobs-to-Be-Done</span>
        </div>
        <p className="text-xs text-stone-500 mt-1 ml-7">ODI-scored job statements</p>
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
            <SidebarMenuButton asChild data-active={isViewActive("categories")}>
              <Link href={buildUrl({ view: "categories" })}>
                <LayersIcon className="h-4 w-4" />
                <span>By Category</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* ODI Priority Filter */}
      <SidebarCollapsibleSection title="ODI Priority" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Status Filter */}
      <SidebarCollapsibleSection title="Status" defaultOpen={false}>
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
      </SidebarCollapsibleSection>

      {/* Job Type Filter */}
      <SidebarCollapsibleSection title="Job Type" defaultOpen={false}>
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
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarJTBDContent
