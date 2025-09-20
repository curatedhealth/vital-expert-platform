'use client';

import { useState, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { ChatMessage, useChatStore } from '@/lib/stores/chat-store';
import {
  Copy,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Zap,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const { agents, regenerateResponse, editMessage } = useChatStore();
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  const getAgent = useCallback((agentId?: string) => {
    return agents.find((a) => a.id === agentId);
  }, [agents]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const formatTimestamp = useCallback((date: Date | string | number) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid time';
    }
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const handleEditStart = useCallback((message: ChatMessage) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  }, []);

  const handleEditSave = useCallback(() => {
    if (editingMessage && editContent.trim()) {
      editMessage(editingMessage, editContent.trim());
      setEditingMessage(null);
      setEditContent('');
    }
  }, [editingMessage, editContent, editMessage]);

  const handleEditCancel = useCallback(() => {
    setEditingMessage(null);
    setEditContent('');
  }, []);

  const MessageActions = ({ message }: { message: ChatMessage }) => (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => copyToClipboard(message.content)}
      >
        <Copy className="h-3 w-3" />
      </Button>
      {message.role === 'assistant' && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => regenerateResponse(message.id)}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-clinical-green"
          >
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-clinical-red"
          >
            <ThumbsDown className="h-3 w-3" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => handleEditStart(message)}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );

  const SourcesAndCitations = ({ metadata }: { metadata: ChatMessage['metadata'] }) => {
    if (!metadata?.sources?.length && !metadata?.citations?.length) return null;

    return (
      <div className="mt-4 space-y-3">
        {/* Citations */}
        {metadata.citations && metadata.citations.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-medical-gray mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Sources Referenced
            </h4>
            <div className="flex flex-wrap gap-1">
              {metadata.citations.map((citation, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-trust-blue/5 text-trust-blue border-trust-blue/20"
                >
                  [{citation}]
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {metadata.sources && metadata.sources.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-medical-gray mb-2">
              Knowledge Base Sources
            </h4>
            <div className="space-y-2">
              {metadata.sources.slice(0, 3).map((source, index) => (
                <Card key={index} className="p-3 bg-background-gray/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="text-xs font-medium text-deep-charcoal mb-1">
                        {source.title || source.name || `Document ${index + 1}`}
                      </h5>
                      <p className="text-xs text-medical-gray line-clamp-2">
                        {source.excerpt || source.content || 'No preview available'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Relevance: {Math.round((source.similarity || 0.8) * 100)}%
                        </Badge>
                        {source.source_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-trust-blue"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Source
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {metadata.followupQuestions && metadata.followupQuestions.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-medical-gray mb-2">
              Suggested Follow-up Questions
            </h4>
            <div className="space-y-1">
              {metadata.followupQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-xs text-left justify-start w-full hover:bg-progress-teal/5"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {messages.map((message) => {
        const agent = getAgent(message.agentId);
        const isUser = message.role === 'user';

        return (
          <div
            key={message.id}
            className={cn(
              'group flex gap-4',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className={cn('flex-shrink-0', isUser && 'order-2')}>
              {isUser ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-trust-blue to-progress-teal text-white flex items-center justify-center text-sm font-bold">
                  U
                </div>
              ) : (
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  agent?.color ? `bg-${agent.color.replace('text-', '')}/10` : 'bg-medical-gray/10'
                )}>
                  <AgentAvatar
                    avatar={agent?.avatar || '🤖'}
                    name={agent?.name || 'Assistant'}
                    size="sm"
                    className="w-8 h-8"
                  />
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className={cn('flex-1 max-w-4xl', isUser && 'flex flex-col items-end')}>
              {/* Message Header */}
              <div className={cn('flex items-center gap-2 mb-2', isUser && 'flex-row-reverse')}>
                <span className="text-sm font-medium text-deep-charcoal">
                  {isUser ? 'You' : agent?.name || 'Assistant'}
                </span>
                <span className="text-xs text-medical-gray">
                  {formatTimestamp(message.timestamp)}
                </span>
                {!isUser && agent && (
                  <Badge variant="outline" className={cn('text-xs', agent.color)}>
                    {agent.capabilities[0]}
                  </Badge>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  'relative p-4 rounded-lg',
                  isUser
                    ? 'bg-progress-teal text-white ml-12'
                    : 'bg-white border border-gray-200 mr-12'
                )}
              >
                {editingMessage === message.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                      placeholder="Edit your message..."
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleEditSave}
                        className="h-8"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                        className="h-8"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Normal view mode
                  <div className="prose prose-sm max-w-none">
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-progress-teal rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-progress-teal rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-progress-teal rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm text-medical-gray">Generating response...</span>
                      </div>
                    ) : (
                      <p className={cn(
                        'whitespace-pre-wrap',
                        isUser ? 'text-white' : 'text-deep-charcoal'
                      )}>
                        {message.content}
                        {message.isLoading && message.content && (
                          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Metadata for assistant messages */}
                {!isUser && message.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {/* Processing info */}
                    {message.metadata.processingTime && (
                      <div className="flex items-center gap-4 text-xs text-medical-gray mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {message.metadata.processingTime}ms
                        </div>
                        {message.metadata.tokenUsage && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {message.metadata.tokenUsage.totalTokens} tokens
                          </div>
                        )}
                      </div>
                    )}

                    <SourcesAndCitations metadata={message.metadata} />
                  </div>
                )}
              </div>

              {/* Message Actions - positioned below the message bubble */}
              <div className={cn(
                'mt-2 flex justify-end',
                isUser ? 'mr-12' : 'ml-12'
              )}>
                <MessageActions message={message} />
              </div>
            </div>
          </div>
        );
      })}

    </div>
  );
}