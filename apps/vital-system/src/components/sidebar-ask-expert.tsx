"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import {
  ArrowLeftRightIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SparklesIcon,
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
  MessageSquare,
  Users,
  Pencil,
  X,
  Calendar as CalendarIcon,
  Archive as ArchiveIcon,
  Pin as PinIcon,
  Briefcase,
  Rocket,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

// Helper to convert avatar code to full URL path
// Matches the avatar handling in the agent-card.tsx component
function getAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) return null;

  // If already a full URL or path, return as-is
  if (avatar.startsWith('http') || avatar.startsWith('/')) {
    return avatar;
  }

  // If it's an avatar code like "avatar_0001", convert to full path
  if (avatar.match(/^avatar_\d{3,4}$/)) {
    return `/icons/png/avatars/${avatar}.png`;
  }

  // Fallback: assume it's a code and try to construct the path
  return `/icons/png/avatars/${avatar}.png`;
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
    deleteSession,
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
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({})
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0)
  const conversationSearchRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Load pinned/archived/custom titles from localStorage
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
      const titlesStored = localStorage.getItem('ask-expert-custom-titles')
      if (titlesStored) {
        setCustomTitles(JSON.parse(titlesStored))
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

  // Save custom titles to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(customTitles).length > 0) {
      localStorage.setItem('ask-expert-custom-titles', JSON.stringify(customTitles))
    }
  }, [customTitles])

  // Focus input when editing starts
  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingSessionId])

  const startRename = useCallback((sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId)
    setEditingTitle(currentTitle)
  }, [])

  const saveRename = useCallback(() => {
    if (editingSessionId && editingTitle.trim()) {
      setCustomTitles(prev => ({
        ...prev,
        [editingSessionId]: editingTitle.trim()
      }))
    }
    setEditingSessionId(null)
    setEditingTitle("")
  }, [editingSessionId, editingTitle])

  const cancelRename = useCallback(() => {
    setEditingSessionId(null)
    setEditingTitle("")
  }, [])

  // Generate intelligent title from message content (like Claude.ai/ChatGPT)
  const generateTitleFromMessage = useCallback((message: string): string => {
    if (!message || message.length < 3) return ""

    // Clean up the message
    const cleaned = message
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/[#*_~`]/g, '')        // Remove markdown formatting
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .trim()

    if (cleaned.length < 3) return ""

    // Extract first sentence or meaningful chunk
    const firstSentenceMatch = cleaned.match(/^([^.!?\n]+[.!?]?)/)
    const firstChunk = firstSentenceMatch?.[1] || cleaned

    // Truncate to reasonable length (40-50 chars max)
    let title = firstChunk.slice(0, 50).trim()

    // If truncated mid-word, cut at last space
    if (firstChunk.length > 50 && title.lastIndexOf(' ') > 20) {
      title = title.slice(0, title.lastIndexOf(' '))
    }

    // Capitalize first letter if not already
    if (title && title[0] !== title[0].toUpperCase()) {
      title = title[0].toUpperCase() + title.slice(1)
    }

    // Remove trailing punctuation except ?
    title = title.replace(/[.,;:]+$/, '')

    return title || ""
  }, [])

  // Helper to get session title (custom > generated > from session > default)
  const getSessionTitle = useCallback((session: typeof sessions[0]): string => {
    // Check custom title first
    if (customTitles[session.sessionId]) {
      return customTitles[session.sessionId]
    }
    // Then check session's own title (if not generic)
    if (session.title && session.title !== "New Consultation") {
      return session.title
    }
    // Try to generate from first message preview (if available in session)
    if ((session as any).firstMessagePreview) {
      const generated = generateTitleFromMessage((session as any).firstMessagePreview)
      if (generated) return generated
    }
    // Then agent name with context
    if (session.agent?.name) {
      return `Chat with ${session.agent.name}`
    }
    // Final fallback - use "Chat" with short session ID
    return `Chat ${session.sessionId.slice(0, 6)}`
  }, [customTitles, generateTitleFromMessage])

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

  // Group agents by field of expertise (knowledge_domains)
  const groupedAgents = useMemo(() => {
    const groups: Record<string, typeof filteredAgents> = {}

    filteredAgents.forEach(agent => {
      // Use first knowledge_domain, or 'General' if none
      const domain = agent.knowledge_domains?.[0] || 'General'
      if (!groups[domain]) {
        groups[domain] = []
      }
      groups[domain].push(agent)
    })

    // Sort domains alphabetically, but put 'General' last
    const sortedDomains = Object.keys(groups).sort((a, b) => {
      if (a === 'General') return 1
      if (b === 'General') return -1
      return a.localeCompare(b)
    })

    return { groups, sortedDomains }
  }, [filteredAgents])

  // Group conversations by time period
  // Separate sessions into conversations (Mode 1/2) and missions (Mode 3/4)
  const { conversations, missions } = useMemo(() => {
    const convs: typeof sessions = []
    const miss: typeof sessions = []

    sessions.forEach(session => {
      if (session.metadata?.isMission || session.missionId) {
        miss.push(session)
      } else {
        convs.push(session)
      }
    })

    return { conversations: convs, missions: miss }
  }, [sessions])

  const groupedSessions = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Filter conversations: exclude archived, apply search
    const visibleSessions = conversations.filter(session => {
      if (archivedSessions.has(session.sessionId)) return false

      if (conversationSearch.trim()) {
        const searchLower = conversationSearch.toLowerCase()
        const title = (session.title || "").toLowerCase()
        const agentName = (session.agent?.name || "").toLowerCase()
        const sessionId = session.sessionId.toLowerCase()
        return title.includes(searchLower) || agentName.includes(searchLower) || sessionId.includes(searchLower)
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
  }, [conversations, pinnedSessions, archivedSessions, conversationSearch])

  // Group missions by status
  const groupedMissions = useMemo(() => {
    const visibleMissions = missions.filter(mission => {
      if (archivedSessions.has(mission.sessionId)) return false

      if (conversationSearch.trim()) {
        const searchLower = conversationSearch.toLowerCase()
        const title = (mission.title || "").toLowerCase()
        const agentName = (mission.agent?.name || "").toLowerCase()
        return title.includes(searchLower) || agentName.includes(searchLower)
      }

      return true
    })

    const running = visibleMissions.filter(m => m.metadata?.status === 'running' || m.metadata?.status === 'in_progress')
    const completed = visibleMissions.filter(m => m.metadata?.status === 'completed' || m.metadata?.status === 'done')
    const draft = visibleMissions.filter(m => m.metadata?.status === 'draft' || m.metadata?.status === 'pending' || (!m.metadata?.status))
    const failed = visibleMissions.filter(m => m.metadata?.status === 'failed' || m.metadata?.status === 'error')

    return { running, completed, draft, failed }
  }, [missions, archivedSessions, conversationSearch])

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
    const isEditing = editingSessionId === session.sessionId
    const displayTitle = getSessionTitle(session)

    // Handle rename via inline edit
    if (isEditing) {
      return (
        <SidebarMenuItem key={session.sessionId}>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              ref={editInputRef}
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  saveRename()
                } else if (e.key === 'Escape') {
                  cancelRename()
                }
              }}
              onBlur={saveRename}
              className="h-7 text-sm flex-1"
              placeholder="Chat name..."
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={saveRename}
            >
              <CheckIcon className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={cancelRename}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </SidebarMenuItem>
      )
    }

    return (
      <SidebarMenuItem key={session.sessionId}>
        <div className="group/session relative">
          <SidebarMenuButton
            isActive={isActive}
            onClick={() => {
              setActiveSessionId(session.sessionId);
              // Navigate to conversation detail view with conversationId
              // Determine mode from conversation metadata or default to manual
              const mode = session.metadata?.mode === 'auto' ? 'auto' : 'manual';
              router.push(`/ask-expert/interactive?mode=${mode}&conversationId=${session.sessionId}`);
            }}
            className={cn(
              "py-1.5 px-2 rounded-lg transition-all duration-150",
              isActive && "bg-primary/10 border-l-2 border-primary",
              !isActive && "hover:bg-muted/60",
              isKeyboardSelected && !isActive && "ring-1 ring-primary/40 bg-muted/40"
            )}
          >
            <div className="flex items-start gap-2.5 w-full min-w-0">
              {/* Mode-specific Icon */}
              <div className="relative shrink-0 mt-0.5">
                {(() => {
                  // Determine mode from session metadata
                  const mode = session.metadata?.mode;
                  const isAuto = mode === 'auto';

                  // Mode icon and color mapping
                  const getModeIcon = () => {
                    // Check if it's autonomous (research) mode based on title/context
                    const isResearch = session.title?.toLowerCase().includes('research') ||
                                       session.title?.toLowerCase().includes('mission');

                    if (isResearch && isAuto) {
                      // Mode 4: Background Mission - Zap, amber
                      return { Icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' };
                    } else if (isResearch) {
                      // Mode 3: Mission Control - Target, emerald
                      return { Icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
                    } else if (isAuto) {
                      // Mode 2: Smart Copilot - Sparkles, violet
                      return { Icon: SparklesIcon, color: 'text-violet-500', bg: 'bg-violet-500/10' };
                    } else {
                      // Mode 1: Expert Chat - User, blue (default)
                      return { Icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' };
                    }
                  };

                  const { Icon, color, bg } = getModeIcon();

                  return (
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center",
                      isActive ? bg : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-3.5 w-3.5",
                        isActive ? color : "text-muted-foreground/70"
                      )} />
                    </div>
                  );
                })()}
                {isPinned && (
                  <Pin className="h-2.5 w-2.5 text-amber-500 absolute -top-1 -right-1" />
                )}
              </div>

              {/* Content - Title only, no subtitle */}
              <div className="flex-1 min-w-0 overflow-hidden flex items-center">
                <span className={cn(
                  "text-[13px] truncate leading-tight",
                  isActive ? "font-semibold text-foreground" : "font-medium text-foreground/90"
                )}>
                  {displayTitle}
                </span>
              </div>
            </div>
          </SidebarMenuButton>

          {/* Quick Actions - Always visible edit button + More menu on hover */}
          <div className="absolute top-1/2 -translate-y-1/2 right-1.5 flex items-center gap-0.5">
            {/* Edit button - more visible */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 rounded-md transition-opacity duration-150",
                isActive ? "opacity-100" : "opacity-0 group-hover/session:opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation()
                startRename(session.sessionId, displayTitle)
              }}
            >
              <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </Button>
            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 rounded-md hover:bg-muted transition-opacity duration-150",
                    isActive ? "opacity-100" : "opacity-0 group-hover/session:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    startRename(session.sessionId, displayTitle)
                  }}
                  className="text-[13px]"
                >
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePin(session.sessionId)
                  }}
                  className="text-[13px]"
                >
                  {isPinned ? (
                    <>
                      <PinOff className="h-3.5 w-3.5 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-3.5 w-3.5 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleArchive(session.sessionId)
                  }}
                  className="text-[13px]"
                >
                  <Archive className="h-3.5 w-3.5 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 text-[13px]"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSession(session.sessionId)
                  }}
                >
                  <Trash2Icon className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarMenuItem>
    )
  }

  // Helper to render an agent item
  const renderAgentItem = (agent: typeof agents[0]) => {
    const isSelected = currentMode?.mode === 3
      ? selectedResearchExpert === agent.id
      : selectedAgents.includes(agent.id)

    return (
      <div key={agent.id} className="group/agent relative">
        <button
          type="button"
          onClick={() => {
            if (currentMode?.mode === 3) {
              setSelectedResearchExpert(agent.id)
            } else if (currentMode?.mode === 1) {
              setSelectedAgents(isSelected ? [] : [agent.id])
            } else {
              // No mode - just navigate to agent
              router.push(`/agents/${agent.id}`)
            }
          }}
          className={cn(
            "w-full pl-2 pr-10 py-2 rounded-lg text-left transition-all flex items-center gap-2.5",
            isSelected && currentMode?.mode === 3 && "bg-emerald-500/10 border-l-2 border-emerald-500",
            isSelected && currentMode?.mode === 1 && "bg-blue-500/10 border-l-2 border-blue-500",
            !isSelected && "hover:bg-muted/60"
          )}
        >
          {/* Agent Avatar */}
          <div className="relative shrink-0">
            {(() => {
              const avatarUrl = getAvatarUrl(agent.avatar);
              return avatarUrl ? (
                <Avatar className="h-7 w-7 border border-border/40">
                  <AvatarImage src={avatarUrl} alt={agent.displayName} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {agent.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary/15" : "bg-muted"
                )}>
                  <User className={cn(
                    "h-3.5 w-3.5",
                    isSelected ? "text-primary" : "text-muted-foreground/70"
                  )} />
                </div>
              );
            })()}
            {isSelected && (
              <CheckIcon className={cn(
                "h-3 w-3 absolute -top-1 -right-1 bg-background rounded-full",
                currentMode?.mode === 3 ? "text-emerald-500" : "text-blue-500"
              )} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <span className={cn(
              "text-[13px] truncate block leading-tight",
              isSelected ? "font-semibold text-foreground" : "font-medium text-foreground/90"
            )}>
              {cleanDisplayName(agent.displayName)}
            </span>
          </div>
        </button>

        {/* Edit button - always visible for selected, hover for others */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-1 h-7 w-7 p-0 rounded-md transition-all duration-150 hover:bg-muted",
            isSelected
              ? "opacity-100 bg-muted/50"
              : "opacity-0 group-hover/agent:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/agents/${agent.id}`)
          }}
          title="Edit agent"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      </div>
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
            agentId: selectedAgents[0],        // Primary field name (standardized)
            expertId: selectedAgents[0],       // Backwards compatibility
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
            agentId: selectedResearchExpert,        // Primary field name (standardized)
            expertId: selectedResearchExpert,       // Backwards compatibility
            expert: {
              id: selectedAgent.id,
              name: selectedAgent.displayName,
              slug: (selectedAgent as any).slug || selectedAgent.id, // Required by Expert type
              level: getAgentLevelDisplay(selectedAgent.tier),
              specialty: selectedAgent.description?.slice(0, 50) || '',
              domain: (selectedAgent as any).department || (selectedAgent as any).function || ''
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
              agentId: selectedAgents[0],        // Primary field name (standardized)
              expertId: selectedAgents[0],       // Backwards compatibility
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
              agentId: selectedResearchExpert,        // Primary field name (standardized)
              expertId: selectedResearchExpert,       // Backwards compatibility
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
      {/* Title - Responsive: icon only when collapsed, full title when expanded */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary shrink-0" />
          <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">Ask Expert</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7 group-data-[collapsible=icon]:hidden">AI-powered expert consultation</p>
      </div>

      {/* Modes Section (when on landing page - matches Views pattern in Tools/Skills) */}
      {!currentMode && (
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Modes
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/ask-expert/interactive?mode=manual">
                        <User className="h-4 w-4" />
                        <span>Expert Chat</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/ask-expert/interactive?mode=auto">
                        <SparklesIcon className="h-4 w-4" />
                        <span>Smart Copilot</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/ask-expert/autonomous?mode=manual">
                        <Target className="h-4 w-4" />
                        <span>Mission Control</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/ask-expert/autonomous?mode=auto">
                        <Zap className="h-4 w-4" />
                        <span>Background Mission</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
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

      {/* ============================================================
          1. QUICK ACTIONS (Always on top)
          ============================================================ */}
      {/* Collapsed icon for Quick Actions */}
      <SidebarGroup className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-2">
        <SidebarMenu className="flex flex-col items-center gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleNewChat} disabled={isCreatingChat} tooltip="New Consultation" className="h-10 w-10 p-0 flex items-center justify-center">
              {isCreatingChat ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <PlusIcon className="h-5 w-5" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleRefresh} disabled={isRefreshing} tooltip="Refresh" className="h-10 w-10 p-0 flex items-center justify-center">
              {isRefreshing ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCwIcon className="h-5 w-5" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Expanded Quick Actions */}
      <Collapsible defaultOpen className="group/collapsible group-data-[collapsible=icon]:hidden">
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
                <SidebarMenuItem>
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

      <Separator className="my-2 group-data-[collapsible=icon]:hidden" />

      {/* ============================================================
          2. CONVERSATIONS (Flat list, no subheaders, collapsible)
          ============================================================ */}
      {/* Collapsed icon for Conversations */}
      <SidebarGroup className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-2">
        <SidebarMenu className="flex flex-col items-center">
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleNewChat} tooltip={`Conversations (${conversations.length})`} className="h-10 w-10 p-0 flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Expanded Conversations */}
      <Collapsible defaultOpen className="group/collapsible group-data-[collapsible=icon]:hidden">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" />
                Conversations
                {conversations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {conversations.length}
                  </Badge>
                )}
              </span>
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
                  placeholder="Search… (⌘K)"
                  className="h-8 pl-8 text-sm"
                />
              </div>

              {sessionsLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!sessionsLoading && conversations.length === 0 && (
                <div className="px-2 py-4 text-center">
                  <MessageSquare className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">No conversations yet</p>
                </div>
              )}

              {!sessionsLoading && conversations.length > 0 && (
                <ScrollArea className="max-h-[calc(100vh-300px)]">
                  <SidebarMenu className="px-1">
                    {/* Pinned conversations */}
                    {groupedSessions.pinned.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <PinIcon className="h-3 w-3" />
                          Pinned
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4">{groupedSessions.pinned.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedSessions.pinned.map((session, idx) => renderSessionItem(session, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Today */}
                    {groupedSessions.today.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          Today
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4">{groupedSessions.today.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedSessions.today.map((session, idx) => renderSessionItem(session, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Yesterday */}
                    {groupedSessions.yesterday.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          Yesterday
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4">{groupedSessions.yesterday.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedSessions.yesterday.map((session, idx) => renderSessionItem(session, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Last 7 Days */}
                    {groupedSessions.last7Days.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          Last Week
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4">{groupedSessions.last7Days.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedSessions.last7Days.map((session, idx) => renderSessionItem(session, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Last 30 Days */}
                    {groupedSessions.last30Days.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          Last Month
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4">{groupedSessions.last30Days.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedSessions.last30Days.map((session, idx) => renderSessionItem(session, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Older */}
                    {groupedSessions.older.length > 0 && (
                      <Collapsible className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <ArchiveIcon className="h-3 w-3" />
                          Older
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4">{groupedSessions.older.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedSessions.older.map((session, idx) => renderSessionItem(session, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </SidebarMenu>
                </ScrollArea>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* ============================================================
          2.5 MISSIONS (Mode 3/4 Deep Research & Background Tasks)
          ============================================================ */}
      {/* Collapsed icon for Missions */}
      <SidebarGroup className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-2">
        <SidebarMenu className="flex flex-col items-center">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={`Missions (${missions.length})`} className="h-10 w-10 p-0 flex items-center justify-center">
              <Rocket className="h-5 w-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Expanded Missions */}
      <Collapsible defaultOpen={missions.length > 0} className="group/collapsible group-data-[collapsible=icon]:hidden">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Rocket className="h-3.5 w-3.5" />
                Missions
                {missions.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {missions.length}
                  </Badge>
                )}
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {sessionsLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!sessionsLoading && missions.length === 0 && (
                <div className="px-2 py-4 text-center">
                  <Rocket className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">No research missions yet</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Start a Mode 3 consultation</p>
                </div>
              )}

              {!sessionsLoading && missions.length > 0 && (
                <ScrollArea className="max-h-[200px]">
                  <SidebarMenu className="px-1">
                    {/* Running missions */}
                    {groupedMissions.running.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <Play className="h-3 w-3 text-green-500" />
                          Running
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4 border-green-300 text-green-600">{groupedMissions.running.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedMissions.running.map((mission, idx) => renderSessionItem(mission, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Draft missions */}
                    {groupedMissions.draft.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <Clock className="h-3 w-3 text-amber-500" />
                          Drafts
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4 border-amber-300 text-amber-600">{groupedMissions.draft.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedMissions.draft.map((mission, idx) => renderSessionItem(mission, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Completed missions */}
                    {groupedMissions.completed.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <CheckCircle2 className="h-3 w-3 text-blue-500" />
                          Completed
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4 border-blue-300 text-blue-600">{groupedMissions.completed.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedMissions.completed.map((mission, idx) => renderSessionItem(mission, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Failed missions */}
                    {groupedMissions.failed.length > 0 && (
                      <Collapsible className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          Failed
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4 border-red-300 text-red-600">{groupedMissions.failed.length}</Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedMissions.failed.map((mission, idx) => renderSessionItem(mission, idx))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </SidebarMenu>
                </ScrollArea>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Separator className="my-2 group-data-[collapsible=icon]:hidden" />

      {/* ============================================================
          3. AGENTS (Flat list, collapsible, with CRUD)
          ============================================================ */}
      {/* Collapsed icon for Agents */}
      <SidebarGroup className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-2">
        <SidebarMenu className="flex flex-col items-center">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={`Agents (${agents.length})`} className="h-10 w-10 p-0 flex items-center justify-center">
              <Link href="/agents">
                <Users className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Expanded Agents */}
      <Collapsible defaultOpen className="group/collapsible group-data-[collapsible=icon]:hidden">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                {currentMode?.mode === 3 ? 'Select Research Lead' : currentMode?.mode === 1 ? 'Select Expert' : 'Agents'}
                {agents.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {agents.length}
                  </Badge>
                )}
              </span>
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

              {agentsLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!agentsLoading && agents.length === 0 && (
                <div className="px-2 py-4 text-center">
                  <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground mb-2">No agents yet</p>
                  <Link href="/agents">
                    <Button size="sm" variant="outline" className="text-xs">
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      Browse Store
                    </Button>
                  </Link>
                </div>
              )}

              {!agentsLoading && filteredAgents.length > 0 && (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-1 px-1">
                    {/* Grouped by field of expertise */}
                    {groupedAgents.sortedDomains.map((domain) => (
                      <Collapsible key={domain} defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          <Briefcase className="h-3 w-3" />
                          {domain}
                          <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4">
                            {groupedAgents.groups[domain].length}
                          </Badge>
                          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedAgents.groups[domain].map((agent) => renderAgentItem(agent))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
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
