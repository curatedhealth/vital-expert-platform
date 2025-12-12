'use client';

import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { AgentAvatar } from '@/shared/components/ui/agent-avatar';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/services/utils';

// 📜 Auto-Scrolling Chat Container Interface
interface ConversationProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  autoScroll?: boolean;
}

interface ConversationContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ConversationScrollButtonProps {
  className?: string;
  onClick?: () => void;
}

// 🎯 Conversation Context
const ConversationContext = React.createContext<{
  scrollToBottom: () => void;
  isAtBottom: boolean;
  showScrollButton: boolean;
}>({
  scrollToBottom: () => { /* TODO: implement */ },
  isAtBottom: true,
  showScrollButton: false,
});

// 📜 Main Conversation Component
export const Conversation: React.FC<ConversationProps> = ({
  children,
  className,
  style,
  autoScroll = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const lastScrollTop = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userIntentToScroll, setUserIntentToScroll] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (containerRef.current) {
      isScrollingProgrammatically.current = true;
      const { scrollHeight, clientHeight } = containerRef.current;
      containerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
      // Reset after a brief delay to allow the scroll to complete
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
        setUserIntentToScroll(false);
      }, 100);
    }
  };

  // Check if user is at bottom
  const checkIfAtBottom = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 10; // 10px threshold
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom && scrollHeight > clientHeight);

      // Update last scroll position
      lastScrollTop.current = scrollTop;
    }
  };

  // Handle scroll events - detect user intent
  const handleScroll = () => {
    if (isScrollingProgrammatically.current) {
      // Ignore programmatic scrolls
      checkIfAtBottom();
      return;
    }

    if (containerRef.current) {
      const currentScrollTop = containerRef.current.scrollTop;
      // Only set user intent if they actively scrolled up
      if (currentScrollTop < lastScrollTop.current) {
        setUserIntentToScroll(true);
      }

      checkIfAtBottom();
    }
  };

  // Auto-scroll on new messages (only when user hasn't manually scrolled up)
  useEffect(() => {
    if (autoScroll && isAtBottom && !userIntentToScroll) {
      // Use a small delay to allow for content to render
      const timeout = setTimeout(() => {
        scrollToBottom();
      }, 10);
      return () => clearTimeout(timeout);
    }
  }, [children, autoScroll, isAtBottom, userIntentToScroll]);

  // Check bottom position on mount and content changes
  useEffect(() => {
    checkIfAtBottom();
  }, [children]);

  return (
    <ConversationContext.Provider value={{ scrollToBottom, isAtBottom, showScrollButton }}>
      <div className={cn("relative flex flex-col", className)} style={style}>
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {children}
        </div>
      </div>
    </ConversationContext.Provider>
  );
};

// 📝 Conversation Content Component
export const ConversationContent: React.FC<ConversationContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-4 p-4", className)}>
      {children}
    </div>
  );
};

// 🔽 Scroll to Bottom Button
export const ConversationScrollButton: React.FC<ConversationScrollButtonProps> = ({
  className,
  onClick,
}) => {
  const { scrollToBottom, showScrollButton } = React.useContext(ConversationContext);

  const handleClick = () => {
    scrollToBottom();
    onClick?.();
  };

  if (!showScrollButton) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Button
        variant="secondary"
        size="sm"
        className={cn(
          "h-8 w-8 rounded-full p-0 shadow-lg border border-neutral-200 bg-white hover:bg-neutral-50",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        onClick={handleClick}
      >
        <ChevronDown className="h-4 w-4" />
        <span className="sr-only">Scroll to bottom</span>
      </Button>
    </div>
  );
};

// 🎯 Message Components for better UX
interface MessageProps {
  from: 'user' | 'ai' | 'assistant' | 'system';
  children: React.ReactNode;
  className?: string;
}

interface MessageContentProps {
  children: React.ReactNode;
  role: 'user' | 'ai' | 'assistant' | 'system';
  className?: string;
}

interface MessageAvatarProps {
  src?: string;
  name: string;
  role: 'user' | 'ai' | 'assistant' | 'system';
  className?: string;
}

export const MessageAvatar: React.FC<MessageAvatarProps> = ({
  src,
  name,
  role,
  className,
}) => {
  // Get appropriate avatar based on role
  const getAvatarSrc = (customSrc?: string) => {
    if (customSrc) return customSrc;

    switch (role) {
      case 'user':
        return 'avatar_0001'; // User avatar from registry
      case 'ai':
      case 'assistant':
        return 'avatar_0002'; // AI assistant avatar from registry
      case 'system':
        return 'avatar_0003'; // System avatar from registry
      default:
        return 'avatar_0002'; // Default to AI avatar
    }
  };

  const avatarSrc = getAvatarSrc(src);

  return (
    <div className={cn("flex-shrink-0", className)}>
      <AgentAvatar
        avatar={avatarSrc}
        name={name}
        size="lg"
        className="rounded-full"
      />
    </div>
  );
};

export const Message: React.FC<MessageProps> = ({
  from,
  children,
  className,
}) => {
  const isUser = from === 'user';

  return (
    <div className={cn(
      "flex gap-3 items-start group",
      isUser ? 'justify-end flex-row-reverse' : 'justify-start',
      className
    )}>
      {children}
    </div>
  );
};

export const MessageContent: React.FC<MessageContentProps> = ({
  children,
  role,
  className,
}) => {
  const getContentStyles = (role: 'user' | 'ai' | 'assistant' | 'system') => {
    switch (role) {
      case 'user':
        return 'bg-blue-600 text-white rounded-br-md';
      case 'ai':
      case 'assistant':
        return 'bg-neutral-100 text-neutral-900 rounded-bl-md';
      case 'system':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md';
      default:
        return 'bg-neutral-100 text-neutral-900 rounded-bl-md';
    }
  };

  return (
    <div className={cn(
      "max-w-3xl px-4 py-3 rounded-2xl text-sm",
      getContentStyles(role),
      className
    )}>
      {children}
    </div>
  );
};

// Export default for convenience
export default Conversation;