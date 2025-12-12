import * as React from "react"
import { User, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Color palette for different participants
const PARTICIPANT_COLORS = [
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-green-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-yellow-500", text: "text-yellow-900" },
  { bg: "bg-cyan-500", text: "text-white" },
]

// Get consistent color for a participant based on their name
const getParticipantColor = (name: string, role: string): { bg: string; text: string } => {
  // Moderator always gets purple
  if (role === "moderator") {
    return { bg: "bg-purple-500", text: "text-white" }
  }
  
  // Hash the name to get a consistent color
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % PARTICIPANT_COLORS.length
  return PARTICIPANT_COLORS[index]
}

interface MessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  from: "user" | "assistant" | "log" | "expert" | "moderator"
  avatar?: string
  name?: string
  level?: "info" | "success" | "warning" | "error"
  icon?: LucideIcon
  color?: { bg: string; text: string }
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, children, level, icon, color, ...props }, ref) => {
    if (from === "log") {
      return (
        <div
          ref={ref}
          className={cn("flex gap-3 group justify-start", className)}
          {...props}
        >
          <div className="flex flex-col gap-1 w-full">
            {children}
          </div>
        </div>
      )
    }

    // Extract MessageAvatar and MessageContent from children
    let avatarChild: React.ReactNode = null;
    let contentChild: React.ReactNode = null;
    const otherChildren: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        // Check by displayName to avoid forward reference issues
        const displayName = (child.type as any)?.displayName;
        if (displayName === 'MessageAvatar') {
          avatarChild = child;
        } else if (displayName === 'MessageContent') {
          contentChild = child;
        } else {
          otherChildren.push(child);
        }
      } else {
        otherChildren.push(child);
      }
    });

    // If no explicit avatar/content structure, render children as-is
    const hasExplicitStructure = avatarChild !== null || contentChild !== null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 group",
          from === "user" ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      >
        {hasExplicitStructure ? (
          <>
            {/* For non-user messages: Avatar first, then content */}
            {from !== "user" && avatarChild}
            {contentChild}
            {/* For user messages: Content first, then avatar */}
            {from === "user" && avatarChild}
            {otherChildren}
          </>
        ) : (
          <>
            {/* Fallback: render avatar and children in default order */}
            {from === "assistant" || from === "expert" || from === "moderator" ? (
              <MessageAvatar from={from} avatar={props.avatar} name={props.name} icon={icon} color={color} />
            ) : null}
            <div
              className={cn(
                "flex flex-col gap-1 max-w-[80%]",
                from === "user" ? "items-end" : "items-start"
              )}
            >
              {children}
            </div>
            {from === "user" && (
              <MessageAvatar from={from} avatar={props.avatar} name={props.name} />
            )}
          </>
        )}
      </div>
    )
  }
)
Message.displayName = "Message"

interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: "info" | "success" | "warning" | "error"
  from?: "user" | "assistant" | "log" | "expert" | "moderator"
}

const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ className, level, from, children, ...props }, ref) => {
    const isLog = level !== undefined

    if (isLog) {
      const levelStyles = {
        info: "text-muted-foreground bg-muted/30",
        success: "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30",
        warning: "text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/30",
        error: "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30",
      }
      return (
        <div
          ref={ref}
          className={cn("px-3 py-2 text-xs rounded-md", levelStyles[level], className)}
          {...props}
        >
          {children}
        </div>
      )
    }

    const isUser = from === "user"

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg px-4 py-3 text-sm",
          isUser
            ? "bg-gradient-to-r from-primary to-neutral-900 text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
          className
        )}
        {...props}
      >
        <div className="whitespace-pre-wrap break-words">{children}</div>
      </div>
    )
  }
)
MessageContent.displayName = "MessageContent"

interface MessageAvatarProps {
  from: "user" | "assistant" | "log" | "expert" | "moderator"
  avatar?: string
  name?: string
  icon?: LucideIcon
  color?: { bg: string; text: string }
}

const MessageAvatar = React.forwardRef<HTMLDivElement, MessageAvatarProps>(
  ({ from, avatar, name, icon, color: customColor, ...props }, ref) => {
    if (from === "log") return null

    const displayName = name || (from === "expert" ? "Expert" : from === "moderator" ? "Moderator" : from);
    
    // Get color for this participant (use custom color if provided)
    const color = customColor || getParticipantColor(displayName, from);
    const IconComponent = icon;

    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs",
          from === "user"
            ? "bg-primary text-primary-foreground"
            : cn(color.bg, color.text)
        )}
        title={displayName}
        {...props}
      >
        {avatar ? (
          <img src={avatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
        ) : IconComponent ? (
          <IconComponent className="h-4 w-4" />
        ) : from === "user" ? (
          <User className="h-4 w-4" />
        ) : (
          <span className="text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    )
  }
)
MessageAvatar.displayName = "MessageAvatar"

export { Message, MessageContent, MessageAvatar }
