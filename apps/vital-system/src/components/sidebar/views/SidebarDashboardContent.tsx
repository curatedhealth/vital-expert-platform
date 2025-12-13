"use client"

import Link from "next/link"
import {
  Activity,
  BarChart,
  Bot,
  Cloud,
  FileText,
  History,
  LineChart,
  Star,
  Wand2,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Dashboard sidebar content.
 * Displays overview stats, quick actions, and recent items.
 */
export function SidebarDashboardContent() {
  return (
    <>
      <SidebarCollapsibleSection title="Overview" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Activity className="h-4 w-4" />
              <span>Recent Activity</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <LineChart className="h-4 w-4" />
              <span>Usage Trends</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      <SidebarCollapsibleSection title="Quick Actions" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/ask-expert">
                <Bot className="h-4 w-4" />
                <span>Start Conversation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/knowledge/upload">
                <Cloud className="h-4 w-4" />
                <span>Upload Knowledge</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/agents/create">
                <Wand2 className="h-4 w-4" />
                <span>Create Agent</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      <SidebarCollapsibleSection title="Recent" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <History className="h-4 w-4" />
              <span>Recent Chats</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <FileText className="h-4 w-4" />
              <span>Latest Reports</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarDashboardContent
