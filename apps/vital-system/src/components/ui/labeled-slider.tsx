"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SliderConfig } from "@/features/agents/types/agent.types"

interface LabeledSliderProps {
  /** Slider configuration object */
  config?: SliderConfig
  /** Field name for form binding */
  field?: string
  /** Display label */
  label?: string
  /** Description text below label */
  description?: string
  /** Left endpoint label */
  leftLabel?: string
  /** Right endpoint label */
  rightLabel?: string
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Current value */
  value: number
  /** Change handler */
  onChange: (value: number) => void
  /** Whether to show the current value */
  showValue?: boolean
  /** Value formatter for display */
  formatValue?: (value: number) => string
  /** Whether the slider is disabled */
  disabled?: boolean
  /** Additional class names */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

const variantColors = {
  default: {
    track: 'bg-muted',
    fill: 'bg-primary',
    thumb: 'bg-primary border-primary-foreground'
  },
  primary: {
    track: 'bg-blue-100 dark:bg-blue-900/20',
    fill: 'bg-blue-500',
    thumb: 'bg-blue-500 border-blue-600'
  },
  success: {
    track: 'bg-green-100 dark:bg-green-900/20',
    fill: 'bg-green-500',
    thumb: 'bg-green-500 border-green-600'
  },
  warning: {
    track: 'bg-amber-100 dark:bg-amber-900/20',
    fill: 'bg-amber-500',
    thumb: 'bg-amber-500 border-amber-600'
  },
  danger: {
    track: 'bg-red-100 dark:bg-red-900/20',
    fill: 'bg-red-500',
    thumb: 'bg-red-500 border-red-600'
  }
}

const sizeStyles = {
  sm: {
    track: 'h-1.5',
    thumb: 'h-4 w-4',
    label: 'text-xs',
    value: 'text-xs'
  },
  md: {
    track: 'h-2',
    thumb: 'h-5 w-5',
    label: 'text-sm',
    value: 'text-sm'
  },
  lg: {
    track: 'h-2.5',
    thumb: 'h-6 w-6',
    label: 'text-base',
    value: 'text-base'
  }
}

export const LabeledSlider = React.forwardRef<HTMLDivElement, LabeledSliderProps>(
  ({
    config,
    field,
    label,
    description,
    leftLabel,
    rightLabel,
    min = 0,
    max = 100,
    step = 1,
    value,
    onChange,
    showValue = true,
    formatValue,
    disabled = false,
    className,
    size = 'md',
    variant = 'default'
  }, ref) => {
    // Use config if provided, otherwise use individual props
    const resolvedLabel = label ?? config?.label ?? ''
    const resolvedDescription = description ?? config?.description
    const resolvedLeftLabel = leftLabel ?? config?.leftLabel
    const resolvedRightLabel = rightLabel ?? config?.rightLabel
    const resolvedMin = min ?? config?.min ?? 0
    const resolvedMax = max ?? config?.max ?? 100
    const resolvedStep = step ?? config?.step ?? 1
    const resolvedShowValue = showValue ?? config?.showValue ?? true

    const percentage = ((value - resolvedMin) / (resolvedMax - resolvedMin)) * 100
    const colors = variantColors[variant]
    const sizes = sizeStyles[size]

    const displayValue = formatValue
      ? formatValue(value)
      : resolvedMax <= 2
        ? value.toFixed(1)
        : Math.round(value).toString()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(event.target.value)
      onChange(newValue)
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {/* Header with label and value */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {resolvedLabel && (
              <label className={cn(
                "font-medium text-foreground",
                sizes.label,
                disabled && "opacity-50"
              )}>
                {resolvedLabel}
              </label>
            )}
            {resolvedDescription && (
              <p className="text-xs text-muted-foreground">
                {resolvedDescription}
              </p>
            )}
          </div>
          {resolvedShowValue && (
            <span className={cn(
              "font-mono font-semibold px-2 py-0.5 rounded bg-muted",
              sizes.value,
              disabled && "opacity-50"
            )}>
              {displayValue}
            </span>
          )}
        </div>

        {/* Slider track and thumb */}
        <div className="relative pt-1 pb-2">
          {/* Track background */}
          <div className={cn(
            "w-full rounded-full",
            sizes.track,
            colors.track
          )} />

          {/* Filled portion */}
          <div
            className={cn(
              "absolute top-1 rounded-full",
              sizes.track,
              colors.fill,
              disabled && "opacity-50"
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Native range input (invisible but interactive) */}
          <input
            type="range"
            min={resolvedMin}
            max={resolvedMax}
            step={resolvedStep}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          />

          {/* Custom thumb */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full border-2 shadow-md transition-transform",
              sizes.thumb,
              colors.thumb,
              disabled && "opacity-50",
              !disabled && "hover:scale-110"
            )}
            style={{ left: `calc(${percentage}% - ${parseInt(sizes.thumb.split(' ')[0].replace('h-', '')) * 2}px)` }}
          />
        </div>

        {/* Endpoint labels */}
        {(resolvedLeftLabel || resolvedRightLabel) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className={disabled ? "opacity-50" : ""}>
              {resolvedLeftLabel}
            </span>
            <span className={disabled ? "opacity-50" : ""}>
              {resolvedRightLabel}
            </span>
          </div>
        )}
      </div>
    )
  }
)

LabeledSlider.displayName = "LabeledSlider"

/**
 * SliderGroup - Renders multiple sliders from a configuration array
 */
interface SliderGroupProps {
  /** Title for the slider group */
  title?: string
  /** Array of slider configurations */
  sliders: SliderConfig[]
  /** Current values object (keyed by field name) */
  values: Record<string, number>
  /** Change handler (receives field name and new value) */
  onChange: (field: string, value: number) => void
  /** Whether all sliders are disabled */
  disabled?: boolean
  /** Size variant for all sliders */
  size?: 'sm' | 'md' | 'lg'
  /** Class name for the container */
  className?: string
  /** Number of columns (1, 2, or 3) */
  columns?: 1 | 2 | 3
}

export const SliderGroup: React.FC<SliderGroupProps> = ({
  title,
  sliders,
  values,
  onChange,
  disabled = false,
  size = 'md',
  className,
  columns = 1
}) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }[columns]

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          {title}
        </h3>
      )}
      <div className={cn("grid gap-6", gridClass)}>
        {sliders.map((config) => (
          <LabeledSlider
            key={config.field}
            config={config}
            value={values[config.field] ?? config.defaultValue}
            onChange={(value) => onChange(config.field, value)}
            disabled={disabled}
            size={size}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * SuccessCriteriaSlider - Specialized slider for success criteria metrics
 */
interface SuccessCriteriaSliderProps {
  metricCode: string
  metricName: string
  metricDescription?: string
  targetValue: number
  minAcceptable?: number
  onTargetChange: (value: number) => void
  onMinAcceptableChange?: (value: number) => void
  disabled?: boolean
  showMinAcceptable?: boolean
}

export const SuccessCriteriaSlider: React.FC<SuccessCriteriaSliderProps> = ({
  metricCode,
  metricName,
  metricDescription,
  targetValue,
  minAcceptable,
  onTargetChange,
  onMinAcceptableChange,
  disabled = false,
  showMinAcceptable = true
}) => {
  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-sm">{metricName}</h4>
          {metricDescription && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {metricDescription}
            </p>
          )}
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {metricCode}
        </span>
      </div>

      <LabeledSlider
        label="Target"
        value={targetValue}
        onChange={onTargetChange}
        min={0}
        max={100}
        step={1}
        leftLabel="0%"
        rightLabel="100%"
        formatValue={(v) => `${v}%`}
        disabled={disabled}
        size="sm"
        variant="success"
      />

      {showMinAcceptable && minAcceptable !== undefined && onMinAcceptableChange && (
        <LabeledSlider
          label="Minimum Acceptable"
          value={minAcceptable}
          onChange={onMinAcceptableChange}
          min={0}
          max={100}
          step={1}
          leftLabel="0%"
          rightLabel="100%"
          formatValue={(v) => `${v}%`}
          disabled={disabled}
          size="sm"
          variant="warning"
        />
      )}
    </div>
  )
}

export default LabeledSlider
