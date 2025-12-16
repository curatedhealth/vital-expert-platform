"use client"

import Link from "next/link"
import {
  BookOpen,
  Pen,
  Stethoscope,
  FlaskConical,
  Shield,
  HeartPulse,
  UserCog,
  Users,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useSavedPanels } from "@/contexts/ask-panel-context"
import { SidebarCollapsibleSection } from "../shared"

// Map category to icon
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'clinical': Stethoscope,
  'clinical-trials': Stethoscope,
  'research': FlaskConical,
  'regulatory': Shield,
  'patient-care': HeartPulse,
  'operations': UserCog,
  'default': Users,
}

/**
 * Ask Panel sidebar content.
 * Displays saved panels and resources.
 */
export function SidebarAskPanelContent() {
  const { savedPanels } = useSavedPanels()

  return (
    <>
      {/* My Panels */}
      {savedPanels.length > 0 && (
        <SidebarCollapsibleSection title={`My Panels (${savedPanels.length})`} defaultOpen>
          <SidebarMenu>
            {savedPanels.slice(0, 5).map((panel) => {
              const IconComponent = panel.IconComponent || Users
              return (
                <SidebarMenuItem key={panel.id}>
                  <SidebarMenuButton className="w-full">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mr-2">
                      <IconComponent className="h-3 w-3 text-white" />
                    </div>
                    <span className="flex-1 text-sm truncate">{panel.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarCollapsibleSection>
      )}

      {/* Resources */}
      <SidebarCollapsibleSection title="Resources" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <BookOpen className="h-4 w-4" />
              <span>Guidelines</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Pen className="h-4 w-4" />
              <span>Templates</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarAskPanelContent
