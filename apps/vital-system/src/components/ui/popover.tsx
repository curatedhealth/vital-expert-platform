"use client"

import * as React from "react"

interface PopoverProps {
  children: React.ReactNode
}

interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  onClick?: () => void
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

const PopoverContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
} | null>(null)

export const __Popover = ({ children }: PopoverProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export const __PopoverTrigger = ({ children, asChild = false, onClick }: PopoverTriggerProps) => {
  const context = React.useContext(PopoverContext)

  if (!context) throw new Error("PopoverTrigger must be used within Popover")

  const handleClick = () => {
    context.setIsOpen(!context.isOpen)
    onClick?.()
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as unknown)
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

export const __PopoverContent = ({
  children,
  className = "",
  align = "center"
}: PopoverContentProps) => {
  const context = React.useContext(PopoverContext)

  if (!context) throw new Error("PopoverContent must be used within Popover")

  if (!context.isOpen) return null

  // eslint-disable-next-line security/detect-object-injection
  const alignmentClass = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0"
  }[align]

  return (
    <div
      className={`
        absolute top-full mt-2 z-50 w-72 rounded-md border
        bg-canvas-surface p-4 shadow-md outline-none
        ${alignmentClass}
        ${className}
      `}
    >
      {children}
    </div>
  )
}