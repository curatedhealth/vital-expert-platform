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
            data-active={isActive}
            onClick={() => setActiveSessionId(session.sessionId)}
            className={cn(
              "group relative w-full rounded-lg transition-all duration-200",
              isPinned && "bg-gradient-to-r from-yellow-50/80 to-yellow-50/40 dark:from-yellow-900/20 dark:to-yellow-900/10 border-l-2 border-l-yellow-500 shadow-sm",
              !isPinned && !isActive && "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:shadow-sm hover:-translate-y-0.5",
              isActive && "bg-gradient-to-r from-primary/15 to-primary/5 border-l-2 border-l-primary shadow-md",
              isKeyboardSelected && !isActive && "ring-2 ring-primary/30 bg-primary/10"
            )}
          >
            {/* Subtle gradient overlay */}
            <div className={cn(
              "absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none",
              isActive ? "bg-gradient-to-br from-primary/5 to-transparent" : "bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent"
            )} />

            <div className="relative flex w-full items-center gap-3">
              <div className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                isActive ? "bg-primary/20" : "bg-muted/50 group-hover:bg-accent/30"
              )}>
                <UserCircle2Icon className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-all duration-200",
                  isActive ? "text-primary" : "group-hover:scale-110"
                )} />
              </div>
              <div className="flex flex-1 flex-col items-start gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5 w-full">
                  {isPinned && <Pin className="h-3 w-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
                  <span className={cn(
                    "text-sm truncate transition-colors duration-200",
                    isActive ? "font-semibold text-primary" : "font-medium group-hover:text-foreground"
                  )}>
                    {session.agent?.name || "Consultation"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(session.lastMessage)}
                </span>
              </div>
              {session.messageCount > 0 && (
                <Badge variant="outline" className={cn(
                  "ml-auto flex-shrink-0 transition-all duration-200",
                  isActive && "bg-primary/10 border-primary/30 text-primary"
                )}>
                  {session.messageCount}
                </Badge>
              )}
            </div>
          </SidebarMenuButton>

          {/* Quick Actions Dropdown */}
          <div className="absolute top-1 right-1 opacity-0 group-hover/session:opacity-100 transition-opacity">
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
                    e.stopPropagation()
                    togglePin(session.sessionId)
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
                <DropdownMenuItem
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleArchive(session.sessionId)
                  }}
                >
                  <Archive className="h-3 w-3 mr-2" />
                  Archive
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
    )
  }

  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="group flex w-full items-center justify-between hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 rounded-lg px-3 py-2 transition-all duration-200">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/80 group-hover:text-foreground">Quick Actions</span>
              <ChevronDown className="ml-auto h-3.5 w-3.5 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180 group-hover:text-primary" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="group relative justify-between rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-sm hover:-translate-y-0.5"
                    onClick={handleNewChat}
                    disabled={isCreatingChat}
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

                    <div className="relative flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-all duration-200">
                        {isCreatingChat ? (
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin text-primary" />
                        ) : (
                          <PlusIcon className="h-3.5 w-3.5 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" />
                        )}
                      </div>
                      <span className="font-medium">New Consultation</span>
                    </div>
                    {selectedAgents.length > 0 && (
                      <Badge variant="outline" className="text-xs ml-auto bg-primary/10 border-primary/20">
                        {selectedAgents.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="group relative justify-between rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-secondary/10 hover:to-secondary/5 hover:shadow-sm hover:-translate-y-0.5"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-secondary/0 to-secondary/0 group-hover:from-secondary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

                    <div className="relative flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-secondary/10 group-hover:bg-secondary/20 transition-all duration-200">
                        {isRefreshing ? (
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin text-secondary-foreground" />
                        ) : (
                          <RefreshCwIcon className="h-3.5 w-3.5 text-secondary-foreground transition-transform duration-200 group-hover:scale-110 group-hover:rotate-180" />
                        )}
                      </div>
                      <span className="font-medium">Refresh</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuButton asChild className="group relative rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:shadow-sm hover:-translate-y-0.5">
                    <Link href="/agents">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

                      <div className="relative flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-accent/20 group-hover:bg-accent/30 transition-all duration-200">
                          <SparklesIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                        </div>
                        <span className="font-medium">Browse Agent Store</span>
                      </div>
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
            <CollapsibleTrigger className="group flex w-full items-center justify-between hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 rounded-lg px-3 py-2 transition-all duration-200">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/80 group-hover:text-foreground">Conversations</span>
              <ChevronDown className="ml-auto h-3.5 w-3.5 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180 group-hover:text-primary" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-3">
              {/* Conversation Search with premium styling */}
              <div className="relative px-2">
                <div className="relative group">
                  {/* Gradient border effect on focus */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />

                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      ref={conversationSearchRef}
                      value={conversationSearch}
                      onChange={(e) => setConversationSearch(e.target.value)}
                      placeholder="Search conversations… (⌘K)"
                      className="h-9 pl-9 text-xs rounded-lg bg-muted/50 border-border/40 focus-visible:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>
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
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-4">
                    {/* Pinned Conversations */}
                    {groupedSessions.pinned.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-50/50 to-yellow-50/30 dark:from-yellow-900/10 dark:to-yellow-900/5">
                          <div className="p-1 rounded-md bg-yellow-500/10">
                            <Pin className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <span className="text-xs font-bold text-yellow-900 dark:text-yellow-300 uppercase tracking-wider">
                            Pinned
                          </span>
                        </div>
                        <SidebarMenu>
                          {groupedSessions.pinned.map((session, idx) => renderSessionItem(session, idx))}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Today */}
                    {groupedSessions.today.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
                          <div className="p-1 rounded-md bg-primary/10">
                            <Clock className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            Today
                          </span>
                        </div>
                        <SidebarMenu>
                          {groupedSessions.today.map((session, idx) =>
                            renderSessionItem(session, groupedSessions.pinned.length + idx)
                          )}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Yesterday */}
                    {groupedSessions.yesterday.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30">
                          <div className="p-1 rounded-md bg-muted/50">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                            Yesterday
                          </span>
                        </div>
                        <SidebarMenu>
                          {groupedSessions.yesterday.map((session, idx) =>
                            renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + idx)
                          )}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Last 7 Days */}
                    {groupedSessions.last7Days.length > 0 && (
                      <div className="space-y-1">
                        <span className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Last 7 Days
                        </span>
                        <SidebarMenu>
                          {groupedSessions.last7Days.map((session, idx) =>
                            renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + groupedSessions.yesterday.length + idx)
                          )}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Last 30 Days */}
                    {groupedSessions.last30Days.length > 0 && (
                      <div className="space-y-1">
                        <span className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Last 30 Days
                        </span>
                        <SidebarMenu>
                          {groupedSessions.last30Days.map((session, idx) =>
                            renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + groupedSessions.yesterday.length + groupedSessions.last7Days.length + idx)
                          )}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Older */}
                    {groupedSessions.older.length > 0 && (
                      <div className="space-y-1">
                        <span className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Older
                        </span>
                        <SidebarMenu>
                          {groupedSessions.older.map((session, idx) =>
                            renderSessionItem(session, groupedSessions.pinned.length + groupedSessions.today.length + groupedSessions.yesterday.length + groupedSessions.last7Days.length + groupedSessions.last30Days.length + idx)
                          )}
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

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="group flex w-full items-center justify-between hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 rounded-lg px-3 py-2 transition-all duration-200">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/80 group-hover:text-foreground">My Agents</span>
              <ChevronDown className="ml-auto h-3.5 w-3.5 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180 group-hover:text-primary" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-3">
              <div className="space-y-2">
                <div className="relative px-2">
                  <div className="relative group">
                    {/* Gradient border effect on focus */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />

                    <div className="relative">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search agents…"
                        className="pl-9 rounded-lg bg-muted/50 border-border/40 focus-visible:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>
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
                          <AgentPreviewCard
                            agent={agent}
                            isSelected={isSelected}
                            onSelect={() => {
                              console.log('🔍 [Agent Click] Agent clicked:', agent.id, agent.displayName);
                              const nextSelection = isSelected
                                ? selectedAgents.filter((id) => id !== agent.id)
                                : [...selectedAgents, agent.id]
                              console.log('🔍 [Agent Click] New selection:', nextSelection);
                              setSelectedAgents(nextSelection)
                            }}
                            stats={{
                              totalConversations: Math.floor(Math.random() * 50) + 10,
                              avgResponseTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
                              successRate: Math.floor(Math.random() * 15) + 85,
                            }}
                          >
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
