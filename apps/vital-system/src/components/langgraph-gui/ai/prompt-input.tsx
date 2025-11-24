import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptInputProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

const PromptInput = React.forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className, onSubmit, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn("flex flex-col border-t border-border", className)}
        {...props}
      >
        {children}
      </form>
    )
  }
)
PromptInput.displayName = "PromptInput"

interface PromptInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        "min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none",
        className
      )}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          const form = e.currentTarget.closest("form")
          if (form) {
            form.requestSubmit()
          }
        }
      }}
      {...props}
    />
  )
})
PromptInputTextarea.displayName = "PromptInputTextarea"

interface PromptInputToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}

const PromptInputToolbar = React.forwardRef<HTMLDivElement, PromptInputToolbarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between gap-2 px-3 py-2 bg-muted/30", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PromptInputToolbar.displayName = "PromptInputToolbar"

interface PromptInputSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

const PromptInputSubmit = React.forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, isLoading, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        size="icon"
        disabled={disabled || isLoading}
        className={cn("h-9 w-9", className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    )
  }
)
PromptInputSubmit.displayName = "PromptInputSubmit"

interface PromptInputButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const PromptInputButton = React.forwardRef<HTMLButtonElement, PromptInputButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="sm"
        className={cn("h-8 px-2", className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
PromptInputButton.displayName = "PromptInputButton"

interface PromptInputToolsProps extends React.HTMLAttributes<HTMLDivElement> {}

const PromptInputTools = React.forwardRef<HTMLDivElement, PromptInputToolsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PromptInputTools.displayName = "PromptInputTools"

interface PromptInputModelSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

const PromptInputModelSelect = React.forwardRef<HTMLDivElement, PromptInputModelSelectProps>(
  ({ value, onValueChange, disabled, children }, _ref) => {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        {children}
      </Select>
    )
  }
)
PromptInputModelSelect.displayName = "PromptInputModelSelect"

const PromptInputModelSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, ...props }, ref) => (
  <SelectTrigger
    ref={ref}
    className={cn(
      "h-8 w-auto min-w-[100px] text-xs border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 px-2 hover:bg-muted/50 rounded-md",
      className
    )}
    {...props}
  />
))
PromptInputModelSelectTrigger.displayName = "PromptInputModelSelectTrigger"

const PromptInputModelSelectValue = SelectValue

const PromptInputModelSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ className, ...props }, ref) => (
  <SelectContent ref={ref} className={className} {...props} />
))
PromptInputModelSelectContent.displayName = "PromptInputModelSelectContent"

const PromptInputModelSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, ...props }, ref) => (
  <SelectItem ref={ref} className={className} {...props} />
))
PromptInputModelSelectItem.displayName = "PromptInputModelSelectItem"

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputButton,
  PromptInputTools,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
}

