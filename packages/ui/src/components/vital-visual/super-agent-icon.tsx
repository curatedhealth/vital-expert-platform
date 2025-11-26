"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * SuperAgentIcon - Level 1 Master Orchestrator Icons
 *
 * Displays super agent icons from the VITAL visual asset library.
 * These represent top-level master agents in the AgentOS 3.0 hierarchy.
 *
 * @example
 * ```tsx
 * <SuperAgentIcon
 *   name="super_orchestrator"
 *   size="lg"
 *   variant="purple"
 * />
 * ```
 */

export interface SuperAgentIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Super agent name (e.g., "super_orchestrator", "master_strategist") */
  name: string
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  /** Color variant based on Tenant Identity Colors */
  variant?: "purple" | "blue" | "black" | "red" | "pink" | "teal" | "orange" | "indigo" | "default"
  /** Custom canvas background (defaults to Warm Ivory #FAF8F1) */
  backgroundColor?: string
  /** Loading state */
  loading?: boolean
  /** Error fallback */
  onError?: (error: Error) => void
}

const sizeMap = {
  sm: { container: "w-12 h-12", canvas: 48 },
  md: { container: "w-16 h-16", canvas: 64 },
  lg: { container: "w-24 h-24", canvas: 96 },
  xl: { container: "w-32 h-32", canvas: 128 },
  "2xl": { container: "w-40 h-40", canvas: 160 },
}

// Tenant Identity Colors from Brand Guidelines v5.0
const colorMap = {
  purple: "#9B5DE0",  // Expert Purple
  blue: "#0046FF",    // Pharma Blue
  black: "#292621",   // Startup Black
  red: "#EF4444",     // Medical Red
  pink: "#FF3796",    // Foresight Pink
  teal: "#00B5AD",    // Systems Teal
  orange: "#FF6B00",  // Velocity Orange
  indigo: "#4F46E5",  // Research Indigo
  default: "#9B5DE0", // Default to Expert Purple
}

export const SuperAgentIcon = React.forwardRef<HTMLDivElement, SuperAgentIconProps>(
  (
    {
      name,
      size = "md",
      variant = "default",
      backgroundColor = "#FAF8F1", // Warm Ivory
      loading = false,
      onError,
      className,
      ...props
    },
    ref
  ) => {
    const [imageStatus, setImageStatus] = React.useState<"loading" | "loaded" | "error">("loading")
    const [imageSrc, setImageSrc] = React.useState<string>("")

    const { container, canvas } = sizeMap[size]
    const accentColor = colorMap[variant]

    React.useEffect(() => {
      // Construct path to super agent SVG
      const svgPath = `/assets/vital/super_agents/${name}.svg`
      setImageSrc(svgPath)

      // Preload image
      const img = new Image()
      img.src = svgPath

      img.onload = () => setImageStatus("loaded")
      img.onerror = () => {
        setImageStatus("error")
        onError?.(new Error(`Failed to load super agent icon: ${name}`))
      }
    }, [name, onError])

    if (loading || imageStatus === "loading") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center rounded-lg",
            container,
            className
          )}
          style={{ backgroundColor }}
          {...props}
        >
          <div className="animate-pulse">
            <svg
              width={canvas}
              height={canvas}
              viewBox={`0 0 ${canvas} ${canvas}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Loading placeholder - concentric circles */}
              <circle
                cx={canvas / 2}
                cy={canvas / 2}
                r={canvas / 4}
                stroke={accentColor}
                strokeWidth="2"
                fill="none"
                opacity="0.3"
              />
              <circle
                cx={canvas / 2}
                cy={canvas / 2}
                r={canvas / 6}
                fill={accentColor}
                opacity="0.2"
              />
            </svg>
          </div>
        </div>
      )
    }

    if (imageStatus === "error") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed",
            container,
            className
          )}
          style={{ backgroundColor, borderColor: accentColor }}
          {...props}
        >
          <svg
            width={canvas / 2}
            height={canvas / 2}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke={accentColor} strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="mt-2 text-xs text-gray-500">Not found</span>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-lg overflow-hidden",
          container,
          className
        )}
        style={{ backgroundColor }}
        {...props}
      >
        <img
          src={imageSrc}
          alt={`Super Agent: ${name}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    )
  }
)

SuperAgentIcon.displayName = "SuperAgentIcon"
