"use client"

import Link from "next/link"
import {
  BookOpen,
  Bot,
  Pen,
  Stethoscope,
  FlaskConical,
  Shield,
  HeartPulse,
  UserCog,
  Users,
  Zap,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSavedPanels } from "@/contexts/ask-panel-context"
import { PANEL_TEMPLATES } from "@/features/ask-panel/constants/panel-templates"
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

function getCategoryIcon(category: string) {
  const key = category.toLowerCase().replace(/\s+/g, '-')
  return CATEGORY_ICONS[key] || CATEGORY_ICONS['default']
}

/**
 * Ask Panel sidebar content.
 * Displays saved panels, panel workflows, and resources.
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

      {/* Panel Workflows */}
      <SidebarCollapsibleSection title="Panel Workflows" defaultOpen>
        <ScrollArea className="h-[calc(100vh-400px)]">
          <SidebarMenu>
            {PANEL_TEMPLATES.map((template) => {
              const IconComponent = getCategoryIcon(template.category)

              return (
                <SidebarMenuItem key={template.id}>
                  <SidebarMenuButton
                    asChild
                    className="h-auto py-2 px-3 flex-col items-start gap-1"
                  >
                    <Link href={`/ask-panel?panelId=${template.id}`}>
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {template.name}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {template.description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 capitalize">
                              {template.category}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              <Zap className="w-2.5 h-2.5 mr-0.5" />
                              {template.mode}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              <Bot className="w-2.5 h-2.5 mr-0.5" />
                              {template.suggestedAgents.length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </ScrollArea>
      </SidebarCollapsibleSection>

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
