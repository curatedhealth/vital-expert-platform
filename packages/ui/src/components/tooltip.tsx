"use client"
import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined)

export interface TooltipProviderProps {
  children: React.ReactNode
}

export const TooltipProvider = ({ children }: TooltipProviderProps) => <>{children}</>

export interface TooltipProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  delayDuration?: number
  children: React.ReactNode
}

export const Tooltip = ({ open: controlledOpen, onOpenChange, defaultOpen = false, children }: TooltipProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const handleOpenChange = onOpenChange || setUncontrolledOpen

  return (
    <TooltipContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </TooltipContext.Provider>
  )
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ asChild, children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
    const context = React.useContext(TooltipContext)

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(true)
      onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(false)
      onMouseLeave?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      context?.onOpenChange(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      context?.onOpenChange(false)
      onBlur?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...children.props,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ref,
      } as any)
    }

    return (
      <button
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted || !context?.open) return null

    return createPortal(
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
TooltipContent.displayName = "TooltipContent"
