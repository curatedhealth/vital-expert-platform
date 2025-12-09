'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VitalArtifact } from '@/components/vital-ai-ui/documents/VitalArtifact';

export interface MissionArtifactsPanelProps {
  artifacts: any[];
  missionId?: string;
  isStreaming?: boolean;
}

export function MissionArtifactsPanel({ artifacts, missionId, isStreaming }: MissionArtifactsPanelProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mission {missionId ?? ''}</h1>
          <p className="text-sm text-muted-foreground">{isStreaming ? 'Running...' : 'Completed'}</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {artifacts.length === 0 && (
            <p className="text-sm text-muted-foreground">Waiting for artifacts...</p>
          )}
          {artifacts.map((artifact, idx) => (
            <VitalArtifact
              key={idx}
              type={artifact.type || 'document'}
              title={artifact.name || artifact.title || `Artifact ${idx + 1}`}
              content={artifact.content || artifact.data || ''}
              citations={artifact.citations || []}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default MissionArtifactsPanel;
