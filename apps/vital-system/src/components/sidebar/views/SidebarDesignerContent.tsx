"use client"

import {
  Bot,
  Clock,
  FileText,
  GitBranch,
  History,
  Layers as LayersIcon,
  MessageSquare,
  Palette,
  Puzzle,
  Settings,
  Star,
  Upload,
  Users,
  Zap,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"
import { useDesigner } from "@/contexts/designer-context"

/**
 * Designer sidebar content.
 * Displays workflow actions, panel types, expert modes, and components.
 * [PROD] - Production ready
 */
export function SidebarDesignerContent() {
  const { onPanelSelect } = useDesigner();

  return (
    <>
      {/* Workflow Actions */}
      <SidebarCollapsibleSection title="Workflow Actions" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('new')}>
              <Palette className="h-4 w-4" />
              <span>New Workflow</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('import')}>
              <Upload className="h-4 w-4" />
              <span>Import Workflow</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('templates')}>
              <FileText className="h-4 w-4" />
              <span>Templates</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Panel Workflows (6 types) */}
      <SidebarCollapsibleSection title="Panel Workflows" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('structured_panel')}>
              <Users className="h-4 w-4" />
              <span>Structured Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('open_panel')}>
              <MessageSquare className="h-4 w-4" />
              <span>Open Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('socratic_panel')}>
              <MessageSquare className="h-4 w-4" />
              <span>Socratic Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('adversarial_panel')}>
              <GitBranch className="h-4 w-4" />
              <span>Adversarial Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('delphi_panel')}>
              <LayersIcon className="h-4 w-4" />
              <span>Delphi Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('hybrid_panel')}>
              <Users className="h-4 w-4" />
              <span>Hybrid Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Ask Expert Modes (4 modes) */}
      <SidebarCollapsibleSection title="Expert Modes" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('mode1_ask_expert')}>
              <Zap className="h-4 w-4" />
              <span>Mode 1: Quick Response</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('mode2_ask_expert')}>
              <LayersIcon className="h-4 w-4" />
              <span>Mode 2: Context + RAG</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('mode3_ask_expert')}>
              <GitBranch className="h-4 w-4" />
              <span>Mode 3: Multi-Agent</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onPanelSelect('mode4_ask_expert')}>
              <Bot className="h-4 w-4" />
              <span>Mode 4: Agent + Tools</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Recent Workflows */}
      <SidebarCollapsibleSection title="Recent Workflows" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <History className="h-4 w-4" />
              <span>Last Edited</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Clock className="h-4 w-4" />
              <span>Recent Runs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Workflow Components */}
      <SidebarCollapsibleSection title="Components" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Bot className="h-4 w-4" />
              <span>Agent Nodes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Puzzle className="h-4 w-4" />
              <span>Task Nodes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Tool Nodes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarDesignerContent
