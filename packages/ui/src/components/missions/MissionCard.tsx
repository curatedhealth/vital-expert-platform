import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Progress } from '../progress';
import type { Mission } from '../../types/mission.types';
import { MissionStatusBadge } from './MissionStatusBadge';

export interface MissionCardProps {
  mission: Mission;
  onSelect?: (missionId: string) => void;
  showStatus?: boolean;
  showProgress?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function MissionCard({
  mission,
  onSelect,
  showStatus = true,
  showProgress = true,
  actions,
  className,
}: MissionCardProps) {
  return (
    <Card
      className={className}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(mission.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect?.(mission.id);
        }
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg">{mission.name}</CardTitle>
          {mission.description ? (
            <CardDescription>{mission.description}</CardDescription>
          ) : null}
        </div>
        {showStatus && mission.status ? (
          <MissionStatusBadge status={mission.status} />
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {showProgress && typeof mission.progress === 'number' ? (
          <Progress value={mission.progress} aria-label="Mission progress" />
        ) : null}
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
