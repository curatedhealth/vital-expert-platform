'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Code, Database, Image } from 'lucide-react';

export interface MissionArtifactsPanelProps {
  artifacts: any[];
  missionId?: string;
  isStreaming?: boolean;
}

// Map artifact types to icons
const artifactIcons: Record<string, typeof FileText> = {
  document: FileText,
  code: Code,
  data: Database,
  image: Image,
};

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
          {artifacts.map((artifact, idx) => {
            const artifactType = artifact.type || 'document';
            const Icon = artifactIcons[artifactType] || FileText;
            const title = artifact.name || artifact.title || `Artifact ${idx + 1}`;
            const content = artifact.content || artifact.data || '';

            return (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {artifactType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {typeof content === 'string' ? (
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-auto">
                      {content}
                    </pre>
                  ) : (
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-auto">
                      {JSON.stringify(content, null, 2)}
                    </pre>
                  )}
                  {artifact.citations && artifact.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Citations: {artifact.citations.length}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default MissionArtifactsPanel;
