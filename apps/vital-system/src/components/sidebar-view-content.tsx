"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowRight,
  BarChart,
  BookOpen,
  Bot,
  Box,
  Building2,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  DollarSign,
  FileText,
  FolderOpen,
  History,
  Home,
  Layers,
  LineChart,
  MessageSquare,
  Network,
  Pen,
  Play,
  Puzzle,
  Search,
  SearchIcon,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
  User,
  Users,
  Wand2,
  Workflow,
  Wrench,
  Zap,
  Palette,
  GitBranch,
  Layers as LayersIcon,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@vital/sdk/client"
import { useSavedPanels } from "@/contexts/ask-panel-context"
import { useDesigner } from "@/contexts/designer-context"

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
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Users className="h-4 w-4" />
                    <span>Expert Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approvals</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Compliance Review</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
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

export function SidebarAgentsContent() {
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Browse
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Star className="h-4 w-4" />
                    <span>Featured</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <TrendingUp className="h-4 w-4" />
                    <span>Popular</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <History className="h-4 w-4" />
                    <span>Recently Added</span>
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
              Filter by Tier
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {["Expert", "Advanced", "Standard"].map((label) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton>
                      <Target className="h-4 w-4" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
                  <SidebarMenuButton asChild>
                    <Link href="/agents/create">
                      <Wand2 className="h-4 w-4" />
                      <span>Create Agent</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Manage Agents</span>
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

export function SidebarKnowledgeContent() {
  const [categories, setCategories] = useState<Array<{ function_id: string; function_name: string; domains: Array<{ domain_id: string; domain_name: string }> }>>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        // Fetch domains from new architecture
        const { data: newData, error: newError } = await supabase
          .from('knowledge_domains_new')
          .select('domain_id, domain_name, function_id, function_name, tier')
          .eq('is_active', true)
          .order('function_id')
          .order('tier')
          .order('priority')

        if (!newError && newData && newData.length > 0) {
          // Group by function_id
          const grouped = newData.reduce((acc: any, domain: any) => {
            const funcId = domain.function_id || 'general'
            const funcName = domain.function_name || 'General'
            
            if (!acc[funcId]) {
              acc[funcId] = {
                function_id: funcId,
                function_name: funcName,
                domains: []
              }
            }
            
            acc[funcId].domains.push({
              domain_id: domain.domain_id,
              domain_name: domain.domain_name || domain.domain_id
            })
            
            return acc
          }, {})

          setCategories(Object.values(grouped))
          setLoading(false)
          return
        }

        // Fallback: try old table and group by common patterns
        const { data: oldData, error: oldError } = await supabase
          .from('knowledge_domains')
          .select('slug, name, tier')
          .eq('is_active', true)
          .order('priority')

        if (!oldError && oldData && oldData.length > 0) {
          // Map old data to function-based groups
          const functionMap: Record<string, string> = {
            'regulatory': 'Regulatory & Compliance',
            'clinical': 'Clinical Development',
            'market': 'Market Access',
            'research': 'Research & Development',
          }

          const grouped = oldData.reduce((acc: any, domain: any) => {
            // Try to infer function from slug/name
            const slug = domain.slug?.toLowerCase() || ''
            const name = domain.name?.toLowerCase() || ''
            
            let funcId = 'general'
            let funcName = 'General'
            
            for (const [key, value] of Object.entries(functionMap)) {
              if (slug.includes(key) || name.includes(key)) {
                funcId = key
                funcName = value
                break
              }
            }
            
            if (!acc[funcId]) {
              acc[funcId] = {
                function_id: funcId,
                function_name: funcName,
                domains: []
              }
            }
            
            acc[funcId].domains.push({
              domain_id: domain.slug,
              domain_name: domain.name || domain.slug
            })
            
            return acc
          }, {})

          setCategories(Object.values(grouped))
        }
      } catch (err) {
        console.error('Error fetching knowledge categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // If we have categories from new architecture, show them grouped by function
  // Otherwise show a simple list
  const displayCategories = categories.length > 0 
    ? categories 
    : [{ function_id: 'general', function_name: 'Categories', domains: [] }]

  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Knowledge Actions
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
                  <SidebarMenuButton>
                    <SearchIcon className="h-4 w-4" />
                    <span>Search Library</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FolderOpen className="h-4 w-4" />
                    <span>Organize Collections</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/knowledge?tab=library">
                      <FileText className="h-4 w-4" />
                      <span>Documents Library</span>
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
              Categories
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {loading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">Loading categories...</div>
              ) : categories.length > 0 ? (
                // Show function-based groups
                <SidebarMenu>
                  {categories.map((category) => (
                    <SidebarMenuItem key={category.function_id}>
                      <div className="px-3 py-1.5">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          {category.function_name}
                        </div>
                        <div className="space-y-0.5">
                          {category.domains.slice(0, 5).map((domain) => (
                            <SidebarMenuButton
                              key={domain.domain_id}
                              asChild
                              className="h-7 text-xs pl-4"
                            >
                              <Link href={`/knowledge?domain=${domain.domain_id}`}>
                                <FolderOpen className="h-3 w-3" />
                                <span className="truncate">{domain.domain_name}</span>
                              </Link>
                            </SidebarMenuButton>
                          ))}
                          {category.domains.length > 5 && (
                            <div className="text-xs text-muted-foreground pl-4">
                              +{category.domains.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : (
                // Fallback: show default categories
                <SidebarMenu>
                  {["Regulatory", "Clinical", "Market", "Research"].map((label) => (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton>
                        <FolderOpen className="h-4 w-4" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
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
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Prompt Assets
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Pen className="h-4 w-4" />
                    <span>Prompt Library</span>
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
                    <Wand2 className="h-4 w-4" />
                    <span>Create Prompt</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Prompt Settings</span>
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
  // Dynamic import to avoid SSR issues
  const [PersonaFiltersSidebar, setPersonaFiltersSidebar] = useState<React.ComponentType<any> | null>(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedRole: 'all',
    selectedDepartment: 'all',
    selectedFunction: 'all',
    selectedSeniority: 'all',
  });
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    import('@/components/personas/PersonaFiltersSidebar').then((mod) => {
      setPersonaFiltersSidebar(() => mod.PersonaFiltersSidebar);
    });
  }, []);

  // Listen for filter updates from the page
  useEffect(() => {
    const handleFilterUpdate = (e: CustomEvent) => {
      setFilters(e.detail.filters);
      setFilteredCount(e.detail.filteredCount);
      setTotalCount(e.detail.totalCount);
    };

    window.addEventListener('personas-filters-update' as any, handleFilterUpdate);
    return () => {
      window.removeEventListener('personas-filters-update' as any, handleFilterUpdate);
    };
  }, []);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Dispatch event to update the page
    window.dispatchEvent(new CustomEvent('personas-filters-change', { detail: { filters: newFilters } }));
  };

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
                  <SidebarMenuButton asChild>
                    <Link href="/personas">
                      <Users className="h-4 w-4" />
                      <span>All Personas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {PersonaFiltersSidebar && (
        <div className="mt-4">
          <PersonaFiltersSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            filteredCount={filteredCount}
            totalCount={totalCount}
          />
        </div>
      )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [libraryActiveCategory, setLibraryActiveCategory] = useState<string>('all');

  // Import built-in node types
  const NODE_TYPE_DEFINITIONS = {
    start: { type: 'start', label: 'Start', description: 'Entry point of the workflow', icon: '▶️', color: '#10b981', bgColor: '#d1fae5', category: 'flow' },
    end: { type: 'end', label: 'End', description: 'Exit point of the workflow', icon: '🏁', color: '#ef4444', bgColor: '#fee2e2', category: 'flow' },
    agent: { type: 'agent', label: 'Agent', description: 'AI agent that processes information', icon: '🤖', color: '#8b5cf6', bgColor: '#ede9fe', category: 'agent' },
    tool: { type: 'tool', label: 'Tool', description: 'Execute a specific function or API call', icon: '🔧', color: '#3b82f6', bgColor: '#dbeafe', category: 'tool' },
    condition: { type: 'condition', label: 'Condition', description: 'Branch based on conditions', icon: '🔀', color: '#f59e0b', bgColor: '#fef3c7', category: 'control' },
    parallel: { type: 'parallel', label: 'Parallel', description: 'Execute multiple nodes in parallel', icon: '⚡', color: '#06b6d4', bgColor: '#cffafe', category: 'control' },
    human: { type: 'human', label: 'Human Input', description: 'Pause for human input', icon: '👤', color: '#ec4899', bgColor: '#fce7f3', category: 'control' },
    subgraph: { type: 'subgraph', label: 'Subgraph', description: 'Nested workflow', icon: '📦', color: '#8b5cf6', bgColor: '#ede9fe', category: 'control' },
    orchestrator: { type: 'orchestrator', label: 'Orchestrator', description: 'Coordinate multiple agents', icon: '🎯', color: '#8b5cf6', bgColor: '#ede9fe', category: 'agent' },
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Fetch custom nodes from database library
  const { data: nodesData, isLoading, error } = useQuery({
    queryKey: ['nodeLibrary', libraryActiveCategory, librarySearchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (libraryActiveCategory !== 'all') {
        params.append('category', libraryActiveCategory);
      }
      if (librarySearchQuery) {
        params.append('search', librarySearchQuery);
      }
      params.append('is_builtin', 'false'); // Only fetch CUSTOM nodes, not built-in
      params.append('is_public', 'true');
      params.append('limit', '200');
      
      const response = await fetch(`/api/nodes?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch nodes');
      }
      return response.json();
    },
  });

  const customNodes = nodesData?.nodes || [];
  
  // Filter built-in nodes based on search and category
  const filteredBuiltInNodes = Object.values(NODE_TYPE_DEFINITIONS).filter(nodeDef => {
    const matchesSearch = searchQuery === '' || 
      nodeDef.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nodeDef.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || nodeDef.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Helper to get icon color based on node type
  const getNodeColor = (nodeType: string) => {
    const colors: Record<string, { color: string; bgColor: string }> = {
      start: { color: '#10b981', bgColor: '#d1fae5' },
      end: { color: '#ef4444', bgColor: '#fee2e2' },
      agent: { color: '#8b5cf6', bgColor: '#ede9fe' },
      tool: { color: '#3b82f6', bgColor: '#dbeafe' },
      condition: { color: '#f59e0b', bgColor: '#fef3c7' },
      parallel: { color: '#06b6d4', bgColor: '#cffafe' },
      control: { color: '#ec4899', bgColor: '#fce7f3' },
      orchestrator: { color: '#8b5cf6', bgColor: '#ede9fe' },
      ai_agents: { color: '#8b5cf6', bgColor: '#ede9fe' },
      data_processing: { color: '#3b82f6', bgColor: '#dbeafe' },
      research: { color: '#10b981', bgColor: '#d1fae5' },
    };
    return colors[nodeType] || { color: '#6b7280', bgColor: '#f3f4f6' };
  };

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

      {/* Node Palette - Built-in React Flow Components */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Node Palette</span>
              </div>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* Search */}
              <div className="px-2 py-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search built-in nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Category Filter Buttons */}
              <div className="px-2 pb-2">
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveCategory('all')}
                    className="h-7 text-xs px-2"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={activeCategory === 'flow' ? 'default' : 'outline'}
                    onClick={() => setActiveCategory('flow')}
                    className="h-7 text-xs px-2"
                  >
                    Flow
                  </Button>
                  <Button
                    size="sm"
                    variant={activeCategory === 'agent' ? 'default' : 'outline'}
                    onClick={() => setActiveCategory('agent')}
                    className="h-7 text-xs px-2"
                  >
                    Agent
                  </Button>
                  <Button
                    size="sm"
                    variant={activeCategory === 'tool' ? 'default' : 'outline'}
                    onClick={() => setActiveCategory('tool')}
                    className="h-7 text-xs px-2"
                  >
                    Tool
                  </Button>
                  <Button
                    size="sm"
                    variant={activeCategory === 'control' ? 'default' : 'outline'}
                    onClick={() => setActiveCategory('control')}
                    className="h-7 text-xs px-2"
                  >
                    Control
                  </Button>
                </div>
              </div>

              {/* Built-in Node List */}
              <div className="px-2 space-y-2 max-h-[400px] overflow-y-auto">
                {filteredBuiltInNodes.map((nodeDef) => {
                  const colors = getNodeColor(nodeDef.type);
                  
                  return (
                    <div
                      key={nodeDef.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, nodeDef.type)}
                      className="group relative flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
                      style={{
                        backgroundColor: colors.bgColor,
                        borderColor: colors.color + '40',
                      }}
                    >
                      {/* Icon */}
                      <div 
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: colors.color + '20' }}
                      >
                        {nodeDef.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {nodeDef.label}
                          </p>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1 py-0"
                          >
                            {nodeDef.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {nodeDef.description}
                        </p>
                      </div>
                      
                      {/* Drag Indicator */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredBuiltInNodes.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No built-in nodes found
                  </div>
                )}
              </div>
              
              {/* Info Tip */}
              {filteredBuiltInNodes.length > 0 && (
                <div className="mt-3 mx-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Standard:</strong> Drag these built-in nodes to build your workflow
                  </p>
                </div>
              )}
              
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Node Library - Custom Nodes from Database */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                <span>Node Library</span>
                {customNodes.length > 0 && (
                  <Badge variant="secondary" className="ml-auto mr-2 text-[10px] px-1.5 py-0">
                    {customNodes.length}
                  </Badge>
                )}
              </div>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* Search */}
              <div className="px-2 py-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search custom nodes..."
                    value={librarySearchQuery}
                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Category Filter Buttons */}
              <div className="px-2 pb-2">
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant={libraryActiveCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setLibraryActiveCategory('all')}
                    className="h-7 text-xs px-2"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={libraryActiveCategory === 'ai_agents' ? 'default' : 'outline'}
                    onClick={() => setLibraryActiveCategory('ai_agents')}
                    className="h-7 text-xs px-2"
                  >
                    AI Agents
                  </Button>
                  <Button
                    size="sm"
                    variant={libraryActiveCategory === 'data_processing' ? 'default' : 'outline'}
                    onClick={() => setLibraryActiveCategory('data_processing')}
                    className="h-7 text-xs px-2"
                  >
                    Data
                  </Button>
                  <Button
                    size="sm"
                    variant={libraryActiveCategory === 'research' ? 'default' : 'outline'}
                    onClick={() => setLibraryActiveCategory('research')}
                    className="h-7 text-xs px-2"
                  >
                    Research
                  </Button>
                </div>
              </div>

              {/* Custom Node List */}
              <div className="px-2 space-y-2 max-h-[400px] overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-xs text-muted-foreground">Loading custom nodes...</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-xs text-red-600 p-2 bg-red-50 rounded-md border border-red-200">
                    Failed to load custom nodes
                  </div>
                )}
                
                {!isLoading && !error && customNodes.length === 0 && (
                  <div className="text-center py-8">
                    <Box className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">No custom nodes yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create your first custom node!</p>
                  </div>
                )}
                
                {!isLoading && !error && customNodes.map((node: any) => {
                  const colors = getNodeColor(node.node_category || node.node_type);
                  
                  return (
                    <div
                      key={node.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.node_slug)}
                      className="group relative flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
                      style={{
                        backgroundColor: colors.bgColor,
                        borderColor: colors.color + '40',
                      }}
                    >
                      {/* Icon */}
                      <div 
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: colors.color + '20' }}
                      >
                        {node.icon || '🔧'}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {node.display_name}
                          </p>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1 py-0"
                          >
                            {node.node_category || node.node_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {node.description || node.node_type}
                        </p>
                      </div>
                      
                      {/* Drag Indicator */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Info Tip */}
              {!isLoading && !error && customNodes.length > 0 && (
                <div className="mt-3 mx-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-800">
                    <strong>Custom:</strong> Your library grows as you create new nodes
                  </p>
                </div>
              )}
              
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
