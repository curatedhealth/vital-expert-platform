'use client'

import { usePathname } from 'next/navigation'
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
  useSidebar,
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
  Wand2Icon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  RefreshCw,
  PlusCircle,
  Star,
  Check,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useAskExpert } from '@/contexts/ask-expert-context'
import { useMemo, useState } from 'react'
import { cn } from '@/shared/services/utils'
import { ViewSelector } from './view-selector'

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
  const {
    agents,
    agentsLoading,
    selectedAgents,
    setSelectedAgents,
    sessions,
    sessionsLoading,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    refreshSessions,
  } = useAskExpert()

  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredAgents = useMemo(() => {
    if (!searchTerm) return agents
    const query = searchTerm.toLowerCase()
    return agents.filter(
      (agent) =>
        agent.displayName.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query)
    )
  }, [agents, searchTerm])

  const handleToggleAgent = (agentId: string) => {
    setSelectedAgents(
      selectedAgents.includes(agentId)
        ? selectedAgents.filter((id) => id !== agentId)
        : [...selectedAgents, agentId]
    )
  }

  const handleNewChat = async () => {
    if (isCreatingChat) return
    try {
      setIsCreatingChat(true)
      const newId = await createNewSession({
        agentId: selectedAgents[0],
        title: 'New Conversation',
      })
      window.dispatchEvent(
        new CustomEvent('ask-expert:new-chat', {
          detail: { sessionId: newId, title: 'New Conversation' },
        })
      )
    } catch (error) {
      console.error('❌ [AskExpertSidebar] Failed to create new chat:', error)
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    const session = sessions.find((s) => s.sessionId === sessionId)
    window.dispatchEvent(
      new CustomEvent('ask-expert:open-chat', {
        detail: {
          sessionId,
          title: session?.agent?.name,
        },
      })
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      return ''
    }

    const diff = Date.now() - date.getTime()
    if (diff < 60_000) return 'Just now'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hrs ago`
    return date.toLocaleDateString()
  }

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Chat Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2">
            <Button
              className="w-full justify-start"
              size="sm"
              onClick={handleNewChat}
              disabled={isCreatingChat}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {isCreatingChat ? 'Creating…' : 'New Chat'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleRefreshSessions}
              disabled={sessionsLoading || isRefreshing}
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4 mr-2',
                  (sessionsLoading || isRefreshing) && 'animate-spin'
                )}
              />
              {sessionsLoading || isRefreshing ? 'Refreshing…' : 'Refresh History'}
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel>Chat History</SidebarGroupLabel>
        <SidebarGroupContent>
          <ScrollArea className="h-[200px]">
            <SidebarMenu>
              {sessionsLoading && (
                <SidebarMenuItem>
                  <div className="py-4 text-sm text-muted-foreground">Loading chats…</div>
                </SidebarMenuItem>
              )}
              {!sessionsLoading && sessions.length === 0 && (
                <SidebarMenuItem>
                  <div className="py-4 text-sm text-muted-foreground">
                    No chats yet. Start a new conversation.
                  </div>
                </SidebarMenuItem>
              )}
              {sessions.map((session) => (
                <SidebarMenuItem key={session.sessionId}>
                  <SidebarMenuButton
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-sm',
                      activeSessionId === session.sessionId
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => handleSelectSession(session.sessionId)}
                  >
                    <MessageSquareIcon className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="font-medium">
                        {session.agent?.name || 'Conversation'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(session.lastMessage)} · {session.messageCount} message
                        {session.messageCount === 1 ? '' : 's'}
                      </span>
                    </div>
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
          <div className="space-y-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                className="pl-8"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/agents">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Browse Agent Store
                </Link>
              </Button>
              <Button asChild size="sm" className="justify-start">
                <Link href="/agents/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Agent
                </Link>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedAgents.length} agent{selectedAgents.length === 1 ? '' : 's'} selected
            </div>
          </div>
          <ScrollArea className="mt-3 h-[250px]">
            <SidebarMenu>
              {agentsLoading && (
                <SidebarMenuItem>
                  <div className="py-4 text-sm text-muted-foreground">Loading agents…</div>
                </SidebarMenuItem>
              )}
              {!agentsLoading && filteredAgents.length === 0 && (
                <SidebarMenuItem>
                  <div className="py-4 text-sm text-muted-foreground">
                    No agents found. Try adjusting your search.
                  </div>
                </SidebarMenuItem>
              )}
              {filteredAgents.map((agent) => {
                const isSelected = selectedAgents.includes(agent.id)
                return (
                  <SidebarMenuItem key={agent.id}>
                    <button
                      type="button"
                      onClick={() => handleToggleAgent(agent.id)}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:bg-muted'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <BotIcon className="mt-0.5 h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate">
                              {agent.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">T{agent.tier}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {agent.description || 'No description provided.'}
                          </p>
                          {agent.capabilities.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {agent.capabilities.slice(0, 3).map((capability) => (
                                <span
                                  key={capability}
                                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  {capability}
                                </span>
                              ))}
                              {agent.capabilities.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{agent.capabilities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </ScrollArea>
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
                <CheckIcon className="h-4 w-4" />
                <span>Approved</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator className="my-2" />

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
                <PlayIcon className="h-4 w-4" />
                <span>Active</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <PauseIcon className="h-4 w-4" />
                <span>Scheduled</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <CheckIcon className="h-4 w-4" />
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
// SOLUTION BUILDER SIDEBAR CONTENT
// ============================================================================
function SolutionBuilderSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Templates</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Wand2Icon className="h-4 w-4" />
                <span>Solution Templates</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpenIcon className="h-4 w-4" />
                <span>Industries</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Builder</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button className="w-full justify-start" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Solution
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Components</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Preview</span>
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
                <span>Save</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Deploy</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Share</span>
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
    } else if (pathname?.startsWith('/solution-builder')) {
      return <SolutionBuilderSidebarContent />
    } else if (pathname?.startsWith('/admin')) {
      return <AdminSidebarContent />
    }

    // Default to dashboard if no match
    return <DashboardSidebarContent />
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">VITAL</h2>
        </div>
        <ViewSelector />
      </SidebarHeader>
      {getSidebarContent()}
      <SidebarFooter className="border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </SidebarFooter>
    </Sidebar>
  )
}
  const handleRefreshSessions = async () => {
    if (isRefreshing) return
    try {
      setIsRefreshing(true)
      await refreshSessions()
    } finally {
      setIsRefreshing(false)
    }
  }
