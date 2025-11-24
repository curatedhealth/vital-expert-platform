import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {}

const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, children, ...props }, ref) => {
    const [showScrollButton, setShowScrollButton] = React.useState(false)
    const scrollAreaRef = React.useRef<HTMLDivElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)

    const checkScrollPosition = React.useCallback(() => {
      if (!contentRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }, [])

    const scrollToBottom = React.useCallback(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
    }, [])

    React.useEffect(() => {
      const scrollElement = contentRef.current
      if (!scrollElement) return

      scrollElement.addEventListener("scroll", checkScrollPosition)
      checkScrollPosition()

      return () => {
        scrollElement.removeEventListener("scroll", checkScrollPosition)
      }
    }, [checkScrollPosition])

    const contentChildren: React.ReactNode[] = []
    let scrollButton: React.ReactElement | null = null

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === ConversationScrollButton) {
          scrollButton = child as React.ReactElement
        } else {
          contentChildren.push(child)
        }
      } else {
        contentChildren.push(child)
      }
    })

    return (
      <div
        ref={ref}
        className={cn("relative flex flex-col", className)}
        {...props}
      >
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div
            ref={contentRef}
            className="h-full overflow-y-auto"
            onScroll={checkScrollPosition}
          >
            {contentChildren}
          </div>
        </ScrollArea>
        {scrollButton && React.cloneElement(scrollButton, {
          show: showScrollButton,
          onClick: scrollToBottom,
        })}
      </div>
    )
  }
)
Conversation.displayName = "Conversation"

const ConversationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col p-4", className)}
    {...props}
  />
))
ConversationContent.displayName = "ConversationContent"

interface ConversationScrollButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  show?: boolean
}

const ConversationScrollButton = React.forwardRef<
  HTMLButtonElement,
  ConversationScrollButtonProps
>(({ className, show = false, onClick, ...props }, ref) => {
  if (!show) return null

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn(
        "absolute bottom-4 right-4 z-10 h-8 w-8 rounded-full shadow-lg",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
})
ConversationScrollButton.displayName = "ConversationScrollButton"

export { Conversation, ConversationContent, ConversationScrollButton }

