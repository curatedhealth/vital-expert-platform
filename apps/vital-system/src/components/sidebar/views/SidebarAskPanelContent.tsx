"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Zap,
  Users,
  Sparkles,
  Brain,
  Swords,
  Vote,
  Target,
  Clock,
  Star,
  History,
  ChevronRight,
  Loader2,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useSavedPanels } from "@/contexts/ask-panel-context"
import { useRecentPanels } from "@/hooks/usePanelAPI"
import { SidebarCollapsibleSection } from "../shared"
import { cn } from "@/lib/shared/utils"

// Panel type configurations
const PANEL_TYPES = [
  { type: 'structured', name: 'Structured', icon: Users, color: 'bg-purple-500' },
  { type: 'open', name: 'Open', icon: Sparkles, color: 'bg-violet-500' },
  { type: 'socratic', name: 'Socratic', icon: Brain, color: 'bg-fuchsia-500' },
  { type: 'adversarial', name: 'Debate', icon: Swords, color: 'bg-rose-500' },
  { type: 'delphi', name: 'Delphi', icon: Vote, color: 'bg-indigo-500' },
  { type: 'hybrid', name: 'Hybrid', icon: Target, color: 'bg-cyan-500' },
]

// Format time ago
function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Status badge component
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-emerald-500',
    running: 'bg-amber-500 animate-pulse',
    failed: 'bg-rose-500',
    created: 'bg-slate-400',
  }
  return (
    <span className={cn('w-1.5 h-1.5 rounded-full', colors[status] || 'bg-slate-400')} />
  )
}

/**
 * Ask Panel sidebar content.
 * Displays quick actions, history, and saved panels.
 */
export function SidebarAskPanelContent() {
  const router = useRouter()
  const { savedPanels, loading: panelsLoading } = useSavedPanels()
  const { data: recentPanelsData, isLoading: historyLoading } = useRecentPanels()

  const recentHistory = recentPanelsData?.panels || []
  const bookmarkedPanels = savedPanels.filter(p => p.isBookmarked)

  return (
    <>
      {/* Quick Actions */}
      <SidebarCollapsibleSection title="Quick Actions" defaultOpen>
        <div className="px-2 space-y-2">
          {/* Primary Action */}
          <button
            onClick={() => router.push('/ask-panel/autonomous')}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
              'hover:from-purple-700 hover:to-pink-700 transition-all',
              'text-sm font-medium'
            )}
          >
            <Zap className="h-4 w-4" />
            <span>New Panel</span>
          </button>

          {/* Panel Types Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {PANEL_TYPES.map((panel) => {
              const Icon = panel.icon
              return (
                <button
                  key={panel.type}
                  onClick={() => router.push(`/ask-panel/interactive?type=${panel.type}`)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg',
                    'hover:bg-sidebar-accent transition-colors',
                    'text-xs text-muted-foreground hover:text-foreground'
                  )}
                  title={panel.name}
                >
                  <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', panel.color)}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="truncate w-full text-center">{panel.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </SidebarCollapsibleSection>

      {/* Recent History */}
      <SidebarCollapsibleSection title="History" defaultOpen>
        {historyLoading ? (
          <div className="px-2 py-4 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : recentHistory.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <History className="h-5 w-5 mx-auto text-muted-foreground/50 mb-1" />
            <p className="text-xs text-muted-foreground">No recent panels</p>
          </div>
        ) : (
          <SidebarMenu>
            {recentHistory.slice(0, 5).map((panel: any) => (
              <SidebarMenuItem key={panel.id}>
                <SidebarMenuButton
                  className="w-full group"
                  onClick={() => router.push(`/ask-panel/${panel.id}`)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <StatusDot status={panel.status} />
                    <span className="flex-1 text-sm truncate">
                      {panel.query || panel.name || 'Untitled'}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:hidden">
                    {formatTimeAgo(panel.updated_at || panel.created_at)}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground hidden group-hover:block" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {recentHistory.length > 5 && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => router.push('/ask-panel/history')}
                >
                  <span>View all history</span>
                  <ChevronRight className="h-3 w-3 ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        )}
      </SidebarCollapsibleSection>

      {/* My Panels (Saved/Bookmarked) */}
      {savedPanels.length > 0 && (
        <SidebarCollapsibleSection title={`My Panels (${savedPanels.length})`} defaultOpen>
          {panelsLoading ? (
            <div className="px-2 py-4 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SidebarMenu>
              {/* Show bookmarked first, then others */}
              {[...bookmarkedPanels, ...savedPanels.filter(p => !p.isBookmarked)].slice(0, 6).map((panel) => {
                const IconComponent = panel.IconComponent || Users
                return (
                  <SidebarMenuItem key={panel.id}>
                    <SidebarMenuButton
                      className="w-full group"
                      onClick={() => router.push(`/ask-panel/execute/${panel.id}`)}
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-3 w-3 text-white" />
                      </div>
                      <span className="flex-1 text-sm truncate">{panel.name}</span>
                      {panel.isBookmarked && (
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {savedPanels.length > 6 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/ask-panel')}
                  >
                    <span>View all panels</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          )}
        </SidebarCollapsibleSection>
      )}

      {/* Empty State for New Users */}
      {savedPanels.length === 0 && !panelsLoading && (
        <div className="px-4 py-6 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm font-medium mb-1">No saved panels</p>
          <p className="text-xs text-muted-foreground mb-3">
            Create panels to consult with AI experts
          </p>
          <button
            onClick={() => router.push('/ask-panel/autonomous')}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            Create your first panel →
          </button>
        </div>
      )}
    </>
  )
}

export default SidebarAskPanelContent
