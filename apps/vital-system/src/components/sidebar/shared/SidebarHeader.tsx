"use client"

import React from "react"
import { LucideIcon } from "lucide-react"

interface SidebarHeaderProps {
  title: string
  subtitle?: string
  icon: LucideIcon
}

/**
 * Shared header pattern for sidebar views.
 * Displays title with icon and optional subtitle.
 */
export function SidebarHeader({ title, subtitle, icon: Icon }: SidebarHeaderProps) {
  return (
    <div className="px-4 py-3 border-b">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  )
}

export default SidebarHeader
