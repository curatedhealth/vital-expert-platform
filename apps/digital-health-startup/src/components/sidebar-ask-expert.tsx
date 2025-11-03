"use client"

import { useCallback, useMemo, useState } from "react"
import {
  ArrowLeftRightIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SparklesIcon,
  UserCircle2Icon,
  Trash2Icon,
  CheckIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useAskExpert } from "@/contexts/ask-expert-context"
import { useAuth } from "@/lib/auth/supabase-auth-context"
import { AgentAvatar } from "@vital/ui"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Helper function to clean agent display names
function cleanDisplayName(displayName: string): string {
  return String(displayName)
    .replace(/\s*\(My Copy\)\s*/gi, '')
    .replace(/\s*\(Copy\)\s*/gi, '')
    .replace(/\[bea\]d-_agent_avatar_/gi, '')  // Remove malformed prefixes
    .replace(/^[^a-zA-Z]+/, '')                 // Remove leading non-letters
    .replace(/_/g, ' ')                          // Replace underscores with spaces
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function SidebarAskExpert() {
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
    refreshAgents,
    addAgentToUserList,
    removeAgentFromUserList,
  } = useAskExpert()

  const { user } = useAuth()

  console.log('🔍 [SidebarAskExpert] Component render:', {
    agentsCount: agents.length,
    agentsLoading,
    hasUser: !!user,
    userEmail: user?.email,
    agents: agents.map(a => ({ id: a.id, name: a.displayName, isUserAdded: a.isUserAdded }))
  });

  const router = useRouter()
  const { isMobile } = useSidebar()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterTier, setFilterTier] = useState<number | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredAgents = useMemo(() => {
    const filtered = agents.filter((agent) => {
      const matchesSearch =
        agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTier = filterTier === null || agent.tier === filterTier
      return matchesSearch && matchesTier && agent.status === "active"
    })

    console.log('🔍 [Sidebar Debug] Filtered agents:', {
      totalAgents: agents.length,
      filteredCount: filtered.length,
      searchQuery,
      filterTier,
      agents: filtered.map(a => ({ 
        id: a.id, 
        name: a.displayName, 
        isUserAdded: a.isUserAdded,
        tier: a.tier,
        status: a.status
      }))
    });

    return filtered;
  }, [agents, searchQuery, filterTier])

  const agentsByTier = useMemo(() => {
    return filteredAgents.reduce((acc, agent) => {
      if (!acc[agent.tier]) acc[agent.tier] = []
      acc[agent.tier].push(agent)
      return acc
    }, {} as Record<number, typeof filteredAgents>)
  }, [filteredAgents])

  const handleNewChat = useCallback(async () => {
    if (isCreatingChat) return
    try {
      setIsCreatingChat(true)
      
      console.log('🔄 [New Consultation] Creating new consultation session...')
      
      // Create a new session without requiring a specific agent
      // The user can select an agent after creating the chat
      const sessionId = await createNewSession({
        title: "New Consultation",
      })
      
      console.log('✅ [New Consultation] Created session:', sessionId)
      
      // Clear selected agents for the new consultation
      setSelectedAgents([])
      setActiveSessionId(sessionId)
      
      // Refresh sessions to ensure the new one appears in the sidebar
      await refreshSessions()
      console.log('🔄 [New Consultation] Refreshed sessions list')
      
      // Dispatch event to notify the main chat component
      window.dispatchEvent(
        new CustomEvent('ask-expert:new-chat', {
          detail: { sessionId, title: 'New Consultation' },
        })
      )
      
      console.log('📢 [New Consultation] Dispatched new-chat event')
      
    } catch (error) {
      console.error('❌ [New Consultation] Error creating new consultation:', error)
    } finally {
      setIsCreatingChat(false)
    }
  }, [createNewSession, setSelectedAgents, setActiveSessionId, refreshSessions, isCreatingChat])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    try {
      setIsRefreshing(true)
      await Promise.all([refreshSessions(), refreshAgents()])
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshAgents, refreshSessions])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return ""

    const diff = Date.now() - date.getTime()
    if (diff < 60_000) return "Just now"
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hrs ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="justify-between"
                onClick={handleNewChat}
                disabled={isCreatingChat}
              >
                <div className="flex items-center gap-2">
                  {isCreatingChat ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlusIcon className="h-4 w-4" />
                  )}
                  <span>New Consultation</span>
                </div>
                {selectedAgents.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {selectedAgents.length} selected
                  </Badge>
                )}
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
                <Link href="/agents">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Browse Agent Store</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Recent Consultations</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {sessionsLoading && (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  <span>Loading consultations…</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {!sessionsLoading && sessions.length === 0 && (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <ArrowLeftRightIcon className="h-4 w-4 opacity-60" />
                  <span>No consultations yet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {sessions.map((session) => (
              <SidebarMenuItem key={session.sessionId}>
                <SidebarMenuButton
                  data-active={session.sessionId === activeSessionId}
                  onClick={() => setActiveSessionId(session.sessionId)}
                >
                  <div className="flex w-full items-center gap-2">
                    <UserCircle2Icon className="h-4 w-4 shrink-0" />
                    <div className="flex flex-1 flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">
                        {session.agent?.name || "Consultation"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(session.lastMessage)}
                      </span>
                    </div>
                    {session.messageCount > 0 && (
                      <Badge variant="outline" className="ml-auto">
                        {session.messageCount}
                      </Badge>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>My Agents</SidebarGroupLabel>
        <SidebarGroupContent className="space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search agents…"
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="max-h-[320px] pr-2">
            <SidebarMenu className="space-y-2">
              {agentsLoading && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <span>Loading agents…</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {!agentsLoading && filteredAgents.length === 0 && agents.length === 0 && (
                <div className="p-4 space-y-3">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <SparklesIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No agents yet</p>
                      <p className="text-xs text-muted-foreground">
                        Add agents from the Agent Store to get started
                      </p>
                    </div>
                    <Link href="/agents">
                      <Button size="sm" className="mt-2">
                        <SparklesIcon className="h-3 w-3 mr-1" />
                        Browse Agent Store
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {!agentsLoading && filteredAgents.length === 0 && agents.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <SearchIcon className="h-4 w-4" />
                    <span>No agents match your search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {Object.entries(agentsByTier)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([tier, tierAgents]) => (
                  <div key={tier} className="space-y-1">
                    <span className="pl-2 text-xs font-semibold text-muted-foreground">
                      Tier {tier}
                    </span>
                    {tierAgents.map((agent) => {
                      const isSelected = selectedAgents.includes(agent.id)
                      return (
                        <SidebarMenuItem key={agent.id}>
                          <SidebarMenuButton
                            data-active={isSelected}
                            onClick={() => {
                              console.log('🔍 [Agent Click] Agent clicked:', agent.id, agent.displayName);
                              const nextSelection = isSelected
                                ? selectedAgents.filter((id) => id !== agent.id)
                                : [...selectedAgents, agent.id]
                              console.log('🔍 [Agent Click] New selection:', nextSelection);
                              setSelectedAgents(nextSelection)
                            }}
                            className={cn(
                              'items-center transition-all p-2 rounded-lg',
                              agent.isUserAdded && !isSelected && 'bg-green-50/50 border-l-2 border-l-green-500',
                              isSelected && 'bg-vital-primary-100 border-l-4 border-l-vital-primary-600 shadow-sm'
                            )}
                          >
                            {/* Avatar, Name, and Action Button in single row */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* Avatar */}
                              <div className="flex-shrink-0">
                                <AgentAvatar
                                  agent={agent}
                                  size="sm"
                                  className={cn(
                                    'w-7 h-7 rounded-lg border-2 transition-all',
                                    isSelected 
                                      ? 'border-vital-primary-500 shadow-sm' 
                                      : 'border-gray-200'
                                  )}
                                />
                              </div>

                              {/* Name with Check Icon */}
                              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                {isSelected && (
                                  <CheckIcon className="h-3 w-3 text-vital-primary-600 flex-shrink-0" />
                                )}
                                <span className={cn(
                                  'text-xs font-medium leading-tight break-words',
                                  isSelected && 'text-vital-primary-900 font-semibold'
                                )}>
                                  {cleanDisplayName(agent.displayName)}
                                </span>
                              </div>

                              {/* Action Button */}
                              <div className="flex-shrink-0">
                                {!agent.isUserAdded ? (
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="inline-flex items-center justify-center h-5 w-5 p-0 rounded-md hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-vital-primary-500 focus:ring-offset-1"
                                    onClick={(e) => {
                                      console.log('🔍 [Button Click] Add button clicked for agent:', agent.id);
                                      e.stopPropagation()
                                      addAgentToUserList(agent.id)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        addAgentToUserList(agent.id)
                                      }
                                    }}
                                    title="Add to chat list"
                                  >
                                    <PlusIcon className="h-3 w-3" />
                                  </div>
                                ) : (
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="inline-flex items-center justify-center h-5 w-5 p-0 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeAgentFromUserList(agent.id)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeAgentFromUserList(agent.id)
                                      }
                                    }}
                                    title="Remove from chat list"
                                  >
                                    <Trash2Icon className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </div>
                ))}
            </SidebarMenu>
          </ScrollArea>

          {isMobile && (
            <Button variant="outline" size="sm" onClick={() => router.push("/agents")}>
              Manage Agents
            </Button>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
