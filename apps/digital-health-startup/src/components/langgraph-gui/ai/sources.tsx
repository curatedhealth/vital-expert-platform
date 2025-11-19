import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface SourcesProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
}

const Sources = React.forwardRef<HTMLDivElement, SourcesProps>(
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
            if (child.type === SourcesTrigger) {
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen,
                onToggle: () => setIsOpen(!isOpen),
              })
            }
            if (child.type === SourcesContent) {
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
Sources.displayName = "Sources"

interface SourcesTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean
  onToggle?: () => void
  count?: number
}

const SourcesTrigger = React.forwardRef<HTMLButtonElement, SourcesTriggerProps>(
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
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Sources{count !== undefined ? ` (${count})` : ''}
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
SourcesTrigger.displayName = "SourcesTrigger"

interface SourcesContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

const SourcesContent = React.forwardRef<HTMLDivElement, SourcesContentProps>(
  ({ className, isOpen, children, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn("px-3 pb-3", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SourcesContent.displayName = "SourcesContent"

interface SourceProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string
  href: string
}

const Source = React.forwardRef<HTMLAnchorElement, SourceProps>(
  ({ className, title, href, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
          className
        )}
        {...props}
      >
        {title}
      </a>
    )
  }
)
Source.displayName = "Source"

export { Sources, SourcesTrigger, SourcesContent, Source }

