'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Lightbulb, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent_id?: string;
  agent_name?: string;
  confidence?: number;
  cost?: number;
}

interface Agent {
  id: string;
  name: string;
  domain: string;
  tier: string;
  capabilities: string[];
  description: string;
}

interface InteractiveChatViewProps {
  sessionId: string | null;
  selectedAgent: Agent | null;
  onQuerySubmit: (query: string) => void;
  onGetRecommendation: (query: string) => void;
  isLoading?: boolean;
}

export function InteractiveChatView({
  sessionId,
  selectedAgent,
  onQuerySubmit,
  onGetRecommendation,
  isLoading = false
}: InteractiveChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Handle query submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const query = inputValue.trim();
    setInputValue('');

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Process query
    try {
      setIsStreaming(true);
      setStreamingContent('');
      await onQuerySubmit(query);
    } catch (error) {
      console.error('Failed to process query:', error);
      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your query. Please try again.',
        timestamp: new Date().toISOString(),
        agent_name: selectedAgent?.name
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // Handle recommendation request
  const handleGetRecommendation = async () => {
    if (!inputValue.trim()) return;
    
    try {
      await onGetRecommendation(inputValue.trim());
    } catch (error) {
      console.error('Failed to get recommendation:', error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Interactive Chat</h3>
        </div>
        {selectedAgent && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {selectedAgent.name}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {selectedAgent.domain.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Start a conversation with your expert</p>
              <p className="text-xs">Ask questions, get clarifications, or request guidance</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  )}
                  {message.role === 'user' && (
                    <User className="w-4 h-4 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {message.role === 'assistant' && message.agent_name && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {message.agent_name}
                        </span>
                      )}
                      <span className="text-xs opacity-70">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.confidence && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(message.confidence)}`}>
                          {(message.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {message.cost && (
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          Cost: ${message.cost.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex items-start space-x-2">
                  <Bot className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {selectedAgent && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {selectedAgent.name}
                        </span>
                      )}
                      <span className="text-xs opacity-70">
                        {formatTimestamp(new Date().toISOString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm">{streamingContent}</p>
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your expert a question..."
              disabled={isLoading || isStreaming}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isStreaming}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGetRecommendation}
              disabled={!inputValue.trim() || isLoading}
              className="text-xs"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Get Mode Recommendation
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {selectedAgent ? `Chatting with ${selectedAgent.name}` : 'No agent selected'}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
