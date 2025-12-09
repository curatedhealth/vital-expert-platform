'use client';

import { useInteractiveStore } from '../../stores/interactive-store';
import { VitalAgentCard, VitalEvidencePanel } from '@vital/ai-ui';

export function ContextRail() {
  const { activeAgent, railMode, activeSource, thinkingState } = useInteractiveStore();

  const sources =
    activeSource && activeSource.id
      ? [
          {
            id: activeSource.id,
            title: activeSource.title || 'Source',
            type: 'web',
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
          <VitalAgentCard agent={activeAgent} variant="rich" />
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
