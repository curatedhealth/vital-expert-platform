"use client"

import React from "react"
import { SearchIcon } from "lucide-react"

interface SidebarSearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

/**
 * Shared search input pattern used across sidebar filter sections.
 * Provides consistent styling for searchable lists.
 */
export function SidebarSearchInput({
  placeholder = "Search...",
  value,
  onChange,
}: SidebarSearchInputProps) {
  return (
    <div className="px-2 pb-2">
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  )
}

export default SidebarSearchInput
