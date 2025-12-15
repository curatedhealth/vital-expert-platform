"use client"

import { useMemo, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { useAuth, sanitizeDisplayName } from "@/lib/auth/supabase-auth-context"
import { cn } from "@/lib/shared/services/utils"
import { NavUser } from "@/components/nav-user"
import { SidebarAskExpert } from "@/components/sidebar-ask-expert"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  SidebarDashboardContent,
  SidebarAgentsContent,
  SidebarAskPanelContent,
  SidebarKnowledgeContent,
  SidebarPromptPrismContent,
  SidebarSolutionBuilderContent,
  SidebarWorkflowsContent,
  SidebarAdminContent,
  SidebarPersonasContent,
  SidebarDesignerContent,
  SidebarValueContent,
  SidebarKnowledgeBuilderContent,
  SidebarMedicalStrategyContent,
  SidebarToolsContent,
  SidebarSkillsContent,
} from "@/components/sidebar-view-content"

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, userProfile } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Ensure component only renders on client side after mount
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const sidebarUser = useMemo(() => ({
    name: sanitizeDisplayName(
      userProfile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name,
      user?.email || userProfile?.email
    ),
    email: user?.email || "",
    avatar: ((userProfile as any)?.avatar_url || user?.user_metadata?.avatar_url || "") as string,
  }), [user, userProfile])

  // Render content based on pathname - only compute after mount
  const renderContent = () => {
    if (!mounted) return <SidebarDashboardContent />

    if (!pathname) return <SidebarDashboardContent />
    if (pathname.startsWith("/admin")) {
      return <SidebarAdminContent />
    }
    // Check specific designer paths before general /designer
    if (pathname.startsWith("/designer/knowledge")) {
      return <SidebarKnowledgeBuilderContent />
    }
    if (pathname.startsWith("/designer")) {
      return <SidebarDesignerContent />
    }
    if (pathname.startsWith("/ask-expert")) {
      return <SidebarAskExpert />
    }
    if (pathname.startsWith("/ask-panel")) {
      return <SidebarAskPanelContent />
    }
    if (pathname.startsWith("/workflows")) {
      return <SidebarWorkflowsContent />
    }
    if (pathname.startsWith("/solution-builder")) {
      return <SidebarSolutionBuilderContent />
    }
    if (pathname.startsWith("/agents")) {
      return <SidebarAgentsContent />
    }
    if (pathname.startsWith("/knowledge")) {
      return <SidebarKnowledgeContent />
    }
    if (pathname.startsWith("/prism") || pathname.startsWith("/prompts")) {
      return <SidebarPromptPrismContent />
    }
    if (pathname.startsWith("/personas")) {
      return <SidebarPersonasContent />
    }
    if (pathname.startsWith("/value")) {
      return <SidebarValueContent />
    }
    if (pathname.startsWith("/medical-strategy")) {
      return <SidebarMedicalStrategyContent />
    }
    if (pathname.startsWith("/ontology-explorer")) {
      return <SidebarMedicalStrategyContent />
    }
    // Context-specific sidebars for /discover pages
    if (pathname.startsWith("/discover/tools")) {
      return <SidebarToolsContent />
    }
    if (pathname.startsWith("/discover/skills")) {
      return <SidebarSkillsContent />
    }
    return <SidebarDashboardContent />
  }

  // Don't render Sidebar until mounted (prevents SSR/hydration issues with context)
  // This ensures SidebarProvider context is available before Sidebar component renders
  if (!mounted) {
    return (
      <aside className={cn("border-r w-64 bg-sidebar flex flex-col", className)}>
        <div className="px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-foreground">Startup</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" />
        <div className="px-3 pb-4 border-t">
          <div className="h-16" />
        </div>
      </aside>
    )
  }

  return (
    <Sidebar collapsible="icon" className={cn("border-r border-border/40 bg-sidebar", className)} {...props}>
      <SidebarHeader className="px-3 py-3 border-b border-border/40 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="relative flex items-center gap-3">
          {/* Animated status indicator with glow */}
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-sm font-semibold text-foreground group-data-[collapsible=icon]:hidden">VITAL Platform</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 space-y-4 overflow-y-auto relative">
        {/* Subtle gradient overlay at top for depth */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/50 to-transparent pointer-events-none z-10" />
        {renderContent()}
        {/* Subtle gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/50 to-transparent pointer-events-none z-10" />
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 pt-3 border-t border-border/40 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/20 pointer-events-none" />
        <div className="relative">
          {mounted && user ? <NavUser user={sidebarUser} /> : <div className="h-16" />}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
