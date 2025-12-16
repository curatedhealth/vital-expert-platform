"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Loader2,
  ChevronDown,
  Pin,
  PinOff,
  Archive,
  MoreVertical,
  Pencil,
  X,
  CheckIcon,
  Trash2Icon,
  Stethoscope,
  Shield,
  TrendingUp,
  BarChart3,
  Cpu,
  Users,
  Zap,
  LayoutGrid,
  Star,
  Clock,
  BookOpen,
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { useSavedPanels, type SavedPanel } from "@/contexts/ask-panel-context"

// Panel category configuration
const PANEL_CATEGORIES = [
  {
    id: 'clinical',
    name: 'Clinical Trials',
    icon: Stethoscope,
    description: 'Trial design, protocol, DCT planning',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'regulatory',
    name: 'Regulatory',
    icon: Shield,
    description: 'FDA submissions, HIPAA, compliance',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'market_access',
    name: 'Market Access',
    icon: TrendingUp,
    description: 'Payer strategy, HEOR, launch',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'analytical',
    name: 'Analytics',
    icon: BarChart3,
    description: 'RWE studies, data management',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: Cpu,
    description: 'DTx development, precision medicine',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    id: 'panel',
    name: 'Panel Formats',
    icon: Users,
    description: 'Structured, expert, Socratic panels',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
]

/**
 * Enhanced Ask Panel sidebar content.
 * Matches the Ask Expert sidebar design with:
 * - New Panel button
 * - 6 panel categories
 * - Panel history with time-based grouping
 * - Quick actions (refresh, browse templates)
 * - Pin/archive/rename functionality
 */
export function SidebarAskPanelContent() {
  const router = useRouter()
  const {
    savedPanels,
    loading,
    refreshPanels,
    removePanel,
    toggleBookmark,
    updatePanel,
  } = useSavedPanels()

  // Local state
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pinnedPanels, setPinnedPanels] = useState<Set<string>>(new Set())
  const [archivedPanels, setArchivedPanels] = useState<Set<string>>(new Set())
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({})
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  // Load state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ask-panel-pinned')
      if (stored) setPinnedPanels(new Set(JSON.parse(stored)))

      const archivedStored = localStorage.getItem('ask-panel-archived')
      if (archivedStored) setArchivedPanels(new Set(JSON.parse(archivedStored)))

      const titlesStored = localStorage.getItem('ask-panel-custom-titles')
      if (titlesStored) setCustomTitles(JSON.parse(titlesStored))
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ask-panel-pinned', JSON.stringify(Array.from(pinnedPanels)))
    }
  }, [pinnedPanels])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ask-panel-archived', JSON.stringify(Array.from(archivedPanels)))
    }
  }, [archivedPanels])

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(customTitles).length > 0) {
      localStorage.setItem('ask-panel-custom-titles', JSON.stringify(customTitles))
    }
  }, [customTitles])

  // Focus input when editing starts
  useEffect(() => {
    if (editingPanelId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingPanelId])

  const togglePin = useCallback((panelId: string) => {
    setPinnedPanels(prev => {
      const next = new Set(prev)
      if (next.has(panelId)) {
        next.delete(panelId)
      } else {
        next.add(panelId)
      }
      return next
    })
  }, [])

  const toggleArchive = useCallback((panelId: string) => {
    setArchivedPanels(prev => {
      const next = new Set(prev)
      if (next.has(panelId)) {
        next.delete(panelId)
      } else {
        next.add(panelId)
      }
      return next
    })
  }, [])

  const startRename = useCallback((panelId: string, currentTitle: string) => {
    setEditingPanelId(panelId)
    setEditingTitle(currentTitle)
  }, [])

  const saveRename = useCallback(async () => {
    if (editingPanelId && editingTitle.trim()) {
      setCustomTitles(prev => ({
        ...prev,
        [editingPanelId]: editingTitle.trim()
      }))
      // Also update in database
      try {
        await updatePanel(editingPanelId, { name: editingTitle.trim() })
      } catch (error) {
        console.error('Failed to save panel name:', error)
      }
    }
    setEditingPanelId(null)
    setEditingTitle("")
  }, [editingPanelId, editingTitle, updatePanel])

  const cancelRename = useCallback(() => {
    setEditingPanelId(null)
    setEditingTitle("")
  }, [])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    try {
      setIsRefreshing(true)
      await refreshPanels()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshPanels])

  const handleNewPanel = useCallback(() => {
    router.push('/ask-panel?new=true')
  }, [router])

  const handleDeletePanel = useCallback(async (panelId: string) => {
    try {
      await removePanel(panelId)
    } catch (error) {
      console.error('Failed to delete panel:', error)
    }
  }, [removePanel])

  // Get panel display title
  const getPanelTitle = useCallback((panel: SavedPanel): string => {
    if (customTitles[panel.id]) return customTitles[panel.id]
    return panel.name
  }, [customTitles])

  // Group panels by time period
  const groupedPanels = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Filter: exclude archived, apply search
    const visiblePanels = savedPanels.filter(panel => {
      if (archivedPanels.has(panel.id)) return false

      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase()
        const name = (panel.name || "").toLowerCase()
        const desc = (panel.description || "").toLowerCase()
        const category = (panel.category || "").toLowerCase()
        return name.includes(searchLower) || desc.includes(searchLower) || category.includes(searchLower)
      }

      return true
    })

    // Separate pinned and bookmarked
    const pinned = visiblePanels.filter(p => pinnedPanels.has(p.id) || p.isBookmarked)
    const unpinned = visiblePanels.filter(p => !pinnedPanels.has(p.id) && !p.isBookmarked)

    // Group unpinned by time
    const todayPanels: SavedPanel[] = []
    const yesterdayPanels: SavedPanel[] = []
    const last7DaysPanels: SavedPanel[] = []
    const last30DaysPanels: SavedPanel[] = []
    const olderPanels: SavedPanel[] = []

    unpinned.forEach(panel => {
      const panelDate = new Date(panel.last_used_at || panel.updated_at || panel.created_at || now)
      if (panelDate >= today) {
        todayPanels.push(panel)
      } else if (panelDate >= yesterday) {
        yesterdayPanels.push(panel)
      } else if (panelDate >= sevenDaysAgo) {
        last7DaysPanels.push(panel)
      } else if (panelDate >= thirtyDaysAgo) {
        last30DaysPanels.push(panel)
      } else {
        olderPanels.push(panel)
      }
    })

    return {
      pinned,
      today: todayPanels,
      yesterday: yesterdayPanels,
      last7Days: last7DaysPanels,
      last30Days: last30DaysPanels,
      older: olderPanels,
    }
  }, [savedPanels, pinnedPanels, archivedPanels, searchQuery])

  // Get category icon component
  const getCategoryIcon = useCallback((category: string) => {
    const cat = PANEL_CATEGORIES.find(c => c.id === category)
    return cat?.icon || Users
  }, [])

  const getCategoryColor = useCallback((category: string) => {
    const cat = PANEL_CATEGORIES.find(c => c.id === category)
    return cat?.color || 'text-muted-foreground'
  }, [])

  // Render a single panel item
  const renderPanelItem = (panel: SavedPanel) => {
    const isPinned = pinnedPanels.has(panel.id) || panel.isBookmarked
    const isEditing = editingPanelId === panel.id
    const displayTitle = getPanelTitle(panel)
    const IconComponent = getCategoryIcon(panel.category)
    const iconColor = getCategoryColor(panel.category)

    if (isEditing) {
      return (
        <SidebarMenuItem key={panel.id}>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <IconComponent className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
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
              placeholder="Panel name..."
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
      <SidebarMenuItem key={panel.id}>
        <div className="group/panel relative">
          <SidebarMenuButton
            asChild
            className="py-2.5 px-2 rounded-lg transition-all duration-150 hover:bg-muted/60"
          >
            <Link href={`/ask-panel?panelId=${panel.id}`}>
              <div className="flex items-start gap-2.5 w-full min-w-0">
                {/* Panel Icon */}
                <div className="relative shrink-0 mt-0.5">
                  <div className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center",
                    "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                  )}>
                    <IconComponent className={cn("h-3.5 w-3.5", iconColor)} />
                  </div>
                  {isPinned && (
                    <Pin className="h-2.5 w-2.5 text-amber-500 absolute -top-1 -right-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] truncate leading-tight font-medium text-foreground/90">
                      {displayTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground/60 truncate capitalize">
                      {panel.category.replace('_', ' ')}
                    </span>
                    {panel.suggestedAgents && panel.suggestedAgents.length > 0 && (
                      <span className="text-[10px] text-muted-foreground/50 shrink-0">
                        · {panel.suggestedAgents.length} experts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </SidebarMenuButton>

          {/* Quick Actions on hover */}
          <div className="absolute top-1/2 -translate-y-1/2 right-1.5 flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-md transition-opacity duration-150 opacity-0 group-hover/panel:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                startRename(panel.id, displayTitle)
              }}
            >
              <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-md hover:bg-muted transition-opacity duration-150 opacity-0 group-hover/panel:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    startRename(panel.id, displayTitle)
                  }}
                  className="text-[13px]"
                >
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePin(panel.id)
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
                    toggleBookmark(panel.id)
                  }}
                  className="text-[13px]"
                >
                  <Star className="h-3.5 w-3.5 mr-2" />
                  {panel.isBookmarked ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleArchive(panel.id)
                  }}
                  className="text-[13px]"
                >
                  <Archive className="h-3.5 w-3.5 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePanel(panel.id)
                  }}
                  className="text-red-600 dark:text-red-400 text-[13px]"
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

  return (
    <>
      {/* Title Section */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary shrink-0" />
          <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">Ask Panel</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7 group-data-[collapsible=icon]:hidden">
          Multi-expert collaborative consultations
        </p>
      </div>

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
                  <SidebarMenuButton onClick={handleNewPanel}>
                    <PlusIcon className="h-4 w-4" />
                    <span>New Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCwIcon className="h-4 w-4" />
                    )}
                    <span>Refresh</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuButton asChild>
                    <Link href="/ask-panel/templates">
                      <BookOpen className="h-4 w-4" />
                      <span>Browse Templates</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Separator className="my-2" />

      {/* Panel Categories */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5" />
                Panel Categories
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="px-2 grid grid-cols-2 gap-1.5">
                {PANEL_CATEGORIES.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Link
                      key={category.id}
                      href={`/ask-panel?category=${category.id}`}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                        "hover:bg-muted/80 border border-transparent hover:border-border/50",
                        "group/category"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center mb-1.5",
                        category.bgColor
                      )}>
                        <IconComponent className={cn("h-4 w-4", category.color)} />
                      </div>
                      <span className="text-[11px] font-medium text-center leading-tight">
                        {category.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Separator className="my-2" />

      {/* Panel History */}
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Panel History
              </span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {/* Panel Search */}
              <div className="relative px-2 mb-2">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search panels..."
                  className="h-8 pl-8 text-sm"
                />
              </div>

              {loading && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading panels...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {!loading && savedPanels.length === 0 && (
                <div className="px-2 py-4 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">No panels yet</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs mt-1"
                    onClick={handleNewPanel}
                  >
                    Create your first panel
                  </Button>
                </div>
              )}

              {!loading && savedPanels.length > 0 && (
                <ScrollArea className="max-h-[300px]">
                  <SidebarMenu>
                    {/* Pinned/Favorited Panels */}
                    {groupedPanels.pinned.length > 0 && (
                      <>
                        <div className="flex items-center gap-1.5 px-2 pt-2 pb-1">
                          <Pin className="h-3 w-3 text-amber-500" />
                          <span className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wide">
                            Pinned
                          </span>
                        </div>
                        {groupedPanels.pinned.map(renderPanelItem)}
                      </>
                    )}

                    {/* Today */}
                    {groupedPanels.today.length > 0 && (
                      <>
                        <div className="px-2 pt-3 pb-1">
                          <span className="text-[11px] font-medium text-muted-foreground/70">
                            Today
                          </span>
                        </div>
                        {groupedPanels.today.map(renderPanelItem)}
                      </>
                    )}

                    {/* Yesterday */}
                    {groupedPanels.yesterday.length > 0 && (
                      <>
                        <div className="px-2 pt-3 pb-1">
                          <span className="text-[11px] font-medium text-muted-foreground/70">
                            Yesterday
                          </span>
                        </div>
                        {groupedPanels.yesterday.map(renderPanelItem)}
                      </>
                    )}

                    {/* Last 7 Days */}
                    {groupedPanels.last7Days.length > 0 && (
                      <>
                        <div className="px-2 pt-3 pb-1">
                          <span className="text-[11px] font-medium text-muted-foreground/70">
                            Previous 7 Days
                          </span>
                        </div>
                        {groupedPanels.last7Days.map(renderPanelItem)}
                      </>
                    )}

                    {/* Last 30 Days */}
                    {groupedPanels.last30Days.length > 0 && (
                      <>
                        <div className="px-2 pt-3 pb-1">
                          <span className="text-[11px] font-medium text-muted-foreground/70">
                            Previous 30 Days
                          </span>
                        </div>
                        {groupedPanels.last30Days.map(renderPanelItem)}
                      </>
                    )}

                    {/* Older */}
                    {groupedPanels.older.length > 0 && (
                      <>
                        <div className="px-2 pt-3 pb-1">
                          <span className="text-[11px] font-medium text-muted-foreground/70">
                            Older
                          </span>
                        </div>
                        {groupedPanels.older.map(renderPanelItem)}
                      </>
                    )}
                  </SidebarMenu>
                </ScrollArea>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </>
  )
}

export default SidebarAskPanelContent
