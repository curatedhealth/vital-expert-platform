"use client"

import {
  CheckCircle2,
  Clock,
  Layers,
  Settings,
  Workflow,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Workflows sidebar content.
 * Displays workflow status and integration options.
 * [PROD] - Production ready
 */
export function SidebarWorkflowsContent() {
  return (
    <>
      <SidebarCollapsibleSection title="Workflow Status" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Workflow className="h-4 w-4" />
              <span>Active</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Clock className="h-4 w-4" />
              <span>Scheduled</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      <SidebarCollapsibleSection title="Integration" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Layers className="h-4 w-4" />
              <span>Connected Systems</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarWorkflowsContent
