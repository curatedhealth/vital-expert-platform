"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Activity,
  ArrowRight,
  BarChart,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
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
  Rocket,
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
  UserCheck,
  Users,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react"

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { createClient } from "@vital/sdk/client"
import { useSavedPanels } from "@/contexts/ask-panel-context"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PlusIcon,
  RefreshCwIcon,
  Loader2Icon,
  SparklesIcon,
  ChevronDown,
  Pin,
  PinOff,
  Archive,
  Trash2Icon,
  MoreVertical,
  Calendar,
} from "lucide-react"
import { TASK_DEFINITIONS, type TaskDefinition } from "@/components/langgraph-gui/TaskLibrary"
import { cn } from "@/lib/utils"

export function SidebarDashboardContent() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Overview</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Recent</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  )
}

export function SidebarAskPanelContent() {
  const { savedPanels } = useSavedPanels()

  return (
    <>
      {/* My Panels */}
      {savedPanels.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>My Panels ({savedPanels.length})</span>
          </SidebarGroupLabel>
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
        </SidebarGroup>
      )}

      {/* Panel Workflows */}
      <SidebarGroup>
        <SidebarGroupLabel>Panel Workflows</SidebarGroupLabel>
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
      </SidebarGroup>

      {/* Resources */}
      <SidebarGroup>
        <SidebarGroupLabel>Resources</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  )
}

export function SidebarDesignerContent() {
  const router = useRouter();
  const pathname = usePathname();

  // Import panel configs dynamically to avoid circular dependencies
  const [panelConfigs, setPanelConfigs] = useState<any[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [pinnedTemplates, setPinnedTemplates] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);

  // Define Ask Expert Modes (aligned with 4_MODE_SYSTEM_FINAL.md)
  const askExpertModes = [
    {
      id: 'mode-1-interactive-manual',
      name: 'Mode 1: Interactive Manual',
      description: 'Focused Expert Conversation - You select the expert and have a multi-turn conversation',
      icon: UserCheck,
      workflowId: 'mode1_ask_expert', // Links to Mode 1 workflow template
    },
    {
      id: 'mode-2-interactive-automatic',
      name: 'Mode 2: Interactive Automatic',
      description: 'Smart Expert Discussion - AI selects best expert(s) for multi-turn conversation',
      icon: Zap,
      workflowId: 'mode2_ask_expert', // Links to Mode 2 workflow template
    },
    {
      id: 'mode-3-autonomous-manual',
      name: 'Mode 3: Autonomous Manual',
      description: 'Expert-Driven Workflow - You select the expert for goal-driven autonomous execution',
      icon: Rocket,
      workflowId: 'mode3_ask_expert', // Links to Mode 3 workflow template
    },
    {
      id: 'mode-4-autonomous-automatic',
      name: 'Mode 4: Autonomous Automatic',
      description: 'AI Collaborative Workflow - AI assembles team of experts for complex goal-driven execution',
      icon: MessageSquare,
      workflowId: 'mode4_ask_expert', // Links to Mode 4 workflow template
    },
  ];

  useEffect(() => {
    // Dynamically import to avoid SSR issues
    import('@/components/langgraph-gui/panel-workflows/panel-definitions').then((module) => {
      const configs = Object.values(module.PANEL_CONFIGS).map((config: any) => ({
        id: config.id,
        name: config.name,
        description: config.description,
        icon: config.icon,
      }));
      setPanelConfigs(configs);
    });
  }, []);

  // Load pinned templates from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('designer-pinned-templates');
      if (stored) {
        setPinnedTemplates(new Set(JSON.parse(stored)));
      }
    }
  }, []);

  // Save pinned templates to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('designer-pinned-templates', JSON.stringify(Array.from(pinnedTemplates)));
    }
  }, [pinnedTemplates]);

  const handleWorkflowClick = (workflowId: string) => {
    console.log('[Sidebar] Workflow template clicked:', workflowId);

    // Check if we're already on the designer page
    const isOnDesignerPage = pathname === '/ask-panel-v1';

    if (isOnDesignerPage) {
      // Already on designer page, dispatch event immediately
      console.log('[Sidebar] Already on designer page, dispatching event immediately');
      window.dispatchEvent(new CustomEvent('designer:create-workflow', { detail: { workflowId } }));
    } else {
      // Navigate to designer page first, then dispatch event after component mounts
      console.log('[Sidebar] Navigating to designer page first');
      router.push('/ask-panel-v1');

      // Dispatch event after a short delay to ensure WorkflowBuilder is mounted
      setTimeout(() => {
        console.log('[Sidebar] Dispatching workflow create event after navigation:', workflowId);
        window.dispatchEvent(new CustomEvent('designer:create-workflow', { detail: { workflowId } }));
      }, 300);
    }
  };

  const handleNewWorkflow = () => {
    if (isCreatingWorkflow) return;
    setIsCreatingWorkflow(true);

    // Check if we're already on the designer page
    const isOnDesignerPage = pathname === '/ask-panel-v1';

    if (isOnDesignerPage) {
      // Already on designer page, dispatch event immediately
      window.dispatchEvent(new CustomEvent('designer:create-workflow', { detail: { workflowId: 'blank' } }));
      setTimeout(() => setIsCreatingWorkflow(false), 500);
    } else {
      // Navigate to designer page first
      router.push('/ask-panel-v1');

      // Dispatch event after a short delay to ensure WorkflowBuilder is mounted
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('designer:create-workflow', { detail: { workflowId: 'blank' } }));
        setIsCreatingWorkflow(false);
      }, 300);
    }
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    // Reload panel configs
    import('@/components/langgraph-gui/panel-workflows/panel-definitions').then((module) => {
      const configs = Object.values(module.PANEL_CONFIGS).map((config: any) => ({
        id: config.id,
        name: config.name,
        description: config.description,
        icon: config.icon,
      }));
      setPanelConfigs(configs);
      setIsRefreshing(false);
    });
  };

  const togglePin = (templateId: string) => {
    setPinnedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  // Filter templates by search
  const filteredTemplates = panelConfigs.filter((config) => {
    if (!templateSearch.trim()) return true;
    const searchLower = templateSearch.toLowerCase();
    return (
      config.name.toLowerCase().includes(searchLower) ||
      config.description.toLowerCase().includes(searchLower)
    );
  });

  // Separate pinned and unpinned templates
  const pinnedTemplatesList = filteredTemplates.filter(t => pinnedTemplates.has(t.id));
  const unpinnedTemplatesList = filteredTemplates.filter(t => !pinnedTemplates.has(t.id));

  // Filter library components by search
  const filteredTasks = TASK_DEFINITIONS.filter((task) => {
    if (!librarySearch.trim()) return true;
    const searchLower = librarySearch.toLowerCase();
    return (
      task.name.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      task.category.toLowerCase().includes(searchLower)
    );
  });

  // Group tasks by category
  const tasksByCategory = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, TaskDefinition[]>);

  const renderTemplateItem = (config: any) => {
    const isPinned = pinnedTemplates.has(config.id);
    const IconComponent = config.icon || Users;

    return (
      <SidebarMenuItem key={config.id}>
        <div className="group/template relative">
          <SidebarMenuButton
            onClick={() => handleWorkflowClick(config.id)}
            className={cn(
              "w-full transition-all",
              isPinned && "bg-yellow-50/50 dark:bg-yellow-900/10 border-l-2 border-l-yellow-500"
            )}
          >
            <div className="flex w-full items-center gap-2">
              <IconComponent className="h-4 w-4 shrink-0" />
              <div className="flex flex-1 flex-col items-start gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5 w-full">
                  {isPinned && <Pin className="h-3 w-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
                  <span className="text-sm font-medium truncate">{config.name}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">{config.description}</span>
              </div>
            </div>
          </SidebarMenuButton>

          {/* Quick Actions Dropdown */}
          <div className="absolute top-1 right-1 opacity-0 group-hover/template:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(config.id);
                  }}
                >
                  {isPinned ? (
                    <>
                      <PinOff className="h-3 w-3 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-3 w-3 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-red-600 dark:text-red-400">
                  <Trash2Icon className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarMenuItem>
    );
  };

  const handleModeClick = (mode: typeof askExpertModes[0]) => {
    // If mode has a workflowId, create that workflow
    if (mode.workflowId) {
      console.log('[Sidebar] Mode clicked with workflowId:', mode.workflowId);

      // Check if we're already on the designer page
      const isOnDesignerPage = pathname === '/ask-panel-v1';

      if (isOnDesignerPage) {
        // Already on designer page, dispatch event immediately
        console.log('[Sidebar] Already on designer page, dispatching event immediately');
        window.dispatchEvent(new CustomEvent('designer:create-workflow', { detail: { workflowId: mode.workflowId } }));
      } else {
        // Navigate to designer page first, then dispatch event after component mounts
        console.log('[Sidebar] Navigating to designer page first');
        router.push('/ask-panel-v1');

        // Dispatch event after a short delay to ensure WorkflowBuilder is mounted
        setTimeout(() => {
          console.log('[Sidebar] Dispatching workflow create event after navigation:', mode.workflowId);
          window.dispatchEvent(new CustomEvent('designer:create-workflow', { detail: { workflowId: mode.workflowId } }));
        }, 300);
      }
    } else {
      // Dispatch event to open documentation modal
      // Direct mapping based on mode number
      const modeDocMap: Record<string, string> = {
        'mode-1-interactive-manual': 'mode1',     // Mode 1 → Mode 1 docs
        'mode-2-interactive-automatic': 'mode2',  // Mode 2 → Mode 2 docs
        'mode-3-autonomous-manual': 'mode3',      // Mode 3 → Mode 3 docs
        'mode-4-autonomous-automatic': 'mode4',   // Mode 4 → Mode 4 docs
      };

      const docMode = modeDocMap[mode.id];
      if (docMode) {
        console.log('[Sidebar] Dispatching open mode docs event for:', mode.id, '→', docMode);

        // Navigate to designer page first if not already there
        const isOnDesignerPage = pathname === '/ask-panel-v1';
        if (!isOnDesignerPage) {
          router.push('/ask-panel-v1');
        }

        // Dispatch event after a short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('designer:open-mode-docs', { detail: { mode: docMode } }));
        }, isOnDesignerPage ? 0 : 300);
      } else {
        // Fallback: navigate to ask-expert page
        window.location.href = `/ask-expert?mode=${mode.id}`;
      }
    }
  };

  return (
    <>
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
                  <SidebarMenuButton
                    className="justify-between"
                    onClick={handleNewWorkflow}
                    disabled={isCreatingWorkflow}
                  >
                    <div className="flex items-center gap-2">
                      {isCreatingWorkflow ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                      <span>New Workflow</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="justify-between"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <div className="flex items-center gap-2">
                      {isRefreshing ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCwIcon className="h-4 w-4" />
                      )}
                      <span>Refresh</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuButton asChild>
                    <Link href="/service-templates">
                      <SparklesIcon className="h-4 w-4" />
                      <span>Browse Templates</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Modes */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Modes
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {askExpertModes.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <SidebarMenuItem key={mode.id}>
                      <SidebarMenuButton
                        onClick={() => handleModeClick(mode)}
                        className="w-full cursor-pointer"
                      >
                        <IconComponent className="h-4 w-4 shrink-0" />
                        <div className="flex flex-1 flex-col items-start gap-0.5 min-w-0">
                          <span className="text-sm font-medium truncate">{mode.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{mode.description}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Service Templates */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Service Templates
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-2">
              {/* Template Search */}
              <div className="relative px-2">
                <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search templates…"
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {panelConfigs.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <span>Loading templates…</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {panelConfigs.length > 0 && filteredTemplates.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <SearchIcon className="h-4 w-4" />
                    <span>No templates match your search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {filteredTemplates.length > 0 && (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-4">
                    {/* Pinned Templates */}
                    {pinnedTemplatesList.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 px-2 py-1">
                          <Pin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Pinned
                          </span>
                        </div>
                        <SidebarMenu>
                          {pinnedTemplatesList.map(renderTemplateItem)}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Unpinned Templates */}
                    {unpinnedTemplatesList.length > 0 && (
                      <div className="space-y-1">
                        <SidebarMenu>
                          {unpinnedTemplatesList.map(renderTemplateItem)}
                        </SidebarMenu>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Library */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Library
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={librarySearch}
                    onChange={(event) => setLibrarySearch(event.target.value)}
                    placeholder="Search components…"
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="max-h-[320px] pr-2">
                <SidebarMenu className="space-y-2">
                  {filteredTasks.length === 0 && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <SearchIcon className="h-4 w-4" />
                        <span>No components match your search</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {Object.entries(tasksByCategory)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([category, tasks]) => (
                      <div key={category} className="space-y-1">
                        <span className="pl-2 text-xs font-semibold text-muted-foreground">
                          {category}
                        </span>
                        {tasks.map((task) => (
                          <SidebarMenuItem key={task.id}>
                            <SidebarMenuButton
                              className="items-center transition-all p-2 rounded-lg"
                              onClick={() => {
                                // Dispatch event to add component to canvas
                                window.dispatchEvent(new CustomEvent('designer:add-component', {
                                  detail: { taskId: task.id, task }
                                }));
                              }}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-lg flex-shrink-0">{task.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium leading-tight break-words">
                                    {task.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {task.description}
                                  </div>
                                </div>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    ))}
                </SidebarMenu>
              </ScrollArea>
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
      <SidebarGroup>
        <SidebarGroupLabel>Browse</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Filter by Tier</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
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
      </SidebarGroup>
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
      <SidebarGroup>
        <SidebarGroupLabel>Knowledge Actions</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  )
}

export function SidebarWorkflowsContent() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Workflow Status</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Integration</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  )
}

export function SidebarSolutionBuilderContent() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Builder</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  )
}

export function SidebarPromptPrismContent() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Prompt Assets</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
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
      </SidebarGroup>
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
      <SidebarGroup>
        <SidebarGroupLabel>Overview</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>User & Access</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>AI Resources</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Analytics & Monitoring</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>LLM Management</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Capabilities & Skills</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Panel Management</SidebarGroupLabel>
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
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Organization</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  )
}

export function SidebarServiceTemplatesContent() {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    // Dynamically import service templates to avoid circular dependencies
    import('@/lib/service-templates/template-definitions').then((module) => {
      const configs = module.SERVICE_TEMPLATES.slice(0, 8).map((config: any) => ({
        id: config.id,
        name: config.name,
        description: config.description,
        category: config.category,
        icon: config.icon,
        timeToValue: config.timeToValue,
        route: config.route,
      }));
      setTemplates(configs);
    });
  }, []);

  return (
    <>
      {/* Quick Start */}
      <SidebarGroup>
        <SidebarGroupLabel>Quick Start</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/service-templates">
                  <Sparkles className="h-4 w-4" />
                  <span>Browse All Templates</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Popular Templates */}
      <SidebarGroup>
        <SidebarGroupLabel>Popular Templates</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {templates.map((template) => {
              const IconComponent = template.icon || Users;
              return (
                <SidebarMenuItem key={template.id}>
                  <SidebarMenuButton
                    asChild
                    className="w-full cursor-pointer"
                  >
                    <Link href={template.route || '/service-templates'}>
                      <IconComponent className="h-4 w-4" />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium truncate">{template.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {template.category} • {template.timeToValue}
                        </div>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Categories */}
      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/service-templates?category=advisory">
                  <MessageSquare className="h-4 w-4" />
                  <span>Advisory Services</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/service-templates?category=workflow">
                  <Workflow className="h-4 w-4" />
                  <span>Workflows</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/service-templates?category=analysis">
                  <SearchIcon className="h-4 w-4" />
                  <span>Analysis</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/service-templates?category=research">
                  <BookOpen className="h-4 w-4" />
                  <span>Research</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
