import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhaseStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
}

const PhaseStatus = React.forwardRef<HTMLDivElement, PhaseStatusProps>(
  ({ className, defaultOpen = false, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    return (
      <div
        ref={ref}
        className={cn("border-t border-border", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === PhaseStatusTrigger) {
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen,
                onToggle: () => setIsOpen(!isOpen),
              })
            }
            if (child.type === PhaseStatusContent) {
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen,
              })
            }
          }
          return child
        })}
      </div>
    )
  }
)
PhaseStatus.displayName = "PhaseStatus"

interface PhaseStatusTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean
  onToggle?: () => void
  count?: number
}

const PhaseStatusTrigger = React.forwardRef<HTMLButtonElement, PhaseStatusTriggerProps>(
  ({ className, isOpen, onToggle, count, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          "w-full justify-between text-left font-normal h-auto py-2 px-3",
          className
        )}
        onClick={onToggle}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Phase Status{count !== undefined ? ` (${count})` : ''}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    )
  }
)
PhaseStatusTrigger.displayName = "PhaseStatusTrigger"

interface PhaseStatusContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

const PhaseStatusContent = React.forwardRef<HTMLDivElement, PhaseStatusContentProps>(
  ({ className, isOpen, children, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn("px-3 pb-3 space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PhaseStatusContent.displayName = "PhaseStatusContent"

interface PhaseStatusItemProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  timestamp?: string
  level?: 'info' | 'success' | 'warning' | 'error'
}

const PhaseStatusItem = React.forwardRef<HTMLDivElement, PhaseStatusItemProps>(
  ({ className, message, timestamp, level = 'info', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-2 px-3 py-2 text-sm text-muted-foreground rounded-md",
          className
        )}
        {...props}
      >
        {timestamp && (
          <span className="text-xs text-muted-foreground/60 flex-shrink-0 w-16">
            {timestamp}
          </span>
        )}
        <span className="flex-1">{message}</span>
      </div>
    )
  }
)
PhaseStatusItem.displayName = "PhaseStatusItem"

export { PhaseStatus, PhaseStatusTrigger, PhaseStatusContent, PhaseStatusItem }





