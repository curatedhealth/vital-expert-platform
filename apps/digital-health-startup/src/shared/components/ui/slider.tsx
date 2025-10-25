"use client"

import * as React from "react"

interface SliderProps {
  className?: string
  min?: number
  max?: number
  step?: number
  value?: number[]
  onValueChange?: (values: number[]) => void
  disabled?: boolean
}

export const __Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className = "", min = 0, max = 100, step = 1, value = [50], onValueChange, disabled = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange?.([newValue])
    }

    return (
      <div className={`relative flex w-full items-center ${className}`}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0] || min}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-600
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-blue-600
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-none
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"
export { __Slider as Slider }
