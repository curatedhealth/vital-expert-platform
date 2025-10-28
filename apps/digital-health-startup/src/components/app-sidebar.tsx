"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"

import { useAuth } from "@/lib/auth/supabase-auth-context"
import { cn } from "@/shared/services/utils"
import { NavUser } from "@/components/nav-user"
import { SidebarAskExpert } from "@/components/sidebar-ask-expert"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  SidebarDashboardContent,
  SidebarAgentsContent,
  SidebarAskPanelContent,
  SidebarKnowledgeContent,
  SidebarPromptPrismContent,
  SidebarSolutionBuilderContent,
  SidebarWorkflowsContent,
} from "@/components/sidebar-view-content"

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()

  const sidebarUser = {
    name: user?.user_metadata?.full_name || user?.email || "Anonymous User",
    email: user?.email || "",
    avatar: user?.user_metadata?.avatar_url || "",
  }

  const content = useMemo(() => {
    if (!pathname) return <SidebarDashboardContent />
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
    if (pathname.startsWith("/prism")) {
      return <SidebarPromptPrismContent />
    }
    return <SidebarDashboardContent />
  }, [pathname])

  return (
    <Sidebar collapsible="icon" className={cn("border-r", className)} {...props}>
      <SidebarContent className="px-3 py-4 space-y-4 overflow-y-auto">
        {content}
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4">
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
