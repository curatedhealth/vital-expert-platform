import { forwardRef } from "react";

import { cn } from "@/lib/shared/services/utils";

export interface SimpleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant" | "system";
  content: string;
  loading?: boolean;
}

const SimpleMessage = forwardRef<HTMLDivElement, SimpleMessageProps>(
  ({ className, role, content, loading, ...props }, ref) => {
    const isUser = role === "user";
    const isSystem = role === "system";

    return (
      <div
        ref={ref}
        className={cn(
          "group relative mb-4 flex items-start space-x-4",
          isUser && "flex-row-reverse space-x-reverse",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
            isUser
              ? "bg-background"
              : isSystem
              ? "bg-muted"
              : "bg-primary text-primary-foreground"
          )}
        >
          {isUser ? (
            "U"
          ) : isSystem ? (
            "S"
          ) : (
            "AI"
          )}
        </div>
        <div className={cn("flex-1 space-y-2", isUser && "flex justify-end")}>
          <div
            className={cn(
              "rounded-lg px-3 py-2",
              isUser
                ? "bg-primary text-primary-foreground"
                : isSystem
                ? "bg-muted"
                : "bg-muted/50"
            )}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60 [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60 [animation-delay:0.4s]"></div>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
SimpleMessage.displayName = "SimpleMessage";

export { SimpleMessage };