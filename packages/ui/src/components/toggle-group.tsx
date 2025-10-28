"use client"

import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "../lib/utils"
import { toggleVariants } from "./toggle"

interface ToggleGroupContextValue {
  type: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: any) => void
  variant?: VariantProps<typeof toggleVariants>['variant']
  size?: VariantProps<typeof toggleVariants>['size']
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | undefined>(undefined)

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toggleVariants> {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: any) => void
  defaultValue?: string | string[]
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, type = "single", value: controlledValue, onValueChange, defaultValue, children, variant, size, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)

    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
    const handleValueChange = onValueChange || setUncontrolledValue

    return (
      <ToggleGroupContext.Provider value={{ type, value, onValueChange: handleValueChange, variant, size }}>
        <div
          ref={ref}
          role={type === "single" ? "radiogroup" : "group"}
          className={cn("flex items-center justify-center gap-1", className)}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    )
  }
)
ToggleGroup.displayName = "ToggleGroup"

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof toggleVariants> {
  value: string
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, value: itemValue, onClick, variant, size, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)

    const isPressed = context?.type === "single"
      ? context.value === itemValue
      : Array.isArray(context?.value) && context.value.includes(itemValue)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (context) {
        if (context.type === "single") {
          context.onValueChange?.(itemValue)
        } else {
          const currentValue = Array.isArray(context.value) ? context.value : []
          const newValue = isPressed
            ? currentValue.filter(v => v !== itemValue)
            : [...currentValue, itemValue]
          context.onValueChange?.(newValue)
        }
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        role={context?.type === "single" ? "radio" : "checkbox"}
        aria-checked={isPressed}
        aria-pressed={isPressed}
        data-state={isPressed ? "on" : "off"}
        className={cn(toggleVariants({ variant: context?.variant || variant, size: context?.size || size, className }))}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
