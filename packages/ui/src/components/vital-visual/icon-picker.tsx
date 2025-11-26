"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"
import { Input } from "../input"
import { ScrollArea } from "../scroll-area"

/**
 * IconPicker - Icon Selection UI Component
 *
 * Provides a searchable grid interface for selecting icons from the VITAL library.
 * Supports filtering by category and color variant (black/purple).
 *
 * @example
 * ```tsx
 * <IconPicker
 *   onSelect={(iconName) => console.log('Selected:', iconName)}
 *   variant="purple"
 *   selectedIcon="analytics_chart"
 * />
 * ```
 */

export interface IconPickerProps {
  /** Callback when icon is selected */
  onSelect: (iconName: string) => void
  /** Currently selected icon */
  selectedIcon?: string
  /** Color variant filter */
  variant?: "black" | "purple" | "both"
  /** Available icon categories */
  categories?: string[]
  /** Maximum height of picker */
  maxHeight?: string
  /** Custom class name */
  className?: string
}

// Icon categories based on VITAL asset library
const defaultCategories = [
  "analytics",
  "workflow",
  "medical",
  "collaboration",
  "data",
  "navigation",
  "action",
  "status",
]

// Sample icon names - in production, this would be fetched from the icons table
const sampleIcons = [
  "analytics_chart",
  "analytics_dashboard",
  "analytics_insights",
  "workflow_node",
  "workflow_canvas",
  "workflow_connection",
  "medical_heart",
  "medical_brain",
  "medical_dna",
  "collaboration_team",
  "collaboration_chat",
  "collaboration_meeting",
  "data_database",
  "data_document",
  "data_folder",
  "navigation_menu",
  "navigation_home",
  "navigation_search",
  "action_play",
  "action_stop",
  "action_edit",
  "status_active",
  "status_inactive",
  "status_pending",
]

export const IconPicker: React.FC<IconPickerProps> = ({
  onSelect,
  selectedIcon,
  variant = "both",
  categories = defaultCategories,
  maxHeight = "400px",
  className,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [activeVariant, setActiveVariant] = React.useState<"black" | "purple">(
    variant === "both" ? "purple" : variant
  )

  const filteredIcons = React.useMemo(() => {
    return sampleIcons.filter((iconName) => {
      const matchesSearch = iconName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || iconName.startsWith(selectedCategory)
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className={cn("flex flex-col border rounded-lg bg-white", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Select Icon</h3>
          {variant === "both" && (
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setActiveVariant("black")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  activeVariant === "black"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Black
              </button>
              <button
                onClick={() => setActiveVariant("purple")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  activeVariant === "purple"
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Purple
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        {/* Category filters */}
        <ScrollArea className="w-full" orientation="horizontal">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                !selectedCategory
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                  selectedCategory === category
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Icon Grid */}
      <ScrollArea style={{ maxHeight }} className="p-4">
        {filteredIcons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No icons found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={cn(
                  "relative group flex items-center justify-center p-3 rounded-lg transition-all hover:scale-105",
                  selectedIcon === iconName
                    ? "bg-purple-50 ring-2 ring-purple-500"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
                title={iconName}
              >
                <Icon name={iconName} variant={activeVariant} size="lg" />
                {selectedIcon === iconName && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {selectedIcon && (
        <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-600">
          Selected: <span className="font-mono text-purple-700">{selectedIcon}</span>
        </div>
      )}
    </div>
  )
}

IconPicker.displayName = "IconPicker"
