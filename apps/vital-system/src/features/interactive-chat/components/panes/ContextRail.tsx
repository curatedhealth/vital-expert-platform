'use client';

import { useInteractiveStore, Agent } from '../../stores/interactive-store';
import { VitalAgentCard, VitalEvidencePanel } from '@vital/ai-ui';

// Convert local Agent type to VitalAgentCard's expected format
function toCardAgent(agent: Agent) {
  return {
    id: agent.id,
    name: agent.name,
    level: (agent.level as 'L1' | 'L2' | 'L3' | 'L4' | 'L5') || 'L2',
    domain: 'Expert', // Default domain since local Agent doesn't have it
    avatar: agent.avatar,
    status: 'active' as const,
    capabilities: agent.capabilities || [],
  };
}

export function ContextRail() {
  const { activeAgent, railMode, activeSource, thinkingState } = useInteractiveStore();

  // Convert sources to VitalEvidencePanel expected format
  const sources =
    activeSource && activeSource.id
      ? [
          {
            id: activeSource.id,
            title: activeSource.title || 'Source',
            type: 'web' as const, // Cast to the specific SourceType
            excerpt: activeSource.abstract || activeSource.url || '',
            relevanceScore: 0.9,
            confidence: 0.8,
            url: activeSource.url,
          },
        ]
      : [];

  return (
    <div className="h-full p-4 overflow-y-auto border-l bg-card">
      {railMode === 'agent' && activeAgent ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Active Expert</h3>
          <VitalAgentCard agent={toCardAgent(activeAgent)} variant="detailed" />
        </div>
      ) : null}

      {(railMode === 'evidence' || thinkingState.isThinking) && (
        <div className="space-y-4 mt-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Context</h3>
          <VitalEvidencePanel sources={sources} showFilters={false} showSearch={false} />
        </div>
      )}
    </div>
  );
}
