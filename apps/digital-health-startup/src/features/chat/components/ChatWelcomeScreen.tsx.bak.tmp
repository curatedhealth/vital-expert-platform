'use client';

import { Zap } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card } from '@vital/ui';
import { ChatInput } from '@/features/chat/components/chat-input';
import type { AIModel } from '@/lib/stores/chat-store';

interface ChatWelcomeScreenProps {
  // Mode & state
  interactionMode: 'automatic' | 'manual';
  currentTier: 1 | 2 | 3 | 'human';
  escalationHistory: unknown[];

  // Agent selection
  isSelectingAgent: boolean;
  recommendedAgents: any[];
  pendingMessage: string;

  // Input handling
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;

  // Agent recommendations
  onSelectRecommendedAgent: (agent: any) => void;
  onCancelRecommendation: () => void;

  // Model selection
  selectedModel: AIModel | null;
  onModelChange: (model: AIModel | null) => void;
  onStop: () => void;
}

/**
 * Initial welcome screen shown when no messages exist
 * Displays orchestrator info (automatic mode) or agent selection prompt (manual mode)
 */
export function ChatWelcomeScreen({
  interactionMode,
  currentTier,
  escalationHistory,
  isSelectingAgent,
  recommendedAgents,
  pendingMessage,
  input,
  onInputChange,
  onSend,
  onKeyPress,
  isLoading,
  onSelectRecommendedAgent,
  onCancelRecommendation,
  selectedModel,
  onModelChange,
  onStop,
}: ChatWelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full px-6">
          {/* Orchestrator Avatar and Info - Show when in automatic mode */}
          {interactionMode === 'automatic' && (
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 mx-auto mb-4 overflow-hidden relative">
                <Image
                  src="/icons/png/general/AI Ethics.png"
                  alt="AI Agent Orchestrator"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                AI Agent Orchestrator
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Automatic agent selection and escalation
              </p>
              {escalationHistory.length > 0 && (
                <div className="text-sm text-gray-600">
                  <Badge variant="outline" className="mr-2">
                    Tier {currentTier === 'human' ? 'Human Expert' : currentTier}
                  </Badge>
                  {escalationHistory.length} escalation(s)
                </div>
              )}
            </div>
          )}

          {/* Welcome message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-normal text-gray-900 mb-4">
              What&apos;s on the agenda today?
            </h1>
            <p className="text-gray-600 mb-6">
              Ask me anything about digital health, clinical trials, regulatory compliance, and more.
            </p>
            {isSelectingAgent && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-4">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Finding the best experts for your question...</span>
              </div>
            )}
          </div>

          {/* Agent Recommendations - Step 1 */}
          {recommendedAgents.length > 0 ? (
            <div className="w-full max-w-3xl mb-6">
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
                  <Card
                    key={agent.id}
                    className="p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
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
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {agent.display_name || agent.name}
                          </h4>
                          {index === 0 && (
                            <Badge variant="default" className="bg-blue-600">
                              Best Match
                            </Badge>
                          )}
                          {agent.tier && (
                            <Badge variant="outline">
                              Tier {agent.tier}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {agent.description}
                        </p>
                        <p className="text-xs text-gray-500 italic">
                          {agent.reasoning}
                        </p>
                      </div>
                    </div>
                  </Card>
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
          ) : null}

          {/* Single chat input - always visible when no recommendations */}
          {recommendedAgents.length === 0 && (
            <div className="w-full max-w-3xl">
              <ChatInput
                value={input}
                onChange={onInputChange}
                onSend={onSend}
                onKeyPress={onKeyPress}
                isLoading={isLoading || isSelectingAgent}
                selectedAgent={null}
                enableVoice={true}
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                onStop={onStop}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
