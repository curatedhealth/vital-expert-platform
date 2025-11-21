"use client"

import { useMemo, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { useAuth, sanitizeDisplayName } from "@/lib/auth/supabase-auth-context"
import { cn } from "@/shared/services/utils"
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
  SidebarDesignerContent,
  SidebarServiceTemplatesContent,
} from "@/components/sidebar-view-content"
import { SidebarPersonasContent } from "@/components/sidebar-view-content/sidebar-personas-content"

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
    if (pathname.startsWith("/ask-expert")) {
      return <SidebarAskExpert />
    }
    if (pathname.startsWith("/ask-panel-v1")) {
      return <SidebarDesignerContent />
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
    if (pathname.startsWith("/prism")) {
      return <SidebarPromptPrismContent />
    }
    if (pathname.startsWith("/service-templates")) {
      return <SidebarServiceTemplatesContent />
    }
    if (pathname.startsWith("/personas")) {
      return <SidebarPersonasContent />
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
    <Sidebar collapsible="icon" className={cn("border-r", className)} {...props}>
      <SidebarHeader className="px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-foreground">Startup</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4 space-y-4 overflow-y-auto">
        {renderContent()}
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4">
        {mounted && user ? <NavUser user={sidebarUser} /> : <div className="h-16" />}
      </SidebarFooter>
    </Sidebar>
  )
}
