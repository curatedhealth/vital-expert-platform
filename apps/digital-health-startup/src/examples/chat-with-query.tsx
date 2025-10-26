'use client';

import { useState } from 'react';

import { Button } from '@vital/ui';
import { Textarea } from '@vital/ui';
import {
  useChatQuery,
  useAddMessageMutation,
  type ChatMessage
} from '@/lib/hooks/use-chat-query';

interface ChatWithQueryProps {
  chatId: string;
  userId: string;
}

/**
 * Example chat component demonstrating React Query usage
 *
 * Features demonstrated:
 * - Real-time data fetching with short cache (5 min)
 * - Optimistic updates for instant UI feedback
 * - Automatic rollback on error
 * - Loading and error states
 * - Mutations with cache updates
 */
export function ChatWithQuery({ chatId, userId }: ChatWithQueryProps) {
  const [message, setMessage] = useState('');

  // Fetch chat with React Query
  // Cache duration: 5 minutes (shorter for active chats)
  const {
    data: chatResponse,
    error,
    isLoading
  } = useChatQuery(chatId);

  // Add message mutation with optimistic update
  const addMessageMutation = useAddMessageMutation();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Partial<ChatMessage> = {
      content: message.trim(),
      role: 'user',
      timestamp: Date.now()
    };

    try {
      // This will:
      // 1. Immediately update UI (optimistic)
      // 2. Send request to server
      // 3. Update with server response
      // 4. Rollback if error occurs
      await addMessageMutation.mutateAsync({
        chatId,
        message: newMessage
      });

      setMessage(''); // Clear input on success
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading chat: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const chat = chatResponse?.chat;
  const messages = chat?.messages || [];

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <div className="border-b p-4 bg-muted/40">
        <h2 className="font-semibold">{chat?.title || 'Chat'}</h2>
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || `msg-${idx}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator for pending message */}
        {addMessageMutation.isPending && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary/50 text-primary-foreground">
              <p className="text-sm opacity-70">Sending...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={addMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || addMessageMutation.isPending}
            className="self-end"
          >
            {addMessageMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Usage in a page:
 *
 * ```tsx
 * 'use client';
 *
 * import { ChatWithQuery } from '@/examples/chat-with-query';
 * import { useAuth } from '@/lib/auth/supabase-auth-context';
 *
 * export default function ChatPage({ params }: { params: { chatId: string } }) {
 *   const { user } = useAuth();
 *
 *   if (!user) {
 *     return <div>Please log in to view chat</div>;
 *   }
 *
 *   return (
 *     <div className="container mx-auto py-8 max-w-4xl">
 *       <ChatWithQuery chatId={params.chatId} userId={user.id} />
 *     </div>
 *   );
 * }
 * ```
 *
 * Benefits demonstrated:
 *
 * 1. **Optimistic Updates**: Messages appear instantly before server confirms
 * 2. **Automatic Rollback**: If server fails, UI reverts to previous state
 * 3. **Short Cache**: 5-minute cache for active chats (can be shorter)
 * 4. **Loading States**: Clear feedback during async operations
 * 5. **Error Recovery**: Graceful error handling with retry options
 * 6. **Type Safety**: Full TypeScript support for messages
 * 7. **Real-time Feel**: Instant UI updates create responsive experience
 *
 * Advanced usage:
 *
 * - Add polling for real-time updates: `refetchInterval: 5000`
 * - Implement infinite scroll for message history
 * - Add websocket integration for true real-time
 * - Prefetch next chat in conversation list
 */
