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
  MoreVertical,
  Target,
  Zap,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import { useAskExpert } from "@/contexts/ask-expert-context"
import { useAuth } from "@/lib/auth/supabase-auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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

// Helper to get agent level display (L1, L2, etc.)
function getAgentLevelDisplay(tier: number): string {
  switch (tier) {
    case 1: return 'L1'
    case 2: return 'L2'
    case 3: return 'L3'
    default: return `L${tier}`
  }
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
  } = useAskExpert()

  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Determine current mode from path and query params
  const isInteractive = pathname?.includes('/interactive')
  const isAutonomous = pathname?.includes('/autonomous')
  const isAutoMode = searchParams?.get('mode') === 'auto'

  // Mode configuration
  const currentMode = useMemo(() => {
    if (isInteractive && !isAutoMode) return { mode: 1, title: 'Interactive Manual', icon: User, color: 'blue', nickname: 'Expert Chat' }
    if (isInteractive && isAutoMode) return { mode: 2, title: 'Interactive Auto', icon: SparklesIcon, color: 'violet', nickname: 'Smart Copilot' }
    if (isAutonomous && !isAutoMode) return { mode: 3, title: 'Research Manual', icon: Target, color: 'emerald', nickname: 'Mission Control' }
    if (isAutonomous && isAutoMode) return { mode: 4, title: 'Research Auto', icon: Zap, color: 'amber', nickname: 'Background Mission' }
    return null
  }, [isInteractive, isAutonomous, isAutoMode])

  // State for Mode 3 expert selection
  const [selectedResearchExpert, setSelectedResearchExpert] = useState<string | null>(null)

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

  // Auto-select first agent for Mode 3 when agents load
  useEffect(() => {
    if (currentMode?.mode === 3 && !selectedResearchExpert && filteredAgents.length > 0) {
      setSelectedResearchExpert(filteredAgents[0].id)
    }
  }, [currentMode?.mode, selectedResearchExpert, filteredAgents])

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

  // Color classes for mode-specific styling
  const modeColorClasses = {
    blue: { icon: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    violet: { icon: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
    emerald: { icon: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    amber: { icon: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  }

  // Emit expert selection change for Mode 1 (interactive page ChatDashboard listens)
  useEffect(() => {
    if (currentMode?.mode === 1 && selectedAgents.length > 0) {
      const selectedAgent = agents.find(a => a.id === selectedAgents[0])
      if (selectedAgent) {
        window.dispatchEvent(new CustomEvent('ask-expert:expert-selected', {
          detail: {
            expertId: selectedAgents[0],
            expert: {
              id: selectedAgent.id,
              name: selectedAgent.displayName,
              level: getAgentLevelDisplay(selectedAgent.tier),
              specialty: selectedAgent.description?.slice(0, 50) || ''
            }
          }
        }))
      }
    }
  }, [currentMode?.mode, selectedAgents, agents])

  // Emit expert selection change for Mode 3 (autonomous page listens)
  useEffect(() => {
    if (currentMode?.mode === 3 && selectedResearchExpert) {
      const selectedAgent = agents.find(a => a.id === selectedResearchExpert)
      if (selectedAgent) {
        window.dispatchEvent(new CustomEvent('ask-expert:expert-selected', {
          detail: {
            expertId: selectedResearchExpert,
            expert: {
              id: selectedAgent.id,
              name: selectedAgent.displayName,
              level: getAgentLevelDisplay(selectedAgent.tier),
              specialty: selectedAgent.description?.slice(0, 50) || ''
            }
          }
        }))
      }
    }
  }, [currentMode?.mode, selectedResearchExpert, agents])

  // Listen for requests to re-emit the current selection (from interactive/autonomous page on mount)
  useEffect(() => {
    const handleRequestSelection = () => {
      // Mode 1: Emit from selectedAgents
      if (currentMode?.mode === 1 && selectedAgents.length > 0) {
        const selectedAgent = agents.find(a => a.id === selectedAgents[0])
        if (selectedAgent) {
          window.dispatchEvent(new CustomEvent('ask-expert:expert-selected', {
            detail: {
              expertId: selectedAgents[0],
              expert: {
                id: selectedAgent.id,
                name: selectedAgent.displayName,
                level: getAgentLevelDisplay(selectedAgent.tier),
                specialty: selectedAgent.description?.slice(0, 50) || ''
              }
            }
          }))
        }
      }
      // Mode 3: Emit from selectedResearchExpert
      if (currentMode?.mode === 3 && selectedResearchExpert) {
        const selectedAgent = agents.find(a => a.id === selectedResearchExpert)
        if (selectedAgent) {
          window.dispatchEvent(new CustomEvent('ask-expert:expert-selected', {
            detail: {
              expertId: selectedResearchExpert,
              expert: {
                id: selectedAgent.id,
                name: selectedAgent.displayName,
                level: getAgentLevelDisplay(selectedAgent.tier),
                specialty: selectedAgent.description?.slice(0, 50) || ''
              }
            }
          }))
        }
      }
    }

    window.addEventListener('ask-expert:request-selection', handleRequestSelection)
    return () => {
      window.removeEventListener('ask-expert:request-selection', handleRequestSelection)
    }
  }, [currentMode?.mode, selectedAgents, selectedResearchExpert, agents])

  return (
    <>
      {/* Mode Header (shown when in a specific mode) */}
      {currentMode && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <div className={cn(
            "mx-2 p-3 rounded-lg border",
            modeColorClasses[currentMode.color as keyof typeof modeColorClasses]?.bg,
            modeColorClasses[currentMode.color as keyof typeof modeColorClasses]?.border
          )}>
            <div className="flex items-center gap-2">
              <currentMode.icon className={cn("h-5 w-5", modeColorClasses[currentMode.color as keyof typeof modeColorClasses]?.icon)} />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{currentMode.title}</h3>
                <p className="text-xs text-muted-foreground">"{currentMode.nickname}"</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Mode {currentMode.mode}
              </Badge>
            </div>
          </div>
        </SidebarGroup>
      )}

      {/* Agent Selection for Manual Modes (Mode 1 & 3) */}
      {currentMode && (currentMode.mode === 1 || currentMode.mode === 3) && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>
            {currentMode.mode === 3 ? 'Select Research Lead' : 'Select Expert'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 space-y-2">
              {/* Agent Search */}
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search experts..."
                  className="h-8 pl-9 text-sm"
                />
              </div>

              <ScrollArea className="max-h-[240px]">
                <div className="space-y-1">
                  {filteredAgents.slice(0, 15).map((agent) => {
                    const isSelected = currentMode.mode === 3
                      ? selectedResearchExpert === agent.id
                      : selectedAgents.includes(agent.id)
                    const colorClass = currentMode.mode === 3 ? 'emerald' : 'blue'

                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => {
                          if (currentMode.mode === 3) {
                            setSelectedResearchExpert(agent.id)
                          } else {
                            // Mode 1: single select
                            setSelectedAgents(isSelected ? [] : [agent.id])
                          }
                        }}
                        className={cn(
                          "w-full px-3 py-2 rounded-md text-left transition-all flex items-center gap-2",
                          isSelected && currentMode.mode === 3 && "bg-emerald-500/10 border border-emerald-500/50",
                          isSelected && currentMode.mode === 1 && "bg-blue-500/10 border border-blue-500/50",
                          !isSelected && "hover:bg-muted/50"
                        )}
                      >
                        <span className="font-medium text-sm truncate flex-1">
                          {cleanDisplayName(agent.displayName)}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getAgentLevelDisplay(agent.tier)}
                        </Badge>
                        {isSelected && (
                          <CheckIcon className={cn(
                            "h-4 w-4 shrink-0",
                            currentMode.mode === 3 ? "text-emerald-500" : "text-blue-500"
                          )} />
                        )}
                      </button>
                    )
                  })}
                  {filteredAgents.length === 0 && !agentsLoading && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No agents found
                    </p>
                  )}
                  {agentsLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Fusion Intelligence Card for Auto Modes (Mode 2 & 4) */}
      {currentMode && isAutoMode && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Intelligence Engine</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 text-center">
                <SparklesIcon className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <h3 className="font-medium text-sm">Fusion Intelligence</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentMode.mode === 4
                    ? 'Auto-assembles optimal expert team for your research goal.'
                    : 'Auto-routes your query to the best expert in real-time.'}
                </p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      <Separator className="my-2" />

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

      {/* Browse Agents - only show when on landing page (no mode) */}
      {!currentMode && (
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                Browse Agents
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
                  <div className="space-y-1 px-2">
                    {agentsLoading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
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

                    {!agentsLoading && filteredAgents.slice(0, 15).map((agent) => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => router.push(`/agents/${agent.id}`)}
                        className="w-full px-3 py-2 rounded-md text-left transition-all flex items-center gap-2 hover:bg-muted/50"
                      >
                        <span className="font-medium text-sm truncate flex-1">
                          {cleanDisplayName(agent.displayName)}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getAgentLevelDisplay(agent.tier)}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      )}

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay shortcuts={shortcuts} />
    </>
  )
}
