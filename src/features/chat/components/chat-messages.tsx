'use client';

import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Edit,
  ExternalLink,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { useState, useCallback } from 'react';

import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai/reasoning';
import { Response } from '@/components/ai/response';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AgentSelection } from '@/components/ai/agent-selection';
import { renderTextWithCitations } from '@/inline-citation';
import { ChatMessage, useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  messages: ChatMessage[];
  liveReasoning?: string;
  isReasoningActive?: boolean;
}

export function ChatMessages({ messages, liveReasoning, isReasoningActive }: ChatMessagesProps) {
  const { 
    agents, 
    regenerateResponse, 
    editMessage, 
    setSelectedAgent, 
    setInteractionMode,
    suggestedAgents,
    showAgentSelection,
    isWaitingForAgentSelection,
    selectAgentFromSuggestions,
    hideAgentSelection
  } = useChatStore();
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  // Debug logging for messages (disabled for production)
  // console.log('🔍 [ChatMessages] Rendering messages:', {
  //   totalMessages: messages.length,
  //   messages: messages.map(msg => ({
  //     id: msg.id,
  //     role: msg.role,
  //     contentLength: msg.content?.length || 0,
  //     isLoading: msg.isLoading,
  //     contentPreview: msg.content?.substring(0, 50) + '...'
  //   }))
  // });

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

  const handleAgentSelect = useCallback(async (agent: any) => {
    console.log('🎯 User selected agent:', agent.name);
    
    try {
      // First, select the agent from suggestions
      selectAgentFromSuggestions(agent);
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get the current state to ensure agent is selected
      const currentState = useChatStore.getState();
      console.log('🔍 Current selected agent after selection:', currentState.selectedAgent?.name);
      
      // Continue the conversation with the selected agent
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      if (lastUserMessage) {
        console.log('🔄 Continuing conversation with selected agent:', agent.name);
        // Send the message with the selected agent
        await currentState.sendMessage(lastUserMessage.content);
      } else {
        console.warn('No user message found to continue conversation');
        // If no user message, just close the selection modal
        hideAgentSelection();
      }
    } catch (error) {
      console.error('Error in agent selection:', error);
      // Close the modal on error
      hideAgentSelection();
    }
  }, [selectAgentFromSuggestions, messages, hideAgentSelection]);

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
                        {(source as any).title || (source as any).name || `Document ${index + 1}`}
                      </h5>
                      <p className="text-xs text-medical-gray line-clamp-2">
                        {(source as any).excerpt || (source as any).content || 'No preview available'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Relevance: {Math.round(((source as any).similarity || 0.8) * 100)}%
                        </Badge>
                        {(source as any).source_url && (
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

        {/* Expert Recommendations - Role-based */}
        {metadata.alternativeAgents && metadata.alternativeAgents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-medical-gray mb-3 flex items-center gap-2">
              <span className="text-market-purple">💡</span>
              Would you like to discuss this with a specialist?
            </h4>
            <div className="space-y-2">
              {metadata.alternativeAgents.slice(0, 3).map((altAgent, index) => (
                <Card key={index} className="p-3 bg-market-purple/5 border-market-purple/20 hover:bg-market-purple/10 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <AgentAvatar
                        avatar={altAgent.agent.avatar}
                        name={altAgent.agent.display_name || altAgent.agent.name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-medium text-deep-charcoal">
                            {altAgent.agent.display_name || altAgent.agent.name}
                          </h5>
                          <Badge variant="outline" className="text-xs">
                            {altAgent.score}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-medical-gray line-clamp-1">
                          {altAgent.agent.description}
                        </p>
                        {altAgent.agent.role && (
                          <p className="text-xs text-market-purple mt-1">
                            Role: {altAgent.agent.role}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-market-purple hover:bg-market-purple/10"
                      onClick={() => {
                        setInteractionMode('manual');
                        setSelectedAgent(altAgent.agent);
                      }}
                    >
                      Talk to Specialist
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-medical-gray mt-2 italic">
              Switching will start a new conversation in manual mode with the selected specialist.
            </p>
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
                  {isUser ? 'You' : (agent?.name || agent?.display_name || 'Assistant')}
                </span>
                <span className="text-xs text-medical-gray">
                  {formatTimestamp(message.timestamp)}
                </span>
                {!isUser && agent && agent.capabilities && agent.capabilities.length > 0 && (
                  <Badge variant="outline" className={cn('text-xs', agent.color)}>
                    {agent.capabilities[0]}
                  </Badge>
                )}
              </div>

              {/* AI Reasoning Component - show ABOVE message content for assistant */}
              {!isUser && message.metadata?.reasoning && (
                <div className="mb-3">
                  <Reasoning isStreaming={false}>
                    <ReasoningTrigger title="I am thinking..." />
                    <ReasoningContent>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap">
                        {message.metadata.reasoning}
                      </div>
                    </ReasoningContent>
                  </Reasoning>
                </div>
              )}

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
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
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
                  <div>
                    {/* Simplified message content rendering */}
                    <div className={cn(isUser ? 'text-white' : 'text-deep-charcoal')}>
                      {message.isLoading && !message.content ? (
                        // Show loading when no content yet
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>Thinking...</span>
                          </div>
                        </div>
                      ) : (
                        // Show content (streaming or complete)
                        <div className="relative">
                          <Response>
                            {typeof message.content === 'string' ? message.content : JSON.stringify(message.content) || ''}
                          </Response>
                          {message.isLoading && message.content && (
                            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata removed - clean interface */}
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

      {/* Live Reasoning Component - shows while AI is thinking */}
      {(liveReasoning || isReasoningActive) && (
        <div className="mb-6">
          <Reasoning isStreaming={isReasoningActive || false}>
            <ReasoningTrigger title={`I am thinking... ${isReasoningActive ? '🔄' : '✅'}`} />
            <ReasoningContent>
              <div className="space-y-3">
                {liveReasoning ? (
                  liveReasoning.split('\n').map((step, index) => {
                    // Skip empty lines
                    if (!step.trim()) return null;
                    
                    // Check if it's a reasoning step (starts with emoji or bullet)
                    const isStep = step.match(/^[🔍🧠⚡📊✅❌]/) || step.startsWith('•') || step.startsWith('-');
                    const isAgentSelection = step.includes('Selected') && step.includes('agent');
                    const isDomainInfo = step.includes('Detected domains:') || step.includes('Confidence:') || step.includes('Reasoning:') || step.includes('Using model:');
                    const isOtherAgents = step.includes('Other considered agents:');
                    const isCompleted = step.includes('✅') || step.includes('Selected') || step.includes('Complete');
                    
                    return (
                      <div key={index} className={cn(
                        'flex items-start gap-3 p-3 rounded-lg',
                        isStep ? 'bg-blue-50 border border-blue-200' : 
                        isAgentSelection ? 'bg-green-50 border border-green-200' :
                        isDomainInfo ? 'bg-purple-50 border border-purple-200' :
                        isOtherAgents ? 'bg-gray-50 border border-gray-200' :
                        'bg-gray-50'
                      )}>
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : isStep ? (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          ) : isAgentSelection ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          ) : isDomainInfo ? (
                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-sm text-gray-700">
                          <span className="font-medium">{step}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm text-gray-700">Preparing response...</div>
                  </div>
                )}
              </div>
            </ReasoningContent>
          </Reasoning>
        </div>
      )}

      {/* Agent Selection Modal */}
      <Dialog open={showAgentSelection} onOpenChange={hideAgentSelection}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select the Best Agent for Your Query</DialogTitle>
          </DialogHeader>
          <AgentSelection
            agents={suggestedAgents}
            onSelect={handleAgentSelect}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}