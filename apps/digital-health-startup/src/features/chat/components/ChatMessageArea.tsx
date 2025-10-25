'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';

import { Button } from '@vital/ui/components/button';
import { ChatInput } from '@/features/chat/components/chat-input';
import { ChatMessages } from '@/features/chat/components/chat-messages';
import type { Agent, AIModel, ChatMessage } from '@/lib/stores/chat-store';

interface ChatMessageAreaProps {
  // Agent info
  selectedAgent: Agent | null;
  selectedExpert: Agent | null;
  interactionMode: 'automatic' | 'manual';

  // Messages
  messages: ChatMessage[];
  liveReasoning: string;
  isReasoningActive: boolean;

  // Prompt starters
  promptStarters: Array<{ text: string; description: string; color: string; fullPrompt?: string }>;

  // Input handling
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;

  // Agent recommendations overlay
  recommendedAgents: any[];
  pendingMessage: string;
  onSelectRecommendedAgent: (agent: any) => void;
  onCancelRecommendation: () => void;
  isSelectingAgent: boolean;

  // Model selection
  selectedModel: AIModel | null;
  onModelChange: (model: AIModel | null) => void;
  onStop: () => void;

  // Expert mode
  onChangeExpert?: () => void;
}

/**
 * Chat message area - displays agent profile, prompt starters, messages, and input
 * Handles both empty state (with prompt starters) and active conversation state
 */
export function ChatMessageArea({
  selectedAgent,
  selectedExpert,
  interactionMode,
  messages,
  liveReasoning,
  isReasoningActive,
  promptStarters,
  input,
  onInputChange,
  onSend,
  onKeyPress,
  isLoading,
  recommendedAgents,
  pendingMessage,
  onSelectRecommendedAgent,
  onCancelRecommendation,
  isSelectingAgent,
  selectedModel,
  onModelChange,
  onStop,
  onChangeExpert,
}: ChatMessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Expert Profile Header - Show when in manual mode */}
      {interactionMode === 'manual' && selectedExpert && (
        <div className="border-b px-6 py-3 bg-gray-50 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-gray-200 overflow-hidden flex-shrink-0">
              {selectedExpert.avatar && (selectedExpert.avatar.startsWith('/') || selectedExpert.avatar?.includes('avatar_')) ? (
                <Image
                  src={selectedExpert.avatar}
                  alt={selectedExpert.display_name || selectedExpert.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xl">{selectedExpert.avatar || '>'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {selectedExpert.display_name || selectedExpert.name}
              </h3>
              <p className="text-xs text-gray-600 truncate">{selectedExpert.description}</p>
            </div>
            {onChangeExpert && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onChangeExpert}
                className="flex-shrink-0"
              >
                Change
              </Button>
            )}
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        // No messages - show centered agent profile with prompt starters and input
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-6">
          <div className="w-full max-w-4xl mx-auto py-8">
            {/* Agent Avatar and Info */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                {selectedAgent?.avatar && (selectedAgent.avatar.startsWith('/') || selectedAgent.avatar.includes('avatar_')) ? (
                  <Image
                    src={selectedAgent.avatar}
                    alt={selectedAgent.display_name || selectedAgent.name || 'AI Assistant'}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-5xl">{selectedAgent?.avatar || '>'}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedAgent?.display_name || selectedAgent?.name || 'AI Assistant'}
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                {selectedAgent?.description || 'Your AI assistant'}
              </p>
            </div>

            {/* 4 Prompt Starters Grid */}
            {promptStarters.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {promptStarters.slice(0, 4).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onInputChange(prompt.fullPrompt || prompt.text);
                      setTimeout(() => onSend(), 100);
                    }}
                    className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <div className="text-sm text-gray-700 group-hover:text-gray-900 line-clamp-3 font-medium">
                      {prompt.text}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Input component centered with content */}
            <div className="mt-6">
              <ChatInput
                value={input}
                onChange={onInputChange}
                onSend={onSend}
                onKeyPress={onKeyPress}
                isLoading={isLoading}
                selectedAgent={selectedAgent}
                enableVoice={true}
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                onStop={onStop}
              />
            </div>
          </div>
        </div>
      ) : (
        // Has messages - show messages area with input at bottom
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <ChatMessages
                messages={messages}
                liveReasoning={liveReasoning}
                isReasoningActive={isReasoningActive}
              />
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Agent Recommendations overlay - shows over messages */}
          {recommendedAgents.length > 0 && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="w-full max-w-3xl">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Which expert would you like to consult?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your question: &quot;{pendingMessage}&quot;
                  </p>
                </div>

                <div className="space-y-3">
                  {recommendedAgents.map((agent, index) => (
                    <div
                      key={agent.id}
                      className="p-4 border rounded-lg cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                      onClick={() => onSelectRecommendedAgent(agent)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 flex-shrink-0 overflow-hidden">
                          {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.includes('avatar_')) ? (
                            <Image
                              src={agent.avatar}
                              alt={agent.display_name || agent.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-2xl">{agent.avatar || '>'}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {agent.display_name || agent.name}
                            {index === 0 && (
                              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                Best Match
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                          <p className="text-xs text-gray-500 italic">{agent.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={onCancelRecommendation}
                    className="text-sm text-gray-600"
                  >
                    Cancel and edit question
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Input component at bottom when there are messages */}
          <div className="flex-shrink-0 border-t bg-white">
            <div className="max-w-4xl mx-auto px-6 py-3">
              {isSelectingAgent && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-2">
                  <span className="animate-pulse">Finding the best experts for your question...</span>
                </div>
              )}
              <ChatInput
                value={input}
                onChange={onInputChange}
                onSend={onSend}
                onKeyPress={onKeyPress}
                isLoading={isLoading || isSelectingAgent}
                selectedAgent={selectedAgent}
                enableVoice={true}
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                onStop={onStop}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
