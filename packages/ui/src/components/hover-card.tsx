"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "../lib/utils"

interface HoverCardContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HoverCardContext = React.createContext<HoverCardContextValue | undefined>(undefined)

interface HoverCardProps {
  openDelay?: number
  closeDelay?: number
  children: React.ReactNode
}

const HoverCard = ({ openDelay: _openDelay = 200, closeDelay: _closeDelay = 300, children }: HoverCardProps) => {
  // Note: openDelay and closeDelay are kept for API compatibility but not currently used
  void _openDelay; void _closeDelay;
  const [open, setOpen] = React.useState(false)

  return (
    <HoverCardContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </HoverCardContext.Provider>
  )
}

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const HoverCardTrigger = React.forwardRef<HTMLDivElement, HoverCardTriggerProps>(
  ({ asChild, children, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const context = React.useContext(HoverCardContext)

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      context?.onOpenChange(true)
      onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      context?.onOpenChange(false)
      onMouseLeave?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...children.props,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ref,
      } as any)
    }

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    )
  }
)
HoverCardTrigger.displayName = "HoverCardTrigger"

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => {
    const context = React.useContext(HoverCardContext)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted || !context?.open) return null

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        data-state={context.open ? "open" : "closed"}
        {...props}
      />,
      document.body
    )
  }
)
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
