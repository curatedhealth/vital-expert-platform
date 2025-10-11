import { forwardRef } from "react";

import { cn } from "@/shared/services/utils";

import { StreamingResponse } from "./streaming-response";

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant" | "system";
  content: string;
  loading?: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ className, role, content, loading, ...props }, ref) => {

    return (
      <div
        ref={ref}
        className={cn(
          "group relative mb-4 flex items-start space-x-4",
          _isUser && "flex-row-reverse space-x-reverse",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
            _isUser
              ? "bg-background"
              : _isSystem
              ? "bg-muted"
              : "bg-primary text-primary-foreground"
          )}
        >
          {_isUser ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0C63.78 166.78 40.31 185.66 25.08 212a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z" />
            </svg>
          ) : _isSystem ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M128 80a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48Zm0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32Zm88-29.84q.06-2.16 0-4.32l14.92-18.64a8 8 0 0 0 1.48-7.06 107.21 107.21 0 0 0-10.88-26.25 8 8 0 0 0-6-3.93l-23.72-2.64q-1.48-1.56-3.18-3.18L186 40.54a8 8 0 0 0-3.94-6 107.71 107.71 0 0 0-26.25-10.87 8 8 0 0 0-7.06 1.49L130.16 40q-2.16-.06-4.32 0L107.2 25.11a8 8 0 0 0-7.06-1.48 107.6 107.6 0 0 0-26.25 10.88 8 8 0 0 0-3.93 6l-2.64 23.76q-1.56 1.49-3.18 3.18L40.54 70a8 8 0 0 0-6 3.94 107.71 107.71 0 0 0-10.87 26.25 8 8 0 0 0 1.49 7.06L40 125.84q-.06 2.16 0 4.32L25.11 148.8a8 8 0 0 0-1.48 7.06 107.21 107.21 0 0 0 10.88 26.25 8 8 0 0 0 6 3.93l23.72 2.64q1.48 1.56 3.18 3.18L70 215.46a8 8 0 0 0 3.94 6 107.71 107.71 0 0 0 26.25 10.87 8 8 0 0 0 7.06-1.49L125.84 216q2.16.06 4.32 0l18.64 14.92a8 8 0 0 0 7.06 1.48 107.21 107.21 0 0 0 26.25-10.88 8 8 0 0 0 3.93-6l2.64-23.72q1.56-1.48 3.18-3.18L215.46 186a8 8 0 0 0 6-3.94 107.71 107.71 0 0 0 10.87-26.25 8 8 0 0 0-1.49-7.06ZM128 168a40 40 0 1 1 40-40 40 40 0 0 1-40 40Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M224 71.1a8 8 0 0 1-10.78-3.42 94.13 94.13 0 0 0-33.46-33.46 8 8 0 0 1 7.36-14.2 110.1 110.1 0 0 1 40.3 40.3A8 8 0 0 1 224 71.1ZM35.71 67.68a8 8 0 0 0 10.78 3.42 94.13 94.13 0 0 1 33.46-33.46 8 8 0 0 0-7.36-14.2 110.1 110.1 0 0 0-40.3 40.3 8 8 0 0 0 3.42 10.94Zm188.58 120.64a8 8 0 0 0-10.78 3.42 94.13 94.13 0 0 1-33.46 33.46 8 8 0 0 0 7.36 14.2 110.1 110.1 0 0 0 40.3-40.3 8 8 0 0 0-3.42-10.78ZM67.68 220.29a8 8 0 0 0-3.42-10.78 110.1 110.1 0 0 0-40.3-40.3 8 8 0 0 0-7.36 14.2 94.13 94.13 0 0 0 33.46 33.46 8 8 0 0 0 10.62-3.42ZM176 128a8 8 0 0 0-8-8H88a8 8 0 0 0 0 16h80a8 8 0 0 0 8-8Zm-8-40H88a8 8 0 0 0 0 16h80a8 8 0 0 0 0-16Zm0 80H88a8 8 0 0 0 0 16h80a8 8 0 0 0 0-16Z" />
            </svg>
          )}
        </div>
        <div className={cn("flex-1 space-y-2", _isUser && "flex justify-end")}>
          <div
            className={cn(
              "rounded-lg px-3 py-2",
              _isUser
                ? "bg-primary text-primary-foreground"
                : _isSystem
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
              <StreamingResponse
                content={content}
                isStreaming={false}
                variant="enhanced"
                showCursor={false}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);
Message.displayName = "Message";

const MessageContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MessageContent.displayName = "MessageContent";

export { Message, MessageContent };