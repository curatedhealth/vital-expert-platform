"use client"

import React from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

interface SidebarCollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: number | string
  className?: string
}

/**
 * Shared collapsible section pattern used across all sidebar views.
 * Provides consistent styling and behavior for expandable sidebar sections.
 */
export function SidebarCollapsibleSection({
  title,
  children,
  defaultOpen = true,
  badge,
  className = "",
}: SidebarCollapsibleSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className={`group/collapsible ${className}`}>
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md px-2 py-1.5">
            <span>{title}</span>
            {badge !== undefined && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {badge}
              </Badge>
            )}
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            {children}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

export default SidebarCollapsibleSection
