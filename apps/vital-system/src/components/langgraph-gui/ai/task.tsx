import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  isActive?: boolean
}

const Task = React.forwardRef<HTMLDivElement, TaskProps>(
  ({ className, defaultOpen = false, isActive = false, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    return (
      <div
        ref={ref}
        className={cn("border-t border-border", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === TaskTrigger) {
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen,
                onToggle: () => setIsOpen(!isOpen),
                isActive,
              })
            }
            if (child.type === TaskContent) {
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
Task.displayName = "Task"

interface TaskTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string
  isOpen?: boolean
  onToggle?: () => void
  isActive?: boolean
}

const TaskTrigger = React.forwardRef<HTMLButtonElement, TaskTriggerProps>(
  ({ className, title, isOpen, onToggle, isActive, ...props }, ref) => {
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
          {isActive ? (
            <Circle className="h-4 w-4 text-primary animate-pulse" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{title}</span>
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
TaskTrigger.displayName = "TaskTrigger"

interface TaskContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

const TaskContent = React.forwardRef<HTMLDivElement, TaskContentProps>(
  ({ className, isOpen, children, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn("px-3 pb-3 space-y-1", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TaskContent.displayName = "TaskContent"

interface TaskItemProps extends React.HTMLAttributes<HTMLDivElement> {
  completed?: boolean
}

const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(
  ({ className, completed = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-sm text-muted-foreground flex items-center gap-2",
          completed && "text-foreground",
          className
        )}
        {...props}
      >
        {completed ? (
          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
        ) : (
          <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        )}
        <span>{children}</span>
      </div>
    )
  }
)
TaskItem.displayName = "TaskItem"

interface TaskItemFileProps extends React.HTMLAttributes<HTMLSpanElement> {}

const TaskItemFile = React.forwardRef<HTMLSpanElement, TaskItemFileProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "font-mono text-xs bg-muted px-1.5 py-0.5 rounded",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
TaskItemFile.displayName = "TaskItemFile"

export { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile }

