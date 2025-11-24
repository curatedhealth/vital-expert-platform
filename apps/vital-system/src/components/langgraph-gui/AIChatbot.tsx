import React from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from './ai/conversation';
import { Loader } from './ai/loader';
import { Message, MessageAvatar, MessageContent } from './ai/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputButton,
  PromptInputTools,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
} from './ai/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from './ai/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from './ai/sources';
import { PhaseStatus, PhaseStatusTrigger, PhaseStatusContent, PhaseStatusItem } from './ai/phase-status';
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from './ai/task';
import { Button } from '@/components/ui/button';
import { RotateCcwIcon, Eye, EyeOff, PaperclipIcon, MicIcon } from 'lucide-react';
import { expertIdentityManager } from '@/lib/langgraph-gui/expertIdentity';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'log' | 'expert' | 'moderator';
  content: string;
  timestamp: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  avatar?: string;
  name?: string;
  reasoning?: string;
  sources?: Array<{ title: string; url: string }>;
  isStreaming?: boolean;
  isPhaseStatus?: boolean;
  expertId?: string;
  expertType?: string;
  taskItems?: Array<{ text: string; completed?: boolean; file?: string }>;
  taskTitle?: string;
  isTaskActive?: boolean;
}

interface AIChatbotProps {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  emptyState?: React.ReactNode;
  onReset?: () => void;
  showHeader?: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  models?: Array<{ id: string; name: string }>;
}

export function AIChatbot({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  placeholder = "Type your message...",
  emptyState,
  onReset,
  showHeader = false,
  selectedModel = 'gpt-4o',
  onModelChange,
  models = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  ],
}: AIChatbotProps) {
  const [showLogs, setShowLogs] = React.useState(false);
  const conversationRef = React.useRef<HTMLDivElement>(null);

  // Separate phase status messages from regular messages
  const { visibleMessages, phaseStatusMessages } = React.useMemo(() => {
    const phaseStatus = messages.filter(msg => msg.isPhaseStatus);
    const regular = messages.filter(msg => {
      if (msg.isPhaseStatus) return false;
      if (!showLogs && msg.role === 'log') return false;
      return true;
    });
    return { visibleMessages: regular, phaseStatusMessages: phaseStatus };
  }, [messages, showLogs]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (conversationRef.current) {
      const scrollContainer = conversationRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [visibleMessages]);

  // Extract sources from message content (look for URLs or citations)
  const extractSources = (content: string): Array<{ title: string; url: string }> => {
    const sources: Array<{ title: string; url: string }> = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    if (matches) {
      matches.forEach((url, index) => {
        sources.push({
          title: `Source ${index + 1}`,
          url: url,
        });
      });
    }
    return sources;
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="font-medium text-sm">AI Assistant</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground text-xs">Workflow Test</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
              className="h-8 px-2"
            >
              {showLogs ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              <span className="ml-1">{showLogs ? 'Hide' : 'Show'} Logs</span>
            </Button>
            {onReset && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onReset}
                className="h-8 px-2"
              >
                <RotateCcwIcon className="size-4" />
                <span className="ml-1">Reset</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Conversation Area */}
      <div ref={conversationRef} className="flex-1 min-h-0">
        <Conversation className="h-full">
          <ConversationContent className="space-y-4">
            {visibleMessages.length === 0 && emptyState ? (
              emptyState
            ) : (
              visibleMessages.map((message) => {
                // Log messages (only shown if showLogs is true)
                if (message.role === 'log') {
                  return (
                    <div key={message.id} className="flex items-start gap-2 w-full">
                      <span className="text-muted-foreground/60 flex-shrink-0 w-16 text-xs">
                        {message.timestamp}
                      </span>
                      <MessageContent level={message.level} className="flex-1">
                        {message.content}
                      </MessageContent>
                    </div>
                  );
                }

                // Determine message role for display
                const displayRole = message.role === 'expert' || message.role === 'moderator' 
                  ? 'assistant' 
                  : message.role;

                // Extract sources from content
                const messageSources = message.sources || extractSources(message.content);

                // Get expert identity if this is an expert message
                let expertIdentity = null;
                if (message.role === 'expert' && message.expertId) {
                  expertIdentity = expertIdentityManager.getExpert(message.expertId);
                } else if (message.role === 'expert' && message.name) {
                  // Try to find by name
                  expertIdentity = expertIdentityManager.getAllExperts().find(e => e.name === message.name);
                }

                const displayName = message.name || (message.role === 'expert' ? 'Expert' : message.role === 'moderator' ? 'Moderator' : undefined);
                const expertIcon = expertIdentity?.icon;
                const expertColor = expertIdentity?.color;

                return (
                  <div key={message.id} className="space-y-3">
                    <Message 
                      from={message.role} 
                      avatar={message.avatar} 
                      name={displayName}
                    >
                      {message.role !== 'user' && (
                        <MessageAvatar 
                          from={message.role} 
                          avatar={message.avatar} 
                          name={displayName}
                          icon={expertIcon}
                          color={expertColor}
                        />
                      )}
                      <MessageContent from={displayRole}>
                        {message.isStreaming && message.content === '' ? (
                          <div className="flex items-center gap-2">
                            <Loader size={14} />
                            <span className="text-muted-foreground text-sm">Thinking...</span>
                          </div>
                        ) : (
                          message.content
                        )}
                      </MessageContent>
                      {message.role === 'user' && (
                        <MessageAvatar 
                          from={message.role} 
                          avatar={message.avatar} 
                          name={displayName}
                        />
                      )}
                    </Message>

                    {/* Reasoning */}
                    {message.reasoning && (
                      <div className="ml-10">
                        <Reasoning isStreaming={message.isStreaming} defaultOpen={message.isStreaming || false}>
                          <ReasoningTrigger />
                          <ReasoningContent>{message.reasoning}</ReasoningContent>
                        </Reasoning>
                      </div>
                    )}

                    {/* Task Progress */}
                    {message.taskTitle && (
                      <div className="ml-10">
                        <Task isActive={message.isTaskActive} defaultOpen={message.isTaskActive}>
                          <TaskTrigger title={message.taskTitle} />
                          <TaskContent>
                            {message.taskItems?.map((item, index) => {
                              // If item has a file, render it with TaskItemFile
                              if (item.file) {
                                const parts = item.text.split(item.file);
                                return (
                                  <TaskItem key={index} completed={item.completed}>
                                    {parts[0]}
                                    <TaskItemFile>{item.file}</TaskItemFile>
                                    {parts[1] || ''}
                                  </TaskItem>
                                );
                              }
                              // Otherwise just render the text
                              return (
                                <TaskItem key={index} completed={item.completed}>
                                  {item.text}
                                </TaskItem>
                              );
                            })}
                          </TaskContent>
                        </Task>
                      </div>
                    )}

                    {/* Sources */}
                    {messageSources && messageSources.length > 0 && (
                      <div className="ml-10">
                        <Sources>
                          <SourcesTrigger count={messageSources.length} />
                          <SourcesContent>
                            {messageSources.map((source, index) => (
                              <Source key={index} href={source.url} title={source.title} />
                            ))}
                          </SourcesContent>
                        </Sources>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {/* Phase Status Messages - Collapsible Section */}
            {phaseStatusMessages.length > 0 && (
              <div className="mt-4">
                <PhaseStatus>
                  <PhaseStatusTrigger count={phaseStatusMessages.length} />
                  <PhaseStatusContent>
                    {phaseStatusMessages.map((msg) => (
                      <PhaseStatusItem
                        key={msg.id}
                        message={msg.content}
                        timestamp={msg.timestamp}
                        level={msg.level}
                      />
                    ))}
                  </PhaseStatusContent>
                </PhaseStatus>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input Area */}
      <div className="border-t p-4 shrink-0">
        <PromptInput onSubmit={onSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton disabled={isLoading} type="button">
                <PaperclipIcon size={16} />
              </PromptInputButton>
              <PromptInputButton disabled={isLoading} type="button">
                <MicIcon size={16} />
                <span className="ml-1 text-xs">Voice</span>
              </PromptInputButton>
              {onModelChange && (
                <PromptInputModelSelect 
                  value={selectedModel} 
                  onValueChange={onModelChange}
                  disabled={isLoading}
                >
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((model: { id: string; name: string }) => (
                      <PromptInputModelSelectItem key={model.id} value={model.id}>
                        {model.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              )}
            </PromptInputTools>
            <PromptInputSubmit disabled={!input.trim() || isLoading} isLoading={isLoading} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
