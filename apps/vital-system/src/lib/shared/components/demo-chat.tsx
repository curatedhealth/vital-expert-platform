'use client';

import { Loader2, Send, User, Bot, Clock, Brain, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/lib/shared/components/ui/badge';
import { Button } from '@/lib/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shared/components/ui/card';
import { Input } from '@/lib/shared/components/ui/input';
import { ScrollArea } from '@/lib/shared/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  selectedAgents?: string[];
  processingTime?: number;
  confidence?: number;
}

export function DemoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Hello! I\'m the VITAL AI Expert Panel. I can help you explore digital health interventions for psoriasis patients in Europe. Try asking about market opportunities, regulatory requirements, or current solutions!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/expert-panel/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          selectedAgents: data.selectedAgents,
          processingTime: data.processingTime,
          confidence: data.confidence,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {/* Chat Area */}
      <div className="xl:col-span-3">
        <Card className="h-[700px] flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              VITAL AI Expert Panel - Psoriasis Digital Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex items-start gap-3 w-full ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <div className={`flex items-start gap-3 w-full ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`flex-1 min-w-0 max-w-[calc(100%-50px)] ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          <div className={`p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white max-w-xs ml-auto'
                              : 'bg-neutral-100 text-neutral-900'
                          }`}>
                            <div className="w-full">
                              {message.type === 'assistant' ? (
                                <div
                                  className="prose prose-sm max-w-none text-sm"
                                  style={{
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    hyphens: 'auto'
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: message.content
                                      .replace(/\n/g, '<br>')
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                      .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-3 mb-2" style="word-break: break-word;">$1</h3>')
                                      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-4 mb-2" style="word-break: break-word;">$1</h2>')
                                      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-4 mb-3" style="word-break: break-word;">$1</h1>')
                                      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1" style="word-break: break-word;">$1</li>')
                                      .replace(/(<li.*?>.*<\/li>)/gs, '<ul class="list-disc ml-4 mb-2">$1</ul>')
                                  }}
                                />
                              ) : (
                                <div className="text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                  {message.content}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Clock className="h-3 w-3" />
                            {formatTime(message.timestamp)}

                            {message.selectedAgents && (
                              <div className="flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                <span>{message.selectedAgents.length} agents</span>
                              </div>
                            )}

                            {message.processingTime && (
                              <span>• {(message.processingTime / 1000).toFixed(1)}s</span>
                            )}

                            {message.confidence && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{Math.round(message.confidence * 100)}%</span>
                              </div>
                            )}
                          </div>

                          {message.selectedAgents && (
                            <div className="flex flex-wrap gap-1">
                              {message.selectedAgents.map((agent, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {agent}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-neutral-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-neutral-600">AI Expert Panel analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about psoriasis digital health opportunities in Europe..."
                  disabled={isLoading}
                  className="flex-1 min-w-0"
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="flex-shrink-0">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with Quick Actions */}
      <div className="space-y-4 xl:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Test Queries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "I need to explore digital health interventions opportunities for patients with psoriasis in Europe. Can you help me understand the market landscape, regulatory requirements, and identify the most promising DTx solutions?",
              "What are the current digital health solutions for psoriasis management available in European markets?",
              "What are the specific EMA guidelines for psoriasis digital therapeutics?",
              "What is the prevalence of psoriasis in Germany?"
            ].map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left h-auto p-3 justify-start"
                onClick={() => setInput(query)}
                disabled={isLoading}
              >
                <div className="text-xs text-left">
                  <div className="font-medium mb-1">Test Query {index + 1}:</div>
                  <div className="text-neutral-600 line-clamp-3">
                    {query.substring(0, 80)}...
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Expert Panel: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>21 Healthcare Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Knowledge Base: Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}