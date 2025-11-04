import { forwardRef, useEffect, useRef } from "react";

import { cn } from "@/shared/services/utils";

import { SimpleMessage, SimpleMessageProps } from "./simple-message";

export interface SimpleConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: Array<Omit<SimpleMessageProps, "ref">>;
  isLoading?: boolean;
  autoScroll?: boolean;
}

  ({ className, messages, isLoading, autoScroll = true, ...props }, ref) => {

    useEffect(() => {
      if (autoScroll && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading, autoScroll]);

    return (
      <div
        ref={ref}
        className={cn("h-full w-full overflow-auto", className)}
        {...props}
      >
        <div ref={scrollRef} className="flex flex-col space-y-4 p-4">
          {messages.map((message, index) => (
            <SimpleMessage
              key={index}
              role={message.role}
              content={message.content}
              loading={message.loading}
              className={message.className}
            />
          ))}
          {isLoading && (
            <SimpleMessage
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
SimpleConversation.displayName = "SimpleConversation";

export { SimpleConversation };