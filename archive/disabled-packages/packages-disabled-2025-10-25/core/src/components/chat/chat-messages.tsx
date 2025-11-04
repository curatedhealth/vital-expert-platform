'use client';

import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  User,
  Bot
} from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Message } from '@/shared/services/chat/chat-store';
import { cn } from '@/shared/utils';

interface ChatMessagesProps {
  messages: Message[];
  expert?: any;
  isTyping?: boolean;
  className?: string;
}

export function ChatMessages({ messages, expert, isTyping = false, className }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Get agent avatar
  const getAgentAvatar = (expert: any) => {
    if (!expert) return '🤖';

    if (expert.avatar?.startsWith('http')) {
      return expert.avatar;
    }

    const avatarMap: Record<string, string> = {
      'avatar_0001': '👨‍⚕️',
      'avatar_0002': '👩‍⚕️',
      'avatar_0003': '🧑‍💼',
      'avatar_0004': '👨‍💼',
      'avatar_0005': '👩‍💼',
      'avatar_0006': '🧑‍🔬',
      'avatar_0007': '👨‍🔬',
      'avatar_0008': '👩‍🔬',
      'avatar_0009': '👨‍⚖️',
      'avatar_0010': '👩‍⚖️',
    };

    return avatarMap[expert.avatar] || '🤖';
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => (
        <p key={index} className={index > 0 ? 'mt-2' : ''}>
          {line}
        </p>
      ));
  };

  return (
    <div className={cn("flex flex-col space-y-4 p-4", className)}>
      {messages.map((message, index) => (
        <div key={message.id} className="group">
          <div className={cn(
            "flex gap-3",
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          )}>
            {/* Avatar */}
            <Avatar className="h-8 w-8 shrink-0">
              {message.role === 'user' ? (
                <>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src={expert?.avatar?.startsWith('http') ? expert.avatar : undefined} />
                  <AvatarFallback className="bg-primary/10">
                    {typeof getAgentAvatar(expert) === 'string' && getAgentAvatar(expert).length <= 2 ? (
                      getAgentAvatar(expert)
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </>
              )}
            </Avatar>

            {/* Message Content */}
            <div className={cn(
              "flex flex-col space-y-2 max-w-[80%]",
              message.role === 'user' ? 'items-end' : 'items-start'
            )}>
              {/* Message Header */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  {message.role === 'user' ? 'You' : expert?.name || 'AI Assistant'}
                </span>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {message.metadata?.confidence && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(message.metadata.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "rounded-lg px-4 py-3 text-sm",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted border"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {formatContent(message.content)}
                </div>
              </div>

              {/* Message Actions */}
              {message.role === 'assistant' && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopyMessage(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Metadata */}
              {message.metadata && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {message.metadata.model && (
                    <div>Model: {message.metadata.model}</div>
                  )}
                  {message.metadata.tokens && (
                    <div>Tokens: {message.metadata.tokens}</div>
                  )}
                  {message.metadata.processingTime && (
                    <div>Response time: {message.metadata.processingTime}ms</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={expert?.avatar?.startsWith('http') ? expert.avatar : undefined} />
            <AvatarFallback className="bg-primary/10">
              {typeof getAgentAvatar(expert) === 'string' && getAgentAvatar(expert).length <= 2 ? (
                getAgentAvatar(expert)
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-2">
            <div className="text-xs text-muted-foreground">
              {expert?.name || 'AI Assistant'} is typing...
            </div>
            <div className="bg-muted border rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}