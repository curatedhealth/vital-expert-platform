'use client';

import { ArrowDownIcon } from 'lucide-react';
import { useEffect } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { ComponentProps } from 'react';

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const __Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn('relative flex-1 overflow-y-auto', className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

// Export with regular names for compatibility
export const Conversation = __Conversation;

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const __ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content className={cn('p-4', className)} {...props} />
);

// Export with regular names for compatibility
export const ConversationContent = __ConversationContent;

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const __ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          'absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full',
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
