"use client"

import Link from "next/link"
import {
  BarChart,
  BookOpen,
  Bot,
  FolderOpen,
  GitBranch,
  Layers,
  Plus,
  Puzzle,
  SearchIcon,
  Upload,
  Users,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Knowledge Builder sidebar content.
 * Displays knowledge management navigation for domains, uploads, embeddings.
 * [PROD] - Production ready
 */
export function SidebarKnowledgeBuilderContent() {
  return (
    <>
      {/* Navigation */}
      <SidebarCollapsibleSection title="Knowledge Builder" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/knowledge?tab=overview">
                <BarChart className="h-4 w-4" />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/knowledge?tab=domains">
                <FolderOpen className="h-4 w-4" />
                <span>Domains</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/knowledge?tab=upload">
                <Upload className="h-4 w-4" />
                <span>Upload Documents</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/knowledge?tab=embeddings">
                <Layers className="h-4 w-4" />
                <span>Embeddings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/knowledge?tab=connections">
                <Puzzle className="h-4 w-4" />
                <span>Connections</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Quick Actions */}
      <SidebarCollapsibleSection title="Quick Actions" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/knowledge?tab=upload">
                <Plus className="h-4 w-4" />
                <span>New Upload</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/knowledge">
                <BookOpen className="h-4 w-4" />
                <span>Browse Library</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/knowledge?tab=search">
                <SearchIcon className="h-4 w-4" />
                <span>Search Knowledge</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Other Builders */}
      <SidebarCollapsibleSection title="Other Builders" defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/agent">
                <Bot className="h-4 w-4" />
                <span>Agent Builder</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer/panel">
                <Users className="h-4 w-4" />
                <span>Panel Builder</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/designer">
                <GitBranch className="h-4 w-4" />
                <span>Process Builder</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarKnowledgeBuilderContent
