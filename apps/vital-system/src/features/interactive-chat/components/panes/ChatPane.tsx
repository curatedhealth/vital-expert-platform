'use client';

import { useMemo, useState, useCallback, FormEvent } from 'react';

import {
  VitalAgentCard,
  VitalMessage,
  VitalMessageContent,
  VitalPromptInput,
  VitalPromptInputBody,
  VitalPromptInputTextarea,
  VitalPromptInputFooter,
  VitalPromptInputTools,
  VitalPromptInputSubmit,
  VitalThinking,
  VitalStreamText,
  VitalCitation,
  VitalSourcesTrigger,
  VitalSources,
  VitalSourcesContent,
  VitalSource,
  VitalSuggestions,
  VitalSuggestion,
  type PromptInputMessage,
} from '@vital/ai-ui';

import { Agent, Message, ThinkingState, Citation } from '../../stores/interactive-store';

type ChatPaneProps = {
  mode: 'mode_1' | 'mode_2';
  messages: Message[];
  activeAgent: Agent | null;
  thinkingState: ThinkingState;
  onSend: (text: string) => void;
  onToggleMode: () => void;
  isStreaming?: boolean;
  /** Current streaming content (for VitalStreamText) */
  currentContent?: string;
  /** Current citations during streaming */
  currentCitations?: Citation[];
  /** Prompt suggestions for the user */
  suggestions?: string[];
};

export function ChatPane({
  mode,
  messages,
  activeAgent,
  thinkingState,
  onSend,
  onToggleMode,
  isStreaming = false,
  currentContent = '',
  currentCitations = [],
  suggestions = [],
}: ChatPaneProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSources, setShowSources] = useState(false);

  const header = useMemo(() => {
    const modeLabel = mode === 'mode_1' ? 'Manual Selection' : 'Auto-Pilot';
    return activeAgent ? `${modeLabel} / ${activeAgent.name}` : modeLabel;
  }, [mode, activeAgent]);

  const handleSubmit = useCallback((message: PromptInputMessage, _event: FormEvent<HTMLFormElement>) => {
    const text = message.text.trim();
    if (text) {
      onSend(text);
      setInputValue('');
    }
  }, [onSend]);

  // Convert local Agent type to VitalAgentCard's expected format
  const toCardAgent = (agent: Agent) => ({
    id: agent.id,
    name: agent.name,
    level: (agent.level as 'L1' | 'L2' | 'L3' | 'L4' | 'L5') || 'L2',
    domain: 'Expert', // Default domain since local Agent doesn't have it
    avatar: agent.avatar,
    status: 'active' as const,
    capabilities: agent.capabilities || [],
  });

  // Convert ThinkingState steps (string[]) to ReasoningStep[]
  const reasoningSteps = useMemo(() =>
    thinkingState.steps.map((step, index) => ({
      id: `step-${index}`,
      step: `Step ${index + 1}`,
      content: step,
      status: (index < thinkingState.steps.length - 1 ? 'complete' : 'processing') as 'pending' | 'processing' | 'complete',
    })),
    [thinkingState.steps]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b flex items-center px-6 justify-between bg-card/50">
        <div className="font-semibold text-sm text-muted-foreground">{header}</div>
        <button
          type="button"
          onClick={onToggleMode}
          className="text-xs px-3 py-1 rounded border bg-background hover:bg-muted transition"
        >
          Switch to {mode === 'mode_1' ? 'Mode 2' : 'Mode 1'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Prompt Suggestions (show at start of conversation) */}
        {messages.length === 0 && suggestions.length > 0 && (
          <VitalSuggestions className="mb-4">
            {suggestions.map((suggestion, index) => (
              <VitalSuggestion
                key={index}
                suggestion={suggestion}
                onClick={(s) => setInputValue(s)}
              />
            ))}
          </VitalSuggestions>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'system_agent_select' && msg.agent ? (
              <div className="mb-3 flex justify-center">
                <VitalAgentCard agent={toCardAgent(msg.agent)} variant="compact" />
              </div>
            ) : null}
            <VitalMessage from={msg.role}>
              <VitalMessageContent>
                {msg.role === 'assistant' ? (
                  <>
                    {/* Use VitalStreamText for jitter-free markdown rendering */}
                    <VitalStreamText
                      content={msg.content}
                      isStreaming={msg.id === 'streaming' && isStreaming}
                    />
                    {/* Inline citations (if message has citations) */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-muted">
                        {msg.citations.map((citation, idx) => (
                          <VitalCitation
                            key={citation.id}
                            citation={{
                              id: citation.id,
                              index: idx + 1,
                              title: citation.title || 'Source',
                              source: 'web',
                              url: citation.url,
                              excerpt: citation.abstract || '',
                              confidence: 85,
                            }}
                            variant="inline"
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </VitalMessageContent>
            </VitalMessage>
          </div>
        ))}

        {/* Current streaming with real-time citations */}
        {isStreaming && currentContent && (
          <div className="animate-in fade-in">
            <VitalMessage from="assistant">
              <VitalMessageContent>
                <VitalStreamText content={currentContent} isStreaming={true} />
                {currentCitations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-muted">
                    {currentCitations.map((citation, idx) => (
                      <VitalCitation
                        key={citation.id}
                        citation={{
                          id: citation.id,
                          index: idx + 1,
                          title: citation.title || 'Source',
                          source: 'web',
                          url: citation.url,
                          excerpt: citation.abstract || '',
                          confidence: 85,
                        }}
                        variant="inline"
                      />
                    ))}
                  </div>
                )}
              </VitalMessageContent>
            </VitalMessage>
          </div>
        )}

        {/* Thinking/Reasoning display */}
        {thinkingState.isThinking && reasoningSteps.length > 0 ? (
          <div className="ml-6 animate-in fade-in">
            <VitalThinking steps={reasoningSteps} />
          </div>
        ) : null}
      </div>

      {/* Sources Panel with Trigger */}
      {currentCitations.length > 0 && (
        <VitalSources
          open={showSources}
          onOpenChange={setShowSources}
          className="border-t"
        >
          <VitalSourcesContent className="p-4 max-h-48 overflow-y-auto bg-muted/30">
            {currentCitations.map((citation) => (
              <VitalSource
                key={citation.id}
                href={citation.url}
                title={citation.title}
                snippet={citation.abstract}
                retrieverType="web"
                confidence={85}
              />
            ))}
          </VitalSourcesContent>
        </VitalSources>
      )}

      <div className="p-6 pt-2">
        <VitalPromptInput onSubmit={handleSubmit}>
          <VitalPromptInputBody>
            <VitalPromptInputTextarea
              placeholder="Ask a clinical question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </VitalPromptInputBody>
          <VitalPromptInputFooter>
            <VitalPromptInputTools>
              <span className="text-xs text-muted-foreground">
                {mode === 'mode_1' ? 'Manual' : 'Auto'}
              </span>
              {/* Sources toggle button */}
              {currentCitations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSources(!showSources)}
                  className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition flex items-center gap-1"
                >
                  <span>{currentCitations.length} sources</span>
                  <span className="text-muted-foreground">{showSources ? '▼' : '▶'}</span>
                </button>
              )}
            </VitalPromptInputTools>
            <VitalPromptInputSubmit
              status={isStreaming ? 'streaming' : 'ready'}
              disabled={!inputValue.trim() || isStreaming}
            />
          </VitalPromptInputFooter>
        </VitalPromptInput>
      </div>
    </div>
  );
}
