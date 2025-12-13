"use client"

import {
  ArrowRight,
  Cloud,
  Puzzle,
  Settings,
  Wand2,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Solution Builder sidebar content.
 * Displays builder templates, components, and actions.
 * [PROD] - Production ready
 */
export function SidebarSolutionBuilderContent() {
  return (
    <>
      <SidebarCollapsibleSection title="Builder" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Wand2 className="h-4 w-4" />
              <span>Templates</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Puzzle className="h-4 w-4" />
              <span>Components</span>
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

      <SidebarCollapsibleSection title="Actions" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <ArrowRight className="h-4 w-4" />
              <span>Preview</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Cloud className="h-4 w-4" />
              <span>Deploy</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarSolutionBuilderContent
