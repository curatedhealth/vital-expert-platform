"use client"

import Link from "next/link"
import {
  Bot,
  FileText,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Medical Strategy sidebar content.
 * Displays evidence synthesis, strategic analytics, and quick actions.
 * [PROD] - Production ready
 */
export function SidebarMedicalStrategyContent() {
  return (
    <>
      <SidebarCollapsibleSection title="Evidence Synthesis" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/medical-strategy">
                <Target className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/medical-strategy?tab=evidence">
                <FileText className="h-4 w-4" />
                <span>Evidence Synthesis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/medical-strategy?tab=competitive">
                <Target className="h-4 w-4" />
                <span>Competitive Intel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/medical-strategy?tab=kol">
                <Users className="h-4 w-4" />
                <span>KOL Network</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      <SidebarCollapsibleSection title="Strategic Analytics" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/medical-strategy?tab=insights">
                <Sparkles className="h-4 w-4" />
                <span>AI Insights</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/value">
                <TrendingUp className="h-4 w-4" />
                <span>Value View</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/ontology-explorer">
                <Layers className="h-4 w-4" />
                <span>Ontology Explorer</span>
              </Link>
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
                <span>Ask Expert</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/agents">
                <Users className="h-4 w-4" />
                <span>Browse Agents</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarMedicalStrategyContent
