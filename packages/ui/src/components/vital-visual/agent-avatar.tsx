"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * AgentAvatar - Level 2 Expert Agent Avatar Component
 *
 * Displays agent avatars from the VITAL visual asset library (500 avatars).
 * Follows the 5 persona types × 5 departments × 20 variants taxonomy.
 *
 * Persona Types: expert, foresight, medical, pharma, startup
 * Departments: analytics_insights, commercial_marketing, market_access,
 *              medical_affairs, product_innovation
 *
 * @example
 * ```tsx
 * <AgentAvatar
 *   personaType="expert"
 *   department="medical_affairs"
 *   variant={1}
 *   size="lg"
 *   tier={2}
 * />
 * ```
 */

export interface AgentAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Persona type */
  personaType?: "expert" | "foresight" | "medical" | "pharma" | "startup"
  /** Department */
  department?: "analytics_insights" | "commercial_marketing" | "market_access" | "medical_affairs" | "product_innovation"
  /** Avatar variant number (1-20) */
  variant?: number
  /** Direct avatar filename (overrides persona/department/variant) */
  avatar?: string
  /** Agent tier (1-5) for visual styling */
  tier?: 1 | 2 | 3 | 4 | 5
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  /** Agent name for alt text */
  name?: string
  /** Display name badge below avatar */
  showName?: boolean
  /** Badge color based on tenant */
  badgeColor?: string
  /** Loading state */
  loading?: boolean
  /** Lazy load image */
  lazy?: boolean
  /** Error fallback */
  onError?: (error: Error) => void
}

const sizeMap = {
  xs: { container: "w-8 h-8", image: "w-8 h-8", badge: "text-[8px] px-1 py-0.5" },
  sm: { container: "w-12 h-12", image: "w-12 h-12", badge: "text-[10px] px-1.5 py-0.5" },
  md: { container: "w-16 h-16", image: "w-16 h-16", badge: "text-xs px-2 py-1" },
  lg: { container: "w-24 h-24", image: "w-24 h-24", badge: "text-sm px-2 py-1" },
  xl: { container: "w-32 h-32", image: "w-32 h-32", badge: "text-base px-3 py-1.5" },
  "2xl": { container: "w-40 h-40", image: "w-40 h-40", badge: "text-lg px-3 py-2" },
}

// Tier styling based on AgentOS 3.0 hierarchy
const tierStyles = {
  1: "ring-4 ring-purple-500 ring-offset-2", // Master
  2: "ring-2 ring-blue-500 ring-offset-1",   // Expert
  3: "ring-2 ring-teal-400",                  // Specialist
  4: "border-2 border-gray-300",              // Worker
  5: "border border-gray-200",                // Tool
}

export const AgentAvatar = React.forwardRef<HTMLDivElement, AgentAvatarProps>(
  (
    {
      personaType = "expert",
      department = "medical_affairs",
      variant = 1,
      avatar,
      tier = 2,
      size = "md",
      name,
      showName = false,
      badgeColor = "#9B5DE0",
      loading = false,
      lazy = true,
      onError,
      className,
      ...props
    },
    ref
  ) => {
    const [imageStatus, setImageStatus] = React.useState<"loading" | "loaded" | "error">("loading")
    const [imageSrc, setImageSrc] = React.useState<string>("")

    const { container, image, badge } = sizeMap[size]

    React.useEffect(() => {
      let svgPath: string

      if (avatar) {
        // Direct avatar filename provided
        if (avatar.startsWith("/") || avatar.startsWith("http")) {
          svgPath = avatar
        } else if (avatar.match(/^vital_avatar_/)) {
          svgPath = `/assets/vital/avatars/${avatar}.svg`
        } else {
          svgPath = `/assets/vital/avatars/${avatar}`
        }
      } else {
        // Construct from persona/department/variant taxonomy
        const paddedVariant = String(variant).padStart(2, "0")
        svgPath = `/assets/vital/avatars/vital_avatar_${personaType}_${department}_${paddedVariant}.svg`
      }

      setImageSrc(svgPath)

      // Preload image if not lazy loading
      if (!lazy) {
        const img = new Image()
        img.src = svgPath

        img.onload = () => setImageStatus("loaded")
        img.onerror = () => {
          setImageStatus("error")
          onError?.(new Error(`Failed to load avatar: ${svgPath}`))
        }
      } else {
        setImageStatus("loaded")
      }
    }, [personaType, department, variant, avatar, lazy, onError])

    if (loading || imageStatus === "loading") {
      return (
        <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
          <div
            className={cn(
              "flex items-center justify-center rounded-lg animate-pulse bg-gray-100",
              container,
              tierStyles[tier]
            )}
          >
            <div className={cn("rounded-full bg-gray-300", size === "xs" ? "w-4 h-4" : "w-8 h-8")} />
          </div>
          {showName && (
            <div className={cn("mt-2 h-4 w-16 rounded bg-gray-200 animate-pulse", badge)} />
          )}
        </div>
      )
    }

    if (imageStatus === "error") {
      return (
        <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
          <div
            className={cn(
              "flex items-center justify-center rounded-lg bg-gray-50",
              container,
              tierStyles[tier]
            )}
          >
            <span className="text-2xl">🤖</span>
          </div>
          {showName && name && (
            <span className={cn("mt-2 font-medium text-center text-gray-900", badge)}>
              {name}
            </span>
          )}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
        <div
          className={cn(
            "relative flex items-center justify-center rounded-lg overflow-hidden bg-white",
            container,
            tierStyles[tier]
          )}
        >
          <img
            src={imageSrc}
            alt={name || `${personaType} agent`}
            className={cn("object-contain", image)}
            loading={lazy ? "lazy" : "eager"}
            onError={() => {
              setImageStatus("error")
              onError?.(new Error(`Failed to load avatar image: ${imageSrc}`))
            }}
          />
        </div>
        {showName && name && (
          <div
            className={cn(
              "mt-2 font-medium text-center rounded-full",
              badge
            )}
            style={{
              backgroundColor: `${badgeColor}15`,
              color: badgeColor,
            }}
          >
            {name}
          </div>
        )}
      </div>
    )
  }
)

AgentAvatar.displayName = "AgentAvatar"
