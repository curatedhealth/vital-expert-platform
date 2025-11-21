import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  isStreaming?: boolean
}

const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  ({ className, defaultOpen = false, isStreaming = false, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)
    
    // Auto-open when streaming starts
    React.useEffect(() => {
      if (isStreaming && !isOpen) {
        setIsOpen(true)
      }
    }, [isStreaming, isOpen])

    return (
      <div
        ref={ref}
        className={cn("border-t border-border", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === ReasoningTrigger) {
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen,
                onToggle: () => setIsOpen(!isOpen),
              })
            }
            if (child.type === ReasoningContent) {
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
Reasoning.displayName = "Reasoning"

interface ReasoningTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean
  onToggle?: () => void
}

const ReasoningTrigger = React.forwardRef<HTMLButtonElement, ReasoningTriggerProps>(
  ({ className, isOpen, onToggle, children, ...props }, ref) => {
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
          <Brain className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Reasoning</span>
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
ReasoningTrigger.displayName = "ReasoningTrigger"

interface ReasoningContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

const ReasoningContent = React.forwardRef<HTMLDivElement, ReasoningContentProps>(
  ({ className, isOpen, children, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn("px-3 pb-3 text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ReasoningContent.displayName = "ReasoningContent"

export { Reasoning, ReasoningTrigger, ReasoningContent }

