'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  HomeIcon,
  MessageSquareIcon,
  UsersIcon,
  BotIcon,
  BookOpenIcon,
  WandIcon,
  WorkflowIcon,
  SettingsIcon,
  PlusIcon,
  SearchIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// ============================================================================
// DASHBOARD SIDEBAR CONTENT
// ============================================================================
function DashboardSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Overview</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <HomeIcon className="h-4 w-4" />
                <span>Dashboard Home</span>
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
              <SidebarMenuButton>
                <PlusIcon className="h-4 w-4" />
                <span>New Conversation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BotIcon className="h-4 w-4" />
                <span>Browse Agents</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpenIcon className="h-4 w-4" />
                <span>Upload Knowledge</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Recent Items</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ChevronRightIcon className="h-4 w-4" />
                <span>Last conversation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// ASK EXPERT SIDEBAR CONTENT
// ============================================================================
function AskExpertSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Chat Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button className="w-full justify-start" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel>Chat History</SidebarGroupLabel>
        <SidebarGroupContent>
          <ScrollArea className="h-[200px]">
            <SidebarMenu>
              {[1, 2, 3, 4, 5].map((i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton>
                    <MessageSquareIcon className="h-4 w-4" />
                    <span>Chat {i}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel>Agents</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search agents..." className="pl-8" />
            </div>
          </div>
          <div className="flex gap-1 px-2 pb-2">
            <Button variant="outline" size="sm" className="flex-1">All</Button>
            <Button variant="outline" size="sm" className="flex-1">T1</Button>
            <Button variant="outline" size="sm" className="flex-1">T2</Button>
            <Button variant="outline" size="sm" className="flex-1">T3</Button>
          </div>
          <ScrollArea className="h-[250px]">
            <SidebarMenu>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton>
                    <BotIcon className="h-4 w-4" />
                    <span>Agent {i}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
          <div className="px-2 pt-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              Browse Agent Store
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <SettingsIcon className="h-4 w-4" />
                <span>Chat Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// ASK PANEL SIDEBAR CONTENT
// ============================================================================
function AskPanelSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Conversations</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <MessageSquareIcon className="h-4 w-4" />
                <span>Active Threads</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <MessageSquareIcon className="h-4 w-4" />
                <span>Pending Review</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <MessageSquareIcon className="h-4 w-4" />
                <span>Approved</span>
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
              <SidebarMenuButton>
                <UsersIcon className="h-4 w-4" />
                <span>Risk Assessment</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UsersIcon className="h-4 w-4" />
                <span>Clinical Review</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UsersIcon className="h-4 w-4" />
                <span>Monitoring</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// AGENTS SIDEBAR CONTENT
// ============================================================================
function AgentsSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Browse</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BotIcon className="h-4 w-4" />
                <span>All Agents</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BotIcon className="h-4 w-4" />
                <span>By Category</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Filter by Tier</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Platinum</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Gold</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Silver</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Bronze</span>
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
              <Button className="w-full justify-start" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Upload Agent
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// KNOWLEDGE SIDEBAR CONTENT
// ============================================================================
function KnowledgeSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Upload</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button className="w-full justify-start" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Bulk Upload
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpenIcon className="h-4 w-4" />
                <span>Medical</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpenIcon className="h-4 w-4" />
                <span>Research</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpenIcon className="h-4 w-4" />
                <span>Clinical</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Analytics</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Usage Stats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Performance</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// PROMPT PRISM SIDEBAR CONTENT
// ============================================================================
function PromptPrismSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Templates</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <WandIcon className="h-4 w-4" />
                <span>Library</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button className="w-full justify-start" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Performance</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Metrics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Analysis</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Version Control</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>History</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Compare</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// WORKFLOWS SIDEBAR CONTENT
// ============================================================================
function WorkflowsSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workflows</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <WorkflowIcon className="h-4 w-4" />
                <span>Active</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <WorkflowIcon className="h-4 w-4" />
                <span>Scheduled</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <WorkflowIcon className="h-4 w-4" />
                <span>Completed</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Performance</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Alerts</span>
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
                <span>APIs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Webhooks</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// ADMIN SIDEBAR CONTENT
// ============================================================================
function AdminSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>User Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UsersIcon className="h-4 w-4" />
                <span>Users</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Roles</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Permissions</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>System</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <SettingsIcon className="h-4 w-4" />
                <span>Configuration</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Logs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Backups</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Health</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Performance</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Alerts</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

// ============================================================================
// MAIN CONTEXTUAL SIDEBAR COMPONENT
// ============================================================================
export function ContextualSidebar() {
  const pathname = usePathname()

  // Determine which sidebar content to show based on current route
  const getSidebarContent = () => {
    if (pathname?.startsWith('/dashboard')) {
      return <DashboardSidebarContent />
    } else if (pathname?.startsWith('/ask-expert')) {
      return <AskExpertSidebarContent />
    } else if (pathname?.startsWith('/ask-panel')) {
      return <AskPanelSidebarContent />
    } else if (pathname?.startsWith('/agents')) {
      return <AgentsSidebarContent />
    } else if (pathname?.startsWith('/knowledge')) {
      return <KnowledgeSidebarContent />
    } else if (pathname?.startsWith('/prism')) {
      return <PromptPrismSidebarContent />
    } else if (pathname?.startsWith('/workflows')) {
      return <WorkflowsSidebarContent />
    } else if (pathname?.startsWith('/admin')) {
      return <AdminSidebarContent />
    }

    // Default to dashboard if no match
    return <DashboardSidebarContent />
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">VITAL</h2>
      </SidebarHeader>
      {getSidebarContent()}
      <SidebarFooter className="border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </SidebarFooter>
    </Sidebar>
  )
}
