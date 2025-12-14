import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import type { MissionArtifact } from '../../types/mission.types';
import { Button } from '../button';

export interface MissionArtifactCardProps {
  artifact: MissionArtifact;
  onDownload?: (artifact: MissionArtifact) => void;
  onView?: (artifact: MissionArtifact) => void;
  className?: string;
}

export function MissionArtifactCard({ artifact, onDownload, onView, className }: MissionArtifactCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">{artifact.title}</CardTitle>
          {artifact.description ? <CardDescription>{artifact.description}</CardDescription> : null}
        </div>
        <div className="flex items-center gap-2">
          {onView ? (
            <Button size="sm" variant="outline" onClick={() => onView(artifact)}>
              View
            </Button>
          ) : null}
          {onDownload && artifact.url ? (
            <Button size="sm" variant="secondary" onClick={() => onDownload(artifact)}>
              Download
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground space-y-1">
          {artifact.type ? <p>Type: {artifact.type}</p> : null}
          {artifact.createdAt ? <p>Created: {artifact.createdAt}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
