import { forwardRef, useEffect, useRef } from "react";

import { cn } from "@/lib/shared/services/utils";

import { Message, MessageProps } from "./message";

export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  autoScroll?: boolean;
}

export interface ConversationWithMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: Array<Omit<MessageProps, "ref">>;
  isLoading?: boolean;
  autoScroll?: boolean;
}

const Conversation = forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, children, autoScroll = true, ...props }, ref) => {
    const _scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (autoScroll && _scrollRef.current) {
        _scrollRef.current.scrollTop = _scrollRef.current.scrollHeight;
      }
    }, [children, autoScroll]);

    return (
      <div
        ref={ref}
        className={cn("h-full w-full overflow-auto", className)}
        {...props}
      >
        <div ref={_scrollRef} className="flex flex-col space-y-4 p-4">
          {children}
        </div>
      </div>
    );
  }
);
Conversation.displayName = "Conversation";

const ConversationContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ConversationContent.displayName = "ConversationContent";

// Legacy component for backward compatibility
const ConversationWithMessages = forwardRef<HTMLDivElement, ConversationWithMessagesProps>(
  ({ className, messages = [], isLoading, autoScroll = true, ...props }, ref) => {

    useEffect(() => {
      if (autoScroll && _scrollRef.current) {
        _scrollRef.current.scrollTop = _scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading, autoScroll]);

    return (
      <div
        ref={ref}
        className={cn("h-full w-full overflow-auto", className)}
        {...props}
      >
        <div ref={_scrollRef} className="flex flex-col space-y-4 p-4">
          {messages.map((message, index) => (
            <Message
              key={index}
              role={message.role}
              content={message.content}
              loading={message.loading}
              className={message.className}
            />
          ))}
          {isLoading && (
            <Message
              role="assistant"
              content=""
              loading={true}
            />
          )}
        </div>
      </div>
    );
  }
);
ConversationWithMessages.displayName = "ConversationWithMessages";

export { Conversation, ConversationContent, ConversationWithMessages };