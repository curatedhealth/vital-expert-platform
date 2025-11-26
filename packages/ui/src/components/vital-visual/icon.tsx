"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Icon - General Purpose Icon Component
 *
 * Displays icons from the VITAL visual asset library with black/purple variants.
 * Used for UI navigation, features, capabilities, and general platform iconography.
 *
 * @example
 * ```tsx
 * <Icon
 *   name="analytics_chart"
 *   variant="purple"
 *   size="md"
 * />
 * ```
 */

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon name (e.g., "analytics_chart", "workflow_node") */
  name: string
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Color variant: black (default) or purple (Expert Purple #9B5DE0) */
  variant?: "black" | "purple"
  /** Custom color override (hex value) */
  customColor?: string
  /** Loading state */
  loading?: boolean
  /** Error fallback */
  onError?: (error: Error) => void
}

const sizeMap = {
  xs: { container: "w-4 h-4", canvas: 16 },
  sm: { container: "w-5 h-5", canvas: 20 },
  md: { container: "w-6 h-6", canvas: 24 },
  lg: { container: "w-8 h-8", canvas: 32 },
  xl: { container: "w-10 h-10", canvas: 40 },
}

const variantMap = {
  black: "black",
  purple: "purple",
}

export const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  (
    {
      name,
      size = "md",
      variant = "black",
      customColor,
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

    React.useEffect(() => {
      // Construct path to icon SVG based on variant
      const variantFolder = variantMap[variant]
      const svgPath = `/assets/vital/icons/${variantFolder}/${name}.svg`
      setImageSrc(svgPath)

      // Preload image
      const img = new Image()
      img.src = svgPath

      img.onload = () => setImageStatus("loaded")
      img.onerror = () => {
        setImageStatus("error")
        onError?.(new Error(`Failed to load icon: ${name} (${variant})`))
      }
    }, [name, variant, onError])

    if (loading || imageStatus === "loading") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center animate-pulse",
            container,
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "rounded-full",
              size === "xs" && "w-2 h-2",
              size === "sm" && "w-3 h-3",
              size === "md" && "w-4 h-4",
              size === "lg" && "w-5 h-5",
              size === "xl" && "w-6 h-6"
            )}
            style={{
              backgroundColor: variant === "purple" ? "#9B5DE0" : "#292621",
              opacity: 0.3,
            }}
          />
        </div>
      )
    }

    if (imageStatus === "error") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center",
            container,
            className
          )}
          {...props}
        >
          <svg
            width={canvas}
            height={canvas}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="2"
              stroke={variant === "purple" ? "#9B5DE0" : "#292621"}
              strokeWidth="2"
            />
            <path
              d="M8 8l8 8M16 8l-8 8"
              stroke={variant === "purple" ? "#9B5DE0" : "#292621"}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center flex-shrink-0",
          container,
          className
        )}
        {...props}
      >
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-contain"
          style={customColor ? { filter: `hue-rotate(${customColor})` } : undefined}
          loading="lazy"
        />
      </div>
    )
  }
)

Icon.displayName = "Icon"
