'use client';

import { Send, Bot, User as UserIcon, Settings, Brain, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAutonomousAgent, useAgentSettings } from '@/hooks/useAutonomousAgent';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import { AutonomousAgentSettings } from './AutonomousAgentSettings';
import { CompactToolExecutionDisplay, ToolExecutionDisplay } from './ToolExecutionDisplay';
import { UserProfileViewer } from './UserProfileViewer';
import type { StreamEvent } from '@/types/autonomous-agent.types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolExecutions?: any[];
  timestamp: Date;
}

interface AutonomousChatInterfaceProps {
  agent?: any;
  sessionId?: string;
  onAgentChange?: (agent: any) => void;
}

export function AutonomousChatInterface({
  agent,
  sessionId: propSessionId,
  onAgentChange,
}: AutonomousChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(propSessionId || `session-${Date.now()}`);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentStreamEvent, setCurrentStreamEvent] = useState<StreamEvent | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { settings, updateSettings, resetSettings } = useAgentSettings();

  const {
    sendMessage,
    isLoading,
    error,
    streamingContent,
    toolExecutions,
    personalizedContext,
  } = useAutonomousAgent({
    defaultOptions: settings,
    onStreamEvent: (event) => {
      setCurrentStreamEvent(event);
    },
    onComplete: (response) => {
      // Add assistant message to chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          toolExecutions,
          timestamp: new Date(),
        },
      ]);
      setCurrentStreamEvent(null);
    },
    onError: (err) => {
      console.error('Autonomous agent error:', err);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || !agent || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    await sendMessage(input.trim(), agent, sessionId, settings);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">{agent?.display_name || 'Autonomous Agent'}</h2>
                <p className="text-sm text-muted-foreground">
                  {agent?.description || 'AI-powered autonomous research assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
              >
                <Brain className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Personalized Context Banner */}
          {personalizedContext && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Using your profile:</span>
                <span className="text-muted-foreground">
                  {personalizedContext.relevantFacts?.length || 0} facts,{' '}
                  {personalizedContext.activeProjects?.length || 0} projects,{' '}
                  {personalizedContext.activeGoals?.length || 0} goals
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Ready to assist you</p>
                <p className="text-sm mt-2">
                  Ask anything and I'll autonomously research using 15+ specialized tools
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <Card className={message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                    <div className="p-4">
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                      {/* Tool Executions */}
                      {message.toolExecutions && message.toolExecutions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <CompactToolExecutionDisplay executions={message.toolExecutions} />
                        </div>
                      )}
                    </div>
                  </Card>

                  <div className="flex items-center gap-2 mt-1 px-2 text-xs text-muted-foreground">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Message */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 max-w-[80%]">
                  <Card>
                    <div className="p-4">
                      {/* Current Activity */}
                      {currentStreamEvent && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>
                            {currentStreamEvent.type === 'retrieval' && 'Searching knowledge base...'}
                            {currentStreamEvent.type === 'tool_execution' && `Using ${currentStreamEvent.tool}...`}
                            {currentStreamEvent.type === 'output' && 'Generating response...'}
                          </span>
                        </div>
                      )}

                      {/* Streaming Content */}
                      {streamingContent && (
                        <p className="whitespace-pre-wrap text-sm">{streamingContent}</p>
                      )}

                      {/* Tool Executions */}
                      {toolExecutions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <CompactToolExecutionDisplay executions={toolExecutions} />
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error.message}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... I'll autonomously research using specialized tools"
              className="min-h-[60px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="w-96 border-l p-4 overflow-y-auto">
          <AutonomousAgentSettings
            options={settings}
            onChange={updateSettings}
            onReset={resetSettings}
          />

          {/* Tool Executions Panel */}
          {toolExecutions.length > 0 && (
            <div className="mt-4">
              <ToolExecutionDisplay executions={toolExecutions} showDetails />
            </div>
          )}
        </div>
      )}

      {/* User Profile Dialog */}
      {user && (
        <UserProfileViewer
          userId={user.id}
          open={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
