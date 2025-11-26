"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { AgentAvatar } from "./agent-avatar"
import { Input } from "../input"
import { ScrollArea } from "../scroll-area"

/**
 * AvatarGrid - Avatar Library Browser/Selector
 *
 * Provides a searchable grid interface for browsing and selecting agent avatars
 * from the VITAL library (500 avatars organized by persona type and department).
 *
 * @example
 * ```tsx
 * <AvatarGrid
 *   onSelect={(avatar) => console.log('Selected:', avatar)}
 *   selectedAvatar="vital_avatar_expert_medical_affairs_01"
 *   tier={2}
 * />
 * ```
 */

export interface AvatarGridProps {
  /** Callback when avatar is selected */
  onSelect: (avatarPath: string) => void
  /** Currently selected avatar */
  selectedAvatar?: string
  /** Filter by agent tier (1-5) */
  tier?: 1 | 2 | 3 | 4 | 5
  /** Filter by persona type */
  personaType?: "expert" | "foresight" | "medical" | "pharma" | "startup" | null
  /** Filter by department */
  department?:
    | "analytics_insights"
    | "commercial_marketing"
    | "market_access"
    | "medical_affairs"
    | "product_innovation"
    | null
  /** Maximum height of grid */
  maxHeight?: string
  /** Grid columns (responsive) */
  columns?: 4 | 6 | 8
  /** Show avatar details */
  showDetails?: boolean
  /** Custom class name */
  className?: string
}

const personaTypes = [
  { value: "expert", label: "Expert", color: "#9B5DE0" },
  { value: "foresight", label: "Foresight", color: "#FF3796" },
  { value: "medical", label: "Medical", color: "#EF4444" },
  { value: "pharma", label: "Pharma", color: "#0046FF" },
  { value: "startup", label: "Startup", color: "#292621" },
]

const departments = [
  { value: "analytics_insights", label: "Analytics & Insights" },
  { value: "commercial_marketing", label: "Commercial & Marketing" },
  { value: "market_access", label: "Market Access" },
  { value: "medical_affairs", label: "Medical Affairs" },
  { value: "product_innovation", label: "Product Innovation" },
]

export const AvatarGrid: React.FC<AvatarGridProps> = ({
  onSelect,
  selectedAvatar,
  tier = 2,
  personaType: initialPersonaType = null,
  department: initialDepartment = null,
  maxHeight = "600px",
  columns = 6,
  showDetails = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [personaType, setPersonaType] = React.useState<string | null>(initialPersonaType)
  const [department, setDepartment] = React.useState<string | null>(initialDepartment)

  // Generate avatar list based on filters
  const avatars = React.useMemo(() => {
    const personaList = personaType ? [personaType] : personaTypes.map((p) => p.value)
    const departmentList = department ? [department] : departments.map((d) => d.value)

    const generated: Array<{
      personaType: string
      department: string
      variant: number
      path: string
    }> = []

    personaList.forEach((persona) => {
      departmentList.forEach((dept) => {
        for (let i = 1; i <= 20; i++) {
          const paddedVariant = String(i).padStart(2, "0")
          const path = `vital_avatar_${persona}_${dept}_${paddedVariant}`
          generated.push({
            personaType: persona,
            department: dept,
            variant: i,
            path,
          })
        }
      })
    })

    return generated
  }, [personaType, department])

  const filteredAvatars = React.useMemo(() => {
    if (!searchQuery) return avatars

    return avatars.filter((avatar) => {
      return (
        avatar.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        avatar.personaType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        avatar.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [avatars, searchQuery])

  const gridColsClass = {
    4: "grid-cols-4",
    6: "grid-cols-6",
    8: "grid-cols-8",
  }[columns]

  return (
    <div className={cn("flex flex-col border rounded-lg bg-white", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Select Avatar</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {filteredAvatars.length} avatar{filteredAvatars.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search avatars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        {/* Filters */}
        <div className="space-y-2">
          {/* Persona Type Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Persona Type</label>
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex gap-2 pb-2">
                <button
                  onClick={() => setPersonaType(null)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors",
                    !personaType
                      ? "bg-purple-100 text-purple-700 ring-2 ring-purple-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  All
                </button>
                {personaTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPersonaType(type.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2",
                      personaType === type.value
                        ? "bg-purple-100 text-purple-700 ring-2 ring-purple-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.label}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Department</label>
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex gap-2 pb-2">
                <button
                  onClick={() => setDepartment(null)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors",
                    !department
                      ? "bg-teal-100 text-teal-700 ring-2 ring-teal-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  All
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.value}
                    onClick={() => setDepartment(dept.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors",
                      department === dept.value
                        ? "bg-teal-100 text-teal-700 ring-2 ring-teal-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Avatar Grid */}
      <ScrollArea style={{ maxHeight }} className="p-4">
        {filteredAvatars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-sm text-gray-500">No avatars found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={cn("grid gap-4", gridColsClass)}>
            {filteredAvatars.map((avatar) => {
              const isSelected = selectedAvatar === avatar.path
              const personaColor =
                personaTypes.find((p) => p.value === avatar.personaType)?.color || "#9B5DE0"

              return (
                <button
                  key={avatar.path}
                  onClick={() => onSelect(avatar.path)}
                  className={cn(
                    "relative group flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105",
                    isSelected
                      ? "bg-purple-50 ring-2 ring-purple-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <AgentAvatar
                    personaType={avatar.personaType as any}
                    department={avatar.department as any}
                    variant={avatar.variant}
                    tier={tier}
                    size="lg"
                    badgeColor={personaColor}
                    lazy={true}
                  />

                  {showDetails && (
                    <div className="mt-2 text-center">
                      <p className="text-[10px] font-medium text-gray-900 truncate max-w-full">
                        {avatar.personaType}
                      </p>
                      <p className="text-[9px] text-gray-500 truncate max-w-full">
                        #{avatar.variant}
                      </p>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M11 4L5.5 9.5L3 7"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {selectedAvatar && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Selected Avatar</p>
              <p className="text-xs font-mono text-purple-700 mt-0.5">{selectedAvatar}</p>
            </div>
            <button
              onClick={() => onSelect("")}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

AvatarGrid.displayName = "AvatarGrid"
