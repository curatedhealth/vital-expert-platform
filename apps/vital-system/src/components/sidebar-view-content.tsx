"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  ArrowRight,
  BarChart,
  BookOpen,
  Bot,
  Building2,
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
  Pen,
  Puzzle,
  SearchIcon,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Star,
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

export function SidebarValueContent() {
  const [ontologyStats, setOntologyStats] = useState({
    functions: 0,
    roles: 0,
    personas: 0,
    agents: 0,
    coverage: 0,
  });
  const [selectedFunction, setSelectedFunction] = useState<string>('all');
  const [functions, setFunctions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOntologyData = async () => {
      try {
        setLoading(true);
        // Fetch hierarchy data for stats
        const res = await fetch('/api/ontology-investigator/hierarchy');
        if (res.ok) {
          const data = await res.json();
          // Map response - summary has aggregated counts, layers has detailed data
          setOntologyStats({
            functions: data.summary?.total_functions || data.layers?.L1_functions?.count || 0,
            roles: data.summary?.total_roles || data.layers?.L3_roles?.count || 0,
            personas: data.summary?.total_personas || data.layers?.L4_personas?.count || 0,
            agents: data.summary?.total_agents || data.layers?.L7_agents?.count || 0,
            coverage: data.summary?.coverage_percentage || 0,
          });

          // Extract function names for filter - API returns functions array
          if (data.functions && Array.isArray(data.functions)) {
            setFunctions(data.functions.map((f: any) => ({
              id: f.id || f.slug || '',
              name: f.name || 'Unknown'
            })));
          } else if (data.layers?.L1_functions?.data) {
            // Fallback to layers data if functions not directly in response
            setFunctions(data.layers.L1_functions.data.map((f: any) => ({
              id: f.id || f.slug || '',
              name: f.name || 'Unknown'
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching ontology stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOntologyData();
  }, []);

  // Dispatch filter change event
  const handleFunctionFilter = (funcId: string) => {
    setSelectedFunction(funcId);
    window.dispatchEvent(new CustomEvent('value-filter-change', {
      detail: { function: funcId }
    }));
  };

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
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-blue-700">{ontologyStats.functions}</p>
                        <p className="text-xs text-blue-600">Functions</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-green-700">{ontologyStats.roles}</p>
                        <p className="text-xs text-green-600">Roles</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-purple-700">{ontologyStats.personas}</p>
                        <p className="text-xs text-purple-600">Personas</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-orange-700">{ontologyStats.agents}</p>
                        <p className="text-xs text-orange-600">AI Agents</p>
                      </div>
                    </div>
                    {/* Coverage Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">AI Coverage</span>
                        <span className="font-medium">{ontologyStats.coverage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${ontologyStats.coverage}%` }}
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

      {/* Filter by Function */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                Filter by Function
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleFunctionFilter('all')}
                    isActive={selectedFunction === 'all'}
                  >
                    <LayersIcon className="h-4 w-4" />
                    <span>All Functions</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {ontologyStats.functions}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {functions.slice(0, 8).map((func) => (
                  <SidebarMenuItem key={func.id}>
                    <SidebarMenuButton
                      onClick={() => handleFunctionFilter(func.id)}
                      isActive={selectedFunction === func.id}
                    >
                      <Building2 className="h-4 w-4" />
                      <span className="truncate">{func.name}</span>
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
              <div className="px-3 py-2 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Ask the AI Companion about:
                </p>
                {[
                  { text: 'What roles need AI agents?', icon: Target },
                  { text: 'Show coverage gaps by function', icon: Shield },
                  { text: 'Top AI transformation opportunities', icon: TrendingUp },
                  { text: 'How are personas distributed?', icon: Users },
                ].map((suggestion, idx) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={idx}
                      className="w-full text-left p-2 text-xs bg-muted/50 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('value-ai-suggestion', {
                          detail: { question: suggestion.text }
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
