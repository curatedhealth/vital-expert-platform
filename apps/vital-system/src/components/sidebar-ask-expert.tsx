"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
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
  ChevronDown,
  Pin,
  PinOff,
  Archive,
  Clock,
  Calendar,
  MoreVertical,
  Star,
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useKeyboardShortcuts, type KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsOverlay } from "@/components/keyboard-shortcuts-overlay"
import { AgentPreviewCard } from "@/components/agent-preview-card"

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

  // Debug logging moved to useEffect to avoid logging on every render
  // Only logs when agents.length changes
  const prevAgentsLengthRef = useRef<number>(0);
  useEffect(() => {
    if (prevAgentsLengthRef.current !== agents.length) {
      console.log('🔍 [SidebarAskExpert] Agents updated:', {
        agentsCount: agents.length,
        hasUser: !!user,
      });
      prevAgentsLengthRef.current = agents.length;
    }
  }, [agents.length, user]);

  const router = useRouter()
  const { isMobile } = useSidebar()

  const [searchQuery, setSearchQuery] = useState("")
  const [conversationSearch, setConversationSearch] = useState("")
  const [filterTier, setFilterTier] = useState<number | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pinnedSessions, setPinnedSessions] = useState<Set<string>>(new Set())
  const [archivedSessions, setArchivedSessions] = useState<Set<string>>(new Set())
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0)
  const conversationSearchRef = useRef<HTMLInputElement>(null)

  // Load pinned/archived from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ask-expert-pinned-sessions')
      if (stored) {
        setPinnedSessions(new Set(JSON.parse(stored)))
      }
      const archivedStored = localStorage.getItem('ask-expert-archived-sessions')
      if (archivedStored) {
        setArchivedSessions(new Set(JSON.parse(archivedStored)))
      }
    }
  }, [])

  // Save pinned/archived to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ask-expert-pinned-sessions', JSON.stringify(Array.from(pinnedSessions)))
    }
  }, [pinnedSessions])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ask-expert-archived-sessions', JSON.stringify(Array.from(archivedSessions)))
    }
  }, [archivedSessions])

  const togglePin = useCallback((sessionId: string) => {
    setPinnedSessions(prev => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }, [])

  const toggleArchive = useCallback((sessionId: string) => {
    setArchivedSessions(prev => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }, [])

  const filteredAgents = useMemo(() => {
    const filtered = agents.filter((agent) => {
      const matchesSearch =
        agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTier = filterTier === null || agent.tier === filterTier
      return matchesSearch && matchesTier && agent.status === "active"
    })
    // Debug logging removed to reduce console noise
    return filtered;
  }, [agents, searchQuery, filterTier])

  const agentsByTier = useMemo(() => {
    return filteredAgents.reduce((acc, agent) => {
      if (!acc[agent.tier]) acc[agent.tier] = []
      acc[agent.tier].push(agent)
      return acc
    }, {} as Record<number, typeof filteredAgents>)
  }, [filteredAgents])

  // Group conversations by time period
  const groupedSessions = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Filter sessions: exclude archived, apply search
    const visibleSessions = sessions.filter(session => {
      if (archivedSessions.has(session.sessionId)) return false

      if (conversationSearch.trim()) {
        const searchLower = conversationSearch.toLowerCase()
        const agentName = (session.agent?.name || "").toLowerCase()
        const sessionId = session.sessionId.toLowerCase()
        return agentName.includes(searchLower) || sessionId.includes(searchLower)
      }

      return true
    })

    // Separate pinned sessions
    const pinned = visibleSessions.filter(s => pinnedSessions.has(s.sessionId))
    const unpinned = visibleSessions.filter(s => !pinnedSessions.has(s.sessionId))

    // Group unpinned by time
    const todaySessions: typeof sessions = []
    const yesterdaySessions: typeof sessions = []
    const last7DaysSessions: typeof sessions = []
    const last30DaysSessions: typeof sessions = []
    const olderSessions: typeof sessions = []

    unpinned.forEach(session => {
      const sessionDate = new Date(session.lastMessage)
      if (sessionDate >= today) {
        todaySessions.push(session)
      } else if (sessionDate >= yesterday) {
        yesterdaySessions.push(session)
      } else if (sessionDate >= sevenDaysAgo) {
        last7DaysSessions.push(session)
      } else if (sessionDate >= thirtyDaysAgo) {
        last30DaysSessions.push(session)
      } else {
        olderSessions.push(session)
      }
    })

    return {
      pinned,
      today: todaySessions,
      yesterday: yesterdaySessions,
      last7Days: last7DaysSessions,
      last30Days: last30DaysSessions,
      older: olderSessions,
    }
  }, [sessions, pinnedSessions, archivedSessions, conversationSearch])

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

  // Flatten all visible sessions for keyboard navigation
  const allVisibleSessions = useMemo(() => {
    return [
      ...groupedSessions.pinned,
      ...groupedSessions.today,
      ...groupedSessions.yesterday,
      ...groupedSessions.last7Days,
      ...groupedSessions.last30Days,
      ...groupedSessions.older,
    ]
  }, [groupedSessions])

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      key: 'k',
      metaKey: true,
      description: 'Quick search conversations',
      action: () => {
        conversationSearchRef.current?.focus()
      },
      category: 'Navigation',
    },
    {
      key: 'ArrowUp',
      description: 'Navigate to previous conversation',
      action: () => {
        if (allVisibleSessions.length > 0) {
          const newIndex = selectedConversationIndex > 0
            ? selectedConversationIndex - 1
            : allVisibleSessions.length - 1
          setSelectedConversationIndex(newIndex)
        }
      },
      category: 'Navigation',
    },
    {
      key: 'ArrowDown',
      description: 'Navigate to next conversation',
      action: () => {
        if (allVisibleSessions.length > 0) {
          const newIndex = selectedConversationIndex < allVisibleSessions.length - 1
            ? selectedConversationIndex + 1
            : 0
          setSelectedConversationIndex(newIndex)
        }
      },
      category: 'Navigation',
    },
    {
      key: 'Enter',
      description: 'Open selected conversation',
      action: () => {
        if (allVisibleSessions[selectedConversationIndex]) {
          setActiveSessionId(allVisibleSessions[selectedConversationIndex].sessionId)
        }
      },
      category: 'Navigation',
    },
    {
      key: 'p',
      metaKey: true,
      description: 'Pin/Unpin active conversation',
      action: () => {
        if (activeSessionId) {
          togglePin(activeSessionId)
        }
      },
      category: 'Actions',
    },
    {
      key: 'n',
      metaKey: true,
      description: 'New consultation',
      action: () => {
        handleNewChat()
      },
      category: 'Actions',
    },
    {
      key: 'r',
      metaKey: true,
      description: 'Refresh conversations and agents',
      action: () => {
        handleRefresh()
      },
      category: 'Actions',
    },
  ], [activeSessionId, allVisibleSessions, selectedConversationIndex, togglePin, handleNewChat, handleRefresh])

  useKeyboardShortcuts(shortcuts)

  const renderSessionItem = (session: typeof sessions[0], index?: number) => {
    const isPinned = pinnedSessions.has(session.sessionId)
    const isActive = session.sessionId === activeSessionId
    const isKeyboardSelected = index !== undefined && index === selectedConversationIndex

    return (
      <SidebarMenuItem key={session.sessionId}>
        <div className="group/session relative">
          <SidebarMenuButton
            isActive={isActive}
            onClick={() => {
              setActiveSessionId(session.sessionId);
              window.dispatchEvent(new CustomEvent('ask-expert:open-chat', {
                detail: { sessionId: session.sessionId, conversationId: session.sessionId }
              }));
            }}
            className={cn(
              isKeyboardSelected && !isActive && "ring-1 ring-primary/50"
            )}
          >
            <UserCircle2Icon className="h-4 w-4" />
            <div className="flex flex-1 flex-col items-start min-w-0">
              <div className="flex items-center gap-1 w-full">
                {isPinned && <Pin className="h-3 w-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
                <span className="text-sm truncate">
                  {session.title || session.agent?.name || "Consultation"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(session.lastMessage)}
              </span>
            </div>
            {session.messageCount > 0 && (
              <Badge variant="outline" className="ml-auto text-xs">
                {session.messageCount}
              </Badge>
            )}
          </SidebarMenuButton>

          {/* Quick Actions Dropdown */}
          <div className="absolute top-1 right-1 opacity-0 group-hover/session:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePin(session.sessionId)
                  }}
                >
                  {isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleArchive(session.sessionId)
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarMenuItem>
    )
  }

  return (
    <>
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
                    onClick={handleNewChat}
                    disabled={isCreatingChat}
                  >
                    {isCreatingChat ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                    <span>New Consultation</span>
                    {selectedAgents.length > 0 && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {selectedAgents.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCwIcon className="h-4 w-4" />
                    )}
                    <span>Refresh</span>
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
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              Conversations
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* Conversation Search */}
              <div className="relative px-2 mb-2">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={conversationSearchRef}
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                  placeholder="Search conversations… (⌘K)"
                  className="h-8 pl-8 text-sm"
                />
              </div>

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

              {!sessionsLoading && sessions.length > 0 && (
                <ScrollArea className="max-h-[300px]">
                  <SidebarMenu>
                    {/* Pinned Conversations */}
                    {groupedSessions.pinned.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Pinned
                        </div>
                        {groupedSessions.pinned.map((session, idx) => renderSessionItem(session, idx))}
                      </>
                    )}

                    {/* Today */}
                    {groupedSessions.today.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Today
                        </div>
                        {groupedSessions.today.map((session, idx) =>
                          renderSessionItem(session, groupedSessions.pinned.length + idx)
                        )}
                      </>
                    )}

                    {/* Yesterday */}
                    {groupedSessions.yesterday.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Yesterday
                        </div>
                        {groupedSessions.yesterday.map((session, idx) =>
                          renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + idx)
                        )}
                      </>
                    )}

                    {/* Last 7 Days */}
                    {groupedSessions.last7Days.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Last 7 Days
                        </div>
                        {groupedSessions.last7Days.map((session, idx) =>
                          renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + groupedSessions.yesterday.length + idx)
                        )}
                      </>
                    )}

                    {/* Last 30 Days */}
                    {groupedSessions.last30Days.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Last 30 Days
                        </div>
                        {groupedSessions.last30Days.map((session, idx) =>
                          renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + groupedSessions.yesterday.length + groupedSessions.last7Days.length + idx)
                        )}
                      </>
                    )}

                    {/* Older */}
                    {groupedSessions.older.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Older
                        </div>
                        {groupedSessions.older.map((session, idx) =>
                          renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + groupedSessions.yesterday.length + groupedSessions.last7Days.length + groupedSessions.last30Days.length + idx)
                        )}
                      </>
                    )}
                  </SidebarMenu>
                </ScrollArea>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              My Agents
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* Agent Search */}
              <div className="relative px-2 mb-2">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search agents…"
                  className="h-8 pl-8 text-sm"
                />
              </div>

              <ScrollArea className="max-h-[280px]">
                <SidebarMenu>
                  {agentsLoading && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        <span>Loading agents…</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {!agentsLoading && filteredAgents.length === 0 && agents.length === 0 && (
                    <div className="p-3 text-center">
                      <SparklesIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">No agents yet</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add agents from the Agent Store
                      </p>
                      <Link href="/agents">
                        <Button size="sm" variant="outline">
                          <SparklesIcon className="h-4 w-4 mr-1" />
                          Browse Agent Store
                        </Button>
                      </Link>
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
                      <div key={tier}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Tier {tier}
                        </div>
                        {tierAgents.map((agent) => {
                          const isSelected = selectedAgents.includes(agent.id)
                          return (
                            <SidebarMenuItem key={agent.id}>
                              <AgentPreviewCard
                                agent={agent}
                                isSelected={isSelected}
                                onSelect={() => {
                                  // Single-select: clicking replaces selection (not appends)
                                  // If clicking already-selected agent, deselect it
                                  const nextSelection = isSelected ? [] : [agent.id]
                                  console.log('🔄 [Sidebar] Agent selection changed:', { agentId: agent.id, isSelected, nextSelection })
                                  setSelectedAgents(nextSelection)
                                }}
                                stats={{
                                  totalConversations: Math.floor(Math.random() * 50) + 10,
                                  avgResponseTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
                                  successRate: Math.floor(Math.random() * 15) + 85,
                                }}
                              >
                                <SidebarMenuButton
                                  isActive={isSelected}
                                  onClick={() => {
                                    // Single-select: clicking replaces selection (not appends)
                                    const nextSelection = isSelected ? [] : [agent.id]
                                    setSelectedAgents(nextSelection)
                                  }}
                                >
                                  <AgentAvatar
                                    agent={agent}
                                    size="sm"
                                    className="w-6 h-6 rounded-md"
                                  />
                                  <span className="flex-1 text-sm truncate">
                                    {cleanDisplayName(agent.displayName)}
                                  </span>
                                  {isSelected && (
                                    <CheckIcon className="h-4 w-4 text-primary flex-shrink-0" />
                                  )}
                                  {!agent.isUserAdded ? (
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      className="h-6 w-6 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                                      onClick={(e) => {
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
                                      <PlusIcon className="h-4 w-4" />
                                    </div>
                                  ) : (
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      className="h-6 w-6 p-0 inline-flex items-center justify-center rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700 cursor-pointer"
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
                                      <Trash2Icon className="h-4 w-4" />
                                    </div>
                                  )}
                                </SidebarMenuButton>
                              </AgentPreviewCard>
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
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay shortcuts={shortcuts} />
    </>
  )
}
