"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  FlaskConical,
  FolderOpen,
  Kanban,
  LayoutDashboard,
  LayoutGrid,
  Layers as LayersIcon,
  List,
  Pen,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Table,
  Target,
  Users,
  Wand2,
  Zap,
} from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

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
] as const

/**
 * Prompt PRISM sidebar content.
 * Displays healthcare prompt templates organized by PRISM™ suites with filtering.
 * [PROD] - Production ready
 */
export function SidebarPromptPrismContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "overview"
  const currentSuite = searchParams.get("suite") || ""
  const currentComplexity = searchParams.get("complexity") || ""

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

      {/* Browse Hierarchy */}
      <SidebarCollapsibleSection title="Browse" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* PRISM Suites Filter */}
      <SidebarCollapsibleSection title="PRISM™ Suites" defaultOpen>
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
      </SidebarCollapsibleSection>

      {/* Complexity Filter */}
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
      </SidebarCollapsibleSection>

      {/* Actions */}
      <SidebarCollapsibleSection title="Actions" defaultOpen>
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
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarPromptPrismContent
