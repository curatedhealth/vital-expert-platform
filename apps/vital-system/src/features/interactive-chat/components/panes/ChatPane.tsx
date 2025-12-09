'use client';

import { useMemo } from 'react';

import {
  VitalAgentCard,
  VitalMessage,
  VitalPromptInput,
  VitalThinking,
} from '@vital/ai-ui';

import { Agent, Message, ThinkingState } from '../../stores/interactive-store';

type ChatPaneProps = {
  mode: 'mode_1' | 'mode_2';
  messages: Message[];
  activeAgent: Agent | null;
  thinkingState: ThinkingState;
  onSend: (text: string) => void;
  onToggleMode: () => void;
};

export function ChatPane({
  mode,
  messages,
  activeAgent,
  thinkingState,
  onSend,
  onToggleMode,
}: ChatPaneProps) {
  const header = useMemo(() => {
    const modeLabel = mode === 'mode_1' ? 'Manual Selection' : 'Auto-Pilot';
    return activeAgent ? `${modeLabel} / ${activeAgent.name}` : modeLabel;
  }, [mode, activeAgent]);

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
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'system_agent_select' && msg.agent ? (
              <div className="mb-3 flex justify-center">
                <VitalAgentCard agent={msg.agent} variant="minimal" />
              </div>
            ) : null}
            <VitalMessage role={msg.role} content={msg.content} />
          </div>
        ))}

        {thinkingState.isThinking ? (
          <div className="ml-6 animate-in fade-in">
            <VitalThinking steps={thinkingState.steps} status="running" />
          </div>
        ) : null}
      </div>

      <div className="p-6 pt-2">
        <VitalPromptInput
          onSubmit={onSend}
          mode={mode === 'mode_1' ? 1 : 2}
          placeholder="Ask a clinical question..."
        />
      </div>
    </div>
  );
}
